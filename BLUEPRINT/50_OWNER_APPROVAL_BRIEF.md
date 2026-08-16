# 50 — Owner Approval Brief

| Field | Value |
|---|---|
| **Status** | ✅ **DECIDED 2026-08-16 — all 22 approved** |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Project Owner (decisions) / Principal Architect (recommendations) |
| **Purpose** | Convert 22 architectural recommendations into approved decisions or rejections |
| **Related** | [49_DECISION_REGISTER](49_DECISION_REGISTER.md) · [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) · [44_CHANGE_MANAGEMENT](44_CHANGE_MANAGEMENT.md) |

---

> ## ✅ OUTCOME — decided 2026-08-16
>
> **All 22 recommendations approved.** Neon selected as database provider. Facility model resolved as **Option A** (Settings sub-resource, `SUPER_ADMIN` only). Consistency findings CF-1 to CF-4, CF-6 and CF-7 corrected; CF-5 confirmed as a false positive.
>
> This document is retained as the **record of what was decided and why**. Current authority is [49_DECISION_REGISTER](49_DECISION_REGISTER.md); the approval round is recorded in [CHANGE-0009](../HISTORY/2026/08/CHANGE-0009-ARCHITECTURE-APPROVAL.md).
>
> Owner amendments attached to individual approvals are recorded in the register, not here.

---

## How to use this document *(historical — decision complete)*

Twenty-two recommendations awaited decision, plus one open sub-decision and one newly surfaced consistency decision.

For each, mark one of:

```
APPROVE   — becomes USER_APPROVED_DECISION; ADR moves to Accepted
REJECT    — I propose an alternative; ADR marked Rejected
AMEND     — approve with your stated modification
DEFER     — stays a recommendation; blocks any dependent work
```

**Nothing here is approved. Nothing is implemented.** Rejecting any item today costs nothing — there is no code depending on it.

**Confidence** below means my confidence that the recommendation is right for *this* project, not general enthusiasm for the technology.

---

# GROUP A — Framework and Language

## D-B1 · Next.js 16.x, App Router

| | |
|---|---|
| **Recommendation** | Next.js, App Router, 16.x major line. No minor/patch pinned. |
| **Why proposed** | Search is the acquisition channel, so server-rendered indexable content is non-negotiable (NFR-030). The admin is a real authenticated application, so one framework serves both and ships as one deployable. Photography is central and the built-in image pipeline does genuine work. |
| **Alternatives** | **Astro** — likely a faster public site; lost on the admin area, where its islands model fights an authenticated CRUD application. **Remix/React Router** — capable, no decisive advantage, weaker image handling. **React SPA** — fails SEO outright. **WordPress** — plugin security surface, fights a bespoke design. |
| **Advantages** | Server rendering by default · one codebase, one auth surface · image optimisation, routing, metadata built in · Server Actions remove the need for an API layer. |
| **Disadvantages / risks** | Moves quickly — the 16.x line alone renamed `middleware.ts`→`proxy.ts`, made `params`/`cookies()` async, replaced the PPR flag, changed `next/image` defaults. Upgrades demand attention. Server Components are a real learning curve for a new maintainer. Idioms favour one host. |
| **Dependencies** | Underpins D-B2, D-B5, D-B9, D-B10 and the whole of [14_FRONTEND_ARCHITECTURE](14_FRONTEND_ARCHITECTURE.md). |
| **If rejected** | Largest single change in the set. Astro would mean rebuilding the admin approach; a SPA would require a separate backend and forfeit the SEO strategy. Roughly 15 of 51 blueprint documents would need revision. |
| **Confidence** | **High.** The SEO + admin combination genuinely narrows the field. |
| **Downstream impact** | **Very high.** Approve or reject this first — most other items assume it. |

## D-B2 · TypeScript, strict mode

| | |
|---|---|
| **Recommendation** | TypeScript with `strict: true`. |
| **Why proposed** | 18 entities, 3 roles, and one validation schema shared between client and server. Type safety is load-bearing, not decoration. |
| **Alternatives** | Plain JavaScript; TypeScript without `strict`. |
| **Advantages** | Catches a large class of defects free, before any test runs · makes the shared Zod schema genuinely safe · self-documenting for a future maintainer. |
| **Disadvantages / risks** | Slightly slower initial authoring; `strict` occasionally requires explicit handling a looser config would let slide. |
| **Dependencies** | D-B1, D-B10. |
| **If rejected** | Not recommended. Would weaken the shared-validation approach and raise defect risk on a handover-prone project. |
| **Confidence** | **Very high.** |
| **Downstream impact** | Low — nothing else structurally depends on it. |

## D-B10 · Zod + React Hook Form

| | |
|---|---|
| **Recommendation** | Zod for validation, React Hook Form for form state, one schema shared client and server. |
| **Why proposed** | The enquiry form is the site's conversion endpoint. A single schema means client feedback and server enforcement cannot drift apart — and the server copy stays authoritative. |
| **Alternatives** | Yup/Valibot (equivalent, less ecosystem fit) · hand-rolled validation (drift risk) · server-only validation (poor UX). |
| **Advantages** | One source of truth · type inference into TypeScript · server never trusts the client. |
| **Disadvantages / risks** | Two more dependencies; Zod schemas can get verbose. |
| **Dependencies** | D-B2. Serves FR-039. |
| **If rejected** | Would need an equivalent shared-schema mechanism. The *requirement* (one schema, server authoritative) should survive any library change. |
| **Confidence** | **High.** |
| **Downstream impact** | Low. |

---

# GROUP B — Database and ORM

## D-B3 · PostgreSQL ⚠️ **SPECIAL ATTENTION**

> **This is the item most at risk of being treated as already decided. It is not.**
>
> You approved **Vercel + Neon/Supabase** hosting (D-A3). Both are PostgreSQL providers, so Postgres is *strongly implied* — but you were never actually asked about the database engine, and this register does not promote implications into approvals.

| | |
|---|---|
| **Recommendation** | PostgreSQL as the database engine. |
| **Why proposed** | The content model is genuinely relational — faculty→departments, images→albums, enquiries→assignees, audit→actors, slug history→entities. The deciding factor is **integrity, not scale**: at this volume any engine performs fine; what differs is whether the database enforces correctness or delegates it to application code. |
| **Alternatives** | **MySQL** — capable, but weaker partial-index and enum support and no advantage here; the choice would be arbitrary. **MongoDB** — relational data forced into documents means duplicating data or hand-rolling joins; "faculty belongs to a real department" becomes application logic instead of a constraint. **SQLite** — unsuitable for serverless concurrent writes. **Firestore/DynamoDB** — query limits, poor relational fit, lock-in. |
| **Advantages** | Foreign keys, unique and check constraints enforced by the database · native enums constrain `ClassLevel` to Nursery–Class 10 **at the database level**, reinforcing a hard project invariant · partial indexes keep hot indexes small · `tsvector` means future site search needs no new service. |
| **Disadvantages / risks** | **Two connection strings required** — pooled for runtime, direct for migrations. Using the wrong one fails confusingly. Schema changes need migrations. |
| **Dependencies** | Implied by D-A3. Underpins D-B4, D-B12, D-B18, D-B19. |
| **If rejected** | You would need to reject or amend D-A3 as well, since Neon and Supabase are both Postgres. A document database would require re-modelling all 18 entities and rewriting [16](16_DATABASE_ARCHITECTURE.md), [17](17_DATABASE_SCHEMA.md), [21](21_CONTENT_MODEL.md). |
| **Confidence** | **Very high** — but I am asking rather than assuming, because you never actually said it. |
| **Downstream impact** | **Very high.** |

## D-B4 · Prisma, latest stable version

| | |
|---|---|
| **Recommendation** | Prisma as ORM. **No version pinned** — requirement is Rust-free client, driver-adapter connectivity, migration tooling. Verify current stable at implementation. |
| **Why proposed** | Two capabilities matter disproportionately for a project that may be handed over: **migration tooling** (schema changes against a live database holding real enquiry records are the highest-consequence routine operation) and **Studio** (a non-expert can inspect data without writing SQL). |
| **Alternatives** | **Drizzle** — genuinely close; smaller, faster, excellent serverless characteristics. Loses on migration-tooling maturity and no Studio equivalent; its SQL-close API is a virtue for an expert and a liability for a non-expert maintainer. **Raw SQL** — no type safety, hand-managed migrations. **TypeORM** — weaker DX, no advantage. |
| **Advantages** | Declarative schema doubles as data-model documentation · best-in-class migrations · Studio · strong end-to-end types. |
| **Disadvantages / risks** | Code-generation step · less SQL control than Drizzle · historically a moving target across majors. |
| **Dependencies** | D-B3. |
| **If rejected** | Drizzle is a clean swap today — it changes [15](15_BACKEND_ARCHITECTURE.md), [16](16_DATABASE_ARCHITECTURE.md), [17](17_DATABASE_SCHEMA.md) and ADR-0003, and nothing else. Cost is zero now; substantial after Phase 4. |
| **Confidence** | **Medium-high.** ⚠️ **This is the least clear-cut decision in the stack** — both options genuinely work. If you prefer Drizzle, that is a defensible position, not a mistake. |
| **Downstream impact** | Medium. |

> **Historical note:** an earlier draft recommended "Prisma 6.16+ with the `queryCompiler` preview flag" — a superseded generation with instructions to enable flags that no longer exist. Corrected in [CHANGE-0006](../HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md), which also produced the project-wide no-version-pinning policy.

## OD-008 · Neon **or** Supabase ⚠️ **SPECIAL ATTENTION — open sub-decision**

Your D-A3 approval reads "Vercel + Neon/Supabase". The provider itself is still unchosen, and several architecture documents currently **assume Neon** (see Consistency Finding CF-2 below).

| | **Neon** *(recommended)* | **Supabase** |
|---|---|---|
| Postgres | ✅ | ✅ |
| Connection pooling | ✅ | ✅ |
| **Branch per pull request** | ✅ — lets migrations be tested before merge | ✗ (not equivalent) |
| Bundled storage | — | ✅ (unused — media goes to Cloudinary, D-B7) |
| Bundled auth | — | ✅ (unused — auth is admin-only, D-B6) |
| Surface area | Narrower | Broader |

**Recommendation: Neon**, because migrations against a database holding live enquiry records are the highest-consequence routine operation, and per-PR branching lets them be tested before merge.

**Downstream consequence if you choose Supabase:** the preview-environment strategy in [13_SYSTEM_ARCHITECTURE](13_SYSTEM_ARCHITECTURE.md) and [30_DEPLOYMENT](30_DEPLOYMENT.md) must be revalidated, and the Neon-specific wording in CF-2 must be rewritten rather than merely genericised. It also raises a fair question of whether bundling auth and storage there would be simpler — which would reopen D-B6 and D-B7.

---

# GROUP C — Authentication and Authorization

## D-B6 · Auth.js 5.x ⚠️ **SPECIAL ATTENTION**

> **The requirement is locked. The library is not.** Keeping these separate matters: the requirement constrains security posture; the library is an implementation detail that can change with no architectural consequence.

**LOCKED REQUIREMENT** (not up for approval — it is a security floor):
- Admin-only authentication; **no public user accounts**
- Secure, **revocable** session management
- Role-based authorisation enforced **server-side on every action**
- Modern **memory-hard** password hashing (argon2id)

| | |
|---|---|
| **Recommendation** | Auth.js 5.x with Credentials provider and database-backed sessions, to satisfy the above. |
| **Why proposed** | Mature, framework-native, no per-user cost for what may be five staff accounts, database sessions revocable the moment someone leaves, role data available where authorisation happens. |
| **Alternatives** | **Clerk/Auth0** — excellent, but per-user pricing and an external dependency in the login path for five accounts; user data with a third party. **Supabase Auth** — free if Supabase wins OD-008, but couples auth to an unresolved database decision. **Hand-rolled** — session management and timing-safe comparison are easy to get subtly wrong, and the failure mode is a breach of parent data. **Google Workspace SSO** — `FUTURE`; if the school already runs Workspace this could eliminate password handling entirely and would likely be a net security improvement. |
| **Advantages** | No per-user cost · immediate session revocation · no public accounts means no registration, no email password-reset flow, no account-recovery attack surface. |
| **Disadvantages / risks** | **We own password hashing** — must be argon2id, never a fast hash. **Config must be split**: `auth.config.ts` (adapter-free) for `proxy.ts`, `auth.ts` (full) for actions — importing the full config into the proxy pulls Node-only APIs into the wrong boundary and fails confusingly. Admin-initiated password reset is a small ongoing `SUPER_ADMIN` burden. |
| **Dependencies** | D-B1, D-B3. Feeds D-B11. |
| **If rejected** | Low cost — swapping the library changes [15](15_BACKEND_ARCHITECTURE.md) and ADR-0004 only. **The locked requirement survives regardless.** |
| **Confidence** | **Medium-high** on the library; **very high** on the requirement. |
| **Downstream impact** | Low. |

> ⚠️ **Worth stating plainly:** the two things that actually determine security here are *not* the library. They are argon2id hashing, and server-side role checks in every Server Action — because Server Actions are directly invocable HTTP endpoints and the route guard does not protect them.

---

# GROUP D — Media and Storage

## D-B7 · Cloudinary ⚠️ **SPECIAL ATTENTION**

| | |
|---|---|
| **Recommendation** | Cloudinary for media storage, transformation, and delivery. |
| **Why proposed** | Two requirements decide it, and both are non-negotiable. **(1) EXIF/geolocation stripping is a safeguarding control** — a gallery photograph can otherwise publish the precise location of a classroom, or a residential address if a parent contributed an image taken at home. Combined with images of identifiable children that is a safeguarding failure. **(2) Automatic optimisation protects parents from editor behaviour** — a teacher uploading a 6 MB phone photo is the *expected* case, not misuse, and that original must never reach a parent's device. |
| **Alternatives** | **Cloudflare R2 / S3** — cheap raw storage, but we would have to build format conversion, responsive derivatives, quality optimisation **and metadata stripping** ourselves. The last is a safeguarding control I would rather not implement from scratch. **Vercel Blob** — weaker transformation; the 6 MB-upload problem remains unsolved. **Local filesystem** — impossible on serverless. **Blobs in Postgres** — bloats the database and slows the enquiry-data restore path. |
| **Advantages** | Metadata stripping as a service feature · one upload serves every size and format · CDN delivery · free tier fits a school budget · editors need no technical knowledge. |
| **Disadvantages / risks** | Vendor dependency in the media path · costs scale with gallery growth · transformation URLs are vendor-specific. |
| **Dependencies** | Feeds [22_MEDIA_AND_STORAGE](22_MEDIA_AND_STORAGE.md) and **[48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md)**. |
| **If rejected** | Whatever replaces it **must still strip EXIF and geolocation reliably, with no opt-out**, and must optimise automatically. If the replacement cannot, that is a safeguarding regression, not a cost saving. |
| **Confidence** | **High**, specifically because of the safeguarding requirement. |
| **Downstream impact** | Medium. |

> ⚠️ **Cloudinary is currently missing from the vendor-selection gate** in [41_PENDING_WORK](41_PENDING_WORK.md) §B-3, which lists only database, email, analytics, and error monitoring. See Consistency Finding CF-3.

---

# GROUP E — CMS and Content Management

## D-B8 · Custom admin CMS ⚠️ **SPECIAL ATTENTION**

> **This is the decision that determines whether the project succeeds a year after launch.**

| | |
|---|---|
| **Recommendation** | A purpose-built admin CMS inside the application — 14 modules — rather than a third-party CMS. |
| **Why proposed** | The observed failure in comparable school sites is not bad design; it is **abandonment**. One reference displayed a recruitment notice dated **August 2020** on its live homepage in August 2026; another's footer read 2018. That happens when updating requires a developer. The deciding criterion is: **will a teacher publish a notice next November, unaided?** Target: under three minutes, first attempt. |
| **Alternatives** | **Headless CMS (Sanity/Payload/Strapi/Contentful)** — no CRUD to build, mature editors. But: ongoing cost, **a second system for staff to learn and administer**, interfaces built for editorial teams rather than a school office, and enquiries would still need custom handling — so staff work across two systems. **WordPress** — plugin security surface, fights a bespoke design, would replace the whole application. **Git-based Markdown** — eliminated; a teacher cannot publish via pull request. **No CMS** — this *is* the failure mode. |
| **Advantages** | Can be **narrow**: three required fields for a notice, not twelve · school's own language ("Publish", not "Set status to PUBLISHED") · freshness warnings at the top of the dashboard · one system for content, media, enquiries, settings · no per-seat cost. |
| **Disadvantages / risks** | **14 modules to build and maintain** — real effort with no reusable product to show for it · no third-party feature roadmap · rich text deliberately constrained (no arbitrary HTML). |
| **Dependencies** | D-B1, D-B3, D-B12. Governs [20](20_ADMIN_CMS.md), [47](47_CONTENT_GOVERNANCE.md). |
| **If rejected** | A headless CMS would remove roughly a third of the build effort and change [20](20_ADMIN_CMS.md), [21](21_CONTENT_MODEL.md), [12](12_TECH_STACK.md) and ADR-0006. **The trade is explicit: less build effort now, in exchange for a second system your staff must learn.** |
| **Confidence** | **High** — but this is the recommendation where I am asking you to accept the *most* build effort, so it deserves your scrutiny. |
| **Downstream impact** | **High.** |

## D-B20 · Direct publish, no approval workflow

| | |
|---|---|
| **Recommendation** | `DRAFT → PREVIEW → PUBLISH` by the editor. No second-person approval chain in v1. |
| **Why proposed** | For a small trusted staff an approval chain adds friction to exactly the persona whose engagement keeps the site current, while existing controls already handle the realistic failures: mistake published → unpublish immediately; who did it → audit log; bad judgement → monthly management review. |
| **Alternatives** | Editor → Reviewer → Publish (adds delay and a bottleneck) · publish with no preview (rejected — removes the safety net that reduces editor fear). |
| **Advantages** | Lowest friction for the content-freshness goal · mistakes are recoverable and traceable. |
| **Disadvantages / risks** | An editor can publish something inappropriate immediately. Mitigated by soft delete, audit log, and named content ownership. |
| **Dependencies** | D-B8, D-B11. Tracked as OD-012. |
| **If rejected** | An approval workflow adds a review state to every content entity, a reviewer queue in the CMS, and notification handling — a meaningful addition to [20](20_ADMIN_CMS.md) and [17](17_DATABASE_SCHEMA.md). |
| **Confidence** | **Medium.** Revisit if more than ~6 people will hold `EDITOR`. |
| **Downstream impact** | Medium. |

> **Clarification, since this has caused confusion:** *preview before publish* (AR-018, kept) is **not** the same as *approval before publish* (rejected for v1). Editors preview their own work, then publish directly. No second person is involved.

---

# GROUP F — API and Backend Architecture

## D-B9 · Server Components + Server Actions; no general-purpose API ⚠️ **SPECIAL ATTENTION**

> **Precision matters here.** This does **not** mean "the application has no HTTP endpoints."

**What it means:**
```
Server Components  → lib/queries → database        (no HTTP hop)
Client Components  → Server Actions → lib/actions  (framework transport)
Plus exactly 5 justified HTTP route handlers.
```

**The five route handlers that DO exist** ([18_API_SPECIFICATION](18_API_SPECIFICATION.md)): auth library endpoints · `/api/health` (status only, leaks no version info) · `/api/revalidate` (secret-protected, operational recovery) · `/api/og/[type]/[slug]` (social share images) · `/api/media/sign` (signed direct-upload credentials).

**What is excluded:** a general-purpose REST or GraphQL API for content.

| | |
|---|---|
| **Why proposed** | An API layer is justified by having more than one consumer. This project has exactly one: itself. Building REST would add a network hop, a serialisation boundary, a versioning obligation, and a second surface to authenticate and rate-limit — purely to preserve an option nobody has asked for. |
| **Alternatives** | **REST** — conventional, reusable by a future client that does not exist. **GraphQL** — solves over-fetching, which server components already solve. **tRPC** — Server Actions already provide end-to-end types within one app. |
| **Advantages** | No API layer to build, secure, version, or document · content indexable without JS · minimal client JavaScript · precise tag-based cache invalidation. |
| **Disadvantages / risks** | **Framework-specific** — migrating away means rewriting the data layer. **Server Actions are easy to mistake for private functions.** No reusable API if a second consumer appears. |
| **Dependencies** | D-B1. Governs [15](15_BACKEND_ARCHITECTURE.md), [18](18_API_SPECIFICATION.md). |
| **If rejected** | Building a REST layer adds meaningful work and a second auth surface. If you foresee a mobile app or third-party integration, say so now — retrofitting is more expensive than designing for it. |
| **Confidence** | **High**, given one known consumer. |
| **Downstream impact** | **High.** |

> ⚠️ **Security consequence, stated plainly:** the framework compiles every Server Action into a callable HTTP endpoint. Anyone can invoke it directly with arbitrary input, without visiting the corresponding page. Every action therefore authenticates, authorises, and validates independently. `proxy.ts` and the admin UI are convenience, **not** the security boundary. Verified by testing every action against every role, including direct invocation.

---

# GROUP G — UI, Styling, Components

## D-B5 · Tailwind CSS 4.x + shadcn/ui (on Radix)

| | |
|---|---|
| **Recommendation** | Tailwind 4 with CSS-first `@theme` tokens, plus shadcn/ui components copied into the repository. |
| **Why proposed** | **Re-theming cost is the deciding criterion** — unusually, but correctly, because the design system is `PROVISIONAL` and the palette *will* change once the school's logo arrives. Tailwind 4's `@theme` maps exactly onto the two-layer token architecture, making the brand swap **an edit to one block in one file**. Separately, Radix supplies focus trapping and ARIA wiring for the lightbox and drawer — the two highest-risk accessibility components. |
| **Alternatives** | **CSS Modules** — no token system without building one; re-theming touches many files. **styled-components** — runtime cost, poor server-component fit. **MUI/Chakra/Ant** — opinionated aesthetics a bespoke school brand must fight; the fastest route to a site that looks like a template. **Radix alone** — viable; shadcn is essentially this plus a modifiable starting point. |
| **Advantages** | Single-file re-theme · OKLCH makes accessible palette construction predictable · owned source, no upstream breaking changes · no runtime styling cost. |
| **Disadvantages / risks** | Utility classes in markup are divisive · copied components update manually · requires discipline (no hard-coded colours in components). |
| **Dependencies** | D-B1. Governs [10](10_DESIGN_SYSTEM.md), [11](11_UI_UX_SYSTEM.md). |
| **If rejected** | Changes [10](10_DESIGN_SYSTEM.md), [11](11_UI_UX_SYSTEM.md), ADR-0009. Whatever replaces it must still keep re-theming cheap and must not regress lightbox/drawer accessibility. |
| **Confidence** | **High.** |
| **Downstream impact** | Medium. |

> ⚠️ **Known risk carried forward:** the provisional warm-gold accent may fail 4.5:1 contrast as a CTA background. If measurement confirms that, it becomes decorative-only and CTAs use the primary colour. **Accessibility wins over palette preference.**

---

# GROUP H — Roles and Permissions

## D-B11 · Three roles

| | |
|---|---|
| **Recommendation** | `SUPER_ADMIN` · `EDITOR` · `ADMISSIONS_MANAGER`. Enum on `User`; no Role/Permission join tables. |
| **Why proposed** | A single-campus school has a handful of staff touching the website. Six roles would mean one person holding three of them — no isolation gained, a permission matrix nobody can hold in their head. **The one split that is real:** content editing and enquiry access are genuinely different jobs with different sensitivity. Enquiries contain personal data about parents and minors; a teacher publishing a sports report has no reason to see them. That boundary is the only one that earns its complexity. |
| **Alternatives** | Six roles (Super Admin, Administrator, Content Editor, Admissions Manager, Faculty Manager, Media Manager) · two roles (admin/editor — loses the PII boundary) · dynamic permission tables. |
| **Advantages** | Auditable at a glance · simple enum · least privilege where it matters · `EDITOR` provably cannot reach enquiry PII. |
| **Disadvantages / risks** | **May not match how your school actually operates.** If the principal approves content, a coordinator writes it, admissions handles enquiries and an office manager owns fees, a fourth role may be needed. |
| **Dependencies** | D-B6. Governs [19](19_AUTHORIZATION_AND_ROLES.md), [47](47_CONTENT_GOVERNANCE.md). |
| **If rejected / amended** | Adding a role is cheap now (enum value + matrix row + tests). It is much less cheap after Phase 7. |
| **Confidence** | **Medium.** ⚠️ This should be validated against the school's real workflow before Phase 7, and I would treat your knowledge of the school as outranking my reasoning here. |
| **Downstream impact** | Medium. |

---

# GROUP I — Data Model

## D-B12 · 18 entities

| | |
|---|---|
| **Recommendation** | `User` · `Department` · `Faculty` · `News` · `Event` · `GalleryAlbum` · `GalleryImage` · `Achievement` · `Notice` · `Document` · `AdmissionEnquiry` · `EnquiryNote` · `Testimonial` · `Facility` · `MediaAsset` · `SiteSetting` · `AuditLog` · `SlugHistory` |
| **Why proposed** | Governing principle: **every entity must justify itself.** An entity that exists because similar systems have one is overhead — a table to migrate, a module to build, a concept to learn. |
| **Removed from your original outline** | `Role`/`Permission` (3 fixed roles → enum) · `Application`/`ApplicationDocument` (enquiry-only, D-A2) · `Page`/`SEO` (entity SEO on entities, global SEO in `SiteSetting`) · `NewsCategory`/`EventCategory` (**deferred as `OPTIONAL`, not rejected**) |
| **Added beyond your outline** | **`SlugHistory`** — supports no visible feature and would never be requested, but without it an editor tidying a headline silently breaks every link to that article already circulating in parent WhatsApp groups. **`EnquiryNote`** — separate entity rather than a JSON blob, so each note carries a real author and timestamp; this is what stops two staff calling the same parent. |
| **Disadvantages / risks** | `SlugHistory` and `AuditLog` are painful to retrofit — slug history added after launch cannot recover URLs already broken. |
| **Dependencies** | D-B3, D-B4. |
| **If rejected** | Adding entities later is additive and cheap. Removing `SlugHistory` or `AuditLog` is cheap now and expensive later. |
| **Confidence** | **High.** |
| **Downstream impact** | High. |

> ⚠️ **`Facility` (entity 14) has an unresolved administration model.** See Consistency Finding **CF-1** — this is a genuine decision for you, not a documentation typo.

## D-B18 · Soft delete on content; hard delete on enquiries

| | |
|---|---|
| **Recommendation** | Content entities soft-deleted (`deletedAt`); `AdmissionEnquiry` hard-deleted. `AuditLog` and `SlugHistory` append-only. |
| **Why proposed** | Staff delete things by accident, and recovery should not require a database restore. But enquiry deletion is a **privacy operation** — a retention expiry or a data-subject request — and must actually remove data. |
| **Alternatives** | Soft delete everywhere (fails privacy) · hard delete everywhere (one mis-click is unrecoverable). |
| **Disadvantages / risks** | **Every public query must filter `deletedAt: null`** — forgetting once leaks deleted content. Mitigated structurally: all reads go through `lib/queries`, and components never touch the ORM directly. |
| **Dependencies** | D-B3, D-B12. |
| **If rejected** | Would change the recovery story and the privacy posture; not recommended. |
| **Confidence** | **High.** |
| **Downstream impact** | Medium. |

## D-B19 · Slug history + 301 redirects

| | |
|---|---|
| **Recommendation** | Changing a published slug writes a `SlugHistory` record; `proxy.ts` issues a permanent 301 from the old URL. |
| **Why proposed** | School links spread through parent WhatsApp groups and are never updated. Without this, an editor tidying a headline silently breaks every existing link and forfeits accumulated search ranking. |
| **Alternatives** | Immutable slugs (editors will want to fix typos) · no redirect handling (silent breakage). |
| **Disadvantages / risks** | One extra table, one proxy lookup on 404 paths. |
| **Dependencies** | D-B12. Serves NFR-028. |
| **If rejected** | Not recommended. This is cheap now and impossible to retrofit for links already broken. |
| **Confidence** | **Very high.** |
| **Downstream impact** | Low. |

---

# GROUP J — Navigation and Information Architecture

## D-B13 · Six-item navigation + distinct Admissions CTA

| | |
|---|---|
| **Recommendation** | About · Academics · Campus Life · Gallery · News & Events · Contact, plus **Admissions as a visually distinct CTA button** and a current-parent utility bar. |
| **Why proposed** | Direct observation: **4/4 Indian K-12 references under-surface admissions; 4/4 international references do not.** An Indian premium *university* in the same sample surfaces it well — so this is a K-12 sector gap, not a market limitation. Observed nav counts: UWCSEA 6, Exeter 7 (best organised) vs Vasant Valley ~14 (most sprawling). |
| **Alternatives** | Conventional 7-section structure with "Media"/"Resources" (reproduces the observed failure) · flat 14-item nav · full nine-way audience segmentation (disproportionate for one campus; `FUTURE`). |
| **Advantages** | Admissions reachable in one click from every page · literal labels a scanning parent can parse · current parents get a permanent one-tap destination without spending main-nav budget. |
| **Disadvantages / risks** | Departs from what the school may expect a school website to look like. |
| **Dependencies** | Governs [06](06_INFORMATION_ARCHITECTURE.md), [07](07_SITE_MAP.md), [09](09_NAVIGATION.md). |
| **If rejected** | Changes the IA documents and the 81-route table. |
| **Confidence** | **High** — this is the most directly evidence-backed recommendation in the set. |
| **Downstream impact** | High. |

## D-B15 · Notices separate from News

| | |
|---|---|
| **Recommendation** | Two distinct modules. News = prospective parents, marketing, indefinite lifespan. Notices = current parents, operations, short lifespan with expiry. |
| **Why proposed** | All four Indian references merge them, producing a marketing channel cluttered with maintenance notices and an operations channel buried in marketing. Serves neither audience. |
| **Alternatives** | One "Updates" module with a category filter. |
| **Advantages** | Each serves its actual audience · notices get expiry dates, which is the mechanism preventing the observed six-year-old live notice. |
| **Disadvantages / risks** | One extra module to build and for staff to understand. |
| **Dependencies** | D-B12, D-B8. |
| **If rejected** | Merging costs one module but reproduces a documented failure. |
| **Confidence** | **High.** |
| **Downstream impact** | Medium. |

## D-B16 · Safety and Transport elevated to their own pages

| | |
|---|---|
| **Recommendation** | Dedicated `/about/safety` and `/about/transport` pages. |
| **Why proposed** | Safety and proximity rank highly in published literature on Indian parental school choice, and the provisions parents look for (CCTV, child protection policy, drills) are concrete and checkable. **None of the four Indian references surfaced safety as a findable destination.** For a day school, transport is often the *first* disqualifier. |
| **Alternatives** | Fold both into Infrastructure (the observed convention). |
| **Advantages** | Directly answers two top-tier questions competitors do not · targets search queries competitors do not serve. |
| **Disadvantages / risks** | ⚠️ **Safety content carries a specific integrity risk** — claiming measures the school does not have is a serious misrepresentation, not marketing copy. Every claim must be verified with the school before publication. |
| **Dependencies** | Blocked on school-supplied content. |
| **If rejected** | Content folds into Infrastructure; two routes removed. |
| **Confidence** | **High.** |
| **Downstream impact** | Low. |

---

# GROUP K — Homepage and UX

## D-B14 · Ten-section homepage, journey-ordered

| | |
|---|---|
| **Recommendation** | Hero → Trust statistics → School intro → Academics (4 stages) → Why Choose Us → Campus Life → Principal's message → News & Events → Testimonials → Admissions CTA. |
| **Why proposed** | Ordered by the questions a parent asks, in the order they ask them — not by what the school most wants to say. Down from your original ~12: **Achievements** and **Gallery** were *folded*, not deleted — at homepage stage a parent needs a signal these exist plus a route to them, not the full content. Both retain dedicated pages. |
| **Alternatives** | Your original ~12-section version · a shorter 6-section version (loses trust-building) · a carousel hero (rejected — harms LCP, dilutes the message). |
| **Advantages** | Every section states its journey role · lighter initial payload · one dominant CTA rather than several competing. |
| **Disadvantages / risks** | The school may want more of its own material above the fold. |
| **Dependencies** | D-B13. |
| **If rejected** | Section order is cheap to change now and moderately cheap later. |
| **Confidence** | **Medium-high.** Ordering is a judgement call informed by evidence, not dictated by it. |
| **Downstream impact** | Low. |

## D-B17 · Publish real fee amounts

| | |
|---|---|
| **Recommendation** | Publish per-class fee figures as an accessible HTML table, with a downloadable PDF alongside. |
| **Why proposed** | Cost is a stated primary selection factor. Hiding fees filters out affordable-fit families who assume the worst, signals evasiveness, and removes the site from a high-intent search query (`[school] fees`). |
| **Alternatives** | **Structure without amounts + current PDF** (fallback if the school declines) · **"contact us for fees"** (the common convention — and the one that loses parents silently). |
| **Advantages** | Answers the second-most-important parental question directly · wins a high-intent query · builds trust through transparency. |
| **Disadvantages / risks** | ⚠️ **This is the school's commercial decision, not mine.** Some schools prefer competitors not see their figures. |
| **Dependencies** | Blocked on school-supplied fees (OD-005, OD-010). |
| **If rejected** | Publish the fee *structure* plus a current downloadable schedule. **Never nothing.** |
| **Confidence** | **Medium** on the recommendation; **high** that "contact us for fees" is the wrong answer. |
| **Downstream impact** | Low. |

---

# GROUP L — Analytics, Monitoring, Deployment

## D-B21 · Cookieless, privacy-focused analytics

| | |
|---|---|
| **Recommendation** | A cookieless analytics tool (e.g. Plausible) plus Search Console for field Core Web Vitals. **13 events only**, each mapping to one of six questions the school actually has. |
| **Why proposed** | Restraint by design. Google Analytics is `NOT_RECOMMENDED` here: consent obligations, meaningful page weight, and far more data collection than six questions require — on a site whose visitors are parents of minors. |
| **Alternatives** | Google Analytics · platform analytics (Vercel — viable, better CWV integration) · none. |
| **Advantages** | Likely no consent banner · negligible page weight · no third-party tracking of families. |
| **Disadvantages / risks** | Paid (modest) · less rich than GA. |
| **Dependencies** | OD-015, OD-017. |
| **If rejected** | GA would require a consent banner and a privacy-policy expansion. |
| **Confidence** | **High.** |
| **Downstream impact** | Low. |

> **Explicitly rejected regardless of vendor:** session recording and heatmaps — they capture keystrokes in form fields, meaning parent phone numbers and children's names would be transmitted to a third party.

---

# GROUP M — Remaining

## D-B22 · No CAPTCHA initially

| | |
|---|---|
| **Recommendation** | Honeypot + rate limiting (3/IP/hour) + strict schema validation. **CAPTCHA held in reserve**, deployed only if spam actually becomes a burden. |
| **Why proposed** | CAPTCHA measurably reduces genuine form completions and creates real accessibility barriers — in exchange for solving a problem that may never materialise at this traffic level. The enquiry form is the site's conversion endpoint; friction there is expensive. |
| **Alternatives** | CAPTCHA from day one · no spam protection at all. |
| **Advantages** | Zero friction for real parents · no accessibility barrier · honeypot catches most naive bots at no cost. |
| **Disadvantages / risks** | If spam does arrive, staff deal with it until CAPTCHA is added. |
| **Dependencies** | D-A2. |
| **If rejected** | Adding CAPTCHA up front is easy; choose an accessible variant. |
| **Confidence** | **High.** |
| **Downstream impact** | Very low. |

---

# CONSISTENCY FINDINGS

Verified against the repository during this task. **None have been modified** — reported first, per your instruction.

## 🔴 CF-1 · `Facility` administration model is genuinely contradictory — **this is a decision, not a typo**

Traced across five documents:

| Document | Says |
|---|---|
| [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) §14 | `Facility` is a first-class entity (slug, name, description, category, image, order, status) |
| [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) L48 | Facilities create/edit/delete — **`EDITOR` ✅** |
| [20_ADMIN_CMS](20_ADMIN_CMS.md) L43 | "Facilities are edited **through Settings** rather than a full module" |
| [20_ADMIN_CMS](20_ADMIN_CMS.md) L111 | Settings module role = **`SUPER_ADMIN`** |
| [15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md) | Action inventory has **no Facility actions**; only `updateSiteSettings` (`SUPER_ADMIN`) |
| [03_REQUIREMENTS](03_REQUIREMENTS.md) AR-005 | CRUD list **omits Facility** |
| [07_SITE_MAP](07_SITE_MAP.md) | No `/admin/facilities` route among the 34 |

**The concrete defect:** `EDITOR` is granted Facility CRUD, but the only route to edit facilities is Settings, which is `SUPER_ADMIN`-only. **An editor holds a permission they cannot exercise.**

**Your decision:**

| | **Option A — Settings sub-resource** | **Option B — dedicated module** |
|---|---|---|
| Route | `/admin/settings` → Facilities tab | `/admin/facilities` (+3 routes) |
| Role | `SUPER_ADMIN` only | `EDITOR` |
| Action | `updateFacilities` | Full `Facility` CRUD |
| Fix needed | Remove EDITOR from doc 19 matrix | Add module to docs 03, 07, 15, 20; admin routes 34→37 |
| Fits | ~12 records changed yearly | Facilities changing more often |

**Recommendation: Option A**, matching the existing CMS reasoning — a dozen records changed once a year does not warrant a full module. But if you expect facilities to change with photographs each term, Option B is better.

## 🟠 CF-2 · Neon assumed in five places before OD-008 is decided

`00_MASTER_INDEX` L74 (diagram) · `01_PROJECT_OVERVIEW` L136 (diagram) · `13_SYSTEM_ARCHITECTURE` L46 (diagram), L186–187 (environments table), L202 (pooling note).

Your AUDIT-002/012 is correct. **Recommended fix (pending your word):** replace with `[NEON_OR_SUPABASE]` until OD-008 resolves. If you pick Neon now, the wording simply becomes correct instead.

## 🟠 CF-3 · Cloudinary missing from the vendor-selection gate

[41_PENDING_WORK](41_PENDING_WORK.md) §B-3 lists database, email, analytics, error monitoring — but not the media provider, which is both an architectural recommendation (D-B7) and a launch dependency for the safeguarding pipeline. Your AUDIT-019 is correct.

## 🟠 CF-4 · One stale entity count

Exactly **one** line contradicts the authoritative 18: [12_TECH_STACK](12_TECH_STACK.md) **line 91** reads *"Sixteen entities, three roles..."*. Verified: every other reference across 13 files says 18. Your AUDIT-001/009/017 is correct, and narrower than feared — a single-line fix.

## ✅ CF-5 · ADR-0010 **exists** — AUDIT-016 is a false positive

`HISTORY/DECISIONS/ADR-0010-RENDERING-CACHING.md` is present (7,425 bytes). All ten ADRs exist and all are linked from the history index with no orphans or duplicate IDs. It was written at the end of the session and was simply not in the batch you were sent. `43_CURRENT_STATUS` claiming 10 ADRs is accurate.

## 🟡 CF-6 · Route-count terminology (your AUDIT-003)

Agreed. "81 pages" would be misleading to the school. Recommended stakeholder framing:

```
Public content pages       37
Dynamic content templates   4
Admin routes               34   (implementation)
System routes               6   (implementation)
```

## 🟡 CF-7 · Consent-model wording (your AUDIT-022)

[48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md) states *"Most schools obtain a blanket media consent at admission."* That is a working assumption, not verified evidence about your school, and should be labelled as such.

---

# CHILD SAFETY — responsibility split (SPECIAL ATTENTION)

Not reducible to "remember EXIF". Three distinct layers:

### Technical controls the application owns
EXIF/geolocation stripped at upload, no opt-out, verified against a real GPS-tagged photo · content-type verification by inspection, not filename · SVG rejected (executable script vector) · `containsMinors` flag and `consentBasis` on every asset · alt text required, and **never naming a child** (it is machine-readable and indexable) · upload restricted to `EDITOR`+ · expedited takedown path, faster than normal deletion · all media actions audited.

### Process responsibilities the school owns
Obtaining and recording consent · **maintaining an exclusion list of children who must never be photographed or published** · deciding whether to name students in achievements · responding to withdrawal requests · training staff.

### Unresolved legal questions
Applicable data-protection law · breach-notification obligations · cookie-consent requirements · whether blanket admission consent is legally sufficient for web publication.
**These are for the school's legal advisor. This blueprint deliberately does not assert what the law requires**, and no future session should "solve" them from general internet assumptions.

> ⚠️ **Residual risk is Medium and cannot be engineered to Low.** Every technical control can be satisfied while still publishing a photograph of a child who should never have appeared — because only the school knows who that is. This should be said plainly at handover.

---

# DECISION SHEET

| ID | Recommendation | Confidence | Impact | Your decision |
|---|---|---|---|---|
| D-B1 | Next.js 16.x App Router | High | Very high | ☐ |
| D-B2 | TypeScript strict | Very high | Low | ☐ |
| D-B10 | Zod + React Hook Form | High | Low | ☐ |
| **D-B3** | **PostgreSQL** ⚠️ | Very high | Very high | ☐ |
| D-B4 | Prisma, latest stable | Medium-high | Medium | ☐ |
| **OD-008** | **Neon or Supabase** ⚠️ | Neon | Medium | ☐ |
| **D-B6** | **Auth.js** *(requirement locked)* ⚠️ | Medium-high | Low | ☐ |
| **D-B7** | **Cloudinary** ⚠️ | High | Medium | ☐ |
| **D-B8** | **Custom admin CMS** ⚠️ | High | High | ☐ |
| D-B20 | Direct publish, no approval chain | Medium | Medium | ☐ |
| **D-B9** | **Server Actions; no general API** ⚠️ | High | High | ☐ |
| D-B5 | Tailwind 4 + shadcn/ui | High | Medium | ☐ |
| D-B11 | Three roles | Medium | Medium | ☐ |
| D-B12 | 18 entities | High | High | ☐ |
| D-B18 | Soft delete content / hard delete enquiries | High | Medium | ☐ |
| D-B19 | Slug history + 301 | Very high | Low | ☐ |
| D-B13 | 6-item nav + Admissions CTA | High | High | ☐ |
| D-B15 | Notices separate from News | High | Medium | ☐ |
| D-B16 | Safety + Transport elevated | High | Low | ☐ |
| D-B14 | 10-section homepage | Medium-high | Low | ☐ |
| D-B17 | Publish real fees | Medium | Low | ☐ |
| D-B21 | Cookieless analytics | High | Low | ☐ |
| D-B22 | No CAPTCHA initially | High | Very low | ☐ |
| **CF-1** | **Facility model: Option A or B** ⚠️ | A | Low | ☐ |

**Also needed:** email provider (OD-014) · error-monitoring vendor (OD-016) · enquiry retention period (OD-011, the school's obligation) · Hindi at launch? (OD-009).

---

## What happens after you decide

```
Your approval / rejection
   ↓
49_DECISION_REGISTER updated — statuses promoted
   ↓
ADRs move Proposed → Accepted / Rejected
   ↓
Consistency findings CF-1 to CF-4, CF-7 corrected
   ↓
HISTORY entry recording the approval round
   ↓
43_CURRENT_STATUS and blueprint version updated
   ↓
Phase 1 (Foundation) may begin — after re-verifying current stable versions
```

**Until then the project remains at:** Research ✅ · Discovery ✅ · Blueprint ✅ · Recommendations ✅ · **Owner approval ⏳** · Implementation ❌
