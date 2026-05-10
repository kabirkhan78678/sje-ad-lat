import { z } from 'zod';

const linkPattern = /^(\/|#|https?:\/\/)/i;

const linkField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => linkPattern.test(value), {
      message: `${label} must be a valid URL or internal path.`,
    });

export const coreServicePillarsSectionSchema = z.object({
  section_title: z.string().trim().min(1, 'Section title is required.'),
  section_subtitle: z.string().trim().min(1, 'Section subtitle is required.'),
});

export const coreServicePillarCardSchema = z.object({
  image: z.any().optional().nullable(),
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  bullet_items: z
    .array(z.string().trim().min(1, 'Bullet point is required.'))
    .min(1, 'Add at least one bullet point.')
    .max(10, 'You can add up to 10 bullet points only.'),
  learn_more_label: z.string().trim().min(1, 'Learn more label is required.'),
  learn_more_url: linkField('Learn more URL'),
  get_quote_label: z.string().trim().min(1, 'Get quote label is required.'),
  get_quote_url: linkField('Get quote URL'),
  sort_order: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return NaN;
      }

      return Number(value);
    },
    z.number({ invalid_type_error: 'Sort order must be a valid number.' }).int().min(1, 'Sort order must be at least 1.'),
  ),
  is_active: z.boolean().default(true),
});
