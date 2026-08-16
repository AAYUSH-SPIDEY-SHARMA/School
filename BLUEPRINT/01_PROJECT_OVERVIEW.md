# 01 — Project Overview

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery) |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect / Product |
| **Dependencies** | [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) · [49_DECISION_REGISTER](49_DECISION_REGISTER.md) |
| **Related Documents** | [02_PRODUCT_VISION](02_PRODUCT_VISION.md) · [03_REQUIREMENTS](03_REQUIREMENTS.md) · [12_TECH_STACK](12_TECH_STACK.md) · [37_IMPLEMENTATION_ROADMAP](37_IMPLEMENTATION_ROADMAP.md) · [43_CURRENT_STATUS](43_CURRENT_STATUS.md) |

> **Read this first.** This document is the executive summary of the entire blueprint. Everything asserted here is expanded elsewhere and cross-referenced.

---

## What are we building?

A production-grade public website and lightweight content management system for **[SCHOOL_NAME]**, a CBSE-affiliated school serving **Nursery through Class 10**.

Three layers:

| Layer | Serves | Purpose |
|---|---|---|
| **Public website** | Prospective parents, current parents, visitors | Inform, build trust, convert enquiries |
| **Enquiry system** | Prospective parents → admissions staff | Capture and track admission interest |
| **Admin CMS** | School staff | Update content without touching code |

The school is real. Its identity has not yet been supplied, so every school-specific fact in this blueprint is a `[PLACEHOLDER]` token. **Nothing about the school has been invented.** See [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) for the full register of blocking inputs.

---

## Who is it for?

Ranked by commercial importance to the school:

1. **Prospective parents** — researching schools for a child aged roughly 3–14. The primary audience. Every design trade-off resolves in their favour.
2. **Current parents** — need notices, circulars, calendars, downloads. High-frequency, low-glamour, easily neglected.
3. **School staff (admin users)** — must be able to publish a notice without an engineer.
4. **Prospective staff, alumni, general public** — lower priority; served but not optimised for.

Detailed in [04_USER_PERSONAS](04_USER_PERSONAS.md).

---

## What problem does it solve?

Two distinct problems, evidenced by direct inspection of comparable Indian school websites (see [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) §4):

**Problem 1 — Prospective parents cannot easily act.**
All four Indian K-12 reference sites inspected under-surface admissions on the homepage. One does not mention admissions on the homepage at all. Another's primary call-to-action is "Contact Us" rather than anything admissions-specific. Meanwhile all four international references surface admissions prominently with a concrete CTA. This is a sector-specific gap, not a market limitation — an Indian premium university in the same sample surfaces admissions with a clear application-portal CTA.

**Problem 2 — Content decays.**
One reference displayed a recruitment notice dated **August 2020** on its live homepage in August 2026. Another's footer copyright read 2018. School websites are built once and then rot, because nobody owns them and updating them requires a developer.

This project solves the first with information architecture and conversion design, and the second with a CMS that school staff will actually use plus explicit content-governance rules.

---

## What makes it different?

Five commitments, each traceable to a research finding:

1. **Admissions is surfaced, not buried.** Homepage placement, persistent navigation CTA, and a short enquiry form. *(Finding F-1)*
2. **Current parents are a designed-for audience.** Notices and Downloads are first-class modules, kept distinct from News — they serve different people with different needs. *(F-2)*
3. **Safety and transport get explicit, findable pages.** Both rank high in the literature on Indian parental school choice; none of the inspected references surfaced safety clearly. *(F-8)*
4. **Fees are findable.** Cost is a stated primary selection factor. Burying it causes abandonment and erodes trust. *(F-8)*
5. **Content freshness is a design concern.** Staff can see what has gone stale. *(F-3, [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md))*

---

## What pages are required?

| Category | Count |
|---|---|
| **Public content pages** | **37** |
| **Dynamic content templates** | **4** (`/news/[slug]`, `/events/[slug]`, `/gallery/[slug]`, `/academics/faculty/[slug]`) |
| Admin routes | 34 |
| System routes (404, error, robots, sitemap, OG image, manifest) | 6 |
| Total route patterns *(internal figure)* | 81 |

> When describing the project to the school, use **37 public content pages + 4 dynamic templates** — not "81 pages", which counts implementation routes no parent sees (CF-6).

Definitive table in [07_SITE_MAP](07_SITE_MAP.md); per-page specifications in [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md).

---

## What features are required?

**MVP (`MUST HAVE`)** — public site across all 37 static routes · News, Events, Gallery, Faculty, Notices, Downloads, Achievements as dynamic CMS-managed content · admission enquiry form with spam protection · enquiry management with status workflow · admin CMS with three roles · media upload · SEO foundation (metadata, sitemap, robots, `School` structured data) · WCAG 2.2 AA target · audit logging.

**Deferred (`FUTURE`)** — online application with document upload · parent accounts/portal · fee payment · multilingual content · global site search · virtual campus tour · newsletter · alumni portal · AI assistant.

Full classification in [03_REQUIREMENTS](03_REQUIREMENTS.md).

---

## What technology are we using, and why?

> ⚠️ **These are `ARCHITECTURAL_RECOMMENDATION`s, not approved decisions.** Only the four items marked ✅ were chosen by the project owner. See [49_DECISION_REGISTER](49_DECISION_REGISTER.md).

| Layer | Proposal | Core reason |
|---|---|---|
| Framework | Next.js 16.x, App Router | Server rendering for SEO; image pipeline; one deployable for site + CMS |
| Language | TypeScript, `strict` | Content model has many entities; type safety is load-bearing |
| Styling | Tailwind CSS 4.x | CSS-first theming maps directly onto a design-token system |
| Components | shadcn/ui (Radix) | Source-owned, accessible primitives; no vendor lock-in |
| Data access | Server Components + Server Actions | Public site is read-mostly; a REST layer would be ceremony |
| Database | PostgreSQL | Relational content with real relationships |
| ORM | Prisma (latest stable) | Best-in-class migrations; Rust-free client suits serverless |
| Auth | Auth.js 5.x | Admin-only credentials; requirement locked, library is not |
| Media | Cloudinary | Automatic format/quality; staff-friendly; transformation pipeline |
| Validation | Zod | One schema shared by client form and server action |
| Hosting ✅ | Vercel + Neon/Supabase | Chosen by owner |
| Board/grades ✅ | CBSE, Nursery–Class 10 | Chosen by owner |
| Admissions ✅ | Enquiry-only | Chosen by owner |
| School identity ✅ | Real school, placeholders until supplied | Chosen by owner |

**No version is pinned below the major line.** See the version policy in [12_TECH_STACK](12_TECH_STACK.md) and [CHANGE-0006](../HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md).

---

## What is the architecture?

A single Next.js application, server-rendered, backed by one Postgres database and one media CDN.

```
Parent / Visitor              School Staff
      │                            │
      ▼                            ▼
┌─────────────────────────────────────────┐
│         Next.js (Vercel)                │
│  Public routes  │  /admin (protected)   │
│  Server Components + Server Actions     │
└──────────┬───────────────┬──────────────┘
           │               │
           ▼               ▼
    PostgreSQL        Cloudinary
     (Neon)          (media CDN)
```

Deliberately **not** built: microservices, Kubernetes, Redis, GraphQL, a separate backend service, an event bus, or a headless CMS. Each rejection is argued in [13_SYSTEM_ARCHITECTURE](13_SYSTEM_ARCHITECTURE.md) and the relevant ADR. A single-campus school website with modest traffic and a handful of editors does not justify distributed-systems complexity, and adopting it would make the project harder for the school to maintain or hand over.

---

## What is the MVP?

A parent can find the school, understand what it offers, see the fees, trust it, and submit an enquiry. A staff member can publish a notice, add a news item, upload gallery photos, and work through enquiries. Everything else is scope.

---

## What is future scope?

Ordered by likely value: online application with document upload → parent portal → site-wide search → multilingual (English/Hindi) → fee payment integration → alumni network → newsletter. All classified in [03_REQUIREMENTS](03_REQUIREMENTS.md); none are designed against now, but the data model avoids foreclosing them.

---

## What are the biggest risks?

| Risk | Impact | Mitigation |
|---|---|---|
| **School identity never supplied** | Blocks design system, content, structured data, launch | Escalated as the top blocking input; placeholder tokens keep every other workstream moving |
| **No real photography** | A premium design depends on it; stock imagery of a school is transparently fake and erodes trust | Flagged early; treated as a launch blocker, not a nice-to-have |
| **CMS goes unused; content rots** | Recreates the exact failure observed in the references | Content governance, freshness indicators, deliberately simple editing UX |
| **Fabricated statistics reach production** | A false "95% board results" on a real school's site is a material misrepresentation | Placeholder tokens are visually obvious and audited before launch |
| **Child imagery published without consent** | Safeguarding and legal exposure | [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md) |
| **Scope creep into a full application system** | Adds parent auth, uploads, PII, and major security surface | Owner has scoped v1 to enquiry-only; changes require an ADR |

Full register: [40_RISKS_AND_MITIGATIONS](40_RISKS_AND_MITIGATIONS.md).

---

## What remains unknown?

Everything school-specific: name, logo, colours, address, phone, email, CBSE affiliation number, founding year, student and staff counts, board results, fee amounts, faculty, leadership, admission dates, photographs, and whether Hindi content is expected.

Also unknown: the school's actual local competitors — **the largest gap in the research**, since a parent choosing a day school compares against schools within a few kilometres, not against Eton.

Full list: [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

---

## What should we implement first?

1. **Obtain school identity assets.** Highest leverage; unblocks the design system and the content layer.
2. **Approve or amend the stack** ([49_DECISION_REGISTER](49_DECISION_REGISTER.md)) — recommendations cannot become code while still provisional.
3. Project setup, design tokens, layout shell (navbar, footer, typography).
4. Static public pages against real content.
5. Database, then dynamic modules (News, Events, Gallery, Faculty, Notices, Downloads).
6. Enquiry form end-to-end — the conversion path is the point of the site.
7. Admin CMS.
8. SEO, accessibility, performance hardening.
9. Testing, then deployment.

Sequenced with dependencies in [37_IMPLEMENTATION_ROADMAP](37_IMPLEMENTATION_ROADMAP.md).

---

## Current state

**Nothing is implemented.** The repository contains only `BLUEPRINT/` and `HISTORY/`. No application code, no dependencies, no database, no git repository. See [43_CURRENT_STATUS](43_CURRENT_STATUS.md) and [CHANGE-0001](../HISTORY/2026/08/CHANGE-0001-INITIAL-DISCOVERY.md).
