# 04 — User Personas

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery) — archetypes, not validated against real users |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | UX / Product |
| **Dependencies** | [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) F-7, F-8 |
| **Related Documents** | [05_USER_JOURNEYS](05_USER_JOURNEYS.md) · [06_INFORMATION_ARCHITECTURE](06_INFORMATION_ARCHITECTURE.md) · [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) |

---

## Provenance and honesty statement

These personas are **research-derived archetypes**, not profiles of real people.

They are built from published literature on Indian parental school choice, documented parent search-intent research, and direct inspection of comparable school websites — all recorded in [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md).

**No interviews or surveys were conducted with this school's actual parent community.** Names and details are illustrative devices for design reasoning. They should be validated — and will likely need revision — once the school is identified and its real families can be consulted. This gap is registered in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

Personas are ordered by commercial importance to the school.

---

## P1 — Prospective Parent *(primary persona)*

> **"Priya", 34 — parent of a 5-year-old, evaluating schools for Class 1 admission**

The single most important user. When two design options conflict, this persona decides.

**Context.** Researching mostly on a phone, in fragments — during a commute, after the child is asleep. Comparing three to six schools simultaneously, often from a WhatsApp group recommendation or a Google search for "CBSE schools near [locality]". Rarely gives any one site more than a few minutes on the first visit.

**Goals**
- Establish quickly whether the school is a plausible fit: location, board, grade range, fees
- Judge whether it is safe and well-run
- Understand the admission process and whether the window is open
- Make contact without committing to a phone call

**Information needed, in priority order**
1. Where is it, and is it commutable? Is there transport?
2. What does it cost? *(a stated primary selection factor — F-8)*
3. Is my child the right age and eligible?
4. Is it safe? *(CCTV, child protection policy, emergency procedures — F-8)*
5. Are the teachers qualified?
6. What are the results?
7. What is campus life like?
8. How do I apply, and by when?

**Frustrations**
- Fee information absent or hidden behind a phone call
- No way to tell if admissions are currently open
- "Contact Us" as the only call to action *(observed on a real reference site — F-1)*
- Stale content that signals the school is disorganised *(a six-year-old notice was observed live — F-3)*
- Sites that require a desktop to be usable
- Generic stock imagery that reveals nothing about the actual campus

**Success criterion.** Within two minutes on a phone she can answer *"is this school worth a visit?"* and, if yes, submit an enquiry without leaving the site.

**Design implications** — FR-002 (homepage admissions CTA), FR-033 (findable fees), FR-015/016 (safety and transport pages), FR-043 (two-minute mobile enquiry), NFR-002 (mid-range Android).

---

## P2 — Current Parent

> **"Rakesh", 41 — parent of a Class 7 student**

Already sold. Never being marketed to again. Visits far more often than P1 and is the school's loudest word-of-mouth channel.

**Context.** Arrives with a specific, urgent, narrow question, usually prompted by a WhatsApp message from another parent. Almost always on mobile. Wants to leave immediately once the answer is found.

**Goals**
- Find the latest circular or notice
- Check holiday and exam dates
- Download a form or document
- Check event timings

**Frustrations**
- Notices buried inside general news *(observed across all four Indian references — F-2)*
- Undated documents, so it is unclear which version is current
- Having to phone the office for something that should be on the website
- Downloads that open in a viewer instead of downloading on mobile

**Success criterion.** Finds the holiday list in under thirty seconds on a phone without logging in.

**Design implications** — FR-062 (Notices distinct from News), FR-063 (Downloads with file type and size), FR-064 (academic calendar), FR-004 (current-parent quick links).

> **Why this persona is funded.** A current parent who cannot find the exam schedule tells other parents the school is disorganised — which directly damages P1's decision. Serving P2 is a marketing investment, not a maintenance cost.

---

## P3 — Prospective Student

> **"Aarav", 12 — deciding on a Class 8 transfer alongside his parents**

Not the decision-maker, but an influencer whose enthusiasm or indifference carries weight in a family conversation.

**Goals.** See what daily life looks like — sports, clubs, events, other students. Judge whether he would enjoy being there.

**Frustrations.** Text-heavy pages written entirely for adults; no photographs of actual students; nothing about sports or activities.

**Design implications** — FR-050/051/052 (campus life, sports, clubs), FR-054 (gallery), image-led layouts.

---

## P4 — Admissions Staff Member

> **"Sunita" — admissions coordinator, `ADMISSIONS_MANAGER`**

Handles enquiries; success is measured in enrolled students.

**Goals**
- See new enquiries promptly
- Know which have been contacted and which have not
- Record call outcomes
- Avoid losing an enquiry

**Frustrations**
- Enquiries arriving only as email, with no tracking
- No way to tell whether a colleague has already called
- Losing context between a first call and a follow-up two weeks later

**Success criterion.** Opens the dashboard and immediately sees which enquiries need a call today.

**Design implications** — AR-010 (status filtering), AR-011 (status transitions with actor and timestamp), AR-012 (internal notes), NFR-063 (failed submissions alerted).

---

## P5 — Content Editor

> **"Meera" — teacher and activities coordinator, `EDITOR`. Comfortable with WhatsApp and Google Docs. Not technical.**

The persona on whom content freshness depends. If the CMS intimidates her, the site rots — which is exactly the observed failure mode in the reference sites.

**Goals.** Publish a notice, add a news item after an event, upload photographs from a competition.

**Frustrations**
- Interfaces with unexplained jargon
- Fear of breaking something public
- Too many required fields for a two-line notice
- Uploading photos one at a time
- No way to preview before publishing

**Success criterion.** Publishes a notice in under three minutes, on her first attempt, without help.

**Design implications** — AR-020 (publish in ≤3 steps), AR-006 (drafts), AR-018 (preview), AR-008 (upload with automatic optimisation), AR-009 (alt text required — with a plain-language explanation of why).

> **Design tension, stated openly.** AR-009 requires alt text, which adds friction for exactly the persona most sensitive to friction. This is accepted deliberately: accessibility is a `MUST`, and the field will be presented with a one-line explanation rather than a bare label. The tension is real and should be watched during usability testing.

---

## P6 — Principal / School Management

> **"Dr. [PRINCIPAL_NAME]" — `SUPER_ADMIN`**

Accountable for how the school is represented. Low-frequency, high-stakes usage.

**Goals.** Ensure accuracy and appropriate tone; know how many enquiries are coming in; control who can publish.

**Frustrations.** Discovering incorrect public information after the fact; no visibility into who changed what.

**Design implications** — AR-016 (audit log), AR-015 (user management), AR-004 (dashboard), AR-017 (freshness indicators).

---

## P7 — Website Administrator / Developer

Maintains and extends the system, possibly a different person or agency from whoever built it.

**Goals.** Understand the system without the original author; make changes safely; diagnose problems.

**Frustrations.** Undocumented decisions; blueprint drifted from code; unclear which parts are load-bearing.

**Design implications** — the entire `BLUEPRINT/` and `HISTORY/` system, NFR-074 (drift recorded), [99_CLAUDE_WORKING_RULES](99_CLAUDE_WORKING_RULES.md).

---

## Secondary audiences

Served, but not optimised for. No design trade-off is resolved in their favour.

| Audience | Need | Provision |
|---|---|---|
| Prospective staff | Vacancies, how to apply | Careers page (`COULD`, FR-076) |
| Alumni | Reconnection, news | Achievements and news; alumni portal is `FUTURE` |
| Local community / press | Contact, factual details | Contact page, structured data |
| CBSE / regulators | Mandatory disclosure documents | Downloads module |

---

## Persona → priority map

Used as a tie-breaker when requirements compete for the same space.

| Priority | Persona | Rationale |
|---|---|---|
| 1 | P1 Prospective Parent | Drives admissions; the school's commercial reason for the site |
| 2 | P2 Current Parent | Highest frequency; drives reputation |
| 3 | P5 Content Editor | Without her, the site decays and P1/P2 are both failed |
| 4 | P4 Admissions Staff | Converts P1's interest into enrolment |
| 5 | P3 Prospective Student | Influences P1's decision |
| 6 | P6 Management | Low frequency, high stakes |
| 7 | P7 Developer | Enables all of the above over time |

**Worked example.** If a visually striking full-screen hero animation delays the moment P1 can see the school's name, board, and admissions CTA, the animation loses. P1 outranks aesthetics.
