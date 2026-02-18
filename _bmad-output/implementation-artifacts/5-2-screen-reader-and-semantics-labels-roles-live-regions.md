# Story 5.2: Screen reader and semantics — labels, roles, live regions

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the app to work with a screen reader so that content and actions are announced correctly (NFR-A3),
so that I can use the app with assistive technology.

## Acceptance Criteria

1. **Given** the app is loaded and a screen reader (e.g. VoiceOver, NVDA) is used, **when** I navigate the home screen and task list, **then** the add input has an associated label or accessible name; buttons and the complete control have clear names.
2. **And** the task list uses list semantics (e.g. list/listitem or roles) and each task's completion state is exposed (e.g. checkbox checked/unchecked).
3. **And** dynamic list updates (new task, completed state) are announced where appropriate (e.g. live region or equivalent).

## Tasks / Subtasks

- [x] **Ensure add input and controls have accessible names** (AC: #1)
  - [x] Add input: associated `<label>`, `aria-label`, or `aria-labelledby`; ensure placeholder is not the only name (placeholder can supplement).
  - [x] Add button: visible text "Add" or equivalent and/or `aria-label` so screen reader announces purpose.
  - [x] Task complete control: native checkbox has associated label (task title); or `aria-label`/`aria-labelledby` so "checked/unchecked" and task identity are announced.
- [x] **Task list and items use list semantics** (AC: #2)
  - [x] Container: `<ul>`/`<ol>` or `role="list"`; items: `<li>` or `role="listitem"`.
  - [x] Each task row exposes checkbox state (checked/unchecked) and task title to screen reader.
- [x] **Announce dynamic updates** (AC: #3)
  - [x] When a new task is added: announce (e.g. live region) so user hears that a task was added (e.g. "Task added" or task title).
  - [x] When a task is marked complete (or incomplete): announce so user hears completion state change (e.g. "Task marked complete" or equivalent).
  - [x] Use `aria-live="polite"` (or `role="status"`) for non-urgent updates; avoid assertive unless critical.

## Dev Notes

- **Frontend only.** No backend or API changes. [Source: _bmad-output/planning-artifacts/epics.md, architecture.md]
- **NFR-A3:** Core content and controls compatible with at least one major screen reader (NVDA, JAWS, or VoiceOver) for supported platforms. [Source: _bmad-output/planning-artifacts/epics.md]
- **UX spec:** Label/placeholder for add input; list/list item structure; button and checkbox roles/labels; optional live region for dynamic list updates. [Source: _bmad-output/planning-artifacts/ux-design-specification.md]
- **Story 5.1:** AddRow already has aria-label on input and button; TaskRow uses native `<input type="checkbox">` with label. Build on those; this story adds/verifies semantics and live regions. [Source: 5-1-keyboard-and-focus-full-keyboard-operability.md]

### Project Structure Notes

- **Frontend:** Work in `bmad-todo-client/`. Components: `AddRow.tsx`, `TaskRow.tsx`, `TaskList.tsx`, `EmptyState.tsx`, `App.tsx`. [Source: _bmad-output/planning-artifacts/architecture.md]
- **Backend:** No changes in `bmad-todo-api/` for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 5.2 acceptance criteria, Epic 5 (accessibility and responsive experience).
- [Source: _bmad-output/planning-artifacts/architecture.md] — Frontend structure, accessibility (semantics, WCAG 2.1 AA).
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Semantics, labels, list structure, live region for list updates.

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **Accessible names (AC #1):**
  - Add input: Use a visible `<label>` with `htmlFor` pointing to input `id`, or `aria-label` / `aria-labelledby`. Do not rely on placeholder alone for accessible name (placeholder can supplement). Example: "Add a task" or "New task title".
  - Add button: Visible text "Add" is sufficient; if icon-only, add `aria-label="Add task"` (or equivalent). Ensure button role is implicit (`<button>`).
  - Task row: Native `<input type="checkbox">` with associated `<label>` that contains or references task title so screen reader announces e.g. "Task title, checkbox, unchecked/checked". Label can wrap checkbox + text or use `htmlFor` + `id`. Ensure completion state (checked/unchecked) is exposed (native checkbox does this).
- **List semantics (AC #2):**
  - Task list container: Use `<ul>` (unordered list) or `<ol>` with `role="list"` only if list role is overridden elsewhere (e.g. some browsers strip list semantics in certain contexts; then `role="list"` and `role="listitem"` on children restore it). Prefer native `<ul>`/`<li>`.
  - Each task row: `<li>` wrapping the checkbox + label (or div with `role="listitem"` if necessary). Ensure no redundant or conflicting roles on the checkbox (native `checkbox` role is correct).
- **Dynamic announcements (AC #3):**
  - When a new task appears after create: Add a live region (e.g. a visually hidden element with `aria-live="polite"` and `aria-atomic="true"`) and set its text content when the list updates (e.g. "Task added" or the new task title). Use `role="status"` as shorthand for polite live region if preferred. Place the live region in a consistent location (e.g. near the list or after add row); do not move focus for this announcement.
  - When a task is marked complete or incomplete: Update the same or a dedicated live region (e.g. "Task marked complete" or "Task marked incomplete"). Polite is appropriate so the user is not interrupted mid-sentence.
  - Ensure the live region exists in the DOM before content changes (so AT can register it). Optionally use `aria-relevant="additions text"` and avoid announcing on every minor DOM change; keep announcements concise.

#### Architecture compliance

- **Naming:** No API changes. Components and props remain camelCase. No new public API surface; only markup and ARIA attributes.
- **Structure:** Only `src/api/tasks.ts` calls the backend; this story does not add or change API calls. Changes are limited to `bmad-todo-client` components and markup/ARIA.
- **State:** No change to React state shape; semantics and live regions are presentational and accessibility-only.

#### Library / framework requirements

- **React:** Use standard JSX; no new dependencies. Use a ref or state to update live region text when list or completion state changes (e.g. in the same render cycle after state update, or in a useEffect that runs after list/task updates).
- **Tailwind:** Use `sr-only` (or equivalent visually-hidden utility) for the live region so it is not visible but remains in the accessibility tree. Ensure it is not `aria-hidden="true"`.
- **HTML/ARIA:** Prefer semantic HTML (`<ul>`, `<li>`, `<label>`, `<button>`). Add ARIA only where needed (live region, optional aria-label if no visible label). Do not add redundant roles to native elements.

#### File structure requirements

- **Modify (as needed):**
  - `bmad-todo-client/src/components/AddRow.tsx` — Ensure add input has proper label/accessible name (visible label or aria-label); Add button has clear accessible name. AddRow already has aria-label per 5.1; verify and extend if needed (e.g. visible label for input).
  - `bmad-todo-client/src/components/TaskList.tsx` — Use `<ul>` (or list role) and ensure each child is `<li>` (or listitem). Add a live region (e.g. div with `aria-live="polite"`, `aria-atomic="true"`, class `sr-only`) and pass a callback or prop to update announcement text when list or completion state changes (new task added / task completed). Alternatively, live region can live in App and receive message from state.
  - `bmad-todo-client/src/components/TaskRow.tsx` — Ensure native checkbox has associated label (task title); list item wrapper `<li>`; no role conflicts. Completion state is already exposed via native checkbox.
  - `bmad-todo-client/src/App.tsx` — If live region is at app level: render a status message (e.g. from state) in a visually hidden element with `aria-live="polite"`; update message when tasks change (new task or completion toggle). Ensure DOM order places live region where AT will pick it up (e.g. after main content).
- **Do not modify:** `bmad-todo-client/src/api/tasks.ts`, backend, or types for this story (unless adding a type for an optional status message string).

#### Testing requirements

- **Screen reader (manual):** Test with at least one screen reader (VoiceOver on macOS/iOS, or NVDA on Windows). Navigate to add input: hear label/name. Navigate to Add button: hear "Add" or equivalent. Navigate task list: hear list and list item count; each task: hear task title and checkbox state (unchecked/checked). Add a task: hear announcement that a task was added. Toggle completion: hear announcement that task was marked complete/incomplete.
- **Semantics (automated):** Use axe-core or jest-axe to check for form labels, list structure, and live region presence. Ensure no duplicate or conflicting labels/roles.
- **Keyboard:** Story 5.1 already covers keyboard; ensure no regression (tab order, Enter/Space on checkbox).

#### Previous story intelligence (5.1)

- **Story 5.1:** AddRow has `aria-label` on input and button; TaskRow uses native `<input type="checkbox">` with label; focus-visible rings; tab order add input → Add button → task checkboxes. [Source: 5-1-keyboard-and-focus-full-keyboard-operability.md]
- **Reuse:** Keep existing aria-labels; add visible `<label>` for input if not present (better than label-only). Add list semantics to TaskList (ul/li) and live region for dynamic updates. Do not remove or contradict 5.1 keyboard/focus behavior.

#### Git intelligence summary

- Recent work: Story 5.1 (keyboard and focus), 3.2 (mark complete). Frontend: AddRow, TaskList, TaskRow, EmptyState; native checkbox; focus-visible rings. This story extends the same components with semantics and live regions; no new routes or API.

#### Latest tech information

- **ARIA live regions:** Use `aria-live="polite"` for list update announcements (new task, completion). Polite waits for the next natural pause; assertive interrupts. For this app, polite is correct. [Source: MDN ARIA live regions]
- **role="status":** Implies `aria-live="polite"` and `aria-atomic="true"`; good for short status messages (e.g. "Task added"). [Source: MDN]
- **Live region in DOM before update:** The element with `aria-live` must be in the DOM when content changes; add it once (e.g. empty or with initial text) and update `textContent` or inner text when list/task state changes.
- **List semantics:** Some browsers (e.g. Safari) strip list semantics when list is inside certain elements; if list is not announced, add `role="list"` to `<ul>` and `role="listitem"` to `<li>` to restore. Prefer native semantics first.

#### Project context reference

- No `project-context.md` in repo. Use epics, architecture, UX spec, and story 5.1 artifact only.

#### Story completion status

- **Status:** ready-for-dev. Ultimate context engine analysis completed — comprehensive developer guide created. Implement screen reader and semantics: ensure add input and controls have accessible names, task list uses list semantics and exposes completion state, and dynamic list updates (new task, completion) are announced via a polite live region (or role="status").

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **AC #1 (accessible names):** AddRow: added visible `<label htmlFor="add-task-input">` "New task title" and input `id="add-task-input"`; button has `aria-label="Add task"`. Code review: removed redundant `aria-label` from input (visible label provides name). TaskRow: native checkbox with associated label and `aria-label`; no change.
- **AC #2 (list semantics):** TaskList already used `<ul>` with `role="list"` and `aria-label="Task list"`; TaskRow already used `<li>`. Added explicit `role="listitem"` on each `<li>` for Safari compatibility.
- **AC #3 (dynamic announcements):** Added live region in App: visually hidden div with `role="status"`, `aria-live="polite"`, `aria-atomic="true"`, `aria-label="Live announcements"`, class `sr-only`. State `liveAnnouncement` set on create and completion toggle; cleared after 2s so repeated messages can re-announce (code review LOW #5). `.sr-only` in App.css (`@layer utilities`).
- Unit/integration: App tests for live region (task added, complete, incomplete). Code review: added vitest-axe and one axe test (form labels, list structure, live region); 73 tests pass. playwright-report removed from git tracking.

### File List

- bmad-todo-client/package.json (modified: added vitest-axe)
- bmad-todo-client/package-lock.json (modified)
- bmad-todo-client/vite.config.ts (modified: /// <reference types="vitest/config" />)
- bmad-todo-client/src/App.css (modified: .sr-only in @layer utilities)
- bmad-todo-client/src/App.tsx (modified: live region state and markup; clear after 2s)
- bmad-todo-client/src/App.test.tsx (modified: live region tests + axe test)
- bmad-todo-client/src/components/AddRow.tsx (modified: visible label + input id; removed redundant aria-label on input)
- bmad-todo-client/src/components/TaskRow.tsx (modified: role="listitem" on li)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified: 5-2 → done)
- _bmad-output/implementation-artifacts/5-2-screen-reader-and-semantics-labels-roles-live-regions.md (modified: status, Dev Agent Record)

### Change Log

- 2026-02-18: Implemented screen reader and semantics (AC #1–#3): accessible names, list semantics, live region. Tests and lint pass.
- 2026-02-18: Code review fixes: removed redundant aria-label on add input (MEDIUM #1); added vitest-axe and axe a11y test (MEDIUM #2); playwright-report removed from git tracking (MEDIUM #3); live region cleared after 2s (LOW #5); .sr-only in @layer utilities. Status → done.
