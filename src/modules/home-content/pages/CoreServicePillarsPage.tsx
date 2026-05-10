import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { ErrorState } from '@/components/shared/ErrorState';
import { JSONPreviewDrawer } from '@/components/shared/JSONPreviewDrawer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/ToastProvider';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDisclosure } from '@/hooks/useDisclosure';
import { API_BASE_URL } from '@/constants/api';
import { getCoreServicePillars, updateCoreServicePillarsSection, createCoreServicePillarCard, updateCoreServicePillarCard, deleteCoreServicePillarCard, reorderCoreServicePillarCards, toggleCoreServicePillarCard } from '@/services/api/coreServicePillars';
import { getErrorMessage } from '@/utils/error';
import type { FieldConfig, TableColumn } from '@/types/resources';
import { CoreServicePillarCardModal } from '@/modules/home-content/components/CoreServicePillarCardModal';
import { useCoreServicePillars } from '@/modules/home-content/hooks/useCoreServicePillars';
import {
  coreServicePillarCardSchema,
  coreServicePillarsSectionSchema,
} from '@/modules/home-content/coreServicePillarsSchemas';
import type {
  CoreServicePillarCard,
  CoreServicePillarCardFormValues,
  CoreServicePillarsSectionPayload,
} from '@/modules/home-content/types/coreServicePillars';

const sectionFields: FieldConfig[] = [
  {
    name: 'section_title',
    label: 'Section Title',
    type: 'text',
    required: true,
    placeholder: 'Our Core Service Pillars',
    colSpan: 2,
  },
  {
    name: 'section_subtitle',
    label: 'Section Subtitle',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder:
      'Three comprehensive service divisions delivering complete solutions for laboratory infrastructure, regulatory compliance, and industrial manufacturing systems.',
    colSpan: 2,
  },
];

const defaultSectionValues: CoreServicePillarsSectionPayload = {
  section_title: '',
  section_subtitle: '',
};

const defaultCardValues: CoreServicePillarCardFormValues = {
  image: null,
  title: '',
  description: '',
  bullet_items: [''],
  learn_more_label: '',
  learn_more_url: '',
  get_quote_label: '',
  get_quote_url: '',
  sort_order: 1,
  is_active: true,
};

const buildCardFormData = (values: CoreServicePillarCardFormValues) => {
  const formData = new FormData();
  const imageValue: unknown = values.image;

  if (imageValue instanceof File || imageValue instanceof Blob) {
    formData.append('image', imageValue);
  }

  formData.append('title', values.title.trim());
  formData.append('description', values.description.trim());
  formData.append(
    'bullet_items',
    JSON.stringify(values.bullet_items.map((item) => item.trim()).filter(Boolean)),
  );
  formData.append('learn_more_label', values.learn_more_label.trim());
  formData.append('learn_more_url', values.learn_more_url.trim());
  formData.append('get_quote_label', values.get_quote_label.trim());
  formData.append('get_quote_url', values.get_quote_url.trim());
  formData.append('sort_order', String(values.sort_order));
  formData.append('is_active', String(values.is_active));

  return formData;
};

const resolveMediaUrl = (value: unknown): string | null => {
  if (!value) {
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

const normalizeCard = (card: Record<string, any>): CoreServicePillarCard => ({
  id: Number(card.id),
  image: resolveMediaUrl(card.image ?? card.image_url ?? card.media),
  title: String(card.title ?? ''),
  description: String(card.description ?? ''),
  bullet_items: Array.isArray(card.bullet_items)
    ? card.bullet_items.map((item) => String(item))
    : typeof card.bullet_items === 'string' && card.bullet_items.trim()
      ? (() => {
          try {
            const parsed = JSON.parse(card.bullet_items);
            return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
          } catch {
            return [];
          }
        })()
      : [],
  learn_more_label: String(card.learn_more_label ?? ''),
  learn_more_url: String(card.learn_more_url ?? ''),
  get_quote_label: String(card.get_quote_label ?? ''),
  get_quote_url: String(card.get_quote_url ?? ''),
  sort_order: Number(card.sort_order ?? 0),
  is_active: Boolean(card.is_active),
});

const sortCards = (cards: CoreServicePillarCard[]) =>
  [...cards].sort((left, right) => left.sort_order - right.sort_order || left.id - right.id);

const toCardFormValues = (card: CoreServicePillarCard | null): CoreServicePillarCardFormValues => {
  if (!card) {
    return defaultCardValues;
  }

  return {
    image: card.image ?? null,
    title: card.title,
    description: card.description,
    bullet_items: card.bullet_items.length ? card.bullet_items : [''],
    learn_more_label: card.learn_more_label,
    learn_more_url: card.learn_more_url,
    get_quote_label: card.get_quote_label,
    get_quote_url: card.get_quote_url,
    sort_order: card.sort_order,
    is_active: card.is_active,
  };
};

const cardColumns: TableColumn<CoreServicePillarCard>[] = [
  {
    key: 'image',
    label: 'Image',
    render: (card) =>
      card.image ? (
        <img alt={card.title} className="h-16 w-20 rounded-xl object-cover" src={card.image} />
      ) : (
        <div className="flex h-16 w-20 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
          No image
        </div>
      ),
  },
  {
    key: 'title',
    label: 'Title',
    render: (card) => (
      <div className="space-y-1">
        <p className="font-semibold text-slate-900">{card.title}</p>
        <p className="line-clamp-2 max-w-md text-sm text-slate-500">{card.description}</p>
      </div>
    ),
  },
  {
    key: 'bullet_items',
    label: 'Bullet Items',
    render: (card) => (
      <div className="flex max-w-sm flex-wrap gap-2">
        {card.bullet_items.map((item, index) => (
          <Badge key={`${card.id}-bullet-${index}`} tone="info">
            {item}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: 'links',
    label: 'Links',
    render: (card) => (
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold text-slate-800">{card.learn_more_label}:</span>{' '}
          <span className="text-slate-500">{card.learn_more_url}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-800">{card.get_quote_label}:</span>{' '}
          <span className="text-slate-500">{card.get_quote_url}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'sort_order',
    label: 'Order',
  },
  {
    key: 'is_active',
    label: 'Status',
    render: (card) => <Badge tone={card.is_active ? 'success' : 'neutral'}>{card.is_active ? 'Active' : 'Inactive'}</Badge>,
  },
];

export const CoreServicePillarsPage = () => {
  const { showToast } = useToast();
  const previewDisclosure = useDisclosure(false);
  const cardModalDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const { data, error, isLoading, refetch } = useCoreServicePillars();
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [activeCard, setActiveCard] = useState<CoreServicePillarCard | null>(null);
  const [cardPendingDelete, setCardPendingDelete] = useState<CoreServicePillarCard | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearchValue = useDebouncedValue(searchValue, 200);

  const sectionForm = useForm<CoreServicePillarsSectionPayload>({
    resolver: zodResolver(coreServicePillarsSectionSchema),
    defaultValues: defaultSectionValues as DefaultValues<CoreServicePillarsSectionPayload>,
  });

  const cardForm = useForm<CoreServicePillarCardFormValues>({
    resolver: zodResolver(coreServicePillarCardSchema),
    defaultValues: defaultCardValues as DefaultValues<CoreServicePillarCardFormValues>,
  });

  const cards = useMemo(() => sortCards((data?.service_cards ?? []).map((card) => normalizeCard(card as never))), [data]);
  const activeCardsCount = useMemo(() => cards.filter((card) => card.is_active).length, [cards]);

  const filteredCards = useMemo(() => {
    if (!debouncedSearchValue) {
      return cards;
    }

    const value = debouncedSearchValue.toLowerCase();
    return cards.filter(
      (card) =>
        card.title.toLowerCase().includes(value) ||
        card.description.toLowerCase().includes(value) ||
        card.bullet_items.some((item) => item.toLowerCase().includes(value)),
    );
  }, [cards, debouncedSearchValue]);

  const paginatedCards = useMemo(
    () => filteredCards.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredCards, pageSize],
  );

  useEffect(() => {
    sectionForm.reset({
      section_title: data?.section_title ?? '',
      section_subtitle: data?.section_subtitle ?? '',
    });
  }, [data, sectionForm]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredCards.length, pageSize]);

  const openCreateModal = () => {
    setActiveCard(null);
    cardForm.reset({
      ...defaultCardValues,
      sort_order: cards.length + 1,
      is_active: activeCardsCount < 3,
    });
    cardModalDisclosure.open();
  };

  const openEditModal = (card: CoreServicePillarCard) => {
    setActiveCard(card);
    cardForm.reset(toCardFormValues(card));
    cardModalDisclosure.open();
  };

  const closeCardModal = () => {
    setActiveCard(null);
    cardForm.reset(defaultCardValues);
    cardModalDisclosure.close();
  };

  const submitSection = sectionForm.handleSubmit(async (values) => {
    setIsSavingSection(true);

    try {
      await updateCoreServicePillarsSection(values);
      await refetch();
      showToast({
        title: 'Core Service Pillars updated',
        description: 'Section title and subtitle were saved successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save section',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingSection(false);
    }
  });

  const submitCard = cardForm.handleSubmit(async (values) => {
    if (!activeCard && !(values.image instanceof File)) {
      cardForm.setError('image', {
        type: 'manual',
        message: 'Image is required while creating a card.',
      });
      return;
    }

    const otherActiveCards = cards.filter((card) => card.id !== activeCard?.id && card.is_active).length;

    if (values.is_active && otherActiveCards >= 3) {
      showToast({
        title: 'Active card limit reached',
        description: 'Only 3 cards can stay active at the same time.',
        tone: 'error',
      });
      return;
    }

    setIsSavingCard(true);

    try {
      const formData = buildCardFormData(values);

      if (activeCard) {
        await updateCoreServicePillarCard(activeCard.id, formData);
      } else {
        await createCoreServicePillarCard(formData);
      }

      await refetch();
      closeCardModal();
      showToast({
        title: activeCard ? 'Service card updated' : 'Service card created',
        description: activeCard
          ? 'The card changes were saved successfully.'
          : 'A new core service pillar card was added.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save service card',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setIsSavingCard(false);
    }
  });

  const confirmDelete = async () => {
    if (!cardPendingDelete) {
      return;
    }

    if (cards.length <= 1) {
      showToast({
        title: 'At least one card is required',
        description: 'You cannot delete the last remaining service card.',
        tone: 'error',
      });
      deleteDisclosure.close();
      setCardPendingDelete(null);
      return;
    }

    setIsSavingCard(true);

    try {
      await deleteCoreServicePillarCard(cardPendingDelete.id);
      await refetch();
      showToast({
        title: 'Service card deleted',
        description: 'The selected card has been removed.',
        tone: 'success',
      });
      deleteDisclosure.close();
      setCardPendingDelete(null);
    } catch (deleteError) {
      showToast({
        title: 'Unable to delete service card',
        description: getErrorMessage(deleteError),
        tone: 'error',
      });
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleToggle = async (card: CoreServicePillarCard) => {
    if (!card.is_active && activeCardsCount >= 3) {
      showToast({
        title: 'Active card limit reached',
        description: 'Deactivate another card before activating this one.',
        tone: 'error',
      });
      return;
    }

    setIsSavingCard(true);

    try {
      await toggleCoreServicePillarCard(card.id, !card.is_active);
      await refetch();
      showToast({
        title: card.is_active ? 'Card deactivated' : 'Card activated',
        description: `The card is now ${card.is_active ? 'inactive' : 'active'}.`,
        tone: 'success',
      });
    } catch (toggleError) {
      showToast({
        title: 'Unable to update status',
        description: getErrorMessage(toggleError),
        tone: 'error',
      });
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleReorder = async (card: CoreServicePillarCard, direction: 'up' | 'down') => {
    const currentIndex = cards.findIndex((item) => item.id === card.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= cards.length) {
      return;
    }

    const nextCards = [...cards];
    [nextCards[currentIndex], nextCards[targetIndex]] = [nextCards[targetIndex], nextCards[currentIndex]];

    setIsReordering(true);

    try {
      await reorderCoreServicePillarCards(nextCards.map((item) => ({ id: item.id })));
      await refetch();
      showToast({
        title: 'Card order updated',
        description: 'The service card order was saved successfully.',
        tone: 'success',
      });
    } catch (reorderError) {
      showToast({
        title: 'Unable to reorder cards',
        description: getErrorMessage(reorderError),
        tone: 'error',
      });
    } finally {
      setIsReordering(false);
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
              Add New Card
            </Button>
          </>
        }
        description="Manage the section heading plus up to 3 active service cards with image uploads, links, and reorder controls."
        title="Core Service Pillars"
      />

      <Card className="relative p-6">
        <LoadingOverlay label="Saving section..." show={isLoading || isSavingSection} />
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-950">Section Content</h2>
            <p className="mt-1 text-sm text-slate-500">Update the title and subtitle shown above the service cards.</p>
          </div>
          <Button isLoading={isSavingSection} onClick={() => void submitSection()} type="button">
            <Save className="h-4 w-4" />
            Save section
          </Button>
        </div>

        <FormProvider {...sectionForm}>
          <div className="field-grid">
            {sectionFields.map((field) => (
              <FormFieldRenderer field={field} key={field.name} />
            ))}
          </div>
        </FormProvider>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <DataTable
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={activeCardsCount >= 3 ? 'warning' : 'info'}>
                {activeCardsCount}/3 active cards
              </Badge>
              <Badge tone={cards.length === 0 ? 'danger' : 'neutral'}>{cards.length} total cards</Badge>
            </div>
          }
          columns={cardColumns}
          currentPage={currentPage}
          data={paginatedCards}
          emptyState={{
            title: 'No service cards yet',
            description: 'Add at least one card to publish this section on the homepage.',
          }}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setCurrentPage(1);
          }}
          onSearchChange={setSearchValue}
          pageSize={pageSize}
          rowActions={(card) => {
            const currentIndex = cards.findIndex((item) => item.id === card.id);

            return (
              <div className="flex justify-end gap-2">
                <Button
                  disabled={isReordering || isSavingCard || currentIndex === 0}
                  onClick={() => void handleReorder(card, 'up')}
                  size="sm"
                  variant="ghost"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  disabled={isReordering || isSavingCard || currentIndex === cards.length - 1}
                  onClick={() => void handleReorder(card, 'down')}
                  size="sm"
                  variant="ghost"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button disabled={isSavingCard} onClick={() => openEditModal(card)} size="sm" variant="ghost">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button disabled={isSavingCard} onClick={() => void handleToggle(card)} size="sm" variant="ghost">
                  <Power className={`h-4 w-4 ${card.is_active ? 'text-amber-600' : 'text-emerald-600'}`} />
                </Button>
                <Button
                  disabled={isSavingCard}
                  onClick={() => {
                    setCardPendingDelete(card);
                    deleteDisclosure.open();
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            );
          }}
          searchPlaceholder="Search service cards..."
          searchValue={searchValue}
          totalItems={filteredCards.length}
        />

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-slate-950">Publishing Rules</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>Keep at least 1 service card in the section at all times.</li>
            <li>Only 3 cards can be active at the same time.</li>
            <li>Each card needs 1 to 10 bullet points and valid internal or absolute URLs.</li>
            <li>Images are required on create and optional while editing.</li>
          </ul>
        </Card>
      </div>

      <CoreServicePillarCardModal
        activeCard={activeCard}
        form={cardForm}
        isSubmitting={isSavingCard}
        onClose={closeCardModal}
        onSubmit={() => void submitCard()}
        open={cardModalDisclosure.isOpen}
      />

      <ConfirmDialog
        confirmLabel="Delete card"
        description={
          cardPendingDelete
            ? `This will permanently remove "${cardPendingDelete.title}" from the section.`
            : 'This action cannot be undone.'
        }
        isLoading={isSavingCard}
        onClose={() => {
          deleteDisclosure.close();
          setCardPendingDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
        open={deleteDisclosure.isOpen}
        title="Delete service card"
      />

      <JSONPreviewDrawer
        data={data ?? {}}
        onClose={previewDisclosure.close}
        open={previewDisclosure.isOpen}
        title="Core Service Pillars API Preview"
      />
    </>
  );
};
