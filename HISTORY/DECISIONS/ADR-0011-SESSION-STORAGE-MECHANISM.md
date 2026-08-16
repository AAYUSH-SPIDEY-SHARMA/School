# ADR-0011 — Session Storage Mechanism for Credentials Authentication

## Status
**Accepted** — implementation decision within the approved architecture (ADR-0004, D-B12)

> This ADR does **not** change an owner-approved decision. It records *how* an approved decision is implemented, after the approved combination turned out to be unsupported by the library in the form the blueprint assumed. Raised rather than resolved silently, per the change-management rule.

## Date
2026-08-16

## Context

[ADR-0004](ADR-0004-AUTH.md) and the owner approval require, together:

1. **Auth.js** as the authentication library
2. The **Credentials** provider — admin-only sign-in, no public accounts
3. **Database-backed sessions**
4. **Revocable sessions** — deactivating a staff member ends their access *immediately*
5. **argon2id** password hashing

Locked security rule J states plainly: *"Sessions are revocable."*

[19_AUTHORIZATION_AND_ROLES](../../BLUEPRINT/19_AUTHORIZATION_AND_ROLES.md) gives the reason the mechanism was specified at all:

> "Database sessions are chosen over stateless tokens specifically so that deactivating a departing staff member takes effect instantly rather than whenever their token happens to expire."

## Problem

**Auth.js does not support its adapter-based `session: { strategy: 'database' }` together with the Credentials provider.** This is a documented limitation of the library, not an oversight in the blueprint. The adapter session flow is built around provider sign-in callbacks that Credentials does not participate in.

So requirements 1 + 2 + 3 cannot be satisfied by configuration alone. Discovered during Phase 2 implementation, against `next-auth@5.0.0-beta.32`.

A second, smaller conflict follows from the same place: the Auth.js Prisma adapter expects `Account` and `VerificationToken` models. Adding them would push the schema past the **exactly 18 entities** constraint — for tables that would never hold a row, since there are no OAuth providers and no email or magic-link flows.

## Options

### Option 1 — JWT sessions, with the user re-read from the database on each request
Use the supported Credentials + JWT path. Achieve revocation by checking `isActive` and a `sessionsValidFrom` watermark in the session callback.

*For:* fully supported path; no session table.
*Against:* session state is not actually in the database. Individual sessions cannot be listed or revoked one at a time — only "all sessions for this user, issued before time T". A stolen cookie remains valid until its own expiry unless the user is globally invalidated.

### Option 2 — Override `jwt.encode` to create an adapter session
The known workaround: keep `strategy: 'database'` and override the encoder so it creates a session row and returns its token.

*For:* uses the adapter as designed; sessions are genuinely database rows.
*Against:* depends on internal behaviour the library does not guarantee for this combination, against a **beta** release. Auth failures are the highest-severity defect class in this project, and this places them on an undocumented seam. Also still drags in `Account` and `VerificationToken`.

### Option 3 — Own the session record; use Auth.js for the flow
Use the supported Credentials + JWT transport, but put **nothing in the cookie except an opaque session id**. A `Session` row is the authoritative state, revalidated against the database on every request.

*For:* genuinely database-backed and per-session revocable; no reliance on undocumented behaviour; no unused adapter tables; sliding idle expiry and a hard absolute cap are both enforceable server-side.
*Against:* one database read per session check; a `Session` table must be added; the cookie is nominally a JWT even though it carries no claims.

### Option 4 — Replace Auth.js with a hand-rolled session system
*Against:* rejected immediately. Writing authentication from scratch to satisfy a documentation phrase would trade a small architectural mismatch for a large security risk, and Auth.js is an owner-approved decision.

## Decision

**Option 3.**

The cookie carries an opaque `sid` and nothing else. `sessions` is the authoritative record. Every request revalidates it, and any failure — expired, past its absolute cap, user deactivated, or issued before the user's `sessionsValidFrom` watermark — deletes the row and signs the user out.

A **minimal set of models** is used: `Session` only. `Account` and `VerificationToken` are not created, because there are no OAuth providers and no email flows for them to serve.

## Rationale

The requirement's *purpose* is stated explicitly in the blueprint: revocation must be immediate. Option 3 satisfies that purpose more completely than Option 1, and without the fragility of Option 2.

Checked against what the decision actually asked for:

| Required property | Satisfied | How |
|---|---|---|
| Session state in the database | ✅ | The `sessions` row is authoritative; the cookie is only a pointer |
| Revocable immediately | ✅ | Deleting the row ends the session on the next request |
| Deactivation kills live sessions | ✅ | `isActive` checked on every validation |
| Role change without re-login | ✅ | Role read from the database each request, never from the cookie |
| Individual session revocable | ✅ | Rows are per-session, unlike a global watermark alone |
| 8h idle, 24h absolute | ✅ | Two independent columns; the absolute cap never extends |
| argon2id | ✅ | Unaffected by this decision |

A session cookie has always been a pointer to server-side state. That the transport is nominally a JWT is a detail of the library; it holds no claims, and no authorisation decision is made from its contents.

## Consequences

### Positive
- Revocation is immediate and per-session
- No dependence on undocumented library behaviour, which matters against a beta release
- The schema stays at 18 domain entities plus one clearly-labelled infrastructure table
- Session lifetime rules are enforced in one place and are directly testable

### Negative
- **One database read per session check.** Acceptable: it happens only on `/admin`, which is dynamic and uncached in any case, and the read is a single indexed lookup
- A `Session` table exists that the entity count does not mention, so it must be documented wherever the count is (done)
- The idle expiry slides via a write, throttled to at most one per 5 minutes per session to avoid a write per page view

### Risks
- **Session validation is now project code, so a bug in it is a security bug.** Mitigated by keeping it small, in one file, with the Phase 9 security tests asserting: expired session rejected, absolute cap enforced, deactivated user rejected, revoked session rejected, and role change reflected without re-login
- A future upgrade to a stable `next-auth` 5 release may add proper Credentials + database support. Revisit then — but only with evidence, since this works

## Note on the entity count

[17_DATABASE_SCHEMA](../../BLUEPRINT/17_DATABASE_SCHEMA.md) specifies **exactly 18 entities**, and the owner instruction is "do NOT silently add entities."

`Session` is added **not silently**: it is recorded here, commented as infrastructure in `schema.prisma`, and noted in [52_IMPLEMENTATION_FACTS](../../BLUEPRINT/52_IMPLEMENTATION_FACTS.md). It is not a new domain concept — it is the storage the approved "database-backed sessions" decision requires. The 18 **domain** entities are unchanged, and no domain entity was added, removed or merged.

## Related

- [ADR-0004](ADR-0004-AUTH.md) · [19_AUTHORIZATION_AND_ROLES](../../BLUEPRINT/19_AUTHORIZATION_AND_ROLES.md) · [17_DATABASE_SCHEMA](../../BLUEPRINT/17_DATABASE_SCHEMA.md) · [28_SECURITY](../../BLUEPRINT/28_SECURITY.md)
- Implementation: `lib/auth/sessionStore.ts`, `lib/auth/auth.ts`, `lib/auth/guards.ts`
