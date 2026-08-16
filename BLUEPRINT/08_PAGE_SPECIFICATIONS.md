# 08 — Page Specifications

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery) — content specifics blocked on school identity |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | UX / Product |
| **Dependencies** | [06_INFORMATION_ARCHITECTURE](06_INFORMATION_ARCHITECTURE.md) · [07_SITE_MAP](07_SITE_MAP.md) |
| **Related Documents** | [10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md) · [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) · [25_SEO_STRATEGY](25_SEO_STRATEGY.md) · [36_PROJECT_STRUCTURE](36_PROJECT_STRUCTURE.md) |

---

## How this document is structured

**Nine pages receive full specifications** — those that carry the conversion path, the highest traffic, or the most design risk:

Home · Admissions Overview · Fee Structure · Enquiry Form · Notices · Faculty Directory · Gallery · Contact · Safety & Security

**The remaining 28 static routes receive compact specifications** (§11) covering purpose, audience, intent, sections, data source, and CTA.

This is a deliberate proportionality decision. Writing 37 identical full-length specifications would produce padding, and the anti-padding rule in [CHANGE-0007](../HISTORY/2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md) forbids it. Where a page is genuinely a straightforward prose page with a header, body, and CTA, the compact form says everything true about it. Any compact page can be promoted to a full specification when it needs one.

**Every route in [07_SITE_MAP](07_SITE_MAP.md) appears exactly once in this document.** The consistency audit asserts this.

---

## 1. Home — `/`

**Purpose** Orient a prospective parent in seconds and route them toward an enquiry.
**Audience** P1 primary; P2 and P3 secondary. **Intent** Informational → transactional.
**Business objective** Maximise qualified enquiries. **SEO objective** Rank for the school's name and for "CBSE school [locality]".
**Primary CTA** Enquire about Admissions. **Secondary CTA** Explore Academics · Contact.

### Section order and journey rationale

Ordered by the questions a parent asks, in the order they ask them — not by what the school most wants to say.

| # | Section | Parent's question | Why here |
|---|---|---|---|
| 1 | Hero | "What is this, and does it fit?" | Identity, board, grade range must resolve immediately (FR-001) |
| 2 | Trust statistics | "Is it any good?" | Quantified proof before narrative claims (F-4) |
| 3 | School introduction | "What kind of school is it?" | Brief positioning; gateway to About |
| 4 | Academics at a glance | "What will my child learn?" | Four stage cards; the core product |
| 5 | Why Choose Us | "Why you over the others?" | Differentiation, including safety |
| 6 | Campus Life | "What is daily life like?" | Visual; carries emotional weight |
| 7 | Principal's message | "Who leads this place?" | Human face; present on every strong reference |
| 8 | News & Events | "Is this school alive?" | Recency as an activity signal |
| 9 | Testimonials | "What do other parents say?" | Social proof immediately before the ask |
| 10 | Admissions CTA | "How do I start?" | Conversion close |

**Ten sections.** Two candidates were folded rather than given their own band: **Achievements** (represented in the statistics band and Why Choose Us, with a link to its page) and **Gallery** (represented by the Campus Life strip, which links to the album index). At homepage stage a parent needs a *signal* that these exist plus a route to them — not the full content. Both retain dedicated pages.

### Section details

**1 — Hero**
Full-width campus photograph or short muted video; headline; subheadline naming board and grade range; two buttons.
- Content: `[SCHOOL_NAME]`, `[TAGLINE]`, "CBSE · Nursery to Class 10", `[HERO_IMAGE]`
- Layout: single column mobile; overlaid text desktop
- Animation: text fade + rise; image slow scale. **Disabled under `prefers-reduced-motion`**
- Performance: **LCP element.** Priority-loaded, responsive sizes, explicit dimensions, no CLS. Video is never the LCP element and never autoplays with sound
- Accessibility: `<h1>` here and nowhere else on the page; ≥4.5:1 contrast against the image via a scrim, not luck
- Data: `SiteSetting`

**2 — Trust statistics**
Three to five counters: `[ESTABLISHED_YEAR]`, `[STUDENT_COUNT]`, `[FACULTY_COUNT]`, `[BOARD_RESULT_PCT]`, `[CAMPUS_SIZE]`.
- Animation: count-up on scroll into view; **final value rendered server-side** so it is correct without JS and for screen readers
- ⚠️ **Every figure must be supplied by the school.** A fabricated board-result percentage on a real school's website is a material misrepresentation to families, not a design placeholder
- Data: `SiteSetting`

**3 — School introduction** — Image + prose, link to About. Static content.

**4 — Academics at a glance** — Four cards: Pre-Primary, Primary, Middle, Secondary. Grid 1/2/4 columns. Static.
> Exactly four. No Class 11–12, no streams.

**5 — Why Choose Us** — Six icon cards. Must include a safety card linking to `/about/safety` (F-8). Differentiators must be concrete; "holistic development" is not a differentiator because every competitor claims it.

**6 — Campus Life** — Asymmetric image grid, 4–6 images, links to Gallery and Campus Life. Lazy-loaded below the fold. Data: `GalleryImage` (featured) or `SiteSetting`.

**7 — Principal's message** — Portrait, 2–3 paragraph excerpt, signature, link to full message. `[PRINCIPAL_NAME]`, `[PRINCIPAL_PHOTO]`.

**8 — News & Events** — One row, split: latest 3 news + next 3 events. Empty state per item type; the row is hidden entirely only if both are empty. Data: `News`, `Event` (published).

**9 — Testimonials** — 2–3 quotes with name and relationship. Carousel must be keyboard-operable, pausable, and never auto-advance faster than readable. Data: `Testimonial`.

**10 — Admissions CTA** — Full-width band, contrasting surface, headline, single dominant button to `/admissions/enquire`, plus current cycle status.

### SEO
Title `[SCHOOL_NAME] — CBSE School in [CITY] | Nursery to Class 10` · description ≤160 chars including board, location, grade range · canonical `/` · structured data: `School` + `WebSite` · OG image: campus photograph.

### Performance
Hero image is the LCP element and is the primary optimisation target. All below-fold imagery lazy-loaded. Client JS limited to the counter, carousel, and mobile menu. Statistics and testimonials render server-side.

---

## 2. Admissions Overview — `/admissions`

**Purpose** Hub for the conversion path. **Audience** P1. **Intent** Transactional.
**Primary CTA** Enquire Now. **Sitemap priority** 1.0.

### Sections
1. **Header with cycle status** — `[ADMISSION_YEAR]` and an explicit **open / closed / opening soon** state
2. **Quick answers** — who can apply, entry classes, age criteria summary, fee range, key dates. Answers the five most common questions without a click
3. **Process summary** — five numbered steps, linking to the full process page
4. **Documents required** — checklist
5. **Fee summary** — headline range, link to the full table
6. **Important dates** — table
7. **FAQ preview** — top five, link to full FAQ
8. **Enquiry CTA** — prominent

### The closed state — designed, not defaulted
When admissions are closed the page must state so explicitly, give the next cycle's opening date, and still offer the enquiry form so interest is captured. A page that goes silent leaves the parent unable to tell whether the information is missing or the window has passed — and they will phone the office (J5).

### Freshness
**Highest staleness risk on the site.** An out-of-date admission window actively misleads a parent making a decision. Shortest freshness threshold; flagged in the admin dashboard ([47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md)).

### SEO
Title `Admissions [ADMISSION_YEAR] — [SCHOOL_NAME]` · structured data `School` + `BreadcrumbList` · ISR with tag revalidation on settings change.

---

## 3. Fee Structure — `/admissions/fees`

**Purpose** Answer the second-most-important question a parent has (F-8). **Audience** P1. **Intent** Transactional.

### Sections
1. Header with academic year and a "fees are indicative / subject to revision" note
2. **Fee table** — rows Nursery → Class X; columns Admission Fee, Tuition, Annual Charges, Transport (optional), Total
3. Payment schedule — terms, due dates, accepted methods
4. Additional charges — uniform, books, trips, examinations
5. Sibling or other concessions, if applicable
6. Downloadable PDF of the current fee schedule
7. Enquiry CTA

### Table accessibility and responsive behaviour
This is the most demanding component on the public site.
- Real `<table>` with `<caption>`, `<th scope="col">`, `<th scope="row">` — never a div grid
- **Horizontal scroll inside its own container** on narrow screens; the page body must never scroll horizontally
- Scroll container is focusable and labelled so keyboard and screen-reader users can reach it
- Alternative stacked card layout below 480px is acceptable if the table is also exposed
- Currency values right-aligned, tabular figures

### Content policy
`RECOMMENDATION`: publish real figures. Hiding fees behind a phone call filters out affordable-fit families who assume the worst and signals evasiveness. If the school declines, publish the *structure* plus a current downloadable schedule — never nothing. Registered as an open question in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

All amounts are `[FEE_*]` placeholders until supplied. **No invented figures.**

---

## 4. Enquiry Form — `/admissions/enquire`

**Purpose** The site's single conversion endpoint. **Audience** P1. **Intent** Transactional.
**Target** Completable on a mobile phone in **under two minutes** (FR-043).

### Fields

| Field | Type | Required | Validation |
|---|---|---|---|
| Parent/Guardian name | text | ✅ | 2–100 chars |
| Phone | tel | ✅ | Indian mobile format; normalised on save |
| Email | email | ✅ | RFC-valid |
| Student name | text | ➖ | ≤100 chars |
| Class applying for | select | ✅ | Nursery … Class X only |
| Academic year | select | ✅ | Defaults to current cycle |
| Locality / area | text | ➖ | Useful for transport routing |
| Message | textarea | ➖ | ≤1000 chars |
| Consent | checkbox | ✅ | Explicit; links to privacy policy |
| Honeypot | hidden | — | Must remain empty |

**Nine visible fields, five required.** Every additional required field costs completions. Student name is optional because a parent at first-enquiry stage may be browsing on behalf of a child they have not yet decided to name to a stranger.

**Class list contains Nursery through Class X only** — no Class 11 or 12.

### Validation and submission
- One Zod schema shared by client and server. Server-side validation is authoritative and never trusts the client (NFR-039, NFR-043)
- Inline errors on blur, announced via `aria-live` (NFR-015)
- Submit disabled during flight; a spinner and status text prevent double submission
- Rate-limited per IP (NFR-046)
- Server Action, not a REST endpoint

### Success and failure
- **Success:** confirmation with an expected response time; the enquiry ID is not shown (it is meaningless to the parent); analytics event `enquiry_submitted`
- **Failure:** **never silently fail.** Show an apology plus `[PHONE_NUMBER]` as a fallback path, preserve entered values, log and alert (NFR-063, J10). A lost enquiry is a lost admission the school never learns about

### Privacy
Personal data. Consent explicit, purpose stated, retention defined, access restricted and logged (NFR-050, NFR-051). See [24_CONTACT_AND_ENQUIRY_SYSTEM](24_CONTACT_AND_ENQUIRY_SYSTEM.md).

### Accessibility
Every field programmatically labelled; required state conveyed in text not colour; errors linked via `aria-describedby`; logical focus order; error summary receives focus on failed submit.

---

## 5. Notices — `/notices`

**Purpose** Highest-frequency destination for current parents. **Audience** P2. **Intent** Navigational.
**Target** Answer found in **under thirty seconds** on mobile (J3).

### Sections
1. Header
2. Category filter — All · Academic · Examination · Events · Holidays · General · CBSE
3. Reverse-chronological list: title, **date**, category badge, optional attachment, optional expiry
4. Pagination
5. Cross-link to Downloads and Academic Calendar

### Design notes
- **Date is the most important element after the title** — a parent's first question is "is this current?"
- Expired notices are hidden by default, reachable via an archive toggle. An expired notice left visible is worse than no notice
- Attachments show file type and size before the tap
- Optimised for scanning, not reading: high information density, minimal decoration
- Empty state explains what will appear here

**Data:** `Notice` (published, not expired), ISR with tag revalidation on publish.

> This page is where the observed six-year-old-notice failure (F-3) is prevented. Expiry dates and freshness flags exist because of it.

---

## 6. Faculty Directory — `/academics/faculty`

**Purpose** Teacher quality is a stated selection factor (F-8). **Audience** P1. **Intent** Comparative.

### Sections
1. Header with an overview statement (`[FACULTY_COUNT]`, average experience)
2. Department filter — All · Pre-Primary · Primary · Mathematics · Science · Languages · Social Studies · Arts · Sports · Administration
3. Card grid — photograph, name, designation, department, qualification
4. Optional link to individual profile

### Design notes
- Consistent portrait aspect ratio; a designed initials fallback for missing photographs, never a broken image
- Filter is client-side over a server-rendered list — full list is indexable without JS (NFR-030)
- Grid: 1 / 2 / 3 / 4 columns by breakpoint

**Privacy note.** Faculty are adults acting in a professional capacity, so their photographs do not fall under the child-safeguarding rules in [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md). Staff should nonetheless be told their photograph will be published publicly.

**Data:** `Faculty` + `Department`.

---

## 7. Gallery — `/gallery` and `/gallery/[slug]`

**Purpose** Show what the school actually looks like. **Audience** P1, P3. **Intent** Comparative.

### Index
Album cards with cover image, title, date, image count. Category filter: Campus · Sports · Cultural · Academic · Events · Celebrations.

### Album detail — `/gallery/[slug]`
Responsive masonry or aspect-ratio grid; lightbox on selection.

### Lightbox accessibility — non-negotiable
The most common accessibility failure in this component class.
- Focus trapped within the dialog while open; returned to the triggering thumbnail on close
- `Escape` closes; arrow keys navigate; controls are real buttons with accessible names
- `role="dialog"`, `aria-modal="true"`, labelled
- Background scroll locked
- Follows WAI-ARIA authoring practices (NFR-018)

### Performance
Thumbnails responsive and lazy-loaded; full-size images fetched only on lightbox open; explicit dimensions to prevent CLS; modern formats.

### Child safety
Gallery content routinely contains identifiable minors. Upload consent basis, EXIF/geolocation stripping, and takedown procedure are mandatory — see [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md). **Alt text must describe the activity, not identify children by name.**

**Data:** `GalleryAlbum`, `GalleryImage`.

---

## 8. Contact — `/contact`

**Purpose** Enable contact and navigation to campus. **Audience** All. **Intent** Navigational.

### Sections
1. Address, phone numbers, email addresses, office hours
2. Separate contacts for admissions vs general enquiry (FR-072)
3. Embedded map
4. General contact form
5. Directions and public transport notes

### Design notes
- **Click-to-call and click-to-email on mobile** (FR-073) — `tel:` and `mailto:` links, adequate tap targets
- **Map lazy-loaded behind a static placeholder with a click-to-load control** (FR-071). A map iframe is typically the heaviest asset on a school website and must never block first render
- Map has an accessible text alternative — the full postal address in real text, never image-only
- Structured data: `School` with `address`, `telephone`, `openingHours`, `geo`

---

## 9. Safety & Security — `/about/safety`

**Purpose** Answer a top-tier parental concern that no inspected reference surfaced clearly (F-8). **Audience** P1. **Intent** Comparative.

### Sections
1. Header and safety statement
2. **Campus security** — access control, visitor protocol, CCTV coverage, security staffing
3. **Child protection policy** — safeguarding approach, staff verification, reporting mechanism
4. **Emergency preparedness** — evacuation procedures, drill frequency, fire safety
5. **Medical** — infirmary, staffing, first aid, emergency contacts
6. **Transport safety** — GPS, attendants, driver verification (links to `/about/transport`)
7. **Digital safety** — internet use policy, supervision
8. Contact for safety concerns

### Content policy
This page carries a specific integrity risk: **claiming safety measures the school does not have is a serious misrepresentation**, not marketing copy. Every claim must be verified with the school before publication. All content is `[PLACEHOLDER]` until confirmed, and the page must not ship with plausible-sounding invented provisions.

Content requiring policy or legal review is flagged as such ([39_OPEN_DECISIONS](39_OPEN_DECISIONS.md)).

---

## 10. Dynamic detail pages

### `/news/[slug]`
Title, publish date, author, cover image, rich body, share links, related news, admissions CTA.
SEO: `Article` structured data (`headline`, `datePublished`, `dateModified`, `image`, `publisher`), per-article OG image, canonical at the current slug. Retired slugs 301 to current.
Data: `News`. ISR, tag-revalidated.

### `/events/[slug]`
Title, date/time, venue, description, image, past/upcoming state, add-to-calendar, related events.
SEO: `Event` structured data (`startDate`, `endDate`, `location`, `eventStatus`).
**Past events are retained**, not deleted — an event archive is a credibility signal and an SEO asset. Data: `Event`.

### `/gallery/[slug]` — see §7.

### `/academics/faculty/[slug]`
Photograph, name, designation, department, qualifications, experience, optional message.
`COULD` priority — build only if the school supplies profile depth beyond a directory card. A thin profile page is worse than none.
Data: `Faculty`.

---

## 11. Compact specifications — remaining 28 static routes

| Route | Purpose | Audience · Intent | Key sections | Data | Primary CTA |
|---|---|---|---|---|---|
| `/about` | School identity, history, philosophy | P1 · Comparative | Intro, history, philosophy, values, milestones | Static | Explore Academics |
| `/about/vision-mission` | Vision, mission, core values | P1 · Comparative | Vision, mission, values | Static | About |
| `/about/principals-message` | Leadership voice | P1 · Comparative | Portrait, full message, philosophy | Static + `SiteSetting` | Admissions |
| `/about/leadership` | Key staff and governance | P1 · Comparative | Leadership cards, structure | `Faculty` (leadership) | Faculty |
| `/about/infrastructure` | Facilities, image-led | P1, P3 · Discovery | Classrooms, labs, library, sports, auditorium, cafeteria, medical | `Facility` | Gallery |
| `/about/transport` | Routes and transport safety | P1 · Discovery | Coverage, fleet, safety, fees, contact | Static + `SiteSetting` | Enquire |
| `/academics` | Academic approach and structure | P1 · Discovery | Philosophy, 4 stages, methodology, assessment | Static | Curriculum |
| `/academics/curriculum` | Subjects, methodology, assessment | P1 · Comparative | CBSE framework, subjects by stage, pedagogy, assessment, technology | Static | Stage pages |
| `/academics/pre-primary` | Nursery, LKG, UKG | P1 · Discovery | Approach, day structure, learning areas, transition | Static | Eligibility |
| `/academics/primary` | Classes I–V | P1 · Discovery | Subjects, approach, activities, assessment | Static | Eligibility |
| `/academics/middle-school` | Classes VI–VIII | P1 · Discovery | Subjects, labs, projects, assessment | Static | Eligibility |
| `/academics/secondary-school` | Classes IX–X | P1 · Comparative | CBSE board prep, subjects, support, results | Static | Admissions |
| `/admissions/process` | Step-by-step process | P1 · Transactional | Numbered timeline, documents, what to expect | Static | Enquire |
| `/admissions/eligibility` | Age and eligibility per class | P1 · Transactional | Age table by entry class, criteria, transfers | Static | Enquire |
| `/admissions/important-dates` | Cycle calendar | P1 · Transactional | Dated table, current-cycle status | `SiteSetting` | Enquire |
| `/admissions/faqs` | Common questions | P1 · Transactional | Accordion, grouped | Static | Enquire |
| `/campus-life` | Daily life overview | P1, P3 · Discovery | Overview, routine, houses, links to sub-pages | Static | Gallery |
| `/campus-life/sports` | Sports offering | P1, P3 · Discovery | Sports list, facilities, coaching, achievements | `Facility`, `Achievement` | Gallery |
| `/campus-life/clubs` | Clubs and activities | P3, P1 · Discovery | Club cards, participation | Static | Campus Life |
| `/campus-life/arts` | Arts, music, drama, dance | P3, P1 · Discovery | Programmes, facilities, performances | Static | Gallery |
| `/achievements` | Student and school achievements | P1 · Comparative | Grouped by academic/sports/olympiad/cultural, year filter | `Achievement` | Admissions |
| `/news` | News index | P1, P2 · Informational | Featured, paginated grid, empty state | `News` | Article |
| `/events` | Events index | P1, P2, P3 · Informational | Upcoming, past, empty state | `Event` | Event detail |
| `/downloads` | Document repository | P2 · Navigational | Category filter, list with type + size, search | `Document` | — |
| `/academic-calendar` | Term dates and holidays | P2 · Navigational | Calendar/table view, PDF download | `Event`, `Document` | Notices |
| `/privacy-policy` | Data collection disclosure | All · Navigational | Data collected, purpose, retention, rights, contact | Static | — |
| `/terms` | Website terms | All · Navigational | Use terms, IP, liability, governing law | Static | — |
| `/sitemap` | HTML sitemap | All · Navigational | Grouped link list | Generated | — |

> **Legal pages** will be drafted with a prominent banner stating they **require review by the school's legal advisor** before publication. No fabricated compliance claims (FR-080, FR-081).

---

## 12. Cross-cutting requirements

Applied to every page.

| Concern | Requirement |
|---|---|
| Heading order | Exactly one `<h1>`; no skipped levels |
| Landmarks | `header`, `nav`, `main`, `footer`; skip-to-content link |
| Breadcrumbs | All pages below top level, with `BreadcrumbList` structured data |
| Metadata | Unique title and description; canonical; OG and Twitter cards |
| Images | Explicit dimensions, responsive sizes, meaningful alt text, lazy below fold |
| Empty states | Every dynamic listing explains why it is empty |
| Loading states | Skeletons matching final layout; never a blank screen |
| Reduced motion | All animation disabled under `prefers-reduced-motion` |
| No dead ends | Every page routes onward, and to the admissions CTA |
| Responsive | Correct at 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 px |
| Rendering | Server components by default; client components only where interaction requires |
