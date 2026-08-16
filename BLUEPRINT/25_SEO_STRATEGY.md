# 25 — SEO Strategy

| Field | Value |
|---|---|
| **Status** | PROPOSED |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | SEO / Frontend Lead |
| **Dependencies** | [07_SITE_MAP](07_SITE_MAP.md) · [21_CONTENT_MODEL](21_CONTENT_MODEL.md) |
| **Related Documents** | [06_INFORMATION_ARCHITECTURE](06_INFORMATION_ARCHITECTURE.md) · [27_PERFORMANCE](27_PERFORMANCE.md) · [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) F-7 |

---

## Why SEO is the primary acquisition channel

Parents find schools by searching. The documented five-stage search intent model (F-7) means search is not one channel among several — it is how the entire evaluation journey begins and how each subsequent question gets answered.

The site is built server-rendered specifically so this works (NFR-030).

---

## Search intent → page mapping

Every page targets at least one documented intent. A page targeting none is a candidate for deletion.

| Intent | Parent query shape | Target pages |
|---|---|---|
| **Informational** | "cbse schools in [locality]" | Home, About |
| **Discovery** | "cbse school with transport [area]", "school with good sports [city]" | Academics stages, Sports, Facilities, Transport |
| **Comparative** | "[school A] vs [school B]", "best cbse school [locality]" | About, Achievements, Faculty, Safety, Gallery |
| **Transactional** | "[school] admission 2026", "[school] fees" | Admissions, Fees, Eligibility, Important Dates |
| **Navigational** | "[school name]", "[school] holiday list" | Home, Notices, Downloads, Calendar, Contact |

### The highest-value queries
For a day school, the queries that convert are **local and specific**: `[school name]`, `[school name] fees`, `[school name] admission`, `cbse school [locality]`, `schools near [landmark]`.

Two consequences:
1. **Local SEO matters more than general SEO.** A parent will not consider a school 40km away regardless of its ranking.
2. **`/fees` and `/admissions` must be indexed and reachable.** Hiding fees behind a phone call also hides them from search — losing a high-intent query the school would otherwise win.

---

## Technical foundation

| Element | Implementation |
|---|---|
| Rendering | Server-rendered; content indexable without JS execution |
| URLs | Clean, lowercase, hyphenated, no IDs, no trailing slash |
| Canonicals | Absolute, on every page, always pointing at the current slug |
| Sitemap | Auto-generated, includes published dynamic content, `lastModified` from `updatedAt` |
| robots.txt | Generated; disallows `/admin` and `/api` |
| Redirects | Permanent 301s from slug history; shortcut redirects for `/fees`, `/faculty` |
| Breadcrumbs | On every page below top level, with structured data |
| Pagination | Crawlable links, not JS-only |
| Staging | **Blanket `noindex`** — a duplicate indexed staging site is a genuine hazard (NFR-066) |

### Indexing rules

| Indexed | Not indexed |
|---|---|
| All 37 public static routes | `/admin/*` |
| Published news, events, albums, faculty | `/api/*` |
| — | Draft, archived, soft-deleted content |
| — | Expired notices |
| — | Staging and preview deployments |

Unpublished content is excluded **at the query layer**, so it never appears in a rendered response for a crawler to find.

---

## Metadata

### Two levels — deliberately separated

**Global defaults** in `SiteSetting`, editable without a deploy (NFR-029): title template, default description, default OG image, social profiles, canonical base URL.

**Per-page metadata** overrides globals. Dynamic entities carry optional `seoTitle` and `seoDescription` with a fallback chain — editors usually leave them blank and the fallbacks do the work ([21_CONTENT_MODEL](21_CONTENT_MODEL.md)).

### Title patterns

| Page | Pattern |
|---|---|
| Home | `[SCHOOL_NAME] — CBSE School in [CITY] \| Nursery to Class 10` |
| Admissions | `Admissions [YEAR] — [SCHOOL_NAME]` |
| Fees | `Fee Structure [YEAR] — [SCHOOL_NAME]` |
| Section page | `[Page Title] — [SCHOOL_NAME]` |
| News article | `[Headline] — [SCHOOL_NAME]` |

Titles carry board, location, and grade range where they fit. A parent scanning results is filtering on exactly those three things.

Descriptions: ≤160 characters, specific, written for a human deciding whether to click — never keyword lists.

### Social metadata
OpenGraph and Twitter cards on every page. Dynamic OG images per news article and event via the image route ([18_API_SPECIFICATION](18_API_SPECIFICATION.md)). Default OG image is a campus photograph — school links are shared heavily in parent WhatsApp groups, and the preview image is often the first impression.

---

## Structured data

JSON-LD, in the document head.

| Type | Where | Key properties |
|---|---|---|
| **`School`** | Home, About, Contact | `name`, `address`, `telephone`, `email`, `url`, `logo`, `geo`, `openingHours`, `foundingDate` |
| `WebSite` | Home | `name`, `url` |
| `BreadcrumbList` | All pages below top level | Full trail |
| `Article` | News detail | `headline`, `datePublished`, `dateModified`, `image`, `author`, `publisher` |
| `Event` | Event detail | `name`, `startDate`, `endDate`, `location`, `eventStatus` |
| `FAQPage` | Admissions FAQ | Question/answer pairs |
| `ImageObject` | Gallery albums | — |

### Why `School`, not `EducationalOrganization`
`School` is the correct subtype for a K-12 institution. `EducationalOrganization` is its broader parent and covers everything from universities to training providers; using the specific type gives search engines a more precise signal (verified against schema.org, 2026-08-16 — [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md)).

⚠️ **All structured data values come from `SiteSetting` placeholders until the school supplies real details.** Publishing invented address or contact data in structured markup is worse than publishing none — it feeds bad data directly into search engines and map providers.

---

## Local SEO

For a day school this is the highest-leverage SEO work, and most of it happens **off** the website.

| Action | Owner |
|---|---|
| Google Business Profile — claimed, complete, categorised as a school | **School** |
| NAP consistency (name, address, phone) across site, profile, and directories | School + site |
| `School` structured data with `geo` and `openingHours` | Site |
| Locality named naturally in homepage and contact copy | Site |
| Embedded map | Site |
| Reviews on the business profile | **School** |
| Listings on Indian school directories | **School** |

> Several of these are the school's to do, not the developer's. Recorded here so they are not silently assumed to be handled. A complete Google Business Profile frequently outperforms the website for `[school name]` searches.

---

## Content strategy for search

| Page | Serves | Note |
|---|---|---|
| Fee Structure | `[school] fees` — very high intent | **Must be indexable.** Hiding fees hides them from search |
| Admissions | `[school] admission [year]` | Highest-converting page |
| Eligibility | "age criteria class 1 cbse" | Answers a common standalone query |
| Transport | "school bus [area]" | Often a disqualifying question — answering it wins the parent |
| Safety | "school safety cctv" | Under-served by competitors (F-8) |
| Academic stages | "cbse primary school [locality]" | Long-tail discovery |
| News | Freshness and topical breadth | Signals an active institution |
| Notices | Navigational for current parents | High repeat traffic |

**Content rules:** write for parents, not crawlers · answer the question in the first paragraph · headings mirror real questions · no keyword stuffing · **no fabricated claims** — a false statistic is both a misrepresentation and a reputational risk if contradicted elsewhere.

---

## Performance and SEO

Core Web Vitals are a ranking input, and more importantly a parent on a slow phone abandons a slow page regardless of ranking. Targets and approach in [27_PERFORMANCE](27_PERFORMANCE.md).

---

## Measurement

| Tool | Purpose | Owner |
|---|---|---|
| Google Search Console | Impressions, clicks, position, coverage, Core Web Vitals field data | School + dev |
| Analytics | Behaviour, conversion | Both |
| Rich results testing | Structured data validation | Dev |
| Business Profile insights | Local performance | School |

**Tracked:** rank for `[school name]` (target: position 1) · impressions for `cbse school [locality]` · clicks to `/admissions` and `/fees` · indexed page count vs expected · Core Web Vitals field pass rate · 404 rate from Search Console.

**Not tracked:** keyword density, domain authority scores, or any vendor-proprietary metric that does not correspond to an actual parent behaviour.

---

## Launch checklist

- [ ] All 37 static routes have unique title and description
- [ ] Canonicals absolute and correct on every page
- [ ] `School` structured data validates, with **real** school details
- [ ] Sitemap generates and includes dynamic content
- [ ] robots.txt disallows `/admin` and `/api`
- [ ] **Staging confirmed `noindex`**
- [ ] Google Search Console verified, sitemap submitted
- [ ] Google Business Profile claimed and complete
- [ ] Redirects tested, including slug-history 301s
- [ ] OG images render correctly when a link is shared
- [ ] Content renders with JavaScript disabled
- [ ] No `[PLACEHOLDER]` tokens remain in any indexable page

The last item is a hard gate. A placeholder token appearing in a search result is both embarrassing and a trust failure at the exact moment a parent forms a first impression.

---

## Deferred

| Item | Status |
|---|---|
| Multilingual (`hreflang`) | `FUTURE` — pending Hindi confirmation |
| Blog beyond news | `COULD` |
| Video schema | `FUTURE` |
| AMP | `NOT_RECOMMENDED` — removed from the framework and no longer relevant |
| Link building | `NOT_RECOMMENDED` — local directories and genuine coverage only |
