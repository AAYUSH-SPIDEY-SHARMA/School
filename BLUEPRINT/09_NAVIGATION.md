# 09 — Navigation

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery) |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | UX |
| **Dependencies** | [06_INFORMATION_ARCHITECTURE](06_INFORMATION_ARCHITECTURE.md) · [07_SITE_MAP](07_SITE_MAP.md) |
| **Related Documents** | [10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md) · [26_ACCESSIBILITY](26_ACCESSIBILITY.md) |

---

## Structure

Three distinct navigation layers, each serving a different audience.

| Layer | Audience | Persistence |
|---|---|---|
| Utility bar | Current parents (P2) | All pages, desktop; condensed on mobile |
| Primary navigation | Prospective parents (P1) | All pages |
| Footer | All | All pages |

---

## Desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│  Notices · Downloads · Academic Calendar        📞 [PHONE_NUMBER]    │  utility
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [LOGO]   About  Academics  Campus Life  Gallery                     │  primary
│           News & Events  Contact            [ Admissions → ]         │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Six primary items.** Admissions sits outside the six as a visually distinct button — it is the site's conversion goal, and the most common failure across the inspected references was burying it (F-1).

### Dropdown contents

| Item | Type | Contents |
|---|---|---|
| **About** | Dropdown | About the School · Vision & Mission · Principal's Message · Leadership · Infrastructure & Facilities · Safety & Security · Transport |
| **Academics** | Dropdown | Academic Overview · Curriculum · Pre-Primary · Primary · Middle School · Secondary School · Faculty |
| **Campus Life** | Dropdown | Student Life · Sports · Clubs & Activities · Arts & Culture · Achievements |
| **Gallery** | Direct link | — |
| **News & Events** | Dropdown | News · Events |
| **Contact** | Direct link | — |
| **Admissions** | CTA + dropdown | Overview · Process · Eligibility · **Fee Structure** · Important Dates · FAQs · **Enquire Now** |

Two items are direct links rather than dropdowns. A dropdown containing a single meaningful destination is friction without benefit.

### Header behaviour
- Sticky on scroll, condensing to a slimmer bar; the Admissions CTA never leaves
- Utility bar scrolls away on desktop (low-frequency for P1) but is reachable in the footer
- Active section indicated visually and via `aria-current="page"`

---

## Mobile

```
┌────────────────────────────────┐
│ [LOGO]   📞   [Admissions]  ☰  │
└────────────────────────────────┘
```

**The Admissions CTA and click-to-call stay outside the hamburger.** Hiding the primary conversion action behind a menu is the mobile equivalent of the burying failure. Everything else collapses into the drawer.

### Drawer
- Slides from the right, full height, with a scrim
- Sections are accordions, collapsed by default; only one open at a time
- Order: Admissions (expanded by default) → About → Academics → Campus Life → Gallery → News & Events → Contact
- Current-parent links (Notices, Downloads, Calendar) grouped under a visually separated "For Current Parents" heading — a real grouping, not a divider line alone
- Footer of the drawer carries phone, email, and address

### Drawer accessibility
- Focus moves to the drawer on open; **trapped** while open; returned to the toggle on close
- `Escape` closes
- Toggle carries `aria-expanded` and `aria-controls`
- Background scroll locked
- Accordion headers are real `<button>` elements with `aria-expanded`
- Minimum 44×44px tap targets

---

## Breadcrumbs

Present on every page below the top level.

```
Home › Admissions › Fee Structure
```

- Rendered as an ordered list inside `<nav aria-label="Breadcrumb">`
- Current page is `aria-current="page"` and not a link
- `BreadcrumbList` structured data on every instance (NFR-024)
- On mobile, long trails truncate the middle, never the current page

---

## Footer

Four columns on desktop, stacked accordions on mobile.

| Column | Contents |
|---|---|
| **School** | Logo, one-line description, address, phone, email, social links |
| **Explore** | About · Academics · Admissions · Campus Life · Gallery · Achievements |
| **For Parents** | Notices · Downloads · Academic Calendar · Contact · Transport |
| **Admissions** | Overview · Process · Eligibility · Fee Structure · Important Dates · **Enquire Now** |

Bottom bar: `© [YEAR] [SCHOOL_NAME]` · Privacy Policy · Terms of Use · Sitemap · CBSE affiliation `[AFFILIATION_NUMBER]`.

The footer is the safety net — every significant destination is reachable from it, so no page is ever a dead end.

---

## Link and label conventions

**Literal labels only.** Every label states what is behind it. The reference sites offered "Our Ethos", "Glimpses", and "Happenings" — a parent scanning for fees cannot predict which of those contains them (F-5).

| Use | Avoid |
|---|---|
| Fee Structure | Financial Information |
| Notices | Circulars & Communications |
| Safety & Security | Care & Wellbeing |
| Enquire Now | Get In Touch |
| Downloads | Resources |
| News & Events | Media Centre / Happenings |

CTA labels are specific and current: **"Enquire about Admissions [YEAR]"**, not "Contact Us". One reference site's entire admissions call-to-action was "Contact Us" — which asks the parent to do the work of framing their own enquiry.

---

## Accessibility requirements

| Requirement | Detail |
|---|---|
| Skip link | First focusable element; visible on focus; jumps to `<main>` |
| Landmarks | `<nav>` elements with distinct `aria-label` values ("Primary", "Utility", "Footer", "Breadcrumb") |
| Keyboard | Full operability; dropdowns open on `Enter`/`Space`/`ArrowDown`, close on `Escape` |
| Focus | Visible indicator meeting contrast requirements; logical order; no traps outside the drawer |
| Hover-only menus | **Not permitted.** Dropdowns must be operable by keyboard and touch, not hover alone |
| Current page | `aria-current="page"` |
| Reduced motion | Drawer and dropdown transitions disabled under `prefers-reduced-motion` |
| Touch targets | ≥44×44px |

Patterns follow the WAI-ARIA Authoring Practices for disclosure and menu components (NFR-018).

---

## Behaviour notes

**Dropdown interaction.** Open on hover *and* focus on desktop; close on `Escape`, outside click, or focus leaving. Hover alone is never sufficient. On touch devices the first tap opens the dropdown rather than following the parent link — so every dropdown parent also appears as the first item inside its own menu ("Academics" → "Academic Overview"), guaranteeing the section landing page is reachable.

**Scroll behaviour.** Header condenses rather than hiding, so the Admissions CTA is always one tap away. No scroll-hijacking.

**Search.** Not in v1. When added, it occupies the utility bar. The IA is designed so that browsing succeeds without search — search should be an accelerator, not a workaround for a structure users cannot navigate.

---

## Deferred

| Feature | Status | Placement when built |
|---|---|---|
| Site-wide search | `FUTURE` | Utility bar |
| Language toggle (English/Hindi) | `FUTURE` | Utility bar, right |
| Parent portal login | `FUTURE` | Utility bar, right |
| Full audience segmentation (9-way) | `FUTURE` | Rejected for v1 as disproportionate for a single campus (F-6) |
| Mega-menu with imagery | `NOT_RECOMMENDED` | Adds weight and complexity; seven items per dropdown does not need one |
