import type { ReactNode } from 'react';
import type { ZodTypeAny } from 'zod';

export type Primitive = string | number | boolean | null | undefined;

export type SelectOption = {
  label: string;
  value: string;
};

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'url'
  | 'file'
  | 'password'
  | 'date'
  | 'select'
  | 'switch'
  | 'arrayText'
  | 'arrayObject'
  | 'keyValue';

export type FieldUploadConfig = {
  endpoint: string;
  requestFieldName?: string;
  accept?: string;
  buttonLabel?: string;
  helpText?: string;
  responseKeys?: string[];
};

export type FieldSection = {
  title: string;
  description?: string;
  fieldNames: string[];
};

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  colSpan?: 1 | 2;
  defaultValue?: unknown;
  accept?: string;
  itemLabel?: string;
  addLabel?: string;
  subfields?: FieldConfig[];
  upload?: FieldUploadConfig;
  validation?: {
    email?: boolean;
    url?: boolean;
  };
};

export type TableColumn<TRecord> = {
  key: string;
  label: string;
  className?: string;
  render?: (record: TRecord) => ReactNode;
};

export type TableFilter<TRecord> = {
  key: keyof TRecord | string;
  label: string;
  options?: SelectOption[];
  getOptionsFromData?: boolean;
};

export type CollectionResult<TItem> = {
  items: TItem[];
  total: number;
  raw: unknown;
};

export type CrudApi<TItem = Record<string, unknown>, TPayload = unknown> = {
  list: () => Promise<CollectionResult<TItem>>;
  getById?: (id: string | number) => Promise<TItem>;
  create?: (payload: TPayload) => Promise<TItem>;
  update?: (id: string | number, payload: TPayload) => Promise<TItem>;
  delete?: (id: string | number) => Promise<void>;
};

export type SingletonApi<TItem = Record<string, unknown>, TPayload = unknown> = {
  get: () => Promise<TItem>;
  update: (payload: TPayload) => Promise<TItem>;
};

export type CrudResourceConfig<TRecord extends Record<string, any>, TFormValues> = {
  id: string;
  title: string;
  description?: string;
  entityLabel: string;
  createLabel?: string;
  formTitle?: string;
  fields: FieldConfig[];
  sections?: FieldSection[];
  columns: TableColumn<TRecord>[];
  filters?: TableFilter<TRecord>[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  schema: ZodTypeAny;
  defaultValues: TFormValues;
  api: CrudApi<TRecord, unknown>;
  emptyState?: {
    title: string;
    description: string;
  };
  mapRecordToForm?: (record: TRecord) => TFormValues;
  transformPayload?: (values: TFormValues) => unknown;
  previewTitle?: string;
};

export type SingletonResourceConfig<TRecord extends Record<string, any>, TFormValues> = {
  id: string;
  title: string;
  description?: string;
  submitLabel?: string;
  fields: FieldConfig[];
  sections?: FieldSection[];
  schema: ZodTypeAny;
  defaultValues: TFormValues;
  api: SingletonApi<TRecord, unknown>;
  mapRecordToForm?: (record: TRecord) => TFormValues;
  transformPayload?: (values: TFormValues) => unknown;
  previewTitle?: string;
  previewRenderer?: (values: TFormValues) => ReactNode;
};

export type KeyValuePair = {
  key: string;
  value: string;
};
