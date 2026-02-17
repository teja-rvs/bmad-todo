import { describe, it, expect } from 'vitest'
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
})
