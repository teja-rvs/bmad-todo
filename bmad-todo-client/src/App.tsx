import { useState, useEffect, useCallback } from 'react'
import { fetchTasks, createTask, updateTask } from './api/tasks'
import type { Task } from './types/task'
import { AddRow } from './components/AddRow'
import { TaskList } from './components/TaskList'
import { EmptyState } from './components/EmptyState'
import './App.css'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completingId, setCompletingId] = useState<number | null>(null)
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  // Clear live region after a delay so repeated identical messages can be re-announced by AT (LOW #5).
  useEffect(() => {
    if (!liveAnnouncement) return
    const id = window.setTimeout(() => setLiveAnnouncement(''), 2000)
    return () => window.clearTimeout(id)
  }, [liveAnnouncement])

  useEffect(() => {
    let cancelled = false
    fetchTasks()
      .then((res) => {
        if (!cancelled) {
          setTasks(res.tasks)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tasks')
          setTasks([])
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleCreateTask = useCallback(
    (title: string) => {
      setIsSubmitting(true)
      setError(null)
      createTask(title)
        .then((created) => {
          setTasks((prev) => [created, ...prev])
          setLiveAnnouncement('Task added')
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Couldn't save. Try again.")
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    []
  )

  const handleCompleteTask = useCallback((id: number, completed: boolean) => {
    setError(null)
    setCompletingId(id)
    updateTask(id, { completed })
      .then((updated) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        )
        setLiveAnnouncement(completed ? 'Task marked complete' : 'Task marked incomplete')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Couldn't save. Try again.")
      })
      .finally(() => {
        setCompletingId(null)
      })
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Tasks</h1>
      </header>
      <main className="app-main">
        <AddRow
          onSubmit={handleCreateTask}
          isSubmitting={isSubmitting}
          errorDescriptionId={error ? 'app-error' : undefined}
        />
        {/* Live region for dynamic list updates (AC #3): new task and completion state announced to screen readers. */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Live announcements"
          className="sr-only"
        >
          {liveAnnouncement}
        </div>
        <div className="app-content">
          {isLoading && (
            <p className="loading" role="status" aria-live="polite" aria-label="Loading">
              Loading…
            </p>
          )}
          {!isLoading && error && (
            <p id="app-error" className="error" role="alert">
              {error}
            </p>
          )}
          {!isLoading && !error && tasks.length === 0 && <EmptyState />}
          {!isLoading && !error && tasks.length > 0 && (
            <TaskList tasks={tasks} onComplete={handleCompleteTask} completingId={completingId} />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
