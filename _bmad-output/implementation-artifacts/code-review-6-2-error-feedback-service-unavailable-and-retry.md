# Code Review: Story 6.2 — Error feedback (service unavailable and retry)

**Story:** 6-2-error-feedback-service-unavailable-and-retry  
**Reviewed:** 2026-02-19  
**Reviewer:** Adversarial code review (workflow)

---

## Git vs Story Discrepancies

- **Story File List** matches modified files in git: `App.tsx`, `App.css`, `App.test.tsx`, `api/tasks.ts`, `api/tasks.test.ts`, `e2e/app.spec.ts` are all modified.
- **1 discrepancy:** The story implementation artifact (`6-2-error-feedback-service-unavailable-and-retry.md`) is **untracked** (??). If story files are versioned, it should be added and committed.
- All code changes are **uncommitted** (M, not staged). Story does not explicitly note that changes are uncommitted (transparency).

---

## Issues Found

**Summary:** 3 High, 0 Medium, 5 Low (reported as 3–8 below; severity as stated)

---

### CRITICAL / HIGH

*None.* Tasks marked [x] are implemented; ACs #1–#3 are satisfied in code and tests for load/create error and retry.

---

### MEDIUM

1. **4xx on GET /tasks shows technical message (NFR-R2)**  
   **File:** `bmad-todo-client/src/api/tasks.ts` (lines 29–33)  
   When the backend returns 4xx (e.g. 401, 403, 404) on GET /tasks, the app throws `Failed to fetch tasks: ${res.status} ${res.statusText}`, which is technical and not user-facing. NFR-R2 and AC #1 expect a clear, user-facing indication when the service/list is unavailable. Only 5xx (and timeout/network) use `LOAD_ERROR_MESSAGE`. For consistency and NFR-R2, 4xx on load should also surface a user-facing message (e.g. reuse "Service unavailable. Couldn't load tasks. Try again." or a single generic message).

2. **No unit test for complete-retry flow**  
   **File:** `bmad-todo-client/src/App.test.tsx`  
   The story implements retry for complete (via `lastFailedAction` and `handleRetry`), and guardrail tasks require tests for "retry is available." Load retry and create retry are covered; **complete retry** (PATCH fails → Try again → PATCH succeeds) has no unit test. Add a test that fails PATCH, shows alert + Try again, clicks Try again, then succeeds and clears error.

3. **Conflicting status in story file**  
   **File:** `_bmad-output/implementation-artifacts/6-2-error-feedback-service-unavailable-and-retry.md`  
   Top of file: `Status: review`. "Story completion status" section: `**Status:** ready-for-dev`. One source of truth should be used; for code-review workflow it should be `review` (or removed from the completion section).

---

### LOW

4. **API unit tests depend on VITE_API_URL in test env**  
   **File:** `bmad-todo-client/src/api/tasks.test.ts`  
   `fetchTasks()`, `createTask()`, and `updateTask()` call `getBaseUrl()` which uses `import.meta.env` when no env is passed. Tests stub `fetch` but do not stub or set `VITE_API_URL`. If the test environment does not set it, these tests could throw "VITE_API_URL is not set" before the fetch stub runs. Consider passing a mock env in tests or documenting the requirement.

5. **No e2e for create/complete failure + Try again**  
   **File:** `bmad-todo-client/e2e/app.spec.ts`  
   E2e covers load failure → message + Try again → refetch. There is no e2e that simulates create (POST) or complete (PATCH) failure, shows the error and "Try again", then retries and succeeds. Story says this is optional; adding it would strengthen guardrails.

6. **FETCH_TIMEOUT_MS hardcoded**  
   **File:** `bmad-todo-client/src/api/tasks.ts` (line 13)  
   `FETCH_TIMEOUT_MS = 10_000` is not configurable. Acceptable for MVP; consider env or config later for different environments.

7. **Story artifact untracked**  
   The implementation story file is untracked. If the repo tracks story files in git, add and commit it for traceability.

---

## AC and Task Verification

| Item | Status | Evidence |
|------|--------|----------|
| AC #1: User-facing message on load/create/complete failure | Met | `LOAD_ERROR_MESSAGE` / `SAVE_SERVICE_UNAVAILABLE`; alert in App.tsx |
| AC #2: Retry / Try again offered | Met | Single "Try again" button; `handleRetry` for load, create, complete |
| AC #3: Same handling for create and complete, inline/banner | Met | Same error banner; no modal |
| Task: Initial load service-unavailable feedback | Done | fetchTasks 5xx/timeout/network → LOAD_ERROR_MESSAGE; Try again refetches |
| Task: Create/complete user-facing errors | Done | SAVE_SERVICE_UNAVAILABLE for 5xx/timeout; 4xx from body |
| Task: Retry for load and create/complete | Done | lastFailedAction + handleRetry |
| Task: Guardrail tests | Done | Unit: error + retry (load, create); e2e: load failure + Try again refetch. Gap: no unit test for complete retry |

---

## Recommendation

- **Fix MEDIUM #1:** Use a user-facing message for 4xx on GET /tasks (align with NFR-R2).
- **Fix MEDIUM #2:** Add a unit test for complete-retry flow in `App.test.tsx`.
- **Fix MEDIUM #3:** Align story status (e.g. keep `Status: review` and fix or remove "Story completion status" so it is consistent).
- **Optional:** Address LOW items (e2e for create/complete failure, env stub in api tests, timeout config, story file in git) as needed.

After fixes, set story status to **done** and sync `sprint-status.yaml` if applicable.
