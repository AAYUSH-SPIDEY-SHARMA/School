import 'server-only';

import type { AlbumCategory } from '@prisma/client';
import { cacheLife, cacheTag } from 'next/cache';

import { CACHE_TAGS, itemTag } from '@/lib/cache/tags';
import { PAGE_SIZE } from '@/lib/constants/site';
import { db } from '@/lib/db/prisma';
import { publicMediaSelect, publishedOnly } from '@/lib/queries/selects';

/**
 * Gallery reads.
 *
 * ⚠️ THIS DATA CONTAINS PHOTOGRAPHS OF IDENTIFIABLE CHILDREN.
 *
 * `publicMediaSelect` deliberately excludes `consentBasis` and
 * `containsMinors`: those are internal safeguarding records and have no reason
 * to travel to a public page, where they would sit in the React payload
 * readable by anyone who opens devtools
 * (48_MEDIA_CONSENT_AND_CHILD_SAFETY, locked rule H).
 *
 * Alt text and captions must describe the ACTIVITY and never name a child —
 * enforced at the point of authoring, since no query can inspect prose.
 */

const albumCardSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  category: true,
  eventDate: true,
  publishedAt: true,
  coverImage: { select: publicMediaSelect },
  _count: { select: { images: true } },
} as const;

export async function getPublishedAlbums(options: {
  page?: number;
  category?: AlbumCategory;
} = {}) {
  'use cache';
  cacheTag(CACHE_TAGS.gallery);
  cacheLife('hours');

  const page = Math.max(1, options.page ?? 1);
  const where = {
    ...publishedOnly,
    ...(options.category ? { category: options.category } : {}),
  };

  const [items, total] = await Promise.all([
    db.galleryAlbum.findMany({
      where,
      select: albumCardSelect,
      orderBy: [{ eventDate: 'desc' }, { publishedAt: 'desc' }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    db.galleryAlbum.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAlbumBySlug(slug: string) {
  'use cache';
  cacheTag(CACHE_TAGS.gallery, itemTag(CACHE_TAGS.gallery, slug));
  cacheLife('hours');

  return db.galleryAlbum.findFirst({
    where: { slug, ...publishedOnly },
    select: {
      ...albumCardSelect,
      images: {
        select: {
          id: true,
          caption: true,
          displayOrder: true,
          mediaAsset: { select: publicMediaSelect },
        },
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

/** A few recent albums for the homepage. */
export async function getFeaturedAlbums(limit = 4) {
  'use cache';
  cacheTag(CACHE_TAGS.gallery);
  cacheLife('hours');

  return db.galleryAlbum.findMany({
    where: publishedOnly,
    select: albumCardSelect,
    orderBy: [{ eventDate: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
  });
}

export async function getAllAlbumSlugs() {
  'use cache';
  cacheTag(CACHE_TAGS.gallery);
  cacheLife('hours');

  return db.galleryAlbum.findMany({
    where: publishedOnly,
    select: { slug: true, updatedAt: true },
  });
}
