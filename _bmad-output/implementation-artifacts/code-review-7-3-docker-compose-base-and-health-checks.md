# Code Review: Story 7.3 — Docker Compose base and health checks

**Story:** 7-3-docker-compose-base-and-health-checks  
**Story key:** 7-3-docker-compose-base-and-health-checks  
**Reviewed:** 2026-02-19  
**Reviewer:** Adversarial code review (workflow)

---

## Git vs Story Discrepancies

- **Story File List:** `docker-compose.yml` (modified), `.dockerignore` (new), `bmad-todo-api/config/database.yml` (modified).
- **Git status:** Modified — `docker-compose.yml`, `bmad-todo-api/config/database.yml`; Untracked — `.dockerignore`, `7-3-docker-compose-base-and-health-checks.md`.
- **Discrepancy count:** 0 for application source. Story file and `_bmad-output` changes are excluded per workflow (no review of _bmad-output). All claimed app files are present in git changes.
- **Transparency:** Changes are uncommitted; story does not explicitly note "uncommitted" in File List (minor).

---

## Issues Found

**Summary:** 1 High, 4 Medium, 3 Low

---

### CRITICAL / HIGH

1. **Hardcoded SECRET_KEY_BASE in docker-compose.yml (security)**  
   **File:** `docker-compose.yml` (lines 27–28)  
   A fixed placeholder `SECRET_KEY_BASE` is committed. If this compose file is used in production without override, the app runs with a known secret. **Required:** Use an environment variable with no default (e.g. `SECRET_KEY_BASE: ${SECRET_KEY_BASE}` and document that it must be set), or fail at startup if unset in production. Comment says "override in 7.4" but the value should not be in repo for production use.

---

### MEDIUM

2. **Client starts before API is healthy**  
   **File:** `docker-compose.yml` (lines 49–50)  
   `client` has `depends_on: - api` without `condition: service_healthy`. The API container can be "started" before its healthcheck passes, so the client may hit the API before it is ready. **Recommendation:** Use `depends_on: api: condition: service_healthy` so the full stack is ready when the client starts (aligns with "app reachable" in AC #6).

3. **Production database.yml: cache/queue/cable databases**  
   **File:** `bmad-todo-api/config/database.yml` (lines 83–94)  
   Production defines `cache`, `queue`, and `cable` DBs inheriting from primary with different `database:` names. Compose only provisions one DB (`bmad_todo_api_development`). If any code or Rails feature touches these connections, they will try to connect to non-existent databases. **Recommendation:** Document that Compose uses primary only, or simplify production to primary-only for this MVP and add multi-db when needed.

4. **DATABASE_URL unset in production**  
   **File:** `bmad-todo-api/config/database.yml` (line 79)  
   `url: <%= ENV["DATABASE_URL"] %>` yields `nil` if unset. Rails may fail with an opaque error. **Recommendation:** Use `ENV.fetch("DATABASE_URL")` with a clear message in production, or document in README that DATABASE_URL is required for production/Compose.

5. **Hardcoded credentials in docker-compose.yml**  
   **File:** `docker-compose.yml`  
   `POSTGRES_PASSWORD`, `BMAD_TODO_API_DATABASE_PASSWORD`, and the password inside `DATABASE_URL` are in plaintext. Acceptable for local/dev; for production (or 7.4) these should come from env (e.g. `.env` not committed). **Recommendation:** Add a short comment that production must use env vars; ensure .env is in .gitignore (already excluded from build via .dockerignore).

---

### LOW

6. **.dockerignore `.env.*` may exclude `.env.example`**  
   **File:** `.dockerignore` (line 8)  
   Pattern `.env.*` excludes any `.env.example`. If a build ever needed `.env.example` in context for documentation, it would be excluded. **Recommendation:** Document that this is intentional, or use only `.env` and list specific exclusions if needed.

7. **No start_period on db healthcheck**  
   **File:** `docker-compose.yml` (lines 13–16)  
   The API service has `start_period: 10s`; the db service does not. PostgreSQL usually becomes ready quickly; adding a short `start_period` for db could avoid rare false negatives on slow starts. Optional consistency improvement.

8. **README not updated with Compose instructions**  
   **Story:** Dev notes say "optional one-line README note on how to run with Compose." File List does not include README. **Recommendation:** Add one line to README, e.g. "Run the stack: `docker compose up --build` from repo root," for onboarding.

---

## AC and Task Verification

| Item | Status | Evidence |
|------|--------|----------|
| AC #1: docker-compose.yml defines db, api, client | Met | `docker-compose.yml` has services `db`, `api`, `client` |
| AC #2: db healthcheck (pg_isready) | Met | `healthcheck` with `pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB` |
| AC #3: API healthcheck (curl -f localhost:3000/up), GET /up | Met | `curl -f http://localhost:3000/up`; `config/routes.rb` has `get "up" => "rails/health#show"` |
| AC #4: API depends_on db condition: service_healthy | Met | `depends_on: db: condition: service_healthy` for api |
| AC #5: Root .dockerignore excluding _bmad-output, node_modules, .git | Met | `.dockerignore` at root with those plus *.md, docs, .env, .env.* |
| AC #6: docker compose up builds and starts; app reachable | Claimed | Completion notes state verified; not re-run in review |
| Task: Three services (db, api, client) | Done | All present with correct build/context and env |
| Task: db and api healthchecks | Done | Both defined with interval/timeout/retries |
| Task: depends_on condition on db | Done | api has condition: service_healthy |
| Task: Root .dockerignore | Done | Present with required exclusions |
| Task: Verify compose up | Done | Per completion notes |

---

## Recommendation

- **Fix HIGH #1:** Remove hardcoded SECRET_KEY_BASE; use env var with no default (or fail-fast) for production.
- **Fix MEDIUM #2:** Use `depends_on: api: condition: service_healthy` for client.
- **Address MEDIUM #3–#5:** Document or tighten production database config and credential handling; add README line for Compose (LOW #8) if desired.

---

## Senior Developer Review (AI)

- Story file loaded and parsed. Epic 7 / Story 7.3 context and architecture (Docker patterns, health checks, root .dockerignore) loaded.
- Acceptance Criteria cross-checked against implementation: AC #1–#5 fully met in code; AC #6 verified per completion notes.
- File List matches git for application source (docker-compose.yml, .dockerignore, database.yml).
- Code quality and security review performed on changed files; findings above.
- **Outcome:** Changes requested (address HIGH and MEDIUM items before marking done).

_Reviewer: RVS on 2026-02-19_
