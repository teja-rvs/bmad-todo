# Story 7.4: Compose override files and environment configuration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want environment-specific Compose overrides and documented env vars so that dev and test runs use the correct database, ports, and API URL without code changes,
so that onboarding and running tests in Docker are straightforward.

## Acceptance Criteria

1. **Given** the base `docker-compose.yml` exists, **when** I add `docker-compose.dev.yml` and `docker-compose.test.yml` at the repo root, **then** dev override supplies dev-appropriate env vars (e.g. `RAILS_ENV=development`, `DATABASE_URL`, optional volume mounts for live code if desired).
2. **And** test override supplies test-appropriate env vars (e.g. `RAILS_ENV=test`, separate or isolated test DB) so that test runs (e.g. `docker compose run api rspec`) use the test database.
3. **And** the frontend container receives the API URL via an env var (e.g. `VITE_API_URL` or equivalent) that points at the API service (e.g. `http://bmad-todo-api:3000` or as appropriate for the compose network), so the client in Docker can call the API.
4. **And** a root `.env.example` lists all required env vars (e.g. `VITE_API_URL`, `DATABASE_URL`, `RAILS_ENV`) with example values and no secrets.
5. **And** the README (or equivalent) documents how to run with Docker: e.g. `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` for dev, and how to use the test override for running tests; which env vars are required and where to set them (e.g. `.env`).

## Tasks / Subtasks

- [x] Add `docker-compose.dev.yml` at repo root (AC: #1)
  - [x] Override env: `RAILS_ENV=development`, `DATABASE_URL` for dev DB; optional volume mounts for api/client if desired
  - [x] Ensure client receives `VITE_API_URL` pointing at API service (e.g. `http://api:3000` or service name used in compose)
- [x] Add `docker-compose.test.yml` at repo root (AC: #2)
  - [x] Override env: `RAILS_ENV=test`, test DB URL or isolated test DB name
  - [x] Ensure `docker compose run api rspec` (or equivalent) uses test database
- [x] Pass API URL to frontend in Compose (AC: #3)
  - [x] Set `VITE_API_URL` (or equivalent) for client service so built app calls API in Docker network (e.g. `http://api:3000` or `http://bmad-todo-api:3000`)
- [x] Add or update root `.env.example` (AC: #4)
  - [x] List `VITE_API_URL`, `DATABASE_URL`, `RAILS_ENV`, `SECRET_KEY_BASE` with example values; no secrets
- [x] Update README with Docker run and env docs (AC: #5)
  - [x] Document `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` for dev
  - [x] Document test override usage for running tests in Docker
  - [x] Document which env vars are required and where to set them (e.g. `.env`)

## Dev Notes

- **Relevant architecture:** Architecture — Infrastructure & Deployment, Docker Patterns: "Dev/test via env vars + compose files"; base `docker-compose.yml`, overrides `docker-compose.dev.yml`, `docker-compose.test.yml`; `.env.example` at root; frontend in Docker must receive API URL via env (e.g. `VITE_API_URL`). Project structure lists these files at repo root.
- **Source tree:** Repo root. Existing `docker-compose.yml` (Story 7.3) defines `db`, `api`, `client` with health checks; api uses `DATABASE_URL` and `SECRET_KEY_BASE`; client has no `VITE_API_URL` yet — add in override or base so client build/runtime gets API URL for Docker network (e.g. `http://api:3000`). Vite embeds `VITE_*` at build time; ensure client Dockerfile build stage receives `ARG`/`ENV` for `VITE_API_URL` if needed, or runtime config if app reads env at runtime.
- **Testing:** After adding overrides, run `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` and verify app works; run `docker compose -f docker-compose.yml -f docker-compose.test.yml run api rspec` and verify tests use test DB. No new unit tests required for compose files.

### Project Structure Notes

- **Alignment:** Architecture specifies `docker-compose.yml`, `docker-compose.dev.yml`, `docker-compose.test.yml`, `.env.example` at repo root. Client and API Dockerfiles remain in app dirs (7.1, 7.2).
- **Current state:** Base compose exists; no override files yet. README mentions full-stack Compose and SECRET_KEY_BASE; extend with override usage and env list.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Infrastructure & Deployment, Docker Patterns, Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.4]
- [Source: docker-compose.yml (repo root) — current services db, api, client]

---

## Developer Context (Dev Agent Guardrails)

### Technical requirements

- **docker-compose.dev.yml:** Extend or override base compose. Set `RAILS_ENV=development`. Provide `DATABASE_URL` for dev (e.g. same as base or from env). Optionally add volume mounts for api (`bmad-todo-api` into app dir) and/or client for live code. **Critical:** Set `VITE_API_URL` for client service so the frontend can call the API inside Docker network. Use Compose service name as host (e.g. `http://api:3000` if service is `api`). Vite bakes `VITE_API_URL` at build time — ensure client image is built with this env/ARG in the build stage, or document that dev override is used with a build that already has the URL; if client reads API URL at runtime (e.g. from window or env at container start), set it in the service `environment`.
- **docker-compose.test.yml:** Set `RAILS_ENV=test`. Use a separate test DB (e.g. `bmad_todo_api_test`) or same host with different `DATABASE_URL`. Ensure `docker compose run api rspec` (or `docker compose -f docker-compose.yml -f docker-compose.test.yml run api rspec`) runs RSpec with test DB. API may need to run migrations for test DB (e.g. `rails db:create db:migrate RAILS_ENV=test` in entrypoint or documented step).
- **VITE_API_URL for client in Docker:** Architecture: "Frontend in Docker must receive API URL via env (e.g. VITE_API_URL)." In Compose, client service must have this set to the API service URL reachable from inside the network (e.g. `http://api:3000`). If the frontend is built at image build time (as in 7.2), the Dockerfile must accept build-arg for `VITE_API_URL` and pass it during `npm run build`; then compose (dev/test) can pass `build.args: VITE_API_URL: http://api:3000` or set in `.env`. If the app reads API URL at runtime, set in service `environment` and ensure client code uses it.
- **.env.example:** At repo root. List: `VITE_API_URL=` (e.g. `http://localhost:3000` for local dev or `http://api:3000` for Docker), `DATABASE_URL=` (e.g. `postgresql://bmad_todo_api:bmad_todo_api@localhost:5432/bmad_todo_api_development`), `RAILS_ENV=development`, `SECRET_KEY_BASE=` (note: generate with `rails secret`, do not commit real value). No secrets; example values only.
- **README:** Document: (1) Dev: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` (and that `.env` can provide vars). (2) Test: how to run API tests in Docker with test override (e.g. `docker compose -f docker-compose.yml -f docker-compose.test.yml run api rspec`). (3) Required env vars and where to set them (e.g. copy `.env.example` to `.env`, set `SECRET_KEY_BASE`).

### Architecture compliance

- **Infrastructure & Deployment, Docker Patterns:** "Dev/test via env vars + compose files"; base compose + override files; `.env.example`; frontend API URL via env in Docker. All must be satisfied.
- **Project Structure:** Repo root must have `docker-compose.yml`, `docker-compose.dev.yml`, `docker-compose.test.yml`, `.env.example` as per architecture.
- **No root user / multistage:** Already enforced in 7.1/7.2; overrides only add env and optional volumes.

### Library / framework requirements

- **Docker Compose:** Use Compose v2 merge semantics: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` merges files; later file overrides earlier. Use standard `environment`, `env_file`, `build.args` as needed.
- **Vite:** `VITE_*` vars are embedded at build time by default. For Docker, either (1) build with build-arg in Dockerfile and pass in compose `build.args`, or (2) use runtime config if the app supports it. Document the chosen approach in README.
- **Rails:** `RAILS_ENV` and `DATABASE_URL` control environment and DB. Test DB must be created/migrated before running rspec in container if not already present.

### File structure requirements

- **docker-compose.dev.yml:** Repo root. Can use `extends` or plain override (same service names as base). Typically only `environment` (and optionally `volumes`, `build.args`) overrides.
- **docker-compose.test.yml:** Repo root. Override `RAILS_ENV=test` and `DATABASE_URL` for test DB.
- **.env.example:** Repo root. Plain list of VAR=example_value; no real secrets.
- **README.md:** Repo root. Add or extend section for Docker: dev command, test command, env vars and `.env`.

### Testing requirements

- **Manual:** Run `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build`; open client, verify it can reach API (e.g. load tasks). Run `docker compose -f docker-compose.yml -f docker-compose.test.yml run api rspec`; all specs should pass using test DB.
- **No new automated tests** for compose files; README and .env.example are documentation.

### Previous story intelligence (Stories 7.1–7.3)

- **7.1 (API Dockerfile):** Multistage, non-root; `DATABASE_URL` used in Compose. Overrides will set `RAILS_ENV` and optionally different `DATABASE_URL` for dev/test.
- **7.2 (Client Dockerfile):** Multistage, nginx on 8080. No `VITE_API_URL` in 7.2/7.3; 7.4 adds it. If client Dockerfile does not yet accept `VITE_API_URL` build-arg, add ARG and use during `npm run build` so built assets point at API service URL when run in Compose.
- **7.3 (Base Compose):** Services `db`, `api`, `client`; api has `depends_on: db: condition: service_healthy`; client has `depends_on: api: condition: service_healthy`. Base uses `RAILS_ENV: production` and explicit `DATABASE_URL`. Dev override should set `RAILS_ENV=development` and can reuse or override `DATABASE_URL`; test override sets `RAILS_ENV=test` and test `DATABASE_URL`. Do not remove health checks or depends_on in overrides unless intentionally changing behavior; prefer adding env and optional volumes only.
- **Learnings:** Code review for 7.3 emphasized SECRET_KEY_BASE from env (no default), client depends_on api with condition, production DB from ENV. Overrides should not hardcode secrets; use `.env` and `.env.example`.

### Git intelligence summary

- Recent commits: Story 7-3 (docker-compose base, health checks, root .dockerignore), 7-2 (frontend Dockerfile), 7-1 (API Dockerfile). Pattern: one story file per implementation; completion notes and file list in story. No override files in repo yet; this story adds them.

### Project context reference

- **Project:** bmad-todo (monorepo: bmad-todo-client, bmad-todo-api). Frontend: Vite + React + TypeScript; backend: Rails API + PostgreSQL. No auth for MVP.
- **Relevant docs:** _bmad-output/planning-artifacts/architecture.md, epics.md. No project-context.md in repo.
- **Existing:** docker-compose.yml (7.3) with db, api, client; .dockerignore at root; README with full-stack Compose and SECRET_KEY_BASE note. Add override files and .env.example; extend README.

### Story completion status

- **Status:** ready-for-dev
- **Completion note:** Ultimate context engine analysis completed — comprehensive developer guide created.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented docker-compose.dev.yml (RAILS_ENV=development, DATABASE_URL, client VITE_API_URL via build args) and docker-compose.test.yml (RAILS_ENV=test, test DB, client VITE_API_URL). Added ARG VITE_API_URL to client Dockerfile for build-time embedding. Updated root .env.example with VITE_API_URL, DATABASE_URL, RAILS_ENV, SECRET_KEY_BASE. Extended README with dev/test override usage and required env vars. All acceptance criteria satisfied; client and API test suites pass.
- 2026-02-19 (code review): Fixed README — PostgreSQL section command `postgres` → `db`; "profile override" → "override file". Staged docker-compose.dev.yml and docker-compose.test.yml. Added e2e/real-api.spec.ts to File List (uses VITE_API_URL for Docker/CI).

### File List

- docker-compose.dev.yml (new)
- docker-compose.test.yml (new)
- bmad-todo-client/Dockerfile (modified: ARG/ENV VITE_API_URL for build)
- bmad-todo-client/e2e/real-api.spec.ts (modified: uses VITE_API_URL for Docker/CI)
- .env.example (modified: VITE_API_URL, DATABASE_URL, RAILS_ENV)
- README.md (modified: Docker dev/test commands and env docs)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified: story 7-4 in-progress → review)

## Change Log

- 2026-02-19: Story 7-4 implemented. Added docker-compose.dev.yml and docker-compose.test.yml; client Dockerfile VITE_API_URL build arg; root .env.example with required vars; README Docker and env documentation.
- 2026-02-19: Code review fixes. README: postgres → db, profile → override file; e2e spec added to File List; override files staged.
