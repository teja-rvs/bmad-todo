# bmad-todo

Monorepo: Rails API backend + Vite + React + TypeScript frontend.

## Run the full stack (Docker Compose)

From the repo root, build and start client, API, and PostgreSQL:

```bash
cp .env.example .env
# Edit .env and set SECRET_KEY_BASE (generate with: cd bmad-todo-api && rails secret)
docker compose up --build
```

API at http://localhost:3000, client at http://localhost:8080. Do not commit `.env`.

## PostgreSQL (Docker)

The API uses PostgreSQL. From the project root, start Postgres in Docker:

```bash
docker compose up -d postgres
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
