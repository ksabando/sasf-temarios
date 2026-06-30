---
sidebar_label: "Clase"
---

## 2. onChange con TypeScript

```tsx
function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setTitle(e.target.value)
}

<input
  type="text"
  value={title}
  onChange={handleTitleChange}
  placeholder="Título de la tarea"
/>
```

---

## 3. onSubmit en formularios

```tsx
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault() // Evita recargar la página
  addTask({ id: crypto.randomUUID(), title, description, completed: false, createdAt: new Date() })
  setTitle('')
  setDescription('')
}

<form onSubmit={handleSubmit}>
  <input value={title} onChange={e => setTitle(e.target.value)} />
  <button type="submit">Agregar</button>
</form>
```

Siempre llamar a `e.preventDefault()` en formularios React para evitar la recarga del navegador.

---

## 4. Renderizado condicional

Tres patrones principales:

### Operador `&&` (cuando no hay else)

```tsx
{tasks.length === 0 && <p>No hay tareas pendientes</p>}
```

### Ternario `? :` (cuando hay dos estados)

```tsx
{task.completed ? <Badge variant="success">Completada</Badge> : <Badge variant="danger">Pendiente</Badge>}
```

### Early return (para componentes completos)

```tsx
function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return <p>No hay tareas</p>

  return (
    <ul>
      {tasks.map(task => <li key={task.id}>{task.title}</li>)}
    </ul>
  )
}
```

---

## 5. Objeto literal para múltiples estados

Cuando hay más de 2 estados posibles, un objeto literal es más limpio que ternarios anidados:

```tsx
const badgeConfig = {
  pending: { label: 'Pendiente', className: 'badge-danger' },
  inProgress: { label: 'En Progreso', className: 'badge-warning' },
  completed: { label: 'Completada', className: 'badge-success' },
} as const

function TaskBadge({ status }: { status: keyof typeof badgeConfig }) {
  const config = badgeConfig[status]
  return <span className={config.className}>{config.label}</span>
}
```

---

## 6. Formulario inline

Un formulario inline en React se compone de campos controlados (value + onChange) y un manejador onSubmit:

```tsx
const [title, setTitle] = useState('')
const [description, setDescription] = useState('')

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  if (!title.trim()) return
  onAddTask({ id: crypto.randomUUID(), title, description, completed: false, createdAt: new Date() })
  setTitle('')
  setDescription('')
}
```

Los campos controlados mantienen el estado del formulario sincronizado con React.
