# 20 — Admin CMS

| Field | Value |
|---|---|
| **Status** | PROPOSED |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product / Frontend Lead |
| **Dependencies** | [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) · [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) |
| **Related Documents** | [21_CONTENT_MODEL](21_CONTENT_MODEL.md) · [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md) · [11_UI_UX_SYSTEM](11_UI_UX_SYSTEM.md) |

---

## Why this exists

The observed failure in comparable school websites is not bad design — it is **abandonment**. One reference site displayed a recruitment notice dated August 2020 on its live homepage in August 2026. Another's footer copyright read 2018 (F-3).

That happens when updating the site requires a developer. **The CMS is the answer to content rot**, and it will only work if the least technical person on staff can use it without help.

Design target: **a teacher publishes a notice in under three minutes, on her first attempt, unaided** (AR-020, persona P5).

---

## Modules

| Module | Route | Role | Priority |
|---|---|---|---|
| Dashboard | `/admin` | Any | `MUST` |
| Enquiries | `/admin/enquiries` | `ADMISSIONS_MANAGER` | `MUST` |
| News | `/admin/news` | `EDITOR` | `MUST` |
| Events | `/admin/events` | `EDITOR` | `MUST` |
| Notices | `/admin/notices` | `EDITOR` | `MUST` |
| Downloads | `/admin/downloads` | `EDITOR` | `MUST` |
| Gallery | `/admin/gallery` | `EDITOR` | `MUST` |
| Faculty | `/admin/faculty` | `EDITOR` | `MUST` |
| Achievements | `/admin/achievements` | `EDITOR` | `MUST` |
| Testimonials | `/admin/testimonials` | `EDITOR` | `SHOULD` |
| Media library | `/admin/media` | `EDITOR` | `SHOULD` |
| Settings | `/admin/settings` | `SUPER_ADMIN` | `MUST` |
| Users | `/admin/users` | `SUPER_ADMIN` | `MUST` |
| Audit log | `/admin/audit-log` | `SUPER_ADMIN` | `MUST` |

Fourteen modules. **Facilities are edited through Settings** rather than a full module — there are perhaps a dozen facility records, changed once a year, and a dedicated module would be ceremony.

> **Facility administration (D-B23, owner-approved):** `/admin/settings` → Facilities tab · **`SUPER_ADMIN` only** · served by a single `updateFacilities` Server Action. There is deliberately **no `/admin/facilities` route and no Facility module**. `EDITOR` has no Facility rights. Revisit only if the school demonstrates that facility content changes often enough to justify a module.

**No page builder** (AR-022). Structured content types are faster to edit, impossible to break visually, and keep the design system intact. Flexibility nobody asked for is not a feature.

---

## Dashboard

Role-aware. Each user sees what their job needs, not a generic overview.

**`ADMISSIONS_MANAGER` sees first:**
- Count of `NEW` enquiries — the number that means "call someone today"
- Enquiries assigned to them
- Recent enquiry activity

**`EDITOR` sees first:**
- ⚠️ **Content freshness warnings** — items past their threshold (AR-017)
- Their drafts awaiting publication
- Recently published items
- Quick actions: New Notice · New News · Upload Photos

**`SUPER_ADMIN` sees both, plus:**
- Recent audit activity
- Active user count

> **Freshness warnings are placed at the top of the editor dashboard deliberately.** This is the single feature aimed directly at preventing the six-year-old-notice failure. If it is buried, it does not work.

---

## Content editing

### Standard list view
Search · status filter · sortable columns · status badges · row actions (edit, preview, publish/unpublish, delete) · pagination · **last-updated column** · designed empty state.

### Standard edit view
Fields grouped as **Content** → **Media** → **Publishing** → **SEO (collapsed)**.

Behaviour:
- Draft by default; **publish is a deliberate, separate act**
- Preview before publish (AR-018)
- Unsaved-changes warning on navigate away
- Validation errors inline and specific; **typed content is never lost on a validation failure**
- Slug auto-generated from title, editable, with a warning if changed after publication

### The slug-change warning
Changing a published slug breaks any link already shared — plausibly in a parent WhatsApp group months earlier. The system writes a `SlugHistory` record and issues a 301 automatically (NFR-028), but the editor is still warned in plain language:

> "This page's web address will change. The old address will still work, but it's usually better to leave it as it is."

---

## Module specifics

**Notices** — the highest-frequency and highest-stakes module for content freshness.
Only **title, category, body** required. Optional: attachment, expiry date, pin-to-top. Publishing must be reachable in ≤3 steps from login. Expiry is strongly encouraged in the UI, because it is what prevents a stale notice remaining live indefinitely.

**News** — title, body, cover image, excerpt; optional featured flag and byline. Rich-text editor limited to headings, bold, italic, lists, links, images, quotes — **no arbitrary HTML, no font or colour controls**. Constraining the editor is what keeps the design system intact and the output accessible.

**Events** — title, description, start date, optional end date and venue. Past events are retained, never deleted. `isAcademicCalendar` surfaces an event on `/academic-calendar`.

**Gallery** — album-first. Create album → multi-file drag-and-drop upload → reorder → set cover → publish. **Bulk upload is essential**: an editor returning from a sports day has forty photographs, and one-at-a-time upload guarantees the module goes unused. Alt text is required before publish; a bulk alt-text entry view keeps this tractable.

**Faculty** — name, designation, department, photo, qualifications; `isLeadership` drives the Leadership page. Reorderable within a department.

**Downloads** — title, category, file, optional academic year. File size and type captured automatically. Uploading a new version of an existing document should replace it in place rather than creating a confusing duplicate.

**Enquiries** — see [23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md).

**Settings** — grouped tabs: Contact · Statistics · Admissions · SEO · Social · Facilities. Every statistic field carries a warning that values are published publicly and **must be accurate** (CR-002).

**Users** — create, assign role, deactivate. Deactivation, never deletion. Role changes are audited.

**Audit log** — read-only, filterable by actor, action, entity, date. Contains no enquiry PII.

---

## Media handling

Upload flow: select → client-side type/size check (UX) → server verifies **actual content type**, not filename → upload with **EXIF and geolocation stripped** → `MediaAsset` record created.

| Rule | Reason |
|---|---|
| Bulk upload with drag-and-drop | Forty photos one at a time means the module is never used |
| Progress per file; partial failure does not lose the batch | — |
| **Alt text required before publish** | AR-009 |
| **"Contains minors" flag** | Drives consent review ([48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md)) |
| Soft delete first | Prevents accidental removal of an in-use asset |
| Warn before deleting an in-use asset | Show where it is used |

### Making alt text bearable
Alt text is required for accessibility but adds friction for exactly the persona least tolerant of it. The resolution is to make it fast rather than optional:

- Label reads **"Describe this photo for people who can't see it"**, with an example, not "Alt text"
- Bulk entry view: thumbnail grid with one input each
- Filename pre-fill as a starting point, never accepted as-is
- Guidance: describe the activity, **not** the children by name

---

## Admin UX principles

1. Plain language — "Publish", not "Set status to PUBLISHED"; "Web address", not "slug"
2. Only genuinely required fields are required
3. Destructive actions confirm, and prefer archive over hard delete
4. Errors are recoverable; content is never lost
5. Every list has a working empty state
6. Mobile-usable for review and simple edits — a principal checking enquiries from a phone is a real scenario
7. Fast — an admin waiting on a spinner is an admin who stops using the tool

---

## Security

Recapitulated because the admin is where the risk concentrates:

- Every Server Action authenticates and authorises independently — **the route guard is not the boundary** ([19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md))
- `EDITOR` cannot reach enquiry PII by any route
- Rich-text output sanitised on render; no raw HTML passthrough
- Uploads validated by content inspection, size-capped, type-restricted
- `/admin/*` is `noindex` and disallowed in robots.txt
- All mutations audited
- Sessions revocable immediately on deactivation

---

## Explicitly not built

| Rejected | Reason |
|---|---|
| Page builder / block editor | AR-022 — trades staff usability for unrequested flexibility |
| Arbitrary HTML editing | Breaks the design system and accessibility |
| Full revision history | `FUTURE` — soft delete plus audit log covers realistic recovery |
| Multi-language editing | `FUTURE` — pending confirmation that Hindi is needed |
| Workflow/approval chains | `OPEN_DECISION` — likely unnecessary for a small staff |
| Comments / collaboration | No need at this team size |
| Custom content types | Content types are known and stable |
| Theme customisation UI | Design is owned by the design system, not by editors |

---

## Success criteria

The CMS succeeds if, one year after launch:

1. Notices are current
2. News has been published without developer involvement
3. Gallery has grown
4. Enquiries are being worked through the dashboard, not a spreadsheet
5. Staff have not asked for a developer to make a routine content change

If the site looks like the reference sites in a year — stale, with a notice from three years ago on the homepage — **this module failed**, regardless of how good the public site looks.
