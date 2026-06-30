---
sidebar_label: "Soluciones"
---

# Soluciones M05 — Listas y Keys

## App.tsx completo con todos los ejercicios

**Solución esperada**:

`src/App.tsx`:

```tsx
import { useState } from 'react'
import Layout from './components/layout/Layout'
import Card from './components/ui/Card'
import Button from './components/ui/Button'
import { useTaskList } from './hooks/useTaskList'
import type { Task } from './types/task'

type Filter = 'all' | 'pending' | 'completed'

const sampleTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: 'Comprar víveres',
    description: 'Leche, pan, huevos, verduras',
    completed: false,
    createdAt: new Date('2026-06-20'),
  },
  {
    id: crypto.randomUUID(),
    title: 'Estudiar React',
    description: 'Repasar hooks y componentes',
    completed: false,
    createdAt: new Date('2026-06-22'),
  },
  {
    id: crypto.randomUUID(),
    title: 'Hacer ejercicio',
    description: '30 minutos de cardio',
    completed: true,
    createdAt: new Date('2026-06-18'),
  },
]

function Badge({ completed }: { completed: boolean }) {
  return (
    <span style={{ color: completed ? 'green' : 'red', fontWeight: 'bold' }}>
      {completed ? 'Completada' : 'Pendiente'}
    </span>
  )
}

function App() {
  const { tasks, addTask, toggleTask, deleteTask } = useTaskList(sampleTasks)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim()) return
    addTask({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date(),
    })
    setTitle('')
    setDescription('')
  }

  function handleDelete(id: string) {
    if (window.confirm('¿Eliminar tarea?')) {
      deleteTask(id)
    }
  }

  const pendingCount = tasks.filter(t => !t.completed).length
  const totalCount = tasks.length

  const displayedTasks = tasks
    .filter(task => task.title.toLowerCase().includes(search.toLowerCase()))
    .filter(task => {
      if (filter === 'pending') return !task.completed
      if (filter === 'completed') return task.completed
      return true
    })
    .sort((a, b) => {
      if (a.completed === b.completed) return b.createdAt.getTime() - a.createdAt.getTime()
      return a.completed ? 1 : -1
    })

  const filters: Filter[] = ['all', 'pending', 'completed']
  const filterLabels: Record<Filter, string> = {
    all: 'Todas',
    pending: 'Pendientes',
    completed: 'Completadas',
  }

  return (
    <Layout>
      <h2>Mis Tareas</h2>
      <p>{pendingCount} pendientes de {totalCount} totales</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <Button type="submit">Agregar</Button>
      </form>

      <input
        type="text"
        placeholder="Buscar tareas..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '1rem', width: '100%' }}
      />

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        {filters.map(f => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            onClick={() => setFilter(f)}
          >
            {filterLabels[f]}
          </Button>
        ))}
      </div>

      {displayedTasks.length === 0 ? (
        <p>No hay tareas {filter !== 'all' ? filterLabels[filter].toLowerCase() : ''}</p>
      ) : (
        displayedTasks.map(task => (
          <Card key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <small>{task.createdAt.toLocaleDateString()}</small>
            <br />
            <Badge completed={task.completed} />
            <br />
            <Button variant="secondary" onClick={() => toggleTask(task.id)}>
              {task.completed ? 'Reabrir' : 'Completar'}
            </Button>
            <Button variant="danger" onClick={() => handleDelete(task.id)}>
              Eliminar
            </Button>
          </Card>
        ))
      )}
    </Layout>
  )
}

export default App
```

**Posibles mejoras**:
- Envolver `displayedTasks`, `pendingCount` y `totalCount` en `useMemo` con dependencias `[tasks, search, filter]` para evitar recomputación en renders no relacionados.
- Usar debounce (via `useEffect` + `setTimeout` o librería) en el `search` para no filtrar en cada pulsación de tecla con listas grandes.
- Normalizar strings con `.normalize('NFD')` y eliminar diacríticos para búsqueda insensitive a tildes además de mayúsculas/minúsculas.
- Mover los filtros y pipeline a un custom hook `useTaskFilter(tasks)` que encapsule búsqueda, filtro y orden, retornando `displayedTasks` y `stats`.
- Agregar `aria-live="polite"` en el contenedor de resultados y un mensaje invisible para lectores de pantalla que anuncie "Mostrando X de Y tareas" al cambiar filtros.
