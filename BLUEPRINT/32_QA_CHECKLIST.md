# 32 — QA Checklist

| Field | Value |
|---|---|
| **Status** | NOT_STARTED — checklist defined, nothing to verify yet |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | QA |
| **Dependencies** | [31_TESTING_STRATEGY](31_TESTING_STRATEGY.md) |
| **Related Documents** | [26_ACCESSIBILITY](26_ACCESSIBILITY.md) · [28_SECURITY](28_SECURITY.md) · [30_DEPLOYMENT](30_DEPLOYMENT.md) |

---

## How to use this document

This is the **manual verification checklist** run before launch and before significant releases. Automated coverage is in [31_TESTING_STRATEGY](31_TESTING_STRATEGY.md); this covers what automation cannot.

**Recording rule:** every run is dated, with the verifier named and **failures recorded rather than omitted**. A dated failing result is more useful than an undated claim of success — it tells the next person what to re-check.

```
Run date: ____________   Verifier: ____________   Build/commit: ____________
```

Nothing below has been run. The repository contains no application code.

---

## 1. Content integrity — run first

If any of these fail, the release stops regardless of everything else.

- [ ] **No `[PLACEHOLDER]` token appears on any public page**
- [ ] **No fabricated statistic, result, or accreditation** — every figure confirmed with the school
- [ ] No stock photography presented as campus imagery
- [ ] All testimonials are real, attributed, and permitted
- [ ] Safety page claims verified with the school — nothing asserted that does not exist
- [ ] Fee figures confirmed current by the school
- [ ] Admission dates and cycle status current
- [ ] Contact details correct — **phone number actually dialled and answered**
- [ ] Legal pages reviewed by the school's legal advisor
- [ ] Copyright year correct

> The phone-number check is not pedantry. A wrong number on a school website silently loses every parent who tries to call.

---

## 2. Functional

### Navigation
- [ ] All 6 primary items and their dropdowns work
- [ ] Admissions CTA present and working on **every** page, desktop and mobile
- [ ] Utility bar links work
- [ ] Mobile drawer opens, closes, traps focus, returns focus
- [ ] Admissions CTA and click-to-call remain **outside** the hamburger on mobile
- [ ] Footer links all resolve
- [ ] Breadcrumbs correct on every page below top level
- [ ] Active page indicated
- [ ] No broken internal links (crawler run)
- [ ] No broken external links

### Pages
- [ ] All 37 static routes render
- [ ] All 4 dynamic patterns render for real content
- [ ] Fee table renders and scrolls correctly at every breakpoint
- [ ] Faculty filter works; full list present with JS disabled
- [ ] Gallery lightbox opens, navigates, closes, restores focus
- [ ] Notices filter and pagination work
- [ ] Expired notices hidden
- [ ] Downloads show file type and size; download correctly on mobile
- [ ] Academic calendar renders
- [ ] Map lazy-loads only on interaction

### Enquiry — the conversion path
- [ ] Form submits successfully end to end
- [ ] Confirmation states expected response time
- [ ] **Notification email arrives at the school**
- [ ] Enquiry appears in admin with status `NEW`
- [ ] Validation errors specific and inline
- [ ] Honeypot submission rejected
- [ ] Rate limit triggers and recovers
- [ ] **Simulated failure shows the phone fallback and preserves typed values**
- [ ] Class dropdown contains Nursery–Class 10 **only**
- [ ] Consent checkbox required and unticked by default
- [ ] Works with JavaScript disabled

### Admin
- [ ] Login and logout work
- [ ] **A notice can be published in under 3 minutes by someone who has not seen the CMS before**
- [ ] Draft, preview, publish all work
- [ ] Bulk image upload works
- [ ] Alt text enforced before publish
- [ ] Published content appears publicly **immediately** — no repeated publishing needed
- [ ] Enquiry status transitions record actor and timestamp
- [ ] Internal notes save with author
- [ ] Settings changes reflect on the public site
- [ ] Audit log records actions and contains **no enquiry PII**
- [ ] Freshness warnings appear for stale content

> The 3-minute test must be run with a genuinely unfamiliar person, ideally a teacher. A developer testing their own CMS proves nothing about whether staff can use it.

---

## 3. Responsive

Verify at: **320 · 375 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920 px**

- [ ] No horizontal page scroll at any width — the fee table's own scroll container excepted
- [ ] Text readable without zoom on mobile
- [ ] Tap targets ≥44×44px
- [ ] Images scale correctly, no distortion
- [ ] Card grids reflow correctly
- [ ] Footer stacks correctly
- [ ] Hero readable at every width
- [ ] Fee table usable on a 320px screen
- [ ] Tested on a **real** iOS device and a **real** mid-range Android device, not only an emulator

---

## 4. Accessibility

⚠️ Automated tools catch roughly a third of issues. **Sections 4.2 and 4.3 are not optional.**

### 4.1 Automated
- [ ] axe-core clean on all page templates
- [ ] axe-core clean with menu open, lightbox open, form in error state
- [ ] HTML validates
- [ ] Contrast measured against the **real** palette, not the provisional one

### 4.2 Keyboard — no mouse
- [ ] All six critical journeys completable
- [ ] Skip link is first focusable and works
- [ ] Focus visible on every interactive element
- [ ] Logical focus order
- [ ] Dropdowns keyboard-operable
- [ ] Drawer traps focus; `Escape` closes; focus returns
- [ ] Lightbox traps focus; `Escape` closes; focus returns to the thumbnail
- [ ] Fee table scroll container reachable and scrollable
- [ ] Form completable and submittable
- [ ] No keyboard trap anywhere

### 4.3 Screen reader
- [ ] NVDA (Windows) — homepage, admissions, enquiry form, notices
- [ ] VoiceOver (iOS) — same
- [ ] Headings convey structure
- [ ] Landmarks present and labelled
- [ ] Images have meaningful alt text; **no child named in alt text**
- [ ] Form labels announced
- [ ] Errors announced on validation failure
- [ ] Statistics announce final values, not a counting animation
- [ ] Link purpose clear from link text alone

### 4.4 Other
- [ ] 200% zoom — no loss of content or function
- [ ] Reduced motion — all animation disabled, content still visible
- [ ] Colour-blindness simulation — no meaning lost
- [ ] JavaScript disabled — content readable, navigation usable, form submittable

---

## 5. Performance

- [ ] Tested on a **real mid-range Android on a throttled connection**
- [ ] LCP element identified per template and optimised
- [ ] Only the hero carries `priority`
- [ ] **No layout shift on load** — verified visually and measured
- [ ] Images correctly sized for viewport
- [ ] Gallery lazy-loads; full images fetched only on lightbox open
- [ ] Fonts do not cause a visible shift on swap
- [ ] Map does not load until requested
- [ ] Bundle within budget
- [ ] Real-user monitoring active and reporting

---

## 6. SEO

- [ ] Every page has a unique title and description
- [ ] Canonicals absolute and correct
- [ ] `School` structured data validates with **real** details
- [ ] `Article`, `Event`, `BreadcrumbList` validate
- [ ] Sitemap generates, includes dynamic content, excludes drafts
- [ ] robots.txt disallows `/admin` and `/api`
- [ ] **Staging and preview confirmed `noindex`**
- [ ] Slug-change 301 verified end to end
- [ ] Shortcut redirects (`/fees`, `/faculty`) work
- [ ] OG images render correctly when shared in a messaging app
- [ ] Content indexable with JavaScript disabled
- [ ] Search Console verified, sitemap submitted

---

## 7. Security

- [ ] **Every Server Action authenticates and authorises — verified by direct invocation**
- [ ] `EDITOR` cannot reach enquiry data by any route
- [ ] `ADMISSIONS_MANAGER` cannot modify content
- [ ] Unauthenticated action invocation fails
- [ ] Deactivated user's session stops working immediately
- [ ] Upload rejects SVG, executables, mislabelled and oversized files
- [ ] **EXIF stripping verified on a real GPS-tagged photograph**
- [ ] Rate limits verified live
- [ ] Security headers present; CSP does not break the site
- [ ] HTTPS enforced; HSTS active
- [ ] **No secrets in git history — scanned, not assumed**
- [ ] `.env.example` contains names only, no realistic values
- [ ] Errors expose no stack traces or internals
- [ ] Password hashing confirmed argon2id
- [ ] Dependency audit clean of high/critical

---

## 8. Data and operations

- [ ] **Backup running on schedule**
- [ ] **Restore actually performed and verified** — not merely configured
- [ ] Migrations tested on a copy before production
- [ ] Error monitoring receiving events
- [ ] **Alert fires on a simulated failed enquiry**
- [ ] Uptime monitoring active
- [ ] Health endpoint returns correctly and leaks nothing

---

## 9. Handover

- [ ] Staff trained on the CMS
- [ ] Content ownership assigned per module ([47_CONTENT_GOVERNANCE](47_CONTENT_GOVERNANCE.md))
- [ ] Admin credentials handed over; initial passwords changed
- [ ] **Domain and hosting accounts owned by the school**
- [ ] **Billing on the school's payment method**
- [ ] Incident contacts documented
- [ ] Blueprint updated to match what was built
- [ ] Launch recorded in HISTORY

> The domain and billing items are recurring causes of institutional websites disappearing a year or two after launch. They are QA items, not administrative afterthoughts.

---

## Sign-off

| Area | Verifier | Date | Result |
|---|---|---|---|
| Content integrity | | | |
| Functional | | | |
| Responsive | | | |
| Accessibility | | | |
| Performance | | | |
| SEO | | | |
| Security | | | |
| Data & operations | | | |
| Handover | | | |

**Launch requires content integrity, accessibility, security, and data/operations to pass.** The remainder may launch with recorded, accepted exceptions — but exceptions must be written down, not tacitly waived.
