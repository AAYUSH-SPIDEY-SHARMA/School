import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { CACHE_TAGS } from '@/lib/cache/tags';
import { SCHOOL_PLACEHOLDERS } from '@/lib/constants/site';
import { db } from '@/lib/db/prisma';

/**
 * Site settings.
 *
 * Contact details, statistics and global SEO live in the database so staff can
 * change them without a deploy. Entity-level SEO lives on the entities — the
 * two were previously conflated and separating them was a specific review
 * correction.
 *
 * ⚠️ Every value falls back to a bracketed PLACEHOLDER, never to invented
 * content. If the database is empty, the page must show `[PHONE_NUMBER]` — not
 * a plausible-looking number that survives review because nobody questions it.
 */

export type SettingsMap = Record<string, string>;

export async function getSiteSettings(): Promise<SettingsMap> {
  'use cache';
  cacheTag(CACHE_TAGS.settings);
  cacheLife('hours');

  const rows = await db.siteSetting.findMany({
    select: { key: true, value: true },
  });

  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

/**
 * A single setting with a mandatory fallback.
 *
 * The fallback is required rather than optional, so a missing key can never
 * render as `undefined` on a public page.
 */
export function setting(
  settings: SettingsMap,
  key: string,
  fallback: string,
): string {
  const value = settings[key];
  return value && value.trim() ? value : fallback;
}

/**
 * The school identity block, resolved with placeholder fallbacks.
 *
 * Used by the header, footer, contact page and JSON-LD, so the fallback
 * behaviour is defined once rather than at every call site.
 */
export async function getSchoolIdentity() {
  const settings = await getSiteSettings();

  return {
    name: setting(settings, 'school.name', SCHOOL_PLACEHOLDERS.name),
    shortName: setting(settings, 'school.shortName', SCHOOL_PLACEHOLDERS.shortName),
    address: setting(settings, 'school.address', SCHOOL_PLACEHOLDERS.address),
    city: setting(settings, 'school.city', SCHOOL_PLACEHOLDERS.city),
    state: setting(settings, 'school.state', SCHOOL_PLACEHOLDERS.state),
    postalCode: setting(settings, 'school.postalCode', SCHOOL_PLACEHOLDERS.postalCode),
    phone: setting(settings, 'school.phone', SCHOOL_PLACEHOLDERS.phone),
    alternatePhone: setting(settings, 'school.alternatePhone', SCHOOL_PLACEHOLDERS.alternatePhone),
    email: setting(settings, 'school.email', SCHOOL_PLACEHOLDERS.email),
    admissionsEmail: setting(settings, 'school.admissionsEmail', SCHOOL_PLACEHOLDERS.admissionsEmail),
    principalName: setting(settings, 'school.principalName', SCHOOL_PLACEHOLDERS.principalName),
    affiliationNumber: setting(settings, 'school.affiliationNumber', SCHOOL_PLACEHOLDERS.affiliationNumber),
    latitude: setting(settings, 'school.latitude', SCHOOL_PLACEHOLDERS.latitude),
    longitude: setting(settings, 'school.longitude', SCHOOL_PLACEHOLDERS.longitude),
  };
}

/**
 * Trust statistics.
 *
 * ⚠️ These are the highest-risk values on the entire site. A false board-result
 * percentage is a misrepresentation to a family making a six-year decision, and
 * it is the kind of number nobody checks because it looks reasonable. They stay
 * as placeholders until the school supplies them (OD-004).
 */
export async function getSchoolStats() {
  const settings = await getSiteSettings();

  return {
    established: setting(settings, 'stats.established', SCHOOL_PLACEHOLDERS.establishedYear),
    students: setting(settings, 'stats.students', SCHOOL_PLACEHOLDERS.studentCount),
    faculty: setting(settings, 'stats.faculty', SCHOOL_PLACEHOLDERS.facultyCount),
    boardResult: setting(settings, 'stats.boardResult', SCHOOL_PLACEHOLDERS.boardResultPct),
  };
}

/**
 * Admissions cycle status.
 *
 * The highest-staleness-risk content on the site (journey J5): an out-of-date
 * admission window actively misleads a parent about whether they can still
 * apply. ADMISSIONS_MANAGER can change it because they are the people who
 * actually know.
 */
export async function getAdmissionsStatus() {
  const settings = await getSiteSettings();

  const status = setting(settings, 'admissions.cycleStatus', 'CLOSED');

  return {
    isOpen: status === 'OPEN',
    status,
    academicYear: setting(
      settings,
      'admissions.academicYear',
      SCHOOL_PLACEHOLDERS.academicYear,
    ),
  };
}

/**
 * Social links.
 *
 * Empty values are filtered out rather than rendered as placeholders — the
 * school may simply not have these accounts, and a link to `[FACEBOOK_URL]` is
 * worse than no link at all.
 */
export async function getSocialLinks() {
  const settings = await getSiteSettings();

  return (['facebook', 'instagram', 'youtube'] as const)
    .map((platform) => ({
      platform,
      url: settings[`social.${platform}`] ?? '',
    }))
    .filter((link) => link.url.trim().length > 0);
}
