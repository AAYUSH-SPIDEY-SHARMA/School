/**
 * Site-wide constants and PLACEHOLDER TOKENS.
 *
 * ⚠️ NOTHING ABOUT THE SCHOOL IS INVENTED HERE.
 *
 * The school's real identity — name, address, phone, email, affiliation number,
 * statistics, fees — has not been supplied (OD-001 … OD-005). Every such value
 * below is a bracketed token that is meant to be *visibly wrong* on the page.
 *
 * A plausible-looking invented value is far more dangerous than an obvious
 * placeholder: a false board-result figure or a wrong phone number on a real
 * school's website is a misrepresentation to families choosing a school, and it
 * survives review precisely because it looks reasonable
 * (BLUEPRINT/99_CLAUDE_WORKING_RULES rule 12).
 *
 * At runtime these are overridden by `SiteSetting` rows, which are themselves
 * seeded with the same tokens until the school supplies real values.
 */

export const PLACEHOLDER_PREFIX = '[';

/** Every school-owned fact the site needs, as an unmistakable token. */
export const SCHOOL_PLACEHOLDERS = {
  name: '[SCHOOL_NAME]',
  shortName: '[SCHOOL_SHORT_NAME]',
  tagline: '[SCHOOL_TAGLINE]',
  address: '[SCHOOL_ADDRESS]',
  city: '[CITY]',
  state: '[STATE]',
  postalCode: '[POSTAL_CODE]',
  phone: '[PHONE_NUMBER]',
  alternatePhone: '[ALTERNATE_PHONE_NUMBER]',
  email: '[EMAIL]',
  admissionsEmail: '[ADMISSIONS_EMAIL]',
  principalName: '[PRINCIPAL_NAME]',
  affiliationNumber: '[AFFILIATION_NUMBER]',
  establishedYear: '[ESTABLISHED_YEAR]',
  studentCount: '[STUDENT_COUNT]',
  facultyCount: '[FACULTY_COUNT]',
  boardResultPct: '[BOARD_RESULT_PCT]',
  academicYear: '[ACADEMIC_YEAR]',
  latitude: '[LATITUDE]',
  longitude: '[LONGITUDE]',
} as const;

export type SchoolPlaceholderKey = keyof typeof SCHOOL_PLACEHOLDERS;

/**
 * True when a value is still an unfilled placeholder.
 *
 * Used to render placeholders with a visible marker, and by the pre-launch
 * audit that must fail if any placeholder survives into production.
 */
export function isPlaceholder(value: string | null | undefined): boolean {
  return (
    typeof value === 'string' &&
    value.trim().startsWith('[') &&
    value.trim().endsWith(']')
  );
}

/**
 * Board affiliation. This IS an owner-approved decision (CBSE, Nursery–Class 10)
 * and is therefore a fact rather than a placeholder — but the school's own
 * affiliation NUMBER remains unknown.
 */
export const BOARD = 'CBSE' as const;

/**
 * Primary navigation — exactly six items plus a separate Admissions CTA.
 *
 * Six, not fourteen. Reference research found premium international schools
 * using 6–7 top-level items while an Indian reference used roughly fourteen
 * (45_RESEARCH_SOURCES F-5). A parent scanning on a phone cannot hold fourteen
 * options; the CTA is separated so the admissions path is never buried inside a
 * menu — the sector gap this project exists to close (F-1).
 */
export const PRIMARY_NAV = [
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Our School', href: '/about' },
      { label: 'Vision & Mission', href: '/about/vision-mission' },
      { label: "Principal's Message", href: '/about/principals-message' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'Infrastructure', href: '/about/infrastructure' },
      { label: 'Safety & Wellbeing', href: '/about/safety' },
      { label: 'Transport', href: '/about/transport' },
    ],
  },
  {
    label: 'Academics',
    href: '/academics',
    children: [
      { label: 'Overview', href: '/academics' },
      { label: 'Curriculum', href: '/academics/curriculum' },
      { label: 'Pre-Primary', href: '/academics/pre-primary' },
      { label: 'Primary', href: '/academics/primary' },
      { label: 'Middle School', href: '/academics/middle-school' },
      { label: 'Secondary School', href: '/academics/secondary-school' },
      { label: 'Faculty', href: '/academics/faculty' },
    ],
  },
  {
    label: 'Campus Life',
    href: '/campus-life',
    children: [
      { label: 'Overview', href: '/campus-life' },
      { label: 'Sports', href: '/campus-life/sports' },
      { label: 'Clubs & Activities', href: '/campus-life/clubs' },
      { label: 'Arts & Culture', href: '/campus-life/arts' },
      { label: 'Achievements', href: '/achievements' },
    ],
  },
  { label: 'Gallery', href: '/gallery' },
  {
    label: 'News & Events',
    href: '/news',
    children: [
      { label: 'News', href: '/news' },
      { label: 'Events', href: '/events' },
      { label: 'Notices', href: '/notices' },
      { label: 'Academic Calendar', href: '/academic-calendar' },
      { label: 'Downloads', href: '/downloads' },
    ],
  },
  { label: 'Contact', href: '/contact' },
] as const;

/** The one call to action that matters. Deliberately outside the nav list. */
export const ADMISSIONS_CTA = {
  label: 'Admissions',
  href: '/admissions',
  enquireHref: '/admissions/enquire',
} as const;

export const FOOTER_LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Sitemap', href: '/sitemap' },
] as const;

/** Pagination size, shared by public listings and admin tables. */
export const PAGE_SIZE = 12;
