# 00 — Master Index

| Field | Value |
|---|---|
| **Blueprint Version** | **0.2.0** |
| **Status** | ARCHITECTURE APPROVED |
| **Last Updated** | 2026-08-16 |
| **Last Change ID** | CHANGE-0009 |
| **Current Phase** | Phase 0 complete · architecture approved · **implementation not started** |

> **Start here.** This is the entry point for every future session and every new engineer.
> Read this, then [43_CURRENT_STATUS](43_CURRENT_STATUS.md), then [99_CLAUDE_WORKING_RULES](99_CLAUDE_WORKING_RULES.md).

---

## The project in five lines

A production-grade public website and lightweight CMS for **[SCHOOL_NAME]**, a CBSE school serving **Nursery to Class 10**.
Three layers: public site · admission enquiry system · admin CMS for school staff.
The school is real; its identity has not been supplied, so **every school-specific fact is a `[PLACEHOLDER]`**.
**Nothing is built.** The repository contains only `BLUEPRINT/` and `HISTORY/`.
**The blueprint is not frozen** — most of it awaits owner approval.

---

## ⚠️ Three things to know before reading anything else

**1. The architecture is approved. Nothing is built.**
26 decisions are owner-approved. **Zero are implementation facts.** Approval authorises a build; it does not constitute one. [49_DECISION_REGISTER](49_DECISION_REGISTER.md) is the authority on what is settled — and it records that no code exists.

**2. Nothing is fabricated.**
No invented statistics, results, fees, testimonials, or contact details. Placeholders are visually obvious. A false board-result figure on a real school's website is a misrepresentation to families choosing a school, not a design placeholder.

**3. Documented ≠ verified.**
This blueprint *targets* WCAG 2.2 AA and *targets* Core Web Vitals thresholds. Nothing has been tested, because nothing exists. Do not restate targets as achievements.

---

## Current status

| | |
|---|---|
| Documents | 53 blueprint · 9 change records · 10 ADRs |
| Application code | **None** |
| Git repository | **Not initialised** |
| Owner-approved decisions | **26** |
| Awaiting approval | **0** |
| **Implementation facts** | **0** |
| Open decisions | **20** — all school-dependent or vendor detail |
| Milestones complete | **2 of 11** |
| Blocking gates | **1** |

~~**Gate A — stack approval**~~ ✅ **CLEARED 2026-08-16.**
**Gate B — school identity and photography** (OD-001 to OD-005) still blocks design finalisation and launch.

Detail: [43_CURRENT_STATUS](43_CURRENT_STATUS.md)

---

## Architecture summary

One Next.js application, server-rendered, backed by one Postgres database and one media CDN.

```
Parent / Visitor              School Staff
      │                            │
      ▼                            ▼
┌─────────────────────────────────────────┐
│         Next.js  (Vercel)               │
│  Public routes  │  /admin (protected)   │
│  Server Components + Server Actions     │
└──────────┬───────────────┬──────────────┘
           ▼               ▼
    PostgreSQL        Cloudinary
      (Neon)          (media CDN)
```

**Deliberately not built:** microservices · Kubernetes · Redis · GraphQL · a separate backend · a headless CMS · a public REST API. Each rejection is argued, not assumed ([49_DECISION_REGISTER](49_DECISION_REGISTER.md) §D-E).

---

## Approved stack ✅

All owner-approved 2026-08-16.

| Layer | Choice |
|---|---|
| Framework | Next.js 16.x, App Router |
| Language | TypeScript, strict |
| Styling | Tailwind CSS 4.x |
| Components | shadcn/ui on Radix |
| Data access | Server Components + Server Actions · **no general REST/GraphQL/tRPC API** |
| Database | **PostgreSQL** |
| Database provider | **Neon** |
| ORM | Prisma, latest stable at implementation |
| Auth | Auth.js, Credentials, DB sessions, argon2id · admin-only |
| Media | Cloudinary |
| Hosting | Vercel |
| Analytics | Privacy-focused cookieless + Search Console |
| Admissions scope | Enquiry-only |
| Board / grades | CBSE, Nursery–Class 10 |
| School identity | Real school, placeholders until supplied |

**Still open:** email provider (OD-014) · error monitoring (OD-016). Neither blocks Phases 1–3.

> **No minor or patch versions are pinned.** The blueprint locks technology *choices*. Re-verify current stable versions before installing anything — [12_TECH_STACK](12_TECH_STACK.md) version policy, and [CHANGE-0006](../HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md) for why this rule exists.

---

## By the numbers

| | |
|---|---|
| **Public content pages** | **37** *(+ 4 dynamic templates)* |
| Route patterns *(internal)* | 81 — 37 public · 4 dynamic · 34 admin · 6 system |
| Database entities | **18** |
| Admin modules | **14** |
| Admin roles | **3** |
| Homepage sections | **10** |
| Primary nav items | **6** + Admissions CTA |
| Critical user journeys | **6** |
| Personas | **7** |
| Research findings | **8**, from 9 sites inspected |
| Open decisions | **24** |
| Risks tracked | **16** |

---

## Documentation map

### Start here
| Doc | Purpose |
|---|---|
| [01_PROJECT_OVERVIEW](01_PROJECT_OVERVIEW.md) | Executive summary — what, who, why |
| [43_CURRENT_STATUS](43_CURRENT_STATUS.md) | What is actually true right now |
| [49_DECISION_REGISTER](49_DECISION_REGISTER.md) | **Approved vs proposed — check before trusting anything** |
| [99_CLAUDE_WORKING_RULES](99_CLAUDE_WORKING_RULES.md) | How to work on this project |

### Foundation
[02_PRODUCT_VISION](02_PRODUCT_VISION.md) · [03_REQUIREMENTS](03_REQUIREMENTS.md) · [04_USER_PERSONAS](04_USER_PERSONAS.md) · [05_USER_JOURNEYS](05_USER_JOURNEYS.md)

### Structure
[06_INFORMATION_ARCHITECTURE](06_INFORMATION_ARCHITECTURE.md) · [07_SITE_MAP](07_SITE_MAP.md) · [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) · [09_NAVIGATION](09_NAVIGATION.md)

### Design
[10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md) ⚠️ *provisional* · [11_UI_UX_SYSTEM](11_UI_UX_SYSTEM.md)

### Architecture
[12_TECH_STACK](12_TECH_STACK.md) · [13_SYSTEM_ARCHITECTURE](13_SYSTEM_ARCHITECTURE.md) · [14_FRONTEND_ARCHITECTURE](14_FRONTEND_ARCHITECTURE.md) · [15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md) · [16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md) · [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) · [18_API_SPECIFICATION](18_API_SPECIFICATION.md) · [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md)

### Product systems
[20_ADMIN_CMS](20_ADMIN_CMS.md) · [21_CONTENT_MODEL](21_CONTENT_MODEL.md) · [22_MEDIA_AND_STORAGE](22_MEDIA_AND_STORAGE.md) · [23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md) · [24_CONTACT_AND_ENQUIRY_SYSTEM](24_CONTACT_AND_ENQUIRY_SYSTEM.md)

### Quality
[25_SEO_STRATEGY](25_SEO_STRATEGY.md) · [26_ACCESSIBILITY](26_ACCESSIBILITY.md) · [27_PERFORMANCE](27_PERFORMANCE.md) · [28_SECURITY](28_SECURITY.md) · [29_ANALYTICS](29_ANALYTICS.md)

### Operations
[30_DEPLOYMENT](30_DEPLOYMENT.md) · [31_TESTING_STRATEGY](31_TESTING_STRATEGY.md) · [32_QA_CHECKLIST](32_QA_CHECKLIST.md) · [33_MONITORING_AND_LOGGING](33_MONITORING_AND_LOGGING.md) · [34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md) · [35_ENVIRONMENT_CONFIGURATION](35_ENVIRONMENT_CONFIGURATION.md) · [36_PROJECT_STRUCTURE](36_PROJECT_STRUCTURE.md)

### Governance
[37_IMPLEMENTATION_ROADMAP](37_IMPLEMENTATION_ROADMAP.md) · [38_MILESTONES](38_MILESTONES.md) · [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) · [40_RISKS_AND_MITIGATIONS](40_RISKS_AND_MITIGATIONS.md) · [41_PENDING_WORK](41_PENDING_WORK.md) · [42_COMPLETED_WORK](42_COMPLETED_WORK.md) · [44_CHANGE_MANAGEMENT](44_CHANGE_MANAGEMENT.md) · [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md)

### Added in review
[46_TRACEABILITY_MATRIX](46_TRACEABILITY_MATRIX.md) · [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md) · [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md) · [49_DECISION_REGISTER](49_DECISION_REGISTER.md)

### Approval gate ⏳ **action required**
[**50_OWNER_APPROVAL_BRIEF**](50_OWNER_APPROVAL_BRIEF.md) — 22 recommendations awaiting your decision · [**51_SCHOOL_ASSET_REQUEST**](51_SCHOOL_ASSET_REQUEST.md) — itemised, to send to the school

### History
[HISTORY index](../HISTORY/00_HISTORY_INDEX.md) — 7 change records, 10 ADRs

---

## What makes this project different

Five commitments, each traceable to a research finding from nine directly inspected school websites ([45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md)):

1. **Admissions is surfaced, not buried.** All four Indian references under-surface it; all four international ones do not. *(F-1)*
2. **Current parents are designed for.** Notices and Downloads are first-class, kept distinct from News. *(F-2)*
3. **Safety and Transport get findable pages.** Top-tier parental concerns that no inspected reference surfaced. *(F-8)*
4. **Fees are findable.** Cost is a stated primary selection factor. *(F-8)*
5. **Content freshness is a design concern.** One reference had a notice from 2020 live in 2026. *(F-3)*

---

## Critical risks

| Risk | Residual |
|---|---|
| **R-01 School assets never arrive** | **High** |
| R-02 CMS unused; content rots | Medium |
| R-05 Child imagery without consent | Medium |
| R-10 Single-maintainer dependency | Medium |

The highest residual risks are **organisational, not technical**. [40_RISKS_AND_MITIGATIONS](40_RISKS_AND_MITIGATIONS.md)

---

## Hard invariants

Violating any of these is a defect. The consistency audit checks for them.

- **Nursery–Class 10 only** — no Class 11, Class 12, streams, or senior secondary anywhere
- **`proxy.ts`, not `middleware.ts`**
- **Server Actions authorise themselves** — the route guard is not the security boundary
- **`EDITOR` cannot reach enquiry data** by any route
- **Audit log contains no enquiry PII**
- **EXIF stripped from every upload** — no exception
- **Alt text never names a child**
- **Enquiry failure is never silent** — phone fallback, values preserved, alert raised
- **No fabricated school data**
- **Draft content filtered at the query layer**, not hidden in the UI

---

## Latest changes

| ID | What |
|---|---|
| [CHANGE-0007](../HISTORY/2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md) | 24 review corrections — decision classification, versioning, child safety, traceability |
| [CHANGE-0006](../HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md) | Prisma correction → project-wide version policy |
| [CHANGE-0005](../HISTORY/2026/08/CHANGE-0005-DATA-MODEL.md) | 18 entities settled |
| [CHANGE-0004](../HISTORY/2026/08/CHANGE-0004-PROVISIONAL-DESIGN-SYSTEM.md) | Provisional design system |
| [CHANGE-0003](../HISTORY/2026/08/CHANGE-0003-IA-AND-SITEMAP.md) | IA and 81-route table |

---

## Next recommended actions

1. ~~Work through the approval brief~~ ✅ **done** — architecture approved 2026-08-16
2. **Send [51_SCHOOL_ASSET_REQUEST](51_SCHOOL_ASSET_REQUEST.md) to the school** — now the critical path; R-01 is the top project risk
3. Select email provider (OD-014) and error monitoring (OD-016) — needed for Phases 6 and 11, not before
4. **Phase 1 (Foundation) is authorised but not started** — awaiting explicit owner instruction. First step remains: **re-verify current stable versions before installing anything**

---

## Session-start protocol

```
1. Read 00_MASTER_INDEX.md      (this file)
2. Read 43_CURRENT_STATUS.md
3. Read 41_PENDING_WORK.md
4. Read 39_OPEN_DECISIONS.md
5. Read 49_DECISION_REGISTER.md  ← approved vs proposed
6. Read task-relevant documents
7. INSPECT the actual repository
8. COMPARE documented state vs reality
9. REPORT drift — do not absorb it silently
10. CONTINUE from the true state
```

Full rules: [99_CLAUDE_WORKING_RULES](99_CLAUDE_WORKING_RULES.md)
