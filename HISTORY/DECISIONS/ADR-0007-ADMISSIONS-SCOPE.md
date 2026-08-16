# ADR-0007 — Admissions Scope

## Status
**Accepted** — scope chosen by the project owner

> This is the only ADR in the set that opens as `Accepted` rather than `Proposed`, because the decision it records was made directly by the owner rather than recommended by the architect.

## Date
2026-08-16

## Context

Admissions are the commercial purpose of the site. The research finding that shaped the whole project is that Indian K-12 school websites systematically fail at this: **all four Indian references inspected under-surfaced admissions on the homepage**, one not mentioning it at all, another using "Contact Us" as its entire admissions call-to-action. All four international references surfaced it prominently with a concrete CTA ([45_RESEARCH_SOURCES](../../BLUEPRINT/45_RESEARCH_SOURCES.md) F-1).

The question is how far the admissions *system* should go — from surfacing information, through capturing enquiries, to processing full applications.

## Problem

Decide the depth of the admissions system for v1.

## Options

### Option A — Enquiry-only
Parent submits a short form; the school follows up by phone or email. Admin tracks enquiries through a status workflow. No parent accounts, no uploads.

### Option B — Enquiry now, application later
Ship enquiry-only, but design the schema and admin modules so a full application flow can be added without migration pain.

### Option C — Full online application
Parent account, multi-step form, document upload (birth certificate, photographs, report cards), application status tracking visible to the parent.

## Decision

**Option A — enquiry-only for v1**, chosen by the project owner.

In practice the implementation follows Option B's discipline: the data model deliberately does not foreclose applications, so adding them later is additive rather than a migration of existing data ([16_DATABASE_ARCHITECTURE](../../BLUEPRINT/16_DATABASE_ARCHITECTURE.md)). But nothing in v1 is designed *around* that possibility.

## Rationale

Beyond it being the owner's decision, three things support it.

**1. It matches how the sector actually operates.** Every Indian K-12 reference inspected uses enquiry-then-phone-call. A full application portal would solve a problem the school does not have, for parents who do not expect it.

**2. It avoids a large and permanent privacy obligation.** Option C means parent accounts (with account recovery, a meaningful attack surface), and **uploaded identity documents relating to minors** — birth certificates, photographs, report cards. That requires encryption at rest, strict access control, a defined destruction schedule, and a materially larger duty of care. Taking that on should be a deliberate decision made with the school's full understanding, not a default.

**3. The conversion problem is upstream anyway.** The research finding was that these sites fail to surface admissions *at all*. Fixing that — homepage placement, a persistent CTA, findable fees, clear eligibility — is worth far more than a sophisticated application form that few parents would reach.

## Consequences

### Positive
- No parent authentication: no registration, no password reset, no account-recovery attack surface
- No identity documents about minors held by the system
- Substantially smaller security and privacy obligation
- Faster to build, so effort concentrates on the conversion path that actually matters
- The enquiry form can be short — five required fields, completable on a phone in under two minutes (FR-043)

### Negative
- Admissions staff do manual follow-up rather than reviewing submitted applications
- No parent-visible application status; parents phone to ask "what happens next?"
- The school gains less structured data per prospect

### Risks
- **Scope creep back toward Option C** (R-07). Mitigated by this ADR: expanding scope requires a superseding ADR that states the added privacy obligations explicitly
- **Enquiry loss.** With no parent account, a lost enquiry is unrecoverable — the parent cannot log in and check. This is why failed submissions alert at P1, show the school's phone number as fallback, and preserve typed values (NFR-063)

## What v1 includes

Enquiry form with five required fields · **student name optional**, minimising data about a minor · explicit timestamped consent · honeypot and rate limiting · admin enquiry list with status filtering · lifecycle `NEW → CONTACTED → IN_PROGRESS → RESOLVED → CLOSED` with actor and timestamp on every transition · internal notes with real authorship · email notification decoupled from the write · defined retention.

Full specification in [23_ADMISSIONS_SYSTEM](../../BLUEPRINT/23_ADMISSIONS_SYSTEM.md).

### One detail worth calling out
**The enquiry form remains available when admissions are closed.** A parent researching in the off-season is a genuine future admission; turning them away converts a warm lead into a phone call the office may never receive (J5).

## What v1 excludes — and what adding it would cost

| Excluded | Cost of adding |
|---|---|
| Parent accounts | Authentication for non-staff users; account recovery flows |
| Multi-step application | Save-and-resume state; partial-submission handling |
| **Document upload** | **Identity documents about minors** — encryption at rest, access control, destruction schedule |
| Parent-visible status | Public read access to enquiry records |
| Fee payment | Payment provider integration; financial data handling |

Recorded so that a future "can we just add uploads?" conversation starts from an accurate picture.

## Related

- [23_ADMISSIONS_SYSTEM](../../BLUEPRINT/23_ADMISSIONS_SYSTEM.md) · [24_CONTACT_AND_ENQUIRY_SYSTEM](../../BLUEPRINT/24_CONTACT_AND_ENQUIRY_SYSTEM.md) · [28_SECURITY](../../BLUEPRINT/28_SECURITY.md) T1
- Decision D-A2 in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
- Risk R-07 in [40_RISKS_AND_MITIGATIONS](../../BLUEPRINT/40_RISKS_AND_MITIGATIONS.md)
