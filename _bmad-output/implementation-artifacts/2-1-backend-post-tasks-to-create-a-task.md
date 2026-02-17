# Story 2.1: Backend — POST /tasks to create a task

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to create a task on the server,
so that it is stored and can appear in my list.

## Acceptance Criteria

1. **Given** the tasks table and GET /tasks exist, **when** I implement POST /tasks accepting a JSON body with `title` (snake_case), **then** a new task is created with the given title and `completed: false`, and the response returns 201 with the created task (snake_case keys, e.g. id, title, completed, created_at, updated_at).
2. **And** if title is blank or invalid, the API returns 422 (or 400) with a consistent error shape (e.g. `{ error: "..." }` or `{ errors: [...] }`).

## Tasks / Subtasks

- [x] **POST /tasks endpoint** (AC: #1)
  - [x] Add `create` action to `TasksController` (Rails: `resources :tasks, only: [:index, :create]`)
  - [x] Accept JSON body with `title` (snake_case); set `completed: false` by default (model or migration already has default)
  - [x] On success: create task, return 201 with created task JSON (snake_case keys: id, title, completed, created_at, updated_at)
  - [x] Use strong parameters (e.g. `params.require(:task).permit(:title)`) or permit :title at top level per project convention
- [x] **Validation and error response** (AC: #2)
  - [x] On validation failure (blank title, or length > 255): return 422 with consistent error shape (e.g. `{ error: "..." }` or `{ errors: [...] }`) matching architecture and existing patterns
  - [x] Do not return 200 on validation failure; use 422 Unprocessable Entity (or 400 Bad Request if project uses it for validation)

## Dev Notes

- **Backend only:** This story is Rails API only. Frontend will consume POST /tasks in Story 2.2.
- **Existing code:** `TasksController` has `index` only; `Task` model has `validates :title, presence: true, length: { maximum: 255 }`. Routes currently `resources :tasks, only: [:index]`. Add `create` and extend routes.
- **API contract:** Request body: `{ "title": "string" }` (snake_case). Success: 201, body = single task object with snake_case keys. Error: 422, body = e.g. `{ error: "Title can't be blank" }` or `{ errors: ["Title can't be blank"] }` — use same key(s) as other endpoints. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- **No frontend changes:** Do not modify `bmad-todo-client/` in this story.

### Project Structure Notes

- **Backend:** Work only in `bmad-todo-api/`. Modify `app/controllers/tasks_controller.rb` (add `create`), `config/routes.rb` (add `:create` to resources). [Source: _bmad-output/planning-artifacts/architecture.md#Backend: bmad-todo-api]
- **Frontend:** Do not add or change files in `bmad-todo-client/` in this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 2.1 acceptance criteria and Epic 2 context.
- [Source: _bmad-output/planning-artifacts/architecture.md] — API (POST /tasks, 201, error 422), naming (snake_case), structure (Rails controllers, strong params), framework conventions (use Rails patterns).

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **Endpoint:** POST /tasks. Request body: JSON with `title` (string, snake_case). Response: 201 Created with single task object (snake_case: id, title, completed, created_at, updated_at). New task has `completed: false`.
- **Validation:** Use existing Task model validations (title presence, length max 255). On invalid: return 422 with body e.g. `{ error: "message" }` or `{ errors: ["message"] }` — match whatever error shape is used elsewhere (check Story 1.2 or architecture).
- **Strong params:** Permit only `:title` for task creation (e.g. `params.require(:task).permit(:title)` if body is `{ task: { title: "..." } }`, or permit top-level `:title` if body is `{ title: "..." }`; architecture says "JSON keys snake_case" — ensure request body shape is documented).
- **CORS:** No change needed; already allows frontend origin from Story 1.2.

#### Architecture compliance

- **Naming:** API request/response snake_case. Controller action `create`; Rails REST conventions.
- **Structure:** Add `create` to existing `TasksController`; extend `config/routes.rb` to include `:create`. Do not add new controller or service layer.
- **Error shape:** Use same error structure as defined in architecture (e.g. `{ error: "..." }` or `{ errors: [...] }`) and any existing usage in the codebase.

#### Library / framework requirements

- **Rails:** Use `Task.new(task_params)` and `save`, or `Task.create(task_params)` and check `errors` for 422. Use strong parameters. Do not hand-roll parsing; use Rails params and `render json:`, `status: :created` / `:unprocessable_entity`.
- **No new gems** required for this story.

#### File structure requirements

- **Modify only in `bmad-todo-api/`:**
  - `app/controllers/tasks_controller.rb` — add `create` action; handle success (201) and validation failure (422)
  - `config/routes.rb` — change to `resources :tasks, only: [:index, :create]`
- **Tests:** Add or extend request/integration tests for POST /tasks: (1) valid title returns 201 and created task with snake_case keys; (2) blank title returns 422 and error body; (3) missing title (if applicable) returns 422; (4) title over 255 chars returns 422. Reuse existing test layout (e.g. `test/integration/tasks_endpoint_test.rb` or equivalent).
- **Do not modify:** `bmad-todo-client/` in this story.

#### Testing requirements

- **Backend tests:** Integration/request tests for POST /tasks: success case (201, body with task keys), validation failure (422, error shape). Use same test style as GET /tasks tests (RSpec or minitest per project).
- **No frontend or E2E in this story.**

#### Previous story intelligence (Story 1.2 and 1.3)

- **Story 1.2:** Backend has `Task` model (title, completed, created_at, updated_at), validations (presence, length 255), GET /tasks returning `{ tasks: [...] }`, CORS for `http://localhost:5173`. Controller: `TasksController#index` only. Routes: `resources :tasks, only: [:index]`. [Source: 1-2-backend-tasks-table-and-get-tasks.md]
- **Story 1.3:** Frontend has AddRow (placeholder), TaskList, TaskRow, EmptyState; consumes GET /tasks only. POST will be added in Story 2.2. [Source: 1-3-frontend-home-screen-with-task-list-or-empty-state.md]
- **Convention:** Use Rails generators/conventions; keep error response shape consistent with architecture (single key `error` or `errors` array). Backend integration tests live in `test/integration/tasks_endpoint_test.rb` (or equivalent).

#### Git intelligence summary

- Backend currently has: TasksController#index, Task model with validations, GET /tasks, CORS. Add `create` action and POST route; add integration tests for create and validation errors. No new directories or gems.

#### Latest tech information

- **Rails strong params:** Use `params.require(:task).permit(:title)` for nested `{ task: { title: "..." } }`, or permit top-level with `params.permit(:title)` for `{ title: "..." }`. Choose one request shape and document in tests.
- **422 Unprocessable Entity:** Standard for validation failures in Rails (`render json: { error: ... }, status: :unprocessable_entity`).

#### Project context reference

- No `project-context.md` found in repo. Rely on epics, architecture, and this story file only.

#### Story completion status

- **Status:** ready-for-dev. Ultimate context engine analysis completed — comprehensive developer guide created. Implement POST /tasks and validation error handling in `bmad-todo-api` per tasks above; do not implement frontend or other endpoints in this story.

---

## Change Log

- 2026-02-17: Implemented POST /tasks endpoint and validation error handling; all tasks complete, story ready for review.
- 2026-02-17: Code review fixes: added CORS test for POST /tasks; tests for null title (422) and numeric title (coerced to string, 201); malformed JSON returns 400 with `{ "error": "Invalid JSON" }` via ApplicationController rescue. All 11 integration tests pass.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented POST /tasks: `create` action in `TasksController` with `params.permit(:title)` (top-level JSON body `{ "title": "..." }`). On success returns 201 with created task (snake_case: id, title, completed, created_at, updated_at). On validation failure returns 422 with `{ "error": "..." }` using `task.errors.full_messages.to_sentence`. Routes extended to `resources :tasks, only: [:index, :create]`. Integration tests cover valid title (201 + body), blank title (422), title > 255 chars (422), and missing title (422). All 14 backend tests pass.
- Code review follow-up: Added CORS test for POST /tasks; tests for null title (422) and numeric title (coerced, 201); malformed JSON returns 400 with consistent error shape via ApplicationController#rescue_from ParseError. All 11 tasks endpoint integration tests pass.

### File List

- bmad-todo-api/config/routes.rb (modified)
- bmad-todo-api/app/controllers/tasks_controller.rb (modified)
- bmad-todo-api/app/controllers/application_controller.rb (modified)
- bmad-todo-api/test/integration/tasks_endpoint_test.rb (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)
