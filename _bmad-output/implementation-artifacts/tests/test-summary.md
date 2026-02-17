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

- [x] `bmad-todo-api/test/integration/tasks_endpoint_test.rb` – GET /tasks
  - Returns 200 and empty `{ tasks: [] }` when no tasks
  - Returns 200 and tasks array with snake_case keys when tasks exist
  - Returns CORS header for frontend origin (localhost:5173)
  - POST /tasks returns 404 (route not defined)
- [x] `bmad-todo-api/test/integration/health_endpoint_test.rb` – Health check
  - GET /up returns 200 when app is healthy
  - GET /up returns a present body
- [x] `bmad-todo-api/test/models/task_test.rb` – Task model
  - Valid with title present; invalid without title; invalid with blank title; invalid when title over 255 chars

### Unit / Component Tests (Client)

- [x] `bmad-todo-client/src/App.test.tsx` – App component
  - Shows loading then fetches tasks on mount
  - Shows empty state when task list is empty
  - Shows task list with task titles when tasks exist
  - Shows home screen with add row at top
  - Shows error message when fetch fails
- [x] `bmad-todo-client/src/api/tasks.test.ts` – fetchTasks API
  - Calls GET on baseUrl/tasks and returns tasks array
  - Returns empty tasks array when API returns empty list
  - Throws when response is not ok (e.g. 500)
  - Throws when response is missing tasks array

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
| API endpoints   | 2/2    | GET /up, GET /tasks (+ 404 for POST)       |
| API model       | 1      | Task validations (incl. length)             |
| UI / API client | 2      | App (loading, empty, list, add row, error); fetchTasks |
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
bin/rails test test/models/         # model tests only
```

---

## Status

- **API tests:** 10 tests (4 tasks endpoint, 2 health, 4 task model) – all passing.
- **Client unit tests:** 9 tests (5 App, 4 fetchTasks) – all passing.
- **Client E2E tests:** 4 Playwright tests – run with `npm run test:e2e` when port 5173 is available (or stop any existing dev server first).

---

## Next Steps

- Run tests in CI (e.g. client: `npm run test:run && npm run test:e2e`; API: `cd bmad-todo-api && bin/rails test`).
- When add-task or complete-task UI is implemented, add E2E tests for those flows.
- When new API endpoints are added (e.g. POST/PATCH/DELETE tasks), add matching integration tests in `bmad-todo-api/test/integration/`.
