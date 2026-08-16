# 46 — Traceability Matrix

| Field | Value |
|---|---|
| **Status** | ACTIVE — implementation and test columns empty by definition |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect / QA |
| **Dependencies** | [03_REQUIREMENTS](03_REQUIREMENTS.md) · [49_DECISION_REGISTER](49_DECISION_REGISTER.md) |
| **Related Documents** | [31_TESTING_STRATEGY](31_TESTING_STRATEGY.md) · [41_PENDING_WORK](41_PENDING_WORK.md) |

---

## Purpose

Answers one question that is otherwise unanswerable across fifty documents:

> **Is this requirement actually specified, built, and tested — or did it get lost?**

Each row traces:

```
Requirement → Decision → Blueprint document → Implementation area → Verification
```

**A `MUST` requirement with no verification method is a gap.** This matrix exists so gaps are visible rather than assumed away.

> ⚠️ The **Implementation** column describes *where code will live*, not where it does live. **No code exists.** The **Verified** column is empty throughout, and will remain so until tests actually run.

---

## Legend

| Symbol | Meaning |
|---|---|
| ⬚ | Not started |
| ◐ | Specified, not built |
| ✅ | Built and verified |
| ⛔ | Blocked |

All rows are currently ◐ or ⛔ — specified, not built.

---

## 1. Discovery and orientation

| Req | Requirement | Decision | Blueprint | Implementation | Verification | Status |
|---|---|---|---|---|---|---|
| FR-001 | Identity, board, grades above fold | RESEARCH F-7 | 08 §1 | `app/(public)/page.tsx` hero | E2E `admissions-enquiry` | ◐ |
| FR-002 | Homepage admissions CTA, specific | RESEARCH F-1 | 08 §1, 06 | Homepage CTA + `AdmissionsCTA` | E2E + `admissions_cta_click` | ◐ |
| FR-003 | 6-item nav, literal labels, CTA | RESEARCH F-5 | 09 | `components/layout/PrimaryNav` | E2E nav + manual QA | ◐ |
| FR-004 | Current-parent quick links | RESEARCH F-6 | 09 utility bar | `components/layout/UtilityBar` | E2E `notices-downloads` | ◐ |
| FR-005 | Trust statistics band | RESEARCH F-4 | 08 §1 | `sections/StatBand` ← `SiteSetting` | Unit + manual | ◐ |
| FR-006 | Breadcrumbs | STANDARD | 09 | `layout/Breadcrumbs` | axe + structured data test | ◐ |
| FR-007 | Footer on every page | ARCHITECT | 09 | `layout/SiteFooter` | E2E link check | ◐ |
| FR-008 | Site-wide search | ARCHITECT | 09 deferred | — | — | `FUTURE` |

## 2. School information

| Req | Requirement | Decision | Blueprint | Implementation | Verification | Status |
|---|---|---|---|---|---|---|
| FR-010–014 | About, vision, principal, leadership, infrastructure | USER | 08 §11 | `app/(public)/about/*` | Route render tests | ◐ |
| **FR-015** | **Safety & Security page** | **RESEARCH F-8** | 08 §9 | `about/safety` | Route + **content verified with school** | ⛔ B-2 |
| **FR-016** | **Transport page** | **RESEARCH F-8** | 08 §11 | `about/transport` | Route render | ⛔ B-2 |

> FR-015 and FR-016 are the two elevations that distinguish this IA from every inspected reference. Both are blocked on school-supplied content, and FR-015 additionally requires factual verification — claiming safety measures that do not exist is a misrepresentation.

## 3. Academics

| Req | Requirement | Decision | Blueprint | Implementation | Verification | Status |
|---|---|---|---|---|---|---|
| FR-020–022 | Overview, curriculum, **4 stages** | USER (Nursery–10) | 07, 08 §11 | `academics/*` | Route tests + **no Class 11/12 sweep** | ◐ |
| FR-023 | Faculty directory | RESEARCH F-8 | 08 §6 | `academics/faculty` ← `Faculty` | Integration + a11y | ◐ |
| FR-024 | Department filter | ARCHITECT | 08 §6 | `FilterChips` | E2E + **works without JS** | ◐ |
| FR-025 | Faculty detail pages | ARCHITECT | 08 §10 | `faculty/[slug]` | Route test | `COULD` |

## 4. Admissions — the conversion path

| Req | Requirement | Decision | Blueprint | Implementation | Verification | Status |
|---|---|---|---|---|---|---|
| FR-030 | Admissions overview + cycle status | USER | 08 §2, 23 | `admissions/page.tsx` ← `SiteSetting` | E2E incl. **closed state** | ◐ |
| FR-031 | Process timeline | USER | 08 §11 | `admissions/process` | Route test | ◐ |
| FR-032 | Eligibility and age criteria | RESEARCH F-7 | 08 §11 | `admissions/eligibility` | Route test | ◐ |
| **FR-033** | **Fee structure, tabular** | **RESEARCH F-8** | 08 §3 | `admissions/fees` | **a11y table test** + responsive QA | ⛔ B-2 |
| FR-034 | Fee PDF | USER | 08 §3 | `Document` | Manual | ⛔ B-2 |
| FR-035 | Important dates | RESEARCH F-7 | 08 §11 | `admissions/important-dates` | Route + freshness | ◐ |
| FR-036 | FAQs | USER | 08 §11 | `admissions/faqs` | `FAQPage` schema test | ◐ |
| FR-037 | Documents required | RESEARCH F-7 | 08 §2 | Admissions overview | Route test | ◐ |
| **FR-038** | **Enquiry form** | **USER_APPROVED** | 08 §4, 23, 24 | `admissions/enquire` + `submitEnquiry` | **E2E `admissions-enquiry`** | ◐ |
| FR-039 | Shared client/server validation | ARCHITECT | 15, 24 | `lib/validations/enquiry.ts` | Unit — boundary + malformed | ◐ |
| FR-040 | Spam protection | STANDARD | 23, 24 | Honeypot + rate limit | Integration | ◐ |
| FR-041 | Confirmation with response time | ARCHITECT | 08 §4, 24 | Success state | E2E | ◐ |
| FR-042 | Email notification | USER | 23, 24 | `lib/email` | Integration + **failure path** | ◐ |
| FR-043 | Mobile-completable < 2 min | ARCHITECT | 08 §4 | Form design | **Manual timing on a real device** | ◐ |
| FR-044/045 | Online application, payment | USER_APPROVED (deferred) | 23 future | — | — | `FUTURE` |

## 5. Campus life and media

| Req | Requirement | Decision | Blueprint | Implementation | Verification | Status |
|---|---|---|---|---|---|---|
| FR-050–053 | Student life, sports, clubs, arts | USER | 08 §11 | `campus-life/*` | Route tests | ◐ |
| FR-054 | Gallery albums | USER | 08 §7 | `gallery` + `[slug]` | Integration | ◐ |
| **FR-055** | **Accessible lightbox** | **STANDARD** | 08 §7, 26 | `media/Lightbox` | **axe + manual keyboard + SR** | ◐ |
| FR-056 | Gallery filter | USER | 08 §7 | `FilterChips` | E2E | ◐ |
| FR-057 | Achievements | RESEARCH F-4 | 08 §11 | `achievements` ← `Achievement` | Integration | ◐ |

## 6. News, events, current-parent resources

| Req | Requirement | Decision | Blueprint | Implementation | Verification | Status |
|---|---|---|---|---|---|---|
| FR-060 | News index + detail | USER | 08 §10, §11 | `news` + `[slug]` | Integration + `Article` schema | ◐ |
| FR-061 | Events index + detail | USER | 08 §10, §11 | `events` + `[slug]` | Integration + `Event` schema | ◐ |
| **FR-062** | **Notices, distinct from News** | **RESEARCH F-2** | 06, 08 §5 | `notices` ← `Notice` | **E2E `notices-downloads`** | ◐ |
| FR-063 | Downloads with type + size | RESEARCH F-2 | 08 §11 | `downloads` ← `Document` | E2E + mobile download QA | ◐ |
| FR-064 | Academic calendar | USER | 08 §11 | `academic-calendar` | Route test | ◐ |
| FR-065 | Notice category filter | RESEARCH F-2 | 08 §5 | `FilterChips` | E2E | ◐ |
| FR-066 | Homepage news + events | USER | 08 §1 | Homepage section | E2E + empty state | ◐ |

## 7. Contact and trust

| Req | Requirement | Decision | Blueprint | Implementation | Verification | Status |
|---|---|---|---|---|---|---|
| FR-070 | Contact details | USER | 08 §8 | `contact` ← `SiteSetting` | **E2E + phone actually dialled** | ⛔ B-2 |
| FR-071 | Lazy-loaded map | USER | 08 §8, 27 | `media/LazyMap` | Performance QA — no CLS | ◐ |
| FR-072 | Separate department contacts | ARCHITECT | 08 §8 | `contact` | Manual | ◐ |
| FR-073 | Click-to-call / email | ARCHITECT | 08 §8, 24 | `tel:` / `mailto:` | E2E `contact` | ◐ |
| FR-074 | General contact form | USER | 24 | `contact` form | Integration | ◐ |
| FR-075 | Testimonials | RESEARCH F-4 | 08 §1 | `Testimonial` | Integration | ⛔ B-2 |

## 8. Legal and system

| Req | Requirement | Decision | Blueprint | Implementation | Verification | Status |
|---|---|---|---|---|---|---|
| FR-080/081 | Privacy policy, terms | STANDARD | 08 §11 | Static | **Legal review required** | ⛔ OD-017/018 |
| FR-082/083 | 404, error pages | STANDARD | 08 §11, 14 | `not-found`, `error` | **E2E `error-states`** | ◐ |
| FR-085 | Empty states everywhere | ARCHITECT | 11 | `feedback/EmptyState` | E2E `error-states` | ◐ |

## 9. Admin / CMS

| Req | Requirement | Decision | Blueprint | Implementation | Verification | Status |
|---|---|---|---|---|---|---|
| AR-001 | Admin auth | USER | 15, 19 | `admin/login`, `lib/auth` | Integration | ◐ |
| AR-002 | Three roles | ARCHITECT | 19 | `Role` enum | Integration | ◐ |
| **AR-003** | **Server-side authz on every action** | **STANDARD** | 19, 15, 18 | Every Server Action | **Full authz matrix + direct invocation** | ◐ |
| AR-004 | Role-aware dashboard | USER | 20 | `admin/page.tsx` | Manual | ◐ |
| AR-005 | CRUD for all content | USER | 20 | `admin/*` | Integration per module | ◐ |
| AR-006 | Draft/published states | ARCHITECT | 21 | `ContentStatus` | **Integration: drafts absent from public queries** | ◐ |
| AR-008 | Image upload + optimisation | USER | 22 | `uploadMedia` | Integration | ◐ |
| **AR-009** | **Alt text required** | **STANDARD** | 20, 22, 26 | Upload form | Integration + a11y | ◐ |
| AR-010/011 | Enquiry list, status transitions | USER | 23 | `admin/enquiries` | **E2E `admin-enquiry-workflow`** | ◐ |
| AR-012 | Internal notes | ARCHITECT | 23 | `EnquiryNote` | Integration — author recorded | ◐ |
| AR-014 | Editable site settings | ARCHITECT | 20, 21 | `admin/settings` | Integration | ◐ |
| AR-015 | User management | STANDARD | 19, 20 | `admin/users` | Integration | ◐ |
| AR-016 | Audit log | STANDARD | 15, 17 | `AuditLog` | **Integration: no PII in entries** | ◐ |
| AR-017 | Freshness indicators | RESEARCH F-3 | 20, 47 | Dashboard | Manual | ◐ |
| **AR-020** | **Publish in ≤3 steps** | **RESEARCH F-3** | 20 | Notice module | **Timed test with a non-technical person** | ◐ |

## 10. Content integrity

| Req | Requirement | Decision | Blueprint | Implementation | Verification | Status |
|---|---|---|---|---|---|---|
| CR-001 | Placeholder tokens | USER_APPROVED | 21, 60-policy | Throughout | **Launch scan for `[PLACEHOLDER]`** | ◐ |
| **CR-002** | **No fabricated data** | **USER_APPROVED** | 21, 02 | Seed, fixtures, content | **32 §1 — blocks release** | ◐ |
| CR-003 | No stock photography | ARCHITECT | 10, 21 | Content | Manual review | ⛔ B-2 |
| CR-004 | Meaningful alt text | STANDARD | 22, 26 | Upload | axe + manual | ◐ |
| **CR-005** | **Child imagery consent** | **ARCHITECT** | 48 | `MediaAsset.consentBasis` | **Process + technical check** | ◐ |
| CR-006 | Content ownership | RESEARCH F-3 | 47 | Governance | Handover checklist | ⛔ OD-022 |

## 11. Non-functional

| Req | Requirement | Blueprint | Verification | Status |
|---|---|---|---|---|
| NFR-001 | Core Web Vitals (field) | 27 | **Field data — not lab scores** | ◐ |
| NFR-002 | Mid-range Android on 4G | 27 | **Real device test** | ◐ |
| NFR-010 | WCAG 2.2 AA | 26 | axe **+ mandatory manual testing** | ◐ |
| NFR-011/012 | Keyboard, focus visible | 26 | **Manual keyboard walkthrough** | ◐ |
| NFR-013 | Contrast | 10, 26 | **Measured against the real palette** | ⛔ B-2 |
| NFR-016 | Reduced motion | 10, 26 | Manual | ◐ |
| NFR-023 | `School` structured data | 25 | Rich results test with **real** data | ⛔ B-2 |
| **NFR-028** | **Slug change → 301** | 21, 25 | **Integration: SlugHistory + redirect** | ◐ |
| NFR-029 | Global SEO configurable | 21, 25 | Integration | ◐ |
| NFR-030 | Indexable without JS | 25 | **Manual: JS disabled** | ◐ |
| NFR-040/041 | argon2id, secure sessions | 15, 28 | Integration + security review | ◐ |
| NFR-045 | Upload validation | 22, 28 | **Integration: SVG, executables, mislabelled** | ◐ |
| NFR-046/047 | Rate limiting, brute force | 15, 28 | Integration | ◐ |
| NFR-048 | No secrets in git | 28, 35 | **Secret scan — not assumption** | ◐ |
| NFR-050/051 | PII access control, retention | 23, 28 | **Integration: EDITOR blocked from enquiries** | ⛔ OD-011 |
| **NFR-052** | **EXIF stripping** | 22, 28, 48 | **Verified with a real GPS-tagged photo** | ◐ |
| NFR-060/061 | Backup + **restore test** | 34 | **Restore performed and recorded** | ◐ |
| **NFR-063** | **Failed enquiry alerted** | 24, 33 | **Alert verified by simulation** | ◐ |
| NFR-066 | Staging noindex | 25, 30 | Manual verification | ◐ |

---

## Gap analysis

Every `MUST` requirement has a named verification method. **No `MUST` requirement is unverifiable** — which is the primary thing this matrix exists to establish.

### Requirements blocked on external inputs

| Blocked on | Requirements |
|---|---|
| **B-2** school assets | FR-015, FR-016, FR-033, FR-034, FR-070, FR-075, CR-003, NFR-013, NFR-023 |
| **OD-011** retention period | NFR-051 |
| **OD-017/018** legal review | FR-080, FR-081 |
| **OD-022** content owners | CR-006 |

Twelve requirements are blocked on inputs outside engineering control — consistent with R-01 being the project's top risk.

### The requirements that must not be allowed to slip

Each traces directly to a research finding or to a failure mode with no recovery path:

| Req | Why |
|---|---|
| FR-002, FR-033 | The core research finding (F-1) — Indian school sites bury admissions and hide fees |
| FR-062 | The audience-separation decision (F-2) |
| FR-015, FR-016 | The under-served parental concerns (F-8) |
| AR-003 | An authorisation failure is a data breach |
| AR-020 | If this fails, the site rots (F-3) — the whole CMS investment is nullified |
| NFR-063 | A lost enquiry is invisible to everyone but the parent |
| NFR-052, CR-005 | Child safeguarding |
| CR-002 | Fabricated data on a real school's site is a misrepresentation |
