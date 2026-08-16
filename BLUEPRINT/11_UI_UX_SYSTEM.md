# 11 — UI/UX System

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery) — depends on PROVISIONAL design system |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | UX / Frontend |
| **Dependencies** | [10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md) |
| **Related Documents** | [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) · [14_FRONTEND_ARCHITECTURE](14_FRONTEND_ARCHITECTURE.md) · [26_ACCESSIBILITY](26_ACCESSIBILITY.md) |

---

## Purpose

[10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md) defines what things look like. This document defines **how they behave** — the component inventory, interaction contracts, and state handling that make the design work in practice.

---

## Component inventory

Every component listed once. Duplicates are a defect (NFR-072): one card implementation per purpose, one form field implementation, one lightbox.

### Layout
`SiteHeader` · `UtilityBar` · `PrimaryNav` · `NavDropdown` · `MobileDrawer` · `SiteFooter` · `Container` · `Section` · `Breadcrumbs` · `SkipLink` · `PageHeader`

### Content display
`SectionHeader` (eyebrow + heading + description) · `Prose` (rich-text wrapper) · `StatCard` · `StatBand` · `FeatureCard` · `IconCard` · `Timeline` (admission process) · `Accordion` · `Tabs` · `Table` + `ResponsiveTableWrapper` · `DefinitionList` · `Callout`

### Content-type cards
`NewsCard` · `EventCard` · `FacultyCard` · `AchievementCard` · `NoticeItem` · `DownloadItem` · `TestimonialCard` · `AlbumCard` · `FacilityCard`

> Nine card variants may look like duplication, but each has genuinely different content, metadata, and interaction. What is forbidden is *two* implementations of `NewsCard`. All nine share one `CardShell` primitive.

### Media
`ResponsiveImage` · `ImageGrid` · `MasonryGrid` · `Lightbox` · `Avatar` (with initials fallback) · `LazyMap` · `VideoEmbed`

### Forms
`Form` · `FormField` · `Input` · `Textarea` · `Select` · `Checkbox` · `RadioGroup` · `FileInput` · `FormError` · `FormSuccess` · `SubmitButton`

### Feedback and state
`Button` · `Badge` · `Spinner` · `Skeleton` · `EmptyState` · `ErrorState` · `Toast` · `Modal` · `Drawer` · `Tooltip` · `Pagination` · `FilterChips` · `SearchInput` *(admin only in v1)*

### Admin-only
`AdminShell` · `AdminSidebar` · `DataTable` · `StatusBadge` · `RichTextEditor` · `ImageUploader` · `MediaPicker` · `ConfirmDialog` · `AuditEntry` · `FreshnessIndicator`

---

## Interaction contracts

### Every interactive element
1. Reachable by keyboard in a logical order
2. Visible focus indicator meeting 3:1 contrast, never `outline: none` without a replacement
3. Minimum 44×44px touch target
4. Accessible name — visible text, `aria-label`, or `aria-labelledby`
5. Disabled state never conveyed by colour alone
6. Loading state announced to assistive technology

### Buttons vs links — enforced
A **link** navigates. A **button** performs an action. This is not stylistic: it determines keyboard behaviour (`Enter` vs `Enter`+`Space`), context-menu options, and screen-reader announcement.

- "Enquire Now" navigating to `/admissions/enquire` → a **link** styled as a button
- "Submit Enquiry" → a **button**
- Never `<div onClick>`

### Dropdowns
Open on hover **and** focus (desktop) · `Enter`/`Space`/`ArrowDown` opens · `Escape` closes and returns focus · outside click closes · `aria-expanded` on the trigger · first tap on touch opens rather than navigating, so each dropdown repeats its section landing page as its first item.

### Modals and drawers
Focus moves in on open, is **trapped** while open, returns to the trigger on close · `Escape` closes · `role="dialog"`, `aria-modal="true"`, labelled · background scroll locked · backdrop click closes (except destructive confirmations).

### Accordions
Real `<button>` headers · `aria-expanded` + `aria-controls` · `Enter`/`Space` toggles · height transition respects reduced motion · one-open-at-a-time only where the content demands it.

### Carousels
Used sparingly — testimonials only.
Never auto-advance faster than reading speed · pause control mandatory if it auto-advances at all · `Tab` reaches all slides or a text alternative exists · arrow keys navigate · `aria-live="polite"` on the region · dots are labelled buttons.

> Hero carousels are `NOT_RECOMMENDED`. They harm LCP, split the message, and are widely evidenced to be ignored. A single strong hero image outperforms a rotating set.

### Tables
Real `<table>` semantics · `<caption>` · `scope` on headers · horizontal scroll inside a focusable, labelled container — **the page body never scrolls horizontally** · optional stacked card layout below 480px.

### Filters
Server-rendered default list so content is indexable without JS (NFR-030) · filtering is client-side over already-loaded data for small sets · selected state uses shape and text, not colour alone · result count announced via `aria-live` · a "no results" state always exists.

---

## State handling

Every data-driven surface handles four states. Missing any one is a defect.

| State | Requirement |
|---|---|
| **Loading** | Skeleton matching final layout — prevents CLS. Never a blank screen or bare spinner for content |
| **Empty** | Explains *why* it is empty and what will appear. "No news yet" is insufficient; "News will appear here as it is published" is better |
| **Error** | Explains what failed and offers a route forward. On the public site, that route includes the school's phone number |
| **Success** | Content rendered |

### Enquiry form states — the highest-stakes case

| State | Behaviour |
|---|---|
| Idle | Submit enabled |
| Validating | Inline errors on blur; submit still enabled so the error summary can be reached |
| Submitting | Button shows spinner and accessible status; disabled; width preserved |
| Success | Confirmation with expected response time; `enquiry_submitted` event |
| Failure | **Apology + `[PHONE_NUMBER]` fallback + entered values preserved.** Logged and alerted server-side |

A silent failure here is a lost admission the school never learns about (NFR-063).

---

## Responsive behaviour

Mobile-first. Verified at 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920px.

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Navigation | Drawer + persistent Admissions CTA | Drawer | Full bar + dropdowns |
| Utility bar | Notices + phone only | Full | Full |
| Card grids | 1 col | 2 col | 3–4 col |
| Stat band | 2 col | 4 col | 4–5 col in a row |
| Fee table | Scroll container or stacked cards | Scroll container | Full table |
| Gallery | 2 col | 3 col | 4 col masonry |
| Footer | Stacked accordions | 2 col | 4 col |
| Hero | Stacked, text below image | Overlay | Full overlay |
| Section padding | 64px | 96px | 128px |

**Nothing is desktop-only.** Every feature works on a 320px screen. Indian web traffic skews heavily mobile, and the primary persona researches on a phone.

---

## Content-density principles

Different pages want different densities, and applying one rule everywhere is a common failure.

| Page type | Density | Rationale |
|---|---|---|
| Home, Campus Life, Gallery | **Low** — generous space, large imagery | Emotional and persuasive; space signals quality |
| Academics, About, Admissions | **Medium** — readable prose, clear hierarchy | Informational; being read, not scanned |
| Notices, Downloads, Fee table | **High** — compact rows, minimal decoration | Being *scanned* for one item; whitespace here is friction |
| Admin | **High** — dense tables, tight controls | Task-oriented; efficiency over elegance |

> The Notices page is deliberately the least "designed" page on the site. A parent looking for the holiday list wants a dense, dated, scannable list — not a beautiful editorial layout that shows four items per screen.

---

## Error and empty state copy

Tone: plain, human, never blaming the user, always offering a next step.

| Context | Copy |
|---|---|
| 404 | "We couldn't find that page. It may have moved." + links to major sections + Contact |
| 500 | "Something went wrong at our end. Please try again, or call us on `[PHONE_NUMBER]`." |
| Empty news | "No news has been published yet. School updates will appear here." |
| Empty notices | "There are no current notices. New notices will appear here." |
| Empty gallery | "Photographs are being added. Please check back soon." |
| Filter no-results | "No results for that filter." + clear-filter action |
| Form field error | Specific: "Enter a 10-digit mobile number" — never "Invalid input" |
| Submission failure | "We couldn't submit your enquiry. Please try again, or call `[PHONE_NUMBER]`." |

Never: "Oops!", "Uh oh!", error codes shown to parents, or stack traces (NFR-053).

---

## Admin UX principles

The persona here is a teacher who is not technical (P5), and content freshness across the whole site depends on her confidence.

1. **Publishing a notice takes under three minutes, first attempt, unaided** (AR-020)
2. **Only genuinely necessary fields are required** — title, category, body for a notice. Nothing else
3. **Draft by default; publish is a deliberate act** — removes the fear of breaking something public
4. **Preview before publish** (AR-018)
5. **Plain language** — "Publish" not "Set status to PUBLISHED"; "Web address" not "slug"
6. **Destructive actions confirm** and prefer archive over hard delete
7. **Alt text is explained, not just labelled** — "Describe this photo for people using screen readers" with an example. This field is required for accessibility, so it must be made easy rather than merely enforced
8. **Errors are recoverable** — never lose typed content on a validation failure
9. **Freshness is visible** — stale items flagged in the dashboard (AR-017)

> Design tension, stated openly: principles 2 and 9 pull against 7. Requiring alt text adds friction for the persona most sensitive to it. Accessibility is a `MUST`, so the resolution is to make the field fast and well-explained rather than optional. Worth watching in usability testing.

---

## Component reuse rules

1. Before creating a component, check the inventory above
2. Extend an existing component with variants rather than forking it
3. Shared behaviour lives in a primitive (`CardShell`, `FormField`), not copy-paste
4. No component hard-codes colour, spacing, or type — tokens only (NFR-073)
5. Any new component is added to this inventory in the same change

Violations of rule 4 are the most common source of design-system drift and should be caught by lint.

---

## Deferred

| Feature | Status | Reason |
|---|---|---|
| Dark mode | `NOT_RECOMMENDED` v1 | Doubles design and QA surface; no evidenced demand |
| Hero carousel | `NOT_RECOMMENDED` | Harms LCP, dilutes message |
| Page transition animations | `COULD` | Nice, but risks perceived slowness |
| Site-wide search UI | `FUTURE` | IA is designed so browsing succeeds without it |
| Print stylesheet | `COULD` | Fee structure and calendar are plausibly printed |
| Offline support / PWA | `FUTURE` | Manifest ships; service worker does not |
