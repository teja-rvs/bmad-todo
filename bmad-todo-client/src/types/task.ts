/**
 * Task type matching API response from GET /tasks.
 * API returns snake_case keys; we use snake_case in the type to match.
 */
export interface Task {
  id: number
  title: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface TasksResponse {
  tasks: Task[]
}
