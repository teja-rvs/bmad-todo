export function EmptyState() {
  return (
    <div className="py-8 text-center max-w-full min-w-0" role="status" aria-live="polite">
      <h2 className="text-[#2c2419] text-[1.125rem] mb-6 font-normal break-words">No tasks yet</h2>
      <p className="text-[#2c2419] text-base break-words">
        Use the add row above to create your first task.
      </p>
    </div>
  )
}
