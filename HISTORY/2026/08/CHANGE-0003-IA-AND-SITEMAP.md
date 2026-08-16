# CHANGE-0003 — Information Architecture and Route Table

## Date
2026-08-16

## Category
UX / Product

## Status
COMPLETED

## Trigger
Reference-site research produced a clear, repeated pattern of information-architecture failure in Indian K-12 school websites. The IA needed to be designed against that evidence rather than against convention.

## Previous State

The owner's initial outline proposed a conventional structure: seven top-level sections including "Media" and "Resources", an academics tree spanning Pre-Primary through Senior Secondary, and a homepage of roughly twelve sections.

## New State

**Six top-level navigation items plus a visually distinct Admissions CTA**, a separate utility bar for current parents, and a definitive route table of **81 patterns**: 37 static public, 4 dynamic, 34 admin, 6 system.

### Changes from the initial outline

| Change | Reason |
|---|---|
| "Media" → **News & Events**; "Resources" → **Notices / Downloads / Calendar** | Literal labels. A parent scanning for fees cannot predict what "Media" contains (F-5) |
| **Admissions pulled out of the six** into a CTA button | It is the conversion goal, and burying it is the sector's defining failure (F-1) |
| **Notices and Downloads moved to a utility bar** | They serve current parents, not prospective ones. Keeping them in the main nav dilutes it while still leaving them hard to find (F-2) |
| **Safety & Security promoted to its own page** | A top-tier parental concern that **no inspected Indian reference surfaced as a findable destination** (F-8) |
| **Transport promoted to its own page** | Proximity is often the first disqualifier for a day school (F-8) |
| **Senior Secondary removed**; academics reduced to four stages | Owner decision: CBSE, Nursery–Class 10 |
| Homepage reduced from ~12 to **10 sections** | Achievements and Gallery folded into adjacent sections with links to their own pages |

## Reason

The research finding was unambiguous and consistent across the whole sample:

| Site | Admissions on homepage? | Terminal CTA |
|---|---|---|
| The Shri Ram School | Banner announcement only | "Contact Us" |
| Vasant Valley | **No** | — |
| Sanskriti | **No** | — |
| DPS R.K. Puram | Buried under "Online" | — |
| Phillips Exeter | **Yes** | "Schedule a campus visit" |
| UWCSEA | **Yes** | "Apply Now" |
| Raffles | **Yes** — three surfaces | DSA pathways |
| Eton | **Yes** | Age-specific entry |

Four of four Indian references under-surface admissions; four of four international references do not. Crucially, an Indian *premium university* in the same sample surfaces admissions with a clear application-portal CTA — so this is a **K-12 sector gap, not a market limitation**.

Separately, all four Indian references mix operational circulars into general news, and two showed visible staleness (a notice dated August 2020 live in 2026; a 2018 copyright).

## Alternatives Considered

### Option A — Conventional structure ("Media", "Resources", admissions in the nav)
Familiar and safe. Rejected: it reproduces the exact failure the research identified.

### Option B — Full nine-way audience segmentation, as UWCSEA uses
Genuinely effective on a large multi-campus international school. Rejected as disproportionate for a single campus; classified `FUTURE`. A lightweight two-audience split (utility bar vs main nav) captures most of the benefit.

### Option C — Flat navigation with many top-level items
Observed at one reference (~14 items). Rejected: exceeds scanning capacity and provides no grouping signal.

## Decision

Six-item navigation, literal labels, Admissions as a distinct CTA, current-parent utility bar, four elevated pages, 81 route patterns.

## Evidence
[45_RESEARCH_SOURCES](../../../BLUEPRINT/45_RESEARCH_SOURCES.md) §3 (nine sites inspected 2026-08-16), findings F-1, F-2, F-3, F-5, F-6, F-7, F-8.

## Impact

### Product
Admissions becomes reachable in one click from every page. Notices and Downloads become first-class rather than footer links.

### UX
Every page maps to at least one of the five documented parent search intents. Nothing a parent urgently needs is more than two clicks from the homepage.

### Technical
81 route patterns define the application structure. Four dynamic patterns require slug management and 301 redirect handling.

### SEO
Literal labels align navigation with real query language. `/fees` and `/faculty` shortcut redirects catch plausible direct-entry guesses. Fee and safety pages are indexable, targeting queries competitors do not serve.

### Performance
Homepage reduced to 10 sections, lowering initial payload — though the sections were ordered by parent journey first, with performance engineered around that ordering rather than driving it.

### Accessibility
Six top-level items with literal labels reduce cognitive load. The Admissions CTA stays outside the mobile hamburger.

### Development
The route table is the authoritative structure. Any route in code absent from it is documented drift.

## Files Changed
- `HISTORY/2026/08/CHANGE-0003-IA-AND-SITEMAP.md` (this file)

## Blueprint Documents Updated
[06_INFORMATION_ARCHITECTURE](../../../BLUEPRINT/06_INFORMATION_ARCHITECTURE.md) · [07_SITE_MAP](../../../BLUEPRINT/07_SITE_MAP.md) · [08_PAGE_SPECIFICATIONS](../../../BLUEPRINT/08_PAGE_SPECIFICATIONS.md) · [09_NAVIGATION](../../../BLUEPRINT/09_NAVIGATION.md) · [01_PROJECT_OVERVIEW](../../../BLUEPRINT/01_PROJECT_OVERVIEW.md)

## Related Changes
Homepage section rationale was revised by [CHANGE-0007](CHANGE-0007-REVIEW-CORRECTIONS.md) — reordered by parent journey rather than trimmed on performance grounds.

## Follow-Up Work
1. **Local competitor analysis once the school is identified** — the largest research gap. A parent choosing a day school compares against schools within a few kilometres, not against Eton
2. Confirm whether an existing school website exists (OD-007) — affects redirect strategy and preserved ranking
3. Validate the IA with real parents if the opportunity arises

## Verification
Consistency audit asserts: 37 static + 4 dynamic + 34 admin + 6 system = 81; every route has exactly one specification; zero references to Class 11, Class 12, streams, or senior secondary.

## Notes
The single most consequential decision here is separating News from Notices. It costs one extra module and is the difference between serving two audiences and serving neither.
