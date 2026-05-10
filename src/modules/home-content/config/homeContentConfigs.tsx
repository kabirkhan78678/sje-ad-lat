import { ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  clientLogosApi,
  heroContentApi,
  homeStatsApi,
  labEquipmentApi,
  machineryApi,
  productionConfigurationsApi,
  servicesApi,
  turnkeyStepsApi,
  whyChooseUsApi,
} from '@/services/api/content';
import type { CrudResourceConfig, FieldConfig, SingletonResourceConfig } from '@/types/resources';
import { keyValuePairsToObject } from '@/utils/formatters';
import { createDefaultValuesFromFields, createSchemaFromFields } from '@/utils/schema';

const textArrayField = (name: string, label: string, addLabel?: string): FieldConfig => ({
  name,
  label,
  type: 'arrayText',
  itemLabel: label.replace(/s$/, ''),
  addLabel,
  colSpan: 2,
});

const displayOrderField: FieldConfig = {
  name: 'display_order',
  label: 'Display Order',
  type: 'number',
  required: true,
  placeholder: '0',
};

const extractUploadFile = (value: unknown): File | Blob | null => {
  if (!value) {
    return null;
  }

  if (value instanceof File || value instanceof Blob) {
    return value;
  }

  if (typeof FileList !== 'undefined' && value instanceof FileList) {
    return value.item(0);
  }

  if (Array.isArray(value)) {
    const [firstValue] = value;
    return firstValue instanceof File || firstValue instanceof Blob ? firstValue : null;
  }

  return null;
};

const buildHeroPayload = (values: Record<string, any>) => {
  const payload = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (key === 'background_media') {
      const uploadFile = extractUploadFile(value);

      if (uploadFile) {
        payload.append(key, uploadFile);
      }

      return;
    }

    if (Array.isArray(value)) {
      payload.append(key, JSON.stringify(value));
      return;
    }

    if (value !== null && value !== undefined) {
      payload.append(key, String(value));
    }
  });

  return payload;
};

const heroFields: FieldConfig[] = [
  { name: 'eyebrow', label: 'Eyebrow', type: 'text', required: true, placeholder: 'Trusted Process Engineering' },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    placeholder: 'Precision turnkey beverage and food process systems',
    colSpan: 2,
  },
  {
    name: 'subtitle',
    label: 'Subtitle',
    type: 'textarea',
    required: true,
    rows: 5,
    placeholder: 'Summarize the business promise for visitors in a concise, confident voice.',
    colSpan: 2,
  },
  {
    name: 'background_media',
    label: 'Background Media File',
    type: 'file',
    description: 'Upload an image or video file instead of pasting a hosted URL.',
    accept: 'image/*,video/*',
    colSpan: 2,
  },
  { name: 'primary_button_text', label: 'Primary Button Text', type: 'text', required: true, placeholder: 'Request a Consultation' },
  {
    name: 'primary_button_link',
    label: 'Primary Button Link',
    type: 'text',
    required: true,
    placeholder: '/contact',
  },
  { name: 'secondary_button_text', label: 'Secondary Button Text', type: 'text', placeholder: 'View Capabilities' },
  {
    name: 'secondary_button_link',
    label: 'Secondary Button Link',
    type: 'text',
    placeholder: '/catalog',
  },
  {
    name: 'ribbon_links',
    label: 'Ribbon Links',
    type: 'arrayObject',
    addLabel: 'Add ribbon link',
    itemLabel: 'Link',
    colSpan: 2,
    subfields: [
      { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Beverage Lines' },
      { name: 'url', label: 'URL', type: 'text', required: true, placeholder: '/about/experience' },
    ],
  },
];

export const heroConfig: SingletonResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'home-hero',
  title: 'Hero Section',
  description: 'Control the homepage hero message, media, and top-level call-to-action links.',
  fields: heroFields,
  sections: [
    {
      title: 'Messaging',
      description: 'Set the headline and supporting narrative that anchors the homepage.',
      fieldNames: ['eyebrow', 'title', 'subtitle', 'background_media'],
    },
    {
      title: 'Call To Action',
      description: 'Keep action labels concise and destination links accurate.',
      fieldNames: [
        'primary_button_text',
        'primary_button_link',
        'secondary_button_text',
        'secondary_button_link',
      ],
    },
    {
      title: 'Ribbon Navigation',
      description: 'Highlight important quick-jump destinations beneath the hero.',
      fieldNames: ['ribbon_links'],
    },
  ],
  schema: createSchemaFromFields(heroFields),
  defaultValues: createDefaultValuesFromFields(heroFields),
  api: heroContentApi,
  transformPayload: (values) => buildHeroPayload(values),
  previewRenderer: (values) => (
    <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-none">
      <div className="space-y-5 bg-[radial-gradient(circle_at_top_left,rgba(31,159,120,0.35),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(249,143,7,0.26),transparent_24%)] px-6 py-7">
        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-200">
          {values.eyebrow || 'Eyebrow'}
        </span>
        <div className="space-y-3">
          <h3 className="font-display text-3xl font-semibold leading-tight">
            {values.title || 'Homepage headline preview'}
          </h3>
          <p className="text-sm leading-7 text-slate-200">
            {values.subtitle || 'Supporting copy will appear here as content managers update the hero section.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button>{values.primary_button_text || 'Primary CTA'}</Button>
          <Button variant="outline">{values.secondary_button_text || 'Secondary CTA'}</Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {(values.ribbon_links as Array<{ label?: string; url?: string }> | undefined)?.map((link, index) => (
            <div
              key={`${link.label}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-slate-100"
            >
              {link.label || 'Ribbon link'}
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  ),
  previewTitle: 'Hero Section API Preview',
};

const statsFields: FieldConfig[] = [
  { name: 'stat_key', label: 'Stat Key', type: 'text', required: true, placeholder: 'projects_delivered' },
  { name: 'stat_value', label: 'Stat Value', type: 'text', required: true, placeholder: '250+' },
  { name: 'stat_label', label: 'Stat Label', type: 'text', required: true, placeholder: 'Projects Delivered' },
  displayOrderField,
];

export const homeStatsConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'home-stats',
  title: 'Home Stats',
  description: 'Manage key stats shown on the homepage and keep their order consistent.',
  entityLabel: 'Stat',
  fields: statsFields,
  schema: createSchemaFromFields(statsFields),
  defaultValues: createDefaultValuesFromFields(statsFields),
  api: homeStatsApi,
  columns: [
    { key: 'stat_key', label: 'Stat Key' },
    { key: 'stat_value', label: 'Value' },
    { key: 'stat_label', label: 'Label' },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['stat_key', 'stat_label'],
  searchPlaceholder: 'Search by stat key or label...',
  emptyState: {
    title: 'No homepage stats yet',
    description: 'Add business stats to showcase milestones, capacities, or reach on the homepage.',
  },
};

const servicesFields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Turnkey Engineering Services' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder: 'Describe this service group in a concise and benefit-driven way.',
    colSpan: 2,
  },
  { name: 'icon', label: 'Icon', type: 'text', placeholder: 'settings-2' },
  {
    name: 'image_url',
    label: 'Image URL',
    type: 'url',
    placeholder: 'https://example.com/service.jpg',
    validation: { url: true },
  },
  textArrayField('service_items', 'Service Items', 'Add service item'),
  { name: 'cta_label', label: 'CTA Label', type: 'text', placeholder: 'Explore Service' },
  { name: 'cta_link', label: 'CTA Link', type: 'url', placeholder: 'https://example.com/services', validation: { url: true } },
  displayOrderField,
];

export const servicesConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'home-services',
  title: 'Services',
  description: 'Publish core service cards, service item lists, and CTA links used on the homepage.',
  entityLabel: 'Service',
  fields: servicesFields,
  schema: createSchemaFromFields(servicesFields),
  defaultValues: createDefaultValuesFromFields(servicesFields),
  api: servicesApi,
  columns: [
    { key: 'title', label: 'Title' },
    {
      key: 'service_items',
      label: 'Items',
      render: (record) => `${record.service_items?.length ?? 0} items`,
    },
    { key: 'cta_label', label: 'CTA Label' },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['title', 'description', 'cta_label'],
  searchPlaceholder: 'Search services...',
  emptyState: {
    title: 'No service blocks added',
    description: 'Add service content to organize the homepage offering overview.',
  },
};

const whyChooseUsFields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Hands-on process expertise' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder: 'Explain the operational advantage behind this value point.',
    colSpan: 2,
  },
  { name: 'icon', label: 'Icon', type: 'text', placeholder: 'badge-check' },
  displayOrderField,
];

export const whyChooseUsConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'why-choose-us',
  title: 'Why Choose Us',
  description: 'Curate the differentiators that help explain SJE’s operational strengths.',
  entityLabel: 'Value Point',
  fields: whyChooseUsFields,
  schema: createSchemaFromFields(whyChooseUsFields),
  defaultValues: createDefaultValuesFromFields(whyChooseUsFields),
  api: whyChooseUsApi,
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'icon', label: 'Icon' },
    { key: 'description', label: 'Description' },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['title', 'description'],
  searchPlaceholder: 'Search value points...',
  emptyState: {
    title: 'No differentiators configured',
    description: 'Add reasons customers should trust SJE across execution and service quality.',
  },
};

const machineryFields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Automatic Bottle Filling Line' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder: 'Describe the machine, use case, or section fit.',
    colSpan: 2,
  },
  { name: 'image_url', label: 'Image URL', type: 'url', placeholder: 'https://example.com/machine.jpg', validation: { url: true }, colSpan: 2 },
  { name: 'category', label: 'Category', type: 'text', required: true, placeholder: 'Filling' },
  { name: 'badge', label: 'Badge', type: 'text', placeholder: 'High Output' },
  { name: 'section_key', label: 'Section Key', type: 'text', required: true, placeholder: 'water-line' },
  { name: 'capacity_label', label: 'Capacity Label', type: 'text', placeholder: '12,000 BPH' },
  { name: 'automation_type', label: 'Automation Type', type: 'text', placeholder: 'Automatic' },
  textArrayField('highlights', 'Highlights', 'Add highlight'),
  { name: 'bph_min', label: 'BPH Min', type: 'number', placeholder: '5000' },
  { name: 'bph_max', label: 'BPH Max', type: 'number', placeholder: '12000' },
  displayOrderField,
];

export const machineryConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'machinery',
  title: 'Machinery',
  description: 'Manage machinery cards, filters, and output ranges shown across the homepage.',
  entityLabel: 'Machine',
  fields: machineryFields,
  schema: createSchemaFromFields(machineryFields),
  defaultValues: createDefaultValuesFromFields(machineryFields),
  api: machineryApi,
  columns: [
    {
      key: 'title',
      label: 'Machine',
      render: (record) => (
        <div className="space-y-2">
          <p className="font-semibold text-slate-900">{record.title}</p>
          {record.badge ? <Badge tone="info">{record.badge}</Badge> : null}
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    {
      key: 'section_key',
      label: 'Section Key',
      render: (record) => <Badge>{record.section_key}</Badge>,
    },
    { key: 'capacity_label', label: 'Capacity' },
    { key: 'automation_type', label: 'Automation' },
    { key: 'display_order', label: 'Order' },
  ],
  filters: [
    { key: 'section_key', label: 'All sections', getOptionsFromData: true },
    { key: 'category', label: 'All categories', getOptionsFromData: true },
  ],
  searchKeys: ['title', 'category', 'section_key', 'automation_type'],
  searchPlaceholder: 'Search machinery...',
  emptyState: {
    title: 'No machinery records found',
    description: 'Add machinery items with categories, sections, and output ranges.',
  },
};

const turnkeyFields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Site discovery and planning' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder: 'Describe this stage in the turnkey process.',
    colSpan: 2,
  },
  { name: 'icon', label: 'Icon', type: 'text', placeholder: 'map' },
  textArrayField('items', 'Items', 'Add step item'),
  displayOrderField,
];

export const turnkeyStepsConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'turnkey-steps',
  title: 'Turnkey Steps',
  description: 'Sequence the stages used to explain SJE’s turnkey project process.',
  entityLabel: 'Turnkey Step',
  fields: turnkeyFields,
  schema: createSchemaFromFields(turnkeyFields),
  defaultValues: createDefaultValuesFromFields(turnkeyFields),
  api: turnkeyStepsApi,
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'icon', label: 'Icon' },
    { key: 'items', label: 'Items', render: (record) => `${record.items?.length ?? 0} items` },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['title', 'description'],
  searchPlaceholder: 'Search turnkey steps...',
  emptyState: {
    title: 'No turnkey steps added',
    description: 'Add the process stages that explain the project journey from start to handover.',
  },
};

const productionConfigurationFields: FieldConfig[] = [
  { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Mid-volume production' },
  { name: 'bph_min', label: 'BPH Min', type: 'number', required: true, placeholder: '3000' },
  { name: 'bph_max', label: 'BPH Max', type: 'number', required: true, placeholder: '8000' },
  {
    name: 'summary',
    label: 'Summary',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder: 'Summarize where this production band is best suited.',
    colSpan: 2,
  },
  textArrayField('recommended_machines', 'Recommended Machines', 'Add machine'),
  displayOrderField,
];

export const productionConfigurationsConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'production-configurations',
  title: 'Production Configurations',
  description: 'Map production ranges to recommended machinery bundles and deployment summaries.',
  entityLabel: 'Production Configuration',
  fields: productionConfigurationFields,
  schema: createSchemaFromFields(productionConfigurationFields),
  defaultValues: createDefaultValuesFromFields(productionConfigurationFields),
  api: productionConfigurationsApi,
  columns: [
    { key: 'label', label: 'Label' },
    {
      key: 'range',
      label: 'BPH Range',
      render: (record) => `${record.bph_min ?? 0} - ${record.bph_max ?? 0}`,
    },
    {
      key: 'recommended_machines',
      label: 'Recommended Machines',
      render: (record) => `${record.recommended_machines?.length ?? 0} items`,
    },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['label', 'summary'],
  searchPlaceholder: 'Search production configurations...',
  emptyState: {
    title: 'No production ranges configured',
    description: 'Add BPH ranges and the machines recommended for each setup.',
  },
};

const labEquipmentFields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Bottle burst tester' },
  { name: 'category', label: 'Category', type: 'text', required: true, placeholder: 'Quality Control' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder: 'Describe what this lab equipment is used for.',
    colSpan: 2,
  },
  { name: 'specifications', label: 'Specifications', type: 'keyValue', colSpan: 2 },
  { name: 'image_url', label: 'Image URL', type: 'url', placeholder: 'https://example.com/lab.jpg', validation: { url: true }, colSpan: 2 },
  { name: 'icon_name', label: 'Icon Name', type: 'text', placeholder: 'flask-conical' },
  { name: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'SJE Labs' },
  { name: 'model_number', label: 'Model Number', type: 'text', placeholder: 'LAB-200' },
  { name: 'is_featured', label: 'Featured Item', type: 'switch', defaultValue: false },
  displayOrderField,
];

export const labEquipmentConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'lab-equipment',
  title: 'Lab Equipment',
  description: 'Manage laboratory and QA equipment entries, specifications, and featured badges.',
  entityLabel: 'Lab Equipment Item',
  fields: labEquipmentFields,
  schema: createSchemaFromFields(labEquipmentFields),
  defaultValues: createDefaultValuesFromFields(labEquipmentFields),
  api: labEquipmentApi,
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'manufacturer', label: 'Manufacturer' },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (record) => <Badge tone={record.is_featured ? 'success' : 'neutral'}>{record.is_featured ? 'Featured' : 'Standard'}</Badge>,
    },
    { key: 'display_order', label: 'Order' },
  ],
  filters: [{ key: 'category', label: 'All categories', getOptionsFromData: true }],
  searchKeys: ['name', 'category', 'manufacturer', 'model_number'],
  searchPlaceholder: 'Search lab equipment...',
  emptyState: {
    title: 'No lab equipment items',
    description: 'Add lab tools, specifications, and featured items for the homepage.',
  },
  mapRecordToForm: (record) => ({
    ...record,
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
};

const clientLogosFields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'ABC Beverages' },
  { name: 'logo_url', label: 'Logo URL', type: 'url', required: true, placeholder: 'https://example.com/logo.svg', validation: { url: true }, colSpan: 2 },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://client.com', validation: { url: true }, colSpan: 2 },
  displayOrderField,
];

export const clientLogosConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'client-logos',
  title: 'Client Logos',
  description: 'Manage client or partner logos, destination links, and their display order.',
  entityLabel: 'Client Logo',
  fields: clientLogosFields,
  schema: createSchemaFromFields(clientLogosFields),
  defaultValues: createDefaultValuesFromFields(clientLogosFields),
  api: clientLogosApi,
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'logo_url', label: 'Logo URL' },
    { key: 'website', label: 'Website' },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['name', 'website'],
  searchPlaceholder: 'Search client logos...',
  emptyState: {
    title: 'No logos added',
    description: 'Add logos to display customer or partner trust signals on the homepage.',
  },
};
