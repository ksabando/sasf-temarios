---
sidebar_label: "Ejercicio"
---

# Ejercicios: React Router DOM v6 - TaskFlow

Projecto base: `taskflow/`

## Ejercicio 1: Instalar react-router-dom

```bash
cd taskflow
npm install react-router-dom
```

## Ejercicio 2: Crear páginas

Crear las siguientes páginas en `src/pages/`:

- **LoginPage.tsx** – formulario de login con email y password, usa `useAuth` y redirige con `useNavigate`
- **RegisterPage.tsx** – formulario de registro con nombre, email, password
- **DashboardPage.tsx** – lista de tareas del usuario (usa el hook `useTasks` del módulo anterior)
- **TaskDetailPage.tsx** – detalle de una tarea, usa `useParams` para obtener el ID

## Ejercicio 3: Configurar Router en main.tsx

En `src/main.tsx`, envolver `<App />` con `<BrowserRouter>`:

```tsx
import { BrowserRouter } from 'react-router-dom';

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

## Ejercicio 4: Layout con Outlet

Crear `src/Layout.tsx` que contenga:

- `<Header />` con navegación usando `<NavLink>`
- `<Outlet />` para el contenido de rutas hijas
- `<Footer />`

## Ejercicio 5: ProtectedRoute

Crear `src/components/auth/ProtectedRoute.tsx`:

- Verifica `useAuth()` para saber si hay usuario autenticado
- Si no hay sesión, redirige a `/login` con `<Navigate to="/login" replace />`
- Si hay sesión, renderiza `<Outlet />`

## Ejercicio 6: NavLink en Header

Actualizar `Header.tsx` para usar `<NavLink>` con estilo activo:

- Enlaces a: Dashboard, Tareas, Perfil
- La ruta activa debe tener clase `active` con estilo visual diferente

## Ejercicio 7: Lazy loading

Usar `React.lazy` + `Suspense` para cargar bajo demanda:

- DashboardPage y TaskDetailPage deben cargarse con lazy
- Suspense debe tener un fallback (spinner o skeleton)

## Ejercicio 8: useSearchParams para filtros

En la página de tareas, implementar filtros por query params:

- `?status=pending|completed` para filtrar por estado
- `?search=texto` para búsqueda
- Leer con `useSearchParams` y aplicar filtros
