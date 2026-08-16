# 23 — Admissions System

| Field | Value |
|---|---|
| **Status** | PROPOSED — scope is `USER_APPROVED_DECISION` |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product |
| **Dependencies** | [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) · [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) |
| **Related Documents** | [24_CONTACT_AND_ENQUIRY_SYSTEM](24_CONTACT_AND_ENQUIRY_SYSTEM.md) · [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) · [28_SECURITY](28_SECURITY.md) |

---

## Scope — enquiry-only

**`USER_APPROVED_DECISION`.** Version 1 captures enquiries. It does not process applications.

| In scope | Out of scope (`FUTURE`) |
|---|---|
| Public admissions information pages | Parent accounts / login |
| Enquiry form | Multi-step application form |
| Enquiry storage and lifecycle | Document upload (birth certificate, report cards) |
| Admin enquiry management | Application status tracking |
| Email notification to the school | Online fee payment |
| Status workflow with audit trail | Automated eligibility checking |

### Why this is the right scope

Beyond it being the owner's decision, three things support it:

1. **It matches how the sector actually operates.** Every Indian K-12 reference inspected uses enquiry-then-phone-call, not online applications (F-1). A full application portal would be solving a problem the school does not have.
2. **It avoids a large and permanent security and privacy surface.** Applications mean parent accounts, uploaded identity documents about minors, and the account-recovery flows that come with them. That is a substantial ongoing obligation, taken on only if genuinely needed.
3. **The conversion problem is upstream anyway.** The research finding was that Indian school sites fail to surface admissions at all (F-1). Fixing that is worth far more than a sophisticated application form nobody reaches.

The data model does not foreclose applications later — adding them is additive, not a migration of existing data ([16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md)).

---

## Public admissions journey

```
Homepage / Search
     ▼
/admissions ────────── overview + CYCLE STATUS
     │
     ├── /admissions/eligibility      "is my child the right age?"
     ├── /admissions/fees             "can we afford it?"
     ├── /admissions/process          "what happens?"
     ├── /admissions/important-dates  "by when?"
     └── /admissions/faqs
     ▼
/admissions/enquire ── form
     ▼
Confirmation + expected response time
```

Every page in the middle band links back to the enquiry form. A parent who has just answered their fee question is at a decision point and must not have to navigate to act.

### Cycle status — a designed three-state system

The `/admissions` page must always declare which state the cycle is in. It is held in `SiteSetting` and editable by `ADMISSIONS_MANAGER` or `SUPER_ADMIN`.

| State | Page shows | Form |
|---|---|---|
| **OPEN** | "Admissions for [YEAR] are open", dates, process | Enabled, prominent |
| **OPENING SOON** | "Admissions for [YEAR] open on [DATE]" | Enabled — captures early interest |
| **CLOSED** | "Admissions for [YEAR] are closed. [NEXT_YEAR] opens [MONTH]." | **Still enabled** |

**The form stays available in every state.** A parent researching in the off-season is a genuine future admission; turning them away converts a warm lead into a phone call the office may never receive.

> The closed state must be *explicit*. Silence leaves a parent unable to tell whether information is missing or the window has passed — and they will phone to find out (J5). This page carries the shortest freshness threshold on the site.

---

## Enquiry lifecycle

```
   Parent submits
        │
        ▼
  ┌─────────┐
  │   NEW   │  ← unworked; drives the dashboard count
  └────┬────┘
       │ staff calls / emails
       ▼
  ┌───────────┐
  │ CONTACTED │  ← first contact made; contactedAt set
  └────┬──────┘
       │ visit booked, documents discussed, ongoing
       ▼
  ┌─────────────┐
  │ IN_PROGRESS │
  └────┬────────┘
       │ outcome reached
       ▼
  ┌──────────┐
  │ RESOLVED │  ← admitted, declined, or withdrawn; resolvedAt set
  └────┬─────┘
       │ nothing further required
       ▼
  ┌────────┐
  │ CLOSED │  ← closedAt set; retention clock starts
  └────────┘
```

### Transition rules

| From | To | Who | Recorded |
|---|---|---|---|
| — | `NEW` | System | `createdAt`, `consentAt` |
| `NEW` | `CONTACTED` | `ADMISSIONS_MANAGER` | `contactedAt`, actor |
| `CONTACTED` | `IN_PROGRESS` | `ADMISSIONS_MANAGER` | actor |
| any | `RESOLVED` | `ADMISSIONS_MANAGER` | `resolvedAt`, actor |
| `RESOLVED` | `CLOSED` | `ADMISSIONS_MANAGER` | `closedAt`, actor |
| any | any (correction) | `SUPER_ADMIN` | actor + audit |

Every transition records **who** and **when** (AR-011). Backward transitions are permitted — real conversations do not follow a state machine, and a parent who goes quiet and then re-engages should not require a new record.

**No automatic transitions.** A status means a human did something. A system that auto-advances to `CONTACTED` after an email would be recording a fiction.

---

## Admin enquiry management

### List view — `/admin/enquiries`
Default filter `NEW`, newest first — the view opens on "who needs a call today" (J8).

Columns: parent name · phone · class applying · locality · status · assigned to · received. Filters: status, class, academic year, assignee. Search across name, phone, email.

### Detail view — `/admin/enquiries/[id]`
Full submitted details · status control · assignment · **internal notes thread** · complete timeline · click-to-call and click-to-email.

### Internal notes
Each note is a separate `EnquiryNote` record with a real author and timestamp — not a free-text blob. This is what stops two staff members calling the same parent, and preserves context between a first call and a follow-up weeks later.

Notes are internal only and never visible to the parent.

### Assignment
Enquiries may be assigned to a specific staff member. Unassigned enquiries stay visible to all `ADMISSIONS_MANAGER` users so nothing is orphaned by an absence.

---

## Notification

```
Enquiry committed to database
        │
        ├──► Email to school ──── failure → LOG + ALERT
        └──► Optional acknowledgement to parent
```

**The enquiry write never depends on email succeeding.** If the provider is down, the enquiry is still recorded, and the failure is alerted so staff work from the dashboard instead.

The notification email contains enough to triage — parent name, class applying, locality — plus a link into the admin record. **It does not contain the full message body**, so personal data does not proliferate into inboxes and forwarded threads unnecessarily.

> A failed notification that nobody notices is functionally identical to a lost enquiry. This is why it alerts rather than merely logging (NFR-063).

---

## Privacy and data protection

Enquiry records contain personal data about a parent **and, optionally, about a minor**. This is the most sensitive data the system holds.

| Control | Implementation |
|---|---|
| Minimisation | Only five required fields. **Student name is optional** — a parent at first-enquiry stage need not name their child |
| Consent | Explicit checkbox, not pre-ticked; `consentAt` timestamped; privacy policy linked at the point of collection |
| Purpose limitation | Collected to respond to an admission enquiry. Not for marketing without separate consent |
| Access control | `ADMISSIONS_MANAGER` and `SUPER_ADMIN` only. **`EDITOR` cannot reach enquiry data by any route** |
| Access logging | Reads of enquiry detail and all exports are audited |
| Audit hygiene | Audit entries record *that* an enquiry changed state — **never the parent's contact details** |
| Export control | Permitted for `ADMISSIONS_MANAGER`, always logged; bulk PII leaving the system is a deliberate act |
| Retention | Defined period after `CLOSED`, then deleted or anonymised |
| Deletion | Real deletion, not soft delete — `SUPER_ADMIN` only |
| Transport | HTTPS throughout |

⚠️ **Retention period is an `OPEN_DECISION`.** It is the school's data-protection obligation and cannot be chosen by an engineer. Recommended default until confirmed: **24 months after closure**, long enough to cover a re-application in a later cycle. Registered in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

**Backups contain enquiry PII** and inherit the same access restrictions ([34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md)).

---

## Spam and abuse

A public form attached to a school's inbox will attract automated submissions.

| Control | Detail |
|---|---|
| Honeypot | Hidden field that must remain empty. Catches most naive bots, costs nothing, and — unlike a CAPTCHA — creates zero friction for real parents |
| Rate limiting | 3 submissions per IP per hour. Forgiving enough for a family with two children on a shared connection |
| Schema validation | Strict types, length caps, enum-constrained class values |
| Duplicate detection | Identical phone + class + academic year within 24 hours is flagged, **not rejected** — it may be a genuine resubmission after an error |
| CAPTCHA | **Held in reserve.** Adds real friction and accessibility burden. Deploy only if spam actually becomes a problem |

> Deliberately not adding a CAPTCHA up front. It measurably reduces genuine completions and creates accessibility problems, in exchange for solving a problem that may never materialise at this traffic level.

---

## Metrics

| Metric | Why |
|---|---|
| Enquiries per month | Primary success measure |
| Homepage → admissions CTA click rate | Tests the F-1 fix directly |
| Enquiry form start → submit rate | Detects form friction |
| Fee page → enquiry rate | Tests whether publishing fees helps or deters |
| Time from `NEW` to `CONTACTED` | Operational responsiveness |
| Enquiries by class and locality | Informs the school's planning and transport routes |
| Failed submissions | **Must be zero** |

Detailed in [29_ANALYTICS](29_ANALYTICS.md).

---

## Future scope

If the school later wants full applications, the additive path is:

1. `Application` and `ApplicationDocument` entities, linked to `AdmissionEnquiry`
2. Parent authentication — the largest single addition, bringing account recovery and session security for non-staff users
3. Multi-step form with save-and-resume
4. Secure document upload — **identity documents relating to minors**, requiring encryption at rest, strict access control, and a defined destruction schedule
5. Status tracking visible to the parent
6. Optional payment integration

**None of this is designed for now.** Step 4 in particular is a materially larger obligation than anything in v1, and should only be undertaken with the school's explicit understanding of what it involves.
