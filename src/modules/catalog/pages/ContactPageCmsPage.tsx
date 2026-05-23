import { RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/ToastProvider';
import { Button } from '@/components/ui/Button';
import { CatalogCollectionManager } from '@/modules/catalog/components/CatalogCollectionManager';
import { ProjectsSectionForm } from '@/modules/catalog/components/ProjectsSectionForm';
import type {
  ContactPageCollectionItem,
  ContactPageContentResponse,
  ContactPageSectionRecord,
} from '@/modules/catalog/types/contactPage';
import {
  createContactCard,
  createDepartment,
  createOfficeInfoCard,
  createServiceOption,
  createTrustHighlight,
  deleteContactCard,
  deleteDepartment,
  deleteOfficeInfoCard,
  deleteServiceOption,
  deleteTrustHighlight,
  getContactPageContent,
  reorderContactCards,
  reorderDepartments,
  reorderOfficeInfoCards,
  reorderServiceOptions,
  reorderTrustHighlights,
  toggleContactCard,
  toggleDepartment,
  toggleOfficeInfoCard,
  toggleServiceOption,
  toggleTrustHighlight,
  updateContactCard,
  updateContactCardsSection,
  updateContactFormSection,
  updateContactPageHero,
  updateDepartment,
  updateDepartmentsSection,
  updateOfficeInfoCard,
  updateOfficeMap,
  updateOfficeSection,
  updateServiceOption,
  updateTrustHighlight,
} from '@/services/api/contactPage';
import type { FieldConfig } from '@/types/resources';
import { getErrorMessage } from '@/utils/error';
import { createDefaultValuesFromFields, createSchemaFromFields, normalizeFieldValue } from '@/utils/schema';

type SingletonSectionKey =
  | 'hero_section'
  | 'contact_cards_section'
  | 'departments_section'
  | 'form_section'
  | 'office_section'
  | 'office_map';

type CollectionSectionKey =
  | 'contact_cards'
  | 'departments'
  | 'service_options'
  | 'trust_highlights'
  | 'office_info_cards';

type SectionConfig = {
  key: SingletonSectionKey;
  title: string;
  description: string;
  submitLabel: string;
  fallbackFields: FieldConfig[];
};

type CollectionConfig = {
  key: CollectionSectionKey;
  title: string;
  description: string;
  entityLabel: string;
  addLabel: string;
  excludedFieldNames?: string[];
  emptyState: {
    title: string;
    description: string;
  };
  fallbackFields: FieldConfig[];
};

const hiddenKeys = new Set(['id', 'created_at', 'updated_at', 'deleted_at']);
const fileFieldPattern = /(image|photo|logo|avatar|thumbnail|banner|background|poster|cover)$/i;
const linkFieldPattern = /(link|url)$/i;
const arrayFieldPattern = /(lines|items|points|highlights|benefits|bullets|tags)$/i;
const emailFieldPattern = /email/i;

const singletonSectionConfigs: SectionConfig[] = [
  {
    key: 'hero_section',
    title: 'Hero Section',
    description: 'Manage the Contact page hero content, CTA links, and featured image.',
    submitLabel: 'Save Hero Section',
    fallbackFields: [
      { name: 'badge_text', label: 'Badge Text', type: 'text' },
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'primary_cta_text', label: 'Primary CTA Text', type: 'text' },
      { name: 'primary_cta_link', label: 'Primary CTA Link', type: 'text', placeholder: '/contact' },
      { name: 'secondary_cta_text', label: 'Secondary CTA Text', type: 'text' },
      { name: 'secondary_cta_link', label: 'Secondary CTA Link', type: 'text', placeholder: '/catalog' },
      { name: 'background_image', label: 'Background Image', type: 'file', accept: 'image/*', colSpan: 2 },
      { name: 'image', label: 'Hero Image', type: 'file', accept: 'image/*', colSpan: 2 },
      { name: 'image_alt', label: 'Image Alt Text', type: 'text', colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'contact_cards_section',
    title: 'Contact Cards Section',
    description: 'Edit the intro content that appears above the contact cards repeater.',
    submitLabel: 'Save Contact Cards Section',
    fallbackFields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'departments_section',
    title: 'Departments Section',
    description: 'Manage the section heading and supporting copy for department contacts.',
    submitLabel: 'Save Departments Section',
    fallbackFields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'helper_text', label: 'Helper Text', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'form_section',
    title: 'Form Section',
    description: 'Control the inquiry form copy, field labels, placeholders, and submit messaging.',
    submitLabel: 'Save Form Section',
    fallbackFields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'name_label', label: 'Name Label', type: 'text' },
      { name: 'name_placeholder', label: 'Name Placeholder', type: 'text' },
      { name: 'email_label', label: 'Email Label', type: 'text' },
      { name: 'email_placeholder', label: 'Email Placeholder', type: 'text' },
      { name: 'phone_label', label: 'Phone Label', type: 'text' },
      { name: 'phone_placeholder', label: 'Phone Placeholder', type: 'text' },
      { name: 'company_label', label: 'Company Label', type: 'text' },
      { name: 'company_placeholder', label: 'Company Placeholder', type: 'text' },
      { name: 'service_label', label: 'Service Label', type: 'text' },
      { name: 'service_placeholder', label: 'Service Placeholder', type: 'text' },
      { name: 'message_label', label: 'Message Label', type: 'text' },
      { name: 'message_placeholder', label: 'Message Placeholder', type: 'text' },
      { name: 'submit_button_text', label: 'Submit Button Text', type: 'text' },
      { name: 'success_message', label: 'Success Message', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'error_message', label: 'Error Message', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'privacy_note', label: 'Privacy Note', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'office_section',
    title: 'Office Section',
    description: 'Manage the office visit section content and supporting copy.',
    submitLabel: 'Save Office Section',
    fallbackFields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'office_map',
    title: 'Office Map',
    description: 'Update the Google Maps embed URL and any supporting office map text.',
    submitLabel: 'Save Office Map',
    fallbackFields: [
      {
        name: 'embed_url',
        label: 'Google Maps Embed URL',
        type: 'text',
        required: true,
        colSpan: 2,
        placeholder: 'https://www.google.com/maps/embed?...',
      },
      { name: 'map_title', label: 'Map Title', type: 'text', colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
];

const collectionConfigs: CollectionConfig[] = [
  {
    key: 'contact_cards',
    title: 'Contact Cards',
    description: 'Manage the quick contact cards, icon slugs, links, lines, and ordering.',
    entityLabel: 'Contact Card',
    addLabel: 'Add Contact Card',
    emptyState: {
      title: 'No contact cards yet',
      description: 'Add the primary contact cards that should appear on the Contact page.',
    },
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'icon', label: 'Icon Slug', type: 'text', placeholder: 'phone-call' },
      { name: 'link_label', label: 'Link Label', type: 'text' },
      { name: 'link_url', label: 'Link URL', type: 'text', placeholder: 'tel:+919876543210' },
      { name: 'lines', label: 'Lines', type: 'arrayText', itemLabel: 'Line', addLabel: 'Add Line', colSpan: 2 },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'departments',
    title: 'Departments',
    description: 'Manage department contact cards, including icon slugs, contact info, lines, and ordering.',
    entityLabel: 'Department',
    addLabel: 'Add Department',
    emptyState: {
      title: 'No departments yet',
      description: 'Add department-specific contacts for the Contact page.',
    },
    fallbackFields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'icon', label: 'Icon Slug', type: 'text', placeholder: 'headset' },
      { name: 'email', label: 'Email', type: 'email', validation: { email: true } },
      { name: 'phone', label: 'Phone', type: 'text', placeholder: '+91 98765 43210' },
      { name: 'cta_text', label: 'CTA Text', type: 'text' },
      { name: 'cta_link', label: 'CTA Link', type: 'text', placeholder: 'mailto:support@example.com' },
      { name: 'lines', label: 'Lines', type: 'arrayText', itemLabel: 'Line', addLabel: 'Add Line', colSpan: 2 },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'service_options',
    title: 'Service Options',
    description: 'Manage inquiry service choices used by the contact form selector.',
    entityLabel: 'Service Option',
    addLabel: 'Add Service Option',
    emptyState: {
      title: 'No service options yet',
      description: 'Add service options for the inquiry form dropdown.',
    },
    fallbackFields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'value', label: 'Value', type: 'text', required: true, placeholder: 'laboratory-infrastructure' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'icon', label: 'Icon Slug', type: 'text', placeholder: 'flask-conical' },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'trust_highlights',
    title: 'Trust Highlights',
    description: 'Manage trust-building highlights shown near the inquiry form.',
    entityLabel: 'Trust Highlight',
    addLabel: 'Add Trust Highlight',
    emptyState: {
      title: 'No trust highlights yet',
      description: 'Add trust signals that reinforce the contact form section.',
    },
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'icon', label: 'Icon Slug', type: 'text', placeholder: 'badge-check' },
      { name: 'lines', label: 'Lines', type: 'arrayText', itemLabel: 'Line', addLabel: 'Add Line', colSpan: 2 },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'office_info_cards',
    title: 'Office Info Cards',
    description: 'Manage the office information cards, links, lines, status, and ordering.',
    entityLabel: 'Office Info Card',
    addLabel: 'Add Office Info Card',
    excludedFieldNames: ['link_label', 'link_url'],
    emptyState: {
      title: 'No office info cards yet',
      description: 'Add office information cards for location, visiting hours, and contact details.',
    },
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'icon', label: 'Icon Slug', type: 'text', placeholder: 'map-pin' },
      { name: 'lines', label: 'Lines', type: 'arrayText', itemLabel: 'Line', addLabel: 'Add Line', colSpan: 2 },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
];

const singletonUpdaters: Record<SingletonSectionKey, (payload: Record<string, unknown>) => Promise<unknown>> = {
  hero_section: updateContactPageHero,
  contact_cards_section: updateContactCardsSection,
  departments_section: updateDepartmentsSection,
  form_section: updateContactFormSection,
  office_section: updateOfficeSection,
  office_map: updateOfficeMap,
};

const collectionActions = {
  contact_cards: {
    create: createContactCard,
    update: updateContactCard,
    remove: deleteContactCard,
    reorder: reorderContactCards,
    toggle: toggleContactCard,
  },
  departments: {
    create: createDepartment,
    update: updateDepartment,
    remove: deleteDepartment,
    reorder: reorderDepartments,
    toggle: toggleDepartment,
  },
  service_options: {
    create: createServiceOption,
    update: updateServiceOption,
    remove: deleteServiceOption,
    reorder: reorderServiceOptions,
    toggle: toggleServiceOption,
  },
  trust_highlights: {
    create: createTrustHighlight,
    update: updateTrustHighlight,
    remove: deleteTrustHighlight,
    reorder: reorderTrustHighlights,
    toggle: toggleTrustHighlight,
  },
  office_info_cards: {
    create: createOfficeInfoCard,
    update: updateOfficeInfoCard,
    remove: deleteOfficeInfoCard,
    reorder: reorderOfficeInfoCards,
    toggle: toggleOfficeInfoCard,
  },
} as const;

const toRecord = (value: unknown): Record<string, unknown> =>
  (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;

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

const humanizeKey = (value: string) =>
  value
    .split('_')
    .map((segment) => {
      const upper = segment.toUpperCase();
      if (['CTA', 'URL', 'ID'].includes(upper)) {
        return upper;
      }

      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(' ');

const inferFieldType = (key: string, value: unknown): FieldConfig['type'] => {
  if (key === 'is_active') {
    return 'switch';
  }

  if (key === 'display_order' || typeof value === 'number') {
    return 'number';
  }

  if (Array.isArray(value)) {
    return value.every((item) => typeof item !== 'object' || item === null) ? 'arrayText' : 'arrayObject';
  }

  if (arrayFieldPattern.test(key)) {
    return 'arrayText';
  }

  if (linkFieldPattern.test(key)) {
    return key === 'embed_url' || fileFieldPattern.test(key) ? 'url' : 'text';
  }

  if (fileFieldPattern.test(key) && key !== 'icon') {
    return 'file';
  }

  if (typeof value === 'string' && value.length > 120) {
    return 'textarea';
  }

  if (emailFieldPattern.test(key)) {
    return 'email';
  }

  return 'text';
};

const getFieldDescription = (key: string, type: FieldConfig['type']) => {
  if (type === 'file') {
    return 'Upload new media only when you want to replace the current asset.';
  }

  if (linkFieldPattern.test(key)) {
    return key === 'embed_url'
      ? 'Use the full Google Maps embed URL shown by Google Maps.'
      : 'Relative links, mailto links, tel links, and absolute URLs are supported.';
  }

  if (key === 'icon') {
    return 'Use icon slug strings only.';
  }

  if (type === 'arrayText') {
    return 'Manage each line as an individual row.';
  }

  return undefined;
};

const buildDynamicFields = (
  fallbackFields: FieldConfig[],
  source: Record<string, unknown>,
  excludedFieldNames: string[] = [],
) => {
  const excludedKeys = new Set(excludedFieldNames);
  const sourceKeys = Object.keys(source).filter((key) => !hiddenKeys.has(key) && !excludedKeys.has(key));
  const fallbackMap = new Map(fallbackFields.map((field) => [field.name, field]));
  const orderedKeys = [
    ...fallbackFields.map((field) => field.name).filter((key) => !excludedKeys.has(key)),
    ...sourceKeys.filter((key) => {
      if (fallbackMap.has(key)) {
        return false;
      }

      if (key.endsWith('_url')) {
        const baseFieldName = key.slice(0, -4);
        const baseField = fallbackMap.get(baseFieldName);
        if (baseField?.type === 'file') {
          return false;
        }
      }

      return true;
    }),
  ];

  return orderedKeys.map((key) => {
    const fallbackField = fallbackMap.get(key);

    if (fallbackField) {
      return fallbackField;
    }

    const rawValue = source[key];
    const type = inferFieldType(key, rawValue);

    return {
      name: key,
      label: humanizeKey(key),
      type,
      colSpan: type === 'textarea' || type === 'file' || type === 'arrayText' || type === 'arrayObject' ? 2 : 1,
      rows: type === 'textarea' ? 4 : undefined,
      accept: type === 'file' ? 'image/*' : undefined,
      description: getFieldDescription(key, type),
      defaultValue: key === 'is_active' ? true : key === 'display_order' ? 1 : undefined,
      validation: type === 'email' ? { email: true } : type === 'url' ? { url: true } : undefined,
      itemLabel: type === 'arrayText' ? 'Line' : undefined,
      addLabel: type === 'arrayText' ? 'Add Line' : undefined,
    } satisfies FieldConfig;
  });
};

const buildSectionValues = (fields: FieldConfig[], section: ContactPageSectionRecord | null | undefined) => {
  const record = toRecord(section);

  return fields.reduce<Record<string, unknown>>((accumulator, field) => {
    const fallbackMediaValue =
      field.type === 'file' && typeof record[`${field.name}_url`] === 'string' ? record[`${field.name}_url`] : undefined;
    accumulator[field.name] = normalizeFieldValue(
      field,
      record[field.name] ?? fallbackMediaValue ?? field.defaultValue,
    );
    return accumulator;
  }, createDefaultValuesFromFields(fields));
};

const buildCollectionItem = (item: unknown): ContactPageCollectionItem => {
  const record = toRecord(item);

  return {
    id: Number(record.id ?? 0),
    display_order: Number(record.display_order ?? 1),
    is_active: toBoolean(record.is_active ?? true),
    ...record,
  };
};

const sanitizePayload = (fields: FieldConfig[], values: Record<string, unknown>) =>
  fields.reduce<Record<string, unknown>>((accumulator, field) => {
    const value = values[field.name];

    if (field.type === 'switch') {
      accumulator[field.name] = Boolean(value);
      return accumulator;
    }

    if (field.type === 'number') {
      accumulator[field.name] = Number(value ?? 0);
      return accumulator;
    }

    if (field.type === 'arrayText') {
      accumulator[field.name] = Array.isArray(value)
        ? value.map((item) => String(item ?? '').trim()).filter(Boolean)
        : typeof value === 'string'
          ? value
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          : [];
      return accumulator;
    }

    if (field.type === 'arrayObject') {
      accumulator[field.name] = Array.isArray(value) ? value : [];
      return accumulator;
    }

    if (field.type === 'file') {
      if (value instanceof File || (typeof value === 'string' && value.trim())) {
        accumulator[field.name] = value;
      }
      return accumulator;
    }

    accumulator[field.name] = value === null || value === undefined ? '' : String(value).trim();
    return accumulator;
  }, {});

const buildCollectionPayload = (
  config: CollectionConfig,
  fields: FieldConfig[],
  values: Record<string, unknown>,
  item?: ContactPageCollectionItem,
) => {
  const payload = sanitizePayload(fields, values);

  config.excludedFieldNames?.forEach((fieldName) => {
    const preservedValue = item?.[fieldName];
    payload[fieldName] =
      preservedValue === null || preservedValue === undefined ? '' : String(preservedValue);
  });

  return payload;
};

export const ContactPageCmsPage = () => {
  const { showToast } = useToast();
  const [pageData, setPageData] = useState<ContactPageContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({});

  const setSaving = (key: string, value: boolean) => {
    setSavingSections((current) => ({ ...current, [key]: value }));
  };

  const loadPage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getContactPageContent();
      setPageData(response);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load Contact Page CMS data.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const collectionItems = useMemo(
    () =>
      collectionConfigs.reduce<Record<CollectionSectionKey, ContactPageCollectionItem[]>>((accumulator, config) => {
        accumulator[config.key] = Array.isArray(pageData?.[config.key])
          ? (pageData?.[config.key] ?? []).map((item) => buildCollectionItem(item))
          : [];
        return accumulator;
      }, {} as Record<CollectionSectionKey, ContactPageCollectionItem[]>),
    [pageData],
  );

  const saveSection = async (config: SectionConfig, values: Record<string, unknown>) => {
    setSaving(config.key, true);

    try {
      const fields = buildDynamicFields(config.fallbackFields, toRecord(pageData?.[config.key]));
      await singletonUpdaters[config.key](sanitizePayload(fields, values));
      await loadPage();
      showToast({
        title: `${config.title} updated`,
        description: `${config.title} changes were saved successfully.`,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: `Unable to save ${config.title.toLowerCase()}`,
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving(config.key, false);
    }
  };

  const mutateCollection = async (
    loadingKey: string,
    action: () => Promise<unknown>,
    successTitle: string,
    successDescription: string,
    errorTitle: string,
  ) => {
    setSaving(loadingKey, true);

    try {
      await action();
      await loadPage();
      showToast({
        title: successTitle,
        description: successDescription,
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: errorTitle,
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    } finally {
      setSaving(loadingKey, false);
    }
  };

  if (error) {
    return <ErrorState description={error} onRetry={() => void loadPage()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button isLoading={isLoading} onClick={() => void loadPage()} type="button" variant="ghost">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
        description="Manage the full Catalog Contact Page with section-specific save actions, repeater CRUD, media previews, active toggles, and ordering controls."
        title="Contact Page CMS"
      />

      {singletonSectionConfigs.map((config) => {
        const fields = buildDynamicFields(config.fallbackFields, toRecord(pageData?.[config.key]));
        const values = buildSectionValues(fields, pageData?.[config.key]);

        return (
          <ProjectsSectionForm<Record<string, unknown>>
            defaultValues={createDefaultValuesFromFields(fields)}
            description={config.description}
            fields={fields}
            isLoading={isLoading}
            isSaving={Boolean(savingSections[config.key])}
            key={config.key}
            onSubmit={(submittedValues) => void saveSection(config, submittedValues)}
            schema={createSchemaFromFields(fields)}
            submitLabel={config.submitLabel}
            title={config.title}
            values={values}
          />
        );
      })}

      {collectionConfigs.map((config) => {
        const items = collectionItems[config.key];
        const inferredSource = items[0] ?? {};
        const fields = buildDynamicFields(
          config.fallbackFields,
          inferredSource,
          config.excludedFieldNames,
        ).filter((field) => field.name !== 'id');
        const defaultValues = createDefaultValuesFromFields(fields);
        const schema = createSchemaFromFields(fields);
        const actions = collectionActions[config.key];
        const savingKey = `${config.key}-saving`;

        return (
          <CatalogCollectionManager<Record<string, unknown>, ContactPageCollectionItem>
            addLabel={config.addLabel}
            defaultValues={defaultValues}
            description={config.description}
            emptyState={config.emptyState}
            entityLabel={config.entityLabel}
            fields={fields}
            isLoading={isLoading}
            isSaving={Boolean(savingSections[savingKey])}
            items={items}
            key={config.key}
            onCreate={(values) =>
              void mutateCollection(
                savingKey,
                () => actions.create(buildCollectionPayload(config, fields, values)),
                `${config.entityLabel} created`,
                `${config.entityLabel} was added successfully.`,
                `Unable to create ${config.entityLabel.toLowerCase()}`,
              )
            }
            onDelete={(item) =>
              void mutateCollection(
                savingKey,
                () => actions.remove(item.id),
                `${config.entityLabel} deleted`,
                `${config.entityLabel} was removed successfully.`,
                `Unable to delete ${config.entityLabel.toLowerCase()}`,
              )
            }
            onReorder={(item, direction) => {
              const sortedItems = [...items].sort(
                (left, right) => left.display_order - right.display_order || left.id - right.id,
              );
              const currentIndex = sortedItems.findIndex((entry) => entry.id === item.id);
              const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

              if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sortedItems.length) {
                return;
              }

              const nextItems = [...sortedItems];
              [nextItems[currentIndex], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[currentIndex]];

              void mutateCollection(
                savingKey,
                () =>
                  actions.reorder(
                    nextItems.map((entry, index) => ({
                      id: entry.id,
                      display_order: index + 1,
                    })),
                  ),
                `${config.title} reordered`,
                `${config.title} display order was updated.`,
                `Unable to reorder ${config.title.toLowerCase()}`,
              );
            }}
            onToggle={(item) =>
              void mutateCollection(
                savingKey,
                () => actions.toggle(item.id, !item.is_active),
                `${config.entityLabel} updated`,
                `${config.entityLabel} status was updated successfully.`,
                `Unable to update ${config.entityLabel.toLowerCase()}`,
              )
            }
            onUpdate={(item, values) =>
              void mutateCollection(
                savingKey,
                () => actions.update(item.id, buildCollectionPayload(config, fields, values, item)),
                `${config.entityLabel} updated`,
                `${config.entityLabel} changes were saved successfully.`,
                `Unable to update ${config.entityLabel.toLowerCase()}`,
              )
            }
            schema={schema}
            title={config.title}
          />
        );
      })}
    </div>
  );
};
