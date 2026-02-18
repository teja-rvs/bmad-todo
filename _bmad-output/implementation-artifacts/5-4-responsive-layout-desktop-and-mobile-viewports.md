# Story 5.4: Responsive layout — desktop and mobile viewports

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the app to work on desktop and mobile so that I can use it on any device (FR21, FR22, FR23).

## Acceptance Criteria

1. **Given** the app is open in a supported browser (Chrome, Firefox, Safari, Edge), **when** I resize the viewport from desktop (e.g. 1280px) down to mobile (e.g. 320px), **then** the layout remains single-column with add row at top and list below; content is readable and not clipped.
2. **And** touch targets (e.g. checkbox, Add button, task row) are at least 44×44px where applicable.
3. **And** the layout is usable and readable across viewport sizes without horizontal scroll for main content.

## Tasks / Subtasks

- [x] **Ensure single-column responsive layout (AC #1)** (AC: #1)
  - [x] Verify/add viewport meta tag and base layout (max-width, centering) so desktop (e.g. 560–640px) and mobile (320px+) use same structure: add row at top, list below.
  - [x] Use mobile-first CSS (rem/%, max-width, optional breakpoints only for padding/max-width); avoid fixed px that cause clipping or horizontal scroll.
  - [x] Confirm content (add row, task list, empty state) is readable and not clipped at 320px and at 1280px.
- [x] **Verify/enforce 44×44px touch targets (AC #2)** (AC: #2)
  - [x] Audit checkbox, Add button, and task row: ensure minimum 44×44px hit area (e.g. min-height/min-width or padding) on touch devices; document or fix any shortfall.
  - [x] Keep adequate spacing between tappable elements to avoid mis-taps (per UX spec).
- [x] **No horizontal scroll for main content (AC #3)** (AC: #3)
  - [x] Ensure main content area does not overflow viewport (no horizontal scroll); long task titles can wrap or truncate with accessible behavior.
  - [x] Test at 320px, 375px, 768px, 1280px in supported browsers.

## Dev Notes

- **Frontend only.** No backend or API changes. [Source: _bmad-output/planning-artifacts/epics.md, architecture.md]
- **FR21:** User can use the app on desktop viewports. **FR22:** User can use the app on mobile viewports (layout and controls usable). **FR23:** Latest Chrome, Firefox, Safari, Edge (desktop and mobile where applicable). [Source: _bmad-output/planning-artifacts/epics.md]
- **UX spec:** Single-column, max-width 560–640px on desktop, centered; mobile-first; min 44px touch targets; add row at top, list below; Airy spacing (20px row padding, 24px gaps). [Source: _bmad-output/planning-artifacts/ux-design-specification.md]

### Project Structure Notes

- **Frontend:** Work in `bmad-todo-client/`. Components: `AddRow.tsx`, `TaskRow.tsx`, `TaskList.tsx`, `EmptyState.tsx`, `App.tsx`, `App.css`, `index.css`. [Source: _bmad-output/planning-artifacts/architecture.md]
- **Backend:** No changes in `bmad-todo-api/` for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Story 5.4 acceptance criteria, Epic 5 (accessibility and responsive experience).
- [Source: _bmad-output/planning-artifacts/architecture.md] — Frontend structure, responsive layout (single-column, mobile-first).
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Responsive strategy, breakpoints, touch targets, implementation guidelines.

---

### Developer Context (for Dev Agent)

#### Technical requirements

- **Single-column layout (AC #1):**
  - **Viewport:** Ensure `<meta name="viewport" content="width=device-width, initial-scale=1">` in `index.html` if not already present.
  - **Structure:** One linear layout at all breakpoints: add row at top, task list (or empty state) below. No multi-column or sidebar for MVP.
  - **Desktop:** Max-width 560–640px (per UX), centered (e.g. `max-w-[640px] mx-auto` or equivalent). Use relative units (rem, %) for spacing; avoid fixed px for layout width that could cause overflow on small viewports.
  - **Mobile:** Same structure from ~320px up; base styles are mobile-first. Optional breakpoint (e.g. 768px) only to adjust max-width or padding, not to change structure.
  - **Readable and not clipped:** Padding/margins so content does not touch viewport edges; text and controls remain fully visible at 320px and 1280px.
- **Touch targets (AC #2):**
  - **Minimum size:** Checkbox, Add button, and task row tap area must be at least 44×44px (WCAG 2.5.5 Target Size, Level AAA; UX spec requires it). Achieve via min-height/min-width, padding, or hit-area expansion (e.g. larger clickable region with visible control inside).
  - **Spacing:** Adequate spacing between tappable elements to avoid mis-taps (UX: "adequate spacing between controls").
  - **No hover-only behavior:** All actions must be usable with touch and pointer; no critical behavior that depends only on hover.
- **No horizontal scroll (AC #3):**
  - **Main content:** Container and children must not cause horizontal overflow (no `overflow-x: auto` for main content unless for a specific scrollable sub-area). Use `min-w-0`, `overflow-wrap`, or `word-break` where needed for long task titles so they wrap instead of overflowing.
  - **Viewports to verify:** 320px, 375px, 768px, 1280px in Chrome, Firefox, Safari, Edge (or equivalent).

#### Architecture compliance

- **Naming:** No API changes. Components and props remain camelCase. Only layout/CSS and optional Tailwind class changes.
- **Structure:** No new components or API calls. Changes limited to `bmad-todo-client`: existing components, `App.tsx`, and global/base CSS. Respect existing `src/components/`, `src/api/`, `src/types/` layout.
- **State:** No change to React state shape; responsive behavior is presentational and layout-only.

#### Library / framework requirements

- **React:** No new dependencies. Use existing Tailwind and CSS; layout via Tailwind utilities or existing `App.css`/`index.css` patterns.
- **Tailwind:** Use existing Tailwind setup. Prefer responsive utilities (`max-w-*`, `mx-auto`, `min-h-[44px]`, `p-*`) and mobile-first breakpoints (`sm:`, `md:`) only where needed. Do not introduce a new CSS framework or layout library.
- **Testing:** Use existing Vitest; add or extend viewport/responsive tests if feasible (e.g. render at different widths or check for overflow); manual verification at 320px and 1280px required.

#### File structure requirements

- **Modify (as needed):**
  - `bmad-todo-client/index.html` — Viewport meta tag if missing.
  - `bmad-todo-client/src/App.tsx` — Main layout wrapper: max-width, centering, padding so single-column works from 320px to desktop.
  - `bmad-todo-client/src/components/AddRow.tsx` — Ensure Add button and input area meet 44px min touch target; layout does not overflow on narrow viewports.
  - `bmad-todo-client/src/components/TaskRow.tsx` — Ensure checkbox and row hit area ≥44×44px; long titles wrap or truncate without horizontal scroll.
  - `bmad-todo-client/src/components/TaskList.tsx` — Container respects parent width; no overflow.
  - `bmad-todo-client/src/components/EmptyState.tsx` — Readable and contained within viewport at all sizes.
  - `bmad-todo-client/src/App.css` or `index.css` — Any shared layout or responsive tokens (e.g. container max-width, padding variables).
- **Do not modify:** `bmad-todo-client/src/api/tasks.ts`, backend, or types (unless adding a purely presentational prop).

#### Testing requirements

- **Viewport/responsive:** Manually test at 320px, 375px, 768px, 1280px; confirm single-column, no horizontal scroll, content readable. Optional: Vitest with mocked dimensions or e2e with viewport resize.
- **Touch targets:** Verify checkbox, Add button, and task row have ≥44×44px interactive area (DevTools or manual on device).
- **Regression:** Run full test suite; ensure no regressions from 5.1–5.3 (keyboard, screen reader, contrast, focus).

#### Previous story intelligence (5.1, 5.2, 5.3)

- **Story 5.1–5.2:** AddRow and TaskRow already have focus rings and semantics; TaskList uses list semantics; live region for updates. Do not remove or weaken these. [Source: 5-1-keyboard-and-focus-full-keyboard-operability.md, 5-2-screen-reader-and-semantics-labels-roles-live-regions.md]
- **Story 5.3:** Contrast and focus indicators verified; Warm Minimal palette; checkbox and completed state styling. Responsive story does not change contrast or focus; only layout and touch target size. [Source: 5-3-visual-accessibility-wcag-2-1-aa-contrast-and-focus.md]
- **Reuse:** Keep existing component structure and a11y attributes; only add or adjust layout and touch target dimensions. Do not duplicate components; modify in place.

#### Git intelligence summary

- Recent work: Story 5.3 (contrast, focus, completed state), 5.2 (screen reader, semantics), 5.1 (keyboard, focus). Frontend: AddRow, TaskList, TaskRow, EmptyState, App.tsx, index.css. This story adds responsive layout and 44px touch targets without changing a11y behavior.

#### Latest tech information

- **WCAG 2.5.5 Target Size (Level AAA):** Touch targets at least 44×44 CSS pixels. UX spec and PRD require this for mobile. [Source: W3C Understanding 2.5.5]
- **Mobile-first responsive:** Base styles for small viewports; enhance with media queries for larger. Use `min-width` media queries (e.g. 768px) for optional padding/max-width adjustments. [Source: UX spec, common practice]
- **Viewport meta:** `width=device-width, initial-scale=1` for proper scaling on mobile. [Source: MDN viewport meta]

#### Project context reference

- No `project-context.md` in repo. Use epics, architecture, UX spec, and stories 5.1–5.3 only.

#### Story completion status

- **Status:** ready-for-dev. Ultimate context engine analysis completed — comprehensive developer guide created.

---

## Change Log

- **2026-02-18:** Responsive layout and touch targets implemented. Viewport meta, mobile-first container (max-width 40rem, responsive padding), 44×44px touch targets for Add button and checkbox, no horizontal scroll (min-w-0, break-words). E2e tests added for viewport, overflow, and touch targets (app.spec.ts); a11y e2e (a11y.spec.ts) exercised for regression.
- **2026-02-18 (code review):** Fixes applied: File List updated to include e2e/a11y.spec.ts; e2e viewport coverage extended to 375px, 768px, 1280px (no horizontal scroll); App.css comment corrected (AC #4 → Story 5.4); EmptyState given min-w-0 and break-words; Change Log updated. Status → done.

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **Task 1 (AC #1):** Viewport meta set to `width=device-width, initial-scale=1`. App container uses mobile-first CSS: `max-width: 40rem` (640px), padding `1.25rem` base and `1.5rem` at 768px. Single-column layout (add row top, list below) unchanged; `.app-main` and `.app-content` given `min-width: 0` to avoid flex overflow.
- **Task 2 (AC #2):** Add button has `min-w-[44px]` and `min-h-[44px]`. Task row checkbox wrapped in a 44×44px hit-area span (`min-w-[44px] min-h-[44px]` with negative margin to preserve layout). Row and label retain `min-h-[44px]`; spacing between controls unchanged.
- **Task 3 (AC #3):** Input and list given `min-w-0` and title span `break-words` so long task titles wrap. No horizontal scroll at 320px; e2e tests added for viewport meta, no horizontal scroll at 320px, 375px, 768px, 1280px, 44px touch targets (Add button, task row), and long title wrap.
- **Task 2 (audit):** Touch target audit done; shortfalls fixed in code (Add button and checkbox hit-area span); no separate doc beyond code comments and Completion Notes.

### File List

- bmad-todo-client/index.html
- bmad-todo-client/src/App.css
- bmad-todo-client/src/components/AddRow.tsx
- bmad-todo-client/src/components/TaskRow.tsx
- bmad-todo-client/src/components/TaskList.tsx
- bmad-todo-client/src/components/EmptyState.tsx
- bmad-todo-client/e2e/app.spec.ts
- bmad-todo-client/e2e/a11y.spec.ts
