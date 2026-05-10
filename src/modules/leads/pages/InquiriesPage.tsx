import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Pencil, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { ErrorState } from '@/components/shared/ErrorState';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { JSONPreviewDrawer } from '@/components/shared/JSONPreviewDrawer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { Select } from '@/components/ui/Select';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDisclosure } from '@/hooks/useDisclosure';
import { inquirySchema, type InquiryFormValues } from '@/modules/leads/schemas';
import {
  leadsApi,
  type InquiryRecord,
  type InquiryUpdatePayload,
} from '@/services/api/leads';
import type { FieldConfig, SelectOption, TableColumn } from '@/types/resources';
import { getErrorMessage } from '@/utils/error';
import { formatDate, formatNumber, titleCase } from '@/utils/formatters';
import { buildDynamicFilterOptions, filterRecords, sortRecords } from '@/utils/resources';

const DEFAULT_STATUS_OPTIONS: SelectOption[] = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Converted', value: 'converted' },
  { label: 'Lost', value: 'lost' },
  { label: 'Closed', value: 'closed' },
];

const mergeOptions = (...optionGroups: SelectOption[][]) => {
  const map = new Map<string, SelectOption>();

  optionGroups.flat().forEach((option) => {
    if (!option.value) {
      return;
    }

    map.set(option.value, option);
  });

  return [...map.values()];
};

const getStatusTone = (status?: string) => {
  const normalized = (status ?? '').toLowerCase();

  if (['converted', 'qualified', 'won', 'closed'].includes(normalized)) {
    return 'success' as const;
  }

  if (['new', 'open'].includes(normalized)) {
    return 'info' as const;
  }

  if (['contacted', 'follow-up', 'pending', 'in-progress'].includes(normalized)) {
    return 'warning' as const;
  }

  if (['lost', 'spam', 'rejected', 'closed-lost'].includes(normalized)) {
    return 'danger' as const;
  }

  return 'neutral' as const;
};

const mapInquiryToForm = (inquiry: InquiryRecord): InquiryFormValues => ({
  name: String(inquiry.name ?? ''),
  email: String(inquiry.email ?? ''),
  phone: String(inquiry.phone ?? ''),
  subject: String(inquiry.subject ?? ''),
  category: String(inquiry.category ?? ''),
  message: String(inquiry.message ?? ''),
  status: String(inquiry.status ?? 'new'),
  source: String(inquiry.source ?? ''),
  estimated_value:
    inquiry.estimated_value === null || inquiry.estimated_value === undefined || inquiry.estimated_value === ''
      ? undefined
      : Number(inquiry.estimated_value),
  notes: String(inquiry.notes ?? ''),
});

export const InquiriesPage = () => {
  const { showToast } = useToast();
  const previewDisclosure = useDisclosure(false);
  const detailsDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const [items, setItems] = useState<InquiryRecord[]>([]);
  const [rawData, setRawData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [activeInquiry, setActiveInquiry] = useState<InquiryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InquiryRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearchValue = useDebouncedValue(searchValue, 250);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: '',
      message: '',
      status: 'new',
      source: '',
      estimated_value: undefined,
      notes: '',
    },
  });

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await leadsApi.list();
      setItems(response.items);
      setRawData(response.raw);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, 'Unable to load inquiries.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    setSelectedIds(new Set());
    setCurrentPage(1);
  }, [debouncedSearchValue, filters]);

  const statusOptions = useMemo(
    () => mergeOptions(DEFAULT_STATUS_OPTIONS, buildDynamicFilterOptions(items, 'status')),
    [items],
  );
  const categoryOptions = useMemo(() => buildDynamicFilterOptions(items, 'category'), [items]);
  const sourceOptions = useMemo(() => buildDynamicFilterOptions(items, 'source'), [items]);

  const filterControls = useMemo(
    () => [
      {
        key: 'status',
        label: 'All statuses',
        options: statusOptions,
        value: filters.status ?? '',
        onChange: (value: string) => setFilters((current) => ({ ...current, status: value })),
      },
      {
        key: 'category',
        label: 'All categories',
        options: categoryOptions,
        value: filters.category ?? '',
        onChange: (value: string) => setFilters((current) => ({ ...current, category: value })),
      },
      {
        key: 'source',
        label: 'All sources',
        options: sourceOptions,
        value: filters.source ?? '',
        onChange: (value: string) => setFilters((current) => ({ ...current, source: value })),
      },
    ],
    [categoryOptions, filters.category, filters.source, filters.status, sourceOptions, statusOptions],
  );

  const filteredRecords = useMemo(
    () =>
      filterRecords(
        sortRecords(items),
        debouncedSearchValue,
        ['name', 'email', 'subject'],
        filters,
      ),
    [debouncedSearchValue, filters, items],
  );

  const paginatedRecords = useMemo(
    () => filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredRecords, pageSize],
  );

  const upsertRecord = useCallback((record: InquiryRecord) => {
    setItems((current) =>
      current.map((entry) => (String(entry.id) === String(record.id) ? { ...entry, ...record } : entry)),
    );
  }, []);

  const openDetails = useCallback(
    async (record: InquiryRecord) => {
      detailsDisclosure.open();
      setIsDrawerLoading(true);

      try {
        const nextRecord = await leadsApi.getById(record.id);
        setActiveInquiry(nextRecord);
        form.reset(mapInquiryToForm(nextRecord));
      } catch (loadError) {
        showToast({
          title: 'Unable to load inquiry details',
          description: getErrorMessage(loadError),
          tone: 'error',
        });
      } finally {
        setIsDrawerLoading(false);
      }
    },
    [detailsDisclosure, form, showToast],
  );

  const closeDetails = () => {
    detailsDisclosure.close();
    setActiveInquiry(null);
    form.reset({
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: '',
      message: '',
      status: 'new',
      source: '',
      estimated_value: undefined,
      notes: '',
    });
  };

  const updateStatus = useCallback(
    async (record: InquiryRecord, status: string) => {
      if (!status || status === record.status) {
        return;
      }

      setStatusUpdatingId(String(record.id));

      try {
        const response = await leadsApi.updateStatus(record.id, { status });
        upsertRecord(response);

        if (activeInquiry && String(activeInquiry.id) === String(record.id)) {
          setActiveInquiry(response);
          form.setValue('status', String(response.status ?? status), { shouldDirty: false });
        }

        showToast({
          title: 'Inquiry status updated',
          description: `${response.name ?? 'Inquiry'} moved to ${titleCase(String(response.status ?? status))}.`,
          tone: 'success',
        });
      } catch (error) {
        showToast({
          title: 'Unable to update status',
          description: getErrorMessage(error),
          tone: 'error',
        });
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [activeInquiry, form, showToast, upsertRecord],
  );

  const saveInquiry = form.handleSubmit(async (values) => {
    if (!activeInquiry?.id) {
      return;
    }

    const payload: InquiryUpdatePayload = {
      ...values,
      estimated_value: values.estimated_value,
    };

    setIsSubmitting(true);

    try {
      const response = await leadsApi.update(activeInquiry.id, payload);
      upsertRecord(response);
      setActiveInquiry(response);
      form.reset(mapInquiryToForm(response));
      showToast({
        title: 'Inquiry updated',
        description: 'Lead details have been saved successfully.',
        tone: 'success',
      });
      await refetch();
    } catch (error) {
      showToast({
        title: 'Unable to update inquiry',
        description: getErrorMessage(error),
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const applyBulkStatus = async () => {
    if (!bulkStatus || selectedIds.size === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await leadsApi.bulkUpdateStatus({
        ids: [...selectedIds],
        status: bulkStatus,
      });
      await refetch();
      setSelectedIds(new Set());
      setBulkStatus('');
      showToast({
        title: 'Bulk status update complete',
        description: 'Selected inquiries were updated successfully.',
        tone: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Unable to update selected inquiries',
        description: getErrorMessage(error),
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    setIsSubmitting(true);

    try {
      await leadsApi.delete(deleteTarget.id);
      await refetch();
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(String(deleteTarget.id));
        return next;
      });

      if (activeInquiry && String(activeInquiry.id) === String(deleteTarget.id)) {
        closeDetails();
      }

      showToast({
        title: 'Inquiry deleted',
        description: 'The lead record has been removed.',
        tone: 'success',
      });
      deleteDisclosure.close();
      setDeleteTarget(null);
    } catch (error) {
      showToast({
        title: 'Unable to delete inquiry',
        description: getErrorMessage(error),
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inquiryFields = useMemo<FieldConfig[]>(
    () => [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'category', label: 'Category', type: 'select', options: categoryOptions },
      { name: 'status', label: 'Status', type: 'select', options: statusOptions, required: true },
      { name: 'source', label: 'Source', type: 'select', options: sourceOptions },
      { name: 'estimated_value', label: 'Estimated Value', type: 'number', placeholder: '0' },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        rows: 5,
        colSpan: 2,
      },
      {
        name: 'notes',
        label: 'Internal Notes',
        type: 'textarea',
        rows: 5,
        colSpan: 2,
      },
    ],
    [categoryOptions, sourceOptions, statusOptions],
  );

  const columns = useMemo<TableColumn<InquiryRecord>[]>(
    () => [
      {
        key: 'name',
        label: 'Lead',
        render: (record) => (
          <div>
            <p className="font-semibold text-slate-900">{record.name ?? 'Unnamed inquiry'}</p>
            <p className="mt-1 text-sm text-slate-500">{record.email ?? 'No email provided'}</p>
          </div>
        ),
      },
      { key: 'subject', label: 'Subject' },
      {
        key: 'category',
        label: 'Category',
        render: (record) => <span className="text-sm text-slate-700">{record.category ?? '—'}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        render: (record) => (
          <Badge tone={getStatusTone(String(record.status ?? 'new'))}>
            {titleCase(String(record.status ?? 'new'))}
          </Badge>
        ),
      },
      {
        key: 'source',
        label: 'Source',
        render: (record) => <span className="text-sm text-slate-700">{record.source ?? '—'}</span>,
      },
      {
        key: 'estimated_value',
        label: 'Estimated Value',
        render: (record) =>
          record.estimated_value !== null && record.estimated_value !== undefined && record.estimated_value !== ''
            ? `Rs ${formatNumber(record.estimated_value as number | string)}`
            : '—',
      },
      {
        key: 'created_at',
        label: 'Created',
        render: (record) => formatDate(String(record.created_at ?? '')),
      },
    ],
    [],
  );

  if (error && !isLoading) {
    return <ErrorState description={error} onRetry={() => void refetch()} />;
  }

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Review, update, and organize leads coming in from the public website."
        actions={(
          <>
            <Button onClick={() => void refetch()} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={previewDisclosure.open} variant="outline">
              <Eye className="h-4 w-4" />
              Preview API Data
            </Button>
          </>
        )}
      />

      <DataTable
        actions={(
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {selectedIds.size} selected
            </div>
            <div className="w-44">
              <Select onChange={(event) => setBulkStatus(event.target.value)} value={bulkStatus}>
                <option value="">Bulk status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              disabled={!bulkStatus || selectedIds.size === 0}
              isLoading={isSubmitting && selectedIds.size > 0}
              onClick={() => void applyBulkStatus()}
              variant="outline"
            >
              Apply
            </Button>
          </div>
        )}
        columns={columns}
        currentPage={currentPage}
        data={paginatedRecords}
        emptyState={{
          title: 'No inquiries found',
          description: 'Try adjusting the search or filters, or wait for new website leads to come in.',
        }}
        filters={filterControls}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setCurrentPage(1);
        }}
        onSearchChange={setSearchValue}
        onToggleAll={() => {
          const currentPageIds = paginatedRecords.map((record) => String(record.id));
          const allSelected = currentPageIds.every((id) => selectedIds.has(id));

          setSelectedIds((current) => {
            const next = new Set(current);

            currentPageIds.forEach((id) => {
              if (allSelected) {
                next.delete(id);
              } else {
                next.add(id);
              }
            });

            return next;
          });
        }}
        onToggleRow={(record) => {
          setSelectedIds((current) => {
            const next = new Set(current);
            const resolvedId = String(record.id);

            if (next.has(resolvedId)) {
              next.delete(resolvedId);
            } else {
              next.add(resolvedId);
            }

            return next;
          });
        }}
        pageSize={pageSize}
        rowActions={(record) => (
          <div className="flex flex-wrap justify-end gap-2">
            <div className="w-[132px]">
              <Select
                disabled={statusUpdatingId === String(record.id)}
                onChange={(event) => void updateStatus(record, event.target.value)}
                value={String(record.status ?? 'new')}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={() => void openDetails(record)} size="sm" variant="ghost">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setDeleteTarget(record);
                deleteDisclosure.open();
              }}
              size="sm"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
            </Button>
          </div>
        )}
        rowKey="id"
        searchPlaceholder="Search by name, email, or subject..."
        searchValue={searchValue}
        selectable
        selectedIds={selectedIds}
        totalItems={filteredRecords.length}
      />

      <Drawer
        description="Review full inquiry details, update status, and keep internal notes current."
        footer={(
          <div className="flex flex-wrap justify-end gap-3">
            <Button onClick={closeDetails} type="button" variant="ghost">
              Close
            </Button>
            <Button isLoading={isSubmitting} onClick={() => void saveInquiry()} type="button">
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        )}
        onClose={closeDetails}
        open={detailsDisclosure.isOpen}
        title={activeInquiry?.subject ? `Inquiry: ${activeInquiry.subject}` : 'Inquiry details'}
        width="xl"
      >
        <div className="relative space-y-6">
          <LoadingOverlay label="Saving inquiry..." show={isSubmitting || isDrawerLoading} />

          {activeInquiry ? (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Lead Status</p>
                  <div className="mt-3">
                    <Badge tone={getStatusTone(String(activeInquiry.status ?? 'new'))}>
                      {titleCase(String(activeInquiry.status ?? 'new'))}
                    </Badge>
                  </div>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Created</p>
                  <p className="mt-3 font-semibold text-slate-900">{formatDate(String(activeInquiry.created_at ?? ''))}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Source</p>
                  <p className="mt-3 font-semibold text-slate-900">{activeInquiry.source ?? '—'}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Estimated Value</p>
                  <p className="mt-3 font-semibold text-slate-900">
                    {activeInquiry.estimated_value !== null &&
                    activeInquiry.estimated_value !== undefined &&
                    activeInquiry.estimated_value !== ''
                      ? `Rs ${formatNumber(activeInquiry.estimated_value as number | string)}`
                      : '—'}
                  </p>
                </Card>
              </div>

              <Card className="p-5">
                <p className="text-sm font-semibold text-slate-900">Quick status change</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => void updateStatus(activeInquiry, option.value)}
                      size="sm"
                      type="button"
                      variant={String(activeInquiry.status ?? 'new') === option.value ? 'primary' : 'outline'}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </Card>

              <FormProvider {...form}>
                <form className="space-y-6" onSubmit={(event) => void saveInquiry(event)}>
                  <Card className="p-6">
                    <div className="mb-5">
                      <h3 className="font-display text-lg font-semibold text-slate-950">Lead Details</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Edit public form submission details and internal handling notes.
                      </p>
                    </div>
                    <div className="field-grid">
                      {inquiryFields.map((field) => (
                        <FormFieldRenderer field={field} key={field.name} />
                      ))}
                    </div>
                  </Card>
                </form>
              </FormProvider>
            </>
          ) : (
            <Card className="p-6">
              <p className="text-sm text-slate-500">Select an inquiry to view its details.</p>
            </Card>
          )}
        </div>
      </Drawer>

      <ConfirmDialog
        description="This inquiry will be permanently deleted from the admin system."
        isLoading={isSubmitting}
        onClose={() => {
          deleteDisclosure.close();
          setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
        open={deleteDisclosure.isOpen}
        title="Delete inquiry?"
      />

      <JSONPreviewDrawer
        data={rawData}
        onClose={previewDisclosure.close}
        open={previewDisclosure.isOpen}
        title="Inquiries API Preview"
      />
    </>
  );
};

