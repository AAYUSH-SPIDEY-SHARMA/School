# 26 — Accessibility

| Field | Value |
|---|---|
| **Status** | PROPOSED — **requirements documented, nothing verified** |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Frontend Lead / QA |
| **Dependencies** | [10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md) · [11_UI_UX_SYSTEM](11_UI_UX_SYSTEM.md) |
| **Related Documents** | [31_TESTING_STRATEGY](31_TESTING_STRATEGY.md) · [32_QA_CHECKLIST](32_QA_CHECKLIST.md) |

---

## ⚠️ Documented requirements are not verified compliance

**This document states what the site must do. It does not state what the site does — nothing is built.**

The distinction matters because it is routinely elided. A blueprint that says "WCAG 2.2 AA" is a *target*. Compliance is established only by testing a running site: keyboard walkthroughs, screen-reader passes, measured contrast, real assistive technology.

Until that testing has happened and is recorded, the correct statement is: **"we are designing for WCAG 2.2 AA"** — never "the site is accessible".

No accessibility claim may be made publicly (in marketing, a statement, or a tender response) on the strength of this document alone.

---

## Target — WCAG 2.2 Level AA

Chosen because it is the widely accepted baseline for public-facing institutional sites, and because 2.2 adds criteria that matter for this audience — focus appearance, target size, and reducing cognitive load in form interactions.

**Why it genuinely matters here**, beyond compliance:
- Parents and grandparents across a wide age range use this site, many with age-related vision changes
- Some parents have disabilities; some students will
- A school is a public institution and its website is the front door
- **An inaccessible enquiry form is a parent who cannot contact the school** — accessibility failure and lost admission are the same event

---

## Requirements by principle

### Perceivable

| Requirement | Detail |
|---|---|
| Text alternatives | Every meaningful image has alt text describing content or function; decorative images have empty alt (NFR-014) |
| Alt text quality | Describes the activity — **never names children** (privacy as well as accessibility) |
| Contrast — text | ≥4.5:1 normal, ≥3:1 large (NFR-013) |
| Contrast — non-text | ≥3:1 for UI components, icons, focus indicators, chart elements |
| Colour independence | Never the sole carrier of meaning. Status badges combine colour + text + shape |
| Text resize | Usable to 200% without loss of content or function |
| Reflow | No horizontal scroll at 320px — **except** deliberate scroll containers (the fee table), which are focusable and labelled |
| Media | No autoplaying audio; video captioned if added |

### Operable

| Requirement | Detail |
|---|---|
| Keyboard | **All** functionality operable by keyboard (NFR-011) |
| No traps | Focus never trapped except intentionally in an open dialog, which `Escape` exits |
| Focus visible | Always. Never `outline: none` without a compliant replacement (NFR-012) |
| Focus appearance (2.2) | Indicator meets size and contrast requirements |
| Skip link | First focusable element, visible on focus (NFR-017) |
| Target size (2.2) | ≥24×24px minimum; **44×44px is our standard** |
| Timing | No time limits on any interaction |
| Motion | `prefers-reduced-motion` respected globally (NFR-016) |
| Page titles | Unique and descriptive |
| Focus order | Logical, matching visual order |
| Link purpose | Clear from the link text alone — **no "click here" or "read more" without context** |
| Multiple routes | Navigation, footer, sitemap, breadcrumbs |

### Understandable

| Requirement | Detail |
|---|---|
| Language | `lang` declared; `lang` on any passage in another language |
| Consistent navigation | Same structure and order on every page |
| Consistent identification | Same component, same label, everywhere |
| Labels | Every field visibly labelled and programmatically associated. **Never placeholder-as-label** |
| Error identification | Specific and in text: "Enter a 10-digit mobile number", not "Invalid" |
| Error suggestion | Tell the user how to fix it |
| Redundant entry (2.2) | Do not ask for the same information twice |
| Reading level | Plain language throughout — parents read this on a phone, quickly |

### Robust

| Requirement | Detail |
|---|---|
| Valid HTML | Correctly nested, unique IDs |
| Semantic elements | Real `<button>`, `<nav>`, `<table>`, `<main>`. Never `<div onClick>` |
| Name, role, value | Correct for every custom component |
| Status messages | `aria-live` for form errors, filter results, submission status |
| Landmarks | `header`, `nav`, `main`, `footer`, each labelled where repeated |
| Headings | One `<h1>`; no skipped levels; visual size never dictates level |

---

## High-risk components

Where accessibility most commonly fails, and what is required.

### Gallery lightbox — highest risk
Focus trapped while open and returned to the triggering thumbnail on close · `Escape` closes · arrow keys navigate · all controls are real buttons with accessible names · `role="dialog"`, `aria-modal="true"`, labelled · background scroll locked · current position announced ("Image 3 of 24").

### Mobile navigation drawer
Focus moves in, is trapped, returns to the toggle · `aria-expanded` and `aria-controls` on the toggle · `Escape` closes · accordion headers are real buttons · background scroll locked.

### Dropdown menus
Keyboard-operable — **hover alone is never sufficient** · `Escape` closes and returns focus · first tap on touch opens rather than navigating · `aria-expanded` maintained.

### Fee table
Real `<table>` with `<caption>` and `scope` attributes · horizontal scroll container is **focusable and labelled** so keyboard users can scroll it · never a div grid.

### Forms
The most consequential surface. Full requirements in [24_CONTACT_AND_ENQUIRY_SYSTEM](24_CONTACT_AND_ENQUIRY_SYSTEM.md): visible associated labels, text-indicated required state, inline `aria-describedby` errors, `aria-live` announcements, focus moved to an error summary on failed submit, correct `autocomplete` and input types.

### Statistics counters
The **final value renders server-side**. A screen reader must never encounter a number counting up, and the value must be correct with JavaScript disabled.

### Scroll-reveal animations
Content is **visible by default** and animated as an enhancement — never `opacity: 0` awaiting a script. If JavaScript fails, the content is still there.

---

## PDFs — a known gap

Downloads are largely PDFs, and PDFs are frequently inaccessible. A scanned image of a fee circular is invisible to a screen reader.

**Rule:** where a document contains information parents need, that information must also exist as HTML on the site. The fee table is the clearest case — it exists as a real accessible table, with the PDF as a convenience, not the only source.

The school should be asked to supply text-based rather than scanned PDFs. This is guidance we cannot enforce, and it is recorded as a known limitation rather than claimed as solved.

---

## Testing — what must actually happen

Assigned to the implementation phase. **None of this has been done.**

### Automated (CI)
axe-core on every page and key interaction state; HTML validation; contrast checked programmatically against the real palette. Automated tools catch roughly a third of issues — **passing them is not evidence of accessibility**.

### Manual — required, cannot be automated
1. **Keyboard-only walkthrough** of all six critical journeys ([05_USER_JOURNEYS](05_USER_JOURNEYS.md)) — no mouse
2. **Screen reader passes** — at minimum NVDA (Windows) and VoiceOver (iOS), since the audience is heavily mobile
3. **200% zoom** on every template
4. **320px width** with no horizontal page scroll
5. **Reduced-motion** enabled, all animation confirmed disabled
6. **Colour-blindness simulation** across all status indicators
7. **JavaScript disabled** — content readable, navigation usable, forms submittable

### Recorded
Results, including failures and any accepted deviations, are recorded in [32_QA_CHECKLIST](32_QA_CHECKLIST.md) and dated. A dated failing result is more valuable than an undated claim of success.

---

## Admin accessibility

The admin is held to the same standard. Staff may have disabilities, and an inaccessible CMS is a CMS that a member of staff cannot use — which becomes a content-freshness failure with a different cause.

Practically: keyboard operability throughout, labelled form fields, accessible data tables, focus management in dialogs, and a rich-text editor that is keyboard-operable.

---

## Known tensions — stated, not hidden

**Alt text vs editor friction.** Requiring alt text (AR-009) adds work for the persona least tolerant of it (P5). Resolved by making the field fast and well-explained rather than optional, since accessibility is a `MUST`. Worth watching in usability testing.

**Gold accent vs contrast.** The provisional accent colour may fail 4.5:1 as a text background. If it does, it becomes decorative-only and CTAs use the primary colour. **Accessibility wins over palette preference** ([10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md)).

**Motion vs premium feel.** Entrance animation contributes to the intended quality but must vanish entirely under reduced motion — and the page must look complete without it.

---

## Accessibility statement

An accessibility statement should be published **after** testing, stating the target standard, the date tested, known limitations (such as third-party PDFs), and how to report a problem.

⚠️ **It must not be published before testing.** A statement claiming conformance that has not been verified is a false claim, and for a public institution it is a meaningful one.
