import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
