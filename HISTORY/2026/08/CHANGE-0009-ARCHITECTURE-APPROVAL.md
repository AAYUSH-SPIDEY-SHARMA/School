# CHANGE-0009 — Owner Architecture Approval

## Date
2026-08-16

## Category
Architecture / Governance

## Status
COMPLETED — **approval recorded; no implementation**

## Trigger
The project owner completed review of the discovery output, blueprint, ADRs, and [50_OWNER_APPROVAL_BRIEF](../../../BLUEPRINT/50_OWNER_APPROVAL_BRIEF.md), and issued an explicit architecture approval covering all 22 recommendations, the open database-provider sub-decision, and the Facility consistency decision.

## Previous State

**Blueprint version 0.1.0.**

| | |
|---|---|
| `USER_APPROVED_DECISION` | 4 (scope only) |
| `ARCHITECTURAL_RECOMMENDATION` | **22** |
| `IMPLEMENTATION_FACT` | 0 |
| ADRs `Proposed` | 8 of 10 |
| Open decisions | 23 |
| Blocking gates | 2 — stack approval, school assets |

PostgreSQL was implied by the approved hosting choice but never explicitly approved. Database provider unresolved. Four consistency defects reported but deliberately unfixed pending owner instruction.

## New State

**Blueprint version 0.2.0.**

| | |
|---|---|
| `USER_APPROVED_DECISION` | **26** (4 scope + 22 architecture) |
| `ARCHITECTURAL_RECOMMENDATION` | **0** |
| **`IMPLEMENTATION_FACT`** | **0** — unchanged, and the point |
| ADRs `Accepted` | **10 of 10** |
| Open decisions | **20** — all school-dependent or vendor detail |
| Blocking gates | **1** — school assets only |

### Approved stack
Next.js 16.x App Router · TypeScript strict · Tailwind 4 + shadcn/ui on Radix · Server Components + Server Actions with **no general REST/GraphQL/tRPC API** · **PostgreSQL on Neon** · Prisma (latest stable at implementation) · Auth.js Credentials with DB sessions and argon2id · Cloudinary · Vercel · privacy-focused cookieless analytics.

### New decision IDs
- **D-A3a** — Neon selected as database provider (resolves OD-008)
- **D-B23** — Facility administered as a Settings sub-resource, `SUPER_ADMIN` only (resolves CF-1)
- **D-E19 to D-E24** — explicit rejections: public accounts, payments, full applications, Supabase, Drizzle, non-Postgres engines

### Owner-locked security rules
Fifteen rules (A–O) locked regardless of any future library change, recorded in [49_DECISION_REGISTER](../../../BLUEPRINT/49_DECISION_REGISTER.md).

## Reason

Twenty-two recommendations built on research and reasoning had reached the limit of what could be settled without the owner. Proceeding to implementation on unapproved recommendations would have created a fait accompli — the exact failure the decision-classification system exists to prevent.

The approval also resolved three questions that engineering could not decide alone: the database engine (previously implied, never stated), the provider choice, and the Facility administration model — which turned out to be a genuine design decision rather than a documentation defect.

## Alternatives Considered

### Option A — Treat implication as approval
Rejected. PostgreSQL was *strongly* implied by the hosting choice, and it would have been easy to record it as settled. Doing so would have promoted an inference into a decision without the owner ever saying it — precisely what rule 8 of [99_CLAUDE_WORKING_RULES](../../../BLUEPRINT/99_CLAUDE_WORKING_RULES.md) forbids.

### Option B — Approve and begin implementation immediately
Rejected. The owner explicitly gated implementation behind a separate instruction, and the approval message repeated that gate three times.

### Option C — Record approval, apply consistency fixes, stop *(selected)*

## Decision

Promote all 22 recommendations to `USER_APPROVED_DECISION`, resolve OD-006/OD-008/OD-012, move all ADRs to `Accepted`, apply the six approved consistency corrections, and **stop before implementation**.

## Consistency corrections applied

| ID | Correction |
|---|---|
| **CF-1** | **Real permission defect resolved.** `EDITOR` had been granted Facility create/edit/delete while the only editing route was `SUPER_ADMIN`-only Settings — a permission with no route to exercise it. Owner chose Option A: Settings sub-resource, `SUPER_ADMIN` only, `updateFacilities` action added, `EDITOR` Facility rights removed. Touched docs 03, 15, 19, 20 |
| **CF-2** | Neon selected; provisional provider language resolved in docs 00, 01, 13 |
| **CF-3** | Cloudinary added to the vendor-selection gate in doc 41, alongside the now-resolved database and analytics selections |
| **CF-4** | Single stale reference corrected — `12_TECH_STACK` L91 "Sixteen entities" → "Eighteen entities" |
| **CF-5** | ⚠️ **No action — false positive.** ADR-0010 exists and always did. Not recreated or duplicated; moved `Proposed` → `Accepted` |
| **CF-6** | Stakeholder terminology added to docs 01 and 07: **37 public content pages + 4 dynamic templates**, not "81 pages". The 81 route-pattern figure retained as an internal count |
| **CF-7** | Consent statement in doc 48 relabelled as an explicit **working assumption**, not evidence about this school, with a pointer to the outstanding question in the asset request |

## Evidence

- Owner architecture approval message, 2026-08-16, with per-decision amendments
- All findings independently verified against the repository before correction: ADR file listing, entity-count grep across all files, Facility treatment traced across six documents, Neon occurrences enumerated, vendor gate contents read directly

## Impact

### Product
Scope unchanged. Every product decision now carries explicit owner authority.

### UX
Navigation, homepage, News/Notices separation, Safety and Transport pages all confirmed. Owner reinforced that **no safety claim may be invented** — if the school provides no evidence, the claim is omitted.

### Technical
Architecture confirmed and now stable. Deviation requires a new ADR plus owner approval. Facility permission defect eliminated before it could reach code.

### Performance
Unchanged. No-carousel-hero constraint confirmed at owner level.

### SEO
Unchanged. Slug history and 301 handling explicitly confirmed as **post-launch URL preservation**, not predecessor-site migration — a distinction the owner called out directly.

### Security
Strengthened. Fifteen security rules locked at owner level, above any library choice. The Facility correction removed a live authorisation inconsistency.

### Accessibility
Reinforced: accessibility takes priority over the provisional palette, owner-confirmed.

### Development
Gate A cleared. Phases 1–3 are unblocked — **though not authorised to start without a further explicit instruction.**

### Migration
None. Nothing exists.

## Files Changed

**Blueprint (15):** `00_MASTER_INDEX` · `01_PROJECT_OVERVIEW` · `03_REQUIREMENTS` · `07_SITE_MAP` · `12_TECH_STACK` · `13_SYSTEM_ARCHITECTURE` · `15_BACKEND_ARCHITECTURE` · `19_AUTHORIZATION_AND_ROLES` · `20_ADMIN_CMS` · `38_MILESTONES` · `39_OPEN_DECISIONS` · `41_PENDING_WORK` · `43_CURRENT_STATUS` · `48_MEDIA_CONSENT_AND_CHILD_SAFETY` · `49_DECISION_REGISTER` · `50_OWNER_APPROVAL_BRIEF`

**ADRs (9):** ADR-0001 to ADR-0006 and ADR-0009, ADR-0010 moved `Proposed` → `Accepted`; ADR-0008 sub-decision resolved to Neon.

**History (2):** this entry · `00_HISTORY_INDEX`

**Not changed:** no application code, no `package.json`, no git initialisation, no dependencies, no Prisma schema, no database.

## Related Changes

- Supersedes the recommendation status of [CHANGE-0002](CHANGE-0002-STACK-RECOMMENDATION.md)
- Fulfils the follow-up work from [CHANGE-0008](CHANGE-0008-APPROVAL-GATE-PREPARATION.md)
- Honours the version policy from [CHANGE-0006](CHANGE-0006-PRISMA-VERSION-CORRECTION.md) — no minor/patch pinned despite approval
- Applies the classification discipline from [CHANGE-0007](CHANGE-0007-REVIEW-CORRECTIONS.md)

## Note on OD-007 — a conflict raised and resolved

The owner's approval message §8 stated *"Do NOT assume the school has no existing website"*, which conflicted with their earlier direct answer that the school has none, on the basis of which OD-007 had been resolved and risk R-14 closed.

The conflict was **surfaced rather than silently resolved**, and the owner then confirmed within the same exchange: **the school has no existing website.** OD-007 therefore remains `RESOLVED` and R-14 remains closed.

The standing instruction not to invent or guess a predecessor URL remains in force. If a URL is supplied later, a migration and SEO-preservation audit is required before launch.

## Follow-Up Work

1. **Send [51_SCHOOL_ASSET_REQUEST](../../../BLUEPRINT/51_SCHOOL_ASSET_REQUEST.md) to the school** — now the critical path (R-01)
2. Select email provider (OD-014) and error monitoring (OD-016)
3. School decides enquiry retention period (OD-011) and fee publication (OD-010)
4. **Phase 1 awaits explicit owner instruction.** First step unchanged: re-verify current stable versions before installing anything
5. Record exact installed versions as `IMPLEMENTATION_FACT` entries once anything is actually installed

## Verification

- Repository confirmed to contain only `BLUEPRINT/` and `HISTORY/`; all files markdown; no `package.json`, `node_modules`, `.git`, `src`, `app`, or `prisma`
- All 22 D-B recommendations promoted; zero `ARCHITECTURAL_RECOMMENDATION` remain
- Zero `IMPLEMENTATION_FACT` entries created
- All 10 ADRs `Accepted`; ADR-0010 not duplicated
- Facility permissions consistent across docs 03, 15, 17, 19, 20
- Entity count 18 everywhere; no "Sixteen entities" remaining
- Full consistency audit run — results in the approval report

## Notes

The line worth preserving from this round is the distinction between **approval and implementation**. Twenty-six decisions are now approved and zero lines of code exist. It would be easy — and wrong — for a future session to read "APPROVED" and infer that something was built.

The most valuable single outcome was **CF-1**. It was surfaced by owner review as a documentation inconsistency, and investigation showed it was a genuine authorisation defect: a role holding a permission with no route to exercise it. Had it reached implementation, it would have manifested as an editor clicking into Settings and being denied — or, worse, as someone "fixing" it by widening Settings access to `EDITOR`, quietly granting content editors access to global site configuration.
