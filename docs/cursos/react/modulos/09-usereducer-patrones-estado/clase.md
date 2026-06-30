---
sidebar_label: "Clase"
---

# Módulo 09: useReducer y Patrones de Estado

## Estado actual
Tareas con useState. Context de auth OK. La lógica de estado está en App.

## Contenido

### useReducer vs useState

| useState | useReducer |
|----------|-----------|
| Estado simple (boolean, string, número) | Estado complejo (objetos con múltiples campos) |
| Actualización directa por valor | Actualización mediante acciones (dispatch) |
| Lógica de cambio en el componente | Lógica centralizada en reducer |
| Fácil de leer con 1-2 estados | Escala mejor con muchas transiciones |

### Discriminated Union Actions

Cada acción tiene un `type` literal y un `payload` opcional:

```tsx
type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: number; data: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTER'; payload: string }
```

El `switch` en el reducer puede inferir el tipo del payload gracias a la unión discriminada.

### Reducer Puro

Un reducer debe ser una función pura (sin efectos secundarios):

```tsx
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.data } : t
        ),
      }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    default:
      return state
  }
}
```

### useReducer + Context

Combinar ambos patrones para estado global tipado:

```tsx
const TaskContext = createContext<TaskContextType | undefined>(undefined)

function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  const value = { state, dispatch }
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
```

### Logger Middleware

Middleware simple para debuggear acciones:

```tsx
function useLoggerReducer(reducer: any, initialState: any) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const loggedDispatch = (action: any) => {
    console.log('%cAction:', 'color: blue', action)
    console.log('%cPrevious State:', 'color: red', state)
    dispatch(action)
    // El nuevo estado no está disponible hasta el próximo render
  }

  return [state, loggedDispatch]
}
```
