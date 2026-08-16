# 24 — Contact and Enquiry System

| Field | Value |
|---|---|
| **Status** | PROPOSED |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product / Backend Lead |
| **Dependencies** | [23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md) |
| **Related Documents** | [28_SECURITY](28_SECURITY.md) · [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) |

> Enquiry **lifecycle, privacy, and admin workflow** are specified in [23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md). This document covers contact channels, the general contact form, and the shared submission mechanics.

---

## Contact channels

A parent decides how to make contact based on urgency and their own comfort. All four routes must work.

| Channel | Use | Requirement |
|---|---|---|
| **Phone** | Urgent, and most parents' first instinct | Click-to-call on mobile; visible in the utility bar and footer on every page |
| **Admission enquiry form** | Considered, out of hours | `/admissions/enquire` |
| **General contact form** | Non-admission questions | `/contact` |
| **Email** | Documents, formal | Click-to-email; distinct addresses per department |
| **In person** | Visits | Address, map, office hours |

> Phone is deliberately the most prominent. Research on Indian parental behaviour and every inspected reference site show phone contact remains dominant; making a parent hunt for a number to give the school money is self-defeating.

---

## Two forms, two purposes

Deliberately separate rather than one form with a "reason" dropdown.

| | **Admission enquiry** | **General contact** |
|---|---|---|
| Route | `/admissions/enquire` | `/contact` |
| Audience | Prospective parents (P1) | Anyone |
| Purpose | Conversion | Correspondence |
| Fields | Parent, student, class, year, locality | Name, email, phone, subject, message |
| Stored as | `AdmissionEnquiry` | `AdmissionEnquiry` with `source: 'contact'` |
| Workflow | Full lifecycle, assignment, notes | Same, typically resolved quickly |
| Routed to | Admissions | Office |

**Why one storage entity for both.** They share status workflow, notification, privacy handling, and admin UI. A second near-identical table would duplicate all of it and produce two inboxes staff must remember to check. The `source` field distinguishes them for filtering and reporting.

**Why two forms.** A parent asking about admission needs to state a class and year. A vendor asking about a tender does not. One combined form with conditional fields is worse for both.

---

## General contact form

| Field | Required | Validation |
|---|---|---|
| Name | ✅ | 2–100 chars |
| Email | ✅ | RFC-valid |
| Phone | ➖ | Indian mobile format if given |
| Subject | ✅ | Select: Admission · Fees · Transport · General · Careers · Feedback |
| Message | ✅ | 10–1000 chars |
| Consent | ✅ | Explicit, links to privacy policy |
| Honeypot | — | Must be empty |

The subject select exists so the office can route without reading every message, and so reporting can show what parents actually ask about — which is useful input for the FAQ page.

---

## Contact page requirements

Beyond the form:

- **Full postal address in real text** — never an image, and never map-only. It must be selectable, copyable, and readable by a screen reader
- Phone numbers as `tel:` links, adequately sized for touch
- Email addresses as `mailto:` links
- Office hours, including whether Saturdays differ
- Separate contacts: admissions · general office · principal's office · transport
- Embedded map, **lazy-loaded behind a click-to-load placeholder** — a map iframe is typically the heaviest asset on a school website and must never block first render (FR-071)
- Directions in prose, plus public-transport notes
- `School` structured data with `address`, `telephone`, `openingHours`, `geo`

---

## Submission mechanics

Shared by both forms.

```
Client: React Hook Form + Zod (instant feedback)
   ▼
Server Action  ← authoritative
   ├─ honeypot check
   ├─ rate limit (per IP)
   ├─ Zod re-validation
   ├─ normalise (trim, lowercase email, strip phone formatting)
   ▼
Persist AdmissionEnquiry (status NEW)
   ▼
   ├──► notify school ──── failure → LOG + ALERT
   └──► confirmation to submitter
```

Server-side validation is authoritative. The client schema is convenience, never a control. Both use **one shared Zod schema** ([15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md)).

### Progressive enhancement
Both forms post to a Server Action and **work without JavaScript**. Client-side validation is an enhancement. A parent on a restricted network or an older device must still be able to contact the school.

---

## Success and failure states

### Success
On-screen confirmation stating **when the school will respond** ("We usually reply within 2 working days"). Not a bare "Thank you" — a parent who does not know when to expect a reply will phone anyway, which defeats the purpose.

No enquiry ID is shown; it is meaningless to the parent.

### Failure — the highest-stakes state on the site

```
Submission fails
   ▼
Show: apology + [PHONE_NUMBER] + "please call us"
Preserve: every value the parent typed
Log: full context, server-side
ALERT: immediately
```

**Never a silent failure. Never a generic "something went wrong" with no route forward.**

A parent whose enquiry vanishes is a lost admission the school never learns it had — the failure is invisible to everyone except the parent, who simply concludes the school is unresponsive (NFR-063, J10).

Losing typed values is a second, separate failure: a parent who has to retype everything usually does not.

---

## Accessibility

Forms are where accessibility failures most directly cost the school money — an inaccessible enquiry form is a parent who cannot make contact.

| Requirement | Detail |
|---|---|
| Labels | Visible, programmatically associated. **Never placeholder-as-label** |
| Required state | Indicated in text, not colour or asterisk alone |
| Errors | Inline, specific, `aria-describedby`-linked, `aria-live`-announced |
| Error summary | On failed submit, focus moves to a summary listing each error as a link |
| Error styling | Colour **and** icon **and** text — never colour alone |
| Keyboard | Full operability; logical tab order |
| Touch targets | ≥44×44px |
| Autofill | Correct `autocomplete` attributes (`name`, `tel`, `email`) |
| Input types | `type="tel"`, `type="email"` so mobile shows the right keyboard |
| Submission | Status announced to assistive technology |

Error messages are specific: **"Enter a 10-digit mobile number"**, never "Invalid input".

---

## Spam protection

| Control | Rationale |
|---|---|
| Honeypot | Catches most naive bots at zero cost and zero friction to real parents |
| Rate limiting — 3/IP/hour | Forgiving of shared household and office connections |
| Strict schema | Length caps, enum constraints, type checks |
| Duplicate flagging | Flagged, **never rejected** — may be a genuine resubmission |
| CAPTCHA | **Held in reserve** |

> CAPTCHA is deliberately not deployed up front. It measurably reduces genuine completions and creates real accessibility barriers, in exchange for a problem that may never materialise at this traffic level. It is added only if spam actually becomes a burden — and if it is, an accessible variant must be chosen.

---

## Privacy

Both forms collect personal data and are governed by the controls in [23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md) §Privacy: explicit consent with timestamp, purpose limitation, role-restricted access, audited reads and exports, defined retention, real deletion.

The privacy policy must state plainly what is collected, why, how long it is kept, and how to request deletion — and it must be linked **at the point of collection**, not only in the footer.

⚠️ Legal wording requires review by the school's legal advisor ([39_OPEN_DECISIONS](39_OPEN_DECISIONS.md)).

---

## Operational expectations

Technical delivery only works if someone answers. Recorded here because it is a real dependency, and it is the school's to own:

| Expectation | Target |
|---|---|
| Enquiry acknowledged | Same working day |
| First contact attempt | Within 2 working days |
| Dashboard checked | Daily during admission season |
| `NEW` count | Should trend to zero |

A perfectly engineered enquiry system with nobody reading the dashboard reproduces exactly the unresponsiveness it was built to fix. Included in handover ([47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md)).
