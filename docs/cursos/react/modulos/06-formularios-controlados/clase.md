---
sidebar_label: "Clase"
---

# Módulo 06: Formularios Controlados

## Estado actual
TaskFlow tiene CRUD local con formulario inline básico. No hay validación.

## Contenido

### Componentes controlados vs no controlados

| Controlado | No controlado |
|-----------|--------------|
| El estado del input vive en React (`value` + `onChange`) | El estado vive en el DOM (`ref` para leer valor) |
| `useState` por cada campo | `useRef` para leer el valor |
| React es la fuente de verdad | El DOM es la fuente de verdad |
| Más código, más control | Menos código, menos control |

```tsx
// Controlado
const [email, setEmail] = useState('')
<input value={email} onChange={e => setEmail(e.target.value)} />

// No controlado
const emailRef = useRef<HTMLInputElement>(null)
<input ref={emailRef} />
// Leer: emailRef.current?.value
```

### React Hook Form (RHF)

RHF reduce el boilerplate de formularios controlados usando refs internamente:

```tsx
import { useForm } from 'react-hook-form'

const { register, handleSubmit, watch, formState: { errors } } = useForm<TaskFormData>()
```

- `register(name)` → conecta un input al formulario
- `handleSubmit(onValid, onInvalid)` → maneja submit con validación
- `watch(name)` → observa cambios de un campo
- `formState.errors` → objeto con errores de validación

### Zod: esquemas de validación

Zod permite definir esquemas con tipado inferido automáticamente:

```tsx
import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100'),
  description: z.string().max(500).optional(),
})
export type TaskFormData = z.infer<typeof taskSchema>
```

### Integración @hookform/resolvers

```tsx
import { zodResolver } from '@hookform/resolvers/zod'

const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
  resolver: zodResolver(taskSchema),
})
```

### forwardRef en Input.tsx

RHF usa `ref` internamente. Para componentes personalizados hay que usar `forwardRef`:

```tsx
const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => (
  <div>
    <label>{label}</label>
    <input ref={ref} {...props} />
    {error && <span className="error">{error}</span>}
  </div>
))
```

### Errores de validación

```tsx
{errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
```

### useRef para casos no controlados

Cuando no necesitas validación reactiva, `useRef` evita re-renders:

```tsx
const searchRef = useRef<HTMLInputElement>(null)
const handleSearch = () => console.log(searchRef.current?.value)
```
