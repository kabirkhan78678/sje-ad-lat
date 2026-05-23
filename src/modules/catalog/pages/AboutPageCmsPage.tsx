import { RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/ToastProvider';
import { Button } from '@/components/ui/Button';
import { CatalogCollectionManager } from '@/modules/catalog/components/CatalogCollectionManager';
import { ProjectsSectionForm } from '@/modules/catalog/components/ProjectsSectionForm';
import type { AboutPageCollectionItem, AboutPageContentResponse, AboutPageSectionRecord } from '@/modules/catalog/types/aboutPage';
import {
  createAboutPageCertification,
  createAboutPageCoreValue,
  createAboutPageHeroStat,
  createAboutPageIntroGalleryImage,
  createAboutPageJourneyTimelineItem,
  createAboutPageLeadershipMember,
  createAboutPageWhyChooseItem,
  deleteAboutPageCertification,
  deleteAboutPageCoreValue,
  deleteAboutPageHeroStat,
  deleteAboutPageIntroGalleryImage,
  deleteAboutPageJourneyTimelineItem,
  deleteAboutPageLeadershipMember,
  deleteAboutPageWhyChooseItem,
  getAboutPageContent,
  reorderAboutPageCertifications,
  reorderAboutPageCoreValues,
  reorderAboutPageHeroStats,
  reorderAboutPageIntroGalleryImages,
  reorderAboutPageJourneyTimeline,
  reorderAboutPageLeadershipMembers,
  reorderAboutPageWhyChooseItems,
  toggleAboutPageCertification,
  toggleAboutPageCoreValue,
  toggleAboutPageHeroStat,
  toggleAboutPageIntroGalleryImage,
  toggleAboutPageJourneyTimelineItem,
  toggleAboutPageLeadershipMember,
  toggleAboutPageWhyChooseItem,
  updateAboutPageCertification,
  updateAboutPageCertificationsSection,
  updateAboutPageCoreValue,
  updateAboutPageCoreValuesSection,
  updateAboutPageCta,
  updateAboutPageHero,
  updateAboutPageHeroStat,
  updateAboutPageIntro,
  updateAboutPageIntroGalleryImage,
  updateAboutPageJourneySection,
  updateAboutPageJourneyTimelineItem,
  updateAboutPageLeadershipMember,
  updateAboutPageLeadershipSection,
  updateAboutPageMission,
  updateAboutPageVision,
  updateAboutPageWhyChooseItem,
  updateAboutPageWhyChooseSection,
} from '@/services/api/aboutPage';
import type { FieldConfig } from '@/types/resources';
import { getErrorMessage } from '@/utils/error';
import { createDefaultValuesFromFields, createSchemaFromFields, normalizeFieldValue } from '@/utils/schema';

type SingletonSectionKey =
  | 'hero_section'
  | 'intro_section'
  | 'mission_section'
  | 'vision_section'
  | 'core_values_section'
  | 'journey_section'
  | 'certifications_section'
  | 'leadership_section'
  | 'why_choose_section'
  | 'cta_section';

type CollectionSectionKey =
  | 'hero_stats'
  | 'intro_gallery_images'
  | 'core_values'
  | 'journey_timeline'
  | 'certifications'
  | 'leadership_members'
  | 'why_choose_items';

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
  emptyState: {
    title: string;
    description: string;
  };
  fallbackFields: FieldConfig[];
};

const hiddenKeys = new Set(['id', 'created_at', 'updated_at', 'deleted_at']);
const fileFieldPattern = /(image|photo|logo|avatar|thumbnail|banner|background|poster|cover)$/i;
const linkFieldPattern = /(link|url)$/i;

const singletonSectionConfigs: SectionConfig[] = [
  {
    key: 'hero_section',
    title: 'Hero Section',
    description: 'Manage hero copy, CTA links, and supporting media for the About page.',
    submitLabel: 'Save Hero Section',
    fallbackFields: [
      { name: 'badge_text', label: 'Badge Text', type: 'text' },
      { name: 'badge_icon', label: 'Badge Icon', type: 'text', placeholder: 'sparkles' },
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 5, colSpan: 2 },
      { name: 'primary_cta_text', label: 'Primary CTA Text', type: 'text' },
      { name: 'primary_cta_link', label: 'Primary CTA Link', type: 'text', placeholder: '/catalog' },
      { name: 'secondary_cta_text', label: 'Secondary CTA Text', type: 'text' },
      { name: 'secondary_cta_link', label: 'Secondary CTA Link', type: 'text', placeholder: '/catalog?cat=contact' },
      { name: 'background_image', label: 'Background Image', type: 'file', accept: 'image/*', colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'intro_section',
    title: 'Intro Section',
    description: 'Update the opening introduction block that supports the gallery.',
    submitLabel: 'Save Intro Section',
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 5, colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'mission_section',
    title: 'Mission Section',
    description: 'Edit mission messaging, media, and publishing state.',
    submitLabel: 'Save Mission Section',
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 5, colSpan: 2 },
      { name: 'image', label: 'Image', type: 'file', accept: 'image/*', colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'vision_section',
    title: 'Vision Section',
    description: 'Edit vision messaging, media, and publishing state.',
    submitLabel: 'Save Vision Section',
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 5, colSpan: 2 },
      { name: 'image', label: 'Image', type: 'file', accept: 'image/*', colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'core_values_section',
    title: 'Core Values Section',
    description: 'Manage the section heading and intro copy above the core value cards.',
    submitLabel: 'Save Core Values Section',
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'journey_section',
    title: 'Journey Section',
    description: 'Update the timeline intro block and the section publishing state.',
    submitLabel: 'Save Journey Section',
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'certifications_section',
    title: 'Certifications Section',
    description: 'Manage the certifications intro block shown above the repeater items.',
    submitLabel: 'Save Certifications Section',
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'leadership_section',
    title: 'Leadership Section',
    description: 'Manage the heading and supporting copy above leadership members.',
    submitLabel: 'Save Leadership Section',
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'why_choose_section',
    title: 'Why Choose Section',
    description: 'Update the section heading and copy for the Why Choose Us block.',
    submitLabel: 'Save Why Choose Section',
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'cta_section',
    title: 'CTA Section',
    description: 'Manage the bottom call-to-action block, links, and media.',
    submitLabel: 'Save CTA Section',
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'primary_cta_text', label: 'Primary CTA Text', type: 'text' },
      { name: 'primary_cta_link', label: 'Primary CTA Link', type: 'text', placeholder: '/catalog' },
      { name: 'secondary_cta_text', label: 'Secondary CTA Text', type: 'text' },
      { name: 'secondary_cta_link', label: 'Secondary CTA Link', type: 'text', placeholder: '/catalog?cat=contact' },
      { name: 'background_image', label: 'Background Image', type: 'file', accept: 'image/*', colSpan: 2 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
];

const collectionConfigs: CollectionConfig[] = [
  {
    key: 'hero_stats',
    title: 'Hero Stats',
    description: 'Manage the stat cards shown inside the About page hero.',
    entityLabel: 'Hero Stat',
    addLabel: 'Add Hero Stat',
    emptyState: {
      title: 'No hero stats yet',
      description: 'Add the stat cards that should appear in the hero section.',
    },
    fallbackFields: [
      { name: 'stat_key', label: 'Stat Key', type: 'text', placeholder: 'years_experience' },
      { name: 'stat_value', label: 'Stat Value', type: 'text', required: true, placeholder: '25+' },
      { name: 'stat_label', label: 'Stat Label', type: 'text', required: true, placeholder: 'Years Experience' },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'intro_gallery_images',
    title: 'Intro Gallery Images',
    description: 'Upload, activate, and order the gallery assets used in the intro section.',
    entityLabel: 'Gallery Image',
    addLabel: 'Add Gallery Image',
    emptyState: {
      title: 'No gallery images yet',
      description: 'Add intro gallery images to support the About page story.',
    },
    fallbackFields: [
      { name: 'image', label: 'Image', type: 'file', accept: 'image/*', required: true, colSpan: 2 },
      { name: 'alt_text', label: 'Alt Text', type: 'text', colSpan: 2 },
      { name: 'caption', label: 'Caption', type: 'textarea', rows: 3, colSpan: 2 },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'core_values',
    title: 'Core Values',
    description: 'Manage the value cards, icon slugs, status, and ordering.',
    entityLabel: 'Core Value',
    addLabel: 'Add Core Value',
    emptyState: {
      title: 'No core values yet',
      description: 'Add core values that should appear on the About page.',
    },
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, required: true, colSpan: 2 },
      { name: 'icon', label: 'Icon Slug', type: 'text', placeholder: 'shield-check' },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'journey_timeline',
    title: 'Journey Timeline',
    description: 'Add and order timeline milestones that describe the company journey.',
    entityLabel: 'Timeline Item',
    addLabel: 'Add Timeline Item',
    emptyState: {
      title: 'No timeline items yet',
      description: 'Add company milestones for the About page timeline.',
    },
    fallbackFields: [
      { name: 'year', label: 'Year', type: 'text', required: true, placeholder: '2012' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'certifications',
    title: 'Certifications',
    description: 'Manage certification cards, visuals, status, and ordering.',
    entityLabel: 'Certification',
    addLabel: 'Add Certification',
    emptyState: {
      title: 'No certifications yet',
      description: 'Add certifications that should appear on the About page.',
    },
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'icon', label: 'Icon Slug', type: 'text', placeholder: 'award' },
      { name: 'image', label: 'Image', type: 'file', accept: 'image/*', colSpan: 2 },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'leadership_members',
    title: 'Leadership Members',
    description: 'Manage leadership profiles, media, profile links, status, and ordering.',
    entityLabel: 'Leadership Member',
    addLabel: 'Add Leadership Member',
    emptyState: {
      title: 'No leadership members yet',
      description: 'Add leadership members to populate the About page team block.',
    },
    fallbackFields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'bio', label: 'Bio', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'image', label: 'Image', type: 'file', accept: 'image/*', colSpan: 2 },
      { name: 'linkedin_link', label: 'LinkedIn Link', type: 'text', placeholder: '/catalog?cat=contact' },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
  {
    key: 'why_choose_items',
    title: 'Why Choose Items',
    description: 'Manage the supporting reasons or trust signals shown in the Why Choose section.',
    entityLabel: 'Why Choose Item',
    addLabel: 'Add Why Choose Item',
    emptyState: {
      title: 'No why choose items yet',
      description: 'Add the reasons that should appear on the About page.',
    },
    fallbackFields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, colSpan: 2 },
      { name: 'icon', label: 'Icon Slug', type: 'text', placeholder: 'badge-check' },
      { name: 'display_order', label: 'Display Order', type: 'number', required: true, defaultValue: 1 },
      { name: 'is_active', label: 'Is Active', type: 'switch', defaultValue: true },
    ],
  },
];

const singletonUpdaters: Record<SingletonSectionKey, (payload: Record<string, unknown>) => Promise<unknown>> = {
  hero_section: updateAboutPageHero,
  intro_section: updateAboutPageIntro,
  mission_section: updateAboutPageMission,
  vision_section: updateAboutPageVision,
  core_values_section: updateAboutPageCoreValuesSection,
  journey_section: updateAboutPageJourneySection,
  certifications_section: updateAboutPageCertificationsSection,
  leadership_section: updateAboutPageLeadershipSection,
  why_choose_section: updateAboutPageWhyChooseSection,
  cta_section: updateAboutPageCta,
};

const collectionActions = {
  hero_stats: {
    create: createAboutPageHeroStat,
    update: updateAboutPageHeroStat,
    remove: deleteAboutPageHeroStat,
    reorder: reorderAboutPageHeroStats,
    toggle: toggleAboutPageHeroStat,
  },
  intro_gallery_images: {
    create: createAboutPageIntroGalleryImage,
    update: updateAboutPageIntroGalleryImage,
    remove: deleteAboutPageIntroGalleryImage,
    reorder: reorderAboutPageIntroGalleryImages,
    toggle: toggleAboutPageIntroGalleryImage,
  },
  core_values: {
    create: createAboutPageCoreValue,
    update: updateAboutPageCoreValue,
    remove: deleteAboutPageCoreValue,
    reorder: reorderAboutPageCoreValues,
    toggle: toggleAboutPageCoreValue,
  },
  journey_timeline: {
    create: createAboutPageJourneyTimelineItem,
    update: updateAboutPageJourneyTimelineItem,
    remove: deleteAboutPageJourneyTimelineItem,
    reorder: reorderAboutPageJourneyTimeline,
    toggle: toggleAboutPageJourneyTimelineItem,
  },
  certifications: {
    create: createAboutPageCertification,
    update: updateAboutPageCertification,
    remove: deleteAboutPageCertification,
    reorder: reorderAboutPageCertifications,
    toggle: toggleAboutPageCertification,
  },
  leadership_members: {
    create: createAboutPageLeadershipMember,
    update: updateAboutPageLeadershipMember,
    remove: deleteAboutPageLeadershipMember,
    reorder: reorderAboutPageLeadershipMembers,
    toggle: toggleAboutPageLeadershipMember,
  },
  why_choose_items: {
    create: createAboutPageWhyChooseItem,
    update: updateAboutPageWhyChooseItem,
    remove: deleteAboutPageWhyChooseItem,
    reorder: reorderAboutPageWhyChooseItems,
    toggle: toggleAboutPageWhyChooseItem,
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

  if (fileFieldPattern.test(key) && key !== 'icon') {
    return 'file';
  }

  if (typeof value === 'string' && value.length > 120) {
    return 'textarea';
  }

  return 'text';
};

const getFieldDescription = (key: string, type: FieldConfig['type']) => {
  if (type === 'file') {
    return 'Upload new media only when you want to replace the current asset.';
  }

  if (linkFieldPattern.test(key)) {
    return 'Relative links like /catalog or /catalog?cat=contact are supported.';
  }

  if (key === 'icon') {
    return 'Use icon slug strings only.';
  }

  return undefined;
};

const buildDynamicFields = (fallbackFields: FieldConfig[], source: Record<string, unknown>) => {
  const sourceKeys = Object.keys(source).filter((key) => !hiddenKeys.has(key));
  const fallbackMap = new Map(fallbackFields.map((field) => [field.name, field]));
  const orderedKeys = [
    ...fallbackFields.map((field) => field.name),
    ...sourceKeys.filter((key) => !fallbackMap.has(key)),
  ];

  return orderedKeys.map((key) => {
    const fallbackField = fallbackMap.get(key);

    if (fallbackField) {
      const sourceValue = source[key];

      if (fallbackField.type === 'file' && sourceValue !== undefined && sourceValue !== null && sourceValue !== '') {
        return fallbackField;
      }

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
    } satisfies FieldConfig;
  });
};

const buildSectionValues = (fields: FieldConfig[], section: AboutPageSectionRecord | null | undefined) => {
  const record = toRecord(section);

  return fields.reduce<Record<string, unknown>>((accumulator, field) => {
    accumulator[field.name] = normalizeFieldValue(field, record[field.name] ?? field.defaultValue);
    return accumulator;
  }, createDefaultValuesFromFields(fields));
};

const buildCollectionItem = (item: unknown): AboutPageCollectionItem => {
  const record = toRecord(item);

  return {
    id: Number(record.id ?? 0),
    display_order: Number(record.display_order ?? 1),
    is_active: toBoolean(record.is_active ?? true),
    ...record,
  };
};

const buildCollectionValues = (fields: FieldConfig[], item: AboutPageCollectionItem) =>
  fields.reduce<Record<string, unknown>>((accumulator, field) => {
    accumulator[field.name] = normalizeFieldValue(field, item[field.name] ?? field.defaultValue);
    return accumulator;
  }, createDefaultValuesFromFields(fields));

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

export const AboutPageCmsPage = () => {
  const { showToast } = useToast();
  const [pageData, setPageData] = useState<AboutPageContentResponse | null>(null);
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
      const response = await getAboutPageContent();
      setPageData(response);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Unable to load About Page CMS data.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const collectionItems = useMemo(
    () =>
      collectionConfigs.reduce<Record<CollectionSectionKey, AboutPageCollectionItem[]>>((accumulator, config) => {
        accumulator[config.key] = Array.isArray(pageData?.[config.key])
          ? (pageData?.[config.key] ?? []).map((item) => buildCollectionItem(item))
          : [];
        return accumulator;
      }, {} as Record<CollectionSectionKey, AboutPageCollectionItem[]>),
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
    key: CollectionSectionKey,
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
        description="Manage the full Catalog About Page with section-specific save actions, repeater CRUD, media previews, active toggles, and ordering controls."
        title="About Page CMS"
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
        const fields = buildDynamicFields(config.fallbackFields, inferredSource).filter((field) => field.name !== 'id');
        const defaultValues = createDefaultValuesFromFields(fields);
        const schema = createSchemaFromFields(fields);
        const actions = collectionActions[config.key];
        const savingKey = `${config.key}-saving`;

        return (
          <CatalogCollectionManager<Record<string, unknown>, AboutPageCollectionItem>
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
                config.key,
                savingKey,
                () => actions.create(sanitizePayload(fields, values)),
                `${config.entityLabel} created`,
                `${config.entityLabel} was added successfully.`,
                `Unable to create ${config.entityLabel.toLowerCase()}`,
              )
            }
            onDelete={(item) =>
              void mutateCollection(
                config.key,
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
                config.key,
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
                config.key,
                savingKey,
                () => actions.toggle(item.id, !item.is_active),
                `${config.entityLabel} updated`,
                `${config.entityLabel} status was updated successfully.`,
                `Unable to update ${config.entityLabel.toLowerCase()}`,
              )
            }
            onUpdate={(item, values) =>
              void mutateCollection(
                config.key,
                savingKey,
                () => actions.update(item.id, sanitizePayload(fields, values)),
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
