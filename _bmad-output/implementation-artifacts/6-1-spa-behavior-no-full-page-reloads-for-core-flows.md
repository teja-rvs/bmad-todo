# Story 6.1: SPA behavior — no full-page reloads for core flows

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the app to behave as a single page so that creating and completing tasks do not reload the whole page (FR24).

## Acceptance Criteria

1. **Given** the app is loaded, **when** I add a task or mark a task complete, **then** the action is handled in the client (API call and state update) and the list updates without a full-page reload.
2. **And** the app uses client-side state and refetch/merge after mutations; no full-page navigation for these flows.

## Tasks / Subtasks

- [x] **Verify add-task flow does not cause full-page reload (AC #1)** (AC: #1)
  - [x] Confirm add-task form uses `preventDefault()` on submit and uses `fetch` (or existing `createTask`) for POST; no form `action` that navigates.
  - [x] Confirm success path updates React state (e.g. append/merge from response) and does not trigger `window.location` or full-page navigation.
- [x] **Verify mark-complete flow does not cause full-page reload (AC #1)** (AC: #1)
  - [x] Confirm complete control (e.g. checkbox) uses client-side handler that calls PATCH via API layer and updates state; no link or form that causes navigation.
- [x] **Confirm SPA data strategy (AC #2)** (AC: #2)
  - [x] Document or verify single strategy: refetch list or merge from API response after create/complete; no full-page reload for these flows.
  - [x] Ensure no `<a href="...">` or other elements cause full-page navigation for core task flows (add, complete).
- [x] **Add guardrail test or e2e (AC #1, #2)** (AC: #1, #2)
  - [x] Add test (unit or e2e) that asserts add task and mark complete do not cause full-page reload (e.g. no document reload, or list updates in place).

## Dev Notes

- **Frontend only.** No backend or API contract changes. [Source: _bmad-output/planning-artifacts/epics.md, architecture.md]
- **FR24:** The app behaves as a single-page application (core task flows without full-page reloads). [Source: _bmad-output/planning-artifacts/epics.md, prd.md]
- **Architecture:** Client loads task list on open; after create or complete, refetch list or use API response to update UI. No WebSockets, SSE, or polling for MVP. [Source: _bmad-output/planning-artifacts/architecture.md]
- **Current implementation:** `AddRow` already uses `e.preventDefault()` in submit handler; `App.tsx` uses `createTask`/`updateTask` and updates state (merge/refetch). This story is verification, documentation, and guardrail tests.

### Project Structure Notes

- **Frontend:** Work in `bmad-todo-client/`. Key files: `App.tsx`, `src/components/AddRow.tsx`, `src/components/TaskRow.tsx`, `src/api/tasks.ts`. [Source: _bmad-output/planning-artifacts/architecture.md]
- **Backend:** No changes in `bmad-todo-api/` for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 6.1 acceptance criteria, Epic 6 (SPA behavior and error feedback).
- [Source: _bmad-output/planning-artifacts/architecture.md] — Frontend state, API usage pattern, no full-page reload.
- [Source: _bmad-output/planning-artifacts/prd.md] — FR24, SPA application model.

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **No full-page reload on add task (AC #1):**
  - Form submit must call `event.preventDefault()` so the browser does not perform default form submission (which would reload the page). Current `AddRow` already does this in `handleSubmit`.
  - Add-task flow must use the existing API layer (`createTask` in `api/tasks.ts`) and update React state (e.g. `setTasks((prev) => [created, ...prev])`) without any `window.location` change or full-page navigation.
  - Do not add `action` or `method` on the form that would cause browser navigation; do not use `<a href="...">` for submit.
- **No full-page reload on mark complete (AC #1):**
  - The complete control (checkbox in `TaskRow`) must invoke a callback that calls `updateTask` (PATCH) and updates state in place (e.g. `setTasks(prev => prev.map(...))`). No link or form that triggers navigation.
  - Current implementation in `App.tsx` (`handleCompleteTask` → `updateTask` → `setTasks`) already follows this; verify and add tests.
- **SPA data strategy (AC #2):**
  - Use one consistent strategy: after create, either refetch list or merge created task from API response into state; after complete, either refetch or merge updated task from response. Architecture forbids real-time channel (WebSockets/SSE/polling) for MVP.
  - Ensure no code path in core flows (load list, add task, mark complete) triggers full-page reload (e.g. no `window.location.reload()`, no un-prevented form submit, no navigation-inducing links for these flows).

#### Architecture compliance

- **State (React):** Immutable updates only; after mutation, refetch list or merge API response in one predictable way. No in-place mutation of state. [Source: architecture.md Implementation Patterns]
- **API client:** All backend calls go through `src/api/tasks.ts` (`fetchTasks`, `createTask`, `updateTask`). Components do not use `fetch` directly. [Source: architecture.md]
- **Naming and structure:** No new components required unless extracting a hook; keep PascalCase components, camelCase props and variables. [Source: architecture.md]
- **No real-time channel:** Do not add WebSockets, SSE, or polling; refetch/merge after mutations only. [Source: architecture.md]

#### Library / framework requirements

- **React:** Use existing patterns (useState, useCallback, useEffect). Form submit handler must call `e.preventDefault()` to keep SPA behavior. No new routing library required for MVP (single view). [Source: architecture.md]
- **Vite:** No change to build or dev server. [Source: architecture.md]
- **Testing:** Use existing Vitest for unit tests; use existing Playwright (or project e2e) for e2e if available. Add test(s) that assert no full-page reload on add/complete (e.g. check that `document` or list root is not replaced, or that list updates without navigation). [Source: bmad-todo-client e2e and Vitest setup]

#### File structure requirements

- **Touch only as needed:** `bmad-todo-client/src/` — likely `App.tsx`, `AddRow.tsx`, `TaskRow.tsx`, `api/tasks.ts` for verification; add or extend tests in `src/__tests__/` or e2e folder. Do not add new top-level routes or pages; single view for MVP. [Source: architecture.md Project Structure]
- **Do not create:** New backend routes, new API endpoints, or real-time infrastructure. [Source: architecture.md]

#### Testing requirements

- **Unit or integration:** Add or extend test that verifies add-task submit does not cause full-page reload (e.g. form submit handler calls preventDefault and state updates; mock fetch). Similarly for mark-complete path.
- **E2E (if present):** Add or extend e2e scenario that adds a task and marks complete and asserts the page did not reload (e.g. same document, or list DOM updates in place). Prefer existing e2e patterns in `bmad-todo-client/e2e/`. [Source: _bmad-output/implementation-artifacts/test-summary.md, e2e specs]
- **Manual:** Smoke-test add task and mark complete in browser; confirm no full-page flash or URL change for these actions.

### Previous story intelligence

- **Last completed story:** 5-4 (responsive layout). Different epic; no direct code dependency. [Source: sprint-status.yaml]
- **Relevant pattern:** Frontend-only story; changes confined to `bmad-todo-client/`, no backend. Test in supported viewports if e2e runs. [Source: 5-4-responsive-layout-desktop-and-mobile-viewports.md]
- **Established patterns:** Vitest for unit/component tests; Playwright for e2e; Tailwind for layout; API layer in `src/api/tasks.ts`. [Source: git history, 5-4 story]

### Git intelligence summary

- **Recent commits:** Epic 5 (5-1 through 5-4, retro). Frontend work in `bmad-todo-client/`: components, `App.tsx`, `api/tasks.ts`, e2e and Vitest. [Source: git log]
- **Patterns to follow:** Same API layer (`fetchTasks`, `createTask`, `updateTask`); React state in `App`; form submit with `preventDefault()` in `AddRow`; no new dependencies unless justified. [Source: App.tsx, AddRow.tsx, api/tasks.ts]
- **Files frequently changed:** `App.tsx`, `src/components/*.tsx`, `src/api/tasks.ts`, e2e specs. [Source: repo structure]

### Latest tech information

- **React form submit (SPA):** Use `event.preventDefault()` in submit handler to prevent full-page reload; use `fetch()` (or existing API layer) for server call; update React state from response. Controlled components and `type="submit"` for Enter and button click. [Source: web search – React prevent page refresh on form submit]
- **No version change required:** Current stack (Vite, React, TypeScript, fetch) already supports SPA behavior; no new libraries needed for this story.

### Project context reference

- No `project-context.md` found in repository. All context for this story comes from epics.md, architecture.md, prd.md, and existing implementation in `bmad-todo-client/`.

### Story completion status

- **Status:** ready-for-dev
- **Completion note:** Ultimate context engine analysis completed — comprehensive developer guide created.
- **Next:** Run dev agents `dev-story` for implementation; run `code-review` when complete (auto-marks done).

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Verified add-task flow: AddRow uses `e.preventDefault()` in handleSubmit; form has no `action`; App uses `createTask` and `setTasks((prev) => [created, ...prev])`. No full-page navigation.
- Verified mark-complete flow: TaskRow checkbox calls `onComplete` → App `handleCompleteTask` → `updateTask` (PATCH) and `setTasks(prev => prev.map(...))`. No link or form.
- Documented SPA data strategy in App.tsx (AC #2): merge from API response after create/complete; no full-page reload.
- Added unit tests: AddRow (form submit + no action + no `<a href>`), TaskRow (no link/form for completion).
- Added e2e guardrail: "SPA: add task and mark complete do not cause full-page reload" — asserts navigation entry count stays 1 after add and mark complete.
- Verified API layer: createTask/updateTask in api/tasks.ts used for POST/PATCH; no redirect or navigation.

### File List

- bmad-todo-client/src/App.tsx (comment: SPA data strategy)
- bmad-todo-client/src/api/tasks.ts (verified: createTask/updateTask used; no redirect/navigation)
- bmad-todo-client/src/components/AddRow.test.tsx (SPA guardrail tests)
- bmad-todo-client/src/components/TaskRow.test.tsx (SPA guardrail test)
- bmad-todo-client/e2e/app.spec.ts (e2e SPA no-reload test)
- _bmad-output/implementation-artifacts/sprint-status.yaml (supporting: story status)
- _bmad-output/implementation-artifacts/tests/test-summary.md (supporting: test summary)

## Change Log

- 2026-02-18: Story 6.1 implemented — verified add-task and mark-complete flows (no full-page reload), documented SPA data strategy, added unit and e2e guardrail tests.
- 2026-02-18: Code review — fixed File List (added api/tasks.ts, sprint-status.yaml, test-summary.md), AddRow test now asserts preventDefault, App.tsx comment AC #3→accessibility, epics.md Epic 6 FR26→FR24/FR25, e2e SPA test same-document guard. Status → done.
