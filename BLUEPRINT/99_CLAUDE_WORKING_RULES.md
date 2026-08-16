# 99 — Working Rules for Future Sessions

| Field | Value |
|---|---|
| **Status** | ACTIVE |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect |
| **Dependencies** | — |
| **Related Documents** | [00_MASTER_INDEX](00_MASTER_INDEX.md) · [43_CURRENT_STATUS](43_CURRENT_STATUS.md) · [44_CHANGE_MANAGEMENT](44_CHANGE_MANAGEMENT.md) |

---

## Read this before doing anything

**Assume no conversation memory exists.** Every session starts cold. The filesystem is the only continuity — if something is not written down here, it did not happen.

---

## Session start protocol

Whenever you are asked to "continue the project" or anything similar:

```
1. Read  BLUEPRINT/00_MASTER_INDEX.md      — orientation
2. Read  BLUEPRINT/43_CURRENT_STATUS.md    — what is actually true now
3. Read  BLUEPRINT/41_PENDING_WORK.md      — what is next
4. Read  BLUEPRINT/39_OPEN_DECISIONS.md    — what is unresolved
5. Read  BLUEPRINT/49_DECISION_REGISTER.md — what is approved vs merely proposed
6. Read  the specific documents relevant to the task
7. INSPECT the actual repository state
8. COMPARE documented state against reality
9. REPORT any drift found — do not silently absorb it
10. CONTINUE from the true state, not the documented one
```

Step 7 is the one most easily skipped and the most important. **The blueprint describes intent; the repository describes reality.** When they disagree, reality wins and the blueprint gets corrected.

Check `HISTORY/` when you need to know *why* something is the way it is — particularly before proposing to change it.

---

## The twenty rules

### Documentation

**1. `BLUEPRINT/` is current truth.** It describes what is *currently* decided, planned, and built. It never retains superseded information as though it were current.

**2. `HISTORY/` is historical truth.** Append-oriented. Never rewritten to conceal a superseded decision or a mistake.

**3. Never mix them.** If the database changed from A to B, the blueprint says **B** — not "we considered A but switched". That belongs in HISTORY.

**4. Record meaningful changes.** Architecture, scope, data model, security posture, routes, technology. Use the protocol in [44_CHANGE_MANAGEMENT](44_CHANGE_MANAGEMENT.md).

**5. Update every affected document, not just the obvious one.** A stack change touches [12_TECH_STACK](12_TECH_STACK.md), an ADR, [13_SYSTEM_ARCHITECTURE](13_SYSTEM_ARCHITECTURE.md), [30_DEPLOYMENT](30_DEPLOYMENT.md), [35_ENVIRONMENT_CONFIGURATION](35_ENVIRONMENT_CONFIGURATION.md), and [49_DECISION_REGISTER](49_DECISION_REGISTER.md) at minimum.

**6. Do not delete documentation for being verbose.** Length is not a defect. Padding is — but so is deleting reasoning someone will need later.

**7. Update status after completing work.** [43_CURRENT_STATUS](43_CURRENT_STATUS.md), [41_PENDING_WORK](41_PENDING_WORK.md), [42_COMPLETED_WORK](42_COMPLETED_WORK.md).

### Decisions

**8. Never silently promote a recommendation to an approved decision.** This is the most important rule in this file. Twenty-two items in [49_DECISION_REGISTER](49_DECISION_REGISTER.md) are `ARCHITECTURAL_RECOMMENDATION` — proposed, not approved. Implementing one does not approve it; it creates a fait accompli, which is worse.

**9. Never silently introduce a major technology.** New dependency of consequence → ADR → owner approval.

**10. Never overwrite an architecture decision without reading its ADR first.** The reasoning is there. Disagree with it explicitly if you disagree.

**11. Flag unresolved decisions.** Add to [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) rather than guessing. Where a default is needed to proceed, state it as a recommendation with reasoning — never as a settled fact.

### Integrity

**12. Never fabricate school information.** No invented statistics, results, accreditations, testimonials, fees, or contact details. Use `[PLACEHOLDER]` tokens. A false board-result figure on a real school's website is a misrepresentation to families choosing a school — not a design placeholder.

**13. Never claim unverified compliance.** "We are designing for WCAG 2.2 AA" is true. "The site is accessible" requires testing that has been done and recorded. The same applies to performance, security, and backup recovery.

**14. Record failures honestly.** A failed test, a fetch that returned 403, a checklist item that did not pass — these go in the record. A document that omits its failures overstates its own coverage.

### Engineering

**15. Prefer simple architecture.** Every service added is one the school must fund, understand, and operate — possibly after whoever built it has moved on. New infrastructure needs a measured problem and an ADR. The rejection lists in [12_TECH_STACK](12_TECH_STACK.md) and [49_DECISION_REGISTER](49_DECISION_REGISTER.md) §D-E are decisions, not oversights.

**16. Prioritise security, accessibility, SEO, performance, maintainability.** When these conflict with aesthetics or convenience, they win. When they conflict with each other, the tie-break order is: **safety of children → security of personal data → accessibility → performance → SEO → aesthetics.**

**17. Verify implementation against the blueprint.** Before declaring work complete, check that what was built matches what was specified — or update the specification and say why.

**18. Run the consistency audit before declaring a phase complete.** Procedure in [44_CHANGE_MANAGEMENT](44_CHANGE_MANAGEMENT.md).

**19. Never pin minor or patch versions in the blueprint.** Lock technology *choices*. Re-verify current stable versions before installing anything. This rule exists because an earlier draft recommended a superseded ORM generation with instructions to enable flags that no longer exist ([CHANGE-0006](../HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md)).

**20. Leave the project resumable.** Another engineer — or another session — must be able to continue from the filesystem alone. If you learned something that is not written down, write it down before you finish.

---

## Hard invariants

Violating any of these is a defect, not a judgement call. The consistency audit checks for them.

| Invariant | Detail |
|---|---|
| **Nursery–Class 10 only** | No `Class 11`, `Class 12`, streams, or senior secondary anywhere — routes, enums, page content, dropdowns |
| **`proxy.ts`, not `middleware.ts`** | Required in the Next.js 16.x line |
| **Server Actions authorise themselves** | The route guard is **not** the security boundary. Every action authenticates and authorises independently |
| **`EDITOR` cannot reach enquiry data** | By any route. Enquiries contain personal data about parents and minors |
| **Audit log contains no enquiry PII** | Records *that* an enquiry changed, never the parent's details |
| **EXIF stripped from every upload** | No exception, no opt-out |
| **Alt text never names a child** | It is machine-readable and indexable |
| **Enquiry failure never silent** | Phone fallback shown, values preserved, alert raised |
| **No fabricated school data** | Placeholders are visually obvious |
| **Draft content filtered at the query layer** | Never merely hidden in the UI |
| **Exactly `BLUEPRINT/` and `HISTORY/`** | No variant spellings |

---

## Common mistakes to avoid

Written from the errors actually made during discovery.

| Mistake | Correct approach |
|---|---|
| Pinning a patch version because it was current when researched | Lock the choice; re-verify versions at implementation |
| Listing owner answers and assistant proposals under one heading | Classify every decision in [49_DECISION_REGISTER](49_DECISION_REGISTER.md) |
| Treating "we documented WCAG" as "the site is accessible" | Documented ≠ verified |
| Filing media handling as a storage concern | A school gallery contains minors — it is a safeguarding concern |
| Rejecting a feature outright when the answer is "not yet" | Classify `OPTIONAL` / `FUTURE` with the evidence that would change it |
| Adding a document to look thorough | Padding is worse than a short honest document |
| Quietly editing a mistake away | Record the correction; the reasoning is the valuable part |

---

## When you disagree with the blueprint

You may well be right — most of it is proposed, not proven.

1. Read the relevant document and its ADR. Understand why it says what it says
2. State the disagreement explicitly, with reasoning
3. If it is a `USER_APPROVED_DECISION`, **ask the owner** — do not override it
4. If it is an `ARCHITECTURAL_RECOMMENDATION`, propose the alternative with a comparison
5. If accepted: update the blueprint, supersede the ADR, write a HISTORY entry
6. Never change direction silently

---

## Scope discipline

**Do not build beyond what is asked.** [03_REQUIREMENTS](03_REQUIREMENTS.md) classifies everything. `FUTURE` means not now, and `NOT_RECOMMENDED` means there is a reason — read it before overriding.

Particular vigilance on **R-07, scope creep toward a full application system**. Adding parent accounts and document upload brings identity documents about minors, account recovery flows, and a materially larger privacy obligation. It requires an ADR that states those obligations explicitly ([23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md)).

---

## Current state, in one line

**Discovery complete. Nothing built. Two blocking gates: stack approval and school identity assets.**

Full detail in [43_CURRENT_STATUS](43_CURRENT_STATUS.md).
