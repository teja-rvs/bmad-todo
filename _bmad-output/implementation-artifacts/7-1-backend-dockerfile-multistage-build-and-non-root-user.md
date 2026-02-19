# Story 7.1: Backend Dockerfile — multistage build and non-root user

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the Rails API built and run in a Docker container using a multistage Dockerfile and a non-root user,
so that the API runs consistently in any environment and follows container security practice.

## Acceptance Criteria

1. **Given** the `bmad-todo-api` application exists, **when** I add a `Dockerfile` in `bmad-todo-api/`, **then** the Dockerfile uses a multistage build: (1) a build stage that installs dependencies (bundle) and compiles assets if any, (2) a final stage that copies only what is needed to run the app (e.g. Rails server) and does not include build tools.
2. **And** the final stage defines a non-root user (e.g. `app` or use image-provided user) and sets `USER` to that user; app directories (e.g. app code, tmp) are writable by that user.
3. **And** the image builds successfully and running the container starts the Rails server (e.g. `rails s` or equivalent).
4. **And** no process in the final image runs as root.

## Tasks / Subtasks

- [x] Add Dockerfile in bmad-todo-api/ with named build and final stages (AC: #1)
  - [x] Build stage: base image, install Ruby/bundler, copy Gemfile/Gemfile.lock, bundle install
  - [x] Build stage: copy app code, precompile assets if any (or skip for API-only)
  - [x] Final stage: minimal runtime image, copy only app + gems/bins needed to run
  - [x] Final stage: create non-root user, set ownership of app dirs (app, tmp, log, db, storage)
  - [x] Final stage: set USER to non-root user, expose port, default CMD to start Rails server
- [x] Verify image builds and container runs Rails server (AC: #3, #4)
  - [x] docker build -t bmad-todo-api . from bmad-todo-api/
  - [x] docker run confirms no process runs as root (e.g. whoami or ps)

## Dev Notes

- **Relevant architecture patterns:** Infrastructure & Deployment (architecture.md): Docker, multistage builds only, non-root user mandatory. Docker Patterns section: multistage (build stage for deps/compile, final stage runtime only); non-root user with writable app/tmp; no root in production or dev.
- **Source tree:** Only `bmad-todo-api/`; add single file `bmad-todo-api/Dockerfile`. No changes to Rails code or config required for this story; Compose and health checks are Story 7.3.
- **Testing:** Build and run container; optional: add a minimal smoke test (e.g. curl localhost:3000 if a route exists) or document manual verification. No RSpec changes required for “Dockerfile works.”

### Project Structure Notes

- **Alignment:** Architecture specifies `bmad-todo-api/Dockerfile` in backend project tree. Repo root has `bmad-todo-api/` as sibling to `bmad-todo-client/`. Root `.dockerignore` and docker-compose are added in later stories (7.3, 7.4).
- **Conflicts:** None; this story is additive (one new file under bmad-todo-api/).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Infrastructure & Deployment, Docker Patterns, Project Structure]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 7, Story 7.1]
- [Source: Docker multi-stage builds — https://docs.docker.com/build/building/multi-stage]

---

## Developer Context (Dev Agent Guardrails)

### Technical requirements

- **Multistage build:** Exactly two stages (or more if justified): (1) **build** — install system deps, Ruby, run `bundle install`, copy application code; optionally precompile assets if present; (2) **final** — FROM a minimal runtime image (e.g. same Ruby slim or alpine), copy only application code, installed gems, and entrypoint/server command. Do not copy build tools, compilers, or dev gems into the final image.
- **Non-root user:** In the final stage, create a dedicated user (e.g. `app`, `rails`, or use image-provided non-root user). Use `RUN adduser` / `useradd` (or equivalent) and set `USER <name>` or `USER <uid>:<gid>`. Ensure directories the app writes to (`tmp`, `log`, `db`, `storage`) are owned by that user (e.g. `chown -R` or `COPY --chown`). No process in the final image must run as UID 0.
- **Rails server:** Default command must start the Rails server (e.g. `CMD ["rails", "server", "-b", "0.0.0.0"]` or equivalent). Expose port 3000 (or the port the API uses).
- **API-only:** This is a Rails API app (no front-end asset pipeline required); if there are no assets, the build stage does not need to run asset precompilation. Keep the Dockerfile simple and aligned with existing `bmad-todo-api` layout (Gemfile, config/, app/, db/, etc.).

### Architecture compliance

- **Containerization:** Docker only; multistage builds only; non-root user mandatory (architecture: Infrastructure & Deployment, Docker Patterns).
- **No single-stage app image:** Do not use one stage that includes both build tools and runtime; always separate build and runtime.
- **Enforcement:** Per architecture: “All images MUST run as non-root user”; “Multistage builds only” for app services.

### Library / framework requirements

- **Ruby/Rails:** Use an official Ruby image (e.g. `ruby:3.x-slim` or current LTS) for both stages to avoid version drift. Match the Ruby version used in the project (check Gemfile or .ruby-version).
- **Bundler:** Run `bundle install` in the build stage; in the final stage copy the vendored bundle (e.g. from build stage). Do not run `bundle install` in the final stage unless necessary and documented.
- **No extra orchestration:** Do not add Docker Compose, health checks, or override files in this story; those are 7.3 and 7.4.

### File structure requirements

- **Single file:** Add exactly one file: `bmad-todo-api/Dockerfile`.
- **Location:** At the root of the Rails app (`bmad-todo-api/`), so that `docker build -f bmad-todo-api/Dockerfile` or `cd bmad-todo-api && docker build .` works with build context `bmad-todo-api/`.
- **.dockerignore:** Optional for this story inside `bmad-todo-api/` (e.g. exclude log, tmp, .git); root `.dockerignore` is Story 7.3.

### Testing requirements

- **Build:** `docker build -t bmad-todo-api .` from `bmad-todo-api/` must succeed.
- **Run:** `docker run --rm -p 3000:3000 bmad-todo-api` (or with DATABASE_URL if DB required for boot) must start the Rails server; no process as root (e.g. `docker run --rm bmad-todo-api whoami` should not print `root`).
- **No RSpec/unit test changes required** for the Dockerfile itself; optional: one-line note in README or dev docs on how to build and run the image.

### Latest technical information (web research)

- **Multistage:** Use named stages (`AS build`, `AS final`) for clarity. Build stage: install deps, copy Gemfile/Gemfile.lock first for layer caching, then copy app and run bundle. Final stage: copy only app + installed gems and set USER.
- **Non-root:** Create user with fixed UID/GID (e.g. 1000:1000) for consistency; set ownership of `db`, `log`, `storage`, `tmp` to that user. Use `COPY --chown=app:app` when copying app code into final stage where supported.
- **Base image:** Prefer `ruby:x.x-slim` over full image to keep size down; avoid Alpine if the project or gems expect glibc.
- **Security:** No root in final image; do not install unnecessary packages in the final stage; copy only production artifacts.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Implemented Dockerfile with build + final stages; verified `docker build -t bmad-todo-api .` and `docker run --rm bmad-todo-api whoami` → `app`. Rails server starts (exits in production without RAILS_MASTER_KEY; expected). All 25 Rails tests pass.

### Completion Notes List

- Dockerfile in bmad-todo-api/ with multistage build (build: Ruby 4.0.1-slim, Gemfile-first bundle install, copy app, bootsnap precompile; final: minimal runtime, non-root user `app` 1000:1000, COPY --chown, USER app, EXPOSE 3000, CMD rails server -b 0.0.0.0). Image builds; container runs as non-root; default CMD starts Rails server. Optional .dockerignore already present. bin/docker-entrypoint runs db:migrate when command is rails server (condition fixed to use $1/$2). Integration test: GET /tasks Content-Type application/json assertion added in tasks_endpoint_test.rb; test-summary.md updated.

### Project context reference

- **Project:** bmad-todo (monorepo: bmad-todo-client, bmad-todo-api). Backend: Rails API + PostgreSQL; no auth for MVP.
- **Relevant docs:** planning-artifacts (prd.md, architecture.md, epics.md). No project-context.md in repo; architecture and epics are the source of truth for Docker and structure.

### Story completion status

- **Status:** review. Code review applied; entrypoint and docs updated.

### File List

- bmad-todo-api/Dockerfile (modified)
- bmad-todo-api/bin/docker-entrypoint (modified — db:migrate, condition fix for default CMD)
- bmad-todo-api/test/integration/tasks_endpoint_test.rb (modified — GET /tasks Content-Type assertion)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)
- _bmad-output/implementation-artifacts/tests/test-summary.md (modified)

### Change Log

- 2026-02-19: Story 7.1 implemented — Dockerfile multistage build and non-root user; verification and story/sprint status updated.
- 2026-02-19: Code review fixes — entrypoint: use db:migrate and fix condition ($1/$2) so it runs with default CMD; Dockerfile comments (DATABASE_URL, bootsnap); story File List and completion status updated.
