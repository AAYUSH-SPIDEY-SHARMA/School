# 38 — Milestones

| Field | Value |
|---|---|
| **Status** | PROPOSED — **no dates set** |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product / Principal Architect |
| **Dependencies** | [37_IMPLEMENTATION_ROADMAP](37_IMPLEMENTATION_ROADMAP.md) |
| **Related Documents** | [43_CURRENT_STATUS](43_CURRENT_STATUS.md) · [41_PENDING_WORK](41_PENDING_WORK.md) |

---

## Why there are no dates

Three unknowns make any schedule fiction:

1. **Team size and availability are undetermined.**
2. **Gate A (stack approval)** has no date — it awaits the owner.
3. **Gate B (school identity and photography)** depends entirely on the school's responsiveness, and is historically the slowest part of a project like this.

A plan built on those unknowns would look authoritative and mislead everyone reading it. **Dates are added here once both gates clear and the team is known** — at which point the milestone definitions below become schedulable.

What follows is therefore **definitions of done**, not a timeline. Each is objectively verifiable — a milestone that cannot be objectively assessed will be declared complete optimistically.

---

## M0 — Discovery complete ✅

**Status:** COMPLETED 2026-08-16

- [x] Repository audited and recorded
- [x] Research conducted and sourced
- [x] Requirements defined with stable IDs
- [x] IA and route table settled
- [x] Design system defined (provisional)
- [x] Architecture and schema specified
- [x] BLUEPRINT (51 docs) and HISTORY established
- [x] Consistency audit passed

**Output:** this documentation set. **No application code.**

---

## M1 — Decisions approved ✅

**Status:** COMPLETED 2026-08-16

- [x] Every `ARCHITECTURAL_RECOMMENDATION` approved — 22 of 22
- [x] PostgreSQL confirmed explicitly
- [x] **Neon** selected
- [x] Analytics category chosen (cookieless); **email and error-monitoring vendors still open** (OD-014, OD-016) — deferred to Phases 6 and 11
- [ ] Enquiry data retention period — **still open** (OD-011), the school's obligation
- [x] Fee publication approach decided (conditional on school permission)
- [x] Review-before-publish decided — direct publish, no approval chain
- [x] All 10 ADRs moved to `Accepted`
- [x] Facility administration model resolved (CF-1)

**Done when:** ~~no stack item remains unapproved~~ ✅ achieved. Two vendor selections and the retention period remain, none blocking Phases 1–3.

---

## M2 — Skeleton running

- [ ] Git repository initialised, `.env` ignored in the first commit
- [ ] Project builds; TypeScript strict passes
- [ ] Design tokens wired into `@theme`
- [ ] CI runs typecheck, lint, build
- [ ] Header, navigation, drawer, footer working
- [ ] Responsive verified at all nine widths
- [ ] Keyboard navigation and focus management working in the drawer

**Done when:** an empty page renders correctly at every breakpoint with fully operable navigation.

---

## M3 — Public site (placeholder content)

- [ ] All **37 static routes** render
- [ ] Page sections and card components built, no duplicates
- [ ] SEO metadata on every page
- [ ] Structured data scaffolded
- [ ] Empty, loading, and error states designed
- [ ] Responsive verified across all templates

**Done when:** the whole public site is navigable, with placeholders clearly visible as placeholders.

---

## M4 — Data layer live

- [ ] All **18 entities** implemented and migrated
- [ ] Seed script runs with **placeholder-only** data
- [ ] Query and action layers in place
- [ ] Caching and tag invalidation verified
- [ ] Soft delete and publication filtering verified **at the query layer**

**Done when:** content renders from the database rather than hard-coded values.

---

## M5 — Enquiry system working ⭐

The commercially critical milestone.

- [ ] Enquiry form submits end to end
- [ ] Record persisted with status `NEW` and consent timestamp
- [ ] School notified by email
- [ ] Rate limiting and honeypot verified
- [ ] Validation errors specific and accessible
- [ ] **Failure path verified: phone fallback shown, typed values preserved, alert fires**
- [ ] Completable on a phone in under two minutes
- [ ] Works with JavaScript disabled

**Done when:** a parent can make contact and the school reliably receives it — **including when the email provider is down.**

---

## M6 — Admin CMS usable

- [ ] Authentication and the **full authorisation matrix** working
- [ ] All fourteen modules functional
- [ ] Media upload with EXIF stripping verified
- [ ] Audit logging active, containing no enquiry PII
- [ ] Enquiry workflow with actor and timestamp on every transition
- [ ] Freshness indicators showing
- [ ] **A person who has never seen the CMS publishes a notice in under three minutes, unaided**

**Done when:** the school can run its own website. The last checkbox is the real test — and must be run with an actual non-technical person, not a developer.

---

## M7 — Real content

**Depends on Gate B.**

- [ ] **Zero `[PLACEHOLDER]` tokens on any public page**
- [ ] Real photography throughout
- [ ] Faculty, fees, dates, statistics supplied and verified
- [ ] **Safety page content verified with the school** — nothing claimed that does not exist
- [ ] Legal pages drafted and sent for legal review
- [ ] Contact details verified — **phone number actually dialled**

**Done when:** every public statement is true and sourced from the school.

---

## M8 — Quality verified

- [ ] Accessibility: automated **and** manual testing done, results **dated and recorded**
- [ ] Performance: verified on a real mid-range Android on a throttled connection
- [ ] SEO checklist passed
- [ ] Security checklist passed, including direct Server Action invocation tests
- [ ] All six E2E journey suites passing
- [ ] CI gates enforced

**Done when:** claims in the blueprint are backed by recorded evidence rather than intent.

---

## M9 — Launched

- [ ] Production live on the school's domain with TLS
- [ ] **Backup running and a restore actually performed and recorded**
- [ ] Monitoring and alerting live; failed-enquiry alert verified by simulation
- [ ] Search Console verified, sitemap submitted
- [ ] Google Business Profile claimed by the school
- [ ] Staff trained; content ownership assigned
- [ ] **Domain, hosting, and billing owned by the school**
- [ ] Blueprint updated to match what was built
- [ ] Launch recorded in HISTORY

**Done when:** the site is live and the school genuinely controls it.

---

## M10 — Stable operation (90 days post-launch)

The milestone that determines whether the project actually solved the problem.

- [ ] Enquiries arriving and being worked through the dashboard
- [ ] **Content published by school staff without developer involvement**
- [ ] Field Core Web Vitals within target
- [ ] Ranking first for the school's own name
- [ ] No critical incidents outstanding
- [ ] **No stale content flagged**

> M10 is the real success test. A site that launches beautifully and is stale within a year has reproduced the exact failure observed in the reference sites ([45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) F-3). Everything in the CMS design exists to pass this milestone.

---

## Progress

| Milestone | Status |
|---|---|
| M0 Discovery | ✅ **COMPLETED** 2026-08-16 |
| M1 Decisions approved | ✅ **COMPLETED** 2026-08-16 |
| M2 Skeleton | NOT_STARTED |
| M3 Public site | NOT_STARTED |
| M4 Data layer | NOT_STARTED |
| M5 Enquiry system | NOT_STARTED |
| M6 Admin CMS | NOT_STARTED |
| M7 Real content | ⛔ **BLOCKED** — awaiting school assets |
| M8 Quality verified | NOT_STARTED |
| M9 Launched | NOT_STARTED |
| M10 Stable operation | NOT_STARTED |

**2 of 11 complete.** M7 remains blocked on school assets — the only remaining input outside engineering control.
