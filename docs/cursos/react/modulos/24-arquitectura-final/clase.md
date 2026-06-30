---
sidebar_label: "Clase"
---

## 2. Clean Architecture en frontend

Adaptación de Clean Architecture (Robert C. Martin) para frontend:

```
┌─────────────────────────────────────┐
│           UI Layer                  │
│  (Componentes, Pages, Hooks)       │
├─────────────────────────────────────┤
│        Application Layer            │
│  (Casos de uso: servicios/store)    │
├─────────────────────────────────────┤
│        Domain Layer                 │
│  (Entidades, tipos, interfaces)     │
├─────────────────────────────────────┤
│     Infrastructure Layer            │
│  (API calls, localStorage, etc)     │
└─────────────────────────────────────┘
```

### Reglas de dependencia
- **UI** → depende de **Application** y **Domain**
- **Application** → depende de **Domain** (nunca de UI)
- **Infrastructure** → implementa interfaces definidas en **Domain**
- **Domain** → no depende de nada externo

### Ejemplo con TaskFlow
```ts
// Domain (entidad)
interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

// Application (caso de uso)
function useToggleTask(taskId: string) {
  const tasks = useTaskStore(s => s.tasks)
  const updateTask = useTaskStore(s => s.updateTask)
  // ...
}

// Infrastructure (implementación)
const taskApi = {
  fetchAll: () => api.get<Task[]>('/tasks'),
  update: (id: string, data: Partial<Task>) => api.patch(`/tasks/${id}`, data),
}
```

---

## 3. Atomic Design

Metodología de Brad Frost para organizar componentes:

| Nivel | Ejemplos en TaskFlow |
|-------|---------------------|
| **Atoms** | Button, Input, Label, Checkbox, Icon |
| **Molecules** | SearchBar (Input + Button), FormField (Label + Input + Error) |
| **Organisms** | TaskCard, TaskForm, Header, Sidebar |
| **Templates** | DashboardLayout, AuthLayout |
| **Pages** | Dashboard, LoginPage, TaskDetailPage |

```tsx
// Atom
function Button({ children, variant, ...props }: ButtonProps) { ... }

// Molecule
function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div>
      <Input placeholder="Buscar..." onChange={onSearch} />
      <Button variant="primary">Buscar</Button>
    </div>
  )
}

// Organism
function TaskCard({ task, onToggle, onDelete }: TaskCardProps) { ... }

// Template
function DashboardLayout() {
  return (
    <div>
      <Header />
      <Sidebar />
      <main><Outlet /></main>
    </div>
  )
}
```

---

## 4. ESLint strict rules

Configuración final con reglas estrictas:

```ts
// eslint.config.js
import tseslint from 'typescript-eslint'

export default tseslint.config({
  rules: {
    // TypeScript estricto
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',

    // React
    'react/jsx-no-target-blank': 'error',
    'react/no-danger': 'error',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
})
```

### Reglas clave explicadas
- `no-explicit-any` — prohibe `any`, forzar tipado correcto
- `strict-boolean-expressions` — evita truthy/falsy implícitos
- `no-floating-promises` — obliga a manejar promesas con await o catch
- `explicit-function-return-type` — funciones deben declarar tipo de retorno

---

## 5. JSDoc documentation

Documentar componentes y funciones clave con JSDoc:

```tsx
/**
 * TaskCard component displays a single task with toggle and delete actions.
 *
 * @component
 * @example
 * <TaskCard
 *   task={{ id: '1', title: 'Learn React', completed: false }}
 *   onToggle={(id) => handleToggle(id)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 */
export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) { ... }

/**
 * Filters tasks by search query and status.
 * @param tasks - Array of tasks to filter
 * @param query - Search string (matched against title)
 * @param status - Status filter ('all' | 'pending' | 'completed')
 * @returns Filtered and sorted array of tasks
 */
export function filterTasks(tasks: Task[], query: string, status: string): Task[] { ... }
```

---

## 6. Git tag v1.0.0

```bash
# Ver estado actual
git status

# Commit final si hay cambios pendientes
git add .
git commit -m "feat: finalize TaskFlow v1.0.0 architecture"

# Crear tag
git tag v1.0.0

# Push del tag
git push origin v1.0.0

# Ver tags
git tag -l

# Si se necesita eliminar
git tag -d v1.0.0
git push origin --delete v1.0.0
```

---

## Resumen

| Concepto | Implementación en TaskFlow |
|----------|---------------------------|
| Feature-based | `features/auth/`, `features/tasks/`, `features/ui/` |
| Clean Architecture | Domain (types), Application (store/hooks), Infrastructure (api) |
| Atomic Design | Atoms (Button), Molecules (SearchBar), Organisms (TaskCard) |
| ESLint strict | no-explicit-any, strict-boolean-expressions, no-floating-promises |
| JSDoc | Documentar componentes y funciones públicas |
| Git tag | `v1.0.0` — release final |
