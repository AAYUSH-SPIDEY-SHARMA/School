# CHANGE-0004 — Provisional Design System

## Date
2026-08-16

## Category
UX / Design

## Status
COMPLETED — **marked PROVISIONAL, not frozen**

## Trigger
Page specifications and component work require design tokens. No school branding assets were supplied, and none were found in the repository or adjacent directories ([CHANGE-0001](CHANGE-0001-INITIAL-DISCOVERY.md)).

## Previous State
No design system. No logo, brand colours, typography, photography, or existing identity available for inspection.

## New State

A **complete but explicitly provisional** design system: a two-layer OKLCH token architecture, fluid type scale, 4px spacing scale, breakpoints, radius and elevation scales, component variants, and motion rules with mandatory reduced-motion handling.

**Status: `PROVISIONAL`.** Every colour value is a placeholder.

### The path to a frozen system
```
PROVISIONAL (now)
   ↓  receive logo, brand assets, photography
BRAND ANALYSIS      extract palette, measure contrast, assess type pairing
   ↓
DESIGN SYSTEM v2    real tokens, real type, real imagery
   ↓
DESIGN REVIEW       school approval + accessibility validation
   ↓
FROZEN              status COMPLETED; blueprint version → 0.2.0
```

## Reason

A school's palette must derive from its logo and existing identity — prospectuses, uniforms, signage. **Inventing a palette and presenting it as final would produce a website that does not look like the school it represents**, and would have to be redone once real branding arrived.

The alternative — building no design system until assets arrive — would block all component and page work indefinitely, on a dependency outside engineering control.

The resolution is a complete, coherent, implementable system that is honest about its status and cheap to replace.

## Alternatives Considered

### Option A — Wait for branding
Rejected: blocks Phases 1–3 entirely on a dependency with an unknown timeline (R-01).

### Option B — Invent a palette and call it final
Rejected: guarantees rework, and risks a school-branded site that does not match the school's actual brand.

### Option C — Complete provisional system with a documented path to freezing *(selected)*
Engineering proceeds; re-theming is a single-file change; the status is visible to every reader.

## Decision

Option C. The two-layer token architecture is what makes it viable: primitives feed semantic tokens, and components consume **only** semantic tokens. Swapping the real brand in becomes an edit to one `@theme` block.

## Evidence

- No branding assets present — confirmed by inspecting both the repository and the parent directory, not assumed
- Tailwind 4's CSS-first `@theme` and OKLCH support verified against documentation, 2026-08-16 ([45_RESEARCH_SOURCES](../../../BLUEPRINT/45_RESEARCH_SOURCES.md) §5.3)
- OKLCH is perceptually uniform, making accessible palette construction materially more predictable than HSL

## Impact

### Product
Design direction established — premium, academic, modern, trustworthy; deliberately not childish, because the audience for a school's visual identity is the **parent**.

### UX
Component variants, states, spacing rhythm, and motion rules are defined, so implementation is unblocked.

### Technical
Two-layer tokens make re-theming a one-file change. No hard-coded colours permitted in components (NFR-073).

### Performance
Two font families maximum, self-hosted, subset, metric-matched fallback so swapping causes no layout shift.

### Accessibility
Contrast targets specified. ⚠️ **Not verified** — no measurement has been run, and none should be claimed until it has.

**Known risk:** warm golds frequently fail 4.5:1 as a text background. If the accent fails, it becomes decorative-only and CTAs use the primary colour. **Accessibility wins over palette preference.**

### Development
Unblocks Phases 1–3. A re-theming pass should be expected once real branding arrives.

## Files Changed
- `HISTORY/2026/08/CHANGE-0004-PROVISIONAL-DESIGN-SYSTEM.md` (this file)

## Blueprint Documents Updated
[10_DESIGN_SYSTEM](../../../BLUEPRINT/10_DESIGN_SYSTEM.md) · [11_UI_UX_SYSTEM](../../../BLUEPRINT/11_UI_UX_SYSTEM.md) · [39_OPEN_DECISIONS](../../../BLUEPRINT/39_OPEN_DECISIONS.md) (OD-001, OD-002)

## Related Changes
[ADR-0009](../../DECISIONS/ADR-0009-STYLING-UI.md) — the styling and component decision, where **re-theming cost was the deciding criterion** precisely because of this provisional status.

## Follow-Up Work
1. **Obtain logo and brand assets** (OD-001) — blocking
2. **Obtain 20–40 campus photographs** (OD-002) — blocking; a premium design cannot be achieved without them, and stock imagery is forbidden
3. Measure contrast against the real palette; demote the accent if it fails
4. Confirm whether Devanagari coverage is required (OD-009)
5. Freeze the system and bump the blueprint to 0.2.0

## Verification
Consistency audit asserts the design system status reads `PROVISIONAL` wherever referenced, and that no document claims verified contrast compliance.

## Notes
The honest position: this is a good system that will look unremarkable until real photography exists. Layouts are deliberately built to make good photography look good — and to fail visibly when it is absent, rather than papering over the gap with stock imagery.
