# CHANGE-0001 — Initial Repository Audit & Discovery Kickoff

## Date
2026-08-16

## Category
Product / Architecture / Process

## Status
COMPLETED

## Trigger
Project initiation. The owner requested a production-grade school website and mandated that a discovery, research, and documentation phase precede any implementation. This entry records the verified starting state of the repository *before* any file was generated, so that the project's origin point is permanently on the record.

## Previous State

None. The project did not exist.

## New State

### Verified repository audit — `C:\Users\sharm\desktop\school`

Performed 2026-08-16 via directory listing and recursive traversal (depth 3, excluding `node_modules` and `.git`).

| Check | Result |
|---|---|
| Directory exists | Yes |
| Files present | **Zero** |
| Subdirectories present | **Zero** |
| Git repository | **No** (`.git` absent; not initialised) |
| `package.json` | Absent |
| Lock files (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`) | Absent |
| Configuration files (`next.config.*`, `tsconfig.json`, `eslint.*`, `.editorconfig`) | Absent |
| Source code (any language) | Absent |
| `.env` / `.env.example` | Absent |
| `README` / existing documentation | Absent |
| Assets (images, fonts, icons, logo, brochures, PDFs) | Absent |
| Database configuration / migrations | Absent |
| Deployment configuration (`vercel.json`, `Dockerfile`, `docker-compose.*`) | Absent |
| CI/CD configuration (`.github/`, `.gitlab-ci.yml`) | Absent |
| Existing routes / components / APIs | Absent |
| Tests | Absent |

**Conclusion: the repository is completely empty.**

Consequences of this finding:
- There is **nothing to reuse** — no prior components, utilities, or patterns to inherit.
- There is **nothing to replace** and **nothing at risk of being overwritten**.
- No initial implementation audit is required or possible.
- No legacy constraints influence the architecture. This is a genuine greenfield project.

### Adjacent-directory check

The parent directory (`C:\Users\sharm\desktop`) was inspected for pre-existing school branding assets that might inform the design system — logo files, brochures, prospectuses, or photographs. **None were found.** This is the direct cause of the design system being classified `PROVISIONAL` (see [CHANGE-0004](CHANGE-0004-PROVISIONAL-DESIGN-SYSTEM.md)).

### Verified toolchain

| Tool | Version | Note |
|---|---|---|
| Node.js | v22.22.2 | Satisfies Next.js 16's Node 20.9+ minimum |
| npm | 10.9.7 | — |
| git | 2.52.0.windows.1 | Available but **not initialised** in this directory |
| OS | Windows 11 Home Single Language 10.0.26200 | Dev environment; production target is Linux/serverless |

### Requirements captured at kickoff

Four questions were put to the project owner whose answers materially change the architecture. All four were answered and are recorded as `USER_APPROVED_DECISION` in [49_DECISION_REGISTER](../../../BLUEPRINT/49_DECISION_REGISTER.md):

| Question | Answer |
|---|---|
| Real school vs generic/portfolio build | **Real school**; details to be supplied later |
| Admissions depth for v1 | **Enquiry-only** |
| Hosting target | **Vercel + Neon/Supabase** |
| Board and grade range | **CBSE, Nursery–Class 10** |

### Documentation system established

Two directories created, with strictly separated purposes:

- **`BLUEPRINT/`** — current-state truth. Always describes what is *currently* decided, planned, implemented, and pending. Never retains superseded information as though it were current.
- **`HISTORY/`** — historical truth. Permanent, append-oriented record of how the project evolved. Never rewritten to conceal a superseded decision.

## Reason

The owner's brief was explicit that implementation must not begin before discovery, research, and architecture are complete, and that the project must be documented well enough for a new senior engineer — or a future session with no conversation memory — to continue from the filesystem alone.

Recording the empty starting state first is what makes later drift detection meaningful. Without a verified origin point, any future comparison of "blueprint vs actual repository" has no baseline.

## Alternatives Considered

### Option A — Begin implementation immediately, document afterwards
Fastest to a visible result. Rejected: architecture decisions made under implementation pressure tend to be irreversible by the time they are questioned, and the owner explicitly required discovery first.

### Option B — Discovery only, no permanent documentation system
Lighter weight. Rejected: it fails the core requirement that work survive without conversation memory.

### Option C — Discovery plus a separated BLUEPRINT/HISTORY system *(selected)*
Higher upfront cost, but produces a project that can be handed over, audited for drift, and resumed cleanly.

## Decision

Proceed with Option C. Record the empty-repository audit as the project's origin point, then produce the full blueprint before writing any application code.

## Evidence

- Directory listing of `C:\Users\sharm\desktop\school` returned only `.` and `..` (total 0 entries).
- Recursive traversal to depth 3 returned only the root path itself.
- `node --version` → `v22.22.2`; `npm --version` → `10.9.7`; `git --version` → `2.52.0.windows.1`.
- Parent-directory listing contained no file matching school branding, logo, or prospectus patterns.

## Impact

### Product
Full freedom to define scope. Scope is bounded by the owner's four answers rather than by legacy code.

### UX
No inherited UX debt. Information architecture can be designed from parent behaviour rather than retrofitted to existing pages.

### Technical
Greenfield. Every technology choice is open and must be justified on merit rather than compatibility with existing code.

### Performance
No inherited bundle weight, legacy dependencies, or unoptimised assets.

### SEO
No existing URLs, no live traffic, therefore **no redirect or migration burden**. URL structure can be designed correctly the first time. This is a genuine advantage and is noted in the SEO strategy.

### Security
No inherited vulnerabilities, no legacy dependency tree to audit.

### Accessibility
No remediation debt. WCAG 2.2 AA can be designed in rather than retrofitted.

### Development
No onboarding cost against existing code. The blueprint becomes the sole onboarding artefact, which raises the quality bar it must meet.

## Files Changed

Created:
- `HISTORY/` (directory)
- `HISTORY/2026/08/` (directory)
- `HISTORY/DECISIONS/` (directory)
- `HISTORY/2026/08/CHANGE-0001-INITIAL-DISCOVERY.md` (this file)
- `BLUEPRINT/` (directory)

No application code was created. No dependencies were installed. Git was not initialised.

## Blueprint Documents Updated

None at time of writing — this entry precedes blueprint generation by design. All 50 `BLUEPRINT/` documents are produced immediately after this entry and are catalogued in [00_MASTER_INDEX](../../../BLUEPRINT/00_MASTER_INDEX.md).

## Follow-Up Work

1. Record the Prisma version correction ([CHANGE-0006](CHANGE-0006-PRISMA-VERSION-CORRECTION.md)).
2. Record the plan review round ([CHANGE-0007](CHANGE-0007-REVIEW-CORRECTIONS.md)).
3. Conduct parent-behaviour and reference-site research → `BLUEPRINT/45_RESEARCH_SOURCES.md`.
4. Produce all `BLUEPRINT/` documents.
5. Obtain school identity assets — these block the design system, the `School` schema block, and the entire content layer. Tracked in `BLUEPRINT/39_OPEN_DECISIONS.md`.

## Verification

- Repository emptiness confirmed by two independent methods (flat listing and recursive traversal) before any file was written.
- Toolchain versions confirmed by direct command execution, not assumption.
- Absence of branding assets confirmed by inspecting the parent directory, not inferred.

## Notes

The starting state is unusually clean, and that is worth stating plainly: no compromise in this project can later be blamed on inherited constraints. Every weakness in the finished system will be a decision recorded in this directory.
