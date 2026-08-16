# ADR-0006 — Content Management Approach

## Status
**Accepted** — owner-approved 2026-08-16 (D-B8)

> Approved explicitly against WordPress, Sanity, Payload, Contentful, Git-based Markdown, and generic page builders. The CMS must remain "deliberately narrow and school-specific". Success criterion restated by the owner: **a trained staff member publishes a normal notice without developer assistance, under 3 minutes on first attempt.**

## Date
2026-08-16

## Context

This is the decision that determines whether the project succeeds a year after launch.

Direct observation of comparable Indian school websites found live content rot: one reference displayed a recruitment notice dated **August 2020** on its homepage in August 2026; another's footer copyright read 2018 ([45_RESEARCH_SOURCES](../../BLUEPRINT/45_RESEARCH_SOURCES.md) F-3).

That is not a technical failure. It is what happens when updating a website requires a developer.

The people who will actually use the CMS are teachers and office staff — comfortable with WhatsApp and Google Docs, not technical (persona P5). Content types are known and stable: news, events, notices, downloads, gallery, faculty, achievements, testimonials, facilities, settings.

## Problem

Choose a content management approach that school staff will genuinely use, week after week, without help.

## Options

### Option 1 — Custom admin built into the application
Purpose-built for this school's known content types, in the same codebase, sharing auth and design system.

**Against:** must be built. Roughly fourteen modules of CRUD, upload handling, and workflow — real effort with no reusable product to show for it.

### Option 2 — Headless CMS (Sanity, Payload, Strapi, Contentful)
Content management as a solved problem; mature editing interfaces; no CRUD to build.

**Against:** ongoing cost beyond free tiers; **a second system for staff to learn and for someone to administer**; a second place where content lives; interfaces designed for editorial teams rather than a school office; and enquiry data — the most sensitive content — would still need custom handling in our application, so staff would work across two systems.

### Option 3 — WordPress
Familiar to many schools; enormous ecosystem; staff may already know it.

**Against:** plugin-driven security surface is a recurring source of compromise on school sites; a bespoke design system fights the platform; performance ceiling; and it would replace the whole application, not just the CMS ([ADR-0001](ADR-0001-FRAMEWORK.md)).

### Option 4 — Git-based content (Markdown in the repository)
Zero infrastructure, version-controlled, free.

**Against:** **eliminated by the primary requirement.** A teacher cannot publish a notice by opening a pull request. This would guarantee the exact failure the project exists to prevent.

### Option 5 — No CMS; developer updates content
**Eliminated.** This *is* the failure mode observed in the reference sites.

## Decision

**Custom admin CMS built into the application** — as an `ARCHITECTURAL_RECOMMENDATION`.

## Rationale

The deciding criterion is not developer convenience or build cost. It is: **will a teacher publish a notice next November, unaided?**

Target: **under three minutes, first attempt, no help** (AR-020).

A custom admin wins because it can be **narrow**. It knows there are exactly nine content types. It can require three fields for a notice, not twelve. It can use the school's own language — "Publish", not "Set status to PUBLISHED"; "Web address", not "slug". It can put content-freshness warnings at the top of the dashboard, which is the one feature aimed squarely at preventing the observed rot.

A headless CMS is more capable and less suitable. Its generality is exactly what makes it intimidating to someone who wants to post a two-line notice about a holiday. And it introduces a second system — meaning staff would manage content in one place and enquiries in another, doubling what must be learned and remembered.

> The trade is deliberate: **more build effort now, in exchange for the thing that determines whether the site is alive in a year.**

## Consequences

### Positive
- Purpose-built for the actual staff and the actual content types
- One system: content, media, enquiries, settings, users
- Shares auth, design system, and deployment with the public site
- No per-seat or per-record vendor cost
- Freshness indicators, expiry dates, and plain language can be designed in rather than worked around

### Negative
- Fourteen modules to build and maintain
- No third-party feature roadmap — improvements are ours to make
- Rich-text editing is deliberately constrained (no arbitrary HTML), which some editors may occasionally find limiting

### Risks
- **The CMS is built but unused, and content rots anyway.** The central risk (R-02). Mitigated by the three-minute target tested with a genuinely non-technical person, draft-and-preview to remove fear, read-your-writes cache invalidation so changes appear immediately, freshness warnings, and hands-on training at handover
- **Admin becomes a large maintenance surface.** Mitigated by narrow scope — structured content types only, **no page builder** (AR-022)
- **Editing is a security surface.** Mitigated by per-action authorisation, output sanitisation, and audit logging

## Explicitly excluded

| Excluded | Reason |
|---|---|
| Page builder / block editor | Trades staff usability for flexibility nobody requested; breaks the design system |
| Arbitrary HTML editing | Breaks design and accessibility |
| Custom content types | Types are known and stable |
| Approval workflow | `OPEN_DECISION` (OD-012) — likely unnecessary for a small staff |
| Full revision history | `FUTURE` — soft delete plus audit log covers realistic recovery |
| Theme customisation UI | Design belongs to the design system, not to editors |

## Success criterion

Measured at **M10, ninety days after launch** ([38_MILESTONES](../../BLUEPRINT/38_MILESTONES.md)):

> Has school staff published content without developer involvement, and is anything flagged stale?

If the site looks like the reference sites in a year — a notice from three years ago still on the homepage — **this decision failed**, regardless of how good the public site looks.

## Related

- [20_ADMIN_CMS](../../BLUEPRINT/20_ADMIN_CMS.md) · [21_CONTENT_MODEL](../../BLUEPRINT/21_CONTENT_MODEL.md) · **[47_CONTENT_GOVERNANCE](../../BLUEPRINT/47_CONTENT_GOVERNANCE.md)** · [04_USER_PERSONAS](../../BLUEPRINT/04_USER_PERSONAS.md) P5
- Decision D-B8 in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
