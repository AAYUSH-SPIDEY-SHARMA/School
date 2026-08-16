# 27 — Performance

| Field | Value |
|---|---|
| **Status** | PROPOSED — targets set, nothing measured |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Frontend Lead |
| **Dependencies** | [14_FRONTEND_ARCHITECTURE](14_FRONTEND_ARCHITECTURE.md) · [22_MEDIA_AND_STORAGE](22_MEDIA_AND_STORAGE.md) |
| **Related Documents** | [25_SEO_STRATEGY](25_SEO_STRATEGY.md) · [33_MONITORING_AND_LOGGING](33_MONITORING_AND_LOGGING.md) |

---

## The measure is field data, not lab scores

**Core Web Vitals measured on real devices are the target. Lighthouse is a development tool, not the goal.**

Lighthouse runs on a simulated device on a developer's fast connection. It is useful for catching regressions and finding causes. It does not tell you what a parent on a mid-range Android phone on 4G in India actually experiences — and that parent is the primary persona.

| | Target (field, p75) | Status |
|---|---|---|
| **LCP** | ≤ 2.5s | Not measured |
| **INP** | ≤ 200ms | Not measured |
| **CLS** | ≤ 0.1 | Not measured |

Lighthouse aspirations — Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+ — are **goals, not guarantees**, and are treated as a development signal only. A high Lighthouse score with poor field data means the score is wrong, not the field data.

Nothing has been measured. Targets are targets.

---

## Performance is a trust signal

Beyond ranking effects: a slow site reads as an unprofessional school. A parent comparing four schools on a phone will form an impression from load time before reading a word. And the audience skews heavily mobile, on mid-range hardware, on variable connections.

The architecture is chosen accordingly — server-rendered, cached at the edge, minimal client JavaScript.

---

## Budgets

| Asset | Budget |
|---|---|
| JS, public page (initial) | ≤ 100 KB gz |
| JS, homepage | ≤ 130 KB gz |
| CSS | ≤ 30 KB gz |
| Fonts (total) | ≤ 120 KB |
| Hero image (delivered) | ≤ 200 KB |
| Above-the-fold images (total) | ≤ 400 KB |
| Total page weight (homepage) | ≤ 1 MB |

Directional and re-baselined once field data exists. Exceeding a budget requires a stated justification, not a silent bump.

---

## Strategy by metric

### LCP — the hero image, almost always

On nearly every page the LCP element is the hero image. That makes it the single highest-leverage optimisation target.

| Action | Detail |
|---|---|
| Priority load | `priority` on the hero — **and nowhere else**. Prioritising other images competes with it and makes LCP worse |
| Correct sizing | Accurate `sizes` so phones never download desktop-width images |
| Modern formats | Provider negotiates automatically |
| Preconnect | To the media origin |
| Server-rendered | No client round-trip before the hero can paint |
| Cached at edge | Most requests never reach the application |
| Never animate it | An animated LCP element delays the measurement |

> A video hero is permitted only if it is not the LCP element — a poster image loads first, and video is deferred.

### INP — keep the main thread free
Minimal client JavaScript (the eleven client components in [14_FRONTEND_ARCHITECTURE](14_FRONTEND_ARCHITECTURE.md)) · no heavy work in event handlers · CSS transitions over JS animation · third-party embeds deferred until interaction · no blocking analytics.

### CLS — reserve the space
Explicit `width`/`height` on every image, or `fill` inside a sized container · fonts loaded with a metric-matched fallback so swapping shifts nothing · **no content injected above existing content after load** · fixed dimensions on ad-like slots such as the map placeholder · skeletons matching final layout exactly.

The map is the classic CLS offender on school sites: an iframe that loads late and pushes everything down. It sits behind a fixed-size click-to-load placeholder.

---

## Caching

Most page views should never reach the application, let alone the database.

| Layer | What |
|---|---|
| Edge CDN | Static assets, cached HTML |
| Framework cache | Rendered pages, tag-invalidated |
| Database | Reached only on cache miss |

**Read path** uses stale-while-revalidate: parents get an instant cached page while it refreshes behind them.
**Write path** uses read-your-writes so an editor sees their own change immediately — without this, editors republish repeatedly and eventually abandon the CMS ([14_FRONTEND_ARCHITECTURE](14_FRONTEND_ARCHITECTURE.md), J7).

Invalidation is **tag-based, not time-based**. Guessing a TTL means either stale content or wasted regeneration; tags invalidate exactly what changed, when it changed.

---

## JavaScript discipline

The largest lever available, and the one most easily lost.

1. **Server Components by default** — `"use client"` is a justified exception, not a habit
2. Client boundaries pushed **down** the tree, never up
3. Eleven client components in v1; additions need a reason
4. No client-side data fetching library
5. No state management library
6. Icons tree-shaken individually
7. Rich-text editor loaded only in admin
8. Bundle analysis in CI, with budget enforcement

---

## Images

The heaviest category by far, and the one most likely to regress once editors start uploading.

Framework `Image` everywhere · accurate `sizes` · lazy below the fold · explicit dimensions · provider-side optimisation and format negotiation · consistent aspect ratios.

> ⚠️ **The gallery is the highest-risk page.** An album of sixty images must lazy-load thumbnails and must never fetch full-size images until the lightbox opens. Getting this wrong turns one page into a multi-megabyte download.
>
> Automatic provider-side optimisation matters specifically because editors upload straight from a phone camera roll — a 6 MB original must never reach a parent's device.

---

## Fonts

Self-hosted (no third-party CDN — privacy plus one fewer blocking origin) · subset to used glyphs · variable where available · `display: swap` with a metric-matched fallback so swapping causes no layout shift · **two families maximum**.

Devanagari subsets load only if Hindi is confirmed — adding a second script roughly doubles font weight and must be a deliberate decision ([39_OPEN_DECISIONS](39_OPEN_DECISIONS.md)).

---

## Third parties — the usual cause of regression

Every third-party script is someone else's performance decision executing on your page.

| Third party | Handling |
|---|---|
| Map | **Lazy-loaded behind a click-to-load placeholder.** Never on initial render |
| Analytics | Lightweight, deferred, non-blocking |
| Social embeds | **Avoided.** A social feed widget is heavy, slow, and a privacy concern. If required, render server-side or link out |
| Fonts | Self-hosted |
| Chat widget | `NOT_RECOMMENDED` — heavy, and a school with a phone number does not need one |

Adding a third-party script requires measuring its impact first.

---

## Database and server

Realistic at this scale: correct indexing on real query shapes, pagination always, explicit `select` to avoid over-fetching, no N+1 queries, pooled connections, and a Rust-free ORM client keeping cold starts low.

Because caching shields the database from most traffic, database performance is not expected to be the bottleneck. **Read replicas, sharding, and external caching are not planned** and require measured evidence plus an ADR ([16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md)).

---

## Measurement

| Source | Purpose | When |
|---|---|---|
| **Search Console CWV report** | **Field data — the actual target** | Ongoing post-launch |
| Real-user monitoring | Field LCP/INP/CLS by page and device | Ongoing |
| Lighthouse CI | Regression detection | Every PR |
| Bundle analysis | Budget enforcement | Every PR |
| WebPageTest on a throttled mid-range device | Realistic pre-launch check | Pre-launch, then periodically |

> Testing on a developer's laptop over office wifi produces numbers that are pleasant and meaningless. Pre-launch verification must use a throttled mid-range mobile profile.

---

## Regression prevention

Performance degrades gradually — an image here, a script there. Prevention is procedural:

- Budgets enforced in CI; a PR exceeding them fails
- Lighthouse CI on every PR
- Adding a client component or third-party script requires justification in review
- Field data reviewed monthly post-launch
- The gallery and homepage are re-checked after any media change

---

## Launch checklist

- [ ] LCP element identified per template and optimised
- [ ] Only the hero carries `priority`
- [ ] All images have explicit dimensions
- [ ] Fonts self-hosted, subset, metric-matched fallback
- [ ] Map lazy-loaded behind a placeholder
- [ ] Bundle within budget
- [ ] Tested on a **real mid-range Android device on a throttled connection**
- [ ] No layout shift on load — verified visually and by CLS measurement
- [ ] Caching and tag invalidation verified end to end
- [ ] Real-user monitoring active before launch, so day-one field data is captured
