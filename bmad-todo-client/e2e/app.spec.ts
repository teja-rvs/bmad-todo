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

  test('shows error when API returns 500', async ({ page }) => {
    await page.route('**/tasks', (route) =>
      route.fulfill({ status: 500, statusText: 'Internal Server Error', body: '' })
    )
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('alert')).toContainText(/unavailable|error|failed/i)
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

  test('add task flow: user can add a task and see it in the list', async ({ page }) => {
    const initialTasks = { tasks: [] }
    let createdTask: { id: number; title: string; completed: boolean; created_at: string; updated_at: string } | null = null

    await page.route('**/tasks', (route) => {
      const request = route.request()
      if (request.method() === 'GET') {
        const body = createdTask
          ? { tasks: [createdTask] }
          : initialTasks
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        })
      }
      if (request.method() === 'POST') {
        const postBody = request.postDataJSON()
        const title = postBody?.title ?? 'New task'
        createdTask = {
          id: 1,
          title,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(createdTask),
        })
      }
      return route.continue()
    })
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10000 })
    const input = page.getByRole('textbox', { name: /new task title/i })
    await input.fill('My new E2E task')
    await page.getByRole('button', { name: /add task/i }).click()
    await expect(page.getByText('My new E2E task')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('list', { name: /task list/i })).toBeVisible()
  })

  test('mark complete flow: user can toggle task complete and see updated state', async ({ page }) => {
    const task = {
      id: 1,
      title: 'Task to complete',
      completed: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    let completedState = false

    await page.route(/\/tasks(\/\d+)?$/, (route) => {
      const request = route.request()
      const url = request.url().replace(/\?.*/, '')
      if (request.method() === 'GET' && url.endsWith('/tasks')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            tasks: [{ ...task, completed: completedState }],
          }),
        })
      }
      if (request.method() === 'PATCH' && /\/tasks\/1$/.test(url)) {
        const body = request.postDataJSON() as { completed?: boolean }
        completedState = body?.completed ?? true
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...task,
            completed: completedState,
            updated_at: new Date().toISOString(),
          }),
        })
      }
      return route.continue()
    })
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('list', { name: /task list/i })).toBeVisible()
    await expect(page.getByText('Task to complete')).toBeVisible()

    const checkbox = page.getByRole('checkbox', { name: 'Task to complete' })
    await expect(checkbox).not.toBeChecked()
    await checkbox.click()

    await expect(checkbox).toBeChecked({ timeout: 5000 })
    await expect(page.getByText('Task to complete')).toBeVisible()

    // Toggle back to incomplete: persistence and list reflect state
    await checkbox.click()
    await expect(checkbox).not.toBeChecked({ timeout: 5000 })
  })
})
