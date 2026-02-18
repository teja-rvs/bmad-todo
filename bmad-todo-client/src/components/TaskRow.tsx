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
    <li className="flex items-center gap-3 py-5 min-h-[44px] min-w-0" role="listitem">
      <label className={`flex items-center gap-3 min-h-[44px] flex-1 min-w-0 ${isCompleting ? 'cursor-wait' : 'cursor-pointer'}`}>
        {/* 44×44px hit area for checkbox (WCAG 2.5.5); visible control remains 20×20. */}
        <span className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] flex-shrink-0 -m-2">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleChange}
            disabled={isCompleting}
            aria-label={task.title}
            aria-busy={isCompleting}
            className="w-5 h-5 rounded border-2 border-[#8b7355] accent-[#556b1c] cursor-pointer disabled:opacity-60 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b7355] focus-visible:ring-offset-2"
          />
        </span>
        <span
          className={`text-[1.125rem] min-w-0 break-words ${task.completed ? 'line-through text-[#556b1c]' : 'text-[#2c2419]'}`}
        >
          {task.title}
        </span>
      </label>
    </li>
  )
}
