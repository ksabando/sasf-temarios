---
sidebar_label: "Cuestionario"
---

# Cuestionario M07 — Efectos y Peticiones HTTP

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es tRPC y cómo resuelve el problema de type safety en las peticiones HTTP entre frontend y backend? Compará tRPC con el enfoque de `axios` + tipos manuales que usa la clase. ¿Por qué tRPC elimina la necesidad de `ApiResponse<T>`?

**Respuesta**: tRPC es un framework de comunicación client-server que comparte tipos TypeScript directamente entre el backend y el frontend sin code generation. Definís procedimientos en el servidor con Zod (para validación runtime + types), y el cliente importa los tipos inferidos automáticamente. No necesitás `ApiResponse<T>` porque el cliente conoce exactamente el tipo de retorno de cada procedimiento, incluyendo errores tipados. A diferencia de `axios` + tipos manuales (donde `taskService.getAll()` retorna `Promise<Task[]>` porque vos lo tipaste así, pero el servidor podría retornar otra cosa), tRPC garantiza que el tipo en el cliente coincide con la implementación real del servidor.

**Por qué**: tRPC resuelve el problema de "las APIs son un boundary donde se pierde el type safety". Con `axios`, definís manualmente la interfaz de respuesta (`ApiResponse<Task[]>`), pero nada garantiza que el servidor realmente retorne ese formato en runtime. tRPC, al compartir los schemas Zod entre cliente y servidor, garantiza type safety end-to-end. Para TaskFlow, si el backend fuera TypeScript (Node.js), tRPC sería ideal. Pero como el backend es Spring Boot (Java), la integración no es directa — necesitarías generar tipos desde OpenAPI/Swagger o usar `openapi-typescript` como alternativa. Fuente: trpc.io, "tRPC: Type Safety End-to-End" en el blog de Alex KATT (creador), y "tRPC vs REST vs GraphQL" por Theo Browne.

---

### 2. [Investigar] ¿Qué es `ky` y `ofetch` como alternativas modernas a `axios` y `fetch`? Investigá las diferencias en API, bundle size, soporte de TypeScript, y características como retry automático y hooks. ¿Por qué algunos proyectos están migrando de axios a estas alternativas?

**Respuesta**: `ky` (creado por Sindre Sorhus) es un wrapper de `fetch` con API minimalista (~3KB), soporte nativo de retry, timeout (via `AbortController`), hooks (`beforeRequest`, `afterResponse`), y TypeScript first-class. `ofetch` (de unjs, creadores de Nuxt) es similar (~2KB) con soporte para parsing automático de JSON, text, blob, y streaming. Ambas son significativamente más livianas que `axios` (~30KB). Migran de axios a ky/ofetch porque: (1) usan `fetch` nativo (menos polyfills), (2) son tree-shakeables, (3) tienen APIs más modernas basadas en promesas y async iterators.

**Por qué**: `axios` es maduro y estable, pero su tamaño (~13KB gzipped) y su dependencia de `XMLHttpRequest` (que no soporta streaming de respuesta) son desventajas en aplicaciones modernas. `fetch` nativo soporta streaming (`response.body.getReader()`), lo que permite procesar respuestas grandes progresivamente. `ky` y `ofetch` construyen sobre `fetch` agregando lo que falta (timeout real, retry, hooks). Para TaskFlow, `ky` sería suficiente y más liviano que `axios`, pero `axios` tiene interceptors más potentes y mejor soporte para upload progress (importante si subís archivos). Fuente: github.com/sindresorhus/ky, unjs.io/ofetch, y "Goodbye Axios, Hello Ky" en el blog de desarrolladores.

---

### 3. [Investigar] React 19 introdujo el hook `use()` que puede leer promesas directamente. Investigá cómo `use()` cambia el patrón de data fetching que vimos con `useEffect` + `fetch`. ¿Puede `use(promise)` reemplazar completamente a `useEffect` para fetching?

**Respuesta**: `use(promise)` permite leer una promesa directamente en el render de un componente React. Si la promesa no está resuelta, el componente SUSPENDE (lanza la promesa hacia el `Suspense` más cercano). Esto elimina la necesidad de `useEffect` + `useState` + `loading` + `error` para fetching básico — el estado de loading es manejado por `Suspense` y el estado de error por `ErrorBoundary`. Sin embargo, `use()` no reemplaza completamente a `useEffect` para fetching porque: (1) no tiene mecanismo de refetch (cada render con nueva key fuerza nuevo fetch), (2) no tiene caching ni deduplication, (3) no maneja race conditions automáticamente como React Query.

**Por qué**: `use()` es un building block de bajo nivel. Librerías como React Query (y posiblemente futuras APIs de React) construyen sobre `use()` para agregar caching y refetch. El patrón con `use()` puro:
```tsx
const promise = useMemo(() => fetch('/api/tasks').then(r => r.json()), [])
const tasks = use(promise)
```
Pero esto es naive: cada vez que el componente se monta, hace fetch; no comparte caché; no refetcha. `use()` es más útil para casos donde los datos vienen de un padre (como un Server Component que pasa una promesa al Client Component), no para fetching autónomo. React Query sigue siendo la recomendación para la mayoría de casos. Fuente: React 19 RFC para `use()`, "Understanding use() in React 19" por Andrew Clark, y la documentación de React 19.

---

### 4. [Investigar] ¿Qué es el patrón "Backend for Frontend" (BFF) y cómo cambia la arquitectura de peticiones HTTP desde React? ¿Por qué proyectos como TaskFlow (frontend React + backend Spring Boot) se beneficiarían de un BFF?

**Respuesta**: BFF es un patrón donde existe una capa de servidor intermedia entre el frontend React y los microservicios backend. Esta capa: (1) agrega datos de múltiples APIs para que el frontend haga una sola petición, (2) adapta formatos de respuesta para el frontend, (3) maneja autenticación (HttpOnly cookies en lugar de tokens en localStorage), (4) esconde la complejidad del backend. En TaskFlow, un BFF Express/NestJS entre React y Spring Boot podría: servir el token en HttpOnly cookie (más seguro), agregar endpoints optimizados para la UI (ej: `GET /dashboard` que devuelve tasks + stats + user en una llamada), y ocultar los detalles de la API Spring.

**Por qué**: El BFF resuelve el problema de que una SPA necesita datos de múltiples fuentes pero hacer múltiples peticiones desde el navegador es ineficiente. Con BFF, React hace una petición a `/api/dashboard`, el BFF hace 3 peticiones internas a Spring Boot (tasks, stats, user), agrega los datos, y retorna una sola respuesta optimizada. Además, el BFF puede almacenar tokens en HttpOnly cookies (el BFF recibe la cookie, extrae el token, y lo envía a Spring Boot). Este patrón es recomendado por el equipo de React y Next.js (con API Routes o Server Components actuando como BFF). Fuente: "Pattern: Backends for Frontends" por Sam Newman, "BFF with React" en la documentación de Next.js, y la charla "Full-Stack React" por Theo Browne.

---

### 5. [Conectar] La clase usa `AbortController` para cancelar peticiones. Investigá la relación entre `AbortController`, `AbortSignal`, y cómo React Query usa esto internamente para cancelar queries salientes cuando el componente se desmonta o la query key cambia.

**Respuesta**: `AbortController` crea un `AbortSignal` que se pasa a `fetch` (o axios). Cuando `controller.abort()` se llama, `fetch` rechaza la promesa con un `AbortError`. React Query integra esto automáticamente: cuando un componente se desmonta o la `queryKey` cambia, React Query llama a `abort()` en el `AbortController` asociado a la query anterior. El `queryFn` recibe un `AbortSignal` como parte del `QueryFunctionContext`:

```ts
useQuery({
  queryKey: ['tasks'],
  queryFn: ({ signal }) => fetch('/api/tasks', { signal }).then(r => r.json()),
})
```

React Query crea el `AbortController` internamente y lo aborta en cleanup, evitando race conditions sin que el desarrollador tenga que manejar el controller manualmente.

**Por qué**: Este es un ejemplo de cómo React Query abstrae el patrón que la clase muestra manualmente. Internamente, cuando `queryKey` cambia, React Query: (1) crea un nuevo `AbortController`, (2) aborta el anterior, (3) dispara el nuevo `queryFn` con el nuevo `signal`. Esto garantiza que respuestas de queries anteriores nunca pisen el estado de la query actual, eliminando la categoría de bugs de race condition que son comunes con `useEffect` + `fetch` manual. Fuente: TanStack Query docs sobre `QueryFunctionContext`, "AbortController in React Query" en el blog de TkDodo (maintainer de React Query), y el código fuente de `QueryObserver`.

---

### 6. [Conectar] La clase menciona `fetch` vs `axios`. Investigá el concepto de "HTTP streaming" y cómo `fetch` con `ReadableStream` permite procesar respuestas progresivamente (útil para LLMs, grandes descargas). ¿Soporta `axios` esto? ¿Cómo afecta al patrón `loading → data → error` que vimos?

**Respuesta**: `fetch` nativo soporta streaming de respuesta vía `response.body.getReader()` (un `ReadableStream`). Esto permite leer chunks progresivamente con `reader.read()` en un loop. `axios` usa `XMLHttpRequest` internamente, que no soporta streaming de respuesta (solo streaming de upload). Para LLMs (que generan tokens incrementalmente) o descargas grandes, `fetch` + `ReadableStream` es necesario. El patrón `loading → data → error` se vuelve más complejo: el estado no es binario, sino "parcialmente cargado" — necesitás manejar `data` que crece incrementalmente, posiblemente usando `useReducer` con acciones `APPEND_CHUNK` y `COMPLETE`.

**Por qué**: La API de streaming de `fetch` es parte de la especificación Fetch Standard de WHATWG. Con `response.body.getReader()`, obtenés un `ReadableStreamDefaultReader` que permite leer chunks de `Uint8Array`. Para React, esto se integra con `useEffect`:
```ts
useEffect(() => {
  const controller = new AbortController()
  fetch('/api/stream', { signal: controller.signal }).then(async (res) => {
    const reader = res.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      dispatch({ type: 'APPEND', chunk: new TextDecoder().decode(value) })
    }
  })
  return () => controller.abort()
}, [])
```
Librerías como `eventsource-parser` y `@vercel/ai` manejan esto para LLMs. `axios` no es adecuado para streaming porque `XMLHttpRequest.responseType` no soporta streaming. Fuente: MDN "Streams API", "Fetch API: Response.body" en MDN, y la especificación de Fetch en fetch.spec.whatwg.org.

---

### 7. [Conectar] La clase muestra un interceptor de axios simple. Investigá cómo implementarías un sistema de "retry with exponential backoff" en axios para reintentar peticiones fallidas por errores de red o 5xx, similar a cómo lo hace React Query.

**Respuesta**: Se implementa como un interceptor de respuesta que verifica si el error es reintentable (`error.code === 'ECONNABORTED'` o `error.response?.status >= 500`) y reintenta con backoff exponencial:

```ts
api.interceptors.response.use(null, async (error) => {
  const config = error.config
  config.__retryCount = config.__retryCount || 0
  if (config.__retryCount >= 3) return Promise.reject(error)
  if (error.response?.status >= 500 || error.code === 'ECONNABORTED') {
    config.__retryCount++
    const delay = Math.min(1000 * 2 ** config.__retryCount, 10000)
    await new Promise(resolve => setTimeout(resolve, delay))
    return api(config) // reintenta
  }
  return Promise.reject(error)
})
```

React Query tiene esto integrado con `retry` y `retryDelay`, pero opera a nivel de query, no a nivel HTTP. Su backoff es: delay aleatorio entre `0` y `Math.min(1000 * 2 ** attempt, 30000)`.

**Por qué**: El backoff exponencial es una estrategia estándar para evitar saturar servidores sobrecargados. La fórmula `delay = base * 2^retryCount` con un máximo y jitter aleatorio es la recomendada por AWS y Google Cloud. En axios, la implementación manual es necesaria porque axios no tiene retry nativo (a diferencia de `ky` o `ofetch` que sí lo tienen). Para TaskFlow, si usáramos React Query (Módulo 18), no necesitaríamos este interceptor — React Query lo maneja por nosotros. Fuente: "Exponential Backoff and Jitter" en el blog de AWS, React Query docs sobre `retry`, y "Implementing retry in axios" en stackoverflow/axios docs.

---

### 8. [Cuestionar] ¿Es `useEffect` realmente el lugar correcto para hacer data fetching? La comunidad está dividida entre "fetch in useEffect" (patrón tradicional) y "fetch in event handlers" (más control). ¿Qué argumenta el equipo de React y qué alternativas proponen? ¿Es `useEffect` para fetching un antipatrón en 2026?

**Respuesta**: El equipo de React (Dan Abramov, en particular) ha dicho que `useEffect` para fetching es aceptable pero tiene limitaciones: race conditions, falta de caching, y doble ejecución en StrictMode. No lo llaman "antipatrón" pero recomiendan usar librerías (React Query, SWR) o Server Components para fetching. La alternativa "fetch in event handlers" solo funciona para datos que se cargan tras una acción del usuario (no para carga inicial). La postura en 2026: `useEffect` + `fetch` es válido para prototipos y apps pequeñas, pero para apps de producción, React Query o Server Components son la recomendación oficial.

**Por qué**: Dan Abramov escribió un artículo extenso "You might not need an effect" que cubre este tema. El problema no es `useEffect` en sí, sino que implementar fetching robusto con `useEffect` requiere manejar: cleanup con AbortController, race conditions, estado de loading/error, caching, refetch, y StrictMode double-fire. React Query resuelve todo esto con una API declarativa. La tendencia es clara: React Query para client-side fetching, Server Components para server-side fetching. `useEffect` queda relegado a casos donde ninguna de estas opciones aplica (muy raro). Fuente: "You might not need an effect" por Dan Abramov en react.dev, "useEffect for data fetching" en la documentación de React, y "Why I stopped using useEffect for data fetching" por TkDodo.

---

### 9. [Cuestionar] La clase compara `fetch` vs `axios`. Pero en 2026, ¿deberías usar `fetch` nativo en lugar de cualquiera de ellos? `fetch` es nativo, soporta streaming, no tiene dependencias, y es más liviano. La comunidad debate si `axios` sigue siendo relevante.

**Respuesta**: `fetch` nativo es suficiente para la mayoría de casos: soporta streaming, AbortController, y es universal. `axios` sigue siendo relevante para: (1) interceptors (aunque `fetch` puede wrapperse), (2) upload/download progress (no disponible en `fetch`), (3) timeout nativo (fetch requiere AbortController con setTimeout), (4) cancelación de requests duplicados. Para TaskFlow, `fetch` sería suficiente y eliminaría una dependencia. Pero `axios` simplifica el manejo de errores (rechaza en 4xx/5xx automáticamente, mientras `fetch` requiere `if (!res.ok) throw ...`).

**Por qué**: La tendencia en la comunidad es hacia `fetch` nativo. Kent C. Dodds recomienda `fetch` o wrappers ligeros como `ky`. La razón principal: menos dependencias = menos vulnerabilidades de supply chain, bundle más pequeño, y APIs web estándar que los desarrolladores ya conocen. `axios` tiene ~50M descargas semanales (vs ~N/A de fetch, que es nativo), pero su tasa de crecimiento es plana porque los nuevos proyectos tienden a usar `fetch`. Para TaskFlow, si ya tenemos `axios` instalado y configurado con interceptors (Módulo 08 para auth), mantenerlo es razonable. Para un proyecto nuevo sin necesidad de interceptors complejos, empezaría con `fetch` o `ky`. Fuente: "Don't use axios, use fetch" en el blog de Kent C. Dodds, npm trends axios vs ky, y "The State of HTTP in JavaScript" en el blog de HTTP Toolkit.

---

### 10. [Cuestionar] La clase menciona `useEffect` con dependencias `[]` para montaje. Hay un debate sobre si los linters deberían exigir exhaustividad en las dependencias de `useEffect`. La regla `react-hooks/exhaustive-deps` fuerza incluir todas las variables usadas. Pero para efectos de montaje, esto es contraproducente. ¿Qué dice el equipo de React sobre suprimir esta regla con `// eslint-disable-next-line`?

**Respuesta**: El equipo de React diseñó la regla `exhaustive-deps` para ser estricta por defecto, pero reconocen que hay casos legítimos para suprimirla. Para efectos de montaje (`[]`), la supresión es válida si entendés las implicaciones (el efecto no se re-ejecuta cuando las dependencias cambian, lo que puede causar stale closures). Dan Abramov recomienda: (1) primero intentá incluir todas las dependencias (refactorizar el efecto para que sea seguro), (2) si genuinamente solo querés ejecutar en mount (como suscribirse a un WebSocket), usá `[]` con el comentario de supresión explicando por qué.

**Por qué**: La regla existe porque efectos con dependencias faltantes son la causa #1 de bugs sutiles en React. Pero forzar a incluir todas las variables en las dependencias puede llevar a código más complejo (guardar valores en refs para evitar re-ejecuciones). La recomendación del equipo es: "If you're going to suppress the lint rule, include a comment explaining why the effect should only run once." Esto es más seguro que deshabilitar la regla globalmente. Ejemplo: `useEffect(() => { init(); }, []); // eslint-disable-line react-hooks/exhaustive-deps — runs once on mount`. Fuente: "A Complete Guide to useEffect" por Dan Abramov, documentación de eslint-plugin-react-hooks, y discusiones en github.com/facebook/react/issues.
