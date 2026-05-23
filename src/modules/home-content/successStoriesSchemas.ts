import { z } from 'zod';

const numberField = (label: string) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return NaN;
      }

      return Number(value);
    },
    z
      .number({ invalid_type_error: `${label} must be a valid number.` })
      .int(`${label} must be a whole number.`)
      .min(1, `${label} must be at least 1.`),
  );

export const successStorySectionSchema = z.object({
  section_label: z.string().trim().min(1, 'Section label is required.'),
  section_title: z.string().trim().min(1, 'Section title is required.'),
  section_subtitle: z.string().trim().min(1, 'Section subtitle is required.'),
  is_active: z.boolean().default(true),
});

export const successStoryStateSchema = z.object({
  state_name: z.string().trim().min(1, 'State name is required.'),
  project_count: z.string().trim().min(1, 'Project count is required.'),
  display_order: numberField('Display order'),
  is_active: z.boolean().default(true),
});

export const successStoryServiceSchema = z.object({
  service_name: z.string().trim().min(1, 'Service name is required.'),
  display_order: numberField('Display order'),
});

export const successStoryStatSchema = z.object({
  stat_key: z.string().trim().min(1, 'Stat key is required.'),
  stat_value: z.string().trim().min(1, 'Stat value is required.'),
  stat_label: z.string().trim().min(1, 'Stat label is required.'),
  display_order: numberField('Display order'),
  is_active: z.boolean().default(true),
});
