# Story 3.2: Frontend — mark task complete and show updated state

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to mark a task complete from the list with one action (e.g. checkbox) so that the list updates without refreshing,
so that I can track progress quickly.

## Acceptance Criteria

1. **Given** the task list is displayed with task rows, **when** I activate the complete control (e.g. checkbox) for a task, **then** the frontend sends PATCH /tasks/:id with completed true (or toggled).
2. **And** on success, the task row shows the completed state (e.g. strikethrough, check) and the list reflects the update without full-page refresh (refetch or merge from response).
3. **And** completion state is persisted on the server (verified by refresh or GET /tasks).

## Tasks / Subtasks

- [x] **Add updateTask to API layer** (AC: #1, #3)
  - [x] In `src/api/tasks.ts`, add `updateTask(id: number, payload: { completed: boolean }): Promise<Task>` that PATCHes to `/tasks/${id}` with body `{ completed }` (snake_case). On 200, return the updated task (snake_case). On 404 or 4xx/5xx or network error, throw with a clear message (e.g. "Couldn't save. Try again.").
  - [x] Reuse `getBaseUrl()`, timeout, and consistent error handling; read `error` from JSON for 404.
- [x] **Make TaskRow interactive with completion control** (AC: #1, #2)
  - [x] Add optional `onComplete?(taskId: number, completed: boolean)` (or `onToggleComplete?(task: Task)`) to TaskRow. Use a real `<input type="checkbox">` (or button with role="checkbox") so it is keyboard- and screen-reader operable (Space/Enter to toggle). Ensure min 44px touch target per UX.
  - [x] On change: call `onComplete(task.id, !task.completed)` (or equivalent). Do not call API from TaskRow; parent provides callback.
  - [x] Keep existing completed-state styling (strikethrough, check, Warm Minimal completed color #6b8e23). [Source: _bmad-output/planning-artifacts/ux-design-specification.md]
- [x] **Connect App and TaskList to complete flow** (AC: #2, #3)
  - [x] In `App.tsx`, add handler (e.g. `handleCompleteTask(id, completed)`) that calls `updateTask(id, { completed })` from `api/tasks`, then either (a) refetch via `fetchTasks()` and set state, or (b) merge the returned task into state (find by id, replace in list). Use same strategy as create (merge preferred for consistency).
  - [x] Pass handler down to TaskList → TaskRow. Optional: per-row loading/syncing state (e.g. disable checkbox while request in flight); on error, set app-level error state so user sees message (e.g. "Couldn't save. Try again.").
  - [x] List must update without full-page refresh; completion persisted (refresh shows completed state).

## Dev Notes

- **Frontend only:** This story is client-only. Backend PATCH /tasks/:id is implemented in Story 3.1 (200 + updated task, 404 for not found).
- **Existing code:** `TaskRow` is presentational only (no click handler, visual-only “checkbox”). `api/tasks.ts` has `fetchTasks()` and `createTask()` only. `App` has no complete handler; TaskList does not pass any completion callback. [Source: 3-1-backend-patch-tasks-id-to-mark-complete.md]
- **API contract:** PATCH /tasks/:id body: `{ "completed": true }` or `{ "completed": false }` (snake_case). Success: 200, body = single task object (id, title, completed, created_at, updated_at). Not found: 404, body = e.g. `{ "error": "Task not found" }`. [Source: _bmad-output/planning-artifacts/architecture.md]
- **UX:** One action to complete (checkbox); completed state strikethrough + check; min 44px touch target; keyboard (Space/Enter on checkbox); screen reader (checkbox role/label). [Source: _bmad-output/planning-artifacts/ux-design-specification.md]

### Project Structure Notes

- **Frontend:** Work in `bmad-todo-client/`. Touch: `src/api/tasks.ts`, `src/components/TaskRow.tsx`, `src/components/TaskList.tsx`, `src/App.tsx`. Types in `src/types/task.ts` already have `completed`. [Source: _bmad-output/planning-artifacts/architecture.md]
- **Backend:** No changes in `bmad-todo-api/` for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 3.2 acceptance criteria and Epic 3 context.
- [Source: _bmad-output/planning-artifacts/architecture.md] — API (PATCH /tasks/:id, 200, 404), refetch/merge, naming, structure.
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Task row, checkbox, completed state, accessibility.

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **PATCH /tasks/:id:** Request body `{ completed: boolean }` (snake_case). On 200, response is single task object with snake_case keys (id, title, completed, created_at, updated_at). On 404, backend returns `{ "error": "Task not found" }`; frontend should throw or surface one user-facing message (e.g. "Couldn't save. Try again."). Handle network errors consistently with create flow.
- **Complete flow:** User toggles checkbox on a task row. Frontend calls `updateTask(id, { completed })`; on success, task row shows completed state and list reflects update without full-page refresh (refetch and set state, or find task by id in state and replace with response task — same immutable-update pattern as create).
- **No full-page refresh:** Use existing React state; update list in memory after successful PATCH. Architecture: refetch list or merge from response — use same strategy as App’s create flow (merge preferred: replace task in array by id).
- **Toggle semantics:** One action toggles completed (incomplete → complete or complete → incomplete). Send the new value to API (e.g. `completed: true` or `completed: false`).

#### Architecture compliance

- **Naming:** API layer uses snake_case for request/response (Task type already snake_case). Components and props camelCase (e.g. `onComplete`, `onToggleComplete`).
- **Structure:** Only `src/api/tasks.ts` calls the backend. TaskRow and App must not use `fetch` directly; all HTTP via `updateTask` and existing `fetchTasks`/`createTask`.
- **State:** Immutable updates only. After PATCH success: either replace tasks with result of `fetchTasks()`, or map over tasks and replace the task with matching id with the returned task (new array, no mutation).
- **Error shape:** Backend returns `{ error: "..." }` for 404; frontend should read and display one message. Reuse same user-facing error pattern as create. [Source: architecture.md Format Patterns]

#### Library / framework requirements

- **React:** Controlled or uncontrolled checkbox in TaskRow; callback from parent (App) to perform API call and state update. Use existing `useState`/`useCallback` patterns; no new state library.
- **Vite/TypeScript:** No new deps. Use existing `Task` from `src/types/task.ts`.
- **Fetch:** Same pattern as `fetchTasks`/`createTask` (base URL, timeout, throw on !res.ok or invalid JSON). Do not add axios or other client.

#### File structure requirements

- **Modify:**
  - `bmad-todo-client/src/api/tasks.ts` — add `updateTask(id: number, payload: { completed: boolean }): Promise<Task>`.
  - `bmad-todo-client/src/components/TaskRow.tsx` — add real checkbox (or role="checkbox" button), `onComplete?(id, completed)` or `onToggleComplete?(task)` prop; keep completed styling (strikethrough, check); ensure 44px min touch target and keyboard/sr support.
  - `bmad-todo-client/src/components/TaskList.tsx` — accept `onComplete` (or similar) and pass to each TaskRow.
  - `bmad-todo-client/src/App.tsx` — add `handleCompleteTask` that calls `updateTask`, then merge updated task into state (or refetch); pass handler to TaskList; optional per-row or app-level error/loading for complete.
- **Tests:** Unit tests for `updateTask` (200 returns task, 404 throws with message, network error). Component tests for TaskRow (checkbox toggles, callback called with correct id/completed). Integration: mark complete and see list update.
- **Do not modify:** Backend (`bmad-todo-api/`), `src/types/task.ts` (already has `completed`).

#### Testing requirements

- **API layer:** Test `updateTask`: mock fetch; 200 returns updated task with completed true/false; 404 throws with message; network error throws. Reuse test style from `tasks.test.ts` (Vitest).
- **TaskRow:** Test that checkbox change (or click) invokes callback with task id and new completed value; completed state renders strikethrough/check. Optional: loading/disabled state.
- **App/TaskList:** Test that complete handler updates state (or refetches) so list shows updated task. E2E optional: toggle complete and assert list and persistence.

#### Previous story intelligence (Story 3.1)

- **Story 3.1:** Backend PATCH /tasks/:id implemented: 200 with updated task (snake_case), 404 with `{ "error": "Task not found" }`. Request body: `{ "completed": true }` or `{ "completed": false }`. Strong params permit only `:completed`. No frontend changes in 3.1; TaskRow is still presentational. [Source: 3-1-backend-patch-tasks-id-to-mark-complete.md]
- **Convention:** Use same error key `error` for 404. Frontend API layer should throw so App can show one message; same pattern as createTask.

#### Previous story intelligence (Story 2.2)

- **Story 2.2:** App uses merge strategy for create (prepend created task to state). Use same merge strategy for complete: replace task in array by id with response task, so list updates without refetch. AddRow has onSubmit, isSubmitting; similar optional isCompleting per row or single error state. [Source: 2-2-frontend-add-task-flow-and-show-new-task-in-list.md]

#### Git intelligence summary

- Recent commits: Story 3.1 (backend PATCH), Story 2.2 (frontend add-task). Frontend has TaskRow (presentational), TaskList, App with create flow. Add `updateTask` in api/tasks.ts, wire TaskRow checkbox and onComplete, connect App (handler → TaskList → TaskRow), merge updated task into state. No new directories or packages.

#### Latest tech information

- **Fetch API:** Standard; PATCH with body `JSON.stringify({ completed })`. Use `res.ok`, `res.status`, `res.json()`; throw on failure so caller can show message.
- **Checkbox accessibility:** Use native `<input type="checkbox">` with `checked={task.completed}` and `onChange` so keyboard (Space) and screen reader work; associate label with task title (e.g. aria-label or visible label). Min 44px touch target: ensure clickable area meets UX spec (padding or min-height on label/row).

#### Project context reference

- No `project-context.md` in repo. Use epics, architecture, UX spec, and story 3.1 / 2.2 artifacts only.

#### Story completion status

- **Status:** ready-for-dev. Ultimate context engine analysis completed — comprehensive developer guide created. Implement mark-complete flow in `bmad-todo-client`: `updateTask` in api/tasks.ts, interactive TaskRow (checkbox + onComplete), TaskList and App wiring (handler, merge or refetch), no full-page refresh, completion persisted on server.

---

## Change Log

- **2026-02-18:** Implemented mark-complete flow: `updateTask` in api/tasks.ts; TaskRow with real checkbox and `onComplete`; TaskList and App wired with merge-on-success; list updates without refresh; completion persisted on server. All ACs satisfied.
- **2026-02-18:** Code review fixes: File List +e2e/app.spec.ts; SAVE_ERROR_MESSAGE/USER_FACING_MESSAGE rename; per-row completing state (completingId/isCompleting); completed text #6b8e23; updateTask invalid-body test; E2E toggle-back; .gitignore playwright-report. Status → done.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **API layer:** Added `updateTask(id, { completed })` in `bmad-todo-client/src/api/tasks.ts`. PATCH /tasks/:id with snake_case body; on 200 returns parsed Task; on 404 reads `error` from JSON and throws; on 4xx/5xx/network throws "Couldn't save. Try again." Reuses getBaseUrl, timeout, and createTask-style error handling.
- **TaskRow:** Replaced visual-only checkbox with native `<input type="checkbox">`; added optional `onComplete(taskId, completed)` prop. Wrapped in `<label>` for 44px min-height touch target; kept strikethrough and completed color (#6b8e23). Keyboard and screen reader operable via native checkbox.
- **TaskList:** Added optional `onComplete` prop and pass-through to each TaskRow.
- **App:** Added `handleCompleteTask(id, completed)` that calls `updateTask`, then merges returned task into state (map-replace by id). Passes handler to TaskList; errors surface via existing app-level error state.
- **Tests:** Unit tests for `updateTask` (200, 404, 4xx/5xx, network, timeout). TaskRow tests for checkbox state and onComplete callback. TaskList test for onComplete passthrough. App tests for mark-complete flow (PATCH called, list updates with strikethrough) and error on PATCH failure.
- **Code review fixes (AI):** (1) Added e2e/app.spec.ts to File List. (2) Renamed CREATE_ERROR_MESSAGE → SAVE_ERROR_MESSAGE and CREATE_TASK_USER_MESSAGE → USER_FACING_MESSAGE in api/tasks.ts. (3) Added per-row completing state: completingId in App, completingId prop on TaskList, isCompleting on TaskRow; checkbox disabled and aria-busy while PATCH in flight. (4) Completed task text color set to #6b8e23 per UX spec. (5) Unit test for updateTask 200 with invalid body. (6) E2E mark-complete extended to toggle back to incomplete. (7) playwright-report/ and test-results/ added to .gitignore.

### File List

- bmad-todo-client/src/api/tasks.ts (modified)
- bmad-todo-client/src/api/tasks.test.ts (modified)
- bmad-todo-client/src/components/TaskRow.tsx (modified)
- bmad-todo-client/src/components/TaskRow.test.tsx (modified)
- bmad-todo-client/src/components/TaskList.tsx (modified)
- bmad-todo-client/src/components/TaskList.test.tsx (modified)
- bmad-todo-client/src/App.tsx (modified)
- bmad-todo-client/src/App.test.tsx (modified)
- bmad-todo-client/e2e/app.spec.ts (modified)
