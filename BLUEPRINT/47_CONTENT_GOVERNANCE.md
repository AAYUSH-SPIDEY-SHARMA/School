# 47 — Content Governance

| Field | Value |
|---|---|
| **Status** | PROPOSED — owners unassigned |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product / School Management |
| **Dependencies** | [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) · [21_CONTENT_MODEL](21_CONTENT_MODEL.md) |
| **Related Documents** | [20_ADMIN_CMS](20_ADMIN_CMS.md) · [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md) |

---

## The problem this solves

A CMS answers *can* content be updated. Governance answers *who will*, *how often*, and *who notices when nobody does*.

The evidence that this matters is direct: one inspected reference site displayed a recruitment notice dated **August 2020** on its live homepage in August 2026. Another's footer copyright read 2018 (F-3). Neither is a technical failure. Both are governance failures — nobody owned the content, so nobody updated it.

**Unowned content rots.** This document assigns ownership.

---

## Publishing rights

Derived from [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md).

| Action | `SUPER_ADMIN` | `EDITOR` | `ADMISSIONS_MANAGER` |
|---|---|---|---|
| Create content | ✅ | ✅ | ❌ |
| Edit content | ✅ | ✅ | ❌ |
| Publish content | ✅ | ✅ | ❌ |
| Delete content | ✅ | ✅ (soft) | ❌ |
| Edit site settings | ✅ | ❌ | ❌ |
| Change admission cycle status | ✅ | ❌ | ✅ |
| Manage users | ✅ | ❌ | ❌ |
| View enquiries | ✅ | ❌ | ✅ |

**Why `ADMISSIONS_MANAGER` can change the cycle status but not content:** the open/closed state is a business fact that admissions staff are the only people who actually know, and it is the highest-staleness-risk item on the site. Making an editor the bottleneck would guarantee it goes stale.

---

## Publication workflow

**`RECOMMENDATION`: direct publish** — `DRAFT → PUBLISHED`, no approval chain.

```
Editor creates draft
      ↓
Preview
      ↓
Publish  ──► live within seconds
      ↓
Audit log entry recorded
```

### Why no approval workflow

For a small trusted staff, an approval chain adds friction to exactly the persona whose engagement determines whether the site stays current (P5), while the existing controls already handle the realistic failure modes:

- **Mistake published?** Unpublish immediately; soft delete is recoverable
- **Who did it?** Audit log
- **Bad judgement?** Management reviews the audit log monthly

An approval chain would trade a guaranteed cost (friction, delay, editors giving up) against a recoverable and traceable risk.

⚠️ **This is an `OPEN_DECISION` (OD-012).** Revisit if more than five or six people will hold `EDITOR` access, or if the school specifically wants pre-publication review.

### Content requiring review regardless

Some content is reviewed before publication not because of workflow, but because being wrong is materially harmful.

| Content | Reviewer | Why |
|---|---|---|
| Fee structure | **Principal** | Financial commitment to families |
| Admission dates and cycle status | **Principal** | Legally and commercially significant |
| Statistics | **Principal** | Publishing a false figure is a misrepresentation |
| Safety page | **Principal — verified** | Claiming measures that do not exist is a serious misrepresentation |
| Legal pages | **Legal advisor** | — |
| Any image containing minors | **Consent check** | [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md) |

These are process obligations, enforced by training and the QA checklist rather than by software gates.

---

## Content ownership

> ⚠️ **Roles below are placeholders. Real people must be named before handover** (OD-022). Content assigned to "the office" in the abstract belongs to nobody.

| Content | Owner | Backup | Reviewer |
|---|---|---|---|
| Notices | Office coordinator | Admin assistant | — |
| News | Activities coordinator | Office | Principal (spot-check) |
| Events | Activities coordinator | Office | — |
| Gallery | Activities coordinator | — | ⚠️ Consent check |
| Achievements | Academic coordinator | — | ⚠️ Care naming students |
| Faculty | Administration | — | Principal |
| Downloads | Office | — | — |
| Fee structure | Accounts | — | **Principal** |
| Admission dates and status | Admissions | Office | **Principal** |
| Statistics | Administration | — | **Principal** |
| Safety content | Administration | — | **Principal, verified** |
| Contact details | Office | — | — |
| Testimonials | Admissions | — | ⚠️ Permission required |
| Legal pages | Management | — | **Legal advisor** |

Every row needs a **named person and a named backup**. A single owner who leaves or goes on maternity leave becomes an unowned module.

---

## Content freshness

Direct response to the observed staleness failure (F-3).

### Thresholds

Each content type has a period after which it is flagged as potentially stale. Flagging is advisory — it prompts a human, it does not unpublish anything.

| Content | Threshold | Consequence of staleness |
|---|---|---|
| **Admission cycle status** | **30 days** | 🔴 **Actively misleading** — a parent believes admissions are open when closed |
| **Admission dates** | 30 days | 🔴 Misleading |
| **Fee structure** | Annually, before the cycle | 🔴 Financial misinformation |
| Academic calendar | Annually | 🟠 Parents miss dates |
| Notices | Per notice `expiresAt` | 🟠 Clutter, confusion |
| Contact details | 180 days | 🔴 **Unreachable school** |
| Statistics | Annually | 🟡 Outdated impression |
| Faculty | 180 days | 🟡 Inaccurate |
| News | 60 days since last publish | 🟡 School appears inactive |
| Gallery | 90 days since last album | 🟡 Appears inactive |
| Downloads | Per academic year | 🟠 Wrong version in circulation |

### How it surfaces
Stale items appear as **warnings at the top of the editor dashboard** (AR-017). Placement is deliberate — a freshness indicator buried in a settings page does not work.

Notices additionally self-manage through `expiresAt`, filtered at query time. **This is the specific mechanism that prevents a six-year-old notice remaining live.**

### Automation
`FUTURE`, not v1: email digests of stale content, automatic unpublishing (rejected — silently removing content is worse than flagging it), scheduled reviews.

The v1 approach is deliberately manual: flag it, show the responsible person, let a human decide.

---

## Editorial standards

| Standard | Rule |
|---|---|
| Audience | Write for parents, not for the school's self-image |
| Tone | Warm, clear, factual. Not corporate, not childish |
| Length | Short paragraphs. Parents read on phones |
| Headings | Mirror real questions |
| Jargon | Expand abbreviations on first use — a new parent may not know "CCE" or "PTM" |
| Dates | Absolute, never "next Friday" |
| Names | Full name and designation on first mention |
| **Children** | ⚠️ Describe activities. **Do not publish full names of students alongside identifying photographs** without explicit consent |
| Claims | Every factual claim must be true and verifiable |
| Alt text | Describe the activity, never name a child |

---

## Content integrity — non-negotiable

Restated because these are the rules most likely to erode under deadline pressure.

1. **No fabricated statistics, results, accreditations, or testimonials.** A false "95% board results" is a misrepresentation to families making a decision about their child.
2. **No stock photography as campus imagery.**
3. **Testimonials are real, attributed, and permitted.**
4. **Safety claims are verified**, not drafted plausibly.
5. **Child imagery follows the consent rules.**
6. **Placeholders are visually obvious** and never plausible-looking.

---

## Operational cadence

| Activity | Frequency | Who |
|---|---|---|
| Publish notices as they arise | As needed | Office |
| Publish news after events | Weekly-ish | Activities |
| Upload gallery after events | After each | Activities |
| **Check enquiry dashboard** | **Daily in season** | Admissions |
| Review freshness warnings | Weekly | Content owners |
| Verify admission dates | Monthly in season | Admissions + Principal |
| Review audit log | Monthly | Principal |
| Update faculty | Termly | Administration |
| Review fees | Annually | Accounts + Principal |
| Full content review | Annually | All owners |

> **Checking the enquiry dashboard daily is the most consequential item on this list.** A perfectly engineered enquiry system with nobody reading it reproduces exactly the unresponsiveness the project was built to fix.

---

## Training and handover

Governance only works if staff can and do act on it.

**Training must cover:** logging in · publishing a notice · adding news with an image · uploading a gallery album · writing alt text and why it matters · child-imagery consent · working the enquiry dashboard · what to do when unsure.

**Format:** hands-on session with each owner publishing something real, plus a one-page quick reference. **Not** a long PDF manual — those are not read.

**Success test:** each content owner publishes real content unaided during the session (AR-020).

**Handover checklist:** owners named per module · credentials issued and initial passwords changed · escalation contact documented · **domain, hosting, and billing owned by the school**.

---

## Review of this document

| Trigger | Action |
|---|---|
| Staff change | Reassign ownership immediately |
| Stale content found in production | Review the threshold and the owner |
| More than 6 editors | Reconsider the approval workflow (OD-012) |
| Annually | Full review |

**Every unowned module is a module that will rot.** That is the single claim this document rests on, and it is supported by direct observation of comparable sites.
