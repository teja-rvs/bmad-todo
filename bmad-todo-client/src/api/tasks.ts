import type { Task, TasksResponse } from '../types/task'

/** Resolves API base URL from env. Optional env param for unit tests only. */
export function getBaseUrl(env?: { VITE_API_URL?: string }): string {
  const source = env ?? import.meta.env
  const url = source.VITE_API_URL
  if (typeof url !== 'string' || url === '') {
    throw new Error('VITE_API_URL is not set')
  }
  return url.replace(/\/$/, '')
}

const FETCH_TIMEOUT_MS = 10_000

/** User-facing message when load fails (network, timeout, 5xx) per NFR-R2. */
export const LOAD_ERROR_MESSAGE = 'Service unavailable. Couldn\'t load tasks. Try again.'

/**
 * Fetches the task list from GET /tasks.
 * Returns { tasks: [] } on empty; throws with user-facing message on network, timeout, or 5xx.
 */
export async function fetchTasks(): Promise<TasksResponse> {
  const baseUrl = getBaseUrl()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(`${baseUrl}/tasks`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      if (res.status >= 500) {
        throw new Error(LOAD_ERROR_MESSAGE)
      }
      // 4xx (e.g. 401, 403, 404): surface user-facing message per NFR-R2
      throw new Error(LOAD_ERROR_MESSAGE)
    }
    const data = (await res.json()) as TasksResponse
    if (!data || typeof data.tasks === 'undefined') {
      throw new Error('Invalid response: missing tasks array')
    }
    return { tasks: data.tasks }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err && typeof err === 'object' && (err as Error).name === 'AbortError') {
      throw new Error(LOAD_ERROR_MESSAGE)
    }
    if (err instanceof Error && err.message === LOAD_ERROR_MESSAGE) {
      throw err
    }
    if (err instanceof Error && err.message.startsWith('Invalid response:')) {
      throw err
    }
    throw new Error(LOAD_ERROR_MESSAGE)
  }
}

const SAVE_ERROR_MESSAGE = "Couldn't save. Try again."

/** User-facing message for create/update when server or network is unavailable (NFR-R2). */
export const SAVE_SERVICE_UNAVAILABLE = "Service unavailable. Couldn't save. Try again."

const USER_FACING_MESSAGE = Symbol('userFacingMessage')

/**
 * Creates a task via POST /tasks. On 201 returns the created task (snake_case).
 * On 4xx/5xx or network error, throws with a clear user-facing message.
 */
export async function createTask(title: string): Promise<Task> {
  const baseUrl = getBaseUrl()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (res.status === 201) {
      const data = (await res.json()) as Task
      if (!data || typeof data.id === 'undefined' || typeof data.title === 'undefined') {
        throw new Error(SAVE_ERROR_MESSAGE)
      }
      const task: Task = {
        id: data.id,
        title: data.title,
        completed: typeof data.completed === 'boolean' ? data.completed : false,
        created_at: typeof data.created_at === 'string' ? data.created_at : new Date().toISOString(),
        updated_at: typeof data.updated_at === 'string' ? data.updated_at : new Date().toISOString(),
      }
      return task
    }
    if (res.status >= 500) {
      throw new Error(SAVE_SERVICE_UNAVAILABLE)
    }
    const body = await res.json().catch(() => ({})) as { error?: string; errors?: unknown[] }
    const first = body?.errors?.[0]
    const message =
      typeof body?.error === 'string'
        ? body.error
        : typeof first === 'object' && first !== null && 'message' in first && typeof (first as { message: unknown }).message === 'string'
          ? (first as { message: string }).message
          : typeof first === 'string'
            ? first
            : SAVE_ERROR_MESSAGE
    const userError = new Error(message) as Error & { [USER_FACING_MESSAGE]?: boolean }
    userError[USER_FACING_MESSAGE] = true
    throw userError
  } catch (err) {
    clearTimeout(timeoutId)
    if (err && typeof err === 'object' && (err as Error).name === 'AbortError') {
      throw new Error(SAVE_SERVICE_UNAVAILABLE)
    }
    if (err && typeof err === 'object' && (err as Error & { [USER_FACING_MESSAGE]?: boolean })[USER_FACING_MESSAGE]) {
      throw err
    }
    if (err instanceof Error) {
      throw new Error(SAVE_ERROR_MESSAGE)
    }
    throw new Error(SAVE_ERROR_MESSAGE)
  }
}

/**
 * Updates a task via PATCH /tasks/:id. On 200 returns the updated task (snake_case).
 * On 404 or 4xx/5xx or network error, throws with a clear user-facing message.
 */
export async function updateTask(id: number, payload: { completed: boolean }): Promise<Task> {
  const baseUrl = getBaseUrl()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(`${baseUrl}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: payload.completed }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (res.status === 200) {
      const data = (await res.json()) as Task
      if (!data || typeof data.id === 'undefined' || typeof data.title === 'undefined') {
        throw new Error(SAVE_ERROR_MESSAGE)
      }
      const task: Task = {
        id: data.id,
        title: data.title,
        completed: typeof data.completed === 'boolean' ? data.completed : false,
        created_at: typeof data.created_at === 'string' ? data.created_at : new Date().toISOString(),
        updated_at: typeof data.updated_at === 'string' ? data.updated_at : new Date().toISOString(),
      }
      return task
    }
    if (res.status >= 500) {
      throw new Error(SAVE_SERVICE_UNAVAILABLE)
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    const message = typeof body?.error === 'string' ? body.error : SAVE_ERROR_MESSAGE
    const userError = new Error(message) as Error & { [USER_FACING_MESSAGE]?: boolean }
    userError[USER_FACING_MESSAGE] = true
    throw userError
  } catch (err) {
    clearTimeout(timeoutId)
    if (err && typeof err === 'object' && (err as Error).name === 'AbortError') {
      throw new Error(SAVE_SERVICE_UNAVAILABLE)
    }
    if (err && typeof err === 'object' && (err as Error & { [USER_FACING_MESSAGE]?: boolean })[USER_FACING_MESSAGE]) {
      throw err
    }
    if (err instanceof Error) {
      throw new Error(SAVE_ERROR_MESSAGE)
    }
    throw new Error(SAVE_ERROR_MESSAGE)
  }
}
