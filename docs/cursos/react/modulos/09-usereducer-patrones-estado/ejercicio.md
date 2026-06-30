---
sidebar_label: "Ejercicio"
---

# Ejercicio 09: useReducer y Patrones de Estado

## Objetivo
Migrar el estado de tareas de `useState` a `useReducer` y combinarlo con Context API.

## Pasos

1. **Crear `src/reducers/taskReducer.ts`**
   - Definir tipo `TaskState`: `tasks: Task[]`, `loading: boolean`, `error: string | null`, `filter: string`
   - Definir unión discriminada `TaskAction` con 7 acciones
   - Implementar `taskReducer` como función pura

2. **Estado inicial**
   ```tsx
   const initialState: TaskState = {
     tasks: [],
     loading: false,
     error: null,
     filter: '',
   }
   ```

3. **Crear `src/context/TaskContext.tsx`**
   - `TaskContext` con `state` y `dispatch`
   - `TaskProvider` que usa `useReducer(taskReducer, initialState)`
   - Hook `useTaskContext` para consumir

4. **Migrar `App.tsx`**
   - Reemplazar `useState` por llamadas a `dispatch` desde `TaskContext`
   - `dispatch({ type: 'SET_TASKS', payload: data })`
   - `dispatch({ type: 'SET_LOADING', payload: true })`
   - `dispatch({ type: 'SET_ERROR', payload: err.message })`

5. **Envolver App** con `TaskProvider` en `main.tsx`

6. **Opcional: Logger middleware**
   - Crear wrapper que loguea cada acción y estado previo
