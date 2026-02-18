import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddRow } from './AddRow'

describe('AddRow', () => {
  it('renders text input with placeholder "Add a task…"', () => {
    render(<AddRow onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('Add a task…')).toBeInTheDocument()
  })

  it('renders Add button with accessible name', () => {
    render(<AddRow onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
  })

  it('renders input with accessible name from visible label', () => {
    render(<AddRow onSubmit={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: /new task title/i })).toBeInTheDocument()
  })

  it('calls onSubmit with trimmed title when user types and submits via Enter', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AddRow onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox', { name: /new task title/i })
    await user.type(input, '  New task  ')
    await user.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith('New task')
  })

  it('calls onSubmit with trimmed title when user clicks Add button', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AddRow onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox', { name: /new task title/i })
    await user.type(input, 'Another task')
    await user.click(screen.getByRole('button', { name: /add task/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith('Another task')
  })

  it('does not call onSubmit when trimmed title is empty (Enter)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AddRow onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox', { name: /new task title/i })
    await user.type(input, '   ')
    await user.keyboard('{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not call onSubmit when trimmed title is empty (button click)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AddRow onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /add task/i }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears input after submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AddRow onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox', { name: /new task title/i })
    await user.type(input, 'Task to add')
    await user.keyboard('{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('Task to add')
    expect(input).toHaveValue('')
  })

  it('input is not disabled or readOnly', () => {
    render(<AddRow onSubmit={vi.fn()} />)
    const input = screen.getByRole('textbox', { name: /new task title/i })
    expect(input).not.toBeDisabled()
    expect(input).not.toHaveAttribute('readOnly')
  })

  it('Add button is not disabled by default', () => {
    render(<AddRow onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /add task/i })).not.toBeDisabled()
  })

  it('disables Add button when isSubmitting is true', () => {
    render(<AddRow onSubmit={vi.fn()} isSubmitting />)
    expect(screen.getByRole('button', { name: /add task/i })).toBeDisabled()
  })

  it('input has visible focus ring classes (focus-visible)', () => {
    render(<AddRow onSubmit={vi.fn()} />)
    const input = screen.getByRole('textbox', { name: /new task title/i })
    expect(input.className).toMatch(/focus-visible:ring-2/)
    expect(input.className).toMatch(/focus-visible:ring-\[#8b7355\]/)
    expect(input.className).toMatch(/focus-visible:ring-offset-2/)
  })

  it('input has WCAG AA border and placeholder contrast (non-text 3:1, text 4.5:1)', () => {
    render(<AddRow onSubmit={vi.fn()} />)
    const input = screen.getByRole('textbox', { name: /new task title/i })
    expect(input.className).toMatch(/border-\[#8b7355\]/)
    expect(input.className).toMatch(/placeholder:text-\[#5a5147\]/)
  })

  it('Add button has visible focus ring classes (focus-visible)', () => {
    render(<AddRow onSubmit={vi.fn()} />)
    const button = screen.getByRole('button', { name: /add task/i })
    expect(button.className).toMatch(/focus-visible:ring-2/)
    expect(button.className).toMatch(/focus-visible:ring-\[#8b7355\]/)
    expect(button.className).toMatch(/focus-visible:ring-offset-2/)
  })

  // SPA guardrail (AC #1): add-task must not cause full-page reload; submit uses handler and form has no action
  it('form submit calls onSubmit and form has no action so no full-page reload occurs', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { container } = render(<AddRow onSubmit={onSubmit} />)
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
    expect(form).not.toHaveAttribute('action')
    let defaultPrevented = false
    form!.addEventListener('submit', (e) => {
      setTimeout(() => {
        defaultPrevented = e.defaultPrevented
      }, 0)
    })
    const input = screen.getByRole('textbox', { name: /new task title/i })
    await user.type(input, 'SPA guard task')
    await user.click(screen.getByRole('button', { name: /add task/i }))
    await new Promise((r) => setTimeout(r, 10))
    expect(defaultPrevented).toBe(true)
    expect(onSubmit).toHaveBeenCalledWith('SPA guard task')
  })

  it('form has no action attribute so submit does not trigger navigation', () => {
    const { container } = render(<AddRow onSubmit={vi.fn()} />)
    const form = container.querySelector('form')
    expect(form).not.toHaveAttribute('action')
  })

  it('form has no link that would cause full-page navigation for add-task flow', () => {
    const { container } = render(<AddRow onSubmit={vi.fn()} />)
    const form = container.querySelector('form')
    const linksWithHref = form!.querySelectorAll('a[href]')
    expect(linksWithHref.length).toBe(0)
  })
})
