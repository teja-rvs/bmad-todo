# Code Review: Story 5.2 — Screen reader and semantics (labels, roles, live regions)

**Story file:** 5-2-screen-reader-and-semantics-labels-roles-live-regions.md  
**Story key:** 5-2-screen-reader-and-semantics-labels-roles-live-regions  
**Reviewer:** Adversarial Senior Developer (AI)  
**Date:** 2026-02-18  

---

## Git vs Story Discrepancies

| Finding | Severity |
|--------|----------|
| **playwright-report/index.html** appears in `git status` as modified but is not listed in the story File List. The directory is in `.gitignore`; if the report was committed earlier, consider removing it from tracking. | MEDIUM |
| All other modified files (App.css, App.tsx, App.test.tsx, AddRow.tsx, TaskRow.tsx) and the story file match the story File List. | — |

**Git vs Story discrepancy count:** 1  

---

## Acceptance Criteria Verification

| AC | Status | Evidence |
|----|--------|----------|
| **AC #1** — Add input has associated label/accessible name; Add button and complete control have clear names | IMPLEMENTED | AddRow: visible `<label htmlFor="add-task-input">` "New task title", input `id="add-task-input"`, button "Add" + aria-label; TaskRow: native checkbox with wrapping `<label>` and `aria-label={task.title}`. |
| **AC #2** — Task list uses list semantics; each task exposes completion state | IMPLEMENTED | TaskList: `<ul role="list" aria-label="Task list">`; TaskRow: `<li role="listitem">`; native checkbox exposes checked/unchecked. |
| **AC #3** — Dynamic list updates (new task, completion) announced | IMPLEMENTED | App: live region with `role="status"`, `aria-live="polite"`, `aria-atomic="true"`; `setLiveAnnouncement('Task added' | 'Task marked complete' | 'Task marked incomplete')` in handlers. |

---

## Task Completion Audit

All tasks marked [x] in the story were verified as actually implemented (no false claims).

- Accessible names: AddRow label + id, button, TaskRow checkbox label/aria-label — **done**
- List semantics: ul/li, role="list"/"listitem" — **done**
- Live region: present in App, announcements on create and complete — **done**

---

## Issues Found

### HIGH: 0

(No HIGH issues.)

### MEDIUM: 3

1. **Redundant accessible name on add input (a11y best practice)**  
   **File:** `bmad-todo-client/src/components/AddRow.tsx`  
   The add input has both a visible `<label htmlFor="add-task-input">` with "New task title" and `aria-label="New task title"` on the input. When a visible label is correctly associated via `htmlFor`/`id`, an extra `aria-label` can cause some screen readers to announce the name twice. **Recommendation:** Remove `aria-label` from the input and rely on the associated visible label.

2. **Story-required automated a11y checks (axe) not added**  
   **File:** Story Dev Notes / Testing requirements  
   The story states: *"Use axe-core or jest-axe to check for form labels, list structure, and live region presence."* The test suite uses only React Testing Library and role/text assertions; there is no axe-core or jest-axe dependency or tests. **Recommendation:** Add `jest-axe` (or `@axe-core/react`) and at least one test that runs axe on the rendered App (or key views) and asserts zero violations for form labels, list structure, and presence of the live region.

3. **Modified file not in story File List**  
   **File:** N/A (tracking)  
   `bmad-todo-client/playwright-report/index.html` appears in `git status` as modified but is not listed in the story File List. The directory is in `.gitignore`; if it was ever committed, it should be removed from tracking so generated reports don’t appear as source changes. **Recommendation:** Ensure `playwright-report/` (and `test-results/` if used) are not tracked; add to File List only if you intentionally track generated artifacts, otherwise fix tracking.

### LOW: 2

4. **Custom `.sr-only` instead of Tailwind utility**  
   **File:** `bmad-todo-client/src/App.css`  
   A custom `.sr-only` class is defined for the live region. The project uses Tailwind, which provides a `sr-only` utility. Using the Tailwind class keeps behavior consistent and avoids drift. **Recommendation:** Use Tailwind’s `sr-only` (e.g. `className="sr-only"` with Tailwind’s utility) and remove the custom rule from App.css, or document why a custom implementation is required.

5. **Live region never cleared**  
   **File:** `bmad-todo-client/src/App.tsx`  
   `liveAnnouncement` is only ever set to a new message and never cleared. For repeated identical actions (e.g. marking several tasks complete in a row), some assistive technologies may not re-announce the same text. **Recommendation:** Optional improvement: clear the live region after a short delay (e.g. reset to `''` after 1–2 seconds) so subsequent identical updates can be announced again if desired.

---

## Summary

| Severity | Count |
|----------|--------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 3 |
| LOW | 2 |
| **Total** | **5** |

**Story status recommendation:** Address MEDIUM issues (especially #1 and #2) before marking **done**; LOW items can be deferred. ACs and all [x] tasks are implemented; no false completion claims.
