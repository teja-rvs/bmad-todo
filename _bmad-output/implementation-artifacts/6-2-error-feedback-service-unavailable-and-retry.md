# Story 6.2: Error feedback — service unavailable and retry

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see when the app cannot reach the server so that I know to retry or check my connection (NFR-R2, FR25).

## Acceptance Criteria

1. **Given** the app is loaded and the backend is unreachable (e.g. server down or network error), **when** a request (load list, create, complete) fails, **then** the app shows a clear, user-facing message (e.g. "Service unavailable" or "Couldn't save. Try again.") instead of failing silently.
2. **And** optionally, a retry or "Try again" action is offered.
3. **And** the same error handling applies for create and complete (e.g. inline or banner, no modal required for MVP).

## Tasks / Subtasks

- [x] **Ensure initial load shows service-unavailable feedback (AC #1)** (AC: #1)
  - [x] When GET /tasks fails (network, timeout, 5xx), surface a clear message (e.g. "Service unavailable" or "Couldn't load tasks. Try again.").
  - [x] Optionally add a "Try again" control to refetch the list.
- [x] **Ensure create/complete show user-facing errors (AC #1, #3)** (AC: #1, #3)
  - [x] Verify create and complete already surface errors (inline or banner); align messaging with NFR-R2 (e.g. "Couldn't save. Try again." or "Service unavailable" for network/server).
  - [x] Optionally add "Try again" for failed create or complete.
- [x] **Retry or Try again (AC #2)** (AC: #2)
  - [x] Add retry/Try again for initial load and/or for create/complete where appropriate; keep UX inline or banner (no modal).
- [x] **Guardrail tests (AC #1–#3)** (AC: #1, #2, #3)
  - [x] Add unit or e2e tests that verify error message is shown on request failure and (if implemented) retry is available.

## Dev Notes

- **Frontend only.** No backend or API contract changes. [Source: _bmad-output/planning-artifacts/epics.md, architecture.md]
- **NFR-R2:** If the server or network is unavailable, the app surfaces a clear indication that the service is unavailable (no silent failure). [Source: _bmad-output/planning-artifacts/prd.md]
- **FR25:** The app requires network connectivity for loading and updating tasks (no offline in MVP). [Source: _bmad-output/planning-artifacts/epics.md, prd.md]
- **Architecture:** Frontend surfaces user-facing message and optional retry; one place to handle API errors (API layer or wrapper). [Source: _bmad-output/planning-artifacts/architecture.md]
- **Current state:** `api/tasks.ts` already throws user-facing messages (timeout: "Request timed out. Service may be unavailable."; create/update: "Couldn't save. Try again."). `App.tsx` has `error` state and shows it in a `<p role="alert">`. This story is to ensure consistency, clear "service unavailable" wording where appropriate, and optional retry.

### Project Structure Notes

- **Frontend:** Work in `bmad-todo-client/`. Key files: `App.tsx`, `src/api/tasks.ts`, `src/components/AddRow.tsx`, `src/components/TaskRow.tsx`. [Source: _bmad-output/planning-artifacts/architecture.md]
- **Backend:** No changes in `bmad-todo-api/` for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 6.2 acceptance criteria, Epic 6 (SPA behavior and error feedback).
- [Source: _bmad-output/planning-artifacts/architecture.md] — Error handling: frontend surfaces user-facing message and optional retry; match NFR-R2.
- [Source: _bmad-output/planning-artifacts/prd.md] — NFR-R2, FR25.

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **Initial load failure (AC #1):**
  - When `fetchTasks()` fails (network error, timeout, 5xx), the app must show a clear user-facing message (e.g. "Service unavailable" or "Couldn't load tasks. Try again."). `App.tsx` already catches in `useEffect` and sets `setError(err.message)`; verify message is appropriate and consider standardizing on "Service unavailable" for network/timeout/server errors.
  - Optionally add a "Try again" button or link that calls `fetchTasks()` again and clears error on success.
- **Create and complete failure (AC #1, #3):**
  - `createTask` and `updateTask` already throw with user-facing messages; `App.tsx` catches and sets `error`. Ensure messaging distinguishes where helpful (e.g. "Service unavailable" for network/timeout vs "Couldn't save. Try again." for server/validation). No modal for MVP; keep inline or banner.
  - Optionally add "Try again" for failed create (e.g. retry same title) or complete (retry same toggle).
- **Retry (AC #2):**
  - Add at least one retry path: e.g. "Try again" for initial load, and/or for create/complete. UX: inline or banner per architecture; no modal.

#### Architecture compliance

- **Error handling:** One place to handle API errors (API layer or wrapper); surface user-facing message and optional retry; match NFR-R2. [Source: architecture.md Process Patterns]
- **State (React):** Keep existing `error` state; immutable updates. Retry should refetch or re-call the same mutation. [Source: architecture.md]
- **API client:** All backend calls through `src/api/tasks.ts`; components do not use `fetch` directly. Retry = calling same `fetchTasks` / `createTask` / `updateTask` again. [Source: architecture.md]
- **Naming and structure:** No new components required unless extracting an error banner component; keep PascalCase/camelCase. [Source: architecture.md]

#### Library / framework requirements

- **React:** Use existing patterns (useState, useCallback, useEffect). Error UI can be a conditional block with message + optional button. [Source: architecture.md]
- **Vite:** No change to build or dev server. [Source: architecture.md]
- **Testing:** Use existing Vitest for unit tests; use existing Playwright e2e if available. Add test(s) that assert error message is shown on request failure and (if implemented) retry is present and works. [Source: bmad-todo-client e2e and Vitest setup]

#### File structure requirements

- **Touch only as needed:** `bmad-todo-client/src/` — `App.tsx` (error message and retry UI), possibly `api/tasks.ts` (message wording only); add or extend tests in `src/__tests__/` or e2e folder. Do not add new routes or pages. [Source: architecture.md Project Structure]
- **Do not create:** New backend routes or API endpoints. [Source: architecture.md]

#### Testing requirements

- **Unit or integration:** Add or extend test that verifies on fetch failure (e.g. mock fetch to reject or return 503), the app shows a user-facing error message. If retry is implemented, test that retry triggers fetch again and clears error on success.
- **E2E (if present):** Add or extend e2e scenario that simulates service unavailable (e.g. wrong API URL or mock server down) and asserts error message is visible; optionally assert "Try again" is present and works. [Source: _bmad-output/implementation-artifacts/test-summary.md, e2e specs]
- **Manual:** Turn off backend or use wrong VITE_API_URL; confirm load shows message; trigger create/complete failure and confirm message; test retry if implemented.

### Previous story intelligence

- **Last completed story in Epic 6:** 6-1 (SPA behavior — no full-page reloads). [Source: sprint-status.yaml]
- **Relevant pattern:** Frontend-only; changes in `bmad-todo-client/`. API layer (`api/tasks.ts`) is the single place for backend calls; `App.tsx` owns list and error state. [Source: 6-1-spa-behavior-no-full-page-reloads-for-core-flows.md]
- **Established patterns:** Vitest for unit/component tests; Playwright for e2e; error state in App and shown in `<p role="alert">`; createTask/updateTask already throw user-facing errors. [Source: 6-1 story, App.tsx, api/tasks.ts]
- **Learnings:** Do not add full-page reload or navigation; keep SPA data strategy (refetch/merge). Error handling should stay in one place and surface in existing error UI. [Source: 6-1 Dev Notes]

### Git intelligence summary

- **Recent commits:** Story 6-1 (SPA behavior), Epic 5 (5-1–5-4, retro). Frontend work in `bmad-todo-client/`: App.tsx, components, api/tasks.ts, e2e and Vitest. [Source: git log]
- **Patterns to follow:** Same API layer (fetchTasks, createTask, updateTask); error state in App; existing timeout and user-facing throws in api/tasks.ts. Add retry by re-calling the same API functions. [Source: App.tsx, api/tasks.ts]
- **Files frequently changed:** App.tsx, src/components/*.tsx, src/api/tasks.ts, e2e specs. [Source: repo structure]

### Latest tech information

- **Fetch error handling:** Network errors (no response) and timeouts (AbortController) should surface a single, clear message. Distinguishing "service unavailable" (5xx, timeout, network) from "validation error" (4xx with body) improves UX. [Source: web — fetch API and error handling]
- **Retry UX:** Inline or banner "Try again" is sufficient for MVP; no modal required per PRD/UX. [Source: architecture.md, epics.md]

### Project context reference

- No `project-context.md` found in repository. All context for this story comes from epics.md, architecture.md, prd.md, and existing implementation in `bmad-todo-client/`.

### Story completion status

- **Status:** done
- **Completion note:** Ultimate context engine analysis completed. Code review applied; MEDIUM fixes: 4xx on GET now uses LOAD_ERROR_MESSAGE (NFR-R2), complete-retry unit test added, story status aligned.
- **Next:** —

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **AC #1 (load):** `fetchTasks()` now throws a single user-facing message `LOAD_ERROR_MESSAGE` ("Service unavailable. Couldn't load tasks. Try again.") for network, timeout, and 5xx. Initial load shows this in the existing alert and a "Try again" button that refetches.
- **AC #1, #3 (create/complete):** `createTask`/`updateTask` throw `SAVE_SERVICE_UNAVAILABLE` for 5xx and timeout; 4xx/validation keep existing body or "Couldn't save. Try again." Errors shown in same inline/banner alert.
- **AC #2 (retry):** Single "Try again" button in the error banner; retries last failed action (load → refetch, create → same title, complete → same id/completed). Implemented via `lastFailedAction` state and `handleRetry`.
- **Guardrail tests:** Unit tests in `App.test.tsx` and `api/tasks.test.ts` for error message and retry (load, create, and complete retry). E2e tests: user-facing message + Try again on load failure, and Try again after load failure refetches and clears error.

### File List

- bmad-todo-client/src/App.tsx (modified)
- bmad-todo-client/src/App.css (modified)
- bmad-todo-client/src/App.test.tsx (modified)
- bmad-todo-client/src/api/tasks.ts (modified)
- bmad-todo-client/src/api/tasks.test.ts (modified)
- bmad-todo-client/e2e/app.spec.ts (modified)

### Change Log

- 2026-02-19: Code review fixes: (1) GET /tasks 4xx now throws LOAD_ERROR_MESSAGE (user-facing per NFR-R2); (2) unit test added for complete-retry flow in App.test.tsx; (3) story status section aligned with header. Story marked done.
- 2026-02-18: Story 6.2 implemented — service-unavailable error feedback and Try again for load, create, and complete (AC #1–#3). Frontend-only; api/tasks.ts user-facing messages; App.tsx error banner with retry; unit and e2e guardrail tests added.
