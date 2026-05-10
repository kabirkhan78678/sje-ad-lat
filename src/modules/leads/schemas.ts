import { z } from 'zod';

const preprocessOptionalNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
};

export const inquirySchema = z.object({
  name: z.string().trim().default(''),
  email: z.union([z.string().trim().email('Enter a valid email address.'), z.literal('')]).default(''),
  phone: z.string().trim().default(''),
  subject: z.string().trim().default(''),
  category: z.string().trim().default(''),
  message: z.string().trim().default(''),
  status: z.string().trim().min(1, 'Status is required.'),
  source: z.string().trim().default(''),
  estimated_value: z.preprocess(
    preprocessOptionalNumber,
    z
      .number({
        invalid_type_error: 'Estimated value must be a number.',
      })
      .min(0, 'Estimated value cannot be negative.')
      .optional(),
  ),
  notes: z.string().trim().default(''),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;

