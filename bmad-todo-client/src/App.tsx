import { useState, useEffect, useCallback } from 'react'
import { fetchTasks, createTask, updateTask } from './api/tasks'
import type { Task } from './types/task'
import { AddRow } from './components/AddRow'
import { TaskList } from './components/TaskList'
import { EmptyState } from './components/EmptyState'
import './App.css'

function App() {
  type FailedAction = 'load' | { type: 'create'; title: string } | { type: 'complete'; id: number; completed: boolean }

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFailedAction, setLastFailedAction] = useState<FailedAction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completingId, setCompletingId] = useState<number | null>(null)
  const [liveAnnouncement, setLiveAnnouncement] = useState('')

  // Clear live region after a delay so repeated identical messages can be re-announced by AT (LOW #5).
  useEffect(() => {
    if (!liveAnnouncement) return
    const id = window.setTimeout(() => setLiveAnnouncement(''), 2000)
    return () => window.clearTimeout(id)
  }, [liveAnnouncement])

  const loadTasks = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setLastFailedAction(null)
    fetchTasks()
      .then((res) => {
        setTasks(res.tasks)
        setError(null)
        setLastFailedAction(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load tasks')
        setTasks([])
        setLastFailedAction('load')
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // SPA data strategy (AC #2): after create/complete, merge from API response; no full-page reload.
  const handleCreateTask = useCallback(
    (title: string) => {
      setIsSubmitting(true)
      setError(null)
      setLastFailedAction(null)
      createTask(title)
        .then((created) => {
          setTasks((prev) => [created, ...prev])
          setLiveAnnouncement('Task added')
          setError(null)
          setLastFailedAction(null)
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Couldn't save. Try again.")
          setLastFailedAction({ type: 'create', title })
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    []
  )

  const handleCompleteTask = useCallback((id: number, completed: boolean) => {
    setError(null)
    setLastFailedAction(null)
    setCompletingId(id)
    updateTask(id, { completed })
      .then((updated) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        )
        setLiveAnnouncement(completed ? 'Task marked complete' : 'Task marked incomplete')
        setError(null)
        setLastFailedAction(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Couldn't save. Try again.")
        setLastFailedAction({ type: 'complete', id, completed })
      })
      .finally(() => {
        setCompletingId(null)
      })
  }, [])

  const handleRetry = useCallback(() => {
    if (lastFailedAction === null || lastFailedAction === 'load') {
      loadTasks()
      return
    }
    if (lastFailedAction.type === 'create') {
      handleCreateTask(lastFailedAction.title)
      return
    }
    handleCompleteTask(lastFailedAction.id, lastFailedAction.completed)
  }, [lastFailedAction, loadTasks, handleCreateTask, handleCompleteTask])

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
        {/* Live region for dynamic list updates (accessibility): new task and completion state announced to screen readers. */}
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
            <div id="app-error" className="error" role="alert">
              <p>{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="retry-button"
                aria-label="Try again"
              >
                Try again
              </button>
            </div>
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
