import 'server-only';

import type { MediaKind, MediaSource, Prisma } from '@prisma/client';

import { CONTENT_ROLES, requireAuth } from '@/lib/auth/guards';
import { db } from '@/lib/db/prisma';
import { adminMediaSelect } from '@/lib/queries/selects';

/**
 * Media library reads.
 *
 * Authorised at the query, not merely at the page: these return `consentBasis`
 * and `containsMinors`, which are internal safeguarding records and must never
 * reach a public surface (48_MEDIA_CONSENT_AND_CHILD_SAFETY).
 */

export interface MediaListOptions {
  page?: number;
  pageSize?: number;
  source?: MediaSource;
  kind?: MediaKind;
  /** Only assets flagged as containing children — the review queue. */
  minorsOnly?: boolean;
  /** Only assets missing something required before publication. */
  needsAttention?: boolean;
}

export async function listMedia(options: MediaListOptions = {}) {
  await requireAuth(CONTENT_ROLES);

  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? 24;

  const where: Prisma.MediaAssetWhereInput = {
    deletedAt: null,
    ...(options.source ? { source: options.source } : {}),
    ...(options.kind ? { kind: options.kind } : {}),
    ...(options.minorsOnly ? { containsMinors: true } : {}),
    ...(options.needsAttention
      ? {
          OR: [
            // No alt text — cannot be published (AR-009).
            { altText: null },
            { altText: '' },
            // Flagged as containing children but with no recorded consent
            // basis — the exact gap the field exists to close.
            { containsMinors: true, consentBasis: null },
            { containsMinors: true, consentBasis: '' },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.mediaAsset.findMany({
      where,
      select: {
        ...adminMediaSelect,
        source: true,
        kind: true,
        externalUrl: true,
        externalId: true,
        thumbnailUrl: true,
      },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    db.mediaAsset.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getMediaAsset(id: string) {
  await requireAuth(CONTENT_ROLES);

  return db.mediaAsset.findFirst({
    where: { id, deletedAt: null },
    select: {
      ...adminMediaSelect,
      source: true,
      kind: true,
      externalUrl: true,
      externalId: true,
      thumbnailUrl: true,
    },
  });
}

/**
 * Counts for the library header.
 *
 * `needsAttention` is surfaced prominently because an asset without alt text
 * blocks publication, and an image of children without a recorded consent basis
 * is the single thing most worth catching before it goes live.
 */
export async function getMediaCounts() {
  await requireAuth(CONTENT_ROLES);

  const [total, minors, missingAlt, missingConsent, unverifiedExif] =
    await Promise.all([
      db.mediaAsset.count({ where: { deletedAt: null } }),
      db.mediaAsset.count({ where: { deletedAt: null, containsMinors: true } }),
      db.mediaAsset.count({
        where: { deletedAt: null, OR: [{ altText: null }, { altText: '' }] },
      }),
      db.mediaAsset.count({
        where: {
          deletedAt: null,
          containsMinors: true,
          OR: [{ consentBasis: null }, { consentBasis: '' }],
        },
      }),
      db.mediaAsset.count({
        where: {
          deletedAt: null,
          source: 'CLOUDINARY',
          metadataStripped: false,
        },
      }),
    ]);

  return { total, minors, missingAlt, missingConsent, unverifiedExif };
}
