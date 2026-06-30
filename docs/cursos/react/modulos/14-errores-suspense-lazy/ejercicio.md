---
sidebar_label: "Ejercicio"
---

# Ejercicios: Error Boundaries, Suspense y Lazy Loading - TaskFlow

Projecto base: `taskflow/`

## Ejercicio 1: Crear ErrorBoundary (clase)

Crear `src/components/error/ErrorBoundary.tsx`:

- Componente de clase con `getDerivedStateFromError` y `componentDidCatch`
- Estado: `hasError`, `error`
- Props: `fallback` opcional (ReactNode), `children`
- Si hay error, mostrar fallback o UI por defecto con mensaje y botón "Reintentar"
- El botón reintentar debe resetear el estado a `{ hasError: false, error: null }`

## Ejercicio 2: Usar react-error-boundary

Crear `src/components/error/AppErrorBoundary.tsx`:

- Importar `ErrorBoundary` de `react-error-boundary`
- Crear `ErrorFallback` con `error.message` y botón de reset
- Usar `useErrorHandler` en un componente de fetch de datos
- Log de error con `onError`

## Ejercicio 3: React.lazy para páginas

En `App.tsx`:

- Usar `React.lazy` para `DashboardPage` y `TaskDetailPage`
- Envolver `<Routes>` con `<Suspense>` con fallback `<Spinner />`
- Mantener `LoginPage` y `RegisterPage` como carga síncrona (siempre necesarias)

## Ejercicio 4: Suspense con skeleton

Crear `src/components/ui/Skeleton.tsx`:

- Componente Skeleton con animación shimmer (gradiente animado)
- Variantes: CardSkeleton, ListSkeleton
- Usar como fallback de Suspense para las páginas lazy

## Ejercicio 5: ErrorBoundary en rutas

Envolver cada ruta principal con ErrorBoundary:

- ErrorBoundary global en App (captura todo)
- ErrorBoundary en DashboardPage (captura errores de lista de tareas)
- ErrorBoundary en TaskDetailPage (captura errores de detalle)
