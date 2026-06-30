---
sidebar_label: "Clase"
---

## 2. Tipos: inferencia automática vs explícita

TypeScript infiere el tipo del estado a partir del valor inicial:

```tsx
const [count, setCount] = useState(0)       // count: number
const [name, setName] = useState('')        // name: string
const [isDone, setIsDone] = useState(false)  // isDone: boolean
```

Para tipos más complejos, se pasa el genérico explícitamente:

```tsx
interface Task {
  id: string
  title: string
  completed: boolean
}

const [tasks, setTasks] = useState<Task[]>([])       // tasks: Task[]
const [task, setTask] = useState<Task | null>(null)  // task: Task | null
```

---

## 3. Inmutabilidad — no mutar arrays/objetos directamente

Nunca mutar el estado directamente. Siempre crear una nueva copia:

```tsx
// MAL ❌
tasks.push(newTask)
setTasks(tasks)

// BIEN ✅
setTasks([...tasks, newTask])
```

```tsx
// MAL ❌
task.title = 'Nuevo título'
setTask(task)

// BIEN ✅
setTask({ ...task, title: 'Nuevo título' })
```

---

## 4. Actualización funcional

Cuando el nuevo estado depende del anterior, usar la forma funcional para evitar race conditions:

```tsx
// Con valor anterior
setTasks(prev => [...prev, newTask])

// En toggle
setTask(prev => prev ? { ...prev, completed: !prev.completed } : prev)
```

La forma funcional recibe el estado más reciente como argumento.

---

## 5. Estado derivado — no almacenar lo que se puede calcular

Si un valor se puede calcular a partir del estado existente, no lo guardes en useState:

```tsx
const [tasks, setTasks] = useState<Task[]>([])

// MAL ❌ — estado redundante
const [pendingCount, setPendingCount] = useState(0)

// BIEN ✅ — calcular directamente
const pendingCount = tasks.filter(t => !t.completed).length
```

---

## 6. Lifting State Up

El estado se declara en el componente padre común más cercano y se pasa hacia abajo como props:

```
App (estado: tasks, setTasks)
├── Layout (solo recibe children)
│   └── TaskList (recibe tasks como prop)
└── TaskForm (recibe onAddTask como prop)
```

```tsx
function App() {
  const [tasks, setTasks] = useState<Task[]>([])

  const addTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask])
  }

  return (
    <Layout>
      <TaskForm onAddTask={addTask} />
      <TaskList tasks={tasks} />
    </Layout>
  )
}
```

---

## 7. Interfaz Task con TypeScript

```tsx
export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: Date
}
```
