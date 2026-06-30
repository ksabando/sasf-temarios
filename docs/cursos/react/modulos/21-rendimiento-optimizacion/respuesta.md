---
sidebar_label: "Soluciones"
---

# Soluciones M21 — Rendimiento y Optimización

## Ejercicio 1: React.memo en TaskCard

**Solución esperada**:

```tsx
// src/components/TaskCard.tsx
import { memo } from 'react'
import { motion } from 'framer-motion'
import type { Task } from '../types'

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export const TaskCard = memo(function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="task-card"
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <span>{task.title}</span>
      <button onClick={() => onDelete(task.id)}>Eliminar</button>
    </motion.div>
  )
})
```

**Posibles mejoras**:
- Agregar `arePropsEqual` como segundo argumento de `memo` con una función custom que compare solo `task.id` y `task.completed`.
- Combinar con `useCallback` en el padre para que `onToggle` y `onDelete` tengan referencias estables.
- Evaluar si `motion.div` (Framer Motion) anula la memoización — `layout` y `animate` internamente manejan su propio ciclo de render.

---

## Ejercicio 2: useMemo para listas filtradas/ordenadas

**Solución esperada**:

```tsx
// src/pages/Dashboard.tsx
import { useState, useMemo, useCallback } from 'react'
import { TaskCard } from '../components/TaskCard'
import { useTaskStore } from '../store/taskStore'

export function Dashboard() {
  const tasks = useTaskStore(s => s.tasks)
  const toggleTask = useTaskStore(s => s.toggleTask)
  const deleteTask = useTaskStore(s => s.deleteTask)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [tasks, search, statusFilter])

  const handleToggle = useCallback((id: string) => {
    toggleTask(id)
  }, [toggleTask])

  const handleDelete = useCallback((id: string) => {
    deleteTask(id)
  }, [deleteTask])

  return (
    <div>
      <input
        placeholder="Buscar tareas..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="all">Todas</option>
        <option value="pending">Pendiente</option>
        <option value="in_progress">En progreso</option>
        <option value="completed">Completada</option>
      </select>

      {filteredTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}

      {filteredTasks.length === 0 && <p>No se encontraron tareas.</p>}
    </div>
  )
}
```

**Posibles mejoras**:
- Aplicar debounce al `search` con `useDebounce` para no re-filtrar en cada pulsación de tecla.
- Usar `React.useDeferredValue` para tareas grandes: diferir el filtrado intensivo manteniendo la UI responsive.
- Extraer la barra de filtros a un componente separado `FilterBar` para aislar sus re-renders del Dashboard.

---

## Ejercicio 3: useCallback en handlers del Dashboard

Ya incluido en el código del Ejercicio 2. Los handlers `handleToggle` y `handleDelete` usan `useCallback` con dependencias estables (`toggleTask`, `deleteTask`).

**Posibles mejoras**:
- Si `toggleTask` y `deleteTask` vienen de Zustand, sus referencias son estables por diseño — `useCallback` con esas dependencias nunca se invalida.
- Agregar `useEvent` (futuro hook de React) o un ref wrapper para handlers que necesitan acceder a valores Reactivos sin declararlos en dependencias.

---

## Ejercicio 4: Code Splitting con React.lazy

**Solución esperada**:

```tsx
// src/router.tsx
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Spinner } from './components/ui/Spinner'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
      { path: 'tasks/:id', element: <SuspenseWrapper><TaskDetailPage /></SuspenseWrapper> },
      { path: 'login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
      { path: 'register', element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
    ],
  },
])
```

**Posibles mejoras**:
- Agregar prefetching: importar la página al hacer hover en el link (`onMouseEnter={() => import('./pages/Dashboard')}`).
- Usar diferentes fallbacks según la sección: skeleton en lugar de spinner para contenido, spinner para páginas.
- Considerar `@loadable/component` si necesitás SSR + lazy loading (React.lazy no soporta SSR directamente).

---

## Ejercicio 5: Bundle analysis con vite-plugin-visualizer

**Solución esperada**:

```bash
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

```bash
npm run build
```

**Análisis del reporte:**
- Identificar si `framer-motion` o `@tanstack/react-query` dominan el bundle
- Verificar que las rutas lazy se muestran como chunks separados
- Si alguna librería es muy grande, considerar carga diferida o alternativa

**Posibles mejoras**:
- Configurar `manualChunks` en Rollup para dividir manualmente dependencias grandes en chunks separados con estrategia de caché.
- Usar `rollup-plugin-visualizer` con `template: 'sunburst'` para un diagrama interactivo más detallado.
- Comparar bundle size antes y después de optimizaciones y guardar el reporte en CI como artefacto.

---

## Ejercicio 6: Lighthouse audit

**Solución esperada**:

```bash
npm run build
npm run preview
```

**Resultados esperados tras optimizaciones:**

| Métrica | Antes | Después | Objetivo |
|---------|-------|---------|----------|
| Performance | ~65 | ~90+ | 90+ |
| Accessibility | ~80 | ~95+ | 90+ |
| Best Practices | ~75 | ~90+ | 90+ |
| SEO | ~80 | ~95+ | 90+ |

**Optimizaciones aplicadas:**
1. Code splitting por rutas → reduce JS inicial
2. Lazy loading de imágenes → mejora LCP
3. Attributo `loading="lazy"` en imágenes
4. Meta tags y heading structure → mejora SEO
5. ARIA labels en inputs y botones → mejora accesibilidad

**Posibles mejoras**:
- Automatizar Lighthouse audits en CI/CD con `@lhci/cli` y establecer thresholds mínimos que bloqueen deploys si bajan.
- Implementar `font-display: swap` y subsetting de fuentes para reducir layout shifts por fuentes web.
- Agregar `preload` para assets críticos (hero image, font) y `preconnect` para orígenes de API y CDN.
