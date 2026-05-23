import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { projectsTopStatDefaultValues, projectsTopStatSchema } from '@/modules/catalog/schemas/projectsPage';
import { ProjectsCmsSection } from '@/modules/catalog/components/ProjectsCmsSection';
import type { ProjectsTopStat, ProjectsTopStatFormValues } from '@/modules/catalog/types/projectsPage';
import type { FieldConfig } from '@/types/resources';

const fields: FieldConfig[] = [
  { name: 'stat_key', label: 'Stat Key', type: 'text', required: true, placeholder: 'years_experience' },
  { name: 'stat_value', label: 'Stat Value', type: 'text', required: true, placeholder: '25+' },
  { name: 'stat_label', label: 'Stat Label', type: 'text', required: true, placeholder: 'Years Experience' },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true },
  { name: 'is_active', label: 'Active', type: 'switch' },
];

type ProjectsStatsManagerProps = {
  items: ProjectsTopStat[];
  isLoading?: boolean;
  isSaving?: boolean;
  onCreate: (values: ProjectsTopStatFormValues) => void;
  onUpdate: (item: ProjectsTopStat, values: ProjectsTopStatFormValues) => void;
  onDelete: (item: ProjectsTopStat) => void;
  onToggle: (item: ProjectsTopStat) => void;
  onReorder: (item: ProjectsTopStat, direction: 'up' | 'down') => void;
};

export const ProjectsStatsManager = ({
  isLoading,
  isSaving,
  items,
  onCreate,
  onDelete,
  onReorder,
  onToggle,
  onUpdate,
}: ProjectsStatsManagerProps) => {
  const [activeItem, setActiveItem] = useState<ProjectsTopStat | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<ProjectsTopStat | null>(null);
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

  const form = useForm<ProjectsTopStatFormValues>({
    resolver: zodResolver(projectsTopStatSchema),
    defaultValues: projectsTopStatDefaultValues as DefaultValues<ProjectsTopStatFormValues>,
  });

  useEffect(() => {
    if (!isModalOpen) {
      form.reset(projectsTopStatDefaultValues);
    }
  }, [form, isModalOpen]);

  const openCreate = () => {
    setActiveItem(null);
    form.reset({
      ...projectsTopStatDefaultValues,
      display_order: sortedItems.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: ProjectsTopStat) => {
    setActiveItem(item);
    form.reset({
      stat_key: item.stat_key,
      stat_value: item.stat_value,
      stat_label: item.stat_label,
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
            Add Stat
          </Button>
        }
        description="Add, edit, activate, and reorder the top stat bar cards shown on the Projects page."
        title="Top Stats Bar"
      >
        <div className="relative">
          <LoadingOverlay label="Saving stats..." show={Boolean(isLoading || isSaving)} />
          <DataTable
            columns={[
              { key: 'stat_key', label: 'Key' },
              { key: 'stat_value', label: 'Value' },
              { key: 'stat_label', label: 'Label' },
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
              title: 'No stats added yet',
              description: 'Create the top stat bar entries that should appear below the Projects page hero.',
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
        description={activeItem ? 'Update the selected stat item.' : 'Create a new stat item.'}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalOpen(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <Button isLoading={isSaving} onClick={() => void submit()} type="button">
              {activeItem ? 'Save Stat' : 'Create Stat'}
            </Button>
          </div>
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        title={activeItem ? 'Edit Stat' : 'Add Stat'}
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
        confirmLabel="Delete Stat"
        description={`This will permanently remove "${itemPendingDelete?.stat_label ?? 'this stat'}".`}
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
        title="Delete stat?"
      />
    </>
  );
};
