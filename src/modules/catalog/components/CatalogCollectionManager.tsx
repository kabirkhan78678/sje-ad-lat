import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { API_BASE_URL } from '@/constants/api';
import { ProjectsCmsSection } from '@/modules/catalog/components/ProjectsCmsSection';
import type { FieldConfig } from '@/types/resources';

type CatalogCollectionItem = {
  id: number;
  display_order: number;
  is_active: boolean;
  [key: string]: unknown;
};

type CatalogCollectionManagerProps<TFormValues extends Record<string, unknown>, TItem extends CatalogCollectionItem> = {
  title: string;
  description: string;
  entityLabel: string;
  addLabel: string;
  emptyState: {
    title: string;
    description: string;
  };
  fields: FieldConfig[];
  schema: ZodTypeAny;
  items: TItem[];
  defaultValues: TFormValues;
  isLoading?: boolean;
  isSaving?: boolean;
  onCreate: (values: TFormValues) => void;
  onUpdate: (item: TItem, values: TFormValues) => void;
  onDelete: (item: TItem) => void;
  onToggle: (item: TItem) => void;
  onReorder: (item: TItem, direction: 'up' | 'down') => void;
};

const sortItems = <TItem extends CatalogCollectionItem>(items: TItem[]) =>
  [...items].sort((left, right) => left.display_order - right.display_order || left.id - right.id);

const resolveMediaUrl = (value: unknown): string | null => {
  if (!value || value instanceof File) {
    return null;
  }

  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) {
      return value;
    }

    return value.startsWith('/') ? `${API_BASE_URL}${value}` : `${API_BASE_URL}/${value}`;
  }

  if (typeof value === 'object') {
    const mediaObject = value as Record<string, unknown>;
    const candidate =
      mediaObject.url ?? mediaObject.src ?? mediaObject.path ?? mediaObject.location ?? mediaObject.secure_url;

    return typeof candidate === 'string' ? resolveMediaUrl(candidate) : null;
  }

  return null;
};

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(url);

const getPreviewFieldValue = (item: CatalogCollectionItem, field: FieldConfig) => {
  const directValue = item[field.name];

  if (directValue !== undefined && directValue !== null && directValue !== '') {
    return directValue;
  }

  if (field.type !== 'file') {
    return directValue;
  }

  const alternateKeys = [
    `${field.name}_url`,
    `${field.name}_path`,
    `${field.name}_src`,
    `${field.name}_file`,
  ];

  for (const key of alternateKeys) {
    const nextValue = item[key];
    if (nextValue !== undefined && nextValue !== null && nextValue !== '') {
      return nextValue;
    }
  }

  return directValue;
};

const renderPreviewValue = (value: unknown, field: FieldConfig) => {
  if (field.type === 'switch') {
    return <Badge tone={Boolean(value) ? 'success' : 'neutral'}>{Boolean(value) ? 'Active' : 'Inactive'}</Badge>;
  }

  if (field.type === 'file') {
    const source = resolveMediaUrl(value);

    if (!source) {
      return <span className="text-sm text-slate-400">No media</span>;
    }

    if (isImageUrl(source)) {
      return (
        <img
          alt={`${field.label} preview`}
          className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
          src={source}
        />
      );
    }

    return <span className="text-sm text-slate-500">Uploaded</span>;
  }

  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  const text = value === null || value === undefined ? '' : String(value);

  if (field.name === 'icon') {
    return text ? <Badge tone="info">{text}</Badge> : <span className="text-slate-400">-</span>;
  }

  return text || <span className="text-slate-400">-</span>;
};

export const CatalogCollectionManager = <
  TFormValues extends Record<string, unknown>,
  TItem extends CatalogCollectionItem,
>({
  title,
  description,
  entityLabel,
  addLabel,
  emptyState,
  fields,
  schema,
  items,
  defaultValues,
  isLoading,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
  onToggle,
  onReorder,
}: CatalogCollectionManagerProps<TFormValues, TItem>) => {
  const [activeItem, setActiveItem] = useState<TItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<TItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const sortedItems = useMemo(() => sortItems(items), [items]);

  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<TFormValues>,
  });

  useEffect(() => {
    if (!isModalOpen) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, isModalOpen]);

  const openCreate = () => {
    setActiveItem(null);
    form.reset({
      ...defaultValues,
      ...('display_order' in defaultValues ? { display_order: sortedItems.length + 1 } : {}),
    } as DefaultValues<TFormValues>);
    setIsModalOpen(true);
  };

  const openEdit = (item: TItem) => {
    setActiveItem(item);
    form.reset(item as DefaultValues<TFormValues>);
    setIsModalOpen(true);
  };

  const submit = form.handleSubmit((values) => {
    if (activeItem) {
      onUpdate(activeItem, values);
      return;
    }

    onCreate(values);
  });

  const previewFields = fields.filter((field) => !['id'].includes(field.name)).slice(0, 4);

  return (
    <>
      <ProjectsCmsSection
        actions={
          <Button onClick={openCreate} type="button">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        }
        description={description}
        title={title}
      >
        <div className="relative">
          <LoadingOverlay label="Saving items..." show={Boolean(isLoading || isSaving)} />
          <DataTable
            columns={[
              ...previewFields.map((field) => ({
                key: field.name,
                label: field.label,
                render: (item: TItem) => renderPreviewValue(getPreviewFieldValue(item, field), field),
              })),
              { key: 'display_order', label: 'Order' },
              {
                key: 'is_active',
                label: 'Status',
                render: (item: TItem) => (
                  <Badge tone={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
                ),
              },
            ]}
            currentPage={1}
            data={sortedItems}
            emptyState={emptyState}
            isLoading={isLoading}
            onPageChange={() => undefined}
            onPageSizeChange={() => undefined}
            pageSize={Math.max(sortedItems.length, 10)}
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
        description={activeItem ? `Update the selected ${entityLabel.toLowerCase()}.` : `Create a new ${entityLabel.toLowerCase()}.`}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button isLoading={isSaving} onClick={() => void submit()} type="button">
              {activeItem ? `Save ${entityLabel}` : `Create ${entityLabel}`}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        size="xl"
        title={activeItem ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
      >
        <FormProvider {...form}>
          <form className="space-y-6" onSubmit={(event) => void submit(event)}>
            <div className="field-grid">
              {fields.map((field) => (
                <FormFieldRenderer field={field} key={field.name} />
              ))}
            </div>
          </form>
        </FormProvider>
      </Modal>

      <ConfirmDialog
        confirmLabel={`Delete ${entityLabel}`}
        description={`This will permanently remove "${String(itemPendingDelete?.title ?? itemPendingDelete?.name ?? `this ${entityLabel.toLowerCase()}`)}".`}
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
        title={`Delete ${entityLabel}?`}
      />
    </>
  );
};
