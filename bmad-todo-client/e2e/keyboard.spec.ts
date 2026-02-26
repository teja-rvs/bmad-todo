/**
 * Keyboard accessibility E2E tests.
 * Verifies the app is fully operable via keyboard (WCAG 2.1 AA 2.1.1).
 */
import { test, expect } from '@playwright/test'

const emptyTasksResponse = () => ({
  status: 200,
  contentType: 'application/json' as const,
  body: JSON.stringify({ tasks: [] }),
})

const twoTasksResponse = () => ({
  status: 200,
  contentType: 'application/json' as const,
  body: JSON.stringify({
    tasks: [
      { id: 1, title: 'Keyboard task one', completed: false, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
      { id: 2, title: 'Keyboard task two', completed: false, created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' },
    ],
  }),
})

test.describe('Keyboard Accessibility', () => {
  test('tab order: input → Add button → task checkboxes', async ({ page }) => {
    await page.route('**/tasks', (route) => route.fulfill(twoTasksResponse()))
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('list', { name: /task list/i })).toBeVisible()

    await page.keyboard.press('Tab')
    const firstFocused = await page.evaluate(() => document.activeElement?.getAttribute('id') || document.activeElement?.tagName)
    expect(firstFocused).toBe('add-task-input')

    await page.keyboard.press('Tab')
    const secondFocused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    expect(secondFocused).toBe('Add task')

    await page.keyboard.press('Tab')
    const thirdFocused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    expect(thirdFocused).toBe('Keyboard task one')

    await page.keyboard.press('Tab')
    const fourthFocused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    expect(fourthFocused).toBe('Keyboard task two')
  })

  test('Enter key submits new task from input field', async ({ page }) => {
    let createdTask: Record<string, unknown> | null = null

    await page.route('**/tasks', (route) => {
      const request = route.request()
      if (request.method() === 'GET') {
        const body = createdTask ? { tasks: [createdTask] } : { tasks: [] }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        })
      }
      if (request.method() === 'POST') {
        const postBody = request.postDataJSON()
        createdTask = {
          id: 1,
          title: postBody?.title ?? 'Task',
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
    await input.fill('Keyboard Enter task')
    await input.press('Enter')

    await expect(page.getByText('Keyboard Enter task')).toBeVisible({ timeout: 5000 })

    const activeId = await page.evaluate(() => document.activeElement?.getAttribute('id'))
    expect(activeId).toBe('add-task-input')
  })

  test('Space key toggles task completion on focused checkbox', async ({ page }) => {
    const task = {
      id: 1,
      title: 'Space toggle task',
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
          body: JSON.stringify({ tasks: [{ ...task, completed: completedState }] }),
        })
      }
      if (request.method() === 'PATCH') {
        const body = request.postDataJSON() as { completed?: boolean }
        completedState = body?.completed ?? true
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...task, completed: completedState, updated_at: new Date().toISOString() }),
        })
      }
      return route.continue()
    })

    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10000 })

    // Tab to the checkbox (input → button → checkbox)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    const focusedLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    expect(focusedLabel).toBe('Space toggle task')

    await page.keyboard.press('Space')
    await expect(page.getByRole('checkbox', { name: 'Space toggle task' })).toBeChecked({ timeout: 5000 })
  })

  test('focus moves back to input after task submission via button Enter', async ({ page }) => {
    let createdTask: Record<string, unknown> | null = null

    await page.route('**/tasks', (route) => {
      const request = route.request()
      if (request.method() === 'GET') {
        const body = createdTask ? { tasks: [createdTask] } : { tasks: [] }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        })
      }
      if (request.method() === 'POST') {
        const postBody = request.postDataJSON()
        createdTask = {
          id: 1,
          title: postBody?.title ?? 'Task',
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

    await page.getByRole('textbox', { name: /new task title/i }).fill('Button submit task')
    await page.keyboard.press('Tab')

    const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    expect(focused).toBe('Add task')

    await page.keyboard.press('Enter')
    await expect(page.getByText('Button submit task')).toBeVisible({ timeout: 5000 })

    const activeId = await page.evaluate(() => document.activeElement?.getAttribute('id'))
    expect(activeId).toBe('add-task-input')
  })

  test('no focus trap: Tab past last checkbox moves to browser chrome', async ({ page }) => {
    await page.route('**/tasks', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [{ id: 1, title: 'Single task', completed: false, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }],
        }),
      })
    )
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10000 })

    // Tab through: input → button → checkbox → beyond
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    // After last interactive element, focus should not be on any app interactive element
    const focusedLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    expect(focusedLabel).not.toBe('Single task')
  })
})
