---
sidebar_label: "Soluciones"
---

# Soluciones M09 — useReducer y Patrones de Estado

## `src/reducers/taskReducer.ts`

**Solución esperada**:

```tsx
import { Task } from '../App'

export interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
  filter: string
}

export type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: number; data: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTER'; payload: string }

export const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  filter: '',
}

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.data } : t
        ),
      }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    default:
      return state
  }
}
```

**Posibles mejoras**:
- Agregar exhaustiveness check con `const _exhaustive: never = action` en el `default` para que TypeScript detecte acciones no manejadas al compilar.
- Crear action creators tipados (`export const addTask = (task: Task) => ({ type: 'ADD_TASK' as const, payload: task })`) para evitar typos en los strings de type.
- Incluir estados adicionales como `saving` para operaciones async y `selectedTaskId` para edición.
- Usar Immer (`import { produce } from 'immer'`) dentro del reducer para simplificar las actualizaciones inmutables de objetos anidados.

---

## `src/context/TaskContext.tsx`

**Solución esperada**:

```tsx
import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react'
import { taskReducer, TaskState, TaskAction, initialState } from '../reducers/taskReducer'

interface TaskContextType {
  state: TaskState
  dispatch: Dispatch<TaskAction>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  return <TaskContext.Provider value={{ state, dispatch }}>{children}</TaskContext.Provider>
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTaskContext must be used within TaskProvider')
  return context
}
```

**Posibles mejoras**:
- Separar `state` y `dispatch` en dos contextos (`TaskStateContext` y `TaskDispatchContext`) para que componentes que solo despachan no se re-rendericen por cambios de estado.
- Memoizar el value del Provider con `useMemo(() => ({ state, dispatch }), [state, dispatch])` — aunque `dispatch` es estable, memoizar el objeto evita crear una nueva referencia si `state` no cambió.
- Agregar un middleware de logging envolviendo dispatch para debuggear el flujo de acciones en desarrollo.

---

## `src/App.tsx` (fragmento actualizado)

**Solución esperada**:

```tsx
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { useTaskContext } from './context/TaskContext'
import { taskService } from './services/taskService'
import TaskForm from './components/TaskForm'
import { TaskFormData } from './utils/validations'
import { useState } from 'react'

export default function App() {
  const { isAuthenticated, user, logout } = useAuth()
  const { state, dispatch } = useTaskContext()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })
    taskService
      .getAll()
      .then(data => dispatch({ type: 'SET_TASKS', payload: data }))
      .catch(err => dispatch({ type: 'SET_ERROR', payload: err.message }))
  }, [dispatch])

  const handleCreate = async (data: TaskFormData) => {
    try {
      const newTask = await taskService.create({
        title: data.title,
        description: data.description || '',
        completed: false,
      })
      dispatch({ type: 'ADD_TASK', payload: newTask })
      setShowForm(false)
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await taskService.remove(id)
      dispatch({ type: 'DELETE_TASK', payload: id })
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
    }
  }

  const filteredTasks = state.tasks.filter(t =>
    t.title.toLowerCase().includes(state.filter.toLowerCase())
  )

  if (!isAuthenticated) return <AuthScreen />
  if (state.loading) return <div className="text-center py-8">Cargando...</div>
  if (state.error) return <div className="bg-red-100 p-4 rounded">{state.error}</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">TaskFlow</h1>
          <div className="flex items-center gap-4">
            <input
              placeholder="Filtrar tareas..."
              value={state.filter}
              onChange={e => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
              className="px-3 py-1 border rounded-md text-sm"
            />
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:underline">Salir</button>
          </div>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md">
            + Nueva tarea
          </button>
        )}
        {showForm && <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
        <ul className="space-y-2 mt-4">
          {filteredTasks.map(task => (
            <li key={task.id} className="bg-white p-4 rounded-md shadow flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                {task.description && <p className="text-gray-600 text-sm">{task.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, data: { completed: !task.completed } } })}
                  className={`text-sm px-2 py-1 rounded ${task.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                  {task.completed ? '✓ Hecho' : 'Pendiente'}
                </button>
                <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:underline text-sm">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

**Posibles mejoras**:
- Usar action creators en lugar de objetos inline: `dispatch(addTask(newTask))` en vez de `dispatch({ type: 'ADD_TASK', payload: newTask })`.
- Agregar optimistic updates en toggle y delete: actualizar el estado con dispatch ANTES de la llamada API y revertir si falla.
- Manejar `error` como un toast/notificación temporal con auto-dismiss en lugar de un estado binario que bloquea toda la UI.
- Extraer la lógica de fetch + dispatch a un custom hook `useTaskActions` que encapsule las llamadas async y exponga solo funciones de alto nivel.

---

## `src/main.tsx` (actualizado)

**Solución esperada**:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { TaskProvider } from './context/TaskContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <TaskProvider>
        <App />
      </TaskProvider>
    </AuthProvider>
  </React.StrictMode>
)
```

**Posibles mejoras**:
- Invertir el orden de los providers según frecuencia de actualización (el que más cambia más abajo, más cerca de las hojas) por convención de React.
- Crear un `AppProviders` que componga todos los providers anidados para mantener `main.tsx` limpio.
- Agregar un `ErrorBoundary` como wrapper final para capturar errores no controlados en toda la app.
