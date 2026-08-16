import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { CACHE_TAGS, itemTag } from '@/lib/cache/tags';
import { PAGE_SIZE } from '@/lib/constants/site';
import { db } from '@/lib/db/prisma';
import {
  authorSelect,
  publicMediaSelect,
  publishedOnly,
} from '@/lib/queries/selects';

/**
 * News reads.
 *
 * News is prospective-facing, long-lived and editorial — deliberately a
 * different system from Notices, which are operational and expire (F-2).
 *
 * Every function here filters to PUBLISHED and not-deleted IN THE QUERY.
 * Pagination is always applied; there is no unbounded `findMany`, because a
 * listing that is fine with 12 rows becomes a timeout at 4,000.
 */

const newsCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  category: true,
  featured: true,
  publishedAt: true,
  coverImage: { select: publicMediaSelect },
} as const;

export interface NewsListOptions {
  page?: number;
  category?: string;
  pageSize?: number;
}

export async function getPublishedNews(options: NewsListOptions = {}) {
  'use cache';
  cacheTag(CACHE_TAGS.news);
  cacheLife('minutes');

  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? PAGE_SIZE;

  const where = {
    ...publishedOnly,
    ...(options.category ? { category: options.category } : {}),
  };

  const [items, total] = await Promise.all([
    db.news.findMany({
      where,
      select: newsCardSelect,
      orderBy: { publishedAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    db.news.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Featured items for the homepage. */
export async function getFeaturedNews(limit = 3) {
  'use cache';
  cacheTag(CACHE_TAGS.news);
  cacheLife('minutes');

  return db.news.findMany({
    where: { ...publishedOnly, featured: true },
    select: newsCardSelect,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

export async function getLatestNews(limit = 3) {
  'use cache';
  cacheTag(CACHE_TAGS.news);
  cacheLife('minutes');

  return db.news.findMany({
    where: publishedOnly,
    select: newsCardSelect,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

/**
 * A single article by slug.
 *
 * Tagged individually as well as collectively, so republishing one article does
 * not evict every other article's cached page.
 *
 * Returns null rather than throwing — the caller decides between a 404 and a
 * slug-history redirect, and only the caller knows which.
 */
export async function getNewsBySlug(slug: string) {
  'use cache';
  cacheTag(CACHE_TAGS.news, itemTag(CACHE_TAGS.news, slug));
  cacheLife('minutes');

  return db.news.findFirst({
    where: { slug, ...publishedOnly },
    select: {
      ...newsCardSelect,
      body: true,
      authorName: true,
      seoTitle: true,
      seoDescription: true,
      updatedAt: true,
      createdBy: { select: authorSelect },
    },
  });
}

/** Slugs for static generation and the sitemap. */
export async function getAllNewsSlugs() {
  'use cache';
  cacheTag(CACHE_TAGS.news);
  cacheLife('hours');

  return db.news.findMany({
    where: publishedOnly,
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: 'desc' },
  });
}

/** Distinct categories actually in use, for the filter UI. */
export async function getNewsCategories() {
  'use cache';
  cacheTag(CACHE_TAGS.news);
  cacheLife('hours');

  const rows = await db.news.findMany({
    where: { ...publishedOnly, category: { not: null } },
    select: { category: true },
    distinct: ['category'],
  });

  return rows
    .map((row) => row.category)
    .filter((category): category is string => Boolean(category))
    .sort();
}
