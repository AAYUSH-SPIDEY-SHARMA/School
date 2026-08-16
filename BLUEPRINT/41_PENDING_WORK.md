# 41 — Pending Work

| Field | Value |
|---|---|
| **Status** | ACTIVE |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect |
| **Dependencies** | [37_IMPLEMENTATION_ROADMAP](37_IMPLEMENTATION_ROADMAP.md) · [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) |
| **Related Documents** | [42_COMPLETED_WORK](42_COMPLETED_WORK.md) · [43_CURRENT_STATUS](43_CURRENT_STATUS.md) · [38_MILESTONES](38_MILESTONES.md) |

---

## Summary

**Everything except discovery is pending.** The repository contains `BLUEPRINT/` and `HISTORY/` and nothing else — no application code, no dependencies, no database, no git repository.

Two blocking gates sit ahead of all engineering work.

---

## Blocked — cannot start

### ✅ B-1 — Stack approval — **CLEARED 2026-08-16**
All 22 architectural recommendations approved by the owner. PostgreSQL explicitly approved; Neon selected as provider. **Engineering is no longer blocked by architecture.**
**Reference:** [49_DECISION_REGISTER](49_DECISION_REGISTER.md) §D-B · [CHANGE-0009](../HISTORY/2026/08/CHANGE-0009-ARCHITECTURE-APPROVAL.md)

### ⛔ B-2 — School identity and assets *(blocks design finalisation and launch)*
Logo, brand colours, photography, factual details, statistics, fee structure.
**Waiting on:** school. **Reference:** OD-001 to OD-005.
**Workaround:** placeholder tokens keep engineering moving, but the design cannot be finalised and the site cannot launch.

### B-3 — Vendor selections *(partially resolved)*

| Vendor | Status |
|---|---|
| **Database provider** | ✅ **Neon** — approved (D-A3a) |
| **Media provider** | ✅ **Cloudinary** — approved (D-B7) |
| **Analytics** | ✅ Privacy-focused cookieless (Plausible or equivalent), approved (D-B21) — **specific vendor to verify at implementation** (OD-015) |
| Email provider | ⏳ Open (OD-014) — blocks Phase 6 |
| Error monitoring | ⏳ Open (OD-016) — blocks Phase 11 |

> **Cloudinary added to this gate 2026-08-16 (CF-3).** It was previously absent despite being both an architectural decision and a launch dependency for the child-safeguarding media pipeline.

---

## Ready to start once B-1 clears

### Phase 1 — Foundation
- [ ] `git init` — **`.env` ignored in the first commit**
- [ ] Re-verify current stable versions ⚠️ *(roadmap step zero — do not skip)*
- [ ] Scaffold project; TypeScript strict
- [ ] Wire design tokens into `@theme`
- [ ] Initialise component library onto tokens
- [ ] Lint, format, CI skeleton
- [ ] `.env.example` — names only
- [ ] README

### Phase 2 — Layout shell
- [ ] Header, utility bar, primary nav with dropdowns
- [ ] Mobile drawer — focus trap, `Escape`, focus restoration
- [ ] Admissions CTA persistent, **outside the hamburger on mobile**
- [ ] Footer, breadcrumbs, skip link
- [ ] Typography and spacing applied
- [ ] `not-found` and `error` pages
- [ ] Verified at 320 · 375 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920

### Phase 3 — Static public pages
- [ ] 37 static routes ([07_SITE_MAP](07_SITE_MAP.md))
- [ ] Homepage — 10 sections in specified order
- [ ] Section and card components (`CardShell` + 9 variants)
- [ ] Fee table with accessible scroll container
- [ ] Admission process timeline
- [ ] SEO metadata per page; structured data scaffolding
- [ ] Empty, loading, error states

---

## Pending — later phases

### Phase 4 — Data layer
18 entities · migrations · seed with placeholder-only data · query and action layers · caching with tag invalidation · soft-delete and publication filtering verified at the query layer.

### Phase 5 — Dynamic modules
News · Events · Gallery (with accessible lightbox) · Faculty · Notices (with expiry) · Downloads · Achievements · Testimonials · filters · pagination · **slug history and 301 redirects**.

### Phase 6 — Enquiry system ⭐
Enquiry and contact forms · shared Zod schema · Server Action · rate limiting and honeypot · email notification · **failure path with phone fallback and P1 alert** · confirmation states · works without JavaScript.

### Phase 7 — Admin CMS
Auth and full authorisation matrix · dashboard (role-aware) · 14 modules · media upload with EXIF stripping · bulk upload · alt-text enforcement · audit logging · enquiry workflow · freshness indicators.

### Phase 8 — Content population *(blocked on B-2)*
Replace every placeholder · real photography · faculty, fees, dates, statistics · **safety content verified with the school** · legal pages drafted for legal review.

### Phase 9 — Quality hardening
Accessibility — automated **and** manual, results dated and recorded · performance on a real mid-range Android · SEO verification · security checklist including direct Server Action invocation tests.

### Phase 10 — Testing
Unit · integration (**full authorisation matrix**) · six E2E journey suites · CI gates enforced.

### Phase 11 — Launch
Production environment · domain and TLS · **backup with a verified restore** · monitoring with a simulated-failure alert test · Search Console · staff training · handover · QA checklist.

---

## Standing obligations

Not phase work — ongoing throughout.

- [ ] Update BLUEPRINT when implementation diverges from specification
- [ ] Create a HISTORY entry for every meaningful change
- [ ] Move resolved items from [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) to [49_DECISION_REGISTER](49_DECISION_REGISTER.md)
- [ ] Keep [43_CURRENT_STATUS](43_CURRENT_STATUS.md) accurate
- [ ] Move completed work to [42_COMPLETED_WORK](42_COMPLETED_WORK.md)
- [ ] Re-run the consistency audit before declaring any phase complete

---

## Known gaps to close during implementation

Recorded now so they are not rediscovered late.

| Gap | Action | Reference |
|---|---|---|
| No local competitor analysis | Once the school is identified, analyse actual nearby competitors | [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) §6 |
| No primary user research | Validate personas with the school's real parents if possible | [04_USER_PERSONAS](04_USER_PERSONAS.md) |
| Existing website unknown | **Ask immediately** — affects redirect strategy and preserved ranking | OD-007 |
| Contrast unverified | Measure against the real palette; demote accent if it fails | [10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md) |
| Restore never tested | Perform and record a restore before launch | [34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md) |
| Content owners unnamed | Assign real people before handover | OD-022 |

---

## Immediate next actions

In order of leverage:

1. ~~Obtain stack approval~~ ✅ **cleared 2026-08-16**
2. **Send the school asset request** (B-2) — [51_SCHOOL_ASSET_REQUEST](51_SCHOOL_ASSET_REQUEST.md). **Now the critical path**; R-01 is the top project risk
3. ~~Ask whether an existing website exists~~ ✅ **resolved — none**
4. ~~Select Neon or Supabase~~ ✅ **Neon selected**
5. Select email provider (OD-014) and error monitoring (OD-016) — needed for Phases 6 and 11
6. **Phase 1 is authorised but not started** — awaiting explicit owner instruction

> Action 2 is a request to the school, not engineering work, and should be sent immediately rather than when engineering reaches the point of needing it.
