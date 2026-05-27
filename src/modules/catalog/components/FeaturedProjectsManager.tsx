import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Power,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  featuredProjectDefaultValues,
  featuredProjectSchema,
} from '@/modules/catalog/schemas/projectsPage';
import { FeaturedProjectEquipmentManager } from '@/modules/catalog/components/FeaturedProjectEquipmentManager';
import { ProjectsCmsSection } from '@/modules/catalog/components/ProjectsCmsSection';
import type {
  FeaturedProject,
  FeaturedProjectEquipment,
  FeaturedProjectEquipmentFormValues,
  FeaturedProjectFormValues,
} from '@/modules/catalog/types/projectsPage';
import { API_BASE_URL } from '@/constants/api';
import type { FieldConfig } from '@/types/resources';

const fields: FieldConfig[] = [
  { name: 'title', label: 'Project Title', type: 'text', required: true, colSpan: 2 },
  { name: 'year', label: 'Year', type: 'text', required: true, placeholder: '2025' },
  { name: 'location', label: 'Location', type: 'text', required: true, placeholder: 'Ahmedabad, Gujarat' },
  { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'Food Processing' },
  { name: 'capacity', label: 'Capacity', type: 'text', required: true, placeholder: '120 TPD' },
  { name: 'details_link', label: 'Details Link', type: 'text', placeholder: '/catalog/projects/project-slug' },
  {
    name: 'image',
    label: 'Project Image',
    type: 'file',
    required: true,
    accept: 'image/png,image/jpeg,image/webp,image/avif,image/svg+xml',
    description: 'Upload a featured project image. On edit, choose a new file only if you want to replace the current one.',
    colSpan: 2,
  },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true },
  { name: 'is_active', label: 'Active', type: 'switch' },
];

const resolveImageUrl = (value: string) => {
  if (!value) {
    return '';
  }

  if (/^(https?:\/\/|blob:|data:)/i.test(value)) {
    return value;
  }

  return value.startsWith('/') ? `${API_BASE_URL}${value}` : `${API_BASE_URL}/${value}`;
};

type FeaturedProjectsManagerProps = {
  items: FeaturedProject[];
  isLoading?: boolean;
  isSaving?: boolean;
  onCreate: (values: FeaturedProjectFormValues) => void;
  onUpdate: (item: FeaturedProject, values: FeaturedProjectFormValues) => void;
  onDelete: (item: FeaturedProject) => void;
  onToggle: (item: FeaturedProject) => void;
  onReorder: (item: FeaturedProject, direction: 'up' | 'down') => void;
  onCreateEquipment: (project: FeaturedProject, values: FeaturedProjectEquipmentFormValues) => void;
  onUpdateEquipment: (
    project: FeaturedProject,
    item: FeaturedProjectEquipment,
    values: FeaturedProjectEquipmentFormValues,
  ) => void;
  onDeleteEquipment: (project: FeaturedProject, item: FeaturedProjectEquipment) => void;
  onToggleEquipment: (project: FeaturedProject, item: FeaturedProjectEquipment) => void;
  onReorderEquipment: (
    project: FeaturedProject,
    item: FeaturedProjectEquipment,
    direction: 'up' | 'down',
  ) => void;
};

export const FeaturedProjectsManager = ({
  isLoading,
  isSaving,
  items,
  onCreate,
  onCreateEquipment,
  onDelete,
  onDeleteEquipment,
  onReorder,
  onReorderEquipment,
  onToggle,
  onToggleEquipment,
  onUpdate,
  onUpdateEquipment,
}: FeaturedProjectsManagerProps) => {
  const [activeItem, setActiveItem] = useState<FeaturedProject | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<FeaturedProject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);

  const sortedItems = useMemo(
    () => [...items].sort((left, right) => left.display_order - right.display_order || left.id - right.id),
    [items],
  );

  const form = useForm<FeaturedProjectFormValues>({
    resolver: zodResolver(featuredProjectSchema),
    defaultValues: featuredProjectDefaultValues as DefaultValues<FeaturedProjectFormValues>,
  });

  const imageUrl = form.watch('image_url');
  const imageValue = form.watch('image');

  useEffect(() => {
    if (!isModalOpen) {
      form.reset(featuredProjectDefaultValues);
    }
  }, [form, isModalOpen]);

  useEffect(() => {
    if (!(imageValue instanceof File)) {
      setUploadedPreviewUrl(null);
      return;
    }

    const nextObjectUrl = URL.createObjectURL(imageValue);
    setUploadedPreviewUrl(nextObjectUrl);

    return () => {
      URL.revokeObjectURL(nextObjectUrl);
    };
  }, [imageValue]);

  const openCreate = () => {
    setActiveItem(null);
    form.reset({
      ...featuredProjectDefaultValues,
      display_order: sortedItems.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: FeaturedProject) => {
    setActiveItem(item);
    form.reset({
      title: item.title,
      year: item.year,
      location: item.location,
      industry: item.industry,
      capacity: item.capacity,
      image_url: item.image_url,
      image: item.image_url,
      details_link: item.details_link,
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

  const toggleExpanded = (projectId: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  return (
    <>
      <ProjectsCmsSection
        actions={
          <Button onClick={openCreate} type="button">
            <Plus className="h-4 w-4" />
            Add Featured Project
          </Button>
        }
        description="Manage featured project cards, image URLs, details links, status, order, and nested equipment installed lists."
        title="Featured Projects Manager"
      >
        <div className="relative">
          <LoadingOverlay label="Saving featured projects..." show={Boolean(isLoading || isSaving)} />

          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
              Loading featured projects...
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
              No featured projects added yet.
            </div>
          ) : (
            <div className="space-y-5">
              {sortedItems.map((item, index) => {
                const previewUrl = resolveImageUrl(item.image_url);
                const isExpanded = expandedIds.has(item.id);

                return (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft" key={item.id}>
                    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        {previewUrl ? (
                          <img
                            alt={item.title}
                            className="h-full min-h-[220px] w-full object-cover"
                            src={previewUrl}
                          />
                        ) : (
                          <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-400">
                            No image preview
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-xl font-semibold text-slate-950">{item.title}</h3>
                              <Badge tone={item.is_active ? 'success' : 'neutral'}>
                                {item.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge tone="info">Order {item.display_order}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                              <span>{item.year}</span>
                              <span>•</span>
                              <span>{item.location}</span>
                              <span>•</span>
                              <span>{item.industry}</span>
                              <span>•</span>
                              <span>{item.capacity}</span>
                            </div>
                            <p className="text-sm text-slate-500">
                              Details link: {item.details_link || 'Not provided'}
                            </p>
                          </div>

                          <div className="flex flex-wrap justify-end gap-2">
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
                            <Button onClick={() => toggleExpanded(item.id)} size="sm" type="button" variant="outline">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              {isExpanded ? 'Hide Equipment' : 'Manage Equipment'}
                            </Button>
                          </div>
                        </div>

                        {isExpanded ? (
                          <FeaturedProjectEquipmentManager
                            isSaving={isSaving}
                            onCreate={onCreateEquipment}
                            onDelete={onDeleteEquipment}
                            onReorder={onReorderEquipment}
                            onToggle={onToggleEquipment}
                            onUpdate={onUpdateEquipment}
                            project={item}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ProjectsCmsSection>

      <Modal
        description={activeItem ? 'Update the selected featured project.' : 'Create a new featured project card.'}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button isLoading={isSaving} onClick={() => void submit()} type="button">
              {activeItem ? 'Save Project' : 'Create Project'}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        size="xl"
        title={activeItem ? 'Edit Featured Project' : 'Add Featured Project'}
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
                Image Preview
              </div>
              <div className="p-4">
                {uploadedPreviewUrl ? (
                  <img
                    alt="Featured project preview"
                    className="max-h-72 w-full rounded-2xl object-cover"
                    src={uploadedPreviewUrl}
                  />
                ) : imageUrl ? (
                  <img
                    alt="Featured project preview"
                    className="max-h-72 w-full rounded-2xl object-cover"
                    src={resolveImageUrl(imageUrl)}
                  />
                ) : (
                  <p className="text-sm text-slate-500">Upload an image to preview the featured project artwork.</p>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <ConfirmDialog
        confirmLabel="Delete Project"
        description={`This will permanently remove "${itemPendingDelete?.title ?? 'this featured project'}".`}
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
        title="Delete featured project?"
      />
    </>
  );
};
