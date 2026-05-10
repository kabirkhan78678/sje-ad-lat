import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, 'Reset token is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirm_password: z.string().min(8, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  });
