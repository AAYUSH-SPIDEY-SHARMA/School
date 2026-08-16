# 17 — Database Schema

| Field | Value |
|---|---|
| **Status** | PROPOSED — specification only; no `.prisma` file exists |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Backend Lead |
| **Dependencies** | [16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md) |
| **Related Documents** | [21_CONTENT_MODEL](21_CONTENT_MODEL.md) · [20_ADMIN_CMS](20_ADMIN_CMS.md) · [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) |

> **This document specifies the schema. It is not an implementation.** No `schema.prisma` exists in the repository — that is written during the implementation phase, per the discovery-only scope of the current work.

---

## Entity inventory — 18 entities

Every entity states **why it exists and what problem it solves.** An entity that cannot justify itself is not built.

| # | Entity | Why it exists | Priority |
|---|---|---|---|
| 1 | `User` | Admin accounts and role assignment | `MVP` |
| 2 | `Department` | Groups faculty; drives the directory filter | `MVP` |
| 3 | `Faculty` | Teacher quality is a stated parental selection factor (F-8) | `MVP` |
| 4 | `News` | Recency signals an active school (F-7 informational intent) | `MVP` |
| 5 | `Event` | Upcoming events drive visits; past events build credibility | `MVP` |
| 6 | `GalleryAlbum` | Groups images into meaningful sets | `MVP` |
| 7 | `GalleryImage` | Shows what the school actually looks like (F-4) | `MVP` |
| 8 | `Achievement` | Quantified trust signals (F-4) | `MVP` |
| 9 | `Notice` | Serves current parents — distinct from News (F-2) | `MVP` |
| 10 | `Document` | Downloadable forms, calendars, circulars (F-2) | `MVP` |
| 11 | `AdmissionEnquiry` | The site's conversion output | `MVP` |
| 12 | `EnquiryNote` | Prevents duplicate follow-up calls (AR-012, J8) | `MVP` |
| 13 | `Testimonial` | Social proof before the admissions ask (F-4) | `MVP` |
| 14 | `Facility` | Infrastructure is a stated selection factor (F-8) | `MVP` |
| 15 | `MediaAsset` | Central media record; carries alt text and consent basis | `MVP` |
| 16 | `SiteSetting` | Contact details, statistics, global SEO — editable without deploy | `MVP` |
| 17 | `AuditLog` | Accountability for content and permission changes | `MVP` |
| 18 | `SlugHistory` | 301 redirects so URL changes never break SEO (NFR-028) | `MVP` |

---

## Enums

```
Role              SUPER_ADMIN | EDITOR | ADMISSIONS_MANAGER

ContentStatus     DRAFT | PUBLISHED | ARCHIVED

ClassLevel        NURSERY | LKG | UKG
                  CLASS_1 … CLASS_10
                  ⚠️ No CLASS_11, CLASS_12. School serves Nursery–Class 10.

EnquiryStatus     NEW | CONTACTED | IN_PROGRESS | RESOLVED | CLOSED

NoticeCategory    ACADEMIC | EXAMINATION | EVENT | HOLIDAY | CBSE | GENERAL

DocumentCategory  ADMISSION | ACADEMIC | CALENDAR | CIRCULAR | POLICY |
                  MANDATORY_DISCLOSURE | FORM | OTHER

AchievementType   ACADEMIC | SPORTS | OLYMPIAD | CULTURAL | SCHOOL

AlbumCategory     CAMPUS | SPORTS | CULTURAL | ACADEMIC | EVENTS | CELEBRATIONS

TestimonialAuthor PARENT | ALUMNI | STUDENT

FacilityCategory  ACADEMIC | SPORTS | ARTS | SUPPORT | SAFETY

AuditAction       CREATE | UPDATE | DELETE | PUBLISH | UNPUBLISH |
                  LOGIN | LOGIN_FAILED | ROLE_CHANGE | STATUS_CHANGE
```

---

## Common field patterns

Applied consistently unless noted per entity.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` `@id` `@default(cuid())` | Non-sequential |
| `createdAt` | `DateTime` `@default(now())` | |
| `updatedAt` | `DateTime` `@updatedAt` | Drives freshness indicators |
| `deletedAt` | `DateTime?` | Soft delete — content entities only |
| `slug` | `String` `@unique` | Public identifier |
| `status` | `ContentStatus` `@default(DRAFT)` | Draft by default — publishing is deliberate |
| `publishedAt` | `DateTime?` | Distinct from `createdAt` |
| `seoTitle` | `String?` | Falls back to title |
| `seoDescription` | `String?` | Falls back to excerpt |
| `createdById` | `String?` | Accountability |

---

## Entities

### 1. `User`
Admin accounts. **No public user accounts exist.**

| Field | Type | Notes |
|---|---|---|
| `id` | String | cuid |
| `email` | String | `@unique`, citext — case-insensitive |
| `name` | String | |
| `passwordHash` | String | argon2id. **Never selected into any query result** |
| `role` | Role | `@default(EDITOR)` |
| `isActive` | Boolean | `@default(true)` — deactivate rather than delete |
| `lastLoginAt` | DateTime? | |
| `createdAt` / `updatedAt` | DateTime | |

Relations: `createdContent[]`, `assignedEnquiries[]`, `enquiryNotes[]`, `auditEntries[]`
Indexes: unique `email`, `(role, isActive)`
Not soft-deleted — deactivation is the correct operation, preserving audit history.

### 2. `Department`
| Field | Type | Notes |
|---|---|---|
| `id`, `name`, `slug` | String | |
| `description` | String? | |
| `displayOrder` | Int | `@default(0)` |

Relations: `faculty[]`

### 3. `Faculty`
| Field | Type | Notes |
|---|---|---|
| `id`, `slug` | String | |
| `name` | String | |
| `designation` | String | |
| `qualification` | String? | |
| `experienceYears` | Int? | |
| `bio` | String? | |
| `photoId` | String? | → `MediaAsset` |
| `departmentId` | String? | `onDelete: SetNull` |
| `isLeadership` | Boolean | `@default(false)` — drives the Leadership page |
| `displayOrder` | Int | |
| `status`, `publishedAt`, `deletedAt` | | |

Indexes: `(departmentId, displayOrder)`, `(isLeadership, displayOrder)`, unique `slug`
> Leadership is a boolean on `Faculty`, not a separate entity — leadership *are* faculty, and duplicating them would create two records to keep in sync.

### 4. `News`
| Field | Type | Notes |
|---|---|---|
| `id`, `slug`, `title` | String | |
| `excerpt` | String? | Card display; SEO description fallback |
| `body` | String | Rich text |
| `coverImageId` | String? | → `MediaAsset` |
| `category` | String? | **Free-text tag in MVP** — see note |
| `featured` | Boolean | `@default(false)` |
| `authorName` | String? | Display byline, distinct from `createdById` |
| `status`, `publishedAt`, `seoTitle`, `seoDescription`, `createdById`, `deletedAt` | | |

Indexes: `(status, publishedAt DESC)` partial where `deletedAt IS NULL`; unique `slug`; `(featured, publishedAt DESC)`

> **Category decision.** A `NewsCategory` table is classified `OPTIONAL`, not rejected. MVP uses a nullable string tag because the school has not yet indicated it needs to manage categories itself. If real filtering demand appears, promoting the field to a table is a small additive migration. This is deliberately left open rather than pre-emptively decided in either direction.

### 5. `Event`
| Field | Type | Notes |
|---|---|---|
| `id`, `slug`, `title` | String | |
| `description` | String | |
| `startDate` | DateTime | |
| `endDate` | DateTime? | `CHECK endDate >= startDate` |
| `venue` | String? | |
| `coverImageId` | String? | |
| `isAcademicCalendar` | Boolean | `@default(false)` — surfaces on `/academic-calendar` |
| `status`, `publishedAt`, `seoTitle`, `seoDescription`, `createdById`, `deletedAt` | | |

Indexes: `(status, startDate)`, unique `slug`
> Past events are retained, never deleted — an event archive is a credibility signal and an SEO asset.

### 6. `GalleryAlbum`
| Field | Type | Notes |
|---|---|---|
| `id`, `slug`, `title` | String | |
| `description` | String? | |
| `category` | AlbumCategory | |
| `eventDate` | DateTime? | |
| `coverImageId` | String? | |
| `status`, `publishedAt`, `createdById`, `deletedAt` | | |

Relations: `images[]` (`onDelete: Cascade`)

### 7. `GalleryImage`
| Field | Type | Notes |
|---|---|---|
| `id` | String | |
| `albumId` | String | `onDelete: Cascade` |
| `mediaAssetId` | String | → `MediaAsset` |
| `caption` | String? | |
| `displayOrder` | Int | |

Indexes: `(albumId, displayOrder)`
> ⚠️ Contains identifiable minors. Consent basis lives on `MediaAsset`. See [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md).

### 8. `Achievement`
| Field | Type | Notes |
|---|---|---|
| `id`, `title` | String | |
| `description` | String? | |
| `type` | AchievementType | |
| `achieverName` | String? | Student or team |
| `level` | String? | School / district / state / national / international |
| `achievedOn` | DateTime | |
| `imageId` | String? | |
| `featured` | Boolean | |
| `status`, `publishedAt`, `createdById`, `deletedAt` | | |

Indexes: `(status, achievedOn DESC)`, `(type, achievedOn DESC)`
> ⚠️ Naming a student publicly is a child-privacy consideration, not just a content choice. Covered in [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md).

### 9. `Notice`
| Field | Type | Notes |
|---|---|---|
| `id`, `title` | String | |
| `body` | String | |
| `category` | NoticeCategory | |
| `attachmentId` | String? | → `MediaAsset` |
| `pinned` | Boolean | `@default(false)` |
| `expiresAt` | DateTime? | **Filtered at query time** |
| `status`, `publishedAt`, `createdById`, `deletedAt` | | |

Indexes: `(status, category, publishedAt DESC)`, `(expiresAt)`, `(pinned, publishedAt DESC)`
> **No slug.** Notices are consumed in a list, not deep-linked, and generating URLs for ephemeral operational notices creates permanent URLs for temporary content.
>
> `expiresAt` is the direct answer to the observed six-year-old live notice (F-3).

### 10. `Document`
| Field | Type | Notes |
|---|---|---|
| `id`, `title` | String | |
| `description` | String? | |
| `category` | DocumentCategory | |
| `mediaAssetId` | String | The file |
| `fileSize` | Int | Bytes — shown before the tap |
| `fileType` | String | MIME |
| `academicYear` | String? | Disambiguates versions |
| `displayOrder` | Int | |
| `status`, `publishedAt`, `createdById`, `deletedAt` | | |

Indexes: `(status, category, displayOrder)`

### 11. `AdmissionEnquiry`
**Contains personal data, including data about a minor. Handle accordingly.**

| Field | Type | Notes |
|---|---|---|
| `id` | String | |
| `parentName` | String | Required |
| `phone` | String | Required, normalised |
| `email` | String | Required, lowercased |
| `studentName` | String? | **Optional** — minimises data about a minor |
| `classApplying` | ClassLevel | Nursery–Class 10 only |
| `academicYear` | String | |
| `locality` | String? | |
| `message` | String? | Max 1000 chars |
| `status` | EnquiryStatus | `@default(NEW)` |
| `assignedToId` | String? | → `User`, `onDelete: SetNull` |
| `source` | String? | `website` / `walk-in` |
| `consentAt` | DateTime | When consent was given |
| `contactedAt`, `resolvedAt`, `closedAt` | DateTime? | Lifecycle timestamps |
| `createdAt` / `updatedAt` | DateTime | |

Relations: `notes[]`
Indexes: `(status, createdAt DESC)`, `(assignedToId, status)`, `(academicYear, status)`

> **Not soft-deleted.** Deletion here is a genuine privacy operation and must actually remove data. Retention period is an `OPEN_DECISION` for the school.

### 12. `EnquiryNote`
| Field | Type | Notes |
|---|---|---|
| `id`, `enquiryId`, `authorId` | String | `enquiryId` `onDelete: Cascade` |
| `body` | String | |
| `createdAt` | DateTime | |

Indexes: `(enquiryId, createdAt DESC)`
> Separate from a JSON field so each note carries a real author and timestamp — the mechanism that prevents two staff members calling the same parent (J8).

### 13. `Testimonial`
| Field | Type | Notes |
|---|---|---|
| `id`, `quote` | String | |
| `authorName` | String | |
| `authorType` | TestimonialAuthor | |
| `authorDetail` | String? | e.g. "Parent, Class 5" |
| `photoId` | String? | |
| `featured` | Boolean | |
| `status`, `publishedAt`, `createdById`, `deletedAt` | | |

> ⚠️ Testimonials must be **real and attributable**, with the author's permission. Fabricated testimonials on a real school's site are a misrepresentation to families (CR-002).

### 14. `Facility`
| Field | Type | Notes |
|---|---|---|
| `id`, `slug`, `name` | String | |
| `description` | String | |
| `category` | FacilityCategory | |
| `imageId` | String? | |
| `displayOrder` | Int | |
| `status`, `deletedAt` | | |

### 15. `MediaAsset`
Central record for every uploaded file.

| Field | Type | Notes |
|---|---|---|
| `id` | String | |
| `url`, `publicId` | String | Provider URL and identifier |
| `fileName`, `mimeType` | String | |
| `fileSize` | Int | |
| `width`, `height` | Int? | Images only — enables CLS prevention |
| `altText` | String? | **Required before publish** (AR-009) |
| `caption` | String? | |
| `consentBasis` | String? | ⚠️ Child-imagery consent record |
| `containsMinors` | Boolean | `@default(false)` — drives review workflow |
| `uploadedById` | String? | |
| `createdAt`, `deletedAt` | | |

Indexes: `(mimeType, createdAt DESC)`, `(containsMinors)`
> `consentBasis` and `containsMinors` exist because a school gallery is full of children. See [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md). EXIF and geolocation are stripped at upload (NFR-052).

### 16. `SiteSetting`
Key–value store for editable global configuration.

| Field | Type | Notes |
|---|---|---|
| `key` | String | `@id` |
| `value` | String | JSON-encoded for structured values |
| `group` | String | `contact` / `stats` / `seo` / `admissions` / `social` |
| `updatedById` | String? | |
| `updatedAt` | DateTime | |

Known keys include: `school.name`, `school.address`, `school.phone`, `school.email`, `school.affiliationNumber`, `stats.established`, `stats.students`, `stats.faculty`, `stats.boardResult`, `seo.defaultTitle`, `seo.defaultDescription`, `seo.defaultOgImage`, `admissions.cycleStatus`, `admissions.academicYear`, `social.*`.

> **Global SEO lives here**, entity SEO lives on entities. This split was a specific review correction — the two were previously conflated.
>
> All values seed as `[PLACEHOLDER]` tokens. **No invented school facts.**

### 17. `AuditLog`
Append-only.

| Field | Type | Notes |
|---|---|---|
| `id` | String | |
| `actorId` | String? | `onDelete: SetNull` — history survives user deletion |
| `actorEmail` | String | Denormalised snapshot |
| `action` | AuditAction | |
| `entityType`, `entityId` | String | |
| `summary` | String? | Human-readable |
| `ipAddress` | String? | |
| `createdAt` | DateTime | |

Indexes: `(entityType, entityId, createdAt DESC)`, `(actorId, createdAt DESC)`, `(action, createdAt DESC)`

> ⚠️ **Never contains enquiry PII.** It records that enquiry `#123` moved to `CONTACTED`, never the parent's phone number. Otherwise the audit log becomes a second, less-protected copy of personal data.

### 18. `SlugHistory`
| Field | Type | Notes |
|---|---|---|
| `id` | String | |
| `entityType` | String | `news` / `event` / `gallery` / `faculty` |
| `entityId` | String | |
| `oldSlug` | String | |
| `createdAt` | DateTime | |

Indexes: unique `(entityType, oldSlug)`
> Written automatically whenever a slug changes. `proxy.ts` consults it to issue a permanent 301, so an old URL — possibly shared in a parent WhatsApp group months earlier — never 404s (NFR-028).

---

## Relationship summary

```
User ──< News, Event, Notice, Document, Achievement, Testimonial, Facility, GalleryAlbum
User ──< AdmissionEnquiry (assigned)
User ──< EnquiryNote
User ──< AuditLog

Department ──< Faculty

GalleryAlbum ──< GalleryImage >── MediaAsset

MediaAsset ──< News.cover, Event.cover, Faculty.photo,
               Notice.attachment, Document.file, Achievement.image,
               Testimonial.photo, Facility.image

AdmissionEnquiry ──< EnquiryNote

SlugHistory ──> (polymorphic by entityType + entityId)
```

`SlugHistory` is intentionally polymorphic rather than four separate tables — it holds only a lookup key, has no relational obligations, and four near-identical tables would be worse.

---

## Validation — application vs database

| Rule | Enforced |
|---|---|
| Required fields | Both |
| Email format | Application (Zod) |
| Phone format | Application (Zod) |
| Slug uniqueness | **Database** (unique constraint) |
| `endDate >= startDate` | **Database** (CHECK) |
| Status transitions | Application |
| Alt text before publish | Application |
| Max lengths | Both |
| Class level validity | **Database** (enum) |

Application validation is user experience. Database constraints are the guarantee.

---

## Deliberately not modelled

Repeated here so the omissions are visible at schema level: `Role`/`Permission` tables · generic `Page`/`SEO` tables · `Application`/`ApplicationDocument` · `Student`/`Parent` accounts · revision history tables · separate `Address` table · `NewsCategory`/`EventCategory` tables (`OPTIONAL`, not rejected).

Reasoning in [16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md).
