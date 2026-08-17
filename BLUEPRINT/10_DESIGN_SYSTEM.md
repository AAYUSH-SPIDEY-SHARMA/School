# 10 — Design System

| Field | Value |
|---|---|
| **Status** | ⚠️ **PROVISIONAL** — blocked on school branding assets |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Design |
| **Dependencies** | School logo and brand assets *(NOT SUPPLIED)* |
| **Related Documents** | [02_PRODUCT_VISION](02_PRODUCT_VISION.md) · [11_UI_UX_SYSTEM](11_UI_UX_SYSTEM.md) · [26_ACCESSIBILITY](26_ACCESSIBILITY.md) |

---

## ⚠️ Provisional status

**Every colour value in this document is a placeholder.**

A school's palette must derive from its logo and existing identity — printed prospectuses, uniforms, signage, letterheads. None of these have been supplied. Inventing a palette now and calling it final would produce a website that does not look like the school it represents.

What follows is a **complete, coherent, accessibility-validated starting system** that can be implemented immediately and re-themed later. Because all colour flows from a token layer, swapping the palette is a change to one file — not a rewrite.

### Path to a frozen design system

```
PROVISIONAL (now)
   ↓  receive logo, brand assets, photography
BRAND ANALYSIS      — extract palette, assess contrast, identify type pairing
   ↓
DESIGN SYSTEM v2    — real tokens, real type, real imagery
   ↓
DESIGN REVIEW       — school approval + accessibility validation
   ↓
FROZEN              — status COMPLETED; blueprint version bumps to 0.2.0
```

Tracked in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) as a blocking input.

---

## Design direction

**Premium · academic · modern · trustworthy — never childish.**

The audience for a school's visual identity is the **parent**, not the child. Bright primaries and rounded cartoon shapes signal "playgroup" to an adult deciding where their ten-year-old will spend six years. The register to aim for sits closer to a well-designed university or cultural institution.

| Do | Avoid |
|---|---|
| Deep, saturated institutional colour | Rainbow primaries |
| Generous whitespace | Dense, boxed layouts |
| Confident large type | Small type with decorative headings |
| Real photography carrying the emotion | Clip-art, illustrations of children |
| Restrained, purposeful motion | Parallax, carousels that auto-advance fast |
| Subtle elevation | Heavy drop shadows, gradients on everything |

---

## Colour system

Tailwind CSS 4 uses a CSS-first `@theme` block and **OKLCH**, a perceptually uniform colour space where equal lightness values look equally light across hues. This makes accessible palette generation far more reliable than HSL.

### Token structure

Two layers. Components consume **semantic** tokens only, never primitives directly — this is what makes re-theming a single-file change.

```
Primitive tokens   →   Semantic tokens   →   Components
--color-navy-700       --color-primary       Button
--color-gold-500       --color-accent        Badge
```

### ⚠️ Revised 2026-08-17 — the implemented palette differs from the block below

The palette below is the **original discovery-phase proposal**, retained because it is what the rest of this document was written against. The palette actually implemented in `app/globals.css` was revised after owner review of the first build.

**Why it changed.** The first implementation read flat and clinical, and the cause was structural rather than a matter of taste:

| Problem | Cause | Fix |
|---|---|---|
| Page felt cold and generic | Background was `neutral-50` — a **cool, blue-tinted near-white** | Base is now a **warm cream/parchment** |
| Nothing anchored the page | No large blocks of colour anywhere; every section was white | **Deep navy "ink" surfaces** for hero, CTA bands and footer |
| Palette looked unused | Gold was defined but almost never rendered | Gold now carries **eyebrows, display accents, rules, statistics and photo frames** |

The token *structure* is unchanged — components still consume semantic tokens only, and re-theming when the school's logo arrives is still a one-file change. Only the values and their application moved.

**Open design decision 6 is now RESOLVED.** The question was "whether accent gold passes contrast as a CTA background, or is demoted to decorative use."

> **Answer: gold is decorative and light-on-dark. It is never a CTA background, and never small text on cream.**
>
> A gold light enough to read as gold cannot reach 4.5:1 behind white text; darkening it until it can turns it brown and loses the quality worth having. So:
>
> - gold on **navy** → display text, eyebrows, statistics ✅
> - gold on **cream** → rules, borders, frames, icons only ✅ (3:1 non-text)
> - `accent-ink` (gold-800) → the one gold dark enough for small text on cream
> - **CTAs are royal blue or navy with white text** ✅
>
> This is the document's own rule — *accessibility wins over palette preference* — applied rather than set aside.

`--color-cta` (royal blue) was added as a semantic token for exactly this reason. There is deliberately **no gold button variant** in `components/ui/Button.tsx`.

⚠️ Still provisional as to the school's **own** brand: the logo has not been supplied (OD-002), so none of this is derived from it.

---

### Provisional palette *(original proposal — superseded, see above)*

```css
@theme {
  /* ── Primitives — PROVISIONAL ─────────────────────── */
  --color-navy-50:  oklch(0.97 0.012 250);
  --color-navy-100: oklch(0.93 0.028 250);
  --color-navy-200: oklch(0.86 0.052 250);
  --color-navy-300: oklch(0.74 0.084 250);
  --color-navy-400: oklch(0.62 0.112 252);
  --color-navy-500: oklch(0.52 0.128 254);
  --color-navy-600: oklch(0.43 0.124 256);
  --color-navy-700: oklch(0.35 0.108 258);
  --color-navy-800: oklch(0.27 0.084 260);
  --color-navy-900: oklch(0.20 0.060 262);
  --color-navy-950: oklch(0.15 0.042 264);

  --color-gold-50:  oklch(0.97 0.022 85);
  --color-gold-100: oklch(0.94 0.046 84);
  --color-gold-200: oklch(0.89 0.082 83);
  --color-gold-300: oklch(0.83 0.116 82);
  --color-gold-400: oklch(0.77 0.140 80);
  --color-gold-500: oklch(0.70 0.148 78);
  --color-gold-600: oklch(0.61 0.136 76);
  --color-gold-700: oklch(0.50 0.114 74);
  --color-gold-800: oklch(0.40 0.090 72);
  --color-gold-900: oklch(0.32 0.070 70);

  --color-neutral-0:   oklch(1    0     0);
  --color-neutral-50:  oklch(0.98 0.003 250);
  --color-neutral-100: oklch(0.96 0.005 250);
  --color-neutral-200: oklch(0.91 0.007 250);
  --color-neutral-300: oklch(0.84 0.009 250);
  --color-neutral-400: oklch(0.68 0.011 250);
  --color-neutral-500: oklch(0.55 0.012 250);
  --color-neutral-600: oklch(0.45 0.012 250);
  --color-neutral-700: oklch(0.36 0.010 250);
  --color-neutral-800: oklch(0.26 0.008 250);
  --color-neutral-900: oklch(0.18 0.006 250);

  --color-success: oklch(0.58 0.130 155);
  --color-warning: oklch(0.72 0.150 75);
  --color-error:   oklch(0.55 0.190 27);
  --color-info:    oklch(0.58 0.120 240);

  /* ── Semantic ─────────────────────────────────────── */
  --color-primary:            var(--color-navy-700);
  --color-primary-hover:      var(--color-navy-800);
  --color-primary-foreground: var(--color-neutral-0);

  --color-accent:             var(--color-gold-600);
  --color-accent-hover:       var(--color-gold-700);
  --color-accent-foreground:  var(--color-neutral-0);

  --color-background:         var(--color-neutral-50);
  --color-surface:            var(--color-neutral-0);
  --color-surface-raised:     var(--color-neutral-0);
  --color-surface-sunken:     var(--color-neutral-100);

  --color-foreground:         var(--color-neutral-900);
  --color-foreground-muted:   var(--color-neutral-600);
  --color-foreground-subtle:  var(--color-neutral-500);

  --color-border:             var(--color-neutral-200);
  --color-border-strong:      var(--color-neutral-300);
  --color-ring:               var(--color-navy-500);
}
```

### Contrast obligations

Contrast must be **verified with a measurement tool**, not assumed. The provisional palette was constructed with these targets, but no automated check has been run and none should be claimed until it has (NFR-013, [26_ACCESSIBILITY](26_ACCESSIBILITY.md)).

| Pair | Requirement |
|---|---|
| `foreground` on `background` | ≥ 7:1 (AAA where achievable) |
| `foreground-muted` on `background` | ≥ 4.5:1 |
| `primary-foreground` on `primary` | ≥ 4.5:1 |
| `accent-foreground` on `accent` | ≥ 4.5:1 — **gold is the highest-risk pair; verify before use on text** |
| Focus ring on any surface | ≥ 3:1 |
| Borders and icons | ≥ 3:1 |

> ⚠️ Warm golds frequently fail contrast as a text background. If `accent` fails at 4.5:1, it becomes a decorative and border colour only, and CTAs use `primary`. **Accessibility wins over palette preference.**

### Dark mode
`NOT_RECOMMENDED` for v1. School websites are consumed in daylight and in print-adjacent contexts, dark mode doubles the design and QA surface, and no research finding indicates parent demand. The token structure does not preclude it later.

---

## Typography

### Provisional pairing

| Role | Typeface | Rationale |
|---|---|---|
| Display / headings | A transitional or old-style serif | Serifs read as academic and established — the trust register |
| Body / UI | A humanist sans | Screen legibility at small sizes |

Provisional choices: **Fraunces** or **Source Serif 4** for display; **Inter** for body. Both are open-licensed and self-hostable.

Requirements regardless of final choice:
- **Self-hosted** — no third-party font CDN (privacy, and one less blocking origin)
- Latin + Latin Extended; **Devanagari coverage required if Hindi is confirmed** ([39_OPEN_DECISIONS](39_OPEN_DECISIONS.md))
- Variable fonts preferred; subset to used glyphs
- `font-display: swap` with a metric-matched fallback so swapping causes no layout shift (NFR-005)
- Two families maximum

### Type scale

Fluid, `clamp()`-based between 320px and 1440px.

| Token | Mobile → Desktop | Weight | Line height | Use |
|---|---|---|---|---|
| `display` | 2.5 → 4.5rem | 600 | 1.05 | Hero headline |
| `h1` | 2 → 3rem | 600 | 1.15 | Page title |
| `h2` | 1.5 → 2.25rem | 600 | 1.25 | Section |
| `h3` | 1.25 → 1.75rem | 600 | 1.3 | Subsection |
| `h4` | 1.125 → 1.375rem | 600 | 1.4 | Card title |
| `body-lg` | 1.125 → 1.25rem | 400 | 1.65 | Intro paragraph |
| `body` | 1 → 1.0625rem | 400 | 1.7 | Default |
| `body-sm` | 0.875rem | 400 | 1.6 | Secondary |
| `caption` | 0.8125rem | 400 | 1.5 | Captions, meta |
| `label` | 0.875rem | 500 | 1.4 | Form labels |
| `overline` | 0.75rem | 600 | 1.3 | Eyebrow text, uppercase, tracked |

**Rules:** body never below 16px on mobile · measure capped at 65–75 characters · headings never rely on colour alone for hierarchy · visual size never dictates heading level (use tokens on the semantically correct element).

---

## Spacing

4px base, geometric progression.

| Token | Value | Use |
|---|---|---|
| `space-1` … `space-3` | 4 / 8 / 12px | Icon gaps, tight stacks |
| `space-4` … `space-6` | 16 / 20 / 24px | Default gaps, card padding |
| `space-8` … `space-12` | 32 / 40 / 48px | Group separation |
| `space-16` … `space-24` | 64 / 80 / 96px | Section padding (mobile → desktop) |
| `space-32` | 128px | Major section separation, desktop |

**Section rhythm:** 64px mobile → 96px tablet → 128px desktop. Generous vertical space is the primary carrier of the "premium" quality; cramped sections read as cheap regardless of colour and type.

---

## Layout and grid

| Token | Value |
|---|---|
| `container-sm` | 640px |
| `container-md` | 768px |
| `container-lg` | 1024px |
| `container-xl` | 1280px |
| `container-2xl` | 1440px — default page maximum |
| `container-prose` | 68ch — long-form text |
| Gutter | 20px mobile · 32px tablet · 48px desktop |

12-column grid on desktop, 8 on tablet, 4 on mobile.

### Breakpoints

| Token | Min-width | Represents |
|---|---|---|
| — | 320px | Smallest supported |
| `sm` | 640px | Large phone |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

Mobile-first. Layouts verified at 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920px (NFR responsive requirement).

---

## Radius, elevation, borders

### Radius
| Token | Value | Use |
|---|---|---|
| `radius-sm` | 4px | Badges, tags |
| `radius-md` | 8px | Buttons, inputs |
| `radius-lg` | 12px | Cards |
| `radius-xl` | 16px | Modals, large panels |
| `radius-2xl` | 24px | Feature panels |
| `radius-full` | 9999px | Pills, avatars |

Restrained. Very large radii read as consumer-app playful, against the intended register.

### Elevation
| Token | Use |
|---|---|
| `shadow-xs` | Subtle separation |
| `shadow-sm` | Resting cards |
| `shadow-md` | Hovered cards |
| `shadow-lg` | Dropdowns, popovers |
| `shadow-xl` | Modals, drawers |

Shadows are low-opacity and tinted toward the primary hue rather than pure black — neutral-black shadows look muddy over warm photography.

### Borders
1px default; 2px for emphasis; 3px focus ring with a 2px offset.

---

## Components

Full behavioural specifications in [11_UI_UX_SYSTEM](11_UI_UX_SYSTEM.md). Variants defined here.

### Buttons

| Variant | Use | Appearance |
|---|---|---|
| `primary` | Main action — one per view | Solid primary, white text |
| `accent` | Admissions CTA only | Solid accent *(contrast-permitting)* |
| `secondary` | Alternative action | Outlined, primary border and text |
| `ghost` | Tertiary, in-toolbar | Transparent, tinted hover |
| `link` | Inline navigation | Underlined text |
| `destructive` | Admin delete | Solid error |

Sizes `sm` 36px · `md` 44px *(default — meets touch target)* · `lg` 52px.

States: default · hover · active · focus-visible *(always a visible ring)* · disabled *(never the sole signal)* · loading *(spinner + accessible status text; width preserved to avoid layout shift)*.

### Cards
`default` · `interactive` (whole card is a link; hover elevation) · `feature` (image-led) · `stat` (large figure + label) · `bordered` (no shadow).

For interactive cards the accessible name comes from the heading, and only one interactive element wraps the card — nested links inside a linked card are an accessibility failure.

### Forms
Inputs, textarea, select, checkbox, radio, file — all at 44px minimum height.

**Non-negotiables:** every field has a visible, programmatically associated `<label>` (never placeholder-as-label) · required state indicated in text, not colour alone · errors are inline, specific, `aria-describedby`-linked, and `aria-live`-announced · error state combines colour **and** icon **and** text · help text sits above the field, not below the error.

### Badges
`neutral` · `success` (published) · `warning` (draft) · `error` (expired) · `info` · `accent` (featured).

---

## Motion

Motion is a seasoning. It is a school website, not a product launch.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `duration-fast` | 150ms | ease-out | Hover, focus |
| `duration-base` | 250ms | ease-out | Dropdowns, accordions |
| `duration-slow` | 400ms | ease-in-out | Drawers, modals |
| `duration-slower` | 600ms | ease-out | Scroll reveals |

**Permitted:** section fade-and-rise on scroll (once, not repeating) · card hover elevation · statistics count-up · smooth accordion and drawer transitions · gentle hero image scale.

**Not permitted:** parallax scrolling · scroll-hijacking · auto-advancing carousels faster than reading speed · looping attention-seeking animation · anything that moves the LCP element.

### Reduced motion — mandatory

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Content revealed by scroll animation must be **visible by default** and animated as an enhancement — never hidden with opacity 0 awaiting a script. If JavaScript fails or motion is reduced, the content must still be there (NFR-016, NFR-030).

---

## Imagery

Photography is the single largest contributor to whether this site feels premium, and it is entirely outside our control.

| Rule | Reason |
|---|---|
| **Real campus photography only** | Stock photos of generic children are recognisable and destroy trust |
| Consistent treatment | Mixed colour grading looks amateurish |
| Standard aspect ratios (16:9, 4:3, 1:1, 3:4) | Prevents layout shift |
| Modern formats, responsive sizes | NFR-003 |
| Meaningful alt text | NFR-014 |
| Explicit dimensions always | CLS |
| Designed fallbacks | Missing images must degrade gracefully, never break |

⚠️ **Launch dependency.** Without 20–40 high-quality campus photographs, the design cannot achieve its intended quality. This is a launch blocker, not a nice-to-have ([40_RISKS_AND_MITIGATIONS](40_RISKS_AND_MITIGATIONS.md)).

⚠️ **Child imagery** is governed by [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md).

---

## Iconography

Lucide — consistent 24px grid, open-licensed, tree-shakeable.

Sizes 16 / 20 / 24 / 32px. Stroke 1.5–2px. Decorative icons are `aria-hidden`; meaningful icons carry an accessible label. **Icons never carry meaning alone** — always paired with text or an accessible name.

---

## Implementation notes

- Tokens live in one `@theme` block in the global stylesheet — the single point of re-theming
- **No hard-coded hex values in components** (NFR-073); enforced by lint rule where possible
- shadcn/ui components are copied into the repo and re-styled onto these tokens rather than accumulating overrides
- Tailwind 4 requires no `tailwind.config.js`; configuration is CSS-first

---

## Open design decisions

Tracked in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

1. Actual brand colours — **blocking**
2. Logo, and whether a light/dark variant exists — **blocking**
3. Final typeface pairing (may be constrained by existing brand usage)
4. Whether Devanagari coverage is required
5. Whether the school has existing photography or a shoot must be commissioned
6. ~~Whether accent gold passes contrast as a CTA background, or is demoted to decorative use~~ — ✅ **RESOLVED 2026-08-17: decorative and light-on-dark only; CTAs are royal blue.** See the revision note above.

### Confirmed school identity

Supplied by the owner 2026-08-17 and now rendered as fact rather than placeholder:

| Field | Value |
|---|---|
| Name | **Muskan Scientific Convent Secondary School** |
| Location | Karera, Bhilwara, Rajasthan 311804 |

> "Secondary School" is consistent with the Nursery–Class 10 invariant. In the Indian system secondary ends at Class 10; Classes 11–12 are *senior* secondary, which this school does not serve. The invariant is unaffected.

Everything else — tagline, phone, email, principal, affiliation number, statistics, fees — remains a visible placeholder.
