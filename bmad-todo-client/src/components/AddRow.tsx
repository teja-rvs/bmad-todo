import { useState, useRef, useCallback } from 'react'

export interface AddRowProps {
  /** Called when user submits a non-empty trimmed title (Enter or Add button). */
  onSubmit: (title: string) => void
  /** When true, Add button can be disabled to show loading state. */
  isSubmitting?: boolean
  /** Optional id of the element that describes the form (e.g. error message) for accessibility. */
  errorDescriptionId?: string
}

export function AddRow({ onSubmit, isSubmitting = false, errorDescriptionId }: AddRowProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed === '') return
      onSubmit(trimmed)
      setValue('')
      inputRef.current?.focus()
    },
    [value, onSubmit]
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 items-center min-h-[44px] py-2"
      aria-describedby={errorDescriptionId || undefined}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Add a task…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 min-h-[44px] px-4 rounded border border-[#8b7355]/40 bg-[#fefdfb] text-[#2c2419] text-[1.125rem] placeholder:text-[#2c2419]/50 focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2"
        aria-label="New task title"
      />
      <button
        type="submit"
        className="min-h-[44px] px-5 rounded bg-[#8b7355] text-[#fefdfb] font-medium text-[1.125rem] focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 disabled:opacity-50"
        aria-label="Add task"
        disabled={isSubmitting}
      >
        Add
      </button>
    </form>
  )
}
