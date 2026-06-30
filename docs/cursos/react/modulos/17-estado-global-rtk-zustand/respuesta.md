---
sidebar_label: "Soluciones"
---

# Soluciones M17 — Estado Global con Zustand

## `src/store/authStore.ts`

**Solución esperada**:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { user, token } = await authService.login(email, password);
          set({ user, token, loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const { user, token } = await authService.register(name, email, password);
          set({ user, token, loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      logout: () => set({ user: null, token: null, error: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'taskflow-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

**Posibles mejoras**:
- Agregar `version` y `migrate` en el `persist` para manejar cambios de estructura del estado entre deploys.
- Usar `zustand/middleware` `devtools` para inspeccionar acciones de auth en Redux DevTools durante desarrollo.
- Exportar selectores derivados como `useIsAuthenticated = () => useAuthStore(s => !!s.token)` para reutilización.

---

## `src/store/taskStore.ts`

**Solución esperada**:

```ts
import { create } from 'zustand';
import { taskService } from '../services/taskService';
import type { Task } from '../types';

type Filter = 'all' | 'active' | 'completed';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: Filter;
  fetchTasks: () => Promise<void>;
  addTask: (title: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilter: (filter: Filter) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  filter: 'all',

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskService.getAll();
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addTask: async (title) => {
    const newTask = await taskService.create({ title, completed: false });
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const updated = await taskService.update(id, { completed: !task.completed });
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTask: async (id) => {
    await taskService.delete(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  setFilter: (filter) => set({ filter }),
}));
```

**Posibles mejoras**:
- Agregar optimistic updates: actualizar el estado local antes de la llamada API y revertir en caso de error.
- Exportar selectores comunes: `usePendingTasks`, `useFilteredTasks` que encapsulen lógica de filtrado.
- Usar el middleware `immer` de Zustand para simplificar actualizaciones de estado anidado con mutación "segura".

---

## `src/store/uiStore.ts`

**Solución esperada**:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'taskflow-ui',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
```

**Posibles mejoras**:
- Agregar `sidebarWidth` y `isMobile` derivado de un media query listener para responsive state.
- Sincronizar `theme` con el atributo `data-theme` en `document.documentElement` mediante un `subscribe` fuera de React.
- Persistir también `sidebarOpen` si querés mantener el estado del sidebar entre recargas, removiéndolo del `partialize`.

---

## Ejemplo de migración: LoginPage (antes Context → ahora Zustand)

**Solución esperada**:

```tsx
// Antes: const { login, loading, error } = useAuth();
// Ahora:
import { useAuthStore } from '../store/authStore';

function LoginPage() {
  const { login, loading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };
  // ... resto igual
}
```

**Posibles mejoras**:
- Usar selectores individuales para evitar re-renders: `const login = useAuthStore(s => s.login); const loading = useAuthStore(s => s.loading)`.
- Agregar `useShallow` cuando se seleccionan múltiples valores del store para comparación superficial.
- Migrar `clearError` a un llamado automático con `setTimeout` dentro de la acción `login` en lugar de requerir que el componente lo llame.

---

## Archivos eliminados

```
src/context/AuthContext.tsx       → eliminado
src/context/TaskContext.tsx       → eliminado
src/reducers/taskReducer.ts       → eliminado
src/providers/AppProviders.tsx    → eliminado (ya no se necesita Provider)
```

**Posibles mejoras**:
- Mantener una capa de hooks personalizados (`useAuth`, `useTasks`) que internamente usen Zustand, preservando la API pública y facilitando futuras migraciones.
- Crear un barrel export `src/store/index.ts` que re-exporte todos los stores para imports más limpios.
- Agregar tests unitarios para cada store usando `useStore.getState()` y `useStore.setState()` sin necesidad de montar componentes React.
