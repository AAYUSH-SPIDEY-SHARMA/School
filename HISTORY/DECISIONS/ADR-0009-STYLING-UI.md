# ADR-0009 — Styling and Component Library

## Status
**Accepted** — owner-approved 2026-08-16 (D-B5)

> Approved with the standing conditions: CSS-first design tokens, **no hard-coded colours scattered through components**, Radix for accessible primitives. The design system remains `PROVISIONAL` until real branding arrives, and **accessibility takes priority over the provisional palette** — owner-confirmed.

## Date
2026-08-16

## Context

The design system is **`PROVISIONAL`**. The school's logo and brand colours have not been supplied, so the palette in [10_DESIGN_SYSTEM](../../BLUEPRINT/10_DESIGN_SYSTEM.md) is a placeholder that must be replaced once real branding arrives.

This makes **re-theming cost** a first-order selection criterion — unusually, but correctly, ahead of most other considerations.

The site targets WCAG 2.2 AA (NFR-010) and includes several components where accessibility is commonly got wrong: a gallery lightbox, a mobile navigation drawer, dropdown menus, and accordions.

The intended register is premium, academic, and trustworthy — not childish. It must not look like a template.

## Problem

Choose a styling approach and component foundation that can be re-themed cheaply from a brand that does not yet exist, and that gets the accessibility of complex interactive components right.

## Options

### Styling

**Option 1 — Tailwind CSS 4.x.** Version 4 is CSS-first: a `@theme` block in the stylesheet replaces `tailwind.config.js`, and colours use OKLCH — a perceptually uniform space where equal lightness values look equally light across hues, which makes generating an accessible palette far more reliable than HSL.
*Against:* utility classes in markup are divisive; a learning curve for a maintainer unfamiliar with the idiom.

**Option 2 — CSS Modules.** Scoped, standard, no build-time magic.
*Against:* no token system without building one; substantially more boilerplate; re-theming means touching many files.

**Option 3 — styled-components / Emotion.** Component-scoped, dynamic theming.
*Against:* runtime cost on a project where client JavaScript is deliberately minimised, and a poor fit with server components.

**Option 4 — Plain CSS with custom properties.** Zero dependencies, full control.
*Against:* no utility layer means more hand-written CSS and more drift; nothing enforces token usage.

### Components

**Option A — shadcn/ui on Radix.** Source is **copied into the repository**, not installed. Radix supplies focus trapping, keyboard interaction, and ARIA wiring for dialogs, menus, tabs, and accordions.
*Against:* copied source means updates are manual; there is no upstream version to bump.

**Option B — MUI / Chakra / Ant Design.** Comprehensive, mature.
*Against:* strongly opinionated aesthetics that a bespoke school brand would have to fight; larger bundles; theming these to look genuinely custom is more work than it appears.

**Option C — Radix primitives alone.** Unstyled, accessible, minimal.
*Against:* everything must be styled from scratch — viable, but shadcn/ui is essentially this plus a sensible starting point we can freely modify.

**Option D — Build everything.** Full control.
*Against:* focus trapping and ARIA wiring for a lightbox and a drawer are exactly the things that get subtly wrong, and the cost of getting them wrong is that a parent cannot use the site.

## Decision

**Tailwind CSS 4.x + shadcn/ui (on Radix)** — as an `ARCHITECTURAL_RECOMMENDATION`.

## Rationale

**On styling — re-theming cost decides it.**
The palette is provisional and *will* change. Tailwind 4's CSS-first `@theme` maps almost exactly onto the two-layer token architecture already specified: primitives feed semantic tokens, components consume only semantic tokens. Swapping the school's real brand in becomes an edit to **one block in one file**. Option 2 or 4 would spread that change across many files.

OKLCH is a genuine secondary benefit: constructing a palette that meets contrast requirements is materially more predictable in a perceptually uniform space.

**On components — accessibility decides it.**
The lightbox and drawer are the two highest-risk accessibility components in the project ([26_ACCESSIBILITY](../../BLUEPRINT/26_ACCESSIBILITY.md)). Radix handles focus trapping, focus restoration, `Escape` handling, and ARIA wiring — the behaviours most commonly implemented incorrectly.

Owning the source matters for two specific reasons here: components can be **restyled onto our tokens** rather than fought with overrides, which keeps re-theming cheap; and there is no upstream vendor whose breaking change becomes our problem.

Option B was rejected because a component library with a strong opinion about how things look is the fastest route to a site that looks like a template — which is precisely the outcome [02_PRODUCT_VISION](../../BLUEPRINT/02_PRODUCT_VISION.md) rejects.

## Consequences

### Positive
- Re-theming from provisional to real brand is a single-file change
- OKLCH makes accessible palette construction predictable
- Radix supplies the accessibility behaviours that are hardest to get right
- Owned source can be modified freely; no upstream breaking changes
- No runtime styling cost, suiting a server-component-first architecture

### Negative
- Utility classes in markup are an acquired taste, and a maintainer may dislike them
- Copied components must be updated manually if upstream fixes matter
- Tailwind 4 uses modern browser features — acceptable given the framework's own browser targets
- Requires discipline: **no hard-coded colours or spacing in components** (NFR-073)

### Risks
- **Design-system drift** as ad-hoc values creep into components. Mitigated by lint rules where possible and by review
- **⚠️ The provisional accent colour may fail contrast.** Warm golds frequently fail 4.5:1 as a text background. If it does, it becomes decorative-only and CTAs use the primary colour. **Accessibility wins over palette preference** ([10_DESIGN_SYSTEM](../../BLUEPRINT/10_DESIGN_SYSTEM.md) D-D2)
- **Radix defaults assumed correct.** Mitigated by manual keyboard and screen-reader testing rather than trusting the library ([31_TESTING_STRATEGY](../../BLUEPRINT/31_TESTING_STRATEGY.md))

## Implementation notes

- All tokens in **one** `@theme` block — the single point of re-theming
- Components consume **semantic** tokens (`--color-primary`), never primitives (`--color-navy-700`)
- shadcn components are restyled onto tokens, not overridden
- No `tailwind.config.js` in v4
- Contrast **measured** against the real palette once supplied — never assumed
- Two font families maximum, self-hosted

## Related

- [10_DESIGN_SYSTEM](../../BLUEPRINT/10_DESIGN_SYSTEM.md) · [11_UI_UX_SYSTEM](../../BLUEPRINT/11_UI_UX_SYSTEM.md) · [26_ACCESSIBILITY](../../BLUEPRINT/26_ACCESSIBILITY.md)
- Decisions D-B5 and D-D1/D-D2 in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
