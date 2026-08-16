# 05 — User Journeys

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery) |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | UX |
| **Dependencies** | [04_USER_PERSONAS](04_USER_PERSONAS.md) · [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) F-7 |
| **Related Documents** | [06_INFORMATION_ARCHITECTURE](06_INFORMATION_ARCHITECTURE.md) · [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) · [23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md) · [31_TESTING_STRATEGY](31_TESTING_STRATEGY.md) |

---

## Purpose

Each journey below is a path a real user must be able to complete. Journeys marked **critical** become end-to-end tests ([31_TESTING_STRATEGY](31_TESTING_STRATEGY.md)) — a journey that cannot be tested is a journey nobody will notice breaking.

Entry points are anchored to the five documented parent search intents (F-7): informational, discovery, comparative, transactional, navigational.

---

## J1 — Prospective parent discovers and enquires ⭐ **critical**

**Persona:** P1 · **Intent:** discovery → comparative → transactional · **Device:** mobile · **Duration:** 2–10 min across 1–3 visits

```
Google: "cbse school near [locality]"
   │
   ▼
Homepage ──► identity, board, grades, stats, admissions CTA visible without scrolling far
   │
   ├──► Fee Structure ──────────► "can we afford it?"
   ├──► Admissions › Eligibility ► "is my child the right age?"
   ├──► Safety & Security ──────► "is it safe?"
   ├──► Transport ─────────────► "can we get there?"
   ├──► Academics ─────────────► "what will they learn?"
   ├──► Faculty ───────────────► "who teaches?"
   └──► Gallery ───────────────► "what does it actually look like?"
   │
   ▼
Admissions Overview ──► process, dates, documents
   │
   ▼
Enquiry Form ──► submit ──► confirmation with expected response time
```

**Critical moments**
| Moment | Failure risk | Mitigation |
|---|---|---|
| First 5 seconds | Cannot tell what school this is or whether it fits | FR-001: identity, board, grade range above the fold |
| Fee lookup | Fees hidden → abandonment, distrust | FR-033: fees are a first-class navigable page, not a phone call |
| Safety question | Answer scattered through infrastructure prose | FR-015: dedicated page |
| Enquiry decision | Generic "Contact Us" creates no urgency | FR-002: specific, current CTA |
| Form completion | Long form on mobile → abandonment | FR-043: ≤2 minutes; minimal required fields |

**Success:** enquiry submitted, confirmation shown, school notified.
**Measured by:** `enquiry_submitted`, homepage → admissions CTA click rate, fee-page reach rate ([29_ANALYTICS](29_ANALYTICS.md)).

> **Note:** this journey is rarely linear or single-session. A parent may check fees on Monday and enquire on Thursday. Every page in the middle band must therefore carry its own route back to the admissions CTA — no page is a dead end.

---

## J2 — Prospective parent evaluates against alternatives

**Persona:** P1 · **Intent:** comparative · **Device:** mobile or desktop

```
Homepage ──► About ──► Vision & Mission ──► Principal's Message
   │                                              │
   ▼                                              ▼
Academics › Curriculum                   Leadership / Faculty
   │                                              │
   └──────────────► Achievements ◄────────────────┘
                          │
                          ▼
                   Infrastructure ──► Gallery
                          │
                          ▼
                  Admissions CTA
```

**What the parent is really asking:** *"Why this school rather than the other three on my list?"*

**Design implication.** Differentiation must be concrete: named accreditations, real results, qualified faculty, actual facilities. Generic claims ("holistic development", "world-class") are indistinguishable across schools and do no comparative work. Every strong reference site used **quantified** trust signals (F-4).

**Success:** parent forms a specific, articulable reason to prefer this school.

---

## J3 — Current parent retrieves a document ⭐ **critical**

**Persona:** P2 · **Intent:** navigational · **Device:** mobile · **Duration:** target < 30s

```
Direct / Google: "[school name] holiday list"
   │
   ▼
Homepage ──► Quick Links (current parents) ──► Notices  or  Downloads
   │                                              │
   ▼                                              ▼
Notices list (reverse chronological, dated)   Downloads (categorised, type + size shown)
   │                                              │
   └──────────────► open / download ◄─────────────┘
```

**Critical moments**
| Moment | Failure risk | Mitigation |
|---|---|---|
| Entry | Notices buried under a "Media" or "Happenings" menu | FR-003: literal labels; FR-004: quick links |
| Scanning | Cannot tell which document is current | Every item dated; expired notices handled explicitly |
| Download on mobile | File opens in a viewer instead of downloading | File type and size shown; correct content-disposition |

**Success:** document obtained in under thirty seconds, no phone call to the office.

> This journey is the most frequent on the entire site and the one most often designed last. It is `MUST` priority precisely because it is unglamorous.

---

## J4 — Visitor finds contact details / directions

**Persona:** P1, P2, or public · **Intent:** navigational · **Device:** mobile

```
Any page ──► Footer or Nav ──► Contact
   │
   ├──► tap phone number ──► dials
   ├──► tap email ────────► mail client
   └──► tap map ──────────► device maps app with directions
```

**Design implications.** Click-to-call and click-to-email are mandatory on mobile (FR-073). The embedded map is lazy-loaded so it never blocks first render (FR-071) — a map iframe is one of the heaviest things a school website typically loads.

**Success:** contact made, or directions opened, in two taps from any page.

---

## J5 — Prospective parent checks whether admissions are open

**Persona:** P1 · **Intent:** transactional · **Duration:** < 20s

```
Google: "[school name] admission 2026"
   │
   ▼
Admissions Overview ──► current cycle status + important dates clearly visible
   │
   ├── open ────► Process ──► Eligibility ──► Enquiry Form
   └── closed ──► clear statement + next cycle date + enquiry option anyway
```

**Critical design point.** The **closed** state must be handled as deliberately as the open one. A page that simply says nothing leaves the parent unsure whether the information is missing or the window has passed — and they will phone the office to find out. An explicit "Admissions for 2026–27 are closed; the 2027–28 cycle opens in [MONTH]" converts a dead end into a captured enquiry.

**Content-freshness dependency.** This page carries the highest staleness risk on the entire site: an out-of-date admission window is actively misleading. Assigned the shortest freshness threshold in [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md).

---

## J6 — Prospective student explores campus life

**Persona:** P3 · **Device:** mobile

```
Homepage ──► Campus Life ──► Sports / Clubs / Arts ──► Gallery ──► Events / Achievements
```

**Design implication.** Image-led, low text density, real students. This journey has no conversion goal — its job is to make the family conversation positive.

---

## J7 — Admin publishes a notice ⭐ **critical**

**Persona:** P5 (Content Editor) · **Target:** < 3 minutes, first attempt, unaided

```
/admin/login ──► credentials ──► Dashboard
   │
   ▼
Notices ──► "New Notice"
   │
   ▼
Title · Category · Body · optional attachment · optional expiry
   │
   ├──► Save as Draft ──► Preview
   └──► Publish
           │
           ▼
    Live within seconds (cache revalidated by tag)
    Audit log entry recorded
```

**Critical moments**
| Moment | Failure risk | Mitigation |
|---|---|---|
| Login | Editor cannot get in, gives up | Simple credentials login; clear error messages |
| Form | Too many required fields for a two-line notice | Only title, category and body required |
| Publish | Fear of breaking something public | Draft + preview before publish (AR-006, AR-018) |
| After publish | Change not visible; editor republishes repeatedly | Tag-based revalidation with read-your-writes semantics |

**Success:** notice live in under three minutes; editor is confident enough to do it again next week.

> This journey determines whether the site stays alive. Both observed staleness failures (F-3) are failures of *this* journey, not of the public site.

---

## J8 — Admissions staff works an enquiry ⭐ **critical**

**Persona:** P4 · **Frequency:** daily during admission season

```
Enquiry submitted (J1) ──► DB record (status NEW) ──► email notification
   │
   ▼
/admin/enquiries ──► filter: NEW
   │
   ▼
Open enquiry ──► parent + student details, source, timestamp
   │
   ▼
Call parent ──► set status CONTACTED ──► add internal note
   │
   ▼
IN_PROGRESS (visit scheduled) ──► RESOLVED (admitted / declined) ──► CLOSED
```

Every transition records **who** and **when** (AR-011). Full lifecycle in [23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md).

**Critical moments**
| Moment | Failure risk | Mitigation |
|---|---|---|
| Notification | Enquiry submitted but never seen — a lost admission | NFR-063: failed submissions logged **and alerted** |
| Triage | Cannot tell what needs a call today | Status filtering; dashboard count of `NEW` |
| Handover | Colleague repeats a call already made | Internal notes; actor recorded on each transition |

---

## J9 — Management reviews site integrity

**Persona:** P6 · **Frequency:** monthly

```
Dashboard ──► enquiry volume, recent publishing activity
   │
   ├──► Content freshness flags ──► identify stale pages
   ├──► Audit log ──────────────► who changed what
   └──► Users ──────────────────► review who holds access
```

Low frequency, but it is the only mechanism that catches content drift before a parent does.

---

## J10 — Error and empty states

Not a journey so much as the set of states every journey can fall into. Each must be designed, not defaulted.

| State | Requirement |
|---|---|
| 404 | Explain, offer search paths back to major sections (FR-082) |
| 500 | Apologise, offer phone number — the parent still needs the school (FR-083) |
| Empty listing | Explain why it is empty and what will appear (FR-085) |
| Form validation error | Inline, specific, announced to assistive technology (NFR-015) |
| Enquiry submission failure | **Never silently fail.** Show the office phone number as fallback, log and alert (NFR-063) |
| Slow network | Skeletons for content; never a blank screen |
| JavaScript disabled | Core content and navigation still readable (NFR-030) |

> The enquiry-failure state is the highest-stakes error on the site. A parent who submits an enquiry that vanishes is a lost admission the school never knows it had.

---

## Journey → test coverage

| Journey | Critical | E2E test |
|---|---|---|
| J1 Discover and enquire | ✅ | `admissions-enquiry.spec` |
| J2 Comparative evaluation | | Covered by navigation smoke tests |
| J3 Current parent retrieves document | ✅ | `notices-downloads.spec` |
| J4 Contact / directions | | `contact.spec` |
| J5 Admission cycle status | ✅ | Included in `admissions-enquiry.spec` |
| J6 Campus life exploration | | Navigation smoke tests |
| J7 Admin publishes notice | ✅ | `admin-publish.spec` |
| J8 Admissions staff works enquiry | ✅ | `admin-enquiry-workflow.spec` |
| J9 Management review | | Manual |
| J10 Error and empty states | ✅ | `error-states.spec` |

Six critical journeys, six required end-to-end suites. Detailed in [31_TESTING_STRATEGY](31_TESTING_STRATEGY.md).
