# 30 — Deployment

| Field | Value |
|---|---|
| **Status** | PROPOSED — platform is `USER_APPROVED_DECISION`; nothing deployed |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | DevOps / Principal Architect |
| **Dependencies** | [12_TECH_STACK](12_TECH_STACK.md) |
| **Related Documents** | [35_ENVIRONMENT_CONFIGURATION](35_ENVIRONMENT_CONFIGURATION.md) · [33_MONITORING_AND_LOGGING](33_MONITORING_AND_LOGGING.md) · [34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md) |

---

## Platform

**Vercel + Neon/Supabase** — `USER_APPROVED_DECISION`.

⚠️ **One choice remains open:** the owner approved "Neon or Supabase". One must be selected. Both provide serverless Postgres with pooling; Neon offers database branching per preview deployment, which is genuinely useful for testing migrations. Supabase bundles storage and auth we do not need, since media goes to Cloudinary and auth is admin-only. **`RECOMMENDATION`: Neon**, for branching and a narrower surface. Registered in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

---

## Environments

| Environment | Trigger | Database | Indexed | Purpose |
|---|---|---|---|---|
| **Development** | Local | Local Postgres or a dev branch | n/a | Daily work |
| **Preview** | Every pull request | Branch per PR | **No** | Review actual changes |
| **Staging** *(`SHOULD`)* | Merge to `develop` | Separate database | **No** | Pre-release verification |
| **Production** | Merge to `main` | Production database | Yes | Live |

### Staging must not be indexable
A duplicate indexed staging site competes with production in search results and can leak unreleased content. Enforced by environment-level `noindex` **and** a robots disallow — belt and braces, because this failure is common and embarrassing (NFR-066).

Preview deployments carry the same protection.

---

## Git and branching

```
main        production — protected, deploys live
develop     integration — deploys to staging
feature/*   new work
fix/*       bug fixes
```

**Protection on `main`:** no direct pushes · PR required · CI must pass · at least one approving review where a second person exists.

**Commits:** conventional prefixes (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Not ceremony — it makes the history readable when someone unfamiliar picks the project up in two years.

**PRs must state** what changed, why, how it was tested, and — per project rule — **whether any BLUEPRINT document needs updating** ([44_CHANGE_MANAGEMENT](44_CHANGE_MANAGEMENT.md)).

> The repository is not yet a git repository ([CHANGE-0001](../HISTORY/2026/08/CHANGE-0001-INITIAL-DISCOVERY.md)). `git init` is step one of implementation, and `.env` must be git-ignored **in the first commit** — a secret committed once lives in history forever.

---

## CI pipeline

Runs on every pull request. All must pass before merge.

```
1. Install (cached)
2. Typecheck            — tsc --noEmit
3. Lint + format check
4. Unit + integration tests
5. Build
6. Bundle budget check  — fails if over budget
7. E2E tests            — six critical journeys
8. Accessibility scan   — axe-core
9. Lighthouse CI        — regression detection
10. Dependency audit    — high/critical advisories
11. Secret scan
```

Steps 6, 8, 9 and 11 are the ones most often skipped and most valuable here: they defend the performance, accessibility, and security commitments that would otherwise erode invisibly.

---

## Deployment flow

```
PR opened  →  CI  →  preview deployment (isolated DB branch)
                          │
                     review + verify
                          │
merge to develop  →  staging  →  smoke test
                          │
merge to main     →  production build
                          │
              ┌───────────┴───────────┐
       run migrations           deploy application
       (direct connection)      (atomic swap)
                          │
                    post-deploy verification
```

Deployments are atomic — traffic switches to the new version only after a successful build. Rollback is a redeploy of the previous version.

### Migrations
Run against the **direct (unpooled)** connection, before the application deploys. **A verified backup must exist first** ([34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md)).

Destructive changes are two-phase — add new → backfill → switch reads → drop old — so a rollback never lands on a schema that has already discarded data. This is the single most important deployment discipline, because an application rollback is trivial and a data rollback is not.

---

## Domain and TLS

Custom domain with `www` or apex canonicalised to one form (301 to the chosen one) · TLS provisioned and renewed by the platform · HTTPS enforced with HSTS · DNS at the school's registrar.

⚠️ **Domain ownership must sit with the school**, not with a developer or agency. This is a real and frequent failure: a school that cannot access its own DNS is a school held hostage by whoever set it up. Registered in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

Email sending domain requires SPF and DKIM records for enquiry notifications to deliver reliably.

---

## Post-deploy verification

Automated smoke tests after every production deploy:

- [ ] Homepage renders
- [ ] `/admissions` and `/admissions/enquire` render
- [ ] **Enquiry submission succeeds end to end** — including notification delivery
- [ ] `/notices` and `/downloads` render
- [ ] Admin login works
- [ ] `/api/health` returns 200
- [ ] Sitemap and robots.txt serve correctly
- [ ] No `[PLACEHOLDER]` tokens on indexable pages

The enquiry check is the one that matters most. A deploy that silently breaks enquiry submission loses admissions the school never learns about (NFR-063).

---

## Rollback

| Situation | Action |
|---|---|
| Bad application deploy | Redeploy previous version — near-instant |
| Bad migration, no data loss | Roll back application; apply corrective migration |
| Bad migration with data loss | **Restore from backup.** The reason two-phase migrations exist |
| Bad content | Unpublish or revert in the CMS — no deploy needed |

**Decision authority for a production rollback must be named before launch.** An incident is the wrong moment to work out who decides.

---

## Cost

Realistic expectation at launch: free or low tiers cover a single-campus school website comfortably.

| Service | Expectation |
|---|---|
| Hosting | Free tier likely sufficient; low paid tier if exceeded |
| Database | Free tier likely sufficient |
| Media | Free tier generous |
| Email | Free tier ample for enquiry volume |
| Analytics | Free or low monthly |
| Error monitoring | Free tier |
| **Domain** | Annual, school-owned |

⚠️ **Cost ownership must be the school's**, on the school's payment method. A service billed to a departed developer's card silently expires and takes the website with it — a well-known way for institutional sites to disappear.

---

## Launch checklist

**Blocking**
- [ ] Real school content replaces every `[PLACEHOLDER]`
- [ ] Real photography in place
- [ ] Legal pages reviewed by the school's legal advisor
- [ ] Safety page content verified with the school
- [ ] Domain configured, school-owned
- [ ] TLS active, HTTPS enforced
- [ ] Production secrets set; none in source control
- [ ] `SUPER_ADMIN` account created; initial password changed
- [ ] **Backup running and a restore actually tested**
- [ ] Enquiry submission and notification verified end to end
- [ ] Error monitoring and alerting live
- [ ] Analytics live before launch, to capture day-one data
- [ ] Search Console verified, sitemap submitted
- [ ] Staging and preview confirmed `noindex`

**Verification**
- [ ] Accessibility testing performed and recorded ([26_ACCESSIBILITY](26_ACCESSIBILITY.md))
- [ ] Performance verified on a real mid-range Android device
- [ ] Security checklist complete ([28_SECURITY](28_SECURITY.md))
- [ ] All six critical journeys pass ([05_USER_JOURNEYS](05_USER_JOURNEYS.md))

**Handover**
- [ ] Staff trained on the CMS
- [ ] Content ownership assigned ([47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md))
- [ ] Incident contacts documented
- [ ] Blueprint updated to reflect what was actually built
- [ ] HISTORY entry recording the launch

---

## What we are not doing

| Not doing | Why |
|---|---|
| Docker / Kubernetes | Serverless platform chosen; containers solve a problem we do not have |
| Blue-green / canary | Platform deploys are already atomic with instant rollback |
| Multi-region | Single-city audience |
| Load testing | Traffic is modest and cached; revisit only on evidence |
| Infrastructure as code | Two managed services and a handful of environment variables; a documented setup is sufficient and simpler to hand over |
