import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  Image as ImageIcon,
  RefreshCw,
  Save,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, type DefaultValues } from 'react-hook-form';

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
import { Textarea } from '@/components/ui/Textarea';
import { API_BASE_URL } from '@/constants/api';
import { useDisclosure } from '@/hooks/useDisclosure';
import { machineryPortfolioSectionSchema } from '@/modules/home-content/machineryPortfolioSchemas';
import { useMachineryPortfolio } from '@/modules/home-content/hooks/useMachineryPortfolio';
import type {
  MachineryPortfolioFormValues,
  MachineryPortfolioMachine,
  MachineryPortfolioSection,
  MachineryPortfolioSectionPayload,
} from '@/modules/home-content/types/machineryPortfolio';
import type {
  IndustrialMachineryCategory,
  IndustrialMachineryMachine,
} from '@/modules/catalog/types/industrialMachinery';
import {
  getIndustrialMachineryCategories,
  getIndustrialMachineryMachines,
} from '@/services/api/industrialMachinery';
import { updateMachineryPortfolioSection } from '@/services/api/machineryPortfolio';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';

const PORTFOLIO_SELECTION_LIMIT = 6;

const resolveMediaUrl = (value: string) => {
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) {
    return value;
  }

  return value.startsWith('/') ? `${API_BASE_URL}${value}` : `${API_BASE_URL}/${value}`;
};

const normalizeText = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    return value === '1' || value.toLowerCase() === 'true';
  }

  return Boolean(value);
};

const normalizeMachine = (value: unknown): IndustrialMachineryMachine => {
  const item = typeof value === 'object' && value ? (value as Record<string, unknown>) : {};

  return {
    id: toNumber(item.id),
    product_id:
      item.product_id === null || item.product_id === undefined || item.product_id === ''
        ? null
        : toNumber(item.product_id),
    category_id: toNumber(item.category_id),
    title: normalizeText(item.title),
    description: normalizeText(item.description),
    image_url: normalizeText(item.image_url),
    tag_text: normalizeText(item.tag_text),
    capacity: normalizeText(item.capacity),
    automation: normalizeText(item.automation),
    view_details_text: normalizeText(item.view_details_text),
    view_details_link: normalizeText(item.view_details_link),
    quote_text: normalizeText(item.quote_text),
    quote_link: normalizeText(item.quote_link),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
    product: typeof item.product === 'object' && item.product ? (item.product as Record<string, unknown>) : null,
    category: typeof item.category === 'object' && item.category ? (item.category as Record<string, unknown>) : null,
  };
};

const normalizeCategory = (value: unknown): IndustrialMachineryCategory => {
  const item = typeof value === 'object' && value ? (value as Record<string, unknown>) : {};

  return {
    id: toNumber(item.id),
    source_category_id:
      item.source_category_id === null || item.source_category_id === undefined || item.source_category_id === ''
        ? null
        : toNumber(item.source_category_id),
    name: normalizeText(item.name),
    slug: normalizeText(item.slug),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
  };
};

const toFormValues = (data: MachineryPortfolioSection | null): MachineryPortfolioFormValues => ({
  section_title: data?.section_title ?? '',
  section_subtitle: data?.section_subtitle ?? '',
  section_label: data?.section_label ?? '',
  is_active: data?.is_active ?? true,
});

const getCategoryLabel = (
  machine: IndustrialMachineryMachine,
  categoriesById: Map<number, IndustrialMachineryCategory>,
) => {
  const category = machine.category;

  if (category && typeof category === 'object') {
    const name = normalizeText(category.name);
    const slug = normalizeText(category.slug);
    return name || slug;
  }

  return categoriesById.get(machine.category_id)?.name ?? '';
};

const getMachineMatchId = (
  portfolioMachine: MachineryPortfolioMachine,
  machinesById: Map<number, IndustrialMachineryMachine>,
  machines: IndustrialMachineryMachine[],
  categoriesById: Map<number, IndustrialMachineryCategory>,
) => {
  if (
    typeof portfolioMachine.source_machine_id === 'number' &&
    machinesById.has(portfolioMachine.source_machine_id)
  ) {
    return portfolioMachine.source_machine_id;
  }

  const normalizedImage = resolveMediaUrl(portfolioMachine.image);
  const normalizedName = portfolioMachine.name.trim().toLowerCase();
  const normalizedCategory = portfolioMachine.category.trim().toLowerCase();

  const matchedMachine = machines.find((machine) => {
    const machineCategory = getCategoryLabel(machine, categoriesById).trim().toLowerCase();
    const matchesImage = normalizedImage && resolveMediaUrl(machine.image_url) === normalizedImage;
    const matchesName = normalizedName && machine.title.trim().toLowerCase() === normalizedName;
    const matchesCategory = normalizedCategory && machineCategory === normalizedCategory;

    return matchesImage || (matchesName && matchesCategory) || matchesName;
  });

  return matchedMachine?.id ?? null;
};

const getSelectedMachineIds = (
  data: MachineryPortfolioSection | null,
  machines: IndustrialMachineryMachine[],
  categoriesById: Map<number, IndustrialMachineryCategory>,
) => {
  if (!data || !machines.length) {
    return [];
  }

  const machinesById = new Map(machines.map((machine) => [machine.id, machine]));
  const selectedIds = new Set<number>();

  for (const value of data.selected_machine_ids ?? []) {
    const machineId = toNumber(value);

    if (machinesById.has(machineId)) {
      selectedIds.add(machineId);
    }
  }

  if (!selectedIds.size) {
    for (const value of data.machines ?? []) {
      const portfolioMachine = normalizePortfolioMachine(value);
      const machineId = getMachineMatchId(portfolioMachine, machinesById, machines, categoriesById);

      if (machineId) {
        selectedIds.add(machineId);
      }

      if (selectedIds.size >= PORTFOLIO_SELECTION_LIMIT) {
        break;
      }
    }
  }

  return Array.from(selectedIds).slice(0, PORTFOLIO_SELECTION_LIMIT);
};

const normalizePortfolioMachine = (value: unknown): MachineryPortfolioMachine => {
  const item = typeof value === 'object' && value ? (value as Record<string, unknown>) : {};

  return {
    id: toNumber(item.id),
    name: normalizeText(item.name),
    category: normalizeText(item.category),
    badge: normalizeText(item.badge),
    image: normalizeText(item.image ?? item.image_url),
    description: normalizeText(item.description),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
    source_machine_id:
      item.source_machine_id === null || item.source_machine_id === undefined || item.source_machine_id === ''
        ? null
        : toNumber(item.source_machine_id),
    category_id:
      item.category_id === null || item.category_id === undefined || item.category_id === ''
        ? null
        : toNumber(item.category_id),
    product_id:
      item.product_id === null || item.product_id === undefined || item.product_id === ''
        ? null
        : toNumber(item.product_id),
    created_at: typeof item.created_at === 'string' ? item.created_at : undefined,
    updated_at: typeof item.updated_at === 'string' ? item.updated_at : undefined,
  };
};

export const MachineryPortfolioPage = () => {
  const { showToast } = useToast();
  const previewDisclosure = useDisclosure(false);
  const { data, error, isLoading, refetch } = useMachineryPortfolio();
  const [machines, setMachines] = useState<IndustrialMachineryMachine[]>([]);
  const [categories, setCategories] = useState<IndustrialMachineryCategory[]>([]);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [isSourceLoading, setIsSourceLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMachineIds, setSelectedMachineIds] = useState<number[]>([]);

  const form = useForm<MachineryPortfolioFormValues>({
    resolver: zodResolver(machineryPortfolioSectionSchema),
    defaultValues: toFormValues(null) as DefaultValues<MachineryPortfolioFormValues>,
  });

  const loadSourceData = useCallback(async () => {
    setIsSourceLoading(true);
    setSourceError(null);

    try {
      const [machinesResponse, categoriesResponse] = await Promise.all([
        getIndustrialMachineryMachines(),
        getIndustrialMachineryCategories(),
      ]);

      const nextMachines = machinesResponse.items
        .map((item) => normalizeMachine(item))
        .sort((left, right) => {
          if (left.display_order !== right.display_order) {
            return left.display_order - right.display_order;
          }

          return left.title.localeCompare(right.title);
        });

      const nextCategories = categoriesResponse.items
        .map((item) => normalizeCategory(item))
        .sort((left, right) => left.display_order - right.display_order || left.name.localeCompare(right.name));

      setMachines(nextMachines);
      setCategories(nextCategories);
    } catch (loadError) {
      setSourceError(getErrorMessage(loadError, 'Unable to load industrial machinery data.'));
    } finally {
      setIsSourceLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSourceData();
  }, [loadSourceData]);

  useEffect(() => {
    form.reset(toFormValues(data));
  }, [data, form]);

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  useEffect(() => {
    if (!machines.length) {
      setSelectedMachineIds([]);
      return;
    }

    setSelectedMachineIds(getSelectedMachineIds(data, machines, categoriesById));
  }, [categoriesById, data, machines]);

  const refreshAll = async () => {
    await Promise.all([refetch(), loadSourceData()]);
  };

  const machinesById = useMemo(
    () => new Map(machines.map((machine) => [machine.id, machine])),
    [machines],
  );

  const selectedMachines = useMemo(
    () =>
      selectedMachineIds
        .map((machineId) => machinesById.get(machineId))
        .filter((machine): machine is IndustrialMachineryMachine => Boolean(machine)),
    [machinesById, selectedMachineIds],
  );

  const previewData = useMemo(
    () => ({
      section_title: form.watch('section_title'),
      section_subtitle: form.watch('section_subtitle'),
      section_label: form.watch('section_label'),
      is_active: form.watch('is_active'),
      selected_machine_ids: selectedMachineIds,
      machines: selectedMachines.map((machine, index) => ({
        source_machine_id: machine.id,
        product_id: machine.product_id ?? null,
        category_id: machine.category_id,
        name: machine.title,
        category: getCategoryLabel(machine, categoriesById),
        badge: machine.tag_text,
        image: machine.image_url,
        image_url: machine.image_url,
        description: machine.description,
        display_order: index + 1,
        is_active: true,
      })),
    }),
    [categoriesById, form, selectedMachineIds, selectedMachines],
  );

  const toggleMachineSelection = (machineId: number) => {
    setSelectedMachineIds((current) => {
      if (current.includes(machineId)) {
        return current.filter((value) => value !== machineId);
      }

      if (current.length >= PORTFOLIO_SELECTION_LIMIT) {
        showToast({
          title: 'Selection limit reached',
          description: `Only ${PORTFOLIO_SELECTION_LIMIT} machines can be shown in the premium portfolio.`,
          tone: 'error',
        });
        return current;
      }

      return [...current, machineId];
    });
  };

  const moveSelectedMachine = (machineId: number, direction: 'up' | 'down') => {
    setSelectedMachineIds((current) => {
      const currentIndex = current.indexOf(machineId);

      if (currentIndex === -1) {
        return current;
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [selectedId] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, selectedId);
      return next;
    });
  };

  const submit = form.handleSubmit(async (values) => {
    if (selectedMachineIds.length !== PORTFOLIO_SELECTION_LIMIT) {
      showToast({
        title: 'Select exactly 6 machines',
        description: 'Premium portfolio ke liye exactly 6 machines select karna required hai.',
        tone: 'error',
      });
      return;
    }

    const payload: MachineryPortfolioSectionPayload = {
      section_title: values.section_title.trim(),
      section_subtitle: values.section_subtitle.trim(),
      section_label: values.section_label.trim(),
      is_active: Boolean(values.is_active),
      selected_machine_ids: selectedMachineIds,
      machines: selectedMachines.map((machine, index) => ({
        source_machine_id: machine.id,
        product_id: machine.product_id ?? null,
        category_id: machine.category_id,
        name: machine.title.trim(),
        category: getCategoryLabel(machine, categoriesById).trim(),
        badge: machine.tag_text.trim(),
        image: machine.image_url.trim(),
        description: machine.description.trim(),
        display_order: index + 1,
        is_active: true,
      })),
    };

    setIsSubmitting(true);

    try {
      await updateMachineryPortfolioSection(payload);
      await refetch();
      showToast({
        title: 'Machinery portfolio updated',
        description: 'Premium portfolio section and selected machines were saved.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save machinery portfolio',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  if ((error || sourceError) && !isLoading && !isSourceLoading) {
    return (
      <ErrorState
        description={error ?? sourceError ?? 'Unable to load machinery portfolio.'}
        onRetry={() => void refreshAll()}
      />
    );
  }

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button onClick={() => void refreshAll()} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={previewDisclosure.open} variant="outline">
              <Eye className="h-4 w-4" />
              Preview API Data
            </Button>
          </>
        }
        description="Control the premium portfolio section content and choose exactly 6 industrial machinery items to show on the homepage."
        title="Machinery Portfolio"
      />

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Card className="relative p-5 sm:p-6">
          <LoadingOverlay
            label={isLoading || isSourceLoading ? 'Loading machinery portfolio...' : 'Saving machinery portfolio...'}
            show={isLoading || isSourceLoading || isSubmitting}
          />

          <div className="mb-5">
            <h2 className="font-display text-xl font-semibold text-slate-950">Section Content</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ye teen fields required hain aur premium portfolio section ke top content ko control karti hain.
            </p>
          </div>

          <div className="field-grid">
            <FormField error={form.formState.errors.section_title?.message} label="Section Title" required>
              <Input {...form.register('section_title')} placeholder="Premium Machinery Portfolios" />
            </FormField>

            <FormField error={form.formState.errors.section_label?.message} label="Section Label" required>
              <Input {...form.register('section_label')} placeholder="Solutions Of Industries" />
            </FormField>

            <FormField
              className="md:col-span-2"
              error={form.formState.errors.section_subtitle?.message}
              label="Section Subtitle"
              required
            >
              <Textarea
                {...form.register('section_subtitle')}
                placeholder="Short supporting line for the premium machinery portfolio section."
                rows={4}
              />
            </FormField>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-950">
                Select Premium Portfolio Machines
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                `industrial_machinery_items` aur `industrial_machinery_categories` ke data se saari
                machinery neeche dikh rahi hai. Inmein se exactly 6 machines homepage premium portfolio me
                show hongi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={selectedMachineIds.length === PORTFOLIO_SELECTION_LIMIT ? 'success' : 'warning'}>
                {selectedMachineIds.length}/{PORTFOLIO_SELECTION_LIMIT} selected
              </Badge>
              <Button
                disabled={!selectedMachineIds.length}
                onClick={() => setSelectedMachineIds([])}
                type="button"
                variant="ghost"
              >
                Clear Selection
              </Button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {selectedMachines.length ? (
              selectedMachines.map((machine, index) => {
                const categoryLabel = getCategoryLabel(machine, categoriesById);

                return (
                  <div
                    className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                    key={machine.id}
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {categoryLabel ? <Badge tone="info">{categoryLabel}</Badge> : null}
                          <Badge tone={machine.is_active ? 'success' : 'neutral'}>
                            {machine.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{machine.title}</p>
                        <p className="mt-1 text-sm text-slate-500">Order #{index + 1}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        disabled={index === 0}
                        onClick={() => moveSelectedMachine(machine.id, 'up')}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <ArrowUp className="h-4 w-4" />
                        Move Up
                      </Button>
                      <Button
                        disabled={index === selectedMachines.length - 1}
                        onClick={() => moveSelectedMachine(machine.id, 'down')}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <ArrowDown className="h-4 w-4" />
                        Move Down
                      </Button>
                      <Button
                        onClick={() => toggleMachineSelection(machine.id)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Abhi koi machine selected nahi hai. Neeche list se 6 machines select karke premium portfolio
                build karein.
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          {machines.map((machine) => {
            const previewUrl = resolveMediaUrl(machine.image_url);
            const isSelected = selectedMachineIds.includes(machine.id);
            const categoryLabel = getCategoryLabel(machine, categoriesById);
            const selectedIndex = selectedMachineIds.indexOf(machine.id);

            return (
              <Card
                className={cn(
                  'overflow-hidden border transition',
                  isSelected ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200',
                )}
                key={machine.id}
              >
                <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {previewUrl ? (
                      <img
                        alt={machine.title || 'Industrial machinery'}
                        className="h-52 w-full object-cover"
                        src={previewUrl}
                      />
                    ) : (
                      <div className="flex h-52 items-center justify-center text-sm text-slate-400">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        No image available
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {categoryLabel ? <Badge tone="info">{categoryLabel}</Badge> : null}
                          <Badge tone={machine.is_active ? 'success' : 'neutral'}>
                            {machine.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {isSelected ? <Badge tone="success">Selected #{selectedIndex + 1}</Badge> : null}
                        </div>

                        <h3 className="mt-3 text-lg font-semibold text-slate-950">{machine.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                          {machine.description || 'No description added for this machine yet.'}
                        </p>
                      </div>

                      <Button
                        onClick={() => toggleMachineSelection(machine.id)}
                        type="button"
                        variant={isSelected ? 'primary' : 'outline'}
                      >
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                        {isSelected ? 'Selected' : 'Select Machine'}
                      </Button>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Badge
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-700">
                          {machine.tag_text || 'Not provided'}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Capacity
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-700">
                          {machine.capacity || 'Not provided'}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Automation
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-700">
                          {machine.automation || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {!machines.length && !isSourceLoading ? (
          <Card className="p-8 text-center">
            <p className="text-base font-semibold text-slate-900">No industrial machines found</p>
            <p className="mt-2 text-sm text-slate-500">
              Pehle `Catalog / Industrial Machinery` me machines add karein, phir yahan se 6 select kar
              paayenge.
            </p>
          </Card>
        ) : null}

        <div className="flex justify-end">
          <Button disabled={isLoading || isSourceLoading} isLoading={isSubmitting} type="submit">
            <Save className="h-4 w-4" />
            Save Machinery Portfolio
          </Button>
        </div>
      </form>

      <JSONPreviewDrawer
        data={{
          current_response: data,
          next_payload: previewData,
        }}
        onClose={previewDisclosure.close}
        open={previewDisclosure.isOpen}
        title="Machinery Portfolio API Data"
      />
    </>
  );
};
