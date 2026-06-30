---
sidebar_position: 2
sidebar_label: "Temario"
---

# Temario React 2026
### Basado en: *React 18/19 + TypeScript + Vite*
**Entorno:** Node.js 20+ + Vite + TypeScript 5+

---

## Filosofía del Curso

Este curso construye **UN SOLO PROYECTO** desde el Módulo 1 hasta el Módulo 24 de forma progresiva. Cada módulo agrega una capa nueva sobre el mismo código base. El Módulo 25 es un proyecto independiente que evalúa todos los conocimientos.

### Proyecto del Curso: **TaskFlow** — Gestor de Tareas Full-Stack

TaskFlow es una aplicación de gestión de tareas con:
- **Frontend:** React + TypeScript + Vite (lo que construimos aquí)
- **Backend:** Spring Boot API REST con JWT (Curso de Spring)
- **Autenticación:** JWT con login/registro
- **CRUD completo:** Crear, Leer, Actualizar, Eliminar tareas
- **Características:** Filtros, búsqueda, paginación, temas, animaciones

> 💡 **Integración con Spring:** Los módulos 07-09 y 17-18 se conectan con la API REST del [Curso Spring](/cursos/spring/temario). Puedes usar el backend de Spring o un mock (JSON Server / MSW).

---

## Configuración del Entorno

### Requisitos previos

```bash
# Verificar Node.js 20+
node --version

# Verificar npm
npm --version

# Verificar Git
git --version
```

### Crear proyecto base (Módulo 1)

```bash
npm create vite@latest taskflow -- --template react-ts
cd taskflow
npm install
npm run dev
```

### Dependencias que agregaremos progresivamente

| Módulo | Dependencia |
|--------|-------------|
| M01 | Vite + react + typescript |
| M02 | (ninguna, componentes puros) |
| M06 | react-hook-form + @hookform/resolvers + zod |
| M07 | axios |
| M08 | (ninguna, Context API nativa) |
| M11 | react-router-dom |
| M16 | vitest + @testing-library/react + msw |
| M17 | zustand |
| M18 | @tanstack/react-query |
| M19 | react-hook-form + zod (ya instalado en M06) |
| M20 | framer-motion |
| M22 | (Docker, sin dependencia npm) |
| M23 | (ninguna, config de CI/CD) |

### Extensiones de VS Code Recomendadas

| Extensión | Propósito |
|-----------|-----------|
| **ES7+ React/Redux/React-Native snippets** | Snippets para componentes funcionales y hooks |
| **Prettier - Code formatter** | Formateo automático |
| **ESLint** | Análisis estático (ya incluido con Vite) |
| **GitLens** | Visualización de historial Git |
| **Pretty TypeScript Errors** | Errores TypeScript más legibles |
| **Tailwind CSS IntelliSense** | (opcional) Si se usa Tailwind |

### Configuración inicial de ESLint con Vite + TypeScript

El proyecto creado con `create-vite --template react-ts` ya incluye ESLint con config para TypeScript y React. Se extenderá en M02 y M24.

---

## Estructura de cada Módulo

Cada módulo tiene su carpeta en `Modulos/` con 5 archivos:

| Archivo | Propósito |
|---------|-----------|
| `clase.md` | Lección teórica con ejemplos aplicados al proyecto TaskFlow |
| `ejercicio.md` | Enunciados para aplicar al proyecto (NO es standalone) |
| `respuesta.md` | Soluciones completas con el código que debe quedar |
| `diap.pptx` | Diapositivas PowerPoint (8-10 slides) para dictar la clase |
| `cuestionario.md` | 10 preguntas de nivel medio con respuestas |

> ⚠️ Los ejercicios NO son archivos aislados. Cada módulo modifica/agrega archivos al proyecto `taskflow/` que se viene construyendo.

---

## Mapa del Proyecto TaskFlow (Evolución por Semana)

```
taskflow/
├── src/
│   ├── components/          # Creación progresiva M02-M24
│   ├── pages/               # M11-M24
│   ├── hooks/               # M03-M10-M24
│   ├── context/             # M08-M17 (migra a Zustand)
│   ├── services/            # M07-M24 (API calls)
│   ├── types/               # M15-M24
│   ├── store/               # M17-M24 (Zustand)
│   ├── utils/               # M06-M24
│   ├── App.tsx              # Evoluciona cada módulo
│   ├── main.tsx             # M01 (creación)
│   └── vite-env.d.ts        # M01 (automático)
├── src/__tests__/           # M16-M24
├── .github/workflows/       # M23-M24
├── Dockerfile               # M22-M24
├── .eslintrc.cjs            # M01 (automático Vite)
├── tsconfig.json            # M01 (automático Vite)
├── tsconfig.node.json       # M01 (automático Vite)
├── vite.config.ts           # M01-M16
└── package.json             # Evoluciona cada módulo
```

---

## SEMANA 1 — Fundamentos (M01–M05): Esqueleto del Proyecto

> **Objetivo:** Inicializar TaskFlow con Vite + TypeScript + ESLint. Crear componentes base, estado local con useState, eventos, renderizado condicional y listas.

---

### Módulo 01 — Setup del Proyecto, Vite + TypeScript + ESLint
📁 `01-Setup-Proyecto-Vite-TS-ESLint/`

**Estado inicial:** Nada. Creamos el proyecto desde cero.

**Teoría:**
- Node.js, npm, package.json
- Vite: por qué es mejor que CRA
- TypeScript: tipado estático, inferencia
- ESLint: reglas para React + TypeScript
- Estructura del proyecto: `src/`, `public/`, `vite.config.ts`
- ReactDOM.createRoot, entry point `main.tsx`
- Primer componente `App.tsx` funcional
- `tsconfig.json`: strict mode, paths

**Práctica en TaskFlow:**
- `npm create vite@latest taskflow -- --template react-ts`
- Verificar ESLint funcionando
- Crear estructura de carpetas: `components/`, `types/`, `utils/`
- Componente `App.tsx` con título "TaskFlow"
- Commit: `git init && git add . && git commit -m "M01: setup proyecto"`

---

### Módulo 02 — Componentes Base y Props
📁 `02-Componentes-Base-Props/`

**Estado del proyecto:** App.tsx con título. Carpeta `components/` vacía.

**Teoría:**
- Componentes funcionales con TypeScript
- Props: interface, tipos, children
- Composición con Layout
- Fragmentos
- Default values en props
- Props con genéricos (Button<T>)

**Práctica en TaskFlow:**
- Crear `components/ui/`: `Button.tsx`, `Input.tsx`, `Card.tsx`
- Crear `components/layout/`: `Header.tsx`, `Layout.tsx`
- Tipar todas las props con TypeScript
- `Header` debe mostrar título y botón de login/logout (sin funcionalidad aún)
- `Layout` debe envolver contenido con Header + main
- Commit: `"M02: componentes base UI"`

---

### Módulo 03 — Estado con useState
📁 `03-Estado-UseState/`

**Estado del proyecto:** Componentes UI creados. Layout renderizando.

**Teoría:**
- useState: tipo inferido vs explícito `<T>`
- Inmutabilidad del estado
- Actualización funcional `prev =>`
- Estado objeto vs estado plano
- Múltiples estados vs objeto único
- Lifting state up

**Práctica en TaskFlow:**
- Crear hook `useTaskList` con useState
- Estado `Task[]` con interface `{ id, title, description, completed, createdAt }`
- Funciones: `addTask`, `toggleTask`, `deleteTask`
- Renderizar tareas hardcodeadas (sin API aún)
- Commit: `"M03: estado local de tareas"`

---

### Módulo 04 — Eventos y Renderizado Condicional
📁 `04-Eventos-Renderizado-Condicional/`

**Estado del proyecto:** Tareas en estado local. No se pueden agregar aún.

**Teoría:**
- Eventos sintéticos tipados: `onClick`, `onChange`, `onSubmit`
- Tipos: `React.MouseEvent`, `React.ChangeEvent`
- Pasar argumentos a handlers
- Renderizado condicional: `&&`, ternario, early return, objeto literal
- Renderizado condicional de formularios

**Práctica en TaskFlow:**
- Formulario inline para agregar tarea (título + descripción)
- Botón "Completar" que cambia estado
- Botón "Eliminar" con confirmación
- Filtros: mostrar "Todas", "Pendientes", "Completadas"
- Badge de estado: "Pendiente" (rojo) / "Completada" (verde)
- Mensaje "No hay tareas" cuando lista vacía
- Commit: `"M04: eventos y filtros"`

---

### Módulo 05 — Listas, Keys y Transformaciones
📁 `05-Listas-Keys/`

**Estado del proyecto:** Tareas se agregan, completan y eliminan en estado local.

**Teoría:**
- `.map()` con TypeScript: inferencia de tipos
- Keys: por qué `id` y no índice
- `.filter()`, `.sort()`, `.reduce()` con arrays tipados
- Ordenamiento por fecha
- Búsqueda/text filter

**Práctica en TaskFlow:**
- Asignar IDs únicos (`crypto.randomUUID()`)
- Lista ordenada por fecha descendente
- Input de búsqueda que filtra por título
- Contador de tareas: "5 pendientes de 10"
- Tareas completadas al final (opcional)
- Commit: `"M05: listas, keys y búsqueda"`

**✅ Checkpoint Semana 1:** TaskFlow funciona con estado local: agregar, completar, eliminar, filtrar, buscar y ordenar tareas. TypeScript en toda la app. ESLint sin errores.

---

## SEMANA 2 — Datos y Estado (M06–M10): Conectando con Spring Boot

> **Objetivo:** Formularios controlados, peticiones HTTP a Spring Boot, Context API, useReducer y custom hooks.

---

### Módulo 06 — Formularios Controlados con React Hook Form + Zod
📁 `06-Formularios-Controlados/`

**Estado del proyecto:** Formulario inline básico sin validación.

**Teoría:**
- Componentes controlados vs no controlados
- React Hook Form: `register`, `handleSubmit`, `watch`, `formState`
- Zod: esquemas de validación
- `@hookform/resolvers` para integrar Zod con RHF
- Errores personalizados
- `useRef` para inputs no controlados
- `forwardRef` en componentes personalizados

**Práctica en TaskFlow:**
- `npm install react-hook-form @hookform/resolvers zod`
- Crear esquema Zod para tarea: `title` (min 3, max 100), `description` (max 500)
- Modal/formulario para crear tarea con validación
- Mostrar errores de validación por campo
- Componente `Input` con `forwardRef` para RHF
- Commit: `"M06: formularios con RHF + Zod"`

---

### Módulo 07 — Peticiones HTTP a Spring Boot
📁 `07-Efectos-Peticiones-HTTP/`

**Estado del proyecto:** Tareas en memoria local (se pierden al recargar).

**Teoría:**
- `useEffect`: montaje, actualización, desmontaje
- Dependencias: `[]`, `[dep]`, sin array
- `fetch` vs `axios` (ventajas de axios)
- Patrón: `loading`, `data`, `error`
- `AbortController` para cancelar peticiones
- Servicio API con TypeScript: `api/tasks.ts`
- Tipado de respuestas: `TaskDTO`, `ApiResponse<T>`

**Práctica en TaskFlow:**
- `npm install axios`
- Crear `services/api.ts` con instancia axios + URL base
- Crear `services/taskService.ts` con métodos `getAll`, `create`, `update`, `delete`
- Reemplazar estado local por llamadas a Spring Boot API
- Mostrar loading spinner y mensaje de error
- Commit: `"M07: conexión con Spring Boot API"`

> **Endpoint Spring esperado:** `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/{id}`, `DELETE /api/tasks/{id}`

---

### Módulo 08 — Context API para Autenticación
📁 `08-Context-API/`

**Estado del proyecto:** API conectada pero sin autenticación.

**Teoría:**
- `createContext<T>` con tipo
- `useContext` hook
- Provider pattern
- Context + estado (token, user)
- Múltiples contextos
- `useMemo` en value del Provider
- Integración con axios interceptors

**Práctica en TaskFlow:**
- Crear `context/AuthContext.tsx`
- Estado: `user`, `token`, `isAuthenticated`, `loading`
- Funciones: `login`, `register`, `logout`
- Almacenar token en localStorage
- Agregar interceptor axios para enviar `Authorization: Bearer <token>`
- Proteger llamadas a la API
- Commit: `"M08: auth context + JWT"`

> **Endpoint Spring esperado:** `POST /api/auth/login`, `POST /api/auth/register`

---

### Módulo 09 — useReducer para Estado Complejo
📁 `09-UseReducer-Patrones-Estado/`

**Estado del proyecto:** Estado de tareas mezclado con llamadas API.

**Teoría:**
- `useReducer` vs `useState`
- Acciones tipadas: `type` + `payload`
- Reducer puro: `(state, action) => state`
- Discriminated unions en TypeScript
- Middleware pattern (logger)
- `useReducer` + Context para estado global

**Práctica en TaskFlow:**
- Crear `reducers/taskReducer.ts` con acciones:
  - `SET_TASKS`, `ADD_TASK`, `UPDATE_TASK`, `DELETE_TASK`
  - `SET_LOADING`, `SET_ERROR`, `SET_FILTER`
- Combinar con Context: `TaskContext` usa `useReducer`
- Migrar lógica de estado de tareas al reducer
- Agregar logger middleware (dev only)
- Commit: `"M09: task reducer + context"`

---

### Módulo 10 — Custom Hooks
📁 `10-Custom-Hooks/`

**Estado del proyecto:** Lógica mezclada en componentes y contextos.

**Teoría:**
- Custom hooks: extraer lógica repetitiva
- Hooks composables: hooks que usan hooks
- Reglas: prefijo `use`, solo en top level
- Genéricos en hooks: `useApi<T>`
- Testing de custom hooks con `renderHook`

**Práctica en TaskFlow:**
- `useAuth()`: accede a AuthContext con tipo
- `useTasks()`: accede a TaskContext con tipo
- `useDebounce(value, ms)`: para búsqueda
- `useLocalStorage<T>(key, initial)`: persistencia
- `useMediaQuery(query)`: responsive
- Refactorizar `App.tsx` usando hooks
- Commit: `"M10: custom hooks"`

**✅ Checkpoint Semana 2:** TaskFlow conectado a Spring Boot API con autenticación JWT, formularios con validación Zod, estado manejado con useReducer + Context y custom hooks reutilizables.

---

## SEMANA 3 — Navegación y Patrones (M11–M15)

> **Objetivo:** React Router, Portals, Compound Components, Error Boundaries, TypeScript avanzado.

---

### Módulo 11 — React Router y Navegación
📁 `11-React-Router/`

**Estado del proyecto:** Todo en una sola página.

**Práctica en TaskFlow:**
- `npm install react-router-dom`
- Rutas: `/login`, `/register`, `/dashboard`, `/tasks/new`, `/tasks/:id`
- `Layout.tsx` con `<Outlet />`
- NavLink para navegación
- ProtectedRoute: redirect a `/login` si no autenticado
- useNavigate después de login/register
- Commit: `"M11: React Router"`

---

### Módulo 12 — Portals, Refs y el DOM
📁 `12-Portals-Refs-DOM/`

**Práctica en TaskFlow:**
- Modal de confirmación con `createPortal`
- Tooltip para descripciones largas
- `useRef` para auto-focus en primer input del formulario
- `forwardRef` en Input.tsx (ya iniciado en M06)
- Medir altura de tareas con `ResizeObserver`
- Commit: `"M12: portals y refs"`

---

### Módulo 13 — Compound Components y Patrones de Composición
📁 `13-Render-Props-HOC-Composicion/`

**Práctica en TaskFlow:**
- `Tabs` component: `<Tabs> <Tab label="Pendientes"> <Tab label="Completadas"> </Tabs>`
- `Accordion` para tareas con descripción larga
- `ConfirmDialog` con slots (title, message, actions)
- `Modal` component compuesto
- Commit: `"M13: compound components"`

---

### Módulo 14 — Error Boundaries y Suspense
📁 `14-Errores-Suspense-Lazy/`

**Práctica en TaskFlow:**
- ErrorBoundary clase que captura errores de API
- `react-error-boundary` hook alternativo
- `React.lazy` + `Suspense` para páginas (dashboard, perfil)
- Fallback UI por ruta
- useTransition para navegación suave entre pestañas
- Commit: `"M14: error boundaries + lazy loading"`

---

### Módulo 15 — TypeScript Avanzado en React
📁 `15-TypeScript-React/`

**Práctica en TaskFlow:**
- Revisar y tipar todo el proyecto con strict mode
- Utility types: `Partial<Task>`, `Pick<Task, 'id' | 'title'>`
- Genéricos: `List<T>`, `ApiResponse<T>`
- `as const`, `satisfies`
- Tipar eventos del DOM correctamente
- Tipar `useReducer` con discriminated unions
- Commit: `"M15: TypeScript avanzado"`

**✅ Checkpoint Semana 3:** TaskFlow con navegación completa, modales con Portal, compound components, lazy loading y TypeScript strict en toda la app.

---

## SEMANA 4 — Ecosistema (M16–M20)

> **Objetivo:** Testing, Zustand, React Query, React Hook Form avanzado, animaciones.

---

### Módulo 16 — Testing con Vitest + React Testing Library
📁 `16-Testing-React/`

**Práctica en TaskFlow:**
- `npm install -D vitest @testing-library/react @testing-library/user-event msw`
- Configurar `vite.config.ts` para testing
- Testear `Button.tsx`, `Input.tsx`
- Testear `LoginPage.tsx` (flujo login exitoso y fallido)
- Testear `useDebounce` hook
- Mockear API con MSW
- CI: `npx vitest run` en GitHub Actions
- Commit: `"M16: testing"`

---

### Módulo 17 — Estado Global con Zustand
📁 `17-Estado-Global-RTK-Zustand/`

**Práctica en TaskFlow:**
- `npm install zustand`
- Migrar `AuthContext` a `store/authStore.ts`
- Migrar `TaskContext + useReducer` a `store/taskStore.ts`
- Persistencia automática con `zustand/middleware`
- Estado de UI: `sidebarOpen`, `theme` (dark/light)
- DevTools integration
- Commit: `"M17: migración a Zustand"`

---

### Módulo 18 — React Query (TanStack Query)
📁 `18-React-Query-TanStack/`

**Práctica en TaskFlow:**
- `npm install @tanstack/react-query`
- Reemplazar `useEffect` + `fetch` por `useQuery`
- `useMutation` para crear, actualizar, eliminar
- Cache invalidation: `queryClient.invalidateQueries`
- Optimistic updates: actualizar UI antes de respuesta
- Loading/error states con `isPending`, `isError`
- `useInfiniteQuery` para paginación
- Commit: `"M18: React Query"`

---

### Módulo 19 — React Hook Form Avanzado
📁 `19-React-Hook-Form/`

**Práctica en TaskFlow:**
- Formulario de registro con validación Zod (email, password, confirm)
- `useFieldArray` para subtareas
- Wizard: formulario multi-paso para tarea compleja
- Integración con Zustand (guardar draft)
- `Controller` para inputs personalizados (select, datepicker)
- Commit: `"M19: formularios avanzados"`

---

### Módulo 20 — Animaciones con Framer Motion
📁 `20-Animaciones-Framer-Motion/`

**Práctica en TaskFlow:**
- `npm install framer-motion`
- Animación de entrada de tareas (slide + fade)
- `AnimatePresence` para tareas que se eliminan
- Drag para marcar como completada
- Layout animations al cambiar filtros
- Stagger en lista de tareas
- Sidebar toggle animado
- Commit: `"M20: animaciones"`

**✅ Checkpoint Semana 4:** TaskFlow con tests, estado global con Zustand, fetching con React Query, formularios avanzados y animaciones fluidas.

---

## SEMANA 5 — Producción y Proyecto Final (M21–M25)

> **Objetivo:** Performance, Docker, CI/CD, Seguridad, Arquitectura limpia y Proyecto Final.

---

### Módulo 21 — Rendimiento y Optimización
📁 `21-Rendimiento-Optimizacion/`

**Práctica en TaskFlow:**
- `React.memo` en `TaskCard.tsx`
- `useMemo` para listas filtradas y ordenadas
- `useCallback` en handlers pasados a hijos
- Code splitting con `React.lazy`
- Bundle analysis con `vite-plugin-visualizer`
- Lazy loading de imágenes
- Lighthouse audit (objetivo: 90+)
- Commit: `"M21: optimización"`

---

### Módulo 22 — Docker y CI/CD
📁 `22-Nextjs-SSR-SSG/` → **Cambio a: Docker y CI/CD**

**Práctica en TaskFlow:**
- `Dockerfile` multi-stage: `node:20-alpine` build + `nginx:alpine` serve
- `.dockerignore`
- `docker-compose.yml` con frontend + backend Spring
- CI/CD: GitHub Actions
- Jobs: `lint`, `test`, `build`, `deploy`
- Deploy a Vercel / AWS S3
- Commit: `"M22: docker + CI/CD"`

---

### Módulo 23 — Seguridad en React
📁 `23-Seguridad-CICD-Despliegue/`

**Práctica en TaskFlow:**
- Manejo seguro de JWT: HttpOnly cookies (recomendado) vs localStorage
- Refresh token automático con axios interceptor
- XSS: sanitizar inputs, evitar `dangerouslySetInnerHTML`
- Content Security Policy headers
- CSRF protection
- Roles: Admin puede ver todas las tareas, User solo las suyas
- Commit: `"M23: seguridad"`

---

### Módulo 24 — Arquitectura Limpia y Refactor Final
📁 `24-Patrones-Arquitectura/`

**Práctica en TaskFlow:**
- Refactorizar a estructura feature-based:
  ```
  src/features/
    auth/    (components, pages, hooks, store)
    tasks/   (components, pages, hooks, store, api)
    ui/      (Button, Input, Modal, etc.)
  ```
- Separar capas: UI → Domain → Infra → Application
- ESLint config final: reglas estrictas
- Revisar naming, imports, exports
- Documentar componentes con JSDoc
- Commit: `"M24: arquitectura final"`
- Tag: `v1.0.0`

**✅ Checkpoint Semana 5:** TaskFlow completo: optimizado, dockerizado, con CI/CD, seguro y con arquitectura profesional.

---

### Módulo 25 — Proyecto Final: E-Commerce (Desde Cero)
📁 `25-Proyecto-Final-Entrevista/`

**Proyecto independiente.** Crear una app de E-Commerce desde cero en un día, aplicando todo lo aprendido.

**Requerimientos:**
- Vite + TypeScript + ESLint
- React Router (catálogo, carrito, checkout)
- Zustand (carrito, auth)
- React Query (productos, órdenes)
- React Hook Form + Zod (checkout)
- Framer Motion (animaciones de carrito)
- Testing (carrito, checkout)
- JWT auth (login para comprar)
- Diseño responsive

**10 ejercicios prácticos integradores:**
1. Setup del proyecto con Vite + TS + ESLint
2. Catálogo de productos con React Query + paginación
3. Carrito de compras con Zustand + persistencia
4. Checkout con React Hook Form + Zod
5. Autenticación JWT + rutas protegidas
6. Testing de componentes y hooks con MSW
7. Animaciones de carrito con Framer Motion
8. Optimización: memo, lazy loading, bundle analysis
9. Docker multi-stage + CI/CD
10. Despliegue en Vercel

**60 preguntas de entrevista (6 categorías):**
1. JavaScript/React Core (10)
2. Hooks y Estado (10)
3. TypeScript (10)
4. Testing (10)
5. Ecosistema (10)
6. Arquitectura y Producción (10)

---

## Resumen del Calendario

| Semana | Módulos | Fase | Proyecto TaskFlow |
|--------|---------|------|--------------------|
| **1** | 01 – 05 | Fundamentos | Esqueleto: setup, componentes, estado local, eventos, listas |
| **2** | 06 – 10 | Datos y Estado | API + Spring, Auth, Reducer, Custom Hooks |
| **3** | 11 – 15 | Navegación y Patrones | Router, Portals, Compound, ErrorBoundary, TS estricto |
| **4** | 16 – 20 | Ecosistema | Tests, Zustand, React Query, RHF, Animaciones |
| **5** | 21 – 25 | Producción | Performance, Docker, Seguridad, Arquitectura, E-Commerce |

---

## Criterios Generales de Evaluación

| Nivel | Descripción |
|-------|-------------|
| ✅ **Aprobado** | TaskFlow funcional: CRUD, auth, tests, buenas prácticas |
| ⚠️ **Revisar** | Funciona pero con anti-patrones (mutación directa, any types, efectos sin deps) |
| ❌ **Repetir** | No compila, tests fallan, no entiende los conceptos clave |

### Rúbrica M25 (E-Commerce)

- **Funcionalidad (40%):** Catálogo, carrito, checkout funcionan
- **Calidad (25%):** TypeScript sin `any`, ESLint sin warnings, tests pasan
- **Buenas prácticas (20%):** Componentes pequeños, hooks bien usados, sin estado duplicado
- **Arquitectura (15%):** Carpetas organizadas, separación de responsabilidades

---

## Recursos de Referencia

| Recurso | Enlace |
|---------|--------|
| React Docs oficial | https://react.dev |
| TypeScript + React | https://react-typescript-cheatsheet.netlify.app |
| TanStack Query | https://tanstack.com/query |
| Zustand | https://github.com/pmndrs/zustand |
| React Hook Form | https://react-hook-form.com |
| Zod | https://zod.dev |
| React Router | https://reactrouter.com |
| Framer Motion | https://www.framer.com/motion |
| React Testing Library | https://testing-library.com/react |
| Vite | https://vite.dev |
| Spring Boot + React | `/cursos/spring/temario` |

## Cursos en Video

- 🎥 **React + TypeScript (midudev):** https://youtube.com/playlist?list=PLUofhDIg_38q4D0xNWp7FEHOT2eMh7z3A
- 🎥 **React Query (español):** https://www.youtube.com/watch?v=GqTk3hRchwA
- 🎥 **Zustand (inglés):** https://www.youtube.com/watch?v=fZPgBnL2x_Q
- 🎥 **Spring Boot + React:** `/cursos/spring/temario` (ver M07-M11 de Spring)
