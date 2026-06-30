---
sidebar_label: "Ejercicio"
---

### Ejercicio 2: Crear hook useTaskList

Crear `src/hooks/useTaskList.ts` que encapsule:

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

---

### Ejercicio 3: Integrar useTaskList en App.tsx

Usar el hook en `App.tsx` y pasar las funciones necesarias a los hijos.

---

### Ejercicio 4: Renderizar lista de tareas hardcodeadas

En `App.tsx`, crear un arreglo de 3 tareas de ejemplo y pasarlas a `useTaskList`. Renderizarlas usando `Card`. Mostrar título, descripción y fecha de cada tarea.

---

### Ejercicio 5: Verificar en el navegador

Ejecutar `npm run dev` y confirmar que las tareas hardcodeadas aparecen en pantalla dentro del Layout.
