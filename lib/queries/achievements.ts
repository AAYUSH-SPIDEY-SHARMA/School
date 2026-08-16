import 'server-only';

import type { AchievementType } from '@prisma/client';
import { cacheLife, cacheTag } from 'next/cache';

import { CACHE_TAGS } from '@/lib/cache/tags';
import { PAGE_SIZE } from '@/lib/constants/site';
import { db } from '@/lib/db/prisma';
import { publicMediaSelect, publishedOnly } from '@/lib/queries/selects';

/**
 * Achievement reads.
 *
 * Quantified, specific achievements are a trust signal parents consistently
 * value (F-4).
 *
 * ⚠️ `achieverName` may identify a child. It is optional by design, and naming
 * a student publicly requires consent specific to that recognition
 * (48_MEDIA_CONSENT_AND_CHILD_SAFETY). The query returns whatever the editor
 * recorded — the control is at authoring time, because no query can decide
 * whether consent was obtained.
 */

const achievementSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  achieverName: true,
  level: true,
  achievedOn: true,
  featured: true,
  image: { select: publicMediaSelect },
} as const;

export async function getPublishedAchievements(options: {
  page?: number;
  type?: AchievementType;
} = {}) {
  'use cache';
  cacheTag(CACHE_TAGS.achievements);
  cacheLife('hours');

  const page = Math.max(1, options.page ?? 1);
  const where = {
    ...publishedOnly,
    ...(options.type ? { type: options.type } : {}),
  };

  const [items, total] = await Promise.all([
    db.achievement.findMany({
      where,
      select: achievementSelect,
      orderBy: { achievedOn: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    db.achievement.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getFeaturedAchievements(limit = 4) {
  'use cache';
  cacheTag(CACHE_TAGS.achievements);
  cacheLife('hours');

  return db.achievement.findMany({
    where: { ...publishedOnly, featured: true },
    select: achievementSelect,
    orderBy: { achievedOn: 'desc' },
    take: limit,
  });
}
