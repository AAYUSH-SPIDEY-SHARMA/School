# 16 — Database Architecture

| Field | Value |
|---|---|
| **Status** | PROPOSED — engine pending explicit approval |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Backend Lead |
| **Dependencies** | [12_TECH_STACK](12_TECH_STACK.md) |
| **Related Documents** | [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) · [21_CONTENT_MODEL](21_CONTENT_MODEL.md) · [34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md) |

---

## Engine — PostgreSQL

**Status: ✅ `USER_APPROVED_DECISION` (D-B3), approved 2026-08-16.** PostgreSQL is now explicitly approved, not merely implied by the hosting choice. **Provider: Neon** (D-A3a). Switching to MongoDB, MySQL, SQLite, Firestore, or DynamoDB requires a future owner-approved ADR. See [49_DECISION_REGISTER](49_DECISION_REGISTER.md).

**Why relational.** The content model is full of genuine relationships — faculty belong to departments, images belong to albums, enquiries are assigned to users, audit entries reference actors, slug history references its entity. These are foreign keys, not embedded documents. Modelling them in a document store would mean either duplicating data or hand-rolling joins in application code, both of which trade integrity for nothing.

**What Postgres specifically buys us:** referential integrity enforced by the database rather than hoped for in application code · transactional consistency · partial and composite indexes for the exact query shapes this site uses · native enums matching our fixed status values · `tsvector` full-text search available later without adding a search service · `citext` for case-insensitive email uniqueness.

*Rejected:* MongoDB (relational data forced into documents; weaker integrity), MySQL (viable but no advantage; weaker partial-index and enum support), SQLite (unsuitable for serverless concurrent writes), Firestore (query limitations, vendor lock-in, poor relational fit).

---

## Hosting and connection model

Serverless functions create and drop connections rapidly, which will exhaust a Postgres connection limit if handled naively.

| Concern | Approach |
|---|---|
| Connection exhaustion | **Neon pooled connection string** for the application |
| Migrations | **Direct (unpooled) connection** — migration tooling requires session-level features the pooler does not support |
| Client instantiation | Single Prisma client instance per runtime, cached on `globalThis` in development to survive hot reload |
| Cold starts | Rust-free client keeps initialisation under ~100ms |
| Preview environments | Database branching per pull request, isolating schema changes |

Two connection strings are therefore required in every environment: `DATABASE_URL` (pooled) and `DIRECT_URL` (unpooled, migrations only). Documented in [35_ENVIRONMENT_CONFIGURATION](35_ENVIRONMENT_CONFIGURATION.md).

---

## Modelling conventions

| Convention | Decision | Reasoning |
|---|---|---|
| Primary keys | `cuid()` | Non-sequential, so record counts are not leaked by URL or API; sortable-ish; safe in distributed inserts |
| Public identifiers | **Slug, never id** | `/news/annual-day-2026`, not `/news/42` |
| Timestamps | `createdAt`, `updatedAt` on every entity | Non-negotiable for debugging and freshness tracking |
| Deletion | **Soft delete via `deletedAt`** on content entities | Staff delete things by accident; recovery must not require a database restore |
| Status | Native enum `DRAFT` / `PUBLISHED` / `ARCHIVED` | Type-safe, constrained by the database |
| Publication time | Separate `publishedAt` | Distinct from `createdAt` — a notice may be written days before it goes live |
| Naming | `PascalCase` models, `camelCase` fields | Prisma convention |
| Relations | Explicit foreign keys, explicit `onDelete` | Never leave cascade behaviour to chance |
| Money | **Integer paise, never float** | Floating-point currency is a defect waiting to happen |
| Enums | Database enums for fixed sets | `CLASS_LEVELS` contains Nursery–Class X only |

### Soft delete — and its trap
Soft delete is used for content entities so an editor's mistake is recoverable. It carries an obvious hazard: **every public query must filter `deletedAt: null`**, and forgetting it once leaks deleted content.

Mitigation: all public reads go through `lib/queries` functions that apply the filter centrally ([15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md)). Components never query directly. This is the specific reason that rule exists.

`AuditLog`, `SlugHistory`, and `AdmissionEnquiry` are **not** soft-deleted — audit and slug history are append-only, and enquiry deletion is a genuine privacy operation that must actually remove data.

---

## Indexing strategy

Indexes follow real query shapes from [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md), not speculation.

| Query | Index |
|---|---|
| Published news, newest first | `(status, publishedAt DESC)` partial where `deletedAt IS NULL` |
| Article by slug | Unique on `slug` |
| Current notices by category | `(status, category, publishedAt DESC)` |
| Notice expiry filtering | `(expiresAt)` |
| Upcoming events | `(status, startDate)` |
| Faculty by department | `(departmentId, displayOrder)` |
| Album images ordered | `(albumId, displayOrder)` |
| Enquiries by status, newest | `(status, createdAt DESC)` |
| Enquiry assignment | `(assignedToId, status)` |
| Audit by entity | `(entityType, entityId, createdAt DESC)` |
| Slug lookup on redirect | Unique on `(entityType, oldSlug)` |
| Login | Unique on `email` |

**Partial indexes** are used where most queries filter to a subset — indexing only `PUBLISHED, deletedAt IS NULL` rows keeps the index small and hot.

**Not indexed:** low-cardinality booleans alone, and free-text fields (until full-text search is actually built). Over-indexing slows writes and wastes space.

---

## Constraints — enforced in the database

Application validation is a user-experience feature. Database constraints are the actual guarantee.

- `NOT NULL` on every genuinely required field
- `UNIQUE` on slugs per entity type, on user email, on setting key
- Foreign keys with explicit `onDelete`:
  - `GalleryImage.albumId` → **Cascade** (an album's images have no meaning without it)
  - `Faculty.departmentId` → **SetNull** (a department can be retired without deleting staff)
  - `AdmissionEnquiry.assignedToId` → **SetNull** (deactivating a user must never destroy an enquiry)
  - `AuditLog.actorId` → **SetNull** (audit history survives user deletion)
- `CHECK` constraints where meaningful: non-negative fee amounts, `endDate >= startDate`
- Enums constrain status, category, role, and class level at the database level

---

## Migrations

| Rule | Reason |
|---|---|
| Every schema change is a checked-in migration | Reproducible across environments |
| Migrations run against the **direct** connection | Pooler lacks required session features |
| Never edit an applied migration | Creates divergence between environments |
| Destructive changes are two-phase | Add new → backfill → switch reads → drop old |
| Production migrations run only after a verified backup | [34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md) |
| Preview branches test migrations before merge | Catches failures before production |

---

## Seed data

A seed script provides: one `SUPER_ADMIN` (credentials from environment, **never committed**), the department list, default `SiteSetting` rows with `[PLACEHOLDER]` values, and the download and notice category enums.

⚠️ **Seed data contains no invented school facts.** Statistics, fees, faculty, and results seed as visible placeholders — never as plausible-looking fake values that could reach production unnoticed (CR-002).

---

## Performance expectations

Realistic for a single-campus school website:

| Aspect | Expectation |
|---|---|
| Total rows across all tables at 3 years | Low tens of thousands |
| Largest table | `GalleryImage`, then `AuditLog` |
| Read:write ratio | Overwhelmingly read-heavy |
| Peak load | Admission announcements, board-result days |
| Query complexity | Simple filtered lists with one or two joins |

At this size, correct indexing and the caching layer make database performance a non-issue. **Read replicas, sharding, and external caching are explicitly not planned** and would need measured evidence plus an ADR.

The caching layer means most page views never reach the database at all ([13_SYSTEM_ARCHITECTURE](13_SYSTEM_ARCHITECTURE.md)).

---

## Data protection

| Data | Sensitivity | Handling |
|---|---|---|
| Enquiry parent name, phone, email | **Personal data** | Access restricted to `ADMISSIONS_MANAGER` / `SUPER_ADMIN`; access logged; retention defined; deletable on request |
| Enquiry student name | **Personal data about a minor** | Optional field; same protections; strongest argument for a short retention window |
| Admin password hashes | Credential | argon2id; **never selected into any query result** |
| Audit log | Operational | Actor and action only — **never enquiry PII** |
| Published content | Public | — |

**Retention.** Enquiry records are kept for a defined period after closure, then deleted or anonymised. The period is an `OPEN_DECISION` requiring the school's input — it is their data-protection obligation, not a technical choice ([39_OPEN_DECISIONS](39_OPEN_DECISIONS.md)).

**Backups contain PII** and therefore inherit the same access restrictions. A backup left in an unsecured bucket is a data breach.

---

## Explicitly not built

| Rejected | Why |
|---|---|
| `Role` / `Permission` join tables | Three fixed roles. An enum is simpler and easier to audit |
| Generic `Page` / `SEO` tables | SEO fields live on each entity; global defaults live in `SiteSetting`. A generic page table would invite the page-builder complexity rejected in AR-022 |
| `NewsCategory` / `EventCategory` tables | Enums until the school demonstrates a need to manage categories themselves. Classified `OPTIONAL` — see [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) |
| `Application` / `ApplicationDocument` | Enquiry-only v1 (owner decision). Adding them later is additive, not a migration of existing data |
| `Student` / `Parent` accounts | Not a student information system ([02_PRODUCT_VISION](02_PRODUCT_VISION.md) anti-goals) |
| Full revision history tables | `FUTURE` (AR-021). Soft delete plus audit log covers the realistic recovery cases |
| Separate `Address` table | One school, one address. A table for a single row is ceremony |
