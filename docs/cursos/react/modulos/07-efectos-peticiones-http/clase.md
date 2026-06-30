---
sidebar_label: "Clase"
---

# Módulo 07: Efectos y Peticiones HTTP

## Estado actual
Tareas en estado local. Se pierden al recargar. No hay persistencia.

## Contenido

### useEffect

`useEffect` ejecuta efectos secundarios en componentes funcionales.

```tsx
useEffect(() => {
  // efecto
  return () => { /* cleanup */ }
}, [dependencias])
```

| Uso | Arreglo de dependencias | Cuándo se ejecuta |
|-----|------------------------|-------------------|
| Al montar | `[]` | Una vez al montar |
| Al montar + actualizar | `[dep]` | Al montar y cada cambio de `dep` |
| Siempre | Sin arreglo | En cada render |

### Cleanup

Para cancelar suscripciones, timers o peticiones:

```tsx
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000)
  return () => clearInterval(timer) // se ejecuta al desmontar
}, [])
```

### fetch vs axios

| fetch nativo | axios |
|-------------|-------|
| Viene en el navegador | Requiere instalación |
| No parsea JSON automático | Parseo automático |
| No detecta 4xx/5xx como error | Rechaza en 4xx/5xx |
| Sin interceptors | Interceptores integrados |
| Sin timeout nativo | timeout configurable |

### Estados de una petición

```tsx
type Status = 'idle' | 'loading' | 'success' | 'error'

const [data, setData] = useState<Task[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

### AbortController

Para cancelar peticiones al desmontar:

```tsx
useEffect(() => {
  const controller = new AbortController()
  fetch('/api/tasks', { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(() => {}) // ignorar error por aborto
  return () => controller.abort()
}, [])
```

### Integración con Spring Boot

TaskFlow está diseñado para conectarse a una **Task API** creada con Spring Boot.
Los endpoints esperados son:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks?page=0&size=10` | Listar tareas (paginado) |
| POST | `/api/tasks` | Crear tarea |
| PUT | `/api/tasks/{id}` | Actualizar tarea |
| DELETE | `/api/tasks/{id}` | Eliminar tarea |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrarse |

> 📖 Ver `Anexos/puente-integracion-react-spring.md` para la guía completa de cómo crear la Task API en Spring Boot y conectar ambos proyectos.
