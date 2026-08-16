# 21 — Content Model

| Field | Value |
|---|---|
| **Status** | PROPOSED |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product / Content |
| **Dependencies** | [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) |
| **Related Documents** | [20_ADMIN_CMS](20_ADMIN_CMS.md) · [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md) · [25_SEO_STRATEGY](25_SEO_STRATEGY.md) |

---

## Static vs dynamic — the decision that saves the most pain later

Getting this split wrong in either direction is costly. Too much static content means the school phones a developer to change a sentence. Too much dynamic content means an editing interface for prose that changes once every three years.

### Static — lives in code, changes by deploy

| Content | Why static |
|---|---|
| About, history, philosophy | Changes every few years at most |
| Vision & Mission | Effectively permanent |
| Curriculum, academic stage descriptions | Changes with syllabus revisions, rarely |
| Admission process and eligibility narrative | Structure is stable; **dates are not** (see below) |
| Safety & Security narrative | Policy prose, changes rarely — but must be **verified with the school** before publication |
| Transport narrative | Route lists may become dynamic if they change often |
| Legal pages | Change only on legal review |
| All UI copy, labels, error messages | — |

### Dynamic — database-backed, edited in the CMS

| Content | Change frequency |
|---|---|
| News | Weekly |
| Notices | Several times a week — **highest** |
| Events | Weekly |
| Gallery albums and images | After each event |
| Achievements | Monthly |
| Downloads | Monthly, spiking at term boundaries |
| Faculty | Termly |
| Testimonials | Occasionally |
| Facilities | Yearly |
| **Site settings** — contact, statistics, admission cycle status, SEO defaults | Yearly, but **critical** |

### The borderline cases — decided explicitly

**Admission dates and cycle status → dynamic.** The narrative process is static, but the dates and the open/closed state change annually and are the highest-staleness-risk content on the site (J5). They live in `SiteSetting`.

**Fee amounts → dynamic** (`SiteSetting` or a downloadable document). They change yearly, and a deploy should never be required to correct a published fee.

**Statistics → dynamic.** Student count, faculty count, board results change yearly and appear on the homepage. Hard-coding them guarantees they go stale.

**Contact details → dynamic.** A changed phone number must be fixable in a minute, not a deploy cycle.

> **Principle:** anything that could become *wrong* — a date, a number, a phone number, an availability status — is dynamic. Anything that could only become *dated* — a description of the school's philosophy — can be static.

---

## Content lifecycle

```
DRAFT ──publish──► PUBLISHED ──unpublish──► DRAFT
  │                    │
  │                    ├──expire (Notices only)──► hidden from public
  │                    └──archive──► ARCHIVED
  │
  └──delete──► soft-deleted (deletedAt set, recoverable)
```

**Draft is the default state.** Publishing is always a deliberate, separate act — this is what removes the fear of accidentally breaking something public, which is the main thing that stops non-technical staff from using a CMS (P5).

| State | Public | Sitemap | Notes |
|---|---|---|---|
| `DRAFT` | ❌ | ❌ | Filtered **at the query layer**, never merely hidden in the UI |
| `PUBLISHED` | ✅ | ✅ | |
| `ARCHIVED` | ❌ | ❌ | Retained for reference |
| Soft-deleted | ❌ | ❌ | Recoverable without a database restore |
| Expired (Notice) | ❌ | ❌ | Filtered by `expiresAt` at query time |

---

## Slug and URL management

URLs are a contract. A parent may have shared a link months ago; it must not 404.

### Generation
Derived from the title: lowercase, non-alphanumerics to hyphens, collapsed, trimmed, capped at ~60 characters, uniqueness enforced by the database. Collisions get a numeric suffix.

### Change handling — mandatory

```
Editor changes slug on a published item
        ↓
Warning shown in plain language
        ↓
On save:
   • previous slug written to SlugHistory
   • entity updated to the new slug
        ↓
proxy.ts consults SlugHistory
        ↓
Old URL → permanent 301 → new URL
        ↓
Canonical always points at the current slug
```

Rules: slug history is **append-only** · a slug in history can never be reissued to a different entity · redirect chains are collapsed to a single hop · canonical URLs always reference the current slug (NFR-028).

> This machinery exists for one reason: a school website's links spread through WhatsApp groups and are never updated. Breaking them silently loses both parents and search ranking.

---

## SEO metadata — two levels, deliberately separated

This split was a specific review correction; the two were previously conflated.

### Entity-level — on the record
`seoTitle` and `seoDescription`, both optional, on News, Events, Gallery albums, Faculty, and Achievements.

Fallback chain: `seoTitle` → entity title → global default. `seoDescription` → excerpt → truncated body → global default. Editors leave these blank most of the time, and the fallbacks are expected to do the work.

### Global — in `SiteSetting`
Site title template · default meta description · default OG image · `School` structured-data block (name, address, phone, geo) · social profile URLs · robots behaviour · canonical base URL.

**Editable without a deploy** (NFR-029). A school that moves premises must be able to correct its own address.

> Deliberately **not** built: a generic `Page`/`SEO` table. It would invite the page-builder complexity rejected in AR-022, and there is no page whose SEO cannot be expressed by one of the two levels above.

---

## Content ownership

Ownership is assigned by module, because unowned content is the content that rots (F-3).

| Content | Owner | Reviewer |
|---|---|---|
| Notices | Office / coordinator | — |
| News | Activities coordinator | Principal (spot-check) |
| Events | Activities coordinator | — |
| Gallery | Activities coordinator | ⚠️ Child-imagery consent check |
| Faculty | Administration | Principal |
| Achievements | Academic coordinator | ⚠️ Naming students requires care |
| Downloads | Office | — |
| Fee structure | Accounts | **Principal — mandatory** |
| Admission dates and status | Admissions | **Principal — mandatory** |
| Statistics | Administration | **Principal — mandatory** |
| Safety content | Administration | **Principal — mandatory, verified** |
| Legal pages | Management | **Legal advisor — mandatory** |

Placeholder roles until the school confirms real assignments ([39_OPEN_DECISIONS](39_OPEN_DECISIONS.md)). Detailed in [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md).

---

## Content integrity rules

Non-negotiable, from [02_PRODUCT_VISION](02_PRODUCT_VISION.md).

1. **No fabricated data.** Statistics, results, accreditations, and testimonials must be real and supplied by the school. A false board-result figure is a misrepresentation to families choosing a school, not a placeholder.
2. **No stock photography as campus imagery.** Parents recognise it, and it destroys the trust the page is trying to build.
3. **Testimonials are attributable and permitted.** Real person, real relationship, consent obtained.
4. **Safety claims are verified.** Claiming CCTV or a child protection policy that does not exist is a serious misrepresentation.
5. **Child imagery follows the consent rules** in [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md).
6. **Placeholders are visually obvious** — `[SCHOOL_NAME]` format, so nothing plausible-looking can reach production unnoticed.

---

## Categorisation — decided, not deferred by default

| Content | v1 approach | Table? | Classification |
|---|---|---|---|
| Notices | Enum: Academic, Examination, Event, Holiday, CBSE, General | No | `MVP` |
| Downloads | Enum: Admission, Academic, Calendar, Circular, Policy, Mandatory Disclosure, Form, Other | No | `MVP` |
| Gallery albums | Enum: Campus, Sports, Cultural, Academic, Events, Celebrations | No | `MVP` |
| Achievements | Enum: Academic, Sports, Olympiad, Cultural, School | No | `MVP` |
| Faculty | `Department` table | **Yes** | `MVP` |
| **News** | Nullable free-text tag | Not yet | **`OPTIONAL`** |
| **Events** | None in v1 | Not yet | **`OPTIONAL`** |

### On News and Event categories
These are **not rejected** — they are classified `OPTIONAL` pending evidence of need.

Enums are used where the set is genuinely fixed and school-agnostic. News categories are neither: what a school wants to file news under is specific to that school and may change. That argues for a table — but only once there is evidence the school wants to manage them.

MVP therefore uses a nullable tag field. If real filtering demand appears, promoting it to a table is a small additive migration with no data loss. Deciding now, in either direction, would be guessing.

---

## Content volume expectations

Informs pagination and index design.

| Content | Year 1 | Year 3 |
|---|---|---|
| News | 30–60 | 150–250 |
| Events | 30–50 | 120–200 |
| Notices | 100–200 | 400–800 |
| Gallery albums | 20–40 | 80–150 |
| Gallery images | 500–1500 | 3000–6000 |
| Faculty | 40–80 | 40–80 |
| Downloads | 20–40 | 60–120 |
| Achievements | 20–50 | 100–200 |
| Enquiries | 200–800 | *retention-dependent* |

Modest throughout. `GalleryImage` is the largest table, then `AuditLog`. Nothing here strains a properly indexed Postgres instance.

**Pagination:** 12 per page for news, events, and gallery albums; 20 for notices and downloads; faculty unpaginated with client-side filtering.

---

## Migration and import

No existing content to migrate — the repository is empty and no prior site was identified ([CHANGE-0001](../HISTORY/2026/08/CHANGE-0001-INITIAL-DISCOVERY.md)).

**If the school has an existing website**, that changes materially: existing URLs would need mapping to 301 redirects to preserve accumulated search ranking, and existing content would need extraction. **This is an unknown that should be resolved early** — discovering an existing site after launch means losing whatever ranking it had. Registered in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).
