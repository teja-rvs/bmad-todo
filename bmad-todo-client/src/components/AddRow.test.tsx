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

  it('renders input with aria-label for accessibility', () => {
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
})
