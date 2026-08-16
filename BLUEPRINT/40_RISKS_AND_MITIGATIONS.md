# 40 — Risks and Mitigations

| Field | Value |
|---|---|
| **Status** | ACTIVE |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Principal Architect / Product |
| **Dependencies** | [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) |
| **Related Documents** | [28_SECURITY](28_SECURITY.md) · [37_IMPLEMENTATION_ROADMAP](37_IMPLEMENTATION_ROADMAP.md) · [43_CURRENT_STATUS](43_CURRENT_STATUS.md) |

---

## Scoring

**Severity** — Low · Medium · High · Critical
**Likelihood** — Unlikely · Possible · Likely
**Priority** = severity × likelihood, adjusted for how recoverable the outcome is.

Risks are ordered by priority, not by category. Security risks are modelled separately in [28_SECURITY](28_SECURITY.md) and referenced rather than duplicated.

---

## R-01 — School assets never arrive 🔴 **TOP RISK**

**Severity:** Critical · **Likelihood:** Likely

Logo, photography, statistics, fees, and contact details are all outside engineering control and all block launch. In projects of this type, content is reliably the slowest dependency — schools are busy, and "send us your photographs" competes with running a school.

**Consequence:** engineering completes and the project stalls indefinitely with a finished site nobody can launch. Motivation decays; the project quietly dies.

**Mitigation**
- Escalated as the top item in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md) (OD-001 to OD-005)
- Placeholder tokens keep every engineering workstream moving in the meantime
- Request assets in **one specific, itemised list** rather than an open-ended ask — "20–40 photographs of the following subjects" is actionable; "some photos" is not
- If photography does not exist, propose a half-day shoot early, while there is still schedule
- Build layouts that fail *visibly* without imagery, so the gap stays uncomfortable rather than being papered over

**Residual:** High. Cannot be engineered away.

---

## R-02 — CMS goes unused; content rots 🔴

**Severity:** High · **Likelihood:** Possible

This is the failure this project exists to prevent, and it is empirically common: one reference site displayed a notice dated **August 2020** on its live homepage in August 2026; another's footer read 2018 (F-3).

**Consequence:** within a year the site looks exactly like the ones it was built to improve on. Every engineering investment is nullified by a content problem.

**Mitigation**
- The three-minute publish target (AR-020), tested with a genuinely non-technical person
- Only truly necessary fields required
- Draft-and-preview removes fear of breaking something public
- Read-your-writes cache invalidation, so an editor sees their change immediately and does not conclude the tool is broken
- Freshness indicators at the **top** of the editor dashboard (AR-017)
- Notice expiry dates, so stale notices remove themselves
- Named content ownership per module ([47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md))
- Staff training at handover, not a PDF nobody reads

**Residual:** Medium. Measured at M10, ninety days post-launch.

---

## R-03 — Fabricated content reaches production 🔴

**Severity:** Critical · **Likelihood:** Possible

A plausible-looking "95% board results" or a stock photograph of a classroom is easy to insert as a design placeholder and easy to forget.

**Consequence:** a real school publishes false claims to families making a decision about their child. This is a misrepresentation with reputational and potentially legal consequences — and it is discovered by the people least forgiving of it.

**Mitigation**
- Placeholders are **visually obvious** — `[SCHOOL_NAME]` format, never realistic-looking values
- Seed data contains no plausible fake figures ([16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md))
- Test fixtures use obviously synthetic values
- Content-integrity check is **first** in [32_QA_CHECKLIST](32_QA_CHECKLIST.md) and blocks release
- Automated scan for `[PLACEHOLDER]` tokens on indexable pages in the launch checklist
- Safety-page claims must be verified with the school, not drafted plausibly

**Residual:** Low, given the checks — but only if the checklist is actually run.

---

## R-04 — Enquiry loss 🔴

**Severity:** Critical · **Likelihood:** Possible

An enquiry that fails to save, or a notification that fails to send with nobody noticing.

**Consequence:** the school loses an admission and **never learns it existed**. The parent concludes the school is unresponsive. Uniquely among failures here, this one is invisible to everyone except the person harmed.

**Mitigation**
- Email is decoupled from the write — the enquiry persists even if notification fails
- Failure shows the parent an apology **and the school's phone number**, and preserves typed values
- Failed submissions are logged **and alerted at P1** (NFR-063)
- Post-deploy smoke test submits a real enquiry end to end
- Enquiry volume monitored monthly — a drop to zero is a signal, not a quiet period
- `enquiry_failed` analytics event; target zero

**Residual:** Low, provided the alert is verified by simulation rather than merely configured.

---

## R-05 — Child imagery published without consent 🔴

**Severity:** Critical · **Likelihood:** Possible

A school gallery is full of identifiable minors. Photographs may carry GPS metadata; a parent may withdraw consent; a child may be in a protective situation where publication is genuinely dangerous.

**Mitigation**
- EXIF and geolocation stripped at upload, verified with a real GPS-tagged file (NFR-052)
- `containsMinors` flag and `consentBasis` recorded on `MediaAsset`
- Alt text describes activity, never names children
- Expedited takedown path, faster than normal deletion
- Upload restricted to `EDITOR` and above
- Full specification in [48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md)

**Residual:** Medium. Depends on the school operating a real consent process — a technical control cannot substitute for one.

---

## R-06 — Enquiry PII exposure 🟠

**Severity:** High · **Likelihood:** Unlikely

Parent contact details and, optionally, a child's name — the most sensitive data in the system.

**Mitigation:** role separation with `EDITOR` excluded entirely · authorisation enforced per Server Action, tested by direct invocation · query-layer scoping · audited reads and exports · audit entries containing no PII · data minimisation (student name optional) · defined retention · encrypted, access-controlled backups. Detail in [28_SECURITY](28_SECURITY.md) T1.

**Residual:** Low.

---

## R-07 — Scope creep into a full application system 🟠

**Severity:** High · **Likelihood:** Possible

"While we're at it, could parents also upload documents / pay fees / log in?"

**Consequence:** parent authentication, identity documents about minors, payment handling — a materially larger security and privacy obligation, and a launch date that recedes indefinitely.

**Mitigation**
- Enquiry-only is a `USER_APPROVED_DECISION`, recorded ([23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md))
- Changing it requires an ADR that states the added obligations explicitly
- The future path is documented, so deferring is not the same as refusing
- The data model permits later addition without migration pain

**Residual:** Low — provided the ADR requirement is honoured rather than waived informally.

---

## R-08 — Blueprint drifts from implementation 🟠

**Severity:** Medium · **Likelihood:** Likely

Documentation of this size decays the moment code diverges from it, and then becomes actively misleading — worse than no documentation, because it is trusted.

**Mitigation**
- Change protocol in [44_CHANGE_MANAGEMENT](44_CHANGE_MANAGEMENT.md)
- PR template asks which blueprint documents need updating
- [99_CLAUDE_WORKING_RULES](99_CLAUDE_WORKING_RULES.md) requires reading and updating the blueprint
- Consistency audit and drift detection procedures
- Every document carries `Status` and `Last Updated`, so staleness is visible

**Residual:** Medium. Depends on discipline, which no tool enforces.

---

## R-09 — Design cannot reach its intended quality 🟠

**Severity:** Medium · **Likelihood:** Possible

The design system is `PROVISIONAL`. The final palette derives from a logo not yet seen, and the layouts depend on photography that does not yet exist.

**Specific sub-risk:** the provisional gold accent may fail contrast as a CTA background. If it does, it is demoted to decorative use and CTAs use the primary colour — **accessibility wins over palette preference** ([10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md)).

**Mitigation:** two-layer token architecture makes re-theming a single-file change · a documented path from provisional to frozen · contrast verified by measurement against the real palette, not assumed.

**Residual:** Medium until Gate B clears.

---

## R-10 — Single-maintainer dependency 🟠

**Severity:** High · **Likelihood:** Possible

If one person holds all the knowledge, accounts, and access, their departure ends the project.

**Consequence:** this is the classic way institutional websites die — not from a technical failure, but because the only person who could log in has moved on.

**Mitigation**
- **Domain, hosting, database, and billing owned by the school**, not a developer ([30_DEPLOYMENT](30_DEPLOYMENT.md))
- Secrets recovery record ([35_ENVIRONMENT_CONFIGURATION](35_ENVIRONMENT_CONFIGURATION.md))
- The entire BLUEPRINT and HISTORY system exists so a new engineer can continue without the original author
- Boring, well-documented technology chosen over clever technology
- No shared accounts, so accountability survives handover

**Residual:** Medium. The documentation is the mitigation; its quality determines the outcome.

---

## R-11 — Spam floods the enquiry system 🟡

**Severity:** Low · **Likelihood:** Likely

A public form attached to a school inbox will attract bots. Most likely risk on this list; lowest impact.

**Mitigation:** honeypot · rate limiting (3/IP/hour) · strict schema · duplicate flagging. **CAPTCHA held in reserve** — it measurably reduces genuine completions and creates accessibility barriers, so it is deployed only if spam actually becomes a burden.

**Residual:** Low.

---

## R-12 — Performance degrades after launch 🟡

**Severity:** Medium · **Likelihood:** Likely

Editors upload 6 MB phone photographs; a third-party script gets added; the gallery grows.

**Mitigation:** automatic provider-side image optimisation, so an unoptimised upload never reaches a parent's device · bundle budgets enforced in CI · Lighthouse CI on every PR · field Core Web Vitals reviewed monthly · gallery lazy-loading · adding a client component or third-party script requires justification in review.

**Residual:** Low–Medium. The gallery is the page to watch.

---

## R-13 — Accessibility claimed but not verified 🟡

**Severity:** Medium · **Likelihood:** Possible

The blueprint targets WCAG 2.2 AA. It would be easy — and wrong — to treat that documented target as achieved.

**Mitigation:** [26_ACCESSIBILITY](26_ACCESSIBILITY.md) states the boundary explicitly · manual testing is mandatory and separately listed · results are **dated and recorded including failures** · no accessibility statement may be published before testing.

**Residual:** Low, provided the manual testing actually happens rather than being satisfied by a passing axe scan.

---

## ~~R-14 — Existing website discovered late~~ ✅ **CLOSED 2026-08-16**

**Owner confirmed the school has no existing website.** No inherited URLs, no ranking to preserve, no migration audit required. Retained below for the record.

**Severity:** Medium · **Likelihood:** ~~Possible~~ **Eliminated**

If the school already has a website, its URLs carry accumulated search ranking. Launching a new site without mapping those URLs loses it permanently.

**Mitigation:** raised as OD-007 with instruction to ask **immediately** — cheap to answer, expensive to miss. If one exists: crawl it, map URLs to 301 redirects, extract content.

**Residual:** Low if asked early; the risk is entirely one of timing.

---

## R-15 — Over-engineering 🟢

**Severity:** Medium · **Likelihood:** Unlikely

Adding infrastructure the school must fund, understand, and operate.

**Mitigation:** explicit rejection lists across [12_TECH_STACK](12_TECH_STACK.md), [13_SYSTEM_ARCHITECTURE](13_SYSTEM_ARCHITECTURE.md), and [16_DATABASE_ARCHITECTURE](16_DATABASE_ARCHITECTURE.md) · new infrastructure requires a measured problem and an ADR · simplicity stated as a product principle.

**Residual:** Low.

---

## R-16 — Cost or account lapse 🟢

**Severity:** High · **Likelihood:** Unlikely

A service billed to a departed developer's card expires and takes the site with it.

**Mitigation:** all billing on the school's payment method, all accounts school-owned, verified in the handover checklist ([32_QA_CHECKLIST](32_QA_CHECKLIST.md) §9).

**Residual:** Low.

---

## Summary

| ID | Risk | Priority | Residual |
|---|---|---|---|
| R-01 | School assets never arrive | 🔴 | **High** |
| R-02 | CMS unused; content rots | 🔴 | Medium |
| R-03 | Fabricated content in production | 🔴 | Low |
| R-04 | Enquiry loss | 🔴 | Low |
| R-05 | Child imagery without consent | 🔴 | Medium |
| R-06 | Enquiry PII exposure | 🟠 | Low |
| R-07 | Scope creep to applications | 🟠 | Low |
| R-08 | Blueprint drift | 🟠 | Medium |
| R-09 | Design quality ceiling | 🟠 | Medium |
| R-10 | Single-maintainer dependency | 🟠 | Medium |
| R-11 | Enquiry spam | 🟡 | Low |
| R-12 | Performance degradation | 🟡 | Low–Medium |
| R-13 | Unverified accessibility claims | 🟡 | Low |
| ~~R-14~~ | ~~Existing website found late~~ | ✅ | **Closed** |
| R-15 | Over-engineering | 🟢 | Low |
| R-16 | Cost/account lapse | 🟢 | Low |

**The highest residual risks — R-01, R-02, R-05, R-10 — are all organisational rather than technical.** Engineering cannot resolve them; it can only make them visible and reduce their cost. That is worth stating plainly, because it is where this project is most likely to fail.
