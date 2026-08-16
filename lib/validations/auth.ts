import { z } from 'zod';

import { MIN_PASSWORD_LENGTH } from '@/lib/auth/password';

/**
 * Sign-in input.
 *
 * The password is NOT length-checked here. A sign-in form must accept whatever
 * the user types and simply fail to match — telling an attacker "that password
 * is too short to be valid" leaks the password policy, and telling a legitimate
 * user with a legacy password that their own password is invalid is worse.
 */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Password policy, applied when a password is SET (creation, reset) — not when
 * it is used to sign in.
 *
 * Length only. Composition rules ("one uppercase, one digit, one symbol")
 * reliably produce `Password1!` and are not imposed; NIST SP 800-63B takes the
 * same position.
 */
export const passwordSchema = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  )
  .max(200, 'Password must be 200 characters or fewer');

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: passwordSchema,
  role: z.enum(['SUPER_ADMIN', 'EDITOR', 'ADMISSIONS_MANAGER']),
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  role: z.enum(['SUPER_ADMIN', 'EDITOR', 'ADMISSIONS_MANAGER']),
  isActive: z.boolean(),
});

export const resetPasswordSchema = z.object({
  id: z.string().min(1),
  password: passwordSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
