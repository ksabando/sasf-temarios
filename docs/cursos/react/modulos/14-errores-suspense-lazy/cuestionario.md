---
sidebar_label: "Cuestionario"
---

# Cuestionario M14 — Error Boundaries, Suspense y Lazy Loading

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] React 19 introdujo cambios significativos en `Suspense`. Investigá cómo `Suspense` en React 19 soporta "parallel data fetching" y "streaming SSR" con Server Components. ¿Qué es el "Suspense boundary" en el contexto de streaming?

**Respuesta**: En React 19, `Suspense` en streaming SSR (con Server Components) permite que el HTML se envíe al navegador en chunks: el shell de la página (layout, header) se envía inmediatamente, mientras que los componentes envueltos en `Suspense` con datos lentos se stremean cuando están listos. El navegador muestra el fallback (skeleton) y React lo reemplaza con el contenido cuando llega. Esto es "streaming SSR" — el servidor no espera a que toda la página esté lista; envía HTML progresivamente.

**Por qué**: Este es un cambio fundamental respecto a `Suspense` en React 18 (client-side only). En el servidor, `renderToPipeableStream` envía chunks de HTML. Cada `Suspense` boundary se convierte en un punto de "división" del stream: el contenido fuera de `Suspense` se envía primero; el contenido dentro se envía después, junto con un script inline que hace "hydration" de ese chunk. Esto permite que páginas con datos lentos (consultas a DB, APIs externas) muestren contenido rápidamente sin bloquear por el dato más lento. Next.js App Router y Remix usan esto. Fuente: React 19 release notes sobre streaming SSR, "Streaming Server Rendering with Suspense" en react.dev, y la charla "React Server Components" en React Conf 2024.

---

### 2. [Investigar] ¿Qué es el patrón "Error Boundary + Suspense + React Query" como tríada para manejo de estados asíncronos? Investigá cómo estas tres piezas se complementan para cubrir loading, error, y success de forma declarativa.

**Respuesta**: Esta tríada separa las tres preocupaciones del estado asíncrono: `Suspense` maneja el estado de loading (muestra fallback mientras datos/componentes cargan), `ErrorBoundary` maneja el estado de error (captura errores de render/fetching y muestra UI de error), y React Query (con `suspense: true`) maneja data fetching con cache, refetch, y estados declarativos. Juntos:

```tsx
<ErrorBoundary fallback={<ErrorView />}>
  <Suspense fallback={<Skeleton />}>
    <TaskList />
  </Suspense>
</ErrorBoundary>
```

`TaskList` internamente usa `useSuspenseQuery` que suspende si los datos no están en caché. React busca `Suspense` (loading) o lanza error → `ErrorBoundary` (error). Esto elimina `if (isLoading)` y `if (isError)` del componente, que solo se renderiza en estado de éxito.

**Por qué**: Este patrón fue popularizado por el equipo de React y TkDodo (TanStack Query). Con `useQuery`, el componente maneja loading/error/success manualmente con condicionales. Con `useSuspenseQuery` (React Query v5), el componente asume éxito — React Query suspende (lanza promesa) o lanza error, y `Suspense`/`ErrorBoundary` manejan los otros estados. Esto hace que el componente sea más simple y declarativo. La combinación con `ErrorBoundary` por sección (granular) evita que un error en la lista de tareas tire abajo toda la página. Fuente: "Suspense for Data Fetching" en react.dev, "React Query and Suspense" en el blog de TkDodo, y "The Suspense + ErrorBoundary Pattern" en el blog de React.

---

### 3. [Investigar] ¿Cómo funciona `useSuspenseQuery` (TanStack Query v5) en comparación con `useQuery`? ¿Qué cambia en el manejo de estados de loading y error cuando usás el modo suspense?

**Respuesta**: `useSuspenseQuery` es una versión de `useQuery` que NO retorna `isLoading` ni `isError` — en su lugar, SUSPENDE el componente (lanza promesa) si los datos están cargando o están stale y no hay datos en caché, y LANZA el error si la query falla (para que `ErrorBoundary` lo capture). La firma de retorno es más simple:

```ts
// useQuery: { data, isLoading, isError, error, isFetching, ... }
const { data, isLoading, isError, error } = useQuery({ queryKey, queryFn })

// useSuspenseQuery: { data, isFetching, ... } — no isLoading, no isError
const { data, isFetching } = useSuspenseQuery({ queryKey, queryFn })
```

`data` está garantizado como definido (no `T | undefined`). `isFetching` indica refetch en background (para mostrar un indicador sutil de sincronización).

**Por qué**: `useSuspenseQuery` cambia el modelo mental: en lugar de manejar los tres estados en el componente, delegás loading a `Suspense` (declarativo, en el padre) y error a `ErrorBoundary` (declarativo, en el padre). El componente solo se ejecuta cuando los datos están disponibles. Esto reduce el boilerplate de `if (isLoading) return <Spinner />` y `if (isError) return <Error />` en cada componente. La desventaja: necesitás estructurar tu árbol con `Suspense` y `ErrorBoundary` en los lugares correctos. Además, `useSuspenseQuery` usa `React.use()` internamente para el suspense. Fuente: TanStack Query v5 docs sobre `useSuspenseQuery`, "Suspense for Data Fetching" en el blog de TkDodo, y la documentación de migración de v4 a v5.

---

### 4. [Investigar] ¿Qué es el patrón "Async Boundary" y cómo se relaciona con Error Boundaries? Investigá cómo librerías como `@suspensive/react` (de Jonghyeon, del equipo de TanStack) unifican Suspense + ErrorBoundary + AsyncBoundary en una sola API declarativa.

**Respuesta**: `@suspensive/react` es una librería que une `Suspense` y `ErrorBoundary` en componentes compuestos (`SuspensiveProvider`, `ErrorBoundaryGroup`, `AsyncBoundary`). `AsyncBoundary` combina ambos:

```tsx
<AsyncBoundary
  pendingFallback={<Skeleton />}
  rejectedFallback={({ error, reset }) => <ErrorView error={error} onRetry={reset} />}
>
  <TaskList />
</AsyncBoundary>
```

Esto reemplaza la anidación manual de `<ErrorBoundary><Suspense>...</Suspense></ErrorBoundary>`. También ofrece `ErrorBoundaryGroup` para resetear múltiples Error Boundaries a la vez.

**Por qué**: La librería resuelve dos problemas: (1) reduce el nesting de Providers (ErrorBoundary + Suspense + ErrorBoundaryGroup), (2) ofrece un hook `useAsyncBoundary` que da acceso al estado del boundary (loading, error, success) desde el componente hijo, algo que no es posible con `Suspense` standalone. Es parte de la tendencia de "boundaries como primitivas de UI" en React moderno, similar a cómo `<fieldset>` agrupa campos de formulario. Fuente: suspensive.org, github.com/suspensive/react, y la documentación de TanStack Query sobre integración con Suspensive.

---

### 5. [Conectar] La clase muestra `React.lazy` para carga diferida. Conectá esto con `React.startTransition` y `useTransition`: ¿cómo usarías transiciones para que la navegación entre páginas lazy no muestre el fallback de Suspense si la página carga rápido, evitando "flashes" de loading?

**Respuesta**: `useTransition` permite marcar navegaciones como transiciones, lo que hace que React espere un tiempo antes de mostrar el fallback de `Suspense` (evitando flashes si la carga es rápida):

```tsx
function App() {
  const [isPending, startTransition] = useTransition()

  const navigate = (to: string) => {
    startTransition(() => {
      setCurrentPage(to)
    })
  }

  return (
    <Suspense fallback={<Spinner />}>
      <CurrentPage />
    </Suspense>
  )
}
```

Con transiciones, React NO muestra el `fallback` inmediatamente cuando una página lazy empieza a cargar. En su lugar, mantiene la página anterior visible por un momento (~200ms) mientras carga la nueva. Si la nueva página carga en <200ms, el usuario nunca ve el fallback (transición fluida). Si tarda más, muestra el fallback.

**Por qué**: Sin `useTransition`, al navegar a una página lazy, React desmonta la página actual y muestra EL FALLO de inmediato mientras carga la nueva. Esto causa un "flash de spinner" incluso para cargas rápidas, degradando la experiencia. Con `startTransition`, React difiere la actualización: mantiene el contenido actual visible, carga la nueva página en background, y solo muestra el fallback si la carga excede un timeout. Esto se alinea con estudios de UX que muestran que transiciones <200ms no necesitan indicador de loading. Fuente: React docs sobre `useTransition`, "Routing with Suspense and Transitions" en React Router docs, y "When to use useTransition" por Dan Abramov.

---

### 6. [Conectar] La clase usa `useDeferredValue` para valores diferidos. Conectá esto con el concepto de "debounce vs deferred value". ¿Cuándo usar `useDeferredValue` y cuándo usar debounce con `useState` + `setTimeout`? ¿Son intercambiables?

**Respuesta**: NO son intercambiables. `useDeferredValue` difiere la actualización de un valor hacia el futuro cercano (dentro del mismo ciclo de render concurrente de React), permitiendo que React priorice actualizaciones urgentes (input del usuario). Con debounce, el valor retrasado se actualiza después de un delay fijo (ej: 300ms después de que el usuario dejó de escribir). `useDeferredValue` es más adecuado cuando: (1) el valor cambia por estado de React (no por eventos externos), (2) querés que la UI se mantenga responsive durante cálculos pesados, (3) querés que el valor diferido eventualmente alcance al valor real. Debounce es mejor cuando: (1) el valor dispara llamadas a API (no querés llamar en cada tecla), (2) necesitás un delay fijo y predecible.

**Por qué**: `useDeferredValue` es más rápido que debounce porque no espera un delay fijo — se actualiza tan pronto como React tiene tiempo libre durante un render concurrente. Si React está idle, la actualización es inmediata. Si React está ocupado con un input, difiere hasta que el input se procese. Esto da mejor UX que debounce (que siempre espera Xms, sintiéndose lento). Pero `useDeferredValue` no limita llamadas a API — para eso, necesitás debounce además. La combinación ideal: `useDeferredValue(debouncedValue)` — debounce controla la frecuencia de API calls, `useDeferredValue` mantiene la UI responsive. Fuente: React docs "useDeferredValue vs debounce", "When to use useDeferredValue" por Dan Abramov, y el artículo "useDeferredValue vs useTransition" en el blog de React.

---

### 7. [Conectar] La clase implementa un Skeleton Shimmer con CSS. Conectá esto con las métricas de Core Web Vitals (LCP, CLS). ¿Por qué un Skeleton es mejor que un Spinner para LCP y CLS?

**Respuesta**: Un Skeleton mejora LCP (Largest Contentful Paint) porque reserva espacio en el layout antes de que los datos lleguen, evitando que el contenido "empuje" otros elementos cuando aparece (lo que causaría CLS). Un Spinner no reserva espacio — cuando los datos llegan, el contenido reemplaza al spinner, potencialmente moviendo otros elementos y causando layout shift. Para LCP, un Skeleton puede incluirse en el HTML inicial (SSR/SSG) para que el navegador lo pinte inmediatamente, mientras que el contenido real se carga asíncronamente. Esto da una percepción de velocidad mayor que un spinner en blanco.

**Por qué**: CLS (Cumulative Layout Shift) mide cuánto se mueve el contenido durante la carga. Si un spinner de 50px de altura es reemplazado por una tarjeta de 200px de altura, todo lo que está debajo se mueve (mal CLS). Un Skeleton de 200px (misma altura que la tarjeta final) no causa shift porque el espacio ya está reservado. Google penaliza CLS > 0.1 en rankings de búsqueda. Por eso la recomendación moderna es: Skeleton con dimensiones fijas > Spinner con dimensiones fijas > Spinner sin dimensiones. Fuente: web.dev/cls, "Skeleton Screens and Core Web Vitals" en el blog de Addy Osmani, y la guía de Lighthouse.

---

### 8. [Cuestionar] ¿Deberían los Error Boundaries ser componentes funcionales? La clase dice que React no lo soporta. Pero la comunidad ha creado polyfills y hay un debate sobre si React debería agregar `useErrorBoundary` nativo. ¿Por qué el equipo de React no lo ha hecho?

**Respuesta**: El equipo de React no ha agregado `useErrorBoundary` porque los hooks se ejecutan durante el render, y un error durante el render ABORTA ese render — no hay oportunidad de ejecutar un hook que "maneje" el error (porque el hook mismo estaría dentro del subárbol que falló). Para que un hook maneje un error de render, React necesitaría un mecanismo fundamentalmente diferente: ejecutar hooks en una "fase de error" post-render, similar a como `getDerivedStateFromError` se ejecuta en componentes de clase. React eligió mantener los componentes de clase como el mecanismo para Error Boundaries porque ya tenían la infraestructura de ciclo de vida.

**Por qué**: Dan Abramov explicó que no es imposible técnicamente, sino que requeriría rediseñar cómo los hooks interactúan con el sistema de errores del reconciler. La comunidad creó workarounds (`react-error-boundary` que usa un componente de clase internamente, `useErrorHandler` que lanza en el próximo render). El equipo de React ha indicado que están abiertos a una solución basada en hooks en el futuro, pero no es una prioridad alta porque `react-error-boundary` (de Brian Vaughn, ex React core team) resuelve el problema adecuadamente. Fuente: "Why no useErrorBoundary hook?" en github.com/facebook/react/issues, el código fuente de react-error-boundary, y tweets de Dan Abramov explicando la limitación técnica.

---

### 9. [Cuestionar] ¿Es `Suspense` para data fetching el futuro, o `useEffect` + `useState` seguirá siendo válido? La clase muestra ambos. La comunidad está dividida entre quienes adoptan Suspense (con React Query `useSuspenseQuery`) y quienes prefieren el patrón tradicional (`isLoading`/`isError`).

**Respuesta**: `Suspense` para data fetching es el futuro recomendado por el equipo de React (es parte de la visión de "componentes que expresan estados asíncronos declarativamente"). Sin embargo, el patrón tradicional (`isLoading`/`isError`) seguirá siendo válido porque: (1) es más simple conceptualmente para principiantes, (2) no requiere estructurar el árbol con Suspense boundaries (más flexible), (3) permite manejar loading/error de forma más granular (diferentes UI para diferentes campos). La tendencia es: `useSuspenseQuery` para queries "top-level" (carga de página), y `useQuery` para queries localizadas (autocomplete, búsqueda inline) donde querés control fino.

**Por qué**: TkDodo (mantenedor de TanStack Query) recomienda: "Suspense for data fetching is great when you can structure your app around Suspense boundaries. But not all apps can, and that's okay." La ventaja de Suspense es que elimina los estados intermedios del componente (el componente solo renderiza el éxito). La desventaja es que necesitás planificar dónde poner los boundaries. Para TaskFlow, una migración gradual sería: páginas principales con Suspense (`useSuspenseQuery`), componentes de formulario con `useQuery` tradicional. Fuente: "Suspense vs Traditional Data Fetching" en el blog de TkDodo, React docs sobre Suspense, y "Inside React Query" por TkDodo.

---

### 10. [Cuestionar] ¿Cuándo es `React.lazy` realmente beneficioso y cuándo es prematuro? La clase lo recomienda para páginas. Pero el overhead de crear chunks separados (HTTP/2 multiplexing lo reduce) y el costo de `Suspense` pueden hacer que lazy loading sea contraproducente para apps pequeñas.

**Respuesta**: `React.lazy` es beneficioso cuando: (1) el bundle total es >200KB gzipped (el costo de descargar todo de una vez supera el overhead de chunks), (2) hay componentes que el 90% de usuarios no visitan (páginas de settings, admin, registro), (3) el componente carga una librería grande (chart.js, monaco editor). Es prematuro cuando: (1) el bundle total es <100KB (el overhead de HTTP/2 requests y la complejidad de `Suspense` superan el beneficio), (2) la app tiene 2-3 páginas y todas se visitan, (3) el componente objetivo es muy pequeño (<5KB). La recomendación: medí el bundle primero con `rollup-plugin-visualizer` y solo aplicá lazy loading a chunks de >30KB.

**Por qué**: Cada chunk lazy agrega: (1) un request HTTP adicional (aunque HTTP/2 multiplexa, sigue habiendo latencia de round-trip), (2) overhead de `Suspense` (crear/desmontar fallback, suscribir/desuscribir), (3) complejidad de manejo de errores de carga de chunk (si el usuario está offline, el chunk falla y necesitás un error boundary). Para TaskFlow con 5-6 páginas y un bundle de ~150KB, lazy loading por página es apropiado. Para una landing page de 50KB, lazy loading es contraproducente. Fuente: "Lazy Loading React Components" en web.dev, "When not to use React.lazy" por Addy Osmani, y las métricas de bundle de Vite.
