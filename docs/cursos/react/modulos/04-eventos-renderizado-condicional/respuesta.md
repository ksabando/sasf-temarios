---
sidebar_label: "Soluciones"
---

# Soluciones M04 — Eventos y Renderizado Condicional

## Ejercicio 1, 2, 3, 4, 5, 6 — App.tsx completo

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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
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

      {filteredTasks.length === 0 ? (
        <p>No hay tareas {filter !== 'all' ? filterLabels[filter].toLowerCase() : ''}</p>
      ) : (
        filteredTasks.map(task => (
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
- Mover `Badge` a su propio archivo `src/components/ui/Badge.tsx` para reutilización y testing independiente.
- Reemplazar los estilos inline con CSS modules (`App.module.css`) o Tailwind para mantener la separación de concerns.
- Extraer el form de creación de tareas a `src/components/tasks/AddTaskForm.tsx` con su propio estado interno, evitando re-renders de `App` al escribir.
- Usar `useMemo` para `filteredTasks` si `tasks` crece significativamente, evitando refiltrar en cada render.
- Agregar `e.stopPropagation()` en el botón "Eliminar" si la Card tuviera un `onClick` para seleccionar la tarea.
