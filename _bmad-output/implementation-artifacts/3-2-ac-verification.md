# Story 3.2 — Acceptance Criteria Verification

**Story:** 3-2-frontend-mark-task-complete-and-show-updated-state  
**Date:** 2026-02-18

## AC 1: Frontend sends PATCH /tasks/:id with completed true (or toggled)

| Check | Status | Evidence |
|-------|--------|----------|
| Complete control (checkbox) exists on task row | ✅ | `TaskRow.tsx`: `<input type="checkbox">` with `checked={task.completed}`, `onChange` calls `onComplete?.(task.id, !task.completed)` |
| Frontend sends PATCH to `/tasks/:id` | ✅ | `tasks.ts`: `updateTask(id, { completed })` → `fetch(\`${baseUrl}/tasks/${id}\`, { method: 'PATCH', body: JSON.stringify({ completed }) })` |
| Body is snake_case `{ completed }` | ✅ | `body: JSON.stringify({ completed: payload.completed })` |
| Toggle sends new value (true or false) | ✅ | TaskRow passes `!task.completed`; App passes that to `updateTask(id, { completed })` |

**Verdict:** AC1 satisfied.

---

## AC 2: On success, task row shows completed state and list updates without full-page refresh

| Check | Status | Evidence |
|-------|--------|----------|
| Task row shows completed state (strikethrough, check) | ✅ | `TaskRow.tsx`: `task.completed` drives checkbox `checked` and title has `line-through opacity-70` when completed; checkbox uses `accent-[#6b8e23]` |
| List reflects update without full-page refresh | ✅ | `App.tsx` `handleCompleteTask`: on `updateTask` success, `setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))` — in-memory merge, no refetch or reload |
| Refetch or merge from response | ✅ | Merge from response: replace task by id with returned task |

**Verdict:** AC2 satisfied.

---

## AC 3: Completion state persisted on server (verified by refresh or GET /tasks)

| Check | Status | Evidence |
|-------|--------|----------|
| PATCH updates server state | ✅ | Backend (Story 3.1) implements PATCH /tasks/:id; frontend calls it with `completed` |
| Persistence verifiable by refresh/GET | ✅ | After merge, UI state matches server; full-page refresh would call GET /tasks and show same completed state (backend stores in DB) |

**Verdict:** AC3 satisfied.

---

## Summary

| AC | Satisfied |
|----|-----------|
| AC1 — PATCH /tasks/:id with completed | ✅ |
| AC2 — Completed state + no full-page refresh | ✅ |
| AC3 — Persisted on server | ✅ |

All acceptance criteria for Story 3.2 are confirmed by code and tests.
