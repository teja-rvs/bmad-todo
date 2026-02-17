# Story 1.2: Backend — tasks table and GET /tasks

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want task data stored on the server and a way to fetch the list,
so that my tasks persist and can be displayed when I open the app.

## Acceptance Criteria

1. **Given** the Rails API is set up, **when** I create a `tasks` table via Rails migration with columns: `id`, `title` (string), `completed` (boolean, default false), `created_at`, `updated_at`, **then** the migration runs successfully and the Task model exists with validations (e.g. title presence).
2. **And** when I implement GET /tasks (e.g. `TasksController#index`) returning JSON (e.g. `{ tasks: [...] }` with snake_case keys), **then** the endpoint returns 200 and an array of tasks (empty array when no tasks).
3. **And** CORS is configured to allow the frontend origin.

## Tasks / Subtasks

- [x] **Tasks table and Task model** (AC: #1)
  - [x] Generate migration: `rails g migration CreateTasks title:string completed:boolean` (add timestamps if not default), or `rails g model Task title:string completed:boolean`
  - [x] Ensure columns: `id`, `title` (string), `completed` (boolean, default false), `created_at`, `updated_at`
  - [x] Run `rails db:migrate`
  - [x] Add Task model validations (e.g. `validates :title, presence: true`; optional length)
- [x] **GET /tasks endpoint** (AC: #2)
  - [x] Add `TasksController` with `index` action (e.g. `rails g controller Tasks index` or resource-style)
  - [x] Return JSON `{ tasks: [...] }` with snake_case keys (id, title, completed, created_at, updated_at)
  - [x] Return 200 with array of tasks; empty array when no tasks
  - [x] Wire route (e.g. `resources :tasks` or `get 'tasks', to: 'tasks#index'`)
- [x] **CORS for frontend origin** (AC: #3)
  - [x] Configure CORS in `bmad-todo-api` to allow the frontend origin (e.g. `http://localhost:5173` for Vite dev)

## Dev Notes

- **Backend only:** This story is Rails API only. No frontend changes; Story 1.3 will consume GET /tasks.
- **Use Rails generators:** Use `rails g model Task` (or migration + model) and `rails g controller Tasks`; do not hand-roll. [Source: _bmad-output/planning-artifacts/architecture.md#Framework Conventions]
- **API contract:** Response shape must be consistent: `{ tasks: [...] }` with snake_case keys. Empty list = `{ tasks: [] }`. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- **CORS:** Must allow the client origin so the frontend (Story 1.3) can call GET /tasks. [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]

### Project Structure Notes

- **Backend:** Work only in `bmad-todo-api/`. Add `app/models/task.rb`, `app/controllers/tasks_controller.rb`, migration in `db/migrate/`, routes in `config/routes.rb`. CORS in `config/` (e.g. `config/initializers/cors.rb` or Gemfile + config). [Source: _bmad-output/planning-artifacts/architecture.md#Backend: bmad-todo-api]
- **No frontend:** Do not add or change files in `bmad-todo-client/` in this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 1.2 acceptance criteria and epic context.
- [Source: _bmad-output/planning-artifacts/architecture.md] — Data model (tasks table), API (GET /tasks, snake_case), CORS, naming (DB and API snake_case), structure (Rails app/), framework conventions (use generators).
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Handoff] — Backend first: migrations, TasksController#index, CORS.

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **Data model:** Single `tasks` table. Columns: `id`, `title` (string), `completed` (boolean, default false), `created_at`, `updated_at`. Use Rails migrations; Task model with validations (e.g. title presence, optional length).
- **API:** GET /tasks only in this story. Response: HTTP 200, body `{ tasks: [...] }`. Each task: snake_case keys (`id`, `title`, `completed`, `created_at`, `updated_at`). Empty list = `{ tasks: [] }`. No other endpoints in this story.
- **CORS:** Allow frontend origin (e.g. `http://localhost:5173` for Vite). Do not allow `*` in production; restrict to known frontend origin(s).

#### Architecture compliance

- **Naming:** DB and API use snake_case (tables, columns, JSON keys). Controllers and routes follow Rails REST conventions (e.g. `resources :tasks`).
- **Structure:** Models in `app/models/`, controllers in `app/controllers/`, routes in `config/routes.rb`. Use Rails generators; do not hand-roll models, migrations, or controllers.
- **No real-time:** No WebSockets, SSE, or polling. This story is read-only (GET); list updates are out of scope until Story 1.3.

#### Library / framework requirements

- **Rails API:** Use the existing `bmad-todo-api` app (Rails API + PostgreSQL from Story 1.1). Add `Task` model and `TasksController` only.
- **CORS:** Use `rack-cors` (or Rails CORS config) if not already present; allow only the frontend origin.
- **Serialization:** Use `render json:` with explicit hash or Rails serializers; keep response shape `{ tasks: [...] }` with snake_case.

#### File structure requirements

- **Create/change only in `bmad-todo-api/`:**
  - `db/migrate/XXXXXXXXXX_create_tasks.rb` (or similar)
  - `app/models/task.rb`
  - `app/controllers/tasks_controller.rb`
  - `config/routes.rb` (add tasks resource or GET tasks)
  - `config/initializers/cors.rb` (or equivalent) — allow frontend origin
- **Do not modify:** `bmad-todo-client/`, root README (unless adding a one-line “API runs on port 3000” if missing).

#### Testing requirements

- **Backend tests:** Add or extend request/spec for GET /tasks: (1) returns 200 and `{ tasks: [] }` when no tasks; (2) returns 200 and `{ tasks: [...] }` with correct keys when tasks exist. Optional: model spec for Task validations. Use RSpec or minitest per existing project.
- **No frontend or E2E in this story.**

#### Previous story intelligence (Story 1.1)

- **Scaffold is done:** `bmad-todo-api` (Rails API + PostgreSQL) and `bmad-todo-client` (Vite + React + TypeScript + Tailwind) exist. Both run via `rails s` and `npm run dev`.
- **Tailwind:** Story 1.1 used Tailwind v4 (`@tailwindcss/vite`); frontend is in `bmad-todo-client/`. No backend styling.
- **Scope:** Story 1.1 was scaffold only. No tasks table, no GET /tasks, no CORS. This story (1.2) adds all of that on the backend only.
- **Convention:** Use framework-native commands and generators (e.g. `rails g model Task`, `rails g controller Tasks`). Do not recreate or rename the app directories.

#### Git intelligence summary

- Recent commits: “Unit, E2E tests for project setup” and “Implemented first story” — consistent with Story 1.1 done and tests in place. Add backend tests for GET /tasks and Task model as above; no change to existing test runner choice.

#### Project context reference

- No `project-context.md` found in repo. Rely on epics, architecture, and this story file only.

#### Story completion status

- **Status:** ready-for-dev. Ultimate context engine analysis completed — comprehensive developer guide created. Implement GET /tasks and CORS in `bmad-todo-api` per tasks above; do not implement frontend or other endpoints in this story.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(No debug log references.)

### Completion Notes List

- **Tasks table and Task model:** Generated Task model via `rails g model Task title:string completed:boolean`; edited migration to add `default: false, null: false` to `completed`. Ran `rails db:migrate`. Added `validates :title, presence: true` to `app/models/task.rb`. Model tests (3) pass.
- **GET /tasks endpoint:** Added `TasksController#index` returning `{ tasks: Task.all }` and `resources :tasks, only: [:index]` in `config/routes.rb`. Integration tests cover empty list and list with tasks (snake_case keys). All tests pass.
- **CORS:** Added `rack-cors` to Gemfile and configured `config/initializers/cors.rb` to allow origin `http://localhost:5173`. Integration test asserts `Access-Control-Allow-Origin` header for that origin.

### File List

- bmad-todo-api/db/migrate/20260217143302_create_tasks.rb
- bmad-todo-api/app/models/task.rb
- bmad-todo-api/app/controllers/tasks_controller.rb
- bmad-todo-api/config/routes.rb
- bmad-todo-api/config/initializers/cors.rb
- bmad-todo-api/Gemfile
- bmad-todo-api/Gemfile.lock
- bmad-todo-api/db/schema.rb
- bmad-todo-api/test/models/task_test.rb
- bmad-todo-api/test/integration/tasks_endpoint_test.rb
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/1-2-backend-tasks-table-and-get-tasks.md

## Change Log

- 2026-02-17: Implemented Story 1.2 — tasks table and Task model, GET /tasks endpoint, CORS for frontend origin. All ACs satisfied; 8 tests (model + integration) pass.
