---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Catálogo de productos con React Query + paginación

1. Crear mock API con datos de productos (id, name, price, description, image, category)
2. Hook `useProducts(page, filters)` con React Query
3. Componente `ProductGrid` con grid responsivo
4. Componente `ProductCard` con imagen, nombre, precio, botón "Agregar al carrito"
5. Paginación (12 productos por página)
6. Filtros por categoría y búsqueda por texto
7. Loading state con skeletons

---

## Ejercicio 3: Carrito de compras con Zustand + persistencia

1. Store `cartStore` con Zustand + persistencia en localStorage
2. Acciones: addItem, removeItem, updateQuantity, clearCart
3. Selectores: totalItems, totalPrice, itemCount
4. Componente `CartDrawer` que se abre desde el header
5. Mostrar badge con cantidad de items en el icono del carrito
6. Persistir carrito entre sesiones

---

## Ejercicio 4: Checkout con React Hook Form + Zod

1. Esquema Zod con validaciones:
   - name: required, min 3 chars
   - email: required, valid email
   - address: required, min 10 chars
   - city: required
   - zipCode: required, 5 digits
   - cardNumber: required, 16 digits (Luhn opcional)
   - expiryDate: required, formato MM/YY, fecha futura
   - cvv: required, 3-4 digits
2. Formulario multi-paso (shipping → payment → review)
3. Resumen de orden con items del carrito
4. Submit que dispara mutation a API de órdenes
5. Limpiar carrito al completar la orden

---

## Ejercicio 5: Autenticación JWT + rutas protegidas

1. Auth store con Zustand: login, register, logout, user, token
2. Login y Register con formularios controlados
3. `ProtectedRoute` que redirige a `/login` si no hay token
4. `AdminRoute` que solo permite acceso a usuarios con role "admin"
5. Mostrar/ocultar elementos según rol (ej: "Administrar productos" solo admin)
6. Persistencia de sesión (token en localStorage)

---

## Ejercicio 6: Testing con Vitest + RTL + MSW

1. Configurar MSW con handlers para productos y auth
2. Test de `ProductCard`: renderiza nombre, precio, botón
3. Test de `CartDrawer`: agregar item, mostrar en drawer, eliminar
4. Test de carrito: addItem, removeItem, totalPrice
5. Test de checkout form: validación de campos, submit
6. Test de hook `useProducts`: verifica que retorna datos
7. Coverage mínimo 80%

---

## Ejercicio 7: Animaciones con Framer Motion

1. Transición de páginas con AnimatePresence (fade + slide)
2. ProductCard con animación de entrada (stagger grid)
3. Carrito: items aparecen/desaparecen con slide + fade
4. Badge del carrito: animación de scale al agregar item
5. Modal de confirmación con overlay fade
6. Botón "Agregar al carrito" con feedback visual (scale + check)
7. Toast notifications con slide-in/slide-out

---

## Ejercicio 8: Optimización

1. React.memo en ProductCard y CartItem
2. useMemo para productos filtrados y ordenados
3. useCallback en handlers del catálogo y carrito
4. React.lazy para: `CheckoutPage`, `OrdersPage`, `ProductDetailPage`
5. Bundle analysis con rollup-plugin-visualizer
6. Lazy loading de imágenes de productos (`loading="lazy"`)
7. Lighthouse audit — objetivo 90+ en todas las categorías

---

## Ejercicio 9: Docker multi-stage + CI/CD

1. Dockerfile multi-stage (node:20-alpine build → nginx:alpine serve)
2. nginx.conf con SPA routing, gzip, security headers
3. .dockerignore
4. docker-compose.yml
5. `.github/workflows/deploy.yml`:
   - trigger: push a main
   - jobs: lint → test → build → deploy (Vercel)

---

## Ejercicio 10: Deploy en Vercel

1. Instalar Vercel CLI: `npm install -g vercel`
2. `vercel login`
3. `vercel --prod`
4. Configurar variables de entorno en Vercel Dashboard
5. Configurar dominio personalizado (opcional)
6. Verificar que la app funciona en producción
