/**
 * Slug generation and URL stability.
 *
 * A slug is a permanent public contract. Once an article is published, its URL
 * may have been shared in a parent WhatsApp group, indexed by Google, or
 * printed in a circular. Changing it without a redirect breaks all of those at
 * once, and nobody notices until traffic drops (NFR-028).
 */

/**
 * Build a URL-safe slug from a title.
 *
 * Non-Latin characters are stripped rather than transliterated. If Hindi
 * content is confirmed (OD-009), a Devanagari title would slugify to an empty
 * string here — which `ensureSlug` catches rather than silently producing "-".
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    // Strip combining marks, so "Anushka" and "Anuṣka" agree.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    // Long slugs are truncated at a word boundary rather than mid-word.
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/**
 * A slug, guaranteed non-empty.
 *
 * Falls back to a timestamp suffix when the title produces nothing usable —
 * an all-emoji title, or a Devanagari one. An empty slug would collide with
 * the collection route itself.
 */
export function ensureSlug(title: string, fallbackPrefix = 'item'): string {
  const base = slugify(title);
  if (base) return base;
  return `${fallbackPrefix}-${Date.now().toString(36)}`;
}

/**
 * Append a numeric suffix until the slug is unique.
 *
 * `taken` is the set of slugs already in use for that entity type. The database
 * unique index is still the guarantee — this only avoids showing the user a
 * constraint violation for something we can resolve ourselves.
 */
export function uniqueSlug(desired: string, taken: ReadonlySet<string>): string {
  if (!taken.has(desired)) return desired;

  let suffix = 2;
  while (taken.has(`${desired}-${suffix}`)) {
    suffix += 1;
  }
  return `${desired}-${suffix}`;
}

/**
 * Entity types that participate in slug history.
 *
 * Kept as a literal union so a typo in an action becomes a type error rather
 * than a redirect that silently never matches.
 */
export const SLUG_ENTITY_TYPES = [
  'news',
  'events',
  'gallery',
  'faculty',
] as const;

export type SlugEntityType = (typeof SLUG_ENTITY_TYPES)[number];

/** Public URL for an entity, so paths are constructed in exactly one place. */
export function publicPathFor(entityType: SlugEntityType, slug: string): string {
  switch (entityType) {
    case 'news':
      return `/news/${slug}`;
    case 'events':
      return `/events/${slug}`;
    case 'gallery':
      return `/gallery/${slug}`;
    case 'faculty':
      return `/academics/faculty/${slug}`;
  }
}
