---
sidebar_label: "Soluciones"
---

# Soluciones M15 — TypeScript con React

## src/types/index.ts

**Solución esperada**:

```tsx
// Tipos base
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
  userId: number;
}

export type TaskStatus = 'pending' | 'completed';

export type TaskPreview = Pick<Task, 'id' | 'title' | 'status'>;

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt'>;

export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>>;

export type StatusCounts = Record<TaskStatus, number>;

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}
```

**Posibles mejoras**:
- Agregar `branded types` para IDs: `type TaskID = number & { __brand: 'TaskID' }` para evitar pasar un `taskId` donde se espera un `userId`.
- Definir `export type TaskFormMode = 'create' | 'edit'` para usar en formularios y componentes que necesitan saber el contexto.
- Exportar un `namespace Task` con todos los tipos relacionados para imports más organizados: `import { Task } from '@/types'` y usar `Task.Data`, `Task.CreateInput`, etc.

---

## src/types/api.ts

**Solución esperada**:

```tsx
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type TaskApiResponse = ApiResponse<Task[]>;

export type SingleTaskResponse = ApiResponse<Task>;

export type UserApiResponse = ApiResponse<User>;
```

**Posibles mejoras**:
- Agregar `ApiError` interface con `code`, `message`, `details` para tipar errores de API de forma estructurada.
- Definir un genérico `MutationResponse<T>` que extienda `ApiResponse<T>` con metadatos de la operación (timestamp, affectedRows).
- Usar `zod` para generar estos tipos desde esquemas de validación, garantizando que los tipos reflejen exactamente lo que la API envía.

---

## src/types/actions.ts

**Solución esperada**:

```tsx
import type { Task, CreateTaskInput, UpdateTaskInput } from './index';

export type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: number; updates: UpdateTaskInput } }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
```

**Posibles mejoras**:
- Crear action creators con `as const` para cada acción, exportándolos como `taskActions` namespace.
- Agregar acciones para operaciones async lifecycle: `FETCH_TASKS_START`, `FETCH_TASKS_SUCCESS`, `FETCH_TASKS_ERROR`.
- Definir `TaskDispatch = Dispatch<TaskAction>` como tipo exportado para usar en contextos y hooks dependientes.

---

## src/hooks/useTasks.ts (refactorizado)

**Solución esperada**:

```tsx
import { useReducer, useCallback } from 'react';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import type { TaskAction } from '../types/actions';
import type { ApiResponse } from '../types/api';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false, error: null };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK': {
      const { id, updates } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, ...updates } : t
        ),
      };
    }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function useTasks() {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch('/api/tasks');
      const json: ApiResponse<Task[]> = await res.json();
      if (json.success) {
        dispatch({ type: 'SET_TASKS', payload: json.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: json.message });
      }
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Error desconocido',
      });
    }
  }, []);

  const addTask = useCallback(async (input: CreateTaskInput) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json: ApiResponse<Task> = await res.json();
    if (json.success) {
      dispatch({ type: 'ADD_TASK', payload: json.data });
    }
  }, []);

  const updateTask = useCallback(async (id: number, updates: UpdateTaskInput) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  }, []);

  return { ...state, fetchTasks, addTask, updateTask, deleteTask };
}
```

**Posibles mejoras**:
- Usar `unknown` en el catch block y hacer narrowing con `instanceof Error` en lugar de `err: any`.
- Implementar rollback en `updateTask` y `deleteTask`: si el fetch falla, revertir el dispatch con los datos anteriores.
- Agregar `AbortController` en `fetchTasks` para cancelar peticiones si el componente se desmonta.

---

## src/components/ui/List.tsx

**Solución esperada**:

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

function List<T>({ items, renderItem, emptyMessage = 'No hay elementos' }: ListProps<T>) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="list">
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}

export default List;
```

**Posibles mejoras**:
- Agregar `keyExtractor: (item: T) => string | number` como prop para keys estables en lugar de usar `index`.
- Agregar un prop opcional `separator?: React.ReactNode` que se renderice entre items para listas con divisores.
- Usar `React.memo` con comparación custom para evitar re-renders cuando `items` no cambió referencialmente.

---

## Uso de List\<T\> en DashboardPage

**Solución esperada**:

```tsx
import List from '../components/ui/List';
import type { TaskPreview } from '../types';

function DashboardPage() {
  const { tasks } = useTasks();

  return (
    <div className="dashboard">
      <h1>Mis Tareas</h1>
      <List<TaskPreview>
        items={tasks}
        emptyMessage="¡Crea tu primera tarea!"
        renderItem={(task) => (
          <TaskCard key={task.id} task={task} />
        )}
      />
    </div>
  );
}
```

**Posibles mejoras**:
- Agregar `keyExtractor` usando `task.id.toString()` para keys estables en lugar del índice del map.
- Incluir un `header` y `footer` como props opcionales en `List` para título y paginación.
- Extraer la función `renderItem` a un `useCallback` para referencia estable y evitar re-renders de `List`.

---

## Ejemplo de eventos tipados

**Solución esperada**:

```tsx
function SearchInput() {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
      e.currentTarget.blur();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Buscar:', query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Buscar tareas..."
      />
    </form>
  );
}
```

**Posibles mejoras**:
- Agregar `React.ClipboardEvent` para manejar pegado de texto, y `React.CompositionEvent` para IME input (importante en idiomas asiáticos).
- Usar `useCallback` para `handleChange`, `handleKeyDown`, `handleSubmit` con dependencias apropiadas.
- Agregar `type="search"` y `autoComplete="off"` en el input para mejor UX móvil.
