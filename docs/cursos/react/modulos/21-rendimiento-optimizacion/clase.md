---
sidebar_label: "Clase"
---

## 2. useMemo: valores computados costosos

`useMemo` memoiza el **resultado de un cómputo** y solo lo recalcula cuando sus dependencias cambian.

```tsx
import { useMemo } from 'react'

function TaskList({ tasks, filter }: { tasks: Task[]; filter: string }) {
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => t.title.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }, [tasks, filter])

  return filteredTasks.map(task => <TaskCard key={task.id} {...task} />)
}
```

### ¿Cuándo usar useMemo?
- Transformaciones de arrays costosas (filter + sort + map)
- Operaciones matemáticas complejas
- Mantener referencias estables para children memoizados

---

## 3. useCallback: funciones estables

`useCallback` devuelve una **referencia estable** a una función, a menos que sus dependencias cambien.

```tsx
import { useCallback } from 'react'

function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])

  const handleToggle = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }, [])

  const handleDelete = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <div>
      {tasks.map(task => (
        <TaskCardMemo
          key={task.id}
          task={task}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}

const TaskCardMemo = memo(TaskCard)
```

Sin `useCallback`, cada render del `Dashboard` crea nuevas funciones, causando que `TaskCardMemo` se re-renderice igualmente.

---

## 4. Code Splitting con React.lazy

Divide el bundle en trozos que se cargan bajo demanda.

```tsx
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

const TaskDetailPage = lazy(() => import('../pages/TaskDetailPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))

const router = createBrowserRouter([
  {
    path: '/tasks/:id',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <TaskDetailPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterPage />
      </Suspense>
    ),
  },
])
```

### Estrategias de chunking
- **Por ruta**: cada página es un chunk independiente
- **Por componente**: componentes pesados (editor, gráficos) bajo demanda
- **Por librería**: librerías grandes cargadas con lazy

---

## 5. Bundle analysis con vite-plugin-visualizer

```bash
npm install -D vite-plugin-visualizer
```

Configurar en `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }),
  ],
})
```

```bash
npm run build
# Se abre automáticamente el reporte en el navegador
```

### Estrategias para reducir bundle
1. Importaciones específicas: `import debounce from 'lodash/debounce'` en vez de `import { debounce } from 'lodash'`
2. Tree shaking: usar ES modules, no CommonJS
3. Alternativas livianas: dayjs en vez de moment, zustand en vez de redux
4. Analizar dependencias duplicadas con `npm ls`

---

## 6. Lazy loading de imágenes

```tsx
function LazyImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} loading="lazy" />
}
```

Atributo nativo `loading="lazy"`. También se puede usar Intersection Observer para más control.

### Buenas prácticas
- Formatos modernos: WebP, AVIF (con fallback)
- Especificar dimensiones para evitar CLS
- `srcSet` para diferentes resoluciones
- Comprimir con sharp, squoosh, imagemin

---

## 7. Profiling con React DevTools

1. Abrir React DevTools (F12 en Chrome)
2. Ir a pestaña **Profiler**
3. Grabar interacción (círculo azul)
4. Interactuar con la app
5. Detener y analizar flame chart

**Qué buscar:**
- Componentes que se renderizan sin cambiar props/state
- Picos lentos en la gráfica
- Renders en cascada

---

## 8. Lighthouse: objetivo 90+

Ejecutar desde Chrome DevTools > Lighthouse o CLI:

```bash
npx lighthouse http://localhost:4173 --view
```

### Métricas Core Web Vitals
| Métrica | Qué mide | Bueno |
|---------|----------|-------|
| LCP | Carga del contenido principal | < 2.5s |
| FID | Interactividad | < 100ms |
| CLS | Estabilidad visual | < 0.1 |

### Estrategias para alcanzar 90+
- **Performance**: lazy loading, code splitting, imágenes optimizadas, minimizar JS bloqueante
- **Accessibility**: roles ARIA, contraste suficiente, labels en inputs
- **Best Practices**: HTTPS, sin console.log, meta viewport
- **SEO**: meta tags, heading structure, semantic HTML

---

## Resumen

| Situación | Qué usar |
|-----------|----------|
| Props no cambian pero componente se re-renderiza | `React.memo` |
| Cómputo costoso que depende de ciertos valores | `useMemo` |
| Función pasada a hijo memoizado | `useCallback` |
| Componente pesado que no se necesita al inicio | `React.lazy` + `Suspense` |
| Imágenes grandes | Lazy loading + formatos modernos |
| Bundle muy grande | Bundle analysis + code splitting |
| App lenta en general | Profiling con React DevTools |
| Auditoría | Lighthouse goal 90+ |
