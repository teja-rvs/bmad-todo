# Story 1.1: Scaffold backend and frontend applications

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the backend (Rails API + PostgreSQL) and frontend (Vite + React + TypeScript + Tailwind) scaffolded and runnable,
so that the project is ready for implementing task list and API.

## Acceptance Criteria

1. **Given** the project root (monorepo), **when** I run the backend scaffold command (`rails new bmad-todo-api --api --database=postgresql`) and `rails db:create`, **then** the directory `bmad-todo-api` exists with a working Rails API and PostgreSQL config.
2. **And** when I run the frontend scaffold (`npm create vite@latest bmad-todo-client -- --template react-ts`) and install Tailwind (postcss, autoprefixer, tailwindcss) with content paths and directives in `src/index.css`, the directory `bmad-todo-client` exists and the dev server runs.
3. **And** both apps can be started independently (e.g. `rails s` and `npm run dev`).

## Tasks / Subtasks

- [x] **Backend scaffold** (AC: #1)
  - [x] From project root, run `rails new bmad-todo-api --api --database=postgresql`
  - [x] `cd bmad-todo-api` and run `rails db:create` and `rails db:migrate`
  - [x] Verify `rails s` starts the server (default port 3000)
- [x] **Frontend scaffold** (AC: #2, #3)
  - [x] From project root, run `npm create vite@latest bmad-todo-client -- --template react-ts`
  - [x] `cd bmad-todo-client`, run `npm install`
  - [x] Add Tailwind: `npm install -D tailwindcss postcss autoprefixer`, `npx tailwindcss init -p`
  - [x] Configure Tailwind `content` paths (e.g. `./index.html`, `./src/**/*.{js,ts,jsx,tsx}`) and add Tailwind directives to `src/index.css`
  - [x] Verify `npm run dev` starts the Vite dev server
- [x] **Monorepo layout** (AC: #3)
  - [x] Ensure `bmad-todo-client` and `bmad-todo-api` are sibling directories under project root (or document two-repo layout if different)
  - [x] Add/update root README with instructions to run client and API

## Dev Notes

- Use **framework-native commands only**: Rails `rails new`, Vite `npm create vite@latest`. Do not hand-roll scaffolds. [Source: _bmad-output/planning-artifacts/architecture.md#Framework Conventions]
- Backend is API-only (no views); frontend is SPA. No shared code; contract will be REST + JSON in later stories.
- CORS and tasks table are **not** part of this story; this story is scaffold only. Story 1.2 adds the tasks table and GET /tasks.

### Environment

- After installing the Rails gem (`gem install rails`), **restart the terminal** (or run `rbenv rehash` if using rbenv) so the shell picks up the new `rails` executable. Then `rails new` can be run directly to create the app.

### Project Structure Notes

- **Target layout (from architecture):**
  - `bmad-todo/` (project root)
    - `bmad-todo-client/` — Vite + React + TypeScript frontend
    - `bmad-todo-api/` — Rails API backend
    - `_bmad-output/` — planning artifacts
    - README.md — how to run client and API
- Frontend: add Tailwind **post-scaffold**; content paths must include `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`; add Tailwind directives to `src/index.css`. [Source: _bmad-output/planning-artifacts/architecture.md#Selected Starters]
- Backend: use default Rails API layout; `config/database.yml` for PostgreSQL; no models or custom routes in this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 1.1 acceptance criteria and epic context.
- [Source: _bmad-output/planning-artifacts/architecture.md] — Starter template (Rails API + PostgreSQL, Vite + React + TypeScript), post-scaffold Tailwind steps, project structure, framework conventions.
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Handoff] — First implementation priority: backend scaffold then frontend scaffold then Tailwind.

## Dev Agent Record

### Agent Model Used

Not recorded (scaffold by dev agent; fixes by code-review workflow).

### Debug Log References

### Completion Notes List

- Scaffolded `bmad-todo-api` (Rails API + PostgreSQL) and `bmad-todo-client` (Vite + React + TypeScript + Tailwind). Both run via `rails s` and `npm run dev`. Root README added with run instructions. Environment note added: restart terminal or `rbenv rehash` after `gem install rails` so `rails new` works.
- Tailwind v4 used (`@tailwindcss/vite`); content paths are auto-detected by the Vite plugin (no separate `tailwind.config.js`). Directives in `src/index.css`: `@import "tailwindcss"`.
- Verified `rails s` (port 3000) and `npm run dev` (Vite) at review time.

### Change Log

- Story 1.1 scaffold completed: backend and frontend scaffolded, root README with run instructions (Date: 2026-02-17)
- Code review fixes: File List updated (docker-compose.yml); Tailwind v4 and verification noted in Completion Notes; Agent Model placeholder replaced (Date: 2026-02-17)

### File List

- bmad-todo-api/ (new)
- bmad-todo-client/ (new)
- README.md (new)
- docker-compose.yml (new)
- _bmad-output/implementation-artifacts/1-1-scaffold-backend-and-frontend-applications.md (modified)
