/**
 * Accessibility e2e tests: axe in real browser (Chrome/Chromium).
 * Verifies WCAG 2.1 AA including color-contrast and focus, per story 5.3.
 * Run with: npm run test:e2e (uses Playwright Chromium; Chrome DevTools + axe equivalent).
 * Requires app at baseURL (webServer or existing dev server with VITE_API_URL set).
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const emptyTasksResponse = () => ({
  status: 200,
  contentType: 'application/json' as const,
  body: JSON.stringify({ tasks: [] }),
})

const tasksWithCompleted = () => ({
  status: 200,
  contentType: 'application/json' as const,
  body: JSON.stringify({
    tasks: [
      { id: 1, title: 'Done task', completed: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 2, title: 'Open task', completed: false, created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' },
    ],
  }),
})

async function waitForAppReady(page: import('@playwright/test').Page) {
  await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('textbox', { name: /new task title/i })).toBeVisible({ timeout: 5000 })
  await expect(page.getByRole('status', { name: /loading/i })).not.toBeVisible({ timeout: 10000 })
}

test.describe('Accessibility (axe WCAG 2.1 AA)', () => {
  test('app has no axe WCAG 2.1 AA violations (contrast, focus, semantics)', async ({ page }) => {
    await page.route('**/tasks', (route) => route.fulfill(emptyTasksResponse()))
    await page.goto('/')
    await waitForAppReady(page)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('task list with completed task has no axe WCAG 2.1 AA violations', async ({ page }) => {
    await page.route('**/tasks', (route) => route.fulfill(tasksWithCompleted()))
    await page.goto('/')
    await waitForAppReady(page)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})
