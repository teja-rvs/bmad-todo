# Story 5.1: Keyboard and focus — full keyboard operability

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to use the app with keyboard only for view list, add task, and mark complete,
so that I can work without a mouse (NFR-A2).

## Acceptance Criteria

1. **Given** the app is loaded, **when** I use only the keyboard (Tab, Enter, Space, arrows as applicable), **then** I can reach the add input, Add button, and each task's complete control in a logical order.
2. **And** I can submit the add form with Enter and toggle completion with Space (or Enter) on the control.
3. **And** all interactive elements have a visible focus indicator (e.g. focus ring meeting contrast).

## Tasks / Subtasks

- [x] **Verify and fix tab order** (AC: #1)
  - [x] Ensure DOM order matches visual order: add input → Add button → task list (each task row’s checkbox/label). No positive tabIndex unless required to fix order; avoid focus traps.
  - [x] If EmptyState has a focusable element (e.g. link/button), include it in logical order when visible.
- [x] **Verify add flow keyboard behavior** (AC: #2)
  - [x] Add input: focusable, Enter submits form (existing). Add button: focusable, Enter activates. No extra keystrokes required.
  - [x] After submit, focus remains in add input (already implemented in AddRow).
- [x] **Verify task row keyboard behavior** (AC: #2)
  - [x] Each task’s complete control (native checkbox or role="checkbox") is focusable; Space (and Enter where applicable) toggles completion. No mouse required.
- [x] **Visible focus indicators** (AC: #3)
  - [x] Add input and Add button: visible focus ring (e.g. 2px ring + offset) meeting contrast (WCAG 2.1 AA). AddRow already uses focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 — verify contrast and consistency.
  - [x] Task row checkbox (and label/row if it’s the focus target): visible focus indicator; ensure ring is not removed (e.g. no focus:outline-none without a replacement ring).
  - [x] Prefer :focus-visible where appropriate so mouse users don’t get persistent ring on click.

## Dev Notes

- **Frontend only.** This story is about keyboard operability and focus visibility; no backend or API changes. [Source: _bmad-output/planning-artifacts/epics.md, architecture.md]
- **Existing behavior:** AddRow has aria-label on input and button, Enter submits, focus returns to input after submit; input and button already have focus ring classes. TaskRow uses native `<input type="checkbox">` so Space/Enter toggle is built-in; 44px min touch target. [Source: 3-2-frontend-mark-task-complete-and-show-updated-state.md, AddRow.tsx, TaskRow.tsx]
- **NFR-A2:** All core user flows (view list, add task, mark complete) must be fully operable via keyboard only. [Source: _bmad-output/planning-artifacts/epics.md]
- **UX spec:** Visible focus ring on all interactive elements; keyboard order matches visual order; no focus traps; min 44×44px touch targets. [Source: _bmad-output/planning-artifacts/ux-design-specification.md]

### Project Structure Notes

- **Frontend:** Work in `bmad-todo-client/`. Touch only components and global focus styles: `src/components/AddRow.tsx`, `src/components/TaskRow.tsx`, `src/components/TaskList.tsx`, `src/App.tsx`, and optionally `src/index.css` or Tailwind for focus-visible. [Source: _bmad-output/planning-artifacts/architecture.md]
- **Backend:** No changes in `bmad-todo-api/` for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 5.1 acceptance criteria, Epic 5 (accessibility and responsive experience).
- [Source: _bmad-output/planning-artifacts/architecture.md] — Frontend structure, accessibility (semantics, focus, keyboard, WCAG 2.1 AA).
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Focus, keyboard order, touch targets, WCAG 2.1 AA.

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **Tab order:** Add input → Add button → first task checkbox → … → last task checkbox. Use natural DOM order; do not add positive tabIndex unless layout forces a different visual order. EmptyState: if it contains a focusable control, place it in logical order (e.g. after add row when list is empty).
- **Add flow:** Enter in add input submits form; Add button is focusable and Enter activates it. After submit, focus remains in add input (already in AddRow). No new keyboard shortcuts required.
- **Complete flow:** Each task row’s checkbox is focusable via Tab. Native checkbox: Space toggles; Enter may also activate depending on browser — both are acceptable. Do not require mouse or click-only behavior.
- **Focus indicators:** All interactive elements (add input, Add button, each task checkbox/label) must show a visible focus style. Requirements: (1) visible ring or outline, (2) sufficient contrast (WCAG 2.1 AA). AddRow already uses `focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2` — keep or align TaskRow/global styles to the same pattern. Do not use `outline: none` or `focus:outline-none` without a replacement (e.g. focus:ring). Prefer `focus-visible:` where supported so only keyboard focus shows the ring if desired.

#### Architecture compliance

- **Naming:** No API changes. Components and props remain camelCase (e.g. no new public props required unless adding skip links or focus management callbacks).
- **Structure:** Only `src/api/tasks.ts` calls the backend; this story does not add or change API calls. Changes are limited to `bmad-todo-client` components and styles.
- **State:** No change to React state shape; keyboard and focus are behavioral and presentational.

#### Library / framework requirements

- **React:** Use native focus behavior (no focus-management library required). Optional: useRef and .focus() only if fixing focus after a specific action (e.g. after error clear). Do not add new dependencies for this story.
- **Tailwind:** Use or extend existing focus classes (focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2). Add focus-visible: variants if improving UX (keyboard-only ring).
- **HTML:** Prefer semantic, focusable elements (input, button, native checkbox). Ensure <label> is associated with checkbox so clicking label focuses checkbox and improves hit area.

#### File structure requirements

- **Modify (as needed):**
  - `bmad-todo-client/src/components/AddRow.tsx` — Only if focus ring or tab order needs adjustment; currently has focus styles and aria-label.
  - `bmad-todo-client/src/components/TaskRow.tsx` — Ensure checkbox (and wrapper/label) have visible focus style; verify no outline removed without replacement; 44px min touch target already; tab order is natural.
  - `bmad-todo-client/src/components/TaskList.tsx` — No focusable container; list semantics only. Ensure no tabIndex or role that would break order.
  - `bmad-todo-client/src/App.tsx` — Ensure no focus trap; main content order: AddRow then TaskList.
  - `bmad-todo-client/src/index.css` or Tailwind — Optional: global focus-visible or focus ring token for consistency.
- **Do not modify:** `bmad-todo-client/src/api/tasks.ts`, backend, or types for this story.

#### Testing requirements

- **Keyboard navigation:** Test with keyboard only: Tab through add input → Add button → task checkboxes in order. Verify no focus trap and no unreachable control.
- **Add flow:** Focus add input, type, press Enter → task created and focus remains in input. Focus Add button, press Enter → same result (with empty input, no submit).
- **Complete flow:** Focus a task checkbox, press Space → completion toggles and list updates. No mouse required.
- **Focus visibility:** Enable visible focus (keyboard or :focus-visible); confirm ring/outline on input, button, and each checkbox. Check contrast (e.g. ring color on background) meets WCAG AA.
- **Automated:** Optional a11y tests (e.g. axe-core or jest-axe) for focusable elements and no focus traps. Manual keyboard pass is required.

#### Previous story intelligence (Epic 3 / last frontend story)

- **Story 3.2:** TaskRow uses native `<input type="checkbox">` with label; 44px min height; strikethrough and #6b8e23 for completed state. AddRow has focus ring and aria-label; Enter submits; focus returns to input. Reuse these patterns; this story only verifies and completes keyboard and focus behavior. [Source: 3-2-frontend-mark-task-complete-and-show-updated-state.md]
- **Convention:** No new API or state shape; keep existing component contracts. [Source: architecture.md]

#### Git intelligence summary

- Recent work: Story 3.2 (mark complete), 3.1 (backend PATCH). Frontend has AddRow (form, focus), TaskList, TaskRow (native checkbox). This story is refinement only: tab order, focus visibility, and keyboard coverage verification.

#### Latest tech information

- **Focus visible:** Use `:focus-visible` in CSS or Tailwind `focus-visible:` to show focus ring only for keyboard (not after mouse click), improving UX. Not required for AC but recommended.
- **Contrast:** Focus ring should meet 3:1 against adjacent background (WCAG 2.1). Warm Minimal primary #8b7355 on #fefdfb meets contrast; verify in implementation.
- **No new libraries:** HTML5 and React keyboard behavior are sufficient; no focus-management or a11y library required for this scope.

#### Project context reference

- No `project-context.md` in repo. Use epics, architecture, UX spec, and story 3.2 artifact only.

#### Story completion status

- **Status:** ready-for-dev. Ultimate context engine analysis completed — comprehensive developer guide created. Implement keyboard operability and visible focus: verify/fix tab order (add input → Add button → task checkboxes), Enter for add and Space/Enter for complete, and visible focus indicators on all interactive elements meeting WCAG 2.1 AA.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Tab order verified: add input → Add button → task checkboxes in DOM order; no positive tabIndex; EmptyState has no focusable elements. App test added for keyboard tab order.
- Add flow: Enter in input submits; Add button Enter activates; focus remains in input after submit (existing). Tests added for Enter submit and focus retention, and Add button Enter.
- Task row: native checkbox focusable via Tab; Space toggles completion. Test added for Space on focused checkbox.
- Focus indicators: AddRow input and button switched to focus-visible:ring-2 focus-visible:ring-[#8b7355] focus-visible:ring-offset-2; TaskRow checkbox given focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b7355] focus-visible:ring-offset-2. Unit tests assert focus ring classes on input, button, and checkbox. All 68 unit tests and 6 e2e tests pass; lint clean.
- **Code review (2026-02-18):** Addressed MEDIUM/LOW findings: (1) App.test now asserts focus remains on input after submitting via Add button Enter. (2) Tab-order test asserts no focus trap (one more Tab after last checkbox leaves list). (3) WCAG 2.1 AA contrast noted in AddRow.tsx and TaskRow.tsx comments for focus ring #8b7355 on #fefdfb. (4) playwright-report/ already in .gitignore. (5) AddRow.test and TaskRow.test assert focus-visible:ring-offset-2. (6) New test: keyboard-only Tab to checkbox then Space toggles completion. All 69 unit tests pass.

### File List

- bmad-todo-client/src/components/AddRow.tsx
- bmad-todo-client/src/components/TaskRow.tsx
- bmad-todo-client/src/App.test.tsx
- bmad-todo-client/src/components/AddRow.test.tsx
- bmad-todo-client/src/components/TaskRow.test.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/5-1-keyboard-and-focus-full-keyboard-operability.md

### Change Log

- 2026-02-18: Implemented full keyboard operability and visible focus (AC #1–#3). Verified tab order, add/complete keyboard behavior, added focus-visible rings to AddRow and TaskRow; added keyboard and focus-indicator tests.
- 2026-02-18: Code review fixes: focus-return assertion (Add button path), no-focus-trap assertion, contrast comments, ring-offset-2 in unit tests, keyboard-only Space test; 69 unit tests pass.
