import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskList } from './TaskList'

const tasks = [
  {
    id: 1,
    title: 'First task',
    completed: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Second task',
    completed: true,
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
]

describe('TaskList', () => {
  it('renders empty list with list role when no tasks', () => {
    render(<TaskList tasks={[]} />)
    expect(screen.getByRole('list', { name: /task list/i })).toBeInTheDocument()
  })

  it('renders all task titles', () => {
    render(<TaskList tasks={tasks} />)
    expect(screen.getByText('First task')).toBeInTheDocument()
    expect(screen.getByText('Second task')).toBeInTheDocument()
  })

  it('renders list with correct semantics', () => {
    render(<TaskList tasks={tasks} />)
    const list = screen.getByRole('list', { name: /task list/i })
    expect(list).toBeInTheDocument()
    const items = list.querySelectorAll('li')
    expect(items).toHaveLength(2)
  })

  it('passes onComplete to each TaskRow when provided', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<TaskList tasks={tasks} onComplete={onComplete} />)
    const firstCheckbox = screen.getByRole('checkbox', { name: /first task/i })
    await user.click(firstCheckbox)
    expect(onComplete).toHaveBeenCalledWith(1, true)
  })

  it('passes isCompleting to TaskRow when completingId matches task id', () => {
    render(<TaskList tasks={tasks} onComplete={vi.fn()} completingId={1} />)
    const firstCheckbox = screen.getByRole('checkbox', { name: /first task/i })
    expect(firstCheckbox).toBeDisabled()
    const secondCheckbox = screen.getByRole('checkbox', { name: /second task/i })
    expect(secondCheckbox).not.toBeDisabled()
  })
})
