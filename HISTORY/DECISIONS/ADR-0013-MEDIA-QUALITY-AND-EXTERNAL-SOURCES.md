# ADR-0013 — Full-Quality Media, and Google Drive / YouTube as Sources

## Status
**Accepted** — owner-directed, 2026-08-17

## Date
2026-08-17

## Context

Two owner instructions on 2026-08-17:

1. > "always upload and show or display the 100 percent quality, no compression and lost quality, the original always"
2. > "school sometimes can paste the drive or youtube link of image or video so show them also … because the video size can be in GBs so google drive will be a good option"

Both touch approved architecture:

- [27_PERFORMANCE](../../BLUEPRINT/27_PERFORMANCE.md) targets **LCP ≤ 2.5s at p75**, on a mid-range Android over 4G, and specifies modern formats and responsive sizing — which normally means *lossy* optimisation.
- [ADR-0005](ADR-0005-MEDIA-STORAGE.md) selected Cloudinary as the single media store.
- [48_MEDIA_CONSENT_AND_CHILD_SAFETY](../../BLUEPRINT/48_MEDIA_CONSENT_AND_CHILD_SAFETY.md) and **locked rule N** require EXIF and geolocation stripping with **no exception and no opt-out**.
- The blueprint rejects third-party embeds because they leak visitor data.

## Problem 1 — "Full quality" versus performance

Serving multi-megabyte originals as the LCP image will miss the performance target for the exact persona the project prioritises.

### Decision

**Split the two cases, because "quality" and "resolution" are not the same thing.**

| Context | Treatment |
|---|---|
| Full view, lightbox, download | **The untouched original.** No transformation segment in the URL at all. The bytes delivered are the bytes uploaded |
| Grid tiles, cards, thumbnails | **`q_100` with a width limit.** Resized, never lossily recompressed |

There is no `q_auto` and no `f_auto` anywhere in the codebase, and `next.config.ts` sets `qualities: [100]` so Next's own optimiser cannot reduce quality either.

### Rationale

Sending a 6000px master to fill a 400px card is not quality — it is bytes the display physically cannot show. Resizing at `q_100` discards no visible information. Meanwhile every image *is* viewable at full original quality, one click away.

This honours the instruction while keeping listing pages usable on a phone. **If the owner wants originals in grids too, it is a one-line change in `lib/media/urls.ts`, and the cost lands squarely on mobile load time.** That is stated so the choice stays available and its price stays visible.

## Problem 2 — "Original" versus mandatory EXIF stripping

A phone photograph of a classroom commonly carries GPS coordinates. Locked rule N admits no exception. Taken literally, "never modify the original" and "always strip metadata" conflict.

### Decision

**They only conflict until pixels and metadata are separated.**

Metadata is discarded **at upload** (`image_metadata: false`), so the stored master is already clean. That master is then delivered **untouched**.

> "Original" therefore means **original pixels — full quality, nothing recompressed — with the location data removed.**

Stripping is **verified** against Cloudinary after upload rather than assumed, and an asset whose EXIF cannot be confirmed is flagged in the library and blocked from a clean bill of health. Working rule 13: documented ≠ verified, and this is where that matters most.

## Problem 3 — External sources we do not control

### Decision

**Google Drive and YouTube are supported as first-class media sources**, alongside Cloudinary. `MediaAsset` gains `source`, `kind`, `externalUrl`, `externalId` and `thumbnailUrl`; `publicId` becomes nullable.

A school sports-day video can run to gigabytes. Pushing that through an image CDN would be slow and expensive, and the school may already hold the material.

### What this costs, stated rather than buried

| Cost | Consequence |
|---|---|
| **We do not control the file** | If sharing changes or the file is deleted, it disappears from the site with no warning |
| **We cannot strip EXIF from it** | `metadataStripped` stays **false** for external assets. Recording `true` would be an unverified compliance claim |
| **A YouTube embed contacts a third party** | Mitigated by a **click-to-play facade**: the poster frame is a plain image, and nothing is requested from Google until the visitor deliberately clicks. The player then loads via `youtube-nocookie.com` |

The admin UI states each of these where the link is added, and recommends **uploading** rather than linking for photographs of children — because that is the only path where the safeguarding controls actually apply.

### On the embed rejection

The blueprint rejects social media embeds. Video is a narrow exception: the school genuinely cannot self-host gigabyte video, and the facade means the third party is contacted only on an explicit user action rather than on every page load. That is a materially different privacy posture from an autoloading embed.

## Consequences

### Positive
- Photographs are shown at genuinely full quality, which is what was asked for
- Large video is possible without a storage bill
- Safeguarding controls are unchanged for uploaded media, and their absence on linked media is explicit rather than assumed

### Negative
- Full-quality images are large; the performance budget is tighter than it would otherwise be, and should be measured against real field data once there is content
- External media can break without warning, through no fault of the site
- Two intake paths mean two sets of behaviour for staff to understand

### Risks
- **An external image of children carries GPS we cannot remove.** Mitigated by the admin advising upload for child imagery, and by `metadataStripped` being visibly false
- **A Drive file left restricted looks fine to the person who pasted it** — because they are signed in — **and is invisible to everyone else.** Mitigated by a warning at the point of pasting, which is where it is actually read

## Related

- Amends [ADR-0005](ADR-0005-MEDIA-STORAGE.md) · [27_PERFORMANCE](../../BLUEPRINT/27_PERFORMANCE.md) · [48_MEDIA_CONSENT_AND_CHILD_SAFETY](../../BLUEPRINT/48_MEDIA_CONSENT_AND_CHILD_SAFETY.md)
- Implementation: `lib/media/cloudinary.ts`, `lib/media/urls.ts`, `lib/media/externalMedia.ts`, `components/media/`
- Verification: `tests/verification/cloudinary-connection.mjs`
