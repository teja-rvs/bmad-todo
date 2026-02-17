/**
 * Add row at top of content. Placeholder only; POST in Story 2.2.
 */
export function AddRow() {
  return (
    <div className="flex gap-3 items-center min-h-[44px] py-2">
      <input
        type="text"
        placeholder="New task..."
        className="flex-1 min-h-[44px] px-4 rounded border border-[#8b7355]/40 bg-[#fefdfb] text-[#2c2419] text-[1.125rem] placeholder:text-[#2c2419]/50 focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2"
        aria-label="New task title"
        disabled
        readOnly
      />
      <button
        type="button"
        className="min-h-[44px] px-5 rounded bg-[#8b7355] text-[#fefdfb] font-medium text-[1.125rem] focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 disabled:opacity-50"
        aria-label="Add task"
        disabled
      >
        Add
      </button>
    </div>
  )
}
