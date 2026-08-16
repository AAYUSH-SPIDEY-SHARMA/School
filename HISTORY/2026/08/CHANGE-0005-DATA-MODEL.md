# CHANGE-0005 — Data Model

## Date
2026-08-16

## Category
Database / Architecture

## Status
COMPLETED — specification only; no `schema.prisma` exists

## Trigger
Content modules, the admin CMS, and the enquiry system all require a settled entity model before implementation.

## Previous State

The owner's initial outline proposed roughly nineteen entities, including `Role`, `Permission`, `Application`, `ApplicationDocument`, `NewsCategory`, `EventCategory`, `Page`, and `SEO`.

## New State

**18 entities**, each documenting why it exists and what problem it solves.

`User` · `Department` · `Faculty` · `News` · `Event` · `GalleryAlbum` · `GalleryImage` · `Achievement` · `Notice` · `Document` · `AdmissionEnquiry` · `EnquiryNote` · `Testimonial` · `Facility` · `MediaAsset` · `SiteSetting` · `AuditLog` · `SlugHistory`

### Removed from the initial outline

| Removed | Reason |
|---|---|
| `Role`, `Permission` | Three fixed roles for a handful of staff. An enum on `User` is simpler and easier to audit than a dynamic permission system |
| `Application`, `ApplicationDocument` | Enquiry-only v1 (owner decision, [ADR-0007](../../DECISIONS/ADR-0007-ADMISSIONS-SCOPE.md)). Adding them later is additive, not a migration |
| `Page`, `SEO` | Entity SEO lives on entities; global SEO lives in `SiteSetting`. A generic page table would invite the page-builder complexity rejected in AR-022 |
| `NewsCategory`, `EventCategory` | **Classified `OPTIONAL`, not rejected** — see below |

### Added, not in the initial outline

| Added | Reason |
|---|---|
| **`SlugHistory`** | A changed slug must issue a 301 from the old URL. School links spread through parent WhatsApp groups and are never updated; breaking them silently loses parents and ranking (NFR-028) |
| **`EnquiryNote`** | A separate entity rather than a JSON blob, so each note carries a real author and timestamp — the mechanism that stops two staff calling the same parent (J8) |
| **`MediaAsset.consentBasis` / `containsMinors`** | A school gallery contains identifiable children. Added following the review round ([CHANGE-0007](CHANGE-0007-REVIEW-CORRECTIONS.md)) |

## Reason

The governing principle was that **every entity must justify itself**. An entity that exists because similar systems have one is overhead — a table to migrate, an admin module to build, and a concept for a maintainer to learn.

The four removals each replace a general mechanism with a specific one that fits the actual requirement. Three roles do not need a permission system. Known, stable content types do not need a generic page table.

## The categorisation decision — deliberately left open

`NewsCategory` and `EventCategory` were initially rejected outright. That was corrected in review: **rejecting and deferring are different, and the reasoning should be visible.**

Enums are used where the set is genuinely fixed and school-agnostic — notice categories, document categories, album categories. News categories are neither: what a school files news under is specific to that school and may change over time. That argues for a table — but only once there is evidence the school wants to manage them.

MVP therefore uses a nullable free-text tag. If real filtering demand appears, promoting it to a table is a small additive migration. **Classified `OPTIONAL`.** Deciding now, in either direction, would be guessing.

## Alternatives Considered

### Option A — Build the full nineteen-entity model up front
Rejected: builds an application system that will not exist in v1, and a permission system three roles do not need.

### Option B — Minimal model, add entities as needed
Rejected: `SlugHistory` and `AuditLog` in particular are painful to retrofit. Slug history added after launch cannot recover URLs already broken.

### Option C — Justify each entity individually *(selected)*
Some removed, some retained, two added, one deferred with stated criteria.

## Decision

18 entities as listed, with per-entity justification recorded in [17_DATABASE_SCHEMA](../../../BLUEPRINT/17_DATABASE_SCHEMA.md).

## Impact

### Product
Every content module in [20_ADMIN_CMS](../../../BLUEPRINT/20_ADMIN_CMS.md) maps to an entity. Nothing in [03_REQUIREMENTS](../../../BLUEPRINT/03_REQUIREMENTS.md) is unsupported.

### Technical
Smaller model means fewer migrations, fewer admin modules, less for a maintainer to hold in mind.

### SEO
`SlugHistory` is the mechanism that prevents URL changes silently destroying accumulated ranking.

### Security
`AdmissionEnquiry` is the sensitive table: role-restricted, access-logged, retention-bound, and **hard-deleted rather than soft-deleted**, because deletion there is a genuine privacy operation.

⚠️ `AuditLog` deliberately contains **no enquiry PII** — otherwise it becomes a second, less-protected copy of personal data.

### Accessibility
`MediaAsset.altText` is required before publish (AR-009).

### Child safety
`consentBasis` and `containsMinors` exist because the gallery contains minors ([48_MEDIA_CONSENT_AND_CHILD_SAFETY](../../../BLUEPRINT/48_MEDIA_CONSENT_AND_CHILD_SAFETY.md)).

### Migration
None — no database exists. Adding applications later remains additive.

## Files Changed
- `HISTORY/2026/08/CHANGE-0005-DATA-MODEL.md` (this file)

## Blueprint Documents Updated
[16_DATABASE_ARCHITECTURE](../../../BLUEPRINT/16_DATABASE_ARCHITECTURE.md) · [17_DATABASE_SCHEMA](../../../BLUEPRINT/17_DATABASE_SCHEMA.md) · [21_CONTENT_MODEL](../../../BLUEPRINT/21_CONTENT_MODEL.md) · [20_ADMIN_CMS](../../../BLUEPRINT/20_ADMIN_CMS.md) · [19_AUTHORIZATION_AND_ROLES](../../../BLUEPRINT/19_AUTHORIZATION_AND_ROLES.md)

## Related Changes
[ADR-0002](../../DECISIONS/ADR-0002-DATABASE.md) · [ADR-0003](../../DECISIONS/ADR-0003-ORM.md) · [ADR-0007](../../DECISIONS/ADR-0007-ADMISSIONS-SCOPE.md) · [CHANGE-0007](CHANGE-0007-REVIEW-CORRECTIONS.md)

## Follow-Up Work
1. Owner approval of PostgreSQL (OD-006) — implied by hosting, never explicitly confirmed
2. **School decides the enquiry retention period** (OD-011) — their data-protection obligation
3. Implement `schema.prisma` from this specification in Phase 4
4. Revisit News/Event categories if filtering demand appears

## Verification
Consistency audit asserts the 18-entity list is identical across documents 13, 17, 20, and 21, and that `ClassLevel` contains no `CLASS_11` or `CLASS_12`.

## Notes
The most easily overlooked entity is `SlugHistory`. It supports no visible feature and would never be requested — but without it, an editor tidying a headline silently breaks every link to that article that already exists in the world.
