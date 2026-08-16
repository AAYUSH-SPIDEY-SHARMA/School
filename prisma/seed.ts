import 'dotenv/config';

import { hash } from '@node-rs/argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { SCHOOL_PLACEHOLDERS } from '../lib/constants/site';

/**
 * Database seed.
 *
 * ⚠️ THIS SEEDS STRUCTURE AND PLACEHOLDERS ONLY. IT INVENTS NOTHING.
 *
 * There are no sample news articles, no fictional faculty, no made-up
 * statistics and no stock testimonials. Every school-owned value is written as
 * a bracketed `[PLACEHOLDER]` token, exactly as it appears in the blueprint.
 *
 * The reason is not tidiness. Seeded "example" content on a real school's site
 * has a habit of surviving to production, and a plausible-looking invented
 * board result or a fake parent testimonial is a misrepresentation to families
 * choosing a school (99_CLAUDE_WORKING_RULES rule 12, CR-002).
 *
 * The only thing created with real values is the first SUPER_ADMIN account,
 * because there is no public registration and the system would otherwise have
 * no way in. Its credentials come from the environment, never from source.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/**
 * Global configuration, all seeded as placeholders.
 *
 * Global SEO lives here; entity SEO lives on entities (a specific review
 * correction — the two were previously conflated).
 */
const SITE_SETTINGS: Array<{ key: string; value: string; group: string }> = [
  // contact
  { key: 'school.name', value: SCHOOL_PLACEHOLDERS.name, group: 'contact' },
  { key: 'school.shortName', value: SCHOOL_PLACEHOLDERS.shortName, group: 'contact' },
  { key: 'school.address', value: SCHOOL_PLACEHOLDERS.address, group: 'contact' },
  { key: 'school.city', value: SCHOOL_PLACEHOLDERS.city, group: 'contact' },
  { key: 'school.state', value: SCHOOL_PLACEHOLDERS.state, group: 'contact' },
  { key: 'school.postalCode', value: SCHOOL_PLACEHOLDERS.postalCode, group: 'contact' },
  { key: 'school.phone', value: SCHOOL_PLACEHOLDERS.phone, group: 'contact' },
  { key: 'school.alternatePhone', value: SCHOOL_PLACEHOLDERS.alternatePhone, group: 'contact' },
  { key: 'school.email', value: SCHOOL_PLACEHOLDERS.email, group: 'contact' },
  { key: 'school.admissionsEmail', value: SCHOOL_PLACEHOLDERS.admissionsEmail, group: 'contact' },
  { key: 'school.principalName', value: SCHOOL_PLACEHOLDERS.principalName, group: 'contact' },
  { key: 'school.affiliationNumber', value: SCHOOL_PLACEHOLDERS.affiliationNumber, group: 'contact' },
  { key: 'school.latitude', value: SCHOOL_PLACEHOLDERS.latitude, group: 'contact' },
  { key: 'school.longitude', value: SCHOOL_PLACEHOLDERS.longitude, group: 'contact' },

  // stats — ⚠️ NEVER invent these. A false board-result figure on a real
  // school's website misinforms families making a six-year decision.
  { key: 'stats.established', value: SCHOOL_PLACEHOLDERS.establishedYear, group: 'stats' },
  { key: 'stats.students', value: SCHOOL_PLACEHOLDERS.studentCount, group: 'stats' },
  { key: 'stats.faculty', value: SCHOOL_PLACEHOLDERS.facultyCount, group: 'stats' },
  { key: 'stats.boardResult', value: SCHOOL_PLACEHOLDERS.boardResultPct, group: 'stats' },

  // seo
  { key: 'seo.defaultTitle', value: SCHOOL_PLACEHOLDERS.name, group: 'seo' },
  { key: 'seo.defaultDescription', value: SCHOOL_PLACEHOLDERS.tagline, group: 'seo' },
  { key: 'seo.defaultOgImage', value: '', group: 'seo' },

  // admissions
  { key: 'admissions.cycleStatus', value: 'CLOSED', group: 'admissions' },
  { key: 'admissions.academicYear', value: SCHOOL_PLACEHOLDERS.academicYear, group: 'admissions' },

  // social — empty rather than placeholder: a broken social link is worse than
  // no social link, and the school may simply not have these accounts.
  { key: 'social.facebook', value: '', group: 'social' },
  { key: 'social.instagram', value: '', group: 'social' },
  { key: 'social.youtube', value: '', group: 'social' },
];

/**
 * Departments.
 *
 * These are CBSE subject groupings, which are a property of the board rather
 * than of this particular school, so seeding them invents nothing. They exist
 * because the faculty directory filter needs something to group by; the school
 * can rename or remove any of them.
 */
const DEPARTMENTS = [
  { name: 'Pre-Primary', slug: 'pre-primary', displayOrder: 1 },
  { name: 'English', slug: 'english', displayOrder: 2 },
  { name: 'Hindi', slug: 'hindi', displayOrder: 3 },
  { name: 'Mathematics', slug: 'mathematics', displayOrder: 4 },
  { name: 'Science', slug: 'science', displayOrder: 5 },
  { name: 'Social Science', slug: 'social-science', displayOrder: 6 },
  { name: 'Computer Science', slug: 'computer-science', displayOrder: 7 },
  { name: 'Physical Education', slug: 'physical-education', displayOrder: 8 },
  { name: 'Arts', slug: 'arts', displayOrder: 9 },
];

async function seedSiteSettings(): Promise<void> {
  for (const setting of SITE_SETTINGS) {
    // upsert, so re-running never clobbers a real value the school has entered.
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.warn(`  ✓ ${SITE_SETTINGS.length} site settings (all placeholders)`);
}

async function seedDepartments(): Promise<void> {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { slug: department.slug },
      update: {},
      create: department,
    });
  }
  console.warn(`  ✓ ${DEPARTMENTS.length} departments`);
}

async function seedFirstAdmin(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      '  ⚠ SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — no admin created.',
    );
    return;
  }

  if (password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.warn(`  ✓ admin already exists (${email}) — left untouched`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name: 'Site Administrator',
      // Same argon2id parameters as lib/auth/password.ts. Duplicated rather
      // than imported because this script runs outside the Next.js module
      // graph, where `server-only` would throw.
      passwordHash: await hash(password, {
        algorithm: 2, // Argon2id
        memoryCost: 19_456,
        timeCost: 2,
        parallelism: 1,
      }),
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.warn(`  ✓ SUPER_ADMIN created (${email})`);
  console.warn('  ⚠ Change this password immediately after first sign-in.');
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    // The seed writes placeholder values and a known-credential account.
    // Neither belongs in production.
    throw new Error(
      'Refusing to seed in production. Create production accounts through the admin UI.',
    );
  }

  console.warn('Seeding — structure and placeholders only, no invented content.');

  await seedSiteSettings();
  await seedDepartments();
  await seedFirstAdmin();

  console.warn('Seed complete.');
  console.warn(
    'No news, events, faculty, testimonials or photographs were created — ' +
      'that content must come from the school (BLUEPRINT/51_SCHOOL_ASSET_REQUEST.md).',
  );
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
