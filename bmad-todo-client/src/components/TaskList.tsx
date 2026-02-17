import type { Task } from '../types/task'
import { TaskRow } from './TaskRow'

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <ul className="list-none p-0 m-0 flex flex-col gap-0" role="list" aria-label="Task list">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </ul>
  )
}
