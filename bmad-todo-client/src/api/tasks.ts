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

/**
 * Fetches the task list from GET /tasks.
 * Returns { tasks: [] } on empty; throws on network, timeout, or non-2xx.
 */
export async function fetchTasks(): Promise<TasksResponse> {
  const baseUrl = getBaseUrl()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(`${baseUrl}/tasks`, { signal: controller.signal })
    clearTimeout(timeoutId)
    if (!res.ok) {
      throw new Error(`Failed to fetch tasks: ${res.status} ${res.statusText}`)
    }
    const data = (await res.json()) as TasksResponse
    if (!data || typeof data.tasks === 'undefined') {
      throw new Error('Invalid response: missing tasks array')
    }
    return { tasks: data.tasks }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err && typeof err === 'object' && (err as Error).name === 'AbortError') {
      throw new Error('Request timed out. Service may be unavailable.')
    }
    throw err
  }
}

const CREATE_ERROR_MESSAGE = "Couldn't save. Try again."

const CREATE_TASK_USER_MESSAGE = Symbol('createTaskUserMessage')

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
        throw new Error(CREATE_ERROR_MESSAGE)
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
    const body = await res.json().catch(() => ({})) as { error?: string; errors?: unknown[] }
    const first = body?.errors?.[0]
    const message =
      typeof body?.error === 'string'
        ? body.error
        : typeof first === 'object' && first !== null && 'message' in first && typeof (first as { message: unknown }).message === 'string'
          ? (first as { message: string }).message
          : typeof first === 'string'
            ? first
            : CREATE_ERROR_MESSAGE
    const userError = new Error(message) as Error & { [CREATE_TASK_USER_MESSAGE]?: boolean }
    userError[CREATE_TASK_USER_MESSAGE] = true
    throw userError
  } catch (err) {
    clearTimeout(timeoutId)
    if (err && typeof err === 'object' && (err as Error).name === 'AbortError') {
      throw new Error('Request timed out. Service may be unavailable.')
    }
    if (err && typeof err === 'object' && (err as Error & { [CREATE_TASK_USER_MESSAGE]?: boolean })[CREATE_TASK_USER_MESSAGE]) {
      throw err
    }
    if (err instanceof Error) {
      throw new Error(CREATE_ERROR_MESSAGE)
    }
    throw new Error(CREATE_ERROR_MESSAGE)
  }
}
