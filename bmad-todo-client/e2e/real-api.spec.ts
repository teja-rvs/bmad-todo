/**
 * E2E tests against real API (no mocks). Skip when backend is not available.
 * Run with API on port 3000 and client on 5173 (e.g. npm run test:e2e with API running).
 */
import { test, expect } from '@playwright/test'

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000'

test.describe('Real API E2E (smoke)', () => {
  test.beforeEach(async ({ page }) => {
    const apiUp = await page.evaluate(async (base) => {
      try {
        const r = await fetch(`${base}/up`, { signal: AbortSignal.timeout(2000) })
        return r.ok
      } catch {
        return false
      }
    }, API_BASE)
    test.skip(!apiUp, 'Backend not available at ' + API_BASE)
  })

  test('loads tasks from real API and shows empty or list', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
    await expect(
      page.getByText(/no tasks yet/i).or(page.getByRole('list', { name: /task list/i })).or(page.getByRole('alert'))
    ).toBeVisible({ timeout: 5000 })
  })

  test('add task via real API and see it in list', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
    const title = `E2E real API ${Date.now()}`
    await page.getByRole('textbox', { name: /new task title/i }).fill(title)
    await page.getByRole('button', { name: /add task/i }).click()
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })
  })

  test('mark task complete via real API and see updated state', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
    const title = `E2E complete ${Date.now()}`
    await page.getByRole('textbox', { name: /new task title/i }).fill(title)
    await page.getByRole('button', { name: /add task/i }).click()
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })
    const checkbox = page.getByRole('checkbox', { name: title })
    await expect(checkbox).not.toBeChecked()
    await checkbox.click()
    await expect(checkbox).toBeChecked({ timeout: 5000 })
  })
})
