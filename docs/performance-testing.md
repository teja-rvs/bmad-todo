# Performance Testing

This document describes the bmad-todo performance testing approach, the tools and thresholds used, how to run the suites, and how to interpret results.

## Overview

bmad-todo validates performance at two layers:

| Layer | Tool | What it measures |
|-------|------|------------------|
| **API** | [Grafana k6](https://k6.io/) | Endpoint response-time percentiles under concurrent load |
| **Client** | [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) (LHCI) | Core Web Vitals and Lighthouse performance score against the production build |

Both suites exit non-zero when an **error**-level threshold is breached, making them safe to gate on in CI or pre-release checks.

### Design principles

- **Lightweight and repeatable** — tests run in seconds on a single machine; no external infrastructure required.
- **Threshold-driven** — every metric has a pass/fail threshold traced back to the project's Non-Functional Requirements (NFRs).
- **Self-cleaning** — the k6 suite seeds its own data and tears it down; LHCI audits a static build directory with no API dependency.

---

## API Performance Testing (k6)

### What is measured

The k6 script (`perf/api-perf.js`) exercises the three core API endpoints of the MVP under light concurrent load:

| Endpoint | HTTP Method | Validates |
|----------|-------------|-----------|
| `/tasks` | GET | Listing tasks remains fast as the dataset grows |
| `/tasks` | POST | Creating a task completes within the user-perceived latency budget |
| `/tasks/:id` | PATCH | Toggling task completion meets the same budget |

### Tool rationale

k6 was chosen because it:

- Runs as a standalone binary (no Node.js or Ruby runtime dependency).
- Uses a JavaScript ES-module test API familiar to the project's frontend developers.
- Has first-class threshold support — thresholds are declared in the script and k6 evaluates them automatically.
- Produces machine-readable output suitable for CI pipelines.

### Test design

| Setting | Value | Rationale |
|---------|-------|-----------|
| Executor | `shared-iterations` | Ensures a fixed, predictable workload (50 iterations shared across VUs) |
| Virtual Users (VUs) | 3 | Enough concurrency to surface contention without overloading a dev machine |
| Iterations | 50 | Statistically meaningful sample for p95 percentile calculation |
| Max duration | 60 s | Safety net; typical runs complete in < 10 s |

Each iteration executes **all three** endpoint groups sequentially with a 500 ms pause between iterations.

### Setup and teardown (test data management)

k6's lifecycle hooks handle data automatically:

- **`setup()`** verifies the API is reachable (`GET /up`) and then seeds **15 tasks** via `POST /tasks` (titles prefixed `perf-seed-`). The returned IDs are shared with all VUs.
- **Default function** creates additional tasks during iterations (titles prefixed `perf-iter-`), and randomly selects seed task IDs for PATCH operations.
- **`teardown()`** lists all tasks (`GET /tasks`), filters those with `perf-seed-` or `perf-iter-` prefixes, and deletes them via `DELETE /tasks/:id`.

> **Recommendation:** Run against a **test database** so any leftover data (e.g. from an interrupted run) does not accumulate in your development DB.

---

## Client Performance Testing (Lighthouse CI)

### What is measured

LHCI audits the **production build** of `bmad-todo-client` and collects Core Web Vitals:

| Metric | What it indicates |
|--------|-------------------|
| Largest Contentful Paint (LCP) | Time until the largest visible element renders — proxy for perceived load speed |
| First Contentful Paint (FCP) | Time until the first text/image renders |
| Performance score | Lighthouse's composite score (0–1) combining multiple lab metrics |
| Total Blocking Time (TBT) | Time the main thread is blocked, affecting interactivity |
| Cumulative Layout Shift (CLS) | Visual stability — how much elements shift during load |

### Tool rationale

Lighthouse CI was chosen because it:

- Audits a **static build** (`dist/`) with no running API required — fast and deterministic.
- Provides threshold assertions with configurable severity levels (`error` vs `warn`).
- Runs headless Chrome via Playwright's bundled Chromium (already a project devDependency).
- Produces detailed HTML reports for deeper investigation.

### Test design

Configuration lives in `bmad-todo-client/lighthouserc.json`:

| Setting | Value | Rationale |
|---------|-------|-----------|
| `staticDistDir` | `./dist` | Audits the Vite production build directly — no server needed |
| `numberOfRuns` | 3 | Multiple runs reduce variance from system load; median is reported |
| `aggregationMethod` | `median-run` | Median is more stable than the default "optimistic" (best run) method |
| Upload target | `filesystem` (`.lighthouseci/`) | HTML reports saved locally for review |

### Chromium dependency

LHCI requires a Chrome/Chromium binary. The `npm run perf` script auto-detects **Playwright's bundled Chromium** (installed as part of the project's E2E test dependencies). If Chromium is not found, the script prints an error suggesting:

```bash
npx playwright install chromium
```

---

## NFR Traceability Matrix

Every threshold is traceable to a specific Non-Functional Requirement from the product requirements document (PRD).

| NFR | Requirement text | Tool | Metric | Threshold | How validated |
|-----|------------------|------|--------|-----------|---------------|
| **NFR-P1** | User-triggered actions complete and reflect in the UI within **200 ms** (excluding network latency) | k6 | `POST /tasks` p95 | < 200 ms | k6 threshold on `http_req_duration{name:POST /tasks}` |
| **NFR-P1** | *(same)* | k6 | `PATCH /tasks/:id` p95 | < 200 ms | k6 threshold on `http_req_duration{name:PATCH /tasks/:id}` |
| **NFR-P2** | List updates visible after action without manual refresh | k6 | `GET /tasks` p95 | < 200 ms | k6 threshold on `http_req_duration{name:GET /tasks}` — validates the refetch-after-mutation pattern stays fast |
| **NFR-P3** | Initial load completes within **3 seconds** on typical broadband | LHCI | LCP | < 3 000 ms | LHCI error-level assertion |
| **NFR-P3** | *(same)* | LHCI | FCP | < 2 000 ms | LHCI error-level assertion (stricter sub-goal) |
| **NFR-P3** | *(same)* | LHCI | Performance score | ≥ 0.9 | LHCI error-level assertion |
| — | Best practice | LHCI | TBT | < 300 ms | LHCI warn-level assertion |
| — | Best practice | LHCI | CLS | < 0.1 | LHCI warn-level assertion |

---

## Consolidated Thresholds

| Tool | Metric | Threshold | Level | NFR |
|------|--------|-----------|-------|-----|
| k6 | `GET /tasks` p95 response time | < 200 ms | error | NFR-P2 |
| k6 | `POST /tasks` p95 response time | < 200 ms | error | NFR-P1 |
| k6 | `PATCH /tasks/:id` p95 response time | < 200 ms | error | NFR-P1 |
| LHCI | Largest Contentful Paint (LCP) | < 3 000 ms | error | NFR-P3 |
| LHCI | First Contentful Paint (FCP) | < 2 000 ms | error | NFR-P3 |
| LHCI | Performance score | ≥ 0.9 | error | NFR-P3 |
| LHCI | Total Blocking Time (TBT) | < 300 ms | warn | — |
| LHCI | Cumulative Layout Shift (CLS) | < 0.1 | warn | — |

**Error** thresholds cause a non-zero exit code (suite failure). **Warn** thresholds are reported but do not fail the run.

---

## Running the Suites

### Prerequisites

| Requirement | k6 (API perf) | LHCI (client perf) |
|-------------|:---:|:---:|
| k6 binary installed | ✔ | — |
| Node.js + npm | — | ✔ |
| Rails API running | ✔ | — |
| PostgreSQL running | ✔ | — |
| Chromium / Playwright | — | ✔ (bundled) |

### k6 — API performance tests

1. **Start the API** (choose one):

   ```bash
   # Option A: Docker Compose (recommended — includes PostgreSQL)
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up

   # Option B: Local Rails server (requires local PostgreSQL)
   cd bmad-todo-api && rails s
   ```

2. **Run k6** from the repo root:

   ```bash
   k6 run perf/api-perf.js
   ```

   Override the API URL if the server is on a different host/port:

   ```bash
   k6 run --env API_URL=http://localhost:3000 perf/api-perf.js
   ```

3. **Exit code:** 0 = all thresholds passed. Non-zero = at least one threshold breached.

### LHCI — Client performance checks

1. **Install dependencies** (first time):

   ```bash
   cd bmad-todo-client
   npm install
   ```

2. **Run the perf script:**

   ```bash
   cd bmad-todo-client
   npm run perf
   ```

   This builds the production bundle (`dist/`) and runs LHCI against it. No running API is required.

3. **Exit code:** 0 = all error-level thresholds passed. Non-zero = at least one error-level assertion failed.

### Running both suites together

There is no single command that runs both suites because they have different prerequisites (k6 needs the API running; LHCI does not). Run them sequentially:

```bash
# Terminal 1 — start the API
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Terminal 2 — run API perf tests
k6 run perf/api-perf.js

# Terminal 2 — run client perf checks (no API needed)
cd bmad-todo-client && npm run perf
```

---

## Interpreting Results

### k6 output

k6 prints a summary to stdout after each run. Key lines:

```
http_req_duration{name:GET /tasks}.....: avg=5.12ms  min=2.10ms  med=4.50ms  max=23.91ms  p(90)=8.20ms  p(95)=12.30ms
  ✓ { name:GET /tasks } p(95)<200
http_req_duration{name:POST /tasks}....: avg=4.67ms  min=2.01ms  med=4.10ms  max=14.67ms  p(90)=7.50ms  p(95)=10.20ms
  ✓ { name:POST /tasks } p(95)<200
http_req_duration{name:PATCH /tasks/:id}: avg=4.76ms  min=1.98ms  med=4.20ms  max=14.76ms  p(90)=7.80ms  p(95)=10.50ms
  ✓ { name:PATCH /tasks/:id } p(95)<200
```

- **`✓`** next to a threshold = pass. **`✗`** = fail (the breached value is shown).
- The `p(95)` column is the metric compared against the 200 ms threshold.
- `http_req_failed` shows the rate of non-2xx responses (should be 0%).
- Setup/teardown log lines confirm data seeding and cleanup counts.

### LHCI output

LHCI runs Lighthouse 3 times and reports the median. Key output:

```
✅  All results processed!
✅  largest-contentful-paint: 850ms (< 3000ms)     [median]
✅  first-contentful-paint:  420ms (< 2000ms)       [median]
✅  categories:performance:  0.99  (>= 0.9)         [median]
⚠️  total-blocking-time:     50ms  (< 300ms)        [median]  (warn)
✅  cumulative-layout-shift: 0.001 (< 0.1)          [median]
```

- **`✅ All results processed!`** — all error-level assertions passed.
- **`✘ metric-name failure`** — a threshold was breached; expected and actual values are printed.
- **Exit code 0** = pass. **Exit code 1** = at least one error-level assertion failed.
- Detailed HTML reports are saved to `bmad-todo-client/.lighthouseci/` for deeper investigation.

---

## Test Data Management

### k6 (API tests)

| Phase | Action | Detail |
|-------|--------|--------|
| **Setup** | Seed 15 tasks | `POST /tasks` with titles prefixed `perf-seed-` |
| **Iterations** | Create tasks per iteration | Titles prefixed `perf-iter-` |
| **Teardown** | Delete all perf tasks | Filters by `perf-seed-` and `perf-iter-` prefixes, deletes via `DELETE /tasks/:id` |

The prefixed naming convention ensures perf data is identifiable and cleanly removable. If a run is interrupted before teardown completes, manually delete tasks matching these prefixes or use a test database that can be reset.

### LHCI (client tests)

LHCI audits the static `dist/` directory — no persistent data is created or modified. Report artifacts are saved to `bmad-todo-client/.lighthouseci/` (git-ignored).

---

## CI Integration (GitHub Actions)

A GitHub Actions workflow (`.github/workflows/performance.yml`) runs both performance suites automatically.

### Triggers

| Trigger | When |
|---------|------|
| `workflow_dispatch` | Manual run from the Actions tab (always available) |
| Push to `main` | Validates that merged changes meet performance thresholds (only when relevant paths change: `perf/`, `bmad-todo-api/`, `bmad-todo-client/`, `docker-compose.yml`, or the workflow file itself) |

A concurrency group prevents parallel runs on the same branch — a new push cancels any in-progress performance run.

### Jobs

#### `api-perf` — k6 API performance tests

1. Starts the API and database via Docker Compose (`docker-compose.yml`, production mode) — the client service is not started.
2. Waits for the API health check (`GET /up` returns 200).
3. Installs k6 via the official `grafana/setup-k6-action`.
4. Runs `k6 run perf/api-perf.js`.
5. Tears down Docker Compose.

Job timeout: 15 minutes.

#### `client-perf` — Lighthouse CI client performance checks

1. Sets up Node.js and installs dependencies (`npm ci`).
2. Installs Chromium and system dependencies via Playwright (`npx playwright install --with-deps chromium`).
3. Runs `npm run perf` (builds production bundle + runs LHCI).

Job timeout: 10 minutes.

Both jobs run in parallel. Either job failing marks the workflow as failed.

### Reading CI results

- Navigate to the **Actions** tab in the GitHub repository.
- Select the **Performance Tests** workflow.
- Each run shows the `api-perf` and `client-perf` jobs with their pass/fail status.
- Expand a job to see the full k6 or LHCI output in the step logs.
- For LHCI, detailed HTML reports are available as artifacts if the upload step is configured (not included by default to keep CI fast).

### Environment and secrets

No secrets are required. The API runs in Docker with default credentials. LHCI audits a static build with no network dependencies.
