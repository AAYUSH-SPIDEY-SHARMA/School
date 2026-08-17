# ADR-0012 — Editable Page Sections (Reverses the "No Page Builder" Rejection)

## Status
**Accepted** — owner-directed, 2026-08-17

> ⚠️ This ADR **reverses an owner-approved rejection**. It is not an implementation detail.

## Date
2026-08-17

## Context

The owner architecture approval of 2026-08-16 listed, among the forbidden changes:

> "Do NOT: … create a generic page builder. Any future deviation requires an ADR + owner approval."

That rejection was recorded as **D-E** in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md), and [ADR-0006](ADR-0006-CMS.md) chose a **custom CMS with fixed, purpose-built modules** over a generic content builder.

On 2026-08-17 the owner instructed, verbatim in substance:

> full control in admin — every section, every text, every link of every page can be controlled or edited by the admin section … systematically, professionally add, delete, update, create anything … all data can be edited by admin through UI/UX directly, no complex … and can adjust the section also, which section placed in which place, upper, down or where … admin section should be advanced not ordinary

That is a page builder. The owner is the approving authority for D-E, and has asked for it directly.

## Problem

Reconcile the instruction with the reasoning that produced the original rejection, and implement it without reintroducing the failure modes that rejection was protecting against.

### Why a page builder was rejected originally

The reasoning in ADR-0006 was not arbitrary:

1. **Generic builders produce bad pages.** Give someone a blank canvas and enough freedom and the result is usually worse than a well-designed fixed template — inconsistent spacing, competing headings, broken responsive behaviour.
2. **Accessibility regresses.** Free-form composition makes heading order, contrast and focus behaviour a per-page accident rather than a system property.
3. **They are large.** A builder is a substantial subsystem for a single-campus school with a handful of staff.
4. **They rot.** A builder with hundreds of options is used by nobody after the person who commissioned it leaves.

None of that is wrong. It is, however, an argument against a *particular kind* of builder.

## Options

### Option 1 — Decline, and cite the rejection
*Against:* the owner is the authority that made that rejection and has reversed it. Refusing would substitute the architect's judgement for the owner's on a product question that is legitimately theirs.

### Option 2 — A free-form block builder (drag-and-drop canvas, arbitrary nesting)
*For:* maximum flexibility, which is literally what was asked for.
*Against:* every failure mode above, in full. Arbitrary nesting is what makes builders produce incoherent pages and inaccessible markup.

### Option 3 — **Typed sections, freely ordered** *(chosen)*
A fixed catalogue of section **types**, each professionally designed, responsive and accessible by construction. The school controls, for every page:

- which sections appear
- **the order they appear in**
- the text, links and media within each
- whether a section is visible

What the school cannot do is invent a new *kind* of section, nest sections arbitrarily, or set raw CSS.

*For:* delivers "every text, every link, every section, reorderable" — the actual instruction — while the design system still guarantees the result.
*Against:* a section type the school wants but that does not exist requires a developer. That is a real limitation and is stated plainly below.

## Decision

**Option 3.** Three new entities:

| Entity | Purpose |
|---|---|
| `Page` | A public page: slug, title, SEO fields, status. System pages cannot be deleted, only edited |
| `PageSection` | A section on a page: `type`, `displayOrder`, `isVisible`, and a typed `content` payload |
| `NavItem` | An editable navigation entry: label, href, parent, order, visibility |

`NavItem` exists because "every link of every page" includes the navigation, which was previously a hard-coded constant.

## Rationale

The distinction that makes this safe is **typed sections rather than free-form blocks**.

A `STATS_BAND` section always renders as a properly-spaced, accessible statistics band, whatever numbers are put in it. The school controls the content and the position; the system controls the markup, the heading level, the contrast and the responsive behaviour. The four original objections are answered without refusing the request:

| Original objection | Answered by |
|---|---|
| Builders produce bad pages | Section types are designed once and cannot be broken by content |
| Accessibility regresses | Heading order and contrast are properties of the section type, not of what was typed |
| Builders are large | The scope is a catalogue plus ordering, not a canvas with arbitrary nesting |
| Builders rot | Every section type is one the school actually needs, and each is usable without training |

## Consequences

### Positive
- The school can genuinely rearrange and rewrite its own site, which is what was asked for
- Adding a section type later is additive and does not disturb existing pages
- Navigation stops being a code change

### Negative
- **Three entities beyond the approved eighteen.** Recorded here and in the schema, never added silently. They are page-composition infrastructure, not new domain concepts — no domain entity was added, removed or merged
- **A new section type still needs a developer.** The school cannot invent layouts. This is the deliberate limit that keeps the output coherent, and it should be said plainly at handover rather than discovered
- More surface to test: section ordering and visibility need their own coverage
- `content` is a typed JSON payload, so its shape is validated in the application rather than by the database

### Risks
- **Someone reorders the homepage into incoherence.** Mitigated by a preview before publishing, and by the fact that ordering is reversible
- **A section type accumulates options until it is a builder in miniature.** Mitigated by keeping each type's field list short and purposeful
- **Section content bypasses validation.** Mitigated by a Zod schema per section type, validated in the Server Action exactly as every other write is

## What this does NOT change

- The 18 domain entities are untouched
- Role boundaries are unchanged — page editing is `EDITOR`+, and settings, users and facilities remain `SUPER_ADMIN`
- Every locked security rule (A–O) still applies; section writes authenticate, authorise, validate and audit like any other action
- No fabricated school content. A section with no real content shows a visible awaiting state

## Related

- Reverses **D-E** in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
- Amends [ADR-0006](ADR-0006-CMS.md), which chose fixed modules
- [20_ADMIN_CMS](../../BLUEPRINT/20_ADMIN_CMS.md) · [08_PAGE_SPECIFICATIONS](../../BLUEPRINT/08_PAGE_SPECIFICATIONS.md) · [26_ACCESSIBILITY](../../BLUEPRINT/26_ACCESSIBILITY.md)
