import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskRow } from './TaskRow'

const baseTask = {
  id: 1,
  title: 'Test task',
  completed: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('TaskRow', () => {
  it('renders task title', () => {
    render(<TaskRow task={baseTask} />)
    expect(screen.getByText('Test task')).toBeInTheDocument()
  })

  it('renders incomplete task without strikethrough', () => {
    render(<TaskRow task={baseTask} />)
    const title = screen.getByText('Test task')
    expect(title).not.toHaveClass('line-through')
  })

  it('renders completed task with strikethrough', () => {
    render(<TaskRow task={{ ...baseTask, completed: true }} />)
    expect(screen.getByText('Test task')).toHaveClass('line-through')
  })

  it('renders as list item', () => {
    render(<TaskRow task={baseTask} />)
    const li = screen.getByText('Test task').closest('li')
    expect(li).toBeInTheDocument()
  })

  it('renders a real checkbox that is unchecked when task is incomplete', () => {
    render(<TaskRow task={baseTask} />)
    const checkbox = screen.getByRole('checkbox', { name: /test task/i })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('renders checkbox checked when task is completed', () => {
    render(<TaskRow task={{ ...baseTask, completed: true }} />)
    const checkbox = screen.getByRole('checkbox', { name: /test task/i })
    expect(checkbox).toBeChecked()
  })

  it('calls onComplete with task id and toggled completed when checkbox is changed', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const onComplete = vi.fn()
    render(<TaskRow task={baseTask} onComplete={onComplete} />)
    const checkbox = screen.getByRole('checkbox', { name: /test task/i })
    await user.click(checkbox)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(1, true)
  })

  it('calls onComplete with completed false when unchecking a completed task', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const onComplete = vi.fn()
    render(<TaskRow task={{ ...baseTask, completed: true }} onComplete={onComplete} />)
    const checkbox = screen.getByRole('checkbox', { name: /test task/i })
    await user.click(checkbox)
    expect(onComplete).toHaveBeenCalledWith(1, false)
  })

  it('has minimum 44px touch target (row has min-h-[44px] class)', () => {
    render(<TaskRow task={baseTask} />)
    const li = screen.getByRole('listitem')
    expect(li.className).toMatch(/min-h-\[44px\]/)
  })

  it('disables checkbox when isCompleting is true', () => {
    render(<TaskRow task={baseTask} onComplete={vi.fn()} isCompleting />)
    const checkbox = screen.getByRole('checkbox', { name: /test task/i })
    expect(checkbox).toBeDisabled()
  })

  it('applies completed color (#556b1c, WCAG AA contrast) when task is completed', () => {
    render(<TaskRow task={{ ...baseTask, completed: true }} />)
    const title = screen.getByText('Test task')
    expect(title).toHaveClass('text-[#556b1c]')
  })

  it('checkbox has visible focus indicator (focus-visible ring)', () => {
    render(<TaskRow task={baseTask} />)
    const checkbox = screen.getByRole('checkbox', { name: /test task/i })
    expect(checkbox.className).toMatch(/focus-visible:ring-2/)
    expect(checkbox.className).toMatch(/focus-visible:ring-\[#8b7355\]/)
    expect(checkbox.className).toMatch(/focus-visible:ring-offset-2/)
    expect(checkbox.className).toMatch(/focus:outline-none/)
  })

  it('checkbox uses WCAG AA accent color (#556b1c, non-text 3:1)', () => {
    render(<TaskRow task={baseTask} />)
    const checkbox = screen.getByRole('checkbox', { name: /test task/i })
    expect(checkbox.className).toMatch(/accent-\[#556b1c\]/)
  })

  // SPA guardrail (AC #1): mark-complete must not cause full-page reload; uses client handler only
  it('uses checkbox only for completion; no link or form that would cause navigation', () => {
    const { container } = render(<TaskRow task={baseTask} onComplete={vi.fn()} />)
    const row = container.querySelector('li')
    expect(row).toBeInTheDocument()
    const links = row!.querySelectorAll('a[href]')
    expect(links.length).toBe(0)
    const forms = row!.querySelectorAll('form')
    expect(forms.length).toBe(0)
    expect(screen.getByRole('checkbox', { name: /test task/i })).toBeInTheDocument()
  })
})
