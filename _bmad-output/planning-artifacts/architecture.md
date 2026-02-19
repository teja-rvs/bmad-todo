---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'architecture'
project_name: 'bmad-todo'
user_name: 'RVS'
date: '2026-02-17'
lastStep: 8
status: 'complete'
completedAt: '2026-02-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Task list & home:** Single home view showing list or empty state; each task has completion state; list updates in real time when tasks are added or completed (FR1–FR4).
- **Empty state:** "No tasks" message and access to add-task from empty state (FR5–FR7).
- **Task creation:** Add task via one entry point; enter text and confirm; new task appears in list in real time and is persisted on server (FR8–FR12).
- **Task completion:** Mark complete from the list in one action; list and completion state updated in real time and persisted (FR13–FR15).
- **Data control & persistence:** All task data stored on server; list loaded from server on open/refresh (FR16–FR17).
- **Accessibility & reach:** Keyboard-only and screen-reader support for core flows; WCAG 2.1 AA; usable on desktop and mobile; latest Chrome, Firefox, Safari, Edge (FR18–FR23).
- **Application behaviour:** SPA (no full-page reloads for core flows); requires network; no offline in MVP (FR24–FR25).

Architecturally this implies: a client SPA, a server API for CRUD and list, a real-time mechanism for list updates, and a single primary view with add-at-top and list (or empty state).

**Non-Functional Requirements:**
- **Performance:** User actions <200 ms (excluding network); real-time updates visible within 2 s; initial load <3 s (NFR-P1–P3).
- **Accessibility:** WCAG 2.1 AA; full keyboard operability; compatibility with at least one major screen reader (NFR-A1–A3).
- **Security:** TLS in transit; encryption and access control for stored task data (NFR-S1–S2).
- **Reliability:** 99% uptime (business hours); clear indication when service is unavailable (NFR-R1–R2).

These drive choices for real-time mechanism, client and server performance, and consistent accessibility and security implementation.

**Scale & Complexity:**
- Primary domain: Web (full-stack SPA with server-backed API and persistence).
- Complexity level: Low (single user, single list, narrow feature set).
- Architectural components: Client SPA, API layer, persistence store, real-time delivery mechanism.

### Technical Constraints & Dependencies

- **Application model:** SPA; client-side routing and API calls; no full-page reloads for task create/complete.
- **Real-time:** List must reflect create/complete without manual refresh (WebSockets, SSE, or short polling).
- **Server-backed:** All task data persisted on server; client fetches and updates via API.
- **Browser support:** Latest major versions of Chrome, Firefox, Safari, Edge (desktop and mobile).
- **No offline:** MVP assumes connected use; real-time requires network.
- **Stack guidance (PRD/UX):** Modern SPA framework; utility-first CSS (e.g. Tailwind) and accessible primitives; real-time mechanism and server support to be decided.

### Cross-Cutting Concerns Identified

- **Real-time updates:** Affects client state, API design, and server push or polling strategy.
- **Accessibility (WCAG 2.1 AA):** Affects markup, focus management, keyboard handling, and component design across the UI.
- **Responsive layout:** Single-column, mobile-first, touch targets ≥44 px; affects layout and component structure.
- **Security:** TLS and data protection affect transport and storage design.
- **Error and availability feedback:** Clear "service unavailable" and sync/error messaging affect client and API contract.

## Starter Template Evaluation

### Primary Technology Domain

**Split full-stack:** React SPA (frontend) + Ruby on Rails API (backend) + PostgreSQL (database). Frontend and backend are separate applications; deployment will be decided later.

### Technical Preferences (from user)

- **Frontend:** React
- **Backend API:** Ruby on Rails
- **Database:** PostgreSQL
- **Deployment:** Decide later

### Starter Options Considered

Because the stack is split, two starters are used:

| Layer    | Option                | Rationale |
|----------|------------------------|-----------|
| Frontend | Vite + React + TypeScript | Official, maintained scaffold; fast dev server and HMR; production build with Rollup; TypeScript by default. Tailwind is added after scaffold to match UX spec. |
| Backend  | Rails API + PostgreSQL   | Official `rails new --api --database=postgresql`; API-only mode (no views); built-in JSON support, CORS, and DB tooling; real-time can be added via Action Cable or polling. |

Alternatives considered: Create React App (no longer recommended); Rails full-stack (rejected in favour of API-only for a separate React client).

### Selected Starters

**Frontend: Vite (React + TypeScript)**

**Rationale:** Standard, well-maintained React + TypeScript setup. Aligns with PRD/UX (SPA, utility-first CSS via Tailwind added post-scaffold, accessible components to be implemented).

**Initialization command:**

```bash
npm create vite@latest bmad-todo-client -- --template react-ts
cd bmad-todo-client
npm install
```

**Post-scaffold step (Tailwind, per UX spec):**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then configure Tailwind `content` paths (e.g. `./index.html`, `./src/**/*.{js,ts,jsx,tsx}`) and add Tailwind directives to `src/index.css`. This should be part of the first frontend implementation story.

**Backend: Rails API + PostgreSQL**

**Rationale:** Matches chosen backend (Rails) and database (PostgreSQL). API-only mode keeps the backend focused on JSON API and persistence; real-time (Action Cable or polling) can be added in a later decision.

**Initialization command:**

```bash
rails new bmad-todo-api --api --database=postgresql
cd bmad-todo-api
rails db:create
rails db:migrate
```

(Use a single repo with `bmad-todo-client` and `bmad-todo-api` as sibling folders, or two repos, depending on later repo-structure decision.)

### Architectural Decisions Provided by Starters

**Frontend (Vite + React + TypeScript)**

| Area                  | Decision |
|-----------------------|----------|
| Language & runtime    | TypeScript, ES modules, Node/npm (or pnpm/yarn) |
| Build & dev           | Vite (dev server, HMR; production: Rollup) |
| Styling               | Not included; add Tailwind (utility-first) per UX spec |
| Testing               | Not included; add Vitest (or other) in implementation |
| Code organization    | `src/` with typical React structure (e.g. `App.tsx`, `main.tsx`); component and API layering to be defined in implementation |

**Backend (Rails API + PostgreSQL)**

| Area                  | Decision |
|-----------------------|----------|
| Language & runtime    | Ruby, Rails API mode |
| Database              | PostgreSQL (config in `config/database.yml`) |
| API                   | REST/JSON; controllers and routes to be defined |
| Real-time             | Not in default scaffold; add Action Cable (WebSockets) or polling/SSE in a later architectural decision |
| Code organization    | Standard Rails (models, controllers, routes); API versioning and structure to be defined in implementation |

**Note:** Running these initialization commands (and adding Tailwind on the frontend) should be the first implementation steps for the respective apps.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data model (tasks table, Rails migrations)
- API contract (REST JSON, fetch-on-demand, no real-time channel)
- Security (no auth for MVP, CORS, HTTPS)
- Frontend data flow (fetch from backend as per requirements; update UI after each mutation)

**Important Decisions (Shape Architecture):**
- No real-time mechanism: fetch data from backend when needed (load on open, refetch or use response after create/complete)
- Component and state approach (React state only, fetch API)

**Deferred Decisions (Post-MVP):**
- Authentication and multi-user (post-MVP)
- Deployment, CI/CD, monitoring (decide later)
- Caching (if needed later)

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | PostgreSQL (from starter) | Chosen in step 3; Rails `config/database.yml` |
| Data model | Single `tasks` table: `id`, `title`, `completed`, `created_at`, `updated_at` | Matches MVP scope; no user/tenant column for single-user |
| Validation | Rails model validations (e.g. title presence, length) | Keeps invalid data out of persistence |
| Migrations | Rails migrations | Standard Rails approach |
| Caching | None for MVP | Single user, small list; can add later if needed |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Authentication | None for MVP | Single user, personal use per PRD; no login |
| Authorization | N/A | No multi-user |
| TLS | HTTPS in production | Per NFR-S1 |
| API security | CORS restricted to frontend origin(s) | Only the SPA can call the API |
| Data at rest | Rails/PostgreSQL and host defaults | Per NFR-S2; encryption at rest via platform |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API style | REST, JSON | Fits Rails and React fetch; simple CRUD |
| Real-time / list updates | **No real-time channel.** Fetch data from backend as per requirements. | Client loads task list on open/refresh; after create or complete, refetch list or use API response to update UI. No polling, SSE, or WebSockets for MVP. Meets PRD (no manual refresh; updates visible after mutation). |
| Error handling | Consistent JSON error responses and HTTP status codes | Predictable client handling |
| Rate limiting | None for MVP | Single user |

**API usage pattern:** GET list on load; POST create task then refetch list or append from response; PATCH complete then refetch list or update from response; surface errors (e.g. network/server) in UI.

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | React only (`useState`, `useEffect`) | No Redux for MVP; list and UI state in component tree |
| Components | Add row, task list, task row, empty state; optional Delete all (secondary) | Per UX spec |
| Routing | Single view for MVP | No router required unless added for future |
| API client | `fetch` | No extra library; sufficient for REST |
| Accessibility | Semantic HTML, ARIA where needed, keyboard, focus (WCAG 2.1 AA) | Per NFR and UX spec |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Containerization | **Docker** | Consistent dev/prod parity; single-command run for client, API, and PostgreSQL; easier onboarding. |
| Local orchestration | **Docker Compose** | Run frontend, backend, and database with `docker compose up`; base compose at repo root; override files per environment. |
| Environments | **Dev/test via env vars + compose files** | Use env variables (e.g. `.env`, `.env.dev`, `.env.test`) and separate compose files (`docker-compose.yml` base, `docker-compose.dev.yml`, `docker-compose.test.yml`) so dev and test run with correct DB, ports, and API URLs without code changes. |
| Health checks | **Required for all services** | Define `healthcheck` in Compose (and optionally in Dockerfile) for API and db; client may use HTTP check on dev server or omit if not critical. Enables dependency ordering and restart policies. |
| Container security | **No root user** | All images MUST run as non-root user. Create a dedicated user in Dockerfile (e.g. `app` or `node`/`rails`) and `USER` that user; fix ownership of app dirs as needed. No running as root in production or dev. |
| Image build | **Multistage builds only** | Frontend and backend Dockerfiles MUST use multistage builds: build stage for dependencies and compile/assets, final stage for runtime only. No single-stage "everything in one image" for app services. |
| Hosting / CI/CD / env / monitoring | Deferred | User: decide later |

### Decision Impact Analysis

**Implementation sequence:**
1. Scaffold backend (Rails API + PostgreSQL), create `tasks` table and migrations.
2. Implement REST endpoints (index, create, update for complete); CORS for frontend origin.
3. Scaffold frontend (Vite + React + TypeScript), add Tailwind.
4. Implement UI: load tasks on mount (GET), create task (POST then update list), mark complete (PATCH then update list), empty state.
5. Wire errors and connectivity feedback (e.g. "service unavailable").
6. Accessibility pass (keyboard, focus, semantics, contrast).
7. **Docker:** Add multistage, non-root `Dockerfile` to `bmad-todo-client` and `bmad-todo-api`; add root `docker-compose.yml` (base), `docker-compose.dev.yml`, `docker-compose.test.yml`, and `.env.example`. Define health checks for API and db; use env vars for dev/test. Ensure frontend env in Docker points at API service URL.

**Cross-component dependencies:**
- Frontend depends on API contract (REST, JSON shape, error format); backend does not depend on frontend.
- No shared real-time layer; client is source of truth for UI state; server is source of truth for persisted tasks.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical conflict points addressed:** Naming (database, API, code), structure (backend/frontend), API response and error formats, loading and error handling so multiple AI agents produce compatible code.

### Naming Patterns

**Database (Rails / PostgreSQL):**
- **Tables:** plural, snake_case — e.g. `tasks`.
- **Columns:** snake_case — e.g. `id`, `title`, `completed`, `created_at`, `updated_at`.
- **Indexes:** `index_<table>_on_<column(s)>` or Rails default.
- **No** camelCase in the database.

**API (Rails controllers, JSON):**
- **Resource routes:** Plural — `GET /tasks`, `POST /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id`, `DELETE /tasks/:id`.
- **Route params:** `:id` (Rails style).
- **JSON keys:** **snake_case** in request and response bodies (Rails convention; frontend may transform to camelCase if desired).
- **Query params:** snake_case — e.g. no `userId`.

**Frontend (React / TypeScript):**
- **Components:** PascalCase — e.g. `TaskList`, `TaskRow`, `AddRow`, `EmptyState`.
- **Component files:** PascalCase to match component — e.g. `TaskList.tsx`, `AddRow.tsx`.
- **Hooks / utilities:** camelCase — e.g. `useTasks`, `fetchTasks`.
- **Variables and props:** camelCase — e.g. `taskList`, `isLoading`, `onComplete`.
- **Constants:** UPPER_SNAKE or camelCase by usage (e.g. API base URL constant).

### Structure Patterns

**Backend (Rails API):**
- **Models:** `app/models/task.rb` (singular).
- **Controllers:** `app/controllers/api/v1/tasks_controller.rb` or `app/controllers/tasks_controller.rb`; namespace to match route (e.g. `Api::V1::TasksController` if using `/api/v1/tasks`).
- **Routes:** Define in `config/routes.rb`; use `resources :tasks` (or equivalent) for REST.
- **Serialization:** Rails serializers, Jbuilder, or `render json:` with explicit hash; keep key format consistent (snake_case).
- **Tests:** `spec/` (RSpec) or `test/` (minitest) mirroring `app/` (e.g. `spec/models/task_spec.rb`, `spec/requests/tasks_spec.rb`).

**Frontend (Vite + React):**
- **Components:** `src/components/` — e.g. `AddRow.tsx`, `TaskList.tsx`, `TaskRow.tsx`, `EmptyState.tsx`.
- **API layer:** `src/api/` or `src/services/` — e.g. `tasks.ts` with `fetchTasks`, `createTask`, `updateTask`.
- **Types:** `src/types/` — e.g. `task.ts` with `Task` interface matching API response (document whether keys are snake_case or camelCase after transform).
- **Hooks (if any):** `src/hooks/` — e.g. `useTasks.ts`.
- **Tests:** Co-located `*.test.tsx` / `*.spec.tsx` next to components, or `src/__tests__/`; same for API tests.
- **Config:** Env via `import.meta.env`; one place for API base URL (e.g. `src/api/client.ts` or config constant).

### Format Patterns

**API response formats:**
- **Success — list:** `200` with JSON array or `{ tasks: [...] }`. Use one shape consistently (e.g. always `{ tasks: [...] }` with snake_case keys).
- **Success — single task (create/update):** `201` or `200` with one task object (snake_case keys).
- **Error:** Consistent structure, e.g. `{ error: "message" }` or `{ errors: ["message1", "message2"] }`; use same key(s) across endpoints. HTTP status: 4xx/5xx as appropriate (400 validation, 404 not found, 500 server error).
- **No** mixed wrappers (e.g. don’t use `data` for one endpoint and raw body for another without documenting).

**Data exchange:**
- **Dates:** ISO 8601 strings in JSON — e.g. `created_at: "2026-02-17T12:00:00Z"`.
- **Booleans:** `true` / `false` in JSON (not 1/0).
- **Null:** Use `null` for absent optional fields; avoid omitting required fields.

**Frontend ↔ API:**
- If API uses snake_case, frontend either (a) uses snake_case in types and UI, or (b) transforms to camelCase in one place (e.g. API layer). Document the choice in types and API module.

### Communication Patterns

**State (React):**
- **Updates:** Immutable updates only (e.g. new array for list after fetch or after create/complete); no in-place mutation of state.
- **After mutation:** Refetch list or merge API response into state in one predictable way (e.g. always refetch, or always append/update from response).
- **No** global event bus or cross-tab events for MVP.

**No real-time channel:** No WebSockets, SSE, or polling; all updates driven by fetch after user actions.

### Process Patterns

**Error handling:**
- **Backend:** Return consistent error JSON and HTTP status; log server errors; do not expose stack traces in response.
- **Frontend:** One place to handle API errors (e.g. in API layer or a small wrapper); surface user-facing message (e.g. "Couldn't save. Try again.") and optional retry; match NFR-R2 for "service unavailable".
- **Validation errors:** Show inline or next to form/field when API returns 400/422 with error messages.

**Loading states:**
- **Naming:** e.g. `isLoading` (list), `isSubmitting` (create/update); consistent prefix `is` for booleans.
- **Scope:** Local to the list or to the action (e.g. disable Add button while submitting); no global loading overlay required for MVP unless chosen.
- **UI:** Per UX spec — optional subtle indicator; avoid blocking the whole UI.

### Docker Patterns

**All Docker setup MUST follow:**

- **Multistage builds:** Every app Dockerfile (client and API) MUST use at least two stages: (1) build stage — install deps, compile/build assets; (2) final stage — minimal runtime image, copy only what’s needed to run. No single-stage image that includes build tools at runtime.
- **Non-root user:** Final stage MUST define a non-root user (e.g. `RUN adduser --disabled-password app` or image-provided user) and set `USER` to that user. Ensure app directories (e.g. app code, tmp) are writable by that user; do not run as root.
- **Health checks:** In `docker-compose.yml`, define `healthcheck` for the API service (e.g. `curl -f http://localhost:3000/up` or Rails health route) and for the `db` service (e.g. `pg_isready`). Use these for `depends_on: condition: service_healthy` so API starts after DB is ready. Client health check optional for dev.
- **Dev/test via env and compose:** Use env variables for environment-specific config (e.g. `RAILS_ENV`, `DATABASE_URL`, `VITE_API_URL`). Provide a base `docker-compose.yml` and override files: `docker-compose.dev.yml` (dev defaults, optional volume mounts), `docker-compose.test.yml` (test DB, test env vars). Run with e.g. `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`. Document in README which env vars are required and how to use each compose file.

**Avoid:** Running containers as root; single-stage Dockerfiles that include compilers/tooling in the final image; hardcoding dev/test differences in code instead of env/compose; skipping health checks for API and db.

### Framework Conventions

**All AI agents MUST follow framework-native practices:**

- **Follow standard practices of the framework** — Use idioms, project layout, and conventions of React (and Vite) on the frontend and of Ruby on Rails on the backend. Do not introduce patterns that conflict with official or widely adopted framework guidance.
- **Follow design principles of the framework** — Align with each framework’s intended design (e.g. Rails “convention over configuration”, React composition and one-way data flow). Structure and style should feel native to the framework.
- **Use framework commands / generators to create files** — Prefer official CLI or generators over hand-rolled scaffolding. Examples: Rails use `rails generate model Task`, `rails generate controller Tasks` (or `rails g migration`, etc.); frontend use `npm create vite@latest` for app scaffold and framework-recommended commands for adding dependencies or config. Only create files manually when no generator exists for that artifact.

### Enforcement Guidelines

**All AI agents MUST:**
- Follow standard practices, design principles, and framework commands/generators as above.
- Use the naming conventions above (DB snake_case, API snake_case, React PascalCase/camelCase as specified).
- Use the same API response and error shape across all endpoints and the frontend API layer.
- Refetch or update list from API response after create/complete; do not add a real-time channel for MVP.
- Use immutable state updates in React and a single, documented strategy for merging API responses into state.
- For Docker: use multistage builds only, run as non-root, define health checks for API and db, and support dev/test via env variables and compose override files (no root user, no single-stage app images).

**Pattern verification:** Code review and/or small checklist (naming, response format, error format, no real-time). Document any exception in the architecture doc or ADR.

### Pattern Examples

**Good:**
- Backend: Use `rails g model Task title:string completed:boolean` (or migration generator); `rails g controller Tasks` (or resource generator); `Task` model and `TasksController` with `index`, `create`, `update`; JSON with snake_case. Follow Rails conventions (e.g. strong params, RESTful routes).
- Frontend: Use Vite/React project created via `npm create vite@latest`; add Tailwind via framework-recommended install; `fetchTasks()` returns `Task[]`; after `createTask(title)`, call `fetchTasks()` and set state, or append response; same for `updateTask(id, { completed: true })`. Follow React composition and one-way data flow.
- Error: Backend `render json: { error: "Title can't be blank" }, status: :unprocessable_entity`; frontend reads `error` or `errors` and shows one message.

**Avoid:**
- Creating models, controllers, or migrations by hand when Rails generators exist; or scaffolding the frontend app manually instead of using the Vite/React template.
- Mixing camelCase and snake_case in the same layer without a single transform point.
- Different error shapes per endpoint (e.g. `message` vs `error` vs `errors`).
- Real-time or polling for MVP.
- Mutating React state in place (e.g. `tasks.push(newTask)`).
- Exposing stack traces or internal details in API error responses.
- Introducing patterns that conflict with Rails or React standard practices and design principles.
- Docker: running containers as root; single-stage Dockerfiles for app services; omitting health checks for API and db; hardcoding dev/test config instead of using env and compose overrides.

## Project Structure & Boundaries

### Repository Layout

Two applications; one repo with sibling directories (or two repos). Root shown as monorepo-style for reference.

```
bmad-todo/
├── bmad-todo-client/          # Vite + React + TypeScript frontend
├── bmad-todo-api/              # Rails API backend
├── docker-compose.yml          # Base: client, API, PostgreSQL (shared definitions)
├── docker-compose.dev.yml      # Dev overrides (env, ports, volumes)
├── docker-compose.test.yml     # Test overrides (env, isolated DB, etc.)
├── .env.example                # Example env vars for dev/test (no secrets)
├── .dockerignore               # Exclude _bmad-output, node_modules, .git, etc.
├── _bmad-output/               # Planning artifacts (PRD, UX, architecture)
└── README.md                   # How to run client and API (native and Docker)
```

### Frontend: bmad-todo-client (Complete Project Tree)

```
bmad-todo-client/
├── README.md
├── package.json
├── package-lock.json
├── Dockerfile                  # Multistage, non-root: build stage, then minimal runtime (e.g. nginx)
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── .env.example                # VITE_API_URL=http://localhost:3000
├── .gitignore
├── index.html
├── public/
│   └── vite.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css               # Tailwind directives
    ├── types/
    │   └── task.ts             # Task interface (match API shape)
    ├── api/
    │   └── tasks.ts            # fetchTasks, createTask, updateTask
    ├── components/
    │   ├── AddRow.tsx
    │   ├── TaskList.tsx
    │   ├── TaskRow.tsx
    │   └── EmptyState.tsx
    └── __tests__/              # or *.test.tsx co-located
        ├── AddRow.test.tsx
        ├── TaskList.test.tsx
        └── TaskRow.test.tsx
```

### Backend: bmad-todo-api (Complete Project Tree)

```
bmad-todo-api/
├── README.md
├── Gemfile
├── Gemfile.lock
├── Dockerfile                  # Multistage, non-root: build stage (bundle, assets if any), final stage (rails s)
├── Rakefile
├── config.ru
├── .gitignore
├── config/
│   ├── application.rb
│   ├── environment.rb
│   ├── database.yml            # PostgreSQL
│   ├── routes.rb               # resources :tasks, etc.
│   ├── cors.rb                 # Allow frontend origin
│   └── ...
├── db/
│   ├── schema.rb
│   ├── seeds.rb
│   └── migrate/
│       └── YYYYMMDDHHMMSS_create_tasks.rb
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb
│   │   └── tasks_controller.rb
│   ├── models/
│   │   ├── application_record.rb
│   │   └── task.rb
│   └── ...
├── spec/                       # or test/ for minitest
│   ├── rails_helper.rb
│   ├── spec_helper.rb
│   ├── models/
│   │   └── task_spec.rb
│   └── requests/
│       └── tasks_spec.rb
└── ...
```

### Architectural Boundaries

**API boundaries:**
- **External (frontend → backend):** REST JSON over HTTPS. Endpoints: `GET /tasks`, `POST /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id`. CORS allows only frontend origin(s).
- **Internal (backend):** Controllers → models → database; no internal service layer required for MVP. Single data boundary: PostgreSQL via ActiveRecord.

**Component boundaries:**
- **Frontend:** `App` owns list state (or a small container); `AddRow`, `TaskList`, `TaskRow`, `EmptyState` are presentational/controlled. API layer (`api/tasks.ts`) is the only place that calls the backend; components do not use `fetch` directly.
- **Backend:** `TasksController` handles HTTP; `Task` model handles validation and persistence. No cross-service calls.

**Data boundaries:**
- **Database:** Single `tasks` table; Rails migrations; no cross-DB or caching for MVP.
- **Client state:** Task list and loading/error state live in React state; server is source of truth; client refetches or merges response after mutations.

### Requirements to Structure Mapping

| Requirement area | Frontend location | Backend location |
|------------------|-------------------|------------------|
| Task list (FR1–FR4) | `App.tsx` state; `TaskList.tsx`, `TaskRow.tsx`; `api/tasks.ts` (GET) | `TasksController#index`; `Task` model |
| Empty state (FR5–FR7) | `EmptyState.tsx`; conditional in `App` or `TaskList` | — |
| Task creation (FR8–FR12) | `AddRow.tsx`; `api/tasks.ts` (POST); then refetch/merge | `TasksController#create`; `Task` model |
| Task completion (FR13–FR15) | `TaskRow.tsx`; `api/tasks.ts` (PATCH); then refetch/merge | `TasksController#update`; `Task` model |
| Load on open (FR17) | `App.tsx` useEffect → `fetchTasks()` on mount | `TasksController#index` |
| Accessibility (FR18–FR20) | All components (semantics, focus, keyboard, ARIA) | — |
| Errors / unavailable (NFR-R2) | `api/tasks.ts` + UI message/banner in `App` or layout | Controller error responses; logging |

### Integration Points

**Internal (frontend):** `App` (or main view) → `AddRow` + `TaskList` → `TaskRow` / `EmptyState`. Data flows down via props; callbacks (onCreate, onComplete) trigger API calls and then state update (refetch or merge).

**Internal (backend):** Request → `TasksController` → `Task` → PostgreSQL. Response is JSON (snake_case).

**Frontend ↔ backend:** Only via `api/tasks.ts` and Rails routes. No shared code; contract is REST + JSON shape + error format (documented in Implementation Patterns).

**External:** None for MVP (no auth provider, no third-party APIs).

### File Organization Patterns

- **Configuration:** Frontend: `vite.config.ts`, `tailwind.config.js`, `tsconfig.*`, `.env.example`. Backend: `config/` (database, routes, CORS).
- **Docker:** Repo root: base `docker-compose.yml`, override files `docker-compose.dev.yml` and `docker-compose.test.yml`; `.env.example` for env var documentation; root `.dockerignore`. Each app: multistage `Dockerfile` in `bmad-todo-client/` and `bmad-todo-api/`, both running as non-root. Compose defines health checks for API and db; use env vars for dev/test (e.g. `VITE_API_URL`, `RAILS_ENV`, `DATABASE_URL`). Frontend API URL in Docker must target the API service (e.g. via env).
- **Source:** Frontend: `src/` by role (components, api, types). Backend: `app/` by Rails convention (controllers, models).
- **Tests:** Frontend: `src/__tests__/` or co-located `*.test.tsx`. Backend: `spec/` (or `test/`) mirroring `app/`.
- **Assets:** Frontend: `public/` for static; Tailwind for styling. Backend: no asset pipeline for API-only.

### Development Workflow

- **Native (no Docker):** Frontend: `npm run dev` (Vite); set `VITE_API_URL` to backend (e.g. `http://localhost:3000`). Backend: `rails s` (default port 3000); run `rails db:create db:migrate` before first run.
- **Docker:** From repo root, use env + compose overrides: e.g. `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` for dev; `docker compose -f docker-compose.yml -f docker-compose.test.yml up` (or run tests in CI) for test. Compose defines services for `bmad-todo-client`, `bmad-todo-api`, and `db`, with health checks on API and db and `depends_on: condition: service_healthy` where appropriate. Set `VITE_API_URL`, `RAILS_ENV`, `DATABASE_URL`, etc. via `.env` or override file. All images use multistage builds and run as non-root.
- **Build:** Frontend: `npm run build` → output to `dist/`. Backend: no front-end build; deployment of API only (deployment TBD). Docker images build from per-app Dockerfiles when using Docker.

## Architecture Validation Results

### Coherence Validation ✅

**Decision compatibility:** Technology choices are consistent: Vite + React + TypeScript (frontend), Rails API + PostgreSQL (backend), fetch-on-demand (no real-time). Stack fits PRD/UX (SPA, server-backed list, WCAG 2.1 AA). No conflicting versions or patterns.

**Pattern consistency:** Naming (DB snake_case, API snake_case, React PascalCase/camelCase), structure (Rails app/, frontend src/components|api|types), and communication (immutable state, refetch/merge after mutation) align with the chosen stack and with each other.

**Structure alignment:** Project trees for `bmad-todo-client` and `bmad-todo-api` match the stack; API and component boundaries are clear; requirements are mapped to specific files and directories.

### Requirements Coverage Validation ✅

**Functional requirements coverage:** All FR categories are covered: task list & home (TaskList, TaskRow, GET /tasks), empty state (EmptyState), task creation (AddRow, POST /tasks, refetch/merge), task completion (TaskRow, PATCH /tasks/:id), load on open (useEffect + fetchTasks), data control & persistence (server storage, CORS), accessibility (components + semantics), application behaviour (SPA, fetch-only). No FR is without an architectural home.

**Non-functional requirements coverage:** Performance (NFR-P1–P3): client and server are simple; refetch-after-mutation meets “no manual refresh” and responsiveness targets. Security (NFR-S1–S2): TLS, CORS, encryption at rest noted. Reliability (NFR-R2): error handling and “service unavailable” messaging specified. Accessibility (NFR-A1–A3): WCAG 2.1 AA and patterns documented. No NFR is unaddressed.

### Implementation Readiness Validation ✅

**Decision completeness:** Critical decisions are documented (data model, API contract, no real-time, security, frontend state). Versions are implied by starters (Vite, Rails, PostgreSQL). Patterns and examples are sufficient for a small MVP.

**Structure completeness:** Directory trees for client and API are concrete (files and folders named). Integration points (api/tasks.ts ↔ Rails routes) and component boundaries (App, AddRow, TaskList, TaskRow, EmptyState) are defined.

**Pattern completeness:** Naming, structure, API formats, error handling, and loading state are specified. Potential conflict areas (snake_case vs camelCase, response shape, immutable updates) are covered. No blocking gaps for MVP.

### Gap Analysis Results

**Critical gaps:** None. Implementation can proceed.

**Important gaps (non-blocking):** (1) Optional: API base URL config (e.g. single constant or env) is mentioned but could be one explicit line in patterns. (2) Optional: Vitest (or test runner) not in starter; add in first frontend story if desired.

**Nice-to-have:** Deployment, CI/CD, and monitoring deferred by choice. Real-time can be added later if needed.

### Validation Issues Addressed

No critical or important issues found. Optional gaps are minor and can be resolved during implementation.

### Architecture Completeness Checklist

**✅ Requirements analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural decisions**

- [x] Critical decisions documented
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Data flow and API contract clear

**✅ Implementation patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication and process patterns specified
- [x] Examples and anti-patterns documented

**✅ Project structure**

- [x] Complete directory structure defined
- [x] Component and API boundaries established
- [x] Requirements to structure mapping complete
- [x] Integration points and dev workflow described

### Architecture Readiness Assessment

**Overall status:** READY FOR IMPLEMENTATION

**Confidence level:** High — scope is small, stack is standard, decisions and patterns are consistent and sufficient for AI agents to implement without ambiguity.

**Key strengths:** Clear split (React SPA + Rails API); single source of truth (server); simple data flow (fetch, refetch/merge); no real-time reduces complexity; naming and formats are specified; FR/NFR coverage is complete.

**Areas for future enhancement:** Deployment and CI/CD when decided; optional test runner and API base URL convention; real-time or caching if requirements change.

### Implementation Handoff

**AI agent guidelines:**

- Follow all architectural decisions and implementation patterns in this document.
- Use the documented naming, API response format, and error format consistently.
- Respect project structure and boundaries (api/tasks.ts as sole backend caller; Rails controllers and Task model).
- Refetch or merge from API after create/complete; no real-time channel for MVP.

**First implementation priority:**

1. **Backend:** `rails new bmad-todo-api --api --database=postgresql` → `cd bmad-todo-api` → `rails db:create` → create `tasks` migration → `rails db:migrate` → implement `TasksController` (index, create, update) and CORS.
2. **Frontend:** `npm create vite@latest bmad-todo-client -- --template react-ts` → `cd bmad-todo-client` → `npm install` → add Tailwind → implement `src/api/tasks.ts`, `src/types/task.ts`, and components (AddRow, TaskList, TaskRow, EmptyState) in `App.tsx` with fetch-on-load and refetch/merge after mutations.
3. **Docker:** Add multistage, non-root `Dockerfile` in each app; add repo-root base `docker-compose.yml` plus `docker-compose.dev.yml` and `docker-compose.test.yml`; `.env.example` for required env vars. Define health checks for API and db; run containers as non-root. Use env vars (e.g. `VITE_API_URL` pointing at API service) when running in Compose.
