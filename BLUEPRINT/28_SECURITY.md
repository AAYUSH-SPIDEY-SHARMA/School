# 28 — Security

| Field | Value |
|---|---|
| **Status** | PROPOSED — threat model complete, nothing implemented or tested |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Security / Backend Lead |
| **Dependencies** | [15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md) · [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) |
| **Related Documents** | [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md) · [23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md) · [34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md) |

---

## What we are actually protecting

Not a bank. Not a trivial brochure site either. Three things of real value:

1. **Personal data about parents and minors** — enquiry records. The most sensitive asset.
2. **The school's public voice** — a defaced or manipulated school website damages trust with every family at once.
3. **Photographs of children** — governed by [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md).

Controls are proportionate to these, not to an imagined enterprise threat model.

---

## Threat model

| # | Threat | Likelihood | Impact | Primary controls |
|---|---|---|---|---|
| T1 | Enquiry PII exposed | Medium | **High** | Role separation, query scoping, access logging, retention |
| T2 | Admin credential compromise | Medium | **High** | argon2id, rate limiting, DB sessions, audit, least privilege |
| T3 | Malicious file upload | Medium | High | Content-type verification, allow-list, size caps, no SVG |
| T4 | XSS via rich-text content | Medium | High | Sanitisation on render, constrained editor, CSP |
| T5 | Spam flooding the enquiry system | **High** | Low | Honeypot, rate limiting, schema validation |
| T6 | Privilege escalation between roles | Low | **High** | Per-action authorisation, audited role changes |
| T7 | Child imagery misused | Low | **Severe** | Consent basis, EXIF stripping, takedown process |
| T8 | Site defacement | Low | High | Auth controls, audit log, backups |
| T9 | SQL injection | Low | High | Parameterised ORM access exclusively |
| T10 | CSRF | Low | Medium | Framework protections, sameSite cookies |
| T11 | Secrets leaked to source control | Medium | **High** | `.env` never committed, `.env.example` empty, secret scanning |
| T12 | Backup exposure | Low | **High** | Backups contain PII; access-controlled and encrypted |
| T13 | Dependency vulnerability | Medium | Medium | Automated scanning, prompt patching |
| T14 | Enquiry loss (availability) | Medium | **High** | Alerting on failure; phone fallback shown to parent |

**T5 is the most likely. T7 is the most severe. T1 is the most consequential day-to-day.** T14 is included deliberately: losing a parent's enquiry is a real harm even though it involves no attacker.

---

## Authentication

| Control | Decision |
|---|---|
| Scope | **Admin only. No public user accounts exist** — this removes an entire class of risk |
| Hashing | **argon2id**, memory-hard. Never MD5, SHA-*, or any fast hash |
| Sessions | Database-backed — revocable immediately |
| Cookies | `httpOnly`, `secure`, `sameSite=lax` |
| Lifetime | 8h idle, 24h absolute |
| Rate limiting | 5 attempts / IP / 15 min, progressive delay (NFR-047) |
| Enumeration | **Identical message and timing** for unknown email and wrong password |
| Password policy | Minimum 12 characters; checked against known-breached lists; no forced rotation |
| Reset | `SUPER_ADMIN`-initiated in v1 |
| 2FA | `FUTURE` (NFR-054) |

> No forced periodic rotation — it is well established that mandatory rotation drives weaker, patterned passwords. Length and breach-checking are more effective.

---

## Authorisation — the central control

Fully specified in [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md). The single most important fact, repeated because it is the most commonly misunderstood:

> **Server Actions are directly invocable HTTP endpoints.** The route guard in `proxy.ts` does not protect them. Every Server Action must independently authenticate and authorise, or an authenticated low-privilege user can invoke any action directly.

UI hiding is UX. `proxy.ts` is convenience. **The Server Action is the boundary.**

---

## Input handling

| Control | Applied |
|---|---|
| Validation | Zod, server-side, authoritative — client validation is convenience only |
| Length caps | Every string field |
| Normalisation | Trim, lowercase email, strip phone formatting |
| Type coercion | **Rejected** — unexpected input is refused, not coerced |
| Database access | Parameterised via ORM exclusively; **no raw SQL string interpolation** |
| Output encoding | React escapes by default |
| Rich text | Sanitised on render; **`dangerouslySetInnerHTML` requires explicit sanitisation and review** |
| URLs | Validated before use in redirects — prevents open redirect |

---

## File upload — T3

The highest-risk input path in the system.

| Control | Detail |
|---|---|
| Allow-list | JPEG, PNG, WebP, AVIF, PDF. **Nothing else** |
| **SVG rejected** | Can carry executable script — a genuine XSS vector |
| Content verification | Actual file content inspected. **Filename and declared MIME are not evidence** |
| Size limits | 10 MB images, 25 MB documents |
| Storage | External provider, not application filesystem |
| Serving | From the provider's domain, with correct content type |
| **EXIF stripping** | Mandatory — location data in child photographs (NFR-052) |
| Authorisation | `EDITOR`+ only; signed uploads constrain type, size, destination |
| Rate limiting | 20 uploads / user / hour |

---

## Personal data — T1

The most consequential control set, because enquiry records contain data about parents **and minors**.

| Control | Implementation |
|---|---|
| Minimisation | Five required fields. **Student name optional** |
| Consent | Explicit, unticked, timestamped, policy linked at collection |
| Access | `ADMISSIONS_MANAGER` + `SUPER_ADMIN` only. **`EDITOR` cannot reach it by any route** |
| Access logging | Detail reads and all exports audited |
| **Audit hygiene** | Audit entries record *that* an enquiry changed — **never phone, email, or message content** |
| Export | Permitted but always logged — bulk PII leaving the system is a deliberate act |
| Retention | Defined period post-closure, then delete or anonymise |
| Deletion | Real deletion, `SUPER_ADMIN` only |
| Email content | Notifications carry triage detail + a link, **not the full message body** |
| Transport | HTTPS enforced (HSTS) |
| Backups | Contain PII → same access restrictions, encrypted |

> The audit-hygiene rule prevents a common own-goal: an audit log that records "changed enquiry, phone 98xxxxxx" becomes a second copy of personal data with weaker access controls than the table it was protecting.

---

## Security headers

Applied in `proxy.ts`.

| Header | Value |
|---|---|
| `Strict-Transport-Security` | Long max-age, `includeSubDomains` |
| `Content-Security-Policy` | Restrictive; explicit allow-list for media provider and analytics |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` / `frame-ancestors` | Deny — prevents clickjacking of admin |
| `Permissions-Policy` | Deny camera, microphone, geolocation |

CSP must be developed against the real page set and tested in report-only mode first. A CSP that breaks the site gets disabled, which is worse than a well-tuned one.

---

## Rate limiting

| Endpoint | Limit | Rationale |
|---|---|---|
| Enquiry submit | 3 / IP / hour | Blocks spam; forgiving for a family with two children |
| Contact form | 3 / IP / hour | — |
| Login | 5 / IP / 15 min + delay | Brute force |
| Upload | 20 / user / hour | Abuse containment |
| Revalidate endpoint | Strict + secret | Operational endpoint |

Limits must not block genuine users. Shared household and office IPs are normal.

---

## Secrets — T11

| Rule | Detail |
|---|---|
| Never committed | `.env` git-ignored from the first commit |
| `.env.example` | Variable **names only**, never real or realistic values |
| Storage | Platform environment variables |
| Separation | Different secrets per environment |
| Rotation | On staff departure or suspected exposure |
| Scanning | Automated secret detection in CI |
| Logging | **Secrets never logged**, even at debug level |

⚠️ A realistic-looking fake value in `.env.example` is a hazard — someone will eventually treat it as real. Names only.

---

## Dependencies — T13

Automated vulnerability scanning · prompt patching of high and critical advisories · minimal dependency count (each is trusted code) · lockfile committed · new dependencies justified in review.

The rejections in [12_TECH_STACK](12_TECH_STACK.md) — no Redis, no separate backend, no headless CMS — are a security benefit as well as an operational one: less code, fewer services, smaller attack surface.

---

## Logging and monitoring

**Logged:** authentication success and failure · authorisation denials (403) · all content mutations · role changes · enquiry status changes and exports · upload failures · server errors · **failed enquiry submissions (alerted)**.

**Never logged:** passwords or hashes · session tokens · secrets · **enquiry PII** · full request bodies containing personal data.

**Alerted:** repeated auth failures · repeated 403s from one account · failed enquiry submissions · error-rate spikes · unavailability.

Detail in [33_MONITORING_AND_LOGGING](33_MONITORING_AND_LOGGING.md).

---

## Child safety

Because the site publishes images of minors, the following are security requirements, not content preferences: EXIF and geolocation stripping · recorded consent basis before publication · a takedown path faster than normal deletion · alt text that does not name children · restricted upload rights.

Fully specified in [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md).

---

## Incident response

Minimal but real — a plan nobody wrote is a plan nobody follows.

```
1. DETECT   — alert, report, or observation
2. CONTAIN  — revoke sessions, disable accounts, take content down
3. ASSESS   — what was accessed? was PII involved? which individuals?
4. NOTIFY   — school management immediately; affected individuals and
              authorities per the school's legal advice
5. REMEDIATE— patch, rotate secrets, restore from verified backup
6. RECORD   — write a HISTORY entry: what happened, why, what changed
```

⚠️ **Breach notification obligations are a legal question for the school's advisor**, not an engineering decision. This document does not state what the law requires. Registered in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

**Contacts, escalation path, and decision authority must be filled in before launch** — an incident is the wrong time to discover nobody knows who to call.

---

## What we are *not* doing

| Not doing | Why |
|---|---|
| WAF | Platform provides baseline protection; disproportionate here |
| Penetration test | `SHOULD` before launch if budget allows; not assumed |
| SIEM | Vastly disproportionate |
| Encryption at rest beyond provider defaults | Provider-managed encryption is appropriate at this sensitivity |
| Bug bounty | No |
| Formal certification | Not required |

---

## Pre-launch checklist

- [ ] Every Server Action verified to authenticate **and** authorise — including direct invocation
- [ ] `EDITOR` confirmed unable to reach enquiry data by any route
- [ ] Upload verified to reject SVG, executables, and mislabelled files
- [ ] EXIF stripping verified on a real photograph with GPS data
- [ ] Rate limits verified live
- [ ] Security headers verified; CSP tuned against real pages
- [ ] No secrets in git history — scanned, not assumed
- [ ] `.env.example` contains names only
- [ ] HTTPS enforced; HSTS active
- [ ] Admin excluded from indexing
- [ ] Password hashing confirmed argon2id
- [ ] Session revocation on deactivation verified
- [ ] **Backup restore tested** ([34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md))
- [ ] Incident contacts documented
- [ ] Dependency scan clean of high/critical advisories
