import { Badge } from '@/components/ui/Badge';
import { categoriesApi, productsApi } from '@/services/api/catalog';
import type { CrudResourceConfig, FieldConfig, SelectOption } from '@/types/resources';
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
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Analytical Balance' },
  { name: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'analytical-balance' },
  { name: 'category_id', label: 'Category', type: 'select', required: true, options: [] },
  {
    name: 'short_description',
    label: 'Short Description',
    type: 'textarea',
    rows: 3,
    placeholder: 'Short summary for the product list card.',
    colSpan: 2,
  },
  {
    name: 'description',
    label: 'Full Description',
    type: 'textarea',
    rows: 6,
    placeholder: 'Detailed content for the single product detail page.',
    colSpan: 2,
  },
  {
    name: 'image',
    label: 'Product Image',
    type: 'file',
    accept: 'image/png,image/jpeg,image/webp',
    description: 'Upload a product image. Required while creating a product and optional during edits.',
    colSpan: 2,
  },
  {
    name: 'application_areas',
    label: 'Application Areas',
    type: 'arrayText',
    itemLabel: 'Application area',
    addLabel: 'Add application area',
    colSpan: 2,
  },
  {
    name: 'brochure',
    label: 'Brochure File',
    type: 'file',
    accept: 'application/pdf',
    description: 'Upload the brochure PDF. Required while creating a product and optional during edits.',
    colSpan: 2,
  },
  {
    name: 'specifications',
    label: 'Specifications',
    type: 'arrayObject',
    itemLabel: 'Specification',
    addLabel: 'Add specification',
    colSpan: 2,
    subfields: [
      { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Capacity' },
      { name: 'value', label: 'Value', type: 'text', required: true, placeholder: '220g / 0.0001g Readability' },
    ],
  },
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
    { key: 'slug', label: 'Slug' },
    {
      key: 'category_id',
      label: 'Category',
      render: (record) => <Badge>{categoriesMap[String(record.category_id)] ?? 'Unassigned'}</Badge>,
    },
    {
      key: 'application_areas',
      label: 'Applications',
      render: (record) =>
        `${Array.isArray(record.application_areas) ? record.application_areas.length : 0} areas`,
    },
    {
      key: 'specifications',
      label: 'Specifications',
      render: (record) => `${Array.isArray(record.specifications) ? record.specifications.length : 0} items`,
    },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['name', 'slug', 'short_description', 'description'],
  searchPlaceholder: 'Search products...',
  emptyState: {
    title: 'No products added',
    description: 'Add products and map each one to a catalog category.',
  },
  sections: [
    {
      title: 'List Card',
      description: 'Fields used in admin listing and public product cards.',
      fieldNames: ['name', 'slug', 'category_id', 'short_description', 'image', 'display_order'],
    },
    {
      title: 'Detail Page',
      description: 'Extended product content saved on the same product record.',
      fieldNames: ['description', 'application_areas', 'brochure', 'specifications'],
    },
  ],
  mapRecordToForm: (record) => ({
    ...record,
    category_id: String(record.category_id ?? ''),
    image: record.image_url ?? record.image ?? '',
    application_areas: Array.isArray(record.application_areas)
      ? record.application_areas.map((item) => String(item ?? ''))
      : [],
    brochure: record.brochure_url ?? record.brochure ?? '',
    specifications: Array.isArray(record.specifications)
      ? record.specifications.map((item) => ({
          label: String(item?.label ?? ''),
          value: String(item?.value ?? ''),
        }))
      : [],
  }),
  transformPayload: (values) => {
    const payload = new FormData();
    const applicationAreas = Array.isArray(values.application_areas)
      ? values.application_areas.map((item) => String(item).trim()).filter(Boolean)
      : [];
    const specifications = Array.isArray(values.specifications)
      ? values.specifications
          .map((item) => ({
            label: String(item?.label ?? '').trim(),
            value: String(item?.value ?? '').trim(),
          }))
          .filter((item) => item.label && item.value)
      : [];

    payload.append('name', String(values.name ?? '').trim());
    payload.append('slug', String(values.slug ?? '').trim());
    payload.append('category_id', String(Number(values.category_id)));
    payload.append('short_description', String(values.short_description ?? '').trim());
    payload.append('description', String(values.description ?? '').trim());
    payload.append('display_order', String(Number(values.display_order) || 0));
    payload.append('application_areas', JSON.stringify(applicationAreas));
    payload.append('specifications', JSON.stringify(specifications));

    if (values.image instanceof File) {
      payload.append('image', values.image);
    }

    if (values.brochure instanceof File) {
      payload.append('brochure', values.brochure);
    }

    return payload;
  },
});
