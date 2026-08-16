# CHANGE-0002 — Technology Stack Recommendation

## Date
2026-08-16

## Category
Architecture

## Status
COMPLETED — **recommendation only; not approved**

## Trigger
Following the repository audit ([CHANGE-0001](CHANGE-0001-INITIAL-DISCOVERY.md)) and the owner's four scope decisions, a technology stack was needed before any architecture document could be written.

## Previous State
No stack. Greenfield repository, no constraints inherited from existing code.

## New State

A stack proposed across ten ADRs. **Twenty-two of these are `ARCHITECTURAL_RECOMMENDATION` — none are approved** ([49_DECISION_REGISTER](../../../BLUEPRINT/49_DECISION_REGISTER.md) §D-B).

| Layer | Proposal | ADR |
|---|---|---|
| Framework | Next.js 16.x, App Router | [ADR-0001](../../DECISIONS/ADR-0001-FRAMEWORK.md) |
| Language | TypeScript, strict | — |
| Styling | Tailwind CSS 4.x | [ADR-0009](../../DECISIONS/ADR-0009-STYLING-UI.md) |
| Components | shadcn/ui on Radix | [ADR-0009](../../DECISIONS/ADR-0009-STYLING-UI.md) |
| Database | PostgreSQL | [ADR-0002](../../DECISIONS/ADR-0002-DATABASE.md) |
| ORM | Prisma, latest stable | [ADR-0003](../../DECISIONS/ADR-0003-ORM.md) |
| Auth | Auth.js 5.x | [ADR-0004](../../DECISIONS/ADR-0004-AUTH.md) |
| Media | Cloudinary | [ADR-0005](../../DECISIONS/ADR-0005-MEDIA-STORAGE.md) |
| CMS | Custom admin | [ADR-0006](../../DECISIONS/ADR-0006-CMS.md) |
| Data access | Server Components + Server Actions; **no REST API** | [ADR-0010](../../DECISIONS/ADR-0010-RENDERING-CACHING.md) |
| Hosting ✅ | Vercel + Neon/Supabase | [ADR-0008](../../DECISIONS/ADR-0008-HOSTING.md) |

Only hosting was chosen by the owner.

## Reason

Each layer was selected against this project's actual requirements rather than general popularity. The requirements that did most of the deciding:

1. **Search is the acquisition channel** → server rendering is non-negotiable, eliminating client-rendered options
2. **The admin is a real authenticated application** → favours a full-stack framework over a static-site generator
3. **Content must be relational and correct** → favours a relational database with real constraints
4. **The maintainer may be less experienced, or a different agency** → favours boring, well-documented technology and strong migration tooling
5. **The gallery contains children** → the media provider was chosen partly for metadata stripping
6. **The school must be able to operate this** → managed services over self-hosting

## Alternatives Considered

Each ADR records its own rejected options in full. Summarised:

| Rejected | Where argued |
|---|---|
| Astro, Remix, React SPA, WordPress | ADR-0001 |
| MongoDB, MySQL, SQLite, Firestore | ADR-0002 |
| Drizzle, raw SQL, TypeORM | ADR-0003 |
| Clerk, Auth0, Supabase Auth, hand-rolled | ADR-0004 |
| R2, S3, Vercel Blob, local filesystem | ADR-0005 |
| Headless CMS, git-based content, no CMS | ADR-0006 |
| VPS, cPanel, AWS/GCP direct | ADR-0008 |
| CSS Modules, styled-components, MUI/Chakra | ADR-0009 |
| REST, GraphQL, tRPC | ADR-0010 |

Also rejected outright, with reasoning in [49_DECISION_REGISTER](../../../BLUEPRINT/49_DECISION_REGISTER.md) §D-E: microservices, Kubernetes, Redis, message queues, separate backend service, state management library, monorepo tooling.

## Decision

Adopt the stack above **as recommendations**, pending owner approval (OD-006).

## Evidence

Technology findings recorded with observation dates in [45_RESEARCH_SOURCES](../../../BLUEPRINT/45_RESEARCH_SOURCES.md) §5.3, drawn from official release notes and documentation rather than secondary sources. Product decisions traced to research findings F-1 through F-8.

## Impact

### Product
No feature is constrained by the stack. Every requirement in [03_REQUIREMENTS](../../../BLUEPRINT/03_REQUIREMENTS.md) is achievable.

### UX
Server rendering supports fast first paint on mid-range devices. Radix primitives supply the accessibility behaviours in the highest-risk components.

### Technical
One application, one database, one media service, four external dependencies — each individually replaceable behind a thin internal wrapper.

### Performance
Server-first rendering and edge caching mean most page views never reach the application. Client JavaScript is limited to eleven components.

### SEO
Content indexable without JavaScript execution — the structural requirement (NFR-030).

### Security
Deliberate exclusions (no Redis, no separate backend, no headless CMS) are a security benefit as well as an operational one: less code, fewer services, smaller attack surface.

### Accessibility
Component foundation chosen substantially for focus management and ARIA correctness.

### Development
Boring, well-documented technology chosen over clever technology, because the project may be handed over.

### Migration
None — nothing exists. **Every recommendation here can be rejected at zero cost today.** That is the value of deciding before building.

## Files Changed
- `HISTORY/2026/08/CHANGE-0002-STACK-RECOMMENDATION.md` (this file)
- `HISTORY/DECISIONS/ADR-0001` … `ADR-0010`

## Blueprint Documents Updated
[12_TECH_STACK](../../../BLUEPRINT/12_TECH_STACK.md) · [13_SYSTEM_ARCHITECTURE](../../../BLUEPRINT/13_SYSTEM_ARCHITECTURE.md) · [14_FRONTEND_ARCHITECTURE](../../../BLUEPRINT/14_FRONTEND_ARCHITECTURE.md) · [15_BACKEND_ARCHITECTURE](../../../BLUEPRINT/15_BACKEND_ARCHITECTURE.md) · [16_DATABASE_ARCHITECTURE](../../../BLUEPRINT/16_DATABASE_ARCHITECTURE.md) · [18_API_SPECIFICATION](../../../BLUEPRINT/18_API_SPECIFICATION.md) · [30_DEPLOYMENT](../../../BLUEPRINT/30_DEPLOYMENT.md) · [49_DECISION_REGISTER](../../../BLUEPRINT/49_DECISION_REGISTER.md)

## Related Changes
- The ORM element was **superseded** by [CHANGE-0006](CHANGE-0006-PRISMA-VERSION-CORRECTION.md)
- Classification framing was corrected by [CHANGE-0007](CHANGE-0007-REVIEW-CORRECTIONS.md)

## Follow-Up Work
1. Owner approval of §D-B (OD-006) — **blocks all engineering**
2. Select Neon or Supabase (OD-008)
3. Select email, analytics, and error-monitoring vendors
4. **Re-verify current stable versions before installing anything**

## Verification
Stack consistency asserted across [12_TECH_STACK](../../../BLUEPRINT/12_TECH_STACK.md), the ADRs, [30_DEPLOYMENT](../../../BLUEPRINT/30_DEPLOYMENT.md), and [35_ENVIRONMENT_CONFIGURATION](../../../BLUEPRINT/35_ENVIRONMENT_CONFIGURATION.md) by the consistency audit.

## Notes
The most valuable property of this entry is that it is reversible. Twenty-two recommendations exist and zero lines of code depend on them.
