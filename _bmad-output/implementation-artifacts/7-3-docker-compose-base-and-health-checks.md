# Story 7.3: Docker Compose base and health checks

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a base Docker Compose setup at the repo root that defines the client, API, and PostgreSQL services with health checks and dependency ordering,
so that I can run the full stack with one command and have the API start only after the database is ready.

## Acceptance Criteria

1. **Given** the repo root contains `bmad-todo-client` and `bmad-todo-api`, **when** I add `docker-compose.yml` at the repo root, **then** it defines services for the frontend (client), backend (API), and database (PostgreSQL).
2. **And** the `db` service has a `healthcheck` (e.g. `pg_isready` or equivalent) so Compose can detect when the database is ready.
3. **And** the API service has a `healthcheck` (e.g. `curl -f http://localhost:3000/up` or a Rails health route); the API application exposes a health endpoint (e.g. GET /up) that returns a success status.
4. **And** the API service uses `depends_on` with `condition: service_healthy` for the db service so the API starts only after the database is healthy.
5. **And** a root `.dockerignore` exists that excludes unnecessary content (e.g. `_bmad-output`, `node_modules`, `.git`) from build context where appropriate.
6. **And** `docker compose up` (or `docker compose -f docker-compose.yml up`) builds and starts all services such that the app is reachable.

## Tasks / Subtasks

- [x] Add or update `docker-compose.yml` at repo root with three services (AC: #1)
  - [x] Service `db`: PostgreSQL (e.g. postgres:16-alpine), env for user/password/db name, port 5432, volume for data
  - [x] Service `api` (or `bmad-todo-api`): build from `bmad-todo-api/`, expose 3000, env DATABASE_URL pointing at db service
  - [x] Service `client` (or `bmad-todo-client`): build from `bmad-todo-client/`, expose port for web (e.g. 80 or 8080)
- [x] Add db healthcheck and API healthcheck (AC: #2, #3)
  - [x] db: `healthcheck` using `pg_isready` (or equivalent) for PostgreSQL
  - [x] api: `healthcheck` using `curl -f http://localhost:3000/up` (Rails already has GET /up in routes)
- [x] Set API `depends_on` with `condition: service_healthy` on db (AC: #4)
- [x] Add root `.dockerignore` if missing (AC: #5)
  - [x] Exclude `_bmad-output`, `node_modules`, `.git`, and other non-build content from root build context
- [x] Verify `docker compose up` builds and starts all services; app reachable (AC: #6)

## Dev Notes

- **Relevant architecture:** Architecture (Infrastructure & Deployment, Docker Patterns): base `docker-compose.yml` at repo root; health checks required for API and db; `depends_on: condition: service_healthy` for API on db; root `.dockerignore` to exclude _bmad-output, node_modules, .git. Project structure shows docker-compose.yml, docker-compose.dev.yml, docker-compose.test.yml at root; override files are Story 7.4.
- **Source tree:** Repo root. Existing `docker-compose.yml` currently defines only postgres; extend it to add `api` and `client` services, health checks, and dependency. API already has GET /up in `config/routes.rb` (rails/health#show). Dockerfiles exist in `bmad-todo-api/` and `bmad-todo-client/` (Stories 7.1, 7.2).
- **Testing:** Run `docker compose up --build`; confirm db becomes healthy, then API starts; confirm client and API are reachable (e.g. curl API /up, open client in browser). No change to RSpec/Vitest suites required for “Compose works.”

### Project Structure Notes

- **Alignment:** Architecture specifies `docker-compose.yml` at repo root with client, API, and PostgreSQL; `.dockerignore` at root. Per-app Dockerfiles remain in `bmad-todo-api/` and `bmad-todo-client/`.
- **Current state:** Root `docker-compose.yml` exists with postgres only; add api and client services and health/depends_on. Root `.dockerignore` may be absent (per-app .dockerignore exist under client and api).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Infrastructure & Deployment, Docker Patterns, Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.3]
- [Source: bmad-todo-api/config/routes.rb — GET /up => rails/health#show]
- [Source: Docker Compose depends_on condition — https://docs.docker.com/compose/compose-file/05-services/#depends_on]

---

## Developer Context (Dev Agent Guardrails)

### Technical requirements

- **Three services in docker-compose.yml:** (1) **db** — PostgreSQL (e.g. `postgres:16-alpine`), with `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (e.g. `bmad_todo_api_development` or configurable), port 5432, volume for persistence. (2) **api** — build context `bmad-todo-api/`, use existing Dockerfile; set `DATABASE_URL` to point at db service (e.g. `postgresql://user:password@db:5432/dbname`); expose 3000; ensure Rails can reach db hostname `db` (Compose network). (3) **client** — build context `bmad-todo-client/`, use existing Dockerfile; expose port (e.g. 8080 or 80) for HTTP. Do not add override files or env documentation in this story (Story 7.4).
- **DB healthcheck:** Use `pg_isready` (or `pg_isready -U <user> -d <db>`). Example: `test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]` or equivalent; `interval`, `timeout`, `retries` as needed (e.g. 5s, 5s, 5).
- **API healthcheck:** Rails already has GET /up in routes. Use `curl -f http://localhost:3000/up` (or `wget -q -O /dev/null ...`). Ensure healthcheck runs inside the API container (e.g. `curl` or `wget` available in API image — API Dockerfile already includes `curl` for runtime). Example: `test: ["CMD", "curl", "-f", "http://localhost:3000/up"]` with interval/timeout/retries.
- **depends_on:** API service must have `depends_on: db: condition: service_healthy` so Compose starts API only after db is healthy. Client may depend on api for “full stack” order or optionally start in parallel; architecture requires API to start after db.
- **Root .dockerignore:** At repo root, exclude at least `_bmad-output`, `node_modules`, `.git`. When building from root with build context a subdirectory (e.g. `context: bmad-todo-api`), Compose uses that context; root `.dockerignore` still applies when build context is repo root. Prefer excluding large or sensitive dirs so any root-context build stays small. Per-epic: “Root .dockerignore to exclude _bmad-output, node_modules, .git, etc.”

### Architecture compliance

- **Infrastructure & Deployment:** Docker Compose at repo root; health checks for API and db; `depends_on: condition: service_healthy` for API on db (architecture: Infrastructure & Deployment, Docker Patterns).
- **No root user:** Already enforced in 7.1 and 7.2 Dockerfiles; no change required in this story.
- **Multistage only:** Already enforced in app Dockerfiles; Compose only references them.

### Library / framework requirements

- **Docker Compose:** Use Compose v2 syntax (`services:`, `build:`, `healthcheck:`, `depends_on: condition: service_healthy`). Compose file at repo root; no override files in this story.
- **PostgreSQL:** Use official image (e.g. `postgres:16-alpine`). Healthcheck via `pg_isready` (included in postgres image).
- **Rails:** GET /up already defined; no code change required. API container must have `curl` (or equivalent) for healthcheck; bmad-todo-api Dockerfile already includes `curl` in final stage.

### File structure requirements

- **docker-compose.yml:** At repo root (`bmad-todo/docker-compose.yml`). Define services `db`, `api`, and `client` (or names matching architecture). Use `build: context: bmad-todo-api` and `build: context: bmad-todo-client`; do not duplicate Dockerfile content.
- **.dockerignore:** At repo root. Contents: exclude `_bmad-output`, `node_modules`, `.git`; optionally `*.md`, `docs`, `.env` (if not needed for build). Ensure build contexts for api/client are subdirs; root .dockerignore applies when build context is root; when context is `bmad-todo-api`, that directory’s .dockerignore applies. Adding root .dockerignore is still required per AC for “build context where appropriate.”

### Testing requirements

- **Compose:** Run `docker compose up --build` from repo root. Db should become healthy; then API should start; client should be buildable and run.
- **Reachability:** After `docker compose up`, `curl -f http://localhost:3000/up` (API port) returns 200; client port (e.g. 8080) serves the app (curl or browser).
- **No new unit/integration tests** required for Compose itself; optional one-line README note on how to run with Compose.

### Previous story intelligence (Stories 7.1, 7.2)

- **7.1 (API Dockerfile):** Multistage build; non-root user `app`; final stage has `curl`; entrypoint may run `db:migrate`. For Compose, set `DATABASE_URL` so API can connect to `db` hostname (e.g. `postgresql://bmad_todo_api:bmad_todo_api@db:5432/bmad_todo_api_development`). API listens on 3000; healthcheck URL is `http://localhost:3000/up`.
- **7.2 (Client Dockerfile):** Multistage build; nginx on 8080 (non-root). Compose service can expose 8080 (or map to 80). No env vars required for client in this story (VITE_API_URL is 7.4). Build context: `bmad-todo-client/`.
- **Learnings:** Both Dockerfiles use named stages and run as non-root. Root `.dockerignore` was not added in 7.1/7.2; add at root in this story. Code review for 7.2 added per-app `.dockerignore` in client; architecture requires root `.dockerignore` for this story.

### Project context reference

- **Project:** bmad-todo (monorepo: bmad-todo-client, bmad-todo-api). Frontend: Vite 7 + React 19 + TypeScript; backend: Rails API + PostgreSQL. No auth for MVP.
- **Relevant docs:** _bmad-output/planning-artifacts (architecture.md, epics.md). No project-context.md in repo.
- **Existing assets:** `bmad-todo-api/Dockerfile` (7.1), `bmad-todo-client/Dockerfile` (7.2), `bmad-todo-api/config/routes.rb` (GET /up). Root `docker-compose.yml` currently has postgres only; extend with api and client.

### Story completion status

- **Status:** ready-for-dev
- **Completion note:** Ultimate context engine analysis completed — comprehensive developer guide created.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented docker-compose.yml at repo root with services `db`, `api`, and `client`. Renamed existing `postgres` service to `db`; added healthcheck using `pg_isready`; added `api` (build bmad-todo-api, DATABASE_URL, SECRET_KEY_BASE, BMAD_TODO_API_DATABASE_PASSWORD) with healthcheck `curl -f http://localhost:3000/up` and `depends_on: db: condition: service_healthy`; added `client` (build bmad-todo-client, port 8080) with `depends_on: api`. Created root `.dockerignore` excluding _bmad-output, node_modules, .git, *.md, docs, .env. Production database.yml primary was given explicit `url: ENV["DATABASE_URL"]` so Compose can connect API to db service. Verified `docker compose config`, `docker compose build`, and `docker compose up -d`; db becomes healthy, then API starts; `curl http://localhost:3000/up` and client on :8080 both reachable.

### File List

- docker-compose.yml (modified)
- .dockerignore (new)
- bmad-todo-api/config/database.yml (modified: production primary url for DATABASE_URL)
- README.md (modified: full-stack Compose instructions and SECRET_KEY_BASE note)

### Change Log

- 2026-02-19: Story 7.3 implemented — Docker Compose base with db/api/client services, health checks, depends_on, root .dockerignore; API production DB config uses DATABASE_URL for Compose.
- 2026-02-19: Code review (adversarial). Findings: 1 High, 4 Medium, 3 Low. See code-review-7-3-docker-compose-base-and-health-checks.md. Outcome: Changes requested.
- 2026-02-19: Review follow-up fixes applied: SECRET_KEY_BASE from env (no default); client depends_on api with condition: service_healthy; database.yml production primary uses ENV.fetch for DATABASE_URL; comments for credentials and Compose/primary-only; README full-stack and SECRET_KEY_BASE. Status → done.

### Senior Developer Review (AI)

- **Review date:** 2026-02-19
- **Reviewer:** RVS (adversarial code-review workflow)
- **Artifact:** `code-review-7-3-docker-compose-base-and-health-checks.md`
- **Git vs Story:** No discrepancies for app source; File List matches modified files.
- **AC/task verification:** AC #1–#5 met in code; AC #6 per completion notes; all tasks [x] evidenced.
- **Issues:** 1 High (SECRET_KEY_BASE hardcoded), 4 Medium (client depends_on, production DB config, DATABASE_URL unset, credentials in compose), 3 Low (.dockerignore .env.*, db start_period, README).
- **Outcome:** Changes requested. Address HIGH and MEDIUM before marking done.
- **Follow-up (2026-02-19):** HIGH and MEDIUM issues fixed automatically. Status set to done.
