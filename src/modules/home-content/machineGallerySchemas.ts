import { z } from 'zod';

export const machineGalleryImageSchema = z.object({
  id: z.number().int().positive().optional(),
  src: z.string().default(''),
  alt: z.string().default(''),
  span: z.string().default(''),
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
  machine_id: z.number().int().positive().nullable().optional(),
  machine_title: z.string().default('').optional(),
});

export const machineGallerySchema = z.object({
  section_label: z.string().trim().min(1, 'Section label is required.'),
  section_title: z.string().trim().min(1, 'Section title is required.'),
  section_description: z.string().trim().min(1, 'Section description is required.'),
  selected_machine_ids: z
    .array(z.number().int().positive())
    .min(1, 'Select at least 1 machine.')
    .max(8, 'A maximum of 8 machines can be selected.')
    .optional(),
  images: z
    .array(machineGalleryImageSchema)
    .min(1, 'At least 1 gallery item is required.')
    .max(8, 'A maximum of 8 gallery items are allowed.'),
});
