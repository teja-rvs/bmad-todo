---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# bmad-todo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bmad-todo, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can open the app and see a home screen.
FR2: User can see a list of their tasks on the home screen.
FR3: User can see each task's completion state (e.g. incomplete vs complete) in the list.
FR4: User can see the list update when tasks are added or completed (without manual refresh; e.g. by refetching from the server after each action).
FR5: User can see an empty state when there are no tasks.
FR6: Empty state shows a "No tasks" (or equivalent) message.
FR7: User can access the add-task flow from the empty state (e.g. Add task / Create task button).
FR8: User can start creating a task (e.g. via Add task button).
FR9: User can enter task text before creating.
FR10: User can confirm creation (e.g. Create button or equivalent).
FR11: User can see the new task appear in the list after creation (no manual refresh).
FR12: Created tasks are persisted on the server.
FR13: User can mark a task as complete from the list.
FR14: User can see the task's completed state update in the list after the action (no manual refresh).
FR15: Completion state is persisted on the server.
FR16: User can delete all their task data (e.g. "Delete all" or equivalent).
FR17: Task data is stored on the server (not browser-only).
FR18: Task list is loaded from the server when the user opens or refreshes the app (within connectivity constraints).
FR19: User can use the app with keyboard-only interaction for core flows (view list, add task, mark complete).
FR20: User can use the app with a screen reader (content and actions are exposed and announced appropriately).
FR21: Visual presentation meets WCAG 2.1 Level AA (e.g. contrast, focus indicators, text alternatives where needed).
FR22: User can use the app on desktop viewports.
FR23: User can use the app on mobile viewports (layout and controls are usable).
FR24: User can use the app in the latest versions of Chrome, Firefox, Safari, and Edge (desktop and mobile where applicable).
FR25: The app behaves as a single-page application (core task flows without full-page reloads).
FR26: The app requires network connectivity for loading and updating tasks (no offline support in MVP).

### NonFunctional Requirements

NFR-P1: User-triggered actions (create task, mark complete) complete and reflect in the UI within 200 ms under normal conditions (excluding network latency to server).
NFR-P2: List updates (new or updated tasks) are visible to the user after the change is persisted—e.g. by refetching or using the API response—without manual refresh. No dedicated real-time channel (WebSockets, SSE, polling) required.
NFR-P3: Initial load of the app (first meaningful content and ability to interact) completes within 3 seconds on a typical broadband connection.
NFR-A1: The application conforms to WCAG 2.1 Level AA (as evidenced by passing an agreed evaluation method, e.g. automated checks plus targeted manual testing).
NFR-A2: All core user flows (view list, add task, mark complete) are fully operable via keyboard only (no mouse required).
NFR-A3: All core content and controls are compatible with at least one major screen reader (e.g. NVDA, JAWS, or VoiceOver) for the supported platforms.
NFR-S1: All data in transit between client and server uses TLS (e.g. HTTPS).
NFR-S2: Task data stored on the server is protected using industry-standard practices (e.g. encryption at rest where applicable and access control so only the owning user can access their data).
NFR-R1: The application is available for normal use during business hours with 99% uptime (as measured by availability monitoring over the agreed business-hours window).
NFR-R2: If the server or network is unavailable, the app surfaces a clear indication that the service is unavailable (no silent failure).

### Additional Requirements

**From Architecture (technical / implementation):**

- **Starter template (Epic 1 Story 1):** Frontend: Vite + React + TypeScript via `npm create vite@latest bmad-todo-client -- --template react-ts`; add Tailwind post-scaffold (`npm install -D tailwindcss postcss autoprefixer`, configure content paths and directives). Backend: Rails API + PostgreSQL via `rails new bmad-todo-api --api --database=postgresql`; `rails db:create` and `rails db:migrate`. Monorepo layout with `bmad-todo-client` and `bmad-todo-api` as sibling directories (or two repos).
- **API contract:** REST, JSON. Routes: GET /tasks, POST /tasks, GET /tasks/:id, PATCH /tasks/:id, DELETE /tasks/:id; optional DELETE /tasks/destroy_all (or equivalent). JSON keys snake_case; consistent error shape (e.g. `{ error: "message" }` or `{ errors: [...] }`). CORS restricted to frontend origin(s).
- **Data model:** Single `tasks` table: id, title, completed, created_at, updated_at. Rails migrations and model validations (e.g. title presence, length).
- **No real-time channel:** Client loads task list on open/refresh; after create or complete, refetch list or use API response to update UI. No WebSockets, SSE, or polling for MVP.
- **Naming and structure:** Database and API use snake_case; React components PascalCase, files and variables camelCase. Frontend: `src/components/` (AddRow, TaskList, TaskRow, EmptyState), `src/api/tasks.ts` as sole backend caller, `src/types/task.ts`. Backend: standard Rails (models, controllers, routes).
- **Error handling:** Backend returns consistent JSON error and HTTP status; frontend surfaces user-facing message (e.g. "Couldn't save. Try again.") and optional retry; match NFR-R2 for service unavailable.
- **Framework conventions:** Use Rails generators for model, controller, migrations; use Vite/React official scaffold; immutable state updates; single strategy for merging API responses into state.

**From UX Design:**

- **Design direction:** Warm Minimal + Airy spacing. Palette: e.g. background #fefdfb, text #2c2419, primary #8b7355, completed #6b8e23. Airy spacing: e.g. 20px row padding, 24px gaps, 1.125rem body; min 44px touch targets.
- **Layout:** Add row at top of main content, above task list; new tasks inserted at top of list. Single view, no tabs or sidebar; single-column, max-width 560–640px on desktop; mobile-first.
- **Components:** Add Row (single text input e.g. "Add a task…" + Add button); Task List (container for rows or empty state); Task Row (checkbox + label, completed state e.g. strikethrough/check); Empty State ("No tasks yet" + short copy); Delete All optional and secondary (e.g. settings/overflow/footer).
- **Interaction:** Enter or Add button to submit; one action to mark complete (checkbox); visible focus ring; full keyboard and screen reader support; optional loading state on Add button or list.
- **Feedback:** Success = task in list / completed state visible; error = inline or banner "Couldn't save. Try again." with retry; no modal for MVP.

### FR Coverage Map

FR1: Epic 1 - User can open the app and see a home screen.
FR2: Epic 1 - User can see a list of their tasks on the home screen.
FR3: Epic 1 - User can see each task's completion state in the list.
FR4: Epic 1 - User can see the list update when tasks are added or completed (no manual refresh).
FR5: Epic 1 - User can see an empty state when there are no tasks.
FR6: Epic 1 - Empty state shows a "No tasks" (or equivalent) message.
FR7: Epic 1 - User can access the add-task flow from the empty state.
FR8: Epic 2 - User can start creating a task (e.g. via Add task button).
FR9: Epic 2 - User can enter task text before creating.
FR10: Epic 2 - User can confirm creation (e.g. Create button or equivalent).
FR11: Epic 2 - User can see the new task appear in the list after creation (no manual refresh).
FR12: Epic 2 - Created tasks are persisted on the server.
FR13: Epic 3 - User can mark a task as complete from the list.
FR14: Epic 3 - User can see the task's completed state update in the list after the action (no manual refresh).
FR15: Epic 3 - Completion state is persisted on the server.
FR16: Epic 4 - User can delete all their task data.
FR17: Epic 1 - Task data is stored on the server (not browser-only).
FR18: Epic 1 - Task list is loaded from the server when the user opens or refreshes the app.
FR19: Epic 5 - User can use the app with keyboard-only interaction for core flows.
FR20: Epic 5 - User can use the app with a screen reader.
FR21: Epic 5 - Visual presentation meets WCAG 2.1 Level AA.
FR22: Epic 5 - User can use the app on desktop viewports.
FR23: Epic 5 - User can use the app on mobile viewports.
FR24: Epic 5 - User can use the app in latest Chrome, Firefox, Safari, and Edge.
FR25: Epic 6 - The app behaves as a single-page application (no full-page reloads for core flows).
FR26: Epic 6 - The app requires network connectivity for loading and updating tasks (no offline in MVP).

## Epic List

### Epic 1: Foundation and view task list
User can open the app and see their task list (or an empty state when there are no tasks), with the list loaded from the server and list updates visible without manual refresh.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR17, FR18.

### Epic 2: Create tasks
User can add a task (enter text and confirm) and see the new task appear in the list, persisted on the server.
**FRs covered:** FR8, FR9, FR10, FR11, FR12.

### Epic 3: Complete tasks
User can mark a task as complete from the list and see the completed state update, persisted on the server.
**FRs covered:** FR13, FR14, FR15.

### Epic 4: Delete all data
User can delete all their task data (e.g. "Delete all" or equivalent).
**FRs covered:** FR16.

### Epic 5: Accessibility and responsive experience
User can use the app with keyboard only, with a screen reader, on desktop and mobile, in supported browsers, with visual presentation meeting WCAG 2.1 Level AA.
**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24.

### Epic 6: SPA behavior and error feedback
The app behaves as an SPA (no full-page reloads for core flows) and surfaces clear feedback when the service is unavailable.
**FRs covered:** FR25, FR26.

---

## Epic 1: Foundation and view task list

User can open the app and see their task list (or an empty state when there are no tasks), with the list loaded from the server and list updates visible without manual refresh.

### Story 1.1: Scaffold backend and frontend applications

As a developer,
I want the backend (Rails API + PostgreSQL) and frontend (Vite + React + TypeScript + Tailwind) scaffolded and runnable,
So that the project is ready for implementing task list and API.

**Acceptance Criteria:**

**Given** the project root (monorepo),
**When** I run the backend scaffold command (`rails new bmad-todo-api --api --database=postgresql`) and `rails db:create`,
**Then** the directory `bmad-todo-api` exists with a working Rails API and PostgreSQL config.
**And** when I run the frontend scaffold (`npm create vite@latest bmad-todo-client -- --template react-ts`) and install Tailwind (postcss, autoprefixer, tailwindcss) with content paths and directives in `src/index.css`, the directory `bmad-todo-client` exists and the dev server runs.
**And** both apps can be started independently (e.g. `rails s` and `npm run dev`).

### Story 1.2: Backend — tasks table and GET /tasks

As a user,
I want task data stored on the server and a way to fetch the list,
So that my tasks persist and can be displayed when I open the app.

**Acceptance Criteria:**

**Given** the Rails API is set up,
**When** I create a `tasks` table via Rails migration with columns: `id`, `title` (string), `completed` (boolean, default false), `created_at`, `updated_at`,
**Then** the migration runs successfully and the Task model exists with validations (e.g. title presence).
**And** when I implement GET /tasks (e.g. `TasksController#index`) returning JSON (e.g. `{ tasks: [...] }` with snake_case keys),
**Then** the endpoint returns 200 and an array of tasks (empty array when no tasks).
**And** CORS is configured to allow the frontend origin.

### Story 1.3: Frontend — home screen with task list or empty state

As a user,
I want to open the app and see my task list or an empty state with a way to add tasks,
So that I know what I have to do and can start adding tasks without manual refresh.

**Acceptance Criteria:**

**Given** the frontend app and an API base URL (e.g. env) pointing at the backend,
**When** I open the app (or refresh),
**Then** the app fetches the task list from GET /tasks on mount and shows a home screen.
**And** if there are tasks, the list is displayed with each task’s title and completion state (incomplete/complete).
**And** if there are no tasks, an empty state is shown with a “No tasks” (or “No tasks yet”) message and a visible way to add a task (e.g. Add task button or add row at top).
**And** the layout follows the UX spec: add row at top, list or empty state below; Warm Minimal + Airy spacing; single-column, max-width for readability.

---

## Epic 2: Create tasks

User can add a task (enter text and confirm) and see the new task appear in the list, persisted on the server.

### Story 2.1: Backend — POST /tasks to create a task

As a user,
I want to create a task on the server,
So that it is stored and can appear in my list.

**Acceptance Criteria:**

**Given** the tasks table and GET /tasks exist,
**When** I implement POST /tasks accepting a JSON body with `title` (snake_case),
**Then** a new task is created with the given title and `completed: false`, and the response returns 201 with the created task (snake_case keys, e.g. id, title, completed, created_at, updated_at).
**And** if title is blank or invalid, the API returns 422 (or 400) with a consistent error shape (e.g. `{ error: "..." }` or `{ errors: [...] }`).

### Story 2.2: Frontend — add-task flow and show new task in list

As a user,
I want to type task text and confirm (Enter or Add button) so that the new task appears at the top of the list without refreshing,
So that creating tasks is quick and I see the result immediately.

**Acceptance Criteria:**

**Given** the home screen shows the add row at top and task list (or empty state),
**When** I type in the add input (e.g. placeholder “Add a task…”) and submit via Enter or Add button,
**Then** the frontend sends POST /tasks with the entered title.
**And** on success, the new task appears at the top of the list without full-page refresh (refetch list or merge from response).
**And** the input is cleared and focus can remain in the input for the next task.
**And** created tasks are persisted on the server (verified by refresh or GET /tasks).

---

## Epic 3: Complete tasks

User can mark a task as complete from the list and see the completed state update, persisted on the server.

### Story 3.1: Backend — PATCH /tasks/:id to mark complete

As a user,
I want to update a task’s completion state on the server,
So that it is saved and can be shown in the list.

**Acceptance Criteria:**

**Given** tasks exist and GET /tasks works,
**When** I implement PATCH /tasks/:id accepting a JSON body (e.g. `{ completed: true }`),
**Then** the task with that id is updated and the response returns 200 with the updated task (snake_case keys).
**And** if the task is not found, the API returns 404 with a consistent error shape.

### Story 3.2: Frontend — mark task complete and show updated state

As a user,
I want to mark a task complete from the list with one action (e.g. checkbox) so that the list updates without refreshing,
So that I can track progress quickly.

**Acceptance Criteria:**

**Given** the task list is displayed with task rows,
**When** I activate the complete control (e.g. checkbox) for a task,
**Then** the frontend sends PATCH /tasks/:id with completed true (or toggled).
**And** on success, the task row shows the completed state (e.g. strikethrough, check) and the list reflects the update without full-page refresh (refetch or merge from response).
**And** completion state is persisted on the server (verified by refresh or GET /tasks).

---

## Epic 4: Delete all data

User can delete all their task data (e.g. “Delete all” or equivalent).

### Story 4.1: Backend — DELETE all tasks endpoint

As a user,
I want an endpoint to delete all my tasks,
So that I can clear my data when I choose.

**Acceptance Criteria:**

**Given** the tasks API exists,
**When** I implement a delete-all action (e.g. DELETE /tasks/destroy_all or equivalent),
**Then** all tasks are deleted and the response returns 200 (or 204) with a consistent success or empty body.
**And** GET /tasks afterward returns an empty array.

### Story 4.2: Frontend — Delete all control and confirmation

As a user,
I want a way to delete all tasks (e.g. “Delete all” in a secondary place) with a clear confirmation,
So that I can wipe my data when I want without accidental loss.

**Acceptance Criteria:**

**Given** the app shows the task list,
**When** I use the “Delete all” (or equivalent) control placed in a secondary area (e.g. settings, overflow, footer),
**Then** I am prompted to confirm (e.g. confirmation step or dialog).
**And** when I confirm, the frontend calls the delete-all endpoint and the list becomes empty (refetch or clear state).
**And** the empty state is shown after deletion.

---

## Epic 5: Accessibility and responsive experience

User can use the app with keyboard only, with a screen reader, on desktop and mobile, in supported browsers, with visual presentation meeting WCAG 2.1 Level AA.

### Story 5.1: Keyboard and focus — full keyboard operability

As a user,
I want to use the app with keyboard only for view list, add task, and mark complete,
So that I can work without a mouse (NFR-A2).

**Acceptance Criteria:**

**Given** the app is loaded,
**When** I use only the keyboard (Tab, Enter, Space, arrows as applicable),
**Then** I can reach the add input, Add button, and each task’s complete control in a logical order.
**And** I can submit the add form with Enter and toggle completion with Space (or Enter) on the control.
**And** all interactive elements have a visible focus indicator (e.g. focus ring meeting contrast).

### Story 5.2: Screen reader and semantics — labels, roles, live regions

As a user,
I want the app to work with a screen reader so that content and actions are announced correctly (NFR-A3).

**Acceptance Criteria:**

**Given** the app is loaded and a screen reader (e.g. VoiceOver, NVDA) is used,
**When** I navigate the home screen and task list,
**Then** the add input has an associated label or accessible name; buttons and the complete control have clear names.
**And** the task list uses list semantics (e.g. list/listitem or roles) and each task’s completion state is exposed (e.g. checkbox checked/unchecked).
**And** dynamic list updates (new task, completed state) are announced where appropriate (e.g. live region or equivalent).

### Story 5.3: Visual accessibility — WCAG 2.1 AA contrast and focus

As a user,
I want sufficient contrast and visible focus so that I can see and use the UI (FR21, NFR-A1).

**Acceptance Criteria:**

**Given** the Warm Minimal palette and components are in use,
**When** the UI is rendered,
**Then** text and interactive elements meet WCAG 2.1 Level AA contrast (e.g. ≥4.5:1 for normal text).
**And** focus indicators meet contrast requirements and are clearly visible.
**And** completed state (e.g. strikethrough, muted color) remains readable (not gray-on-gray).

### Story 5.4: Responsive layout — desktop and mobile viewports

As a user,
I want the app to work on desktop and mobile so that I can use it on any device (FR22, FR23, FR24).

**Acceptance Criteria:**

**Given** the app is open in a supported browser (Chrome, Firefox, Safari, Edge),
**When** I resize the viewport from desktop (e.g. 1280px) down to mobile (e.g. 320px),
**Then** the layout remains single-column with add row at top and list below; content is readable and not clipped.
**And** touch targets (e.g. checkbox, Add button, task row) are at least 44×44px where applicable.
**And** the layout is usable and readable across viewport sizes without horizontal scroll for main content.

---

## Epic 6: SPA behavior and error feedback

The app behaves as an SPA (no full-page reloads for core flows) and surfaces clear feedback when the service is unavailable.

### Story 6.1: SPA behavior — no full-page reloads for core flows

As a user,
I want the app to behave as a single page so that creating and completing tasks do not reload the whole page (FR25).

**Acceptance Criteria:**

**Given** the app is loaded,
**When** I add a task or mark a task complete,
**Then** the action is handled in the client (API call and state update) and the list updates without a full-page reload.
**And** the app uses client-side state and refetch/merge after mutations; no full-page navigation for these flows.

### Story 6.2: Error feedback — service unavailable and retry

As a user,
I want to see when the app cannot reach the server so that I know to retry or check my connection (NFR-R2, FR26).

**Acceptance Criteria:**

**Given** the app is loaded and the backend is unreachable (e.g. server down or network error),
**When** a request (load list, create, complete) fails,
**Then** the app shows a clear, user-facing message (e.g. “Service unavailable” or “Couldn’t save. Try again.”) instead of failing silently.
**And** optionally, a retry or “Try again” action is offered.
**And** the same error handling applies for create and complete (e.g. inline or banner, no modal required for MVP).
