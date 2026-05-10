import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { ErrorState } from '@/components/shared/ErrorState';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { JSONPreviewDrawer } from '@/components/shared/JSONPreviewDrawer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/shared/ToastProvider';
import { useCrudResource } from '@/hooks/useCrudResource';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDisclosure } from '@/hooks/useDisclosure';
import type { CrudResourceConfig, FieldConfig } from '@/types/resources';
import { getErrorMessage } from '@/utils/error';
import { buildDynamicFilterOptions, filterRecords, mapRecordToFormValues, sortRecords } from '@/utils/resources';

type CrudResourcePageProps<TRecord extends Record<string, any>, TFormValues extends Record<string, any>> = {
  config: CrudResourceConfig<TRecord, TFormValues>;
};

const renderFields = (fields: FieldConfig[]) => (
  <div className="field-grid">
    {fields.map((field) => (
      <FormFieldRenderer field={field} key={field.name} />
    ))}
  </div>
);

export const CrudResourcePage = <
  TRecord extends Record<string, any>,
  TFormValues extends Record<string, any>,
>({
  config,
}: CrudResourcePageProps<TRecord, TFormValues>) => {
  const { showToast } = useToast();
  const previewDisclosure = useDisclosure(false);
  const modalDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const {
    createRecord,
    deleteRecord,
    error,
    isLoading,
    isSubmitting,
    items,
    loadRecord,
    rawData,
    refetch,
    updateRecord,
  } = useCrudResource({
    api: config.api,
  });
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeRecord, setActiveRecord] = useState<TRecord | null>(null);
  const [recordPendingDelete, setRecordPendingDelete] = useState<TRecord | null>(null);

  const form = useForm<TFormValues>({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues as DefaultValues<TFormValues>,
  });

  const debouncedSearchValue = useDebouncedValue(searchValue, 250);

  const sortedRecords = useMemo(() => sortRecords(items), [items]);

  const filterControls = useMemo(
    () =>
      (config.filters ?? []).map((filter) => ({
        key: String(filter.key),
        label: filter.label,
        options: filter.options ?? (filter.getOptionsFromData ? buildDynamicFilterOptions(items, String(filter.key)) : []),
        value: filters[String(filter.key)] ?? '',
        onChange: (value: string) => {
          setFilters((current) => ({
            ...current,
            [String(filter.key)]: value,
          }));
          setCurrentPage(1);
        },
      })),
    [config.filters, filters, items],
  );

  const filteredRecords = useMemo(
    () =>
      filterRecords(
        sortedRecords,
        debouncedSearchValue,
        config.searchKeys ?? ['name', 'title'],
        filters,
      ),
    [config.searchKeys, debouncedSearchValue, filters, sortedRecords],
  );

  const paginatedRecords = useMemo(
    () => filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredRecords, pageSize],
  );

  const openCreateModal = () => {
    setActiveRecord(null);
    form.reset(config.defaultValues);
    modalDisclosure.open();
  };

  const openEditModal = async (record: TRecord) => {
    try {
      const loadedRecord = (await loadRecord(String(record.id))) ?? record;
      setActiveRecord(loadedRecord as TRecord);

      const nextValues = config.mapRecordToForm
        ? config.mapRecordToForm(loadedRecord as TRecord)
        : mapRecordToFormValues(config.fields, loadedRecord as Record<string, unknown>, config.defaultValues);

      form.reset(nextValues);
      modalDisclosure.open();
    } catch (loadError) {
      showToast({
        title: `Unable to load ${config.entityLabel.toLowerCase()}`,
        description: getErrorMessage(loadError),
        tone: 'error',
      });
    }
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      const payload = config.transformPayload ? config.transformPayload(values as TFormValues) : values;

      if (activeRecord?.id) {
        await updateRecord(String(activeRecord.id), payload as never);
        showToast({
          title: `${config.entityLabel} updated`,
          description: 'Your changes have been saved successfully.',
          tone: 'success',
        });
      } else {
        await createRecord(payload as never);
        showToast({
          title: `${config.entityLabel} created`,
          description: 'A new record has been added.',
          tone: 'success',
        });
      }

      modalDisclosure.close();
      setActiveRecord(null);
      form.reset(config.defaultValues as DefaultValues<TFormValues>);
    } catch (submitError) {
      showToast({
        title: `Unable to save ${config.entityLabel.toLowerCase()}`,
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    }
  });

  const confirmDelete = async () => {
    if (!recordPendingDelete?.id) {
      return;
    }

    try {
      await deleteRecord(String(recordPendingDelete.id));
      showToast({
        title: `${config.entityLabel} deleted`,
        description: 'The record was removed successfully.',
        tone: 'success',
      });
      deleteDisclosure.close();
      setRecordPendingDelete(null);
    } catch (deleteError) {
      showToast({
        title: `Unable to delete ${config.entityLabel.toLowerCase()}`,
        description: getErrorMessage(deleteError),
        tone: 'error',
      });
    }
  };

  if (error && !isLoading) {
    return <ErrorState description={error} onRetry={() => void refetch()} />;
  }

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button onClick={() => void refetch()} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={previewDisclosure.open} variant="outline">
              <Eye className="h-4 w-4" />
              Preview API Data
            </Button>
            {config.api.create ? (
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4" />
                {config.createLabel ?? `Add ${config.entityLabel}`}
              </Button>
            ) : null}
          </>
        }
        description={config.description}
        title={config.title}
      />

      <DataTable
        actions={null}
        columns={config.columns}
        currentPage={currentPage}
        data={paginatedRecords}
        emptyState={config.emptyState}
        filters={filterControls}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setCurrentPage(1);
        }}
        onSearchChange={setSearchValue}
        pageSize={pageSize}
        rowActions={(record) => (
          <div className="flex justify-end gap-2">
            <Button onClick={() => void openEditModal(record)} size="sm" variant="ghost">
              <Pencil className="h-4 w-4" />
            </Button>
            {config.api.delete ? (
              <Button
                onClick={() => {
                  setRecordPendingDelete(record);
                  deleteDisclosure.open();
                }}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4 text-rose-600" />
              </Button>
            ) : null}
          </div>
        )}
        searchPlaceholder={config.searchPlaceholder}
        searchValue={searchValue}
        totalItems={filteredRecords.length}
      />

      <Modal
        description={activeRecord ? `Edit ${config.entityLabel.toLowerCase()}` : `Create a new ${config.entityLabel.toLowerCase()}`}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={modalDisclosure.close} type="button" variant="ghost">
              Cancel
            </Button>
            <Button isLoading={isSubmitting} onClick={() => void submit()} type="button">
              {activeRecord ? 'Save changes' : 'Create record'}
            </Button>
          </div>
        }
        onClose={modalDisclosure.close}
        open={modalDisclosure.isOpen}
        size="xl"
        title={activeRecord ? `Edit ${config.entityLabel}` : config.formTitle ?? `New ${config.entityLabel}`}
      >
        <div className="relative">
          <LoadingOverlay show={isSubmitting} />
          <FormProvider {...form}>
            <form className="space-y-6" onSubmit={(event) => void submit(event)}>
              {config.sections?.length
                ? config.sections.map((section) => (
                    <section className="panel-subtle space-y-4 p-5" key={section.title}>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-slate-950">{section.title}</h3>
                        {section.description ? (
                          <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                        ) : null}
                      </div>
                      {renderFields(
                        config.fields.filter((field) => section.fieldNames.includes(field.name)),
                      )}
                    </section>
                  ))
                : renderFields(config.fields)}
            </form>
          </FormProvider>
        </div>
      </Modal>

      <ConfirmDialog
        description={`This will permanently remove the selected ${config.entityLabel.toLowerCase()} record.`}
        isLoading={isSubmitting}
        onClose={() => {
          deleteDisclosure.close();
          setRecordPendingDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
        open={deleteDisclosure.isOpen}
        title={`Delete ${config.entityLabel}?`}
      />

      <JSONPreviewDrawer
        data={rawData}
        onClose={previewDisclosure.close}
        open={previewDisclosure.isOpen}
        title={config.previewTitle ?? `${config.title} API Preview`}
      />
    </>
  );
};
