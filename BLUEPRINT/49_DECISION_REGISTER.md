# 49 — Decision Register

| Field | Value |
|---|---|
| **Status** | ACTIVE — architecture approved 2026-08-16 |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Last Change ID** | CHANGE-0009 |
| **Owner** | Principal Architect |
| **Related Documents** | [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) · [44_CHANGE_MANAGEMENT](44_CHANGE_MANAGEMENT.md) · [50_OWNER_APPROVAL_BRIEF](50_OWNER_APPROVAL_BRIEF.md) · `HISTORY/DECISIONS/` |

---

## Why this document exists

A large blueprint carries an implicit authority that can disguise the difference between four things:

> *"You told me this"* · *"I researched this"* · *"I am proposing this"* · *"Nobody has decided this"*

**Every decision appears here with an explicit status.** If it is not here, it is not decided.

> ⚠️ **Approval is not implementation.** As of this version, 26 decisions are approved and **zero are implementation facts**. No code exists. `USER_APPROVED_DECISION` means "build it this way"; `IMPLEMENTATION_FACT` means "this is verifiably true of code that exists". Nothing has crossed that line.

---

## Status definitions

| Status | Meaning | Who can set it |
|---|---|---|
| `USER_REQUIREMENT` | The owner stated it as a need | Owner |
| `USER_APPROVED_DECISION` | The owner explicitly chose or approved it | Owner |
| `ARCHITECTURAL_RECOMMENDATION` | Proposed; **awaiting approval** | Architect |
| `PROVISIONAL_DECISION` | Placeholder pending a blocking input | Architect |
| `IMPLEMENTATION_FACT` | Verified true of actual code | Verified in code |
| `OPEN_DECISION` | Unresolved | — |
| `REJECTED` | Considered and set aside | Architect or owner |
| `SUPERSEDED` | Replaced by a later decision | — |

---

## D-A — Scope decisions ✅ *(approved 2026-08-16, discovery)*

| ID | Decision | Status | Consequence |
|---|---|---|---|
| **D-A1** | Real school; details supplied later; **placeholder tokens meanwhile** | `USER_APPROVED_DECISION` | No school fact may be invented (CR-001, CR-002) |
| **D-A2** | **Enquiry-only** admissions for v1 | `USER_APPROVED_DECISION` | No parent accounts, no document upload, no application state machine → [ADR-0007](../HISTORY/DECISIONS/ADR-0007-ADMISSIONS-SCOPE.md) |
| **D-A3** | **Vercel** hosting | `USER_APPROVED_DECISION` | Serverless constraints drive ORM, connection, and media choices → [ADR-0008](../HISTORY/DECISIONS/ADR-0008-HOSTING.md) |
| **D-A4** | **CBSE, Nursery–Class 10** | `USER_APPROVED_DECISION` | Four academic stages. **No Class 11–12, no streams, no senior secondary** — hard invariant |

---

## D-B — Architecture decisions ✅ *(approved 2026-08-16, owner architecture approval)*

All 22 recommendations were approved. Owner amendments are noted where given.

### Framework and language

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B1** | **Next.js 16.x, App Router.** Server Components by default, Server Actions, `proxy.ts`, built-in metadata, `next/image`, modern caching model | `USER_APPROVED_DECISION` | **No minor/patch pinning.** Verify current stable release and official APIs before implementation → [ADR-0001](../HISTORY/DECISIONS/ADR-0001-FRAMEWORK.md) |
| **D-B2** | **TypeScript, `strict: true`** | `USER_APPROVED_DECISION` | "Type safety is mandatory. Do not downgrade to JavaScript or non-strict TypeScript." |
| **D-B10** | **Zod + React Hook Form**, shared client/server schema | `USER_APPROVED_DECISION` | "The server is ALWAYS authoritative. Never trust client validation." |

### Database and ORM

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B3** | **PostgreSQL** | `USER_APPROVED_DECISION` | Explicitly approved — no longer merely implied by hosting. Database-level integrity required: foreign keys, unique and check constraints, enums, indexes, partial indexes. Switching engines requires a future owner-approved ADR → [ADR-0002](../HISTORY/DECISIONS/ADR-0002-DATABASE.md) |
| **D-B4** | **Prisma, latest stable at implementation time** | `USER_APPROVED_DECISION` | ⚠️ "Do NOT blindly install a historical Prisma version." No Prisma 6.16+, no `queryCompiler` preview flag, no superseded configuration. At implementation: verify current stable Prisma, Next.js compatibility, PostgreSQL/Neon adapter requirements, migration tooling, Studio — and **record exact installed versions in implementation records** → [ADR-0003](../HISTORY/DECISIONS/ADR-0003-ORM.md) |
| **D-A3a** | **Neon** as database provider | `USER_APPROVED_DECISION` | Chosen over Supabase for pooling, PR/environment branching, migration testing, narrower surface. **Do not add Supabase Auth or Storage.** Resolves OD-008 → [ADR-0008](../HISTORY/DECISIONS/ADR-0008-HOSTING.md) |

### Authentication

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B6** | **Auth.js**, Credentials provider, database-backed sessions | `USER_APPROVED_DECISION` | Non-negotiable: admin-only auth · no public accounts · secure revocable sessions · server-side authorisation · **argon2id** · no fast hashes · no client-side-only authorisation. Maintain the `auth.config.ts` / `auth.ts` split; never import Node-only or Prisma-dependent config into `proxy.ts`. Google Workspace SSO is **not** v1 → [ADR-0004](../HISTORY/DECISIONS/ADR-0004-AUTH.md) |

### Media

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B7** | **Cloudinary** | `USER_APPROVED_DECISION` | Mandatory safeguards: **EXIF stripping · geolocation stripping** · automatic optimisation · safe formats · child-image consent controls · school-owned exclusion list · expedited takedown. Not replaceable by raw S3/R2/local storage unless a replacement demonstrably preserves every safeguarding and optimisation control → [ADR-0005](../HISTORY/DECISIONS/ADR-0005-MEDIA-STORAGE.md) |

### CMS

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B8** | **Purpose-built custom admin CMS** | `USER_APPROVED_DECISION` | Explicitly not WordPress, Sanity, Payload, Contentful, Git-based Markdown, or a generic page builder. "Deliberately narrow and school-specific." Primary goal: **a trained staff member publishes a normal notice without developer assistance, under 3 minutes on first attempt** → [ADR-0006](../HISTORY/DECISIONS/ADR-0006-CMS.md) |
| **D-B20** | **`DRAFT → PREVIEW → PUBLISH`**, editors publish directly | `USER_APPROVED_DECISION` | "Do not confuse *preview before publishing* with *approval before publishing*. The first is required. The second is intentionally excluded from v1." Revisit only if the school's real workflow requires it or editor count grows materially. Resolves OD-012 |

### Backend and data access

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B9** | **Server Components + Server Actions. No general-purpose REST/GraphQL/tRPC API** | `USER_APPROVED_DECISION` | Components **must not** import the ORM directly. Reads via `lib/queries`, writes via `lib/actions`. ⚠️ "No REST API" does **not** mean "no HTTP endpoints" — the five approved route handlers are retained (Auth.js, `/api/health`, `/api/revalidate`, `/api/og/[type]/[slug]`, `/api/media/sign`). Every Server Action independently authenticates, authorises, validates, executes, audits. **The proxy and UI are not security boundaries** → [ADR-0010](../HISTORY/DECISIONS/ADR-0010-RENDERING-CACHING.md) |

### UI and styling

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B5** | **Tailwind CSS 4.x + shadcn/ui on Radix** | `USER_APPROVED_DECISION` | CSS-first design tokens; no hard-coded colours scattered through components. Radix for dialogs, drawers, dropdowns, focus trapping, keyboard navigation. **Design system remains `PROVISIONAL` until real branding arrives, and accessibility takes priority over the provisional palette** → [ADR-0009](../HISTORY/DECISIONS/ADR-0009-STYLING-UI.md) |

### Roles

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B11** | **Three roles** — `SUPER_ADMIN`, `EDITOR`, `ADMISSIONS_MANAGER` | `USER_APPROVED_DECISION` | Enum on `User`; no dynamic Role/Permission tables; checks server-side. ⚠️ **Approved for v1, but role definitions must stay centralised so adding a future role is straightforward.** "Do NOT invent six roles." |

### Data model

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B12** | **Exactly 18 entities** | `USER_APPROVED_DECISION` | `User` · `Department` · `Faculty` · `News` · `Event` · `GalleryAlbum` · `GalleryImage` · `Achievement` · `Notice` · `Document` · `AdmissionEnquiry` · `EnquiryNote` · `Testimonial` · `Facility` · `MediaAsset` · `SiteSetting` · `AuditLog` · `SlugHistory`. **Do not add** Role, Permission, Application, ApplicationDocument, Page, SEO, NewsCategory, EventCategory |
| **D-B18** | **Soft delete content; hard delete enquiries** | `USER_APPROVED_DECISION` | `AuditLog` and `SlugHistory` append-only. "Centralize this behavior in `lib/queries` so individual components cannot accidentally forget `deletedAt` filtering." |
| **D-B19** | **Slug history + permanent 301** | `USER_APPROVED_DECISION` | ⚠️ "This is NOT a predecessor-site migration feature. It is a post-launch URL preservation mechanism." Protects parent WhatsApp links, bookmarks, ranking, external links. **"Never remove this from the architecture."** |
| **D-B23** | **`Facility` administered as a Settings sub-resource** | `USER_APPROVED_DECISION` | Option A. `/admin/settings`, **`SUPER_ADMIN` only**, `updateFacilities` action. No `/admin/facilities` route or module. **Incorrect `EDITOR` Facility CRUD permission removed.** Resolves CF-1 |

### Navigation and IA

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B13** | **Six-item navigation + distinct Admissions CTA** | `USER_APPROVED_DECISION` | About · Academics · Campus Life · Gallery · News & Events · Contact, plus Admissions as a visually distinct CTA and a current-parent utility pathway. "Do not turn the main navigation into a 12–15 item mega-menu." |
| **D-B15** | **News and Notices remain separate systems** | `USER_APPROVED_DECISION` | News = prospective parents, long-lived. Notices = current parents, operational, expiry-dated. "Do NOT merge them into a generic Updates module." |
| **D-B16** | **Dedicated `/about/safety` and `/about/transport`** | `USER_APPROVED_DECISION` | ⚠️ "**NO SAFETY CLAIM may be invented.** If the school does not provide evidence, omit the claim. Never manufacture 'premium' safety copy." |

### Homepage and UX

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B14** | **Ten-section journey-ordered homepage** | `USER_APPROVED_DECISION` | Hero → Trust statistics → School introduction → Academics → Why Choose Us → Campus Life → Principal's Message → News & Events → Testimonials → Admissions CTA. **No carousel hero.** Gallery and Achievements retain dedicated pages. Optimise for trust, clarity, decision-making, conversion, performance — not section count |
| **D-B17** | **Publish real fee amounts, if the school permits** | `USER_APPROVED_DECISION` *(conditional)* | Accessible HTML fee table + downloadable official PDF. **"Contact us for fees" as the only fee information is not acceptable.** If the school refuses public amounts, use the documented fallback: fee structure + current downloadable official schedule. **Never fabricate fees.** Conditional on OD-010 |

### Analytics and abuse prevention

| ID | Decision | Status | Owner notes |
|---|---|---|---|
| **D-B21** | **Privacy-focused cookieless analytics** + Search Console | `USER_APPROVED_DECISION` | Plausible or equivalent, subject to implementation-time vendor verification. Limited event model retained. **No session recording, heatmaps, keystroke capture, or invasive profiling. Parent enquiry data and children's names must never reach analytics tooling** |
| **D-B22** | **No CAPTCHA initially** | `USER_APPROVED_DECISION` | Honeypot + strict server-side validation + rate limiting (**3 enquiries/IP/hour**) + abuse detection. CAPTCHA is a reserve mechanism; if later required, choose an accessible implementation |

---

## D-C — Locked requirements, open implementation

| ID | Requirement (locked) | Implementation (open) |
|---|---|---|
| **D-C1** | Admin-only auth · secure revocable sessions · server-side RBAC · argon2id | ✅ Resolved — Auth.js approved (D-B6) |
| **D-C2** | Enquiry notification must reach the school; failure must alert | Email vendor (OD-014) |
| **D-C3** | Errors captured with enough context to diagnose | Vendor (OD-016) |
| **D-C4** | Personal data retained no longer than necessary | Period (OD-011) — **the school's obligation** |

---

## D-D — Provisional 🟡

| ID | Decision | Blocked on | Resolution |
|---|---|---|---|
| **D-D1** | **Entire design system** — OKLCH palette, typography, tokens | Logo and brand assets (OD-001) | Provisional → brand analysis → v2 → review → frozen |
| **D-D2** | Gold accent as CTA background | Contrast measurement against the real palette | ⚠️ If it fails 4.5:1 it becomes decorative-only. **Accessibility wins over palette preference** — owner-confirmed |
| **D-D3** | Content ownership assignments | Real staff names (OD-022) | Roles are placeholders |

---

## Locked security rules ✅

Owner-locked 2026-08-16, **regardless of any future library change**:

| | Rule |
|---|---|
| A | Server is authoritative |
| B | Client validation is UX only |
| C | Every Server Action authenticates independently |
| D | Every Server Action authorises independently |
| E | Every Server Action validates independently |
| F | Never trust hidden form fields for authorisation |
| G | Never expose enquiry PII to public APIs |
| H | Never expose child safety / exclusion information publicly |
| I | Passwords use argon2id |
| J | Sessions are revocable |
| K | Audit privileged mutations |
| L | Soft-deleted content must never appear publicly |
| M | Child imagery must follow the media-consent architecture |
| N | EXIF/geolocation metadata must not reach public media |
| O | No session recording or heatmaps |

---

## D-E — Rejected ❌

Owner-confirmed. **Any future deviation requires an ADR plus owner approval.**

| ID | Rejected | Reason |
|---|---|---|
| **D-E1** | Microservices | One team, one deployable, modest traffic |
| **D-E2** | Kubernetes / container orchestration | Serverless chosen |
| **D-E3** | Redis / external cache | Framework caching + CDN suffice |
| **D-E4** | GraphQL | One client; server components remove over-fetching |
| **D-E5** | Separate Express/NestJS backend | Doubles deployment and auth surface |
| **D-E6** | Headless CMS | Cost; a second system for staff |
| **D-E7** | WordPress | Plugin security surface; fights a bespoke design |
| **D-E8** | `Role`/`Permission` join tables | Three fixed roles; enum is simpler |
| **D-E9** | Generic `Page`/`SEO` tables | Invites page-builder complexity |
| **D-E10** | Page builder / block editor | Trades staff usability for unrequested flexibility |
| **D-E11** | Dark mode (v1) | Doubles design and QA surface |
| **D-E12** | Hero carousel | Harms LCP, dilutes message |
| **D-E13** | Session recording / heatmaps | **Would capture parent contact details in form fields** |
| **D-E14** | Comments on news or gallery | Moderation and safeguarding burden |
| **D-E15** | AI chatbot in core scope | `FUTURE` |
| **D-E16** | Automated face recognition | Consent questions exceed the convenience |
| **D-E17** | Nine-way audience segmentation | Disproportionate for one campus |
| **D-E18** | Infrastructure as code | Two managed services; documented setup is simpler |
| **D-E19** | Public user accounts / parent login | Owner-confirmed; not v1 |
| **D-E20** | Online payments | Owner-confirmed; not v1 |
| **D-E21** | Full admissions applications with document upload | Owner-confirmed; not v1 |
| **D-E22** | Supabase (as database provider) | Neon selected — D-A3a |
| **D-E23** | Drizzle (as ORM) | Prisma selected — D-B4 |
| **D-E24** | MongoDB / MySQL / SQLite / Firestore / DynamoDB | PostgreSQL selected — D-B3 |

---

## D-F — Superseded 🔄

| ID | Superseded decision | Replaced by | Record |
|---|---|---|---|
| **D-F1** | "Prisma 6.16+ with `queryCompiler` preview flag" | D-B4 — latest stable; **no version pinning** | [CHANGE-0006](../HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md) |
| **D-F2** | Stack presented without provenance classification | This register | [CHANGE-0007](../HISTORY/2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md) |
| **D-F3** | Homepage sections trimmed on performance grounds | D-B14 — ordered by parent journey | [CHANGE-0007](../HISTORY/2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md) |
| **D-F4** | News/Event categories rejected outright | Classified `OPTIONAL` pending evidence | [CHANGE-0007](../HISTORY/2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md) |
| **D-F5** | "Vercel + Neon/Supabase" (provider unresolved) | D-A3 + D-A3a — Vercel + **Neon** | [CHANGE-0009](../HISTORY/2026/08/CHANGE-0009-ARCHITECTURE-APPROVAL.md) |
| **D-F6** | `EDITOR` granted Facility CRUD with no route to exercise it | D-B23 — Settings sub-resource, `SUPER_ADMIN` only | [CHANGE-0009](../HISTORY/2026/08/CHANGE-0009-ARCHITECTURE-APPROVAL.md) |

---

## Summary

| Status | Count |
|---|---|
| `USER_APPROVED_DECISION` | **26** *(4 scope + 22 architecture)* |
| `ARCHITECTURAL_RECOMMENDATION` | **0** |
| Locked requirement, open implementation | 3 |
| `PROVISIONAL_DECISION` | 3 |
| `REJECTED` | 24 |
| `SUPERSEDED` | 6 |
| **`IMPLEMENTATION_FACT`** | **0** |
| `OPEN_DECISION` | 20 → [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) |

### What this says plainly

**The architecture is approved. Nothing is built.**

Every technology, structural, and product decision now has explicit owner approval. The remaining open items are **school-dependent** — identity, photography, fees, consent process, legal review, staff workflow — not architectural.

**Zero implementation facts** is the important line. Approval authorises a build; it does not constitute one. That line is crossed only when code exists and has been verified against these decisions.
