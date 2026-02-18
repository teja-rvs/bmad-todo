# Story 2.2: Frontend — add-task flow and show new task in list

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to type task text and confirm (Enter or Add button) so that the new task appears at the top of the list without refreshing,
so that creating tasks is quick and I see the result immediately.

## Acceptance Criteria

1. **Given** the home screen shows the add row at top and task list (or empty state), **when** I type in the add input (e.g. placeholder "Add a task…") and submit via Enter or Add button, **then** the frontend sends POST /tasks with the entered title.
2. **And** on success, the new task appears at the top of the list without full-page refresh (refetch list or merge from response).
3. **And** the input is cleared and focus can remain in the input for the next task.
4. **And** created tasks are persisted on the server (verified by refresh or GET /tasks).

## Tasks / Subtasks

- [x] **Add createTask to API layer** (AC: #1, #4)
  - [x] In `src/api/tasks.ts`, add `createTask(title: string)` that POSTs to `/tasks` with body `{ title }` (snake_case). On 201, return the created task (snake_case). On 4xx/5xx or network error, throw with a clear message (e.g. "Couldn't save. Try again.").
  - [x] Reuse `getBaseUrl()` and consistent error handling; do not duplicate fetch config.
- [x] **Wire AddRow to submit and clear** (AC: #1, #2, #3)
  - [x] Make AddRow controlled: accept `onSubmit(title: string)` (or `onCreate`) and optional `isSubmitting?: boolean`. Remove `disabled` and `readOnly` from input and button.
  - [x] On form submit (Enter or Add click): trim title; if empty, do not call API. Otherwise call `onSubmit(trimmed)`. Clear input after submit; keep focus in input (no focus steal).
  - [x] Placeholder: "Add a task…" per UX spec. [Source: _bmad-output/planning-artifacts/ux-design-specification.md]
- [x] **Connect App to create flow** (AC: #2, #4)
  - [x] In `App.tsx`, add handler that calls `createTask(title)` from `api/tasks`, then either (a) refetch via `fetchTasks()` and set state, or (b) merge the returned task into state (prepend to list). Use one strategy consistently per architecture (refetch or merge).
  - [x] New task must appear at **top** of list. Set loading/submitting state for Add button or row if desired (optional per UX); on error, set error state so user sees message (e.g. "Couldn't save. Try again.").
  - [x] Pass handler and optional `isSubmitting` to `AddRow`.

## Dev Notes

- **Frontend only:** This story is client-only. Backend POST /tasks is implemented in Story 2.1 (201 + created task, 422 for validation).
- **Existing code:** `AddRow` is currently a disabled/readOnly placeholder. `api/tasks.ts` has `fetchTasks()` only. `App` has tasks state and fetch-on-mount; AddRow is not connected. [Source: 2-1-backend-post-tasks-to-create-a-task.md]
- **API contract:** POST /tasks body: `{ "title": "string" }` (snake_case). Success: 201, body = single task object (id, title, completed, created_at, updated_at). Error: 422 with e.g. `{ error: "..." }`. [Source: _bmad-output/planning-artifacts/architecture.md]
- **UX:** Add row at top; new tasks at top of list; input clear and focus remain after add; no full-page refresh. [Source: _bmad-output/planning-artifacts/ux-design-specification.md]

### Project Structure Notes

- **Frontend:** Work in `bmad-todo-client/`. Touch only: `src/api/tasks.ts`, `src/components/AddRow.tsx`, `src/App.tsx`. Types in `src/types/task.ts` already match API (snake_case). [Source: _bmad-output/planning-artifacts/architecture.md]
- **Backend:** No changes in `bmad-todo-api/` for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 2.2 acceptance criteria and Epic 2 context.
- [Source: _bmad-output/planning-artifacts/architecture.md] — API (POST /tasks, 201, refetch/merge), naming (snake_case), structure (api/tasks.ts, AddRow, App state).
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Add row, placeholder "Add a task…", feedback, no modal.

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **POST /tasks:** Request body `{ title: string }` (snake_case). On 201, response is single task object with snake_case keys (id, title, completed, created_at, updated_at). Handle 422 (validation) and network errors; surface one user-facing message (e.g. "Couldn't save. Try again.").
- **Add flow:** User types in add input, submits via Enter or Add button. Frontend calls `createTask(title)`; on success, new task appears at **top** of list (refetch and set state, or prepend from response). Input cleared; focus remains in input.
- **No full-page refresh:** Use existing React state; update list in memory after successful create. Architecture: refetch list or merge from response — pick one and use consistently.
- **Empty/validation:** Do not POST if trimmed title is empty. Optional: disable Add button or show inline hint when empty; avoid submitting blank.

#### Architecture compliance

- **Naming:** API layer uses snake_case for request/response (already in `Task` type). Components and props camelCase (e.g. `onSubmit`, `isSubmitting`).
- **Structure:** Only `src/api/tasks.ts` calls the backend. AddRow and App must not use `fetch` directly; all HTTP via `createTask` and `fetchTasks`.
- **State:** Immutable updates only. After create: either replace tasks with result of `fetchTasks()`, or prepend `createdTask` to existing tasks array (new array, no mutation).
- **Error shape:** Backend returns `{ error: "..." }` or `{ errors: [...] }`; frontend should read and display one message. [Source: architecture.md Format Patterns]

#### Library / framework requirements

- **React:** Controlled input for add field; single handler for form submit (Enter + button). Use existing `useState`/`useEffect` patterns from App; no new state library.
- **Vite/TypeScript:** No new deps. Use existing `Task` and `TasksResponse` from `src/types/task.ts`.
- **Fetch:** Same pattern as `fetchTasks` (base URL, timeout optional, throw on !res.ok or invalid JSON). Do not add axios or other client for this story.

#### File structure requirements

- **Modify:**
  - `bmad-todo-client/src/api/tasks.ts` — add `createTask(title: string): Promise<Task>`.
  - `bmad-todo-client/src/components/AddRow.tsx` — controlled input, submit handler, clear + focus retention; props: `onSubmit(title: string)`, optional `isSubmitting`.
  - `bmad-todo-client/src/App.tsx` — create handler that calls `createTask`, then refetch or merge; pass handler to AddRow; optional `isSubmitting` state.
- **Tests:** Unit tests for `createTask` (success 201, error 422, network error). Component tests for AddRow (submit with text, clear input, optional submitting state). E2E optional: add task and see it in list.
- **Do not modify:** Backend (`bmad-todo-api/`), `src/types/task.ts` (already correct).

#### Testing requirements

- **API layer:** Test `createTask`: mock fetch; 201 returns task; 422 throws with message; network error throws. Reuse test style from `tasks.test.ts` (Vitest).
- **AddRow:** Test that submit is called with trimmed title; empty trim does not submit; input clears after submit. Optional: submitting disables button.
- **Integration/E2E:** Optional: open app, type in add field, submit, assert new task appears at top and list updates without reload. Match existing E2E style if present.

#### Previous story intelligence (Story 2.1)

- **Story 2.1:** Backend POST /tasks implemented: 201 with created task (snake_case), 422 for blank/invalid title with `{ error: "..." }` or `{ errors: [...] }`. Request body: `{ title: "..." }` (snake_case). No frontend changes in 2.1; AddRow is still placeholder. [Source: 2-1-backend-post-tasks-to-create-a-task.md]
- **Convention:** Use same error shape as backend; frontend API layer should throw or return so App can show one message. Backend integration tests in `test/integration/tasks_endpoint_test.rb`.

#### Git intelligence summary

- Recent commits: Story 1.3 implemented (frontend home, TaskList, EmptyState, AddRow placeholder), Story 1.2 backend GET /tasks. Frontend has `fetchTasks`, App state, AddRow disabled. Add `createTask` and wire AddRow + App to complete add-task flow; no new directories or packages.

#### Latest tech information

- **Fetch API:** Standard; no version lock. Use `res.ok`, `res.status`, `res.json()`; throw on failure so caller can show message.
- **React forms:** Controlled input + onSubmit (form or button click); prevent default where needed. Focus retention: do not call `blur()` or move focus after submit so user can type next task immediately.

#### Project context reference

- No `project-context.md` in repo. Use epics, architecture, UX spec, and this story only.

#### Story completion status

- **Status:** ready-for-dev. Ultimate context engine analysis completed — comprehensive developer guide created. Implement add-task flow in `bmad-todo-client`: `createTask` in api/tasks.ts, wire AddRow (submit, clear, focus), connect App (refetch or merge, new task at top); ensure no full-page refresh and tasks persisted on server.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented `createTask(title)` in `api/tasks.ts`: POST /tasks with `{ title }`, 201 returns task, 4xx/5xx and network errors throw "Couldn't save. Try again." Reused getBaseUrl and timeout/AbortController pattern.
- AddRow: controlled input with `onSubmit(title)` and optional `isSubmitting`; form submit trims and skips empty; clears input and keeps focus; placeholder "Add a task…".
- App: `handleCreateTask` calls `createTask`, prepends created task to state (merge strategy), passes handler and `isSubmitting` to AddRow; errors surface in existing error UI.
- Unit tests: createTask (201, 422, 5xx, network); AddRow (placeholder, submit Enter/button, empty no submit, clear input, isSubmitting); App (load, empty, list, error, create at top, create error). E2E: add task flow. Lint clean.
- Code review (2026-02-18): Fixed error parsing for errors[] object shape; 201 response normalized to full Task; AddRow errorDescriptionId + App app-error id for aria-describedby; App.test.tsx create-flow tests; File List updated with App.test.tsx and e2e/app.spec.ts (backend .gitignore change excluded per review).

### File List

- bmad-todo-client/src/api/tasks.ts (modified)
- bmad-todo-client/src/api/tasks.test.ts (modified)
- bmad-todo-client/src/components/AddRow.tsx (modified)
- bmad-todo-client/src/components/AddRow.test.tsx (modified)
- bmad-todo-client/src/App.tsx (modified)
- bmad-todo-client/src/App.test.tsx (modified)
- bmad-todo-client/e2e/app.spec.ts (modified)

## Change Log

- 2026-02-18: Story 2.2 implemented — add-task flow (createTask API, AddRow submit/clear/focus, App create handler with merge); new task at top, no full-page refresh; tests and lint pass.
- 2026-02-18: Code review fixes: File List updated (App.test.tsx, e2e/app.spec.ts); createTask error parsing supports errors[0] as object with message; 201 response normalized to full Task shape; AddRow/App error association (aria-describedby); App tests for create flow (new task at top, error on 422).
