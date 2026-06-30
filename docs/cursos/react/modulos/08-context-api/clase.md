---
sidebar_label: "Clase"
---

# Módulo 08: Context API

## Estado actual
API conectada pero sin autenticación. Cualquiera puede ver/editar tareas.

## Contenido

### createContext

Crea un contexto con un tipo genérico y valor por defecto:

```tsx
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)
```

### Provider Pattern

El Provider envuelve componentes hijos y provee el valor del contexto:

```tsx
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const { user, token } = res.data
    localStorage.setItem('token', token)
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### useContext

Consume el contexto en cualquier componente hijo:

```tsx
const { user, isAuthenticated, login, logout } = useContext(AuthContext)
```

### localStorage para token

Persistir el token entre recargas:

```tsx
// Al inicializar
const savedToken = localStorage.getItem('token')
if (savedToken) {
  setToken(savedToken)
  // fetch user info
}

// Al hacer login
localStorage.setItem('token', token)

// Al hacer logout
localStorage.removeItem('token')
```

### axios interceptor para Authorization

```tsx
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Protected API calls

Llamadas que requieren autenticación fallarán con 401 si no hay token. El interceptor de respuesta puede redirigir al login.

### Integración con Spring Boot

El AuthContext se conecta a los endpoints de la Task API:

| React | Spring |
|-------|--------|
| `login(username, password)` | `POST /api/auth/login` |
| `register(username, password)` | `POST /api/auth/register` |
| Interceptor Authorization | `Bearer <token>` → filtro JWT |

> 📖 Ver `Anexos/puente-integracion-react-spring.md` para la configuración completa de autenticación con Spring.
