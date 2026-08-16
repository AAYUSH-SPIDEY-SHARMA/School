# ADR-0005 — Media Storage

## Status
**Accepted** — owner-approved 2026-08-16 (D-B7)

> Approved with mandatory safeguards: **EXIF and geolocation stripping**, automatic optimisation, safe formats, child-image consent controls, school-owned exclusion list, expedited takedown. Not replaceable by raw S3/R2/local storage unless a replacement demonstrably preserves **every** safeguarding and optimisation control.

## Date
2026-08-16

## Context

Photography is the single largest contributor to whether this site feels like a premium school — and simultaneously the heaviest thing on the page, for an audience on mid-range Android phones over 4G.

Content editors are teachers, not technicians. They will upload photographs **directly from a phone camera roll** — 6 MB originals, arbitrary dimensions, in whatever format the device produced.

**The gallery contains identifiable children.** Phone photographs routinely embed GPS coordinates.

The runtime is serverless: there is no persistent local filesystem to write to.

## Problem

Store and deliver media such that: editors can upload without technical knowledge, parents on slow connections are not sent oversized files, and **metadata that could locate a child is never published**.

## Options

### Option 1 — Cloudinary
Automatic format negotiation and quality optimisation, on-the-fly transformation from a single upload, CDN delivery, **metadata stripping**, generous free tier.

**Against:** vendor dependency; costs scale with usage beyond the free tier; transformation URLs are vendor-specific.

### Option 2 — Cloudflare R2 or AWS S3
Cheap, durable raw object storage with no egress surprises (R2 in particular).

**Against:** raw storage only. We would have to build format conversion, responsive derivative generation, quality optimisation, **and metadata stripping** ourselves — the last being a safeguarding control we would rather not implement from scratch. This is a meaningful amount of work to reproduce something that exists.

### Option 3 — Vercel Blob
Integrates cleanly with the chosen host; simple API.

**Against:** weaker transformation capability. We would still need an optimisation layer, and the editor-uploads-a-6MB-phone-photo problem would remain unsolved.

### Option 4 — Local filesystem
**Eliminated.** Serverless runtimes have no persistent writable filesystem.

### Option 5 — Store originals in Postgres
**Rejected.** Binary blobs bloat the database, slow backups, and make the enquiry-data restore path heavier for no benefit.

## Decision

**Cloudinary** — as an `ARCHITECTURAL_RECOMMENDATION`.

## Rationale

Two requirements decide it, and both are non-negotiable.

**1. EXIF and geolocation stripping is a safeguarding control.**
A gallery photograph carrying GPS coordinates can publish the precise location of a classroom — or, if a parent contributed an image taken at home, a residential address. Combined with images of identifiable children, that is a safeguarding failure ([48_MEDIA_CONSENT_AND_CHILD_SAFETY](../../BLUEPRINT/48_MEDIA_CONSENT_AND_CHILD_SAFETY.md)).

This must work reliably, every time, with no opt-out. Using a service that does it as a first-class feature is preferable to implementing it ourselves against a raw object store.

**2. Automatic optimisation protects parents from editor behaviour.**
An editor uploading a 6 MB phone photograph is not a misuse — it is the expected case. Provider-side format negotiation and quality optimisation mean that original never reaches a parent's device, without the editor needing to know anything about image formats.

Options 2 and 3 would both require building these two capabilities. Neither is trivial, and the first is one we would rather not own.

## Consequences

### Positive
- Metadata stripping as a service feature rather than our code
- One upload serves every required size and format
- CDN delivery close to users
- Free tier fits a school budget
- Editors need no technical knowledge

### Negative
- Vendor dependency in the media path
- Costs scale with usage — should be monitored as the gallery grows
- Transformation URLs are vendor-specific, so migration would touch delivery code

### Risks
- **Provider unavailable** → text renders, images fail to designed placeholders, never broken-image icons
- **Free tier exceeded** → monitor; cost remains modest at this scale
- **Vendor migration needed later** → the provider sits behind a thin internal wrapper (`lib/media`), so a swap is contained rather than pervasive

## Implementation notes

| Control | Decision |
|---|---|
| Accepted | JPEG, PNG, WebP, AVIF, PDF |
| **Rejected** | **SVG** (executable script — a genuine XSS vector), executables, archives, Office formats, video |
| Size limits | 10 MB images, 25 MB documents |
| Type verification | **By content inspection.** Filename and declared MIME are not evidence |
| **Metadata** | **EXIF and GPS stripped at upload. No exception, no opt-out** |
| Folders | Per environment, so staging never pollutes production media |
| Deletion | Soft delete first, recoverable 30 days |
| **Takedown** | **Separate expedited path** — must not wait on the soft-delete window |
| Verification | **EXIF stripping tested with a real GPS-tagged photograph** before launch |

The last row is deliberate: configuring stripping and confirming it works are different things, and only the second one protects a child.

## Related

- [22_MEDIA_AND_STORAGE](../../BLUEPRINT/22_MEDIA_AND_STORAGE.md) · **[48_MEDIA_CONSENT_AND_CHILD_SAFETY](../../BLUEPRINT/48_MEDIA_CONSENT_AND_CHILD_SAFETY.md)** · [27_PERFORMANCE](../../BLUEPRINT/27_PERFORMANCE.md) · [28_SECURITY](../../BLUEPRINT/28_SECURITY.md)
- Decision D-B7 in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
