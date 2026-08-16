# 02 — Product Vision

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery) |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product |
| **Dependencies** | [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) |
| **Related Documents** | [01_PROJECT_OVERVIEW](01_PROJECT_OVERVIEW.md) · [03_REQUIREMENTS](03_REQUIREMENTS.md) · [10_DESIGN_SYSTEM](10_DESIGN_SYSTEM.md) · [29_ANALYTICS](29_ANALYTICS.md) |

---

## Vision statement

> When a parent opens this website on their phone, they should within thirty seconds be able to tell what kind of school this is, whether their child is eligible, roughly what it costs, and how to start a conversation — and the experience should make them believe the school is careful, modern, and worth trusting with their child.

---

## The strategic bet

Most school websites are **brochures**. This one is a **decision-support tool**.

A brochure asserts quality. A decision-support tool answers the questions a parent is actually holding: *Is it near enough? Can we afford it? Is my child the right age? Is it safe? Are the teachers any good? What happens next?*

The research supports this framing: parent search is staged (informational → discovery → comparative → transactional → navigational), and a site that only performs institutional self-description serves just the first stage. See [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) F-7.

---

## Design philosophy

**Premium · academic · modern · trustworthy — never childish.**

A school website's aesthetic is a trust signal, and it is aimed at the *parent*, not the child. Bright primary colours and clip-art communicate "playschool" to an adult evaluating where their ten-year-old will study for the next six years. The target register is closer to a well-designed university or cultural institution: generous whitespace, confident typography, real photography, restrained motion.

Concretely:

| Principle | In practice |
|---|---|
| **Photography carries the emotion** | Real children, real classrooms, real campus. Layouts are built to make good photography look good — and to fail visibly if photography is missing, rather than papering over it with stock imagery |
| **Typography carries the authority** | Strong hierarchy, large display type, comfortable reading measure |
| **Whitespace signals confidence** | Cramped layouts read as cheap. Space reads as considered |
| **Motion is a seasoning** | Subtle entrance transitions, hover elevation, counting statistics. No parallax spectacle. It is a school, not a product launch |
| **Every page has one obvious next step** | A page with no call to action is a dead end |

---

## Product principles

These are tie-breakers. When two options are both defensible, these decide.

**1. The parent's question beats the school's pride.**
Schools want to talk about vision, legacy, and philosophy. Parents want to know fees, safety, timings, and eligibility. Both belong on the site; when they compete for the same space, the parent's question wins.

**2. Findable beats comprehensive.**
A fee table three clicks deep is worth less than a smaller one that parents actually reach. Depth is not the same as usefulness.

**3. Current parents are not an afterthought.**
They are the school's existing customers and its loudest word-of-mouth channel. A parent who cannot find the holiday list is a parent who tells other parents the school is disorganised. This is why Notices and Downloads are core modules, not a footer link. *(F-2)*

**4. If staff can't update it, it will be wrong within a year.**
The observed failure mode is a live homepage carrying a six-year-old notice. Editing must be simple enough that a teacher with no technical training can publish a notice in under three minutes. *(F-3)*

**5. Never fabricate.**
No invented statistics, no stock photos posing as campus imagery, no placeholder legal text presented as policy. A false board-result figure on a real school's website is a misrepresentation to families making a decision about their child. Placeholders stay visibly placeholder until the school supplies real values.

**6. Accessible by construction, not by remediation.**
Semantic HTML, keyboard operability, and contrast are decided at design time. Retrofitting accessibility costs several times more and produces worse results.

**7. Simple architecture is a feature.**
This system may eventually be maintained by a single developer, or handed to a local agency. Every piece of infrastructure added is a piece someone must understand, pay for, and keep running. Complexity must earn its place.

---

## What success looks like

### For a prospective parent
They find the school through search, understand within a minute whether it fits, get their fee and eligibility questions answered without phoning, and submit an enquiry from their phone in under two minutes.

### For a current parent
They find the holiday list, the exam schedule, or the latest circular in under thirty seconds, on mobile, without logging in.

### For school staff
They publish a notice in under three minutes without contacting a developer, and can see at a glance which enquiries need a follow-up call.

### For the school
The website becomes the top result for its own name, produces a steady stream of qualified enquiries, and reduces routine phone calls about fees, timings, and documents.

---

## Measurable outcomes

Targets are directional and should be re-baselined once real traffic exists. See [29_ANALYTICS](29_ANALYTICS.md).

| Outcome | Signal |
|---|---|
| Parents can act | Enquiry submissions per month; homepage → admissions CTA click rate |
| Information is findable | Fee-page reach rate; low search-refinement and back-navigation |
| Trust is established | Session depth on About/Safety/Faculty; return visits before enquiring |
| Content stays alive | Days since last publish, per module; count of items past their freshness threshold |
| Site is fast | Core Web Vitals (LCP, INP, CLS) in **field** data, not lab scores |
| Site is discoverable | Ranks first for the school's own name; impressions on "CBSE school [locality]" queries |

**Explicitly not a target:** time on site. A parent who finds the fee structure in fifteen seconds and leaves satisfied is a success, not a bounce.

---

## Anti-goals

Things this product deliberately will not be.

| Anti-goal | Why |
|---|---|
| A student information system | Attendance, marks, timetables, homework belong in a school ERP. Overlapping creates two sources of truth |
| A parent portal | Requires parent accounts and student PII. Not in v1 scope; see [23_ADMISSIONS_SYSTEM](23_ADMISSIONS_SYSTEM.md) |
| A social network | Comments and profiles on a site involving minors create moderation and safeguarding burden with no benefit |
| A general-purpose CMS | The admin manages *this school's* known content types. Arbitrary page building would trade staff usability for flexibility nobody asked for |
| An AI showcase | AI features are classified `FUTURE` and must justify themselves on parent value, not novelty |
| A design award entry | Motion and effects serve comprehension. If an animation makes a page harder to read on a mid-range Android phone, it loses |

---

## Positioning against the references

Derived from direct inspection ([45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) §3).

| Where references fall short | Our position |
|---|---|
| Admissions absent or buried on the homepage *(all 4 Indian references)* | Homepage section + persistent nav CTA + short enquiry form |
| "Contact Us" as the admissions CTA | A specific, current CTA: "Enquire about Admissions 2026–27" |
| Abstract nav labels ("Glimpses", "Happenings") | Literal labels a scanning parent can parse instantly |
| 14 flat top-level items | 6 grouped items plus a distinct Admissions CTA |
| Notices mixed into general news | Separate modules for separate audiences |
| Six-year-old content live in production | Freshness tracking and content ownership |
| Safety mentioned only inside infrastructure copy | A dedicated, findable Safety & Security page |

**Where the references are right, we copy them without embarrassment:** quantified trust statistics, accreditation display, principal's message with a real photograph, and university/board results as social proof. These recur across every strong reference site.

---

## Non-negotiables

Constraints that may not be traded away for speed or aesthetics.

1. No fabricated school data reaches production.
2. No photograph of an identifiable child is published without a recorded consent basis ([48_MEDIA_CONSENT_AND_CHILD_SAFETY](48_MEDIA_CONSENT_AND_CHILD_SAFETY.md)).
3. Enquiry data is personal data and is treated as such — minimised, access-controlled, retained on a defined schedule.
4. The site is fully operable by keyboard.
5. The site is usable on a mid-range Android phone over a 4G connection.
6. No admin action that changes public content goes unlogged.
