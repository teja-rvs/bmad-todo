import type { Task } from '../types/task'

interface TaskRowProps {
  task: Task
  onComplete?: (taskId: number, completed: boolean) => void
  /** When true, checkbox is disabled (e.g. PATCH in flight) to avoid race on rapid toggles. */
  isCompleting?: boolean
}

export function TaskRow({ task, onComplete, isCompleting }: TaskRowProps) {
  const handleChange = () => {
    onComplete?.(task.id, !task.completed)
  }

  return (
    <li className="flex items-center gap-3 py-5 min-h-[44px]">
      <label className={`flex items-center gap-3 min-h-[44px] flex-1 ${isCompleting ? 'cursor-wait' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleChange}
          disabled={isCompleting}
          aria-label={task.title}
          aria-busy={isCompleting}
          className="flex-shrink-0 w-5 h-5 rounded border-2 border-[#8b7355] accent-[#6b8e23] cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        />
        <span
          className={`text-[1.125rem] ${task.completed ? 'line-through text-[#6b8e23]' : 'text-[#2c2419]'}`}
        >
          {task.title}
        </span>
      </label>
    </li>
  )
}
