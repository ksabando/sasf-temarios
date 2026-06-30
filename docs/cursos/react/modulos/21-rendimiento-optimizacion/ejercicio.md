---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: useMemo para listas filtradas/ordenadas

En el Dashboard, actualmente se filtran y ordenan tareas en cada render. Usar `useMemo` para memoizar el resultado.

**Archivo:** `src/pages/Dashboard.tsx`

Requisitos:
- Filtro por texto (input de búsqueda)
- Filtro por estado (select: todas, pendiente, en progreso, completada)
- Ordenación por fecha (más reciente primero)
- TODO memoizado con `useMemo` dependiendo de `[tasks, search, statusFilter]`

---

## Ejercicio 3: useCallback en handlers del Dashboard

Los handlers `handleToggle`, `handleDelete`, `handleStatusChange` del Dashboard deben estar envueltos en `useCallback` con las dependencias correctas para evitar re-creaciones en cada render.

**Archivo:** `src/pages/Dashboard.tsx`

Usar `useCallback` en cada handler y verificar con `console.log` o Profiler que los hijos memoizados no se re-renderizan.

---

## Ejercicio 4: Code Splitting con React.lazy

Implementar lazy loading para las páginas más pesadas.

**Archivo:** `src/router.tsx` o `src/App.tsx`

Páginas a cargar con lazy:
- `TaskDetailPage` — ruta `/tasks/:id`
- `RegisterPage` — ruta `/register`

Envolver cada una con `<Suspense fallback={<Spinner />}>`.

---

## Ejercicio 5: Bundle analysis con vite-plugin-visualizer

```bash
npm install -D rollup-plugin-visualizer
```

**Archivo:** `vite.config.ts` — agregar plugin `visualizer({ open: true })`

Pasos:
1. Ejecutar `npm run build`
2. Analizar el reporte visual interactivo
3. Identificar los 3 módulos más grandes
4. Documentar hallazgos y posibles optimizaciones
5. Si se encuentra una librería pesada, optimizar su importación

---

## Ejercicio 6: Lighthouse audit

```bash
# Primero construir y servir la app
npm run build
npm run preview
```

Ejecutar Lighthouse desde Chrome DevTools sobre `http://localhost:4173`:
1. Auditar **Performance**, **Accessibility**, **Best Practices**, **SEO**
2. Registrar puntajes iniciales
3. Aplicar al menos 2 optimizaciones sugeridas por Lighthouse
4. Ejecutar nuevamente y comparar resultados
