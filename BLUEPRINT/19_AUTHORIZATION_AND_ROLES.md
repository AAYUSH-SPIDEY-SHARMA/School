# 19 — Authorization and Roles

| Field | Value |
|---|---|
| **Status** | PROPOSED |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Security / Backend Lead |
| **Dependencies** | [15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md) · [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) |
| **Related Documents** | [20_ADMIN_CMS](20_ADMIN_CMS.md) · [28_SECURITY](28_SECURITY.md) · [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md) |

---

## Three roles

| Role | Held by | Purpose |
|---|---|---|
| `SUPER_ADMIN` | Principal, website administrator | Full control, including users and settings |
| `EDITOR` | Teachers, coordinators | Create and publish content |
| `ADMISSIONS_MANAGER` | Admissions staff | Work enquiries; **no content rights** |

### Why three and not six

A six-role model (Super Admin, Administrator, Content Editor, Admissions Manager, Faculty Manager, Media Manager) was considered and rejected.

A single-campus school has a handful of staff touching the website. Splitting Faculty Manager and Media Manager from Editor would mean one person holding three roles, which delivers no isolation while adding a permission matrix nobody can hold in their head. **Roles that do not correspond to actual distinct jobs are administrative overhead disguised as security.**

The one split that *is* real: **content editing and enquiry access are genuinely different jobs with genuinely different sensitivity.** Enquiries contain personal data about parents and minors; a teacher publishing a sports report has no reason to see them. That boundary is enforced, and it is the only one that earns its complexity.

Revisit only if the school demonstrates a real separation of duties — via an ADR.

---

## Permissions matrix

✅ full · ⚠️ conditional · ❌ none

| Resource / Action | `SUPER_ADMIN` | `EDITOR` | `ADMISSIONS_MANAGER` |
|---|---|---|---|
| **News** create / edit / publish / delete | ✅ | ✅ | ❌ |
| **Events** create / edit / publish / delete | ✅ | ✅ | ❌ |
| **Notices** create / edit / publish / expire / delete | ✅ | ✅ | ❌ |
| **Downloads** create / edit / delete | ✅ | ✅ | ❌ |
| **Gallery** albums and images | ✅ | ✅ | ❌ |
| **Faculty** create / edit / delete | ✅ | ✅ | ❌ |
| **Achievements** create / edit / delete | ✅ | ✅ | ❌ |
| **Testimonials** create / edit / delete | ✅ | ✅ | ❌ |
| **Facilities** create / edit / delete *(via Settings)* | ✅ | ❌ | ❌ |
| **Media** upload / edit alt text | ✅ | ✅ | ❌ |
| **Media** delete | ✅ | ⚠️ own uploads | ❌ |
| **Enquiries** view list | ✅ | ❌ | ✅ |
| **Enquiries** view detail (PII) | ✅ | ❌ | ✅ |
| **Enquiries** change status / assign / note | ✅ | ❌ | ✅ |
| **Enquiries** export | ✅ | ❌ | ⚠️ logged |
| **Enquiries** delete | ✅ | ❌ | ❌ |
| **Site settings** — contact, stats, SEO | ✅ | ❌ | ❌ |
| **Admissions cycle status** | ✅ | ⚠️ see note | ✅ |
| **Users** create / edit / deactivate | ✅ | ❌ | ❌ |
| **Role assignment** | ✅ | ❌ | ❌ |
| **Audit log** view | ✅ | ❌ | ❌ |
| **Dashboard** | ✅ full | ⚠️ content only | ⚠️ enquiries only |

### Conditional notes

**Media delete — `EDITOR` limited to own uploads.** Prevents one editor removing another's in-use image. Deletion is soft first, so recovery does not require a database restore.

**Admissions cycle status.** The open/closed state on `/admissions` is the highest-staleness-risk content on the site (J5) — an out-of-date admission window actively misleads parents. `ADMISSIONS_MANAGER` can change it because they are the people who actually know. `EDITOR` cannot, because it is a business statement rather than editorial content.

**Enquiry export — logged.** Exporting bulk PII to a spreadsheet moves personal data outside the system's protections. Permitted because admissions staff genuinely need it, but every export writes an audit entry.

**Enquiry deletion — `SUPER_ADMIN` only.** Deletion is a privacy operation (a data-subject request or retention expiry), not routine cleanup.

**Facilities — `SUPER_ADMIN` only, administered through Settings.** Facilities are a Settings sub-resource rather than a standalone module (D-B23): roughly a dozen records changed about once a year does not justify a full CRUD module. Because the only editing route is `/admin/settings`, which is `SUPER_ADMIN`-restricted, granting `EDITOR` Facility rights would create a permission with no route to exercise it.

> **Corrected 2026-08-16.** An earlier version of this matrix granted `EDITOR` Facility create/edit/delete while the only editing surface was `SUPER_ADMIN`-only Settings — an editor holding a permission they could not use. Resolved by owner decision D-B23 (Option A). See [CHANGE-0009](../HISTORY/2026/08/CHANGE-0009-ARCHITECTURE-APPROVAL.md).

---

## Enforcement — defence in depth

Four layers. **Only layer 3 is the security boundary.**

```
Layer 1  UI            Hide what the user cannot do          UX only — NOT security
Layer 2  proxy.ts      Session presence on /admin/*          Convenience — NOT security
Layer 3  Server Action Role check on every mutation          ← THE boundary
Layer 4  Query layer   Scope data to what the role may see   Defence in depth
```

### Why layers 1 and 2 are not security

**Layer 1** runs on the client. It can be bypassed by anyone with browser devtools. Hiding a delete button is courtesy, not protection.

**Layer 2** checks only that *a* session exists — not which role it holds. More importantly, `proxy.ts` gates *routes*, while Server Actions are **directly invocable HTTP endpoints** that do not require the user to have visited the corresponding page at all. An attacker with a valid `ADMISSIONS_MANAGER` session could invoke `deleteNews` directly if only the route were protected.

**This is the single most important authorisation fact in the system**, and it is why every action re-checks (AR-003).

### Layer 3 — the contract

```ts
export async function deleteNews(id: string) {
  const session = await requireSession();              // 401 if absent
  requireRole(session, ['EDITOR', 'SUPER_ADMIN']);     // 403 if wrong role
  // …only now touch data
}
```

No Server Action reaches data access without both calls. Enforced by code review and by test — see below.

### Layer 4 — query scoping
Public queries filter to `PUBLISHED` and `deletedAt: null` **in the query**, so unpublished content never enters a response even in a hidden element. Enquiry queries are only reachable from authorised actions.

---

## Session management

| Property | Decision |
|---|---|
| Storage | Database-backed — **revocable immediately** on deactivation |
| Cookie | `httpOnly`, `secure`, `sameSite=lax` |
| Idle timeout | 8 hours |
| Absolute lifetime | 24 hours |
| On deactivation | Existing sessions invalidated at once |
| On role change | Session refreshed so the new role takes effect immediately |

Database sessions are chosen over stateless tokens specifically so that deactivating a departing staff member takes effect instantly rather than whenever their token happens to expire.

---

## Account lifecycle

```
SUPER_ADMIN creates account (role assigned at creation)
        ↓
User signs in, changes initial password
        ↓
Active — role may be changed by SUPER_ADMIN (audited)
        ↓
Deactivated (isActive = false) — sessions killed immediately
        ↓
Account retained, never deleted — preserves audit history
```

**Accounts are deactivated, never deleted.** Deleting a user would orphan their audit trail, which defeats the purpose of having one.

**Password reset** is `SUPER_ADMIN`-initiated in v1. Self-service reset is `FUTURE` — it introduces an email-based account-recovery flow, which is a meaningful attack surface for a handful of accounts.

---

## Least privilege in practice

| Principle | Applied |
|---|---|
| Default role is the least powerful | New accounts are `EDITOR` |
| PII access is separated from content access | `EDITOR` cannot see any enquiry |
| Destructive operations are narrowed | Enquiry deletion is `SUPER_ADMIN` only |
| Privilege changes are audited | Role changes write an `AuditLog` entry |
| No shared accounts | Every action must attribute to a person, or the audit log is worthless |
| No permanent elevation | If an editor needs settings access, that is a role change — audited — not an informal exception |

> **No shared accounts** is the rule most likely to be broken in practice at a school ("just use the office login"). It should be stated explicitly to staff during handover, because a shared account silently destroys accountability for every other control here.

---

## Authorisation failures

| Situation | Response | Logged |
|---|---|---|
| No session on `/admin/*` | Redirect to login | No |
| Wrong role on a page | 403 page | **Yes** |
| Wrong role on a Server Action | Generic denial | **Yes — security event** |
| Deactivated user with a live session | Signed out immediately | Yes |
| Repeated failures from one account | Alert | Yes |

Denials are generic and never reveal whether the resource exists. Repeated 403s from a single account are logged because they indicate either a permissions bug or an account behaving unexpectedly — both worth knowing.

---

## Testing obligations

Authorisation is exactly the kind of thing that looks correct and is not. Required coverage ([31_TESTING_STRATEGY](31_TESTING_STRATEGY.md)):

1. **Every Server Action is invoked with each role** and asserted to permit or deny correctly — including direct invocation without visiting the corresponding page
2. `EDITOR` **cannot** read any enquiry, by any route
3. `ADMISSIONS_MANAGER` **cannot** create, edit, or delete content
4. Unauthenticated invocation of every action fails
5. A deactivated user's existing session stops working
6. A role change takes effect without re-login
7. Unpublished content is absent from public query responses, not merely hidden

Test 1 is the highest-value security test in the project, because it directly tests the boundary that the proxy layer does *not* provide.

---

## Future considerations

| Item | Status | Trigger |
|---|---|---|
| Two-factor authentication | `FUTURE` (NFR-054) | Before a wider staff rollout |
| Self-service password reset | `FUTURE` | If admin-initiated reset becomes a burden |
| Granular per-module permissions | `NOT_RECOMMENDED` | Only on a demonstrated separation of duties |
| Review-before-publish workflow | `OPEN_DECISION` | Depends on how many staff hold `EDITOR` — see [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md) |
| SSO / Google Workspace | `FUTURE` | If the school already runs Workspace, this could replace credentials entirely and would be a net security improvement |
