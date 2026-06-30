---
sidebar_label: "Soluciones"
---

# Soluciones M07 — Efectos y Peticiones HTTP

## `src/services/api.ts`

**Solución esperada**:

```tsx
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api
```

**Posibles mejoras**:
- Leer `baseURL` de una variable de entorno `import.meta.env.VITE_API_URL` para no hardcodear la URL.
- Agregar un interceptor de request que incluya un token JWT desde localStorage o un contexto de autenticación.
- Crear una instancia separada sin interceptores para llamadas de autenticación (refresh token) y evitar loops en interceptores.

---

## `src/services/taskService.ts`

**Solución esperada**:

```tsx
import api from './api'
import { Task } from '../App'

export const taskService = {
  getAll: () => api.get<Task[]>('/tasks').then(res => res.data),

  create: (data: Omit<Task, 'id'>) =>
    api.post<Task>('/tasks', data).then(res => res.data),

  update: (id: number, data: Partial<Task>) =>
    api.put<Task>(`/tasks/${id}`, data).then(res => res.data),

  remove: (id: number) => api.delete(`/tasks/${id}`),
}
```

**Posibles mejoras**:
- Tipar `create` con un DTO específico (`TaskCreateDTO`) en lugar de `Omit<Task, 'id'>` para separar la interfaz de API de la del dominio.
- Agregar un parámetro `signal?: AbortSignal` a cada método para soportar cancelación de peticiones desde los componentes.
- Agregar `timeout` por método usando `api.get('/tasks', { timeout: 5000 })` para requests que deben responder rápido.

---

## `src/App.tsx`

**Solución esperada**:

```tsx
import { useState, useEffect } from 'react'
import { taskService } from './services/taskService'
import TaskForm from './components/TaskForm'
import { TaskFormData } from './utils/validations'

export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    taskService
      .getAll()
      .then(setTasks)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (data: TaskFormData) => {
    try {
      const newTask = await taskService.create({
        title: data.title,
        description: data.description || '',
        completed: false,
      })
      setTasks(prev => [...prev, newTask])
      setShowForm(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await taskService.remove(id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Cargando tareas...</div>
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded max-w-2xl mx-auto mt-8">{error}</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">TaskFlow</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            + Nueva tarea
          </button>
        )}
        {showForm && <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
        <ul className="space-y-2 mt-4">
          {tasks.map(task => (
            <li key={task.id} className="bg-white p-4 rounded-md shadow flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                {task.description && <p className="text-gray-600 text-sm">{task.description}</p>}
              </div>
              <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:underline text-sm">
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

**Posibles mejoras**:
- Reemplazar `useState` + `useEffect` por React Query (`useQuery` para GET, `useMutation` para POST/DELETE) para manejo automático de caching, loading, error y refetch.
- Usar `AbortController` en el `useEffect` para cancelar la petición si el componente se desmonta antes de que termine.
- Implementar optimistic updates en `handleDelete`: remover la tarea del estado antes de la llamada API y revertir si falla.
- Agregar un botón de "Reintentar" en el estado de error que vuelva a llamar `fetchTasks()`.
