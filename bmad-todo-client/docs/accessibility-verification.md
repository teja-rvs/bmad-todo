# Accessibility verification (Chrome DevTools + axe)

Per story 5.3 and NFR-A1, the app is verified against WCAG 2.1 Level AA using **axe** and **Chrome DevTools** (or Chromium in CI).

## Automated axe checks

### 1. Unit (Vitest + vitest-axe)

- **Run:** `npm run test:run`
- **What:** axe runs in jsdom on the rendered App with tags `wcag2a`, `wcag2aa`, `wcag21aa` (includes color-contrast where computable).
- **Test:** `App.test.tsx` — "has no axe accessibility violations (WCAG 2.1 AA: form labels, list structure, live region, contrast)".

### 2. E2E (Playwright + @axe-core/playwright) — real Chrome

- **Run:** `npm run test:e2e` (or `npm run test:e2e -- e2e/a11y.spec.ts` for a11y only).
- **What:** axe runs in a real Chromium browser (same engine as Chrome) on the app. Covers contrast, focus, and semantics in a real rendering environment.
- **Tests:** `e2e/a11y.spec.ts` — app shell (empty and with tasks) scanned with WCAG 2.1 A/AA tags.
- **Note:** If reusing an existing dev server, start it with `VITE_API_URL=http://localhost:3000` so the app can load and mocks apply. In CI, Playwright starts the webServer with that env.

This satisfies the **Chrome DevTools + axe** requirement: axe runs inside the same browser stack as Chrome DevTools.

## Manual verification (Chrome DevTools + axe)

1. **Lighthouse (Chrome DevTools)**  
   - Open the app in Chrome → DevTools → **Lighthouse** tab.  
   - Run **Accessibility** only.  
   - Confirm no failures for contrast, focus, or semantics.

2. **axe DevTools extension**  
   - Install [axe DevTools](https://www.deque.com/axe/devtools/) for Chrome.  
   - Open the app, open DevTools, run the axe scan.  
   - Fix any reported WCAG 2.1 AA violations (e.g. color-contrast, focus-visible).

3. **Contrast and focus (manual)**  
   - **Contrast:** Use DevTools **Inspect** → check computed text/background colors; verify ≥4.5:1 (normal text) and ≥3:1 (large text / UI components) with a contrast checker.  
   - **Focus:** Tab through the page; confirm a visible focus ring (2px brown ring) on the add input, Add button, and each task checkbox.

## Optional: Chrome DevTools MCP (Cursor)

For AI-assisted debugging in Cursor with a live browser:

1. Install [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) (e.g. add to Cursor MCP config).
2. Start Chrome with remote debugging; connect the MCP so the agent can inspect the page, run Lighthouse, and view console/network.

Automated axe (Vitest + Playwright) remains the source of truth for WCAG 2.1 AA; Chrome DevTools MCP is optional for manual/investigation workflows.
