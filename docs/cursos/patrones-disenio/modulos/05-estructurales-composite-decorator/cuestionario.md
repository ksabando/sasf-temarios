---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué son los "Higher-Order Components" (HOC) en React y cómo implementan el patrón Decorator de manera funcional? ¿Por qué cayeron en desuso frente a hooks?

**Por qué**: Los HOCs fueron popularizados por React y Redux (`connect()`). Dan Abramov (co-creador de Redux) escribió en 2015 "Mixins Are Dead. Long Live Composition" defendiendo HOCs. Pero en 2019, el equipo de React introdujo hooks explícitamente para reemplazar HOCs y Render Props. En 2026, los HOCs sobreviven en código legacy pero ningún proyecto nuevo debería crearlos — hooks + custom components son el Decorator funcional moderno.

---

### 3. [Investigar] ¿Cómo implementa LINQ en C# el patrón Decorator a través de extension methods y `IEnumerable<T>`? Compará con los decoradores de `java.io.InputStream`.

**Por qué**: LINQ fue diseñado por Erik Meijer (Microsoft, padre de Reactive Extensions) en 2007. La arquitectura de LINQ como "Decorator chain sobre iteradores lazy" es uno de los usos más elegantes del patrón. Java Stream API (Java 8) replicó este modelo: `stream.filter().map().sorted()` es Decorator con lazy evaluation. La diferencia es que Java Streams son "consumibles una vez", mientras que .NET `IEnumerable` es reutilizable.

---

### 4. [Investigar] ¿Qué relación existe entre el patrón Composite y el algoritmo de Reconciliation de React (Virtual DOM diffing)? ¿El reconciliation es un Visitor?

**Respuesta**: React Reconciliation recorre el árbol del Virtual DOM (Composite) comparando el árbol anterior con el nuevo y aplicando los cambios mínimos al DOM real. El algoritmo NO es un Visitor puro, sino un **Composite recursivo + diff**. El reconciler visita cada nodo del árbol (como Visitor), pero en lugar de aplicar una operación externa, DETERMINA si el nodo se reutiliza, actualiza o destruye basándose en su tipo y key. Específicamente: (1) recorre el Composite en profundidad (depth-first), (2) en cada nivel, compara secuencialmente los hijos por posición e intenta hacer match por `key` (estado extrínseco de Flyweight), (3) decide si `updateDOMProperties()`, `createNewInstance()`, o `destroy()`. La diferencia con Visitor: el Visitor es una operación EXTERNA inyectada; el reconciler es una operación FIJA del framework que el desarrollador no puede reemplazar. Es más cercano a Composite + Strategy (el diff algorithm es configurable — React 16+ usa Fiber, React 15 usaba Stack reconciler).

**Por qué**: El equipo de React (Dan Abramov, Andrew Clark) documentó el reconciliation en "Reconciliation — React Docs." No usan el lenguaje de patrones, pero la estructura es Composite + Diff. Fiber (React 16, 2017) convirtió el recorrido síncrono de Composite en un recorrido pausable y priorizable, implementando `requestIdleCallback` — esto trasciende Composite pero la base estructural sigue siendo el árbol de componentes.

---

### 5. [Conectar] La clase muestra Composite con sistema de archivos. Conectá esto con GraphQL: explicá cómo una query GraphQL genera un árbol Composite en el resolver y cómo se relaciona con el patrón Composite.

**Respuesta**: Una query GraphQL como `{ usuario { nombre posts { titulo autor { nombre } } } }` es un árbol Composite. El resolver construye recursivamente la respuesta: `usuario` es un Composite que contiene `nombre` (Leaf, valor escalar) y `posts` (Composite que contiene `titulo` Leaf y `autor` Composite que contiene `nombre` Leaf). Cada field en el schema GraphQL puede ser Leaf (Scalar: String, Int, Boolean) o Composite (Object type con sub-fields). El engine de GraphQL (Apollo, GraphQL-Java) recorre este árbol como un Composite: para cada nodo compuesto, llama a su resolver; para cada hoja, retorna el valor escalar. La optimización clave (DataLoader) resuelve el problema N+1 en Composite: en lugar de iterar los hijos recursivamente haciendo una query por hijo, batcha todas las queries del mismo nivel y las ejecuta en una sola llamada — esto es una optimización del recorrido de Composite.

**Por qué**: La especificación GraphQL (Lee Byron, Dan Schafer, Facebook, 2015) define "field resolution" como proceso recursivo. En GraphQL-Java, `ExecutionStrategy` implementa el recorrido de Composite: `resolveField()` para campos compuestos, `completeValue()` para escalares. DataLoader (Facebook, 2015) es el batching para Composite: en lugar de `for (hijo: hijos) { repo.findById(hijo.id) }` (N+1), hacés `repo.findByIds(hijos.map(h => h.id))` (1 query).

---

### 6. [Conectar] La clase presenta `BufferedInputStream` como Decorator. Conectá esto con el patrón Middleware en Express.js/Koa/ASP.NET Core: ¿cómo estos frameworks implementan Decorator a través de pipelines de middlewares?

**Respuesta**: Express.js/Koa/ASP.NET Core implementan Decorator como un **pipeline de middlewares**: cada middleware recibe un `next` function (el siguiente decorator) y puede: (1) ejecutar código ANTES de llamar a `next()` (pre-decoration), (2) llamar a `next()` para delegar en el siguiente middleware (equivalente a `super.operacion()` en Decorator), (3) ejecutar código DESPU?S de que `next()` retorna (post-decoration). La cadena `app.use(logger); app.use(auth); app.use(router);` construye la cadena de decorators. La diferencia con Java I/O: (a) en Java, la cadena se construye en tiempo de construcción del objeto (`new AuthStream(new LoggerStream(baseStream))`); en Express, se construye en tiempo de configuración y se ejecuta en tiempo de request, (b) Express usa funciones + closures en lugar de objetos + herencia, (c) Express permite que el middleware NO llame a `next()` (cortocircuito), lo cual acerca el pipeline a Chain of Responsibility — de hecho, Express es un híbrido Decorator/Chain.

**Por qué**: TJ Holowaychuk (creador de Express) no usó el término "Decorator", pero la comunidad reconoce la estructura. Douglas Crockford describió el middleware de Express como "Russian doll pattern" (muñecas rusas, 2010). ASP.NET Core middleware (David Fowler, Microsoft) sigue exactamente el mismo patrón: `app.UseAuthentication(); app.UseAuthorization(); app.UseEndpoints();`. La diferencia es que ASP.NET llama explícitamente a esto "middleware pipeline" y es consciente del patrón.

---

### 7. [Conectar] La clase advierte sobre "sobre-decoración" (20 decorators apilados). Conectá esto con el problema de "Deep Middleware Chains" en arquitecturas serverless: ¿cómo afecta la latencia y cómo lo resuelven patrones como Lambda Layers?

**Respuesta**: En serverless (AWS Lambda), cada middleware agrega latencia de ejecución cold start y warm invocation. Una cadena de 20 middlewares (logging, validación, auth, deserialización, enriquecimiento, rate limiting, feature flags, etc.) puede duplicar la latencia de una función que solo necesita ejecutar lógica de negocio. El problema se agrava en cold starts porque cargar 20 módulos de middleware inicializa 20 closures y sus dependencias. **Lambda Layers** mitigan esto: extraen middlewares comunes a una Layer compartida (un ZIP en /opt) que se carga una vez y se reutiliza entre funciones. **Lambda PowerTools** (AWS) implementan Decorator con anotaciones/middlewares optimizados que evitan el wrapping manual. **Middleware-as-code** (Middy.js, Lambda Powertools Python): en lugar de 20 wrappers anidados, declarás un array de middlewares y el framework los compone eficientemente en un solo wrapper.

**Por qué**: AWS Lambda docs recomiendan minimizar la profundidad de wrappers para reducir cold start. Yan Cui (AWS Serverless Hero, autor de "Production-Ready Serverless") cuantificó que cada middleware wrapper agrega ~5-10ms en warm invocations y ~50-100ms en cold starts (por carga de módulos). Lambda Powertools Python (Heitor Lessa, AWS) implementa "idempotency middleware", "tracing middleware", "metrics middleware" usando Decorator pero con lazy loading y optimizaciones.

---

### 8. [Cuestionar] ¿Violó React el principio de "composición sobre herencia" con las clases `React.Component`? ¿Fue `React.Component` un Template Method mal diseñado?

**Respuesta**: `React.Component` es un **Template Method** con hooks de ciclo de vida: `render()` es el paso abstracto; `componentDidMount()`, `componentDidUpdate()`, `componentWillUnmount()` son hooks opcionales que el framework llama en momentos específicos. React violó intencionalmente "composición sobre herencia" porque en 2013-2015 la herencia era necesaria para que el framework pudiera controlar el ciclo de vida del componente. Los hooks (2019) fueron la corrección de este "pecado original": con hooks, no heredás de `React.Component` — usás funciones puras y hooks como `useEffect` que implementan el mismo concepto (efectos en momentos del ciclo de vida) pero con composición de funciones en lugar de herencia de clases. El patrón resultante es **Strategy + Observer**: el componente es una función, los hooks son estrategias de comportamiento, y React internamente usa Observer para re-renderizar cuando el estado cambia.

**Por qué**: Dan Abramov explicó en React Conf 2018 ("Why Hooks?"): las clases confundían a desarrolladores y máquinas (minifiers, optimizadores). El `this.state` mutable y la necesidad de `bind` manual eran fuentes de bugs. Los hooks son la respuesta de la comunidad funcional a Template Method: en lugar de que el framework llame a tus métodos de ciclo de vida (inversión de control), vos llamás a hooks del framework (control directo). Es un cambio de Template Method a Strategy.

---

### 9. [Cuestionar] Algunos críticos argumentan que el patrón Composite es "demasiado genérico" y que forzar una interfaz común entre hojas y compuestos viola el principio de Interface Segregation. ¿Cuándo es Composite el patrón equivocado?

**Respuesta**: Composite es equivocado cuando las hojas y los compuestos tienen comportamientos fundamentalmente diferentes que no pueden unificarse en una interfaz común sin hacks. Ejemplos: (1) Un sistema de archivos donde `File` tiene `getExtension()` y `getMimeType()`, pero `Directory` no. Si forzás `getExtension()` devolviendo `null` o lanzando `UnsupportedOperationException`, violaste ISP. (2) Un menú de restaurante donde `Plato` tiene `getPrecio()` pero `SeccionMenu` también tiene `getPrecio()` con semántica diferente (suma vs valor fijo) — el cliente debe saber cuál es cuál. (3) Un organigrama donde `Empleado` y `Departamento` comparten `getSalario()`, pero `Empleado.getSalario()` retorna su salario y `Departamento.getSalario()` retorna la SUMA de salarios — son operaciones con distinta carga semántica. En estos casos, separar `Leaf` y `Composite` en jerarquías distintas con Visitor para operaciones recursivas es más limpio que forzar Composite.

**Por qué**: GoF (p. 167) advierten: "Making the Composite and Leaf classes implement all the operations... can make the design too general." La comunidad de OOP enseñó Composite como "el patrón para árboles" sin enfatizar el trade-off ISP. Sandi Metz ("Practical Object-Oriented Design in Ruby") dice: "Don't abstract unknown futures. Wait for the pattern to emerge from the code." Aplicar Composite antes de tener al menos 3 niveles de profundidad y operación recursiva genuina es sobre-ingeniería.

---

### 10. [Cuestionar] ¿Es `Collections.synchronizedList()` realmente un Decorator? El método `synchronizedList` retorna una lista que no solo "decora" sino que CAMBIA las garantías de thread-safety. ¿No es esto más cercano a un Proxy de Protección?

**Respuesta**: Es un **Decorator**, no Proxy de Protección, porque AGREGA responsabilidad (sincronización) manteniendo la misma interfaz (`List`). Proxy de Protección DENIEGA acceso basado en permisos; `synchronizedList` no deniega — sincroniza. La confusión surge porque la sincronización es una forma de "protección" contra acceso concurrente, pero: (a) no verifica identidad o permisos (cualquiera puede llamar), (b) no oculta la existencia del objeto real (el cliente sabe que es una lista sincronizada), (c) no introduce un surrogate — la lista envuelta sigue siendo accesible si alguien tiene la referencia original (por eso la documentación dice que debés descartar la referencia original). Además, la sincronización es una responsabilidad ADICIONAL que se agrega al comportamiento base de `ArrayList`, no un control de acceso. Si fuera Proxy, tendrías diferentes niveles de acceso (lectura siempre, escritura solo para admin), y eso no es lo que hace.

**Por qué**: GoF (p. 216) distinguen Decorator de Proxy por intención: Decorator agrega responsabilidades, Proxy controla acceso. `synchronizedList` agrega la responsabilidad "ser thread-safe" sobre una lista no thread-safe. Joshua Bloch en Effective Java Item 18 recomienda `synchronizedList` y lo describe como "wrapper" (Decorator). La documentación oficial de `Collections.synchronizedList` dice: "Returns a synchronized (thread-safe) list backed by the specified list" — la palabra "backed by" es consistente con Decorator.

