# 33 — Monitoring and Logging

| Field | Value |
|---|---|
| **Status** | NOT_STARTED — nothing is deployed, so nothing is monitored |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | DevOps |
| **Dependencies** | [30_DEPLOYMENT](30_DEPLOYMENT.md) |
| **Related Documents** | [28_SECURITY](28_SECURITY.md) · [29_ANALYTICS](29_ANALYTICS.md) · [34_BACKUP_AND_RECOVERY](34_BACKUP_AND_RECOVERY.md) |

> **This document is intentionally concise.** No application exists, nothing is deployed, and no observability tooling is configured. What follows is the specification to implement, not a description of a running system. Padding it with configuration detail for services not yet chosen would be invention.

---

## Four distinct concerns

Commonly collapsed into "logging", which is why observability tends to be simultaneously noisy and useless. They answer different questions, have different audiences, and different retention.

| Concern | Question | Audience | Retention |
|---|---|---|---|
| **Application logs** | What happened, in what order, when this broke? | Developer | 30 days |
| **Audit log** | Who changed what, and when? | `SUPER_ADMIN`, management | Long-term, in-database |
| **Metrics** | Is the system healthy over time? | Developer | 90 days |
| **Alerts** | Does someone need to act *now*? | Developer, admissions | n/a |

**Analytics is a fifth, separate thing** — it measures parent behaviour, not system health, and is specified in [29_ANALYTICS](29_ANALYTICS.md).

The audit log is the only one stored in the application database, because it is a product feature (`/admin/audit-log`) as well as an operational record.

---

## Application logs

Structured (JSON), not free text — searchable, not just readable.

**Levels:** `error` (needs attention) · `warn` (unexpected but handled) · `info` (significant events: publish, enquiry received) · `debug` (development only).

**Every log entry carries:** timestamp, level, message, request ID, route, and — where applicable — the acting user ID.

### Never logged
Passwords or hashes · session tokens · secrets or API keys · **enquiry personal data** (parent name, phone, email, message, student name) · full request bodies containing personal data.

> An error log containing `"failed to save enquiry for 98xxxxxxxx"` turns the log aggregator into a second, less-protected store of personal data. Log the enquiry **ID**, never its contents (NFR-050).

---

## Audit log

Specified in [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) and [15_BACKEND_ARCHITECTURE](15_BACKEND_ARCHITECTURE.md). Append-only; not editable through the application.

**Recorded:** content create/update/delete/publish · enquiry status changes, assignment, **exports** · settings changes · user creation, role change, deactivation · login success and failure.

**Not recorded:** page views · draft autosaves · reads of public content.

⚠️ Audit entries record *that* enquiry `#123` moved to `CONTACTED` by user `#4` — **never the parent's contact details**.

---

## Metrics

Deliberately few. A dashboard with forty panels is a dashboard nobody reads.

| Metric | Why |
|---|---|
| Request rate and error rate | Baseline health |
| Response time (p50, p95) | Degradation signal |
| **Enquiry submissions per day** | Business-critical; a drop to zero means something broke |
| **Failed enquiry submissions** | Target: zero |
| Email delivery failures | Silent enquiry loss |
| Database connection errors | Pooling problems |
| Cache hit rate | Caching working as intended |
| Field Core Web Vitals | Real-user performance ([27_PERFORMANCE](27_PERFORMANCE.md)) |

---

## Alerts

An alert must mean **someone should act now**. Anything else is a metric or a log. Alert fatigue is the failure mode: a channel that cries wolf gets muted, and then the real incident is missed.

| Alert | Priority | Recipient |
|---|---|---|
| **Failed enquiry submission** | **P1** | Developer + admissions |
| Site unreachable | **P1** | Developer |
| Error rate spike | P1 | Developer |
| Email delivery failure | P2 | Developer |
| Database connection failures | P2 | Developer |
| Repeated auth failures on one account | P2 | Developer |
| Repeated 403s from one account | P3 | Developer |
| Backup failure | **P2** | Developer |
| Certificate expiry approaching | P3 | Developer |

### Why failed enquiry submission is P1
It is the only failure that is **invisible to everyone except the person harmed by it**. A parent submits an enquiry, sees an error or nothing, and concludes the school is unresponsive. The school never learns the enquiry existed. Every other failure on this list eventually announces itself; this one does not (NFR-063).

Alerts are **not** raised for: individual 404s, validation failures, rate-limit hits, or a single slow request. All are normal.

---

## Uptime monitoring

External probe against `/api/health` (which returns status only and leaks no version or dependency detail — [18_API_SPECIFICATION](18_API_SPECIFICATION.md)). Every 5 minutes, from at least one Indian region so latency reflects the real audience. Alert after two consecutive failures, avoiding single-blip noise.

---

## Error monitoring

Vendor undecided (Sentry or equivalent) — `OPEN_DECISION`.

Requirements: server and client error capture · stack traces with source maps · request context (route, user ID, request ID) · grouping so one recurring bug is one issue · release tagging so a regression is traceable to a deploy · **automatic scrubbing of personal data from error payloads**.

The last is not optional. Error monitoring tools capture request bodies by default, which for this application would mean shipping parent contact details to a third party.

---

## Operational review

| Review | Frequency | Who |
|---|---|---|
| Alert triage | As raised | Developer |
| Error trends | Weekly | Developer |
| Field Core Web Vitals | Monthly | Developer |
| Enquiry volume vs prior month | Monthly | School + developer |
| Audit log spot-check | Monthly | `SUPER_ADMIN` |
| Backup and restore verification | Quarterly | Developer |

---

## What we are not doing

| Not doing | Why |
|---|---|
| Distributed tracing | One application, no service mesh |
| SIEM | Vastly disproportionate |
| Log aggregation cluster | Platform-provided logs suffice |
| Custom metrics pipeline | Managed tooling is adequate |
| On-call rotation | One or two maintainers; alerts go to a person, not a rota |
| APM profiling in production | Revisit only if performance problems appear in field data |

---

## Pre-launch requirements

- [ ] Error monitoring live, receiving events, PII scrubbing verified
- [ ] Uptime monitoring live
- [ ] **Alert on failed enquiry submission verified by simulating a failure** — configuring an alert is not the same as knowing it fires
- [ ] Backup failure alerting active
- [ ] Alert recipients confirmed reachable
- [ ] Real-user monitoring active before launch, so day-one field data is captured
