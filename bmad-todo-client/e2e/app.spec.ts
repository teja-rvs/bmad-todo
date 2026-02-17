import { test, expect } from '@playwright/test'

test.describe('App', () => {
  test('shows Vite + React heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /vite \+ react/i })).toBeVisible()
  })

  test('counter increments on button click', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', { name: /count is \d+/ })
    await expect(button).toHaveText(/count is 0/)
    await button.click()
    await expect(button).toHaveText(/count is 1/)
  })

  test('Vite and React links are present', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /vite logo/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /react logo/i })).toBeVisible()
  })
})
