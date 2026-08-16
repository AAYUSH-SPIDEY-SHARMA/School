# 45 — Research Sources

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery round 1) |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | UX Research / Principal Architect |
| **Dependencies** | None |
| **Related Documents** | [04_USER_PERSONAS](04_USER_PERSONAS.md) · [05_USER_JOURNEYS](05_USER_JOURNEYS.md) · [06_INFORMATION_ARCHITECTURE](06_INFORMATION_ARCHITECTURE.md) · [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) · [25_SEO_STRATEGY](25_SEO_STRATEGY.md) · [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md) |

---

## 1. Research Quality Model

Every finding in this document carries one of four tags. This exists so that a reader can tell the difference between something that was *seen*, something that is *supported by evidence*, something *proposed*, and something *decided*.

| Tag | Meaning |
|---|---|
| `OBSERVATION` | Directly seen by inspecting a source. Factual, narrow, no claim about effectiveness. |
| `EVIDENCE` | Supported by research, official documentation, or a pattern consistent across multiple independent sources. |
| `RECOMMENDATION` | A proposal derived from observations and evidence. Not yet approved. |
| `DECISION` | Approved and binding. Recorded in [49_DECISION_REGISTER](49_DECISION_REGISTER.md). |

**Visual inspiration is never evidence.** "This site looks good" does not establish that a pattern works. Where the only support for a pattern is that a well-regarded school uses it, the finding stays at `OBSERVATION`.

---

## 2. Stated Limitations of This Research

These constraints are recorded up front because they bound how much weight any finding below can carry.

1. **Reference sites were inspected via server-side fetch and HTML-to-markdown conversion.** This reliably reveals navigation structure, information hierarchy, content ordering, copy, and stated statistics. It reveals **nothing** about visual design, typography, colour, motion, or layout quality.

2. **No performance measurements were taken.** No Lighthouse run, no Core Web Vitals field data, no bundle analysis was performed against any third-party site. **This document contains no performance scores, and none should be added retrospectively unless actually measured.**

3. **No accessibility audits were performed.** No axe scan, no screen-reader testing, no contrast measurement. Any accessibility comment about a reference site would be fabrication and is therefore absent.

4. **Mobile behaviour was not observed.** Responsive behaviour, touch targets, and mobile navigation patterns were not tested.

5. **Sample size is small and non-random.** Nine sites were successfully inspected. This is enough to identify a strong recurring pattern; it is not enough to make statistical claims. No finding below is expressed as a percentage of the sector.

6. **Two fetches failed** and are recorded as failures rather than filled in from memory (§3.3).

---

## 3. Reference Site Analysis

All sites accessed **2026-08-16**.

### 3.1 Indian K-12 Schools

#### The Shri Ram School — https://www.tsrs.org/
`OBSERVATION`
- Navigation: Our Schools · Community · Student Life · Admissions · Careers
- Homepage order: banner announcements → core values → welcome → campus showcase → learning continuum → elementary years → accreditations → signature events → university placements → social feed
- Admissions surfaced as **time-limited banner announcements** ("Nursery admissions", "3EP Programme") rather than a persistent homepage section
- Stated primary CTA: **"Contact Us"** — not "Apply" or "Enquire"
- Trust signals: CISCE, Cambridge International, IB, Round Square, IQM accreditations; university placements (Oxford, Cambridge, Stanford, LSE, Brown, Duke, Imperial)

#### Vasant Valley School — https://www.vasantvalley.org/
`OBSERVATION`
- Navigation: ~14 top-level items (Home, Vision & Philosophy, The Learning Experience, International Curriculum, Special Education Needs, Programmes, Infrastructure, A Day in School, Announcements, News & Events, FAQs, Admissions, Login, About Us) — flat, minimal grouping
- Homepage order: event hero → tech fest → mission → announcements (exam results, marksheets) → motto → history → daily framework → infrastructure → philosophy → learning graphic → event timeline → social
- **Admissions present in navigation but absent from the homepage**
- Trust signals: established 1990, named founders, Cambridge AS/A Level results, CBSE affiliation, eight-acre campus, college placements
- No dedicated downloads section; documents surface through announcements

#### Sanskriti School — https://www.sanskritischool.edu.in/
`OBSERVATION`
- Navigation not exposed in fetched markup (likely script-dependent) — recorded as **not observed**, not as "absent"
- Homepage order: Class XII results announcement → image carousel → welcome → news blocks → principal's message → contact → footer
- **Admissions not featured anywhere on the homepage**
- Four distinct notice blocks mid-page: Circulars & Updates · CBSE & DoE Circulars · Achievements & Activities · Sports Corner
- Footer copyright reads **2018**

#### Delhi Public School R.K. Puram — https://www.dpsrkp.net/
`OBSERVATION`
- Navigation: Our Ethos · Glimpses · Achievements · Happenings · Online — five abstract, non-literal labels
- Admissions placed under the **"Online"** menu; a separate IBDP admission banner exists, but general admissions has no prominent homepage placement
- Notices, CBSE & DoE Circulars, and Tender live inside the "Happenings" dropdown
- Trust signals: CBSE affiliation, DPS Society, IB World School designation, principal's message, mandatory disclosure, CUET results
- **A recruitment notice dated August 2020 was still displayed on the live 2026 homepage**

### 3.2 International K-12 Schools

#### Eton College (UK) — https://www.etoncollege.com/
`OBSERVATION`
- Navigation: 10 top-level items with very large sub-menus (About Us, Inside the Classroom, Outside the Classroom, College Life, Eton Outwards, Admissions, Support Us, News and Diary, Contact Us)
- Admissions is a dedicated top-level tier with age-specific entry paths (13+, 16+), financial aid, scholarships, fees
- Quantified statistics band: 250 society speakers/year, £10.06m financial aid, 16,000 museum specimens, 105 funded placements, 51 ensembles
- Trust signals: charity number, ISI inspection report, research centre credentials, ~six centuries of history, named partnerships

#### Phillips Exeter Academy (US) — https://www.exeter.edu/
`OBSERVATION`
- Navigation: **7 top-level items** — About · Admissions · Academics · Student Life · Athletics · The Arts · Alumni
- Homepage order: hero + mission → experience overview → three feature cards (Campus, **Admissions**, Harkness) → CTA buttons → bulletin → stories → statistics → visit/giving
- Admissions messaging is explicit and current: "Admission application for 2026-27 is open", "Schedule a campus visit", "Take a virtual look around"
- Statistics: 245 years, 12:1 class ratio, $29M annual financial assistance, 450+ courses
- Holds a **CASE Circle of Excellence Gold Medal for website redesign** — an external, independent credential for the site itself

#### UWC South East Asia (Singapore) — https://www.uwcsea.edu.sg/
`OBSERVATION`
- Navigation: **6 top-level items** — About Us · Admissions · Learning · UWCSEA Community · Careers · Support Us
- **"Find it Fast" audience-pathway sidebar** segmenting nine audiences: student applicants, prospective families, job seekers, current students, parents, staff, alumni, donors, community programme participants
- Admissions hub includes eligibility check, fees/scholarships, timelines, campus visits; explicit "Apply Now" button, virtual tours, open houses
- Statistics: IB average 36.4, 99.2% pass rate, 117 nationalities
- Safeguarding policy surfaced prominently; WASC, Round Square, CIS accreditations

#### Raffles Institution (Singapore) — https://www.ri.edu.sg/
`OBSERVATION`
- Navigation: 8 items — About Us · The Raffles Programme · Student Support Services · Admissions · Giving · Parents · Alumni · Join Us; plus Parents Gateway and Stamford quick links
- Admissions holds top-level status **and** a homepage section (Direct School Admission) **and** a Quick Reference card — three separate surfaces
- Audience segmentation: dedicated Parents Gateway, separate Year 1–4 / Year 5–6 paths, alumni, recruitment
- Trust signals: A-Level results media release, government Isomer platform, institutional motto

### 3.3 Premium Education

#### Ashoka University (India) — https://www.ashoka.edu.in/
`OBSERVATION`
- Navigation: 8 items — Academics · Admissions · Faculty & Research · Placements · Life at Ashoka · News and Events · Centres · About Us
- Admissions is a major category with a clear terminal CTA: **Application Portal (apply.ashoka.edu.in)**, supported by brochures and scholarship information
- Trust signals: QS World Rankings, faculty research output, media coverage, leadership announcements

### 3.4 Failed Retrievals — Recorded, Not Substituted

| Site | Outcome | Handling |
|---|---|---|
| The Doon School — https://www.doonschool.com/ | **HTTP 403 Forbidden** | No analysis written. Not reconstructed from memory or reputation. |
| Step by Step School — https://www.stepbystepschool.net/ | **Empty response body** | No analysis written. |

These are listed because a research sample that silently omits its failures overstates its own coverage.

### 3.5 Scope Decision on Sample Composition

The original brief requested 5 Indian, 5 international, 3 premium-education, and 3 modern institutional references. The delivered sample is **4 Indian K-12, 4 international K-12, 1 premium education**, with two failures documented above.

`RECOMMENDATION` — The "institutional" category was **deliberately not sampled**. Corporate and higher-education institutional sites optimise for a self-selecting adult applicant researching on their own behalf. This project's decision-maker is a parent choosing on behalf of a young child, weighing safety, proximity, and cost. The decision psychology is different enough that patterns would not transfer cleanly, and importing them risks justifying choices with irrelevant precedent. This is a conscious scoping decision, stated rather than silently skipped. It can be revisited if a specific question arises that this sample cannot answer.

---

## 4. Findings

### F-1 — Indian K-12 schools systematically under-surface admissions on the homepage
`EVIDENCE` (consistent across all four Indian K-12 references; contradicted by all four international references)

| Site | Admissions on homepage? | Terminal CTA |
|---|---|---|
| The Shri Ram School | Banner announcement only | "Contact Us" |
| Vasant Valley | **No** | — |
| Sanskriti | **No** | — |
| DPS R.K. Puram | Buried under "Online" menu | — |
| Phillips Exeter | **Yes** — dedicated feature card | "Schedule a campus visit" |
| UWCSEA | **Yes** — dedicated hub | "Apply Now" |
| Raffles | **Yes** — three separate surfaces | DSA pathways |
| Eton | **Yes** — dedicated tier | Age-specific entry |

**Critical nuance:** this is *not* an Indian web-design limitation. Ashoka University — Indian, premium, same market — surfaces admissions with a clear terminal CTA to an application portal. The gap is specific to the **Indian K-12 school sector**, not to Indian institutions generally.

`RECOMMENDATION` — Surface admissions on the homepage with a concrete, current, terminal CTA. This is the single clearest differentiation opportunity identified in this research, and it aligns with the project's own conversion goal.

### F-2 — Notices and circulars are a first-class requirement in the Indian context
`EVIDENCE` (present in all four Indian references; absent as a distinct pattern in all four international ones)

Sanskriti runs four separate notice blocks mid-homepage. DPS R.K. Puram groups Notices, CBSE & DoE Circulars, and Tender. Vasant Valley's announcements are dominated by CBSE marksheet and result notices. The international references use news/blog formats instead, with no circular equivalent.

`RECOMMENDATION` — Treat Notices and Downloads as a core module serving **existing** parents, distinct from News (which serves prospective parents). These are two different audiences with different needs, and conflating them — as several references do — serves neither well.

### F-3 — Content staleness is visibly common
`OBSERVATION`
- DPS R.K. Puram displayed a recruitment notice dated **August 2020** on its live homepage in August 2026 — approximately six years stale.
- Sanskriti's footer copyright read **2018**.

`EVIDENCE` — Two of four Indian references show externally visible staleness. Small sample, but it is direct evidence that school websites decay in production, and it is consistent with the well-known pattern of institutional sites lacking a content owner.

`RECOMMENDATION` — Content freshness must be an explicit design concern, not an assumption. Specified in [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md).

### F-4 — Quantified trust statistics are near-universal on strong references
`OBSERVATION` — Exeter (245 years, 12:1, $29M, 450+ courses) · UWCSEA (36.4 IB average, 99.2% pass, 117 nationalities) · Eton (250 speakers, £10.06m aid, 16,000 specimens) · TSRS (named university placements) · Ashoka (QS ranking).

`RECOMMENDATION` — Include a quantified statistics band. **Every figure must be real and supplied by the school.** Until then these remain `[PLACEHOLDER]` tokens — a fabricated "95% board results" on a real school's website would be a material misrepresentation, not a design detail.

### F-5 — Navigation breadth correlates with organisational clarity
`OBSERVATION` — Observed top-level counts: UWCSEA 6 · Exeter 7 · Raffles 8 · Ashoka 8 · Eton 10 · Vasant Valley ~14. DPS R.K. Puram uses 5 but with abstract labels ("Our Ethos", "Glimpses", "Happenings") that do not describe their contents.

`EVIDENCE` — Secondary sources on education web design recommend 5–7 top-level categories. The two most cleanly organised references in this sample (UWCSEA 6, Exeter 7) sit inside that range; the most sprawling (Vasant Valley ~14) sits well outside it.

`RECOMMENDATION` — Target 6 top-level items plus a visually distinct Admissions CTA. Use **literal, scannable labels** — a parent scanning for fees should not have to guess that fees live under "Glimpses".

### F-6 — Audience-pathway navigation is used by the strongest international references
`OBSERVATION` — UWCSEA's "Find it Fast" segments nine audiences. Raffles operates a separate Parents Gateway. No Indian K-12 reference in the sample offered audience segmentation.

`EVIDENCE` — Corroborated by secondary sources on education web design, which report that serving content by visitor type improves relevance.

`RECOMMENDATION` — Adopt a **lightweight** version: a small "Quick Links" cluster distinguishing prospective parents from current parents. Full nine-way segmentation is disproportionate for a single-campus school and is classified `FUTURE`.

### F-7 — Parent search intent is staged, and the site must serve every stage
`EVIDENCE` — Five documented search intentions (Truth Tree, education marketing research):

| Intent | Parent is asking | Site must provide |
|---|---|---|
| Informational | "What schools are near me?" | Discoverable overview, location, board |
| Discovery | "CBSE school with X" | Specific programme/facility pages |
| Comparative | "How is this school different?" | Differentiators, results, faculty, facilities |
| Transactional | "When do admissions open?" | Dates, process, eligibility, fees, enquiry CTA |
| Navigational | "[School name]" | Own the branded search result |

`RECOMMENDATION` — Map every page in [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) to at least one intent. A page serving no intent is a candidate for deletion. This directly shapes both the IA and the SEO strategy.

### F-8 — Indian parents' stated selection factors
`EVIDENCE` (academic and survey literature on Indian school choice; see §5) — Recurring factors: academic reputation and results · location/proximity · fees and total cost · safety and child protection · infrastructure and facilities · teacher qualifications and class size · values/ethos · extracurricular breadth · personal recommendation and online reviews.

`OBSERVATION` — Safety provisions specifically cited in this literature include CCTV monitoring, a child protection policy, and emergency drills.

`RECOMMENDATION` — Safety deserves **explicit, findable treatment** rather than being scattered through an infrastructure page. It is a top-tier parental concern for the Nursery–Class 10 age range this project serves, and none of the Indian references surfaced it clearly. Transport/proximity likewise needs first-class treatment.

`RECOMMENDATION` — Fees must be genuinely findable. Cost is a stated primary factor; burying it is a known cause of abandonment and erodes trust.

---

## 5. Source Register

### 5.1 Reference Sites

| Source | URL | Accessed | Topic | Influence |
|---|---|---|---|---|
| The Shri Ram School | https://www.tsrs.org/ | 2026-08-16 | Indian K-12 IA, admissions surfacing | F-1, F-2, F-4 |
| Vasant Valley School | https://www.vasantvalley.org/ | 2026-08-16 | Indian K-12 IA, nav breadth | F-1, F-2, F-3, F-5 |
| Sanskriti School | https://www.sanskritischool.edu.in/ | 2026-08-16 | Circulars, staleness | F-1, F-2, F-3 |
| DPS R.K. Puram | https://www.dpsrkp.net/ | 2026-08-16 | Nav labelling, circulars, staleness | F-1, F-2, F-3, F-5 |
| Eton College | https://www.etoncollege.com/ | 2026-08-16 | Admissions tiering, trust signals | F-1, F-4, F-5 |
| Phillips Exeter Academy | https://www.exeter.edu/ | 2026-08-16 | Homepage structure, admissions CTA | F-1, F-4, F-5 |
| UWCSEA | https://www.uwcsea.edu.sg/ | 2026-08-16 | Audience pathways, admissions hub | F-1, F-4, F-5, F-6 |
| Raffles Institution | https://www.ri.edu.sg/ | 2026-08-16 | Multi-surface admissions, parent portal | F-1, F-6 |
| Ashoka University | https://www.ashoka.edu.in/ | 2026-08-16 | Indian premium admissions CTA | F-1 |
| The Doon School | https://www.doonschool.com/ | 2026-08-16 | **HTTP 403 — no data** | none |
| Step by Step School | https://www.stepbystepschool.net/ | 2026-08-16 | **Empty response — no data** | none |

### 5.2 UX, Behaviour and Sector Research

| Source | URL | Accessed | Key finding | Influence |
|---|---|---|---|---|
| Truth Tree — 5 parent search intentions | https://www.truthtree.com/the-5-intentions-of-a-parent-searching-for-a-school-online/ | 2026-08-16 | Parent search is staged: informational → discovery → comparative → transactional → navigational | F-7; IA and SEO strategy |
| Education website design best practices 2026 | https://www.digitalrootsmedia.com/blog/education/education-website-design-best-practices-2026/ | 2026-08-16 | 5–7 top-level categories; audience pathways; trust via accreditation and testimonials | F-5, F-6 |
| JETIR — determinants of parental school choice | https://www.jetir.org/papers/JETIR2503639.pdf | 2026-08-16 | Infrastructure, reputation, teaching, safety, cost as principal factors | F-8 |
| Scroll.in — private school expectation gap study | https://scroll.in/article/905489/ | 2026-08-16 | Mismatch between what Indian parents seek and receive | F-8 |
| Journal of Educational Management Research | https://serambi.org/index.php/jemr/article/view/1927 | 2026-08-16 | Curriculum relevance and quality significantly affect parental choice | F-8 |

### 5.3 Technical Sources — Dated Evidence, Not Standing Requirements

> Per the version policy in [12_TECH_STACK](12_TECH_STACK.md), these are **observations valid on their access date**. They must be re-verified before implementation. Nothing here constitutes a version pin.

| Source | URL | Accessed | Finding (as of access date) |
|---|---|---|---|
| Next.js 16 release notes | https://nextjs.org/blog/next-16 | 2026-08-16 | Turbopack default; `middleware.ts` → `proxy.ts` (Node runtime); Cache Components via `cacheComponents` + `use cache`; `experimental.ppr` removed; async `params`/`searchParams`/`cookies()`/`headers()`; `revalidateTag(tag, profile)` + new `updateTag()` / `refresh()`; Node 20.9+, TS 5.1+; `next/image` defaults changed (`qualities: [75]`, `minimumCacheTTL` 4h, `images.domains` deprecated); `next lint` removed |
| Next.js 16.3 announcement | https://nextjs.org/blog/next-16-3 | 2026-08-16 | 16.3 observed as current stable (released 2026-08-03) |
| Prisma ORM 7 release | https://www.prisma.io/blog/announcing-prisma-orm-7-0-0 | 2026-08-16 | Rust-free TypeScript client by default; generated code out of `node_modules`; ~3× faster queries, ~90% smaller bundles |
| Prisma changelog | https://www.prisma.io/changelog | 2026-08-16 | 7.x line observed through 7.7.0 |
| Prisma — serverless deployment | https://www.prisma.io/docs/orm/v6/prisma-client/deployment/serverless | 2026-08-16 | Driver adapters remove the bundled query-engine binary |
| shadcn/ui — Tailwind v4 | https://ui.shadcn.com/docs/tailwind-v4 | 2026-08-16 | Full v4 support; CSS-first `@theme`; OKLCH colours; no `tailwind.config.js` |
| Auth.js — migrating to v5 | https://authjs.dev/getting-started/migrating-to-v5 | 2026-08-16 | v5 stable; adapter imports must be kept out of the edge/proxy boundary |
| schema.org — EducationalOrganization | https://schema.org/EducationalOrganization | 2026-08-16 | `School` is the appropriate K-12 subtype; parent type is broader |

### 5.4 Authoritative Sources To Consult During Implementation

Not yet consulted in depth; listed so the implementation phase draws on primary sources rather than blog posts.

| Source | URL | Purpose |
|---|---|---|
| W3C WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | Accessibility success criteria |
| WAI-ARIA Authoring Practices | https://www.w3.org/WAI/ARIA/apg/ | Accessible menu, dialog, tab, accordion patterns |
| Google Search Central | https://developers.google.com/search/docs | Structured data, sitemaps, canonicals, indexing |
| web.dev — Core Web Vitals | https://web.dev/vitals/ | LCP, INP, CLS definitions and thresholds |
| MDN Web Docs | https://developer.mozilla.org/ | Platform behaviour reference |
| OWASP Top 10 / ASVS | https://owasp.org/ | Threat modelling, input validation, session security |
| PostgreSQL documentation | https://www.postgresql.org/docs/ | Indexing, constraints, full-text search |

---

## 6. Open Research Questions

Carried into [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

1. **No competitor analysis of the school's actual local market.** The school's name and city are unknown, so its real competitors could not be identified. Local competitors matter more to a parent choosing a day school than Eton does. **This is the largest single gap in this research** and cannot be closed until the school is identified.
2. **No primary user research.** No interviews or surveys with the school's actual parent community. Findings in F-8 come from published literature, not from this school's families.
3. **Mobile behaviour unverified.** Indian web traffic skews heavily mobile; assumed mobile-first, but not measured for this audience.
4. **Language requirements unconfirmed.** Whether Hindi content is expected is unknown. See [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).
5. **No accessibility or performance baseline** for any reference site, per the limitations in §2.
