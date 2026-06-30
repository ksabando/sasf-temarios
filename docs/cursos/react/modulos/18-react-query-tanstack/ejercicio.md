---
sidebar_label: "Ejercicio"
---

# Ejercicio — React Query en TaskFlow

**Proyecto:** `taskflow/`
**Objetivo:** Reemplazar `useEffect` + `fetch` por TanStack React Query para manejo de server state.

---

## 1. Instalar dependencia

```bash
npm install @tanstack/react-query
```

## 2. Crear `services/queryClient.ts`

```ts
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({ ... });
```

Configurar `staleTime: 1000 * 60 * 5`, `retry: 2`.

## 3. Envolver App con `QueryClientProvider`

En `main.tsx` o `App.tsx`:
- Importar `QueryClientProvider`
- Importar `queryClient`
- Envolver la app

## 4. Reemplazar `useEffect` + `taskService.getAll` por `useQuery`

En `TaskList` o el componente que lista tareas:
- Eliminar `useEffect` con `fetchTasks()`
- Usar `useQuery({ queryKey: ['tasks'], queryFn: () => taskService.getAll() })`
- Manejar `isLoading`, `isError`, `isSuccess`

## 5. Reemplazar CRUD por `useMutation`

Para `addTask`, `toggleTask`, `deleteTask`:
- Crear mutaciones con `useMutation`
- Llamar `invalidateQueries({ queryKey: ['tasks'] })` en `onSuccess`

## 6. Optimistic update para `toggleTask`

En la mutación de toggle:
- `onMutate`: cancelar queries, guardar estado anterior, actualizar caché optimistamente
- `onError`: revertir con el estado guardado
- `onSettled`: invalidar queries para sincronizar

## 7. Verificar

- `npm run dev` sin errores
- Al agregar tarea, aparece inmediatamente (después de invalidación)
- Al marcar completada, el checkbox cambia antes de la respuesta del servidor
- Si el servidor falla, el cambio se revierte
