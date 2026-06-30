---
sidebar_label: "Cuestionario"
---

# Cuestionario M18 — React Query (TanStack Query)

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es tRPC y cómo se integra con React Query? tRPC fue creado por Alex "KATT" Johansson para conectar frontend y backend con type safety end-to-end. ¿Por qué tRPC usa React Query internamente en lugar de implementar su propio fetching?

**Respuesta**: tRPC es un framework de comunicación client-server que usa React Query como capa de data fetching. tRPC se encarga de: (1) type safety end-to-end (los tipos se comparten entre servidor y cliente sin code generation), (2) serialización de procedimientos remotos, (3) validación con Zod. Delega a React Query: caching, refetch, optimistic updates, invalidación. Alex KATT decidió usar React Query en lugar de implementar fetching propio porque React Query ya resolvía esos problemas mejor que cualquier solución custom. tRPC + React Query es una combinación popular: tRPC maneja la comunicación, React Query maneja el cache.

**Por qué**: En tRPC, un procedimiento del servidor: `publicProcedure.input(z.string()).query(({ input }) => tasks.getByName(input))`. En el cliente: `const { data } = trpc.tasks.getByName.useQuery('search term')`. `trpc.tasks.getByName.useQuery` es un wrapper de `useQuery` de React Query con tipos completamente inferidos. Esto elimina la necesidad de definir `queryKey`, `queryFn`, y tipos manualmente — tRPC los genera. Para TaskFlow con backend Spring Boot (Java), tRPC no es directamente aplicable (requiere backend TypeScript/Node), pero podrías usar `openapi-typescript` para generar tipos desde OpenAPI y wrappers similares. Fuente: trpc.io, "tRPC + React Query: A Match Made in Heaven" por TkDodo, y la talk "tRPC: End-to-End Typesafe APIs" por Alex KATT.

---

### 2. [Investigar] ¿Qué es SWR (stale-while-revalidate) de Vercel y cómo se compara con React Query? SWR fue la primera librería en popularizar el patrón SWR para React. ¿Por qué React Query se volvió más popular?

**Respuesta**: SWR (creado por Shu Ding y el equipo de Vercel) es una librería de data fetching con la misma filosofía que React Query: caching, refetch automático, revalidación. SWR es más minimalista (~4KB vs ~12KB de React Query) y tiene una API más simple. React Query se volvió más popular porque: (1) tiene más features (mutations con `useMutation`, optimistic updates, infinite queries, garbage collection configurables), (2) mejor DevTools, (3) más documentación y recursos de aprendizaje, (4) separación clara entre `isLoading` e `isFetching`, (5) comunidad más grande (Tanner Linsley vs equipo de Vercel).

**Por qué**: SWR es excelente para fetching simple; React Query es mejor para aplicaciones complejas que necesitan mutations, cache invalidation granular, y optimistic updates. Para TaskFlow, React Query es la elección correcta porque necesitamos mutations (crear/actualizar/eliminar tareas) y optimistic updates. SWR sería suficiente si solo necesitáramos fetching de datos de solo lectura. Fuente: swr.vercel.app, "SWR vs React Query" en múltiples comparaciones de la comunidad, y la charla "React Query: It's Time to Break Up with Global State" por Tanner Linsley.

---

### 3. [Investigar] ¿Qué features de React Query v6 (futuro) se están discutiendo? Investigá el roadmap y las RFCs de TanStack Query para entender hacia dónde va la librería. ¿Cómo afectaría a la arquitectura de TaskFlow?

**Respuesta**: React Query v6 (en desarrollo a 2026) está explorando: (1) `useSuspenseQuery` como default (abandonando `isLoading`/`isError` en favor de Suspense + ErrorBoundary), (2) integración más profunda con Server Components y streaming SSR, (3) mejor soporte para mutations con estado local (form state + mutation state unificados), (4) `queryOptions` API para definir queries fuera de componentes (reutilización), (5) mejor TypeScript con tipos inferidos automáticamente sin genéricos manuales. Para TaskFlow, esto significaría: usar `useSuspenseQuery` para carga de páginas (eliminando `if (isLoading)` checks) y mantener `useQuery` para casos localizados.

**Por qué**: TkDodo (mantenedor principal de React Query) ha compartido el roadmap en el blog de TanStack. La visión es que React Query se convierta en el "data layer" universal para React, funcionando tanto en client components (SPA tradicional) como en server components (RSC). La API `queryOptions` permitiría definir configuraciones de queries una vez y reutilizarlas: `const taskQuery = queryOptions({ queryKey: ['tasks'], queryFn: fetchTasks }); useQuery(taskQuery)`. Fuente: tanstack.com/query/latest/docs/framework/react/guides/roadmap, "React Query v6 plans" en el blog de TkDodo, y discusiones en el repo de TanStack Query.

---

### 4. [Investigar] ¿Qué es "Query Key Factory" y cómo resuelve el problema de manejar query keys como strings mágicos en aplicaciones grandes? Investigá cómo crear una factory para las queries de TaskFlow.

**Respuesta**: Query Key Factory es un patrón para generar query keys de forma type-safe, eliminando strings duplicados. Para TaskFlow:

```ts
const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

// Uso
useQuery({ queryKey: taskKeys.detail(taskId), queryFn: () => fetchTask(taskId) })
queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
```

Esto garantiza que: (1) las keys sean consistentes, (2) la invalidación sea precisa (invalidar `taskKeys.lists()` invalida todas las listas sin invalidar detalles), (3) TypeScript infiera los tipos.

**Por qué**: Sin factory, es fácil cometer errores: escribir `['tasks', id]` en un lado y `['task', id]` (sin 's') en otro, rompiendo la invalidación. Las factories tipadas previenen esto. El patrón fue popularizado por TkDodo en su blog y es el enfoque recomendado para proyectos medianos/grandes. Librerías como `@lukemorales/query-key-factory` automatizan la creación de factories con TypeScript inferido. Fuente: "Effective React Query Keys" por TkDodo, github.com/lukemorales/query-key-factory, y la documentación de TanStack Query sobre Query Keys.

---

### 5. [Conectar] La clase muestra `useMutation` con `onSuccess` para invalidar queries. Conectá esto con el patrón "Optimistic Updates with Rollback". ¿Por qué el patrón de la clase (invalidate en onSuccess) causa un delay visual mientras se refetch, y cómo el optimistic update lo resuelve?

**Respuesta**: Con `onSuccess: () => queryClient.invalidateQueries(['tasks'])`, después de una mutación exitosa, React Query refetcha la lista de tareas. Durante ese refetch (que puede tomar 200-500ms), la UI muestra los datos VIEJOS o un loading state. Con optimistic update, la UI se actualiza INMEDIATAMENTE (antes de la respuesta del servidor) asumiendo que la mutación será exitosa:

```ts
onMutate: async (newTask) => {
  await queryClient.cancelQueries({ queryKey: ['tasks'] })
  const previous = queryClient.getQueryData(['tasks'])
  queryClient.setQueryData(['tasks'], old => [...old, newTask]) // actualiza inmediatamente
  return { previous } // para rollback
},
onError: (err, newTask, context) => {
  queryClient.setQueryData(['tasks'], context.previous) // revierte
},
```

El usuario ve la tarea agregada instantáneamente. Si falla, se revierte (la tarea desaparece). Si tiene éxito, el `onSettled` refetcha para sincronizar con el servidor.

**Por qué**: La invalidación en `onSuccess` es el enfoque más simple y seguro, pero causa un "flash" entre la acción del usuario y la UI actualizada. El optimistic update elimina ese flash. Es como la diferencia entre un formulario que muestra "Enviando..." y uno que muestra "Enviado ✓" inmediatamente. La desventaja es mayor complejidad (necesitás manejar rollback). Para acciones de alta frecuencia (toggle completado, eliminar), optimistic updates mejoran la percepción de velocidad significativamente. Fuente: TanStack Query docs "Optimistic Updates", "Mastering Mutations in React Query" por TkDodo, y el artículo "Optimistic UI" en el blog de Dan Abramov.

---

### 6. [Conectar] La clase menciona `staleTime` por defecto de 5 minutos. Conectá esto con el concepto de "cache time vs stale time". ¿Qué pasa con los datos en caché cuando `gcTime` expira vs cuando `staleTime` expira? ¿Cómo afecta la memoria?

**Respuesta**: `staleTime` (default: 0) controla cuándo los datos se consideran "obsoletos" y necesitan refetch. Mientras `staleTime` no haya expirado, React Query usa los datos en caché sin refetch. `gcTime` (garbage collection time, default: 5 min, antes llamado `cacheTime`) controla cuánto tiempo los datos inactivos permanecen en memoria después de que TODOS los observadores (componentes) se desmontan. Si ningún componente usa una query por más de `gcTime`, React Query la elimina de la caché para liberar memoria. El ciclo: datos se vuelven stale (staleTime) → refetch en background → si nadie los observa (gcTime) → garbage collect.

**Por qué**: La distinción es crítica para performance de memoria. `staleTime` corto = datos siempre frescos, más peticiones al servidor. `gcTime` corto = menos memoria, pero al remontar un componente, los datos no están en caché y se muestra loading. En TaskFlow con listas de tareas: `staleTime: 30_000` (30 segundos) para datos casi en tiempo real, `gcTime: 5 * 60_000` (5 minutos) para mantener la caché entre navegaciones. Para datos de perfil de usuario (cambia raramente): `staleTime: 60 * 60_000` (1 hora). Fuente: TanStack Query docs "Important Defaults", "Caching in React Query" por TkDodo, y la charla "React Query Deep Dive" en React Summit.

---

### 7. [Conectar] La clase usa `useQuery` y `useMutation`. Conectá estos hooks con el flujo de datos en TaskFlow: ¿cómo harías para que después de crear una tarea con `useMutation`, el detalle de la nueva tarea se muestre sin un refetch completo de la lista? Investigá `setQueryData` manual en la caché.

**Respuesta**: En lugar de invalidar la lista (que refetcha todo), actualizás la caché manualmente con los datos retornados por la mutación:

```ts
const createMutation = useMutation({
  mutationFn: (newTask: CreateTaskDTO) => taskService.create(newTask),
  onSuccess: (createdTask) => {
    // Actualizar lista en caché
    queryClient.setQueryData(['tasks', 'list'], (old: Task[]) =>
      [createdTask, ...old]
    )
    // También guardar el detalle individual
    queryClient.setQueryData(['tasks', 'detail', createdTask.id], createdTask)
  },
})
```

Esto agrega la tarea a la caché localmente sin refetch. La lista se actualiza instantáneamente y si el usuario navega al detalle, los datos ya están en caché. `setQueryData` modifica la caché sincrónicamente (no hace petición HTTP). Es útil cuando el servidor retorna el objeto creado/actualizado (cosa que Spring Boot debería hacer).

**Por qué**: `invalidateQueries` es la opción "segura" (siempre trae datos reales del servidor) pero lenta. `setQueryData` es la opción "optimista" (instantánea) pero requiere que el servidor retorne el objeto actualizado. Lo ideal: usar `setQueryData` con los datos que el servidor retornó en la mutación (no es optimistic, son datos reales), y opcionalmente invalidar en background para asegurar consistencia. Esto combina velocidad (datos inmediatos del servidor) con consistencia eventual (refetch en background). Fuente: TanStack Query docs "Updates from Mutation Responses", "React Query and Typescript" por TkDodo, y ejemplos en el repo de TanStack Query.

---

### 8. [Cuestionar] ¿React Query vs RTK Query vs Apollo Client? La clase usa React Query. ¿Cuándo preferirías RTK Query o Apollo Client para una app React?

**Respuesta**: React Query: mejor para REST APIs y aplicaciones agnósticas de la fuente de datos (REST, GraphQL, tRPC). RTK Query: mejor cuando YA usás Redux para estado global y querés data fetching integrado (una sola librería para estado + fetching). Apollo Client: mejor para GraphQL APIs (normalización automática de respuestas GraphQL, fragment matching, cache normalizado). Para TaskFlow con Spring Boot (REST API), React Query es la elección correcta. Si usáramos GraphQL con Apollo Server, Apollo Client sería más natural. Si ya tuviéramos Redux para estado, RTK Query reduciría la cantidad de dependencias.

**Por qué**: Cada uno está optimizado para su caso de uso. React Query es el más agnóstico (funciona con cualquier función asíncrona, no solo HTTP). Apollo Client tiene un caché normalizado (entiende tipos GraphQL, normaliza `User{id:1}` en una sola entrada referenciada desde múltiples queries). RTK Query genera hooks type-safe desde definiciones de endpoints. Para la mayoría de apps REST, React Query es la opción más simple y flexible. Fuente: "React Query vs SWR vs Apollo vs RTK Query" en el blog de TkDodo, docs de cada librería, y la comparación en el blog de LogRocket.

---

### 9. [Cuestionar] ¿Fetch-on-render vs render-as-you-fetch? React Query por defecto usa fetch-on-render (el fetch comienza cuando el componente se monta). Suspense con React Query permite render-as-you-fetch (el fetch comienza antes, cuando la navegación empieza). ¿Es render-as-you-fetch el futuro o una optimización prematura?

**Respuesta**: Render-as-you-fetch (iniciar el fetch al navegar, no al montar) reduce la percepción de loading porque los datos empiezan a cargarse antes (durante la transición de navegación). React Router v6.4+ con loaders implementa esto: el loader se ejecuta al iniciar la navegación, no al montar el componente. Con React Query, podés lograr lo mismo con `queryClient.prefetchQuery` en un event handler (onClick de un link, onMouseEnter, etc.). Es una optimización valiosa para páginas que cargan datos grandes (reportes, dashboards) pero prematura para páginas simples.

**Por qué**: La diferencia práctica: con fetch-on-render, el usuario hace clic → navega → componente monta → fetch → loading → data. Con render-as-you-fetch: usuario hace hover en link → prefetch (background) → clic → navega → componente monta → data (ya está en caché) → sin loading. Para TaskFlow (datos pequeños, páginas simples), fetch-on-render es suficiente. Para un e-commerce con catálogo de productos pesado, prefetch on hover/link mejora significativamente la UX. Fuente: "Render as You Fetch" por Dan Abramov, React Router v6.4 "Data Loading" docs, y "Patterns for Data Fetching in React" por Tanner Linsley.

---

### 10. [Cuestionar] ¿Debería React Query reemplazar a Zustand completamente? Algunos argumentan que casi todo el estado en apps modernas es "server state" y React Query puede manejar también UI state con `setQueryData` en queries locales. ¿Dónde está la línea?

**Respuesta**: NO. React Query está diseñado para estado que tiene una "fuente de verdad externa" (servidor). Forzarlo a manejar UI state (sidebar abierto, tema, estado de un modal) usando `setQueryData` en queries con `staleTime: Infinity` es un abuso y pierde las ventajas de Zustand: (1) Zustand permite acceso imperativo fuera de componentes (`getState()`, `setState()`), (2) Zustand tiene persistencia simple vía middleware, (3) UI state en Zustand es más semántico (el nombre del store comunica intención). La línea: si el dato VIVE en el servidor → React Query. Si el dato VIVE en el navegador → Zustand/useState.

**Por qué**: TkDodo y Tanner Linsley dibujan una línea clara: "React Query manages server state. State managers manage client state. Don't mix them." Intentar poner UI state en React Query lleva a: (1) queries artificiales sin `queryFn`, (2) `setQueryData` manual en lugar de `set`, (3) perder DevTools de Zustand/Redux para UI state, (4) confundir al equipo sobre qué estado viene del servidor y cuál no. La arquitectura recomendada es: React Query para server state, Zustand para client state, y comunicación mínima entre ellos (Zustand puede leer React Query cache con `queryClient.getQueryData()`, pero no al revés). Fuente: "State Management in React with React Query" por TkDodo, "Why React Query is not a State Manager" por Tanner Linsley, y la charla "Server State vs Client State" en React Summit.
