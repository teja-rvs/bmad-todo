import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AddRow } from './AddRow'

describe('AddRow', () => {
  it('renders text input with placeholder', () => {
    render(<AddRow />)
    expect(screen.getByPlaceholderText('New task...')).toBeInTheDocument()
  })

  it('renders Add button with accessible name', () => {
    render(<AddRow />)
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
  })

  it('renders input with aria-label for accessibility', () => {
    render(<AddRow />)
    expect(screen.getByRole('textbox', { name: /new task title/i })).toBeInTheDocument()
  })

  it('disables the input (placeholder only until Story 2.2)', () => {
    render(<AddRow />)
    expect(screen.getByRole('textbox', { name: /new task title/i })).toBeDisabled()
  })

  it('disables the Add button (placeholder only until Story 2.2)', () => {
    render(<AddRow />)
    expect(screen.getByRole('button', { name: /add task/i })).toBeDisabled()
  })

  it('renders input as readOnly', () => {
    render(<AddRow />)
    const input = screen.getByRole('textbox', { name: /new task title/i })
    expect(input).toHaveAttribute('readOnly')
  })
})
