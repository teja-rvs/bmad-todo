# bmad-todo

Monorepo: Rails API backend + Vite + React + TypeScript frontend.

## Run the full stack (Docker Compose)

From the repo root, use the **base** compose plus an override file:

**Development (recommended):**

```bash
cp .env.example .env
# Edit .env and set SECRET_KEY_BASE (generate with: cd bmad-todo-api && rails secret)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- API at http://localhost:3000, client at http://localhost:8080.
- Dev override sets `RAILS_ENV=development`, dev database, and `VITE_API_URL` so the client in Docker can call the API.
- Do not commit `.env`.

**Running API tests in Docker:**

```bash
# Create and migrate test DB (first time or after schema changes)
docker compose -f docker-compose.yml -f docker-compose.test.yml run api rails db:create db:migrate RAILS_ENV=test

# Run API test suite
docker compose -f docker-compose.yml -f docker-compose.test.yml run api bin/rails test
```

The test override sets `RAILS_ENV=test` and a separate test database (`bmad_todo_api_test`).

**Required env vars:** See `.env.example`. Copy it to `.env` and set at least `SECRET_KEY_BASE` for production-like runs. Options: `VITE_API_URL`, `DATABASE_URL`, `RAILS_ENV` (overrides in compose files set these for dev/test). **`CORS_ORIGIN`** — Allowed origin for API CORS (default `http://localhost:8080`). Set this when the frontend is served from a different URL (e.g. `http://localhost:5173` for Vite dev, or your production client URL).

## PostgreSQL (Docker)

The API uses PostgreSQL. From the project root, start the database service (when using base compose only):

```bash
docker compose up -d db
```

Default connection (used by Rails): host `localhost`, port `5432`, user `bmad_todo_api`, password `bmad_todo_api`. Override with `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` if needed.

## Run the API (backend)

```bash
cd bmad-todo-api
rails db:create   # first time only (requires Postgres running)
rails db:migrate  # first time only
rails s
```

Server runs at **http://localhost:3000** (default).

## Run the client (frontend)

```bash
cd bmad-todo-client
npm install   # first time only
npm run dev
```

Vite dev server runs at **http://localhost:5173** (default).

## Performance Testing (k6)

API performance tests live in `perf/` and use [Grafana k6](https://k6.io/).

### Install k6

| OS | Command |
|----|---------|
| macOS (Homebrew) | `brew install k6` |
| Debian / Ubuntu | `sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68 && echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \| sudo tee /etc/apt/sources.list.d/k6.list && sudo apt-get update && sudo apt-get install k6` |
| Other | Download from https://k6.io/docs/get-started/installation/ |

k6 is a standalone binary — no npm or gem dependency required.

### Prerequisites

1. The Rails API must be running (default `http://localhost:3000`):

   ```bash
   cd bmad-todo-api && rails s
   # or via Docker:
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up
   ```

2. Teardown automatically removes all perf-test tasks (titles prefixed `perf-seed-` and `perf-iter-`) via DELETE /tasks/:id. Use a **test database** when possible so any leftover data does not accumulate in your development DB.

### Run

From the repo root:

```bash
k6 run perf/api-perf.js
```

Override the API base URL if the server is on a different host or port:

```bash
k6 run --env API_URL=http://localhost:3000 perf/api-perf.js
```

### Thresholds

| Endpoint | Metric | Threshold |
|----------|--------|-----------|
| `GET /tasks` | p95 response time | < 200 ms |
| `POST /tasks` | p95 response time | < 200 ms |
| `PATCH /tasks/:id` | p95 response time | < 200 ms |

k6 exits **non-zero** if any threshold is exceeded.

### Interpreting results

k6 prints a summary to stdout after each run. Key lines to look for:

- **`http_req_duration{name:GET /tasks}`** — p95 and median timings for the GET endpoint.
- **`http_req_duration{name:POST /tasks}`** — same for POST.
- **`http_req_duration{name:PATCH /tasks/:id}`** — same for PATCH.
- **`✓` / `✗`** next to each threshold indicates pass or fail.

A passing run ends with exit code 0. A failing run (any threshold breached) ends with a non-zero exit code.

## Client Performance (Lighthouse CI)

Client-side performance checks use [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) to measure Core Web Vitals against the production build. This validates NFR-P3 (initial load within 3 s).

### Prerequisites

- **Node.js** and npm (dependencies install with `npm install`)
- **Chromium / Chrome** — LHCI needs a Chrome installation. The `perf` script auto-detects Playwright's bundled Chromium (already a project devDependency). If you see "Chromium not found", run `npx playwright install chromium` to download the browser binary.

### Run

From the `bmad-todo-client/` directory:

```bash
cd bmad-todo-client
npm run perf
```

This builds the production bundle (`dist/`) and runs Lighthouse CI against it using `staticDistDir` — no running API is required.

### Thresholds

| Metric | Threshold | Level | NFR |
|--------|-----------|-------|-----|
| Largest Contentful Paint (LCP) | < 3 000 ms | error | NFR-P3 |
| First Contentful Paint (FCP) | < 2 000 ms | error | — |
| Performance score | ≥ 0.9 | error | — |
| Total Blocking Time (TBT) | < 300 ms | warn | — |
| Cumulative Layout Shift (CLS) | < 0.1 | warn | — |

LHCI exits **non-zero** if any `error`-level threshold is exceeded. `warn`-level metrics are reported but do not fail the run.

### Interpreting results

LHCI runs Lighthouse 3 times and takes the median. Output to look for:

- **"All results processed!"** — all assertions passed.
- **"✘ metric-name failure"** — a threshold was breached; the expected and actual values are printed.
- **Exit code 0** — pass. **Exit code 1** — at least one error-level assertion failed.

Detailed HTML reports are saved to `bmad-todo-client/.lighthouseci/`.

## Layout

- `bmad-todo-api/` — Rails API (PostgreSQL)
- `bmad-todo-client/` — Vite + React + TypeScript + Tailwind (Tailwind v4 via `@tailwindcss/vite`; content auto-detected)
- `perf/` — k6 API performance tests
- `_bmad-output/` — planning and implementation artifacts
