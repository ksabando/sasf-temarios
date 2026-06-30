---
sidebar_label: "Ejercicio"
---

# Ejercicio 10: Custom Hooks

## Objetivo
Extraer la lógica de TaskFlow en custom hooks reutilizables, reduciendo la responsabilidad de App.tsx.

## Pasos

1. **Crear `src/hooks/useAuth.ts`**
   - Acceder a `AuthContext` y exponer helpers: `user`, `isAuthenticated`, `login`, `register`, `logout`
   - Validar que existe el contexto

2. **Crear `src/hooks/useTasks.ts`**
   - Acceder a `TaskContext` y exponer helpers: `tasks`, `loading`, `error`, `filter`, `filteredTasks`
   - Métodos: `fetchTasks`, `addTask`, `updateTask`, `deleteTask`, `setFilter`
   - `filteredTasks` debe calcular las tareas filtradas

3. **Crear `src/hooks/useDebounce.ts`**
   - Hook genérico: `useDebounce<T>(value: T, delay: number): T`
   - Usar `useState` + `useEffect` con `setTimeout`

4. **Crear `src/hooks/useLocalStorage.ts`**
   - Hook genérico: `useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]`
   - Leer de localStorage al inicializar
   - Escribir en localStorage al cambiar valor

5. **Refactorizar `App.tsx`**
   - Usar `useAuth()` en lugar de `useContext(AuthContext)`
   - Usar `useTasks()` en lugar de `useContext(TaskContext)` y llamadas directas a `taskService`
   - Usar `useDebounce` para el filtro de búsqueda
