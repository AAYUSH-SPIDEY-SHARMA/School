# ADR-0010 — Rendering, Data Access and Caching

## Status
**Accepted** — owner-approved 2026-08-16 (D-B9)

> ⚠️ Owner emphasised the precision point: **"No REST API" does not mean "no HTTP endpoints."** The five justified route handlers are retained. tRPC is also explicitly rejected. Components must not import the ORM directly — reads via `lib/queries`, writes via `lib/actions`. **The proxy and UI are not security boundaries.**

## Date
2026-08-16

## Context

The public site is overwhelmingly read-heavy and has exactly **one known client: itself**. There is no mobile app, no third-party integration, no partner consuming data.

Search is the primary acquisition channel, so content must be indexable without JavaScript execution (NFR-030). The audience is on mid-range Android phones over 4G, making client JavaScript a direct cost to the primary persona.

The admin, by contrast, is genuinely interactive and authenticated.

## Problem

Decide how data reaches pages, how mutations happen, and how caching is invalidated — without building infrastructure the project does not need.

## Options

### Data access

**Option 1 — Server Components reading directly + Server Actions for mutations.** No HTTP layer between the page and the database.
*Against:* Server Actions are a framework-specific mechanism, and they are easy to misunderstand as "private" when they are not.

**Option 2 — REST API consumed by the frontend.** Conventional, well understood, reusable by a future client.
*Against:* adds a network hop, a serialisation boundary, a versioning obligation, and a second surface to authenticate and rate-limit — for a consumer that does not exist.

**Option 3 — GraphQL.** Solves over-fetching; strong typing.
*Against:* over-fetching is already solved by server components selecting exactly what they render. One client makes a schema layer pure overhead.

**Option 4 — tRPC.** End-to-end type safety without schema duplication.
*Against:* Server Actions already provide this within a single application.

### Caching

**Option A — Time-based revalidation.** Simple; each page revalidates on a timer.
*Against:* requires guessing a TTL, which means choosing between stale content and wasted regeneration. A notice published at 9am should be live at 9am, not at the next interval.

**Option B — Tag-based invalidation.** Publishing invalidates exactly the tags affected.
*Against:* tags must be applied consistently, and missing one produces a confusing stale-content bug.

**Option C — No caching.** Always fresh.
*Against:* every page view hits the database, and LCP suffers for a parent on a slow connection.

## Decision

**Server Components + Server Actions, with tag-based cache invalidation** — as an `ARCHITECTURAL_RECOMMENDATION`.

**No public REST or GraphQL API.** Five route handlers exist only where a non-React client genuinely calls them: the auth library's own endpoints, a health probe, manual revalidation, dynamic OG image generation, and signed upload credentials ([18_API_SPECIFICATION](../../BLUEPRINT/18_API_SPECIFICATION.md)).

## Rationale

**On data access:** an API layer is justified by having more than one consumer. This project has one. Building a REST layer would create a network hop and a second authenticated surface purely to preserve an option nobody has asked for. If a second consumer ever appears — a mobile app, an aggregator — that becomes an ADR at the time, designed properly with authentication, rate limiting, versioning, and an explicit exclusion list (enquiry data must never be reachable).

**On caching:** tag-based invalidation is chosen over time-based because the content model has clear invalidation events. A notice is published; that is the moment `notices` should refresh. Guessing a TTL is strictly worse than knowing.

## The read/write API split — the consequential detail

This is the part most easily got wrong, and getting it wrong produces a specific, confusing failure.

| Context | API | Semantics |
|---|---|---|
| Public read path | `revalidateTag(tag, profile)` | Stale-while-revalidate — parents get an instant cached page while it refreshes behind them |
| Admin Server Action | `updateTag(tag)` | **Read-your-writes** — the editor sees their change immediately |

Without `updateTag` on the write path, an editor publishes a notice, does not see it appear, and publishes again — repeatedly. That friction is precisely what causes staff to conclude a CMS is broken and stop using it, which is the root cause of the content rot observed in the reference sites ([45_RESEARCH_SOURCES](../../BLUEPRINT/45_RESEARCH_SOURCES.md) F-3, journey J7).

**A caching decision therefore directly determines whether the CMS gets used.** That connection is worth stating explicitly, because it is not obvious.

## Server Actions are public endpoints

The single most important security consequence of this decision.

> The framework compiles every Server Action into a callable HTTP endpoint. **Anyone can invoke it directly, with arbitrary input, without visiting the corresponding page.**

Therefore every Server Action independently authenticates, authorises, and validates. The `proxy.ts` route gate and the admin UI are convenience, not security ([19_AUTHORIZATION_AND_ROLES](../../BLUEPRINT/19_AUTHORIZATION_AND_ROLES.md), AR-003).

This is verified by test: every action invoked with every role, including direct invocation — the highest-value security test in the project.

## Consequences

### Positive
- No API layer to build, secure, version, or document
- Content indexable without JavaScript, satisfying the SEO requirement structurally
- Minimal client JavaScript — eleven client components in v1
- Tag invalidation is precise: publishing refreshes exactly what changed
- Most page views are served from cache and never reach the database

### Negative
- **Framework-specific.** Migrating away would mean rewriting the data layer
- Server Actions are easy to mistake for private functions — a genuine hazard, addressed by the rule above
- Tags must be applied consistently; a missing tag produces stale content
- No reusable API if a second consumer appears later

### Risks
- **An action ships without an authorisation check.** Mitigated by the five-step action contract, the rule that components never import the ORM directly, and the full authorisation test matrix
- **Missing cache tag causes stale content.** Mitigated by a documented tag naming scheme and end-to-end publish verification in E2E tests
- **Client-component sprawl erodes performance.** Mitigated by an explicit client-component list and CI bundle budgets

## Implementation notes

**Rendering:** static prose pages are static; home, listings, and detail pages are cached with tag revalidation; the enquiry form and all of `/admin` are dynamic and never cached.

**Tags:** `news`, `news:{slug}`, `events`, `notices`, `gallery`, `faculty`, `settings`. Publishing a news article invalidates both `news` and `news:{slug}`.

**Discipline:** components never import the ORM — all access flows through `lib/queries` (reads) or `lib/actions` (writes), which is what makes the published-content filter and the authorisation check impossible to forget ([15_BACKEND_ARCHITECTURE](../../BLUEPRINT/15_BACKEND_ARCHITECTURE.md)).

## Related

- [13_SYSTEM_ARCHITECTURE](../../BLUEPRINT/13_SYSTEM_ARCHITECTURE.md) · [14_FRONTEND_ARCHITECTURE](../../BLUEPRINT/14_FRONTEND_ARCHITECTURE.md) · [15_BACKEND_ARCHITECTURE](../../BLUEPRINT/15_BACKEND_ARCHITECTURE.md) · [18_API_SPECIFICATION](../../BLUEPRINT/18_API_SPECIFICATION.md) · [27_PERFORMANCE](../../BLUEPRINT/27_PERFORMANCE.md)
- Decision D-B9 in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
