import { z } from 'zod';

export const machineryPortfolioSectionSchema = z.object({
  section_title: z.string().trim().min(1, 'Section title is required.'),
  section_subtitle: z.string().trim().min(1, 'Section subtitle is required.'),
  section_label: z.string().trim().min(1, 'Section label is required.'),
  is_active: z.boolean().default(true),
});
