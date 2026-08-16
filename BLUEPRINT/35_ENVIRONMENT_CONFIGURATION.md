# 35 — Environment Configuration

| Field | Value |
|---|---|
| **Status** | PROPOSED — no environments exist |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | DevOps |
| **Dependencies** | [12_TECH_STACK](12_TECH_STACK.md) · [30_DEPLOYMENT](30_DEPLOYMENT.md) |
| **Related Documents** | [28_SECURITY](28_SECURITY.md) · [34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md) |

---

## Environments

| Environment | Database | Media | Email | Analytics | Indexed |
|---|---|---|---|---|---|
| Development | Local or dev branch | Provider dev folder | **Console only** | Disabled | n/a |
| Preview (per PR) | Branch per PR | Dev folder | Console or test inbox | Disabled | **No** |
| Staging | Separate database | Staging folder | Test inbox | Disabled | **No** |
| Production | Production database | Production folder | Live | Enabled | Yes |

> **Email in non-production must never reach real addresses.** A test enquiry that emails the actual school office wastes staff time and erodes trust in the notification channel. Development logs to console; staging uses a catch-all test inbox.

---

## Variables

### Core

| Variable | Purpose | Secret |
|---|---|---|
| `NODE_ENV` | Runtime mode | No |
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL — used for canonicals, sitemap, OG images | No |
| `APP_ENV` | `development` / `preview` / `staging` / `production` | No |

`APP_ENV` is distinct from `NODE_ENV` because staging runs a production build but must behave differently — `noindex`, analytics disabled, test email.

### Database

| Variable | Purpose | Secret |
|---|---|---|
| `DATABASE_URL` | **Pooled** connection — application runtime | **Yes** |
| `DIRECT_URL` | **Unpooled** connection — migrations only | **Yes** |

> Two connection strings are mandatory. Serverless functions exhaust connection limits without pooling; migration tooling requires session-level features the pooler does not support ([16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md)). Using the pooled URL for migrations fails in confusing ways.

### Authentication

| Variable | Purpose | Secret |
|---|---|---|
| `AUTH_SECRET` | Session encryption/signing | **Yes** |
| `AUTH_URL` | Canonical auth base URL | No |

`AUTH_SECRET` must be a cryptographically random value, **different in every environment**. A shared secret means a staging session is valid in production.

### Media

| Variable | Purpose | Secret |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | Account identifier | No |
| `CLOUDINARY_API_KEY` | API access | **Yes** |
| `CLOUDINARY_API_SECRET` | Signing uploads | **Yes** |
| `CLOUDINARY_FOLDER` | Environment isolation | No |

`CLOUDINARY_FOLDER` prevents staging uploads polluting the production media library.

### Email

| Variable | Purpose | Secret |
|---|---|---|
| `EMAIL_API_KEY` | Provider access | **Yes** |
| `EMAIL_FROM` | Verified sender address | No |
| `SCHOOL_NOTIFICATION_EMAIL` | Where enquiry notifications go | No |
| `EMAIL_DRY_RUN` | Log instead of send (non-production) | No |

### Observability

| Variable | Purpose | Secret |
|---|---|---|
| `SENTRY_DSN` *(or equivalent)* | Error reporting endpoint | No |
| `SENTRY_AUTH_TOKEN` | Source map upload | **Yes** |
| `ANALYTICS_ENABLED` | Toggle | No |

### Operational

| Variable | Purpose | Secret |
|---|---|---|
| `REVALIDATE_SECRET` | Guards the manual revalidation endpoint | **Yes** |
| `RATE_LIMIT_ENABLED` | Disabled in tests only | No |

### Seeding — development only

| Variable | Purpose | Secret |
|---|---|---|
| `SEED_ADMIN_EMAIL` | Initial admin account | No |
| `SEED_ADMIN_PASSWORD` | Initial admin password | **Yes** |

⚠️ Never set in production. The production `SUPER_ADMIN` is created through a deliberate one-time process, and its password is changed on first login.

---

## `.env.example`

Committed to the repository. **Contains variable names and explanatory comments only.**

```bash
# ── Core ────────────────────────────────────────
NODE_ENV=
APP_ENV=
NEXT_PUBLIC_SITE_URL=

# ── Database ────────────────────────────────────
# DATABASE_URL must be the POOLED connection string
# DIRECT_URL must be the UNPOOLED string (migrations only)
DATABASE_URL=
DIRECT_URL=

# ── Auth ────────────────────────────────────────
# Generate a cryptographically random value. Unique per environment.
AUTH_SECRET=
AUTH_URL=

# ── Media ───────────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=

# ── Email ───────────────────────────────────────
EMAIL_API_KEY=
EMAIL_FROM=
SCHOOL_NOTIFICATION_EMAIL=
EMAIL_DRY_RUN=

# ── Observability ───────────────────────────────
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
ANALYTICS_ENABLED=

# ── Operational ─────────────────────────────────
REVALIDATE_SECRET=
RATE_LIMIT_ENABLED=

# ── Seeding (development only) ──────────────────
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

> ⚠️ **All values are empty. No placeholder that looks like a real value.**
>
> A realistic-looking example (`AUTH_SECRET=abc123def456`) is a genuine hazard: someone will eventually copy it into a real environment, and a predictable session secret is a critical vulnerability. Names and comments only.

---

## Secret handling

| Rule | Detail |
|---|---|
| `.env` git-ignored | **In the first commit.** A secret committed once lives in git history forever |
| Storage | Platform environment variables — never in code, never in a shared document |
| Separation | Different values per environment. Never reuse production secrets anywhere |
| Rotation | On staff departure, suspected exposure, or provider compromise |
| Access | Only those who need it |
| **Never logged** | Not even at debug level ([33_MONITORING_AND_LOGGING](33_MONITORING_AND_LOGGING.md)) |
| Scanning | Automated secret detection in CI |

### Secrets recovery record
A separate, securely stored document listing every required variable and **where to obtain its value** (which provider dashboard, which account). Not the values themselves.

Required before launch. Without it, disaster recovery stalls at "we can restore the database but nobody knows what the email API key was" ([34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md)).

---

## Validation at startup

The application validates its environment on boot with a Zod schema and **fails fast with a clear message** if a required variable is missing or malformed.

Silent misconfiguration is worse than a crash. A missing `EMAIL_API_KEY` that only manifests when the first parent submits an enquiry is exactly the invisible failure this project is most concerned about (NFR-063).

Validation distinguishes required-everywhere variables from environment-specific ones, and refuses to start production with development-only variables such as `SEED_ADMIN_PASSWORD` set.

---

## Local development setup

1. Clone the repository
2. `cp .env.example .env.local`
3. Provision a local Postgres database or a provider dev branch
4. Fill in `DATABASE_URL` and `DIRECT_URL`
5. Generate `AUTH_SECRET`
6. Set `EMAIL_DRY_RUN=true` — **never send real email from a laptop**
7. Install dependencies
8. Run migrations
9. Seed
10. Start the development server

Setup should take under fifteen minutes for someone new. If it does not, the friction becomes a barrier to the project ever being maintained by anyone else.

---

## Configuration precedence

```
Platform environment variables   (production, staging, preview)
        ↓ overridden locally by
.env.local                        (never committed)
        ↓ falls back to
.env.example                      (names only — never provides values)
```

Client-exposed variables are prefixed `NEXT_PUBLIC_`. **Any variable with that prefix is public**, visible in the browser bundle — a secret must never carry it.

---

## Pre-launch checklist

- [ ] Every production variable set and verified
- [ ] `AUTH_SECRET` unique to production and cryptographically random
- [ ] `DATABASE_URL` pooled, `DIRECT_URL` unpooled — both confirmed correct
- [ ] `NEXT_PUBLIC_SITE_URL` matches the live domain exactly
- [ ] Email sending verified with a real test enquiry
- [ ] `SEED_ADMIN_PASSWORD` **not** set in production
- [ ] No secrets in git history — scanned, not assumed
- [ ] `.env.example` contains names only
- [ ] Secrets recovery record written and stored
- [ ] Startup validation confirmed to fail on a missing variable
