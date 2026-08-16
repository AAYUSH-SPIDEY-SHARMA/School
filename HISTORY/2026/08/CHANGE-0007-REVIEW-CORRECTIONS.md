# CHANGE-0007 — Discovery Plan Review: 24 Corrections Applied

## Date
2026-08-16

## Category
Process / Architecture / Documentation

## Status
COMPLETED

## Trigger
The project owner reviewed the proposed discovery plan in detail and returned a structured critique: the overall direction was approved, but the blueprint was explicitly **not** to be treated as final or frozen. Twenty-four corrections were issued. This entry records what changed and why, so the reasoning behind the blueprint's governance structure is traceable.

## Previous State

Discovery plan revision 1. Directionally sound, but with four structural weaknesses:

1. **Decision provenance was blurred.** The plan opened with "Decisions locked from your answers" and immediately listed a full technology stack underneath — mixing four choices the owner actually made with a dozen recommendations the assistant had generated. A reader could not tell which was which.
2. **Versions were pinned.** "Next.js 16.3", "Prisma 6.16+" — see [CHANGE-0006](CHANGE-0006-PRISMA-VERSION-CORRECTION.md).
3. **Child-safety was absent.** Media handling was filed under generic storage concerns. For a school website whose galleries contain photographs of minors, this was a material omission.
4. **No traceability model.** Nothing connected a requirement to the decision that served it, the document that specified it, and the test that would verify it.

## New State

### 1. Decision classification — the structural change that matters most

Every decision in the blueprint now carries an explicit status:

| Status | Meaning |
|---|---|
| `USER_REQUIREMENT` | Stated by the owner as a need |
| `USER_APPROVED_DECISION` | Explicitly chosen by the owner |
| `ARCHITECTURAL_RECOMMENDATION` | Proposed by the assistant; **awaiting approval** |
| `PROVISIONAL_DECISION` | Placeholder pending a blocking input |
| `IMPLEMENTATION_FACT` | Verified true of actual code |
| `OPEN_DECISION` | Unresolved |
| `REJECTED` / `SUPERSEDED` | Set aside, reasoning retained |

Assistant recommendations may never be silently promoted to owner decisions. ADRs open with `Status: Proposed`, not `Accepted`.

Notably, **PostgreSQL was demoted** from an implied decision to `ARCHITECTURAL_RECOMMENDATION`. The owner's hosting choice (Neon/Supabase) strongly implies Postgres, but the engine was never explicitly approved, so the implication is flagged rather than assumed.

### 2. Blueprint versioning
`00_MASTER_INDEX.md` carries `Blueprint Version`, `Status`, `Last Updated`, `Last Change ID`, `Current Phase`. Discovery exits at **0.1.0 / DISCOVERY**. PATCH = documentation correction, MINOR = architecture addition, MAJOR = product/architecture change. HISTORY remains the authoritative detailed log; the version does not bump for trivial edits.

### 3. Version policy
Covered in [CHANGE-0006](CHANGE-0006-PRISMA-VERSION-CORRECTION.md).

### 4. Four new blueprint documents
- `46_TRACEABILITY_MATRIX.md` — Requirement → Decision → Document → Implementation area → Test
- `47_CONTENT_GOVERNANCE.md` — publishing rights, draft/review/publish states, content freshness
- `48_MEDIA_CONSENT_AND_CHILD_SAFETY.md` — consent, EXIF stripping, takedown, public vs restricted media
- `49_DECISION_REGISTER.md` — every decision with its classification

No other documents were added. The owner explicitly warned against documentation volume for its own sake.

### 5. Substantive specification changes

| Area | Change |
|---|---|
| Admissions | Enquiry lifecycle fully specified: `NEW → CONTACTED → IN_PROGRESS → RESOLVED → CLOSED`, with validation, spam protection, notification, ownership, audit trail, PII retention |
| SEO | Split into entity-level SEO fields **and** global SEO configuration — previously conflated |
| URLs | Slug history, 301 redirects from retired slugs, canonical policy |
| Homepage | Ordered by parent journey and conversion hierarchy, with performance engineered around it — reversing the earlier framing that cut sections for LCP reasons |
| Database | Every entity documents why it exists; News/Event categories classified `MVP`/`OPTIONAL`/`FUTURE` rather than rejected outright |
| Auth | Requirement locked (admin-only, secure sessions, role authorisation, no public accounts); library remains a recommendation |
| Research | Findings tagged `OBSERVATION` / `EVIDENCE` / `RECOMMENDATION` / `DECISION`; visual inspiration never counts as proof |
| Accessibility | Explicit boundary: documented requirements ≠ verified compliance |
| Performance | Core Web Vitals as the framework; Lighthouse figures are goals, not guarantees |
| Observability | Split into application logs / audit logs / metrics / alerts |
| Backup | Separates creation, retention, verification, **restore testing**, disaster recovery |

### 6. Anti-padding rule
Where a topic is genuinely premature, the document states `NOT_STARTED` / `NOT_APPLICABLE` / `TO_BE_DEFINED` with a one-line reason. `33_MONITORING_AND_LOGGING`, `34_BACKUP_AND_RECOVERY`, and `42_COMPLETED_WORK` are deliberately short — nothing is deployed and nothing is built.

## Reason

The owner's core objection was that a document set of this size fails in a specific way: it starts to read as authoritative regardless of how well-founded any individual claim is. Fifty markdown files carry an implicit weight that can disguise the difference between "you told me this", "I researched this", "I am guessing this", and "nobody has decided this yet".

The decision classification, the traceability matrix, and the research quality model all exist to hold that line.

## Alternatives Considered

### Option A — Apply corrections silently
Rejected. The reasoning behind the governance structure would be invisible to anyone reading later, and the corrections would look like they had always been the plan.

### Option B — Apply a subset, argue the rest
Rejected. All twenty-four corrections were either factually right or defensible improvements. No grounds to push back.

### Option C — Apply all corrections and record the round *(selected)*

## Decision

Apply all 24 corrections. Record this entry. Proceed to blueprint generation with the blueprint explicitly unfrozen at version 0.1.0.

## Evidence

- Owner review issued 2026-08-16, 24 numbered corrections.
- Prisma 7 stability independently verified against official release notes (see CHANGE-0006).
- The reported `UEPRINT/` directory-name typo was investigated by grep against the plan file: all three occurrences were correctly `BLUEPRINT/`. The corruption was a terminal rendering artefact, not a content error. The invariant was added to the consistency audit regardless, since asserting it costs nothing.

## Impact

### Product
Scope unchanged. Confidence framing substantially changed — most of the stack is now openly provisional.

### UX
Homepage design rationale re-anchored on parent journey rather than performance budget. Parent-behaviour research added as a distinct input to personas, journeys, and IA.

### Technical
No architecture reversed. Prisma reinforced. Auth library loosened to a recommendation.

### Performance
Framing corrected from Lighthouse-score targets to Core Web Vitals, measurable only against a built site.

### SEO
Materially strengthened: global SEO configuration and slug-history/301 handling were both missing.

### Security
Materially strengthened: child-safety and media-consent handling was a genuine gap for a school website, and PII retention/deletion for enquiry data is now explicit.

### Accessibility
Unchanged in target (WCAG 2.2 AA); strengthened in honesty — documentation is no longer permitted to imply compliance.

### Development
Traceability matrix makes it possible to answer "is this requirement actually built and tested?" — previously unanswerable.

## Files Changed

- `HISTORY/2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md` (this file)

## Blueprint Documents Updated

All 50. The corrections are structural and apply across the document set. Specifically created as a result of this review: `46_TRACEABILITY_MATRIX.md`, `47_CONTENT_GOVERNANCE.md`, `48_MEDIA_CONSENT_AND_CHILD_SAFETY.md`, `49_DECISION_REGISTER.md`.

## Related Changes

- [CHANGE-0001](CHANGE-0001-INITIAL-DISCOVERY.md) — origin state
- [CHANGE-0006](CHANGE-0006-PRISMA-VERSION-CORRECTION.md) — version policy, issued as part of this review

## Follow-Up Work

1. Owner approval is required to promote any `ARCHITECTURAL_RECOMMENDATION` to `USER_APPROVED_DECISION`. Until then the stack is proposed, not settled.
2. School identity assets remain the top blocking input.
3. The `OPEN_DECISION` on whether content requires review-before-publish needs the owner's input on how many staff will hold editor access.

## Verification

- Consistency audit asserts every decision in `49_DECISION_REGISTER.md` carries a valid status.
- Audit asserts nothing owner-approved is misattributed and no assistant recommendation is presented as an owner decision.
- Audit asserts every requirement in `03_REQUIREMENTS.md` has a row in `46_TRACEABILITY_MATRIX.md`.

## Notes

The most valuable correction was the one about provenance. Everything else in this entry is a specification improvement; that one is a safeguard against the document set quietly acquiring more authority than it has earned.
