---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Islands Architecture" (e.g., Astro, Fresh) y cómo redefine los patrones de composición de React? ¿Es Composite todavía aplicable?

**Respuesta**: **Islands Architecture** (Jason Miller, creador de Preact, 2020) divide la página en "islas" de interactividad rodeadas de HTML estático renderizado en servidor. En lugar de un árbol Composite gigante (SPA), la página es HTML estático con pequeñas "islas" que son componentes React/Preact/Svelte independientes. Cada isla tiene su propio estado y ciclo de vida — NO comparten Context ni estado entre islas. ¿Es Composite aplicable? **Sí, pero fragmentado**: cada isla es su propio mini-Composite (árbol de componentes con estado local). La página ya no es un Composite global. El patrón Composite se aplica dentro de cada isla, pero no a través de islas. Astro (Fred K. Schott, 2021) popularizó esto: `---` fences para el servidor, JSX para las islas. Fresh (Deno, Luca Casonato, 2022) lo lleva a server-side rendering con islands. La motivación: enviar CERO JavaScript para contenido estático (mejor performance). Las islas son Strategy aplicado a nivel de página: cada isla es una estrategia de interactividad independiente.

**Por qué**: Jason Miller (Google, Preact) acuñó "Islands Architecture" en 2020. Astro (2021) y Fresh (2022) la implementan. En 2026, está convergiendo con React Server Components (RSC) de Next.js 14+ y React 19: el servidor renderiza HTML; solo componentes marcados `"use client"` se hidratan en el cliente — son "islands" en todo menos el nombre.

---

### 3. [Investigar] ¿Qué es el patrón "Render as You Fetch" (React Suspense) y cómo se relaciona con Strategy y Observer? ¿Por qué reemplaza "Fetch on Render"?

**Por qué**: React team (Dan Abramov, Andrew Clark, Sophie Alpert) introdujo Suspense en React 16.6 (2018) y lo expandió en React 18 (2022). La RFC de `use()` (React 19) completa el modelo "Render as You Fetch." Relay (Meta) fue pionero en este enfoque. La diferencia con el patrón de la clase: en el hook `useFetch` de la clase, el fetch se inicia DENTRO del componente (Template Method). Con Suspense + `use()`, el fetch se inicia FUERA (Strategy).

---

### 4. [Investigar] ¿Cómo implementa Svelte la reactividad a nivel de compilador y cómo eso elimina los hooks, HOCs y Render Props? ¿Son estos patrones de React workarounds para falta de reactividad nativa?

**Por qué**: Rich Harris (New York Times, Vercel) creó Svelte como "framework that disappears." Svelte 5 (2024) introdujo runas (`$state`, `$derived`, `$effect`) como primitivas de reactividad compiladas. La declaración reactiva `$:` es Observer GoF implementado en el compilador. Svelte demuestra que la complejidad de patrones React (hooks, memorización, dependency arrays) es accidental, no esencial — es una consecuencia de que React es una librería runtime en lugar de un compilador.

---

### 5. [Conectar] La clase explica Compound Components con Tabs. Conectá esto con Radix UI (shadcn/ui): ¿cómo el patrón Compound se lleva al extremo en una librería de componentes headless?

**Por qué**: Radix UI fue creado por WorkOS (Colm Tuite, Benoît Grélard) para proveer componentes accesibles y sin estilos. La documentación describe el patrón de Compound Components. La diferencia con el `Tabs` de la clase: Radix maneja accesibilidad (WCAG), teclado, focus management, y RTL languages — preocupaciones que un Compound Component simple no cubre.

---

### 6. [Conectar] La clase menciona `useReducer`. Conectá esto con XState (David Khourshid): ¿cómo XState implementa Statecharts en React y cómo se compara con `useReducer` + `switch`?

**Respuesta**: XState (David Khourshid, Microsoft, 2017) implementa **Statecharts** (Harel, 1987) en JavaScript/React, superando a `useReducer` en sistemas de estados complejos. Mientras `useReducer` + `switch` modela estados planos, XState modela: (1) **Estados jerárquicos**: un estado `cargando` puede tener sub-estados `validando` y `consultando`, (2) **Estados paralelos**: un reproductor puede estar simultáneamente en `modoAudio` y `modoEfectos`, (3) **Guardias**: transiciones condicionales (`puedePagar: (ctx) => ctx.saldo > 0`), (4) **Actions**: entry/exit/transition actions (`entry: 'iniciarTimer'`, `exit: 'limpiarCache'`), (5) **Services**: invocaciones asíncronas (promises, callbacks, observables) como parte del statechart, (6) **Visualización**: XState puede generar diagramas SVG del statechart automáticamente. `useReducer` es suficiente para 3-5 estados planos; XState es necesario para 10+ estados con jerarquía y concurrencia. XState implementa el patrón State + Mediator + Observer: el statechart es el Mediator que orquesta transiciones; los servicios son Commands; los eventos son Observer notifications.

**Por qué**: David Khourshid (Microsoft, creador de XState) implementó Statecharts en JS basado en la especificación SCXML (W3C). XState 5 (2024) simplificó la API. En React, `useMachine` conecta el statechart al componente: `const [state, send] = useMachine(maquinaStatechart)`. Es State GoF escalado a Statecharts, con tooling de visualización y testing formal (`@xstate/test` genera tests automáticos desde el statechart).

---

### 7. [Conectar] La clase muestra `useFetch` como Custom Hook. Conectá esto con React Query (TanStack Query): ¿cómo implementa Strategy + Decorator + Observer para data fetching avanzado?

**Por qué**: Tanner Linsley creó React Query para resolver problemas de cache y sincronización que `useFetch` no cubre. En 2026, TanStack Query v5 es el estándar para server state en React. La arquitectura es un compendio de patrones: Strategy para fetching, Observer para reactividad de cache, Flyweight para deduplication, Decorator para retry/refetch.

---

### 8. [Cuestionar] ¿Son los HOCs realmente un anti-patrón en 2026, o tienen un nicho legítimo donde los hooks no alcanzan? ¿Qué patrones no pueden implementarse con hooks?

**Por qué**: Dan Abramov (React team) escribió en 2019 que "hooks don't replace HOCs completely — they replace HOCs for sharing stateful logic." El equipo de React mantiene `React.memo` (HOC) y `React.forwardRef` como APIs válidas. Kent C. Dodds lista casos donde HOCs son preferibles. La comunidad convergió en "hooks for logic, HOCs for rendering concerns, Render Props for maximum flexibility."

---

### 9. [Cuestionar] ¿Es `useEffect` un anti-patrón cuando se usa como "watch" para reaccionar a cambios de estado? ¿Es un Template Method mal diseñado?

**Por qué**: React team (Dan Abramov) escribió "You Might Not Need an Effect" (2023) en los nuevos docs de React, detallando cuándo NO usar `useEffect`. La comunidad está migrando de "effects everywhere" a "effects as last resort." En React 19, el Strict Mode desmonta y remonta componentes dos veces para detectar efectos mal diseñados.

---

### 10. [Cuestionar] ¿Es el Virtual DOM un Composite con Diff que se volverá obsoleto con Signals y compiladores? ¿Debería React migrar a Signals?

**Respuesta**: El Virtual DOM (Composite + Diff) está bajo presión de frameworks sin VDOM (Solid, Svelte, Qwik) que muestran mejor performance. Pero **el VDOM no se volverá obsoleto completamente** porque: (1) **Portabilidad**: el VDOM permite que React se ejecute en DOM, Canvas, WebGL, Native, Terminal (Ink) — el reconciler es el mismo, el renderer cambia. Signals están acoplados al DOM. (2) **Modelo mental de snapshot**: el VDOM trata el render como función pura `UI = f(state)` — inmutable, predecible. Signals con mutaciones locales son más difíciles de razonar globalmente. (3) **Ecosistema**: React tiene 10+ años de ecosistema (Next.js, React Native, React Three Fiber) construido sobre VDOM. React 19 y React Forget (compilador de memo) optimizan VDOM sin abandonarlo. Sin embargo, React YA ESTÁ migrando parcialmente a señales: `useSyncExternalStore` es un hook para suscribirse a stores externos (Observer). Zustand, Jotai, y Valtio son state managers con signals que se integran con React vía `useSyncExternalStore`. En el futuro, React probablemente incorporará primitivas de signals compiladas (como React Forget) manteniendo el modelo de programación declarativo.

**Por qué**: Dan Abramov (2023) dijo: "We're not removing the Virtual DOM. We're making it faster." React Forget (Joe Savona, Meta) es un compilador que memoiza automáticamente — reduce la necesidad de diff. Preact Signals (Marvin Hagemeister, 2022) muestra cómo signals y VDOM coexisten. La convergencia más probable: React con VDOM + signals compiladas + React Forget.

