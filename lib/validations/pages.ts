import { z } from 'zod';

import { SECTION_TYPE_KEYS } from '@/lib/sections/schemas';

/**
 * Page and navigation validation (ADR-0012).
 */

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .regex(
    /^$|^[a-z0-9]+(?:[-/][a-z0-9]+)*$/,
    'Use lowercase letters, numbers, hyphens and slashes only',
  );

export const pageSchema = z.object({
  /** Empty string is the homepage. */
  slug: slugField,
  title: z.string().trim().min(2, 'Give the page a title').max(180),
  adminNote: z.string().trim().max(300).optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  seoTitle: z.string().trim().max(70).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(160).optional().or(z.literal('')),
  ogImageId: z.string().trim().max(50).optional().or(z.literal('')),
});

export const pageUpdateSchema = pageSchema.extend({
  id: z.string().min(1),
});

export const addSectionSchema = z.object({
  pageId: z.string().min(1),
  type: z.enum(SECTION_TYPE_KEYS as [string, ...string[]]),
  /** Insert position. Appended when omitted. */
  afterOrder: z.coerce.number().int().min(0).optional(),
});

export const updateSectionSchema = z.object({
  id: z.string().min(1),
  /**
   * Validated against the section's OWN schema in the action, once its type is
   * known. Accepting `unknown` here and narrowing there is deliberate: the type
   * lives on the row, not in the payload, so a caller cannot claim a different
   * type to slip past the wrong validator.
   */
  content: z.unknown(),
  isVisible: z.boolean().optional(),
});

export const reorderSectionsSchema = z.object({
  pageId: z.string().min(1),
  /** Section ids in their new order. */
  sectionIds: z.array(z.string().min(1)).max(60),
});

export const deleteSectionSchema = z.object({
  id: z.string().min(1),
});

/* ── Navigation ───────────────────────────────────────────────────────────── */

export const navItemSchema = z.object({
  label: z.string().trim().min(1, 'Give the link a label').max(60),
  href: z
    .string()
    .trim()
    .min(1, 'Where should this link go?')
    .max(500)
    .refine(
      (value) =>
        value.startsWith('/') ||
        value.startsWith('https://') ||
        value.startsWith('http://'),
      { message: 'Use an internal path (/about) or a full https:// address' },
    ),
  parentId: z.string().optional().or(z.literal('')),
  location: z.string().trim().max(40).default('primary'),
  isVisible: z.boolean().default(true),
});

export const navItemUpdateSchema = navItemSchema.extend({
  id: z.string().min(1),
});

export const reorderNavSchema = z.object({
  location: z.string().trim().max(40).default('primary'),
  /** Top-level ids in order, each with its children in order. */
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        childIds: z.array(z.string().min(1)).max(30).default([]),
      }),
    )
    .max(30),
});

export type PageFormValues = z.input<typeof pageSchema>;
export type PageInput = z.output<typeof pageSchema>;
export type NavItemFormValues = z.input<typeof navItemSchema>;
export type NavItemInput = z.output<typeof navItemSchema>;
