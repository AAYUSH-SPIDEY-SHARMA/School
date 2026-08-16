/**
 * Cache tag vocabulary.
 *
 * Tags are defined in ONE place because the failure mode of tag-based
 * invalidation is a typo: `revalidateTag('notice')` where the cache was written
 * with `'notices'` fails silently and produces stale content that nobody can
 * reproduce (ADR-0010, "Missing cache tag causes stale content").
 *
 * ── The read/write split, which is the consequential part ────────────────────
 *
 *   Public read path   revalidateTag(tag)   stale-while-revalidate — a parent
 *                                           gets an instant cached page while
 *                                           it refreshes behind them
 *
 *   Admin write path   updateTag(tag)       READ-YOUR-WRITES — the editor sees
 *                                           their change immediately
 *
 * Without `updateTag` on the write path, an editor publishes a notice, does not
 * see it appear, and publishes again — repeatedly. That friction is exactly
 * what makes staff conclude a CMS is broken and stop using it, which is the
 * root cause of the content rot found in the reference sites
 * (45_RESEARCH_SOURCES F-3, journey J7).
 *
 * A caching decision therefore determines whether the CMS gets used at all.
 */

export const CACHE_TAGS = {
  news: 'news',
  events: 'events',
  notices: 'notices',
  gallery: 'gallery',
  faculty: 'faculty',
  achievements: 'achievements',
  documents: 'documents',
  testimonials: 'testimonials',
  facilities: 'facilities',
  settings: 'settings',
  departments: 'departments',
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Tag for a single item, so publishing one article does not invalidate every
 * article's cached page.
 *
 * Publishing a news item invalidates BOTH `news` (the listing) and
 * `news:{slug}` (the detail page) — forgetting the listing is the usual
 * mistake, and it leaves the new article invisible on the page most people
 * arrive at.
 */
export function itemTag(collection: CacheTag, slug: string): string {
  return `${collection}:${slug}`;
}

/** Cache lifetime profiles, by how quickly the content genuinely changes. */
export const CACHE_PROFILES = {
  /** Notices and news — the school expects these to appear promptly. */
  frequent: 'minutes',
  /** Faculty, facilities, gallery — changed occasionally. */
  standard: 'hours',
  /** Prose pages and settings — changed a few times a year. */
  stable: 'days',
} as const;
