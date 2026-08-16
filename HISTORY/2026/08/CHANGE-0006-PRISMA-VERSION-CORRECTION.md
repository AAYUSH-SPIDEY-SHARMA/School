# CHANGE-0006 — Correction: Prisma 6.16 Recommendation Superseded by Prisma 7

## Date
2026-08-16

## Category
Architecture / Database / Documentation Correction

## Status
COMPLETED

## Trigger
The project owner reviewed the proposed discovery plan and challenged the ORM recommendation, noting that Prisma 7 was already available and that pinning the project to Prisma 6 was unnecessarily restrictive. The challenge was verified against Prisma's official release notes and found to be **correct**.

This entry exists because the error was mine and the correction is instructive. It is recorded rather than silently edited, per the project rule that history is not rewritten to conceal superseded reasoning.

## Previous State

The initial discovery plan specified:

> **ORM:** Prisma 6.16+ with `queryCompiler` + `@prisma/adapter-neon`
> **Rationale:** Prisma 6.16 stabilised `driverAdapters` and `queryCompiler`, eliminating the bundled Rust query engine. Vercel cold starts improved from ~800 ms to under 100 ms, which removes the main historical reason to prefer Drizzle on serverless.

The underlying *reasoning* was sound. The *version framing* was wrong.

## New State

**ORM recommendation:** Prisma, **latest stable major version** verified at implementation time.

At the date of this entry, that is the Prisma 7.x line (7.7.x observed 2026-08-16). Prisma 7 makes the Rust-free client the **default architecture** rather than an opt-in preview:

- Rust-free client runtime implemented entirely in TypeScript
- Generated client moved out of `node_modules`
- Reported ~3× faster queries and ~90% smaller bundles versus the Rust-engine generation
- New dynamic configuration file; substantially faster type generation
- `queryCompiler` and `driverAdapters` are no longer preview flags to enable — the behaviour they gated is now the default

The blueprint records the **technology choice** (Prisma) and the **requirement** (Rust-free client, driver-adapter connectivity to serverless Postgres). It does not record a version number as an architectural constraint.

## Reason

Two distinct errors were present in the superseded recommendation:

**1. Factual staleness.** Prisma 7 had been stable for some time and had reached 7.7.x. Recommending "6.16+" described a generation the project would never install.

**2. A methodological error, which matters more.** Even had 6.16 been current, pinning a discovery-phase blueprint to a specific minor version is wrong. This project will not begin implementation for some time. A blueprint that names `6.16` becomes misleading the moment a newer release lands, and it invites a future engineer to install an outdated version *because the documentation told them to*.

The second error generalises beyond Prisma, so it was promoted into a project-wide rule rather than fixed in one place.

## Alternatives Considered

### Option A — Silently edit the plan to say "Prisma 7"
Rejected twice over. It conceals a correction that has teaching value, and it repeats the underlying methodological mistake by simply pinning a newer number.

### Option B — Switch to Drizzle instead
Considered seriously, since the original Prisma-vs-Drizzle argument turned on serverless bundle size and cold starts. Rejected: Prisma 7's Rust-free client substantially narrows that gap, and Prisma retains clearly better migration tooling and Studio — which matter for a project where non-engineer school staff may eventually need data inspected. Recorded in full in [ADR-0003](../../DECISIONS/ADR-0003-ORM.md).

### Option C — Record the technology choice, defer the version *(selected)*
Blueprint locks "Prisma, Rust-free client, driver adapter to serverless Postgres." Implementation phase verifies and installs the then-current stable release.

## Decision

Adopt Option C, and generalise it into a **version policy** applied across the entire blueprint:

> The blueprint locks technology choices and architectural requirements. It does **not** pin minor or patch versions. Major lines may be named where they carry architectural meaning (e.g. "Next.js 16.x" implies the App Router and the `proxy.ts` convention). Version-specific research findings are recorded in `45_RESEARCH_SOURCES.md` **with their observation date**, so they read as dated evidence rather than standing requirements.

`37_IMPLEMENTATION_ROADMAP.md` carries an explicit first step: re-verify current stable versions and official migration notes before installing anything.

## Evidence

- Prisma official release announcement for ORM 7.0.0 (Rust-free architecture, generated code relocation, performance figures).
- Prisma changelog showing 7.x progression through 7.2.0, 7.4.0 (client caching layer), 7.5.0 (nested transaction rollback via savepoints), 7.7.0 (`prisma bootstrap`).
- Prisma documentation: upgrade guide to ORM 7.
- Observation date for all of the above: **2026-08-16**. Recorded as dated evidence in `BLUEPRINT/45_RESEARCH_SOURCES.md`, not as a standing requirement.

## Impact

### Product
None. No product behaviour depends on the ORM generation.

### UX
None.

### Technical
The serverless argument for Prisma is **stronger** than originally stated, not weaker. The correction reinforces rather than reverses the ORM choice. Removing the `queryCompiler` preview-flag instruction also removes a future configuration step that would have been wrong to follow.

### Performance
Positive, relative to the superseded recommendation: Prisma 7's default architecture delivers the bundle-size and cold-start benefits that 6.16 only offered behind preview flags.

### SEO
None.

### Security
Marginally positive — a smaller client surface and no bundled native binary reduce the dependency attack surface.

### Accessibility
None.

### Development
Removes a class of future error where an engineer follows the blueprint literally and installs a superseded version or enables flags that no longer exist. The version policy prevents recurrence across every other technology in the stack.

### Migration
None. No code exists. Had this been caught after implementation, it would have meant a major-version ORM upgrade — which is precisely the cost the discovery-first approach is intended to avoid.

## Files Changed

- `HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md` (this file)

## Blueprint Documents Updated

- `12_TECH_STACK.md` — version policy section; no pinned minors
- `16_DATABASE_ARCHITECTURE.md` — Rust-free client and driver-adapter requirement
- `17_DATABASE_SCHEMA.md` — no version-specific syntax assumptions
- `37_IMPLEMENTATION_ROADMAP.md` — mandatory version re-verification as first step
- `45_RESEARCH_SOURCES.md` — Prisma findings recorded with observation date
- `49_DECISION_REGISTER.md` — ORM entry classified `ARCHITECTURAL_RECOMMENDATION`

## Related Changes

- Supersedes the ORM element of [CHANGE-0002](CHANGE-0002-STACK-RECOMMENDATION.md)
- Detailed in [ADR-0003 — ORM](../../DECISIONS/ADR-0003-ORM.md)
- The version policy also constrains [ADR-0001 — Framework](../../DECISIONS/ADR-0001-FRAMEWORK.md)

## Follow-Up Work

1. Apply the contradiction sweep for `Prisma 6` and `queryCompiler`-as-required-flag across the finished blueprint.
2. At implementation start, verify the then-current Prisma stable release and its Neon driver-adapter guidance against official documentation.

## Verification

- Prisma 7 stability confirmed against the official Prisma changelog and release blog, not from internal model knowledge.
- Consistency sweep greps the finished blueprint for `Prisma 6` and `queryCompiler` and requires zero occurrences outside this entry and ADR-0003.

## Notes

The lesson worth keeping: **the error was not "I named the wrong number" — it was "I named a number at all."** A discovery blueprint that pins patch versions has a decay date built into it. The version policy exists so this failure mode cannot recur quietly in any other part of the stack.
