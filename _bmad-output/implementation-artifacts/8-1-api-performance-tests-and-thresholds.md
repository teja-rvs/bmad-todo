# Story 8.1: API performance tests and thresholds

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want API endpoints (GET /tasks, POST /tasks, PATCH /tasks/:id) to have measurable performance and optional threshold assertions,
so that we can verify NFR-P1 (action response <200 ms) and NFR-P2 (list visibility after action) and catch API regressions.

## Acceptance Criteria

1. **Given** the Rails API with tasks endpoints is implemented, **when** I add k6 performance test scripts, **then** the tests measure response time (p95 and median) for GET /tasks, POST /tasks, and PATCH /tasks/:id under a defined single-request and light-load scenario.
2. **And** thresholds are defined and asserted: p95 response time under 200 ms for each endpoint under the test scenario; k6 exits non-zero if any threshold is exceeded.
3. **And** the tests can be run via a single documented command (e.g. `k6 run perf/api.js`) from the repo root or `bmad-todo-api/` directory.
4. **And** the test script includes setup/teardown to create and clean up test data so runs are repeatable and do not pollute the database.
5. **And** results are printed to stdout with endpoint-level p95, median, and pass/fail for each threshold.

## Tasks / Subtasks

- [x] Install k6 locally and document installation in README (AC: #3)
  - [x] Add k6 installation instructions to repo root README (brew, apt, or binary)
  - [x] Create `perf/` directory at repo root for performance test scripts
- [x] Create k6 API performance test script `perf/api-perf.js` (AC: #1, #4)
  - [x] Implement setup function to seed test data via POST /tasks (create several tasks for GET and PATCH tests)
  - [x] Implement GET /tasks scenario measuring response time
  - [x] Implement POST /tasks scenario measuring response time
  - [x] Implement PATCH /tasks/:id scenario measuring response time (mark task complete)
  - [x] Implement teardown to clean up seeded and iteration data via DELETE /tasks/:id
- [x] Define thresholds and assertions (AC: #2, #5)
  - [x] Set k6 `thresholds` option: p(95) < 200ms for each endpoint scenario
  - [x] Verify k6 exits non-zero when thresholds are exceeded
  - [x] Ensure stdout output shows per-endpoint p95, median, and threshold pass/fail
- [x] Document how to run performance tests (AC: #3)
  - [x] Add `perf:api` script or documented command to README
  - [x] Document prerequisites (running API server, test database)
  - [x] Document expected output and how to interpret results

## Dev Notes

### Technical Requirements

- **Tool: k6** — Use k6 (Grafana k6) as the API performance testing tool. k6 is purpose-built for API load testing, supports native threshold assertions, runs from CLI, and exits non-zero on threshold failure — ideal for CI integration. Tests are written in JavaScript (ES6 modules).
- **API base URL**: The Rails API runs on `http://localhost:3000` by default (configurable via `PORT` env var). The k6 script should accept the base URL via an environment variable (e.g. `K6_API_URL` or `__ENV.API_URL`) so it works against local dev, Docker, or CI environments.
- **Endpoints to test**:
  - `GET /tasks` — List all tasks. Measure with an empty list AND with seeded data (e.g. 10–20 tasks).
  - `POST /tasks` — Create a task. Send `{ title: "perf-test-task" }` as JSON body. Expect 201.
  - `PATCH /tasks/:id` — Mark a task complete. Send `{ completed: true }`. Expect 200.
- **Request format**: JSON body with `Content-Type: application/json`. API uses snake_case keys. No authentication required (no auth for MVP).
- **Thresholds**: Define k6 `thresholds` with `http_req_duration` p(95) < 200ms per tagged endpoint. Use k6 tags (e.g. `{ name: 'GET /tasks' }`) to track per-endpoint metrics and set per-endpoint thresholds.
- **Test scenarios**: Use k6 `scenarios` or a simple default function with iterations. Recommend a light-load scenario: 1–5 virtual users (VUs), 10–30 seconds duration or fixed iterations (e.g. 50 iterations per endpoint). This validates single-request and light-concurrency performance, matching NFR-P1's "under normal conditions" qualifier.
- **Setup/teardown**: Use k6's `setup()` function to create seed tasks via POST /tasks for GET and PATCH tests; return task IDs. Use `teardown(data)` to delete seeded tasks if DELETE endpoint exists, or document that the test should run against a test database that can be reset. Note: the API has DELETE /tasks/:id in routes (per architecture), so teardown can use it.
- **CORS**: k6 runs server-side (not from a browser), so CORS is not relevant for k6 requests.

### Architecture Compliance

- **Performance Testing (Architecture Decision)**: Architecture explicitly includes performance testing to verify NFR-P1–P3. This story covers API-side (NFR-P1, NFR-P2). Story 8.2 covers client-side (NFR-P3).
- **NFR-P1**: "User-triggered actions (create task, mark complete) complete and reflect in the UI within 200 ms under normal conditions (excluding network latency to server)." — The 200ms threshold for POST and PATCH p95 directly validates this NFR at the API layer.
- **NFR-P2**: "List updates visible after action without manual refresh" — GET /tasks performance ensures the refetch-after-mutation pattern stays fast.
- **API contract**: REST, JSON, snake_case keys. Routes: `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`. Error shape: `{ error: "message" }`. The k6 script must use these exact routes and JSON format.
- **No new application code changes**: This story adds performance test scripts only. No changes to the Rails API, frontend, or Docker configuration.
- **Project structure**: Architecture lists the repo root. Place performance tests in `perf/` at the repo root (separate from unit/integration tests in `bmad-todo-api/test/`). This keeps performance tests decoupled from the application.

### Library / Framework Requirements

- **k6**: Install via `brew install k6` (macOS), `apt install k6` (Debian/Ubuntu), or download binary from https://k6.io/docs/get-started/installation/. k6 is a standalone Go binary — no npm/gem dependency needed. Do NOT add k6 as a project dependency.
- **k6 script format**: ES6 modules. Use `import http from 'k6/http'` and `import { check } from 'k6'`. Define `export default function()` for the main test logic, `export function setup()` and `export function teardown(data)` for lifecycle hooks.
- **k6 thresholds**: Define in `export const options = { thresholds: { ... } }`. Use tag-based thresholds like `'http_req_duration{name:GET /tasks}': ['p(95)<200']`.
- **k6 checks**: Use `check(response, { 'status is 200': (r) => r.status === 200 })` to validate response correctness alongside performance.
- **Rails API**: Rails 8.1.2 with Puma (default 3 threads, port 3000). No changes to Gemfile or Rails config needed. The API must be running before k6 tests execute.
- **DO NOT** use Artillery, JMeter, or Rails-internal benchmarks — k6 is the chosen tool per this story's design decision. Keep it simple and focused.

### File Structure Requirements

```
bmad-todo/
├── perf/                          # NEW: Performance test directory
│   └── api-perf.js                # NEW: k6 API performance test script
├── bmad-todo-api/                 # UNCHANGED
├── bmad-todo-client/              # UNCHANGED
├── docker-compose.yml             # UNCHANGED
└── README.md                      # MODIFIED: Add perf test section
```

- **`perf/api-perf.js`**: Single k6 script covering all three API endpoints with setup, scenarios, thresholds, and teardown. Keep it in one file for simplicity since there are only 3 endpoints.
- **`README.md`**: Add a "Performance Testing" section documenting: k6 installation, how to run (`k6 run perf/api-perf.js`), prerequisites (API server running), thresholds, and how to interpret results.
- **Do NOT** place k6 scripts inside `bmad-todo-api/` — they are integration-level tests that test the running API from outside, not Rails unit tests.

### Testing Requirements

- **Running the tests**: Start the Rails API (`cd bmad-todo-api && rails s` or via Docker), then run `k6 run perf/api-perf.js` from repo root. Optionally pass `--env API_URL=http://localhost:3000` if the API is on a non-default host.
- **Validation**: k6 must exit 0 when all thresholds pass, exit non-zero when any threshold is breached. Verify both scenarios manually.
- **Repeatability**: Setup creates test data, teardown cleans it up. Multiple runs should produce consistent results without accumulating data.
- **No changes to existing tests**: Do not modify any existing Minitest, Vitest, or Playwright tests. Performance tests are additive and independent.

### Previous Story Intelligence (Epic 7)

- **7-4 (Compose overrides)**: Docker setup is complete. For running perf tests in Docker, the API is reachable at `http://localhost:3000` when using `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`. The k6 script's `API_URL` env var allows targeting Docker or native API.
- **7-3 (Docker Compose base)**: API health check at `GET /up` confirms the server is running. Consider using this endpoint in k6 setup to wait for API readiness before running tests.
- **7-1/7-2 (Dockerfiles)**: API runs as non-root in Docker; no impact on performance testing.
- **Pattern from Epic 7**: Stories kept test scripts and documentation in sync. Follow the same pattern — document in README alongside existing Docker sections.

### Git Intelligence Summary

- Recent commits follow pattern: one commit per story implementation (e.g. "Story 7-4 implemented").
- All Epics 1–7 complete (done). No in-flight changes to conflict with.
- Latest commit: `1de7aea Performance Testing added to architecture` — confirms architecture was updated to include Epic 8 scope.

### Project Context Reference

- **Project**: bmad-todo — monorepo with `bmad-todo-client` (Vite + React + TypeScript) and `bmad-todo-api` (Rails 8.1.2 API + PostgreSQL). No authentication for MVP.
- **Existing test infra**: Rails Minitest (models + integration), Vitest (unit), Playwright (E2E + a11y). Performance testing is a new addition.
- **Relevant docs**: `_bmad-output/planning-artifacts/architecture.md` (Performance Testing section), `_bmad-output/planning-artifacts/prd.md` (NFR-P1, NFR-P2, NFR-P3), `_bmad-output/planning-artifacts/epics.md` (Epic 8, Story 8.1).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Performance Testing]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/prd.md#Non-Functional Requirements — Performance]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 8, Story 8.1]
- [Source: _bmad-output/implementation-artifacts/7-4-compose-override-files-and-environment-configuration.md]

---

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Cursor)

### Debug Log References

- Rails `database.yml` production section raises even in dev mode due to ERB evaluation of all sections — worked around by setting `DATABASE_URL` env var when running locally.
- API routes originally exposed only `:index`, `:create`, `:update` (no `:destroy`). Code review added `:destroy` action so teardown can properly clean up perf test data.
- 3 pre-existing CORS test failures in `TasksEndpointTest` (missing `CORS_ORIGIN` env var in test environment) — not caused by this story's changes.

### Completion Notes List

- Created `perf/api-perf.js` k6 performance test script covering GET /tasks, POST /tasks, and PATCH /tasks/:id with setup/teardown lifecycle, response validation checks, and per-endpoint p(95) < 200ms thresholds.
- k6 uses `shared-iterations` scenario: 3 VUs sharing 50 iterations for light-load validation matching NFR-P1 "under normal conditions".
- Setup seeds 15 tasks via POST /tasks; teardown deletes all perf-prefixed tasks via DELETE /tasks/:id.
- API_URL configurable via `--env API_URL=...` for Docker or CI environments; defaults to `http://localhost:3000`.
- Verified: all thresholds pass (GET p95=23.91ms, POST p95=14.67ms, PATCH p95=14.76ms — all well under 200ms).
- Verified: k6 exits code 99 when thresholds are breached (tested with impossible 0.001ms threshold).
- Added comprehensive "Performance Testing (k6)" section to repo root README with installation, prerequisites, run command, threshold table, and results interpretation guide.

### Change Log

- 2026-02-26: Story 8-1 implemented — added k6 API performance tests and documentation
- 2026-02-26: Code review fixes — added destroy action for teardown cleanup; removed undocumented med<100 thresholds; replaced JSON.parse with k6 idiomatic r.json(); teardown now deletes all perf-prefixed tasks; setup fails fast if seed tasks not fully created; PATCH alternates completed true/false for realistic toggle; added 0.5s think time between iterations

### File List

- `perf/api-perf.js` (NEW) — k6 API performance test script
- `README.md` (MODIFIED) — Added "Performance Testing (k6)" section and `perf/` to Layout
- `bmad-todo-api/app/controllers/tasks_controller.rb` (MODIFIED) — Added destroy action for perf test teardown cleanup
- `bmad-todo-api/config/routes.rb` (MODIFIED) — Added :destroy to tasks resource routes
