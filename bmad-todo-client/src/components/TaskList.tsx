import type { Task } from '../types/task'
import { TaskRow } from './TaskRow'

interface TaskListProps {
  tasks: Task[]
  onComplete?: (taskId: number, completed: boolean) => void
  /** Id of task currently being updated (checkbox disabled for that row). */
  completingId?: number | null
}

export function TaskList({ tasks, onComplete, completingId }: TaskListProps) {
  return (
    <ul className="list-none p-0 m-0 flex flex-col gap-0" role="list" aria-label="Task list">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onComplete={onComplete}
          isCompleting={completingId === task.id}
        />
      ))}
    </ul>
  )
}
