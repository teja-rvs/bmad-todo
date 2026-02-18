import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('shows "No tasks yet" message', () => {
    render(<EmptyState />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('"No tasks yet" heading uses full-contrast text color (WCAG AA ≥4.5:1)', () => {
    render(<EmptyState />)
    const heading = screen.getByRole('heading', { name: 'No tasks yet' })
    expect(heading).toHaveClass('text-[#2c2419]')
  })

  it('shows guidance to use add row above', () => {
    render(<EmptyState />)
    expect(screen.getByText(/use the add row above to create your first task/i)).toBeInTheDocument()
  })

  it('has status role for accessibility', () => {
    render(<EmptyState />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('uses full-contrast text color for body (WCAG AA ≥4.5:1)', () => {
    render(<EmptyState />)
    const body = screen.getByText(/use the add row above/i)
    expect(body).toHaveClass('text-[#2c2419]')
  })
})
