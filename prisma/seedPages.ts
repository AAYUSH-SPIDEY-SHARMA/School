import type { PrismaClient } from '@prisma/client';

import { PRIMARY_NAV, SCHOOL_CONFIRMED, BOARD } from '../lib/constants/site';

/**
 * Seed the editable page structure and navigation (ADR-0012).
 *
 * ⚠️ This seeds STRUCTURE, not school content.
 *
 * Sections are created with headings and layout in place, and with the school's
 * own words left as visible placeholder tokens. The homepage that results is
 * the same one the site already rendered — the difference is that every part of
 * it is now editable, reorderable and hideable from the admin.
 *
 * Nothing is invented: no fabricated prose, no statistics, no testimonials.
 * `[TOKENS]` render with a visible marker so an unfilled value is obvious on the
 * page rather than passing for real content.
 */

interface SeedSection {
  type: string;
  isVisible?: boolean;
  content: Record<string, unknown>;
}

interface SeedPage {
  slug: string;
  title: string;
  adminNote?: string;
  sections: SeedSection[];
}

/**
 * Pages that mirror a route which exists in the codebase.
 *
 * These are `isSystem`, meaning their address cannot be changed and they cannot
 * be deleted — the navigation and the router both point at them. Their title,
 * SEO and sections remain fully editable.
 */
const SYSTEM_PAGES: SeedPage[] = [
  {
    slug: '',
    title: 'Home',
    adminNote: 'The front page. Sections can be reordered, hidden or replaced.',
    sections: [
      {
        type: 'HERO',
        content: {
          eyebrow: `${BOARD} · Nursery to Class 10 · ${SCHOOL_CONFIRMED.city}`,
          headlineAccent: 'Curiosity, taught',
          headline: 'with care.',
          body: '[SCHOOL_TAGLINE]',
          primaryCta: { label: 'Enquire about admission', href: '/admissions/enquire' },
          secondaryCta: { label: 'Discover the school', href: '/about' },
          variant: 'ink',
        },
      },
      {
        type: 'STATS_BAND',
        content: {
          stats: [
            { value: '[ESTABLISHED_YEAR]', label: 'Established' },
            { value: '[STUDENT_COUNT]', label: 'Students' },
            { value: '[FACULTY_COUNT]', label: 'Teachers' },
            { value: '[BOARD_RESULT_PCT]', label: 'Board result' },
          ],
        },
      },
      {
        type: 'IMAGE_TEXT',
        content: {
          eyebrow: 'Our foundation',
          heading: 'A school built around the child',
          body: '[ABOUT_INTRO_PARAGRAPH]',
          imagePosition: 'right',
          cta: { label: 'About the school', href: '/about' },
        },
      },
      {
        type: 'CARD_GRID',
        content: {
          eyebrow: 'Academics',
          heading: 'Nursery through Class 10',
          intro: `Four stages, each with its own approach — from first steps in pre-primary to the ${BOARD} board year.`,
          columns: 4,
          cards: [
            { icon: 'BookOpen', title: 'Pre-Primary', body: 'Nursery to UKG', href: '/academics/pre-primary' },
            { icon: 'Sparkles', title: 'Primary', body: 'Class 1 to Class 5', href: '/academics/primary' },
            { icon: 'FlaskConical', title: 'Middle School', body: 'Class 6 to Class 8', href: '/academics/middle-school' },
            { icon: 'GraduationCap', title: 'Secondary School', body: 'Class 9 to Class 10', href: '/academics/secondary-school' },
          ],
        },
      },
      {
        type: 'NOTICE_LIST',
        content: {
          eyebrow: 'For current families',
          heading: 'Notices',
          limit: 4,
          showViewAll: true,
        },
      },
      {
        type: 'NEWS_LIST',
        content: {
          eyebrow: 'What is happening',
          heading: 'News from the school',
          limit: 3,
          showViewAll: true,
        },
      },
      {
        type: 'CARD_GRID',
        content: {
          eyebrow: 'Campus life',
          heading: 'More than the timetable',
          columns: 3,
          cards: [
            { icon: 'Palette', title: 'Arts & culture', body: 'Music, dance, drama and the visual arts.', href: '/campus-life/arts' },
            { icon: 'Trophy', title: 'Sports & clubs', body: 'Team games, athletics and student-led clubs.', href: '/campus-life/sports' },
            { icon: 'ShieldCheck', title: 'Safety & wellbeing', body: 'How the school looks after children.', href: '/about/safety' },
          ],
        },
      },
      {
        type: 'GALLERY_PREVIEW',
        content: { eyebrow: 'Gallery', heading: 'Life at the school', limit: 4 },
      },
      {
        type: 'TESTIMONIALS',
        content: { eyebrow: 'In their words', heading: 'What families say', limit: 3 },
      },
      {
        type: 'CTA_BAND',
        content: {
          eyebrow: 'Admissions',
          heading: 'Come and see the school',
          body: 'Send an enquiry and the admissions team will get back to you. It takes a minute, and you do not need to create an account.',
          primaryCta: { label: 'Enquire now', href: '/admissions/enquire' },
          secondaryCta: { label: 'How admission works', href: '/admissions' },
        },
      },
    ],
  },
  {
    slug: 'about',
    title: 'About the school',
    sections: [
      {
        type: 'HERO',
        content: {
          eyebrow: 'About us',
          headline: `About ${SCHOOL_CONFIRMED.name}`,
          body: '[SCHOOL_TAGLINE]',
          variant: 'ink',
        },
      },
      {
        type: 'RICH_TEXT',
        content: {
          eyebrow: 'Our story',
          heading: 'Who we are',
          body: '[ABOUT_FULL_TEXT]',
        },
      },
      { type: 'FACILITIES', content: { eyebrow: 'Campus', heading: 'Our facilities', limit: 6 } },
      {
        type: 'CTA_BAND',
        content: {
          heading: 'Visit us',
          body: 'The best way to understand a school is to walk through it.',
          primaryCta: { label: 'Arrange a visit', href: '/admissions/enquire' },
        },
      },
    ],
  },
  {
    slug: 'admissions',
    title: 'Admissions',
    sections: [
      {
        type: 'HERO',
        content: {
          eyebrow: 'Admissions',
          headlineAccent: 'Joining',
          headline: SCHOOL_CONFIRMED.name,
          body: 'Enquire about a place for the coming academic year.',
          primaryCta: { label: 'Send an enquiry', href: '/admissions/enquire' },
          variant: 'ink',
        },
      },
      {
        type: 'STEPS',
        content: {
          eyebrow: 'The process',
          heading: 'How admission works',
          steps: [
            { title: 'Send an enquiry', body: 'Tell us which class you are asking about. It takes a minute.' },
            { title: 'We call you back', body: 'The admissions team will contact you to answer questions.' },
            { title: 'Visit the school', body: 'Come and see the campus, and meet the teachers.' },
            { title: 'Complete admission', body: '[ADMISSION_FINAL_STEP_DETAIL]' },
          ],
        },
      },
      {
        type: 'FAQ',
        content: {
          heading: 'Common questions',
          items: [
            { question: 'Which classes are you admitting to?', answer: 'Nursery through Class 10.' },
            { question: 'What are the fees?', answer: '[FEE_STRUCTURE_ANSWER]' },
            { question: 'What documents are needed?', answer: '[ADMISSION_DOCUMENTS_ANSWER]' },
          ],
        },
      },
      { type: 'ENQUIRY_FORM', content: { heading: 'Send an enquiry' } },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    sections: [
      {
        type: 'HERO',
        content: {
          eyebrow: 'Contact',
          headline: 'Get in touch',
          body: `${SCHOOL_CONFIRMED.fullAddress}`,
          variant: 'ink',
        },
      },
      { type: 'CONTACT_INFO', content: { heading: 'How to reach us', showMap: true } },
      { type: 'ENQUIRY_FORM', content: { heading: 'Send a message' } },
    ],
  },
];

export async function seedPages(prisma: PrismaClient): Promise<void> {
  for (const page of SYSTEM_PAGES) {
    const existing = await prisma.page.findUnique({
      where: { slug: page.slug },
      select: { id: true },
    });

    if (existing) {
      // Never overwrite. Once the school has edited a page, re-running the seed
      // must not throw their work away.
      continue;
    }

    const created = await prisma.page.create({
      data: {
        slug: page.slug,
        title: page.title,
        adminNote: page.adminNote ?? null,
        isSystem: true,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      select: { id: true },
    });

    await prisma.pageSection.createMany({
      data: page.sections.map((section, index) => ({
        pageId: created.id,
        type: section.type as never,
        displayOrder: index,
        isVisible: section.isVisible ?? true,
        content: section.content as never,
      })),
    });
  }

  const count = await prisma.page.count();
  console.warn(`  ✓ ${count} page(s) — structure only, school words left as placeholders`);
}

/**
 * Seed navigation from the existing constant.
 *
 * The menu renders identically afterwards; the difference is that it is now a
 * database row the school can rename, reorder, hide or extend without a code
 * change — which is what "every link of every page" requires.
 */
export async function seedNavigation(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.navItem.count();
  if (existing > 0) {
    console.warn('  ✓ navigation already present — left untouched');
    return;
  }

  for (const [index, item] of PRIMARY_NAV.entries()) {
    const parent = await prisma.navItem.create({
      data: {
        label: item.label,
        href: item.href,
        location: 'primary',
        displayOrder: index,
        isVisible: true,
      },
      select: { id: true },
    });

    const children = 'children' in item ? item.children : [];

    if (children.length > 0) {
      await prisma.navItem.createMany({
        data: children.map((child, childIndex) => ({
          label: child.label,
          href: child.href,
          parentId: parent.id,
          location: 'primary',
          displayOrder: childIndex,
          isVisible: true,
        })),
      });
    }
  }

  const total = await prisma.navItem.count();
  console.warn(`  ✓ ${total} navigation link(s) — now editable`);
}
