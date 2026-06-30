---
sidebar_label: "Cuestionario"
---

# Cuestionario M21 — Rendimiento y Optimización

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué impacto real tiene el React Compiler (Forget) en las optimizaciones manuales de `useMemo`, `useCallback` y `React.memo`? Si el compilador memoiza automáticamente, ¿deberíamos remover todas nuestras optimizaciones manuales? ¿Qué dice el equipo de React?

**Respuesta**: El equipo de React (Joe Savona, Sathya Gunasekaran) recomienda: (1) en componentes que siguen las reglas de React (pureza, no mutación), el compilador puede reemplazar `useMemo`, `useCallback`, y `React.memo`, por lo que podrías removerlos gradualmente, (2) PERO inicialmente el compilador no cubre el 100% de casos — componentes con patrones complejos pueden necesitar optimizaciones manuales, (3) la recomendación es usar el React Compiler Playground para ver qué memoiza y qué no, y solo remover optimizaciones manuales en componentes que el compilador optimiza completamente.

**Por qué**: El compilador funciona como un plugin de Babel que analiza el AST de los componentes. Detecta valores y funciones que pueden memoizarse (basado en si dependen de props/estado que cambian) y los memoiza automáticamente. Pero hay límites: funciones con side effects, hooks llamados condicionalmente, o patrones con `useRef` que el compilador no puede analizar estáticamente. Para TaskFlow, el compilador optimizaría ~80% de los casos. Fuente: react.dev/learn/react-compiler, "React Compiler: What You Need to Know" por Joe Savona en React Conf 2024, y el React Compiler Playground.

---

### 2. [Investigar] ¿Qué es Million.js y cómo logra ser un "Virtual DOM replacement" más rápido que React? Million.js (creado por Aiden Bai) usa un enfoque de "block virtual DOM" y compilador. ¿Cuándo vale la pena integrarlo con React?

**Respuesta**: Million.js reemplaza el Virtual DOM de React con "blocks" — unidades de UI precompiladas que se actualizan directamente mediante operaciones DOM imperativas, saltándose el diffing de React. Se integra con React como un wrapper: `<For each={tasks}>{(task) => <TaskCard />}</For>`. Million compila el template a código optimizado que actualiza solo los nodos DOM que cambiaron, sin pasar por el reconciler de React. Es útil para listas muy grandes (>1000 items) donde el diffing de React es un cuello de botella.

**Por qué**: Aiden Bai demostró que el Virtual DOM no es inherentemente lento, sino que la implementación de React del diffing es el cuello de botella. Million.js compila templates a código que sabe exactamente qué nodos DOM crear/actualizar (similar a Svelte o SolidJS), eliminando el diffing. No reemplaza a React — es complementario. Para TaskFlow con <100 tareas, Million.js es overkill. Para un dashboard con 10,000 filas de datos, sería valioso. Fuente: million.dev, "Million.js: A Faster Virtual DOM" por Aiden Bai, y la charla "Building a Faster React" en React Summit.

---

### 3. [Investigar] ¿Qué es Preact Signals y cómo se integra con React? Preact (de Jason Miller) implementó signals como primitiva de estado. ¿Qué diferencia de performance hay entre signals en React y `useState`, y qué implicaciones tiene para las optimizaciones de la clase?

**Respuesta**: Preact Signals evitan completamente el re-render de componentes: cuando un signal cambia, solo el nodo de texto/atributo que depende de ese signal se actualiza en el DOM, sin re-ejecutar la función del componente. En React con `useState`, el componente completo se re-ejecuta y el Virtual DOM hace diffing. `@preact/signals-react` permite usar signals dentro de componentes React: `const count = useSignal(0)`. React no re-renderiza el componente cuando `count.value` cambia — solo el texto en el DOM se actualiza.

**Por qué**: La diferencia es arquitectónica: React hace "pull" (el componente lee el estado durante el render), Signals hacen "push" (el estado notifica a los puntos del DOM que dependen de él). Esto elimina el overhead de re-render y diffing. Para TaskFlow, integrar Preact Signals sería una optimización radical pero introduce un modelo de programación diferente y dependencia adicional. Fuente: preactjs.com/guide/v10/signals, "Signals in React" por Marvin Hagemeister, y benchmarks en el repo de Preact Signals.

---

### 4. [Investigar] ¿Cuáles son los hallazgos clave de "Why React Re-renders" de Mark Erikson que van más allá de lo cubierto en clase? Mark Erikson (mantenedor de Redux) escribió una guía profunda sobre las causas de re-renders en React.

**Respuesta**: Mark Erikson identificó que el 90% de los problemas de performance en React son por re-renders innecesarios, y las causas principales son: (1) "Render de padres causa render de hijos" — React re-renderiza recursivamente todos los hijos de un componente que se re-renderiza, a menos que estén memoizados, (2) "Nuevas referencias en cada render" — objetos, arrays, y funciones creados inline son nuevas referencias cada render, rompiendo `React.memo`, (3) "Context propagation" — un cambio en Context re-renderiza TODOS los consumidores debajo del Provider, (4) "Derived state in hooks" — custom hooks que retornan nuevos objetos/arrays en cada render causan re-renders en cascada.

**Por qué**: El insight clave de Mark es que la mayoría de los re-renders innecesarios provienen de referencias inestables, no de cálculos costosos. La solución no es `useMemo` para todo, sino: mover estado hacia abajo (colocation), pasar primitivas en lugar de objetos como props, usar `children` como prop (React optimiza children estable), y separar contextos por frecuencia de cambio. Fuente: "Why React Re-renders" en blog.isquaredsoftware.com, "A (Mostly) Complete Guide to React Rendering Behavior" por Mark Erikson, y la charla "React Rendering Explained" en React Summit.

---

### 5. [Conectar] La clase usa `useMemo` para filtros de tareas. Conectá esto con el patrón "Selector memoization" de reselect. ¿Cómo implementar selectores memoizados con `createSelector` y cómo se comparan con `useMemo` en un contexto Zustand?

**Respuesta**: Reselect crea selectores memoizados con `createSelector` que solo se recalculan cuando sus inputs cambian. A diferencia de `useMemo` (que memoiza por componente), los selectores de Reselect son funciones reutilizables entre componentes. Con Zustand: `const filteredTasks = useTaskStore(selectFilteredTasks)`. Reselect memoiza: si `tasks`, `filter`, y `search` no cambiaron, retorna el mismo resultado sin recalcular. La ventaja: composición de selectores, reutilización, y mejor debugging. `useMemo` es más simple para casos locales. Para TaskFlow con filtros, `useMemo` es adecuado. Si tuvieras 20 selectores derivados compartidos, Reselect sería más mantenible. Fuente: github.com/reduxjs/reselect, "Using Reselect with Zustand" por Daishi Kato, y Redux docs sobre "Deriving Data with Selectors".

---

### 6. [Conectar] La clase muestra bundle analysis con visualizer. Conectá esto con el concepto de "Tree Shaking". ¿Qué configuraciones de Vite, Rollup, y package.json son necesarias para que el tree shaking funcione correctamente?

**Respuesta**: Para tree-shaking efectivo con Vite/Rollup: (1) el proyecto debe usar ESM (import/export), (2) `sideEffects: false` en el package.json del proyecto, (3) las librerías deben usar ESM y declarar `sideEffects: false`, (4) evitar barrel exports sin precaución. Librerías no tree-shakeables: CommonJS (Rollup no analiza require), librerías con side effects a nivel módulo, y librerías que usan Proxy en exports. Lodash (CommonJS) requiere imports deep (`lodash/debounce`). Lodash-es (ESM) es tree-shakeable con imports nombrados. Fuente: Rollup docs "Tree Shaking", "How to make your library tree-shakeable" por Anthony Fu, y la guía de Vite.

---

### 7. [Conectar] La clase usa React.lazy para code splitting. Conectá esto con el concepto de "Granular Chunking". ¿Cómo Vite genera chunks y cómo podés controlar el chunking con `manualChunks` en vite.config.ts?

**Respuesta**: Vite/Rollup genera chunks basándose en entry points e import() dinámicos. Podés controlar con `rollupOptions.output.manualChunks` para agrupar dependencias grandes: `'react-vendor': ['react', 'react-dom']`. Esto agrupa por tasa de cambio: React (nunca cambia), librerías UI (cambian al actualizar deps), código app (cambia cada deploy). Maximiza el cache hit ratio. Sin manualChunks, Rollup usa heurística automática que puede ser subóptima. Fuente: Vite docs "Build Options", Rollup docs "output.manualChunks", y "Optimizing Vite Builds" en el blog de Vite.

---

### 8. [Cuestionar] ¿Es `React.memo` una optimización prematura? Kent C. Dodds dice "never use React.memo without profiling first". Con el React Compiler, ¿deberíamos siquiera pensar en memo manual?

**Respuesta**: Kent C. Dodds y Dan Abramov coinciden: `React.memo` no debería usarse sin medir primero porque tiene un costo (comparar props) que puede superar el render en componentes livianos. Con el React Compiler, la decisión se automatiza — el compilador determina qué memoizar. Dan Abramov: "The compiler is the solution to manual memoization." Para TaskFlow sin Compiler: aplicá `React.memo` solo donde React DevTools Profiler muestre re-renders innecesarios. Con Compiler: no necesitás memo manual. Fuente: "When to useMemo and useCallback" por Kent C. Dodds, "Before you memo()" por Dan Abramov, y docs del React Compiler.

---

### 9. [Cuestionar] ¿Virtual Scrolling siempre es necesario para listas grandes? Librerías como `react-window` y `@tanstack/react-virtual` pesan ~5KB. ¿Cuándo justifica su uso y cuándo es overkill?

**Respuesta**: Virtual scrolling justifica cuando: >500 items, cada item tiene costo de render significativo, y la lista se scrollea frecuentemente. Es overkill cuando: <200 items, items muy simples, o paginación. Virtual scrolling introduce complejidad: accesibilidad (lectores de pantalla no ven items no renderizados), Ctrl+F no encuentra texto oculto, y scroll-to-item requiere cálculos extra. Para TaskFlow con tareas, se justificaría a partir de ~300 tareas. Antes, medí performance y solo integrá si hay un problema medible. Fuente: tanstack.com/virtual, "Why not use virtual scrolling by default?" por TkDodo, y "React Virtual Scroll: When and Why" en el blog de LogRocket.

---

### 10. [Cuestionar] ¿Deberíamos configurar Lighthouse 90+ como objetivo para una SPA? Lighthouse penaliza SPAs (carga inicial de JavaScript). ¿Es realista alcanzar 90+ en una SPA React sin SSR/SSG?

**Respuesta**: Es realista con optimizaciones agresivas: code splitting por ruta (bundle inicial <100KB), lazy loading de imágenes con dimensiones explícitas, preload/critical CSS inline, usar `fetchpriority="high"` en LCP image, y minimizar JavaScript blocking. Sin embargo, sin SSR/SSG, la carga inicial siempre requerirá que el navegador descargue, parse y ejecute React (~40KB gzipped). Para apps tipo dashboard (TaskFlow), 85-90+ es alcanzable. Para apps de contenido público (e-commerce, blogs) donde SEO es crítico, SSR (Next.js) es necesario para 95+. La métrica que más sufre en SPAs es LCP. Fuente: web.dev/vitals, "SPA Performance with Lighthouse" por Addy Osmani, y la guía de Vite sobre producción.
