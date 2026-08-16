# ADR-0008 — Hosting and Deployment Platform

## Status
**Accepted** — platform chosen by the project owner
✅ **Sub-decision resolved 2026-08-16: Neon** (D-A3a, OD-008 closed)

## Date
2026-08-16

## Context

The site must be fast for parents on mid-range Android phones over 4G in India, cheap enough for a school budget, and — critically — **operable by the school after whoever built it has moved on**.

Traffic is modest with predictable spikes around admission announcements and board results.

## Problem

Choose a hosting platform for a server-rendered application plus a Postgres database.

## Options

### Option 1 — Vercel + serverless Postgres (Neon or Supabase)
Native fit for the framework, global edge CDN, atomic deploys with instant rollback, preview deployments per pull request, generous free tiers.

**Against:** vendor coupling; costs can rise sharply if free-tier limits are exceeded; serverless imposes connection-pooling requirements and cold starts.

### Option 2 — Self-hosted VPS with Docker
Full control, predictable flat cost, no vendor lock-in.

**Against:** **the school owns OS updates, TLS renewal, backups, monitoring, and security patching.** For an institution without technical staff, this is the option most likely to end in an unpatched server running an expired certificate two years after launch.

### Option 3 — Shared cPanel hosting
Many Indian schools already own this, and it is inexpensive.

**Against:** typically cannot run a Node server-rendered application. It would force a static export — **which eliminates the admin CMS**, and therefore eliminates the answer to the content-rot problem this project exists to solve ([ADR-0006](ADR-0006-CMS.md)). This was raised as a likely-but-wrong option and would have been argued against.

### Option 4 — AWS / GCP directly
Maximum flexibility and control.

**Against:** substantial operational complexity and a steep learning curve, for a single-campus school website. Disproportionate.

## Decision

**Vercel + Neon or Supabase** — chosen by the project owner ([49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md) D-A3).

## Rationale

The decisive criterion is **who operates this in three years**.

Option 2 is technically defensible and gives more control, but transfers ongoing operational responsibility to a school with no technical staff. The realistic outcome is an unpatched server — a worse security position than a managed platform, despite appearing more "controlled".

Option 3 would have been the wrong choice for a reason worth stating plainly: it appears cheaper while removing the CMS, which is the feature that determines whether the site is still current a year later.

Managed hosting means TLS renewal, OS patching, scaling, and CDN are somebody else's job — permanently. For this project that is the right trade.

## Consequences

### Positive
- Atomic deploys with instant rollback
- Preview deployment per pull request, with an isolated database branch
- Global CDN; TLS provisioned and renewed automatically
- Free tiers likely sufficient at launch
- No servers for the school to patch

### Negative
- **Vendor coupling.** Framework idioms favour this platform; migration would require work
- Costs scale with usage and can rise sharply past free-tier limits
- Serverless constraints: connection pooling required, cold starts to manage
- Less control over the runtime environment

### Risks

| Risk | Mitigation |
|---|---|
| **Free tier exceeded unexpectedly** | Monitor usage; caching keeps most traffic off the application and database |
| **Vendor pricing or terms change** | The application is a standard Node app; nothing architectural prevents relocation |
| **Connection exhaustion** | Pooled connection string; caching shields the database |
| **Cold-start latency** | Rust-free ORM client; minimal server bundle; most requests served from cache |
| **⚠️ Accounts owned by a developer, not the school** | **The most likely real failure.** Addressed below |

## The ownership requirement

This is an operational control, not paperwork, and it is a QA checklist item ([32_QA_CHECKLIST](../../BLUEPRINT/32_QA_CHECKLIST.md) §9):

- [ ] Domain registered to **the school**, on the school's registrar account
- [ ] Hosting account owned by **the school**
- [ ] Database account owned by **the school**
- [ ] **Billing on the school's payment method**
- [ ] Access credentials documented and held by the school

> A service billed to a departed developer's card silently expires and takes the website with it. A school that cannot access its own DNS is dependent on whoever set it up. Both are well-known ways for institutional websites to disappear, and both are prevented by a checklist rather than by engineering.

## Sub-decision: Neon or Supabase — ✅ RESOLVED

**Owner selected Neon**, 2026-08-16.

Stated reasoning: this project benefits more from PostgreSQL, connection pooling, PR/environment branching, migration testing, and a **narrower infrastructure surface**.

Database branching per preview deployment lets migrations be tested before merge — a real workflow benefit, given that migrations against a database holding live enquiry records are the highest-consequence routine operation in the system.

⚠️ **Owner constraint:** *"Do NOT add Supabase Auth or Supabase Storage merely because Supabase offers them."* Authentication remains Auth.js ([ADR-0004](ADR-0004-AUTH.md)); media remains Cloudinary ([ADR-0005](ADR-0005-MEDIA-STORAGE.md)).

**Supabase is now `REJECTED` as the database provider** (D-E22). The approved stack is **Vercel + Neon + PostgreSQL**.

## Related

- [30_DEPLOYMENT](../../BLUEPRINT/30_DEPLOYMENT.md) · [35_ENVIRONMENT_CONFIGURATION](../../BLUEPRINT/35_ENVIRONMENT_CONFIGURATION.md) · [16_DATABASE_ARCHITECTURE](../../BLUEPRINT/16_DATABASE_ARCHITECTURE.md) · [34_BACKUP_AND_RECOVERY](../../BLUEPRINT/34_BACKUP_AND_RECOVERY.md)
- Decision D-A3 in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
- Risk R-16 in [40_RISKS_AND_MITIGATIONS](../../BLUEPRINT/40_RISKS_AND_MITIGATIONS.md)
