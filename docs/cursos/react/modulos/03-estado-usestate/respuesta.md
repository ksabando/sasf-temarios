---
sidebar_label: "Soluciones"
---

# Soluciones M03 — Estado con useState

## Ejercicio 1 — types/task.ts

**Solución esperada**:

`src/types/task.ts`:

```tsx
export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: Date
}
```

**Posibles mejoras**:
- Agregar campos como `priority?: 'low' | 'medium' | 'high'` y `tags?: string[]` para enriquecer el modelo de datos desde el inicio.
- Definir `export type TaskFormData = Omit<Task, 'id' | 'createdAt'>` para formularios de creación.
- Usar `createdAt: string` (ISO 8601) en lugar de `Date` para serialización JSON segura en localStorage o APIs.

---

## Ejercicio 2 — hooks/useTaskList.ts

**Solución esperada**:

`src/hooks/useTaskList.ts`:

```tsx
import { useState } from 'react'
import { Task } from '../types/task'

export function useTaskList(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const addTask = (task: Task) => setTasks(prev => [...prev, task])

  const toggleTask = (id: string) =>
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    )

  const deleteTask = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id))

  return { tasks, addTask, toggleTask, deleteTask }
}
```

**Posibles mejoras**:
- Agregar `updateTask` para editar campos de una tarea existente, usando el mismo patrón de inmutabilidad.
- Incluir `clearCompleted` y `getStats` (contador de pendientes/completadas) como parte del hook.
- Envolver `addTask`, `toggleTask`, `deleteTask` en `useCallback` si este hook se usa en un context para evitar re-renders de consumidores.

---

## Ejercicio 3 y 4 — App.tsx

**Solución esperada**:

`src/App.tsx`:

```tsx
import Layout from './components/layout/Layout'
import Card from './components/ui/Card'
import { useTaskList } from './hooks/useTaskList'

const sampleTasks = [
  {
    id: '1',
    title: 'Comprar víveres',
    description: 'Leche, pan, huevos, verduras',
    completed: false,
    createdAt: new Date('2026-06-20'),
  },
  {
    id: '2',
    title: 'Estudiar React',
    description: 'Repasar hooks y componentes',
    completed: false,
    createdAt: new Date('2026-06-22'),
  },
  {
    id: '3',
    title: 'Hacer ejercicio',
    description: '30 minutos de cardio',
    completed: true,
    createdAt: new Date('2026-06-18'),
  },
]

function App() {
  const { tasks } = useTaskList(sampleTasks)

  return (
    <Layout>
      <h2>Mis Tareas</h2>
      {tasks.map(task => (
        <Card key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <small>{task.createdAt.toLocaleDateString()}</small>
          <p>Estado: {task.completed ? 'Completada' : 'Pendiente'}</p>
        </Card>
      ))}
    </Layout>
  )
}

export default App
```

**Posibles mejoras**:
- Extraer `sampleTasks` a un archivo `src/data/sampleTasks.ts` para mantener `App.tsx` enfocado en composición.
- Agregar indicadores visuales: tachar el título con `text-decoration: line-through` cuando `task.completed` es true.
- Mostrar un mensaje de "No hay tareas" (`tasks.length === 0 && <p>No hay tareas</p>`) como estado vacío.

---

## Ejercicio 5 — Verificar en navegador

**Solución esperada**:

```bash
npm run dev
```

Abrir `http://localhost:5173`. Deben verse las 3 tareas en pantalla dentro del Layout.

**Posibles mejoras**:
- Agregar un script `npm run dev -- --open` para que Vite abra el navegador automáticamente.
- Usar React DevTools para inspeccionar el estado de `useTaskList` y verificar que las tareas se renderizan correctamente en el árbol de componentes.
- Configurar `vite.config.ts` con `server: { port: 3000 }` para unificar el puerto con otros proyectos del ecosistema.
