import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { CACHE_TAGS, itemTag } from '@/lib/cache/tags';
import { PAGE_SIZE } from '@/lib/constants/site';
import { db } from '@/lib/db/prisma';
import { publicMediaSelect, publishedOnly } from '@/lib/queries/selects';

/**
 * Event reads.
 *
 * Upcoming events drive campus visits; past events build credibility. Past
 * events are therefore retained and listed, never deleted — an event archive is
 * both a trust signal and an SEO asset (17_DATABASE_SCHEMA).
 */

const eventSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  venue: true,
  isAcademicCalendar: true,
  publishedAt: true,
  coverImage: { select: publicMediaSelect },
} as const;

export async function getUpcomingEvents(limit = 6) {
  'use cache';
  cacheTag(CACHE_TAGS.events);
  cacheLife('minutes');

  return db.event.findMany({
    where: {
      ...publishedOnly,
      // An event that finished yesterday is not "upcoming". Multi-day events
      // stay upcoming until their end date, not their start date — otherwise a
      // week-long sports festival vanishes on day two.
      OR: [{ endDate: { gte: new Date() } }, { startDate: { gte: new Date() } }],
    },
    select: eventSelect,
    orderBy: { startDate: 'asc' },
    take: limit,
  });
}

export async function getPastEvents(options: { page?: number } = {}) {
  'use cache';
  cacheTag(CACHE_TAGS.events);
  cacheLife('hours');

  const page = Math.max(1, options.page ?? 1);
  const where = {
    ...publishedOnly,
    startDate: { lt: new Date() },
    OR: [{ endDate: null }, { endDate: { lt: new Date() } }],
  };

  const [items, total] = await Promise.all([
    db.event.findMany({
      where,
      select: eventSelect,
      orderBy: { startDate: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    db.event.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getEventBySlug(slug: string) {
  'use cache';
  cacheTag(CACHE_TAGS.events, itemTag(CACHE_TAGS.events, slug));
  cacheLife('minutes');

  return db.event.findFirst({
    where: { slug, ...publishedOnly },
    select: {
      ...eventSelect,
      seoTitle: true,
      seoDescription: true,
      updatedAt: true,
    },
  });
}

/** Events flagged for the academic calendar page. */
export async function getAcademicCalendarEvents() {
  'use cache';
  cacheTag(CACHE_TAGS.events);
  cacheLife('hours');

  return db.event.findMany({
    where: { ...publishedOnly, isAcademicCalendar: true },
    select: eventSelect,
    orderBy: { startDate: 'asc' },
  });
}

export async function getAllEventSlugs() {
  'use cache';
  cacheTag(CACHE_TAGS.events);
  cacheLife('hours');

  return db.event.findMany({
    where: publishedOnly,
    select: { slug: true, updatedAt: true },
  });
}
