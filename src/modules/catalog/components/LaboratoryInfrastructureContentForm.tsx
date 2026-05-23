import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';

import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type {
  LaboratoryInfrastructureContentFormValues,
  LaboratoryInfrastructureContentResponse,
} from '@/modules/catalog/types/laboratoryInfrastructure';

const contentSchema = z.object({
  hero_title: z.string().trim().min(1, 'Hero title is required.'),
  hero_subtitle: z.string().trim().min(1, 'Hero subtitle is required.'),
  background_image: z.any().optional().nullable(),
  primary_cta_text: z.string().trim().min(1, 'Primary CTA text is required.'),
  primary_cta_link: z.string().trim().min(1, 'Primary CTA link is required.'),
  secondary_cta_text: z.string().trim().min(1, 'Secondary CTA text is required.'),
  secondary_cta_link: z.string().trim().min(1, 'Secondary CTA link is required.'),
  intro_title: z.string().trim().min(1, 'Intro title is required.'),
  intro_description: z.string().trim().min(1, 'Intro description is required.'),
  is_active: z.boolean().default(true),
});

const fields = [
  { name: 'hero_title', label: 'Hero Title', type: 'text', required: true, colSpan: 2 as const },
  { name: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', required: true, rows: 4, colSpan: 2 as const },
  {
    name: 'background_image',
    label: 'Background Image',
    type: 'file',
    accept: 'image/png,image/jpeg,image/webp',
    description: 'Upload a new background image only when you want to replace the current poster.',
    colSpan: 2 as const,
  },
  { name: 'primary_cta_text', label: 'Primary CTA Text', type: 'text', required: true },
  { name: 'primary_cta_link', label: 'Primary CTA Link', type: 'text', required: true },
  { name: 'secondary_cta_text', label: 'Secondary CTA Text', type: 'text', required: true },
  { name: 'secondary_cta_link', label: 'Secondary CTA Link', type: 'text', required: true },
  { name: 'intro_title', label: 'Intro Title', type: 'text', required: true, colSpan: 2 as const },
  {
    name: 'intro_description',
    label: 'Intro Description',
    type: 'textarea',
    required: true,
    rows: 5,
    colSpan: 2 as const,
  },
  { name: 'is_active', label: 'Is Active', type: 'switch' },
] as const;

const defaultValues: LaboratoryInfrastructureContentFormValues = {
  hero_title: '',
  hero_subtitle: '',
  background_image: null,
  primary_cta_text: '',
  primary_cta_link: '',
  secondary_cta_text: '',
  secondary_cta_link: '',
  intro_title: '',
  intro_description: '',
  is_active: true,
};

const mapToFormValues = (
  data: LaboratoryInfrastructureContentResponse | null,
): LaboratoryInfrastructureContentFormValues => ({
  hero_title: data?.hero?.title ?? '',
  hero_subtitle: data?.hero?.subtitle ?? '',
  background_image: data?.hero?.background_image_url ?? null,
  primary_cta_text: data?.hero?.primary_cta_text ?? '',
  primary_cta_link: data?.hero?.primary_cta_link ?? '',
  secondary_cta_text: data?.hero?.secondary_cta_text ?? '',
  secondary_cta_link: data?.hero?.secondary_cta_link ?? '',
  intro_title: data?.intro?.title ?? '',
  intro_description: data?.intro?.description ?? '',
  is_active: typeof data?.is_active === 'boolean' ? data.is_active : Boolean(data?.is_active ?? true),
});

type LaboratoryInfrastructureContentFormProps = {
  data: LaboratoryInfrastructureContentResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  onSubmit: (values: LaboratoryInfrastructureContentFormValues) => void;
};

export const LaboratoryInfrastructureContentForm = ({
  data,
  isLoading,
  isSaving,
  onSubmit,
}: LaboratoryInfrastructureContentFormProps) => {
  const form = useForm<LaboratoryInfrastructureContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: defaultValues as DefaultValues<LaboratoryInfrastructureContentFormValues>,
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
          Manage hero content, poster background, intro copy, and CTA links for the Laboratory Infrastructure page.
        </p>
      </div>

      <FormProvider {...form}>
        <form className="space-y-6" onSubmit={(event) => void submit(event)}>
          <div className="field-grid">
            {fields.map((field) => (
              <FormFieldRenderer field={field} key={field.name} />
            ))}
          </div>

          <div className="flex justify-end">
            <Button isLoading={isSaving} type="submit">
              Save Page Content
            </Button>
          </div>
        </form>
      </FormProvider>
    </Card>
  );
};
