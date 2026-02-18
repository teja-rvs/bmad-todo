# Story 3.1: Backend — PATCH /tasks/:id to mark complete

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to update a task's completion state on the server,
so that it is saved and can be shown in the list.

## Acceptance Criteria

1. **Given** tasks exist and GET /tasks works, **when** I implement PATCH /tasks/:id accepting a JSON body (e.g. `{ completed: true }`), **then** the task with that id is updated and the response returns 200 with the updated task (snake_case keys).
2. **And** if the task is not found, the API returns 404 with a consistent error shape.

## Tasks / Subtasks

- [x] **PATCH /tasks/:id endpoint** (AC: #1)
  - [x] Add `update` action to `TasksController`; extend routes to `resources :tasks, only: [:index, :create, :update]`
  - [x] Accept JSON body with `completed` (boolean); find task by `params[:id]`
  - [x] On success: update task, return 200 with updated task JSON (snake_case keys: id, title, completed, created_at, updated_at)
  - [x] Use strong parameters: permit only `:completed` for this story (e.g. extend `task_params` or add update-specific permit)
- [x] **404 when task not found** (AC: #2)
  - [x] If no task with given id: return 404 with consistent error shape (e.g. `{ error: "Task not found" }`) matching architecture and existing patterns

## Dev Notes

- **Backend only:** This story is Rails API only. Frontend will consume PATCH /tasks/:id in Story 3.2.
- **Existing code:** `TasksController` has `index` and `create`; routes `only: [:index, :create]`. `task_params` permits `:title` only. Add `update` and permit `:completed`; extend routes. [Source: 2-1-backend-post-tasks-to-create-a-task.md]
- **API contract:** PATCH /tasks/:id body: `{ "completed": true }` or `{ "completed": false }` (snake_case). Success: 200, body = single task object (snake_case). Not found: 404, body = e.g. `{ "error": "Task not found" }`. [Source: _bmad-output/planning-artifacts/architecture.md]
- **No frontend changes:** Do not modify `bmad-todo-client/` in this story.

### Project Structure Notes

- **Backend:** Work only in `bmad-todo-api/`. Modify `app/controllers/tasks_controller.rb` (add `update`), `config/routes.rb` (add `:update` to resources). [Source: _bmad-output/planning-artifacts/architecture.md]
- **Frontend:** Do not add or change files in `bmad-todo-client/` in this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 3.1 acceptance criteria and Epic 3 context.
- [Source: _bmad-output/planning-artifacts/architecture.md] — API (PATCH /tasks/:id, 200, 404), naming (snake_case), structure (Rails controllers, strong params).

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **Endpoint:** PATCH /tasks/:id. Request body: JSON with `completed` (boolean, snake_case). Response: 200 OK with single task object (snake_case: id, title, completed, created_at, updated_at).
- **Not found:** When no task exists with the given id, return 404 with body e.g. `{ "error": "Task not found" }` — use same `error` key as other endpoints (see create 422). [Source: architecture.md Format Patterns]
- **Strong params:** Permit only `:completed` for update. Request body shape: top-level `{ "completed": true }` to match existing convention (create uses top-level `{ "title": "..." }`). Use `params.permit(:completed)` for update or extend a shared helper; do not permit :id or :title in update if only completion is allowed in this story.
- **CORS:** No change needed; CORS already allows PATCH from frontend origin.

#### Architecture compliance

- **Naming:** API request/response snake_case. Controller action `update`; Rails REST conventions (PATCH for partial update).
- **Structure:** Add `update` to existing `TasksController`; extend `config/routes.rb` to include `:update`. Do not add new controller or service layer.
- **Error shape:** Use same error structure as existing (e.g. `{ "error": "..." }`). 404 for not found; do not return 200 with null or 422 for missing record.

#### Library / framework requirements

- **Rails:** Use `Task.find_by(id: params[:id])` or `Task.find(params[:id])`; for 404 use `find` and rescue `ActiveRecord::RecordNotFound`, or `find_by` and render 404 if nil. Use `task.update(update_params)` and render 200 with updated task. Use `render json:`, `status: :ok` and `:not_found`.
- **No new gems** required for this story.

#### File structure requirements

- **Modify only in `bmad-todo-api/`:**
  - `app/controllers/tasks_controller.rb` — add `update` action; find task by id; on success 200 with updated task; on not found 404 with error body
  - `config/routes.rb` — change to `resources :tasks, only: [:index, :create, :update]`
- **Tests:** Add or extend integration tests for PATCH /tasks/:id: (1) valid id and completed true returns 200 and updated task with completed true; (2) valid id and completed false returns 200 and updated task with completed false; (3) non-existent id returns 404 and error body. Reuse existing test layout (`test/integration/tasks_endpoint_test.rb`).
- **Do not modify:** `bmad-todo-client/` in this story.

#### Testing requirements

- **Backend tests:** Integration/request tests for PATCH /tasks/:id: success with completed true/false (200, body with task keys and updated completed value), not found (404, error shape). Use same test style as existing POST/GET tests (minitest).
- **No frontend or E2E in this story.**

#### Previous story intelligence (Story 2.1)

- **Story 2.1:** Backend has `create` with top-level `params.permit(:title)`; 201 on success; 422 with `{ "error": "..." }` for validation. Routes: `only: [:index, :create]`. Integration tests in `test/integration/tasks_endpoint_test.rb` with `post "/tasks", params: { ... }, as: :json`. [Source: 2-1-backend-post-tasks-to-create-a-task.md]
- **Convention:** Use same error key `error` for 404. Malformed JSON already handled by ApplicationController rescue (400). Add PATCH tests alongside existing GET/POST tests.

#### Git intelligence summary

- Recent commits: Story 2-2 (frontend add-task), Story 2.1 (backend POST /tasks), Story 1.3, 1.2. Backend has index + create only. Add `update` action and PATCH route; add integration tests for PATCH success and 404. No new directories or gems.

#### Latest tech information

- **Rails update:** `task.update(completed: true)` or `task.update(update_params)`; returns truthy if valid and saved. No validations on `completed` needed (boolean column). 404: `find` raises `ActiveRecord::RecordNotFound` — rescue in controller and render 404, or use `find_by` and explicit 404 branch.
- **REST:** PATCH is standard for partial update; 200 OK with full resource body is correct.

#### Project context reference

- No `project-context.md` in repo. Use epics, architecture, and this story only.

#### Story completion status

- **Status:** ready-for-dev. Ultimate context engine analysis completed — comprehensive developer guide created. Implement PATCH /tasks/:id in `bmad-todo-api` per tasks above; do not implement frontend or other endpoints in this story.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented PATCH /tasks/:id: `update` action in TasksController; find by id with `Task.find_by(id: params[:id])`, 404 with `{ "error": "Task not found" }` when nil; on success `task.update(update_params)` and 200 with task JSON (snake_case). Strong params: `update_params` permits `:completed` only. Routes extended to `only: [:index, :create, :update]`. Integration tests: 200 with completed true/false, 404 for non-existent id. All 21 tests pass.
- Code review (2026-02-18): Fixed HIGH/MEDIUM findings. Added CORS test for PATCH; PATCH tests for invalid id format (404), empty body (200 unchanged), string `completed` coercion; replaced magic id with guaranteed non-existent id; asserted exact error message "Task not found". No app source changes in bmad-todo-client (only generated playwright-report was in git). All 18 integration tests pass.

### File List

- bmad-todo-api/app/controllers/tasks_controller.rb (modified)
- bmad-todo-api/config/routes.rb (modified)
- bmad-todo-api/test/integration/tasks_endpoint_test.rb (modified)

## Change Log

- 2026-02-18: Implemented PATCH /tasks/:id (update action, routes, strong params for :completed). Added integration tests for 200 with completed true/false and 404 for unknown id. All ACs satisfied.
- 2026-02-18: Code review fixes: added CORS test for PATCH, invalid-id and empty-body and string-completed PATCH tests, guaranteed non-existent id in 404 test, exact "Task not found" assertion. Story status → done.
