# Verification scripts

Runnable checks against a **live dev server and a real database**. They exist
because the blueprint draws a hard line between *documented* and *verified*
(99_CLAUDE_WORKING_RULES rule 13), and security claims are exactly where that
distinction matters most.

These are not a substitute for the Phase 9 test suite. They are the scripts used
to confirm specific architectural claims actually hold in running code, kept in
the repository so anyone can re-run them rather than taking the claim on trust.

## Running

```bash
# 1. database up
docker start school-pg

# 2. dev server up
npm run dev

# 3. in another terminal
node tests/verification/auth-flow.mjs
node tests/verification/session-revocation.mjs
```

Both exit non-zero if any check fails.

## What each one proves

### `auth-flow.mjs`

| Check | Why it matters |
|---|---|
| CSRF token issued | The sign-in endpoint is not open to cross-site POSTs |
| Wrong password rejected | argon2 verification actually runs |
| Signed-out `/admin` redirects | The route gate works |
| Correct password accepted | The full credentials path works against a real DB |
| Session cookie issued | A session was genuinely created |
| `/admin` renders when signed in | The protected layout resolves the session |
| Admin-only pages reachable by `SUPER_ADMIN` | The role gate permits as well as denies |
| Session carries the right account and role | The role is read from the database, not the cookie |

### `session-revocation.mjs`

Verifies the central claim of [ADR-0011](../../HISTORY/DECISIONS/ADR-0011-SESSION-STORAGE-MECHANISM.md):
sessions are **database-backed and revocable immediately**.

| Check | Why it matters |
|---|---|
| Session exists as a row in `sessions` | It is real server-side state, not just a signed token |
| `absoluteExpiry > expires` | The 24h absolute cap is distinct from the 8h idle window |
| Deleting the row revokes access **on the next request** | This is the whole reason database sessions were chosen over stateless tokens — a departing staff member loses access at once, not whenever a token expires |

The revocation check deliberately keeps sending the **same cookie** after the
row is deleted. If access continued, the session would be a stateless token
wearing a database's clothes, and the approved requirement would not be met.

> ⚠️ `session-revocation.mjs` **deletes all rows from `sessions`**. It is for a
> local development database only. It signs out every active session.
