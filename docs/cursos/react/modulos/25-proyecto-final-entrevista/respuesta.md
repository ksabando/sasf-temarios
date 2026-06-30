---
sidebar_label: "Soluciones"
---

# Soluciones M25 — Proyecto Final: ShopFlow

## Ejercicio 1: Setup + Estructura

**Solución esperada**:

```bash
npm create vite@latest shopflow -- --template react-ts
cd shopflow
npm install
npm install react-router-dom @tanstack/react-query zustand react-hook-form @hookform/resolvers zod framer-motion
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw rollup-plugin-visualizer
```

**Estructura de carpetas:**

```bash
mkdir -p src/features/auth/{pages,components,hooks,api}
mkdir -p src/features/products/{pages,components,hooks,api}
mkdir -p src/features/cart/{components,store}
mkdir -p src/features/checkout/{pages,components,hooks,schema}
mkdir -p src/features/orders/{pages,hooks,api}
mkdir -p src/features/ui
mkdir -p src/services
mkdir -p src/types
mkdir -p src/utils
```

**src/main.tsx:**
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './services/queryClient'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

**src/App.tsx:**
```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

export function App() {
  return <RouterProvider router={router} />
}
```

**src/router.tsx:**
```tsx
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Layout } from './components/Layout'
import { Spinner } from './features/ui/Spinner'

const ProductListPage = lazy(() => import('./features/products/pages/ProductListPage'))
const ProductDetailPage = lazy(() => import('./features/products/pages/ProductDetailPage'))
const CheckoutPage = lazy(() => import('./features/checkout/pages/CheckoutPage'))
const OrdersPage = lazy(() => import('./features/orders/pages/OrdersPage'))
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'))

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Lazy><ProductListPage /></Lazy> },
      { path: 'products/:id', element: <Lazy><ProductDetailPage /></Lazy> },
      { path: 'checkout', element: <Lazy><CheckoutPage /></Lazy> },
      { path: 'orders', element: <Lazy><OrdersPage /></Lazy> },
      { path: 'login', element: <Lazy><LoginPage /></Lazy> },
      { path: 'register', element: <Lazy><RegisterPage /></Lazy> },
    ],
  },
])
```

**Posibles mejoras**:
- Agregar `ErrorBoundary` en el layout y rutas principales para capturar errores de carga de chunks lazy.
- Configurar path aliases (`@/features/*`) en `vite.config.ts` y `tsconfig.json` para imports más limpios.
- Crear un componente `Providers` que agrupe `QueryClientProvider`, `RouterProvider`, y futuros providers.

---

## Ejercicio 2: Catálogo de productos con React Query

**Solución esperada**:

*(Ver código completo en el archivo respuesta.md original)*

**Posibles mejoras**:
- Implementar filtros en la URL usando `useSearchParams` para que la búsqueda y categoría sean bookmarkeables.
- Agregar `placeholderData: keepPreviousData` en `useQuery` para mantener los datos anteriores mientras carga la nueva página.
- Usar `useDeferredValue` en el input de búsqueda para mantenerlo responsive con catálogos grandes.

---

## Ejercicio 3: Carrito de compras con Zustand + persistencia

**Solución esperada**:

*(Ver código completo en el archivo respuesta.md original)*

**Posibles mejoras**:
- Agregar `updateQuantity` con validación (no permitir cantidades < 1, auto-remover item si quantity = 0).
- Implementar `mergeCart` para sincronizar el carrito local con el del backend cuando el usuario inicia sesión.
- Agregar `useShallow` en los selectores que retornan objetos/arrays derivados para evitar re-renders.

---

## Ejercicio 4: Checkout con React Hook Form + Zod

**Solución esperada**:

*(Ver código completo en el archivo respuesta.md original)*

**Posibles mejoras**:
- Usar `FormProvider` + `useFormContext` en lugar de prop drilling para mantener los steps limpios.
- Agregar validación de tarjeta con algoritmo de Luhn en `.refine()` para detectar números de tarjeta inválidos.
- Implementar un step indicator visual (stepper) con estados `completed`, `active`, `pending`.

---

## Ejercicio 5: Autenticación JWT + rutas protegidas

**Solución esperada**:

*(Ver código completo en el archivo respuesta.md original)*

**Posibles mejoras**:
- Agregar refresh token logic con interceptor de axios y cola de peticiones.
- Persistir el redirect original en `state` y redirigir al destino después del login.
- Validar el token con el backend al cargar la app (endpoint `/auth/me`) para verificar que no expiró.

---

## Ejercicio 6: Testing

**Solución esperada**:

*(Ver código completo en el archivo respuesta.md original)*

**Posibles mejoras**:
- Agregar tests de integración para el flujo completo: login → ver productos → agregar al carrito → checkout.
- Implementar test coverage thresholds en vitest config (`lines: 80`, `branches: 70`, `functions: 80`).
- Agregar tests para el interceptor de refresh token (mockear 401 + refresh success).

---

## Ejercicio 7: Animaciones con Framer Motion

**Solución esperada**:

*(Ver código completo en el archivo respuesta.md original)*

**Posibles mejoras**:
- Agregar `useReducedMotion()` para respetar preferencias de accesibilidad.
- Implementar animación de "shake" en el formulario de checkout cuando hay errores de validación.
- Agregar `whileInView` en los ProductCard para animar entrada solo cuando el usuario scrollea hasta ellos.

---

## Ejercicio 8: Optimización

**Solución esperada**:

*(Ver descripcion en el archivo respuesta.md original)*

**Posibles mejoras**:
- Configurar `manualChunks` en Rollup para separar vendor chunks (react, react-dom, framer-motion, react-query).
- Implementar `preconnect` y `dns-prefetch` para la API y CDN de imágenes en `index.html`.
- Agregar service worker para caching offline con Workbox.

---

## Ejercicio 9: Docker multi-stage + CI/CD

**Solución esperada**:

*(Ver código completo en el archivo respuesta.md original)*

**Posibles mejoras**:
- Agregar healthcheck en el Dockerfile: `HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1`.
- Configurar `docker compose --profile production` vs `--profile development` para entornos separados.
- Agregar job de `security-audit` en CI que corra `npm audit --audit-level=high` y `trivy` para escanear la imagen Docker.

---

## Ejercicio 10: Deploy en Vercel

**Solución esperada**:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy a producción
vercel --prod

# O usar GitHub Actions (ya configurado en Ejercicio 9)

# Variables de entorno en Vercel Dashboard:
# VITE_API_URL = https://api.shopflow.com
```

**Posibles mejoras**:
- Configurar dominios custom en Vercel con SSL automático.
- Agregar `vercel.json` con reglas de rewrites para el SPA fallback y headers de seguridad (CSP, HSTS).
- Configurar preview deployments automáticos por PR para testing antes de merge a main.
