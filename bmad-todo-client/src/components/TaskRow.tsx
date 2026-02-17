import type { Task } from '../types/task'

interface TaskRowProps {
  task: Task
}

export function TaskRow({ task }: TaskRowProps) {
  return (
    <li className="flex items-center gap-3 py-5 min-h-[44px]">
      <span
        className="flex-shrink-0 w-5 h-5 rounded border-2 border-[#8b7355] flex items-center justify-center"
        aria-hidden
      >
        {task.completed && (
          <span className="text-[#6b8e23] text-sm leading-none" aria-hidden>✓</span>
        )}
      </span>
      <span
        className={`text-[#2c2419] text-[1.125rem] ${task.completed ? 'line-through opacity-70' : ''}`}
      >
        {task.title}
      </span>
    </li>
  )
}
