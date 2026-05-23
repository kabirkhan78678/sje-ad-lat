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
import { useMachineGallery } from '@/modules/home-content/hooks/useMachineGallery';
import type {
  MachineGalleryFormValues,
  MachineGalleryImage,
  MachineGallerySection,
} from '@/modules/home-content/types/machineGallery';
import type { IndustrialMachineryMachine } from '@/modules/catalog/types/industrialMachinery';
import { getIndustrialMachineryMachines } from '@/services/api/industrialMachinery';
import { saveMachineGallery } from '@/services/api/machineGallery';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/error';

const MACHINE_SELECTION_LIMIT = 8;

const defaultImageSpans = ['', 'md:col-span-2', '', '', 'md:col-span-2', '', '', ''];

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

const toFormValues = (data: MachineGallerySection | null): MachineGalleryFormValues => ({
  section_label: data?.section_label ?? '',
  section_title: data?.section_title ?? '',
  section_description: data?.section_description ?? '',
});

const getCategoryLabel = (machine: IndustrialMachineryMachine) => {
  const category = machine.category;

  if (!category || typeof category !== 'object') {
    return '';
  }

  return normalizeText(category.name) || normalizeText(category.slug);
};

const getMachineMatchId = (
  image: MachineGalleryImage,
  machinesById: Map<number, IndustrialMachineryMachine>,
  machines: IndustrialMachineryMachine[],
) => {
  if (typeof image.machine_id === 'number' && machinesById.has(image.machine_id)) {
    return image.machine_id;
  }

  const normalizedSrc = resolveMediaUrl(image.src);
  const normalizedAlt = image.alt.trim().toLowerCase();

  const matchedMachine = machines.find((machine) => {
    const matchesImage = normalizedSrc && resolveMediaUrl(machine.image_url) === normalizedSrc;
    const matchesTitle = normalizedAlt && machine.title.trim().toLowerCase() === normalizedAlt;
    return matchesImage || matchesTitle;
  });

  return matchedMachine?.id ?? null;
};

const getSelectedMachineIds = (
  data: MachineGallerySection | null,
  machines: IndustrialMachineryMachine[],
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
    for (const image of data.images ?? []) {
      const machineId = getMachineMatchId(image, machinesById, machines);

      if (machineId) {
        selectedIds.add(machineId);
      }

      if (selectedIds.size >= MACHINE_SELECTION_LIMIT) {
        break;
      }
    }
  }

  return Array.from(selectedIds).slice(0, MACHINE_SELECTION_LIMIT);
};

const buildPersistedImageMap = (
  data: MachineGallerySection | null,
  machines: IndustrialMachineryMachine[],
) => {
  const machinesById = new Map(machines.map((machine) => [machine.id, machine]));
  const persistedImages = new Map<number, MachineGalleryImage>();

  for (const image of data?.images ?? []) {
    const machineId = getMachineMatchId(image, machinesById, machines);

    if (machineId) {
      persistedImages.set(machineId, image);
    }
  }

  return persistedImages;
};

export const MachineGalleryPage = () => {
  const { showToast } = useToast();
  const previewDisclosure = useDisclosure(false);
  const { data, error, isLoading, rawData, refetch } = useMachineGallery();
  const [machines, setMachines] = useState<IndustrialMachineryMachine[]>([]);
  const [machinesError, setMachinesError] = useState<string | null>(null);
  const [isMachinesLoading, setIsMachinesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMachineIds, setSelectedMachineIds] = useState<number[]>([]);

  const form = useForm<MachineGalleryFormValues>({
    defaultValues: toFormValues(null) as DefaultValues<MachineGalleryFormValues>,
  });

  const loadMachines = useCallback(async () => {
    setIsMachinesLoading(true);
    setMachinesError(null);

    try {
      const response = await getIndustrialMachineryMachines();
      const normalizedMachines = response.items
        .map((item) => normalizeMachine(item))
        .sort((left, right) => {
          if (left.display_order !== right.display_order) {
            return left.display_order - right.display_order;
          }

          return left.title.localeCompare(right.title);
        });

      setMachines(normalizedMachines);
    } catch (loadError) {
      setMachinesError(getErrorMessage(loadError, 'Unable to load industrial machinery items.'));
    } finally {
      setIsMachinesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMachines();
  }, [loadMachines]);

  useEffect(() => {
    form.reset(toFormValues(data));
  }, [data, form]);

  useEffect(() => {
    if (!machines.length) {
      setSelectedMachineIds([]);
      return;
    }

    setSelectedMachineIds(getSelectedMachineIds(data, machines));
  }, [data, machines]);

  const refreshAll = async () => {
    await Promise.all([refetch(), loadMachines()]);
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
      section_label: form.watch('section_label'),
      section_title: form.watch('section_title'),
      section_description: form.watch('section_description'),
      selected_machine_ids: selectedMachineIds,
      images: selectedMachines.map((machine, index) => ({
        machine_id: machine.id,
        machine_title: machine.title,
        src: machine.image_url,
        alt: machine.title,
        span: defaultImageSpans[index] ?? '',
        display_order: index + 1,
        is_active: true,
      })),
    }),
    [form, selectedMachineIds, selectedMachines],
  );

  const toggleMachineSelection = (machineId: number) => {
    setSelectedMachineIds((current) => {
      if (current.includes(machineId)) {
        return current.filter((value) => value !== machineId);
      }

      if (current.length >= MACHINE_SELECTION_LIMIT) {
        showToast({
          title: 'Selection limit reached',
          description: `Only ${MACHINE_SELECTION_LIMIT} machines can be shown in the home gallery.`,
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

  const submit = async () => {
    if (!selectedMachineIds.length) {
      showToast({
        title: 'Select at least 1 machine',
        description: 'Home Machine Gallery ke liye kam se kam 1 machine select karna required hai.',
        tone: 'error',
      });
      return;
    }

    const values = form.getValues();
    const persistedImages = buildPersistedImageMap(data, machines);
    const payload: MachineGallerySection = {
      section_label: values.section_label.trim(),
      section_title: values.section_title.trim(),
      section_description: values.section_description.trim(),
      selected_machine_ids: selectedMachineIds,
      images: selectedMachines.map((machine, index) => {
        const persistedImage = persistedImages.get(machine.id);

        return {
          ...(persistedImage?.id ? { id: persistedImage.id } : {}),
          src: machine.image_url.trim(),
          alt: machine.title.trim() || machine.tag_text.trim() || `Machine ${index + 1}`,
          span: persistedImage?.span ?? defaultImageSpans[index] ?? '',
          display_order: index + 1,
          is_active: persistedImage?.is_active ?? true,
          machine_id: machine.id,
          machine_title: machine.title.trim(),
        };
      }),
    };

    setIsSubmitting(true);

    try {
      await saveMachineGallery(payload);
      await refetch();
      showToast({
        title: 'Machine Gallery updated',
        description: 'Home gallery now uses the selected industrial machinery items.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save machine gallery',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((error || machinesError) && !isLoading && !isMachinesLoading) {
    return (
      <ErrorState
        description={error ?? machinesError ?? 'Unable to load machine gallery.'}
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
        description="Select industrial machinery items for the home Machine Gallery section and control their display order."
        title="Machine Gallery"
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
            label={isLoading || isMachinesLoading ? 'Loading machine gallery...' : 'Saving machine gallery...'}
            show={isLoading || isMachinesLoading || isSubmitting}
          />

          <div className="mb-5">
            <h2 className="font-display text-xl font-semibold text-slate-950">Section Content</h2>
            <p className="mt-1 text-sm text-slate-500">
              Control the heading and supporting text shown above the selected machinery cards.
            </p>
          </div>

          <div className="field-grid">
            <FormField
              error={form.formState.errors.section_label?.message}
              label="Section Label"
              required
            >
              <Input {...form.register('section_label')} placeholder="Real Installations" />
            </FormField>

            <FormField
              error={form.formState.errors.section_title?.message}
              label="Section Title"
              required
            >
              <Input {...form.register('section_title')} placeholder="Machine Gallery" />
            </FormField>

            <FormField
              className="md:col-span-2"
              error={form.formState.errors.section_description?.message}
              label="Section Description"
              required
            >
              <Textarea
                {...form.register('section_description')}
                placeholder="Select machinery items from the industrial machinery catalog for the homepage gallery."
                rows={4}
              />
            </FormField>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-950">
                Select Home Gallery Machines
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                Industrial Machinery section ki sab machines neeche dikh rahi hain. Admin yahin se decide
                karega kaunsi machines homepage par show hongi aur unka display order kya hoga.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={selectedMachineIds.length ? 'success' : 'warning'}>
                {selectedMachineIds.length}/{MACHINE_SELECTION_LIMIT} selected
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
                const categoryLabel = getCategoryLabel(machine);

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
                        <p className="mt-1 text-sm text-slate-500">
                          Order #{index + 1}
                        </p>
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
                Abhi koi machine selected nahi hai. Neeche list se machines select karke homepage gallery
                build karein.
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          {machines.map((machine) => {
            const previewUrl = resolveMediaUrl(machine.image_url);
            const isSelected = selectedMachineIds.includes(machine.id);
            const categoryLabel = getCategoryLabel(machine);
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

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
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

        {!machines.length && !isMachinesLoading ? (
          <Card className="p-8 text-center">
            <p className="text-base font-semibold text-slate-900">No industrial machines found</p>
            <p className="mt-2 text-sm text-slate-500">
              Pehle `Catalog / Industrial Machinery` mein machines add karein, phir yahan se select karke
              homepage gallery manage kar paayenge.
            </p>
          </Card>
        ) : null}

        <div className="flex justify-end">
          <Button disabled={isLoading || isMachinesLoading} isLoading={isSubmitting} type="submit">
            <Save className="h-4 w-4" />
            Save Machine Gallery
          </Button>
        </div>
      </form>

      <JSONPreviewDrawer
        data={rawData ?? previewData}
        onClose={previewDisclosure.close}
        open={previewDisclosure.isOpen}
        title="Machine Gallery API Response"
      />
    </>
  );
};
