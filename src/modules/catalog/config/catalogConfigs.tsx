import { Badge } from '@/components/ui/Badge';
import { categoriesApi, productsApi } from '@/services/api/catalog';
import type { CrudResourceConfig, FieldConfig, SelectOption } from '@/types/resources';
import { keyValuePairsToObject } from '@/utils/formatters';
import { createDefaultValuesFromFields, createSchemaFromFields } from '@/utils/schema';

const displayOrderField: FieldConfig = {
  name: 'display_order',
  label: 'Display Order',
  type: 'number',
  required: true,
  placeholder: '0',
};

const categoriesFields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Bottling Lines' },
  { name: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'bottling-lines' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 4,
    placeholder: 'Describe this product category.',
    colSpan: 2,
  },
  { name: 'icon', label: 'Icon', type: 'text', placeholder: 'package-search' },
  displayOrderField,
];

export const categoriesConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'catalog-categories',
  title: 'Catalog Categories',
  description: 'Create product categories with slugs, icon labels, and display sequencing.',
  entityLabel: 'Category',
  fields: categoriesFields,
  schema: createSchemaFromFields(categoriesFields),
  defaultValues: createDefaultValuesFromFields(categoriesFields),
  api: categoriesApi,
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'icon', label: 'Icon' },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['name', 'slug', 'description'],
  searchPlaceholder: 'Search categories...',
  emptyState: {
    title: 'No categories yet',
    description: 'Add catalog categories before assigning products to them.',
  },
};

const baseProductFields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Automatic Bottle Rinser' },
  { name: 'category_id', label: 'Category', type: 'select', required: true, options: [] },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 5,
    placeholder: 'Describe the product, use case, and key business value.',
    colSpan: 2,
  },
  {
    name: 'image_url',
    label: 'Image URL',
    type: 'url',
    placeholder: 'https://example.com/product.jpg',
    validation: { url: true },
    colSpan: 2,
  },
  { name: 'specifications', label: 'Specifications', type: 'keyValue', colSpan: 2 },
  displayOrderField,
];

export const createProductsConfig = (
  categoryOptions: SelectOption[],
  categoriesMap: Record<string, string>,
): CrudResourceConfig<Record<string, any>, Record<string, any>> => ({
  id: 'catalog-products',
  title: 'Catalog Products',
  description: 'Manage product records with linked categories, imagery, and structured specifications.',
  entityLabel: 'Product',
  fields: baseProductFields.map((field) =>
    field.name === 'category_id'
      ? {
          ...field,
          options: categoryOptions,
        }
      : field,
  ),
  schema: createSchemaFromFields(baseProductFields),
  defaultValues: createDefaultValuesFromFields(baseProductFields),
  api: productsApi,
  columns: [
    { key: 'name', label: 'Name' },
    {
      key: 'category_id',
      label: 'Category',
      render: (record) => <Badge>{categoriesMap[String(record.category_id)] ?? 'Unassigned'}</Badge>,
    },
    {
      key: 'specifications',
      label: 'Specifications',
      render: (record) =>
        `${Array.isArray(record.specifications) ? record.specifications.length : Object.keys(record.specifications ?? {}).length} items`,
    },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['name', 'description'],
  searchPlaceholder: 'Search products...',
  emptyState: {
    title: 'No products added',
    description: 'Add products and map each one to a catalog category.',
  },
  mapRecordToForm: (record) => ({
    ...record,
    category_id: String(record.category_id ?? ''),
    specifications:
      Array.isArray(record.specifications)
        ? record.specifications
        : Object.entries(record.specifications ?? {}).map(([key, value]) => ({
            key,
            value: String(value ?? ''),
          })),
  }),
  transformPayload: (values) => ({
    ...values,
    specifications: keyValuePairsToObject(values.specifications ?? []),
  }),
});
