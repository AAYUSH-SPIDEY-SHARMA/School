# 22 — Media and Storage

| Field | Value |
|---|---|
| **Status** | PROPOSED |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Frontend / Backend Lead |
| **Dependencies** | [12_TECH_STACK](12_TECH_STACK.md) |
| **Related Documents** | [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md) · [27_PERFORMANCE](27_PERFORMANCE.md) · [20_ADMIN_CMS](20_ADMIN_CMS.md) |

> ⚠️ **This document covers the technical media pipeline.** Consent, child safeguarding, and takedown are governed by [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md) and are not optional additions to what follows.

---

## Why media is disproportionately important here

Two reasons, pulling in different directions:

1. **Photography is what makes a school website feel premium.** It carries the emotional weight that copy cannot. A beautifully engineered site with poor imagery still looks like a poor school.
2. **Photography is also the heaviest thing on the page**, and the primary persona browses on a mid-range Android phone over 4G.

The pipeline exists to serve the first without sacrificing the second.

---

## Provider — Cloudinary

`ARCHITECTURAL_RECOMMENDATION`. See [ADR-0005](../HISTORY/DECISIONS/ADR-0005-MEDIA-STORAGE.md).

| Capability | Why it matters here |
|---|---|
| Automatic format negotiation | Modern formats to supporting browsers without manual conversion |
| Automatic quality optimisation | Editors upload phone photos straight from a camera roll |
| On-the-fly transformation | One upload serves thumbnail, card, and lightbox sizes |
| CDN delivery | Global edge caching |
| **EXIF stripping** | **Mandatory** — see below |
| Generous free tier | Fits a school budget |

*Rejected:* raw object storage (R2/S3 — would require building transformation and optimisation ourselves), Vercel Blob (weaker transformation), local filesystem (impossible on serverless).

### EXIF stripping is not optional

Photographs taken on phones commonly embed GPS coordinates, device identifiers, and timestamps.

For a school, this means **a gallery photograph can publish the precise location of a classroom, or — if a parent contributed an image taken at home — a residential address**. Combined with images of identifiable children, that is a safeguarding failure, not a privacy nicety.

**All metadata is stripped at upload. No exceptions, no opt-out** (NFR-052).

---

## Upload pipeline

```
Editor selects file(s)
   │
   ├─ client: type + size check                    ← UX only, never trusted
   │
   ▼
Server Action
   ├─ authenticate + authorise (EDITOR+)
   ├─ verify ACTUAL content type by inspection     ← not filename, not declared MIME
   ├─ enforce size limit
   ├─ reject on mismatch
   │
   ▼
Upload to provider
   ├─ strip EXIF / geolocation                     ← mandatory
   ├─ generate derivatives
   │
   ▼
Create MediaAsset record
   ├─ url, publicId, dimensions, mimeType, fileSize
   ├─ altText            ← required before publish
   ├─ containsMinors     ← drives consent review
   └─ consentBasis       ← where applicable
```

**A file's extension proves nothing.** A `.jpg` may contain anything; content type must be verified by inspecting the file itself (NFR-045).

---

## Accepted formats and limits

| Type | Formats | Max size |
|---|---|---|
| Images | JPEG, PNG, WebP, AVIF | 10 MB |
| Documents | PDF | 25 MB |

**Rejected:** SVG (can carry executable script — a genuine XSS vector), any executable, archives, Office formats (converted to PDF instead), video (embedded from a third-party platform rather than hosted).

Limits are generous enough for a direct-from-camera upload and small enough to contain abuse. Oversized uploads are rejected with a clear message and guidance, never a silent failure.

---

## Delivery

| Concern | Approach |
|---|---|
| Component | Framework `Image` everywhere — never a bare `<img>` |
| Sizing | Accurate `sizes` matched to layout, so phones never download desktop-sized images |
| Dimensions | Always explicit, or `fill` in a sized container — prevents CLS |
| Loading | `priority` **only** on the hero (the LCP element); everything else lazy |
| Format | Provider negotiates; modern formats preferred |
| Quality | Provider-optimised. Note the framework's `qualities` default is now `[75]`; custom values must be declared in config |
| Remote patterns | Provider host allow-listed via `remotePatterns` — `images.domains` is deprecated |
| Failure | Designed placeholder, never a broken-image icon |

### Standard renditions

| Use | Aspect | Target width |
|---|---|---|
| Hero | 16:9 | up to 1920 |
| Card cover | 16:9 | 400–800 |
| Gallery thumbnail | 1:1 or 4:3 | 300–600 |
| Lightbox | native | up to 1600 |
| Faculty portrait | 3:4 | 300–600 |
| OG image | 1200×630 | 1200 |

Consistent aspect ratios matter more than they appear: mixed ratios in a grid look amateurish and cause layout shift.

---

## Alt text

Required before publish (AR-009). This is an accessibility `MUST`, and the friction it creates for non-technical editors is handled by design rather than by exception.

**Guidance shown to editors:**
- Describe what is happening, not what it is: *"Students planting saplings on Environment Day"*, not *"photo"*
- **Do not name children.** Describe the activity
- Decorative images may be marked decorative, which sets empty alt
- Filename is offered as a starting point, never accepted unchanged

**Interface support:** the label reads "Describe this photo for people who can't see it", with an example. A bulk entry view shows a thumbnail grid with one input each, so forty sports-day photographs remain tractable.

> Naming children in alt text is a privacy issue as well as an accessibility one — alt text is machine-readable and indexable.

---

## Storage organisation

```
school/
├── gallery/{albumSlug}/
├── news/
├── events/
├── faculty/
├── facilities/
├── documents/
└── site/            logo, OG defaults, hero images
```

Folder structure aids housekeeping and lets upload signatures constrain destination.

---

## Deletion

Multi-stage, because accidental deletion by a non-technical editor is a realistic and recurring event.

```
Delete requested
   → in-use check: warn and list where it appears
   → soft delete (deletedAt set); asset remains at provider
   → recoverable for 30 days
   → after 30 days: purge from provider (manual/periodic in v1)
```

`EDITOR` may delete their own uploads; `SUPER_ADMIN` may delete any ([19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md)).

**Takedown requests** — for example a parent withdrawing consent for a photograph of their child — are a **different and faster path**, handled with priority under [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md). A safeguarding takedown must not wait on a 30-day soft-delete window.

---

## Documents

PDF-only, served from the provider with correct content type and disposition.

| Requirement | Reason |
|---|---|
| File type and size shown before the link | A parent on mobile data deserves to know (P2) |
| Downloads, not in-browser preview, on mobile | Correct `Content-Disposition` |
| Academic year on versioned documents | Disambiguates which is current |
| New version replaces in place | Avoids confusing duplicates |
| Descriptive filenames | `academic-calendar-2026-27.pdf`, not `doc1.pdf` |

⚠️ **PDFs are frequently inaccessible.** A scanned image of a fee table is unreadable to a screen reader. Where a document contains information parents need, the key content should also exist as HTML on the page — the fee table being the clearest case ([26_ACCESSIBILITY](26_ACCESSIBILITY.md)).

---

## Performance budgets

| Asset | Budget |
|---|---|
| Hero image (delivered) | ≤ 200 KB |
| Card cover | ≤ 80 KB |
| Gallery thumbnail | ≤ 40 KB |
| Lightbox full image | ≤ 300 KB |
| Total images above the fold | ≤ 400 KB |

Enforced by review and monitored in field data. The gallery is the highest-risk page: an album of sixty images must lazy-load and must never load full-size images until the lightbox opens.

---

## Missing-media strategy

The school has supplied no photography yet. The site must be built so that missing images degrade gracefully rather than looking broken:

- Designed placeholder components per context (portrait, cover, gallery)
- Faculty portraits fall back to a styled initials avatar
- Layouts remain balanced with images absent
- **A visible build-time warning** listing content published without imagery

⚠️ **Launch dependency.** Without 20–40 quality campus photographs the design cannot reach its intended standard. This is tracked as a launch blocker, not a nice-to-have ([40_RISKS_AND_MITIGATIONS](40_RISKS_AND_MITIGATIONS.md)).

---

## Future

| Item | Status |
|---|---|
| Video hosting | `FUTURE` — embed from a third-party platform; never self-host |
| Virtual campus tour | `FUTURE` — noted in research as an emerging admissions tool |
| Automatic image tagging | `NOT_RECOMMENDED` — AI tagging of children's photographs raises consent questions disproportionate to the benefit |
| CDN migration | Provider sits behind a thin internal wrapper, so swapping is contained |
