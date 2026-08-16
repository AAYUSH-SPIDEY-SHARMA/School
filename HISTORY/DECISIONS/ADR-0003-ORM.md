# ADR-0003 — ORM

## Status
**Accepted** — owner-approved 2026-08-16 (D-B4)

> ⚠️ Approved with an explicit condition: **do not blindly install a historical Prisma version.** No Prisma 6.16+, no `queryCompiler` preview flag, no superseded configuration. At implementation, verify current stable Prisma, Next.js compatibility, Neon adapter requirements, migration tooling and Studio — and **record the exact installed versions in implementation records**.
>
> Drizzle is now `REJECTED` (D-E23), not merely an alternative.

## Date
2026-08-16

## Context

18 entities, TypeScript strict, serverless runtime on Vercel, Postgres on Neon/Supabase. The eventual maintainer may be less experienced than the original author, or may be a different agency entirely.

This decision was **made once, incorrectly, and revised**. The first version recommended "Prisma 6.16+ with the `queryCompiler` preview flag" — a superseded generation, with instructions to enable flags that no longer exist. See [CHANGE-0006](../2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md).

## Problem

Choose a data-access layer that is type-safe, has trustworthy migration tooling, and does not impose unacceptable serverless cold-start cost.

## Options

### Option 1 — Prisma
Declarative schema, best-in-class migration tooling, and Prisma Studio for inspecting data through a GUI.

**Historical objection:** the Rust query engine produced large bundles and roughly 800ms cold starts on serverless — a serious problem for a site where a parent's first impression is load time.

**Current position (verified 2026-08-16):** Prisma 7 makes the Rust-free TypeScript client the **default**, not a preview flag. Reported ~3× faster queries, ~90% smaller bundles, cold starts under 100ms. The objection no longer holds.

### Option 2 — Drizzle
SQL-close, very small, excellent serverless characteristics, no code generation step. A genuinely strong choice, and by some accounts now the more commonly selected option for new TypeScript projects targeting edge runtimes.

**Against:** migration tooling is less mature than Prisma's, and there is no equivalent of Studio. Its SQL-close API is a virtue for an experienced developer and a liability for a maintainer who is not.

### Option 3 — Raw SQL with a query builder
Maximum control, minimum abstraction.

**Against:** no type safety without significant manual effort, and migrations become entirely hand-managed. For 18 entities maintained by a small team, this is a false economy.

### Option 4 — TypeORM
Mature and widely used. **Against:** weaker developer experience than either leading option, and no advantage here.

## Decision

**Prisma, latest stable version at implementation time** — as an `ARCHITECTURAL_RECOMMENDATION`.

**No version is pinned.** The requirement is: Rust-free client, driver-adapter connectivity to serverless Postgres, and migration tooling. Which release satisfies that is verified at implementation ([12_TECH_STACK](../../BLUEPRINT/12_TECH_STACK.md) version policy).

## Rationale

With the cold-start objection resolved, the decision turns on **who maintains this**.

Two Prisma capabilities matter disproportionately for a project that may be handed over:

1. **Migration tooling.** Schema changes on a live database holding real enquiry records are the highest-consequence routine operation in the system. Mature, well-documented migration tooling reduces the chance of a maintainer getting this wrong.
2. **Studio.** A non-expert can inspect data through a GUI without writing SQL. For a school project where someone may need to check whether an enquiry was recorded, this has real practical value.

Drizzle is genuinely close and would be a defensible choice. If the deployment target were edge functions where every kilobyte mattered, or the team were strong SQL practitioners, it would probably win. Neither is true here.

> **Honest assessment:** this is the least clear-cut decision in the stack. Both options would work. If the owner prefers Drizzle, that is a reasonable position and the switch costs nothing today — no code exists.

## Consequences

### Positive
- Declarative schema doubles as living documentation of the data model
- Migration tooling reduces the risk of the highest-consequence routine operation
- Studio gives non-experts safe data visibility
- Rust-free client keeps serverless cold starts acceptable
- Strong end-to-end type safety from schema to query result

### Negative
- Code generation step in the build
- Less SQL control than Drizzle for complex queries — not expected to bind at this complexity
- Historically a moving target across major versions

### Risks
- **Version drift between blueprint and reality.** Directly mitigated by the version policy, which exists because of the error this ADR corrects
- **Complex query needs outgrow the abstraction.** Prisma supports raw SQL escape hatches; any such query must still be parameterised (NFR-044)

## Implementation notes

- Single client instance per runtime, cached on `globalThis` in development to survive hot reload
- Pooled connection for runtime, **direct connection for migrations**
- `select` explicit fields; never return `passwordHash`
- All access through `lib/queries` and `lib/actions` — components never import the client directly
- Two-phase destructive migrations; verified backup before production migrations

## Related

- [16_DATABASE_ARCHITECTURE](../../BLUEPRINT/16_DATABASE_ARCHITECTURE.md) · [17_DATABASE_SCHEMA](../../BLUEPRINT/17_DATABASE_SCHEMA.md) · [15_BACKEND_ARCHITECTURE](../../BLUEPRINT/15_BACKEND_ARCHITECTURE.md)
- **[CHANGE-0006](../2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md)** — the correction that produced this ADR's current form
- Decision D-B4, superseded decision D-F1 in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
