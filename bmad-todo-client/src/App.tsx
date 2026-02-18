import { useState, useEffect, useCallback } from 'react'
import { fetchTasks, createTask } from './api/tasks'
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
          {!isLoading && !error && tasks.length > 0 && <TaskList tasks={tasks} />}
        </div>
      </main>
    </div>
  )
}

export default App
