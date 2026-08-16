import { cacheLife } from 'next/cache';

/**
 * The current year, for the footer copyright line.
 *
 * This exists as its own cached component for a specific reason. Under Cache
 * Components, `new Date()` is an unstable value: it cannot be prerendered,
 * because the build output would freeze whatever year the build ran in. Left
 * uncached it would force the entire footer — and therefore every page that
 * renders it — to become dynamic, which would cost far more than it is worth.
 *
 * Caching it with a `days` profile keeps every page prerenderable while the
 * year still rolls over on its own.
 *
 * The point is not pedantry about a date. A stale copyright year is one of the
 * clearest "this site is abandoned" signals a parent reads — one reference
 * school site was showing 2018 when inspected in 2026 (45_RESEARCH_SOURCES
 * F-3). Hard-coding the year is exactly how that happens.
 */
export async function CopyrightYear() {
  'use cache';
  cacheLife('days');

  return <>{new Date().getFullYear()}</>;
}
