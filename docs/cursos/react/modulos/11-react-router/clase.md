---
sidebar_label: "Clase"
---

# React Router DOM v6

## Estado Actual

TaskFlow es una SPA de una sola página. Todo está en App.tsx. No hay navegación.

## React Router DOM v6

Librería estándar para navegación y enrutamiento en SPAs con React, sin recargar la página.

## Instalación

```bash
npm install react-router-dom
```

## Componentes Principales

### BrowserRouter

Contenedor principal que mantiene la UI sincronizada con la URL usando la API History de HTML5.

```jsx
import { BrowserRouter } from 'react-router-dom';
```

Normalmente se coloca en `main.tsx` envolviendo `<App />`.

### Routes y Route

`Routes` agrupa rutas hijas. `Route` define path + elemento a renderizar.

```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="tasks/:id" element={<TaskDetail />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

- `index`: ruta por defecto cuando el path padre coincide exactamente
- `*`: captura cualquier ruta no definida (404)

## Navegación

### Link

Renderiza un `<a>` que navega sin recargar.

```jsx
<Link to="/dashboard">Dashboard</Link>
```

### NavLink

Similar a Link pero agrega estilos condicionales según la ruta activa.

```jsx
<NavLink
  to="/tasks"
  className={({ isActive }) => isActive ? 'nav-active' : ''}
>
  Tareas
</NavLink>
```

Props útiles: `className` y `style` como función `({ isActive, isPending }) => ...`, `end` para coincidencia exacta.

### Navigate

Redirige declarativamente al renderizarse.

```jsx
<Navigate to="/login" replace />
```

### useNavigate

Hook para navegación imperativa.

```jsx
const navigate = useNavigate();
navigate('/dashboard');
navigate(-1); // retroceder
```

Firma: `navigate(to, { replace, state })`

## Rutas Anidadas con Layout

### Outlet

Renderiza rutas hijas dentro de un layout compartido.

```jsx
function Layout() {
  return (
    <div>
      <Header />
      <main><Outlet /></main>
      <Footer />
    </div>
  );
}
```

## Parámetros de Ruta

### useParams

```jsx
// Ruta: /tasks/:id
const { id } = useParams();
```

### useSearchParams

Lee y modifica query strings.

```jsx
const [searchParams, setSearchParams] = useSearchParams();
const page = Number(searchParams.get('page')) || 1;
setSearchParams({ page: '2' });
```

## Rutas Protegidas

### ProtectedRoute

Redirige a `/login` si el usuario no está autenticado.

```jsx
function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

Uso:

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

## Lazy Loading con React.lazy + Suspense

Carga diferida de componentes para reducir el bundle inicial.

```jsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TaskDetail = lazy(() => import('./pages/TaskDetail'));

<Routes>
  <Route path="/dashboard" element={
    <Suspense fallback={<Spinner />}>
      <Dashboard />
    </Suspense>
  } />
</Routes>
```

## Resumen

- BrowserRouter envuelve la app y sincroniza con la URL
- Routes + Route definen el mapeo de rutas
- Link, NavLink, Navigate para navegación declarativa
- useNavigate para navegación imperativa
- Outlet permite layouts compartidos con rutas anidadas
- useParams captura parámetros de URL dinámicos
- useSearchParams maneja query strings
- ProtectedRoute verifica autenticación antes de mostrar contenido
- React.lazy + Suspense carga componentes bajo demanda
