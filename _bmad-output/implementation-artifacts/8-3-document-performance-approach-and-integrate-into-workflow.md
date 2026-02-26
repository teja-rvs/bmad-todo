# Story 8.3: Document performance approach and integrate into workflow

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the performance testing approach, thresholds, and how to run it documented and (optionally) integrated into CI or pre-release,
so that the team can run and interpret performance tests consistently and prevent regressions.

## Acceptance Criteria

1. **Given** API and client performance tests or checks exist (Stories 8.1 and 8.2), **when** I document the performance testing approach, **then** the README or docs describe what is measured (API response times, client initial load / LCP), the chosen tools, and how to run the tests (commands or scripts).
2. **And** the documented thresholds (e.g. p95 for API, initial load for client) are stated and traceable to NFR-P1–P3.
3. **And** optionally, performance tests are run in CI (e.g. on every PR or on main) or as a pre-release step; if run in CI, the pipeline step and any required env or setup are documented.

## Tasks / Subtasks

- [x] Create consolidated performance testing documentation in `docs/performance-testing.md` (AC: #1, #2)
  - [x] Write overview section covering performance testing philosophy and scope
  - [x] Document API performance testing approach (k6): what is measured, tool rationale, test design, scenarios
  - [x] Document client performance testing approach (Lighthouse CI): what is measured, tool rationale, metrics collected
  - [x] Create NFR traceability matrix mapping each threshold to its NFR source (NFR-P1, NFR-P2, NFR-P3)
  - [x] Document all thresholds in a single consolidated table with tool, metric, threshold value, level, and NFR reference
  - [x] Document how to run both suites (k6 and LHCI) — prerequisites, commands, and environment options
  - [x] Document how to interpret results from each tool
  - [x] Document test data management (k6 setup/teardown, LHCI staticDistDir)
- [x] Add optional CI integration with GitHub Actions (AC: #3)
  - [x] Create `.github/workflows/performance.yml` workflow file
  - [x] Configure k6 API performance job (start API in Docker, run k6)
  - [x] Configure Lighthouse CI client performance job (build client, run lhci)
  - [x] Document CI workflow: when it runs, what triggers it, how to read results
  - [x] Add CI section to `docs/performance-testing.md`
- [x] Update repo root README.md to link to the detailed docs (AC: #1)
  - [x] Add a "Performance Testing Documentation" subsection linking to `docs/performance-testing.md`
  - [x] Keep existing quick-reference sections (k6 and LHCI) in README for convenience

## Dev Notes

### Technical Requirements

- **Story scope**: This is primarily a documentation and CI-integration story. Stories 8-1 and 8-2 already implemented the performance tests (k6 for API, Lighthouse CI for client) and added tool-specific sections to README.md. This story consolidates the approach into a comprehensive reference document and optionally adds CI automation.
- **Existing documentation in README.md**: The repo root README already contains:
  - "Performance Testing (k6)" section: install, prerequisites, run command, thresholds table, interpreting results.
  - "Client Performance (Lighthouse CI)" section: prerequisites, run command, thresholds table, interpreting results.
  - These sections should remain in README for quick reference. The new `docs/performance-testing.md` provides the complete, detailed reference.
- **NFR traceability**: The key value-add is mapping every threshold to its originating NFR with clear rationale:
  - **NFR-P1**: "User-triggered actions complete and reflect in the UI within 200 ms under normal conditions (excluding network latency)" → k6 p95 < 200ms for POST /tasks and PATCH /tasks/:id
  - **NFR-P2**: "List updates visible after action without manual refresh" → k6 p95 < 200ms for GET /tasks (validates the refetch-after-mutation pattern stays fast)
  - **NFR-P3**: "Initial load of the app completes within 3 seconds on a typical broadband connection" → LHCI LCP < 3000ms, FCP < 2000ms, performance score >= 0.9
- **CI integration (optional per AC#3)**: Create a GitHub Actions workflow that runs performance tests. Since the project uses Docker Compose for the API, the CI workflow for k6 needs to start the full stack. For LHCI, only Node.js and a build are needed (staticDistDir, no API required).
- **No application code changes**: This story does not modify any Rails, React, k6, or LHCI code. Only documentation files and an optional CI workflow file are created/modified.

### Architecture Compliance

- **Performance Testing (Architecture Decision)**: Architecture states: "Document approach, thresholds, and how to run in README or docs so agents and developers can run and interpret performance tests consistently." This story directly implements that directive.
- **Architecture tool choices**: k6 for API (per Story 8-1), Lighthouse CI for client (per Story 8-2). Both match the architecture recommendation: "API: load or benchmark (e.g. k6, Artillery, or Rails performance tests) for endpoint latency/throughput. Client: e.g. Lighthouse CI or similar for LCP/load."
- **Architecture CI guidance**: "Pre-release or CI; frequency (every PR vs nightly) decided in implementation." This story decides the CI strategy and documents it.
- **Project structure**: Architecture defines `docs/` as the project knowledge directory (per config: `project_knowledge: "{project-root}/docs"`). The performance testing documentation belongs there.

### Library / Framework Requirements

- **No new dependencies** needed for the documentation portion.
- **CI dependencies** (GitHub Actions):
  - k6 job: Install k6 binary via official `grafana/setup-k6-action` action (or `brew install k6` / download binary). Need Docker Compose to start the API.
  - LHCI job: Node.js setup (`actions/setup-node`), `npm ci`, `npm run build`, `npm run perf`. LHCI uses Playwright's bundled Chromium (already configured in `npm run perf` script).
- **k6 version**: Standalone binary, latest stable. No version pinning needed in CI — k6 is backwards-compatible for scripts.
- **@lhci/cli version**: v0.15.1 (installed in `bmad-todo-client/package.json`). Installed via `npm ci`.

### File Structure Requirements

```
bmad-todo/
├── docs/                                 # NEW or EXISTING: Project documentation
│   └── performance-testing.md            # NEW: Consolidated performance testing approach
├── .github/
│   └── workflows/
│       └── performance.yml               # NEW: GitHub Actions CI workflow (optional)
├── README.md                             # MODIFIED: Add link to docs/performance-testing.md
├── perf/
│   └── api-perf.js                       # UNCHANGED: k6 API perf tests (from Story 8-1)
├── bmad-todo-client/
│   ├── lighthouserc.json                 # UNCHANGED: LHCI config (from Story 8-2)
│   └── package.json                      # UNCHANGED: has perf script (from Story 8-2)
```

- **`docs/performance-testing.md`**: Comprehensive document consolidating the full performance testing approach. This is the primary deliverable.
- **`.github/workflows/performance.yml`**: Optional GitHub Actions workflow. Runs k6 (API) and LHCI (client) performance tests. Configure to run on `workflow_dispatch` (manual) and optionally on push to `main` or on a schedule (weekly).
- **`README.md`**: Minor update — add a link to the detailed docs. Keep existing k6/LHCI quick-reference sections.
- **No changes** to `perf/api-perf.js`, `lighthouserc.json`, `package.json`, or any application code.

### Testing Requirements

- **No automated tests to write**: This story creates documentation and a CI workflow. Validation is manual:
  - Verify `docs/performance-testing.md` covers all items from AC#1 and AC#2.
  - Verify NFR traceability matrix correctly maps thresholds to NFR-P1, NFR-P2, NFR-P3.
  - If CI workflow is created: verify it passes when run manually via `workflow_dispatch` (requires GitHub repo with Actions enabled).
- **No changes to existing tests**: Do not modify any Minitest, Vitest, Playwright, k6, or LHCI tests.

### Previous Story Intelligence

#### Story 8-1 (API Performance Tests — done)

- Created `perf/api-perf.js` — k6 script covering GET /tasks, POST /tasks, PATCH /tasks/:id.
- k6 uses `shared-iterations` scenario: 3 VUs sharing 50 iterations (light load).
- Setup seeds 15 tasks via POST; teardown deletes all perf-prefixed tasks via DELETE.
- Thresholds: p(95) < 200ms per endpoint. k6 exits non-zero on breach.
- API_URL configurable via `--env API_URL=...` (defaults to `http://localhost:3000`).
- Verified performance: GET p95=23.91ms, POST p95=14.67ms, PATCH p95=14.76ms — all well under 200ms.
- README updated with "Performance Testing (k6)" section.
- Code review added `destroy` action to TasksController for teardown cleanup.
- **Lesson**: 3 pre-existing CORS test failures exist (missing `CORS_ORIGIN` env var) — not related to perf work.

#### Story 8-2 (Client Performance Checks — done)

- Created `bmad-todo-client/lighthouserc.json` — LHCI config with `staticDistDir: './dist'`, 3 runs, median aggregation.
- Added `npm run perf` script: builds production bundle then runs `lhci autorun`.
- Uses Playwright's bundled Chromium (no separate Chrome install needed).
- Thresholds: LCP < 3000ms (error), FCP < 2000ms (error), perf score >= 0.9 (error), TBT < 300ms (warn), CLS < 0.1 (warn).
- LHCI exits non-zero on error-level threshold breach.
- README updated with "Client Performance (Lighthouse CI)" section.
- `.lighthouseci/` added to `.gitignore`.
- **Lesson**: LHCI default aggregation is "optimistic" not "median" — explicitly set `aggregationMethod: "median-run"`.
- **Lesson**: Chrome dependency resolved by using Playwright's bundled Chromium — document this dependency clearly.

### Git Intelligence Summary

- Latest commit: `332dc3d Story 8-2 implemented and reviewed — client performance checks (Lighthouse CI)`
- Previous: `d5da849 Story 8-1 implemented — API performance tests and thresholds`
- All Epics 1–7 complete. Epic 8 in-progress with 8-1 and 8-2 done.
- Commit pattern: one commit per story implementation.
- No in-flight changes to conflict with.
- **README.md** has been modified by both 8-1 and 8-2 — the current version contains both k6 and LHCI sections.

### Project Context Reference

- **Project**: bmad-todo — monorepo with `bmad-todo-client` (Vite 7.x + React 19 + TypeScript 5.9 + Tailwind v4) and `bmad-todo-api` (Rails 8.1.2 API + PostgreSQL). No authentication for MVP.
- **Existing test infra**: Rails Minitest (models + integration), Vitest (85 unit tests), Playwright (E2E + a11y), k6 (API perf, Story 8-1), Lighthouse CI (client perf, Story 8-2).
- **Docker**: Full stack via Docker Compose (base + dev/test overrides). API health check at GET /up. Non-root containers, multistage builds.
- **Relevant docs**: `architecture.md` (Performance Testing section), `prd.md` (NFR-P1–P3), `epics.md` (Epic 8, Story 8.3).
- **k6 actual results** (from Story 8-1): GET p95=23.91ms, POST p95=14.67ms, PATCH p95=14.76ms.
- **LHCI config**: `lighthouserc.json` at `bmad-todo-client/` root with median-run aggregation over 3 runs.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Performance Testing]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/prd.md#Non-Functional Requirements — Performance]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 8, Story 8.3]
- [Source: _bmad-output/implementation-artifacts/8-1-api-performance-tests-and-thresholds.md]
- [Source: _bmad-output/implementation-artifacts/8-2-client-performance-checks-initial-load-and-key-metrics.md]
- [Source: perf/api-perf.js]
- [Source: bmad-todo-client/lighthouserc.json]
- [Source: README.md#Performance Testing (k6)]
- [Source: README.md#Client Performance (Lighthouse CI)]

---

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Cursor)

### Debug Log References

No debug issues encountered. Documentation-only story with no application code changes.

### Completion Notes List

- Created `docs/performance-testing.md` — comprehensive performance testing reference document covering both k6 (API) and Lighthouse CI (client) suites, with overview, tool rationale, test design, NFR traceability matrix, consolidated thresholds table, running instructions, result interpretation, and test data management.
- Created `.github/workflows/performance.yml` — GitHub Actions CI workflow with two parallel jobs: `api-perf` (starts full Docker Compose stack, installs k6, runs API perf tests) and `client-perf` (sets up Node.js, installs Chromium, runs LHCI). Triggers on `workflow_dispatch` and push to `main`.
- Updated `README.md` — added "Performance Testing Documentation" subsection with link to `docs/performance-testing.md` above existing quick-reference sections. Existing k6 and LHCI sections preserved unchanged.
- All 3 Acceptance Criteria satisfied. No application code modified. No existing tests changed. Vitest suite (92 tests) passes with no regressions.

### Change Log

- 2026-02-26: Story 8-3 implemented — created consolidated performance testing docs, GitHub Actions CI workflow, and README link. All ACs satisfied.
- 2026-02-26: Code review — fixed 6 issues (1 HIGH, 5 MEDIUM). H1: added --with-deps to Playwright CI install. M1: switched CI to production mode (removed dev override). M2: reconciled README LHCI thresholds NFR column with docs. M3: added concurrency control. M4: added job timeouts. M5: added paths filter to push trigger. Updated CI docs section to match.

### File List

- `docs/performance-testing.md` (NEW, review-updated) — Consolidated performance testing approach document
- `.github/workflows/performance.yml` (NEW, review-updated) — GitHub Actions CI workflow for performance tests
- `README.md` (MODIFIED, review-updated) — Added "Performance Testing Documentation" subsection with link to detailed docs; fixed NFR column in LHCI thresholds
