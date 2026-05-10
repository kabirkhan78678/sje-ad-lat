import { z } from 'zod';

import type { FieldConfig } from '@/types/resources';

const optionalString = (label: string, config?: FieldConfig['validation']) => {
  let base = z.string();

  if (config?.email) {
    base = base.email(`${label} must be a valid email.`);
  }

  if (config?.url) {
    base = base.url(`${label} must be a valid URL.`);
  }

  return z.union([base, z.literal('')]).optional().default('');
};

const requiredString = (label: string, config?: FieldConfig['validation']) => {
  let base = z.string().trim().min(1, `${label} is required.`);

  if (config?.email) {
    base = base.email(`${label} must be a valid email.`);
  }

  if (config?.url) {
    base = base.url(`${label} must be a valid URL.`);
  }

  return base;
};

const preprocessNumberValue = (value: unknown) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : NaN;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
};

export const createSchemaFromFields = (fields: FieldConfig[]) =>
  z.object(
    fields.reduce<Record<string, z.ZodTypeAny>>((shape, field) => {
      switch (field.type) {
        case 'number':
          shape[field.name] = field.required
            ? z.preprocess(
                preprocessNumberValue,
                z.number({
                  invalid_type_error: `${field.label} must be a valid number.`,
                  required_error: `${field.label} is required.`,
                }),
              )
            : z.preprocess(
                preprocessNumberValue,
                z
                  .number({
                    invalid_type_error: `${field.label} must be a valid number.`,
                  })
                  .optional(),
              );
          break;
        case 'switch':
          shape[field.name] = z.boolean().default(false);
          break;
        case 'file':
          shape[field.name] = z.any().optional().nullable();
          break;
        case 'arrayText':
          shape[field.name] = z.array(z.string().trim().min(1, `${field.label} item is required.`)).default([]);
          break;
        case 'keyValue':
          shape[field.name] = z
            .array(
              z.object({
                key: z.string().trim().min(1, 'Key is required.'),
                value: z.string().trim().min(1, 'Value is required.'),
              }),
            )
            .default([]);
          break;
        case 'arrayObject':
          shape[field.name] = z
            .array(createSchemaFromFields(field.subfields ?? []).strip())
            .default([]);
          break;
        default:
          shape[field.name] = field.required
            ? requiredString(field.label, field.validation)
            : optionalString(field.label, field.validation);
      }

      return shape;
    }, {}),
  );

export const createDefaultValuesFromFields = (fields: FieldConfig[]) =>
  fields.reduce<Record<string, unknown>>((defaults, field) => {
    if (field.defaultValue !== undefined) {
      defaults[field.name] = field.defaultValue;
      return defaults;
    }

    switch (field.type) {
      case 'number':
        defaults[field.name] = '';
        break;
      case 'switch':
        defaults[field.name] = false;
        break;
      case 'file':
        defaults[field.name] = null;
        break;
      case 'arrayText':
      case 'arrayObject':
      case 'keyValue':
        defaults[field.name] = [];
        break;
      default:
        defaults[field.name] = '';
    }

    return defaults;
  }, {});

export const normalizeFieldValue = (field: FieldConfig, value: unknown): unknown => {
  if (value === null || value === undefined) {
    if (field.type === 'switch') {
      return false;
    }

    if (field.type === 'arrayText' || field.type === 'arrayObject' || field.type === 'keyValue') {
      return [];
    }

    if (field.type === 'file') {
      return null;
    }

    return '';
  }

  if (field.type === 'switch') {
    return Boolean(value);
  }

  if (field.type === 'keyValue') {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => ({
        key,
        value: String(entryValue ?? ''),
      }));
    }
  }

  if (field.type === 'arrayText' || field.type === 'arrayObject') {
    return Array.isArray(value) ? value : [];
  }

  if (field.type === 'file') {
    return value;
  }

  return value;
};
