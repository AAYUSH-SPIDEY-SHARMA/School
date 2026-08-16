import 'server-only';

import type { NoticeCategory } from '@prisma/client';
import { cacheLife, cacheTag } from 'next/cache';

import { CACHE_TAGS } from '@/lib/cache/tags';
import { PAGE_SIZE } from '@/lib/constants/site';
import { db } from '@/lib/db/prisma';
import { publicMediaSelect, publishedOnly } from '@/lib/queries/selects';

/**
 * Notice reads.
 *
 * Notices serve CURRENT parents: operational, time-sensitive, expiry-aware.
 * That is a genuinely different job from News, which is why they are separate
 * systems rather than one with a flag (F-2).
 *
 * ⚠️ EXPIRY IS FILTERED IN THE QUERY, ALWAYS.
 *
 * Reference research found a recruitment notice dated August 2020 still live in
 * August 2026, and a footer reading 2018 (F-3). An expired notice is worse than
 * no notice: it actively misinforms a parent and signals the school does not
 * maintain its own site. Filtering here means expiry works even if no one ever
 * remembers to unpublish anything.
 */

const noticeSelect = {
  id: true,
  title: true,
  body: true,
  category: true,
  pinned: true,
  publishedAt: true,
  expiresAt: true,
  attachment: { select: publicMediaSelect },
} as const;

/** Published, not deleted, and not past its expiry. */
function liveNoticeWhere(category?: NoticeCategory) {
  return {
    ...publishedOnly,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    ...(category ? { category } : {}),
  };
}

export async function getPublishedNotices(options: {
  page?: number;
  category?: NoticeCategory;
  pageSize?: number;
} = {}) {
  'use cache';
  cacheTag(CACHE_TAGS.notices);
  // Deliberately the shortest profile on the site. A notice published at 9am
  // for a school closure must be visible at 9am, not at the next interval.
  cacheLife('minutes');

  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const where = liveNoticeWhere(options.category);

  const [items, total] = await Promise.all([
    db.notice.findMany({
      where,
      select: noticeSelect,
      // Pinned first, then most recent — the order a parent scanning for
      // "is school open tomorrow" actually needs.
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    db.notice.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Latest live notices, for the homepage band. */
export async function getLatestNotices(limit = 5) {
  'use cache';
  cacheTag(CACHE_TAGS.notices);
  cacheLife('minutes');

  return db.notice.findMany({
    where: liveNoticeWhere(),
    select: noticeSelect,
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
  });
}
