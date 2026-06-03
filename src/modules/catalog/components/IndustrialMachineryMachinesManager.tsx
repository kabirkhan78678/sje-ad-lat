import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm, type DefaultValues } from 'react-hook-form';
import { z } from 'zod';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { FormField } from '@/components/shared/FormField';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { API_BASE_URL } from '@/constants/api';
import type {
  AdminProductReference,
  IndustrialMachineryCategory,
  IndustrialMachineryMachine,
  IndustrialMachineryMachineFormValues,
} from '@/modules/catalog/types/industrialMachinery';
import type { FieldConfig } from '@/types/resources';

const schema = z.object({
  product_id: z.string(),
  category_id: z.string().trim().min(1, 'Category is required.'),
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  image: z.any().optional().nullable(),
  image_url: z.string(),
  tag_text: z.string(),
  capacity: z.string(),
  automation: z.string(),
  view_details_text: z.string(),
  view_details_link: z.string(),
  quote_text: z.string(),
  quote_link: z.string(),
  display_order: z.coerce.number().int().min(1, 'Display order must be at least 1.'),
  is_active: z.boolean().default(true),
});

const defaultValues: IndustrialMachineryMachineFormValues = {
  product_id: '',
  category_id: '',
  title: '',
  description: '',
  image: null,
  image_url: '',
  tag_text: '',
  capacity: '',
  automation: '',
  view_details_text: '',
  view_details_link: '',
  quote_text: '',
  quote_link: '',
  display_order: 1,
  is_active: true,
};

const resolveMediaUrl = (value: string | null) => {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) {
    return value;
  }

  return value.startsWith('/') ? `${API_BASE_URL}${value}` : `${API_BASE_URL}/${value}`;
};

const textFields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4, required: true, colSpan: 2 },
  { name: 'tag_text', label: 'Tag Text', type: 'text', placeholder: 'High Throughput' },
  { name: 'capacity', label: 'Capacity', type: 'text', placeholder: '2000 units/hour' },
  { name: 'automation', label: 'Automation', type: 'text', placeholder: 'PLC Controlled' },
  { name: 'view_details_text', label: 'View Details Text', type: 'text', placeholder: 'View Details' },
  { name: 'view_details_link', label: 'View Details Link', type: 'text', placeholder: '/catalog/product-name' },
  { name: 'quote_text', label: 'Quote CTA Text', type: 'text', placeholder: 'Request Quote' },
  { name: 'quote_link', label: 'Quote CTA Link', type: 'text', placeholder: '/contact-us' },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true, placeholder: '1' },
  { name: 'is_active', label: 'Is Active', type: 'switch' },
];

type IndustrialMachineryMachinesManagerProps = {
  items: IndustrialMachineryMachine[];
  categories: IndustrialMachineryCategory[];
  products: AdminProductReference[];
  isLoading: boolean;
  isSaving: boolean;
  onCreate: (values: IndustrialMachineryMachineFormValues) => void;
  onUpdate: (item: IndustrialMachineryMachine, values: IndustrialMachineryMachineFormValues) => void;
  onDelete: (item: IndustrialMachineryMachine) => Promise<boolean | void> | boolean | void;
  onToggle: (item: IndustrialMachineryMachine) => void;
};

export const IndustrialMachineryMachinesManager = ({
  items,
  categories,
  products,
  isLoading,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
  onToggle,
}: IndustrialMachineryMachinesManagerProps) => {
  const [activeItem, setActiveItem] = useState<IndustrialMachineryMachine | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<IndustrialMachineryMachine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const sortedItems = useMemo(
    () => [...items].sort((left, right) => left.display_order - right.display_order || left.id - right.id),
    [items],
  );
  const paginatedItems = useMemo(
    () => sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, pageSize, sortedItems],
  );
  const categoryMap = useMemo(
    () =>
      categories.reduce<Record<string, string>>((accumulator, item) => {
        accumulator[String(item.id)] = item.name;
        return accumulator;
      }, {}),
    [categories],
  );
  const productMap = useMemo(
    () =>
      products.reduce<Record<string, AdminProductReference>>((accumulator, item) => {
        accumulator[String(item.id)] = item;
        return accumulator;
      }, {}),
    [products],
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, pageSize, sortedItems.length]);

  const form = useForm<IndustrialMachineryMachineFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<IndustrialMachineryMachineFormValues>,
  });

  const {
    formState: { errors },
  } = form;
  const imageFile = form.watch('image');
  const imageUrl = form.watch('image_url');

  useEffect(() => {
    if (!isModalOpen) {
      form.reset(defaultValues);
    }
  }, [form, isModalOpen]);

  useEffect(() => {
    if (!(imageFile instanceof File)) {
      setImagePreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [imageFile]);

  const previewUrl = imagePreviewUrl ?? resolveMediaUrl(imageUrl.trim() || (activeItem?.image_url ?? ''));

  const openCreate = () => {
    setActiveItem(null);
    form.reset({
      ...defaultValues,
      display_order: sortedItems.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: IndustrialMachineryMachine) => {
    setActiveItem(item);
    form.reset({
      product_id: item.product_id ? String(item.product_id) : '',
      category_id: String(item.category_id ?? ''),
      title: item.title,
      description: item.description,
      image: null,
      image_url: item.image_url ?? '',
      tag_text: item.tag_text,
      capacity: item.capacity,
      automation: item.automation,
      view_details_text: item.view_details_text,
      view_details_link: item.view_details_link,
      quote_text: item.quote_text,
      quote_link: item.quote_link,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const submit = form.handleSubmit((values) => {
    if (activeItem) {
      onUpdate(activeItem, values);
      return;
    }

    onCreate(values);
  });

  const confirmDelete = async () => {
    if (!itemPendingDelete) {
      return;
    }

    const wasDeleted = await onDelete(itemPendingDelete);
    if (wasDeleted === false) {
      return;
    }

    setIsDeleteOpen(false);
    setItemPendingDelete(null);
  };

  return (
    <>
      <Card className="relative p-6">
        <LoadingOverlay label="Saving machinery items..." show={isSaving} />
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-950">Machinery Items Manager</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage machine cards, link products and categories, and upload or reference item imagery.
            </p>
          </div>
          <Button onClick={openCreate} type="button">
            <Plus className="h-4 w-4" />
            Add Machinery Item
          </Button>
        </div>

        <DataTable
          columns={[
            {
              key: 'title',
              label: 'Machinery',
              render: (item) => (
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.tag_text || 'No tag'}</p>
                </div>
              ),
            },
            {
              key: 'category_id',
              label: 'Category',
              render: (item) => (
                <Badge>{String(item.category?.name ?? categoryMap[String(item.category_id)] ?? 'Unassigned')}</Badge>
              ),
            },
            {
              key: 'product_id',
              label: 'Linked Product',
              render: (item) => {
                const productName = String(item.product?.name ?? productMap[String(item.product_id ?? '')]?.name ?? '');
                return productName ? <span>{productName}</span> : <span className="text-slate-400">Not linked</span>;
              },
            },
            {
              key: 'capacity',
              label: 'Capacity',
              render: (item) => item.capacity || '—',
            },
            {
              key: 'automation',
              label: 'Automation',
              render: (item) => item.automation || '—',
            },
            { key: 'display_order', label: 'Order' },
            {
              key: 'is_active',
              label: 'Status',
              render: (item) => (
                <Badge tone={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
              ),
            },
          ]}
          currentPage={currentPage}
          data={paginatedItems}
          emptyState={{
            title: 'No machinery items yet',
            description: 'Add industrial machinery cards after setting up at least one industrial category.',
          }}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setCurrentPage(1);
          }}
          pageSize={pageSize}
          rowActions={(item) => (
            <div className="flex justify-end gap-2">
              <Button onClick={() => onToggle(item)} size="sm" type="button" variant="ghost">
                <Power className="h-4 w-4" />
              </Button>
              <Button onClick={() => openEdit(item)} size="sm" type="button" variant="ghost">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  setItemPendingDelete(item);
                  setIsDeleteOpen(true);
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4 text-rose-600" />
              </Button>
            </div>
          )}
          totalItems={sortedItems.length}
        />
      </Card>

      <Modal
        description={
          activeItem
            ? 'Update the selected machinery item, linked category, and product reference.'
            : 'Create a new machinery card for the Industrial Machinery catalog section.'
        }
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button disabled={!categories.length} isLoading={isSaving} onClick={() => void submit()} type="button">
              {activeItem ? 'Save Machinery Item' : 'Create Machinery Item'}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        size="xl"
        title={activeItem ? 'Edit Machinery Item' : 'Add Machinery Item'}
      >
        <FormProvider {...form}>
          <form className="space-y-6" onSubmit={(event) => void submit(event)}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="space-y-6">
                <div className="field-grid">
                  <FormField error={errors.category_id?.message} label="Industrial Category" required>
                    <Controller
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <Select {...field} value={field.value}>
                          <option value="">Select Industrial Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={String(category.id)}>
                              {category.name}
                            </option>
                          ))}
                        </Select>
                      )}
                    />
                  </FormField>

                  <FormField
                    description="Optional link to an existing catalog product."
                    error={errors.product_id?.message}
                    label="Linked Product"
                  >
                    <Controller
                      control={form.control}
                      name="product_id"
                      render={({ field }) => (
                        <Select {...field} value={field.value}>
                          <option value="">No linked product</option>
                          {products.map((product) => (
                            <option key={product.id} value={String(product.id)}>
                              {product.name} ({product.slug})
                            </option>
                          ))}
                        </Select>
                      )}
                    />
                  </FormField>
                </div>

                <div className="field-grid">
                  {textFields.map((field) => (
                    <FormFieldRenderer field={field} key={field.name} />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <section className="panel-subtle space-y-4 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-950">Machine Image</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Upload an image file or store a direct image URL. The file upload takes precedence.
                    </p>
                  </div>

                  <FormField error={errors.image?.message as string | undefined} label="Image Upload">
                    <Controller
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <Input
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(event) => field.onChange(event.target.files?.[0] ?? null)}
                          type="file"
                        />
                      )}
                    />
                  </FormField>

                  <FormField error={errors.image_url?.message} label="Image URL">
                    <Controller
                      control={form.control}
                      name="image_url"
                      render={({ field }) => <Input {...field} placeholder="/uploads/machines/filler.webp" />}
                    />
                  </FormField>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Preview
                    </div>
                    <div className="p-4">
                      {previewUrl ? (
                        <img alt="Machine preview" className="h-48 w-full rounded-xl object-cover" src={previewUrl} />
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
                          No image selected
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="panel-subtle space-y-4 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-950">Linked Record Preview</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      This helps confirm the product and category relationships before saving.
                    </p>
                  </div>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div>
                      <span className="font-medium text-slate-900">Category:</span>{' '}
                      {categoryMap[form.watch('category_id')] ?? 'Not selected'}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">Product:</span>{' '}
                      {form.watch('product_id')
                        ? productMap[form.watch('product_id')]?.name ?? 'Unknown product'
                        : 'Not linked'}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <ConfirmDialog
        confirmLabel="Delete Machinery Item"
        description={`This will permanently remove "${itemPendingDelete?.title ?? 'this machinery item'}".`}
        isLoading={isSaving}
        onClose={() => {
          setIsDeleteOpen(false);
          setItemPendingDelete(null);
        }}
        onConfirm={() => {
          void confirmDelete();
        }}
        open={isDeleteOpen}
        title="Delete machinery item?"
      />
    </>
  );
};
