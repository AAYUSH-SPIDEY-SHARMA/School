# 15 — Backend Architecture

| Field | Value |
|---|---|
| **Status** | PROPOSED — pending stack approval |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Backend Lead |
| **Dependencies** | [12_TECH_STACK](12_TECH_STACK.md) · [13_SYSTEM_ARCHITECTURE](13_SYSTEM_ARCHITECTURE.md) |
| **Related Documents** | [16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md) · [18_API_SPECIFICATION](18_API_SPECIFICATION.md) · [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) · [28_SECURITY](28_SECURITY.md) |

---

## There is no separate backend

The backend is the server half of the same Next.js application. There is no Express service, no NestJS layer, no separate API deployment.

**Why:** one known client, modest traffic, one team. A separate backend would add a network hop, a serialisation boundary, a second deployment, and a second authentication surface — solving no problem this project has, while doubling what the school must operate.

If a future requirement genuinely demands a separate service — a mobile app, a third-party integration needing a public API — that becomes an ADR at the time, on evidence.

---

## Layers

```
Server Component / Server Action
            │
            ▼
      lib/queries   (reads)      lib/actions   (writes)
            │                          │
            │              ┌───────────┼───────────┐
            │              ▼           ▼           ▼
            │          authorise   validate    audit log
            │              └───────────┼───────────┘
            ▼                          ▼
                    lib/db  (Prisma client)
                              │
                              ▼
                         PostgreSQL
```

**Rule:** no component ever imports Prisma directly. All data access flows through `lib/queries` or `lib/actions`. This keeps authorisation, validation, and audit logging impossible to forget.

---

## Server Actions — the primary write mechanism

Every Server Action follows the same five-step contract. Steps 1–3 are non-negotiable and precede any data access.

```ts
export async function publishNotice(input: unknown) {
  // 1. AUTHENTICATE — who is this?
  const session = await requireSession();

  // 2. AUTHORISE — may they do this?
  requireRole(session, ['EDITOR', 'SUPER_ADMIN']);

  // 3. VALIDATE — is the input well-formed?
  const data = noticeSchema.parse(input);

  // 4. EXECUTE
  const notice = await db.notice.create({ data: { ...data, createdById: session.user.id } });

  // 5. RECORD + INVALIDATE
  await recordAudit({ actorId: session.user.id, action: 'CREATE', entity: 'Notice', entityId: notice.id });
  updateTag('notices');

  return { ok: true, id: notice.id };
}
```

> **A Server Action is a public HTTP endpoint.** The framework generates a callable endpoint for it. Anyone can invoke it directly with arbitrary input. It must therefore authenticate and authorise itself every time — the `proxy.ts` route gate and the admin UI are convenience, not security (AR-003).

### Action inventory

| Domain | Actions | Minimum role |
|---|---|---|
| Enquiry | `submitEnquiry` | **Public** |
| Enquiry management | `updateEnquiryStatus`, `assignEnquiry`, `addEnquiryNote` | `ADMISSIONS_MANAGER` |
| News | `createNews`, `updateNews`, `publishNews`, `unpublishNews`, `deleteNews` | `EDITOR` |
| Events | `createEvent`, `updateEvent`, `publishEvent`, `deleteEvent` | `EDITOR` |
| Notices | `createNotice`, `updateNotice`, `publishNotice`, `expireNotice`, `deleteNotice` | `EDITOR` |
| Gallery | `createAlbum`, `updateAlbum`, `addImages`, `removeImage`, `reorderImages` | `EDITOR` |
| Faculty | `createFaculty`, `updateFaculty`, `deleteFaculty` | `EDITOR` |
| Downloads | `createDocument`, `updateDocument`, `deleteDocument` | `EDITOR` |
| Achievements | `createAchievement`, `updateAchievement`, `deleteAchievement` | `EDITOR` |
| Testimonials | `createTestimonial`, `updateTestimonial`, `deleteTestimonial` | `EDITOR` |
| Media | `uploadMedia`, `deleteMedia`, `updateMediaAltText` | `EDITOR` |
| Settings | `updateSiteSettings` | `SUPER_ADMIN` |
| Facilities | `updateFacilities` | `SUPER_ADMIN` |
| Users | `createUser`, `updateUser`, `deactivateUser`, `resetPassword` | `SUPER_ADMIN` |

`submitEnquiry` is the only publicly invocable action, and therefore carries the heaviest input hardening: rate limiting, honeypot, strict schema, length caps, and normalisation.

---

## Queries

Read functions in `lib/queries`, each with a single responsibility.

```ts
// lib/queries/notices.ts
export async function getPublishedNotices({ category, page = 1 }: Options) {
  return db.notice.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      ...(category && { category }),
    },
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });
}
```

**Rules**
1. Public queries filter to `PUBLISHED` **in the query**, never in the UI. A draft must never reach the client, even hidden
2. Expiry is applied in the query — an expired notice is worse than no notice (F-3)
3. `select` explicit fields; never over-fetch, and never return a password hash
4. Pagination always; never unbounded `findMany`
5. Admin queries take an explicit flag to include drafts, and are only callable after authorisation

---

## Validation

Zod schemas in `lib/validations`, shared by client and server. The server always re-validates.

```ts
export const enquirySchema = z.object({
  parentName:   z.string().trim().min(2).max(100),
  phone:        z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit mobile number'),
  email:        z.string().trim().toLowerCase().email(),
  studentName:  z.string().trim().max(100).optional(),
  classApplying: z.enum(CLASS_LEVELS),   // Nursery … Class X only
  academicYear: z.string().regex(/^\d{4}-\d{2}$/),
  locality:     z.string().trim().max(120).optional(),
  message:      z.string().trim().max(1000).optional(),
  consent:      z.literal(true),
  website:      z.string().max(0),        // honeypot — must be empty
});
```

`CLASS_LEVELS` contains Nursery through Class X only. No Class 11 or 12 value exists anywhere in the system.

**Principles:** trim and normalise on input · cap every string length · reject rather than coerce unexpected input · error messages are specific and human ("Enter a 10-digit mobile number", not "Invalid").

---

## Authentication

Credentials-based, admin-only. **No public user accounts exist.**

```
POST credentials → look up user by email
                 → verify password (argon2id)
                 → check user is active
                 → create session
                 → set secure httpOnly sameSite cookie
```

| Concern | Decision |
|---|---|
| Hashing | **argon2id** — memory-hard. Never a fast hash |
| Session storage | Database-backed sessions — revocable immediately on deactivation |
| Cookie | `httpOnly`, `secure`, `sameSite=lax` |
| Session lifetime | 8 hours idle, 24 hours absolute |
| Failed logins | Rate limited with progressive delay (NFR-047); logged |
| Enumeration | Identical error and timing for unknown email and wrong password |
| Password reset | Admin-initiated by `SUPER_ADMIN` in v1; self-service is `FUTURE` |
| 2FA | `FUTURE` (NFR-054) |

**Config split** — required by the framework's proxy boundary:
- `auth.config.ts` — adapter-free, safe to import into `proxy.ts`
- `auth.ts` — full config with the database adapter, for Server Actions and pages

---

## Authorisation

Three roles as an enum on `User`. No `Role`/`Permission` join tables — three fixed roles for a handful of staff do not justify a dynamic permission system, and the indirection would make the rules harder to audit.

```ts
function requireRole(session: Session, allowed: Role[]) {
  if (!allowed.includes(session.user.role)) throw new ForbiddenError();
}
```

Checked in **every** Server Action and every admin page. Matrix in [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md).

---

## Audit logging

Every mutation that changes public content or permissions writes an `AuditLog` entry: actor, action, entity type, entity id, timestamp, and a summary of what changed.

**Logged:** all content create/update/delete/publish · enquiry status changes and assignment · settings changes · user creation, role change, deactivation · login success and failure.

**Not logged:** page views (that is analytics) · draft autosaves · read access to public content.

⚠️ **Audit entries never contain enquiry PII.** They record *that* enquiry `#123` moved to `CONTACTED` by user `#4`, never the parent's phone number or message. Otherwise the audit log becomes a second, less-protected copy of personal data.

Audit records are append-only and are not editable through the application.

---

## Rate limiting

| Endpoint | Limit | Reason |
|---|---|---|
| `submitEnquiry` | 3 per IP per hour | Spam prevention without blocking a genuine family with two children |
| Login | 5 attempts per IP per 15 min, progressive delay | Brute force |
| Contact form | 3 per IP per hour | Spam |
| Media upload | 20 per user per hour | Abuse containment |

Limits must be forgiving enough not to block real users. A shared household or office IP is common.

---

## Email

Fire-and-forget notification, decoupled from the write.

```
Enquiry persisted (committed)
        │
        ├──→ notify school  ─── failure → log + ALERT (NFR-063)
        └──→ confirmation to parent (optional)
```

**The enquiry write must never depend on email succeeding.** If the provider is down, the enquiry is still recorded and the failure is alerted so staff can work from the dashboard.

Emails contain a link into the admin enquiry record, plus minimal identifying detail — not the full message body, so PII does not proliferate into inboxes unnecessarily.

---

## Media pipeline

```
Admin selects file
   → client-side type and size check (UX only)
   → Server Action: verify actual content type, not filename or declared MIME
   → upload to Cloudinary with EXIF stripping
   → persist MediaAsset record (url, publicId, dimensions, alt text)
```

| Rule | Reason |
|---|---|
| Accept only jpeg, png, webp, avif, pdf | Narrow attack surface |
| Verify content by inspection, never by extension | A `.jpg` extension proves nothing |
| Max 10 MB image, 25 MB document | Abuse containment |
| **Strip EXIF and geolocation** | Child photographs can carry GPS coordinates identifying the campus or a home address (NFR-052) |
| Alt text required before publish | AR-009 |
| Deletion is soft first | Prevents accidental removal of an in-use asset |

Governed by [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md).

---

## Error handling

| Error | User sees | System does |
|---|---|---|
| Validation | Specific inline message | Nothing logged (expected) |
| Unauthorised | Redirect to login | Logged |
| Forbidden | "You don't have permission" | **Logged as a security event** |
| Not found | 404 page | Nothing |
| Rate limited | "Too many attempts, please wait" | Logged |
| Database error | Generic apology + phone number | Logged with full context + alerted |
| **Enquiry write failure** | Apology + phone + values preserved | **Logged + alerted at highest priority** |

Internal details, stack traces, and database messages never reach the user (NFR-053).

---

## Background work

**None in v1.** No queue, no cron, no worker.

Candidates if evidence emerges: scheduled publishing (AR-007), automatic notice expiry (currently handled by query-time filtering, which is simpler and sufficient), and freshness digest emails. Each would be a scheduled function, not a new service.

---

## Backend principles

1. **Never trust the client.** Validate and authorise server-side, every time.
2. **Filter at the query layer.** Unpublished content must not exist in the response.
3. **Fail loudly on writes, gracefully on reads.**
4. **Log every mutation, but never log PII.**
5. **One place per responsibility.** Authorisation lives in the action, not scattered.
6. **No background complexity without a measured need.**
