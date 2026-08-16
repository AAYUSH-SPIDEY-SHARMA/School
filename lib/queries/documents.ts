import 'server-only';

import type { DocumentCategory } from '@prisma/client';
import { cacheLife, cacheTag } from 'next/cache';

import { CACHE_TAGS } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import { publishedOnly } from '@/lib/queries/selects';

/**
 * Document reads.
 *
 * Downloadable forms, calendars and circulars are first-class in the Indian
 * school context, not an afterthought (F-2). Mandatory disclosure documents are
 * a CBSE expectation.
 *
 * `fileSize` is always selected so the size can be shown BEFORE the tap. A
 * parent on a metered 4G connection deciding whether to download a 12 MB PDF
 * needs that number in advance.
 */

const documentSelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  fileSize: true,
  fileType: true,
  academicYear: true,
  displayOrder: true,
  publishedAt: true,
  mediaAsset: { select: { id: true, url: true, fileName: true } },
} as const;

export async function getPublishedDocuments(options: {
  category?: DocumentCategory;
} = {}) {
  'use cache';
  cacheTag(CACHE_TAGS.documents);
  cacheLife('hours');

  return db.document.findMany({
    where: {
      ...publishedOnly,
      ...(options.category ? { category: options.category } : {}),
    },
    select: documentSelect,
    orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }, { title: 'asc' }],
  });
}

/** Documents grouped by category, which is how the downloads page renders. */
export async function getDocumentsByCategory() {
  const documents = await getPublishedDocuments();

  const grouped = new Map<DocumentCategory, typeof documents>();

  for (const document of documents) {
    const existing = grouped.get(document.category);
    if (existing) {
      existing.push(document);
    } else {
      grouped.set(document.category, [document]);
    }
  }

  return grouped;
}
