# 14 — Frontend Architecture

| Field | Value |
|---|---|
| **Status** | PROPOSED — pending stack approval |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Frontend Lead |
| **Dependencies** | [12_TECH_STACK](12_TECH_STACK.md) · [13_SYSTEM_ARCHITECTURE](13_SYSTEM_ARCHITECTURE.md) |
| **Related Documents** | [11_UI_UX_SYSTEM](11_UI_UX_SYSTEM.md) · [27_PERFORMANCE](27_PERFORMANCE.md) · [36_PROJECT_STRUCTURE](36_PROJECT_STRUCTURE.md) |

---

## Core rule: server by default

**Every component is a Server Component unless it demonstrably needs to be a Client Component.**

`"use client"` is a deliberate, justified decision — not a default and not a convenience. Each usage costs bundle size and hydration time on a mid-range Android phone, which is the primary persona's device.

### Client Components — the complete list

Only these need client interactivity in v1. Anything else added to this list needs a reason.

| Component | Why it must be client |
|---|---|
| `MobileDrawer` | Open/close state, focus trap |
| `NavDropdown` | Hover/focus state, keyboard handling |
| `StatCounter` | Scroll-triggered count-up |
| `Lightbox` | Modal state, keyboard navigation, focus trap |
| `EnquiryForm` | Field state, validation feedback, submission state |
| `ContactForm` | As above |
| `FilterChips` | Client-side filtering |
| `TestimonialCarousel` | Slide state |
| `Accordion` | Expand/collapse |
| `LazyMap` | Deferred iframe loading on interaction |
| Admin editors, uploaders, data tables | Rich interaction |

Everything else — every page, layout, card, table, listing, header, footer — is a Server Component.

### Client-boundary discipline
Push `"use client"` **down** the tree, never up. A page containing one interactive filter does not become a Client Component; the filter does. Client Components receive serialisable props and never import server-only modules.

---

## Rendering strategy per route

| Route group | Strategy | Rationale |
|---|---|---|
| Static prose (About, Academics, Admissions sub-pages, legal) | Static | Content changes rarely; regenerate on deploy |
| Home | Cached + tag revalidation | Composes dynamic news/events |
| Listings (News, Events, Gallery, Notices, Downloads, Faculty, Achievements) | Cached + tag revalidation | Change on publish, not on a timer |
| Detail pages (`[slug]`) | Cached + tag revalidation, params generated at build where feasible | — |
| `/admissions/enquire` | Dynamic | Form; nothing to cache |
| `/admin/*` | Dynamic, never cached | Authenticated, always fresh |

### Cache invalidation — the two-API distinction

This is the most consequential caching decision, and getting it wrong produces a specific, confusing bug.

| Context | API | Semantics |
|---|---|---|
| Public read path | `revalidateTag(tag, profile)` | Stale-while-revalidate — parents get an instant cached page while it refreshes behind them |
| Admin Server Action | `updateTag(tag)` | **Read-your-writes** — the editor sees their change immediately |

Without `updateTag` on the write path, an editor publishes a notice, does not see it, and publishes again — repeatedly. This is exactly the friction that causes staff to abandon a CMS, which is the root cause of the content rot observed in the reference sites (F-3, J7).

**Tag naming:** `news`, `news:{slug}`, `events`, `notices`, `gallery`, `faculty`, `settings`. Publishing a news article invalidates both `news` and `news:{slug}`.

---

## Directory structure

```
app/
├── (public)/                    route group — public layout
│   ├── layout.tsx               header, footer, skip link
│   ├── page.tsx                 /
│   ├── about/…                  7 routes
│   ├── academics/…              7 routes + faculty/[slug]
│   ├── admissions/…             7 routes
│   ├── campus-life/…            4 routes
│   ├── gallery/                 + [slug]
│   ├── news/                    + [slug]
│   ├── events/                  + [slug]
│   ├── achievements/ notices/ downloads/ academic-calendar/
│   ├── contact/ privacy-policy/ terms/ sitemap/
│   ├── not-found.tsx
│   └── error.tsx
├── admin/                       separate layout, no public chrome
│   ├── layout.tsx               auth gate + admin shell
│   ├── login/
│   └── …34 admin routes
├── robots.ts
├── sitemap.ts
├── manifest.ts
├── opengraph-image.tsx
└── globals.css                  @theme tokens

components/
├── ui/                          shadcn primitives, restyled to tokens
├── layout/                      header, footer, nav, drawer, breadcrumbs
├── sections/                    homepage and page sections
├── cards/                       the 9 card variants + CardShell
├── media/                       image, grid, lightbox, map
├── forms/                       fields, enquiry, contact
├── feedback/                    empty, error, skeleton, toast
└── admin/                       admin-only components

lib/
├── db/                          Prisma client singleton
├── auth/                        config, session helpers, role guards
├── actions/                     Server Actions, grouped by domain
├── queries/                     reusable data-access functions
├── validations/                 Zod schemas — shared client/server
├── seo/                         metadata builders, JSON-LD
├── media/                       Cloudinary wrapper
├── email/                       transactional email wrapper
└── utils/

types/
prisma/
public/
proxy.ts                         NOT middleware.ts
```

**Two route groups** because the public site and admin have entirely different layouts, fonts loaded, and chrome. `(public)` keeps the URL clean while isolating the layout.

---

## `proxy.ts` — not `middleware.ts`

In the Next.js 16.x line, `middleware.ts` is superseded by **`proxy.ts`**, exporting a `proxy` function and running on the Node runtime.

Responsibilities, deliberately minimal:
1. Check session **presence** on `/admin/*`; redirect to login if absent
2. Apply security headers
3. Handle legacy-slug 301 redirects

**Critical constraint.** `proxy.ts` must import only a lightweight, adapter-free auth configuration. Importing the full auth setup pulls the database adapter and its Node-only dependencies into the request-interception boundary and will fail or bloat. Split the config: `auth.config.ts` (edge-safe, no adapter) for the proxy; `auth.ts` (full, with adapter) for Server Actions and pages.

**The proxy is not the security boundary.** It checks that a session exists; it does not check roles. Role authorisation happens in every Server Action and page, because a Server Action is a directly invocable HTTP endpoint (AR-003).

---

## Data access

```
Server Component  →  lib/queries/*  →  Prisma  →  Postgres
Client Component  →  Server Action  →  lib/actions/*  →  Prisma
```

**Rules**
1. Components never call Prisma directly — always through `lib/queries` or `lib/actions`
2. Query functions filter unpublished content **at the query layer**, not in the UI
3. Server Actions validate with Zod and authorise before touching data
4. No `useEffect`-based fetching on the public site
5. No client-side data fetching library — server components remove the need

---

## Forms

React Hook Form for field state; Zod for validation; **one schema shared by client and server**.

```
lib/validations/enquiry.ts   ← single source of truth
        ├──→ EnquiryForm (client) — instant feedback
        └──→ submitEnquiry (Server Action) — authoritative
```

Server-side validation always re-runs and never trusts the client. Progressive enhancement: the form posts to the Server Action and works without JavaScript, with client validation as an enhancement.

---

## Images

| Rule | Reason |
|---|---|
| Framework `Image` component everywhere | Automatic format negotiation, responsive sizing |
| Explicit `width`/`height` or `fill` with a sized container | Prevents CLS |
| `priority` **only** on the hero image | It is the LCP element; priority elsewhere harms LCP |
| `sizes` accurate to layout | Prevents oversized downloads on mobile |
| Cloudinary in `remotePatterns` | `images.domains` is deprecated |
| Meaningful `alt`, `""` only for decorative | NFR-014 |

> `qualities` now defaults to `[75]` in the 16.x line, and any custom quality value must be declared in config. Verify at implementation.

---

## Fonts

Self-hosted via the framework font loader — no third-party CDN request (privacy, and one less blocking origin). Subset to required glyphs, variable where available, `display: swap` with a metric-matched fallback so swapping causes no layout shift (NFR-005).

Devanagari subsets load **only if** Hindi is confirmed ([39_OPEN_DECISIONS](39_OPEN_DECISIONS.md)).

---

## Performance budgets

Enforced in CI where measurable.

| Metric | Budget |
|---|---|
| JS on a public page (initial) | ≤ 100 KB gzipped |
| JS on the homepage | ≤ 130 KB gzipped |
| CSS | ≤ 30 KB gzipped |
| Hero image | ≤ 200 KB |
| Fonts total | ≤ 120 KB |
| LCP (field, p75) | ≤ 2.5s |
| INP (field, p75) | ≤ 200ms |
| CLS (field, p75) | ≤ 0.1 |

Budgets are directional and re-baselined once real field data exists. **Field data is the measure; lab scores are a proxy** ([27_PERFORMANCE](27_PERFORMANCE.md)).

---

## Accessibility in the frontend

Structural decisions, not a checklist bolted on later.

1. Semantic HTML first — `<nav>`, `<main>`, `<article>`, `<button>`, real `<table>`
2. One `<h1>` per page; no skipped heading levels
3. Skip link as the first focusable element
4. Radix primitives supply focus trapping and ARIA wiring for dialogs, menus, tabs, accordions
5. All interactive elements reachable and operable by keyboard
6. Focus visible always; never `outline: none` without a replacement
7. Content revealed by scroll animation is **visible by default** and animated as enhancement — never `opacity: 0` awaiting a script
8. `prefers-reduced-motion` respected globally
9. Form errors announced via `aria-live` and linked with `aria-describedby`

---

## Error boundaries

| Level | File | Behaviour |
|---|---|---|
| Route segment | `error.tsx` | Contained failure; rest of the page survives |
| Global | `global-error.tsx` | Full-page fallback with the school's phone number |
| Not found | `not-found.tsx` | Helpful navigation, not a dead end |

Error boundaries never expose stack traces or internals to users (NFR-053). Errors are reported to monitoring with enough context to diagnose.

---

## Conventions

- Components: `PascalCase.tsx` · utilities: `camelCase.ts` · routes: lowercase folders
- Named exports throughout, except Next.js-required default page exports
- Props interfaces named `{Component}Props`
- No barrel `index.ts` re-export files — they defeat tree-shaking and obscure imports
- No hard-coded colours, spacing, or type sizes (NFR-073)
- Absolute imports via `@/`
