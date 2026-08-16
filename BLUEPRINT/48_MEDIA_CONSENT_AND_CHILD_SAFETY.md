# 48 — Media Consent and Child Safety

| Field | Value |
|---|---|
| **Status** | PROPOSED — technical controls specified; **school process required** |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product / School Management |
| **Dependencies** | [22_MEDIA_AND_STORAGE](22_MEDIA_AND_STORAGE.md) · [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) |
| **Related Documents** | [28_SECURITY](28_SECURITY.md) · [47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md) · [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) |

---

## Why this document exists

A school website's gallery is full of photographs of identifiable children. That single fact makes media handling a **safeguarding** concern, not a content-management concern.

This was a genuine omission in the first draft of this blueprint — media was filed under generic storage, and consent, metadata, and takedown were absent. It was raised in review and corrected ([CHANGE-0007](../HISTORY/2026/08/CHANGE-0007-REVIEW-CORRECTIONS.md)).

### The specific risks

| Risk | Detail |
|---|---|
| **Location disclosure** | Phone photographs commonly embed GPS coordinates. A gallery image can publish the exact location of a classroom — or, if a parent contributed an image taken at home, a residential address |
| **Identification** | A photograph plus a name plus a class makes a child identifiable to a stranger |
| **Protective situations** | Some children must not be publicly identifiable — custody disputes, protection orders, witness situations. **The school knows which; the website cannot** |
| **Withdrawn consent** | Consent given at admission may be withdrawn later, and must be actionable |
| **Permanence** | A published image may be copied, cached, and indexed. Removal from the site does not undo distribution |

The last point is why controls must operate **before** publication. Nothing here can be fixed reliably afterwards.

---

## ⚠️ Division of responsibility

**This document specifies technical controls. It does not, and cannot, establish the school's legal obligations.**

| Ours | The school's |
|---|---|
| Strip metadata at upload | Obtain and record consent from parents |
| Record a consent basis against each asset | Decide which children must never be photographed |
| Flag images containing minors | Maintain the exclusion list |
| Restrict who can upload | Train staff |
| Provide an expedited takedown path | Respond to withdrawal requests |
| Prevent names in alt text | Determine what the law requires |

⚠️ **Applicable law is a question for the school's legal advisor.** This blueprint deliberately does not assert what is legally required (OD-018). A technical control is not a substitute for a consent process — if the school has no process, no amount of engineering makes publication appropriate.

---

## Consent

### Model

> ⚠️ **WORKING ASSUMPTION — not verified for this school.** The statement below describes a common arrangement, not evidence about `[SCHOOL_NAME]`. The school's actual consent practice is an outstanding question in [51_SCHOOL_ASSET_REQUEST](51_SCHOOL_ASSET_REQUEST.md) §A13, and **must be confirmed before any photograph of an identifiable child is published.** If no consent process exists, that is a finding to resolve, not a formality.

Schools commonly obtain a blanket media consent at admission. Where that is the arrangement, it is workable — but only if it is **recorded**, **revocable**, and **checkable at publication time**.

| Requirement | Detail |
|---|---|
| Recorded | Consent status per student, held by the school |
| Specific | Consent for *website publication* — not assumed from consent for internal use |
| Revocable | Withdrawal must be simple and actioned promptly |
| Checkable | Staff can determine, before publishing, whether a child may appear |
| **Exclusion list** | ⚠️ **The school maintains a list of children who must not be photographed or published.** This is the single most important control in this document |

### At upload
`MediaAsset` carries two fields ([17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md)):

- `containsMinors` — boolean, set by the uploader
- `consentBasis` — free text recording the basis (e.g. "Admission media consent 2026-27; exclusion list checked 2026-08-14")

The uploader confirms the consent basis before an image containing minors can be published. This is a deliberate friction point: it makes the person publishing pause and think, which is the only control that actually catches an exclusion-list child.

> The system cannot verify consent — it has no student records and no exclusion list. It can only ensure the question is asked and the answer recorded, and make the responsible person identifiable afterwards.

---

## Metadata stripping — mandatory

**All EXIF and geolocation data is stripped at upload. No exceptions, no opt-out** (NFR-052).

```
Upload → strip EXIF, GPS, device identifiers, timestamps → store
```

Verification is not optional: **tested with a real GPS-tagged photograph** before launch ([32_QA_CHECKLIST](32_QA_CHECKLIST.md) §7). Configuring stripping and confirming it works are different things.

---

## Publication rules

| Rule | Detail |
|---|---|
| **Alt text** | Describe the **activity**, never name a child. Alt text is machine-readable and indexable |
| **Captions** | Avoid full names of students. Class or year group is acceptable |
| **Achievements** | ⚠️ Naming a student publicly is a privacy decision. Where a full name is used, consent must be specific |
| **File names** | Never contain a child's name — file names appear in URLs |
| **Close-ups** | Prefer activity and group shots over identifiable individual portraits |
| **Uniform and identifiers** | Be conscious that uniform plus location identifies a school |
| **Contact details** | Never publish a student's contact information in any form |

### The achievements tension
Recognising students by name is genuinely good for the child and the school, and it is a trust signal parents value (F-4). It is also the highest-identification-risk content on the site.

**`RECOMMENDATION`:** name students in achievements **only** with specific consent for that recognition, and prefer first name plus class where full identification is not necessary. This is a judgement call for the school, and it should be made deliberately rather than by default.

---

## Access control

| Action | Who |
|---|---|
| Upload media | `EDITOR`, `SUPER_ADMIN` |
| Publish images containing minors | `EDITOR`, `SUPER_ADMIN` — with consent basis recorded |
| Delete own uploads | `EDITOR` |
| Delete any media | `SUPER_ADMIN` |
| **Execute a takedown** | `SUPER_ADMIN` — expedited |

`ADMISSIONS_MANAGER` has no media rights. Every upload and deletion is audited.

---

## Takedown

A **separate and faster path** than normal deletion. A safeguarding takedown must not wait on a 30-day soft-delete window.

```
Request received  (parent, staff, or management)
      ↓
IMMEDIATE: unpublish the album or image  ← minutes, not days
      ↓
Confirm to the requester
      ↓
Purge from the media provider and its CDN cache
      ↓
Record: date, requester, asset, reason, action
      ↓
Update the consent record so it is not republished
```

### Requirements
- Any parent can request removal without justifying it
- A published contact route for such requests
- **No debate at the point of request.** Remove first, discuss afterwards if needed
- The final step matters: removing an image without updating the consent record means the same photograph is republished after the next sports day

### Priority
A takedown request concerning a child's safety is **P1** and takes precedence over any other work.

---

## Third-party and social

| Situation | Rule |
|---|---|
| Social media embeds | **Avoided.** They leak visitor data to third parties and place child imagery outside our controls ([27_PERFORMANCE](27_PERFORMANCE.md), [29_ANALYTICS](29_ANALYTICS.md)) |
| Media CDN | Assets are public by URL. Unpublishing must include a provider purge |
| Search indexing | Gallery images may be indexed. Alt text and file names must assume this |
| **Automated image tagging / face recognition** | **`NOT_RECOMMENDED`.** Applying face recognition to photographs of children raises consent questions far beyond the convenience it offers |

---

## Verification

Technical checks, in [32_QA_CHECKLIST](32_QA_CHECKLIST.md):

- [ ] EXIF stripping verified with a real GPS-tagged photograph
- [ ] `containsMinors` and `consentBasis` captured at upload
- [ ] Alt text required before publish
- [ ] Upload restricted to `EDITOR`+
- [ ] Takedown path tested end to end, including provider purge
- [ ] Media actions audited
- [ ] No child name in any alt text or file name

Process checks, for the school:

- [ ] Consent basis documented and current
- [ ] **Exclusion list exists and is known to whoever uploads**
- [ ] Staff trained on these rules
- [ ] Takedown contact published
- [ ] Named person responsible for safeguarding decisions

> ⚠️ **The process checks matter more than the technical ones.** Every technical control here can be satisfied while still publishing a photograph of a child who should never have appeared — because only the school knows who that is.

---

## Residual risk

**Medium, and it cannot be engineered to Low.**

The system can strip metadata, force the consent question, restrict uploads, audit actions, and remove images quickly. It cannot know which child is on an exclusion list, cannot verify that consent was genuinely obtained, and cannot recall an image already copied elsewhere.

The controls reduce likelihood and limit damage. **The school's process is what actually prevents harm** — and that should be stated plainly at handover rather than left implicit ([40_RISKS_AND_MITIGATIONS](40_RISKS_AND_MITIGATIONS.md) R-05).
