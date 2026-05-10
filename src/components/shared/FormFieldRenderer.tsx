import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ArrayRepeater } from '@/components/shared/ArrayRepeater';
import { FormField } from '@/components/shared/FormField';
import { KeyValueRepeater } from '@/components/shared/KeyValueRepeater';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { API_BASE_URL } from '@/constants/api';
import type { FieldConfig } from '@/types/resources';

type FormFieldRendererProps = {
  field: FieldConfig;
};

const getFieldError = (errors: Record<string, any>, fieldName: string) => {
  const segments = fieldName.split('.');
  let value: Record<string, any> | undefined = errors;

  for (const segment of segments) {
    value = value?.[segment];
  }

  return value?.message as string | undefined;
};

const resolveMediaUrl = (value: unknown): string | null => {
  if (!value || value instanceof File) {
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

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);

const FilePreview = ({ value }: { value: unknown }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!(value instanceof File || value instanceof Blob)) {
      setObjectUrl(null);
      return;
    }

    const nextObjectUrl = URL.createObjectURL(value);
    setObjectUrl(nextObjectUrl);

    return () => {
      URL.revokeObjectURL(nextObjectUrl);
    };
  }, [value]);

  const previewUrl = objectUrl ?? resolveMediaUrl(value);

  if (!previewUrl) {
    return null;
  }

  const previewLabel = value instanceof File ? 'Selected media preview' : 'Current media from saved content';

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-500">
        {previewLabel}
      </div>
      <div className="p-3">
        {isVideoUrl(previewUrl) || (value instanceof File && value.type.startsWith('video/')) ? (
          <video className="max-h-64 w-full rounded-xl bg-slate-950" controls src={previewUrl} />
        ) : (
          <img
            alt="Selected media preview"
            className="max-h-64 w-full rounded-xl object-cover"
            src={previewUrl}
          />
        )}
      </div>
    </div>
  );
};

export const FormFieldRenderer = ({ field }: FormFieldRendererProps) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const fieldError = getFieldError(errors, field.name);

  if (field.type === 'arrayText' || field.type === 'arrayObject') {
    return (
      <ArrayRepeater
        addLabel={field.addLabel}
        itemLabel={field.itemLabel}
        label={field.label}
        name={field.name}
        subfields={field.subfields}
      />
    );
  }

  if (field.type === 'keyValue') {
    return <KeyValueRepeater label={field.label} name={field.name} />;
  }

  return (
    <FormField
      className={field.colSpan === 2 ? 'md:col-span-2' : undefined}
      description={field.description}
      error={fieldError}
      label={field.label}
      required={field.required}
    >
      <Controller
        control={control}
        name={field.name}
        render={({ field: controllerField }) => {
          if (field.type === 'file') {
            return (
              <div className="space-y-2">
                <Input
                  accept={field.accept}
                  name={controllerField.name}
                  onBlur={controllerField.onBlur}
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setValue(field.name, nextFile, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                    controllerField.onChange(nextFile);
                  }}
                  ref={controllerField.ref}
                  type="file"
                />
                {controllerField.value instanceof File ? (
                  <p className="text-xs text-slate-500">Selected file: {controllerField.value.name}</p>
                ) : null}
                <FilePreview value={controllerField.value} />
              </div>
            );
          }

          if (field.type === 'textarea') {
            return (
              <Textarea
                {...controllerField}
                placeholder={field.placeholder}
                rows={field.rows ?? 4}
                value={String(controllerField.value ?? '')}
              />
            );
          }

          if (field.type === 'select') {
            return (
              <Select {...controllerField} value={String(controllerField.value ?? '')}>
                <option value="">Select {field.label}</option>
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            );
          }

          if (field.type === 'switch') {
            return (
              <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
                <Switch checked={Boolean(controllerField.value)} onChange={controllerField.onChange} />
              </div>
            );
          }

          return (
            <Input
              {...controllerField}
              placeholder={field.placeholder}
              step={field.step}
              type={field.type === 'number' ? 'number' : field.type}
              value={controllerField.value ?? ''}
            />
          );
        }}
      />
    </FormField>
  );
};
