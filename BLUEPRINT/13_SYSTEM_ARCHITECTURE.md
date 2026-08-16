# 13 — System Architecture

| Field | Value |
|---|---|
| **Status** | PROPOSED — pending stack approval |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect |
| **Dependencies** | [12_TECH_STACK](12_TECH_STACK.md) |
| **Related Documents** | [14_FRONTEND_ARCHITECTURE](14_FRONTEND_ARCHITECTURE.md) · [15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md) · [16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md) · [28_SECURITY](28_SECURITY.md) · [30_DEPLOYMENT](30_DEPLOYMENT.md) |

---

## Guiding principle

**One application, one database, one media service.**

A single-campus school website with modest traffic and a handful of editors does not justify distributed architecture. Every additional service is one the school must fund, monitor, and understand — potentially after whoever built it has moved on. Simplicity here is a feature the school will actually feel.

---

## System context

```
   Prospective parent          Current parent          School staff
   (mobile, search)            (mobile, direct)        (desktop, /admin)
          │                          │                      │
          └──────────────┬───────────┴──────────────────────┘
                         │  HTTPS
                         ▼
          ┌──────────────────────────────────┐
          │      Vercel Edge Network         │   CDN, TLS, static assets
          └───────────────┬──────────────────┘
                          │
          ┌───────────────▼──────────────────┐
          │    Next.js application           │
          │                                  │
          │  proxy.ts       route protection │
          │  Public routes  Server Components│
          │  /admin         Server Actions   │
          └───┬───────────────┬──────────┬───┘
              │               │          │
              ▼               ▼          ▼
      ┌─────────────┐  ┌────────────┐  ┌──────────────┐
      │ PostgreSQL  │  │ Cloudinary │  │ Email provider│
      │ (Neon)      │  │ (media CDN)│  │ (transactional)│
      └─────────────┘  └────────────┘  └──────────────┘
              │
              ▼
      ┌─────────────┐
      │  Analytics  │  ┌──────────────────┐
      │  Monitoring │  │ Error monitoring │
      └─────────────┘  └──────────────────┘
```

Four external dependencies: database, media, email, monitoring. Each is individually replaceable.

---

## Request flows

### Public page — cached
```
Browser → Edge (CDN hit) → cached HTML
```
No application invocation, no database query. This is the path most parent traffic takes.

### Public page — cache miss
```
Browser → Edge → Next.js → Server Component → Prisma → Postgres
                                    ↓
                            HTML streamed, cached by tag
```

### Enquiry submission
```
Form (client) → Zod validate → Server Action
                                   │
                     ┌─────────────┼──────────────┐
                     ▼             ▼              ▼
              Zod re-validate  rate limit    honeypot check
                     │
                     ▼
              Prisma → INSERT AdmissionEnquiry (status NEW)
                     │
                     ├──→ email notification (failure logged + alerted)
                     └──→ confirmation to parent
```
Server-side validation is authoritative. The client schema is a convenience, never a control.

### Admin publish
```
/admin → proxy.ts (session check) → page (role check) → Server Action
                                                            │
                                              ┌─────────────┼──────────┐
                                              ▼             ▼          ▼
                                        authorise      Prisma      AuditLog
                                                          │
                                                    updateTag(...)
                                                          ▼
                                              Public page reflects change
```

Authorisation is checked **twice**: `proxy.ts` gates the route boundary, and every Server Action re-checks the acting user's role. The proxy is a convenience layer, never the security boundary — a Server Action can be invoked directly (NFR/AR-003).

---

## Components

| Component | Responsibility | Trust boundary |
|---|---|---|
| Edge / CDN | TLS, static assets, cached HTML | Public |
| `proxy.ts` | Session presence check, admin route gating, security headers | Public → App |
| Server Components | Data fetching, rendering | Trusted |
| Client Components | Interaction only | **Untrusted** |
| Server Actions | Mutations, authorisation, validation | Trusted — **the real security boundary** |
| Prisma | Typed, parameterised DB access | Trusted |
| PostgreSQL | Persistence, constraints | Private |
| Cloudinary | Media storage, transformation, EXIF stripping | Semi-public (assets are public by URL) |
| Email provider | Enquiry notifications | External |

---

## Rendering and caching

| Content | Strategy | Invalidation |
|---|---|---|
| Static prose pages | Static | Deploy |
| Home, listings, detail pages | Cached, tag-revalidated | On publish |
| Enquiry form | Dynamic | — |
| `/admin/*` | Dynamic, never cached | — |

**Read path** uses `revalidateTag(tag, profile)` for stale-while-revalidate — parents see a cached page instantly while it refreshes behind them.

**Write path** uses `updateTag(tag)` inside Server Actions for read-your-writes, so an editor who publishes a notice sees it live immediately. This distinction matters: without it, editors republish repeatedly because they cannot see their own change (J7).

Detail in [14_FRONTEND_ARCHITECTURE](14_FRONTEND_ARCHITECTURE.md).

---

## Security boundaries

```
PUBLIC          all public routes, published content only
  │  proxy.ts — session presence, security headers
AUTHENTICATED   /admin/*, any signed-in user
  │  Server Action — role authorisation, per action
AUTHORISED      role-permitted operations
  │  Prisma — parameterised access only
DATA            PostgreSQL, private network
```

**Rules**
1. Client-side checks are UX, never security
2. Every Server Action independently authorises — it is a public HTTP endpoint by nature
3. Unpublished content is filtered at the query layer, not hidden in the UI
4. Enquiry PII is readable only by `ADMISSIONS_MANAGER` and `SUPER_ADMIN`, and access is logged
5. Uploads are validated by actual content type, not by filename or client-declared MIME

Full threat model in [28_SECURITY](28_SECURITY.md).

---

## Failure modes

Designed for, not assumed away.

| Failure | Behaviour | Mitigation |
|---|---|---|
| Database unreachable | Cached pages continue to serve | Static/cached-first architecture limits blast radius |
| DB down **and** cache miss | Error page with phone number | Parent still reaches the school |
| **Enquiry write fails** | Error shown + phone fallback + values preserved | **Logged and alerted** (NFR-063) |
| Email notification fails | Enquiry is still persisted | Notification is decoupled from the write; failure alerted |
| Cloudinary unavailable | Text renders, images fail gracefully | Alt text and designed fallbacks |
| Cold start | Slight first-request latency | Rust-free ORM client; minimal server bundle |
| Traffic spike (results day) | Serverless scales | Cached-first; DB shielded by cache |

> The enquiry-write failure is the highest-consequence failure in the system. It must never fail silently: a lost enquiry is a lost admission the school never learns it had.

---

## Environments

| Environment | Purpose | Database | Indexed |
|---|---|---|---|
| Development | Local | Local Postgres or a Neon dev branch | n/a |
| Preview | Per-PR | Neon branch — one per pull request | **No** |
| Staging | Pre-release *(`SHOULD`)* | Separate DB | **No** — blanket `noindex` (NFR-066) |
| Production | Live | Production DB | Yes |

Staging must never be indexable. A duplicate indexed staging site is a genuine SEO hazard.

---

## Scaling — realistic expectations

Expected load is modest: a single-campus school, with predictable spikes around admission announcements and board results.

The architecture scales in this order, and **only on evidence**:

1. **Now** — serverless functions + CDN. Sufficient by a wide margin
2. **If DB connections saturate** — Neon's pooled connection string (already required by the serverless runtime)
3. **If reads become hot** — extend cache lifetimes; add tags
4. **If a genuine bottleneck appears** — profile first, then act

Explicitly **not** planned: horizontal service splitting, read replicas, external caching, sharding. Adding these pre-emptively costs money and complexity to solve problems this project does not have. If evidence emerges, it gets an ADR.

---

## Rejected architectures

| Architecture | Why rejected |
|---|---|
| Separate SPA + API backend | Fails SEO without SSR anyway; two deployments, two auth surfaces |
| Microservices | No independent scaling or team-boundary need |
| Headless CMS + static site | Vendor cost, second system for staff, harder enquiry handling |
| WordPress | Plugin-driven security surface, performance ceiling, poor fit for a bespoke design |
| Static export, no database | Kills the CMS — which is the answer to the content-rot problem this project exists to solve |
| Serverless + DynamoDB/Firestore | Content is relational; document modelling would fight the domain |

---

## Architecture principles

1. **Server-first.** Client JavaScript is opt-in, per component.
2. **Cache aggressively, invalidate precisely.** Tag-based, not time-based guessing.
3. **One source of truth per fact.** Site statistics live in `SiteSetting`, not duplicated in page copy.
4. **Fail loudly on the write path, gracefully on the read path.** A parent should never see a stack trace; an operator should never miss a lost enquiry.
5. **Every external dependency is replaceable.** Media, email, and analytics sit behind thin internal modules so swapping a vendor is a contained change.
6. **Complexity requires evidence.** New infrastructure needs a measured problem and an ADR.
