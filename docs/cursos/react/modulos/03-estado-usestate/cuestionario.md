---
sidebar_label: "Cuestionario"
---

# Cuestionario M03 — Estado con useState

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Cómo funciona exactamente el React Compiler (antes React Forget) en relación a `useState` y la memoización de valores derivados? Si el compilador memoiza automáticamente, ¿seguimos necesitando derivar estado manualmente como `pendingCount = tasks.filter(...)` o el compilador lo optimiza?

**Respuesta**: El React Compiler optimiza CUÁNDO re-renderizar (memoizando componentes y valores automáticamente), pero no elimina la necesidad de derivar estado correctamente. El compilador puede memoizar el resultado de `tasks.filter(t => !t.completed).length` para no recalcularlo si `tasks` no cambió, pero no puede corregir el anti-patrón de almacenar `pendingCount` en un `useState` separado. La buena práctica de "estado derivado" sigue siendo necesaria: el compilador optimiza performance, no arquitectura.

**Por qué**: El React Compiler opera a nivel de "qué cosas memorizar para evitar re-renders", no a nivel de "cómo modelar el estado". Si guardás `pendingCount` en `useState`, el compilador no lo va a eliminar ni a transformar en estado derivado. Esa decisión arquitectónica sigue siendo del desarrollador. Lo que SÍ cambia es que el compilador puede hacer que `tasks.filter(t => !t.completed).length` se ejecute solo cuando `tasks` cambió (como si tuvieras `useMemo`), eliminando la necesidad de memoizar manualmente cálculos derivados costosos. Fuente: "React Compiler Deep Dive" por Joe Savona en React Conf 2024, documentación del React Compiler en react.dev, y el playground en play.reactcompiler.com.

---

### 2. [Investigar] ¿Qué es `useSyncExternalStore` y cómo se diferencia de `useState` a nivel de suscripción a fuentes externas? ¿Por qué Zustand y React Query lo usan internamente en lugar de `useState`?

**Respuesta**: `useSyncExternalStore(subscribe, getSnapshot)` es un hook de React 18 diseñado para suscribirse a stores externos (fuera del árbol de React) de forma segura para Concurrent Rendering. A diferencia de `useState`, que escribe el valor en la Fiber de React y React controla cuándo cambia, `useSyncExternalStore` lee de una fuente externa que puede cambiar en cualquier momento (fuera del control de React), y React garantiza que todos los componentes vean el mismo snapshot consistente durante un render, evitando "tearing".

**Por qué**: `useState` asume que el estado solo cambia mediante `setState`, lo cual pasa por el scheduler de React. Pero Zustand y React Query mantienen su estado fuera de React (en closures o caches externos). Sin `useSyncExternalStore`, si un store externo cambia durante un render concurrente, diferentes componentes podrían ver diferentes valores (tearing). Este hook resuelve el problema: React "bloquea" el store externo durante la fase de render, garantizando consistencia. Internamente, `useSyncExternalStore` usa `getSnapshot()` para leer el valor actual y `subscribe()` para registrarse a cambios. Zustand lo usa con selectores: `useSyncExternalStoreWithSelector(subscribe, getState, getServerSnapshot, selector, equals)`. Fuente: React docs sobre useSyncExternalStore, código fuente de Zustand en github.com/pmndrs/zustand, y la charla "External Stores in React 18" por Daishi Kato.

---

### 3. [Investigar] React 19 introdujo el hook `use()` como alternativa a `useState` para ciertos casos de fetching. ¿Cómo funciona `use()` y en qué se diferencia fundamentalmente de `useState`? ¿Por qué puede "suspender" un componente?

**Respuesta**: `use()` es un hook de React 19 que lee el valor de una promesa o contexto, y si la promesa no está resuelta, SUSPENDE el componente (lanza la promesa hacia el `Suspense` más cercano). A diferencia de `useState`, no maneja estado local mutable — solo LEE valores de fuentes externas (promesas, context). `use(context)` es el equivalente de `useContext` pero sin las reglas condicionales estrictas: puede llamarse dentro de if/else y loops. `use(promise)` suspende el componente hasta que la promesa resuelve.

**Por qué**: `use()` unifica el patrón de "leer datos asíncronos" que antes requería `useEffect` + `useState` o librerías externas. La diferencia fundamental con `useState`: `useState` es para estado mutable que pertenece al componente, `use()` es para leer datos externos (similar a cómo `await` lee promesas en código async). Si una promesa pasada a `use()` no está resuelta, el componente "suspende" y React muestra el fallback del `Suspense` más cercano. Esto permite data fetching declarativo SIN `useEffect`. Sin embargo, `use()` no reemplaza completamente a React Query porque no tiene caching, deduplication, ni revalidación. Fuente: React 19 release notes sobre `use()`, RFC "First class support for Promises" en github.com/reactjs/rfcs, y la talk "What's new in React 19" por Andrew Clark.

---

### 4. [Investigar] ¿Cómo funciona el modelo de reactividad de SolidJS (signals, memos, effects) en comparación con `useState` de React? ¿Por qué SolidJS no necesita Virtual DOM y cómo logra actualizaciones granulares sin re-renderizar componentes?

**Respuesta**: SolidJS usa un sistema de signals (similar a `useState` pero a nivel de valor individual, no de componente), donde cada signal es un getter/setter. Cuando un signal cambia, solo las expresiones JSX que LEEN ese signal se actualizan — no el componente completo. Solid no tiene Virtual DOM: durante la compilación, el JSX se convierte en llamadas directas a `document.createElement` y `textNode.textContent = signalValue`. Los componentes de Solid se ejecutan UNA sola vez (setup function) y retornan elementos DOM reales o señales, no un Virtual DOM.

**Por qué**: La diferencia de paradigma es profunda. En React: estado cambia → componente re-ejecuta → Virtual DOM → diff → DOM real. En Solid: signal cambia → solo las suscripciones a ese signal se ejecutan (efectos, actualizaciones de DOM). Esto significa que no hay "re-render" de componentes. Un componente como `<Counter>` en Solid solo ejecuta su función de setup una vez, y el span que muestra el valor se suscribe directamente a `count()`. Ryan Carniato (creador de Solid) explica que esto es más cercano a cómo funciona el DOM nativo: observadores granulares. La ventaja es performance extrema (sin overhead de diffing); la desventaja es un modelo mental diferente y menos madurez de ecosistema. Fuente: "SolidJS Reactivity from Scratch" por Ryan Carniato, solidjs.com/guides/reactivity, y la comparación "Solid vs React" en el blog de Ryan.

---

### 5. [Conectar] La clase explica el batching automático de React 18 para `setState`. Investigá el concepto de "Automatic Batching" en profundidad: ¿qué escenarios NO cubre el batching automático y cómo se relaciona con `flushSync`? ¿Qué pasaba en React 17 con `setState` en timeouts y promesas?

**Respuesta**: En React 17, el batching solo ocurría dentro de event handlers de React (synthetic events). Las actualizaciones en `setTimeout`, `Promise.then()`, `setInterval`, y event listeners nativos NO se bateaban — cada `setState` causaba un render separado. React 18 extendió el batching a TODOS los contextos de actualización (timeouts, promesas, eventos nativos) mediante el nuevo scheduler concurrente. El único caso donde NO se batea es cuando usás `flushSync()`, que fuerza un render sincrónico inmediato.

**Por qué**: Dan Abramov explicó que el batching automático fue posible porque React 18 rediseñó el scheduler para trabajar con "lanes" de prioridad. En React 17, el batching dependía de un flag `isBatchingUpdates` que solo se activaba dentro de `ReactEventListener.dispatchEvent`. Fuera de ese contexto (timeouts, promises), cada `setState` disparaba un render inmediato. En React 18, todas las actualizaciones pasan por el mismo scheduler que las agrupa automáticamente. `flushSync` es el escape hatch: fuerza commit sincrónico y no batea con actualizaciones posteriores. Casos de uso legítimos: leer el DOM inmediatamente después de un state update (`flushSync(() => setState(x)); ref.current.scrollIntoView()`). Fuente: "Automatic Batching in React 18" en el blog de React, Dan Abramov en github.com/reactwg/react-18/discussions, y la documentación de flushSync.

---

### 6. [Conectar] La clase muestra `useState<Task[]>([])` para tipar arrays. Investigá el patrón "useState with Zod" para validar el estado en runtime, especialmente cuando los datos vienen de `localStorage` o APIs. ¿Cómo integrarías Zod con `useState` para garantizar type safety en runtime y no solo en compilación?

**Respuesta**: Se puede crear un custom hook `useValidatedState` que use Zod para validar el valor inicial y cada actualización del estado. Esto es crucial cuando los datos vienen de fuentes no confiables (localStorage, query params, postMessage). El patrón usa `schema.parse()` en el `useState` initializer y en un wrapper de `setState`:

```ts
function useValidatedState<T>(schema: z.ZodSchema<T>, initial: T) {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    if (!stored) return initial
    return schema.parse(JSON.parse(stored)) // valida en runtime
  })
  const setValidated = (value: T) => {
    schema.parse(value) // valida antes de setear
    setState(value)
  }
  return [state, setValidated] as const
}
```

**Por qué**: TypeScript solo verifica tipos en compilación, pero los datos en runtime (localStorage, API responses) pueden tener formas inesperadas. Si `localStorage` tiene datos corruptos de una versión anterior de la app, `JSON.parse` + type assertion (sin Zod) dejaría pasar datos inválidos que crashean más tarde. Zod como guard en runtime cierra esta brecha. Matt Pocock y el equipo de tRPC promueven este patrón: "parse, don't validate" — validar en los boundaries (entrada de datos al sistema React) y confiar en TypeScript dentro. Fuente: Zod documentation en zod.dev, "TypeScript Runtime Validation" por Matt Pocock, y el patrón "parse, don't validate" en el blog de Colin McDonnell (creador de Zod).

---

### 7. [Conectar] La clase menciona `crypto.randomUUID()` para IDs. Investigá `nanoid` como alternativa: ¿qué diferencias tiene en tamaño de ID, performance, colisiones, y seguridad? ¿Por qué algunas librerías como Zustand y Redux Toolkit lo prefieren?

**Respuesta**: `nanoid` genera IDs más cortos (21 caracteres por defecto vs 36 del UUID), es más rápido (genera IDs sin llamar a APIs del sistema), tiene un espacio de colisiones comparable (usa 64 símbolos en lugar de 16 hexadecimales, logrando más entropía en menos caracteres), y es isomorfo (funciona igual en Node y navegador). Su tamaño es ~130 bytes vs cero bytes de `crypto.randomUUID()` (que es nativo). Zustand lo usa internamente para IDs de notificaciones; Redux Toolkit para IDs de entidades.

**Por qué**: `nanoid` genera IDs URL-safe sin dependencias. La diferencia de entropía: UUID v4 tiene 122 bits de entropía en 36 caracteres, `nanoid(21)` tiene ~126 bits en 21 caracteres (porque usa un alfabeto de 64 caracteres en lugar de 16). La ventaja principal es el tamaño compacto (mejor para URLs y logs) y la velocidad (no depende de `crypto` que puede ser lento en Node < 19). Para TaskFlow, `crypto.randomUUID()` es nativo y suficiente (no necesitamos instalar una dependencia), pero `nanoid` es preferible si generás muchos IDs o los mostrás en URLs. Fuente: github.com/ai/nanoid, comparación en la documentación de nanoid, y uso en zustand (github.com/pmndrs/zustand).

---

### 8. [Cuestionar] Hay un debate sobre `useState` con objeto único vs múltiples `useState` por campo. La clase dice que la diferencia es "mínima". Pero con el React Compiler, ¿cambia este trade-off? ¿El compilador puede optimizar mejor múltiples `useState` o un objeto único con `setForm({ ...prev, [field]: value })`?

**Respuesta**: Con el React Compiler, múltiples `useState` podría ser marginalmente mejor porque cada `useState` es una celda independiente y el compilador puede determinar con precisión qué componentes dependen de qué campo. Con un objeto único, cualquier cambio de cualquier campo cambia la referencia del objeto completo, y el compilador podría tener más trabajo determinando qué partes de la UI realmente necesitan actualizarse. Sin embargo, la diferencia sigue siendo mínima para la mayoría de aplicaciones.

**Por qué**: El React Compiler trabaja a nivel de variables y expresiones. Con múltiples `useState`, el compilador ve claramente que `name` es una variable y `email` es otra, y puede memoizar componentes que solo leen `name` cuando `email` cambia. Con un objeto único, el compilador debe analizar qué propiedades del objeto se están leyendo y determinar si cambiaron. Pero la diferencia práctica es ínfima — Dan Abramov ha dicho que la elección debe basarse en la semántica y mantenibilidad del código, no en micro-optimizaciones. La recomendación de la comunidad sigue dividida: Kent C. Dodds prefiere múltiples `useState`, mientras que el patrón de "form state" de TanStack Form usa un solo store. Fuente: "useState vs useReducer" en el blog de Kent C. Dodds, charlas del React Compiler en React Conf 2024, y discusiones en el React Working Group.

---

### 9. [Cuestionar] La clase enseña "estado derivado" como algo positivo. Pero en aplicaciones con miles de items, recalcular `tasks.filter()` en cada render puede ser costoso. ¿Dónde está la línea entre "estado derivado simple" y "necesito `useMemo`"? ¿Es prematura la optimización con `useMemo` o es una buena práctica por defecto?

**Respuesta**: La línea está en la complejidad del cálculo: para `tasks.filter(t => !t.completed).length` sobre <1000 items, el cálculo es imperceptible y `useMemo` sería prematuro. Para `tasks.filter(...).sort(...).map(...)` sobre >10000 items, `useMemo` es justificado. Kent C. Dodds recomienda no usar `useMemo` a menos que hayas medido un problema real con React DevTools Profiler. Sin embargo, Dan Abramov matiza que `useMemo` para estabilizar referencias (cuando el resultado se pasa a hijos memoizados) es justificado incluso para cálculos baratos.

**Por qué**: El costo de `useMemo` no es solo la comparación de dependencias — es la complejidad cognitiva de leer código con memoización. Cada `useMemo`/`useCallback` agrega una capa de indirección. La recomendación pragmática: (1) empezá sin memoización, (2) medí con React DevTools Profiler, (3) solo agregá `useMemo` donde veas renders innecesarios costosos. Con la llegada del React Compiler, mucho de esto será automático — el compilador detecta cálculos costosos y los memoiza sin intervención manual. Fuente: "When to useMemo and useCallback" por Kent C. Dodds, "Before You memo()" por Dan Abramov, y el React Compiler Playground para ver qué memoiza automáticamente.

---

### 10. [Cuestionar] La comunidad debate si `useState` debería evolucionar hacia un modelo de signals (como SolidJS o Preact Signals). ¿Podría React adoptar signals nativamente sin romper su modelo de programación? ¿Qué ha dicho el equipo de React al respecto?

**Respuesta**: El equipo de React (Dan Abramov, Andrew Clark) ha reconocido las ventajas de los signals (actualizaciones granulares, sin re-renders completos) pero ha indicado que no planean adoptar signals como primitiva nativa. En su lugar, están invirtiendo en el React Compiler para lograr beneficios similares (eliminar re-renders innecesarios) sin cambiar el modelo de programación. La postura oficial es que "la UI como función del estado" es un modelo mental más valioso que la performance granular, y el compilador cerrará la brecha de performance.

**Por qué**: En un thread de github.com/reactjs/react.dev, Dan Abramov explicó que los signals tienen un costo en el modelo mental: el desarrollador debe rastrear manualmente qué es reactivo y qué no (`signal()` vs valor normal). En React, todo es "potencialmente parte de la UI" sin necesidad de marcar variables como reactivas. La apuesta de React es que el compilador puede lograr ~la misma performance que los signals (analizando el código estáticamente y memoizando) sin que el desarrollador cambie cómo escribe componentes. El debate sigue abierto en la comunidad: Preact Signals muestra que signals en React son posibles hoy y dan beneficios medibles, mientras que el equipo de React apuesta por una solución de build-time. Fuente: "Why React Doesn't Use Signals" en el blog de Dan Abramov, discusiones en github.com/preactjs/signals/issues/280, y React Conf 2024 keynote.
