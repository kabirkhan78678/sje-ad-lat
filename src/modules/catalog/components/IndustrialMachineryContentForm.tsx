import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';
import { z } from 'zod';

import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type {
  IndustrialMachineryContentFormValues,
  IndustrialMachineryPageResponse,
} from '@/modules/catalog/types/industrialMachinery';
import type { FieldConfig } from '@/types/resources';

const schema = z.object({
  hero_badge_text: z.string(),
  hero_badge_icon: z.string(),
  hero_title: z.string().trim().min(1, 'Hero title is required.'),
  hero_subtitle: z.string().trim().min(1, 'Hero subtitle is required.'),
  hero_primary_cta_text: z.string(),
  hero_primary_cta_link: z.string(),
  hero_secondary_cta_text: z.string(),
  hero_secondary_cta_link: z.string(),
  background_image: z.any().optional().nullable(),
  features_section_title: z.string(),
  features_section_subtitle: z.string(),
  catalog_section_title: z.string(),
  catalog_section_subtitle: z.string(),
  why_choose_us_section_title: z.string(),
  why_choose_us_section_subtitle: z.string(),
  cta_section_title: z.string(),
  cta_section_subtitle: z.string(),
  cta_primary_cta_text: z.string(),
  cta_primary_cta_link: z.string(),
  is_active: z.boolean().default(true),
});

const defaultValues: IndustrialMachineryContentFormValues = {
  hero_badge_text: '',
  hero_badge_icon: '',
  hero_title: '',
  hero_subtitle: '',
  hero_primary_cta_text: '',
  hero_primary_cta_link: '',
  hero_secondary_cta_text: '',
  hero_secondary_cta_link: '',
  background_image: null,
  features_section_title: '',
  features_section_subtitle: '',
  catalog_section_title: '',
  catalog_section_subtitle: '',
  why_choose_us_section_title: '',
  why_choose_us_section_subtitle: '',
  cta_section_title: '',
  cta_section_subtitle: '',
  cta_primary_cta_text: '',
  cta_primary_cta_link: '',
  is_active: true,
};

const heroFields: FieldConfig[] = [
  { name: 'hero_badge_text', label: 'Badge Text', type: 'text' },
  {
    name: 'hero_badge_icon',
    label: 'Badge Icon',
    type: 'select',
    options: [
      { label: 'Settings', value: 'settings' },
      { label: 'Package', value: 'package' },
      { label: 'Shield Check', value: 'shield-check' },
      { label: 'Wrench', value: 'wrench' },
      { label: 'Award', value: 'award' },
      { label: 'Map Pin', value: 'map-pin' },
      { label: 'Tag', value: 'tag' },
    ],
  },
  { name: 'hero_title', label: 'Hero Title', type: 'text', required: true, colSpan: 2 },
  { name: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', rows: 4, required: true, colSpan: 2 },
  { name: 'hero_primary_cta_text', label: 'Primary CTA Text', type: 'text' },
  { name: 'hero_primary_cta_link', label: 'Primary CTA Link', type: 'text' },
  { name: 'hero_secondary_cta_text', label: 'Secondary CTA Text', type: 'text' },
  { name: 'hero_secondary_cta_link', label: 'Secondary CTA Link', type: 'text' },
  {
    name: 'background_image',
    label: 'Hero Background Image',
    type: 'file',
    accept: 'image/png,image/jpeg,image/webp',
    description: 'Choose a new background image only when replacing the current hero artwork.',
    colSpan: 2,
  },
];

const sectionFields = (titleName: string, subtitleName: string): FieldConfig[] => [
  { name: titleName, label: 'Section Title', type: 'text', colSpan: 2 },
  { name: subtitleName, label: 'Section Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
];

const sections = [
  { title: 'Hero Section', description: 'Top-of-page messaging, CTAs, and background image.', fields: heroFields },
  {
    title: 'Features Section',
    description: 'Heading content above the feature cards grid.',
    fields: sectionFields('features_section_title', 'features_section_subtitle'),
  },
  {
    title: 'Machinery Catalog Section',
    description: 'Heading content above the category and machine list.',
    fields: sectionFields('catalog_section_title', 'catalog_section_subtitle'),
  },
  {
    title: 'Why Choose Us Section',
    description: 'Heading content for the trust-building reasons area.',
    fields: sectionFields('why_choose_us_section_title', 'why_choose_us_section_subtitle'),
  },
  {
    title: 'Bottom CTA Section',
    description: 'Closing CTA block content shown near the bottom of the page.',
    fields: [
      ...sectionFields('cta_section_title', 'cta_section_subtitle'),
      { name: 'cta_primary_cta_text', label: 'Primary CTA Text', type: 'text' },
      { name: 'cta_primary_cta_link', label: 'Primary CTA Link', type: 'text' },
    ],
  },
] as const;

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

const mapToFormValues = (data: IndustrialMachineryPageResponse | null): IndustrialMachineryContentFormValues => ({
  hero_badge_text: data?.hero?.badge_text ?? '',
  hero_badge_icon: data?.hero?.badge_icon ?? '',
  hero_title: data?.hero?.title ?? '',
  hero_subtitle: data?.hero?.subtitle ?? '',
  hero_primary_cta_text: data?.hero?.primary_cta_text ?? '',
  hero_primary_cta_link: data?.hero?.primary_cta_link ?? '',
  hero_secondary_cta_text: data?.hero?.secondary_cta_text ?? '',
  hero_secondary_cta_link: data?.hero?.secondary_cta_link ?? '',
  background_image: data?.hero?.background_image_url ?? null,
  features_section_title: data?.features_section?.title ?? '',
  features_section_subtitle: data?.features_section?.subtitle ?? '',
  catalog_section_title: data?.catalog_section?.title ?? '',
  catalog_section_subtitle: data?.catalog_section?.subtitle ?? '',
  why_choose_us_section_title: data?.why_choose_us_section?.title ?? '',
  why_choose_us_section_subtitle: data?.why_choose_us_section?.subtitle ?? '',
  cta_section_title: data?.cta_section?.title ?? '',
  cta_section_subtitle: data?.cta_section?.subtitle ?? '',
  cta_primary_cta_text: data?.cta_section?.primary_cta_text ?? '',
  cta_primary_cta_link: data?.cta_section?.primary_cta_link ?? '',
  is_active:
    data?.hero?.is_active === undefined && data?.features_section?.is_active === undefined
      ? true
      : toBoolean(
          data?.hero?.is_active ??
            data?.features_section?.is_active ??
            data?.catalog_section?.is_active ??
            data?.why_choose_us_section?.is_active ??
            data?.cta_section?.is_active,
        ),
});

type IndustrialMachineryContentFormProps = {
  data: IndustrialMachineryPageResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  onSubmit: (values: IndustrialMachineryContentFormValues) => void;
};

export const IndustrialMachineryContentForm = ({
  data,
  isLoading,
  isSaving,
  onSubmit,
}: IndustrialMachineryContentFormProps) => {
  const form = useForm<IndustrialMachineryContentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<IndustrialMachineryContentFormValues>,
  });

  useEffect(() => {
    form.reset(mapToFormValues(data));
  }, [data, form]);

  const submit = form.handleSubmit(onSubmit);

  return (
    <Card className="relative p-6">
      <LoadingOverlay label={isLoading ? 'Loading content...' : 'Saving content...'} show={isLoading || isSaving} />
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-slate-950">Page Content</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage all section headings, hero CTAs, and the bottom conversion block from one CMS form.
        </p>
      </div>

      <FormProvider {...form}>
        <form className="space-y-6" onSubmit={(event) => void submit(event)}>
          {sections.map((section) => (
            <section className="panel-subtle space-y-4 p-5" key={section.title}>
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-950">{section.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{section.description}</p>
              </div>
              <div className="field-grid">
                {section.fields.map((field) => (
                  <FormFieldRenderer field={field} key={field.name} />
                ))}
              </div>
            </section>
          ))}

          <section className="panel-subtle space-y-4 p-5">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-950">Publishing</h3>
              <p className="mt-1 text-sm text-slate-500">Set whether the page-level CMS content is active.</p>
            </div>
            <div className="field-grid">
              <FormFieldRenderer field={{ name: 'is_active', label: 'Is Active', type: 'switch' }} />
            </div>
          </section>

          <div className="flex justify-end">
            <Button isLoading={isSaving} type="submit">
              <Save className="h-4 w-4" />
              Save Page Content
            </Button>
          </div>
        </form>
      </FormProvider>
    </Card>
  );
};
