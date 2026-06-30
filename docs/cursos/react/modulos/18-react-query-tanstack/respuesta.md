---
sidebar_label: "Soluciones"
---

# Soluciones M18 — React Query (TanStack Query)

## `src/services/queryClient.ts`

**Solución esperada**:

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
```

**Posibles mejoras**:
- Configurar `gcTime` (antes `cacheTime`) para mantener datos en caché más tiempo en navegaciones frecuentes.
- Agregar un `onError` global en `defaultOptions.queries` para logging centralizado de errores de API.
- Configurar `retryDelay` con backoff exponencial personalizado para diferentes códigos de error.

---

## `src/main.tsx` — Provider

**Solución esperada**:

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
```

**Posibles mejoras**:
- Agregar `ReactQueryDevtools` con `initialIsOpen: false` para debugging en desarrollo.
- Configurar el `queryClient` con `defaultOptions.mutations.onError` global para manejo de errores de mutación.
- Suscribirse a eventos del `queryClient` (`queryCache.subscribe`) para métricas de performance de queries.

---

## `src/components/TaskList.tsx` — useQuery

**Solución esperada**:

```tsx
import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { TaskCard } from './TaskCard';
import { Spinner } from './Spinner';
import { ErrorMessage } from './ErrorMessage';

export function TaskList() {
  const { data: tasks, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getAll(),
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div>
      {isFetching && <div className="refetch-indicator" />}
      {tasks?.length === 0 ? (
        <p>No hay tareas. ¡Crea una!</p>
      ) : (
        <ul>
          {tasks?.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Posibles mejoras**:
- Usar `select` option para transformar datos en el nivel de caché: `select: (data) => data.filter(t => t.status === filter)`.
- Mostrar un indicador visual más sutil (progress bar superior) para `isFetching` en lugar de un elemento en el DOM del contenido.
- Agregar `refetchInterval` para polling automático si los datos cambian frecuentemente.

---

## `src/components/TaskCard.tsx` — useMutation con optimistic update

**Solución esperada**:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () =>
      taskService.update(task.id, { completed: !task.completed }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['tasks'], context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => taskService.delete(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return (
    <li className={`task-card ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleMutation.mutate()}
      />
      <span>{task.title}</span>
      <button
        onClick={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? '...' : 'Eliminar'}
      </button>
    </li>
  );
}
```

**Posibles mejoras**:
- Agregar optimistic update también en `deleteMutation` para eliminación instantánea con rollback.
- Usar `mutation.isLoading` (ahora `isPending`) para deshabilitar el checkbox durante toggle.
- Implementar un toast con `mutation.error` en `onError` para feedback visual sin bloquear la UI.

---

## `src/components/AddTaskForm.tsx` — useMutation para crear

**Solución esperada**:

```tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';

export function AddTaskForm() {
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (title: string) =>
      taskService.create({ title, completed: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTitle('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate(title.trim());
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nueva tarea..."
      />
      <button type="submit" disabled={mutation.isPending || !title.trim()}>
        {mutation.isPending ? 'Agregando...' : 'Agregar'}
      </button>
    </form>
  );
}
```

**Posibles mejoras**:
- Implementar optimistic update para la creación: agregar la tarea al caché inmediatamente con un ID temporal y reemplazarlo con el real del servidor.
- Agregar `onError` con rollback y notificación de toast para manejar errores de creación.
- Resetear el formulario con `useRef` en el input para devolver el foco después de crear.
