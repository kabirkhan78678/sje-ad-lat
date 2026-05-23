import { z } from 'zod';

import type {
  FeaturedProjectEquipmentFormValues,
  FeaturedProjectFormValues,
  ProjectTestimonialFormValues,
  ProjectsCalculatorFormValues,
  ProjectsCtaFormValues,
  ProjectsFeaturedSectionFormValues,
  ProjectsHeroFormValues,
  ProjectsTestimonialsSectionFormValues,
  ProjectsTopStatFormValues,
} from '@/modules/catalog/types/projectsPage';
import type { FieldConfig } from '@/types/resources';

const linkLike = (value: string) =>
  value.length === 0 ||
  /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(value);

const requiredLinkLabelSchema = z.string().trim();

const linkFieldSchema = z
  .string()
  .trim()
  .refine((value) => linkLike(value), 'Enter a valid URL or internal path.');

const positiveOrderSchema = z.coerce.number().int().min(1, 'Display order must be at least 1.');

export const projectsHeroSchema = z
  .object({
    section_label: z.string().trim(),
    title: z.string().trim().min(1, 'Title is required.'),
    subtitle: z.string().trim().min(1, 'Subtitle is required.'),
    primary_cta_label: requiredLinkLabelSchema,
    primary_cta_link: linkFieldSchema,
    secondary_cta_label: requiredLinkLabelSchema,
    secondary_cta_link: linkFieldSchema,
    is_active: z.boolean().default(true),
  })
  .superRefine((value, context) => {
    if (value.primary_cta_label && !value.primary_cta_link) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primary_cta_link'],
        message: 'Primary CTA link is required when label is provided.',
      });
    }

    if (value.primary_cta_link && !value.primary_cta_label) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primary_cta_label'],
        message: 'Primary CTA label is required when link is provided.',
      });
    }

    if (value.secondary_cta_label && !value.secondary_cta_link) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondary_cta_link'],
        message: 'Secondary CTA link is required when label is provided.',
      });
    }

    if (value.secondary_cta_link && !value.secondary_cta_label) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondary_cta_label'],
        message: 'Secondary CTA label is required when link is provided.',
      });
    }
  });

export const projectsHeroDefaultValues: ProjectsHeroFormValues = {
  section_label: '',
  title: '',
  subtitle: '',
  primary_cta_label: '',
  primary_cta_link: '',
  secondary_cta_label: '',
  secondary_cta_link: '',
  is_active: true,
};

export const projectsHeroFields: FieldConfig[] = [
  { name: 'section_label', label: 'Section Label', type: 'text', placeholder: 'Catalog Projects' },
  { name: 'is_active', label: 'Active', type: 'switch' },
  { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
  { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 4, required: true, colSpan: 2 },
  { name: 'primary_cta_label', label: 'Primary CTA Label', type: 'text' },
  { name: 'primary_cta_link', label: 'Primary CTA Link', type: 'text', placeholder: '/contact-us' },
  { name: 'secondary_cta_label', label: 'Secondary CTA Label', type: 'text' },
  { name: 'secondary_cta_link', label: 'Secondary CTA Link', type: 'text', placeholder: '/catalog/products' },
];

export const projectsTopStatSchema = z.object({
  stat_key: z.string().trim().min(1, 'Stat key is required.'),
  stat_value: z.string().trim().min(1, 'Stat value is required.'),
  stat_label: z.string().trim().min(1, 'Stat label is required.'),
  display_order: positiveOrderSchema,
  is_active: z.boolean().default(true),
});

export const projectsTopStatDefaultValues: ProjectsTopStatFormValues = {
  stat_key: '',
  stat_value: '',
  stat_label: '',
  display_order: 1,
  is_active: true,
};

export const projectsFeaturedSectionSchema = z.object({
  section_label: z.string().trim(),
  section_title: z.string().trim().min(1, 'Section title is required.'),
  section_subtitle: z.string().trim().min(1, 'Section subtitle is required.'),
  is_active: z.boolean().default(true),
});

export const projectsFeaturedSectionDefaultValues: ProjectsFeaturedSectionFormValues = {
  section_label: '',
  section_title: '',
  section_subtitle: '',
  is_active: true,
};

export const projectsFeaturedSectionFields: FieldConfig[] = [
  { name: 'section_label', label: 'Section Label', type: 'text', placeholder: 'Featured Projects' },
  { name: 'is_active', label: 'Active', type: 'switch' },
  { name: 'section_title', label: 'Section Title', type: 'text', required: true, colSpan: 2 },
  { name: 'section_subtitle', label: 'Section Subtitle', type: 'textarea', rows: 4, required: true, colSpan: 2 },
];

export const featuredProjectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required.'),
  year: z.string().trim().min(1, 'Year is required.'),
  location: z.string().trim().min(1, 'Location is required.'),
  industry: z.string().trim().min(1, 'Industry is required.'),
  capacity: z.string().trim().min(1, 'Capacity is required.'),
  image_url: z.string().trim().min(1, 'Image URL is required.'),
  details_link: linkFieldSchema,
  display_order: positiveOrderSchema,
  is_active: z.boolean().default(true),
});

export const featuredProjectDefaultValues: FeaturedProjectFormValues = {
  title: '',
  year: '',
  location: '',
  industry: '',
  capacity: '',
  image_url: '',
  details_link: '',
  display_order: 1,
  is_active: true,
};

export const featuredProjectEquipmentSchema = z.object({
  equipment_title: z.string().trim().min(1, 'Equipment title is required.'),
  display_order: positiveOrderSchema,
  is_active: z.boolean().default(true),
});

export const featuredProjectEquipmentDefaultValues: FeaturedProjectEquipmentFormValues = {
  equipment_title: '',
  display_order: 1,
  is_active: true,
};

export const projectsCalculatorSchema = z
  .object({
    section_title: z.string().trim().min(1, 'Section title is required.'),
    section_subtitle: z.string().trim().min(1, 'Section subtitle is required.'),
    min_value: z.coerce.number(),
    max_value: z.coerce.number(),
    step_value: z.coerce.number().positive('Step value must be greater than 0.'),
    default_value: z.coerce.number(),
    unit_label: z.string().trim().min(1, 'Unit label is required.'),
    button_label: z.string().trim(),
    button_link: linkFieldSchema,
    action_key: z.string().trim(),
    formula_type: z.string().trim().min(1, 'Formula type is required.'),
    formula_config_json: z
      .string()
      .trim()
      .min(1, 'Formula config JSON is required.')
      .refine((value) => {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      }, 'Formula config must be valid JSON.'),
    is_active: z.boolean().default(true),
  })
  .superRefine((value, context) => {
    if (value.min_value > value.max_value) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['max_value'],
        message: 'Max value must be greater than or equal to min value.',
      });
    }

    if (value.default_value < value.min_value || value.default_value > value.max_value) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['default_value'],
        message: 'Default value must be between min and max.',
      });
    }

    if (!value.button_link && !value.action_key) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['button_link'],
        message: 'Provide either a button link or an action key.',
      });
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['action_key'],
        message: 'Provide either an action key or a button link.',
      });
    }
  });

export const projectsCalculatorDefaultValues: ProjectsCalculatorFormValues = {
  section_title: '',
  section_subtitle: '',
  min_value: 0,
  max_value: 100,
  step_value: 1,
  default_value: 0,
  unit_label: '',
  button_label: '',
  button_link: '',
  action_key: '',
  formula_type: '',
  formula_config_json: '{}',
  is_active: true,
};

export const projectsCalculatorFields: FieldConfig[] = [
  { name: 'section_title', label: 'Section Title', type: 'text', required: true, colSpan: 2 },
  { name: 'section_subtitle', label: 'Section Subtitle', type: 'textarea', rows: 4, required: true, colSpan: 2 },
  { name: 'min_value', label: 'Min Value', type: 'number', required: true },
  { name: 'max_value', label: 'Max Value', type: 'number', required: true },
  { name: 'step_value', label: 'Step Value', type: 'number', required: true },
  { name: 'default_value', label: 'Default Value', type: 'number', required: true },
  { name: 'unit_label', label: 'Unit Label', type: 'text', required: true, placeholder: 'TPD' },
  { name: 'formula_type', label: 'Formula Type', type: 'text', required: true, placeholder: 'linear' },
  { name: 'button_label', label: 'Button Label', type: 'text', placeholder: 'Request Proposal' },
  { name: 'action_key', label: 'Action Key', type: 'text', placeholder: 'open_project_quote_modal' },
  { name: 'button_link', label: 'Button Link', type: 'text', placeholder: '/contact-us' },
  { name: 'is_active', label: 'Active', type: 'switch' },
  {
    name: 'formula_config_json',
    label: 'Formula Config JSON',
    type: 'textarea',
    rows: 8,
    required: true,
    colSpan: 2,
    description: 'Provide valid JSON used by the public calculator formula logic.',
  },
];

export const projectsTestimonialsSectionSchema = z.object({
  section_label: z.string().trim(),
  section_title: z.string().trim().min(1, 'Section title is required.'),
  section_subtitle: z.string().trim().min(1, 'Section subtitle is required.'),
  is_active: z.boolean().default(true),
});

export const projectsTestimonialsSectionDefaultValues: ProjectsTestimonialsSectionFormValues = {
  section_label: '',
  section_title: '',
  section_subtitle: '',
  is_active: true,
};

export const projectsTestimonialsSectionFields: FieldConfig[] = [
  { name: 'section_label', label: 'Section Label', type: 'text', placeholder: 'Client Testimonials' },
  { name: 'is_active', label: 'Active', type: 'switch' },
  { name: 'section_title', label: 'Section Title', type: 'text', required: true, colSpan: 2 },
  { name: 'section_subtitle', label: 'Section Subtitle', type: 'textarea', rows: 4, required: true, colSpan: 2 },
];

export const projectTestimonialSchema = z.object({
  client_name: z.string().trim().min(1, 'Client name is required.'),
  client_role: z.string().trim(),
  quote: z.string().trim().min(1, 'Quote is required.'),
  initials: z.string().trim(),
  avatar_url: z.string().trim(),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1.').max(5, 'Rating cannot exceed 5.'),
  display_order: positiveOrderSchema,
  is_active: z.boolean().default(true),
});

export const projectTestimonialDefaultValues: ProjectTestimonialFormValues = {
  client_name: '',
  client_role: '',
  quote: '',
  initials: '',
  avatar_url: '',
  rating: 5,
  display_order: 1,
  is_active: true,
};

export const projectsCtaSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required.'),
    subtitle: z.string().trim().min(1, 'Subtitle is required.'),
    primary_cta_label: requiredLinkLabelSchema,
    primary_cta_link: linkFieldSchema,
    secondary_cta_label: requiredLinkLabelSchema,
    secondary_cta_link: linkFieldSchema,
    is_active: z.boolean().default(true),
  })
  .superRefine((value, context) => {
    if (value.primary_cta_label && !value.primary_cta_link) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primary_cta_link'],
        message: 'Primary CTA link is required when label is provided.',
      });
    }

    if (value.primary_cta_link && !value.primary_cta_label) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primary_cta_label'],
        message: 'Primary CTA label is required when link is provided.',
      });
    }

    if (value.secondary_cta_label && !value.secondary_cta_link) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondary_cta_link'],
        message: 'Secondary CTA link is required when label is provided.',
      });
    }

    if (value.secondary_cta_link && !value.secondary_cta_label) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondary_cta_label'],
        message: 'Secondary CTA label is required when link is provided.',
      });
    }
  });

export const projectsCtaDefaultValues: ProjectsCtaFormValues = {
  title: '',
  subtitle: '',
  primary_cta_label: '',
  primary_cta_link: '',
  secondary_cta_label: '',
  secondary_cta_link: '',
  is_active: true,
};

export const projectsCtaFields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
  { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 4, required: true, colSpan: 2 },
  { name: 'primary_cta_label', label: 'Primary CTA Label', type: 'text' },
  { name: 'primary_cta_link', label: 'Primary CTA Link', type: 'text', placeholder: '/contact-us' },
  { name: 'secondary_cta_label', label: 'Secondary CTA Label', type: 'text' },
  { name: 'secondary_cta_link', label: 'Secondary CTA Link', type: 'text', placeholder: '/catalog/products' },
  { name: 'is_active', label: 'Active', type: 'switch' },
];
