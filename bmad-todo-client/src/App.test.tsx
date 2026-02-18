import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
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

  it('has no axe accessibility violations (WCAG 2.1 AA: form labels, list structure, live region, contrast)', async () => {
    const tasks = [
      {
        id: 1,
        title: 'A11y task',
        completed: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks }),
    })

    const { container } = render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('list', { name: /task list/i })).toBeInTheDocument()
      expect(screen.getByRole('status', { name: /live announcements/i })).toBeInTheDocument()
    })

    const results = await axe(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    })
    expect(results.violations).toHaveLength(0)
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

  it('mark complete: PATCH called and list updates without refresh', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const initialTasks = [
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
        completed: false,
        created_at: '2026-01-02T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ]
    const updatedFirst = {
      id: 1,
      title: 'First task',
      completed: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-02-18T12:00:00Z',
    }
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: initialTasks }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedFirst,
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('First task')).toBeInTheDocument()
      expect(screen.getByText('Second task')).toBeInTheDocument()
    })

    const firstCheckbox = screen.getByRole('checkbox', { name: /first task/i })
    await user.click(firstCheckbox)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/tasks\/1$/),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ completed: true }),
        })
      )
    })
    await waitFor(() => {
      const firstTitle = screen.getByText('First task')
      expect(firstTitle).toHaveClass('line-through')
    })
  })

  it('mark complete: shows error when PATCH fails', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tasks: [
            {
              id: 1,
              title: 'Only task',
              completed: false,
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-01T00:00:00Z',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Task not found' }),
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Only task')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('checkbox', { name: /only task/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/couldn't save|try again|task not found/i)
    })
  })

  it('keyboard: tab order is add input → Add button → task checkboxes (no focus trap)', async () => {
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
        completed: false,
        created_at: '2026-01-02T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      },
    ]
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks }),
    })

    const user = (await import('@testing-library/user-event')).default.setup()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('list', { name: /task list/i })).toBeInTheDocument()
    })

    const input = screen.getByRole('textbox', { name: /new task title/i })
    const addButton = screen.getByRole('button', { name: /add task/i })
    const firstCheckbox = screen.getByRole('checkbox', { name: /first task/i })
    const secondCheckbox = screen.getByRole('checkbox', { name: /second task/i })

    await user.tab()
    expect(document.activeElement).toBe(input)
    await user.tab()
    expect(document.activeElement).toBe(addButton)
    await user.tab()
    expect(document.activeElement).toBe(firstCheckbox)
    await user.tab()
    expect(document.activeElement).toBe(secondCheckbox)
    await user.tab()
    expect(document.activeElement).not.toBe(firstCheckbox)
    expect(document.activeElement).not.toBe(secondCheckbox)
  })

  it('keyboard: Enter in add input submits; focus remains in input after submit', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: 10,
          title: 'Keyboard task',
          completed: false,
          created_at: '2026-02-18T12:00:00Z',
          updated_at: '2026-02-18T12:00:00Z',
        }),
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /new task title/i })).toBeInTheDocument()
    })

    const input = screen.getByRole('textbox', { name: /new task title/i })
    await user.click(input)
    await user.keyboard('Keyboard task{Enter}')
    await waitFor(() => {
      expect(screen.getByText('Keyboard task')).toBeInTheDocument()
    })
    expect(document.activeElement).toBe(input)
  })

  it('keyboard: Add button focused, Enter submits when input has value', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: 11,
          title: 'From button Enter',
          completed: false,
          created_at: '2026-02-18T12:00:00Z',
          updated_at: '2026-02-18T12:00:00Z',
        }),
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
    })

    await user.type(screen.getByRole('textbox', { name: /new task title/i }), 'From button Enter')
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /add task/i }))
    await user.keyboard('{Enter}')
    await waitFor(() => {
      expect(screen.getByText('From button Enter')).toBeInTheDocument()
    })
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: /new task title/i }))
  })

  it('keyboard: Space on focused task checkbox toggles completion', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const initialTasks = [
      {
        id: 1,
        title: 'Space task',
        completed: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]
    const updatedTask = {
      id: 1,
      title: 'Space task',
      completed: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-02-18T12:00:00Z',
    }
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: initialTasks }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedTask,
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /space task/i })).toBeInTheDocument()
    })

    const checkbox = screen.getByRole('checkbox', { name: /space task/i })
    await user.click(checkbox)
    expect(checkbox).toHaveFocus()
    await user.keyboard(' ')
    await waitFor(() => {
      expect(checkbox).toBeChecked()
    })
  })

  it('keyboard: Tab to task checkbox then Space toggles completion (no mouse)', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const initialTasks = [
      {
        id: 1,
        title: 'Tab space task',
        completed: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]
    const updatedTask = {
      id: 1,
      title: 'Tab space task',
      completed: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-02-18T12:00:00Z',
    }
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: initialTasks }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedTask,
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /tab space task/i })).toBeInTheDocument()
    })

    const input = screen.getByRole('textbox', { name: /new task title/i })
    const addButton = screen.getByRole('button', { name: /add task/i })
    const checkbox = screen.getByRole('checkbox', { name: /tab space task/i })

    await user.tab()
    expect(document.activeElement).toBe(input)
    await user.tab()
    expect(document.activeElement).toBe(addButton)
    await user.tab()
    expect(document.activeElement).toBe(checkbox)
    await user.keyboard(' ')
    await waitFor(() => {
      expect(checkbox).toBeChecked()
    })
  })

  it('announces when task is added (live region)', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: 10,
          title: 'Announced task',
          completed: false,
          created_at: '2026-02-18T12:00:00Z',
          updated_at: '2026-02-18T12:00:00Z',
        }),
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /new task title/i })).toBeInTheDocument()
    })

    await user.type(screen.getByRole('textbox', { name: /new task title/i }), 'Announced task')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => {
      const liveRegion = screen.getByRole('status', { name: /live announcements/i })
      expect(liveRegion).toHaveTextContent('Task added')
    })
  })

  it('announces when task is marked complete (live region)', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const initialTasks = [
      {
        id: 1,
        title: 'Complete me',
        completed: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]
    const updatedTask = {
      id: 1,
      title: 'Complete me',
      completed: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-02-18T12:00:00Z',
    }
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: initialTasks }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedTask,
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /complete me/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('checkbox', { name: /complete me/i }))

    await waitFor(() => {
      const liveRegion = screen.getByRole('status', { name: /live announcements/i })
      expect(liveRegion).toHaveTextContent('Task marked complete')
    })
  })

  it('announces when task is marked incomplete (live region)', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const initialTasks = [
      {
        id: 1,
        title: 'Uncomplete me',
        completed: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]
    const updatedTask = {
      id: 1,
      title: 'Uncomplete me',
      completed: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-02-18T12:00:00Z',
    }
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: initialTasks }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedTask,
      })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /uncomplete me/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('checkbox', { name: /uncomplete me/i }))

    await waitFor(() => {
      const liveRegion = screen.getByRole('status', { name: /live announcements/i })
      expect(liveRegion).toHaveTextContent('Task marked incomplete')
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
