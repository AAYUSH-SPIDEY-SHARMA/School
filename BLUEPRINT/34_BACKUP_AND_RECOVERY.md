# 34 — Backup and Recovery

| Field | Value |
|---|---|
| **Status** | NOT_STARTED — no database exists, nothing to back up |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | DevOps |
| **Dependencies** | [30_DEPLOYMENT](30_DEPLOYMENT.md) · [16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md) |
| **Related Documents** | [28_SECURITY](28_SECURITY.md) · [33_MONITORING_AND_LOGGING](33_MONITORING_AND_LOGGING.md) |

> **Intentionally concise.** No database, no deployment, no backups. This specifies what must be true before launch. **No recovery capability may be claimed until it has actually been exercised** — see §Verification.

---

## Five separate concerns

Routinely collapsed into "we have backups", which is how organisations discover at the worst possible moment that their backups do not restore.

| Concern | Question |
|---|---|
| **Creation** | Are backups being made? |
| **Retention** | How far back can we go? |
| **Verification** | Did the backup actually complete and is it intact? |
| **Restore testing** | **Have we ever actually restored one?** |
| **Disaster recovery** | What happens if the whole environment is lost? |

**A backup that has never been restored is a hypothesis, not a backup.** Creation is the easy part and the only part most projects do.

---

## What needs protecting

| Asset | Store | Loss impact | Recoverable from |
|---|---|---|---|
| **Enquiry records** | Postgres | **Severe** — lost admissions, unrecoverable; parents will not resubmit | Backup only |
| Published content | Postgres | High — months of staff work | Backup only |
| Media files | Cloudinary | High | Provider redundancy |
| Admin accounts | Postgres | Low — recreatable | Backup |
| Audit log | Postgres | Medium — accountability record | Backup |
| Site settings | Postgres | Low — re-enterable | Backup |
| Application code | Git | Low | Repository |
| Secrets | Platform env | Medium | **Documented recovery procedure required** |

> **Enquiry records are the highest-value data in the system.** They are personal data the school has a duty of care over, and each represents a family that made contact. There is no second copy anywhere — a parent who enquired last week will not enquire again if the record vanishes.

---

## Backup specification

| Aspect | Requirement |
|---|---|
| Method | Managed provider backups (Neon/Supabase both provide automated backups and point-in-time recovery) |
| Frequency | Daily minimum; point-in-time recovery preferred |
| Retention | 30 days minimum |
| Location | Provider-managed, geographically separate from the primary |
| Encryption | At rest and in transit |
| **Access control** | ⚠️ **Backups contain enquiry PII.** Same access restrictions as the production database. A backup in an unsecured location is a data breach |
| Monitoring | **Backup failure raises an alert** (P2) |

### Media
Media lives at the provider and is not separately backed up in v1. The `MediaAsset` table (in Postgres, therefore backed up) holds the URLs, alt text, and consent records — so metadata survives even if files must be re-uploaded.

`RECOMMENDATION`: reassess once the gallery holds a few thousand irreplaceable photographs. Provider redundancy is not the same as a backup you control.

---

## Recovery objectives

Deliberately modest — this is a school website, not a payments system.

| Objective | Target | Meaning |
|---|---|---|
| **RPO** (max acceptable data loss) | ≤ 24 hours; ≤ 1 hour with PITR | Worst case, one day of enquiries and content |
| **RTO** (max acceptable downtime) | ≤ 4 hours | Restore and redeploy within a working day |

**RPO for enquiries deserves scrutiny.** During peak admission season, 24 hours of lost enquiries is a real commercial loss. This is the strongest argument for enabling point-in-time recovery rather than relying on daily snapshots.

---

## Restore testing — the part that is usually skipped

**A backup is not verified until data has been restored from it and inspected.**

### Procedure

```
1. Provision an isolated restore target — never production
2. Restore the most recent backup
3. Verify integrity:
     • row counts plausible across all 18 tables
     • most recent enquiry present and complete
     • most recent published content present
     • foreign key relationships intact
     • admin account present and able to authenticate
4. Record: date, backup used, duration, issues found
5. Destroy the restore target — it contains real PII
6. File the result in this document
```

Step 6 matters: an unrecorded successful restore provides no assurance to the next person.

### Schedule
| When | Why |
|---|---|
| **Before launch** | **Blocking.** Recovery readiness cannot be claimed until exercised |
| Quarterly | Configuration drifts; providers change |
| After any major migration | Verify the new schema restores |
| After any provider change | New provider, new assumptions |

### Record

| Date | Backup | Duration | Result | Notes |
|---|---|---|---|---|
| — | — | — | **Never performed** | No database exists |

⚠️ **This table is empty and must not be treated as an oversight.** Until it has a row, this project has **no demonstrated recovery capability**, and no statement to the contrary may be made to the school.

---

## Recovery scenarios

| Scenario | Response | Data loss |
|---|---|---|
| Accidental content deletion by staff | Restore via soft delete in the CMS — **no backup needed** | None |
| Accidental enquiry deletion | Restore from backup or PITR | Up to RPO |
| Bad migration, no data loss | Roll back application; corrective migration | None |
| **Bad migration with data loss** | Restore from the pre-migration backup | Up to RPO |
| Database corruption | Restore latest verified backup | Up to RPO |
| Provider outage | Wait, or restore elsewhere if extended | None |
| Complete environment loss | Full DR procedure below | Up to RPO |
| Ransomware / malicious deletion | Restore from a backup **predating** the compromise | Depends |

> Soft delete ([16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md)) handles the *most common* real scenario — a staff member deleting the wrong thing — without touching backups at all. That is deliberate: routine mistakes should never require a restore.

---

## Disaster recovery

Complete loss of the production environment.

```
1. Confirm scope; notify school management
2. Provision a new database instance
3. Restore the most recent verified backup
4. Recreate environment variables from the secrets recovery record
5. Redeploy from git (main)
6. Repoint DNS
7. Verify: homepage, enquiry submission end to end, admin login
8. Confirm media still serves
9. Record a HISTORY entry: cause, actions, data loss, prevention
```

### Prerequisites that must exist before launch
- [ ] **Secrets recovery record** — a documented, securely stored list of every required environment variable and where to obtain each value
- [ ] Domain and DNS **owned by the school**, with access documented
- [ ] Hosting and database accounts **owned by the school**
- [ ] Named person with authority to execute DR
- [ ] Provider support contacts recorded

⚠️ The most likely DR failure here is not technical. It is that the only person with access to the domain registrar or the hosting account is unreachable. Ownership sitting with the school is an operational control, not paperwork ([30_DEPLOYMENT](30_DEPLOYMENT.md)).

---

## Data retention interaction

Enquiry records are deleted or anonymised after their retention period ([23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md)). Backups retain them for the backup retention window afterwards.

This means a deletion request is not fully satisfied until backups containing the record have rotated out. That is normal and generally accepted, but it **must be stated in the privacy policy** rather than glossed over.

⚠️ Whether this satisfies the school's legal obligations is a question for its legal advisor ([39_OPEN_DECISIONS](39_OPEN_DECISIONS.md)).

---

## Pre-launch checklist

- [ ] Automated backups enabled and confirmed running
- [ ] Retention configured to 30 days minimum
- [ ] Point-in-time recovery enabled if available
- [ ] Backup failure alerting active
- [ ] **A restore has been performed, verified, and recorded in the table above**
- [ ] Secrets recovery record written and stored securely
- [ ] Domain, DNS, hosting, and database accounts owned by the school
- [ ] DR authority named
- [ ] Backup access restrictions confirmed — PII protection
