import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { CACHE_TAGS, itemTag } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import { publicMediaSelect, publishedOnly } from '@/lib/queries/selects';

/**
 * Faculty reads.
 *
 * Teacher quality is a stated parental selection factor (F-8), which is why
 * faculty are a first-class entity with their own pages rather than a list of
 * names on the About page.
 *
 * Leadership is a boolean on Faculty, not a separate entity — leadership ARE
 * faculty, and duplicating them would create two records to keep in sync.
 */

const facultyCardSelect = {
  id: true,
  slug: true,
  name: true,
  designation: true,
  qualification: true,
  experienceYears: true,
  isLeadership: true,
  displayOrder: true,
  photo: { select: publicMediaSelect },
  department: { select: { id: true, name: true, slug: true } },
} as const;

export async function getPublishedFaculty(options: {
  departmentSlug?: string;
} = {}) {
  'use cache';
  cacheTag(CACHE_TAGS.faculty);
  cacheLife('hours');

  return db.faculty.findMany({
    where: {
      ...publishedOnly,
      ...(options.departmentSlug
        ? { department: { slug: options.departmentSlug } }
        : {}),
    },
    select: facultyCardSelect,
    // Leadership first, then the school's chosen order, then alphabetical so
    // the list is stable when displayOrder is left at its default.
    orderBy: [
      { isLeadership: 'desc' },
      { displayOrder: 'asc' },
      { name: 'asc' },
    ],
  });
}

/** Leadership team, for the dedicated page and the About section. */
export async function getLeadership() {
  'use cache';
  cacheTag(CACHE_TAGS.faculty);
  cacheLife('hours');

  return db.faculty.findMany({
    where: { ...publishedOnly, isLeadership: true },
    select: facultyCardSelect,
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
}

export async function getFacultyBySlug(slug: string) {
  'use cache';
  cacheTag(CACHE_TAGS.faculty, itemTag(CACHE_TAGS.faculty, slug));
  cacheLife('hours');

  return db.faculty.findFirst({
    where: { slug, ...publishedOnly },
    select: {
      ...facultyCardSelect,
      bio: true,
      seoTitle: true,
      seoDescription: true,
      updatedAt: true,
    },
  });
}

/** Departments that actually have published faculty, for the filter. */
export async function getDepartmentsWithFaculty() {
  'use cache';
  cacheTag(CACHE_TAGS.faculty, CACHE_TAGS.departments);
  cacheLife('hours');

  return db.department.findMany({
    where: { faculty: { some: publishedOnly } },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { faculty: { where: publishedOnly } } },
    },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getAllFacultySlugs() {
  'use cache';
  cacheTag(CACHE_TAGS.faculty);
  cacheLife('hours');

  return db.faculty.findMany({
    where: publishedOnly,
    select: { slug: true, updatedAt: true },
  });
}
