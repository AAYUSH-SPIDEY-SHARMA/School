# ADR-0001 — Application Framework

## Status
**Accepted** — owner-approved 2026-08-16 (D-B1)

> Approved with the standing condition: **no minor/patch version pinned.** Verify the current stable 16.x release and current official APIs before implementation.

## Date
2026-08-16

## Context

A school website whose primary acquisition channel is search. Parents arrive through Google at every stage of a staged search journey — informational, discovery, comparative, transactional, navigational ([45_RESEARCH_SOURCES](../../BLUEPRINT/45_RESEARCH_SOURCES.md) F-7).

The system must serve 37 static public routes, 4 dynamic route patterns, and a 34-route authenticated admin area. Primary audience is on mid-range Android phones over 4G. The eventual maintainer may be a small team or a single developer.

## Problem

Choose a framework that delivers server-rendered, indexable content and an authenticated admin area in one maintainable system, without imposing operational complexity a school cannot sustain.

## Options

### Option 1 — Next.js (App Router)
Server rendering by default, file-system routing, built-in image optimisation, metadata API, and server-side mutations. Public site and admin ship as one deployable.

**Against:** the framework moves quickly; the 16.x line alone renamed `middleware.ts` to `proxy.ts`, made `params`/`cookies()`/`headers()` async, replaced the PPR flag with Cache Components, and changed `next/image` defaults. Upgrades require attention. Its idioms also pull toward one hosting vendor, though nothing here depends on that.

### Option 2 — Astro
Excellent for content-heavy static sites and would suit the 37 static routes well. **Against:** the admin area is a genuinely interactive, authenticated application — Astro's islands model is a weaker fit, and we would end up adding a framework inside a framework.

### Option 3 — React SPA (Vite)
Simple mental model, no server. **Against:** fails the primary requirement. Client-rendered content is a poor bet when search is the acquisition channel, and it would require a separate backend for data and auth — two deployments, two auth surfaces.

### Option 4 — WordPress
Familiar to schools; a large plugin ecosystem; staff may already know it. **Against:** plugin-driven security surface is a recurring source of compromise on school sites; performance ceiling; and a bespoke design system fights the platform rather than using it. Covered further in [ADR-0006](ADR-0006-CMS.md).

### Option 5 — Remix / React Router
Capable and a reasonable server-rendering choice. **Against:** no decisive advantage here, a smaller ecosystem for the specific pieces we need, and less mature image handling — which matters on a photography-heavy site.

## Decision

**Next.js, App Router, 16.x line** — as an `ARCHITECTURAL_RECOMMENDATION`.

Per the version policy in [12_TECH_STACK](../../BLUEPRINT/12_TECH_STACK.md), the major line is named because it carries architectural meaning (App Router, `proxy.ts`, Cache Components). **No minor or patch version is pinned.**

## Rationale

Three requirements decide it:

1. **SEO is the acquisition channel.** Content must be indexable without JavaScript execution (NFR-030). This eliminates Option 3 outright.
2. **The admin is a real application.** An authenticated, interactive CMS in the same codebase as the public site avoids a second deployment, a second auth surface, and a second thing to operate. This weakens Options 2 and 3.
3. **Photography is central and the audience is on mid-range phones.** The built-in image pipeline is doing genuine work here, not saving boilerplate.

Astro was the closest alternative and would likely have produced a faster public site. It lost on the admin area, which is not a peripheral feature — it is the answer to the content-rot problem this project exists to solve ([45_RESEARCH_SOURCES](../../BLUEPRINT/45_RESEARCH_SOURCES.md) F-3).

## Consequences

### Positive
- Server rendering by default, satisfying the SEO requirement structurally
- One codebase, one deployment, one auth surface
- Image optimisation, metadata, and routing without additional libraries
- Server Actions remove the need for a REST API layer ([ADR-0010](ADR-0010-RENDERING-CACHING.md), [18_API_SPECIFICATION](../../BLUEPRINT/18_API_SPECIFICATION.md))

### Negative
- Upgrades demand attention; breaking changes are frequent enough to matter
- Server Components are a genuine learning curve for a maintainer new to them
- Idioms favour one hosting vendor, even though the architecture does not require it

### Risks
- **A framework upgrade breaks the site after handover.** Mitigated by documentation, tests, and choosing boring patterns over clever ones
- **Client-component sprawl erodes performance.** Mitigated by an explicit eleven-component client list and CI bundle budgets ([14_FRONTEND_ARCHITECTURE](../../BLUEPRINT/14_FRONTEND_ARCHITECTURE.md))

## Implementation notes — 16.x line

Verified 2026-08-16; **re-verify before installing**.

- Use `proxy.ts`, not `middleware.ts` — and import only an adapter-free auth config into it
- `params`, `searchParams`, `cookies()`, `headers()` are async
- `revalidateTag(tag, profile)` on the read path; `updateTag(tag)` in Server Actions for read-your-writes
- `next/image`: `qualities` defaults to `[75]`; use `remotePatterns`, not the deprecated `domains`
- Node 20.9+, TypeScript 5.1+

## Related

- [12_TECH_STACK](../../BLUEPRINT/12_TECH_STACK.md) · [13_SYSTEM_ARCHITECTURE](../../BLUEPRINT/13_SYSTEM_ARCHITECTURE.md) · [14_FRONTEND_ARCHITECTURE](../../BLUEPRINT/14_FRONTEND_ARCHITECTURE.md)
- [CHANGE-0002](../2026/08/CHANGE-0002-STACK-RECOMMENDATION.md)
- Decision D-B1 in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
