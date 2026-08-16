import { z } from 'zod';

/**
 * Content validation schemas — shared by client and server.
 *
 * The client uses these for immediate feedback. The server re-validates with
 * the same schema, every time, because client validation is user experience and
 * never a security control (locked security rules B and E). A Server Action is
 * a directly invocable HTTP endpoint; whatever the form did is irrelevant to
 * what arrives.
 *
 * Principles: trim and normalise · cap every string length · reject rather than
 * coerce · error messages that are specific and human ("Enter a 10-digit mobile
 * number", not "Invalid").
 */

const cuid = z.string().min(1, 'Missing identifier');

/** Titles are the most-seen strings on the site; a blank one breaks listings. */
const title = z
  .string()
  .trim()
  .min(3, 'Title must be at least 3 characters')
  .max(180, 'Title must be 180 characters or fewer');

/**
 * A slug may be supplied manually, but is constrained to the same shape
 * `slugify` produces. A slug with a slash in it would silently create a URL
 * that never resolves.
 */
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Slug is required')
  .max(80, 'Slug must be 80 characters or fewer')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug may contain only lowercase letters, numbers and hyphens',
  );

const contentStatus = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

/** Entity-level SEO. Global SEO lives in SiteSetting — the two are separate. */
const seoFields = {
  seoTitle: z.string().trim().max(70, 'Keep the SEO title under 70 characters').optional().or(z.literal('')),
  seoDescription: z
    .string()
    .trim()
    .max(160, 'Keep the SEO description under 160 characters')
    .optional()
    .or(z.literal('')),
};

const optionalId = z.string().min(1).optional().or(z.literal(''));

/* ── News ─────────────────────────────────────────────────────────────────── */

export const newsSchema = z.object({
  title,
  slug,
  excerpt: z.string().trim().max(300, 'Excerpt must be 300 characters or fewer').optional().or(z.literal('')),
  body: z.string().trim().min(1, 'Article body is required').max(50_000),
  coverImageId: optionalId,
  category: z.string().trim().max(60).optional().or(z.literal('')),
  featured: z.boolean().default(false),
  authorName: z.string().trim().max(100).optional().or(z.literal('')),
  status: contentStatus.default('DRAFT'),
  ...seoFields,
});

export const newsUpdateSchema = newsSchema.extend({ id: cuid });

/* ── Event ────────────────────────────────────────────────────────────────── */

export const eventSchema = z
  .object({
    title,
    slug,
    description: z.string().trim().min(1, 'Description is required').max(20_000),
    startDate: z.coerce.date({ message: 'Enter a valid start date' }),
    endDate: z.coerce.date().optional().nullable(),
    venue: z.string().trim().max(200).optional().or(z.literal('')),
    coverImageId: optionalId,
    isAcademicCalendar: z.boolean().default(false),
    status: contentStatus.default('DRAFT'),
    ...seoFields,
  })
  // Mirrors the database CHECK constraint. Caught here so the editor gets a
  // readable message instead of a constraint violation.
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: 'The end date cannot be before the start date',
    path: ['endDate'],
  });

export const eventUpdateSchema = z.intersection(
  eventSchema,
  z.object({ id: cuid }),
);

/* ── Notice ───────────────────────────────────────────────────────────────── */

export const noticeSchema = z.object({
  title,
  body: z.string().trim().min(1, 'Notice body is required').max(20_000),
  category: z.enum([
    'ACADEMIC',
    'EXAMINATION',
    'EVENT',
    'HOLIDAY',
    'CBSE',
    'GENERAL',
  ]),
  attachmentId: optionalId,
  pinned: z.boolean().default(false),
  /**
   * Expiry is the direct answer to the six-year-old live notice found in
   * reference research (F-3). Optional, because some notices are genuinely
   * open-ended — but the admin UI prompts for it.
   */
  expiresAt: z.coerce.date().optional().nullable(),
  status: contentStatus.default('DRAFT'),
});

export const noticeUpdateSchema = noticeSchema.extend({ id: cuid });

/* ── Gallery ──────────────────────────────────────────────────────────────── */

export const albumSchema = z.object({
  title,
  slug,
  description: z.string().trim().max(2_000).optional().or(z.literal('')),
  category: z.enum([
    'CAMPUS',
    'SPORTS',
    'CULTURAL',
    'ACADEMIC',
    'EVENTS',
    'CELEBRATIONS',
  ]),
  eventDate: z.coerce.date().optional().nullable(),
  coverImageId: optionalId,
  status: contentStatus.default('DRAFT'),
});

export const albumUpdateSchema = albumSchema.extend({ id: cuid });

export const albumImagesSchema = z.object({
  albumId: cuid,
  mediaAssetIds: z.array(cuid).min(1, 'Select at least one image').max(100),
});

/* ── Faculty ──────────────────────────────────────────────────────────────── */

export const facultySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  slug,
  designation: z.string().trim().min(2, 'Designation is required').max(120),
  qualification: z.string().trim().max(200).optional().or(z.literal('')),
  experienceYears: z.coerce
    .number()
    .int()
    .min(0, 'Experience cannot be negative')
    .max(70, 'Enter a realistic number of years')
    .optional()
    .nullable(),
  bio: z.string().trim().max(5_000).optional().or(z.literal('')),
  photoId: optionalId,
  departmentId: optionalId,
  isLeadership: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).max(9_999).default(0),
  status: contentStatus.default('DRAFT'),
  ...seoFields,
});

export const facultyUpdateSchema = facultySchema.extend({ id: cuid });

/* ── Achievement ──────────────────────────────────────────────────────────── */

export const achievementSchema = z.object({
  title,
  description: z.string().trim().max(5_000).optional().or(z.literal('')),
  type: z.enum(['ACADEMIC', 'SPORTS', 'OLYMPIAD', 'CULTURAL', 'SCHOOL']),
  /**
   * ⚠️ Naming a student publicly is a child-privacy decision, not merely a
   * content choice, and requires consent specific to that recognition
   * (48_MEDIA_CONSENT_AND_CHILD_SAFETY). Optional here on purpose — the
   * achievement can be recorded without identifying the child.
   */
  achieverName: z.string().trim().max(120).optional().or(z.literal('')),
  level: z.string().trim().max(60).optional().or(z.literal('')),
  achievedOn: z.coerce.date({ message: 'Enter a valid date' }),
  imageId: optionalId,
  featured: z.boolean().default(false),
  status: contentStatus.default('DRAFT'),
});

export const achievementUpdateSchema = achievementSchema.extend({ id: cuid });

/* ── Document ─────────────────────────────────────────────────────────────── */

export const documentSchema = z.object({
  title,
  description: z.string().trim().max(1_000).optional().or(z.literal('')),
  category: z.enum([
    'ADMISSION',
    'ACADEMIC',
    'CALENDAR',
    'CIRCULAR',
    'POLICY',
    'MANDATORY_DISCLOSURE',
    'FORM',
    'OTHER',
  ]),
  mediaAssetId: cuid,
  /** Disambiguates versions, e.g. "Fee structure 2026-27" vs last year's. */
  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, 'Use the format 2026-27')
    .optional()
    .or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).max(9_999).default(0),
  status: contentStatus.default('DRAFT'),
});

export const documentUpdateSchema = documentSchema.extend({ id: cuid });

/* ── Testimonial ──────────────────────────────────────────────────────────── */

export const testimonialSchema = z.object({
  /**
   * ⚠️ Testimonials must be REAL and ATTRIBUTABLE, with the author's
   * permission. A fabricated testimonial on a real school's site is a
   * misrepresentation to families choosing a school (CR-002).
   */
  quote: z.string().trim().min(10, 'Quote is too short').max(1_200),
  authorName: z.string().trim().min(2, 'Author name is required').max(120),
  authorType: z.enum(['PARENT', 'ALUMNI', 'STUDENT']),
  authorDetail: z.string().trim().max(120).optional().or(z.literal('')),
  photoId: optionalId,
  featured: z.boolean().default(false),
  status: contentStatus.default('DRAFT'),
});

export const testimonialUpdateSchema = testimonialSchema.extend({ id: cuid });

/* ── Facility ─────────────────────────────────────────────────────────────── */

/**
 * ⚠️ Facilities are a SETTINGS sub-resource, SUPER_ADMIN only (D-B23).
 * There is no /admin/facilities route and EDITOR has no facility rights.
 */
export const facilitySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  slug,
  description: z.string().trim().min(1, 'Description is required').max(5_000),
  category: z.enum(['ACADEMIC', 'SPORTS', 'ARTS', 'SUPPORT', 'SAFETY']),
  imageId: optionalId,
  displayOrder: z.coerce.number().int().min(0).max(9_999).default(0),
  status: contentStatus.default('DRAFT'),
});

export const facilityUpdateSchema = facilitySchema.extend({ id: cuid });

/** Facilities are edited as a set, in one Settings form. */
export const facilitiesBulkSchema = z.object({
  facilities: z.array(facilityUpdateSchema.partial({ id: true })).max(60),
});

/* ── Shared ───────────────────────────────────────────────────────────────── */

export const idSchema = z.object({ id: cuid });

export const publishSchema = z.object({
  id: cuid,
  publish: z.boolean(),
});

/**
 * Two types per schema, and the difference matters.
 *
 * `.default()` makes a field OPTIONAL on the way in and GUARANTEED on the way
 * out. React Hook Form types its default values against the input shape and its
 * submit handler against the output shape, so conflating them produces an
 * error that reads as a resolver mismatch and is genuinely confusing.
 *
 *   *FormValues — what the form holds  (`featured?: boolean`)
 *   *Input      — what the action gets (`featured: boolean`)
 */
export type NewsFormValues = z.input<typeof newsSchema>;
export type NewsInput = z.output<typeof newsSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type NoticeInput = z.infer<typeof noticeSchema>;
export type AlbumInput = z.infer<typeof albumSchema>;
export type FacultyInput = z.infer<typeof facultySchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type FacilityInput = z.infer<typeof facilitySchema>;
