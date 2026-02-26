# Story 8.2: Client performance checks — initial load and key metrics

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the frontend to have measurable performance for initial load and key interactions,
so that we can verify NFR-P3 (initial load within 3 s) and catch client-side regressions.

## Acceptance Criteria

1. **Given** the Vite/React client is implemented and buildable, **when** I add client performance checks using Lighthouse CI (`@lhci/cli`), **then** the checks measure initial load metrics: Largest Contentful Paint (LCP), First Contentful Paint (FCP), Total Blocking Time (TBT), and Cumulative Layout Shift (CLS).
2. **And** a threshold for initial load is defined and asserted: LCP under 3 000 ms (per NFR-P3); Lighthouse CI exits non-zero if any threshold is exceeded.
3. **And** the checks can be run via a single documented npm script (e.g. `npm run perf`) from the `bmad-todo-client/` directory.
4. **And** the performance config uses `staticDistDir` to serve the production build (`dist/`) so checks measure the optimized output — no running API required for initial-load tests.
5. **And** results are printed to stdout with metric values and pass/fail for each assertion.

## Tasks / Subtasks

- [x] Install `@lhci/cli` as devDependency in `bmad-todo-client` (AC: #3)
  - [x] Run `npm install -D @lhci/cli` in `bmad-todo-client/`
- [x] Create Lighthouse CI config `bmad-todo-client/lighthouserc.json` (AC: #1, #4)
  - [x] Configure `collect` section with `staticDistDir: './dist'` and `numberOfRuns: 3`
  - [x] Configure `assert` section with metric thresholds (LCP < 3000, FCP < 2000, performance score >= 0.9)
  - [x] Configure `upload` section with `target: 'temporary-public-storage'` (or `filesystem` for local-only)
- [x] Add npm script to `package.json` (AC: #3)
  - [x] Add `"perf": "npm run build && lhci autorun"` to scripts
- [x] Define and verify thresholds (AC: #2, #5)
  - [x] LCP < 3000 ms (maps directly to NFR-P3: initial load within 3 s)
  - [x] FCP < 2000 ms (first paint within 2 s — reasonable for a small SPA)
  - [x] Performance category score >= 0.9
  - [x] Verify LHCI exits non-zero when thresholds are breached (test with an impossible threshold)
  - [x] Verify stdout output shows metric values and pass/fail per assertion
- [x] Document client performance checks in repo root README (AC: #3)
  - [x] Add "Client Performance (Lighthouse CI)" section after existing k6 section
  - [x] Document prerequisites (Node.js, production build)
  - [x] Document run command (`cd bmad-todo-client && npm run perf`)
  - [x] Document thresholds and how to interpret results

## Dev Notes

### Technical Requirements

- **Tool: Lighthouse CI (`@lhci/cli`)** — Use Lighthouse CI (version 0.14.0) for client performance measurement. LHCI wraps Google Lighthouse, runs headless Chrome, measures Core Web Vitals (LCP, FCP, TBT, CLS) and overall performance score, supports threshold assertions, and exits non-zero on failure — ideal for CI integration.
- **Static dist serving**: Use `staticDistDir: './dist'` in the LHCI collect config. This tells LHCI to serve the built static files from a local server automatically — no running API or Vite dev server needed. This measures the **production build** performance, which is what matters for NFR-P3.
- **No API dependency for initial load**: The initial load test measures the client shell (HTML, JS, CSS) loading and becoming interactive. The task list fetches from the API on mount, but LHCI measures the page load itself — network requests to the API will fail silently (or show the error state) but the performance metrics for the client bundle are still valid. This matches NFR-P3's scope: "first meaningful content and ability to interact."
- **Metrics to measure**:
  - **LCP (Largest Contentful Paint)** — When the largest visible content element renders. Primary NFR-P3 metric. Threshold: < 3000 ms.
  - **FCP (First Contentful Paint)** — When the first content pixel renders. Threshold: < 2000 ms.
  - **TBT (Total Blocking Time)** — Sum of blocking time for long tasks. Indicates interactivity delay. Threshold: informational (warn if > 300 ms).
  - **CLS (Cumulative Layout Shift)** — Visual stability. Threshold: informational (warn if > 0.1).
  - **Performance Score** — Lighthouse overall performance category (0–1). Threshold: >= 0.9.
- **Number of runs**: Configure `numberOfRuns: 3` so LHCI takes the median, reducing variance from a single run.
- **No changes to application code**: This story adds performance check configuration only. No changes to React components, Vite config, or API.

### Architecture Compliance

- **Performance Testing (Architecture Decision)**: Architecture explicitly includes performance testing to verify NFR-P1–P3. Story 8.1 covers API-side (NFR-P1, NFR-P2). This story covers client-side (NFR-P3).
- **NFR-P3**: "Initial load of the app (first meaningful content and ability to interact) completes within 3 seconds on a typical broadband connection." — The 3000 ms LCP threshold directly validates this NFR.
- **Tool choice per architecture**: "Client: e.g. Lighthouse CI or similar for LCP/load; optional synthetic flows." — Lighthouse CI is the architecture-recommended tool.
- **No new application code changes**: This story adds performance check scripts and configuration only. No changes to the Vite/React client source, API, or Docker configuration.
- **Project structure**: Architecture lists `bmad-todo-client/` for frontend. LHCI config (`lighthouserc.json`) belongs inside the client directory since it's client-specific. This mirrors how `playwright.config.ts` and `vite.config.ts` live in the client directory.

### Library / Framework Requirements

- **@lhci/cli** (v0.14.0): Install as devDependency in `bmad-todo-client/`. Do NOT install globally — keep it project-local for reproducible runs. Install via `npm install -D @lhci/cli`.
- **LHCI config format**: JSON file `lighthouserc.json` at `bmad-todo-client/` root. Structure: `{ "ci": { "collect": {...}, "assert": {...}, "upload": {...} } }`.
- **LHCI collect options**:
  - `staticDistDir`: `"./dist"` — LHCI serves this directory on a random port and audits it.
  - `numberOfRuns`: `3` — Median of 3 runs for stability.
- **LHCI assert options**:
  - `assertions` object with metric keys and `["error", { "maxNumericValue": N }]` or `["error", { "minScore": N }]` format.
  - Use `"error"` level (not `"warn"`) for threshold-gating metrics (LCP, FCP, performance score). Use `"warn"` for informational metrics (TBT, CLS).
- **LHCI upload options**: Use `"target": "temporary-public-storage"` for simple runs (results available for ~7 days at a public URL, no server needed) or `"target": "filesystem"` for local-only (no upload).
- **npm script**: `"perf": "npm run build && lhci autorun"` — builds the production bundle first, then runs LHCI collect + assert + upload in sequence via `autorun`.
- **Chrome**: LHCI bundles its own Chrome (via Lighthouse). No separate Chrome installation needed.
- **DO NOT** use Unlighthouse, web-vitals library, or manual Playwright performance scraping — Lighthouse CI is the chosen tool per architecture guidance and this story's design decision.

### File Structure Requirements

```
bmad-todo-client/
├── lighthouserc.json          # NEW: Lighthouse CI configuration
├── package.json               # MODIFIED: add @lhci/cli devDep + perf script
├── dist/                      # EXISTING (build output, gitignored)
bmad-todo/
├── README.md                  # MODIFIED: add client perf section
```

- **`lighthouserc.json`**: Single LHCI config file with collect, assert, and upload sections. Placed in `bmad-todo-client/` root alongside other config files (`vite.config.ts`, `playwright.config.ts`, `tsconfig.json`).
- **`package.json`**: Add `@lhci/cli` to `devDependencies` and `"perf"` to `scripts`. No other changes.
- **`README.md`** (repo root): Add a "Client Performance (Lighthouse CI)" section after the existing "Performance Testing (k6)" section. Document prerequisites, run command, thresholds, and interpreting results.
- **Do NOT** create a separate `perf/` directory for client perf (that's for API k6 tests). LHCI config lives in the client project.

### Testing Requirements

- **Running the checks**: From `bmad-todo-client/`, run `npm run perf`. This builds the production bundle (`npm run build` → `dist/`) and then runs `lhci autorun` which collects metrics, asserts thresholds, and uploads results.
- **Validation**: LHCI must exit 0 when all assertions pass, exit non-zero when any assertion is breached. Verify both scenarios manually (pass normally, fail by setting an impossibly low threshold like LCP < 1 ms).
- **Repeatability**: Each run builds fresh and serves from `dist/`. No persistent state between runs.
- **No API needed**: `staticDistDir` serves the built client independently. The app will show an error state (service unavailable) since no API is running, but the initial load metrics (LCP, FCP, TBT, CLS) are still measured correctly — they capture the client bundle's load performance, not API round-trips.
- **No changes to existing tests**: Do not modify any existing Vitest, Playwright, or k6 tests. Client performance checks are additive and independent.

### Previous Story Intelligence (Story 8-1)

- **Pattern established**: Story 8-1 placed performance test scripts in `perf/` at repo root (API-level). For the client, LHCI config stays in `bmad-todo-client/` since it's project-specific (similar to `playwright.config.ts`).
- **Documentation pattern**: Story 8-1 added a "Performance Testing (k6)" section to README.md. Follow the same pattern — add a "Client Performance (Lighthouse CI)" section immediately after.
- **Threshold pattern**: Story 8-1 used p95 < 200ms matching NFR-P1. Story 8-2 uses LCP < 3000ms matching NFR-P3. Keep threshold-to-NFR traceability consistent.
- **Tool isolation**: k6 is standalone binary (no npm dep). LHCI is npm-based — install as devDependency in the client project, not globally. Different approach is fine since k6 is cross-project while LHCI is client-specific.
- **README approach**: 8-1 documented install, prerequisites, run, thresholds table, and interpreting results. Follow the same structure for the client section.
- **Dev notes from 8-1**: Pre-existing CORS test failures in `TasksEndpointTest` (missing `CORS_ORIGIN` env var in test environment) — not caused by these changes and should not affect this story.

### Git Intelligence Summary

- **Latest commit**: `77db689 Add API edge case tests, keyboard E2E, and real-API extended E2E` — added test infrastructure but no changes to build/perf setup.
- **Story 8-1 commit**: `d5da849 Story 8-1 implemented — API performance tests and thresholds` — established the `perf/` directory and README documentation pattern.
- **All Epics 1–7 complete** (done). Epic 8 in-progress with 8-1 done.
- **Commit pattern**: One commit per story implementation (e.g. "Story 8-1 implemented").
- **No in-flight changes** to conflict with.

### Latest Tech Information

- **@lhci/cli v0.14.0** (latest, released mid-2025): Stable version wrapping Lighthouse. Install via `npm install -D @lhci/cli`. Supports `autorun`, `collect`, `assert`, `upload` commands.
- **Lighthouse CI config**: Supports `lighthouserc.json`, `lighthouserc.js`, `lighthouserc.yaml` at project root. Use JSON for simplicity and consistency with `tsconfig.json` pattern.
- **`staticDistDir`**: LHCI spins up a local server to serve files from this directory on a random port. Perfect for Vite's `dist/` output — no separate server process needed.
- **Assertions format**: `"metric-name": ["error"|"warn", { "maxNumericValue": ms }]` for timing metrics; `"categories:performance": ["error", { "minScore": 0.0-1.0 }]` for scores.
- **`temporary-public-storage`**: Free, no-server upload target. Results available at a public URL for ~7 days. Good for local/CI without standing up an LHCI server. Alternatively use `"filesystem"` to write results to `.lighthouseci/` directory locally.
- **Chrome bundled**: LHCI/Lighthouse ships with its own Chromium. No need to install Chrome separately. This simplifies CI setup.

### Project Context Reference

- **Project**: bmad-todo — monorepo with `bmad-todo-client` (Vite 7.x + React 19 + TypeScript 5.9 + Tailwind v4) and `bmad-todo-api` (Rails API + PostgreSQL). No authentication for MVP.
- **Build command**: `npm run build` runs `tsc -b && vite build` producing `dist/`.
- **Existing test infra**: Vitest (unit), Playwright (E2E + a11y with @axe-core/playwright), k6 (API perf). Client performance testing is a new addition.
- **Relevant docs**: `architecture.md` (Performance Testing section), `prd.md` (NFR-P3), `epics.md` (Epic 8, Story 8.2), `8-1-api-performance-tests-and-thresholds.md` (previous story patterns).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Performance Testing]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment]
- [Source: _bmad-output/planning-artifacts/prd.md#Non-Functional Requirements — Performance (NFR-P3)]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 8, Story 8.2]
- [Source: _bmad-output/implementation-artifacts/8-1-api-performance-tests-and-thresholds.md]

---

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (via Cursor)

### Debug Log References

- LHCI healthcheck initially failed with "Chrome installation not found" — user confirmed no Google Chrome installed. Resolved by dynamically setting `CHROME_PATH` in the `perf` npm script to use Playwright's bundled Chrome for Testing (already a project dependency). This avoids requiring a separate Chrome installation.
- `@lhci/cli` installed at v0.15.1 (latest) instead of v0.14.0 mentioned in Dev Notes — compatible upgrade, no breaking changes.

### Completion Notes List

- ✅ Installed `@lhci/cli` v0.15.1 as devDependency in `bmad-todo-client`
- ✅ Created `lighthouserc.json` with collect (staticDistDir, 3 runs), assert (LCP < 3000ms error, FCP < 2000ms error, perf score >= 0.9 error, TBT < 300ms warn, CLS < 0.1 warn), and upload (filesystem) sections
- ✅ Added `npm run perf` script that builds production bundle and runs `lhci autorun` with Playwright's Chrome
- ✅ Verified pass case: all 3 Lighthouse runs pass, exit code 0, "All results processed!"
- ✅ Verified fail case: impossible threshold (LCP < 1ms) correctly exits non-zero with metric values shown
- ✅ Added `.lighthouseci/` to `.gitignore`
- ✅ Added "Client Performance (Lighthouse CI)" section to README.md with prerequisites, run command, thresholds table, and interpreting results
- ✅ All 85 existing unit tests pass (no regressions)
- ✅ Pre-existing lint warnings unchanged (no application code modified)

### Change Log

- 2026-02-26: Story 8.2 implemented — Client performance checks using Lighthouse CI with LCP/FCP/TBT/CLS thresholds, `npm run perf` script, and README documentation
- 2026-02-26: Code review — Fixed 6 issues (3 HIGH, 3 MEDIUM): added explicit `aggregationMethod: "median-run"` to lighthouserc.json so assertions use median run (not optimistic default); hardened `perf` script with `--no-warnings`, clean stdout, and `.catch()` error message for missing Chromium; improved README prerequisite clarity; documented all out-of-scope changes (test files, test-summary.md rewrite) and missing `package-lock.json` in File List

### File List

- `bmad-todo-client/package.json` — MODIFIED: added `@lhci/cli` devDependency and `perf` npm script
- `bmad-todo-client/package-lock.json` — MODIFIED: lockfile updated for `@lhci/cli` installation
- `bmad-todo-client/lighthouserc.json` — NEW: Lighthouse CI configuration (collect, assert, upload)
- `bmad-todo-client/.gitignore` — MODIFIED: added `.lighthouseci/` directory
- `README.md` — MODIFIED: added "Client Performance (Lighthouse CI)" section

#### Out-of-scope changes (present in git changeset, not part of story 8-2)

- `bmad-todo-client/src/api/tasks.test.ts` — MODIFIED: 7 new unit tests added (fetchTasks 4xx/404, createTask edge cases, updateTask json-fail) — should be tracked under a separate story/commit
- `bmad-todo-api/test/integration/tasks_delete_test.rb` — NEW: 8 DELETE endpoint integration tests — should be tracked under a separate story/commit
- `bmad-todo-api/test/integration/tasks_edge_cases_test.rb` — MODIFIED: fixed DELETE assertion from 404/405 to 204 — should be tracked under a separate story/commit
- `_bmad-output/implementation-artifacts/tests/test-summary.md` — MODIFIED: completely rewritten (not just 8-2 additions) — should be tracked under a separate story/commit

---

## Senior Developer Review (AI)

**Reviewer:** RVS | **Date:** 2026-02-26

### Outcome: Changes Requested → Auto-Fixed

**Issues Found:** 3 HIGH, 3 MEDIUM, 3 LOW
**Issues Fixed:** 6 (all HIGH + MEDIUM)
**Action Items:** 0

### Findings Summary

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| H1 | HIGH | Out-of-scope test file changes not in File List (3 files) | Documented in File List with out-of-scope annotation |
| H2 | HIGH | test-summary.md completely rewritten beyond story scope | Documented in File List with out-of-scope annotation |
| H3 | HIGH | README claims "median" but LHCI default is "optimistic" | Added `aggregationMethod: "median-run"` to lighthouserc.json |
| M1 | MEDIUM | package-lock.json missing from File List | Added to File List |
| M2 | MEDIUM | perf script CHROME_PATH resolution fragile | Added `--no-warnings`, `process.stdout.write`, `.catch()` error handling |
| M3 | MEDIUM | Implicit Playwright browser dependency with poor error UX | Added `.catch()` with clear error message; improved README prerequisites |
| L1 | LOW | Dev Notes version mismatch (0.14.0 vs 0.15.1) | Not fixed — acknowledged in Debug Log |
| L2 | LOW | `maxNumericValue: 3000` is <= not < ("under 3000") | Not fixed — negligible practical impact |
| L3 | LOW | Build-and-test coupling in perf script | Not fixed — by design per story tasks |

### Acceptance Criteria Verification

| AC | Status | Evidence |
|----|--------|----------|
| #1 LHCI measures LCP, FCP, TBT, CLS | IMPLEMENTED | `lighthouserc.json` assertions section defines all 4 metrics |
| #2 LCP < 3000ms threshold, non-zero exit on breach | IMPLEMENTED | error-level assertion; verified per Completion Notes |
| #3 Single `npm run perf` script documented | IMPLEMENTED | package.json script + README section |
| #4 Uses `staticDistDir` for production build | IMPLEMENTED | `"staticDistDir": "./dist"` in collect config |
| #5 Results printed to stdout with pass/fail | IMPLEMENTED | LHCI autorun prints assertions and exit status |
