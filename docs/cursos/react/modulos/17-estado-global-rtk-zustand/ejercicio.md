---
sidebar_label: "Ejercicio"
---

# Ejercicio — Estado Global con Zustand en TaskFlow

**Proyecto:** `taskflow/`
**Objetivo:** Reemplazar Context API + useReducer por Zustand. Eliminar prop drilling.

---

## 1. Instalar Zustand

```bash
npm install zustand
```

## 2. Crear `store/authStore.ts`

Store con persist middleware:
- **State:** `user: User | null`, `token: string | null`, `loading: boolean`, `error: string | null`
- **Actions:** `login(email, password)`, `register(name, email, password)`, `logout()`, `clearError()`
- **Persist:** solo `user` y `token`

## 3. Crear `store/taskStore.ts`

Store **sin persist** (datos vienen del servidor):
- **State:** `tasks: Task[]`, `loading: boolean`, `error: string | null`, `filter: 'all' | 'active' | 'completed'`
- **Actions:** `fetchTasks()`, `addTask(title)`, `toggleTask(id)`, `deleteTask(id)`, `setFilter(filter)`

## 4. Crear `store/uiStore.ts`

Store con persist:
- **State:** `sidebarOpen: boolean`, `theme: 'light' | 'dark'`
- **Actions:** `toggleSidebar()`, `setTheme(theme)`

## 5. Migrar AuthContext a authStore

- Buscar todos los componentes que usan `useAuth()` del contexto
- Reemplazar con `useAuthStore()`
- El store debe exponer el mismo contrato para minimizar cambios

## 6. Migrar TaskContext + taskReducer a taskStore

- Reemplazar `useTasks()` del contexto por `useTaskStore()`
- Las acciones del reducer ahora son acciones del store

## 7. Eliminar archivos antiguos

- `src/context/AuthContext.tsx`
- `src/context/TaskContext.tsx`
- `src/reducers/taskReducer.ts`
- `src/providers/` (si existe)

## 8. Verificar

- `npm run dev` debe funcionar sin errores
- Login, registro, CRUD de tareas deben funcionar igual que antes
- Al recargar la página, la sesión debe mantenerse (persist)
