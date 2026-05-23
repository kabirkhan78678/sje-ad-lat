import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { ErrorState } from '@/components/shared/ErrorState';
import { FormField } from '@/components/shared/FormField';
import { JSONPreviewDrawer } from '@/components/shared/JSONPreviewDrawer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { API_BASE_URL } from '@/constants/api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useOurContribution } from '@/modules/home-content/hooks/useOurContribution';
import {
  ourContributionInitiativeSchema,
  ourContributionSectionSchema,
} from '@/modules/home-content/ourContributionSchemas';
import { OurContributionInitiativeModal } from '@/modules/home-content/components/OurContributionInitiativeModal';
import type {
  CsrInitiative,
  CsrInitiativeFormValues,
  CsrSectionPayload,
} from '@/modules/home-content/types/ourContribution';
import {
  createOurContributionInitiative,
  deleteOurContributionInitiative,
  getOurContributionInitiatives,
  updateOurContributionInitiative,
  updateOurContributionSection,
} from '@/services/api/ourContribution';
import { getErrorMessage } from '@/utils/error';

const defaultSectionValues: CsrSectionPayload = {
  section_label: '',
  section_title: '',
  section_subtitle: '',
  cta_title: '',
  cta_description: '',
  cta_button_text: '',
  cta_button_link: '',
  is_active: true,
};

const defaultInitiativeValues: CsrInitiativeFormValues = {
  badge: '',
  title: '',
  description: '',
  image: null,
  display_order: 1,
  is_active: true,
};

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

const normalizeInitiative = (item: Record<string, unknown>): CsrInitiative => ({
  id: Number(item.id ?? 0),
  badge: String(item.badge ?? ''),
  title: String(item.title ?? ''),
  description: String(item.description ?? ''),
  image_url: resolveMediaUrl(item.image_url ?? item.image),
  display_order: Number(item.display_order ?? 0),
  is_active: Boolean(item.is_active),
  created_at: typeof item.created_at === 'string' ? item.created_at : undefined,
  updated_at: typeof item.updated_at === 'string' ? item.updated_at : undefined,
});

const sortInitiatives = (items: CsrInitiative[]) =>
  [...items].sort((left, right) => left.display_order - right.display_order || left.id - right.id);

const toInitiativeFormValues = (initiative: CsrInitiative | null): CsrInitiativeFormValues => {
  if (!initiative) {
    return defaultInitiativeValues;
  }

  return {
    badge: initiative.badge,
    title: initiative.title,
    description: initiative.description,
    image: initiative.image_url,
    display_order: initiative.display_order,
    is_active: initiative.is_active,
  };
};

const buildInitiativeFormData = (values: CsrInitiativeFormValues) => {
  const formData = new FormData();

  if (values.image instanceof File) {
    formData.append('image', values.image);
  }

  formData.append('badge', values.badge.trim());
  formData.append('title', values.title.trim());
  formData.append('description', values.description.trim());
  formData.append('display_order', String(values.display_order));
  formData.append('is_active', String(Number(values.is_active)));

  return formData;
};

export const OurContributionPage = () => {
  const { showToast } = useToast();
  const previewDisclosure = useDisclosure(false);
  const initiativeModalDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const { data, rawData, error, isLoading, refetch } = useOurContribution();
  const [initiatives, setInitiatives] = useState<CsrInitiative[]>([]);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isSavingInitiative, setIsSavingInitiative] = useState(false);
  const [activeInitiative, setActiveInitiative] = useState<CsrInitiative | null>(null);
  const [initiativePendingDelete, setInitiativePendingDelete] = useState<CsrInitiative | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearchValue = useDebouncedValue(searchValue, 250);

  const sectionForm = useForm<CsrSectionPayload>({
    resolver: zodResolver(ourContributionSectionSchema),
    defaultValues: defaultSectionValues as DefaultValues<CsrSectionPayload>,
    mode: 'onChange',
  });

  const initiativeForm = useForm<CsrInitiativeFormValues>({
    resolver: zodResolver(ourContributionInitiativeSchema),
    defaultValues: defaultInitiativeValues as DefaultValues<CsrInitiativeFormValues>,
    mode: 'onChange',
  });

  const loadInitiatives = async () => {
    const response = await getOurContributionInitiatives();
    setInitiatives(sortInitiatives(response.items.map((item) => normalizeInitiative(item as never))));
  };

  useEffect(() => {
    const section = data?.section;

    sectionForm.reset({
      section_label: section?.section_label ?? '',
      section_title: section?.section_title ?? '',
      section_subtitle: section?.section_subtitle ?? '',
      cta_title: section?.cta_title ?? '',
      cta_description: section?.cta_description ?? '',
      cta_button_text: section?.cta_button_text ?? '',
      cta_button_link: section?.cta_button_link ?? '',
      is_active: section?.is_active ?? true,
    });

    setInitiatives(sortInitiatives((data?.initiatives ?? []).map((item) => normalizeInitiative(item as never))));
  }, [data, sectionForm]);

  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((item) => {
      const matchesSearch =
        !debouncedSearchValue ||
        item.title.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        item.badge.toLowerCase().includes(debouncedSearchValue.toLowerCase());
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' && item.is_active) ||
        (statusFilter === 'inactive' && !item.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [debouncedSearchValue, initiatives, statusFilter]);

  const paginatedInitiatives = useMemo(
    () => filteredInitiatives.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredInitiatives, pageSize],
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredInitiatives.length / pageSize));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredInitiatives.length, pageSize]);

  const openCreateModal = () => {
    setActiveInitiative(null);
    initiativeForm.reset({
      ...defaultInitiativeValues,
      display_order: initiatives.length + 1,
    });
    initiativeModalDisclosure.open();
  };

  const openEditModal = (initiative: CsrInitiative) => {
    setActiveInitiative(initiative);
    initiativeForm.reset(toInitiativeFormValues(initiative));
    initiativeModalDisclosure.open();
  };

  const closeInitiativeModal = () => {
    setActiveInitiative(null);
    initiativeForm.reset(defaultInitiativeValues);
    initiativeModalDisclosure.close();
  };

  const submitSection = sectionForm.handleSubmit(async (values) => {
    setIsSavingSection(true);
    try {
      await updateOurContributionSection({
        ...values,
        is_active: Number(values.is_active) as unknown as boolean,
      });
      await refetch();
      showToast({
        title: 'Our Contribution updated',
        description: 'Section content was saved successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save section content',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingSection(false);
    }
  });

  const submitInitiative = initiativeForm.handleSubmit(async (values) => {
    if (!activeInitiative && !(values.image instanceof File)) {
      initiativeForm.setError('image', {
        type: 'manual',
        message: 'Image is required while creating an initiative.',
      });
      return;
    }

    setIsSavingInitiative(true);
    try {
      const formData = buildInitiativeFormData(values);

      if (activeInitiative) {
        await updateOurContributionInitiative(activeInitiative.id, formData);
      } else {
        await createOurContributionInitiative(formData);
      }

      await Promise.all([refetch(), loadInitiatives()]);
      closeInitiativeModal();
      showToast({
        title: activeInitiative ? 'Initiative updated' : 'Initiative created',
        description: activeInitiative
          ? 'CSR initiative changes were saved successfully.'
          : 'A new CSR initiative was added.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save initiative',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingInitiative(false);
    }
  });

  const confirmDelete = async () => {
    if (!initiativePendingDelete) {
      return;
    }

    setIsSavingInitiative(true);
    try {
      await deleteOurContributionInitiative(initiativePendingDelete.id);
      await Promise.all([refetch(), loadInitiatives()]);
      deleteDisclosure.close();
      setInitiativePendingDelete(null);
      showToast({
        title: 'Initiative deleted',
        description: 'The selected CSR initiative has been removed.',
        tone: 'success',
      });
    } catch (deleteError) {
      showToast({
        title: 'Unable to delete initiative',
        description: getErrorMessage(deleteError),
        tone: 'error',
      });
    } finally {
      setIsSavingInitiative(false);
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
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4" />
              Add Initiative
            </Button>
          </>
        }
        description="Manage CSR section copy and initiative cards shown under the homepage Our Contribution block."
        title="Our Contribution"
      />

      <Card className="relative p-5 sm:p-6">
        <LoadingOverlay
          label={isLoading ? 'Loading Our Contribution...' : 'Saving section content...'}
          show={isLoading || isSavingSection}
        />

        <div className="mb-5">
          <h2 className="font-display text-xl font-semibold text-slate-950">Section Content</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update the CSR section heading, supporting copy, CTA content, and visibility.
          </p>
        </div>

        <FormProvider {...sectionForm}>
          <form className="space-y-5" onSubmit={submitSection}>
            <div className="field-grid">
              <FormField error={sectionForm.formState.errors.section_label?.message} label="Section Label" required>
                <Input {...sectionForm.register('section_label')} placeholder="Social Responsibility" />
              </FormField>

              <FormField error={sectionForm.formState.errors.section_title?.message} label="Section Title" required>
                <Input {...sectionForm.register('section_title')} placeholder="Our Contribution to Society" />
              </FormField>

              <FormField
                className="md:col-span-2"
                error={sectionForm.formState.errors.section_subtitle?.message}
                label="Section Subtitle"
                required
              >
                <Textarea
                  {...sectionForm.register('section_subtitle')}
                  placeholder="At Sri Jaya Enterprises, we believe in giving back to the community..."
                  rows={5}
                />
              </FormField>

              <FormField error={sectionForm.formState.errors.cta_title?.message} label="CTA Title" required>
                <Input {...sectionForm.register('cta_title')} placeholder="Committed to Community Welfare" />
              </FormField>

              <FormField error={sectionForm.formState.errors.cta_button_text?.message} label="CTA Button Text" required>
                <Input {...sectionForm.register('cta_button_text')} placeholder="Learn More About Our Initiatives" />
              </FormField>

              <FormField
                className="md:col-span-2"
                error={sectionForm.formState.errors.cta_description?.message}
                label="CTA Description"
                required
              >
                <Textarea
                  {...sectionForm.register('cta_description')}
                  placeholder="Sri Jaya Enterprises believes that sustainable business growth goes hand in hand with social responsibility..."
                  rows={5}
                />
              </FormField>

              <FormField
                error={sectionForm.formState.errors.cta_button_link?.message}
                label="CTA Button Link"
                required
              >
                <Input {...sectionForm.register('cta_button_link')} placeholder="#contact" />
              </FormField>

              <FormField label="Is Active">
                <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
                  <Switch
                    checked={Boolean(sectionForm.watch('is_active'))}
                    onChange={(checked) =>
                      sectionForm.setValue('is_active', checked, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button disabled={isLoading} isLoading={isSavingSection} type="submit">
                <Save className="h-4 w-4" />
                Save Section Content
              </Button>
            </div>
          </form>
        </FormProvider>
      </Card>

      <DataTable
        actions={null}
        columns={[
          {
            key: 'image',
            label: 'Image',
            render: (initiative) =>
              initiative.image_url ? (
                <img
                  alt={initiative.title}
                  className="h-16 w-24 rounded-xl object-cover"
                  src={initiative.image_url}
                />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                  No image
                </div>
              ),
          },
          {
            key: 'title',
            label: 'Initiative',
            render: (initiative) => (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{initiative.title}</p>
                  <Badge tone="info">{initiative.badge}</Badge>
                </div>
                <p className="line-clamp-2 max-w-md text-sm text-slate-500">{initiative.description}</p>
              </div>
            ),
          },
          {
            key: 'is_active',
            label: 'Status',
            render: (initiative) => (
              <Badge tone={initiative.is_active ? 'success' : 'neutral'}>
                {initiative.is_active ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
          { key: 'display_order', label: 'Order' },
        ]}
        currentPage={currentPage}
        data={paginatedInitiatives}
        emptyState={{
          title: 'No initiatives added',
          description: 'Add CSR initiatives with images, badges, and descriptions for the homepage section.',
        }}
        filters={[
          {
            key: 'status',
            label: 'All statuses',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
            value: statusFilter,
            onChange: (value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            },
          },
        ]}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={(value) => {
          setSearchValue(value);
          setCurrentPage(1);
        }}
        pageSize={pageSize}
        rowActions={(initiative) => (
          <div className="flex justify-end gap-2">
            <Button onClick={() => openEditModal(initiative)} size="sm" type="button" variant="ghost">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setInitiativePendingDelete(initiative);
                deleteDisclosure.open();
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        searchPlaceholder="Search initiatives..."
        searchValue={searchValue}
        totalItems={filteredInitiatives.length}
      />

      <OurContributionInitiativeModal
        activeInitiative={activeInitiative}
        form={initiativeForm}
        isSubmitting={isSavingInitiative}
        onClose={closeInitiativeModal}
        onSubmit={() => void submitInitiative()}
        open={initiativeModalDisclosure.isOpen}
      />

      <ConfirmDialog
        confirmLabel="Delete Initiative"
        description={`This will permanently delete "${initiativePendingDelete?.title ?? 'this initiative'}".`}
        isLoading={isSavingInitiative}
        onClose={() => {
          deleteDisclosure.close();
          setInitiativePendingDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
        open={deleteDisclosure.isOpen}
        title="Delete initiative?"
      />

      <JSONPreviewDrawer
        data={rawData}
        onClose={previewDisclosure.close}
        open={previewDisclosure.isOpen}
        title="Our Contribution API Response"
      />
    </>
  );
};
