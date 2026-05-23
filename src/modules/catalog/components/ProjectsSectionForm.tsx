import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { ProjectsCmsSection } from '@/modules/catalog/components/ProjectsCmsSection';
import type { FieldConfig } from '@/types/resources';

type ProjectsSectionFormProps<TFormValues extends Record<string, any>> = {
  title: string;
  description: string;
  values: TFormValues;
  defaultValues: TFormValues;
  fields: FieldConfig[];
  schema: ZodTypeAny;
  isLoading?: boolean;
  isSaving?: boolean;
  submitLabel: string;
  footerNote?: React.ReactNode;
  onSubmit: (values: TFormValues) => void;
};

export const ProjectsSectionForm = <TFormValues extends Record<string, any>>({
  defaultValues,
  description,
  fields,
  footerNote,
  isLoading,
  isSaving,
  onSubmit,
  schema,
  submitLabel,
  title,
  values,
}: ProjectsSectionFormProps<TFormValues>) => {
  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<TFormValues>,
  });

  useEffect(() => {
    form.reset(values);
  }, [form, values]);

  const submit = form.handleSubmit(onSubmit);
  const currentIsActive = (form.watch() as Record<string, unknown>).is_active;

  return (
    <ProjectsCmsSection
      description={description}
      isActive={typeof currentIsActive === 'boolean' ? currentIsActive : undefined}
      title={title}
    >
      <div className="relative">
        <LoadingOverlay
          label={isLoading ? 'Loading section...' : 'Saving section...'}
          show={Boolean(isLoading || isSaving)}
        />

        <FormProvider {...form}>
          <form className="space-y-6" onSubmit={(event) => void submit(event)}>
            <div className="field-grid">
              {fields.map((field) => (
                <FormFieldRenderer field={field} key={field.name} />
              ))}
            </div>

            {footerNote ? <p className="text-sm text-slate-500">{footerNote}</p> : null}

            <div className="flex justify-end">
              <Button isLoading={isSaving} type="submit">
                <Save className="h-4 w-4" />
                {submitLabel}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </ProjectsCmsSection>
  );
};
