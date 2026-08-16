import 'server-only';

import type { FacilityCategory } from '@prisma/client';
import { cacheLife, cacheTag } from 'next/cache';

import { CACHE_TAGS } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import { publicMediaSelect, publishedOnly } from '@/lib/queries/selects';

/**
 * Facility reads.
 *
 * Infrastructure is a stated parental selection factor (F-8).
 *
 * ⚠️ Facilities are administered as a SETTINGS sub-resource, SUPER_ADMIN only
 * (D-B23). There is no /admin/facilities route. Roughly a dozen records changed
 * about once a year does not justify a full CRUD module — and granting EDITOR
 * facility rights would create a permission with no route to exercise it.
 */

const facilitySelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  category: true,
  displayOrder: true,
  image: { select: publicMediaSelect },
} as const;

export async function getPublishedFacilities(options: {
  category?: FacilityCategory;
} = {}) {
  'use cache';
  cacheTag(CACHE_TAGS.facilities);
  cacheLife('days');

  return db.facility.findMany({
    where: {
      ...publishedOnly,
      ...(options.category ? { category: options.category } : {}),
    },
    select: facilitySelect,
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
}

/** Grouped by category, which is how the infrastructure page renders. */
export async function getFacilitiesByCategory() {
  const facilities = await getPublishedFacilities();

  const grouped = new Map<FacilityCategory, typeof facilities>();

  for (const facility of facilities) {
    const existing = grouped.get(facility.category);
    if (existing) {
      existing.push(facility);
    } else {
      grouped.set(facility.category, [facility]);
    }
  }

  return grouped;
}

/**
 * Safety-category facilities, for the dedicated Safety page.
 *
 * ⚠️ The Safety page must never state a safety provision the school has not
 * confirmed. Claiming CCTV coverage, verified drivers or a trained nurse that
 * do not exist is a safety misrepresentation to parents, not a marketing
 * flourish. This returns only what the school has actually entered; the page
 * shows an honest empty state otherwise.
 */
export async function getSafetyFacilities() {
  'use cache';
  cacheTag(CACHE_TAGS.facilities);
  cacheLife('days');

  return db.facility.findMany({
    where: { ...publishedOnly, category: 'SAFETY' },
    select: facilitySelect,
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
}
