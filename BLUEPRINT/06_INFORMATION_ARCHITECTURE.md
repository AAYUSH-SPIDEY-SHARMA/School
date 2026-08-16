# 06 — Information Architecture

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery) |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | UX / Information Architect |
| **Dependencies** | [04_USER_PERSONAS](04_USER_PERSONAS.md) · [05_USER_JOURNEYS](05_USER_JOURNEYS.md) · [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) F-1, F-2, F-5, F-6 |
| **Related Documents** | [07_SITE_MAP](07_SITE_MAP.md) · [09_NAVIGATION](09_NAVIGATION.md) · [25_SEO_STRATEGY](25_SEO_STRATEGY.md) |

---

## Governing principles

**1. Two audiences, two entry systems.**
Prospective parents (P1) and current parents (P2) want completely different things. Every inspected Indian reference forces both through one navigation, and the result serves neither. This IA gives current parents their own persistent utility bar and leaves the main navigation to the prospective-parent journey. *(F-2)*

**2. Literal labels only.**
A parent scanning for fees should never have to guess. One reference site files its content under "Our Ethos", "Glimpses", and "Happenings" — labels that describe nothing. Every label here says what is behind it. *(F-5)*

**3. Six top-level items, plus a distinct Admissions CTA.**
The best-organised references sit at six and seven top-level items; the worst sits at fourteen. Admissions is deliberately pulled *out* of the six and given button treatment, because it is the site's conversion goal and burying it is the single most common failure in the sector. *(F-1, F-5)*

**4. Maximum three levels of depth.**
Section → page → detail. Anything requiring a fourth level indicates the section needs splitting.

**5. Every page maps to a search intent.**
A page serving none of the five documented parent intents is a candidate for deletion. *(F-7)*

**6. No dead ends.**
Every page offers a route onward — to the next logical page, and to the admissions CTA.

---

## Top-level structure

```
┌─ UTILITY BAR (current parents) ────────────────────────────────┐
│  Notices · Downloads · Academic Calendar · [PHONE_NUMBER]      │
└────────────────────────────────────────────────────────────────┘

┌─ PRIMARY NAVIGATION (prospective parents) ─────────────────────┐
│  [LOGO]  About  Academics  Campus Life  Gallery                │
│          News & Events  Contact           [ Admissions ▸ ]     │
└────────────────────────────────────────────────────────────────┘
```

Six primary items. Admissions is a visually distinct call-to-action, present on every page at every breakpoint.

---

## Full hierarchy

```
HOME

ABOUT                                   ← "who are you and can I trust you?"
├── About the School
├── Vision & Mission
├── Principal's Message
├── Leadership
├── Infrastructure & Facilities
├── Safety & Security          ★ elevated
└── Transport                  ★ elevated

ACADEMICS                               ← "what will my child learn?"
├── Academic Overview
├── Curriculum
├── Pre-Primary  (Nursery, LKG, UKG)
├── Primary      (Classes I–V)
├── Middle School (Classes VI–VIII)
├── Secondary School (Classes IX–X)
└── Faculty
    └── Faculty member detail

ADMISSIONS                    ★ CTA     ← "how do I get my child in?"
├── Admissions Overview
├── Admission Process
├── Eligibility & Age Criteria
├── Fee Structure              ★ elevated
├── Important Dates
├── FAQs
└── Enquire Now                ★ conversion endpoint

CAMPUS LIFE                             ← "what is daily life like?"
├── Student Life
├── Sports
├── Clubs & Activities
├── Arts & Culture
└── Achievements

GALLERY
└── Album detail

NEWS & EVENTS
├── News  →  article detail
└── Events →  event detail

CONTACT

CURRENT PARENTS (utility bar + footer)
├── Notices
├── Downloads
└── Academic Calendar

LEGAL (footer)
├── Privacy Policy
├── Terms of Use
└── Sitemap
```

★ marks a deliberate elevation above conventional placement, each justified below.

---

## Deliberate elevations

These four decisions are where this IA departs from what the reference sites do. Each is evidence-backed.

### Safety & Security — promoted to its own page
Safety ranks among the highest-stated concerns in the literature on Indian parental school choice (F-8), and the specific provisions parents look for — CCTV, child protection policy, emergency drills — are concrete and checkable. **None of the four Indian references surfaced safety as a findable destination**; where present at all, it was a sentence inside infrastructure copy. Giving it a page is cheap and directly answers a top-tier question.

### Transport — promoted to its own page
Proximity and commutability are primary selection factors (F-8). For a day school this is often the *first* disqualifier: a parent who cannot establish that a bus serves their area stops evaluating. Burying routes inside a facilities page loses those parents silently.

### Fee Structure — promoted within Admissions
Cost is a stated primary factor (F-8). Hiding fees behind a phone call is common and actively counterproductive: it filters out affordable-fit families who assume the worst, and it signals evasiveness. `RECOMMENDATION`: publish real figures. If the school declines, publish the structure with a downloadable current fee schedule — never nothing.

### Notices & Downloads — pulled out of the main navigation entirely
These serve P2, not P1, and putting them in the prospective-parent navigation dilutes it while still leaving them hard to find. The utility bar gives current parents a permanent, predictable, one-tap destination without spending main-navigation budget. *(F-2, F-6)*

---

## Content grouping rationale

| Group | Question answered | Search intent | Persona |
|---|---|---|---|
| About | Who are you? Can I trust you? | Comparative | P1 |
| Academics | What will my child learn? | Discovery, comparative | P1 |
| Admissions | How do I get my child in? | Transactional | P1 |
| Campus Life | What is daily life like? | Discovery, comparative | P1, P3 |
| Gallery | What does it actually look like? | Comparative | P1, P3 |
| News & Events | Is this school active? | Informational | P1, P2, P3 |
| Contact | How do I reach you? | Navigational | All |
| Notices / Downloads / Calendar | Where is that document? | Navigational | P2 |

Every group maps to at least one documented search intent. No group exists purely because schools traditionally have one.

---

## News vs Notices — a structural distinction

The most consequential IA decision in this document, and the one most often got wrong.

| | **News** | **Notices** |
|---|---|---|
| Audience | Prospective parents (P1) | Current parents (P2) |
| Purpose | Marketing and reputation | Operations |
| Example | "Students win national science competition" | "School closed 14 Aug for maintenance" |
| Tone | Narrative, celebratory | Terse, factual |
| Media | Photographs, rich formatting | Text, often with an attachment |
| Lifespan | Indefinite — an archive builds credibility | Short — often expires on a date |
| Location | Main navigation | Utility bar |
| Freshness risk | Low | **High** — a stale notice actively misleads |

All four Indian references merge these into a single stream. The result is a marketing channel cluttered with maintenance notices, and an operations channel buried in marketing. Keeping them separate costs one extra module and serves both audiences properly. *(F-2)*

---

## Search-intent coverage

| Intent | Parent asks | Primary landing pages |
|---|---|---|
| Informational | "Schools near me?" | Home, About |
| Discovery | "CBSE school with good sports" | Academics stages, Sports, Clubs, Facilities |
| Comparative | "Why this school?" | About, Achievements, Faculty, Results, Gallery, Safety |
| Transactional | "When do admissions open?" | Admissions, Important Dates, Eligibility, Fees, Enquire |
| Navigational | "[School name] holiday list" | Home, Notices, Downloads, Calendar, Contact |

Every intent has a designed landing page. Transactional intent — the one that converts — has six.

---

## Depth and click distance

Maximum depth is three levels. Distance from the homepage to key destinations:

| Destination | Clicks | Justification |
|---|---|---|
| Enquiry form | **1** | Homepage CTA goes directly to it |
| Admissions overview | 1 | Persistent nav CTA |
| Fee structure | 2 | Admissions → Fees; also linked from homepage admissions section |
| Notices | **1** | Utility bar |
| Downloads | **1** | Utility bar |
| Contact | 1 | Nav + footer on every page |
| Safety | 2 | About → Safety |
| Any academic stage | 2 | Academics → stage |
| Faculty | 2 | Academics → Faculty |
| Any news article | 2 | News → article |

Nothing a parent urgently needs is more than two clicks away.

---

## What we deliberately did not do

| Rejected pattern | Seen in | Why rejected |
|---|---|---|
| Flat 14-item navigation | Vasant Valley | Exceeds scanning capacity; no grouping signal |
| Abstract labels ("Glimpses", "Happenings") | DPS R.K. Puram | Parent cannot predict contents; costs a click to discover |
| Admissions inside an "Online" menu | DPS R.K. Puram | Buries the conversion path |
| Admissions only as a rotating banner | The Shri Ram School | Disappears when the campaign ends; not a stable destination |
| Nine-way audience segmentation | UWCSEA | Disproportionate for a single-campus school. Classified `FUTURE` |
| "Media" / "Resources" as section names | Common convention | Not literal. What is "Media" to a parent looking for photographs? |
| Separate mobile IA | — | Divergence guarantees drift. Same IA, different presentation |

---

## Mobile adaptation

The IA does not change on mobile; only its presentation does.

- Utility bar collapses to a compact row retaining **Notices** and the phone number (the two highest-frequency mobile actions)
- Primary navigation collapses into a drawer, with sections as accordions
- **The Admissions CTA stays visible outside the drawer** — it is never hidden behind a hamburger, since it is the site's conversion goal
- Click-to-call is always one tap from any page

---

## Future extensions

Accommodated by this structure without restructuring:

| Extension | Placement |
|---|---|
| Site-wide search | Utility bar |
| Online application | Under Admissions, after Enquire |
| Parent portal login | Utility bar, right-aligned |
| Careers | Footer, or under About |
| Alumni | Under Campus Life, or its own top-level item if it grows |
| Hindi language | Language toggle in the utility bar |

Adding any of these costs no more than one navigation slot and does not disturb existing hierarchy.
