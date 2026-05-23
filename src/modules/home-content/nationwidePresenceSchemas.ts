import { z } from 'zod';

const integerField = (label: string) =>
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

export const nationwidePresenceSectionSchema = z.object({
  section_label: z.string().trim().min(1, 'Section label is required.'),
  section_title: z.string().trim().min(1, 'Section title is required.'),
  section_subtitle: z.string().trim().min(1, 'Section subtitle is required.'),
  is_active: z.boolean().default(true),
});

export const nationwidePresenceStateSchema = z.object({
  state_name: z.string().trim().min(1, 'State name is required.'),
  project_count: z.string().trim().min(1, 'Project count is required.'),
  display_order: integerField('Display order'),
  is_active: z.boolean().default(true),
});

export const nationwidePresenceStateServiceSchema = z.object({
  service_title: z.string().trim().min(1, 'Service title is required.'),
  display_order: integerField('Display order'),
  is_active: z.boolean().default(true),
});

export const nationwidePresenceLocationSchema = z.object({
  city_name: z.string().trim().min(1, 'City name is required.'),
  short_code: z
    .string()
    .trim()
    .min(1, 'Short code is required.')
    .max(3, 'Short code must be 2 or 3 characters.'),
  subtitle: z.string().trim().min(1, 'Subtitle is required.'),
  state_id: integerField('State'),
  display_order: integerField('Display order'),
  is_active: z.boolean().default(true),
});

export const nationwidePresenceStatSchema = z.object({
  stat_key: z.string().trim().min(1, 'Stat key is required.'),
  stat_value: z.string().trim().min(1, 'Stat value is required.'),
  stat_label: z.string().trim().min(1, 'Stat label is required.'),
  display_order: integerField('Display order'),
  is_active: z.boolean().default(true),
});
