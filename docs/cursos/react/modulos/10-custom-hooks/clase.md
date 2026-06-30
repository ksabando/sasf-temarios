---
sidebar_label: "Clase"
---

# Módulo 10: Custom Hooks

## Estado actual
Lógica de auth y tasks en context. App.tsx tiene muchas responsabilidades.

## Contenido

### Custom hooks: qué son y por qué

Un custom hook es una función JavaScript que:
- Empieza con `use`
- Puede llamar a otros hooks (useState, useEffect, useContext, etc.)
- Encapsula lógica repetitiva o compleja
- Puede retornar cualquier valor (objeto, array, función)

**Beneficios:** reutilización, separación de responsabilidades, componentes más limpios.

```tsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}
```

### Reglas de los hooks
- Solo llamar hooks en el **top-level** (no dentro de if/for/funciones anidadas)
- Solo llamar hooks desde **componentes React** o **custom hooks**
- El nombre debe empezar con `use`

### Hooks composables

Los custom hooks se pueden componer entre sí:

```tsx
function useUser() {
  const { user } = useAuth()       // hook de auth
  const { tasks } = useTasks()     // hook de tareas
  const isActive = useIsActive()   // otro custom hook
  return { user, tasks, isActive }
}
```

### Genéricos en hooks

Los hooks pueden ser genéricos para mayor flexibilidad:

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
```

### Ejemplos de hooks útiles

| Hook | Propósito |
|------|-----------|
| `useAuth()` | Acceder al contexto de autenticación |
| `useTasks()` | Acceder al contexto de tareas con helpers |
| `useDebounce()` | Retrasar la actualización de un valor |
| `useLocalStorage()` | Persistir estado en localStorage |
| `useMediaQuery()` | Detectar media queries CSS |
