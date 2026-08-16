# History Index

| Field | Value |
|---|---|
| **Purpose** | Permanent record of how this project evolved |
| **Last Updated** | 2026-08-16 |
| **Entries** | 7 changes · 10 ADRs |

---

## What this directory is

`HISTORY/` is the project's **historical truth**. It records what changed, when, why, what was considered instead, and what the consequences were.

It is **append-oriented**. Entries are never deleted, and never rewritten to make a past decision look different from what it was.

> **`BLUEPRINT/` is current truth. `HISTORY/` is historical truth. Never mix them.**
>
> If the database changed from A to B, the blueprint says **B** — not "we considered A but switched". That belongs here.

Full protocol in [44_CHANGE_MANAGEMENT](../BLUEPRINT/44_CHANGE_MANAGEMENT.md).

---

## Change records

### 2026 / 08

| ID | Title | Category | Status |
|---|---|---|---|
| [CHANGE-0001](2026/08/CHANGE-0001-INITIAL-DISCOVERY.md) | Initial Repository Audit & Discovery Kickoff | Product / Architecture / Process | COMPLETED |
| [CHANGE-0002](2026/08/CHANGE-0002-STACK-RECOMMENDATION.md) | Technology Stack Recommendation | Architecture | COMPLETED *(recommendation only)* |
| [CHANGE-0003](2026/08/CHANGE-0003-IA-AND-SITEMAP.md) | Information Architecture and Route Table | UX / Product | COMPLETED |
| [CHANGE-0004](2026/08/CHANGE-0004-PROVISIONAL-DESIGN-SYSTEM.md) | Provisional Design System | UX / Design | COMPLETED *(provisional)* |
| [CHANGE-0005](2026/08/CHANGE-0005-DATA-MODEL.md) | Data Model | Database / Architecture | COMPLETED |
| [CHANGE-0006](2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md) | **Correction:** Prisma 6.16 Recommendation Superseded by Prisma 7 | Architecture / Documentation Correction | COMPLETED |
| [CHANGE-0007](2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md) | Discovery Plan Review: 24 Corrections Applied | Process / Architecture | COMPLETED |
| [CHANGE-0008](2026/08/CHANGE-0008-APPROVAL-GATE-PREPARATION.md) | Approval Gate Preparation | Process / Documentation | COMPLETED *(no decision promoted)* |
| [**CHANGE-0009**](2026/08/CHANGE-0009-ARCHITECTURE-APPROVAL.md) | **Owner Architecture Approval** — 22 recommendations approved | Architecture / Governance | COMPLETED *(approval only; no implementation)* |

**Next available ID: `CHANGE-0010`**

---

## Architecture Decision Records

| ID | Title | Status |
|---|---|---|
| [ADR-0001](DECISIONS/ADR-0001-FRAMEWORK.md) | Application Framework — Next.js App Router | **Accepted** ✅ |
| [ADR-0002](DECISIONS/ADR-0002-DATABASE.md) | Database Engine — PostgreSQL | **Accepted** ✅ |
| [ADR-0003](DECISIONS/ADR-0003-ORM.md) | ORM — Prisma, latest stable | **Accepted** ✅ |
| [ADR-0004](DECISIONS/ADR-0004-AUTH.md) | Authentication — admin-only, Auth.js | **Accepted** ✅ |
| [ADR-0005](DECISIONS/ADR-0005-MEDIA-STORAGE.md) | Media Storage — Cloudinary | **Accepted** ✅ |
| [ADR-0006](DECISIONS/ADR-0006-CMS.md) | Content Management — custom admin | **Accepted** ✅ |
| [ADR-0007](DECISIONS/ADR-0007-ADMISSIONS-SCOPE.md) | Admissions Scope — enquiry-only | **Accepted** ✅ |
| [ADR-0008](DECISIONS/ADR-0008-HOSTING.md) | Hosting — Vercel + **Neon** | **Accepted** ✅ |
| [ADR-0009](DECISIONS/ADR-0009-STYLING-UI.md) | Styling & Components — Tailwind + shadcn/ui | **Accepted** ✅ |
| [ADR-0010](DECISIONS/ADR-0010-RENDERING-CACHING.md) | Rendering, Data Access & Caching | **Accepted** ✅ |

**Next available ID: `ADR-0011`**

### All ten Accepted — 2026-08-16

ADR-0007 and ADR-0008 recorded owner decisions from discovery. The remaining eight were promoted from `Proposed` on explicit owner architecture approval ([CHANGE-0009](2026/08/CHANGE-0009-ARCHITECTURE-APPROVAL.md)).

An ADR moves to `Accepted` only on explicit owner approval — **never by being implemented**. Several carry owner conditions recorded in their status blocks; ADR-0003 in particular is approved *only* with the no-version-pinning constraint.

⚠️ **`Accepted` ≠ built.** The decision register records **zero implementation facts**. No code exists.

---

## Corrections on record

Two entries record errors made during discovery. Both are retained deliberately — the reasoning is more valuable than the tidy outcome.

| Entry | Error | What came out of it |
|---|---|---|
| [CHANGE-0006](2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md) | Recommended a superseded ORM generation with instructions to enable preview flags that no longer exist | A project-wide **version policy**: lock technology choices, never pin minor or patch versions |
| [CHANGE-0007](2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md) | Presented owner decisions and assistant recommendations under one heading, blurring provenance | The **decision classification taxonomy** and [49_DECISION_REGISTER](../BLUEPRINT/49_DECISION_REGISTER.md) |

> Deleting either would remove a rule's reasoning and leave only the rule. A superseded decision with its argument intact tells a future engineer what was already tried and why it seemed right — precisely the knowledge otherwise lost when people move on.

---

## Reading paths

**"Why is the stack this way?"** → CHANGE-0002 → the relevant ADR

**"Why is admissions only an enquiry form?"** → [ADR-0007](DECISIONS/ADR-0007-ADMISSIONS-SCOPE.md)

**"Why is the navigation structured like this?"** → [CHANGE-0003](2026/08/CHANGE-0003-IA-AND-SITEMAP.md)

**"Why is the design system provisional?"** → [CHANGE-0004](2026/08/CHANGE-0004-PROVISIONAL-DESIGN-SYSTEM.md)

**"Why isn't there an `Application` table?"** → [CHANGE-0005](2026/08/CHANGE-0005-DATA-MODEL.md) → [ADR-0007](DECISIONS/ADR-0007-ADMISSIONS-SCOPE.md)

**"What was the project's starting state?"** → [CHANGE-0001](2026/08/CHANGE-0001-INITIAL-DISCOVERY.md)

**"Has anything here been got wrong before?"** → CHANGE-0006, CHANGE-0007

---

## Rules

1. **Never delete an entry.**
2. **Never rewrite history** to conceal a superseded decision or a mistake.
3. **Mark superseded ADRs** as `Superseded by ADR-XXXX`; do not edit their content.
4. **Never reuse an ID**, even for a rejected or withdrawn item.
5. **Correct factual documentation errors** by noting the correction within the entry, not by silently editing.
6. **Add an entry for every meaningful change** — architecture, scope, data model, security posture, routes, technology.
7. **Update this index** whenever an entry is added.

---

## Structure

```
HISTORY/
├── 00_HISTORY_INDEX.md          this file
├── 2026/08/                     CHANGE-0001 … CHANGE-0007
└── DECISIONS/                   ADR-0001 … ADR-0010
```

Change records are filed by year and month. ADRs are flat, since they are referenced by number rather than by date.
