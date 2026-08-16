# 44 — Change Management

| Field | Value |
|---|---|
| **Status** | ACTIVE |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect |
| **Dependencies** | — |
| **Related Documents** | [99_CLAUDE_WORKING_RULES](99_CLAUDE_WORKING_RULES.md) · [49_DECISION_REGISTER](49_DECISION_REGISTER.md) · [43_CURRENT_STATUS](43_CURRENT_STATUS.md) |

---

## The three-way separation

| Artefact | Represents | Rule |
|---|---|---|
| **`BLUEPRINT/`** | Current truth | Never retains superseded information as though current |
| **`HISTORY/`** | Historical truth | Never rewritten to conceal a superseded decision |
| **Code** | Implementation | Must match the blueprint, or the divergence is recorded |

**These three must never contradict each other without the contradiction being detected and resolved.**

If the blueprint says PostgreSQL and the code uses MySQL, one of them is wrong. Finding out which — and recording the answer — is what this document exists for.

### Worked example
Suppose the ORM were changed from Prisma to Drizzle mid-project.

- `BLUEPRINT/12_TECH_STACK.md` says **Drizzle**. It does not say "we considered Prisma but switched" — that is history, not current state.
- `HISTORY/` gains a CHANGE entry and a superseding ADR recording the original Prisma decision, why it changed, what was considered, and the impact.
- `HISTORY/DECISIONS/ADR-0003` is marked `Superseded by ADR-00XX`. **It is not deleted or edited to say Drizzle.**

---

## Decision lifecycle

```
USER REQUIREMENT
      ↓
   RESEARCH          ← sourced, dated, tagged in 45_RESEARCH_SOURCES
      ↓
   OPTIONS           ← genuine alternatives, not strawmen
      ↓
 RECOMMENDATION      ← ARCHITECTURAL_RECOMMENDATION
      ↓
 USER APPROVAL       ← the gate that must not be skipped
      ↓
ACCEPTED DECISION    ← USER_APPROVED_DECISION; ADR moves to Accepted
      ↓
 BLUEPRINT UPDATE
      ↓
 IMPLEMENTATION      ← becomes IMPLEMENTATION_FACT once verified in code
      ↓
    TESTING
      ↓
 HISTORY ENTRY
      ↓
 STATUS UPDATE
```

> **A recommendation must never be silently promoted to an approved decision.** This was the most important correction of the review round ([CHANGE-0007](../HISTORY/2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md)), and it is the rule most easily eroded — usually by someone implementing a recommendation and thereby making it a fait accompli.

---

## Decision classification

Every decision carries one status. Full register in [49_DECISION_REGISTER](49_DECISION_REGISTER.md).

| Status | Meaning |
|---|---|
| `USER_REQUIREMENT` | Stated by the owner as a need |
| `USER_APPROVED_DECISION` | Explicitly chosen by the owner |
| `ARCHITECTURAL_RECOMMENDATION` | Proposed; **awaiting approval** |
| `PROVISIONAL_DECISION` | Placeholder pending a blocking input |
| `IMPLEMENTATION_FACT` | Verified true of actual code |
| `OPEN_DECISION` | Unresolved |
| `REJECTED` / `SUPERSEDED` | Set aside, reasoning retained |

---

## Blueprint versioning

Recorded in [00_MASTER_INDEX](00_MASTER_INDEX.md): `Blueprint Version` · `Status` · `Last Updated` · `Last Change ID` · `Current Phase`.

| Bump | When |
|---|---|
| **PATCH** (0.1.0 → 0.1.1) | Documentation correction, clarification, typo |
| **MINOR** (0.1.0 → 0.2.0) | Meaningful architecture or feature addition; a new document; a design system freeze |
| **MAJOR** (0.x → 1.0.0) | Major product or architecture change. **1.0.0 is reached at launch**, when the blueprint describes a real running system |

The version does **not** bump for every edit. `HISTORY/` is the authoritative detailed log; the version is a coarse signal of how much has changed since a reader last looked.

---

## The change protocol

For any meaningful change — architecture, product scope, data model, security posture, page structure, technology.

```
1. IDENTIFY   current state in the blueprint
2. RECORD     the old state verbatim, before editing
3. JUSTIFY    why the change is needed
4. EVALUATE   impact: product, UX, technical, performance,
              SEO, security, accessibility, development, migration
5. CHANGE     make it
6. UPDATE     every affected blueprint document — not just the obvious one
7. HISTORY    create the entry
8. STATUS     update 43_CURRENT_STATUS
9. INDEXES    update 00_MASTER_INDEX and 00_HISTORY_INDEX
10. VERIFY    run the consistency audit
```

Step 6 is the one most often done partially. A stack change touches [12_TECH_STACK](12_TECH_STACK.md), the relevant ADR, [13_SYSTEM_ARCHITECTURE](13_SYSTEM_ARCHITECTURE.md), [30_DEPLOYMENT](30_DEPLOYMENT.md), [35_ENVIRONMENT_CONFIGURATION](35_ENVIRONMENT_CONFIGURATION.md), and [49_DECISION_REGISTER](49_DECISION_REGISTER.md) — at minimum.

### What counts as "meaningful"

| Meaningful — needs the protocol | Not meaningful — just do it |
|---|---|
| Technology added, removed, or replaced | Fixing a typo |
| Entity or field added or removed | Renaming a local variable |
| Route added or removed | Adjusting spacing within the token system |
| Role or permission changed | Adding a test |
| Scope expanded or reduced | Updating a dependency patch version |
| Security or privacy posture changed | Refactoring without behaviour change |
| Design system frozen or re-themed | Fixing a broken link in a document |
| An open decision resolved | — |

---

## ID allocation

```
CHANGE-0001, CHANGE-0002, …    chronological change records
ADR-0001, ADR-0002, …          architecture decision records
OD-001, OD-002, …              open decisions
R-01, R-02, …                  risks
FR/NFR/AR/CR-nnn               requirements
```

**IDs are never reused, even if the item is deleted or rejected.** A rejected ADR keeps its number; the number tells a reader that something occupied that slot and can be found.

Currently allocated: CHANGE-0001 to CHANGE-0007 · ADR-0001 to ADR-0010.

---

## Drift detection

The blueprint decays silently once code diverges from it, and then becomes actively misleading — worse than no documentation, because it is trusted.

### When to check
Before starting significant work · before declaring a phase complete · at every milestone · whenever something feels inconsistent.

### What to check

| Check | Method |
|---|---|
| Routes in code == [07_SITE_MAP](07_SITE_MAP.md) | Compare `app/` tree to the route table |
| Entities in schema == [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) | Compare `schema.prisma` to the entity list |
| Dependencies == [12_TECH_STACK](12_TECH_STACK.md) | Compare `package.json` |
| Server Actions == [15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md) | Compare `lib/actions/` |
| Components == [11_UI_UX_SYSTEM](11_UI_UX_SYSTEM.md) inventory | Compare `components/` |
| Env vars == [35_ENVIRONMENT_CONFIGURATION](35_ENVIRONMENT_CONFIGURATION.md) | Compare `.env.example` |
| Roles == [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) | Compare the enum |

### Resolving drift
1. Determine which is right — code or blueprint
2. **If the code is right:** update the blueprint, create a HISTORY entry explaining why it happened
3. **If the blueprint is right:** fix the code
4. Either way, record it. Undocumented drift that gets silently normalised is how a blueprint becomes fiction

---

## Consistency audit

Run before declaring any phase complete.

**Directory invariant** — exactly `BLUEPRINT/` and `HISTORY/`; zero occurrences of variant spellings.

**Contradiction sweep** — these must appear zero times outside an explicit superseded/rejected note:
`MongoDB` · `MySQL` · `middleware.ts` · `Class 11` · `Class 12` · `senior secondary` · `stream` · `Drizzle` · `experimental.ppr` · `Prisma 6` · `queryCompiler` as a required flag · any pinned patch version stated as a requirement

**Cross-document invariants**
- Entity list identical across 17, 20, 21, 13
- Routes in 07 ↔ specifications in 08 — counts match exactly
- Role names identical across 19, 20, 28, 47
- Stack identical across 12, ADRs, 30, 35
- Every decision in 49 carries a valid status; **nothing owner-approved is misattributed and no recommendation is presented as an owner decision**
- Every requirement in 03 has a row in 46
- Every `[PLACEHOLDER]` appears in 39
- No orphan or duplicate CHANGE/ADR IDs
- Every link in 00 resolves

**Blueprint vs repository** — the tree contains only what the blueprint says it should.

---

## Pull request obligations

Every PR states: what changed · why · how it was tested · **which BLUEPRINT documents need updating** · whether a HISTORY entry is required.

A PR that changes architecture without a documentation update is incomplete, regardless of code quality.

---

## History is never rewritten

`HISTORY/` is append-oriented.

**Permitted:** adding entries · marking an ADR `Superseded by ADR-XXXX` · correcting a factual documentation error, **with the correction itself noted in the entry**.

**Not permitted:** deleting an entry · editing an entry to make a past decision look different · removing a record of a mistake.

> A superseded decision with its reasoning intact is one of the most valuable things in this repository. It tells a future engineer what was already tried, why it seemed right, and what changed — which is precisely the knowledge that is otherwise lost when people move on.
>
> [CHANGE-0006](../HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md) is an example: it records an error made during discovery, and the generalised policy that came out of it. Deleting it would remove the reasoning and leave only the rule.
