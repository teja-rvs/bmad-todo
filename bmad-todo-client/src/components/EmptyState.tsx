export function EmptyState() {
  return (
    <div className="py-8 text-center" role="status" aria-live="polite">
      <h2 className="text-[#2c2419] text-[1.125rem] mb-6 font-normal">No tasks yet</h2>
      <p className="text-[#2c2419] text-base">
        Use the add row above to create your first task.
      </p>
    </div>
  )
}
