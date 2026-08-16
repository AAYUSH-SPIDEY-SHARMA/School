# 39 — Open Decisions

| Field | Value |
|---|---|
| **Status** | ACTIVE — 24 open items |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product / Principal Architect |
| **Dependencies** | — |
| **Related Documents** | [49_DECISION_REGISTER](49_DECISION_REGISTER.md) · [40_RISKS_AND_MITIGATIONS](40_RISKS_AND_MITIGATIONS.md) · [43_CURRENT_STATUS](43_CURRENT_STATUS.md) |

---

## How to read this

Every unresolved question that affects the work. Nothing critical is silently guessed — where a default is proposed, it is labelled a recommendation and the reasoning is given.

| Priority | Meaning |
|---|---|
| 🔴 **BLOCKING** | Work cannot complete without it |
| 🟠 **HIGH** | Affects architecture or design; needed soon |
| 🟡 **MEDIUM** | Needed before launch |
| 🟢 **LOW** | Can be decided late |

**Decided items move to [49_DECISION_REGISTER](49_DECISION_REGISTER.md) and, if significant, get a HISTORY entry.**

---

## 🔴 BLOCKING

### OD-001 — School identity and branding assets
**Needed:** logo (with variants), brand colours, existing typography, prospectus or brochure, any existing identity guidance.
**Blocks:** [10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md) is `PROVISIONAL` until this arrives. The palette must derive from the logo.
**Owner:** School. **Recommendation:** highest-priority request.

### OD-002 — Campus photography
**Needed:** 20–40 high-quality photographs — campus exterior, classrooms, labs, library, sports, students in activity, staff, principal portrait.
**Blocks:** the design cannot reach its intended standard. Stock imagery is explicitly forbidden (CR-003).
**Owner:** School. **Recommendation:** if none exists, commission a half-day shoot. This is a launch blocker, not a nice-to-have.

### OD-003 — School factual details
`[SCHOOL_NAME]` · `[SCHOOL_ADDRESS]` · `[PHONE_NUMBER]` · `[EMAIL]` · `[AFFILIATION_NUMBER]` · `[ESTABLISHED_YEAR]` · `[PRINCIPAL_NAME]` · office hours · social profiles.
**Blocks:** all content, `School` structured data, contact page, footer.
**Owner:** School.

### OD-004 — Statistics
`[STUDENT_COUNT]` · `[FACULTY_COUNT]` · `[BOARD_RESULT_PCT]` · `[CAMPUS_SIZE]`.
**Blocks:** homepage trust band.
⚠️ **These must be real.** A fabricated board-result figure on a real school's website is a material misrepresentation to families choosing a school. If a figure is unavailable, the statistic is omitted — never estimated.

### OD-005 — Fee structure
Per-class amounts for Nursery–Class X, payment schedule, additional charges, concessions.
**Blocks:** `/admissions/fees`.
**Owner:** School accounts + principal.

### ~~OD-006 — Stack approval~~ ✅ **RESOLVED 2026-08-16**

**All 22 architectural recommendations approved by the owner.** PostgreSQL explicitly approved (no longer merely implied). Approved stack: **Vercel + Neon + PostgreSQL**, Next.js 16.x, TypeScript strict, Tailwind 4 + shadcn/ui, Prisma, Auth.js, Cloudinary, custom CMS, Server Actions with no general API.

See [49_DECISION_REGISTER](49_DECISION_REGISTER.md) §D-B and [CHANGE-0009](../HISTORY/2026/08/CHANGE-0009-ARCHITECTURE-APPROVAL.md). **Phase 1 is no longer blocked by this gate.**

---

## 🟠 HIGH

### ~~OD-007 — Does an existing school website exist?~~ ✅ **RESOLVED 2026-08-16**

**Answer (project owner): No. This is the school's first website.**

**Consequences — all favourable:**
- **No migration or SEO-preservation audit required.** No existing URLs to inventory, no redirect mapping, no content extraction.
- **No inherited ranking to lose.** The single largest timing risk in the SEO strategy is removed.
- **URL structure can be designed correctly the first time** — the clean-slate advantage noted in [CHANGE-0001](../HISTORY/2026/08/CHANGE-0001-INITIAL-DISCOVERY.md) holds in full.
- **Risk R-14 (existing website discovered late) is closed.**

`SlugHistory` and the 301 machinery (D-B19) remain necessary regardless — they exist for slugs changed *after* launch, not for migrating a predecessor.

### ~~OD-008 — Neon or Supabase?~~ ✅ **RESOLVED 2026-08-16**

**Owner selected Neon.** Reasoning: PostgreSQL, connection pooling, PR/environment branching, migration testing, narrower infrastructure surface.

⚠️ **Constraint:** do not add Supabase Auth or Supabase Storage. Auth remains Auth.js; media remains Cloudinary. Supabase is now `REJECTED` as a provider (D-E22).

### OD-009 — Is Hindi content required?
**Affects:** font subsetting (Devanagari roughly doubles font weight), content workload, `hreflang`, admin complexity.
**Recommendation:** English-only at launch unless the school states otherwise. Architecture should not make localisation unnecessarily hard, but building for it speculatively is waste.

### OD-010 — Publish real fee amounts, or PDF only?
**Recommendation: publish real amounts.** Cost is a stated primary selection factor (F-8); hiding fees filters out affordable-fit families who assume the worst, signals evasiveness, and removes the site from a high-intent search query.
**Counter-consideration:** some schools prefer not to publish figures competitors can see. If the school declines, publish the *structure* plus a current downloadable schedule — never nothing.

### OD-011 — Enquiry data retention period
**Why it matters:** personal data about parents and minors cannot be kept indefinitely without justification.
**Recommendation: 24 months after closure**, long enough to cover re-application in a later cycle.
**Owner:** School — this is their data-protection obligation, not an engineering choice.

### ~~OD-012 — Review-before-publish workflow?~~ ✅ **RESOLVED 2026-08-16**

**Owner approved direct publish** (D-B20): `DRAFT → PREVIEW → PUBLISH`, editors publish directly, no second-person approval workflow in v1.

Owner note: *"Do not confuse preview before publishing with approval before publishing. The first is required. The second is intentionally excluded from v1."* Revisit only if the school's real workflow requires it or editor count grows materially.

### OD-013 — Domain ownership and DNS access
**Recommendation:** the domain **must** be registered to the school, on the school's account. A school that cannot access its own DNS is dependent on whoever set it up — a recurring cause of institutional sites becoming unmaintainable.

---

## 🟡 MEDIUM

### OD-014 — Email provider
**Requirements:** reliable delivery, verified sending domain (SPF/DKIM), delivery-failure visibility, free tier adequate for enquiry volume.

### OD-015 — Analytics vendor
**Recommendation:** a cookieless, privacy-focused tool. Google Analytics is `NOT_RECOMMENDED` — consent obligations and data collection disproportionate to the six questions the school actually has ([29_ANALYTICS](29_ANALYTICS.md)).

### OD-016 — Error monitoring vendor
Requirements include **automatic PII scrubbing** from error payloads — these tools capture request bodies by default.

### OD-017 — Is a cookie consent banner legally required?
Depends on the analytics choice and applicable law.
⚠️ **A question for the school's legal advisor.** This blueprint does not assert what the law requires.

### OD-018 — Breach notification obligations
⚠️ **Legal question.** The incident-response plan in [28_SECURITY](28_SECURITY.md) names notification as a step but deliberately does not state what the law requires.

### OD-019 — Transport routes: public or admitted families only?
Publishing routes helps prospective parents assess commutability (a primary factor). Some schools consider route detail sensitive.
**Recommendation:** publish areas served; share detailed stop-level routes on request.

### OD-020 — Careers/vacancies section at launch?
Classified `COULD` (FR-076). Cheap to add; useful for a school that recruits regularly.

### OD-021 — Does the school run an ERP or parent portal?
**Why it matters:** if one exists, this site should **link** to it rather than duplicate its function. Two sources of truth for student data would be worse than either alone ([02_PRODUCT_VISION](02_PRODUCT_VISION.md) anti-goals).

### OD-022 — Content ownership assignments
[21_CONTENT_MODEL](21_CONTENT_MODEL.md) assigns owners by role as placeholders. Real people must be named before handover, or the content-freshness controls have nobody to notify.

---

## 🟢 LOW

### OD-023 — Faculty detail pages?
`/academics/faculty/[slug]` is `COULD` (FR-025). **Recommendation:** build only if the school supplies genuine profile depth — a thin profile page is worse than a good directory card.

### OD-024 — Staging environment?
Classified `SHOULD` (NFR-065). Adds cost and process. **Recommendation:** worthwhile if more than one person will be deploying; skippable for a solo maintainer using preview deployments.

---

## Research gaps

Not decisions, but acknowledged limitations that affect confidence in the work.

| Gap | Impact |
|---|---|
| **No local competitor analysis** | The school's actual competitors are unknown, since the school is unidentified. A parent choosing a day school compares against schools within a few kilometres, not against the international references studied. **The largest single gap in the research** ([45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) §6) |
| No primary user research | Personas are derived from published literature, not this school's families |
| Mobile behaviour unverified | Mobile-first is assumed, not measured for this audience |
| Two reference fetches failed | Doon School (403) and Step by Step (empty) — recorded, not substituted |

---

## Summary

| Priority | Open |
|---|---|
| 🔴 BLOCKING | **5** — all school-dependent |
| 🟠 HIGH | 4 |
| 🟡 MEDIUM | 9 |
| 🟢 LOW | 2 |
| **Total open** | **20** |
| **Resolved** | **4** — OD-006, OD-007, OD-008, OD-012 |

### What changed on 2026-08-16

**Architecture is no longer an open question.** OD-006 (stack approval), OD-008 (database provider), and OD-012 (publishing workflow) are all resolved by owner approval; OD-007 (existing website) is resolved as *none*.

**Every remaining blocking item is school-dependent** — identity, branding, photography, factual details, fees. None can be resolved by engineering, and none blocks Phases 1–3.

**The decisions that now unblock the most work:**
1. ~~OD-006 stack approval~~ ✅ **resolved** — engineering is unblocked
2. **OD-001 / OD-002 / OD-003** — school identity, branding, photography. Now the *only* remaining blockers, and all outside engineering control

Everything else can proceed in parallel or be decided later.
