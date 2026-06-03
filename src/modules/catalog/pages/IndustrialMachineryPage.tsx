import { z } from 'zod';
import { RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { categoriesApi, productsApi } from '@/services/api/catalog';
import {
  createIndustrialMachineryCategory,
  createIndustrialMachineryFeature,
  createIndustrialMachineryMachine,
  createIndustrialMachineryWhyChooseUsItem,
  deleteIndustrialMachineryCategory,
  deleteIndustrialMachineryFeature,
  deleteIndustrialMachineryMachine,
  deleteIndustrialMachineryWhyChooseUsItem,
  getIndustrialMachineryCategories,
  getIndustrialMachineryContent,
  getIndustrialMachineryFeatures,
  getIndustrialMachineryMachines,
  getIndustrialMachineryWhyChooseUsItems,
  updateIndustrialMachineryCategory,
  updateIndustrialMachineryContent,
  updateIndustrialMachineryFeature,
  updateIndustrialMachineryMachine,
  updateIndustrialMachineryWhyChooseUsItem,
} from '@/services/api/industrialMachinery';
import { IndustrialMachineryCollectionManager } from '@/modules/catalog/components/IndustrialMachineryCollectionManager';
import { IndustrialMachineryContentForm } from '@/modules/catalog/components/IndustrialMachineryContentForm';
import { IndustrialMachineryMachinesManager } from '@/modules/catalog/components/IndustrialMachineryMachinesManager';
import type {
  AdminCatalogReference,
  AdminProductReference,
  IndustrialMachineryCategory,
  IndustrialMachineryCategoryFormValues,
  IndustrialMachineryContentFormValues,
  IndustrialMachineryFeature,
  IndustrialMachineryFeatureFormValues,
  IndustrialMachineryMachine,
  IndustrialMachineryMachineFormValues,
  IndustrialMachineryPageResponse,
  IndustrialMachineryWhyChooseUsItem,
  IndustrialMachineryWhyChooseUsItemFormValues,
} from '@/modules/catalog/types/industrialMachinery';
import { getErrorMessage } from '@/utils/error';
import type { FieldConfig } from '@/types/resources';

type ActiveTab = 'content' | 'features' | 'categories' | 'machines' | 'why-choose-us';

type SavingState = {
  content: boolean;
  features: boolean;
  categories: boolean;
  machines: boolean;
  whyChooseUs: boolean;
};

const tabOptions: Array<{ id: ActiveTab; label: string; description: string }> = [
  { id: 'content', label: 'Page Content', description: 'Hero, section headings, and CTA content.' },
  { id: 'features', label: 'Features Manager', description: 'Feature cards with icons, order, and active state.' },
  { id: 'categories', label: 'Categories Manager', description: 'Industrial machinery categories linked to master catalog categories.' },
  { id: 'machines', label: 'Machinery Items', description: 'Machinery cards with category, product, and image support.' },
  { id: 'why-choose-us', label: 'Why Choose Us', description: 'Trust-building items with icons and ordering.' },
];

const defaultSavingState: SavingState = {
  content: false,
  features: false,
  categories: false,
  machines: false,
  whyChooseUs: false,
};

const iconOptions = [
  { label: 'Settings', value: 'settings' },
  { label: 'Package', value: 'package' },
  { label: 'Shield Check', value: 'shield-check' },
  { label: 'Wrench', value: 'wrench' },
  { label: 'Award', value: 'award' },
  { label: 'Map Pin', value: 'map-pin' },
  { label: 'Tag', value: 'tag' },
];

const featureSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  icon: z.string().trim().min(1, 'Icon is required.'),
  display_order: z.coerce.number().int().min(1, 'Display order must be at least 1.'),
  is_active: z.boolean().default(true),
});

const categorySchema = z.object({
  source_category_id: z.string(),
  name: z.string().trim().min(1, 'Category name is required.'),
  slug: z.string().trim().min(1, 'Slug is required.'),
  display_order: z.coerce.number().int().min(1, 'Display order must be at least 1.'),
  is_active: z.boolean().default(true),
});

const whyChooseUsSchema = featureSchema;

const featureDefaultValues: IndustrialMachineryFeatureFormValues = {
  title: '',
  description: '',
  icon: 'settings',
  display_order: 1,
  is_active: true,
};

const categoryDefaultValues: IndustrialMachineryCategoryFormValues = {
  source_category_id: '',
  name: '',
  slug: '',
  display_order: 1,
  is_active: true,
};

const whyChooseUsDefaultValues: IndustrialMachineryWhyChooseUsItemFormValues = {
  title: '',
  description: '',
  icon: 'award',
  display_order: 1,
  is_active: true,
};

const toRecord = (value: unknown) =>
  (typeof value === 'object' && value ? value : {}) as Record<string, unknown>;

const toString = (value: unknown) => (value === null || value === undefined ? '' : String(value));

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

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveMachineId = (item: Record<string, unknown>) =>
  toNumber(
    item.industrial_machinery_item_id ??
      item.industrial_machinery_machine_id ??
      item.machinery_id ??
      item.machine_id ??
      item.id,
  );

const normalizeFeature = (value: unknown): IndustrialMachineryFeature => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    title: toString(item.title),
    description: toString(item.description),
    icon: toString(item.icon),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
  };
};

const normalizeCategory = (value: unknown): IndustrialMachineryCategory => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    source_category_id:
      item.source_category_id === null || item.source_category_id === undefined || item.source_category_id === ''
        ? null
        : toNumber(item.source_category_id),
    name: toString(item.name),
    slug: toString(item.slug),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
  };
};

const normalizeMachine = (value: unknown): IndustrialMachineryMachine => {
  const item = toRecord(value);

  return {
    id: resolveMachineId(item),
    product_id:
      item.product_id === null || item.product_id === undefined || item.product_id === ''
        ? null
        : toNumber(item.product_id),
    category_id: toNumber(item.category_id),
    title: toString(item.title),
    description: toString(item.description),
    image_url: toString(item.image_url),
    tag_text: toString(item.tag_text),
    capacity: toString(item.capacity),
    automation: toString(item.automation),
    view_details_text: toString(item.view_details_text),
    view_details_link: toString(item.view_details_link),
    quote_text: toString(item.quote_text),
    quote_link: toString(item.quote_link),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
    product: typeof item.product === 'object' && item.product ? (item.product as Record<string, unknown>) : null,
    category: typeof item.category === 'object' && item.category ? (item.category as Record<string, unknown>) : null,
  };
};

const normalizeWhyChooseUsItem = (value: unknown): IndustrialMachineryWhyChooseUsItem => {
  const item = toRecord(value);

  return {
    id: toNumber(item.id),
    title: toString(item.title),
    description: toString(item.description),
    icon: toString(item.icon),
    display_order: toNumber(item.display_order, 1),
    is_active: toBoolean(item.is_active),
  };
};

const normalizeAdminCategory = (value: Record<string, unknown>): AdminCatalogReference => ({
  id: toNumber(value.id),
  name: toString(value.name),
  slug: toString(value.slug),
});

const normalizeAdminProduct = (value: Record<string, unknown>): AdminProductReference => ({
  id: toNumber(value.id),
  name: toString(value.name),
  slug: toString(value.slug),
  category_id:
    value.category_id === null || value.category_id === undefined || value.category_id === ''
      ? null
      : toNumber(value.category_id),
  image_url: value.image_url ? toString(value.image_url) : value.image ? toString(value.image) : null,
  image: value.image ? toString(value.image) : null,
});

const buildContentPayload = (values: IndustrialMachineryContentFormValues) => {
  const basePayload = {
    hero_badge_text: values.hero_badge_text.trim(),
    hero_badge_icon: values.hero_badge_icon.trim(),
    hero_title: values.hero_title.trim(),
    hero_subtitle: values.hero_subtitle.trim(),
    hero_primary_cta_text: values.hero_primary_cta_text.trim(),
    hero_primary_cta_link: values.hero_primary_cta_link.trim(),
    hero_secondary_cta_text: values.hero_secondary_cta_text.trim(),
    hero_secondary_cta_link: values.hero_secondary_cta_link.trim(),
    hero_background_image_url:
      typeof values.background_image === 'string' ? values.background_image.trim() : '',
    features_section_title: values.features_section_title.trim(),
    features_section_subtitle: values.features_section_subtitle.trim(),
    catalog_section_title: values.catalog_section_title.trim(),
    catalog_section_subtitle: values.catalog_section_subtitle.trim(),
    why_choose_us_section_title: values.why_choose_us_section_title.trim(),
    why_choose_us_section_subtitle: values.why_choose_us_section_subtitle.trim(),
    cta_section_title: values.cta_section_title.trim(),
    cta_section_subtitle: values.cta_section_subtitle.trim(),
    cta_primary_cta_text: values.cta_primary_cta_text.trim(),
    cta_primary_cta_link: values.cta_primary_cta_link.trim(),
    is_active: values.is_active ? 1 : 0,
  };

  if (!(values.background_image instanceof File)) {
    return basePayload;
  }

  const payload = new FormData();
  Object.entries(basePayload).forEach(([key, value]) => {
    payload.append(key, String(value));
  });
  payload.append('background_image', values.background_image);
  return payload;
};

const buildFeaturePayload = (values: IndustrialMachineryFeatureFormValues) => ({
  title: values.title.trim(),
  description: values.description.trim(),
  icon: values.icon.trim(),
  display_order: Number(values.display_order),
  is_active: values.is_active,
});

const buildCategoryPayload = (values: IndustrialMachineryCategoryFormValues) => ({
  source_category_id: values.source_category_id ? Number(values.source_category_id) : null,
  name: values.name.trim(),
  slug: values.slug.trim(),
  display_order: Number(values.display_order),
  is_active: values.is_active,
});

const buildMachinePayload = (values: IndustrialMachineryMachineFormValues) => {
  const productId = values.product_id ? Number(values.product_id) : null;
  const basePayload = {
    product_id: productId,
    category_id: Number(values.category_id),
    title: values.title.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim(),
    tag_text: values.tag_text.trim(),
    capacity: values.capacity.trim(),
    automation: values.automation.trim(),
    view_details_text: values.view_details_text.trim(),
    view_details_link: values.view_details_link.trim(),
    quote_text: values.quote_text.trim(),
    quote_link: values.quote_link.trim(),
    display_order: Number(values.display_order),
    is_active: values.is_active,
  };

  if (!(values.image instanceof File)) {
    return basePayload;
  }

  const payload = new FormData();
  payload.append('product_id', productId ? String(productId) : '');
  payload.append('category_id', String(basePayload.category_id));
  payload.append('title', basePayload.title);
  payload.append('description', basePayload.description);
  payload.append('image_url', basePayload.image_url);
  payload.append('tag_text', basePayload.tag_text);
  payload.append('capacity', basePayload.capacity);
  payload.append('automation', basePayload.automation);
  payload.append('view_details_text', basePayload.view_details_text);
  payload.append('view_details_link', basePayload.view_details_link);
  payload.append('quote_text', basePayload.quote_text);
  payload.append('quote_link', basePayload.quote_link);
  payload.append('display_order', String(basePayload.display_order));
  payload.append('is_active', String(Number(basePayload.is_active)));
  payload.append('image', values.image);
  return payload;
};

export const IndustrialMachineryPage = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('content');
  const [content, setContent] = useState<IndustrialMachineryPageResponse | null>(null);
  const [features, setFeatures] = useState<IndustrialMachineryFeature[]>([]);
  const [categories, setCategories] = useState<IndustrialMachineryCategory[]>([]);
  const [machines, setMachines] = useState<IndustrialMachineryMachine[]>([]);
  const [whyChooseUsItems, setWhyChooseUsItems] = useState<IndustrialMachineryWhyChooseUsItem[]>([]);
  const [masterCategories, setMasterCategories] = useState<AdminCatalogReference[]>([]);
  const [products, setProducts] = useState<AdminProductReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingState, setSavingState] = useState<SavingState>(defaultSavingState);
  const [error, setError] = useState<string | null>(null);

  const setSaving = (key: keyof SavingState, value: boolean) => {
    setSavingState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const loadFeatures = async () => {
    const response = await getIndustrialMachineryFeatures();
    setFeatures(response.items.map((item) => normalizeFeature(item)));
  };

  const loadCategories = async () => {
    const response = await getIndustrialMachineryCategories();
    setCategories(response.items.map((item) => normalizeCategory(item)));
  };

  const loadMachines = async () => {
    const response = await getIndustrialMachineryMachines();
    setMachines(response.items.map((item) => normalizeMachine(item)));
  };

  const loadWhyChooseUsItems = async () => {
    const response = await getIndustrialMachineryWhyChooseUsItems();
    setWhyChooseUsItems(response.items.map((item) => normalizeWhyChooseUsItem(item)));
  };

  const loadPage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        contentResponse,
        featuresResponse,
        categoriesResponse,
        machinesResponse,
        whyChooseUsResponse,
        masterCategoriesResponse,
        productsResponse,
      ] = await Promise.all([
        getIndustrialMachineryContent(),
        getIndustrialMachineryFeatures(),
        getIndustrialMachineryCategories(),
        getIndustrialMachineryMachines(),
        getIndustrialMachineryWhyChooseUsItems(),
        categoriesApi.list(),
        productsApi.list(),
      ]);

      setContent(contentResponse);
      setFeatures(featuresResponse.items.map((item) => normalizeFeature(item)));
      setCategories(categoriesResponse.items.map((item) => normalizeCategory(item)));
      setMachines(machinesResponse.items.map((item) => normalizeMachine(item)));
      setWhyChooseUsItems(whyChooseUsResponse.items.map((item) => normalizeWhyChooseUsItem(item)));
      setMasterCategories(masterCategoriesResponse.items.map((item) => normalizeAdminCategory(item)));
      setProducts(productsResponse.items.map((item) => normalizeAdminProduct(item)));
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load Industrial Machinery CMS data.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const masterCategoryOptions = useMemo(
    () =>
      masterCategories.map((category) => ({
        label: `${category.name} (${category.slug})`,
        value: String(category.id),
      })),
    [masterCategories],
  );

  const featureFields: FieldConfig[] = useMemo(
    () => [
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 4, colSpan: 2 },
      { name: 'icon', label: 'Icon', type: 'select', required: true, options: iconOptions },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, placeholder: '1' },
      { name: 'is_active', label: 'Is Active', type: 'switch' },
    ],
    [],
  );

  const categoryFields: FieldConfig[] = useMemo(
    () => [
      {
        name: 'source_category_id',
        label: 'Source Category',
        type: 'select',
        options: masterCategoryOptions,
        description: 'Optional link back to an existing master catalog category.',
        colSpan: 2,
      },
      { name: 'name', label: 'Category Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, placeholder: '1' },
      { name: 'is_active', label: 'Is Active', type: 'switch' },
    ],
    [masterCategoryOptions],
  );

  const whyChooseUsFields: FieldConfig[] = featureFields;

  const saveContent = async (values: IndustrialMachineryContentFormValues) => {
    setSaving('content', true);

    try {
      const response = await updateIndustrialMachineryContent(buildContentPayload(values));
      setContent(response);
      showToast({
        title: 'Industrial Machinery content updated',
        description: 'Hero, section headings, and the CTA block were saved successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to save page content',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('content', false);
    }
  };

  const createFeature = async (values: IndustrialMachineryFeatureFormValues) => {
    setSaving('features', true);

    try {
      await createIndustrialMachineryFeature(buildFeaturePayload(values));
      await loadFeatures();
      showToast({
        title: 'Feature created',
        description: 'The Industrial Machinery feature card was added successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to create feature',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('features', false);
    }
  };

  const updateFeature = async (item: IndustrialMachineryFeature, values: IndustrialMachineryFeatureFormValues) => {
    setSaving('features', true);

    try {
      await updateIndustrialMachineryFeature(item.id, buildFeaturePayload(values));
      await loadFeatures();
      showToast({
        title: 'Feature updated',
        description: 'The Industrial Machinery feature card was updated successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to update feature',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('features', false);
    }
  };

  const toggleFeature = async (item: IndustrialMachineryFeature) => {
    await updateFeature(item, {
      title: item.title,
      description: item.description,
      icon: item.icon,
      display_order: item.display_order,
      is_active: !item.is_active,
    });
  };

  const removeFeature = async (item: IndustrialMachineryFeature) => {
    setSaving('features', true);

    try {
      await deleteIndustrialMachineryFeature(item.id);
      await loadFeatures();
      showToast({
        title: 'Feature deleted',
        description: `${item.title} was removed successfully.`,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to delete feature',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('features', false);
    }
  };

  const createCategory = async (values: IndustrialMachineryCategoryFormValues) => {
    setSaving('categories', true);

    try {
      await createIndustrialMachineryCategory(buildCategoryPayload(values));
      await loadCategories();
      showToast({
        title: 'Category created',
        description: 'The Industrial Machinery category was added successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to create category',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('categories', false);
    }
  };

  const updateCategory = async (item: IndustrialMachineryCategory, values: IndustrialMachineryCategoryFormValues) => {
    setSaving('categories', true);

    try {
      await updateIndustrialMachineryCategory(item.id, buildCategoryPayload(values));
      await loadCategories();
      showToast({
        title: 'Category updated',
        description: 'The Industrial Machinery category was updated successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to update category',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('categories', false);
    }
  };

  const toggleCategory = async (item: IndustrialMachineryCategory) => {
    await updateCategory(item, {
      source_category_id: item.source_category_id ? String(item.source_category_id) : '',
      name: item.name,
      slug: item.slug,
      display_order: item.display_order,
      is_active: !item.is_active,
    });
  };

  const removeCategory = async (item: IndustrialMachineryCategory) => {
    setSaving('categories', true);

    try {
      await deleteIndustrialMachineryCategory(item.id);
      await loadCategories();
      showToast({
        title: 'Category deleted',
        description: `${item.name} was removed successfully.`,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to delete category',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('categories', false);
    }
  };

  const createMachine = async (values: IndustrialMachineryMachineFormValues) => {
    setSaving('machines', true);

    try {
      await createIndustrialMachineryMachine(buildMachinePayload(values));
      await loadMachines();
      showToast({
        title: 'Machinery item created',
        description: 'The machinery card was added successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to create machinery item',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('machines', false);
    }
  };

  const updateMachine = async (item: IndustrialMachineryMachine, values: IndustrialMachineryMachineFormValues) => {
    setSaving('machines', true);

    try {
      await updateIndustrialMachineryMachine(item.id, buildMachinePayload(values));
      await loadMachines();
      showToast({
        title: 'Machinery item updated',
        description: 'The machinery card was updated successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to update machinery item',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('machines', false);
    }
  };

  const toggleMachine = async (item: IndustrialMachineryMachine) => {
    await updateMachine(item, {
      product_id: item.product_id ? String(item.product_id) : '',
      category_id: String(item.category_id),
      title: item.title,
      description: item.description,
      image: null,
      image_url: item.image_url,
      tag_text: item.tag_text,
      capacity: item.capacity,
      automation: item.automation,
      view_details_text: item.view_details_text,
      view_details_link: item.view_details_link,
      quote_text: item.quote_text,
      quote_link: item.quote_link,
      display_order: item.display_order,
      is_active: !item.is_active,
    });
  };

  const removeMachine = async (item: IndustrialMachineryMachine) => {
    if (!item.id) {
      showToast({
        title: 'Unable to delete machinery item',
        description: 'This machinery item is missing a valid ID. Please refresh the page and try again.',
        tone: 'error',
      });
      return false;
    }

    setSaving('machines', true);

    try {
      await deleteIndustrialMachineryMachine(item.id);
      setMachines((currentMachines) =>
        currentMachines.filter((machine) => String(machine.id) !== String(item.id)),
      );
      showToast({
        title: 'Machinery item deleted',
        description: `${item.title} was removed successfully.`,
        tone: 'success',
      });
      return true;
    } catch (submitError) {
      showToast({
        title: 'Unable to delete machinery item',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
      return false;
    } finally {
      setSaving('machines', false);
    }
  };

  const createWhyChooseUsItem = async (values: IndustrialMachineryWhyChooseUsItemFormValues) => {
    setSaving('whyChooseUs', true);

    try {
      await createIndustrialMachineryWhyChooseUsItem(buildFeaturePayload(values));
      await loadWhyChooseUsItems();
      showToast({
        title: 'Why Choose Us item created',
        description: 'The trust-building item was added successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to create Why Choose Us item',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('whyChooseUs', false);
    }
  };

  const updateWhyChooseUsItem = async (
    item: IndustrialMachineryWhyChooseUsItem,
    values: IndustrialMachineryWhyChooseUsItemFormValues,
  ) => {
    setSaving('whyChooseUs', true);

    try {
      await updateIndustrialMachineryWhyChooseUsItem(item.id, buildFeaturePayload(values));
      await loadWhyChooseUsItems();
      showToast({
        title: 'Why Choose Us item updated',
        description: 'The trust-building item was updated successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to update Why Choose Us item',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('whyChooseUs', false);
    }
  };

  const toggleWhyChooseUsItem = async (item: IndustrialMachineryWhyChooseUsItem) => {
    await updateWhyChooseUsItem(item, {
      title: item.title,
      description: item.description,
      icon: item.icon,
      display_order: item.display_order,
      is_active: !item.is_active,
    });
  };

  const removeWhyChooseUsItem = async (item: IndustrialMachineryWhyChooseUsItem) => {
    setSaving('whyChooseUs', true);

    try {
      await deleteIndustrialMachineryWhyChooseUsItem(item.id);
      await loadWhyChooseUsItems();
      showToast({
        title: 'Why Choose Us item deleted',
        description: `${item.title} was removed successfully.`,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: 'Unable to delete Why Choose Us item',
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving('whyChooseUs', false);
    }
  };

  if (error && !isLoading) {
    return <ErrorState description={error} onRetry={() => void loadPage()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button onClick={() => void loadPage()} variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
        description="Manage the complete Industrial Machinery catalog page, including page content, categories, machinery items, and trust-building sections."
        title="Industrial Machinery"
      />

      <div className="flex flex-wrap gap-3">
        {tabOptions.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              activeTab === tab.id
                ? 'border-brand-400 bg-brand-50 text-brand-800'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">{tab.label}</span>
              {activeTab === tab.id ? <Badge tone="info">Active</Badge> : null}
            </div>
            <p className="mt-1 text-sm opacity-80">{tab.description}</p>
          </button>
        ))}
      </div>

      {activeTab === 'content' ? (
        <IndustrialMachineryContentForm
          data={content}
          isLoading={isLoading}
          isSaving={savingState.content}
          onSubmit={(values) => void saveContent(values)}
        />
      ) : null}

      {activeTab === 'features' ? (
        <IndustrialMachineryCollectionManager
          addLabel="Add Feature"
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'icon', label: 'Icon', render: (item) => <Badge tone="info">{item.icon}</Badge> },
            { key: 'description', label: 'Description' },
            { key: 'display_order', label: 'Order' },
            {
              key: 'is_active',
              label: 'Status',
              render: (item) => (
                <Badge tone={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
              ),
            },
          ]}
          defaultValues={featureDefaultValues}
          description="Create and maintain the Industrial Machinery feature cards rendered beneath the hero section."
          emptyState={{
            title: 'No feature cards yet',
            description: 'Add feature cards to populate the Industrial Machinery page.',
          }}
          entityLabel="Feature"
          fields={featureFields}
          isLoading={isLoading}
          isSaving={savingState.features}
          items={features}
          mapItemToFormValues={(item) => ({
            title: item.title,
            description: item.description,
            icon: item.icon,
            display_order: item.display_order,
            is_active: item.is_active,
          })}
          onCreate={(values) => void createFeature(values)}
          onDelete={(item) => void removeFeature(item)}
          onToggle={(item) => void toggleFeature(item)}
          onUpdate={(item, values) => void updateFeature(item, values)}
          schema={featureSchema}
          title="Features Manager"
        />
      ) : null}

      {activeTab === 'categories' ? (
        <IndustrialMachineryCollectionManager
          addLabel="Add Category"
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'slug', label: 'Slug' },
            {
              key: 'source_category_id',
              label: 'Source Category',
              render: (item) => {
                const linked = masterCategories.find((category) => category.id === item.source_category_id);
                return linked ? <Badge tone="info">{linked.name}</Badge> : <span className="text-slate-400">Manual only</span>;
              },
            },
            { key: 'display_order', label: 'Order' },
            {
              key: 'is_active',
              label: 'Status',
              render: (item) => (
                <Badge tone={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
              ),
            },
          ]}
          defaultValues={categoryDefaultValues}
          description="Manage Industrial Machinery categories and optionally map each one to an existing master catalog category."
          emptyState={{
            title: 'No industrial categories yet',
            description: 'Add at least one category before creating machinery items.',
          }}
          entityLabel="Category"
          fields={categoryFields}
          footerNote="Manual name and slug editing stays available even when a source category is linked."
          isLoading={isLoading}
          isSaving={savingState.categories}
          items={categories}
          mapItemToFormValues={(item) => ({
            source_category_id: item.source_category_id ? String(item.source_category_id) : '',
            name: item.name,
            slug: item.slug,
            display_order: item.display_order,
            is_active: item.is_active,
          })}
          onCreate={(values) => void createCategory(values)}
          onDelete={(item) => void removeCategory(item)}
          onToggle={(item) => void toggleCategory(item)}
          onUpdate={(item, values) => void updateCategory(item, values)}
          schema={categorySchema}
          title="Categories Manager"
        />
      ) : null}

      {activeTab === 'machines' ? (
        <IndustrialMachineryMachinesManager
          categories={categories}
          isLoading={isLoading}
          isSaving={savingState.machines}
          items={machines}
          onCreate={(values) => void createMachine(values)}
          onDelete={(item) => removeMachine(item)}
          onToggle={(item) => void toggleMachine(item)}
          onUpdate={(item, values) => void updateMachine(item, values)}
          products={products}
        />
      ) : null}

      {activeTab === 'why-choose-us' ? (
        <IndustrialMachineryCollectionManager
          addLabel="Add Why Choose Us Item"
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'icon', label: 'Icon', render: (item) => <Badge tone="info">{item.icon}</Badge> },
            { key: 'description', label: 'Description' },
            { key: 'display_order', label: 'Order' },
            {
              key: 'is_active',
              label: 'Status',
              render: (item) => (
                <Badge tone={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
              ),
            },
          ]}
          defaultValues={whyChooseUsDefaultValues}
          description="Maintain the reasons-to-trust cards shown above the closing CTA section."
          emptyState={{
            title: 'No Why Choose Us items yet',
            description: 'Add trust-building items to strengthen the public page messaging.',
          }}
          entityLabel="Why Choose Us Item"
          fields={whyChooseUsFields}
          isLoading={isLoading}
          isSaving={savingState.whyChooseUs}
          items={whyChooseUsItems}
          mapItemToFormValues={(item) => ({
            title: item.title,
            description: item.description,
            icon: item.icon,
            display_order: item.display_order,
            is_active: item.is_active,
          })}
          onCreate={(values) => void createWhyChooseUsItem(values)}
          onDelete={(item) => void removeWhyChooseUsItem(item)}
          onToggle={(item) => void toggleWhyChooseUsItem(item)}
          onUpdate={(item, values) => void updateWhyChooseUsItem(item, values)}
          schema={whyChooseUsSchema}
          title="Why Choose Us Manager"
        />
      ) : null}
    </div>
  );
};
