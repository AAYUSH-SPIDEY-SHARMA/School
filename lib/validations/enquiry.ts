import { z } from 'zod';

import { CLASS_LEVELS } from '@/lib/constants/classLevels';

/**
 * Enquiry validation.
 *
 * `submitEnquiry` is the ONLY publicly invocable action in the system, so this
 * schema carries the heaviest input hardening in the project: strict shapes,
 * length caps on every string, normalisation, and a honeypot
 * (15_BACKEND_ARCHITECTURE).
 *
 * Error messages are specific and human — "Enter a 10-digit mobile number",
 * never "Invalid". A parent who cannot work out why the form is refusing them
 * simply leaves, and that is a lost admission rather than a validation event.
 */

/**
 * Indian mobile numbers begin 6–9 and have ten digits.
 *
 * Applied after stripping spaces, hyphens and a +91 prefix, because people
 * legitimately type all three and rejecting "+91 98765 43210" would be
 * rejecting a correct number.
 */
const PHONE_PATTERN = /^[6-9]\d{9}$/;

function normalisePhone(value: string): string {
  const digits = value.replace(/[\s\-()]/g, '').replace(/^\+?91/, '');
  return digits;
}

export const enquirySchema = z.object({
  parentName: z
    .string()
    .trim()
    .min(2, 'Enter your full name')
    .max(100, 'Name must be 100 characters or fewer'),

  phone: z
    .string()
    .trim()
    .transform(normalisePhone)
    .refine((value) => PHONE_PATTERN.test(value), {
      message: 'Enter a 10-digit mobile number',
    }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address')
    .max(160),

  /**
   * ⚠️ OPTIONAL BY DESIGN — this minimises the data held about a minor.
   *
   * The school can follow up perfectly well without the child's name, and
   * collecting it by default would mean holding identifying information about
   * a child for every casual enquiry.
   */
  studentName: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal('')),

  /** Nursery–Class 10 only. No Class 11 or 12 value exists in the system. */
  classApplying: z.enum(CLASS_LEVELS, {
    message: 'Select the class you are applying for',
  }),

  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, 'Select an academic year'),

  locality: z.string().trim().max(120).optional().or(z.literal('')),

  message: z
    .string()
    .trim()
    .max(1000, 'Please keep your message under 1000 characters')
    .optional()
    .or(z.literal('')),

  /**
   * Explicit consent, required. `z.literal(true)` means an unchecked box fails
   * validation rather than quietly submitting — an enquiry record without a
   * consent basis is personal data held with no recorded justification.
   */
  consent: z.literal(true, {
    message: 'Please confirm you are happy for the school to contact you',
  }),

  /**
   * Honeypot. A real person never sees this field, so a non-empty value means
   * a bot filled every input on the page.
   *
   * Chosen over CAPTCHA deliberately: CAPTCHA is not added unless the
   * documented threshold is reached (owner decision). A honeypot costs the
   * parent nothing, whereas CAPTCHA taxes every genuine user — including the
   * ones least able to pass it — to stop a problem that may never appear.
   */
  website: z.string().max(0, 'Submission rejected.').optional().or(z.literal('')),
});

export type EnquiryFormValues = z.input<typeof enquirySchema>;
export type EnquiryInput = z.output<typeof enquirySchema>;

/* ── Management ───────────────────────────────────────────────────────────── */

export const enquiryStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

export const enquiryAssignSchema = z.object({
  id: z.string().min(1),
  /** Empty string unassigns. */
  assignedToId: z.string().optional().or(z.literal('')),
});

export const enquiryNoteSchema = z.object({
  enquiryId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, 'Write a note')
    .max(2000, 'Keep notes under 2000 characters'),
});

export const enquiryDeleteSchema = z.object({
  id: z.string().min(1),
  /**
   * Deleting an enquiry is irreversible and is a privacy operation rather than
   * routine cleanup, so the intent is confirmed explicitly.
   */
  confirm: z.literal(true),
});
