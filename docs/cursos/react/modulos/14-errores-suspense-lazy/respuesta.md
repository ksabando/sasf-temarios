---
sidebar_label: "Soluciones"
---

# Soluciones M14 — Error Boundaries, Suspense y Lazy Loading

## ErrorBoundary.tsx

**Solución esperada**:

```tsx
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <h2>Algo salió mal</h2>
          <p className="error-message">{this.state.error?.message}</p>
          <button className="btn-primary" onClick={this.handleReset}>
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Posibles mejoras**:
- Migrar a `react-error-boundary` para usar hooks (`useErrorHandler`) y el componente funcional `ErrorBoundary` con `FallbackComponent`.
- Integrar con un servicio de monitoreo (Sentry, LogRocket) en `componentDidCatch` para reportar errores en producción con stack traces.
- Agregar un límite de reintentos (`retryCount`) con backoff exponencial para evitar loops de error/reset infinitos.

---

## AppErrorBoundary.tsx

**Solución esperada**:

```tsx
import { ErrorBoundary } from 'react-error-boundary';
import { useErrorHandler } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="error-boundary">
      <h2>Error en la aplicación</h2>
      <pre className="error-message">{error.message}</pre>
      <button className="btn-primary" onClick={resetErrorBoundary}>
        Reintentar
      </button>
    </div>
  );
}

function DataFetcher({ url }: { url: string }) {
  const handleError = useErrorHandler();
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(setData)
      .catch(handleError);
  }, [url, handleError]);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('Error logged:', error, info);
      }}
      onReset={() => console.log('Component reset')}
    >
      {children}
    </ErrorBoundary>
  );
}

export { AppErrorBoundary, ErrorFallback };
```

**Posibles mejoras**:
- Agregar `onReset` que limpie el estado o recargue datos para que el reintento realmente pueda funcionar.
- Personalizar el `ErrorFallback` para mostrar un mensaje amigable al usuario en lugar del `error.message` técnico.
- Enviar el error a un servicio externo (Sentry) en el callback `onError` con metadata del usuario y la ruta actual.

---

## App.tsx (con lazy + Suspense + ErrorBoundary)

**Solución esperada**:

```tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/error/ErrorBoundary';
import Spinner from './components/ui/Spinner';
import CardSkeleton from './components/ui/Skeleton';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'));

function App() {
  return (
    <ErrorBoundary fallback={<h1>Error crítico en la aplicación</h1>}>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={
              <ErrorBoundary>
                <Suspense fallback={<CardSkeleton />}>
                  <DashboardPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={
                <ErrorBoundary>
                  <Suspense fallback={<CardSkeleton />}>
                    <DashboardPage />
                  </Suspense>
                </ErrorBoundary>
              } />
              <Route path="tasks/:id" element={
                <ErrorBoundary>
                  <Suspense fallback={<Spinner />}>
                    <TaskDetailPage />
                  </Suspense>
                </ErrorBoundary>
              } />
            </Route>
            <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
```

**Posibles mejoras**:
- Agregar `useTransition` alrededor de la navegación para no mostrar fallback en navegaciones entre páginas ya cargadas (solo en carga inicial).
- Implementar prefetching de chunks en `onMouseEnter` de los links para cargar páginas antes de que el usuario haga clic.
- Agregar un ErrorBoundary específico para el Layout, aislando errores de header/sidebar del contenido principal.

---

## Skeleton.tsx

**Solución esperada**:

```tsx
function Shimmer({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="skeleton-shimmer"
      style={style}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <Shimmer style={{ height: 20, width: '60%', marginBottom: 12 }} />
      <Shimmer style={{ height: 14, width: '90%', marginBottom: 8 }} />
      <Shimmer style={{ height: 14, width: '40%' }} />
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <Shimmer style={{ width: 40, height: 40, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <Shimmer style={{ height: 16, width: '40%', marginBottom: 4 }} />
            <Shimmer style={{ height: 12, width: '70%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export { CardSkeleton, ListSkeleton };
export default CardSkeleton;
```

**Posibles mejoras**:
- Agregar `aria-busy="true"` y `aria-label="Cargando contenido"` en los contenedores skeleton para lectores de pantalla.
- Hacer el shimmer más genérico con un componente `<SkeletonLine>` y `<SkeletonBlock>` reutilizables con props `width`, `height`, `rounded`.
- Ajustar la velocidad de la animación con `animation-duration` vía CSS custom property para skeletons más sutiles.

---

## CSS para skeletons (index.css)

**Solución esperada**:

```css
.skeleton-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-card {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-list-item {
  display: flex;
  gap: 12px;
  align-items: center;
}
```

**Posibles mejoras**:
- Usar `will-change: background-position` para promover la animación a la GPU y evitar repaints.
- Agregar `prefers-reduced-motion` media query para desactivar la animación si el usuario prefiere movimiento reducido.
- Definir las variables de color del shimmer con CSS custom properties para adaptarse a temas dark/light.
