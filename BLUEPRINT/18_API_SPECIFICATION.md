# 18 — API Specification

| Field | Value |
|---|---|
| **Status** | PROPOSED |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Backend Lead |
| **Dependencies** | [15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md) |
| **Related Documents** | [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) · [28_SECURITY](28_SECURITY.md) |

---

## There is almost no API

**This is the correct outcome, not an omission.**

The public site is read-mostly and has exactly one known client: itself. Data reaches pages through Server Components calling query functions directly. Mutations happen through Server Actions. Neither crosses a REST boundary, so neither needs one.

Building a REST or GraphQL layer here would add a network hop, a serialisation boundary, a versioning obligation, and a second surface to authenticate and rate-limit — while solving no problem this project has.

```
Server Component  →  lib/queries  →  Prisma        (no HTTP API)
Client Component  →  Server Action → lib/actions   (framework transport)
```

An API is built only when there is a **second consumer**. There isn't one.

---

## Server Actions are the interface — and they are public endpoints

Server Actions are the project's real mutation interface. They are not conventional API routes, but they must be treated with the same suspicion.

> **The framework compiles every Server Action into a callable HTTP endpoint.** Anyone can invoke it directly, with arbitrary input, bypassing the admin UI entirely. It is not protected by being imported into an authenticated page.

Every Server Action therefore, without exception:

1. **Authenticates** — resolves the session server-side
2. **Authorises** — checks the acting user's role
3. **Validates** — parses input through Zod; unparsed input never reaches the database
4. **Executes**
5. **Audits and invalidates**

Full contract and inventory in [15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md).

### Return shape
Actions return a discriminated result rather than throwing across the boundary:

```ts
type ActionResult<T> =
  | { ok: true;  data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

Errors returned to clients are safe, human-readable messages. Internal detail is logged, never returned (NFR-053).

---

## Route handlers that *are* justified

Five cases genuinely require an HTTP endpoint, because something other than our own React tree calls them.

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Public | Auth library's own endpoints — required by the library |
| `/api/health` | GET | Public | Uptime monitoring probe. Returns status only — **never** version numbers, environment, or dependency detail |
| `/api/revalidate` | POST | Secret header | Manual cache invalidation for operational recovery |
| `/api/og/[type]/[slug]` | GET | Public | Dynamically generated social share images |
| `/api/media/sign` | POST | `EDITOR`+ | Signed direct-upload credentials, so large files bypass the server |

Nothing else. Any addition needs a stated second consumer.

### `/api/health`
Returns `200 {"status":"ok"}` when the application responds and the database is reachable; `503` otherwise. Deliberately uninformative — a health endpoint that leaks version and dependency information is a reconnaissance aid.

### `/api/revalidate`
Protected by a shared secret in a request header, compared with a **timing-safe** comparison. Rate limited. Exists for operational recovery when cache state is wrong; it is not part of the normal publish path, which uses `updateTag` inside Server Actions.

### `/api/media/sign`
Returns short-lived signed upload credentials so the browser uploads directly to the media provider. Requires `EDITOR` or above. The signature constrains file type, size, and destination folder — the client cannot widen those limits.

---

## Why not REST or GraphQL

| Option | Verdict |
|---|---|
| **REST for public content** | No second consumer. Server Components already read directly. Would add a hop and a surface to secure |
| **GraphQL** | Solves over-fetching, which server components already solve. One client makes a schema layer pure overhead |
| **Public read API for third parties** | No requester. If a school app or aggregator ever needs one, it becomes an ADR — with authentication, rate limiting, versioning, and documentation designed in from the start |
| **tRPC** | Server Actions already provide end-to-end type safety within one application |

---

## If a public API is ever built

Recorded now so a future implementation does not start from nothing. **Not built in v1.**

- Versioned under `/api/v1/`
- Read-only for public content; published entities only
- Authenticated by API key, per-key rate limited
- Cursor pagination, never offset, on unbounded collections
- Never exposes: enquiry data, user accounts, draft content, audit logs, media consent records
- Documented with an OpenAPI schema

The exclusion list matters most. `AdmissionEnquiry` contains personal data about parents and minors and must never be reachable through any public interface.

---

## Cross-cutting rules for anything HTTP-facing

| Rule | Applied to |
|---|---|
| Input validated with Zod before use | All handlers and actions |
| Authorisation checked in the handler itself | All non-public endpoints |
| Rate limited | `submitEnquiry`, login, contact, upload signing, revalidate |
| No stack traces or internals in responses | All |
| Structured error shape | All |
| CSRF protection | All state-changing operations |
| Security headers applied in `proxy.ts` | All responses |
| `/api/*` and `/admin/*` excluded from indexing | robots + `noindex` |

---

## Error codes

| Status | Meaning | Response to client |
|---|---|---|
| 400 | Validation failed | Field-level messages |
| 401 | Not authenticated | Redirect to login |
| 403 | Authenticated, not permitted | Generic denial — **logged as a security event** |
| 404 | Not found | Generic |
| 429 | Rate limited | Retry guidance |
| 500 | Server error | Generic apology; full detail logged and alerted |
| 503 | Dependency unavailable | Generic |

403 responses are logged because repeated authorisation failures from one account are a meaningful signal — either a permissions bug or an account behaving unexpectedly.

---

## Summary

| Interface | Count | Purpose |
|---|---|---|
| Server Actions | ~40 | All mutations |
| Query functions | ~25 | All reads, called server-side |
| Route handlers | 5 | Only where a non-React client exists |
| Public REST API | **0** | No consumer |
| GraphQL | **0** | No benefit at this scale |

The absence of an API layer is a design outcome that removes a whole class of security, versioning, and maintenance work from a project that will likely be maintained by a small team.
