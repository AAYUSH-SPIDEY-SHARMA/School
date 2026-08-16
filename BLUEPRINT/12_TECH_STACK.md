# 12 — Technology Stack

| Field | Value |
|---|---|
| **Status** | ✅ **APPROVED** — owner architecture approval 2026-08-16 |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect |
| **Dependencies** | [03_REQUIREMENTS](03_REQUIREMENTS.md) · [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) |
| **Related Documents** | [49_DECISION_REGISTER](49_DECISION_REGISTER.md) · [13_SYSTEM_ARCHITECTURE](13_SYSTEM_ARCHITECTURE.md) · [30_DEPLOYMENT](30_DEPLOYMENT.md) · ADR-0001…0010 |

---

## ✅ Approval status

**Every technology on this page is owner-approved as of 2026-08-16.** There are no remaining architectural recommendations.

The approved stack is **Vercel + Neon + PostgreSQL**, with Auth.js, Cloudinary, and a custom admin CMS.

> ⚠️ **Approval is not implementation.** Nothing here is built. The register records **0 implementation facts** — that status is reached only when code exists and has been verified against these decisions.

Two vendor choices remain open and do not block Phases 1–3: **email provider** (OD-014) and **error monitoring** (OD-016).

Full classification in [49_DECISION_REGISTER](49_DECISION_REGISTER.md).

---

## Version policy — read before adding any version number

> **The blueprint locks technology choices and architectural requirements. It does not pin minor or patch versions.**

Major lines may be named **only where they carry architectural meaning** — "Next.js 16.x" implies the App Router, the `proxy.ts` convention, and the Cache Components model, which are architectural facts. "Next.js 16.3.2" implies nothing architectural and decays immediately.

Rules:
1. Never write a minor or patch version as a requirement.
2. Version-specific research findings live in [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) **with their observation date**, as dated evidence.
3. [37_IMPLEMENTATION_ROADMAP](37_IMPLEMENTATION_ROADMAP.md) step 1 is: **re-verify current stable versions and official migration notes before installing anything.**

This policy exists because an earlier draft of this blueprint recommended "Prisma 6.16+ with the `queryCompiler` preview flag" — a generation that had already been superseded, with instructions to enable flags that no longer exist. See [CHANGE-0006](../HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md). The error was not naming the wrong number; it was naming a number at all.

---

## The stack

| Layer | Proposal | ADR |
|---|---|---|
| Framework | Next.js 16.x, App Router | [ADR-0001](../HISTORY/DECISIONS/ADR-0001-FRAMEWORK.md) |
| Language | TypeScript, `strict` | — |
| UI runtime | React (version bundled with the framework) | — |
| Styling | Tailwind CSS 4.x | [ADR-0009](../HISTORY/DECISIONS/ADR-0009-STYLING-UI.md) |
| Components | shadcn/ui on Radix primitives | [ADR-0009](../HISTORY/DECISIONS/ADR-0009-STYLING-UI.md) |
| Animation | Motion | — |
| Icons | Lucide | — |
| Data access | Server Components + Server Actions | [ADR-0010](../HISTORY/DECISIONS/ADR-0010-RENDERING-CACHING.md) |
| Database | PostgreSQL | [ADR-0002](../HISTORY/DECISIONS/ADR-0002-DATABASE.md) |
| ORM | Prisma, latest stable | [ADR-0003](../HISTORY/DECISIONS/ADR-0003-ORM.md) |
| Auth | Auth.js 5.x, Credentials | [ADR-0004](../HISTORY/DECISIONS/ADR-0004-AUTH.md) |
| Password hashing | argon2id | — |
| Validation | Zod | — |
| Forms | React Hook Form | — |
| Media | Cloudinary | [ADR-0005](../HISTORY/DECISIONS/ADR-0005-MEDIA-STORAGE.md) |
| Email | Resend or equivalent transactional provider | — |
| CMS | Custom admin, built in-app | [ADR-0006](../HISTORY/DECISIONS/ADR-0006-CMS.md) |
| Hosting ✅ | Vercel | [ADR-0008](../HISTORY/DECISIONS/ADR-0008-HOSTING.md) |
| Database hosting ✅ | **Neon** | [ADR-0008](../HISTORY/DECISIONS/ADR-0008-HOSTING.md) |
| Analytics | Vercel Analytics or Plausible | — |
| Error monitoring | Sentry or equivalent | — |
| Testing | Vitest · Testing Library · Playwright · axe-core | — |

---

## Rationale by layer

### Framework — Next.js 16.x, App Router
SEO is a primary requirement (F-7: parents arrive via search), which makes server rendering non-negotiable. Next.js additionally provides the image optimisation pipeline, file-system routing, metadata API, and lets the public site and admin CMS ship as **one deployable** rather than two systems to secure and operate.

**Architecturally significant facts about the 16.x line**, observed 2026-08-16 and to be re-verified at implementation:
- `middleware.ts` is superseded by **`proxy.ts`**, running on the Node runtime
- `params`, `searchParams`, `cookies()`, `headers()` are **async**
- Cache Components: `cacheComponents: true` + `use cache`; opt-in caching, dynamic by default
- `revalidateTag(tag, profile)` requires a cache-life profile; `updateTag()` provides read-your-writes inside Server Actions; `refresh()` refreshes uncached data
- Turbopack is the default bundler
- `next/image` defaults changed — `qualities: [75]`, `minimumCacheTTL` 4h, `images.domains` deprecated in favour of `remotePatterns`
- Node 20.9+, TypeScript 5.1+

*Rejected:* Astro (weak fit for an authenticated admin area), Remix/React Router, plain React SPA (fails SEO), WordPress ([ADR-0006](../HISTORY/DECISIONS/ADR-0006-CMS.md)).

### Language — TypeScript, strict
Eighteen entities, three roles, and a shared client/server validation schema. Type safety is load-bearing here, not decoration. Plain JavaScript is not a serious option at this scale.

### Styling — Tailwind CSS 4.x
Version 4 is CSS-first: a `@theme` block replaces `tailwind.config.js`, and colours use OKLCH. This maps almost exactly onto the token architecture in [10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md), making re-theming from the school's real brand a single-file change — which matters, because the palette is currently provisional.

*Rejected:* CSS Modules (no token system, more boilerplate), styled-components (runtime cost, poor server-component fit), Bootstrap/MUI (opinionated aesthetics fighting a custom brand).

### Components — shadcn/ui
Source is **copied into the repository**, not installed as a dependency. Built on Radix, which handles the accessibility behaviours this project treats as `MUST`: focus trapping, keyboard interaction, ARIA wiring for dialogs, menus, tabs, accordions (NFR-018).

Owning the source matters here for two reasons: components can be restyled onto our tokens rather than fought with overrides, and there is no upstream vendor whose breaking change becomes our problem.

### Database — PostgreSQL
Content is genuinely relational: faculty belong to departments, images belong to albums, enquiries belong to assignees, audit entries reference users. Strong constraints, real foreign keys, and transactional integrity are the right defaults for data a school depends on.

> ⚠️ **Classification note.** The owner chose Neon/Supabase hosting, which strongly implies Postgres — but did not approve the engine directly. It therefore remains an `ARCHITECTURAL_RECOMMENDATION`, flagged here for easy confirmation rather than silently promoted.

*Rejected:* MongoDB (relational data forced into documents; weaker integrity guarantees), MySQL (viable, but weaker JSON and constraint support and no advantage here), SQLite (unsuitable for serverless multi-instance writes).

### ORM — Prisma, latest stable
Best-in-class schema definition, migration tooling, and Studio — the last of which matters because non-engineers may eventually need to inspect data.

The historical objection was serverless weight: the Rust query engine produced large bundles and ~800ms cold starts. **Prisma 7 makes the Rust-free TypeScript client the default**, with reported ~3× faster queries, ~90% smaller bundles, and cold starts under 100ms. That objection no longer holds.

*Rejected:* Drizzle (excellent and genuinely close; Prisma's migration tooling and Studio win for a project that may be handed to a less experienced maintainer — see [ADR-0003](../HISTORY/DECISIONS/ADR-0003-ORM.md)), raw SQL (no type safety, manual migrations), TypeORM (weaker DX).

### Auth — Auth.js 5.x
**The requirement is locked; the library is not.**

Requirement: admin-only authentication · secure session management · role-based authorisation · **no public user accounts**.

Auth.js is proposed as a mature fit. One known integration hazard, recorded so it is not rediscovered painfully: in the Next.js 16 line, importing the full auth configuration into `proxy.ts` pulls the database adapter and its Node-only APIs into the request-interception boundary. The configuration must be split so `proxy.ts` imports only a lightweight, adapter-free config.

Credentials-based login means **we own password hashing** — argon2id, never a fast hash.

*Rejected:* Clerk/Auth0 (per-user pricing and an external dependency for what is a handful of staff accounts), hand-rolled auth (session security is not a place to be original).

### Media — Cloudinary
Automatic format negotiation and quality optimisation, on-the-fly transformation, CDN delivery, and a generous free tier. Critically for this project, it can **strip EXIF metadata** — mandatory because photographs of children can carry GPS coordinates identifying the campus or a home address (NFR-052, [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md)).

*Rejected:* Cloudflare R2 / S3 (raw storage; transformation and optimisation would have to be built), Vercel Blob (viable; weaker transformation), local filesystem (impossible on serverless).

### Data access — Server Components and Server Actions
The public site is read-mostly and has exactly one known client: itself. A REST or GraphQL layer would add a network hop, a serialisation boundary, and a second surface to secure — solving no problem this project has. See [18_API_SPECIFICATION](18_API_SPECIFICATION.md) for the narrow cases where a route handler *is* justified.

### Email — transactional provider
Enquiry notifications only; low volume. Requirement: reliable delivery, a verified sending domain (SPF/DKIM), and delivery-failure visibility. **A failed notification must be logged and alerted** — an enquiry the school never sees is a lost admission (NFR-063).

---

## Deliberately excluded

Each rejection is a deliberate act of restraint, not an oversight.

| Excluded | Why |
|---|---|
| Redis / external cache | Framework caching and CDN suffice at this scale. Adds a service to run, pay for, and monitor |
| GraphQL | One known client; server components already remove over-fetching |
| Separate backend service | Doubles deployment and auth surface for no gain |
| Microservices | One team, one deployable, modest traffic |
| Kubernetes / Docker orchestration | Serverless hosting is chosen; this solves a problem we do not have |
| Message queue | No async workload justifies one |
| Headless CMS | Cost, plus a second system for staff to learn; content types are known and stable |
| State management library | Server components hold most state; local state suffices for the rest |
| Monorepo tooling | One application |
| Storybook | Valuable at larger scale; disproportionate here. Revisit if the component library grows |

> The discipline here is deliberate. Every service added is one the school must understand, fund, and keep running — possibly after whoever built it has moved on.

---

## Constraints this stack must respect

| Constraint | Implication |
|---|---|
| Serverless runtime | No local filesystem writes; connection pooling required; cold starts matter |
| Mid-range Android over 4G | Aggressive JS minimisation; server rendering by default |
| Non-technical editors | Admin UX simplicity outranks admin feature richness |
| Possible handover | Boring, well-documented technology beats clever technology |
| Modest budget | Free and low tiers must cover launch |
| Child imagery | Media pipeline must strip metadata |

---

## Approval checklist — ✅ complete

Recorded in [49_DECISION_REGISTER](49_DECISION_REGISTER.md), approved 2026-08-16.

- [x] Next.js 16.x, App Router — D-B1
- [x] TypeScript strict — D-B2
- [x] Tailwind 4.x + shadcn/ui — D-B5
- [x] **PostgreSQL** — D-B3 *(now explicitly approved, not merely implied)*
- [x] Prisma as ORM, latest stable — D-B4
- [x] Auth.js for admin auth — D-B6
- [x] Cloudinary for media — D-B7
- [x] **Neon** as database provider — D-A3a
- [x] Privacy-focused cookieless analytics — D-B21
- [ ] Transactional email provider — **still open** (OD-014), blocks Phase 6
- [ ] Error monitoring vendor — **still open** (OD-016), blocks Phase 11

## Version verification — mandatory before installing anything

Approved with the standing condition that **no minor or patch version is pinned**. At implementation, verify and then record the exact installed versions:

1. Current stable Next.js 16.x release and its official APIs
2. Current stable Prisma release — ⚠️ **not** Prisma 6.16+, **not** the `queryCompiler` preview flag, **not** any superseded configuration
3. Next.js ↔ Prisma compatibility
4. PostgreSQL / Neon adapter requirements
5. Migration tooling and Prisma Studio
6. Tailwind 4.x and shadcn/ui compatibility
7. Auth.js integration guidance for the current Next.js version
