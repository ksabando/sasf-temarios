---
sidebar_label: "Clase"
---

## 2. Keys: por qué importan

React usa la `key` para identificar de forma única cada elemento en una lista. Esto permite:

- **Reconciliación eficiente:** React sabe qué elementos cambiaron, se agregaron o se eliminaron.
- **Preservar estado interno:** Un componente mantiene su estado local si su key no cambia.
- **Evitar bugs:** Sin keys correctas, React puede reordenar o reciclar componentes incorrectamente.

### key con id (correcto ✅)

```tsx
{tasks.map(task => <TaskCard key={task.id} task={task} />)}
```

### key con índice (incorrecto ❌)

```tsx
{tasks.map((task, index) => <TaskCard key={index} task={task} />)}
```

Usar el índice como key causa problemas cuando:
- Se agregan/eliminan elementos al inicio o al medio de la lista.
- Se reordenan los elementos.
- Los componentes tienen estado interno o inputs controlados.

Solo es aceptable usar el índice si la lista es estática y nunca cambia.

---

## 3. Ordenamiento

### Por fecha descendente (más reciente primero)

```tsx
const sortedTasks = [...tasks].sort(
  (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
)
```

### Por título alfabéticamente

```tsx
const sortedTasks = [...tasks].sort((a, b) =>
  a.title.localeCompare(b.title)
)
```

**Importante:** `.sort()` muta el array original. Siempre hacer una copia con `[...tasks]` antes de ordenar.

---

## 4. Búsqueda/filtro por texto

```tsx
const [search, setSearch] = useState('')

const filteredTasks = tasks.filter(task =>
  task.title.toLowerCase().includes(search.toLowerCase()))
```

Agregar un input de búsqueda que actualice `search` y combine el filtro con los existentes:

```tsx
const filteredTasks = tasks
  .filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })
  .filter(task =>
    task.title.toLowerCase().includes(search.toLowerCase()))
```

---

## 5. Asignar IDs únicos con crypto.randomUUID()

El método `crypto.randomUUID()` genera un UUID v4 único universal. Es nativo en navegadores modernos:

```tsx
const newTask: Task = {
  id: crypto.randomUUID(),
  title,
  description,
  completed: false,
  createdAt: new Date(),
}
```

Alternativas: `Date.now().toString()`, librería `uuid`, o `nanoid`.

---

## 6. Contadores

```tsx
const total = tasks.length
const pending = tasks.filter(t => !t.completed).length
const completed = tasks.filter(t => t.completed).length

// Renderizar:
<p>{pending} pendientes de {total} totales</p>
```

---

## 7. Tareas completadas al final

Ordenar para que las no completadas aparezcan primero y las completadas al final:

```tsx
const sortedTasks = [...tasks].sort((a, b) => {
  if (a.completed === b.completed) return 0
  return a.completed ? 1 : -1
})
```

Combinar con filtro de búsqueda y filtro de estado para un manejo completo:

```tsx
const displayedTasks = tasks
  .filter(task => task.title.toLowerCase().includes(search.toLowerCase()))
  .filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })
  .sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })
```
