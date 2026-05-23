import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';
import { z } from 'zod';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type {
  LaboratoryInfrastructureFeature,
  LaboratoryInfrastructureFeatureFormValues,
} from '@/modules/catalog/types/laboratoryInfrastructure';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  icon: z.string().trim().min(1, 'Icon is required.'),
  display_order: z.coerce.number().int().min(1, 'Display order must be at least 1.'),
  is_active: z.boolean().default(true),
});

const fields = [
  { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 as const },
  { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 4, colSpan: 2 as const },
  { name: 'icon', label: 'Icon', type: 'text', required: true, placeholder: 'flask-conical' },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true, placeholder: '1' },
  { name: 'is_active', label: 'Is Active', type: 'switch' },
] as const;

const defaultValues: LaboratoryInfrastructureFeatureFormValues = {
  title: '',
  description: '',
  icon: '',
  display_order: 1,
  is_active: true,
};

const sortFeatures = (items: LaboratoryInfrastructureFeature[]) =>
  [...items].sort((left, right) => left.display_order - right.display_order || left.id - right.id);

type LaboratoryInfrastructureFeaturesManagerProps = {
  features: LaboratoryInfrastructureFeature[];
  isLoading: boolean;
  isSaving: boolean;
  onCreate: (values: LaboratoryInfrastructureFeatureFormValues) => void;
  onUpdate: (feature: LaboratoryInfrastructureFeature, values: LaboratoryInfrastructureFeatureFormValues) => void;
  onDelete: (feature: LaboratoryInfrastructureFeature) => void;
  onReorder: (items: LaboratoryInfrastructureFeature[]) => void;
  onToggle: (feature: LaboratoryInfrastructureFeature) => void;
};

export const LaboratoryInfrastructureFeaturesManager = ({
  features,
  isLoading,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
  onToggle,
}: LaboratoryInfrastructureFeaturesManagerProps) => {
  const [activeFeature, setActiveFeature] = useState<LaboratoryInfrastructureFeature | null>(null);
  const [featurePendingDelete, setFeaturePendingDelete] = useState<LaboratoryInfrastructureFeature | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const sortedFeatures = useMemo(() => sortFeatures(features), [features]);

  const form = useForm<LaboratoryInfrastructureFeatureFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<LaboratoryInfrastructureFeatureFormValues>,
  });

  useEffect(() => {
    if (!modalOpen) {
      form.reset(defaultValues);
    }
  }, [form, modalOpen]);

  const openCreate = () => {
    setActiveFeature(null);
    form.reset({
      ...defaultValues,
      display_order: sortedFeatures.length + 1,
    });
    setModalOpen(true);
  };

  const openEdit = (feature: LaboratoryInfrastructureFeature) => {
    setActiveFeature(feature);
    form.reset({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      display_order: feature.display_order,
      is_active: feature.is_active,
    });
    setModalOpen(true);
  };

  const handleMove = (feature: LaboratoryInfrastructureFeature, direction: 'up' | 'down') => {
    const currentIndex = sortedFeatures.findIndex((item) => item.id === feature.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sortedFeatures.length) {
      return;
    }

    const nextFeatures = [...sortedFeatures];
    [nextFeatures[currentIndex], nextFeatures[targetIndex]] = [
      nextFeatures[targetIndex],
      nextFeatures[currentIndex],
    ];

    onReorder(
      nextFeatures.map((item, index) => ({
        ...item,
        display_order: index + 1,
      })),
    );
  };

  const submit = form.handleSubmit((values) => {
    if (activeFeature) {
      onUpdate(activeFeature, values);
    } else {
      onCreate(values);
    }
  });

  return (
    <>
      <Card className="relative p-6">
        <LoadingOverlay label="Saving features..." show={isSaving} />
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-950">Feature Cards</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add, edit, activate, and reorder Laboratory Infrastructure feature cards from the CMS.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>

        <DataTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'icon', label: 'Icon', render: (feature) => <Badge tone="info">{feature.icon}</Badge> },
            { key: 'description', label: 'Description' },
            { key: 'display_order', label: 'Order' },
            {
              key: 'is_active',
              label: 'Status',
              render: (feature) => (
                <Badge tone={feature.is_active ? 'success' : 'neutral'}>
                  {feature.is_active ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
          ]}
          currentPage={1}
          data={sortedFeatures}
          emptyState={{
            title: 'No feature cards yet',
            description: 'Add feature cards to populate the Laboratory Infrastructure page.',
          }}
          isLoading={isLoading}
          onPageChange={() => undefined}
          onPageSizeChange={() => undefined}
          pageSize={sortedFeatures.length || 10}
          rowActions={(feature) => (
            <div className="flex justify-end gap-2">
              <Button onClick={() => handleMove(feature, 'up')} size="sm" type="button" variant="ghost">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button onClick={() => handleMove(feature, 'down')} size="sm" type="button" variant="ghost">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button onClick={() => onToggle(feature)} size="sm" type="button" variant="ghost">
                <Power className="h-4 w-4" />
              </Button>
              <Button onClick={() => openEdit(feature)} size="sm" type="button" variant="ghost">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  setFeaturePendingDelete(feature);
                  setDeleteOpen(true);
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          totalItems={sortedFeatures.length}
        />
      </Card>

      <Modal
        description={activeFeature ? 'Update the selected feature card.' : 'Create a new Laboratory Infrastructure feature card.'}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setModalOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button isLoading={isSaving} onClick={() => void submit()} type="button">
              {activeFeature ? 'Save Feature' : 'Create Feature'}
            </Button>
          </div>
        }
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        title={activeFeature ? 'Edit Feature Card' : 'Add Feature Card'}
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
        confirmLabel="Delete Feature"
        description={`This will permanently remove "${featurePendingDelete?.title ?? 'this feature'}".`}
        isLoading={isSaving}
        onClose={() => {
          setDeleteOpen(false);
          setFeaturePendingDelete(null);
        }}
        onConfirm={() => {
          if (featurePendingDelete) {
            onDelete(featurePendingDelete);
          }
        }}
        open={deleteOpen}
        title="Delete feature?"
      />
    </>
  );
};
