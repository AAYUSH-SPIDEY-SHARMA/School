# 31 — Testing Strategy

| Field | Value |
|---|---|
| **Status** | PROPOSED — no tests exist |
| **Blueprint Version** | 0.2.0 |
| **Last Updated** | 2026-08-16 |
| **Owner** | QA / Engineering |
| **Dependencies** | [05_USER_JOURNEYS](05_USER_JOURNEYS.md) · [19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md) |
| **Related Documents** | [32_QA_CHECKLIST](32_QA_CHECKLIST.md) · [26_ACCESSIBILITY](26_ACCESSIBILITY.md) · [46_TRACEABILITY_MATRIX](46_TRACEABILITY_MATRIX.md) |

---

## Testing philosophy

Test what breaks, what costs money when it breaks, and what nobody would notice breaking.

A school website is not a system where exhaustive unit coverage pays. Most of it is server-rendered content. The risk concentrates in a small number of places:

| Risk area | Why it matters |
|---|---|
| **Enquiry submission** | A silent failure loses admissions the school never learns about |
| **Authorisation** | An `EDITOR` reaching parent PII is a data breach |
| **Publishing** | If the CMS breaks, content rots — the exact failure this project exists to fix |
| **Accessibility** | An unusable form is a parent who cannot make contact |
| **Slug redirects** | Silent SEO and link loss, invisible until traffic drops |

**Coverage percentage is not a goal.** A project can hit 90% coverage and still ship a broken enquiry form.

---

## Test layers

```
        ╱ E2E ╲            6 critical journeys
      ╱─────────╲
    ╱ Integration ╲        Server Actions, queries, auth
  ╱─────────────────╲
╱     Unit           ╲     Validation, utilities, formatting
───────────────────────
   Static: TypeScript strict + lint    ← catches most of it, free
```

TypeScript in `strict` mode is the largest single defect-prevention measure and costs nothing per test.

---

## Unit tests

**Tooling:** Vitest + Testing Library.

**What is tested:**
- Zod validation schemas — especially the enquiry schema, including boundary and malformed input
- Slug generation, including collisions and non-Latin input
- Date and currency formatting
- Fee calculation and display logic
- Freshness threshold computation
- Pure utility functions

**What is not unit-tested:** presentational components with no logic · framework behaviour · third-party libraries.

Testing that a card renders a title is cost without benefit. Testing that a phone number regex rejects a 9-digit number is worth it.

---

## Integration tests

The highest-value layer for this project — most real defects live at the boundary between action, authorisation, and database.

**Tooling:** Vitest against a real test database (a disposable branch, never mocks of the ORM).

### Required coverage

**Authorisation — the highest-value security tests**
1. **Every Server Action invoked with each of the three roles**, asserting permit/deny — including **direct invocation without visiting the corresponding page**
2. `EDITOR` cannot read enquiry data by any route
3. `ADMISSIONS_MANAGER` cannot create, edit, or delete content
4. Unauthenticated invocation of every action fails
5. A deactivated user's session stops working
6. A role change takes effect without re-login

> Test 1 directly tests the boundary that `proxy.ts` does **not** provide. It is the single most valuable security test in the project ([19_AUTHORIZATION_AND_ROLES](19_AUTHORIZATION_AND_ROLES.md)).

**Enquiry**
- Valid submission persists with status `NEW` and a consent timestamp
- Invalid input rejected with field-level errors
- Honeypot submission rejected
- Rate limit enforced
- **Email failure does not prevent persistence** — the enquiry survives
- Status transitions record actor and timestamp

**Content**
- Draft content absent from public query results — **not merely hidden**
- Soft-deleted content absent from public queries
- Expired notices absent from public queries
- Publishing invalidates the correct cache tags
- **Slug change writes `SlugHistory` and the old URL 301s**

**Data integrity**
- Unique constraints enforced
- Cascade and set-null behaviour matches specification
- `endDate >= startDate` enforced

---

## End-to-end tests

**Tooling:** Playwright. One suite per critical journey ([05_USER_JOURNEYS](05_USER_JOURNEYS.md)).

| Suite | Journey | Covers |
|---|---|---|
| `admissions-enquiry.spec` | J1, J5 | Home → admissions → fees → enquire → submit → confirmation. Includes the **closed-cycle** state |
| `notices-downloads.spec` | J3 | Utility bar → notices → filter → download; expired notice hidden |
| `admin-publish.spec` | J7 | Login → new notice → draft → preview → publish → visible publicly |
| `admin-enquiry-workflow.spec` | J8 | Enquiry appears → status transitions → note added → actor recorded |
| `contact.spec` | J4 | Contact page, click-to-call, click-to-email, lazy map |
| `error-states.spec` | J10 | 404, empty listings, form validation, **enquiry submission failure showing the phone fallback** |

Run against a real browser on both a desktop and a mobile viewport. E2E is slow and brittle by nature — six suites covering the journeys that matter is the right amount. More would be maintained badly and eventually ignored.

---

## Accessibility testing

**Automated (CI):** axe-core on every page and key interaction state — menu open, lightbox open, form error state.

⚠️ **Automated tools catch roughly a third of issues. Passing them is not evidence of accessibility.**

**Manual — required, cannot be automated** ([26_ACCESSIBILITY](26_ACCESSIBILITY.md)):
1. Keyboard-only walkthrough of all six critical journeys
2. Screen reader passes — NVDA and VoiceOver (iOS), since the audience is mobile-heavy
3. 200% zoom on every template
4. 320px width, no horizontal page scroll
5. Reduced-motion enabled
6. Colour-blindness simulation
7. JavaScript disabled

Results are **dated and recorded**, including failures, in [32_QA_CHECKLIST](32_QA_CHECKLIST.md).

---

## Performance testing

| Test | When |
|---|---|
| Lighthouse CI | Every PR — regression detection |
| Bundle budget | Every PR — build fails if exceeded |
| **Real mid-range Android on a throttled connection** | Pre-launch, then periodically |
| Field Core Web Vitals | Continuously post-launch |

> Testing on a developer laptop over office wifi produces numbers that are pleasant and meaningless. Field data is the target ([27_PERFORMANCE](27_PERFORMANCE.md)).

---

## Security testing

| Test | Coverage |
|---|---|
| Authorisation matrix | Integration tests above — the primary control |
| Upload validation | SVG rejected, executables rejected, mislabelled file rejected, oversized rejected |
| **EXIF stripping** | Verified with a real photograph containing GPS data |
| Rate limiting | Verified live per endpoint |
| Secret scanning | CI, every commit |
| Dependency audit | CI |
| Security headers | Verified against the deployed site |
| Penetration test | `SHOULD` before launch if budget allows — not assumed |

---

## Test data

⚠️ **Test fixtures contain no real personal data and no plausible-looking fake school data.**

Enquiry fixtures use obviously synthetic values (`test.parent@example.test`). Content fixtures use visible placeholder text. This prevents two distinct failures: real parent data leaking into a repository, and fake school statistics being mistaken for real ones and reaching production (CR-002).

Each test seeds and tears down its own data. Tests are independent and order-agnostic.

---

## CI gates

| Stage | Blocks merge |
|---|---|
| Typecheck | ✅ |
| Lint | ✅ |
| Unit + integration | ✅ |
| Build | ✅ |
| Bundle budget | ✅ |
| E2E | ✅ |
| axe-core | ✅ |
| Lighthouse CI | ⚠️ Warns |
| Dependency audit | ✅ high/critical |
| Secret scan | ✅ |

Lighthouse warns rather than blocks because lab scores fluctuate; a hard gate on a noisy metric trains people to bypass gates.

---

## What we are not testing

| Not tested | Why |
|---|---|
| Visual regression | Valuable but high-maintenance; disproportionate at this scale. Revisit if the design churns |
| Cross-browser matrix beyond current Chrome, Safari, Firefox, Edge | The framework targets modern browsers; the audience is mainstream mobile |
| Load testing | Traffic is modest and cached |
| Mutation testing | Disproportionate |
| Third-party services | We test our handling of their failure, not their behaviour |

---

## Traceability

Every requirement in [03_REQUIREMENTS](03_REQUIREMENTS.md) maps to a verification method in [46_TRACEABILITY_MATRIX](46_TRACEABILITY_MATRIX.md). A `MUST` requirement with no verification method is a gap, and the matrix exists so those gaps are visible rather than assumed away.
