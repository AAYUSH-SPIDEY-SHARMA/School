# 07 — Site Map (Definitive Route Table)

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery) |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect |
| **Dependencies** | [06_INFORMATION_ARCHITECTURE](06_INFORMATION_ARCHITECTURE.md) |
| **Related Documents** | [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) · [09_NAVIGATION](09_NAVIGATION.md) · [25_SEO_STRATEGY](25_SEO_STRATEGY.md) · [36_PROJECT_STRUCTURE](36_PROJECT_STRUCTURE.md) |

> **This is the authoritative route table.** Every route here has a corresponding entry in [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md), and the counts are asserted by the consistency audit. Any route added to the codebase without appearing here is documented drift.

---

## Totals

| Category | Count |
|---|---|
| Public static routes | **37** |
| Public dynamic route patterns | **4** |
| Admin route patterns | **34** |
| System routes | **6** |
| **Total route patterns** | **81** |

> ⚠️ **Stakeholder-facing terminology (CF-6, owner-approved).** Do **not** describe this project to the school as "81 pages" — 40 of those are implementation routes, not pages a parent will ever see. Use:
>
> | For the school | Count |
> |---|---|
> | Public content pages | **37** |
> | Dynamic content templates | **4** |
> | Admin routes | 34 |
> | System routes | 6 |
>
> The 81 route-pattern total remains correct and useful internally.

Rendering strategy legend: **S** = static / cached · **D** = dynamic (request-time) · **ISR** = cached with tag revalidation.

---

## 1. Public static routes (37)

### Home
| # | Route | Page | Render | Priority |
|---|---|---|---|---|
| 1 | `/` | Home | ISR | 1.0 |

### About (7)
| # | Route | Page | Render | Priority |
|---|---|---|---|---|
| 2 | `/about` | About the School | S | 0.9 |
| 3 | `/about/vision-mission` | Vision & Mission | S | 0.7 |
| 4 | `/about/principals-message` | Principal's Message | S | 0.7 |
| 5 | `/about/leadership` | Leadership | ISR | 0.7 |
| 6 | `/about/infrastructure` | Infrastructure & Facilities | ISR | 0.8 |
| 7 | `/about/safety` | Safety & Security | S | 0.8 |
| 8 | `/about/transport` | Transport | S | 0.8 |

### Academics (7)
| # | Route | Page | Render | Priority |
|---|---|---|---|---|
| 9 | `/academics` | Academic Overview | S | 0.9 |
| 10 | `/academics/curriculum` | Curriculum | S | 0.8 |
| 11 | `/academics/pre-primary` | Pre-Primary (Nursery–UKG) | S | 0.8 |
| 12 | `/academics/primary` | Primary (I–V) | S | 0.8 |
| 13 | `/academics/middle-school` | Middle School (VI–VIII) | S | 0.8 |
| 14 | `/academics/secondary-school` | Secondary School (IX–X) | S | 0.8 |
| 15 | `/academics/faculty` | Faculty Directory | ISR | 0.8 |

> **Four stages only.** No Class 11–12, no streams, no senior secondary — the school serves Nursery–Class 10. Hard invariant, enforced by the consistency audit.

### Admissions (7)
| # | Route | Page | Render | Priority |
|---|---|---|---|---|
| 16 | `/admissions` | Admissions Overview | ISR | **1.0** |
| 17 | `/admissions/process` | Admission Process | S | 0.9 |
| 18 | `/admissions/eligibility` | Eligibility & Age Criteria | S | 0.9 |
| 19 | `/admissions/fees` | Fee Structure | ISR | **0.9** |
| 20 | `/admissions/important-dates` | Important Dates | ISR | 0.9 |
| 21 | `/admissions/faqs` | Admissions FAQs | S | 0.7 |
| 22 | `/admissions/enquire` | Enquiry Form | D | **1.0** |

> `/admissions` and `/admissions/enquire` carry the highest sitemap priority on the site. They are the conversion path.

### Campus Life (5)
| # | Route | Page | Render | Priority |
|---|---|---|---|---|
| 23 | `/campus-life` | Student Life | S | 0.8 |
| 24 | `/campus-life/sports` | Sports | ISR | 0.7 |
| 25 | `/campus-life/clubs` | Clubs & Activities | ISR | 0.7 |
| 26 | `/campus-life/arts` | Arts & Culture | ISR | 0.6 |
| 27 | `/achievements` | Achievements | ISR | 0.8 |

### Media (3)
| # | Route | Page | Render | Priority |
|---|---|---|---|---|
| 28 | `/gallery` | Gallery (album index) | ISR | 0.8 |
| 29 | `/news` | News Index | ISR | 0.8 |
| 30 | `/events` | Events Index | ISR | 0.8 |

### Current-parent resources (3)
| # | Route | Page | Render | Priority |
|---|---|---|---|---|
| 31 | `/notices` | Notices | ISR | 0.8 |
| 32 | `/downloads` | Downloads | ISR | 0.8 |
| 33 | `/academic-calendar` | Academic Calendar | ISR | 0.7 |

### Contact and legal (4)
| # | Route | Page | Render | Priority |
|---|---|---|---|---|
| 34 | `/contact` | Contact | S | 0.9 |
| 35 | `/privacy-policy` | Privacy Policy | S | 0.3 |
| 36 | `/terms` | Terms of Use | S | 0.3 |
| 37 | `/sitemap` | HTML Sitemap | S | 0.3 |

---

## 2. Public dynamic route patterns (4)

| # | Pattern | Page | Render | Source entity | Slug source |
|---|---|---|---|---|---|
| 38 | `/news/[slug]` | News article | ISR | `News` | Title, editable |
| 39 | `/events/[slug]` | Event detail | ISR | `Event` | Title, editable |
| 40 | `/gallery/[slug]` | Gallery album | ISR | `GalleryAlbum` | Title, editable |
| 41 | `/academics/faculty/[slug]` | Faculty profile | ISR | `Faculty` | Name, editable |

**Slug rules** (specified in [21_CONTENT_MODEL](21_CONTENT_MODEL.md)):
- Generated from the title, lowercased, hyphenated, unique per entity type
- Editable by admins
- **A changed slug retains its predecessor in a slug-history record and issues a permanent 301** (NFR-028)
- Canonical URL always points at the current slug

---

## 3. System routes (6)

| # | Route / file | Purpose |
|---|---|---|
| 42 | `not-found.tsx` | 404 — helpful navigation, not a dead end |
| 43 | `error.tsx` | Server error — apologise, show phone number |
| 44 | `robots.ts` | Generated robots.txt; disallows `/admin` |
| 45 | `sitemap.ts` | Generated XML sitemap including dynamic content |
| 46 | `opengraph-image` | Default social sharing image |
| 47 | `manifest.ts` | Web app manifest |

---

## 4. Admin route patterns (34)

All routes below `/admin` require authentication. `/admin/*` is excluded from indexing via both `robots.txt` and `noindex`.

### Authentication and dashboard (2)
| # | Route | Purpose | Minimum role |
|---|---|---|---|
| 48 | `/admin/login` | Sign in | Public |
| 49 | `/admin` | Dashboard | Any authenticated |

### Enquiries (2)
| # | Route | Purpose | Minimum role |
|---|---|---|---|
| 50 | `/admin/enquiries` | List, filter by status | `ADMISSIONS_MANAGER` |
| 51 | `/admin/enquiries/[id]` | Detail, status, notes | `ADMISSIONS_MANAGER` |

### Editorial modules (21)
Each follows the same list / create / edit triple.

| # | Routes | Module | Minimum role |
|---|---|---|---|
| 52–54 | `/admin/news`, `/new`, `/[id]/edit` | News | `EDITOR` |
| 55–57 | `/admin/events`, `/new`, `/[id]/edit` | Events | `EDITOR` |
| 58–60 | `/admin/gallery`, `/new`, `/[id]/edit` | Gallery albums | `EDITOR` |
| 61–63 | `/admin/faculty`, `/new`, `/[id]/edit` | Faculty | `EDITOR` |
| 64–66 | `/admin/notices`, `/new`, `/[id]/edit` | Notices | `EDITOR` |
| 67–69 | `/admin/downloads`, `/new`, `/[id]/edit` | Downloads | `EDITOR` |
| 70–72 | `/admin/achievements`, `/new`, `/[id]/edit` | Achievements | `EDITOR` |

### Testimonials (3)
| # | Routes | Module | Minimum role |
|---|---|---|---|
| 73–75 | `/admin/testimonials`, `/new`, `/[id]/edit` | Testimonials | `EDITOR` |

### Administration (6)
| # | Route | Purpose | Minimum role |
|---|---|---|---|
| 76 | `/admin/media` | Media library | `EDITOR` |
| 77 | `/admin/settings` | Site settings, global SEO, statistics | `SUPER_ADMIN` |
| 78–80 | `/admin/users`, `/new`, `/[id]/edit` | User management | `SUPER_ADMIN` |
| 81 | `/admin/audit-log` | Audit trail | `SUPER_ADMIN` |

Permissions matrix in [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md).

---

## 5. URL conventions

| Rule | Applied |
|---|---|
| Lowercase, hyphen-separated | `/about/principals-message` |
| No trailing slash | Enforced by redirect |
| No file extensions | — |
| No IDs in public URLs | Slugs only |
| Nesting reflects the IA | `/academics/faculty/[slug]` |
| Stable — treated as a contract | Changes require a 301 |
| No dates in news URLs | `/news/[slug]`, not `/news/2026/08/[slug]` — keeps URLs short and avoids implying an archive structure that must then be maintained |

---

## 6. Redirects

| From | To | Type | Reason |
|---|---|---|---|
| `/admissions/apply` | `/admissions/enquire` | 301 | Anticipated guess; "apply" implies a full application that v1 does not offer |
| `/faculty` | `/academics/faculty` | 301 | Common shorthand |
| `/fees` | `/admissions/fees` | 301 | High-intent shorthand — parents type this |
| `/about-us` | `/about` | 301 | Common convention |
| `/contact-us` | `/contact` | 301 | Common convention |
| Retired slugs | Current slug | 301 | Generated from slug history |

> The `/fees` and `/faculty` shortcuts exist because they are plausible direct-entry guesses. Catching them costs one config line and prevents a 404 on a high-intent visit.

---

## 7. Sitemap and indexing

**Included in `sitemap.xml`:** all 37 public static routes and every published dynamic entity.

**Excluded:** `/admin/*`, system routes, unpublished or draft content, expired notices, and any staging deployment (which is blanket `noindex`, NFR-066).

`lastModified` is derived from each entity's `updatedAt`. Priorities are as tabulated above.

---

## 8. Count assertions (audit checks)

The consistency audit asserts:

1. Public static routes = **37**, and each has exactly one specification entry
2. Public dynamic patterns = **4**
3. Admin route patterns = **34**
4. System routes = **6**
5. Total = **81**, matching the figure in [01_PROJECT_OVERVIEW](01_PROJECT_OVERVIEW.md)
6. Zero routes reference Class 11, Class 12, streams, or senior secondary
7. Every dynamic pattern maps to an entity present in [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md)
8. Every admin route's minimum role exists in [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md)
