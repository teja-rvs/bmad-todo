# Story 1.3: Frontend — home screen with task list or empty state

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to open the app and see my task list or an empty state with a way to add tasks,
so that I know what I have to do and can start adding tasks without manual refresh.

## Acceptance Criteria

1. **Given** the frontend app and an API base URL (e.g. env) pointing at the backend, **when** I open the app (or refresh), **then** the app fetches the task list from GET /tasks on mount and shows a home screen.
2. **And** if there are tasks, the list is displayed with each task's title and completion state (incomplete/complete).
3. **And** if there are no tasks, an empty state is shown with a "No tasks" (or "No tasks yet") message and a visible way to add a task (e.g. Add task button or add row at top).
4. **And** the layout follows the UX spec: add row at top, list or empty state below; Warm Minimal + Airy spacing; single-column, max-width for readability.

## Tasks / Subtasks

- [x] **API base URL and fetch on mount** (AC: #1)
  - [x] Add env/config for API base URL (e.g. `VITE_API_URL` in `.env.example` and `import.meta.env.VITE_API_URL`)
  - [x] Create `src/api/tasks.ts` (or equivalent) with `fetchTasks()` calling GET /tasks
  - [x] Create `src/types/task.ts` with `Task` interface matching API response (snake_case or document transform)
  - [x] In `App.tsx` (or main view), call `fetchTasks()` on mount (e.g. `useEffect`) and store result in state
  - [x] Show home screen (skeleton or loading state then content)
- [x] **Task list display** (AC: #2)
  - [x] Add `TaskList.tsx` and `TaskRow.tsx` in `src/components/`
  - [x] Display each task's title and completion state (incomplete/complete); no edit or complete action in this story (read-only list)
  - [x] Use list semantics (e.g. list/listitem or roles) per accessibility
- [x] **Empty state** (AC: #3)
  - [x] Add `EmptyState.tsx` in `src/components/`
  - [x] When task list is empty, show "No tasks" or "No tasks yet" and a visible way to add a task (e.g. Add task button or add row at top; add row can be non-functional or placeholder for Story 2.2)
  - [x] Conditionally render list vs empty state based on tasks length
- [x] **Add row at top (structure only)** (AC: #3, #4)
  - [x] Add `AddRow.tsx` (or equivalent) at top of main content—placeholder input + button is enough; actual POST in Story 2.2
  - [x] Layout: add row at top, then task list or empty state below
- [x] **Layout and UX** (AC: #4)
  - [x] Single-column layout; max-width 560–640px on desktop; mobile-first
  - [x] Warm Minimal + Airy spacing (per UX: e.g. background #fefdfb, text #2c2419, primary #8b7355; 20px row padding, 24px gaps, 1.125rem body; min 44px touch targets where applicable)
  - [x] Use existing Tailwind setup from Story 1.1

## Dev Notes

- **Frontend only:** This story implements the home screen and GET /tasks consumption. No backend changes; backend already has GET /tasks and CORS (Story 1.2).
- **Read-only list:** Display tasks and completion state only. Creating tasks (POST) and marking complete (PATCH) are Stories 2.2 and 3.2.
- **API contract:** GET /tasks returns `{ tasks: [...] }` with snake_case keys. Empty list = `{ tasks: [] }`. [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- **No real-time channel:** Fetch on mount; refetch/merge after mutations will be added in later stories. [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]

### Project Structure Notes

- **Frontend:** Work only in `bmad-todo-client/`. Add `src/api/tasks.ts`, `src/types/task.ts`, `src/components/AddRow.tsx`, `TaskList.tsx`, `TaskRow.tsx`, `EmptyState.tsx`. [Source: _bmad-output/planning-artifacts/architecture.md#Frontend: bmad-todo-client]
- **Backend:** Do not change `bmad-todo-api/` in this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 1.3 acceptance criteria and epic context.
- [Source: _bmad-output/planning-artifacts/architecture.md] — API (GET /tasks), naming (React PascalCase/camelCase), structure (src/components, api, types), no real-time, immutable state.
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Warm Minimal + Airy spacing, layout (add row at top, list or empty state below), single-column max-width, touch targets.

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **API:** Consume GET /tasks only. Response shape: `{ tasks: [...] }` with snake_case keys (`id`, `title`, `completed`, `created_at`, `updated_at`). Empty = `{ tasks: [] }`. Use one place for API base URL (e.g. `VITE_API_URL` from env).
- **Data flow:** On app mount, call `fetchTasks()`, store in React state (e.g. `tasks`, `isLoading`, `error`). Display list or empty state from state. Immutable updates only.
- **Components:** AddRow (at top, placeholder for add—no POST in this story), TaskList (container for task rows or empty state), TaskRow (display title + completion state only), EmptyState ("No tasks" / "No tasks yet" + visible Add task or add row).
- **Layout:** Add row at top; list or empty state below; single-column; max-width 560–640px desktop; mobile-first. Warm Minimal palette and airy spacing per UX spec.

#### Architecture compliance

- **Naming:** Components PascalCase (TaskList, TaskRow, AddRow, EmptyState); files match (TaskList.tsx, etc.); variables/props camelCase. API layer in `src/api/tasks.ts`; types in `src/types/task.ts`.
- **Structure:** `src/components/`, `src/api/`, `src/types/`. Only the API layer calls the backend; components receive data via props and callbacks.
- **No real-time:** Fetch on load only; no WebSockets, SSE, or polling. List updates after create/complete will be added in later stories (refetch or merge from response).

#### Library / framework requirements

- **React + Vite + TypeScript:** Use existing `bmad-todo-client` app from Story 1.1. No new frameworks; use `fetch` for API calls.
- **Tailwind:** Use existing Tailwind setup (Story 1.1 used Tailwind v4 / `@tailwindcss/vite`). Apply Warm Minimal palette and spacing from UX spec.
- **State:** React `useState` and `useEffect` only; no Redux or global store for MVP.

#### File structure requirements

- **Create/change only in `bmad-todo-client/`:**
  - `src/api/tasks.ts` — `fetchTasks()` calling GET {baseUrl}/tasks
  - `src/types/task.ts` — `Task` interface (match API shape; document snake_case vs camelCase if transformed)
  - `src/components/AddRow.tsx` — add row at top (placeholder; no POST yet)
  - `src/components/TaskList.tsx` — container for TaskRow list or EmptyState
  - `src/components/TaskRow.tsx` — single task row (title + completion state display)
  - `src/components/EmptyState.tsx` — "No tasks" message + visible add affordance
  - `App.tsx` — mount fetch, state, layout (add row + list or empty state)
  - `.env.example` — `VITE_API_URL=http://localhost:3000` (or equivalent)
- **Do not modify:** `bmad-todo-api/` in this story.

#### Testing requirements

- **Frontend tests:** Unit or integration tests for: (1) fetchTasks returns and maps API response to state; (2) empty list shows EmptyState; (3) non-empty list shows TaskList with task rows. Use Vitest (or existing test runner from Story 1.1). Optional: simple render tests for EmptyState and TaskRow.
- **No E2E required in this story** unless already in place; no backend changes.

#### Previous story intelligence (Story 1.2)

- **Backend is ready:** GET /tasks returns `{ tasks: [...] }` with snake_case; CORS allows `http://localhost:5173`. Integration tests cover empty list and list with tasks. [Source: 1-2-backend-tasks-table-and-get-tasks.md]
- **API base URL:** Backend runs on port 3000; frontend Vite on 5173. Use `VITE_API_URL=http://localhost:3000` (or same as CORS origin) so GET /tasks is called at correct host.
- **Response shape:** Controller returns `Task.order(created_at: :asc)` with JSON snake_case keys. Frontend can use snake_case in types or transform in API layer once; be consistent.
- **Scope:** Story 1.2 was backend only. This story (1.3) is first frontend feature: consume GET /tasks and render home screen. Do not implement POST or PATCH in this story.

#### Git intelligence summary

- Recent commits: "Story 1.2 Code review suggestions implemented", "Story 1.2 Qa automation tests added", "Story 1.2 Implemented", "Unit, E2E tests for project setup", "Implemented first story". Backend has tasks table, GET /tasks, CORS, and tests. Frontend is still scaffold-only (App.tsx, no components yet). Add `src/api/tasks.ts`, `src/types/task.ts`, and the four components; keep using existing test setup (Vitest or project default).

#### Latest tech information

- **Vite + React:** Use `import.meta.env.VITE_*` for env vars; no `process.env` in Vite. Fetch is built-in; no need for axios for MVP.
- **Tailwind v4:** Project uses `@tailwindcss/vite`; content paths are auto-detected. Use utility classes for Warm Minimal palette and spacing (see UX spec).
- **TypeScript:** Define `Task` interface to match API response; use strict types for state and props to avoid runtime shape mismatches.

#### Project context reference

- No `project-context.md` found in repo. Rely on epics, architecture, UX spec, and this story file only.

#### Story completion status

- **Status:** ready-for-dev. Ultimate context engine analysis completed — comprehensive developer guide created. Implement frontend home screen and GET /tasks consumption in `bmad-todo-client` per tasks above; do not implement POST or PATCH in this story.

---

## Change Log

- 2026-02-17: Story 1.3 implemented. Frontend home screen with GET /tasks on mount, TaskList/TaskRow/EmptyState/AddRow components, Warm Minimal + Airy layout. Unit and E2E tests added/updated.
- 2026-02-17: Code review fixes applied. fetchTasks timeout (10s) and user-facing error; E2E tests mock GET /tasks (deterministic); tasks.test URL assertion resilient; unit test for useEffect cleanup on unmount; Playwright webServer env VITE_API_URL for E2E.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented home screen with fetch on mount (GET /tasks), loading state, and error handling. Added `src/api/tasks.ts` (fetchTasks), `src/types/task.ts` (Task/TasksResponse), and components: AddRow (placeholder), TaskList, TaskRow, EmptyState. App.tsx uses useState/useEffect; layout: add row at top, then list or empty state. Warm Minimal + Airy styling in App.css and index.css; Tailwind for components. Unit tests for fetchTasks and App (loading, empty state, task list, add row). E2E updated for new home screen. Vitest env set with VITE_API_URL for tests.
- Code review (2026-02-17): Added 10s fetch timeout and "Request timed out" error; E2E mocks GET /tasks in first 3 tests; tasks.test asserts URL with path match + signal; App.test verifies no state update after unmount; playwright.config.ts webServer.env VITE_API_URL for E2E.

### File List

- bmad-todo-client/.env.example (new)
- bmad-todo-client/src/types/task.ts (new)
- bmad-todo-client/src/api/tasks.ts (new)
- bmad-todo-client/src/api/tasks.test.ts (new)
- bmad-todo-client/src/components/AddRow.tsx (new)
- bmad-todo-client/src/components/TaskList.tsx (new)
- bmad-todo-client/src/components/TaskRow.tsx (new)
- bmad-todo-client/src/components/EmptyState.tsx (new)
- bmad-todo-client/src/App.tsx (modified)
- bmad-todo-client/src/App.css (modified)
- bmad-todo-client/src/App.test.tsx (modified)
- bmad-todo-client/src/index.css (modified)
- bmad-todo-client/vite.config.ts (modified — test env VITE_API_URL)
- bmad-todo-client/e2e/app.spec.ts (modified)
- bmad-todo-client/playwright.config.ts (modified — webServer env VITE_API_URL for E2E)
