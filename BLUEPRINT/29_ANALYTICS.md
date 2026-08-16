# 29 — Analytics

| Field | Value |
|---|---|
| **Status** | PROPOSED — vendor undecided |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product |
| **Dependencies** | [02_PRODUCT_VISION](02_PRODUCT_VISION.md) |
| **Related Documents** | [23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md) · [25_SEO_STRATEGY](25_SEO_STRATEGY.md) · [28_SECURITY](28_SECURITY.md) |

---

## Purpose

Analytics exists to answer a small number of questions the school actually has, and to test whether this project's central design bets worked. It is not for collecting data because collecting data is possible.

**The questions:**
1. Are parents finding the site, and through what?
2. Do they reach the admissions path? *(tests the F-1 fix)*
3. Do they submit enquiries?
4. Where do they drop out?
5. Do current parents find notices and downloads? *(tests the F-2 decision)*
6. Is the site fast on real devices?

Anything that answers none of these is not collected.

---

## Vendor — undecided

`OPEN_DECISION`. Two candidates, both acceptable.

| | **Privacy-focused analytics** (e.g. Plausible) | **Platform analytics** (e.g. Vercel Analytics) |
|---|---|---|
| Personal data | No cookies, no cross-site identifiers | Minimal |
| Consent banner | Typically not required | Typically not required |
| Weight | Very light | Very light |
| Core Web Vitals field data | Limited | Built in |
| Cost | Paid, modest | Included at low tiers |

**`RECOMMENDATION`:** a privacy-focused, cookieless tool, plus Search Console for field Core Web Vitals.

**Google Analytics is `NOT_RECOMMENDED` here.** It brings cookie-consent obligations, meaningful page weight, and far more data collection than these six questions require — on a site whose visitors include parents of minors. The additional capability solves no problem this school has.

---

## Events

Deliberately small. Every event maps to one of the six questions.

| Event | Question | Notes |
|---|---|---|
| `page_view` | 1 | Automatic |
| `admissions_cta_click` | 2 | **The key metric.** Records source section |
| `enquiry_started` | 4 | First field interaction |
| `enquiry_submitted` | 3 | **Primary conversion** |
| `enquiry_failed` | — | **Must be zero.** Also alerts ([33_MONITORING_AND_LOGGING](33_MONITORING_AND_LOGGING.md)) |
| `fee_page_view` | 2, 4 | High-intent signal |
| `phone_click` | 3 | A call is a conversion the enquiry form never sees |
| `email_click` | 3 | — |
| `map_click` | 3 | Intent to visit |
| `download_click` | 5 | Records document category |
| `notice_view` | 5 | — |
| `gallery_open` | 4 | Engagement |
| `nav_search_used` | — | Only when search is built |

**Thirteen events. No more without justification.**

`phone_click` matters more than it appears: many parents will read the site and then simply call. Without it, the site's contribution to admissions is systematically undercounted.

---

## What is never collected

| Never | Why |
|---|---|
| Enquiry form field **values** | Personal data. `enquiry_submitted` fires with no payload |
| Any student name | Data about a minor |
| Parent name, phone, email | Personal data belongs in the database, not the analytics vendor |
| Full IP addresses | Anonymised or not stored |
| Cross-site tracking identifiers | No advertising integration |
| Session recording / heatmaps | Would capture form input including personal data |
| Individual user journeys tied to an identity | Aggregate only |

> **Session recording is explicitly rejected.** Tools that replay sessions capture keystrokes in form fields — meaning parent phone numbers and children's names would be transmitted to a third party. The behavioural insight is not worth that.

---

## Key metrics

### Conversion funnel — the site's core purpose
```
Search impression
   ↓
Homepage / landing page
   ↓
Admissions section reached          ← tests F-1
   ↓
Fee or eligibility page viewed
   ↓
Enquiry form started
   ↓
Enquiry submitted                   ← primary conversion
```
Drop-off at each step identifies where the design fails.

### Testing this project's specific bets

| Bet | Metric | Success looks like |
|---|---|---|
| Surfacing admissions works (F-1) | Homepage → admissions CTA rate | Meaningfully above sector norm |
| Publishing fees helps (F-8) | Fee page → enquiry rate | Positive; if strongly negative, revisit the recommendation |
| Notices belong to current parents (F-2) | Notice/download traffic, repeat visitors | Steady recurring usage |
| Safety page is wanted (F-8) | Safety page views from prospective-parent sessions | Non-trivial traffic |
| Mobile-first was right | Mobile traffic share | Expected majority |

> The fee-page metric is genuinely a test, not a formality. Publishing fees is a `RECOMMENDATION` that could prove wrong; if the data shows it deters enquiries, that is evidence worth acting on and worth an ADR.

### Operational
Enquiries per month · time from `NEW` to `CONTACTED` · enquiries by class and locality (useful for transport planning) · failed submissions (target: zero) · 404 rate · field Core Web Vitals.

---

## Reporting

| Report | Frequency | Audience |
|---|---|---|
| Enquiry volume and conversion | Monthly | School management |
| Traffic and top pages | Monthly | School management |
| Search performance | Monthly | School + dev |
| Core Web Vitals field data | Monthly | Dev |
| Failed submissions | **Real-time alert** | Dev + admissions |
| Content freshness | Monthly | Content owners |

Reports must be short and plain. A dashboard nobody reads is not a measurement system. Two or three numbers the principal actually cares about — enquiries this month, where they came from, whether anything is broken — beat a twenty-widget dashboard.

---

## Privacy and consent

| Aspect | Approach |
|---|---|
| Cookies | **None**, if the cookieless option is chosen |
| Consent banner | Likely unnecessary — decided with the school's legal advisor |
| Privacy policy | Must disclose analytics regardless of consent requirements |
| Data location | Preference for a provider with clear data-residency terms |
| Opt-out | `Do Not Track` and equivalent signals respected |
| Retention | Provider default, reviewed |

⚠️ Whether a consent banner is legally required is a **question for the school's legal advisor**, not an engineering judgement. This document does not assert what the law requires ([39_OPEN_DECISIONS](39_OPEN_DECISIONS.md)).

---

## Implementation notes

Script loaded deferred and non-blocking — analytics must never affect LCP or INP ([27_PERFORMANCE](27_PERFORMANCE.md)) · events fired from a thin internal wrapper so the vendor can be swapped without touching components · analytics disabled in development and preview · **failure to load never breaks the page**.

---

## Deferred

| Item | Status |
|---|---|
| A/B testing | `FUTURE` — traffic volume likely too low for significance |
| Heatmaps / session recording | `NOT_RECOMMENDED` — captures personal data |
| Advertising pixels | `NOT_RECOMMENDED` — third-party tracking on a site used by parents of minors |
| CRM integration | `FUTURE` — only if the school adopts a CRM |
| Custom dashboard in admin | `COULD` — surface enquiry counts where staff already work |
