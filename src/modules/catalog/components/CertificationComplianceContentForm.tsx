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
  CertificationComplianceContentFormValues,
  CertificationComplianceContentResponse,
} from '@/modules/catalog/types/certificationCompliance';
import type { FieldConfig } from '@/types/resources';

const schema = z.object({
  hero_badge_text: z.string(),
  hero_badge_icon: z.string(),
  hero_title: z.string(),
  hero_subtitle: z.string(),
  hero_primary_cta_text: z.string(),
  hero_primary_cta_link: z.string(),
  hero_secondary_cta_text: z.string(),
  hero_secondary_cta_link: z.string(),
  services_section_title: z.string(),
  services_section_subtitle: z.string(),
  process_section_title: z.string(),
  process_section_subtitle: z.string(),
  process_bottom_cta_text: z.string(),
  process_bottom_cta_link: z.string(),
  training_section_title: z.string(),
  training_section_subtitle: z.string(),
  testing_section_title: z.string(),
  testing_section_subtitle: z.string(),
  testing_service_title: z.string(),
  testing_service_icon: z.string(),
  testing_turnaround_time: z.string(),
  testing_cta_text: z.string(),
  testing_cta_link: z.string(),
  why_choose_us_section_title: z.string(),
  why_choose_us_section_subtitle: z.string(),
  cta_section_title: z.string(),
  cta_section_subtitle: z.string(),
  cta_primary_cta_text: z.string(),
  cta_primary_cta_link: z.string(),
  cta_secondary_cta_text: z.string(),
  cta_secondary_cta_link: z.string(),
  cta_secondary_cta_icon: z.string(),
  is_active: z.boolean().default(true),
});

const defaultValues: CertificationComplianceContentFormValues = {
  hero_badge_text: '',
  hero_badge_icon: '',
  hero_title: '',
  hero_subtitle: '',
  hero_primary_cta_text: '',
  hero_primary_cta_link: '',
  hero_secondary_cta_text: '',
  hero_secondary_cta_link: '',
  services_section_title: '',
  services_section_subtitle: '',
  process_section_title: '',
  process_section_subtitle: '',
  process_bottom_cta_text: '',
  process_bottom_cta_link: '',
  training_section_title: '',
  training_section_subtitle: '',
  testing_section_title: '',
  testing_section_subtitle: '',
  testing_service_title: '',
  testing_service_icon: '',
  testing_turnaround_time: '',
  testing_cta_text: '',
  testing_cta_link: '',
  why_choose_us_section_title: '',
  why_choose_us_section_subtitle: '',
  cta_section_title: '',
  cta_section_subtitle: '',
  cta_primary_cta_text: '',
  cta_primary_cta_link: '',
  cta_secondary_cta_text: '',
  cta_secondary_cta_link: '',
  cta_secondary_cta_icon: '',
  is_active: true,
};

const heroFields: FieldConfig[] = [
  { name: 'hero_badge_text', label: 'Badge Text', type: 'text' },
  { name: 'hero_badge_icon', label: 'Badge Icon', type: 'text' },
  { name: 'hero_title', label: 'Hero Title', type: 'text', colSpan: 2 },
  { name: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', rows: 4, colSpan: 2 },
  { name: 'hero_primary_cta_text', label: 'Primary CTA Text', type: 'text' },
  { name: 'hero_primary_cta_link', label: 'Primary CTA Link', type: 'text' },
  { name: 'hero_secondary_cta_text', label: 'Secondary CTA Text', type: 'text' },
  { name: 'hero_secondary_cta_link', label: 'Secondary CTA Link', type: 'text' },
];

const servicesFields: FieldConfig[] = [
  { name: 'services_section_title', label: 'Section Title', type: 'text', colSpan: 2 },
  { name: 'services_section_subtitle', label: 'Section Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
];

const processFields: FieldConfig[] = [
  { name: 'process_section_title', label: 'Section Title', type: 'text', colSpan: 2 },
  { name: 'process_section_subtitle', label: 'Section Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
  { name: 'process_bottom_cta_text', label: 'Bottom CTA Text', type: 'text' },
  { name: 'process_bottom_cta_link', label: 'Bottom CTA Link', type: 'text' },
];

const trainingFields: FieldConfig[] = [
  { name: 'training_section_title', label: 'Section Title', type: 'text', colSpan: 2 },
  { name: 'training_section_subtitle', label: 'Section Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
];

const testingFields: FieldConfig[] = [
  { name: 'testing_section_title', label: 'Section Title', type: 'text', colSpan: 2 },
  { name: 'testing_section_subtitle', label: 'Section Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
  { name: 'testing_service_title', label: 'Service Title', type: 'text' },
  { name: 'testing_service_icon', label: 'Service Icon', type: 'text' },
  { name: 'testing_turnaround_time', label: 'Turnaround Time', type: 'text' },
  { name: 'testing_cta_text', label: 'CTA Text', type: 'text' },
  { name: 'testing_cta_link', label: 'CTA Link', type: 'text', colSpan: 2 },
];

const whyChooseUsFields: FieldConfig[] = [
  { name: 'why_choose_us_section_title', label: 'Section Title', type: 'text', colSpan: 2 },
  { name: 'why_choose_us_section_subtitle', label: 'Section Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
];

const ctaFields: FieldConfig[] = [
  { name: 'cta_section_title', label: 'Section Title', type: 'text', colSpan: 2 },
  { name: 'cta_section_subtitle', label: 'Section Subtitle', type: 'textarea', rows: 3, colSpan: 2 },
  { name: 'cta_primary_cta_text', label: 'Primary CTA Text', type: 'text' },
  { name: 'cta_primary_cta_link', label: 'Primary CTA Link', type: 'text' },
  { name: 'cta_secondary_cta_text', label: 'Secondary CTA Text', type: 'text' },
  { name: 'cta_secondary_cta_link', label: 'Secondary CTA Link', type: 'text' },
  { name: 'cta_secondary_cta_icon', label: 'Secondary CTA Icon', type: 'text', colSpan: 2 },
];

const sections = [
  { title: 'Hero', description: 'Top-of-page badge, heading, and CTA content.', fields: heroFields },
  { title: 'Services Section', description: 'Heading copy for certification services.', fields: servicesFields },
  { title: 'Process Section', description: 'Heading copy and bottom CTA for the process area.', fields: processFields },
  { title: 'Training Section', description: 'Heading copy for training programs.', fields: trainingFields },
  { title: 'Testing Section', description: 'Heading copy and service CTA details for testing.', fields: testingFields },
  { title: 'Why Choose Us Section', description: 'Heading copy for the trust-building section.', fields: whyChooseUsFields },
  { title: 'Bottom CTA Section', description: 'Closing CTA block content and icon reference.', fields: ctaFields },
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

const mapToFormValues = (
  data: CertificationComplianceContentResponse | null,
): CertificationComplianceContentFormValues => ({
  hero_badge_text: data?.hero?.badge_text ?? '',
  hero_badge_icon: data?.hero?.badge_icon ?? '',
  hero_title: data?.hero?.title ?? '',
  hero_subtitle: data?.hero?.subtitle ?? '',
  hero_primary_cta_text: data?.hero?.primary_cta_text ?? '',
  hero_primary_cta_link: data?.hero?.primary_cta_link ?? '',
  hero_secondary_cta_text: data?.hero?.secondary_cta_text ?? '',
  hero_secondary_cta_link: data?.hero?.secondary_cta_link ?? '',
  services_section_title: data?.services_section?.title ?? '',
  services_section_subtitle: data?.services_section?.subtitle ?? '',
  process_section_title: data?.process_section?.title ?? '',
  process_section_subtitle: data?.process_section?.subtitle ?? '',
  process_bottom_cta_text: data?.process_section?.bottom_cta_text ?? '',
  process_bottom_cta_link: data?.process_section?.bottom_cta_link ?? '',
  training_section_title: data?.training_section?.title ?? '',
  training_section_subtitle: data?.training_section?.subtitle ?? '',
  testing_section_title: data?.testing_section?.title ?? '',
  testing_section_subtitle: data?.testing_section?.subtitle ?? '',
  testing_service_title: data?.testing_section?.service_title ?? '',
  testing_service_icon: data?.testing_section?.service_icon ?? '',
  testing_turnaround_time: data?.testing_section?.turnaround_time ?? '',
  testing_cta_text: data?.testing_section?.cta_text ?? '',
  testing_cta_link: data?.testing_section?.cta_link ?? '',
  why_choose_us_section_title: data?.why_choose_us_section?.title ?? '',
  why_choose_us_section_subtitle: data?.why_choose_us_section?.subtitle ?? '',
  cta_section_title: data?.cta_section?.title ?? '',
  cta_section_subtitle: data?.cta_section?.subtitle ?? '',
  cta_primary_cta_text: data?.cta_section?.primary_cta_text ?? '',
  cta_primary_cta_link: data?.cta_section?.primary_cta_link ?? '',
  cta_secondary_cta_text: data?.cta_section?.secondary_cta_text ?? '',
  cta_secondary_cta_link: data?.cta_section?.secondary_cta_link ?? '',
  cta_secondary_cta_icon: data?.cta_section?.secondary_cta_icon ?? '',
  is_active: data?.is_active === undefined ? true : toBoolean(data.is_active),
});

type CertificationComplianceContentFormProps = {
  data: CertificationComplianceContentResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  onSubmit: (values: CertificationComplianceContentFormValues) => void;
};

export const CertificationComplianceContentForm = ({
  data,
  isLoading,
  isSaving,
  onSubmit,
}: CertificationComplianceContentFormProps) => {
  const form = useForm<CertificationComplianceContentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<CertificationComplianceContentFormValues>,
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
          Manage hero copy, section headings, testing callouts, and the bottom CTA entirely from CMS data.
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
              <p className="mt-1 text-sm text-slate-500">Control whether this CMS page is active.</p>
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
