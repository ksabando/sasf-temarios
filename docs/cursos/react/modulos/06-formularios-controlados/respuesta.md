---
sidebar_label: "Soluciones"
---

# Soluciones M06 — Formularios Controlados y React Hook Form

## `src/utils/validations.ts`

**Solución esperada**:

```tsx
import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
})
export type TaskFormData = z.infer<typeof taskSchema>
```

**Posibles mejoras**:
- Agregar `z.string().trim()` para sanitizar whitespace y evitar títulos con solo espacios.
- Incluir `.refine()` para validación custom: `z.string().refine(v => !v.includes('<script>'), 'Contenido no permitido')`.
- Exportar un segundo schema para edición con `.partial()`: `export const taskEditSchema = taskSchema.partial()`.

---

## `src/components/Input.tsx`

**Solución esperada**:

```tsx
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        ref={ref}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
export default Input
```

**Posibles mejoras**:
- Agregar `autoComplete` como prop para mejorar UX en formularios con campos comunes (name, email).
- Usar `aria-describedby` + `useId()` para asociar el mensaje de error con el input para lectores de pantalla.
- Agregar prop `rightIcon?: React.ReactNode` para íconos de validación (check verde / X roja) dentro del input.

---

## `src/components/TaskForm.tsx`

**Solución esperada**:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, TaskFormData } from '../utils/validations'
import Input from './Input'
import { Task } from '../App'

interface TaskFormProps {
  task?: Task
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
}

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: task?.title ?? '', description: task?.description ?? '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{task ? 'Editar tarea' : 'Nueva tarea'}</h2>
      <Input
        label="Título"
        error={errors.title?.message}
        {...register('title')}
        placeholder="Ingrese el título"
      />
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={3}
          {...register('description')}
          placeholder="Descripción (opcional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-100">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Guardando...' : task ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}
```

**Posibles mejoras**:
- Agregar `mode: 'onBlur'` en `useForm` para validar al salir del campo en lugar de al submit, mejorando UX con feedback temprano.
- Pasar `ref` al botón de cancelar y llamar a `form.reset()` para limpiar dirty fields al cancelar.
- Agregar un efecto `useEffect(() => { reset(task) }, [task])` para que al cambiar la tarea en edición se actualicen los valores del formulario.

---

## `src/App.tsx` (fragmento relevante)

**Solución esperada**:

```tsx
import { useState } from 'react'
import TaskForm from './components/TaskForm'
import { TaskFormData } from './utils/validations'

function App() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleCreate = (data: TaskFormData) => {
    const newTask: Task = { id: Date.now(), title: data.title, description: data.description || '', completed: false }
    setTasks(prev => [...prev, newTask])
    setShowForm(false)
  }

  const handleUpdate = (data: TaskFormData) => {
    if (!editingTask) return
    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...data } : t))
    setEditingTask(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">TaskFlow</h1>
        {!showForm && !editingTask && (
          <button onClick={() => setShowForm(true)} className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            + Nueva tarea
          </button>
        )}
        {showForm && <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
        {editingTask && <TaskForm task={editingTask} onSubmit={handleUpdate} onCancel={() => setEditingTask(null)} />}
        <ul className="space-y-2 mt-4">
          {tasks.map(task => (
            <li key={task.id} className="bg-white p-4 rounded-md shadow flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                {task.description && <p className="text-gray-600 text-sm">{task.description}</p>}
              </div>
              <button onClick={() => setEditingTask(task)} className="text-blue-600 hover:underline text-sm">
                Editar
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
- Usar `crypto.randomUUID()` en lugar de `Date.now()` para IDs únicos y seguros.
- Manejar el estado de carga global con una variable `isSaving` para deshabilitar interacciones durante operaciones async.
- Agregar un toast de confirmación al crear/editar con `react-hot-toast` o similar para feedback visual no intrusivo.
