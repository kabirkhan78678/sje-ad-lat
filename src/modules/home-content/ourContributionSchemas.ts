import { z } from 'zod';

const linkPattern = /^(\/|#|https?:\/\/)/i;

export const ourContributionSectionSchema = z.object({
  section_label: z.string().trim().min(1, 'Section label is required.'),
  section_title: z.string().trim().min(1, 'Section title is required.'),
  section_subtitle: z.string().trim().min(1, 'Section subtitle is required.'),
  cta_title: z.string().trim().min(1, 'CTA title is required.'),
  cta_description: z.string().trim().min(1, 'CTA description is required.'),
  cta_button_text: z.string().trim().min(1, 'CTA button text is required.'),
  cta_button_link: z
    .string()
    .trim()
    .min(1, 'CTA button link is required.')
    .refine((value) => linkPattern.test(value), {
      message: 'CTA button link must be a valid URL or internal path.',
    }),
  is_active: z.boolean().default(true),
});

export const ourContributionInitiativeSchema = z.object({
  badge: z.string().trim().min(1, 'Badge is required.'),
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  image: z.any().optional().nullable(),
  display_order: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return NaN;
      }

      return Number(value);
    },
    z
      .number({ invalid_type_error: 'Display order must be a valid number.' })
      .int('Display order must be a whole number.')
      .min(1, 'Display order must be at least 1.'),
  ),
  is_active: z.boolean().default(true),
});
