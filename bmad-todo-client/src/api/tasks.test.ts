import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchTasks, getBaseUrl, createTask } from './tasks'

describe('getBaseUrl', () => {
  it('throws when VITE_API_URL is not set (empty string)', () => {
    expect(() => getBaseUrl({ VITE_API_URL: '' })).toThrow('VITE_API_URL is not set')
  })

  it('throws when VITE_API_URL is missing (undefined)', () => {
    expect(() => getBaseUrl({})).toThrow('VITE_API_URL is not set')
  })

  it('returns URL without trailing slash when given trailing slash', () => {
    expect(getBaseUrl({ VITE_API_URL: 'http://localhost:3000/' })).toBe('http://localhost:3000')
  })

  it('returns URL unchanged when no trailing slash', () => {
    expect(getBaseUrl({ VITE_API_URL: 'http://localhost:3000' })).toBe('http://localhost:3000')
  })
})

describe('fetchTasks', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls GET on baseUrl/tasks and returns tasks array', async () => {
    const mockTasks = [
      { id: 1, title: 'One', completed: false, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
    ]
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: mockTasks }),
    })

    const result = await fetchTasks()

    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/tasks$/), expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(result).toEqual({ tasks: mockTasks })
  })

  it('returns empty tasks array when API returns empty list', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: [] }),
    })

    const result = await fetchTasks()

    expect(result).toEqual({ tasks: [] })
  })

  it('throws when response is not ok', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(fetchTasks()).rejects.toThrow('Failed to fetch tasks: 500 Internal Server Error')
  })

  it('throws when response is missing tasks array', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    await expect(fetchTasks()).rejects.toThrow('Invalid response: missing tasks array')
  })

  it('throws user-friendly error when request times out (AbortError)', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(abortError)

    await expect(fetchTasks()).rejects.toThrow('Request timed out. Service may be unavailable.')
  })
})

describe('createTask', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('POSTs to /tasks with body { title } and returns created task on 201', async () => {
    const created = {
      id: 1,
      title: 'New task',
      completed: false,
      created_at: '2026-02-18T12:00:00Z',
      updated_at: '2026-02-18T12:00:00Z',
    }
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => created,
    })

    const result = await createTask('New task')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/tasks$/),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title: 'New task' }),
      })
    )
    expect(result).toEqual(created)
  })

  it('throws with clear message on 4xx (e.g. 422)', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ error: 'Title can\'t be blank' }),
    })

    await expect(createTask('')).rejects.toThrow("Title can't be blank")
  })

  it('throws with clear message on 5xx', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(createTask('Task')).rejects.toThrow(/Couldn't save|Try again/)
  })

  it('throws with clear message on network error', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'))

    await expect(createTask('Task')).rejects.toThrow(/Couldn't save|Try again/)
  })

  it('throws with backend message when errors[0] is object with message', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ errors: [{ message: 'Title is too long' }] }),
    })

    await expect(createTask('Task')).rejects.toThrow('Title is too long')
  })
})
