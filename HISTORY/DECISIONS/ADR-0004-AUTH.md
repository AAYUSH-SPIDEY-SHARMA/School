# ADR-0004 — Authentication

## Status
**Accepted** — owner-approved 2026-08-16 (D-B6)

> Both the requirement **and** the library are now approved. The security requirements remain non-negotiable regardless of any future library change. Google Workspace SSO is explicitly **not** v1.

## Date
2026-08-16

## Context

The site has **no public user accounts**. Admissions are enquiry-only ([49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md) D-A2), so parents never register, never log in, and never recover a password.

Authentication exists solely for a handful of school staff — realistically between three and ten people — accessing `/admin` under three roles: `SUPER_ADMIN`, `EDITOR`, `ADMISSIONS_MANAGER`.

The admin holds enquiry records containing personal data about parents and, optionally, minors. This is the most sensitive data in the system.

## Problem

Provide secure staff authentication and role authorisation without introducing per-user cost, an external dependency, or a public-account attack surface the project does not need.

## Options

### Option 1 — Auth.js (NextAuth v5)
Mature, framework-native, supports credentials-based login, database-backed sessions, and role data on the session object.

**Against:** credentials login means **we own password hashing** — the library deliberately does not do it, because it is security-sensitive. There is also a known integration hazard: importing the full auth configuration into `proxy.ts` pulls the database adapter and its Node-only APIs into the request-interception boundary.

### Option 2 — Clerk / Auth0
Managed, high-quality, handles hashing, MFA, and recovery flows properly.

**Against:** per-user pricing for what may be five accounts, an external dependency in the login path for an internal tool, and user data held by a third party. The capability substantially exceeds the need.

### Option 3 — Supabase Auth
Free if Supabase is chosen as the database provider.

**Against:** couples authentication to a database vendor decision that is itself still open (OD-008), and Neon is currently the recommendation — which would leave Supabase in the stack solely for auth.

### Option 4 — Hand-rolled
Full control, no dependency.

**Against:** session management, timing-safe comparison, secure cookie handling, and enumeration resistance are all easy to get subtly wrong, and the failure mode is a breach of parent data. **This is not a place to be original.**

### Option 5 — SSO via Google Workspace
Many schools already run Workspace. Would eliminate password handling entirely.

**Against:** unknown whether this school uses Workspace. Recorded as a `FUTURE` option worth revisiting — if the school does run Workspace, this would likely be a net security improvement over credentials.

## Decision

**The requirement is locked. The library is not.**

**Requirement** (`USER_REQUIREMENT`-equivalent, non-negotiable):
- Admin-only authentication; **no public user accounts**
- Secure, revocable session management
- Role-based authorisation enforced server-side on every action
- Password hashing with a modern memory-hard algorithm

**Recommendation** (`ARCHITECTURAL_RECOMMENDATION`): **Auth.js 5.x**, verified against current documentation at implementation.

Separating these matters. The requirement constrains the security posture; the library is an implementation detail that can change without any architectural consequence.

## Rationale

Option 2 loses on proportionality — paying per user and adding an external dependency for five staff accounts is disproportionate. Option 4 loses on risk. Option 3 loses because it would drag a vendor decision.

Auth.js is a reasonable default: framework-native, no per-user cost, database sessions that can be revoked immediately when a staff member leaves, and role data available where authorisation happens.

**The two things that actually determine security here are not the library:**
1. Password hashing with argon2id, which we implement
2. Server-side role checks in every Server Action — because **Server Actions are directly invocable HTTP endpoints**, and the route guard does not protect them ([19_AUTHORIZATION_AND_ROLES](../../BLUEPRINT/19_AUTHORIZATION_AND_ROLES.md))

## Consequences

### Positive
- No per-user cost
- Database sessions revocable immediately on deactivation — a departing staff member loses access at once
- No public accounts means no registration, no password reset by email, no account-recovery attack surface
- Role data available at the authorisation point

### Negative
- **We own password hashing.** Must be argon2id; never a fast hash
- **Config must be split** — `auth.config.ts` (adapter-free) for `proxy.ts`, `auth.ts` (full) for actions and pages. Getting this wrong fails confusingly
- Admin-initiated password reset is a small ongoing burden for `SUPER_ADMIN`

### Risks
- **Credential compromise** → argon2id, rate limiting with progressive delay, database sessions, audit logging, least privilege
- **Enumeration** → identical error message *and timing* for unknown email and wrong password
- **Privilege escalation** → per-action authorisation, tested by direct invocation of every action with every role — the highest-value security test in the project ([31_TESTING_STRATEGY](../../BLUEPRINT/31_TESTING_STRATEGY.md))

## Implementation notes

| Control | Decision |
|---|---|
| Hashing | argon2id |
| Sessions | Database-backed |
| Cookies | `httpOnly`, `secure`, `sameSite=lax` |
| Lifetime | 8h idle, 24h absolute |
| Rate limit | 5 attempts / IP / 15 min, progressive delay |
| Password policy | ≥12 characters, breach-checked, **no forced rotation** |
| Reset | `SUPER_ADMIN`-initiated in v1 |
| 2FA | `FUTURE` (NFR-054) |

No forced rotation because mandatory rotation is well established to produce weaker, patterned passwords. Length and breach-checking are more effective.

## Related

- [19_AUTHORIZATION_AND_ROLES](../../BLUEPRINT/19_AUTHORIZATION_AND_ROLES.md) · [15_BACKEND_ARCHITECTURE](../../BLUEPRINT/15_BACKEND_ARCHITECTURE.md) · [28_SECURITY](../../BLUEPRINT/28_SECURITY.md)
- Decisions D-B6 and D-C1 in [49_DECISION_REGISTER](../../BLUEPRINT/49_DECISION_REGISTER.md)
