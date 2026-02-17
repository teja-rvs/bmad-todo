import { test, expect } from '@playwright/test'

const emptyTasksResponse = () => ({
  status: 200,
  contentType: 'application/json' as const,
  body: JSON.stringify({ tasks: [] }),
})

test.describe('App', () => {
  test('shows Tasks heading and home screen', async ({ page }) => {
    await page.route('**/tasks', (route) => route.fulfill(emptyTasksResponse()))
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible()
  })

  test('shows add row at top', async ({ page }) => {
    await page.route('**/tasks', (route) => route.fulfill(emptyTasksResponse()))
    await page.goto('/')
    await expect(page.getByRole('textbox', { name: /new task title/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /add task/i })).toBeVisible()
  })

  test('shows content area (empty state, list, or error when API unavailable)', async ({ page }) => {
    await page.route('**/tasks', (route) => route.fulfill(emptyTasksResponse()))
    await page.goto('/')
    // Wait for initial load to finish: loading disappears
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10000 })
    // Then one of: empty state, task list, or error message
    const emptyOrList = page.getByText(/no tasks yet/i).or(page.getByRole('list', { name: /task list/i }))
    const errorAlert = page.getByRole('alert')
    await expect(emptyOrList.or(errorAlert)).toBeVisible({ timeout: 2000 })
  })

  test('shows task list when API returns tasks', async ({ page }) => {
    await page.route('**/tasks', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            { id: 1, title: 'E2E task one', completed: false, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
            { id: 2, title: 'E2E task two', completed: true, created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' },
          ],
        }),
      })
    })
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('list', { name: /task list/i })).toBeVisible()
    await expect(page.getByText('E2E task one')).toBeVisible()
    await expect(page.getByText('E2E task two')).toBeVisible()
  })
})
