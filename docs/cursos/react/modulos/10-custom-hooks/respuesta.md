---
sidebar_label: "Soluciones"
---

# Soluciones M10 — Custom Hooks

## `src/hooks/useAuth.ts`

**Solución esperada**:

```tsx
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

**Posibles mejoras**:
- Agregar un overload o check adicional para `isAuthenticated` que haga narrowing de `user` a `User` (no `User | null`) cuando está autenticado.
- Incluir un helper `requireAuth()` que lance si no está autenticado, útil para rutas protegidas.
- Agregar soporte para `useSyncExternalStore` si se migra a un store externo, manteniendo la misma API pública.

---

## `src/hooks/useTasks.ts`

**Solución esperada**:

```tsx
import { useCallback, useEffect } from 'react'
import { useTaskContext } from '../context/TaskContext'
import { taskService } from '../services/taskService'
import { TaskFormData } from '../utils/validations'
import { Task } from '../App'

export function useTasks() {
  const { state, dispatch } = useTaskContext()

  const fetchTasks = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await taskService.getAll()
      dispatch({ type: 'SET_TASKS', payload: data })
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
    }
  }, [dispatch])

  const addTask = useCallback(async (data: TaskFormData) => {
    try {
      const newTask = await taskService.create({
        title: data.title,
        description: data.description || '',
        completed: false,
      })
      dispatch({ type: 'ADD_TASK', payload: newTask })
      return newTask
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      throw err
    }
  }, [dispatch])

  const updateTask = useCallback(async (id: number, data: Partial<Task>) => {
    try {
      const updated = await taskService.update(id, data)
      dispatch({ type: 'UPDATE_TASK', payload: { id, data: updated } })
      return updated
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      throw err
    }
  }, [dispatch])

  const deleteTask = useCallback(async (id: number) => {
    try {
      await taskService.remove(id)
      dispatch({ type: 'DELETE_TASK', payload: id })
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
    }
  }, [dispatch])

  const setFilter = useCallback((filter: string) => {
    dispatch({ type: 'SET_FILTER', payload: filter })
  }, [dispatch])

  const filteredTasks = state.tasks.filter(t =>
    t.title.toLowerCase().includes(state.filter.toLowerCase())
  )

  useEffect(() => { fetchTasks() }, [fetchTasks])

  return {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    filter: state.filter,
    filteredTasks,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    setFilter,
  }
}
```

**Posibles mejoras**:
- Agregar `clearError` dispatch para que el usuario pueda descartar mensajes de error manualmente.
- Implementar optimistic updates en `updateTask` y `deleteTask`: dispatch primero la acción, luego llamar API, revertir si falla.
- Retornar también un `isRefetching` separado de `loading` para indicar recargas en background sin bloquear la UI.
- Memoizar `filteredTasks` con `useMemo` si la lista crece significativamente.

---

## `src/hooks/useDebounce.ts`

**Solución esperada**:

```tsx
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

**Posibles mejoras**:
- Agregar un tercer parámetro opcional `onDebounce?: (value: T) => void` como callback cuando el valor se estabiliza.
- Usar `useRef` para el timer en lugar de variable local para hacer el hook más robusto ante cambios rápidos de `delay`.
- Devolver también un `isDebouncing: boolean` para mostrar indicadores de carga en búsquedas.

---

## `src/hooks/useLocalStorage.ts`

**Solución esperada**:

```tsx
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      console.error('Error writing to localStorage')
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
```

**Posibles mejoras**:
- Soportar un setter funcional como `useState`: `setStoredValue((prev: T) => newVal)`.
- Escuchar el evento `storage` de `window` para sincronizar cambios de `localStorage` entre pestañas del navegador.
- Agregar un tercer parámetro `serialize?: (val: T) => string` y `deserialize?: (str: string) => T` para soportar formatos no-JSON.

---

## `src/App.tsx` (refactorizado)

**Solución esperada**:

```tsx
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useDebounce } from './hooks/useDebounce'
import TaskForm from './components/TaskForm'
import AuthScreen from './components/AuthScreen'

export default function App() {
  const { isAuthenticated, user, logout } = useAuth()
  const { tasks, loading, error, filteredTasks, addTask, deleteTask, updateTask, setFilter } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  // Aplicar filtro al cambiar debouncedSearch
  if (debouncedSearch !== search) {
    setFilter(debouncedSearch)
  }

  if (!isAuthenticated) return <AuthScreen />
  if (loading) return <div className="text-center py-8 text-gray-500">Cargando tareas...</div>
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded max-w-2xl mx-auto mt-8">{error}</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">TaskFlow</h1>
          <div className="flex items-center gap-4">
            <input
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            />
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:underline">Salir</button>
          </div>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            + Nueva tarea
          </button>
        )}
        {showForm && <TaskForm onSubmit={data => addTask(data).then(() => setShowForm(false))} onCancel={() => setShowForm(false)} />}
        <p className="text-sm text-gray-500 mb-2">{filteredTasks.length} de {tasks.length} tareas</p>
        <ul className="space-y-2">
          {filteredTasks.map(task => (
            <li key={task.id} className="bg-white p-4 rounded-md shadow flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                {task.description && <p className="text-gray-600 text-sm">{task.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateTask(task.id, { completed: !task.completed })}
                  className={`text-sm px-2 py-1 rounded ${task.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                  {task.completed ? '✓ Hecho' : 'Pendiente'}
                </button>
                <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:underline text-sm">Eliminar</button>
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
- Mover la lógica de `debouncedSearch` + `setFilter` a un `useEffect` con dependencias, evitando la mutación condicional en el render.
- Extraer la lista de tareas a un componente `TaskList` que reciba props, reduciendo líneas en `App`.
- Agregar `useCallback` en los handlers de `onSubmit` para evitar recrear funciones inline en cada render.
- Manejar el caso donde `addTask(data).then(...)` podría fallar con un toast en lugar de dejar el formulario abierto o cerrado.

---

## `src/components/AuthScreen.tsx`

**Solución esperada**:

```tsx
// Extraído de App.tsx módulo 08 - formulario login/register
```

**Posibles mejoras**:
- Usar React Hook Form + Zod para la validación del formulario de autenticación, consistente con el TaskForm.
- Agregar `autoComplete="email"` y `autoComplete="current-password"` en los inputs para mejor UX.
- Incluir un link de "Olvidé mi contraseña" (aunque no implementado) para preparar la UI para futuras funcionalidades.
