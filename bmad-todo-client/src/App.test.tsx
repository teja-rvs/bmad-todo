import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('renders Vite + React heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /vite \+ react/i })).toBeInTheDocument()
  })

  it('increments count when button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    const button = screen.getByRole('button', { name: /count is 0/i })
    expect(button).toBeInTheDocument()
    await user.click(button)
    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument()
  })

  it('shows Vite and React logos with links', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /vite logo/i })).toHaveAttribute('href', 'https://vite.dev')
    expect(screen.getByRole('link', { name: /react logo/i })).toHaveAttribute('href', 'https://react.dev')
  })
})
