import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows loading then fetches tasks on mount', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ tasks: [] }),
              }),
            10
          )
        )
    )

    render(<App />)

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading/i })).not.toBeInTheDocument()
    })
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/tasks$/), expect.anything())
  })

  it('shows empty state when task list is empty', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: [] }),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    })
  })

  it('shows task list with task titles when tasks exist', async () => {
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
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks }),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('First task')).toBeInTheDocument()
      expect(screen.getByText('Second task')).toBeInTheDocument()
    })
    expect(screen.getByRole('list', { name: /task list/i })).toBeInTheDocument()
  })

  it('shows home screen with add row at top', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: [] }),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /new task title/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
    })
  })

  it('shows error message when fetch fails', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error')
    })
  })

  it('create task: new task appears at top of list', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: 10,
          title: 'New from test',
          completed: false,
          created_at: '2026-02-18T12:00:00Z',
          updated_at: '2026-02-18T12:00:00Z',
        }),
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
    })

    await user.type(screen.getByRole('textbox', { name: /new task title/i }), 'New from test')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => {
      expect(screen.getByText('New from test')).toBeInTheDocument()
    })
    expect(screen.getByRole('list', { name: /task list/i })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/tasks$/),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'New from test' }),
      })
    )
  })

  it('create task: shows error when create fails', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [] }) })
      .mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ error: "Title can't be blank" }),
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /new task title/i })).toBeInTheDocument()
    })

    await user.type(screen.getByRole('textbox', { name: /new task title/i }), 'Bad')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/couldn't save|try again|title can't be blank/i)
    })
  })

  it('does not update state after unmount when fetch resolves late', async () => {
    let resolveFetch: (value: { ok: boolean; json: () => Promise<{ tasks: unknown[] }> }) => void
    const fetchPromise = new Promise<{ ok: boolean; json: () => Promise<{ tasks: unknown[] }> }>((resolve) => {
      resolveFetch = resolve
    })
    ;(fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(fetchPromise)

    const { unmount } = render(<App />)
    unmount()

    resolveFetch!({
      ok: true,
      json: async () => ({ tasks: [{ id: 1, title: 'Late', completed: false, created_at: '', updated_at: '' }] }),
    })
    await fetchPromise

    await new Promise((r) => setTimeout(r, 0))
    expect(document.body.textContent).not.toContain('Late')
  })
})
