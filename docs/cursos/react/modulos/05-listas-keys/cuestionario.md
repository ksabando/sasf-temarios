---
sidebar_label: "Cuestionario"
---

# Cuestionario M05 — Listas y Keys

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] En React 19, ¿cambió el comportamiento de las `key` props? Investigá los cambios relacionados con keys en React 19, especialmente cómo interactúan con `useOptimistic` y el nuevo manejo de transiciones. ¿Hay nuevos warnings o comportamientos?

**Respuesta**: En React 19, el comportamiento de keys se mantiene igual en esencia, pero hay cambios en cómo interactúan con features nuevas. React 19 agregó un warning más estricto para keys duplicadas en desarrollo (ahora incluye el nombre del componente en el mensaje de error). También mejoró la reconciliación cuando una key cambia dentro de una transición (`useTransition`) — React ahora puede diferir el desmontaje del componente viejo y el montaje del nuevo durante una transición, evitando flashes de UI intermedios.

**Por qué**: El cambio más notable es la interacción con transiciones. En React 18, si cambiabas la `key` de un elemento dentro de `startTransition`, React desmontaba el viejo y montaba el nuevo inmediatamente (porque las keys fuerzan identity changes). En React 19, React puede coordinar este cambio dentro de la transición, mostrando el contenido anterior hasta que el nuevo está listo (útil con `Suspense`). Las keys no cambiaron su semántica fundamental: siguen siendo el mecanismo de React para rastrear la identidad de los elementos en una lista. Fuente: React 19 release notes, "React 19 Key Changes" en el blog de React, y la discusión en el React Working Group sobre keys y transiciones.

---

### 2. [Investigar] ¿Cómo funciona el algoritmo de reconciliación (diffing) de React a nivel de código para listas con keys? Investigá el concepto de "Fiber" y cómo React construye el árbol de work-in-progress comparando children con keys. ¿Por qué es O(n) y no O(n³)?

**Respuesta**: El algoritmo de reconciliación de React (conocido como "diffing algorithm" o "reconciliation") para listas recorre ambos arrays de children (previo y nuevo) simultáneamente usando keys para hacer matching. Internamente, React construye un mapa `Map<Key, Fiber>` de los children previos, luego itera los nuevos children, busca cada key en el mapa, y decide: si la key existe → reutilizar Fiber (update), si no existe → crear nueva Fiber (mount), si sobraron keys en el mapa → eliminar (unmount). Es O(n) para la mayoría de casos porque cada child se procesa una vez.

**Por qué**: Sin keys, React haría matching por índice (O(n)), pero esto falla con inserciones/eliminaciones. El algoritmo O(n³) es un mito que viene de comparar React con el problema general de tree diffing (que es NP-completo para árboles arbitrarios). React asume que: (1) elementos de distinto `type` producen árboles diferentes, (2) `key` provee identidad estable. Con estas heurísticas, el algoritmo es O(n). El Fiber architecture implementa esto en `reconcileChildrenArray` en `ReactChildFiber.new.js`, donde primero hace un "scan" rápido para elementos que no cambiaron de posición, y luego un "map-based reconciliation" para el resto. Fuente: "Reconciliation" en react.dev, "Inside Fiber: in-depth overview" en el blog de React, y análisis del código fuente en github.com/acdlite/react-fiber-architecture.

---

### 3. [Investigar] ¿Qué es el "Virtual DOM" realmente? Investigá cómo React representa el Virtual DOM internamente (objetos JavaScript plain vs Fiber nodes) y cómo frameworks como Svelte y SolidJS logran actualizaciones de UI sin Virtual DOM. ¿Es el Virtual DOM un overhead innecesario en 2026?

**Respuesta**: El Virtual DOM es un árbol de objetos JavaScript ligeros (React Elements) que representan la UI deseada. React crea un nuevo Virtual DOM en cada render, lo compara (diff) con el anterior, y calcula los cambios mínimos para aplicar al DOM real. Internamente, React usa "Fiber" (estructura de linked list con `child`, `sibling`, `return`, `stateNode`) como unidad de trabajo — el Virtual DOM son los React Elements de entrada, pero Fiber es la estructura de trabajo. Svelte y SolidJS no usan Virtual DOM: Svelte compila componentes a código imperativo que actualiza el DOM directamente, SolidJS usa signals con suscripciones granulares.

**Por qué**: El Virtual DOM fue revolucionario en 2013 porque abstraía las mutaciones del DOM y garantizaba consistencia. Pero en 2026, el debate es si sigue siendo necesario: el React Compiler busca eliminar renders innecesarios (acercándose a la eficiencia de SolidJS), y frameworks como Svelte demuestran que se puede lograr reactividad sin diffing. Sin embargo, el equipo de React argumenta que el Virtual DOM + Fiber permite features como Concurrent Rendering, Suspense, y transiciones que serían mucho más difíciles de implementar con actualizaciones DOM directas. La apuesta es: mejor compilador sobre el modelo existente en lugar de cambiar el modelo. Fuente: "React as a UI Runtime" por Dan Abramov, "Virtual DOM is pure overhead" por Rich Harris (creador de Svelte), y "Fiber Principles" en github.com/acdlite/react-fiber-architecture.

---

### 4. [Investigar] Investigá `useTransition` aplicado a listas: ¿cómo podés usarlo para que una búsqueda que filtra 10,000 items no bloquee el input del usuario? ¿Qué papel juegan las keys en este escenario?

**Respuesta**: `useTransition` permite marcar una actualización de estado como "transición" (baja prioridad), lo que significa que React puede interrumpirla si hay una actualización urgente (como el usuario escribiendo). En una lista con búsqueda: el `onChange` del input actualiza el valor de búsqueda de forma urgente (para que el input se sienta responsivo), mientras que el filtrado de la lista se marca como transición:

```ts
const [query, setQuery] = useState('')
const [filtered, setFiltered] = useState(tasks)
const [isPending, startTransition] = useTransition()
const handleChange = (e) => {
  setQuery(e.target.value) // urgente: input se actualiza inmediatamente
  startTransition(() => {
    setFiltered(heavyFilter(tasks, e.target.value)) // transición: puede ser interrumpida
  })
}
```

Las keys permiten que React preserve el estado de los items que sobreviven al filtrado.

**Por qué**: Sin `useTransition`, cada tecla dispara `heavyFilter` y `setFiltered`, que bloquea el hilo principal. Con `useTransition`, React: (1) aplica `setQuery` inmediatamente (el input muestra lo que el usuario escribió), (2) empieza a calcular el filtrado, (3) si el usuario escribe otra tecla antes de que termine, React ABORTA el filtrado anterior y empieza el nuevo. Las keys son cruciales: React usa las keys para detectar qué items del resultado filtrado anterior siguen presentes en el nuevo resultado, y reutiliza sus Fibers en lugar de desmontar/remontar. Fuente: React docs sobre `useTransition`, "Real World React 18" por Ricky de la Vega, y el código de ejemplo en react.dev.

---

### 5. [Conectar] La clase menciona que el algoritmo de `.sort()` es in-place y muta el array. Investigá otros métodos de array que mutan vs los que retornan nueva copia en JavaScript, y cómo esto se relaciona con la inmutabilidad en React. ¿Qué métodos son "seguros" para estado de React y cuáles requieren copia previa?

**Respuesta**: Métodos que MUTAN (requieren copia `[...arr]` antes): `sort()`, `reverse()`, `splice()`, `push()`, `pop()`, `shift()`, `unshift()`, `fill()`, `copyWithin()`. Métodos que RETORNAN NUEVA COPIA (seguros directamente): `map()`, `filter()`, `slice()`, `concat()`, `flatMap()`, `reduce()` (siempre que el reducer no mute), `with()` (nuevo en ES2023, reemplazo inmutable de `splice`), `toSorted()`, `toReversed()`, `toSpliced()` (ES2023). React depende de la inmutabilidad porque compara referencias con `Object.is`.

**Por qué**: React compara estado anterior y nuevo con `Object.is` (same-value equality). Si usás `.sort()` directamente sobre el estado, la referencia es la misma y React no detecta el cambio. Con los nuevos métodos inmutables de ES2023 (`toSorted`, `toReversed`, `toSpliced`, `with`), podés escribir código inmutable más limpio:

```ts
// Antes (ES5+): const sorted = [...tasks].sort((a,b) => ...)
const sorted = tasks.toSorted((a, b) => b.createdAt - a.createdAt) // ES2023
```

TypeScript 5.7+ soporta estos métodos en `lib: "ES2023"`. Fuente: MDN Array methods, "ES2023 New Array Methods" en el blog de TC39, y la guía de inmutabilidad en React docs.

---

### 6. [Conectar] La clase usa `crypto.randomUUID()` para generar IDs. Investigá cómo librerías como `uuid` y `nanoid` manejan la generación de IDs con diferentes versiones de UUID (v1, v4, v7). ¿Qué es UUID v7 y por qué es preferible para bases de datos y listas ordenadas?

**Respuesta**: UUID v7 es una versión reciente (RFC 9562, 2024) que combina un timestamp Unix en milisegundos (48 bits) con bits aleatorios (74 bits). A diferencia de UUID v4 (totalmente aleatorio), v7 es "temporalmente ordenable": los IDs generados en orden cronológico son lexicográficamente ordenables. Esto es ideal para bases de datos (mejora índices B-tree) y para listas en React (ordenar por ID = ordenar por tiempo de creación sin necesitar campo `createdAt`).

**Por qué**: En bases de datos, los UUID v4 aleatorios causan fragmentación de índices porque se insertan en posiciones aleatorias. UUID v7, al tener timestamp en los bits más significativos, genera IDs que crecen monótonamente con el tiempo. En React, si tus tasks tienen `id: UUIDv7`, podés ordenarlas por ID (las más recientes tendrán IDs "mayores") sin necesitar `createdAt`. `crypto.randomUUID()` genera v4 (según spec). Para v7, necesitás una librería como `uuid` v9+ o `nanoid` (que no sigue spec UUID pero tiene propiedades similares). Fuente: RFC 9562 "Universally Unique Identifiers", "UUID v7 and the future of unique identifiers" en el blog de Vercel, y uuid documentation en npm.

---

### 7. [Conectar] La clase implementa búsqueda con `filter` e `.includes()`. Investigá cómo implementarías búsqueda "fuzzy" o "full-text" en el frontend con librerías como `fuse.js` o `lunr.js`. ¿Qué algoritmo usan y cuándo justifica su peso (~15KB) vs una simple búsqueda `.includes()`?

**Respuesta**: Fuse.js implementa búsqueda difusa (fuzzy) usando el algoritmo de Bitap (shift-and) con scoring basado en distancia de Levenshtein. Permite encontrar "cancion" buscando "kanción", ordenar resultados por relevancia, y buscar en múltiples campos con pesos. Lunr.js implementa índices invertidos (como motores de búsqueda como Solr/Elasticsearch pero en el navegador) con stemming, stop words, y TF-IDF. Justifican su peso cuando: (1) necesitás tolerancia a typos, (2) hay más de 500 items, (3) la búsqueda es sobre múltiples campos con diferentes pesos, (4) necesitás ordenar por relevancia.

**Por qué**: `.includes()` es O(n*m) simple y funciona para búsqueda exacta. Fuse.js es O(n*m*k) donde k es el threshold de distancia, dando resultados más inteligentes. Lunr.js construye un índice invertido upfront (costo de setup), y luego las búsquedas son O(log n) con scoring TF-IDF, ideal para búsqueda estilo "notas" o "documentación". Para TaskFlow con <100 tareas y títulos cortos, `.includes()` es suficiente. Para un catálogo de productos con descripciones largas y typos de usuarios, Fuse.js o Lunr.js son apropiados. Fuente: fusejs.io, lunrjs.com, y "Client-side Search in React" en el blog de Algolia.

---

### 8. [Cuestionar] La clase dice que usar índices como `key={index}` es incorrecto para listas dinámicas. Pero hay casos donde usar `index` como key es ACEPTABLE o incluso PREFERIBLE. ¿Cuáles son esos casos según la documentación de React y la comunidad? ¿Es este un dogma exagerado?

**Respuesta**: La documentación de React dice que usar índices como key es aceptable cuando: (1) la lista es estática y nunca cambia de orden, (2) los items no tienen IDs estables, (3) la lista nunca se filtra ni se reordena. También es preferible usar índice cuando el orden de los items ES la identidad (ej: mensajes de chat que se muestran en orden cronológico y nunca se reordenan — la posición en la lista ES su identidad). Erik Rasmussen (mantenedor de React Final Form) argumenta que el dogma de "nunca uses index" es una simplificación excesiva.

**Por qué**: El problema real no es el índice en sí, sino el cambio de identidad cuando los items se mueven. Si tenés `['a', 'b', 'c']` con keys 0,1,2 y eliminás 'b', React ve que key=0 sigue siendo 'a' (correcto), key=1 ahora es 'c' (antes era 'b'), y key=2 desapareció. Si los componentes tenían estado interno asociado a 'b', ese estado se transfiere a 'c'. Pero si la lista es append-only (solo se agregan items al final) y nunca se eliminan del medio, el índice funciona perfectamente. Dan Abramov confirmó en un issue de React que el índice es válido para listas append-only. Fuente: React docs "Lists and Keys", discusión en github.com/facebook/react/issues, y artículo "Index as a key is an anti-pattern? Not always" por Erik Rasmussen.

---

### 9. [Cuestionar] `crypto.randomUUID()` vs `nanoid` vs `uuid` generan debate sobre si incluir una dependencia externa para generar IDs. ¿Justifica 130 bytes de `nanoid` una instalación separada, o deberíamos usar `crypto.randomUUID()` que es nativo? ¿Qué criterios usan proyectos grandes como Vercel, Linear, o Notion?

**Respuesta**: `crypto.randomUUID()` es nativo, no requiere instalación, es criptográficamente seguro, y genera UUID v4 estándar. `nanoid` es más pequeño en output (21 chars vs 36), más rápido, y personalizable (alfabeto, tamaño). Proyectos como Vercel usan `nanoid` por el tamaño compacto (URLs más cortas). Linear usa UUID v7 para ordenamiento temporal. Notion usa su propio sistema de IDs. La decisión práctica: si tus IDs van en URLs, prefieren `nanoid` por ser más cortos. Si tus IDs son solo internos, `crypto.randomUUID()` es perfecto. La diferencia de 130 bytes de dependencia es insignificante comparada con el bundle total.

**Por qué**: El argumento de "no agregar dependencias" es válido pero debe sopesarse. `nanoid` tiene ~400M descargas semanales, es mantenido activamente, y no tiene dependencias propias. La ventaja real de `crypto.randomUUID()` es cero imports y disponibilidad en workers, Node, y navegadores. La ventaja de `nanoid` es control sobre el formato (podés tener IDs alfanuméricos sin guiones, más cortos) y velocidad. Para TaskFlow, `crypto.randomUUID()` es la elección correcta porque los IDs no se muestran en URLs. Fuente: npm trends comparando nanoid vs uuid, código fuente de ambos, y la discusión en el blog de Vercel sobre diseño de APIs de IDs.

---

### 10. [Cuestionar] `.sort()` y `.filter()` encadenados en cada render (incluso con `useMemo`) son el patrón idiomático de React. Sin embargo, frameworks como SolidJS o Svelte mantienen los datos ordenados/filtrados reactivamente sin re-ejecutar pipelines. ¿Es el enfoque de React fundamentalmente menos eficiente para listas grandes, o las optimizaciones como el React Compiler y Virtual Scrolling cierran la brecha?

**Respuesta**: El enfoque de React es fundamentalmente diferente: React re-ejecuta el componente completo (incluyendo pipelines de filter/sort) en cada render, mientras que SolidJS solo re-ejecuta las expresiones que dependen de señales que cambiaron. Esto significa que React hace más trabajo en cada actualización. Sin embargo, con el React Compiler, `useMemo`, y virtual scrolling, la brecha de performance es negligible en la práctica para la mayoría de aplicaciones. La diferencia solo importa en listas con >10,000 items y actualizaciones frecuentes (>30fps).

**Por qué**: El modelo de React es "la UI es una función del estado" — recalculás todo en cada frame. El modelo de SolidJS es "la UI es un grafo de dependencias reactivas" — solo recalculás lo que cambió. React compensa con: (1) memoización (manual o vía Compiler), (2) reconciler que minimiza cambios al DOM, (3) Fiber que permite interrumpir trabajo. En benchmarks como js-framework-benchmark, SolidJS es consistentemente más rápido que React en updates de listas grandes. Pero para el 95% de aplicaciones reales, la diferencia es imperceptible. La apuesta del equipo de React es que el Compiler cerrará la brecha sin cambiar el modelo de programación. Fuente: js-framework-benchmark por Stefan Krause, "React vs Solid performance" por Ryan Carniato, y análisis del React Compiler en React Conf 2024.
