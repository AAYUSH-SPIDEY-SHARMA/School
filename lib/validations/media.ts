import { z } from 'zod';

import { parseExternalMedia } from '@/lib/media/externalMedia';

/**
 * Media validation.
 *
 * Two very different intake paths, so two schemas:
 *
 *  - `cloudinaryAssetSchema` — a file the school uploaded, which we control and
 *    whose metadata we stripped at ingest.
 *  - `externalMediaSchema`   — a Drive or YouTube link, which we do NOT control
 *    and whose metadata we cannot touch.
 *
 * They deliberately do not share a shape, because conflating them is how an
 * external asset ends up marked `metadataStripped: true` and the safeguarding
 * claim becomes false.
 */

/**
 * Alt text.
 *
 * ⚠️ Required before publish (AR-009), and it must describe the ACTIVITY. It
 * must never name a child: alt text is machine-readable and indexable, so a
 * name there is more exposed than a name in a caption, not less
 * (48_MEDIA_CONSENT_AND_CHILD_SAFETY).
 */
export const altTextSchema = z
  .string()
  .trim()
  .min(4, 'Describe what is happening in the image')
  .max(300, 'Keep alt text under 300 characters');

export const cloudinaryAssetSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  fileSize: z.number().int().min(0),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  altText: altTextSchema.optional().or(z.literal('')),
  caption: z.string().trim().max(300).optional().or(z.literal('')),
  containsMinors: z.boolean().default(false),
  consentBasis: z.string().trim().max(500).optional().or(z.literal('')),
});

export const externalMediaSchema = z
  .object({
    /** The link exactly as pasted. */
    externalUrl: z.string().trim().min(1, 'Paste a Google Drive or YouTube link'),
    kind: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
    title: z.string().trim().min(1, 'Give this a name').max(255),
    altText: altTextSchema.optional().or(z.literal('')),
    caption: z.string().trim().max(300).optional().or(z.literal('')),
    containsMinors: z.boolean().default(false),
    consentBasis: z.string().trim().max(500).optional().or(z.literal('')),
  })
  // Parsed here rather than trusted, so an unrecognised link is rejected with a
  // specific message instead of being stored and silently rendering nothing.
  .refine((data) => parseExternalMedia(data.externalUrl, data.kind) !== null, {
    message:
      'That link was not recognised. Paste a YouTube video link, or a Google Drive file link.',
    path: ['externalUrl'],
  });

export const updateMediaSchema = z.object({
  id: z.string().min(1),
  altText: altTextSchema.optional().or(z.literal('')),
  caption: z.string().trim().max(300).optional().or(z.literal('')),
  containsMinors: z.boolean(),
  consentBasis: z.string().trim().max(500).optional().or(z.literal('')),
});

export const deleteMediaSchema = z.object({
  id: z.string().min(1),
  /**
   * A safeguarding takedown deletes from the provider and purges the CDN, and
   * is not reversible. Normal deletion is soft.
   */
  takedown: z.boolean().default(false),
});

export const signUploadSchema = z.object({
  resourceType: z.enum(['image', 'raw']).default('image'),
});

export type CloudinaryAssetInput = z.output<typeof cloudinaryAssetSchema>;
export type ExternalMediaFormValues = z.input<typeof externalMediaSchema>;
export type ExternalMediaInput = z.output<typeof externalMediaSchema>;
export type UpdateMediaInput = z.output<typeof updateMediaSchema>;
