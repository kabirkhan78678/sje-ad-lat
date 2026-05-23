import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, type DefaultValues } from 'react-hook-form';

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
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useSuccessStories } from '@/modules/home-content/hooks/useSuccessStories';
import {
  successStorySectionSchema,
  successStoryServiceSchema,
  successStoryStateSchema,
  successStoryStatSchema,
} from '@/modules/home-content/successStoriesSchemas';
import type {
  SuccessStorySectionPayload,
  SuccessStoryService,
  SuccessStoryServicePayload,
  SuccessStoryState,
  SuccessStoryStatePayload,
  SuccessStoryStat,
  SuccessStoryStatPayload,
} from '@/modules/home-content/types/successStories';
import {
  createSuccessStoryService,
  createSuccessStoryState,
  createSuccessStoryStat,
  deleteSuccessStoryService,
  deleteSuccessStoryState,
  deleteSuccessStoryStat,
  getSuccessStoryStates,
  getSuccessStoryStats,
  updateSuccessStoriesSection,
  updateSuccessStoryService,
  updateSuccessStoryState,
  updateSuccessStoryStat,
} from '@/services/api/successStories';
import type { TableColumn } from '@/types/resources';
import { getErrorMessage } from '@/utils/error';

const INDIA_STATE_OPTIONS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

const SUCCESS_STORY_STAT_KEY_OPTIONS = [
  { label: 'Projects Completed', value: 'project_completed' },
  { label: 'States Covered', value: 'states_covered' },
  { label: 'Years of Industry Expertise', value: 'Years of Industry Expertise' },
  { label: 'Custom Solutions Delivered', value: 'Custom Solutions Delivered' },
  { label: 'Service Network', value: 'Service Network' },
] as const;

const defaultSectionValues: SuccessStorySectionPayload = {
  section_label: '',
  section_title: '',
  section_subtitle: '',
  is_active: true,
};

const defaultStateValues: SuccessStoryStatePayload = {
  state_name: '',
  project_count: '',
  display_order: 1,
  is_active: true,
};

const defaultServiceValues: SuccessStoryServicePayload = {
  service_name: '',
  display_order: 1,
};

const defaultStatValues: SuccessStoryStatPayload = {
  stat_key: '',
  stat_value: '',
  stat_label: '',
  display_order: 1,
  is_active: true,
};

const normalizeService = (item: Record<string, unknown>): SuccessStoryService => ({
  id: Number(item.id ?? 0),
  state_id: item.state_id ? Number(item.state_id) : undefined,
  service_name: String(item.service_name ?? ''),
  display_order: Number(item.display_order ?? 0),
  created_at: typeof item.created_at === 'string' ? item.created_at : undefined,
  updated_at: typeof item.updated_at === 'string' ? item.updated_at : undefined,
});

const normalizeState = (item: Record<string, unknown>): SuccessStoryState => ({
  id: Number(item.id ?? 0),
  state_name: String(item.state_name ?? ''),
  project_count: String(item.project_count ?? ''),
  display_order: Number(item.display_order ?? 0),
  is_active: Boolean(item.is_active),
  services: Array.isArray(item.services)
    ? item.services.map((service) => normalizeService(service as Record<string, unknown>))
    : [],
  created_at: typeof item.created_at === 'string' ? item.created_at : undefined,
  updated_at: typeof item.updated_at === 'string' ? item.updated_at : undefined,
});

const normalizeStat = (item: Record<string, unknown>): SuccessStoryStat => ({
  id: Number(item.id ?? 0),
  stat_key: String(item.stat_key ?? ''),
  stat_value: String(item.stat_value ?? ''),
  stat_label: String(item.stat_label ?? ''),
  display_order: Number(item.display_order ?? 0),
  is_active: Boolean(item.is_active),
  created_at: typeof item.created_at === 'string' ? item.created_at : undefined,
  updated_at: typeof item.updated_at === 'string' ? item.updated_at : undefined,
});

const sortServices = (items: SuccessStoryService[]) =>
  [...items].sort((left, right) => left.display_order - right.display_order || left.id - right.id);

const sortStates = (items: SuccessStoryState[]) =>
  [...items].sort((left, right) => left.display_order - right.display_order || left.id - right.id);

const sortStats = (items: SuccessStoryStat[]) =>
  [...items].sort((left, right) => left.display_order - right.display_order || left.id - right.id);

const stateColumns: TableColumn<SuccessStoryState>[] = [
  {
    key: 'state_name',
    label: 'State',
    render: (state) => (
      <div className="space-y-1">
        <p className="font-semibold text-slate-900">{state.state_name}</p>
        <p className="text-sm text-slate-500">{state.project_count} projects</p>
      </div>
    ),
  },
  {
    key: 'services',
    label: 'Services',
    render: (state) => (
      <div className="flex max-w-md flex-wrap gap-2">
        {state.services.length ? (
          state.services.map((service) => (
            <Badge key={service.id} tone="info">
              {service.service_name}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-slate-400">No services added</span>
        )}
      </div>
    ),
  },
  {
    key: 'display_order',
    label: 'Order',
  },
  {
    key: 'is_active',
    label: 'Status',
    render: (state) => (
      <Badge tone={state.is_active ? 'success' : 'neutral'}>
        {state.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
];

const statColumns: TableColumn<SuccessStoryStat>[] = [
  {
    key: 'stat_label',
    label: 'Stat',
    render: (stat) => (
      <div className="space-y-1">
        <p className="font-semibold text-slate-900">{stat.stat_label}</p>
        <p className="text-sm text-slate-500">
          {stat.stat_key} • {stat.stat_value}
        </p>
      </div>
    ),
  },
  {
    key: 'display_order',
    label: 'Order',
  },
  {
    key: 'is_active',
    label: 'Status',
    render: (stat) => (
      <Badge tone={stat.is_active ? 'success' : 'neutral'}>
        {stat.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
];

const serviceColumns: TableColumn<SuccessStoryService>[] = [
  {
    key: 'service_name',
    label: 'Service',
  },
  {
    key: 'display_order',
    label: 'Order',
  },
];

export const SuccessStoriesPage = () => {
  const { showToast } = useToast();
  const previewDisclosure = useDisclosure(false);
  const stateModalDisclosure = useDisclosure(false);
  const statModalDisclosure = useDisclosure(false);
  const servicesModalDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const { data, rawData, error, isLoading, refetch } = useSuccessStories();

  const [states, setStates] = useState<SuccessStoryState[]>([]);
  const [stats, setStats] = useState<SuccessStoryStat[]>([]);
  const [editingState, setEditingState] = useState<SuccessStoryState | null>(null);
  const [editingStat, setEditingStat] = useState<SuccessStoryStat | null>(null);
  const [managingState, setManagingState] = useState<SuccessStoryState | null>(null);
  const [editingService, setEditingService] = useState<SuccessStoryService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    entity: 'state' | 'stat' | 'service';
    id: number;
    label: string;
  } | null>(null);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isSavingState, setIsSavingState] = useState(false);
  const [isSavingStat, setIsSavingStat] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);

  const [stateSearchValue, setStateSearchValue] = useState('');
  const [stateStatusFilter, setStateStatusFilter] = useState('');
  const [stateCurrentPage, setStateCurrentPage] = useState(1);
  const [statePageSize, setStatePageSize] = useState(10);

  const [statSearchValue, setStatSearchValue] = useState('');
  const [statStatusFilter, setStatStatusFilter] = useState('');
  const [statCurrentPage, setStatCurrentPage] = useState(1);
  const [statPageSize, setStatPageSize] = useState(10);

  const [serviceSearchValue, setServiceSearchValue] = useState('');
  const [serviceCurrentPage, setServiceCurrentPage] = useState(1);
  const [servicePageSize, setServicePageSize] = useState(10);

  const debouncedStateSearch = useDebouncedValue(stateSearchValue, 250);
  const debouncedStatSearch = useDebouncedValue(statSearchValue, 250);
  const debouncedServiceSearch = useDebouncedValue(serviceSearchValue, 250);

  const sectionForm = useForm<SuccessStorySectionPayload>({
    resolver: zodResolver(successStorySectionSchema),
    defaultValues: defaultSectionValues as DefaultValues<SuccessStorySectionPayload>,
    mode: 'onChange',
  });

  const stateForm = useForm<SuccessStoryStatePayload>({
    resolver: zodResolver(successStoryStateSchema),
    defaultValues: defaultStateValues as DefaultValues<SuccessStoryStatePayload>,
    mode: 'onChange',
  });

  const statForm = useForm<SuccessStoryStatPayload>({
    resolver: zodResolver(successStoryStatSchema),
    defaultValues: defaultStatValues as DefaultValues<SuccessStoryStatPayload>,
    mode: 'onChange',
  });

  const serviceForm = useForm<SuccessStoryServicePayload>({
    resolver: zodResolver(successStoryServiceSchema),
    defaultValues: defaultServiceValues as DefaultValues<SuccessStoryServicePayload>,
    mode: 'onChange',
  });

  const loadStates = async () => {
    const response = await getSuccessStoryStates();
    setStates(sortStates(response.items.map((item) => normalizeState(item as Record<string, unknown>))));
  };

  const loadStats = async () => {
    const response = await getSuccessStoryStats();
    setStats(sortStats(response.items.map((item) => normalizeStat(item as Record<string, unknown>))));
  };

  const loadAll = async () => {
    await Promise.all([refetch(), loadStates(), loadStats()]);
  };

  useEffect(() => {
    const section = data?.section;

    sectionForm.reset({
      section_label: section?.section_label ?? '',
      section_title: section?.section_title ?? '',
      section_subtitle: section?.section_subtitle ?? '',
      is_active: section?.is_active ?? true,
    });

    setStates(sortStates((data?.states ?? []).map((item) => normalizeState(item as Record<string, unknown>))));
    setStats(sortStats((data?.stats ?? []).map((item) => normalizeStat(item as Record<string, unknown>))));
  }, [data, sectionForm]);

  const filteredStates = useMemo(() => {
    return states.filter((state) => {
      const matchesSearch =
        !debouncedStateSearch ||
        state.state_name.toLowerCase().includes(debouncedStateSearch.toLowerCase()) ||
        state.project_count.toLowerCase().includes(debouncedStateSearch.toLowerCase()) ||
        state.services.some((service) =>
          service.service_name.toLowerCase().includes(debouncedStateSearch.toLowerCase()),
        );

      const matchesStatus =
        !stateStatusFilter ||
        (stateStatusFilter === 'active' && state.is_active) ||
        (stateStatusFilter === 'inactive' && !state.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [debouncedStateSearch, stateStatusFilter, states]);

  const paginatedStates = useMemo(
    () => filteredStates.slice((stateCurrentPage - 1) * statePageSize, stateCurrentPage * statePageSize),
    [filteredStates, stateCurrentPage, statePageSize],
  );

  const filteredStats = useMemo(() => {
    return stats.filter((stat) => {
      const query = debouncedStatSearch.toLowerCase();
      const matchesSearch =
        !debouncedStatSearch ||
        stat.stat_key.toLowerCase().includes(query) ||
        stat.stat_label.toLowerCase().includes(query) ||
        stat.stat_value.toLowerCase().includes(query);

      const matchesStatus =
        !statStatusFilter ||
        (statStatusFilter === 'active' && stat.is_active) ||
        (statStatusFilter === 'inactive' && !stat.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [debouncedStatSearch, statStatusFilter, stats]);

  const paginatedStats = useMemo(
    () => filteredStats.slice((statCurrentPage - 1) * statPageSize, statCurrentPage * statPageSize),
    [filteredStats, statCurrentPage, statPageSize],
  );

  const filteredServices = useMemo(() => {
    const services = sortServices(managingState?.services ?? []);
    if (!debouncedServiceSearch) {
      return services;
    }

    return services.filter((service) =>
      service.service_name.toLowerCase().includes(debouncedServiceSearch.toLowerCase()),
    );
  }, [debouncedServiceSearch, managingState]);

  const paginatedServices = useMemo(
    () =>
      filteredServices.slice(
        (serviceCurrentPage - 1) * servicePageSize,
        serviceCurrentPage * servicePageSize,
      ),
    [filteredServices, serviceCurrentPage, servicePageSize],
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredStates.length / statePageSize));
    if (stateCurrentPage > totalPages) {
      setStateCurrentPage(totalPages);
    }
  }, [filteredStates.length, stateCurrentPage, statePageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredStats.length / statPageSize));
    if (statCurrentPage > totalPages) {
      setStatCurrentPage(totalPages);
    }
  }, [filteredStats.length, statCurrentPage, statPageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredServices.length / servicePageSize));
    if (serviceCurrentPage > totalPages) {
      setServiceCurrentPage(totalPages);
    }
  }, [filteredServices.length, serviceCurrentPage, servicePageSize]);

  const openCreateStateModal = () => {
    setEditingState(null);
    stateForm.reset({
      ...defaultStateValues,
      display_order: states.length + 1,
    });
    stateModalDisclosure.open();
  };

  const openEditStateModal = (state: SuccessStoryState) => {
    setEditingState(state);
    stateForm.reset({
      state_name: state.state_name,
      project_count: state.project_count,
      display_order: state.display_order,
      is_active: state.is_active,
    });
    stateModalDisclosure.open();
  };

  const closeStateModal = () => {
    setEditingState(null);
    stateForm.reset(defaultStateValues);
    stateModalDisclosure.close();
  };

  const openCreateStatModal = () => {
    setEditingStat(null);
    statForm.reset({
      ...defaultStatValues,
      display_order: stats.length + 1,
    });
    statModalDisclosure.open();
  };

  const openEditStatModal = (stat: SuccessStoryStat) => {
    setEditingStat(stat);
    statForm.reset({
      stat_key: stat.stat_key,
      stat_value: stat.stat_value,
      stat_label: stat.stat_label,
      display_order: stat.display_order,
      is_active: stat.is_active,
    });
    statModalDisclosure.open();
  };

  const closeStatModal = () => {
    setEditingStat(null);
    statForm.reset(defaultStatValues);
    statModalDisclosure.close();
  };

  const openServicesModal = (state: SuccessStoryState) => {
    setManagingState(state);
    setEditingService(null);
    serviceForm.reset({
      ...defaultServiceValues,
      display_order: (state.services?.length ?? 0) + 1,
    });
    setServiceSearchValue('');
    setServiceCurrentPage(1);
    servicesModalDisclosure.open();
  };

  const closeServicesModal = () => {
    setManagingState(null);
    setEditingService(null);
    serviceForm.reset(defaultServiceValues);
    servicesModalDisclosure.close();
  };

  const beginEditService = (service: SuccessStoryService) => {
    setEditingService(service);
    const nextValues = {
      service_name: service.service_name,
      display_order: service.display_order,
    };
    serviceForm.reset(nextValues);
  };

  const resetServiceEditor = () => {
    const nextValues = {
      ...defaultServiceValues,
      display_order: (managingState?.services?.length ?? 0) + 1,
    };
    setEditingService(null);
    serviceForm.reset(nextValues);
  };

  const submitSection = sectionForm.handleSubmit(async (values) => {
    setIsSavingSection(true);

    try {
      await updateSuccessStoriesSection({
        ...values,
        is_active: Number(values.is_active),
      });
      await refetch();
      showToast({
        title: 'Success Stories updated',
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

  const submitState = stateForm.handleSubmit(async (values) => {
    setIsSavingState(true);

    try {
      const payload = {
        ...values,
        state_name: values.state_name.trim(),
        project_count: values.project_count.trim(),
        is_active: Number(values.is_active),
      };

      if (editingState) {
        await updateSuccessStoryState(editingState.id, payload);
      } else {
        await createSuccessStoryState(payload);
      }

      await loadAll();
      closeStateModal();
      showToast({
        title: editingState ? 'State updated' : 'State created',
        description: editingState
          ? 'Success story state changes were saved.'
          : 'A new state was added to Success Stories.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save state',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingState(false);
    }
  });

  const submitStat = statForm.handleSubmit(async (values) => {
    setIsSavingStat(true);

    try {
      const payload = {
        ...values,
        stat_key: values.stat_key.trim(),
        stat_value: values.stat_value.trim(),
        stat_label: values.stat_label.trim(),
        is_active: Number(values.is_active),
      };

      if (editingStat) {
        await updateSuccessStoryStat(editingStat.id, payload);
      } else {
        await createSuccessStoryStat(payload);
      }

      await loadAll();
      closeStatModal();
      showToast({
        title: editingStat ? 'Stat updated' : 'Stat created',
        description: editingStat
          ? 'Success story stat changes were saved.'
          : 'A new stat was added to Success Stories.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save stat',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingStat(false);
    }
  });

  const submitService = serviceForm.handleSubmit(async (values) => {
    if (!managingState) {
      return;
    }

    setIsSavingService(true);

    try {
      const payload = {
        service_name: values.service_name.trim(),
        display_order: values.display_order,
      };

      if (editingService) {
        await updateSuccessStoryService(editingService.id, payload);
      } else {
        await createSuccessStoryService(managingState.id, payload);
      }

      const statesResponse = await getSuccessStoryStates();
      const nextStates = sortStates(
        statesResponse.items.map((item) => normalizeState(item as Record<string, unknown>)),
      );
      setStates(nextStates);
      setManagingState(nextStates.find((item) => item.id === managingState.id) ?? null);
      resetServiceEditor();
      showToast({
        title: editingService ? 'Service updated' : 'Service created',
        description: editingService
          ? 'State service changes were saved.'
          : 'A new service was added to this state.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save service',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingService(false);
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const currentTarget = deleteTarget;

    try {
      if (currentTarget.entity === 'state') {
        setIsSavingState(true);
        await deleteSuccessStoryState(currentTarget.id);
        await loadAll();
      } else if (currentTarget.entity === 'stat') {
        setIsSavingStat(true);
        await deleteSuccessStoryStat(currentTarget.id);
        await loadAll();
      } else {
        setIsSavingService(true);
        await deleteSuccessStoryService(currentTarget.id);
        const statesResponse = await getSuccessStoryStates();
        const nextStates = sortStates(
          statesResponse.items.map((item) => normalizeState(item as Record<string, unknown>)),
        );
        setStates(nextStates);
        setManagingState(
          managingState ? nextStates.find((item) => item.id === managingState.id) ?? null : null,
        );
        resetServiceEditor();
      }

      deleteDisclosure.close();
      setDeleteTarget(null);
      showToast({
        title: `${currentTarget.entity === 'state' ? 'State' : currentTarget.entity === 'stat' ? 'Stat' : 'Service'} deleted`,
        description: `"${currentTarget.label}" has been removed successfully.`,
        tone: 'success',
      });
    } catch (deleteError) {
      showToast({
        title: 'Unable to delete item',
        description: getErrorMessage(deleteError),
        tone: 'error',
      });
    } finally {
      setIsSavingState(false);
      setIsSavingStat(false);
      setIsSavingService(false);
    }
  };

  if (error && !isLoading) {
    return <ErrorState description={error} onRetry={() => void loadAll()} />;
  }

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button onClick={() => void loadAll()} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={previewDisclosure.open} variant="outline">
              <Eye className="h-4 w-4" />
              Preview API Data
            </Button>
            <Button onClick={openCreateStateModal} variant="outline">
              <Plus className="h-4 w-4" />
              Add State
            </Button>
            <Button onClick={openCreateStatModal}>
              <Plus className="h-4 w-4" />
              Add Stat
            </Button>
          </>
        }
        description="Manage the homepage Success Stories section, state cards with nested services, and summary stats."
        title="Success Stories"
      />

      <Card className="relative p-5 sm:p-6">
        <LoadingOverlay
          label={isLoading ? 'Loading Success Stories...' : 'Saving section content...'}
          show={isLoading || isSavingSection}
        />

        <div className="mb-5">
          <h2 className="font-display text-xl font-semibold text-slate-950">Section Content</h2>
          <p className="mt-1 text-sm text-slate-500">
            Control the section label, title, subtitle, and homepage visibility.
          </p>
        </div>

        <form className="space-y-5" onSubmit={submitSection}>
          <div className="field-grid">
            <FormField error={sectionForm.formState.errors.section_label?.message} label="Section Label" required>
              <Input {...sectionForm.register('section_label')} placeholder="Client Success" />
            </FormField>

            <FormField error={sectionForm.formState.errors.section_title?.message} label="Section Title" required>
              <Input
                {...sectionForm.register('section_title')}
                placeholder="Success Stories Across India"
              />
            </FormField>

            <FormField
              className="md:col-span-2"
              error={sectionForm.formState.errors.section_subtitle?.message}
              label="Section Subtitle"
              required
            >
              <Textarea
                {...sectionForm.register('section_subtitle')}
                placeholder="Hover over any state to explore completed projects and installations across India."
                rows={4}
              />
            </FormField>

            <FormField description="Inactive section stays hidden on the homepage." label="Is Active">
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
      </Card>

      <DataTable
        actions={
          <Button onClick={openCreateStateModal} size="sm">
            <Plus className="h-4 w-4" />
            Add State
          </Button>
        }
        columns={stateColumns}
        currentPage={stateCurrentPage}
        data={paginatedStates}
        emptyState={{
          title: 'No states added',
          description: 'Add states and map their project counts and services for the homepage success map.',
        }}
        filters={[
          {
            key: 'status',
            label: 'All statuses',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
            value: stateStatusFilter,
            onChange: (value) => {
              setStateStatusFilter(value);
              setStateCurrentPage(1);
            },
          },
        ]}
        isLoading={isLoading}
        onPageChange={setStateCurrentPage}
        onPageSizeChange={setStatePageSize}
        onSearchChange={(value) => {
          setStateSearchValue(value);
          setStateCurrentPage(1);
        }}
        pageSize={statePageSize}
        rowActions={(state) => (
          <div className="flex justify-end gap-2">
            <Button onClick={() => openServicesModal(state)} size="sm" type="button" variant="ghost">
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button onClick={() => openEditStateModal(state)} size="sm" type="button" variant="ghost">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setDeleteTarget({
                  entity: 'state',
                  id: state.id,
                  label: state.state_name,
                });
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
        searchPlaceholder="Search states or services..."
        searchValue={stateSearchValue}
        totalItems={filteredStates.length}
      />

      <DataTable
        actions={
          <Button onClick={openCreateStatModal} size="sm">
            <Plus className="h-4 w-4" />
            Add Stat
          </Button>
        }
        columns={statColumns}
        currentPage={statCurrentPage}
        data={paginatedStats}
        emptyState={{
          title: 'No stats added',
          description: 'Add summary stats that appear alongside the Success Stories section.',
        }}
        filters={[
          {
            key: 'status',
            label: 'All statuses',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
            value: statStatusFilter,
            onChange: (value) => {
              setStatStatusFilter(value);
              setStatCurrentPage(1);
            },
          },
        ]}
        isLoading={isLoading}
        onPageChange={setStatCurrentPage}
        onPageSizeChange={setStatPageSize}
        onSearchChange={(value) => {
          setStatSearchValue(value);
          setStatCurrentPage(1);
        }}
        pageSize={statPageSize}
        rowActions={(stat) => (
          <div className="flex justify-end gap-2">
            <Button onClick={() => openEditStatModal(stat)} size="sm" type="button" variant="ghost">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setDeleteTarget({
                  entity: 'stat',
                  id: stat.id,
                  label: stat.stat_label,
                });
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
        searchPlaceholder="Search stats..."
        searchValue={statSearchValue}
        totalItems={filteredStats.length}
      />

      <Modal
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={closeStateModal} type="button" variant="ghost">
              Cancel
            </Button>
            <Button isLoading={isSavingState} onClick={() => void submitState()} type="button">
              <Save className="h-4 w-4" />
              {editingState ? 'Save Changes' : 'Create State'}
            </Button>
          </div>
        }
        onClose={closeStateModal}
        open={stateModalDisclosure.isOpen}
        title={editingState ? 'Edit State' : 'Add State'}
      >
        <div className="field-grid">
          <FormField error={stateForm.formState.errors.state_name?.message} label="State Name" required>
            <Select {...stateForm.register('state_name')}>
              <option value="">Select a state</option>
              {INDIA_STATE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField error={stateForm.formState.errors.project_count?.message} label="Project Count" required>
            <Input {...stateForm.register('project_count')} placeholder="50+" />
          </FormField>

          <FormField error={stateForm.formState.errors.display_order?.message} label="Display Order" required>
            <Input
              {...stateForm.register('display_order', { valueAsNumber: true })}
              min={1}
              placeholder="1"
              type="number"
            />
          </FormField>

          <FormField description="Inactive states stay hidden on the public homepage." label="Is Active">
            <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
              <Switch
                checked={Boolean(stateForm.watch('is_active'))}
                onChange={(checked) =>
                  stateForm.setValue('is_active', checked, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </FormField>
        </div>
      </Modal>

      <Modal
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={closeStatModal} type="button" variant="ghost">
              Cancel
            </Button>
            <Button isLoading={isSavingStat} onClick={() => void submitStat()} type="button">
              <Save className="h-4 w-4" />
              {editingStat ? 'Save Changes' : 'Create Stat'}
            </Button>
          </div>
        }
        onClose={closeStatModal}
        open={statModalDisclosure.isOpen}
        title={editingStat ? 'Edit Stat' : 'Add Stat'}
      >
        <div className="field-grid">
          <FormField error={statForm.formState.errors.stat_key?.message} label="Stat Key" required>
            <Select {...statForm.register('stat_key')}>
              <option value="">Select a stat key</option>
              {SUCCESS_STORY_STAT_KEY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField error={statForm.formState.errors.stat_value?.message} label="Stat Value" required>
            <Input {...statForm.register('stat_value')} placeholder="150+" />
          </FormField>

          <FormField
            className="md:col-span-2"
            error={statForm.formState.errors.stat_label?.message}
            label="Stat Label"
            required
          >
            <Input {...statForm.register('stat_label')} placeholder="Projects Completed" />
          </FormField>

          <FormField error={statForm.formState.errors.display_order?.message} label="Display Order" required>
            <Input
              {...statForm.register('display_order', { valueAsNumber: true })}
              min={1}
              placeholder="1"
              type="number"
            />
          </FormField>

          <FormField description="Inactive stats stay hidden on the public homepage." label="Is Active">
            <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
              <Switch
                checked={Boolean(statForm.watch('is_active'))}
                onChange={(checked) =>
                  statForm.setValue('is_active', checked, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </FormField>
        </div>
      </Modal>

      <Modal
        description={
          managingState
            ? `Manage services shown when users explore ${managingState.state_name}.`
            : undefined
        }
        footer={
          <div className="flex justify-end">
            <Button onClick={closeServicesModal} type="button" variant="ghost">
              Close
            </Button>
          </div>
        }
        onClose={closeServicesModal}
        open={servicesModalDisclosure.isOpen}
        size="xl"
        title={managingState ? `${managingState.state_name} Services` : 'State Services'}
      >
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-950">
                  {editingService ? 'Edit Service' : 'Add Service'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Services are shown inside the selected state and follow display order.
                </p>
              </div>
              {editingService ? (
                <Button onClick={resetServiceEditor} type="button" variant="outline">
                  Reset
                </Button>
              ) : null}
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void submitService();
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  error={serviceForm.formState.errors.service_name?.message}
                  label="Service Name"
                  required
                >
                  <Input {...serviceForm.register('service_name')} placeholder="Packaged Drinking Water Plants" />
                </FormField>

                <FormField
                  error={serviceForm.formState.errors.display_order?.message}
                  label="Display Order"
                  required
                >
                  <Input
                    {...serviceForm.register('display_order', { valueAsNumber: true })}
                    min={1}
                    placeholder="1"
                    type="number"
                  />
                </FormField>
              </div>

              <div className="flex justify-end gap-3">
                <Button onClick={resetServiceEditor} type="button" variant="ghost">
                  Clear
                </Button>
                <Button isLoading={isSavingService} type="submit">
                  <Save className="h-4 w-4" />
                  {editingService ? 'Save Service' : 'Add Service'}
                </Button>
              </div>
            </form>
          </Card>

          <DataTable
            actions={null}
            columns={serviceColumns}
            currentPage={serviceCurrentPage}
            data={paginatedServices}
            emptyState={{
              title: 'No services added',
              description: 'Add one or more services for this state to complete the Success Stories map content.',
            }}
            isLoading={false}
            onPageChange={setServiceCurrentPage}
            onPageSizeChange={setServicePageSize}
            onSearchChange={(value) => {
              setServiceSearchValue(value);
              setServiceCurrentPage(1);
            }}
            pageSize={servicePageSize}
            rowActions={(service) => (
              <div className="flex justify-end gap-2">
                <Button onClick={() => beginEditService(service)} size="sm" type="button" variant="ghost">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setDeleteTarget({
                      entity: 'service',
                      id: service.id,
                      label: service.service_name,
                    });
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
            searchPlaceholder="Search services..."
            searchValue={serviceSearchValue}
            totalItems={filteredServices.length}
          />
        </div>
      </Modal>

      <ConfirmDialog
        confirmLabel={`Delete ${deleteTarget?.entity ?? 'item'}`}
        description={`This will permanently delete "${deleteTarget?.label ?? 'this item'}".`}
        isLoading={isSavingState || isSavingStat || isSavingService}
        onClose={() => {
          deleteDisclosure.close();
          setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
        open={deleteDisclosure.isOpen}
        title="Delete item?"
      />

      <JSONPreviewDrawer
        data={rawData}
        onClose={previewDisclosure.close}
        open={previewDisclosure.isOpen}
        title="Success Stories API Response"
      />
    </>
  );
};
