# CHANGE-0008 — Approval Gate Preparation

## Date
2026-08-16

## Category
Process / Documentation

## Status
COMPLETED — **no architectural change; no decision promoted**

## Trigger
The project owner completed a three-batch audit of the full discovery output and instructed preparation for the architectural approval gate: an owner approval brief, a school asset request, and an explicit existing-website question. Implementation was explicitly forbidden.

## Previous State

51 blueprint documents. 22 architectural recommendations recorded in [49_DECISION_REGISTER](../../../BLUEPRINT/49_DECISION_REGISTER.md) §D-B with no mechanism for the owner to work through them systematically. School asset requirements were scattered across [39_OPEN_DECISIONS](../../../BLUEPRINT/39_OPEN_DECISIONS.md) OD-001 to OD-005 rather than presented as an actionable itemised request.

## New State

Two documents added. **No architecture changed. No recommendation promoted. No code written.**

| Document | Purpose |
|---|---|
| [50_OWNER_APPROVAL_BRIEF](../../../BLUEPRINT/50_OWNER_APPROVAL_BRIEF.md) | All 22 D-B recommendations in 13 groups, each with rationale, alternatives, advantages, risks, dependencies, rejection cost, confidence, and downstream impact. Plus a decision sheet. |
| [51_SCHOOL_ASSET_REQUEST](../../../BLUEPRINT/51_SCHOOL_ASSET_REQUEST.md) | 16 itemised sections split into launch-blocking (A) and deferrable (B). |

Blueprint document count: **51 → 53**.

## Consistency findings — reported, not fixed

The owner instructed that findings be reported before modification. **None were modified.** Verified directly against the repository:

| ID | Finding | Verdict |
|---|---|---|
| **CF-1** | `Facility` administration model contradictory across 5 documents. `EDITOR` is granted Facility CRUD in doc 19, but the only editing route is Settings, which is `SUPER_ADMIN`-only — **an editor holds a permission they cannot exercise** | **Confirmed. Genuine decision, not a typo.** Presented as Option A (Settings sub-resource) vs Option B (dedicated module) |
| **CF-2** | Neon assumed in 5 places before OD-008 is resolved | **Confirmed** — `00` L74, `01` L136, `13` L46/186–187/202 |
| **CF-3** | Cloudinary absent from the vendor-selection gate in `41_PENDING_WORK` §B-3 | **Confirmed** |
| **CF-4** | Stale entity count | **Confirmed, and narrower than feared** — exactly one line: `12_TECH_STACK` L91 reads "Sixteen entities". All other references across 13 files say 18 |
| **CF-5** | ADR-0010 reported missing by the owner's audit | **False positive.** `ADR-0010-RENDERING-CACHING.md` exists (7,425 bytes). All 10 ADRs present, linked, no orphans or duplicate IDs. It was not in the batch the owner was sent |
| **CF-6** | "81 pages" misleading as stakeholder framing | **Agreed.** Recommended split: 37 public content pages · 4 dynamic templates · 34 admin · 6 system |
| **CF-7** | "Most schools obtain blanket media consent at admission" stated without provenance in doc 48 | **Confirmed** — should be labelled a working assumption |

## Reason

Two problems needed solving before the approval gate could function.

**First**, 22 recommendations spread across 10 ADRs and 51 documents are not reviewable in that form. An owner cannot reasonably approve what they must reassemble themselves. The brief extracts the decision-making information — rationale, alternatives, cost of rejection — without reproducing the ADRs.

**Second**, R-01 (school assets never arrive) is the project's top risk and is entirely outside engineering control. The single most effective mitigation is an itemised, specific request rather than an open-ended one: "20–40 photographs of the following subjects" is actionable; "some photos" is not.

## Alternatives Considered

### Option A — Answer in conversation only
Rejected. The blueprint must survive without conversation memory ([99_CLAUDE_WORKING_RULES](../../../BLUEPRINT/99_CLAUDE_WORKING_RULES.md) rule 20). An approval brief that exists only in a chat log cannot be worked through, forwarded, or returned to.

### Option B — Fix the consistency findings first, then present
Rejected. The owner explicitly instructed reporting before modification, and CF-1 turned out to be a genuine decision rather than a defect — fixing it unilaterally would have been exactly the silent decision-making the governance system exists to prevent.

### Option C — Two documents plus a reported findings list *(selected)*

## Decision

Add documents 50 and 51. Report all seven consistency findings without modification. Promote nothing.

## Evidence

All findings verified by direct repository inspection during this task, not from memory:
- ADR file listing confirmed all 10 present
- Entity-count references grepped across all 69 files — exactly one stale occurrence
- Facility treatment traced across documents 03, 07, 15, 17, 19, 20
- Neon occurrences enumerated
- Vendor gate contents read directly

## Impact

### Product
None. Scope unchanged.

### Technical
None. No architecture altered.

### Development
The approval gate becomes actionable. CF-1 surfaces a real permission defect that would otherwise have reached implementation as an editor unable to use a granted permission.

### Documentation
Count 51 → 53. Indexes updated.

### Migration
None — nothing exists.

## Files Changed

Created:
- `BLUEPRINT/50_OWNER_APPROVAL_BRIEF.md`
- `BLUEPRINT/51_SCHOOL_ASSET_REQUEST.md`
- `HISTORY/2026/08/CHANGE-0008-APPROVAL-GATE-PREPARATION.md` (this file)

Updated (index maintenance only):
- `BLUEPRINT/00_MASTER_INDEX.md` — count, links, next actions, last change ID
- `BLUEPRINT/43_CURRENT_STATUS.md` — count, last change ID
- `HISTORY/00_HISTORY_INDEX.md` — this entry

**No application code. No git initialisation. No dependencies. No decision promoted.**

## Blueprint Documents Updated
Indexes only. **No content document was altered**, including the seven carrying consistency findings.

## Follow-Up Work

1. **Owner decides all 22 recommendations** plus OD-008 and CF-1 → [50_OWNER_APPROVAL_BRIEF](../../../BLUEPRINT/50_OWNER_APPROVAL_BRIEF.md)
2. On approval: promote statuses in [49_DECISION_REGISTER](../../../BLUEPRINT/49_DECISION_REGISTER.md), move ADRs `Proposed` → `Accepted`/`Rejected`, correct CF-1 to CF-4 and CF-7, record a HISTORY entry, update status and blueprint version
3. Send [51_SCHOOL_ASSET_REQUEST](../../../BLUEPRINT/51_SCHOOL_ASSET_REQUEST.md) to the school
4. ~~Owner answers: does the school already have a website?~~ ✅ **ANSWERED within this task — no existing website.** See addendum below

## Addendum — OD-007 resolved (2026-08-16)

The owner confirmed **the school has no existing website; this is its first**.

Recorded because it changes current-state truth, not because it promotes any recommendation.

**Consequences — all favourable:**
- No migration or SEO-preservation audit required
- No inherited URLs, no redirect mapping, no content extraction
- No accumulated ranking at risk from launch timing
- URL structure can be designed correctly the first time — the clean-slate advantage from [CHANGE-0001](CHANGE-0001-INITIAL-DISCOVERY.md) holds in full
- **Risk R-14 closed**

`SlugHistory` and the 301 machinery (D-B19) remain necessary regardless: they exist for slugs changed *after* launch, not for migrating a predecessor site.

**Documents updated:** [39_OPEN_DECISIONS](../../../BLUEPRINT/39_OPEN_DECISIONS.md) (OD-007 resolved; open count 24 → 23) · [40_RISKS_AND_MITIGATIONS](../../../BLUEPRINT/40_RISKS_AND_MITIGATIONS.md) (R-14 closed) · [43_CURRENT_STATUS](../../../BLUEPRINT/43_CURRENT_STATUS.md).

## Verification

- Repository confirmed to contain only `BLUEPRINT/` and `HISTORY/`; all 71 files markdown; no `package.json`, `node_modules`, `.git`, `src`, `app`, or `prisma`
- All 22 D-B recommendations from the register appear in the brief
- No decision status changed anywhere in the register
- Every consistency finding independently verified before being reported

## Notes

The most valuable output is **CF-1**. It is the one finding that is not a documentation defect: `EDITOR` holds a Facility permission with no route to exercise it. Two coherent resolutions exist and the choice depends on how often the school actually changes facility content — which is the school's knowledge, not the architect's. Deciding it silently would have been precisely the failure this governance system was built to prevent.

**CF-5 is worth recording as a correction in the other direction:** the owner's audit reported ADR-0010 as missing. It exists. The report was accurate about what they had been sent, and inaccurate about the repository — a useful reminder that the filesystem, not the conversation, is the source of truth.
