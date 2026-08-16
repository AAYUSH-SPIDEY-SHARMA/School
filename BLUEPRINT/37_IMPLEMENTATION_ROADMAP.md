# 37 — Implementation Roadmap

| Field | Value |
|---|---|
| **Status** | PROPOSED — Phase 0 complete, nothing else started |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect |
| **Dependencies** | [49_DECISION_REGISTER](49_DECISION_REGISTER.md) · [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) |
| **Related Documents** | [38_MILESTONES](38_MILESTONES.md) · [41_PENDING_WORK](41_PENDING_WORK.md) · [43_CURRENT_STATUS](43_CURRENT_STATUS.md) |

---

## ⚠️ Step zero — before any dependency is installed

> **Re-verify current stable versions and official migration notes for every technology in the stack.**

The version findings in [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) are dated **2026-08-16** and will decay. The blueprint locks technology *choices*, not versions ([12_TECH_STACK](12_TECH_STACK.md) version policy).

This step exists because an earlier draft recommended a superseded ORM generation with instructions to enable preview flags that no longer exist ([CHANGE-0006](../HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md)). Skipping it reintroduces exactly that failure.

Check at minimum: framework major line and its breaking changes · ORM major line · styling and component library compatibility · auth library integration guidance for the current framework version · Node runtime requirements.

---

## Two blocking gates

Neither is engineering work, and both block meaningful progress.

### Gate A — Stack approval
Most of the stack is `ARCHITECTURAL_RECOMMENDATION`, not approved ([49_DECISION_REGISTER](49_DECISION_REGISTER.md)). Building on unapproved recommendations risks rework. **Phases 1+ should not begin until the register is signed off.**

### Gate B — School identity
Logo, name, colours, address, contact details, affiliation number, statistics, fees, faculty, and **20–40 campus photographs**.

This blocks: the design system (palette derives from the logo), all content, structured data, and launch. Placeholder tokens let engineering proceed, but **the project cannot launch without it**, and the design cannot be finalised.

> If Gate B will take time, Phases 1–3 can proceed against provisional tokens — but expect a re-theming pass, and expect the design to look unfinished until real photography arrives.

---

## Phases

Dependency-ordered. Each phase is meaningful on its own; none should start before its dependencies are real.

### Phase 0 — Discovery ✅ COMPLETED
Repository audit · research · requirements · IA · design system (provisional) · architecture · schema specification · roadmap · BLUEPRINT and HISTORY established.
**Output:** this documentation set.

### Phase 1 — Foundation
`git init` with `.env` ignored **in the first commit** · project scaffold · TypeScript strict · Tailwind with `@theme` tokens · shadcn/ui initialised · linting and formatting · CI skeleton · `.env.example` · README.
**Depends on:** Gate A, step zero.
**Done when:** the project builds, CI runs, tokens are wired.

### Phase 2 — Layout shell
Header, utility bar, primary nav, mobile drawer, footer, breadcrumbs, skip link · typography and spacing applied · error and not-found pages · responsive verified at all nine widths.
**Done when:** an empty page renders correctly at every breakpoint with working navigation.

> Navigation is built early because every page depends on it, and because its accessibility behaviour (focus trapping, keyboard operation) is easier to get right once than to retrofit across 37 pages.

### Phase 3 — Static public pages
All 37 static routes with real structure and placeholder content · page sections and card components · SEO metadata · structured data scaffolding.
**Depends on:** Phase 2.
**Done when:** every static route renders, is navigable, and is responsive.

### Phase 4 — Database and content layer
Schema implemented from [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) · migrations · seed with **placeholder-only** data · query and action layers · caching and tag invalidation.
**Depends on:** Gate A (database confirmed), Phase 1.
**Done when:** entities exist, migrations run cleanly, seeds work.

### Phase 5 — Dynamic public modules
News, Events, Gallery, Faculty, Notices, Downloads, Achievements, Testimonials · listing and detail pages · filters and pagination · empty states · **slug history and 301 redirects**.
**Depends on:** Phases 3, 4.
**Done when:** all dynamic content renders from the database with working empty states.

### Phase 6 — Enquiry system ⭐
Enquiry and contact forms · shared Zod validation · Server Action · rate limiting and honeypot · email notification · **failure handling with phone fallback** · confirmation states.
**Depends on:** Phase 4.
**Done when:** an enquiry submits end to end, is stored, notifies the school, and **fails safely** when the email provider is down.

> Deliberately before the admin CMS. This is the site's commercial purpose; if the project ran out of time here, a working enquiry path with manual database review would still deliver most of the value.

### Phase 7 — Admin CMS
Authentication · role authorisation · dashboard · fourteen modules · media upload with EXIF stripping · audit logging · enquiry workflow · freshness indicators.
**Depends on:** Phases 4, 6.
**Done when:** **a non-technical person publishes a notice in under three minutes, unaided.**

### Phase 8 — Content population
Real content replaces every placeholder · real photography · faculty, fees, dates, statistics · legal pages drafted for review · safety content **verified with the school**.
**Depends on:** Gate B.
**Done when:** no `[PLACEHOLDER]` token remains on any public page.

### Phase 9 — Quality hardening
Accessibility testing — automated **and** manual · performance optimisation and field measurement setup · SEO verification · security checklist · error and empty state polish.
**Depends on:** Phases 7, 8.
**Done when:** [26_ACCESSIBILITY](26_ACCESSIBILITY.md) and [28_SECURITY](28_SECURITY.md) checklists pass with results recorded.

### Phase 10 — Testing
Unit and integration suites · **full authorisation matrix** · six E2E journey suites · CI gates enforced.
**Depends on:** Phase 7. Runs partly in parallel with 9.
**Done when:** all gates in [31_TESTING_STRATEGY](31_TESTING_STRATEGY.md) pass.

### Phase 11 — Launch
Production environment · domain and TLS · backups **and a verified restore** · monitoring and alerting · Search Console and Business Profile · staff training · handover · [32_QA_CHECKLIST](32_QA_CHECKLIST.md).
**Depends on:** all previous.
**Done when:** live, monitored, backed up, and the school owns its own accounts.

---

## Dependency map

```
Gate A ──┬──► Phase 1 ──► Phase 2 ──► Phase 3 ──┐
         │                                       ├──► Phase 5 ──┐
         └──► Phase 4 ───────────────────────────┘              │
                  │                                             │
                  └──► Phase 6 ──► Phase 7 ────────────────────┤
                                                                │
Gate B ─────────────────────────► Phase 8 ─────────────────────┤
                                                                ▼
                                              Phase 9 + Phase 10 ──► Phase 11
```

**Critical path:** Gate A → 1 → 2 → 3 → 5 → 7 → 9/10 → 11.
Phase 8 runs parallel to engineering **if** Gate B is satisfied early. If it is not, it becomes the critical path — which is why it is the top escalation in [40_RISKS_AND_MITIGATIONS](40_RISKS_AND_MITIGATIONS.md).

---

## Sequencing rationale

**Why the enquiry system precedes the admin CMS.** The enquiry path is the site's commercial purpose. Content can be managed directly in the database by a developer in the short term; a broken enquiry path cannot be worked around, and every day it does not exist is lost admissions.

**Why static pages precede the database.** They validate the design system, component inventory, and IA against real layouts before any of it is coupled to data. Discovering the card component is wrong is much cheaper before eight modules use it.

**Why testing is late but not last.** Unit and integration tests are written alongside their code from Phase 4 onward. Phase 10 is where the E2E suites and CI gates are completed — they need a working system to test.

**Why content population is its own phase.** It is not engineering work, it depends entirely on the school, and treating it as a background task is how projects reach launch week with placeholder text still live.

---

## Deliberately not scheduled

No calendar dates or effort estimates appear in this roadmap.

Both gates are outside engineering control, team size is undetermined, and Gate B in particular depends on the school's responsiveness. Publishing dates derived from those unknowns would be fiction presented as a plan.

Dates should be added to [38_MILESTONES](38_MILESTONES.md) once the gates clear and the team is known.

---

## Deferred to post-launch

Online applications with document upload · parent portal · site-wide search · Hindi content · fee payment · virtual campus tour · newsletter · alumni portal · AI assistant.

All classified in [03_REQUIREMENTS](03_REQUIREMENTS.md). None is designed against now; the data model avoids foreclosing them.
