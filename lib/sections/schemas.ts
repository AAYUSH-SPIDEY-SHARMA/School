import { z } from 'zod';

/**
 * Section content schemas — one per `SectionType`.
 *
 * ⚠️ THIS FILE IS WHAT STOPS THE PAGE BUILDER BECOMING A BLANK CANVAS.
 *
 * ADR-0012 reversed the "no page builder" rejection, but on a specific
 * condition: the school controls **which sections appear, in what order, and
 * what goes in them** — not the markup. Every field a section can hold is
 * declared here, and nothing else is storable. There is no raw HTML field, no
 * inline style field, no nesting.
 *
 * That is why a rearranged page still has correct heading order, sufficient
 * contrast and working responsive behaviour: those are properties of the
 * section type, not of what someone typed.
 *
 * `PageSection.content` is JSON in the database because each type has a
 * different field set. The database holds it; these schemas guarantee it, in
 * the Server Action, exactly like every other write.
 */

/* ── Shared field types ───────────────────────────────────────────────────── */

const shortText = z.string().trim().max(200);
const mediumText = z.string().trim().max(600);
const longText = z.string().trim().max(20_000);
const optionalId = z.string().trim().max(50).optional().or(z.literal(''));

/**
 * A link.
 *
 * `href` accepts an internal path or an absolute URL. It deliberately does NOT
 * accept `javascript:` or `data:` — a content field that can execute script is
 * a stored-XSS hole, and the school pasting a link should never be able to open
 * one by accident.
 */
const link = z.object({
  label: shortText,
  href: z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) =>
        value === '' ||
        value.startsWith('/') ||
        value.startsWith('https://') ||
        value.startsWith('http://') ||
        value.startsWith('mailto:') ||
        value.startsWith('tel:'),
      { message: 'Use an internal path (/about) or a full https:// address' },
    ),
});

const optionalLink = link.partial().optional();

/** A short uppercase label above a heading. */
const eyebrow = shortText.optional().or(z.literal(''));
const heading = shortText.optional().or(z.literal(''));

/** How many linked records a content-driven section pulls in. */
const limit = z.coerce.number().int().min(1).max(24).default(6);

/* ── One schema per section type ──────────────────────────────────────────── */

export const heroSchema = z.object({
  eyebrow,
  /** Rendered in gold, on the navy block. */
  headlineAccent: shortText.optional().or(z.literal('')),
  /** Rendered in cream, beneath the accent line. */
  headline: shortText,
  body: mediumText.optional().or(z.literal('')),
  primaryCta: optionalLink,
  secondaryCta: optionalLink,
  backgroundImageId: optionalId,
  /** `ink` is the deep navy block; `light` sits on the cream page. */
  variant: z.enum(['ink', 'light']).default('ink'),
});

export const richTextSchema = z.object({
  eyebrow,
  heading,
  body: longText,
  align: z.enum(['left', 'center']).default('left'),
});

export const imageTextSchema = z.object({
  eyebrow,
  heading,
  body: longText,
  imageId: optionalId,
  imagePosition: z.enum(['left', 'right']).default('right'),
  cta: optionalLink,
});

export const statsBandSchema = z.object({
  heading,
  stats: z
    .array(
      z.object({
        /**
         * ⚠️ These are the highest-risk values on the site. A wrong board
         * result misleads a family making a six-year decision. The field
         * accepts a placeholder token deliberately, so an unfilled figure
         * renders as visibly unfilled rather than as a plausible number.
         */
        value: shortText,
        label: shortText,
      }),
    )
    .max(6)
    .default([]),
});

export const cardGridSchema = z.object({
  eyebrow,
  heading,
  intro: mediumText.optional().or(z.literal('')),
  columns: z.coerce.number().int().min(2).max(4).default(3),
  cards: z
    .array(
      z.object({
        /** Name from the Lucide set; unknown names fall back to a default. */
        icon: shortText.optional().or(z.literal('')),
        title: shortText,
        body: mediumText.optional().or(z.literal('')),
        href: link.shape.href.optional().or(z.literal('')),
      }),
    )
    .max(12)
    .default([]),
});

export const ctaBandSchema = z.object({
  eyebrow,
  heading,
  body: mediumText.optional().or(z.literal('')),
  primaryCta: optionalLink,
  secondaryCta: optionalLink,
});

export const faqSchema = z.object({
  eyebrow,
  heading,
  items: z
    .array(z.object({ question: shortText, answer: longText }))
    .max(30)
    .default([]),
});

export const stepsSchema = z.object({
  eyebrow,
  heading,
  intro: mediumText.optional().or(z.literal('')),
  steps: z
    .array(z.object({ title: shortText, body: mediumText.optional().or(z.literal('')) }))
    .max(12)
    .default([]),
});

export const videoSchema = z.object({
  heading,
  /** A MediaAsset of kind VIDEO — Cloudinary, YouTube or Drive. */
  mediaAssetId: optionalId,
  caption: mediumText.optional().or(z.literal('')),
});

export const imageSchema = z.object({
  mediaAssetId: optionalId,
  caption: mediumText.optional().or(z.literal('')),
  width: z.enum(['contained', 'full']).default('contained'),
});

export const spacerSchema = z.object({
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  showRule: z.boolean().default(false),
});

export const contactInfoSchema = z.object({
  eyebrow,
  heading,
  body: mediumText.optional().or(z.literal('')),
  showMap: z.boolean().default(true),
});

export const enquiryFormSchema = z.object({
  eyebrow,
  heading,
  intro: mediumText.optional().or(z.literal('')),
});

/* ── Content-driven sections: they pull live CMS records ──────────────────── */

const listSectionBase = {
  eyebrow,
  heading,
  intro: mediumText.optional().or(z.literal('')),
  limit,
  showViewAll: z.boolean().default(true),
};

export const newsListSchema = z.object(listSectionBase);
export const noticeListSchema = z.object(listSectionBase);
export const galleryPreviewSchema = z.object(listSectionBase);
export const testimonialsSchema = z.object({
  ...listSectionBase,
  featuredOnly: z.boolean().default(true),
});
export const achievementsSchema = z.object({
  ...listSectionBase,
  featuredOnly: z.boolean().default(true),
});
export const eventListSchema = z.object({
  ...listSectionBase,
  mode: z.enum(['upcoming', 'past']).default('upcoming'),
});
export const facultyListSchema = z.object({
  ...listSectionBase,
  leadershipOnly: z.boolean().default(false),
  departmentSlug: shortText.optional().or(z.literal('')),
});
export const documentListSchema = z.object({
  ...listSectionBase,
  category: shortText.optional().or(z.literal('')),
});
export const facilitiesSchema = z.object({
  ...listSectionBase,
  category: shortText.optional().or(z.literal('')),
});

/* ── Registry ─────────────────────────────────────────────────────────────── */

/**
 * Every section type, with the schema that validates it and the copy the admin
 * shows.
 *
 * Kept in one object so a new type cannot be half-added: if it is here, it has
 * a schema, a label, a description and defaults.
 */
export const SECTION_REGISTRY = {
  HERO: {
    schema: heroSchema,
    label: 'Hero',
    description: 'Large opening block with a headline and buttons.',
    group: 'Layout',
  },
  RICH_TEXT: {
    schema: richTextSchema,
    label: 'Text',
    description: 'A heading and paragraphs. The general-purpose section.',
    group: 'Layout',
  },
  IMAGE_TEXT: {
    schema: imageTextSchema,
    label: 'Image and text',
    description: 'A picture beside text, image on the left or right.',
    group: 'Layout',
  },
  STATS_BAND: {
    schema: statsBandSchema,
    label: 'Statistics',
    description: 'A row of figures with labels.',
    group: 'Layout',
  },
  CARD_GRID: {
    schema: cardGridSchema,
    label: 'Cards',
    description: 'A row of linked cards with an icon, title and description.',
    group: 'Layout',
  },
  CTA_BAND: {
    schema: ctaBandSchema,
    label: 'Call to action',
    description: 'A full-width navy band with a heading and buttons.',
    group: 'Layout',
  },
  STEPS: {
    schema: stepsSchema,
    label: 'Steps',
    description: 'Numbered steps — an admissions process, for example.',
    group: 'Layout',
  },
  FAQ: {
    schema: faqSchema,
    label: 'Questions and answers',
    description: 'Expandable question and answer pairs.',
    group: 'Layout',
  },
  IMAGE: {
    schema: imageSchema,
    label: 'Image',
    description: 'A single photograph, shown at full quality.',
    group: 'Media',
  },
  VIDEO: {
    schema: videoSchema,
    label: 'Video',
    description: 'A video from YouTube, Google Drive or an upload.',
    group: 'Media',
  },
  GALLERY_PREVIEW: {
    schema: galleryPreviewSchema,
    label: 'Gallery preview',
    description: 'Recent photo albums, pulled from the gallery.',
    group: 'From the CMS',
  },
  SPACER: {
    schema: spacerSchema,
    label: 'Spacer',
    description: 'Blank space, optionally with a dividing line.',
    group: 'Layout',
  },
  NEWS_LIST: {
    schema: newsListSchema,
    label: 'News',
    description: 'Latest news articles, pulled automatically.',
    group: 'From the CMS',
  },
  NOTICE_LIST: {
    schema: noticeListSchema,
    label: 'Notices',
    description: 'Current notices. Expired ones disappear on their own.',
    group: 'From the CMS',
  },
  EVENT_LIST: {
    schema: eventListSchema,
    label: 'Events',
    description: 'Upcoming or past events, pulled automatically.',
    group: 'From the CMS',
  },
  FACULTY_LIST: {
    schema: facultyListSchema,
    label: 'Teachers',
    description: 'Faculty profiles, all or leadership only.',
    group: 'From the CMS',
  },
  TESTIMONIALS: {
    schema: testimonialsSchema,
    label: 'Testimonials',
    description: 'What parents and alumni have said.',
    group: 'From the CMS',
  },
  ACHIEVEMENTS: {
    schema: achievementsSchema,
    label: 'Achievements',
    description: 'Results and awards, pulled automatically.',
    group: 'From the CMS',
  },
  DOCUMENT_LIST: {
    schema: documentListSchema,
    label: 'Downloads',
    description: 'Downloadable forms and documents.',
    group: 'From the CMS',
  },
  FACILITIES: {
    schema: facilitiesSchema,
    label: 'Facilities',
    description: 'Facilities, from Settings.',
    group: 'From the CMS',
  },
  CONTACT_INFO: {
    schema: contactInfoSchema,
    label: 'Contact details',
    description: 'Address, phone, email and a map.',
    group: 'Forms',
  },
  ENQUIRY_FORM: {
    schema: enquiryFormSchema,
    label: 'Enquiry form',
    description: 'The admission enquiry form.',
    group: 'Forms',
  },
} as const;

export type SectionTypeKey = keyof typeof SECTION_REGISTRY;

export const SECTION_TYPE_KEYS = Object.keys(SECTION_REGISTRY) as SectionTypeKey[];

export const SECTION_GROUPS = [
  'Layout',
  'Media',
  'From the CMS',
  'Forms',
] as const;

/**
 * Validate a section's content against its own type.
 *
 * Throws a `ZodError`, which the action layer already converts into per-field
 * messages — so a malformed section reports which field is wrong rather than
 * failing opaquely.
 */
export function parseSectionContent(
  type: SectionTypeKey,
  content: unknown,
): Record<string, unknown> {
  const entry = SECTION_REGISTRY[type];
  return entry.schema.parse(content ?? {}) as Record<string, unknown>;
}

/**
 * Content for a newly added section.
 *
 * Parsing `{}` lets each schema's own `.default()` values supply the shape, so
 * defaults live in exactly one place rather than being restated here.
 */
export function defaultSectionContent(
  type: SectionTypeKey,
): Record<string, unknown> {
  const entry = SECTION_REGISTRY[type];
  const parsed = entry.schema.safeParse({});
  return parsed.success ? (parsed.data as Record<string, unknown>) : {};
}
