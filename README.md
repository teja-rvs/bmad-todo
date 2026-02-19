# bmad-todo

Monorepo: Rails API backend + Vite + React + TypeScript frontend.

## Run the full stack (Docker Compose)

From the repo root, use the **base** compose plus an override file:

**Development (recommended):**

```bash
cp .env.example .env
# Edit .env and set SECRET_KEY_BASE (generate with: cd bmad-todo-api && rails secret)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- API at http://localhost:3000, client at http://localhost:8080.
- Dev override sets `RAILS_ENV=development`, dev database, and `VITE_API_URL` so the client in Docker can call the API.
- Do not commit `.env`.

**Running API tests in Docker:**

```bash
# Create and migrate test DB (first time or after schema changes)
docker compose -f docker-compose.yml -f docker-compose.test.yml run api rails db:create db:migrate RAILS_ENV=test

# Run API test suite
docker compose -f docker-compose.yml -f docker-compose.test.yml run api bin/rails test
```

The test override sets `RAILS_ENV=test` and a separate test database (`bmad_todo_api_test`).

**Required env vars:** See `.env.example`. Copy it to `.env` and set at least `SECRET_KEY_BASE` for production-like runs. Options: `VITE_API_URL`, `DATABASE_URL`, `RAILS_ENV` (overrides in compose files set these for dev/test). **`CORS_ORIGIN`** — Allowed origin for API CORS (default `http://localhost:8080`). Set this when the frontend is served from a different URL (e.g. `http://localhost:5173` for Vite dev, or your production client URL).

## PostgreSQL (Docker)

The API uses PostgreSQL. From the project root, start the database service (when using base compose only):

```bash
docker compose up -d db
```

Default connection (used by Rails): host `localhost`, port `5432`, user `bmad_todo_api`, password `bmad_todo_api`. Override with `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` if needed.

## Run the API (backend)

```bash
cd bmad-todo-api
rails db:create   # first time only (requires Postgres running)
rails db:migrate  # first time only
rails s
```

Server runs at **http://localhost:3000** (default).

## Run the client (frontend)

```bash
cd bmad-todo-client
npm install   # first time only
npm run dev
```

Vite dev server runs at **http://localhost:5173** (default).

## Layout

- `bmad-todo-api/` — Rails API (PostgreSQL)
- `bmad-todo-client/` — Vite + React + TypeScript + Tailwind (Tailwind v4 via `@tailwindcss/vite`; content auto-detected)
- `_bmad-output/` — planning and implementation artifacts
