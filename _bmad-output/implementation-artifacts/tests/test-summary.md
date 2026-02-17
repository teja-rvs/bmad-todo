# Test Automation Summary

**Project:** bmad-todo  
**Date:** 2026-02-17  
**Workflow:** qa-automate (Quinn QA)

---

## Test Framework

- **Client (bmad-todo-client):** Vitest + React Testing Library + Playwright (unit + E2E)
- **API (bmad-todo-api):** Rails Minitest + `ActionDispatch::IntegrationTest`
- **Locations:** `bmad-todo-client/` (Vite + React), `bmad-todo-api/` (Rails API)

---

## Generated Tests

### API Tests (Rails – bmad-todo-api)

- [x] `bmad-todo-api/test/integration/tasks_endpoint_test.rb` – GET/POST /tasks
  - GET /tasks returns 200 and empty `{ tasks: [] }` when no tasks
  - GET /tasks returns 200 and tasks array with snake_case keys when tasks exist
  - GET /tasks returns CORS header for frontend origin (localhost:5173)
  - POST /tasks with valid title returns 201 and created task
  - POST /tasks with blank title returns 422 and error body
  - POST /tasks with title over 255 chars returns 422
  - POST /tasks with missing title returns 422
- [x] `bmad-todo-api/test/integration/health_endpoint_test.rb` – Health check
  - GET /up returns 200 when app is healthy
  - GET /up returns a present body
- [x] `bmad-todo-api/test/models/task_test.rb` – Task model
  - Valid with title present; invalid without/blank/too long title; completed defaults to false

### Unit / Component Tests (Client)

- [x] `bmad-todo-client/src/App.test.tsx` – App (loading, empty, list, add row, error)
- [x] `bmad-todo-client/src/api/tasks.test.ts` – getBaseUrl, fetchTasks (GET /tasks, errors, timeout)
- [x] `bmad-todo-client/src/components/AddRow.test.tsx` – AddRow (placeholder UI)
- [x] `bmad-todo-client/src/components/TaskList.test.tsx` – TaskList
- [x] `bmad-todo-client/src/components/TaskRow.test.tsx` – TaskRow
- [x] `bmad-todo-client/src/components/EmptyState.test.tsx` – EmptyState

### E2E Tests (Client)

- [x] `bmad-todo-client/e2e/app.spec.ts` – App UI (Playwright, Chromium)
  - Shows Tasks heading and home screen
  - Shows add row at top (textbox, Add task button)
  - Shows content area (empty state, list, or error when API unavailable)
  - Shows task list when API returns tasks (mocked response)

---

## Coverage

| Area            | Covered | Notes                                      |
|-----------------|--------|--------------------------------------------|
| API endpoints   | 2/2    | GET /up, GET /tasks, POST /tasks           |
| API model       | 1      | Task validations (presence, length, default) |
| UI / API client | 6      | App, fetchTasks, AddRow, TaskList, TaskRow, EmptyState |
| E2E flows       | 1      | Home screen, add row, empty/list/error, task list (mocked) |

---

## Run Commands

**Before running tests – stop project-related local servers:**

Stop any dev servers so E2E can bind to port 5173 and tests run without port conflicts.

```bash
# Option 1: Stop processes on project ports (macOS/Linux)
lsof -ti :5173 | xargs kill -9   # Vite (client)
lsof -ti :3000 | xargs kill -9   # Rails (API), if running

# Option 2: Stop the terminals where you ran `npm run dev` or `rails server`
```

**Client (bmad-todo-client):**

```bash
# Unit / component tests (Vitest)
npm run test        # watch
npm run test:run    # single run

# E2E tests (Playwright) – run after stopping any dev server on 5173
npx playwright install   # once, to install browsers
npm run test:e2e         # starts dev server if needed (reuseExistingServer when not CI)
```

**API (bmad-todo-api):**

```bash
bundle install   # if needed
bin/rails test   # all tests
bin/rails test test/integration/   # integration only
bin/rails test test/models/       # model tests only
```

---

## Validation (2026-02-17)

- **API:** 14 tests, 54 assertions – all passed ✅
- **Client unit:** 31 tests (6 files) – all passed ✅
- **Client E2E:** 4 Playwright tests – all passed ✅

---

## Next Steps

- Run tests in CI (e.g. client: `npm run test:run && npm run test:e2e`; API: `cd bmad-todo-api && bin/rails test`).
- When add-task flow is implemented (Story 2.2), add unit tests for `createTask()` in `src/api/tasks.test.ts` and E2E for “type title, submit, see new task in list”.
- When new API endpoints are added (e.g. PATCH/DELETE tasks), add matching integration tests in `bmad-todo-api/test/integration/`.
