---
sidebar_label: "Soluciones"
---

# Soluciones M08 — Context API y Autenticación

## `src/context/AuthContext.tsx`

**Solución esperada**:

```tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import api from '../services/api'

export interface User {
  id: number
  name: string
  email: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      api.get<User>('/auth/me').then(res => setUser(res.data)).catch(() => logout())
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: User; token: string }>('/auth/login', { email, password })
    const { user, token } = res.data
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setToken(token)
    setUser(user)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<{ user: User; token: string }>('/auth/register', { name, email, password })
    const { user, token } = res.data
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

**Posibles mejoras**:
- Envolver `login`, `register`, `logout` en `useCallback` para referencias estables y evitar re-renders de consumidores.
- Separar en dos contextos: `AuthStateContext` (`user`, `token`) y `AuthActionsContext` (`login`, `register`, `logout`) para que componentes que solo usan acciones no se re-rendericen por cambios de estado.
- Agregar listener del evento `storage` de `localStorage` para sincronizar logout entre múltiples pestañas del navegador.
- Validar en el `catch` que el error sea 401 antes de llamar a `logout()`, para no desloguear por errores de red temporales.

---

## `src/services/api.ts` (actualizado)

**Solución esperada**:

```tsx
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api
```

**Posibles mejoras**:
- Reemplazar `window.location.href` por navegación programática con React Router usando un event emitter o callback registrado.
- Agregar un interceptor de request que lea el token de `localStorage` automáticamente (evitando configurar `defaults.headers` manualmente).
- Incluir lógica de retry con backoff exponencial para errores 5xx transitorios.

---

## `src/main.tsx`

**Solución esperada**:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
```

**Posibles mejoras**:
- Mover el StrictMode dentro de AuthProvider para que los tests de integración no tengan que envolver en StrictMode.
- Agregar un ErrorBoundary global alrededor de `AuthProvider` para capturar errores de autenticación que no se manejen.
- Configurar React DevTools con `React.StrictMode` solo en desarrollo usando `import.meta.env.DEV`.

---

## `src/App.tsx` (fragmento)

**Solución esperada**:

```tsx
import { useAuth } from './context/AuthContext'

export default function App() {
  const { isAuthenticated, user, login, register, logout } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={async e => {
          e.preventDefault()
          try {
            if (isLogin) await login(email, password)
            else await register(name, email, password)
          } catch (err: any) {
            alert(err.response?.data?.message || 'Error de autenticación')
          }
        }} className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>
          {!isLogin && (
            <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-4" required />
          )}
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-4" required />
          <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-4" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            {isLogin ? 'Ingresar' : 'Registrarse'}
          </button>
          <p className="mt-4 text-center text-sm">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 ml-1 hover:underline">
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">TaskFlow</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:underline">Cerrar sesión</button>
          </div>
        </div>
        {/* ... resto del contenido de tareas del módulo 07 */}
      </div>
    </div>
  )
}
```

**Posibles mejoras**:
- Extraer el formulario de login/register a un componente `AuthForm` separado con su propio estado y lógica.
- Agregar validación de email con regex antes de enviar, mostrando errores inline en lugar de alert.
- Agregar estado `isLoading` durante login/register para deshabilitar el botón y mostrar spinner.
- Usar React Hook Form + Zod para validación del formulario de autenticación, consistente con el resto de la app.
