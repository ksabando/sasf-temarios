---
sidebar_label: "Clase"
---

## 2. Stack tecnológico

| Tecnología | Propósito |
|------------|-----------|
| Vite + TypeScript | Build tool y tipado |
| React Router v6 | Routing |
| Zustand | Estado global (carrito, UI) |
| React Query (TanStack Query) | Server state (productos, auth) |
| React Hook Form + Zod | Formularios y validación |
| Framer Motion | Animaciones |
| Vitest + React Testing Library | Testing |
| MSW (Mock Service Worker) | API mocking en tests |
| Docker + nginx | Contenedor multi-stage |
| GitHub Actions | CI/CD |
| Vercel | Deploy |

---

## 3. Requisitos técnicos

```
Vite + TypeScript + ESLint
React Router (createBrowserRouter)
Zustand (carrito con persistencia en localStorage)
React Query (productos, órdenes)
React Hook Form + Zod (checkout)
Framer Motion (animaciones de carrito, páginas)
Testing con Vitest + RTL + MSW
Docker multi-stage
CI/CD con GitHub Actions
Deploy a Vercel
```

---

## 4. Arquitectura

```
src/
  features/
    auth/
      pages/        (LoginPage, RegisterPage)
      components/   (LoginForm, RegisterForm)
      hooks/        (useAuth, useLogin, useRegister)
      api/          (authApi.ts)
      types.ts
    products/
      pages/        (ProductListPage, ProductDetailPage)
      components/   (ProductCard, ProductGrid, ProductFilters)
      hooks/        (useProducts, useProduct)
      api/          (productsApi.ts)
      types.ts
    cart/
      components/   (CartDrawer, CartItem, CartSummary)
      store/        (cartStore.ts)
      types.ts
    checkout/
      pages/        (CheckoutPage)
      components/   (CheckoutForm, OrderSummary)
      hooks/        (useCheckout)
      schema/       (checkoutSchema.ts)
    orders/
      pages/        (OrdersPage, OrderDetailPage)
      hooks/        (useOrders)
      api/          (ordersApi.ts)
      types.ts
    ui/
      Button.tsx, Input.tsx, Modal.tsx, Spinner.tsx,
      Toast.tsx, Badge.tsx, Select.tsx, Pagination.tsx
  services/
    api.ts
    queryClient.ts
  types/
    index.ts
  utils/
    formatters.ts
    validators.ts
  App.tsx
  main.tsx
  index.css
```

---

## 5. Tiempo estimado: 1 día (8 horas)

| Hora | Actividad |
|------|-----------|
| 1-2 | Setup + estructura + auth |
| 2-3 | Catálogo de productos con React Query |
| 3-4 | Carrito con Zustand + persistencia |
| 4-5 | Checkout con RHF + Zod |
| 5-6 | Testing |
| 6-7 | Animaciones + optimización |
| 7-8 | Docker + CI/CD + deploy |

---

## 6. Lo que debes aplicar

- Componentes funcionales con TypeScript
- Hooks: useState, useEffect, useMemo, useCallback, custom hooks
- React Router: rutas protegidas, navegación, parámetros
- Zustand: store con persistencia, selectores
- React Query: useQuery, useMutation, queryClient, invalidateQueries
- React Hook Form: useForm, register, handleSubmit, errors
- Zod: esquemas de validación, inferencia de tipos
- Framer Motion: AnimatePresence, layout, variants, gestures
- Testing: render, screen, userEvent, MSW, renderHook
- Docker: multi-stage build, nginx.conf, docker-compose
- CI/CD: GitHub Actions con lint, test, build, deploy
- Optimización: React.memo, useMemo, useCallback, React.lazy, bundle analysis
