# 52 — Implementation Facts

| Field | Value |
|---|---|
| **Status** | ACTIVE — implementation in progress |
| **Blueprint Version** | 0.3.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect |
| **Dependencies** | [49_DECISION_REGISTER](49_DECISION_REGISTER.md) |
| **Related Documents** | [43_CURRENT_STATUS](43_CURRENT_STATUS.md) · [12_TECH_STACK](12_TECH_STACK.md) |

---

## What this document is

The register of **`IMPLEMENTATION_FACT`** entries — things that are *verifiably true of code, config, database or deployment that actually exists*.

The distinction from [49_DECISION_REGISTER](49_DECISION_REGISTER.md) is strict and deliberate:

| Register | Records |
|---|---|
| 49 — Decision Register | "Build it this way" — approved intent |
| **52 — this document** | "This is true of what exists" — verified reality |

> "Cloudinary selected" is a decision. "Cloudinary SDK 2.10.0 installed" is a fact. "Homepage planned" is neither — it is a status.
>
> Nothing enters this document until it exists and has been observed.

---

## IF-001 — Runtime and tooling

**Verified 2026-08-16** by direct invocation.

| Item | Version | How verified |
|---|---|---|
| Node.js | **22.22.2** | `node --version` |
| npm | **10.9.7** | `npm --version` |
| git | **2.52.0.windows.1** | `git --version` |

Node 22 satisfies the Next.js 16 requirement of Node 20.9+. `engines.node` in `package.json` is set to `>=20.9.0`.

---

## IF-002 — Installed dependency versions

**Verified 2026-08-16** — versions resolved from the npm registry at install time, then read back from `package.json`. Not copied from any blueprint document ([99_CLAUDE_WORKING_RULES](99_CLAUDE_WORKING_RULES.md) rule 19).

### Runtime

| Package | Installed |
|---|---|
| `next` | 16.3.1 |
| `react` / `react-dom` | 19.2.8 |
| `@prisma/client` | 7.9.1 |
| `@prisma/adapter-neon` | 7.9.1 |
| `@neondatabase/serverless` | 1.1.0 |
| `next-auth` | 5.0.0-beta.32 |
| `@auth/prisma-adapter` | 2.11.3 |
| `@node-rs/argon2` | 2.1.0 |
| `zod` | 4.4.3 |
| `react-hook-form` | 7.85.0 |
| `@hookform/resolvers` | 5.9.0 |
| `cloudinary` | 2.10.0 |
| `next-cloudinary` | 6.18.8 |
| `lucide-react` | 1.31.0 |
| `clsx` | 2.1.1 · `tailwind-merge` 3.6.0 · `class-variance-authority` 0.7.1 |
| `date-fns` | 4.4.0 |
| Radix primitives | slot, dialog, dropdown-menu, accordion, label, select, checkbox, tabs, alert-dialog, popover, visually-hidden |

### Development

| Package | Installed |
|---|---|
| `typescript` | **6.0.3** — see IF-004 |
| `prisma` | 7.9.1 |
| `tailwindcss` / `@tailwindcss/postcss` | 4.3.3 |
| `eslint` | **9.39.5** — see IF-004 |
| `eslint-config-next` | 16.3.1 |
| `vitest` | 4.1.10 |
| `@playwright/test` | 1.62.1 |
| `prettier` | 3.9.6 |
| `tsx` | 4.23.12 |

---

## IF-003 — Prisma 7 moved connection URLs out of the schema

**Verified 2026-08-16** — `prisma validate` failed with error **P1012** until corrected.

In the Prisma 7 line, `url` and `directUrl` are **no longer valid `datasource` properties**. Connection configuration moved to `prisma.config.ts`, and runtime connections are supplied by a driver adapter.

```
DIRECT_URL    (unpooled)  → migrations   via prisma.config.ts `datasource.url`
DATABASE_URL  (pooled)    → runtime      via `new PrismaClient({ adapter })`
```

The two-connection split required by [16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md) is therefore **preserved, but expressed differently** from how any pre-Prisma-7 document would describe it.

`prisma validate` passes. `prisma generate` produces a client (v7.9.1). The `prisma-client-js` generator still functions in Prisma 7.

> This is precisely the failure mode [CHANGE-0006](../HISTORY/2026/08/CHANGE-0006-PRISMA-VERSION-CORRECTION.md) anticipated: config copied from an older generation would not merely be suboptimal, it would not load.

---

## IF-004 — Two dependency ceilings imposed by tooling, not by preference

**Verified 2026-08-16** by running the gates and reading peer ranges.

Rule 19 says to install the *latest stable* version. In two cases the latest stable version **breaks a required quality gate**, so the newest *working* version was installed instead. Both are recorded here because a future session will otherwise "helpfully" upgrade them and break lint.

### TypeScript pinned below 7.0

| | |
|---|---|
| Latest stable | 7.0.2 |
| **Installed** | **6.0.3** |
| Reason | `typescript-eslint` declares `peerDependencies.typescript: ">=4.8.4 <6.1.0"`. With TypeScript 7 installed, ESLint aborts: *"typescript-eslint does not support TS 7.0."* |
| Evidence | Upstream tracking issue `typescript-eslint#10940` targets TS ≥ 7.1 |
| Consequence | Lint — a mandatory gate — cannot run at all on TS 7 |
| Revisit when | `typescript-eslint` ships TS 7 support |

TypeScript 7.0.2 was installed first and **`tsc --noEmit` passed cleanly** on this codebase. The blocker is the lint toolchain, not the compiler.

### ESLint pinned below 10

| | |
|---|---|
| Latest stable | 10.8.1 |
| **Installed** | **9.39.5** |
| Reason | `eslint-plugin-react` (a transitive dependency of `eslint-config-next` 16.3.1) calls a context API removed in ESLint 10 — `TypeError: contextOrFilename.getFilename is not a function` |
| Consequence | Every file fails to lint |
| Revisit when | `eslint-config-next` ships an ESLint 10-compatible `eslint-plugin-react` |

> Neither is a stale pin carried over from an old document — the exact failure was reproduced, and the ceiling is set by what the ecosystem currently supports. That distinction matters, because rule 19 exists to stop *unexamined* pinning, not to mandate versions that do not work.

---

## IF-005 — Next.js 16 removed the `eslint` key from `next.config.ts`

**Verified 2026-08-16** — `tsc --noEmit` reported `TS2353: 'eslint' does not exist in type 'NextConfig'`.

Built-in lint integration was removed from the build in the Next.js 16 line. Linting is now a separate gate, run by `npm run lint` and `npm run verify`. `typescript.ignoreBuildErrors: false` remains valid, so **type errors still fail the production build**.

---

## IF-006 — Cache Components APIs match ADR-0010 exactly

**Verified 2026-08-16** by reading `node_modules/next/cache.d.ts`.

`next/cache` exports, in the installed version:

```
revalidateTag · updateTag · refresh · revalidatePath · cacheTag · cacheLife · connection
```

The read/write split specified in [ADR-0010](../HISTORY/DECISIONS/ADR-0010-RENDERING-CACHING.md) is therefore implementable as written: `revalidateTag` on the public read path, **`updateTag` for read-your-writes** on the admin write path.

`cacheComponents: true` is enabled in `next.config.ts`, which is what makes those APIs available.

### Consequence found in practice

Cache Components rejects unstable values during prerender. The first build failed on `new Date().getFullYear()` in the footer:

> `Error: Route "/": Next.js encountered the unstable value 'new Date()' while prerendering.`

This is the framework enforcing the caching architecture rather than a defect. Resolved by isolating the value into a `'use cache'` component with a `days` profile (`components/layout/CopyrightYear.tsx`), which keeps every page prerenderable while the year still rolls over — rather than hard-coding a year, which is how reference sites end up displaying 2018 in 2026 (F-3).

---

## IF-007 — Phase 1 foundation exists and all gates pass

**Verified 2026-08-16.**

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | ✅ clean |
| Lint | `npx eslint .` | ✅ clean |
| Production build | `npx next build` | ✅ succeeded |
| Prisma schema | `npx prisma validate` | ✅ valid |
| Prisma client | `npx prisma generate` | ✅ generated (v7.9.1) |

Build output:

```
▲ Next.js 16.3.1 (Turbopack)
- Cache Components enabled
✓ Compiled successfully
Route (app)      Revalidate  Expire
┌ ○ /                    1d      1w
└ ○ /_not-found
○  (Static)  prerendered as static content
```

### Created in Phase 1

`package.json` · `tsconfig.json` · `next.config.ts` · `prisma.config.ts` · `prisma/schema.prisma` · `eslint.config.mjs` · `postcss.config.mjs` · `.prettierrc.json` · `.gitignore` · `.gitattributes` · `.env.example`
`app/layout.tsx` · `app/globals.css` · `app/(public)/layout.tsx` · `app/(public)/page.tsx`
`components/layout/` — SiteHeader, SiteFooter, PrimaryNav, MobileNav, CopyrightYear
`components/ui/` — Button, PlaceholderText
`lib/` — `env.ts`, `db/prisma.ts`, `utils/cn.ts`, `constants/classLevels.ts`, `constants/site.ts`

### Not yet true

- **No database exists.** No migration has been run. `.env` holds placeholder connection strings so tooling loads; they are not working credentials
- No authentication, no admin, no queries, no actions, no tests
- The 18 entities are *specified in `schema.prisma` and validated*, but **no table has been created**

---

## IF-008 — Git repository and remote

**Verified 2026-08-16.**

| Item | Value |
|---|---|
| Repository | initialised at project root, branch `main` |
| Remote | `https://github.com/AAYUSH-SPIDEY-SHARMA/School.git` |
| Baseline commit | blueprint + history, `.gitignore` present in the **first** commit |
| `.env` ignored | ✅ confirmed via `git check-ignore -v .env` |

`.gitignore` preceding any commit is not a formality: a secret committed once remains in git history permanently, and removing it requires rewriting history.

---

## IF-009 — Database exists, migrations applied, invariants verified

**Verified 2026-08-17** against **PostgreSQL 17** (local container; production Neon project not yet created).

Two migrations applied cleanly: `20260816000000_init` and `20260816000100_invariants`.

| Verified by execution | Result |
|---|---|
| 18 domain tables + `sessions` present | ✅ 20 tables incl. `_prisma_migrations` |
| `ClassLevel` enum values | ✅ exactly 13 — `NURSERY` … `CLASS_10`, **no CLASS_11/12** |
| `UPDATE` on `audit_logs` | ✅ **rejected by trigger** |
| `DELETE` on `audit_logs` | ✅ **rejected by trigger** |
| Event `endDate < startDate` | ✅ rejected by CHECK |
| `PUBLISHED` news with NULL `publishedAt` | ✅ rejected by CHECK |
| `Admin@X` vs `admin@x` uniqueness | ✅ rejected — citext works |
| CHECK constraints / triggers | ✅ 15 / 3 |

Seed runs and is idempotent: 26 site settings (**all bracketed placeholders**), 9 CBSE departments, one `SUPER_ADMIN` from environment variables. **No sample articles, faculty, statistics or testimonials were created.**

---

## IF-010 — Authentication verified end to end against a running server

**Verified 2026-08-17** — `tests/verification/auth-flow.mjs`, 12/12 passing.

CSRF handshake · wrong password rejected · signed-out `/admin` redirects (307) · correct password accepted · session cookie issued (`authjs.session-token`) · `/admin` renders when signed in · `SUPER_ADMIN` reaches `/admin/users`, `/admin/audit-log`, `/admin/enquiries` · session resolves to the seeded account and carries role `SUPER_ADMIN`.

---

## IF-011 — ADR-0011 verified: sessions are database-backed and revocation is immediate

**Verified 2026-08-17** — `tests/verification/session-revocation.mjs`, 6/6 passing.

This is the claim most worth proving rather than asserting, because [ADR-0011](../HISTORY/DECISIONS/ADR-0011-SESSION-STORAGE-MECHANISM.md) resolved a real conflict between two approved requirements.

| Check | Result |
|---|---|
| Session exists as a row in `sessions` | ✅ real server-side state |
| `absoluteExpiry > expires` | ✅ 24h absolute cap distinct from the 8h idle window |
| Deleting the row revokes access **on the very next request**, same cookie still sent | ✅ 307 redirect |
| `/api/auth/session` reports signed out | ✅ no user |

> The test deliberately keeps sending the **same cookie** after deleting the row. If access had continued, the session would have been a stateless token wearing a database's clothes, and the approved "revocable sessions" requirement would not actually be met.

---

## IF-012 — Dev server runs; routes behave as designed

**Verified 2026-08-17** — `next dev`, Next.js 16.3.1 (Turbopack), ready in ~1.1s, Cache Components enabled.

| Route | Response |
|---|---|
| `/` | 200 |
| `/admin/login` | 200 |
| `/admin` (signed out) | **307 → login** |
| `/api/auth/providers` | 200 |

Production build route classification matches the approved caching architecture: `/` static, `/admin/*` dynamic (`ƒ`), `/admin/login` and detail routes partially prerendered (`◐`).

**Next.js agent-rules generation declined** (`agentRules: false`). It writes `AGENTS.md` and `CLAUDE.md` at the repository root; a second, auto-regenerated set of instructions would drift from [99_CLAUDE_WORKING_RULES](99_CLAUDE_WORKING_RULES.md), which is the authoritative guide for future sessions.

---

## Standing rule for this document

An entry is added **only after the thing exists and has been observed** — a command was run, output was read, a file was created. Plans, intentions and approvals do not belong here; they belong in [49_DECISION_REGISTER](49_DECISION_REGISTER.md) and [41_PENDING_WORK](41_PENDING_WORK.md).
