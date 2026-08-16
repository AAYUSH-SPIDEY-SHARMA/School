# ADR-0002 — Database Engine

## Status
**Accepted** — owner-approved 2026-08-16 (D-B3)

> PostgreSQL is now **explicitly** approved, not merely implied by the hosting choice. Switching to MongoDB, MySQL, SQLite, Firestore, or DynamoDB requires a future owner-approved ADR.
>
> **Sub-decision resolved:** provider is **Neon** (D-A3a).

## Date
2026-08-16

## Context

The content model contains 18 entities with genuine relationships: faculty belong to departments, images belong to albums, enquiries are assigned to users, audit entries reference actors, slug history references its entity.

The system holds personal data about parents and, optionally, minors. Expected volume is modest — low tens of thousands of rows across all tables at three years, overwhelmingly read-heavy, shielded from most traffic by caching.

The owner approved **Vercel + Neon/Supabase** hosting ([49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md) D-A3). Both are serverless Postgres providers.

## Problem

Choose a database engine that enforces integrity on data a school depends on, works within serverless connection constraints, and does not impose operational burden.

## Options

### Option 1 — PostgreSQL
Referential integrity enforced by the database, transactional consistency, native enums, partial and composite indexes, `citext` for case-insensitive email uniqueness, and `tsvector` available later if search is built without adding a search service.

**Against:** serverless functions exhaust connection limits without pooling, requiring two connection strings (pooled for runtime, direct for migrations) — a real operational subtlety that will confuse someone eventually.

### Option 2 — MySQL
Perfectly capable and widely deployed.

**Against:** weaker partial-index and enum support, and no advantage over Postgres for anything this project does. The choice would be arbitrary.

### Option 3 — MongoDB
Flexible schema; fast to start.

**Against:** the data is relational. Modelling it as documents means either duplicating data across documents or hand-rolling joins in application code — trading integrity guarantees for flexibility we do not need, since the content types are known and stable. Enforcing that a faculty member belongs to a real department would become application logic rather than a constraint.

### Option 4 — SQLite
Zero operational overhead; excellent for small sites.

**Against:** unsuitable for serverless multi-instance writes. Eliminated by the approved hosting decision.

### Option 5 — Firestore / DynamoDB
Managed, scales automatically.

**Against:** query limitations against our access patterns, poor relational fit, and meaningful vendor lock-in.

## Decision

**PostgreSQL** — as an `ARCHITECTURAL_RECOMMENDATION`.

> ⚠️ **Classification note.** The owner's hosting choice (Neon/Supabase) strongly implies Postgres — both are Postgres providers. But the engine was never put to the owner as a question, and this register does not silently promote implications into approvals. It is flagged here for one-line confirmation ([CHANGE-0007](../2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md)).

## Rationale

The deciding factor is **integrity, not scale**. At this volume any of these engines would perform adequately. What differs is whether the database enforces correctness or delegates it to application code.

For data a school depends on — enquiries representing real families, faculty records, published content — foreign keys, unique constraints, and check constraints being enforced by the database is worth more than schema flexibility. The content types are known and stable, so flexibility buys little.

Postgres also keeps a future option open cheaply: `tsvector` means site-wide search (currently `FUTURE`) would not require adding a search service.

## Consequences

### Positive
- Referential integrity, transactional consistency, real constraints
- Native enums constrain `ClassLevel` (Nursery–Class 10 only) at the database level, reinforcing a hard project invariant
- Partial indexes keep hot indexes small on the published-content queries that dominate
- Full-text search available later without new infrastructure

### Negative
- **Two connection strings required** — pooled for runtime, direct for migrations. Using the wrong one fails in confusing ways
- Migrations must be managed deliberately
- Schema changes require a migration rather than a code change

### Risks
- **Connection exhaustion under load.** Mitigated by the provider's pooler and by caching shielding the database from most traffic
- **A destructive migration loses data.** Mitigated by two-phase destructive changes and a verified backup before every production migration ([34_BACKUP_AND_RECOVERY](../../BLUEPRINT/34_BACKUP_AND_RECOVERY.md))

## Open sub-decision

**Neon or Supabase?** (OD-008)

`RECOMMENDATION`: **Neon** — database branching per preview deployment lets migrations be tested before merge, which is a real workflow benefit. Supabase bundles storage and auth this project does not use (media goes to Cloudinary, auth is admin-only), so its extra surface adds no value here.

## Related

- [16_DATABASE_ARCHITECTURE](../../BLUEPRINT/16_DATABASE_ARCHITECTURE.md) · [17_DATABASE_SCHEMA](../../BLUEPRINT/17_DATABASE_SCHEMA.md) · [ADR-0003](ADR-0003-ORM.md) · [ADR-0008](ADR-0008-HOSTING.md)
- Decision D-B3 in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
