---
sidebar_label: "Soluciones"
---

# Soluciones M23 — Seguridad en React

## Ejercicio 1: Refresh token interceptor

**Solución esperada**:

```ts
// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('token', data.token)
        processQueue(null, data.token)
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
```

**Posibles mejoras**:
- Usar una instancia separada de axios para el refresh (sin el interceptor de respuesta) para evitar loops infinitos si el refresh también retorna 401.
- Almacenar tokens en HttpOnly cookies en lugar de localStorage (requiere backend que setee las cookies).
- Agregar un retry limitado (máximo 1-2 refreshes) para evitar que una petición se reintente indefinidamente si el refresh siempre falla.

---

## Ejercicio 2: Roles — admin vs user

**Solución esperada**:

```ts
// src/types/index.ts
export type Role = 'admin' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: Role
}
```

```tsx
// src/components/AdminRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  return <>{children}</>
}
```

```tsx
// src/pages/Dashboard.tsx (fragmento)
import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { useTaskStore } from '../store/taskStore'

export function Dashboard() {
  const user = useAuthStore(s => s.user)
  const tasks = useTaskStore(s => s.tasks)

  const visibleTasks = useMemo(() => {
    if (user?.role === 'admin') return tasks
    return tasks.filter(t => t.assignedTo === user?.id)
  }, [tasks, user])

  return (
    <div>
      {user?.role === 'admin' && (
        <button onClick={() => navigate('/admin/users')}>Administrar Usuarios</button>
      )}
      {/* renderizar visibleTasks */}
    </div>
  )
}
```

**Posibles mejoras**:
- Crear un hook `usePermission(action: string)` que devuelva booleano basado en los permisos del rol, para control granulando.
- Tipar `Role` como una unión de strings y usar `Record<Role, Permission[]>` para mapear roles a permisos individuales.
- Agregar logging de intentos de acceso no autorizado (cuando un usuario intenta acceder a `/admin` sin ser admin) para el backend.

---

## Ejercicio 3: XSS — sanitizar inputs

**Solución esperada**:

```ts
// src/utils/sanitize.ts
import DOMPurify from 'dompurify'

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim()
}

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  })
}
```

```tsx
// Uso en TaskForm
import { sanitizeInput } from '../utils/sanitize'

function TaskForm() {
  const onSubmit = (data: TaskFormData) => {
    const sanitized = {
      ...data,
      title: sanitizeInput(data.title),
      description: sanitizeInput(data.description),
    }
    createTask(sanitized)
  }
}
```

**Posibles mejoras**:
- Agregar sanitización también en el backend usando la misma librería o equivalente (Java: OWASP Java HTML Sanitizer, Node: DOMPurify con jsdom).
- Configurar `ALLOWED_URI_REGEXP` en DOMPurify para restringir esquemas de URL a solo `http`/`https`/`mailto`.
- Sanitizar valores al leer de localStorage y al pasarlos como atributos HTML (`href`, `src`).

---

## Ejercicio 4: Content Security Policy

**Solución esperada**:

**nginx.conf:**

```nginx
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' https: data:;
    font-src 'self' https:;
    connect-src 'self' https://api.taskflow.com https://vitals.vercel-insights.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
" always;
```

**index.html (para desarrollo):**

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:*;"
/>
```

Nota: en desarrollo se necesita `'unsafe-eval'` para Vite HMR y `'unsafe-inline'` para estilos.

**Posibles mejoras**:
- Implementar CSP con `nonce` en producción en lugar de `'unsafe-inline'` para `style-src`, generando el nonce en nginx y pasándolo a la app.
- Usar `report-uri` o `report-to` para recibir reportes de violaciones de CSP y monitorear intentos de ataque.
- Remover `'unsafe-eval'` y `'unsafe-inline'` del CSP de producción, que solo son necesarios para desarrollo.

---

## Ejercicio 5: Rate limiting

**Solución esperada**:

```ts
// src/hooks/useDebounce.ts
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

```ts
// src/hooks/useLoginRateLimit.ts
import { useState, useCallback } from 'react'

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 60_000

export function useLoginRateLimit() {
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  const recordAttempt = useCallback(() => {
    const next = attempts + 1
    setAttempts(next)
    if (next >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_DURATION
      setLockedUntil(until)
      setTimeout(() => {
        setAttempts(0)
        setLockedUntil(null)
      }, LOCKOUT_DURATION)
    }
  }, [attempts])

  return {
    isLocked,
    recordAttempt,
    remaining: MAX_ATTEMPTS - attempts,
  }
}
```

```tsx
// En LoginPage
function LoginPage() {
  const { isLocked, recordAttempt, remaining } = useLoginRateLimit()
  const login = useAuthStore(s => s.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    recordAttempt()
    try {
      await login(email, password)
    } catch {
      setError(`Credenciales inválidas. Intentos restantes: ${remaining}`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isLocked}>
        {isLocked ? 'Demasiados intentos. Espere 1 minuto.' : 'Ingresar'}
      </button>
    </form>
  )
}
```

**Posibles mejoras**:
- Agregar CAPTCHA después de N intentos fallidos (reCAPTCHA v3 invisible, o hCAPTCHA).
- Persistir el estado de bloqueo en sessionStorage para que recargar la página no resete el contador.
- Implementar exponential backoff: 1er bloqueo 30s, 2do 2min, 3ro 5min, etc., en lugar de tiempo fijo.
