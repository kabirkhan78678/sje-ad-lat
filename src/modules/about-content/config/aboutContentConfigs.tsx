import { Badge } from '@/components/ui/Badge';
import {
  certificationsApi,
  companyProfileApi,
  companyTimelineApi,
  leadershipTeamApi,
  projectsApi,
} from '@/services/api/content';
import type { CrudResourceConfig, FieldConfig, SingletonResourceConfig } from '@/types/resources';
import { formatDate } from '@/utils/formatters';
import { createDefaultValuesFromFields, createSchemaFromFields } from '@/utils/schema';

const displayOrderField: FieldConfig = {
  name: 'display_order',
  label: 'Display Order',
  type: 'number',
  required: true,
  placeholder: '0',
};

const textArrayField = (name: string, label: string): FieldConfig => ({
  name,
  label,
  type: 'arrayText',
  addLabel: `Add ${label.replace(/s$/, '').toLowerCase()}`,
  itemLabel: label.replace(/s$/, ''),
  colSpan: 2,
});

const companyProfileFields: FieldConfig[] = [
  { name: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'Sri Jaya Enterprises' },
  {
    name: 'about_summary',
    label: 'About Summary',
    type: 'textarea',
    required: true,
    rows: 5,
    placeholder: 'Summarize the company story, expertise, and market positioning.',
    colSpan: 2,
  },
  { name: 'registration_type', label: 'Registration Type', type: 'text', placeholder: 'Private Limited' },
  { name: 'founded_year', label: 'Founded Year', type: 'number', placeholder: '1998' },
  { name: 'headquarters', label: 'Headquarters', type: 'text', placeholder: 'Bengaluru, Karnataka' },
  { name: 'primary_phone', label: 'Primary Phone', type: 'text', placeholder: '+91 98765 43210' },
  {
    name: 'primary_email',
    label: 'Primary Email',
    type: 'email',
    placeholder: 'hello@sje.com',
    validation: { email: true },
  },
  textArrayField('industries_served', 'Industries Served'),
  textArrayField('service_divisions', 'Service Divisions'),
  textArrayField('core_values', 'Core Values'),
  {
    name: 'hero_stats',
    label: 'Hero Stats',
    type: 'arrayObject',
    addLabel: 'Add hero stat',
    itemLabel: 'Stat',
    colSpan: 2,
    subfields: [
      { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Installed lines' },
      { name: 'value', label: 'Value', type: 'text', required: true, placeholder: '150+' },
    ],
  },
];

export const companyProfileConfig: SingletonResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'company-profile',
  title: 'Company Profile',
  description: 'Maintain core company facts, summary messaging, and supporting profile details.',
  fields: companyProfileFields,
  sections: [
    {
      title: 'Company Overview',
      description: 'High-level company identity, summary, and business registration details.',
      fieldNames: ['company_name', 'about_summary', 'registration_type', 'founded_year'],
    },
    {
      title: 'Primary Contact',
      description: 'Main headquarters and contact data used across the public website.',
      fieldNames: ['headquarters', 'primary_phone', 'primary_email'],
    },
    {
      title: 'Market and Services',
      description: 'List industries, divisions, and structured highlight stats.',
      fieldNames: ['industries_served', 'service_divisions', 'hero_stats'],
    },
    {
      title: 'Core Values',
      description: 'Capture guiding principles that reinforce company trust and positioning.',
      fieldNames: ['core_values'],
    },
  ],
  schema: createSchemaFromFields(companyProfileFields),
  defaultValues: createDefaultValuesFromFields(companyProfileFields),
  api: companyProfileApi,
  previewTitle: 'Company Profile API Preview',
};

const projectsFields: FieldConfig[] = [
  { name: 'state_name', label: 'State Name', type: 'text', required: true, placeholder: 'Tamil Nadu' },
  { name: 'project_count', label: 'Project Count', type: 'number', required: true, placeholder: '24' },
  textArrayField('services', 'Services'),
  displayOrderField,
];

export const projectsConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'projects',
  title: 'Projects',
  description: 'Manage project coverage by state, including counts and related service capabilities.',
  entityLabel: 'Project Region',
  fields: projectsFields,
  schema: createSchemaFromFields(projectsFields),
  defaultValues: createDefaultValuesFromFields(projectsFields),
  api: projectsApi,
  columns: [
    { key: 'state_name', label: 'State' },
    { key: 'project_count', label: 'Projects' },
    { key: 'services', label: 'Services', render: (record) => `${record.services?.length ?? 0} items` },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['state_name'],
  searchPlaceholder: 'Search states...',
  emptyState: {
    title: 'No project regions added',
    description: 'Add state-level project coverage with service summaries.',
  },
};

const certificationsFields: FieldConfig[] = [
  { name: 'name', label: 'Certification Name', type: 'text', required: true, placeholder: 'ISO 9001:2015' },
  { name: 'code', label: 'Code', type: 'text', placeholder: 'QMS-ISO-9001' },
  { name: 'issuer', label: 'Issuer', type: 'text', required: true, placeholder: 'Bureau Veritas' },
  { name: 'issue_date', label: 'Issue Date', type: 'date' },
  { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 4,
    placeholder: 'Describe what the certification covers.',
    colSpan: 2,
  },
  {
    name: 'certificate_url',
    label: 'Certificate URL',
    type: 'url',
    placeholder: 'https://example.com/certificate.pdf',
    validation: { url: true },
    colSpan: 2,
  },
  {
    name: 'icon_url',
    label: 'Icon URL',
    type: 'url',
    placeholder: 'https://example.com/icon.svg',
    validation: { url: true },
    colSpan: 2,
  },
  displayOrderField,
];

const getExpiryTone = (expiryDate?: string | null) => {
  if (!expiryDate) {
    return 'neutral' as const;
  }

  const now = new Date();
  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) {
    return 'neutral' as const;
  }

  if (expiry < now) {
    return 'danger' as const;
  }

  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 90) {
    return 'warning' as const;
  }

  return 'success' as const;
};

export const certificationsConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'certifications',
  title: 'Certifications',
  description: 'Track certification issuers, issue windows, links, and expiry visibility.',
  entityLabel: 'Certification',
  fields: certificationsFields,
  schema: createSchemaFromFields(certificationsFields),
  defaultValues: createDefaultValuesFromFields(certificationsFields),
  api: certificationsApi,
  columns: [
    { key: 'name', label: 'Certification' },
    { key: 'issuer', label: 'Issuer' },
    { key: 'issue_date', label: 'Issued', render: (record) => formatDate(record.issue_date) },
    {
      key: 'expiry_date',
      label: 'Expiry',
      render: (record) => (
        <Badge tone={getExpiryTone(record.expiry_date)}>
          {record.expiry_date ? formatDate(record.expiry_date) : 'No expiry'}
        </Badge>
      ),
    },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['name', 'issuer', 'code'],
  searchPlaceholder: 'Search certifications...',
  emptyState: {
    title: 'No certifications configured',
    description: 'Add certifications and visibility details so the about page stays current.',
  },
};

const leadershipFields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'S. Kumar' },
  { name: 'role', label: 'Role', type: 'text', required: true, placeholder: 'Managing Director' },
  { name: 'experience', label: 'Experience', type: 'text', placeholder: '18+ years in process engineering' },
  { name: 'focus', label: 'Focus', type: 'text', placeholder: 'Turnkey execution and quality systems' },
  {
    name: 'bio',
    label: 'Bio',
    type: 'textarea',
    rows: 5,
    placeholder: 'Write a concise leadership bio.',
    colSpan: 2,
  },
  {
    name: 'profile_image_url',
    label: 'Profile Image URL',
    type: 'url',
    placeholder: 'https://example.com/profile.jpg',
    validation: { url: true },
    colSpan: 2,
  },
  displayOrderField,
];

export const leadershipTeamConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'leadership-team',
  title: 'Leadership Team',
  description: 'Manage executive and leadership profiles presented on the about page.',
  entityLabel: 'Leader',
  fields: leadershipFields,
  schema: createSchemaFromFields(leadershipFields),
  defaultValues: createDefaultValuesFromFields(leadershipFields),
  api: leadershipTeamApi,
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'experience', label: 'Experience' },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['name', 'role', 'focus'],
  searchPlaceholder: 'Search leadership team...',
  emptyState: {
    title: 'No leadership profiles yet',
    description: 'Add leadership bios and profile details to complete the about page.',
  },
};

const timelineFields: FieldConfig[] = [
  { name: 'milestone_year', label: 'Milestone Year', type: 'number', required: true, placeholder: '2008' },
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Expanded turnkey beverage division' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 4,
    placeholder: 'Explain the importance of this milestone.',
    colSpan: 2,
  },
  textArrayField('highlights', 'Highlights'),
  displayOrderField,
];

export const companyTimelineConfig: CrudResourceConfig<Record<string, any>, Record<string, any>> = {
  id: 'company-timeline',
  title: 'Company Timeline',
  description: 'Build a chronological company story through milestones and supporting highlights.',
  entityLabel: 'Milestone',
  fields: timelineFields,
  schema: createSchemaFromFields(timelineFields),
  defaultValues: createDefaultValuesFromFields(timelineFields),
  api: companyTimelineApi,
  columns: [
    { key: 'milestone_year', label: 'Year' },
    { key: 'title', label: 'Title' },
    { key: 'highlights', label: 'Highlights', render: (record) => `${record.highlights?.length ?? 0} items` },
    { key: 'display_order', label: 'Order' },
  ],
  searchKeys: ['title', 'description'],
  searchPlaceholder: 'Search milestones...',
  emptyState: {
    title: 'No milestones yet',
    description: 'Add company milestones to tell the SJE growth story over time.',
  },
};
