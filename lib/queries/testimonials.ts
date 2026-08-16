import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { CACHE_TAGS } from '@/lib/cache/tags';
import { db } from '@/lib/db/prisma';
import { publicMediaSelect, publishedOnly } from '@/lib/queries/selects';

/**
 * Testimonial reads.
 *
 * Social proof shown before the admissions ask (F-4).
 *
 * ⚠️ Testimonials must be REAL and ATTRIBUTABLE, with the author's permission.
 * A fabricated testimonial on a real school's website is a misrepresentation to
 * families choosing a school (CR-002). None are seeded, and none may be
 * invented.
 */

const testimonialSelect = {
  id: true,
  quote: true,
  authorName: true,
  authorType: true,
  authorDetail: true,
  featured: true,
  photo: { select: publicMediaSelect },
} as const;

export async function getPublishedTestimonials(limit?: number) {
  'use cache';
  cacheTag(CACHE_TAGS.testimonials);
  cacheLife('hours');

  return db.testimonial.findMany({
    where: publishedOnly,
    select: testimonialSelect,
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    ...(limit ? { take: limit } : {}),
  });
}

export async function getFeaturedTestimonials(limit = 3) {
  'use cache';
  cacheTag(CACHE_TAGS.testimonials);
  cacheLife('hours');

  return db.testimonial.findMany({
    where: { ...publishedOnly, featured: true },
    select: testimonialSelect,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}
