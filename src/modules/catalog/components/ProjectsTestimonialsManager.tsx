import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Pencil, Plus, Power, Star, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  projectTestimonialDefaultValues,
  projectTestimonialSchema,
} from '@/modules/catalog/schemas/projectsPage';
import { ProjectsCmsSection } from '@/modules/catalog/components/ProjectsCmsSection';
import type {
  ProjectTestimonial,
  ProjectTestimonialFormValues,
} from '@/modules/catalog/types/projectsPage';
import { API_BASE_URL } from '@/constants/api';
import type { FieldConfig } from '@/types/resources';

const fields: FieldConfig[] = [
  { name: 'client_name', label: 'Client Name', type: 'text', required: true },
  { name: 'client_role', label: 'Client Role', type: 'text', placeholder: 'Director, ABC Foods' },
  { name: 'initials', label: 'Initials', type: 'text', placeholder: 'AK' },
  { name: 'rating', label: 'Rating', type: 'number', required: true, min: 1, max: 5 },
  { name: 'avatar_url', label: 'Avatar URL', type: 'text', placeholder: 'https://...' , colSpan: 2},
  { name: 'quote', label: 'Quote', type: 'textarea', rows: 5, required: true, colSpan: 2 },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true },
  { name: 'is_active', label: 'Active', type: 'switch' },
];

const resolveAvatarUrl = (value: string) => {
  if (!value) {
    return '';
  }

  if (/^(https?:\/\/|blob:|data:)/i.test(value)) {
    return value;
  }

  return value.startsWith('/') ? `${API_BASE_URL}${value}` : `${API_BASE_URL}/${value}`;
};

type ProjectsTestimonialsManagerProps = {
  items: ProjectTestimonial[];
  isLoading?: boolean;
  isSaving?: boolean;
  onCreate: (values: ProjectTestimonialFormValues) => void;
  onUpdate: (item: ProjectTestimonial, values: ProjectTestimonialFormValues) => void;
  onDelete: (item: ProjectTestimonial) => void;
  onToggle: (item: ProjectTestimonial) => void;
  onReorder: (item: ProjectTestimonial, direction: 'up' | 'down') => void;
};

export const ProjectsTestimonialsManager = ({
  isLoading,
  isSaving,
  items,
  onCreate,
  onDelete,
  onReorder,
  onToggle,
  onUpdate,
}: ProjectsTestimonialsManagerProps) => {
  const [activeItem, setActiveItem] = useState<ProjectTestimonial | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<ProjectTestimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sortedItems = useMemo(
    () => [...items].sort((left, right) => left.display_order - right.display_order || left.id - right.id),
    [items],
  );
  const paginatedItems = useMemo(
    () => sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, pageSize, sortedItems],
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, pageSize, sortedItems.length]);

  const form = useForm<ProjectTestimonialFormValues>({
    resolver: zodResolver(projectTestimonialSchema),
    defaultValues: projectTestimonialDefaultValues as DefaultValues<ProjectTestimonialFormValues>,
  });

  const avatarUrl = form.watch('avatar_url');

  useEffect(() => {
    if (!isModalOpen) {
      form.reset(projectTestimonialDefaultValues);
    }
  }, [form, isModalOpen]);

  const openCreate = () => {
    setActiveItem(null);
    form.reset({
      ...projectTestimonialDefaultValues,
      display_order: sortedItems.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: ProjectTestimonial) => {
    setActiveItem(item);
    form.reset({
      client_name: item.client_name,
      client_role: item.client_role,
      quote: item.quote,
      initials: item.initials,
      avatar_url: item.avatar_url,
      rating: item.rating,
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

  return (
    <>
      <ProjectsCmsSection
        actions={
          <Button onClick={openCreate} type="button">
            <Plus className="h-4 w-4" />
            Add Testimonial
          </Button>
        }
        description="Create, preview, reorder, and publish client testimonials displayed on the Projects page."
        title="Testimonials Manager"
      >
        <div className="relative">
          <LoadingOverlay label="Saving testimonials..." show={Boolean(isLoading || isSaving)} />
          <DataTable
            columns={[
              {
                key: 'client_name',
                label: 'Client',
                render: (item) => (
                  <div className="flex items-center gap-3">
                    {item.avatar_url ? (
                      <img
                        alt={item.client_name}
                        className="h-10 w-10 rounded-full object-cover"
                        src={resolveAvatarUrl(item.avatar_url)}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                        {item.initials || item.client_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{item.client_name}</p>
                      <p className="text-xs text-slate-500">{item.client_role || 'Role not provided'}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'quote',
                label: 'Quote',
                render: (item) => (
                  <p className="max-w-lg text-sm text-slate-600 line-clamp-3">{item.quote}</p>
                ),
              },
              {
                key: 'rating',
                label: 'Rating',
                render: (item) => (
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: item.rating }).map((_, index) => (
                      <Star className="h-4 w-4 fill-current" key={index} />
                    ))}
                  </div>
                ),
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
              title: 'No testimonials added yet',
              description: 'Add client testimonials with rating and avatar preview support.',
            }}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setCurrentPage(1);
            }}
            pageSize={pageSize}
            rowActions={(item) => {
              const index = sortedItems.findIndex((entry) => entry.id === item.id);
              return (
                <div className="flex justify-end gap-2">
                  <Button
                    disabled={index <= 0}
                    onClick={() => onReorder(item, 'up')}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={index >= sortedItems.length - 1}
                    onClick={() => onReorder(item, 'down')}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
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
              );
            }}
            totalItems={sortedItems.length}
          />
        </div>
      </ProjectsCmsSection>

      <Modal
        description={activeItem ? 'Update the selected testimonial.' : 'Create a new client testimonial.'}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button isLoading={isSaving} onClick={() => void submit()} type="button">
              {activeItem ? 'Save Testimonial' : 'Create Testimonial'}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        size="xl"
        title={activeItem ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <FormProvider {...form}>
          <form className="space-y-5" onSubmit={(event) => void submit(event)}>
            <div className="field-grid">
              {fields.map((field) => (
                <FormFieldRenderer field={field} key={field.name} />
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                Avatar Preview
              </div>
              <div className="p-4">
                {avatarUrl ? (
                  <img
                    alt="Avatar preview"
                    className="h-24 w-24 rounded-full object-cover"
                    src={resolveAvatarUrl(avatarUrl)}
                  />
                ) : (
                  <p className="text-sm text-slate-500">Add an avatar URL to preview the client image.</p>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <ConfirmDialog
        confirmLabel="Delete Testimonial"
        description={`This will permanently remove the testimonial from "${itemPendingDelete?.client_name ?? 'this client'}".`}
        isLoading={isSaving}
        onClose={() => {
          setIsDeleteOpen(false);
          setItemPendingDelete(null);
        }}
        onConfirm={() => {
          if (itemPendingDelete) {
            onDelete(itemPendingDelete);
          }
        }}
        open={isDeleteOpen}
        title="Delete testimonial?"
      />
    </>
  );
};
