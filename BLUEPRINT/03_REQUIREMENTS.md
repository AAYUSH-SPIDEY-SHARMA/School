# 03 — Requirements

| Field | Value |
|---|---|
| **Status** | COMPLETED (discovery) — subject to revision once school identity is supplied |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | Product / Principal Architect |
| **Dependencies** | [45_RESEARCH_SOURCES](45_RESEARCH_SOURCES.md) · [04_USER_PERSONAS](04_USER_PERSONAS.md) |
| **Related Documents** | [46_TRACEABILITY_MATRIX](46_TRACEABILITY_MATRIX.md) · [08_PAGE_SPECIFICATIONS](08_PAGE_SPECIFICATIONS.md) · [17_DATABASE_SCHEMA](17_DATABASE_SCHEMA.md) · [31_TESTING_STRATEGY](31_TESTING_STRATEGY.md) |

---

## How to read this document

Every requirement has a **stable ID** (`FR-nnn` functional, `NFR-nnn` non-functional, `CR-nnn` content, `AR-nnn` admin). IDs are never reused. Every ID appears in [46_TRACEABILITY_MATRIX](46_TRACEABILITY_MATRIX.md) mapped to the decision that serves it, the document that specifies it, the implementation area, and the test that verifies it.

**Priority classification:**

| Priority | Meaning |
|---|---|
| `MUST` | v1 cannot launch without it |
| `SHOULD` | Strongly wanted in v1; may slip a release without blocking launch |
| `COULD` | Valuable if effort allows |
| `FUTURE` | Deliberately deferred; architecture must not foreclose it |
| `NOT_RECOMMENDED` | Considered and advised against, with reasoning |

**Source** indicates provenance: `USER` (stated by the owner), `RESEARCH` (derived from a research finding — finding ID given), `STANDARD` (imposed by a recognised standard), `ARCHITECT` (professional judgement).

---

## 1. Stakeholders

| Stakeholder | Primary goal | Permission level |
|---|---|---|
| Prospective parent/guardian | Evaluate the school; make contact | Public |
| Current parent/guardian | Retrieve notices, calendars, documents | Public |
| Prospective student | Sense of campus life | Public |
| Current student | Events, achievements, clubs | Public |
| Admissions staff | Receive and work enquiries | `ADMISSIONS_MANAGER` |
| Content editor (teacher/coordinator) | Publish news, notices, gallery | `EDITOR` |
| Principal / management | Oversight; represent the school | `SUPER_ADMIN` |
| Website administrator | Manage users, settings, integrity | `SUPER_ADMIN` |
| Prospective staff | Find vacancies | Public |
| Developer / maintainer | Extend and operate safely | — |

Detailed goals, frustrations, and journeys in [04_USER_PERSONAS](04_USER_PERSONAS.md) and [05_USER_JOURNEYS](05_USER_JOURNEYS.md).

---

## 2. Functional Requirements — Public Website

### 2.1 Discovery and orientation

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-001 | Homepage communicates school identity, board, and grade range above the fold | `MUST` | RESEARCH F-7 |
| FR-002 | Homepage presents an admissions section with a specific, current CTA (not a generic "Contact Us") | `MUST` | RESEARCH F-1 |
| FR-003 | Persistent primary navigation of 6 top-level items with literal labels, plus a visually distinct Admissions CTA | `MUST` | RESEARCH F-5 |
| FR-004 | Quick-links cluster distinguishing prospective-parent from current-parent destinations | `SHOULD` | RESEARCH F-6 |
| FR-005 | Quantified trust statistics band on the homepage, driven by configurable values | `MUST` | RESEARCH F-4 |
| FR-006 | Breadcrumb navigation on all pages below the top level | `SHOULD` | STANDARD |
| FR-007 | Footer with address, phone, email, map link, and grouped section links on every page | `MUST` | ARCHITECT |
| FR-008 | Site-wide search across all content types | `FUTURE` | ARCHITECT |

### 2.2 School information

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-010 | About page covering identity, history, philosophy, values | `MUST` | USER |
| FR-011 | Vision & Mission page | `MUST` | USER |
| FR-012 | Principal's message with portrait and named attribution | `MUST` | RESEARCH F-4 |
| FR-013 | Leadership page listing key staff with roles and photographs | `MUST` | USER |
| FR-014 | Infrastructure & Facilities page, image-led | `MUST` | USER |
| FR-015 | **Dedicated Safety & Security page** covering CCTV, child protection policy, emergency procedures, visitor control, medical provision | `MUST` | RESEARCH F-8 |
| FR-016 | **Dedicated Transport page** covering routes, fleet, safety measures, contact | `MUST` | RESEARCH F-8 |

> FR-015 and FR-016 exist because safety and proximity rank highly in the literature on Indian parental school choice, yet none of the four inspected Indian references surfaced safety as a findable destination.

### 2.3 Academics

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-020 | Academic overview page describing approach and structure | `MUST` | USER |
| FR-021 | Curriculum page covering subjects, methodology, assessment, CBSE alignment | `MUST` | USER |
| FR-022 | Four stage pages: Pre-Primary (Nursery/LKG/UKG), Primary (I–V), Middle (VI–VIII), Secondary (IX–X) | `MUST` | USER |
| FR-023 | Faculty directory with photograph, name, designation, department, qualifications | `MUST` | RESEARCH F-8 |
| FR-024 | Faculty directory filterable by department | `SHOULD` | ARCHITECT |
| FR-025 | Individual faculty detail pages at `/academics/faculty/[slug]` | `COULD` | ARCHITECT |

> **No Class 11–12, no streams, no senior-secondary content.** The school serves Nursery–Class 10 (`USER_APPROVED_DECISION`). This is a hard invariant enforced by the consistency audit.

### 2.4 Admissions — the conversion path

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-030 | Admissions overview page as the section hub | `MUST` | USER |
| FR-031 | Admission process presented as a numbered visual sequence | `MUST` | USER |
| FR-032 | Eligibility and age-criteria page, per entry class | `MUST` | RESEARCH F-7 |
| FR-033 | **Fee structure page with per-class tabular breakdown** | `MUST` | RESEARCH F-8 |
| FR-034 | Fee structure downloadable as PDF | `SHOULD` | USER |
| FR-035 | Important dates page for the admission cycle | `MUST` | RESEARCH F-7 |
| FR-036 | Admissions FAQ | `SHOULD` | USER |
| FR-037 | Required-documents list | `MUST` | RESEARCH F-7 |
| FR-038 | **Admission enquiry form** capturing parent and student details | `MUST` | USER |
| FR-039 | Enquiry form validated client-side and server-side from one shared schema | `MUST` | ARCHITECT |
| FR-040 | Enquiry form protected against spam and automated submission | `MUST` | STANDARD |
| FR-041 | Enquiry submission produces a clear on-screen confirmation with expected response time | `MUST` | ARCHITECT |
| FR-042 | Enquiry submission notifies the school by email | `SHOULD` | USER |
| FR-043 | Enquiry form usable and completable on a mobile phone in under two minutes | `MUST` | ARCHITECT |
| FR-044 | Online application with document upload and status tracking | `FUTURE` | USER |
| FR-045 | Online fee payment | `FUTURE` | ARCHITECT |

> FR-044/045 are explicitly deferred by owner decision (enquiry-only v1). The data model must not make them painful to add later, but no part of v1 is designed around them.

### 2.5 Campus life and media

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-050 | Student life page | `MUST` | USER |
| FR-051 | Sports page listing sports, facilities, achievements | `MUST` | USER |
| FR-052 | Clubs & activities page | `MUST` | USER |
| FR-053 | Arts & culture page | `SHOULD` | USER |
| FR-054 | Gallery organised into albums, with album detail pages | `MUST` | USER |
| FR-055 | Gallery lightbox with keyboard navigation and focus trapping | `MUST` | STANDARD |
| FR-056 | Gallery filterable by category | `SHOULD` | USER |
| FR-057 | Achievements page grouped by type (academic, sports, olympiad, cultural) | `MUST` | RESEARCH F-4 |
| FR-058 | Video gallery / virtual campus tour | `FUTURE` | RESEARCH |

### 2.6 News, events and current-parent resources

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-060 | News index with pagination and individual article pages | `MUST` | USER |
| FR-061 | Events index separating upcoming from past, with detail pages | `MUST` | USER |
| FR-062 | **Notices module, distinct from News**, reverse-chronological, with optional expiry | `MUST` | RESEARCH F-2 |
| FR-063 | **Downloads module** with categorised documents, file type and size shown | `MUST` | RESEARCH F-2 |
| FR-064 | Academic calendar page | `MUST` | USER |
| FR-065 | Notices filterable by category | `SHOULD` | RESEARCH F-2 |
| FR-066 | Latest news and upcoming events surfaced on the homepage | `MUST` | USER |
| FR-067 | Email newsletter subscription | `FUTURE` | ARCHITECT |
| FR-068 | RSS feed for news | `COULD` | ARCHITECT |

> **FR-062 is a deliberate structural decision.** News serves prospective parents (marketing). Notices serve current parents (operations). Every inspected Indian reference conflates them; the resulting page serves neither audience well.

### 2.7 Contact and trust

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-070 | Contact page with address, phone numbers, emails, office hours | `MUST` | USER |
| FR-071 | Embedded map, lazy-loaded so it does not block initial render | `MUST` | USER |
| FR-072 | Separate contact routes for admissions vs general enquiry | `SHOULD` | ARCHITECT |
| FR-073 | Click-to-call and click-to-email on mobile | `MUST` | ARCHITECT |
| FR-074 | General contact form | `SHOULD` | USER |
| FR-075 | Testimonials from parents, alumni, or students | `SHOULD` | RESEARCH F-4 |
| FR-076 | Careers/vacancies page | `COULD` | RESEARCH F-1 |

### 2.8 Legal and system pages

| ID | Requirement | Priority | Source |
|---|---|---|---|
| FR-080 | Privacy policy covering enquiry data collection and use | `MUST` | STANDARD |
| FR-081 | Website terms of use | `SHOULD` | STANDARD |
| FR-082 | Custom 404 page with helpful navigation | `MUST` | STANDARD |
| FR-083 | Custom error page for server failures | `MUST` | STANDARD |
| FR-084 | HTML sitemap page | `COULD` | ARCHITECT |
| FR-085 | Every dynamic listing has a designed empty state | `MUST` | ARCHITECT |
| FR-086 | Cookie consent banner | `COULD` | STANDARD |

> Legal copy will be drafted with a prominent notice that it **requires review by the school's legal advisor**. No fabricated compliance claims. See [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

---

## 3. Admin / CMS Requirements

| ID | Requirement | Priority | Source |
|---|---|---|---|
| AR-001 | Admin authentication at `/admin`, credentials-based | `MUST` | USER |
| AR-002 | Three roles: `SUPER_ADMIN`, `EDITOR`, `ADMISSIONS_MANAGER` | `MUST` | ARCHITECT |
| AR-003 | Role-based access enforced **server-side on every action**, not only in UI | `MUST` | STANDARD |
| AR-004 | Dashboard summarising pending enquiries and recent content activity | `MUST` | USER |
| AR-005 | Full CRUD for News, Events, Gallery albums/images, Faculty, Notices, Downloads, Achievements, Testimonials | `MUST` | USER |
| AR-005a | **Facilities** managed via Settings (`SUPER_ADMIN` only), not a standalone CRUD module | `MUST` | USER |
| AR-006 | Draft and published states for all editorial content | `MUST` | ARCHITECT |
| AR-007 | Scheduled publishing | `COULD` | USER |
| AR-008 | Image upload with automatic optimisation | `MUST` | USER |
| AR-009 | Alt text required on every uploaded image before publish | `MUST` | STANDARD |
| AR-010 | Enquiry list with status filtering and detail view | `MUST` | USER |
| AR-011 | Enquiry status transitions with timestamp and acting user recorded | `MUST` | ARCHITECT |
| AR-012 | Internal notes on an enquiry | `SHOULD` | ARCHITECT |
| AR-013 | Enquiry export to CSV | `COULD` | ARCHITECT |
| AR-014 | Editable site settings: contact details, statistics, social links, global SEO defaults | `MUST` | ARCHITECT |
| AR-015 | User management, restricted to `SUPER_ADMIN` | `MUST` | STANDARD |
| AR-016 | Audit log of content and permission changes | `MUST` | STANDARD |
| AR-017 | Content freshness indicators flagging stale items | `SHOULD` | RESEARCH F-3 |
| AR-018 | Preview of unpublished content before publishing | `SHOULD` | ARCHITECT |
| AR-019 | Media library browsable across uploads | `SHOULD` | ARCHITECT |
| AR-020 | Publish action reachable in ≤3 steps from login for a routine notice | `MUST` | RESEARCH F-3 |
| AR-021 | Full revision history with rollback | `FUTURE` | ARCHITECT |
| AR-022 | Arbitrary page builder / block editor | `NOT_RECOMMENDED` | ARCHITECT |

> **AR-022 rationale:** a general page builder trades staff usability for flexibility nobody requested. Structured content types are faster to edit, impossible to break visually, and keep the design system intact.

---

## 4. Content Requirements

| ID | Requirement | Priority | Source |
|---|---|---|---|
| CR-001 | All school-specific facts held as `[PLACEHOLDER]` tokens until supplied | `MUST` | USER |
| CR-002 | **No fabricated statistics, results, testimonials, or accreditations** | `MUST` | USER |
| CR-003 | No stock photography presented as campus imagery | `MUST` | ARCHITECT |
| CR-004 | Every image carries meaningful alt text | `MUST` | STANDARD |
| CR-005 | Published child photography has a recorded consent basis | `MUST` | ARCHITECT |
| CR-006 | Content ownership defined per module | `MUST` | RESEARCH F-3 |
| CR-007 | Freshness thresholds defined for time-sensitive content | `SHOULD` | RESEARCH F-3 |
| CR-008 | Hindi or other language content | `FUTURE` | USER |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Priority | Source |
|---|---|---|---|
| NFR-001 | Core Web Vitals measured in **field** data: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at p75 | `MUST` | STANDARD |
| NFR-002 | Usable on a mid-range Android device over 4G | `MUST` | ARCHITECT |
| NFR-003 | Images served in modern formats, correctly sized, lazy-loaded below the fold | `MUST` | STANDARD |
| NFR-004 | Client JavaScript minimised; server components by default | `MUST` | ARCHITECT |
| NFR-005 | Fonts self-hosted and preloaded; no layout shift on font swap | `MUST` | STANDARD |
| NFR-006 | Third-party embeds (map, social) lazy-loaded and never render-blocking | `MUST` | ARCHITECT |

> Lighthouse targets (Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+) are **goals, not guarantees**, and are lab proxies. Field Core Web Vitals are the real measure. See [27_PERFORMANCE](27_PERFORMANCE.md).

### 5.2 Accessibility

| ID | Requirement | Priority | Source |
|---|---|---|---|
| NFR-010 | Target WCAG 2.2 Level AA | `MUST` | STANDARD |
| NFR-011 | All functionality operable by keyboard alone | `MUST` | STANDARD |
| NFR-012 | Visible focus indicator on every interactive element | `MUST` | STANDARD |
| NFR-013 | Text contrast ≥ 4.5:1; large text and UI components ≥ 3:1 | `MUST` | STANDARD |
| NFR-014 | Semantic HTML with correct landmarks and heading order | `MUST` | STANDARD |
| NFR-015 | Form fields programmatically labelled; errors announced to assistive tech | `MUST` | STANDARD |
| NFR-016 | `prefers-reduced-motion` respected throughout | `MUST` | STANDARD |
| NFR-017 | Skip-to-content link | `MUST` | STANDARD |
| NFR-018 | Menus, dialogs, lightbox, tabs and accordions follow WAI-ARIA authoring practices | `MUST` | STANDARD |

> **Documented requirements are not verified compliance.** Actual testing is assigned to implementation. See [26_ACCESSIBILITY](26_ACCESSIBILITY.md).

### 5.3 SEO

| ID | Requirement | Priority | Source |
|---|---|---|---|
| NFR-020 | Unique title and meta description per page | `MUST` | STANDARD |
| NFR-021 | Canonical URL on every page | `MUST` | STANDARD |
| NFR-022 | OpenGraph and Twitter card metadata | `MUST` | STANDARD |
| NFR-023 | `School` structured data (JSON-LD) with address, contact, geo | `MUST` | STANDARD |
| NFR-024 | `Article`, `Event`, `BreadcrumbList`, `WebSite` structured data where applicable | `MUST` | STANDARD |
| NFR-025 | Auto-generated XML sitemap including dynamic content | `MUST` | STANDARD |
| NFR-026 | `robots.txt` excluding `/admin` from indexing | `MUST` | STANDARD |
| NFR-027 | Clean, human-readable, stable URLs | `MUST` | STANDARD |
| NFR-028 | **Slug changes issue a 301 from the previous URL** | `MUST` | ARCHITECT |
| NFR-029 | Global SEO defaults configurable without a deploy | `MUST` | ARCHITECT |
| NFR-030 | Server-rendered content indexable without JavaScript execution | `MUST` | STANDARD |

### 5.4 Security and privacy

| ID | Requirement | Priority | Source |
|---|---|---|---|
| NFR-040 | Passwords stored using a modern memory-hard hash | `MUST` | STANDARD |
| NFR-041 | Sessions use secure, httpOnly, sameSite cookies | `MUST` | STANDARD |
| NFR-042 | All state-changing operations protected against CSRF | `MUST` | STANDARD |
| NFR-043 | All user input validated and sanitised server-side | `MUST` | STANDARD |
| NFR-044 | Database access exclusively parameterised | `MUST` | STANDARD |
| NFR-045 | Uploads restricted by type and size; content type verified, not trusted | `MUST` | STANDARD |
| NFR-046 | Rate limiting on enquiry submission and login | `MUST` | STANDARD |
| NFR-047 | Brute-force protection with progressive delay or lockout | `MUST` | STANDARD |
| NFR-048 | No secrets in source control; `.env.example` carries no real values | `MUST` | STANDARD |
| NFR-049 | Security headers set: CSP, HSTS, X-Content-Type-Options, Referrer-Policy | `MUST` | STANDARD |
| NFR-050 | Enquiry PII access restricted to authorised roles and logged | `MUST` | STANDARD |
| NFR-051 | Defined retention period and deletion process for enquiry data | `MUST` | STANDARD |
| NFR-052 | EXIF and geolocation stripped from uploaded images | `MUST` | ARCHITECT |
| NFR-053 | Error messages never leak stack traces or internals to users | `MUST` | STANDARD |
| NFR-054 | Two-factor authentication for admin | `FUTURE` | STANDARD |

> NFR-052 matters specifically because photographs of children can carry GPS coordinates identifying the campus or a home address.

### 5.5 Reliability and operations

| ID | Requirement | Priority | Source |
|---|---|---|---|
| NFR-060 | Automated daily database backup | `MUST` | STANDARD |
| NFR-061 | **Documented and executed restore test** before launch | `MUST` | ARCHITECT |
| NFR-062 | Application errors captured with enough context to diagnose | `MUST` | STANDARD |
| NFR-063 | Failed enquiry submissions logged and alerted — a lost enquiry is a lost admission | `MUST` | ARCHITECT |
| NFR-064 | Uptime monitoring with alerting | `SHOULD` | STANDARD |
| NFR-065 | Separate development, staging (`SHOULD`) and production environments | `MUST` / `SHOULD` | ARCHITECT |
| NFR-066 | Staging excluded from search indexing | `MUST` | STANDARD |

### 5.6 Maintainability

| ID | Requirement | Priority | Source |
|---|---|---|---|
| NFR-070 | TypeScript `strict` mode | `MUST` | ARCHITECT |
| NFR-071 | Consistent linting and formatting, enforced in CI | `SHOULD` | ARCHITECT |
| NFR-072 | Component reuse; no duplicated card or form implementations | `MUST` | ARCHITECT |
| NFR-073 | Design tokens centralised; no ad-hoc hex values in components | `MUST` | ARCHITECT |
| NFR-074 | Blueprint kept in sync with implementation; drift recorded in HISTORY | `MUST` | USER |

---

## 6. Explicitly Rejected

| Item | Classification | Reasoning |
|---|---|---|
| Microservices | `NOT_RECOMMENDED` | One team, one deployable, modest traffic. Adds operational burden with no benefit |
| Kubernetes | `NOT_RECOMMENDED` | Serverless hosting is already chosen; container orchestration solves a problem this project does not have |
| Redis / separate cache | `NOT_RECOMMENDED` | Framework-level caching and CDN suffice at this scale. Revisit only on evidence |
| GraphQL | `NOT_RECOMMENDED` | Single known client. Server components remove the over-fetching problem GraphQL solves |
| Separate backend service | `NOT_RECOMMENDED` | Doubles deployment and auth surface for no gain at this scale |
| Headless CMS (Sanity, Payload, Strapi) | `NOT_RECOMMENDED` | Adds cost and a second system for staff to learn; content types are known and stable |
| Role/Permission join tables | `NOT_RECOMMENDED` | Three fixed roles. An enum is simpler and sufficient |
| Comments on news/gallery | `NOT_RECOMMENDED` | Moderation burden and safeguarding risk on a site involving minors |
| AI chatbot in core scope | `FUTURE` | Must justify itself on parent value; not a dependency of the core site |

---

## 7. Open Requirement Questions

Tracked in [39_OPEN_DECISIONS](39_OPEN_DECISIONS.md).

1. Does content require review-before-publish, or is direct publish acceptable? Depends on how many staff hold editor access.
2. Is Hindi content expected at launch?
3. Should the fee page show real amounts or direct to a downloadable PDF only?
4. Are transport routes published publicly, or shared only with admitted families?
5. What is the school's enquiry-data retention period, and who owns that decision?
6. Is a careers/vacancies section wanted at launch?
7. Does the school already run an ERP/parent portal this site must link to rather than duplicate?
