---
sidebar_label: "Soluciones"
---

# Soluciones M11 — React Router DOM v6

## main.tsx

**Solución esperada**:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

**Posibles mejoras**:
- Usar `HashRouter` en lugar de `BrowserRouter` si la app se despliega en un entorno sin soporte de server-side routing (GitHub Pages, S3 estático sin configuración de fallback).
- Configurar un `basename` en `BrowserRouter` si la app se sirve desde un subdirectorio: `<BrowserRouter basename="/app">`.
- Agregar un `ScrollToTop` wrapper que use `useLocation` para scrollear al inicio en cada navegación (comportamiento esperado en SPAs).

---

## App.tsx

**Solución esperada**:

```tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Spinner from './components/ui/Spinner';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
```

**Posibles mejoras**:
- Agregar prefetching de rutas con `onMouseEnter` en los `<Link>` para cargar el chunk antes de que el usuario haga clic, mejorando la percepción de velocidad.
- Usar `createBrowserRouter` (data router) si se necesita loaders/actions para fetching de datos integrado con las rutas.
- Agregar `ScrollRestoration` del data router para mantener posición de scroll al navegar hacia atrás.

---

## Layout.tsx

**Solución esperada**:

```tsx
import { NavLink, Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function Layout() {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
```

**Posibles mejoras**:
- Pasar contexto de layout (como `user`) via `Outlet context` con `<Outlet context={{ user }} />` y leerlo con `useOutletContext()` en las páginas hijas.
- Agregar un `ErrorBoundary` específico para errores de ruta usando `errorElement` en la configuración de rutas.
- Implementar transiciones animadas entre rutas usando Framer Motion `AnimatePresence` alrededor del `<Outlet />`.

---

## Header.tsx

**Solución esperada**:

```tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <h1 className="app-logo">TaskFlow</h1>
      <nav className="app-nav">
        <NavLink to="/" end>Inicio</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        {user ? (
          <>
            <span className="user-name">{user.name}</span>
            <button onClick={logout}>Salir</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Registro</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
```

**Posibles mejoras**:
- Agregar `aria-current="page"` en el `<NavLink>` activo para accesibilidad de navegación.
- Incluir un menú de usuario con avatar y dropdown usando headless UI para opciones como "Perfil" y "Configuración".
- Mostrar un badge de notificaciones pendientes junto al nombre de usuario leyendo de un contexto de notificaciones.

---

## ProtectedRoute.tsx

**Solución esperada**:

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
```

**Posibles mejoras**:
- Recordar la ruta intentada pasando `state={{ from: location.pathname }}` al `Navigate`, y redirigir a esa ruta después del login en lugar de siempre al dashboard.
- Agregar verificación de roles (`user.role === 'admin'`) para rutas protegidas por permisos además de autenticación.
- Mostrar un spinner mientras se verifica la sesión en lugar de redirigir inmediatamente, evitando flash del login en recargas con token válido.

---

## LoginPage.tsx

**Solución esperada**:

```tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="auth-page">
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Contraseña" required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Entrar</button>
      </form>
      <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  );
}

export default LoginPage;
```

**Posibles mejoras**:
- Usar `useLocation` para leer `state.from` y redirigir a la ruta original después del login.
- Agregar estado `isSubmitting` para deshabilitar el botón y mostrar spinner durante el login.
- Reemplazar `FormData` con React Hook Form + Zod para validación consistente con el resto de la app.

---

## DashboardPage.tsx

**Solución esperada**:

```tsx
import { useSearchParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';

function DashboardPage() {
  const { tasks, loading } = useTasks();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('status') || 'all';

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter);

  const setFilter = (status: string) => {
    setSearchParams(status === 'all' ? {} : { status });
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="dashboard">
      <h1>Mis Tareas</h1>
      <div className="filters">
        {['all', 'pending', 'completed'].map(s => (
          <button
            key={s}
            className={filter === s ? 'active' : ''}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'Todas' : s === 'pending' ? 'Pendientes' : 'Completadas'}
          </button>
        ))}
      </div>
      <div className="task-list">
        {filtered.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
```

**Posibles mejoras**:
- Agregar `replace: true` en `setSearchParams` para no acumular entradas en el historial por cada cambio de filtro.
- Sincronizar el filtro de query string con el estado global de filtro para persistir el filtro entre navegaciones.
- Mostrar un contador de resultados: "Mostrando X de Y tareas" con el filtro actual resaltado.

---

## TaskDetailPage.tsx

**Solución esperada**:

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const task = tasks.find(t => t.id === Number(id));

  if (!task) {
    return (
      <div className="not-found">
        <h2>Tarea no encontrada</h2>
        <button onClick={() => navigate('/dashboard')}>Volver</button>
      </div>
    );
  }

  return (
    <div className="task-detail">
      <button onClick={() => navigate(-1)} className="back-btn">← Volver</button>
      <h1>{task.title}</h1>
      <p className="task-status">{task.status}</p>
      <p className="task-description">{task.description}</p>
    </div>
  );
}

export default TaskDetailPage;
```

**Posibles mejoras**:
- Agregar breadcrumb navegable: `Dashboard > Tarea: {task.title}`.
- Implementar edición inline con toggle entre vista y formulario, usando el mismo `TaskForm`.
- Mostrar metadata adicional: fecha de creación, última modificación, asignado a.
- Manejar el caso donde `id` no es un número válido con un early return de error.

---

## Spinner.tsx

**Solución esperada**:

```tsx
function Spinner() {
  return <div className="spinner" />;
}

export default Spinner;
```

**Posibles mejoras**:
- Agregar `aria-label="Cargando"` y `role="status"` para accesibilidad.
- Aceptar props `size` y `color` para reutilizar el spinner en diferentes contextos.
- Usar una animación CSS con `@keyframes` en lugar de un GIF para mejor rendimiento y control sobre la velocidad.
