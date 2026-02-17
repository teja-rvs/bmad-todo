import type { TasksResponse } from '../types/task'

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL
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
