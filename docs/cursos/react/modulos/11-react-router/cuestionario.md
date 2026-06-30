---
sidebar_label: "Cuestionario"
---

# Cuestionario M11 — React Router DOM v6

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es React Router v7 y cómo se relaciona con Remix? Ryan Florence (creador de React Router y Remix) anunció la fusión de ambos. ¿Qué cambia en v7 respecto a v6 para proyectos como TaskFlow?

**Respuesta**: React Router v7 es esencialmente Remix v3 rebrandeado como la próxima versión de React Router. Unifica el router de SPA (v6) con el framework full-stack (Remix) en un solo paquete. Para SPAs como TaskFlow, v7 puede usarse en "modo SPA" (similar a v6) o en "modo framework" (con loaders, actions, y SSR). Los cambios principales: (1) `createBrowserRouter` y `RouterProvider` se mantienen pero con nuevas APIs de data loading, (2) Server-Side Rendering integrado, (3) soporte para React Server Components, (4) type safety mejorada para params y search params, (5) `useLoaderData` y `useActionData` disponibles incluso en modo SPA si usás loaders.

**Por qué**: La fusión significa que podés empezar como SPA con React Router y gradualmente adoptar SSR/SSG sin cambiar de librería. Ryan Florence explicó: "React Router v7 is Remix, and Remix is React Router v7." Para TaskFlow, la migración de v6 a v7 es mayormente compatible — los cambios están en APIs adicionales, no en la eliminación de las existentes. La principal ventaja sería poder usar `loader` + `useLoaderData` para data fetching declarativo (similar a React Query pero integrado en el router). Fuente: "React Router v7" en reactrouter.com, "The Future of React Router" por Ryan Florence en React Conf 2024, y el RFC de la fusión Remix + React Router.

---

### 2. [Investigar] ¿Qué es TanStack Router y por qué se presenta como una alternativa type-safe a React Router? Tanner Linsley lo diseñó con TypeScript-first desde cero. ¿Qué diferencia fundamental tiene en la forma de definir rutas y manejar params?

**Respuesta**: TanStack Router es un router 100% type-safe donde las rutas, params, search params, y hasta el contexto de ruta están completamente tipados e inferidos. A diferencia de React Router (donde `useParams()` retorna `Record<string, string | undefined>` genérico), TanStack Router conoce exactamente qué params existen en cada ruta y los tipa. Las rutas se definen como un árbol de objetos tipados con `createFileRoute` o `createRoute`, y el router genera automáticamente tipos para `useParams`, `useSearch`, `useNavigate`:

```ts
// TanStack Router: params están completamente tipados
const taskRoute = createRoute({
  path: '/tasks/$taskId',
  component: TaskPage,
})
// useParams() retorna { taskId: string } — no string | undefined
```

**Por qué**: La inferencia de tipos profunda de TanStack Router (usando template literal types de TypeScript) elimina la necesidad de type assertions. Sabe que `$taskId` es un segmento dinámico y tipa `params.taskId` como `string` (siempre presente porque la ruta matchea). Con search params, podés definir validación Zod y los search params se tipan automáticamente. También soporta "type-safe links": `<Link to="/tasks/$taskId" params={{ taskId: '42' }} />` — TypeScript verifica que `params.taskId` es requerido y es string. Para TaskFlow, TanStack Router ofrecería mejor DX pero React Router v6 es suficiente y más estable. Fuente: tanstack.com/router, "Introducing TanStack Router" por Tanner Linsley, y "Type-Safe Routing in React" en el blog de TanStack.

---

### 3. [Investigar] ¿Qué son los "nested layouts" y "parallel routes" en React Router v6? La clase muestra layouts anidados con `<Outlet>`. Investigá cómo implementar rutas paralelas (múltiples outlets en la misma página) y cómo esto se compara con el patrón de slots de Vue o Svelte.

**Respuesta**: Rutas paralelas permiten renderizar múltiples secciones de la página que cambian independientemente según la URL. En React Router v6, esto se implementa usando rutas sin path (layout routes) que definen múltiples outlets nombrados o usando rutas hijas con rutas `index`:

```tsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<DefaultSidebar />} />
  <Route path="settings" element={<SettingsSidebar />} />
  <Route index element={<MainContent />} />  {/* esto no es posible directamente */}
</Route>
```

React Router v6 no soporta múltiples outlets nombrados nativamente. Para rutas paralelas, usás múltiples `<Routes>` independientes en el layout, cada uno leyendo diferentes segmentos de la URL.

**Por qué**: Vue Router soporta "named views" (`<router-view name="sidebar" />`), y SvelteKit tiene "layout slots". React Router v6 requiere un enfoque diferente: un solo `<Outlet>` por ruta, y para tener múltiples secciones independientes, necesitás componentes que lean la URL con `useLocation` o `useParams` y rendericen condicionalmente. Esto es menos declarativo pero más flexible. En React Router v7 (Remix), esto se maneja con "nested layouts" que son más potentes. Fuente: React Router v6 docs sobre "Nested Routes", "Parallel Routes in React Router" en múltiples blogs, y la comparación "Vue Router vs React Router" en el blog de LogRocket.

---

### 4. [Investigar] ¿Qué es el "file-based routing" (enrutamiento basado en archivos) y cómo frameworks como Next.js, Remix y TanStack Router lo implementan? ¿Qué ventajas tiene sobre el "config-based routing" que usa la clase con `<Routes>` manual?

**Respuesta**: File-based routing genera las rutas automáticamente a partir de la estructura de archivos: `pages/dashboard/index.tsx` → ruta `/dashboard`, `pages/tasks/[id].tsx` → ruta `/tasks/:id`. Ventajas: (1) convención sobre configuración — no necesitás escribir las rutas manualmente, (2) colocalización de código — la página, sus estilos, sus tests, y sus componentes relacionados están juntos, (3) code-splitting automático — cada página es un chunk separado sin `React.lazy()`, (4) consistencia entre proyectos — todos los proyectos que usan el mismo framework tienen la misma estructura.

**Por qué**: TanStack Router (con `@tanstack/router-plugin`) y Next.js App Router son los principales exponentes. La desventaja del file-based routing es que puede ser menos flexible para casos muy complejos (rutas con muchas variantes de layout), pero para el 95% de aplicaciones es más productivo. React Router v6 usa config-based routing (definís rutas con JSX), que es más explícito pero más verboso. Vite no tiene file-based routing built-in, pero podés agregarlo con `vite-plugin-pages` (que genera rutas de React Router automáticamente). Fuente: Next.js App Router docs, TanStack Router "File-Based Routing" docs, y `vite-plugin-pages` en github.com/hannoeru/vite-plugin-pages.

---

### 5. [Conectar] La clase usa `useParams` con tipo `Record<string, string | undefined>`. Conectá esto con TypeScript template literal types: ¿cómo podrías crear un tipo `RouteParams<Path>` que infiera los params de una ruta como `/tasks/:id/comments/:commentId` en `{ id: string; commentId: string }`?

**Respuesta**: Usando template literal types de TypeScript 4.1+:

```ts
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : {}

type Params = ExtractParams<'/tasks/:id/comments/:commentId'>
// { id: string; commentId: string }
```

Este tipo recorre recursivamente el path, extrayendo cada segmento que empieza con `:`. Puede luego usarse para tipar `useParams<Params>()`. TanStack Router usa una versión más sofisticada de esto internamente.

**Por qué**: React Router v6 no implementa esto nativamente porque los tipos genéricos de `useParams` son manuales (`useParams<{ id: string }>()`). Pero con template literal types, podés crear un wrapper type-safe: `function useParamsFor<Path extends string>(): ExtractParams<Path>`. Esto te daría autocompletado y verificación en tiempo de compilación. La limitación es que el path debe ser conocido en tiempo de compilación (literal string). Librerías como `typed-react-router` y `routes-gen` automatizan esto generando tipos a partir de la configuración de rutas. Fuente: TypeScript 4.1 "Template Literal Types" en devblogs.microsoft.com/typescript, "Type-Safe Routing with Template Literal Types" en el blog de Arek Nawo, y TanStack Router código fuente.

---

### 6. [Conectar] La clase usa `React.lazy` + `<Suspense>` para lazy loading de páginas. Conectá esto con React Router: ¿cómo funciona `createBrowserRouter` con `lazy` y cómo implementa code-splitting automático con la prop `lazy` de las rutas (diferente de `React.lazy`)?

**Respuesta**: React Router v6.4+ (con `createBrowserRouter`) soporta lazy loading a nivel de ruta usando la prop `lazy`:

```ts
const router = createBrowserRouter([
  {
    path: '/tasks/:id',
    lazy: () => import('./pages/TaskDetail'),
    // El módulo debe exportar `Component`, `loader`, `action`, `ErrorBoundary`, etc.
  },
])
```

Esto es diferente de `React.lazy` porque: (1) no requiere envolver en `<Suspense>` (el router maneja el fallback internamente), (2) puede cargar no solo el componente sino también `loader`, `action`, y `ErrorBoundary` de la ruta, (3) usa `React.startTransition` para navegaciones suaves mientras se carga la página.

**Por qué**: Este enfoque integra el code-splitting con el router. El router muestra la página anterior mientras carga la nueva (en lugar de un fallback blanco), y si la carga tarda mucho, puede mostrar un spinner global. La prop `lazy` acepta una función que retorna una promesa de un módulo con exports específicos (`Component`, `loader`, etc.). Esto es más potente que `React.lazy` porque el code-splitting está vinculado a la estructura de rutas, no a componentes individuales. Fuente: React Router v6.4+ docs "Route.lazy", "Data Loading with React Router" en el blog de Remix, y el release de React Router 6.4.

---

### 7. [Conectar] `useSearchParams` retorna un API similar a `useState`. Investigá cómo integrarías Zod para validar y tipar los search params en tiempo de compilación y runtime, y cómo esto previene errores como `page=NaN` o `filter=invalidStatus`.

**Respuesta**: Creando un wrapper `useTypedSearchParams` que use Zod para parsear y validar:

```ts
import { z } from 'zod'

const taskSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  filter: z.enum(['all', 'pending', 'completed']).default('all'),
  search: z.string().optional(),
})

type TaskSearchParams = z.infer<typeof taskSearchSchema>

function useTaskSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const parsed = taskSearchSchema.safeParse(
    Object.fromEntries(searchParams.entries())
  )

  const params: TaskSearchParams = parsed.success ? parsed.data : taskSearchSchema.parse({})

  const setParams = (newParams: Partial<TaskSearchParams>) => {
    setSearchParams(prev => {
      const current = Object.fromEntries(prev.entries())
      const merged = { ...current, ...newParams }
      return taskSearchSchema.parse(merged)
    })
  }

  return [params, setParams] as const
}
```

Esto garantiza que: (1) `page` siempre sea un número positivo (incluso si la URL tiene `?page=abc`), (2) `filter` solo tenga valores válidos, (3) los defaults se apliquen si el param no está presente.

**Por qué**: Sin validación, `searchParams.get('page')` retorna `string | null`, y `Number(searchParams.get('page'))` puede ser `NaN`. Con Zod + `z.coerce`, convertimos automáticamente y validamos. `safeParse` permite manejar graceful degradation: si los params son inválidos, usamos defaults en lugar de crashear. Esto es el equivalente en el cliente de lo que Spring Boot hace con `@Valid` en el backend. Fuente: Zod docs sobre `z.coerce`, "Type-safe search params" en el blog de TkDodo, y ejemplos en el repo de TanStack Router (que hace esto nativamente).

---

### 8. [Cuestionar] ¿Es React Router v6 la mejor opción para SPAs en 2026? Hay un debate entre React Router, TanStack Router, y simplemente usar `wouter` (router minimalista de ~1KB). ¿Para qué tipo de proyectos cada uno es la mejor opción?

**Respuesta**: React Router v6: mejor para aplicaciones que necesitan features completas (nested layouts, data loaders, lazy loading de rutas) y tienen un ecosistema existente. TanStack Router: mejor para proyectos nuevos que priorizan type safety extrema y están dispuestos a adoptar un router más nuevo. Wouter (~1KB): mejor para SPAs muy simples (2-5 rutas, sin layouts complejos), prototipos, o cuando el bundle size es crítico. Para TaskFlow, React Router v6 es la elección correcta por equilibrio entre features, estabilidad, y recursos de aprendizaje.

**Por qué**: Wouter fue creado por Alexey Raspopov como alternativa ligera a React Router. Tiene una API similar (`Route`, `Link`, `useRoute`) pero pesa 1KB vs 15KB de React Router. Sin embargo, no tiene nested layouts, loaders, actions, o lazy loading de rutas. TanStack Router es más pesado que React Router en features pero más nuevo (menos battle-tested). La recomendación: React Router para la mayoría de apps, TanStack Router si type safety extrema es prioridad, Wouter para apps muy simples o widgets. Fuente: npm trends comparando los tres, github.com/molefrog/wouter, y la comparación en el blog de TanStack.

---

### 9. [Cuestionar] ¿File-based routing vs config-based routing para React con Vite? La clase usa config-based (manual). Algunos argumentan que file-based es superior porque es más intuitivo. Otros lo critican como "magia" que oculta la estructura de rutas. ¿Qué dice la comunidad?

**Respuesta**: El debate es similar a "convention over configuration" de Rails. File-based routing (Next.js, `vite-plugin-pages`) reduce boilerplate y colocaliza código. Config-based routing (React Router manual) es más explícito y flexible. La comunidad está dividida: los que vienen de Next.js prefieren file-based; los que vienen de SPAs tradicionales prefieren config-based. Kent C. Dodds argumenta que file-based routing es mejor para productividad a largo plazo porque impone una estructura consistente. Ryan Florence (React Router) mantiene el config-based porque permite layouts y rutas más complejos que file-based no expresa fácilmente.

**Por qué**: File-based routing funciona bien para rutas simples (jerarquía de archivos = jerarquía de páginas), pero tiene dificultades con: (1) múltiples rutas que comparten el mismo componente, (2) rutas con parámetros complejos, (3) rutas protegidas que dependen de múltiples condiciones. Config-based routing maneja todo esto explícitamente. Para TaskFlow, config-based es más didáctico (entendés cómo funcionan las rutas) y más flexible (podés reestructurar rutas sin mover archivos). Fuente: "File-based routing is an anti-pattern" (artículo controversial), respuesta de Kent C. Dodds, y discusión en el repo de React Router.

---

### 10. [Cuestionar] La clase usa `<Navigate to="/login" replace />` para redirecciones. ¿Es correcto usar `replace` siempre? ¿Cuándo conviene `replace: false` (push) en lugar de `replace: true` para redirecciones de autenticación?

**Respuesta**: Para redirecciones de autenticación (login, acceso denegado), `replace: true` es correcto porque: (1) el usuario no debería poder volver atrás con el botón del navegador a la página protegida (si no está autenticado, volvería a ser redirigido, creando un loop), (2) no querés acumular entradas de redirect en el historial. `replace: false` (push) es mejor para navegaciones normales (dashboard → task detail) donde el usuario SÍ debería poder volver atrás. La regla: `replace` para redirects (login, 404, moved), `push` para navegaciones intencionales del usuario.

**Por qué**: La API `history.replaceState` vs `history.pushState` tiene implicancias de UX. Con `replace`, la entrada actual del historial se sobrescribe — si el usuario está en `/dashboard` y es redirigido a `/login` con `replace`, al hacer "back" vuelve a la página antes de `/dashboard` (no a `/dashboard` que lo redirigiría de nuevo). Esto evita el "redirect loop" donde el usuario intenta volver a una página que inmediatamente lo redirige. Es una buena práctica documentada por React Router y por guías de UX de SPAs. Fuente: React Router docs sobre `<Navigate>`, "Redirects and History" en reactrouter.com, y la guía de "SPA Authentication UX" por Auth0.
