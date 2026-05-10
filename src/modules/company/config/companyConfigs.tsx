import { callToActionApi, contactInfoApi } from '@/services/api/company';
import type { FieldConfig, SingletonResourceConfig } from '@/types/resources';
import { createDefaultValuesFromFields, createSchemaFromFields } from '@/utils/schema';

const contactInfoFields: FieldConfig[] = [
  { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'Sri Jaya Enterprises' },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder: 'Full address used on the contact page.',
    colSpan: 2,
  },
  { name: 'phone', label: 'Phone', type: 'text', required: true, placeholder: '+91 98765 43210' },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'hello@sje.com',
    validation: { email: true },
  },
  {
    name: 'map_embed_url',
    label: 'Map Embed URL',
    type: 'url',
    placeholder: 'https://maps.google.com/...',
    validation: { url: true },
    colSpan: 2,
  },
];

export const contactInfoConfig: SingletonResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'contact-info',
  title: 'Contact Info',
  description: 'Update the public company contact details and embedded map destination.',
  fields: contactInfoFields,
  sections: [
    {
      title: 'Company Contact',
      description: 'Core contact details shown on the company page and footer.',
      fieldNames: ['company_name', 'address', 'phone', 'email'],
    },
    {
      title: 'Map Embed',
      description: 'Paste the public map embed or location URL used by the website.',
      fieldNames: ['map_embed_url'],
    },
  ],
  schema: createSchemaFromFields(contactInfoFields),
  defaultValues: createDefaultValuesFromFields(contactInfoFields),
  api: contactInfoApi,
  previewTitle: 'Contact Info API Preview',
};

const callToActionFields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Ready to scale your next line?' },
  {
    name: 'subtitle',
    label: 'Subtitle',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder: 'Support the CTA with a short confidence-building message.',
    colSpan: 2,
  },
  { name: 'button_text', label: 'Button Text', type: 'text', required: true, placeholder: 'Talk to Our Team' },
  {
    name: 'button_link',
    label: 'Button Link',
    type: 'url',
    required: true,
    placeholder: 'https://example.com/contact',
    validation: { url: true },
  },
];

export const callToActionConfig: SingletonResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'call-to-action',
  title: 'Call To Action',
  description: 'Control the reusable public CTA block used to push visitors into inquiry flows.',
  fields: callToActionFields,
  schema: createSchemaFromFields(callToActionFields),
  defaultValues: createDefaultValuesFromFields(callToActionFields),
  api: callToActionApi,
  previewRenderer: (values) => (
    <div className="rounded-[1.75rem] bg-slate-950 px-6 py-8 text-white">
      <h3 className="font-display text-3xl font-semibold">{values.title || 'CTA title preview'}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-200">
        {values.subtitle || 'Subtitle content will appear here when saved.'}
      </p>
      <button className="mt-6 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white">
        {values.button_text || 'CTA Button'}
      </button>
    </div>
  ),
  previewTitle: 'Call To Action API Preview',
};
