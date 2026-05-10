import { csrInitiativesApi } from '@/services/api/content';
import type { CrudResourceConfig, FieldConfig } from '@/types/resources';
import { createDefaultValuesFromFields, createSchemaFromFields } from '@/utils/schema';

const csrFields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Water access awareness drive' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 5,
    placeholder: 'Describe the CSR initiative and its impact.',
    colSpan: 2,
  },
  {
    name: 'image_url',
    label: 'Image URL',
    type: 'url',
    placeholder: 'https://example.com/csr.jpg',
    validation: { url: true },
    colSpan: 2,
  },
  { name: 'display_order', label: 'Display Order', type: 'number', required: true, placeholder: '0' },
];

export const csrInitiativesConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'csr-initiatives',
  title: 'CSR Initiatives',
  description: 'Manage community impact stories and supporting imagery for social responsibility content.',
  entityLabel: 'CSR Initiative',
  fields: csrFields,
  schema: createSchemaFromFields(csrFields),
  defaultValues: createDefaultValuesFromFields(csrFields),
  api: csrInitiativesApi,
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['title', 'description'],
  searchPlaceholder: 'Search CSR initiatives...',
  emptyState: {
    title: 'No CSR initiatives added',
    description: 'Add community-focused stories and media for the social section.',
  },
};
