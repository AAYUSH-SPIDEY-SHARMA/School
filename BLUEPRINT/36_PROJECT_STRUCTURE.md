# 36 — Project Structure

| Field | Value |
|---|---|
| **Status** | PROPOSED — repository contains only `BLUEPRINT/` and `HISTORY/` |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Frontend Lead |
| **Dependencies** | [14_FRONTEND_ARCHITECTURE](14_FRONTEND_ARCHITECTURE.md) · [07_SITE_MAP](07_SITE_MAP.md) |
| **Related Documents** | [11_UI_UX_SYSTEM](11_UI_UX_SYSTEM.md) · [15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md) |

---

## Current state

```
school/
├── BLUEPRINT/     51 documents
└── HISTORY/       change records and ADRs
```

**No application code exists.** Everything below is the target structure to create during implementation.

---

## Target structure

```
school/
│
├── BLUEPRINT/
├── HISTORY/
│
├── app/
│   ├── (public)/                     route group — public layout
│   │   ├── layout.tsx
│   │   ├── page.tsx                          /
│   │   ├── about/
│   │   │   ├── page.tsx                      /about
│   │   │   ├── vision-mission/
│   │   │   ├── principals-message/
│   │   │   ├── leadership/
│   │   │   ├── infrastructure/
│   │   │   ├── safety/
│   │   │   └── transport/
│   │   ├── academics/
│   │   │   ├── page.tsx
│   │   │   ├── curriculum/
│   │   │   ├── pre-primary/
│   │   │   ├── primary/
│   │   │   ├── middle-school/
│   │   │   ├── secondary-school/
│   │   │   └── faculty/
│   │   │       ├── page.tsx
│   │   │       └── [slug]/
│   │   ├── admissions/
│   │   │   ├── page.tsx
│   │   │   ├── process/
│   │   │   ├── eligibility/
│   │   │   ├── fees/
│   │   │   ├── important-dates/
│   │   │   ├── faqs/
│   │   │   └── enquire/
│   │   ├── campus-life/
│   │   │   ├── page.tsx
│   │   │   ├── sports/
│   │   │   ├── clubs/
│   │   │   └── arts/
│   │   ├── gallery/          page.tsx + [slug]/
│   │   ├── news/             page.tsx + [slug]/
│   │   ├── events/           page.tsx + [slug]/
│   │   ├── achievements/
│   │   ├── notices/
│   │   ├── downloads/
│   │   ├── academic-calendar/
│   │   ├── contact/
│   │   ├── privacy-policy/
│   │   ├── terms/
│   │   ├── sitemap/
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── admin/                        separate layout, no public chrome
│   │   ├── layout.tsx                auth gate + admin shell
│   │   ├── page.tsx                  dashboard
│   │   ├── login/
│   │   ├── enquiries/                page.tsx + [id]/
│   │   ├── news/ events/ notices/ downloads/
│   │   ├── gallery/ faculty/ achievements/ testimonials/
│   │   │       └── each: page.tsx + new/ + [id]/edit/
│   │   ├── media/
│   │   ├── settings/
│   │   ├── users/                    page.tsx + new/ + [id]/edit/
│   │   └── audit-log/
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── health/
│   │   ├── revalidate/
│   │   ├── og/[type]/[slug]/
│   │   └── media/sign/
│   │
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── manifest.ts
│   ├── opengraph-image.tsx
│   ├── global-error.tsx
│   └── globals.css                   @theme design tokens
│
├── components/
│   ├── ui/            shadcn primitives, restyled onto tokens
│   ├── layout/        header, utility bar, nav, drawer, footer, breadcrumbs, skip link
│   ├── sections/      hero, stat band, homepage sections, CTA band
│   ├── cards/         CardShell + the 9 variants
│   ├── media/         responsive image, grids, lightbox, avatar, lazy map
│   ├── forms/         form field primitives, enquiry form, contact form
│   ├── feedback/      empty, error, skeleton, toast, spinner
│   └── admin/         admin shell, data table, editors, uploaders
│
├── lib/
│   ├── db/            Prisma client singleton
│   ├── auth/          auth.ts, auth.config.ts, guards
│   ├── actions/       Server Actions by domain
│   ├── queries/       read functions by domain
│   ├── validations/   Zod schemas — shared client/server
│   ├── seo/           metadata builders, JSON-LD
│   ├── media/         provider wrapper
│   ├── email/         provider wrapper
│   ├── audit/         audit log helper
│   ├── constants/     class levels, categories, nav config
│   └── utils/
│
├── types/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   ├── images/  icons/  fonts/
│
├── tests/
│   ├── unit/  integration/  e2e/  fixtures/
│
├── proxy.ts                          NOT middleware.ts
├── next.config.ts
├── tsconfig.json
├── package.json
├── .env.example                      names only
├── .gitignore                        must ignore .env from the first commit
└── README.md
```

---

## Structural decisions

### `(public)` route group
The public site and admin have entirely different layouts, chrome, and loaded fonts. The route group isolates the public layout without adding a URL segment — `/about`, not `/public/about`.

### `proxy.ts`, not `middleware.ts`
Required in the Next.js 16.x line. It imports only `auth.config.ts` (adapter-free) — importing the full `auth.ts` pulls the database adapter into the request-interception boundary and breaks ([14_FRONTEND_ARCHITECTURE](14_FRONTEND_ARCHITECTURE.md)).

### `lib/queries` and `lib/actions` are separate
Reads and writes have different obligations. Writes must authenticate, authorise, validate, and audit; reads must scope to published, non-deleted content. Separating them makes it structurally obvious when one of those steps is missing.

### Components never import Prisma
All data access goes through `lib/queries` or `lib/actions`. This is what makes the soft-delete filter and the authorisation check impossible to forget — the single most important structural rule in the codebase ([15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md)).

### `lib/constants`
Class levels, category lists, and navigation configuration live in one place. The class list in particular — **Nursery through Class 10, no Class 11 or 12** — must have exactly one definition, or the invariant will eventually drift in one of the several places it appears.

### No barrel files
No `index.ts` re-export files. They defeat tree-shaking, obscure where things come from, and create circular-import hazards. Import from the actual module path.

---

## Naming conventions

| Kind | Convention | Example |
|---|---|---|
| Components | PascalCase | `NewsCard.tsx` |
| Utilities, hooks | camelCase | `formatDate.ts`, `useMediaQuery.ts` |
| Route folders | lowercase-hyphenated | `academic-calendar/` |
| Server Actions | verb-first camelCase | `publishNotice.ts` |
| Query functions | `get*` / `list*` | `getPublishedNotices` |
| Zod schemas | `*Schema` | `enquirySchema` |
| Types | PascalCase | `EnquiryFormValues` |
| Props interfaces | `{Component}Props` | `NewsCardProps` |
| Constants | SCREAMING_SNAKE | `CLASS_LEVELS` |
| Test files | `*.test.ts` / `*.spec.ts` | `enquiry.test.ts` |

Named exports throughout, except the default exports Next.js requires for pages and layouts.

---

## Import conventions

Absolute imports via `@/`. Ordering: external packages → internal absolute → relative → types → styles. Enforced by lint so it is not a review conversation.

---

## File size guidance

Not hard limits — indicators that something may want splitting.

| Kind | Watch above |
|---|---|
| Component | ~200 lines |
| Page | ~150 lines — a long page usually means sections should be extracted |
| Server Action | ~80 lines |
| Query | ~50 lines |

A page component's job is composition. If it contains substantial markup, that markup belongs in `components/sections`.

---

## Where things go — quick reference

| Adding… | Location |
|---|---|
| A public page | `app/(public)/…/page.tsx` + spec in [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) + row in [07_SITE_MAP](07_SITE_MAP.md) |
| A reusable UI piece | `components/` — **check the inventory in [11_UI_UX_SYSTEM](11_UI_UX_SYSTEM.md) first** |
| A mutation | `lib/actions/` |
| A read | `lib/queries/` |
| A validation rule | `lib/validations/` — shared, never duplicated |
| An entity | `prisma/schema.prisma` + [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) + a HISTORY entry |
| An admin module | `app/admin/` + [20_ADMIN_CMS](20_ADMIN_CMS.md) + [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) |

Every row includes a documentation obligation. Code added without it is drift ([44_CHANGE_MANAGEMENT](44_CHANGE_MANAGEMENT.md)).

---

## `.gitignore` — required from the first commit

```
node_modules/
.next/
.env
.env.local
.env*.local
*.log
.DS_Store
coverage/
playwright-report/
test-results/
```

⚠️ `.env` must be ignored **in the very first commit**. A secret committed once remains in git history permanently, and removing it requires rewriting history.
