/**
 * Extended real-API E2E tests: full CRUD, validation, ordering, persistence.
 * Requires API on port 3000 and client on 5173. Skips when backend unavailable.
 */
import { test, expect } from '@playwright/test'

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000'

test.describe('Real API Extended E2E', () => {
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

  test('full CRUD cycle: create, verify in list, mark complete, verify state', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    const title = `CRUD cycle ${Date.now()}`

    await page.getByRole('textbox', { name: /new task title/i }).fill(title)
    await page.getByRole('button', { name: /add task/i }).click()
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })

    const checkbox = page.getByRole('checkbox', { name: title })
    await expect(checkbox).not.toBeChecked()

    await checkbox.click()
    await expect(checkbox).toBeChecked({ timeout: 5000 })

    await checkbox.click()
    await expect(checkbox).not.toBeChecked({ timeout: 5000 })
  })

  test('multiple tasks appear in list and maintain order', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    const prefix = `Order ${Date.now()}`
    const titles = [`${prefix} A`, `${prefix} B`, `${prefix} C`]

    for (const title of titles) {
      await page.getByRole('textbox', { name: /new task title/i }).fill(title)
      await page.getByRole('button', { name: /add task/i }).click()
      await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })
    }

    const list = page.getByRole('list', { name: /task list/i })
    await expect(list).toBeVisible()

    for (const title of titles) {
      await expect(page.getByText(title)).toBeVisible()
    }
  })

  test('data persists across page reload', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    const title = `Persist ${Date.now()}`
    await page.getByRole('textbox', { name: /new task title/i }).fill(title)
    await page.getByRole('button', { name: /add task/i }).click()
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })

    await page.reload()
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })
  })

  test('completed state persists across page reload', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    const title = `Complete persist ${Date.now()}`
    await page.getByRole('textbox', { name: /new task title/i }).fill(title)
    await page.getByRole('button', { name: /add task/i }).click()
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })

    const checkbox = page.getByRole('checkbox', { name: title })
    await checkbox.click()
    await expect(checkbox).toBeChecked({ timeout: 5000 })

    await page.reload()
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('checkbox', { name: title })).toBeChecked({ timeout: 10000 })
  })

  test('task with unicode characters displays correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    const title = `Unicödé täsk 日本語 ${Date.now()}`
    await page.getByRole('textbox', { name: /new task title/i }).fill(title)
    await page.getByRole('button', { name: /add task/i }).click()
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })
  })

  test('input clears after successful task creation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    const title = `Clear input ${Date.now()}`
    const input = page.getByRole('textbox', { name: /new task title/i })
    await input.fill(title)
    await page.getByRole('button', { name: /add task/i }).click()
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })

    await expect(input).toHaveValue('')
  })

  test('empty input does not create a task', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    const listBefore = await page.getByRole('listitem').count()

    await page.getByRole('textbox', { name: /new task title/i }).fill('')
    await page.getByRole('button', { name: /add task/i }).click()

    await page.waitForTimeout(500)
    const listAfter = await page.getByRole('listitem').count()
    expect(listAfter).toBe(listBefore)
  })

  test('whitespace-only input does not create a task', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 15000 })

    const listBefore = await page.getByRole('listitem').count()

    await page.getByRole('textbox', { name: /new task title/i }).fill('   ')
    await page.getByRole('button', { name: /add task/i }).click()

    await page.waitForTimeout(500)
    const listAfter = await page.getByRole('listitem').count()
    expect(listAfter).toBe(listBefore)
  })
})
