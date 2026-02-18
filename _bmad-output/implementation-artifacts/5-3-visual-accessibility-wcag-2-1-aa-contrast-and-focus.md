# Story 5.3: Visual accessibility — WCAG 2.1 AA contrast and focus

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want sufficient contrast and visible focus so that I can see and use the UI (FR20, NFR-A1),
so that the app meets WCAG 2.1 Level AA for visual presentation.

## Acceptance Criteria

1. **Given** the Warm Minimal palette and components are in use, **when** the UI is rendered, **then** text and interactive elements meet WCAG 2.1 Level AA contrast (e.g. ≥4.5:1 for normal text).
2. **And** focus indicators meet contrast requirements and are clearly visible.
3. **And** completed state (e.g. strikethrough, muted color) remains readable (not gray-on-gray).

## Tasks / Subtasks

- [x] **Verify and fix text/UI contrast (AC #1)** (AC: #1)
  - [x] Audit all text (body, placeholder, labels, button, empty state) against background/surface; ensure ≥4.5:1 for normal text, ≥3:1 for large text (18pt or 14pt bold).
  - [x] Audit UI components (borders, icons, checkbox) for ≥3:1 against adjacent colors (WCAG 1.4.11 non-text contrast).
  - [x] Document or fix any failing combinations (e.g. placeholder, completed-state text).
- [x] **Verify and fix focus indicators (AC #2)** (AC: #2)
  - [x] Ensure every interactive element (add input, Add button, task checkbox) has a visible focus indicator (e.g. 2px ring with offset).
  - [x] Ensure focus indicator has ≥3:1 contrast against unfocused state and adjacent colors; if ring is &lt;2px equivalent, use ≥4.5:1.
  - [x] Do not remove or reduce existing focus-visible rings; only strengthen if needed.
- [x] **Verify completed state readability (AC #3)** (AC: #3)
  - [x] Ensure completed task text (strikethrough and/or muted color) has sufficient contrast (≥4.5:1) against background so it is not gray-on-gray.
  - [x] If using a muted “completed” color (e.g. green #6b8e23 or gray), verify contrast and adjust if needed.

## Dev Notes

- **Frontend only.** No backend or API changes. [Source: _bmad-output/planning-artifacts/epics.md, architecture.md]
- **NFR-A1:** Application conforms to WCAG 2.1 Level AA (contrast, focus, text alternatives where needed). [Source: _bmad-output/planning-artifacts/epics.md]
- **FR20:** Visual presentation meets WCAG 2.1 Level AA (e.g. contrast, focus indicators). [Source: _bmad-output/planning-artifacts/epics.md]
- **UX spec:** Warm Minimal palette (#fefdfb, #2c2419, #8b7355, #6b8e23); contrast ≥4.5:1 for text; focus ring visible; completed state readable. [Source: _bmad-output/planning-artifacts/ux-design-specification.md]

### Project Structure Notes

- **Frontend:** Work in `bmad-todo-client/`. Components: `AddRow.tsx`, `TaskRow.tsx`, `TaskList.tsx`, `EmptyState.tsx`, `App.tsx`, `App.css`, `index.css`. [Source: _bmad-output/planning-artifacts/architecture.md]
- **Backend:** No changes in `bmad-todo-api/` for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 5.3 acceptance criteria, Epic 5 (accessibility and responsive experience).
- [Source: _bmad-output/planning-artifacts/architecture.md] — Frontend structure, accessibility (WCAG 2.1 AA).
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Warm Minimal palette, contrast and focus requirements.

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **Text and UI contrast (AC #1):**
  - **Normal text:** Contrast ratio ≥4.5:1 between text and background (WCAG 1.4.3). Apply to: body text, labels, button text, empty state text, task titles.
  - **Large text:** ≥3:1 for 18pt+ or 14pt+ bold (e.g. empty state heading if larger).
  - **Placeholder:** Must not be sole way to convey info; if visible, ensure ≥4.5:1 or clearly secondary (e.g. slightly muted but still readable). UX spec allows placeholder to supplement label.
  - **Non-text (1.4.11):** UI components and graphical objects ≥3:1 against adjacent colors (borders, checkbox, icons).
  - **Warm Minimal palette (from UX):** Background #fefdfb, text #2c2419, primary #8b7355, completed #6b8e23. Verify each usage meets the ratios above; adjust shades only if necessary.
- **Focus indicators (AC #2):**
  - **Visibility:** Every keyboard-focusable element must have a visible focus indicator (no `outline: none` without a replacement). Use `focus:outline-none` only when paired with `focus-visible:ring-*` (or equivalent).
  - **Contrast:** Focus indicator must be ≥3:1 against the unfocused state and against adjacent colors (WCAG 2.4.7; WCAG 2.2 SC 2.4.11 recommends 3:1 for focus, 4.5:1 for thin indicators). Current pattern: 2px ring (#8b7355) with 2px offset on #fefdfb — verify and document or strengthen.
  - **Do not remove** existing focus-visible rings in AddRow and TaskRow; only verify contrast and visibility (including in high-contrast or zoom scenarios if feasible).
- **Completed state (AC #3):**
  - Completed task text (strikethrough and/or color change) must remain readable: ≥4.5:1 against background. Avoid gray-on-gray; prefer strikethrough + sufficient contrast (e.g. #6b8e23 or darkened gray that meets ratio).
  - Checkbox accent/completed visual: ensure checkbox and any “completed” styling meet non-text contrast where applicable.

#### Architecture compliance

- **Naming:** No API changes. Components and props remain camelCase. Only CSS/Tailwind and inline styles or class changes.
- **Structure:** No new components or API calls. Changes limited to `bmad-todo-client`: existing components and global/base CSS.
- **State:** No change to React state shape; visual/contrast and focus are presentational and a11y-only.

#### Library / framework requirements

- **React:** No new dependencies. Use existing Tailwind/className and CSS; avoid inline styles for tokens if Tailwind/custom properties are already used.
- **Tailwind:** Use existing Tailwind v4 setup. If new utilities are needed for contrast (e.g. a completed-state text color), add in `tailwind.config` or `index.css`/`App.css` per project patterns. Focus rings: keep or extend `focus-visible:ring-2 focus-visible:ring-[#8b7355] focus-visible:ring-offset-2` pattern.
- **Testing:** Use existing Vitest and, if present, axe or jest-axe for contrast/focus assertions where possible; manual check for contrast and focus visibility.

#### File structure requirements

- **Modify (as needed):**
  - `bmad-todo-client/src/components/AddRow.tsx` — Verify input and button text/placeholder contrast; verify focus ring contrast. Already has focus-visible ring; only adjust if audit fails.
  - `bmad-todo-client/src/components/TaskRow.tsx` — Verify task title and completed-state (strikethrough/muted color) contrast; verify checkbox focus ring and accent color contrast.
  - `bmad-todo-client/src/components/EmptyState.tsx` — Verify heading and body text contrast against background.
  - `bmad-todo-client/src/App.tsx` — Only if app-level background or text color affects contrast.
  - `bmad-todo-client/src/App.css` or `index.css` — Add or adjust any shared focus or color tokens if needed for consistency.
- **Do not modify:** `bmad-todo-client/src/api/tasks.ts`, backend, or types (unless adding a type for a purely presentational prop).

#### Testing requirements

- **Contrast (manual or tool):** Use browser DevTools, axe, or a contrast checker to verify text and UI contrast ratios (4.5:1 normal text, 3:1 large text and non-text). Document failing combinations and fix.
- **Focus (manual + automated):** Tab through all interactive elements; confirm visible focus ring on each. Existing tests in AddRow.test.tsx and TaskRow.test.tsx assert focus-visible ring classes; keep and extend if new elements get focus styles.
- **Completed state:** Visually and with contrast tool verify completed task row (strikethrough + color) is readable against background.
- **Regression:** Run full test suite; ensure no accessibility or visual regressions from 5.1/5.2 (keyboard, screen reader, semantics).

#### Previous story intelligence (5.1, 5.2)

- **Story 5.1:** AddRow and TaskRow already use focus-visible ring (2px #8b7355, offset 2) and comments that they meet WCAG non-text contrast. This story formalizes audit and completes any gaps (placeholder, completed state, non-text 3:1). [Source: 5-1-keyboard-and-focus-full-keyboard-operability.md]
- **Story 5.2:** AddRow has visible label and accessible names; TaskList uses list semantics; live region for dynamic updates. No change to contrast/focus in 5.2; this story focuses only on visual contrast and focus. [Source: 5-2-screen-reader-and-semantics-labels-roles-live-regions.md]
- **Reuse:** Keep existing focus rings and keyboard/screen reader behavior; only verify and fix contrast and completed-state readability. Do not remove or weaken focus indicators.

#### Git intelligence summary

- Recent work: Story 5.2 (screen reader, semantics, live region), 5.1 (keyboard, focus rings). Frontend: AddRow, TaskList, TaskRow, EmptyState; focus-visible rings and WCAG comments already present. This story adds formal contrast/completed-state verification and any small fixes.

#### Latest tech information

- **WCAG 2.1 Level AA — Text:** Normal text ≥4.5:1, large text ≥3:1 (SC 1.4.3). Do not round up (e.g. 2.999:1 fails 3:1). [Source: W3C Understanding 1.4.3]
- **WCAG 2.1 — Non-text contrast:** UI components and graphical objects ≥3:1 against adjacent colors (SC 1.4.11). [Source: W3C Understanding 1.4.11]
- **Focus visible (2.4.7):** Keyboard focus must be visible. WCAG 2.2 SC 2.4.11 (Focus Appearance Minimum): focus indicator ≥3:1 against unfocused and adjacent; if focus outline &lt;2px equivalent, use ≥4.5:1. [Source: W3C Understanding 2.4.7, 2.4.11]
- **Warm Minimal:** #fefdfb (bg), #2c2419 (text), #8b7355 (primary/focus), #6b8e23 (completed). Verify with contrast calculator; darken or lighten only where needed to meet ratios.

#### Project context reference

- No `project-context.md` in repo. Use epics, architecture, UX spec, and stories 5.1 and 5.2 only.

#### Story completion status

- **Status:** review → done (after code review). Visual accessibility implemented and code-review fixes applied: contrast, focus, completed state; checkbox accent and semantics updated; File List and docs updated.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **AC #1 (contrast):** Audited text and UI. Input placeholder changed from `text-[#2c2419]/50` to `placeholder:text-[#5a5147]` (≥4.5:1). Input border strengthened from `border-[#8b7355]/40` to `border-[#8b7355]` (≥3:1 non-text). EmptyState body text changed from `text-[#2c2419]/80` to `text-[#2c2419]` for guaranteed ≥4.5:1. Labels, button, and headings already met ratios.
- **AC #2 (focus):** Verified all interactive elements (add input, Add button, task checkbox) have visible focus rings (2px #8b7355, offset 2); contrast ≥3:1 against #fefdfb. No removal or reduction.
- **AC #3 (completed state):** Completed task text color changed from #6b8e23 to #556b1c (darker olive) for ≥4.5:1 against #fefdfb; strikethrough retained. Unit tests updated and added for contrast/focus classes.
- **Code review (AI) fixes:** Checkbox accent changed from #6b8e23 to #556b1c for WCAG 1.4.11 non-text contrast. EmptyState "No tasks yet" made semantic heading (h2). File List expanded to include a11y e2e and App test; contrast ratios documented in docs/contrast-ratios.md. AddRow test renamed; EmptyState test added for heading contrast.

### File List

- bmad-todo-client/src/components/AddRow.tsx (modified)
- bmad-todo-client/src/components/TaskRow.tsx (modified)
- bmad-todo-client/src/components/EmptyState.tsx (modified)
- bmad-todo-client/src/components/AddRow.test.tsx (modified)
- bmad-todo-client/src/components/TaskRow.test.tsx (modified)
- bmad-todo-client/src/components/EmptyState.test.tsx (modified)
- bmad-todo-client/src/App.test.tsx (modified — axe WCAG 2.1 AA)
- bmad-todo-client/e2e/a11y.spec.ts (new — axe e2e)
- bmad-todo-client/docs/accessibility-verification.md (existing)
- bmad-todo-client/docs/contrast-ratios.md (new)

## Change Log

- 2026-02-18: Implemented WCAG 2.1 AA contrast and focus (AC #1–#3). Contrast fixes: placeholder #5a5147, input border #8b7355, EmptyState body #2c2419, completed task #556b1c. Focus rings verified (2px #8b7355, offset 2). Unit tests added/updated for contrast and focus.
- 2026-02-18: Code review fixes. Checkbox accent #6b8e23→#556b1c (WCAG 1.4.11). EmptyState "No tasks yet"→h2. File List: added App.test.tsx, e2e/a11y.spec.ts, docs. Added docs/contrast-ratios.md. Test renames and EmptyState heading contrast assertion.
