import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { CONTENT_ROLES, requireAuth } from '@/lib/auth/guards';
import { db } from '@/lib/db/prisma';
import { publicMediaSelect } from '@/lib/queries/selects';

/**
 * Page composition reads (ADR-0012).
 *
 * Public reads are cached and tagged so publishing a page refreshes it at once.
 * Admin reads are uncached and authorised at the query, because they return
 * draft pages and hidden sections.
 */

export const PAGE_TAG = 'pages';
export const NAV_TAG = 'navigation';

export function pageTag(slug: string): string {
  return `page:${slug || 'home'}`;
}

const sectionSelect = {
  id: true,
  type: true,
  displayOrder: true,
  isVisible: true,
  content: true,
} as const;

/**
 * A published page with its visible sections, in order.
 *
 * Hidden sections are filtered IN THE QUERY. A section hidden only in the UI
 * would still be in the React payload, readable by anyone who opens devtools —
 * the same rule that applies to draft content (locked rule L).
 */
export async function getPublishedPage(slug: string) {
  'use cache';
  cacheTag(PAGE_TAG, pageTag(slug));
  cacheLife('minutes');

  return db.page.findFirst({
    where: { slug, status: 'PUBLISHED', deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      seoTitle: true,
      seoDescription: true,
      updatedAt: true,
      ogImage: { select: publicMediaSelect },
      sections: {
        where: { isVisible: true },
        select: sectionSelect,
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

/**
 * Navigation, assembled from `NavItem`.
 *
 * Replaces the hard-coded constant, so "every link of every page" genuinely
 * includes the menu. Falls back to an empty list rather than throwing: a
 * misconfigured menu should degrade to no menu, not to a broken site.
 */
export async function getNavigation(location = 'primary') {
  'use cache';
  cacheTag(NAV_TAG);
  cacheLife('hours');

  const items = await db.navItem.findMany({
    where: { location, isVisible: true, parentId: null },
    select: {
      id: true,
      label: true,
      href: true,
      children: {
        where: { isVisible: true },
        select: { id: true, label: true, href: true },
        orderBy: { displayOrder: 'asc' },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  return items;
}

/* ── Admin ────────────────────────────────────────────────────────────────── */

export async function listPagesForAdmin() {
  await requireAuth(CONTENT_ROLES);

  return db.page.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      isSystem: true,
      updatedAt: true,
      _count: { select: { sections: true } },
    },
    orderBy: [{ isSystem: 'desc' }, { slug: 'asc' }],
  });
}

/** A page with ALL sections, including hidden ones, for editing. */
export async function getPageForEdit(id: string) {
  await requireAuth(CONTENT_ROLES);

  return db.page.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      adminNote: true,
      isSystem: true,
      status: true,
      seoTitle: true,
      seoDescription: true,
      ogImageId: true,
      sections: {
        select: sectionSelect,
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

export async function listNavForAdmin(location = 'primary') {
  await requireAuth(CONTENT_ROLES);

  return db.navItem.findMany({
    where: { location, parentId: null },
    select: {
      id: true,
      label: true,
      href: true,
      displayOrder: true,
      isVisible: true,
      children: {
        select: {
          id: true,
          label: true,
          href: true,
          displayOrder: true,
          isVisible: true,
        },
        orderBy: { displayOrder: 'asc' },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });
}

/** Slugs of published pages, for the sitemap. */
export async function getPublishedPageSlugs() {
  'use cache';
  cacheTag(PAGE_TAG);
  cacheLife('hours');

  return db.page.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    select: { slug: true, updatedAt: true },
  });
}
