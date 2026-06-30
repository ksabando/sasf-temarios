---
sidebar_label: "Clase"
---

## 2. Refresh token flow con axios interceptor

El refresh token evita que el usuario tenga que loguearse cada vez que el access token expira.

```
1. Access token expira (401)
2. Interceptor captura el error
3. Llama a /auth/refresh con refresh token
4. Si ok → almacena nuevo access token, reintenta petición original
5. Si falla → redirige a login
```

```ts
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

let isRefreshing = false
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

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
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken: localStorage.getItem('refreshToken'),
        })
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
```

### Manejo de cola de peticiones

El patrón de cola evita que múltiples peticiones fallen simultáneamente disparen múltiples refreshes. Mientras una petición está refrescando, las demás esperan en cola.

---

## 3. XSS prevention

React escapa automáticamente los valores en JSX. Los puntos de riesgo son:

### Peligros
- `dangerouslySetInnerHTML` — inyecta HTML crudo
- `href` con input del usuario — `javascript:alert(1)`
- **URL params** renderizados sin sanitizar
- **Markdown renderers** sin sanitizar

### Soluciones

```tsx
import DOMPurify from 'dompurify'

// Sanitizar HTML antes de inyectar
function SafeHTML({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}

// Validar URLs antes de usarlas
function SafeLink({ url, children }: { url: string; children: React.ReactNode }) {
  const isValid = /^https?:\/\//.test(url)
  if (!isValid) return <span>{children}</span>
  return <a href={url}>{children}</a>
}
```

### Sanitización de inputs

Siempre sanitizar en el backend como defensa principal. En frontend, usar DOMPurify como capa adicional si se renderiza HTML.

```ts
import DOMPurify from 'dompurify'

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }) // Sin etiquetas HTML
}
```

---

## 4. Content Security Policy (CSP)

CSP restringe qué recursos puede cargar el navegador, mitigando XSS incluso si se inyecta código.

### Configuración en nginx.conf

```nginx
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' https: data:;
    font-src 'self' https:;
    connect-src 'self' https://api.taskflow.com;
    frame-ancestors 'none';
" always;
```

### CSP vía meta tag en index.html

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

### Directivas clave
- `default-src 'self'` — solo recursos del mismo origen
- `script-src 'self'` — solo scripts propios
- `style-src 'self' 'unsafe-inline'` — necesario para CSS-in-JS
- `connect-src` — controla fetch/XHR a APIs
- `img-src 'self' https: data:` — imágenes propias, HTTPS y data URIs
- `frame-ancestors 'none'` — previene clickjacking

---

## 5. Rate limiting en frontend

Proteger contra fuerza bruta y abuso de APIs.

### Debounce en búsqueda

```ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

### Limitar intentos de login

```tsx
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 60_000 // 1 minuto

function useLoginRateLimit() {
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)

  const isLocked = lockedUntil ? Date.now() < lockedUntil : false

  const recordAttempt = () => {
    const next = attempts + 1
    setAttempts(next)
    if (next >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCKOUT_TIME)
      setTimeout(() => {
        setAttempts(0)
        setLockedUntil(null)
      }, LOCKOUT_TIME)
    }
  }

  return { isLocked, recordAttempt, attemptsRemaining: MAX_ATTEMPTS - attempts }
}
```

---

## 6. Roles: admin vs user

Control de acceso basado en roles (RBAC) en frontend.

```ts
type Role = 'admin' | 'user'

interface User {
  id: string
  email: string
  role: Role
}

function hasAccess(user: User | null, requiredRole: Role): boolean {
  if (!user) return false
  if (requiredRole === 'user') return true
  return user.role === 'admin'
}
```

### Rutas protegidas por rol

```tsx
function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  return <>{children}</>
}
```

### Filtrado por rol en el dashboard

```tsx
function Dashboard() {
  const user = useAuthStore(s => s.user)
  const tasks = useTaskStore(s => s.tasks)

  // Admin ve todas las tareas, user solo las suyas
  const visibleTasks = useMemo(() => {
    if (user?.role === 'admin') return tasks
    return tasks.filter(t => t.assignedTo === user?.id)
  }, [tasks, user])
}
```

---

## Resumen

| Riesgo | Mitigación |
|--------|-----------|
| XSS | React escape automático, DOMPurify para HTML, validar URLs |
| Token robado | HttpOnly cookies > localStorage, refresh token rotation |
| CSRF | SameSite=Strict, tokens CSRF, headers personalizados |
| Fuerza bruta | Rate limiting, debounce, bloqueo temporal |
| Acceso no autorizado | Roles (admin/user), rutas protegidas, filtrado backend |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` o CSP `frame-ancestors` |
| Scripts inyectados | Content Security Policy restrictiva |
