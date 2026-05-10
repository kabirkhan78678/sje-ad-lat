import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, RefreshCw, Save } from 'lucide-react';
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form';
import { useEffect } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { FormFieldRenderer } from '@/components/shared/FormFieldRenderer';
import { JSONPreviewDrawer } from '@/components/shared/JSONPreviewDrawer';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useSingletonResource } from '@/hooks/useSingletonResource';
import type { FieldConfig, SingletonResourceConfig } from '@/types/resources';
import { getErrorMessage } from '@/utils/error';
import { mapRecordToFormValues } from '@/utils/resources';

type SingletonResourcePageProps<
  TRecord extends Record<string, any>,
  TFormValues extends Record<string, any>,
> = {
  config: SingletonResourceConfig<TRecord, TFormValues>;
};

const renderFields = (fields: FieldConfig[]) => (
  <div className="field-grid">
    {fields.map((field) => (
      <FormFieldRenderer field={field} key={field.name} />
    ))}
  </div>
);

export const SingletonResourcePage = <
  TRecord extends Record<string, any>,
  TFormValues extends Record<string, any>,
>({
  config,
}: SingletonResourcePageProps<TRecord, TFormValues>) => {
  const { showToast } = useToast();
  const previewDisclosure = useDisclosure(false);
  const { error, isLoading, isSubmitting, item, rawData, refetch, updateItem } = useSingletonResource({
    api: config.api,
  });

  const form = useForm<TFormValues>({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues as DefaultValues<TFormValues>,
  });

  useEffect(() => {
    if (!item) {
      return;
    }

    const nextValues = config.mapRecordToForm
      ? config.mapRecordToForm(item)
      : mapRecordToFormValues(config.fields, item, config.defaultValues);

    form.reset(nextValues);
  }, [config, form, item]);

  const submit = form.handleSubmit(async (values) => {
    try {
      const payload = config.transformPayload ? config.transformPayload(values as TFormValues) : values;
      await updateItem(payload as never);
      showToast({
        title: `${config.title} updated`,
        description: 'Your changes have been saved successfully.',
        tone: 'success',
      });
    } catch (submitError) {
      showToast({
        title: `Unable to save ${config.title.toLowerCase()}`,
        description: getErrorMessage(submitError),
        tone: 'error',
      });
    }
  });

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
          </>
        }
        description={config.description}
        title={config.title}
      />

      <FormProvider {...form}>
        <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]" onSubmit={(event) => void submit(event)}>
          <Card className="relative p-6">
            <LoadingOverlay
              label={isLoading ? 'Loading content...' : 'Saving changes...'}
              show={isLoading || isSubmitting}
            />
            <div className="space-y-6">
              {config.sections?.length
                ? config.sections.map((section) => (
                    <section className="panel-subtle space-y-4 p-5" key={section.title}>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-slate-950">{section.title}</h3>
                        {section.description ? (
                          <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                        ) : null}
                      </div>
                      {renderFields(
                        config.fields.filter((field) => section.fieldNames.includes(field.name)),
                      )}
                    </section>
                  ))
                : renderFields(config.fields)}
            </div>
            <div className="mt-6 flex justify-end">
              <Button disabled={isLoading} isLoading={isSubmitting} type="submit">
                <Save className="h-4 w-4" />
                {config.submitLabel ?? 'Save changes'}
              </Button>
            </div>
          </Card>

          <div className="space-y-6">
            {config.previewRenderer ? (
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="font-display text-lg font-semibold text-slate-950">Preview</h3>
                  <p className="mt-1 text-sm text-slate-500">A quick visual of how this content reads.</p>
                </div>
                {config.previewRenderer(form.watch())}
              </Card>
            ) : null}

            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold text-slate-950">Publishing Notes</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>Keep CTA language clear and outcome-focused.</li>
                <li>Use display order and grouped arrays to preserve predictable frontend layouts.</li>
                <li>Preview the API payload before publishing if you need to verify nested data.</li>
              </ul>
            </Card>
          </div>
        </form>
      </FormProvider>

      <JSONPreviewDrawer
        data={rawData}
        onClose={previewDisclosure.close}
        open={previewDisclosure.isOpen}
        title={config.previewTitle ?? `${config.title} API Preview`}
      />
    </>
  );
};
