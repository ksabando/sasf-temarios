---
sidebar_label: "Clase"
---

# Error Boundaries, Suspense y Lazy Loading

## Estado Actual

Si la API falla, la app se rompe. Todas las páginas se cargan al inicio.

## Error Boundaries

Componentes de clase que capturan errores en su árbol de componentes hijo y muestran una UI de fallback.

### Ciclo de vida

```tsx
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Algo salió mal</h1>;
    }
    return this.props.children;
  }
}
```

### Limitaciones

No capturan:
- Errores en event handlers (usar try-catch)
- Código asíncrono sin await
- Errores en server-side rendering
- Errores dentro del propio Error Boundary

### Múltiples Error Boundaries

Aislar secciones independientes para que el error de una no rompa las demás.

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <TaskList />
</ErrorBoundary>
<ErrorBoundary fallback={<ErrorFallback />}>
  <Sidebar />
</ErrorBoundary>
```

## react-error-boundary

Librería que simplifica el manejo de errores con hooks.

```bash
npm install react-error-boundary
```

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Reintentar</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
  <MyComponent />
</ErrorBoundary>
```

### useErrorHandler

Hook para propagar errores al ErrorBoundary padre.

```tsx
const handleError = useErrorHandler();
try {
  await fetch('/api/tasks');
} catch (e) {
  handleError(e);
}
```

## React.lazy + Suspense

Carga diferida de componentes para reducir el bundle inicial.

```tsx
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'));
```

### Suspense

Muestra un fallback mientras el componente lazy se carga.

```tsx
<Suspense fallback={<Spinner />}>
  <DashboardPage />
</Suspense>
```

Anidar Suspense permite cargar partes de la página independientemente.

## useTransition

Mantiene la UI responsive marcando actualizaciones como no urgentes.

```tsx
const [isPending, startTransition] = useTransition();

startTransition(() => {
  setFilteredResults(heavyFilter(data, query));
});
```

## useDeferredValue

Retorna una versión retrasada de un valor para evitar bloqueos.

```tsx
const deferredQuery = useDeferredValue(query);
const isStale = query !== deferredQuery;
```

## Resumen

- **Error Boundaries**: capturan errores en componentes hijos, muestran fallback UI
- **react-error-boundary**: librería con hooks para manejo de errores
- **React.lazy**: carga diferida de componentes
- **Suspense**: fallback visual mientras se cargan componentes lazy
- **useTransition**: marca actualizaciones como no urgentes
- **useDeferredValue**: retrasa un valor para mantener UI responsive
