import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'dwt-todo-items'

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'completed'

  // Persist to localStorage whenever the list changes.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.done)
    if (filter === 'completed') return todos.filter((t) => t.done)
    return todos
  }, [todos, filter])

  const remaining = todos.filter((t) => !t.done).length

  function addTodo(event) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, done: false },
    ])
    setText('')
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done))
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>To-Do List</h1>
        <p className="subtitle">PWA lab — Dynamic Web Technologies</p>
      </header>

      <form className="add-form" onSubmit={addTodo}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="New to-do item"
        />
        <button type="submit">Add</button>
      </form>

      {visibleTodos.length === 0 ? (
        <p className="empty">Nothing here yet — add your first task above.</p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <li key={todo.id} className={todo.done ? 'done' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className="text">{todo.text}</span>
              </label>
              <button
                className="delete"
                onClick={() => deleteTodo(todo.id)}
                aria-label={`Delete ${todo.text}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="app-footer">
        <span>
          {remaining} of {todos.length} remaining
        </span>
        <div className="filters">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="clear" onClick={clearCompleted} disabled={remaining === todos.length}>
          Clear completed
        </button>
      </footer>
    </main>
  )
}
