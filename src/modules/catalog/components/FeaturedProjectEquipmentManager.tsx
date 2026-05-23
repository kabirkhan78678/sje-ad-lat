import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  featuredProjectEquipmentDefaultValues,
  featuredProjectEquipmentSchema,
} from '@/modules/catalog/schemas/projectsPage';
import type {
  FeaturedProject,
  FeaturedProjectEquipment,
  FeaturedProjectEquipmentFormValues,
} from '@/modules/catalog/types/projectsPage';
import type { FieldConfig } from '@/types/resources';

const fields: FieldConfig[] = [
  { name: 'equipment_title', label: 'Equipment Title', type: 'text', required: true, colSpan: 2 },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true },
  { name: 'is_active', label: 'Active', type: 'switch' },
];

type FeaturedProjectEquipmentManagerProps = {
  project: FeaturedProject;
  isSaving?: boolean;
  onCreate: (project: FeaturedProject, values: FeaturedProjectEquipmentFormValues) => void;
  onUpdate: (
    project: FeaturedProject,
    item: FeaturedProjectEquipment,
    values: FeaturedProjectEquipmentFormValues,
  ) => void;
  onDelete: (project: FeaturedProject, item: FeaturedProjectEquipment) => void;
  onToggle: (project: FeaturedProject, item: FeaturedProjectEquipment) => void;
  onReorder: (
    project: FeaturedProject,
    item: FeaturedProjectEquipment,
    direction: 'up' | 'down',
  ) => void;
};

export const FeaturedProjectEquipmentManager = ({
  isSaving,
  onCreate,
  onDelete,
  onReorder,
  onToggle,
  onUpdate,
  project,
}: FeaturedProjectEquipmentManagerProps) => {
  const [activeItem, setActiveItem] = useState<FeaturedProjectEquipment | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<FeaturedProjectEquipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const items = useMemo(
    () =>
      [...project.equipment].sort(
        (left, right) => left.display_order - right.display_order || left.id - right.id,
      ),
    [project.equipment],
  );

  const form = useForm<FeaturedProjectEquipmentFormValues>({
    resolver: zodResolver(featuredProjectEquipmentSchema),
    defaultValues: featuredProjectEquipmentDefaultValues as DefaultValues<FeaturedProjectEquipmentFormValues>,
  });

  useEffect(() => {
    if (!isModalOpen) {
      form.reset(featuredProjectEquipmentDefaultValues);
    }
  }, [form, isModalOpen]);

  const openCreate = () => {
    setActiveItem(null);
    form.reset({
      ...featuredProjectEquipmentDefaultValues,
      display_order: items.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: FeaturedProjectEquipment) => {
    setActiveItem(item);
    form.reset({
      equipment_title: item.equipment_title,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const submit = form.handleSubmit((values) => {
    if (activeItem) {
      onUpdate(project, activeItem, values);
      return;
    }

    onCreate(project, values);
  });

  return (
    <>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-medium text-slate-900">Equipment Installed</h4>
            <p className="text-sm text-slate-500">Manage the nested equipment list for this featured project.</p>
          </div>
          <Button onClick={openCreate} size="sm" type="button" variant="outline">
            <Plus className="h-4 w-4" />
            Add Equipment
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
            No equipment added for this project yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                key={item.id}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{item.equipment_title}</p>
                    <Badge tone={item.is_active ? 'success' : 'neutral'}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Display order {item.display_order}
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    disabled={index <= 0}
                    onClick={() => onReorder(project, item, 'up')}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={index >= items.length - 1}
                    onClick={() => onReorder(project, item, 'down')}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => onToggle(project, item)} size="sm" type="button" variant="ghost">
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
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        description={activeItem ? 'Update the selected equipment item.' : 'Add a new equipment item.'}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button isLoading={isSaving} onClick={() => void submit()} type="button">
              {activeItem ? 'Save Equipment' : 'Create Equipment'}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        title={activeItem ? 'Edit Equipment' : 'Add Equipment'}
      >
        <FormProvider {...form}>
          <form className="field-grid" onSubmit={(event) => void submit(event)}>
            {fields.map((field) => (
              <FormFieldRenderer field={field} key={field.name} />
            ))}
          </form>
        </FormProvider>
      </Modal>

      <ConfirmDialog
        confirmLabel="Delete Equipment"
        description={`This will permanently remove "${itemPendingDelete?.equipment_title ?? 'this equipment item'}".`}
        isLoading={isSaving}
        onClose={() => {
          setIsDeleteOpen(false);
          setItemPendingDelete(null);
        }}
        onConfirm={() => {
          if (itemPendingDelete) {
            onDelete(project, itemPendingDelete);
          }
        }}
        open={isDeleteOpen}
        title="Delete equipment?"
      />
    </>
  );
};
