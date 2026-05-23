import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import type { IndustrialMachineryCollectionItemBase } from '@/modules/catalog/types/industrialMachinery';
import type { FieldConfig, TableColumn } from '@/types/resources';

type IndustrialMachineryCollectionManagerProps<
  TItem extends IndustrialMachineryCollectionItemBase,
  TFormValues extends Record<string, any>,
> = {
  title: string;
  description: string;
  entityLabel: string;
  addLabel: string;
  emptyState: {
    title: string;
    description: string;
  };
  columns: TableColumn<TItem>[];
  fields: FieldConfig[];
  schema: ZodTypeAny;
  items: TItem[];
  isLoading: boolean;
  isSaving: boolean;
  defaultValues: TFormValues;
  mapItemToFormValues: (item: TItem) => TFormValues;
  onCreate: (values: TFormValues) => void;
  onUpdate: (item: TItem, values: TFormValues) => void;
  onDelete: (item: TItem) => void;
  onToggle: (item: TItem) => void;
  modalSize?: 'md' | 'lg' | 'xl';
  footerNote?: ReactNode;
};

const sortItems = <TItem extends IndustrialMachineryCollectionItemBase>(items: TItem[]) =>
  [...items].sort((left, right) => left.display_order - right.display_order || left.id - right.id);

export const IndustrialMachineryCollectionManager = <
  TItem extends IndustrialMachineryCollectionItemBase,
  TFormValues extends Record<string, any>,
>({
  title,
  description,
  entityLabel,
  addLabel,
  emptyState,
  columns,
  fields,
  schema,
  items,
  isLoading,
  isSaving,
  defaultValues,
  mapItemToFormValues,
  onCreate,
  onUpdate,
  onDelete,
  onToggle,
  modalSize = 'xl',
  footerNote,
}: IndustrialMachineryCollectionManagerProps<TItem, TFormValues>) => {
  const [activeItem, setActiveItem] = useState<TItem | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<TItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sortedItems = useMemo(() => sortItems(items), [items]);
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
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: TItem) => {
    setActiveItem(item);
    form.reset(mapItemToFormValues(item));
    setIsModalOpen(true);
  };

  const submit = form.handleSubmit((values) => {
    if (activeItem) {
      onUpdate(activeItem, values);
      return;
    }

    onCreate(values);
  });

  const pendingDeleteLabel =
    itemPendingDelete && 'title' in itemPendingDelete
      ? String(itemPendingDelete.title ?? '')
      : `this ${entityLabel.toLowerCase()}`;

  return (
    <>
      <Card className="relative p-6">
        <LoadingOverlay label="Saving changes..." show={isSaving} />
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <Button onClick={openCreate} type="button">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        </div>

        <DataTable
          columns={columns}
          currentPage={currentPage}
          data={paginatedItems}
          emptyState={emptyState}
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

        {footerNote ? <div className="mt-4 text-sm text-slate-500">{footerNote}</div> : null}
      </Card>

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
        size={modalSize}
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
        description={`This will permanently remove "${pendingDeleteLabel}".`}
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
