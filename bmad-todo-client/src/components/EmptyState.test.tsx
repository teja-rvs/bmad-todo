import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('shows "No tasks yet" message', () => {
    render(<EmptyState />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('shows guidance to use add row above', () => {
    render(<EmptyState />)
    expect(screen.getByText(/use the add row above to create your first task/i)).toBeInTheDocument()
  })

  it('has status role for accessibility', () => {
    render(<EmptyState />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
