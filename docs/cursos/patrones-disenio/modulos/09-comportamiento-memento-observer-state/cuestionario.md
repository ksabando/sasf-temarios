---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "CQRS con Event Sourcing" y cómo reformula el Observer tradicional? ¿Por qué los eventos se convierten en la fuente de verdad en lugar del estado actual?

**Respuesta**: En **Event Sourcing**, el estado actual de un aggregate NO se almacena — se almacenan los EVENTOS que lo cambiaron (`CuentaCreada`, `DineroDepositado`, `DineroRetirado`). El estado se reconstruye re-ejecutando los eventos. **Observer** se reformula porque en lugar de "notificar a los observers del nuevo estado", se PUBLICAN los eventos que causaron el cambio. Los observers (read side models, event handlers) reciben los eventos y actualizan sus propias proyecciones (vistas materializadas: `TablaCuentas`, `TablaTransacciones`). Esto es Observer + CQRS: el write side publica eventos; los read sides son Observers que construyen vistas optimizadas. La ventaja sobre Observer clásico: (a) los eventos son la fuente de verdad (auditable, replayable), (b) los Observers pueden ser agregados en cualquier momento (incluso años después) y reconstruir su estado desde el inicio del event stream, (c) el Observer clásico acopla al Subject con sus Observers (el Subject itera una lista); en Event Sourcing, los eventos van a un Event Store y los Observers los consumen de allí — desacople total.

**Por qué**: Greg Young acuñó Event Sourcing (2010) y lo integró con CQRS. Martin Fowler documentó Event Sourcing en 2005. La diferencia con Observer GoF (p. 293): Observer notifica el CAMBIO; Event Sourcing notifica el EVENTO que causó el cambio — más granular y replayable. Axon Framework implementa esto en Java: `@EventSourcingHandler` reconstruye el estado, `@EventHandler` actualiza las proyecciones (Observer moderno).

---

### 3. [Investigar] ¿Cómo implementan los Statecharts (David Harel, 1987) el patrón State de manera jerárquica y cómo se diferencian del State plano de GoF?

**Respuesta**: Los **Statecharts** (Harel, 1987) extienden State con: (1) **Jerarquía de estados**: un estado puede contener sub-estados (ej. `Reproduciendo` contiene `Adelantando`, `Rebobinando`, `EnPausa`), permitiendo que las transiciones de alto nivel se hereden, (2) **Ortogonalidad**: estados concurrentes (ej. un reproductor multimedia está simultáneamente en `ModoAudio` y `ModoEfectosVisuales`, cada uno con sus sub-estados), (3) **Historia**: memoria del último sub-estado activo dentro de un estado compuesto. GoF State es PLANO: una máquina de estados con N estados, cada uno con transiciones a otros. Statecharts son JERÁRQUICOS: reducen la explosión combinatoria de estados (3 modos - 4 estados de reproducción - 2 estados de volumen = 24 estados planos; Statecharts: 3 modos + 4 estados + 2 estados = 9 con jerarquía). Spring State Machine implementa Statecharts. UML 2.x State Machine Diagrams son Statecharts.

**Por qué**: David Harel (Weizmann Institute) creó Statecharts que luego fueron adoptados en UML (Rumbaugh, Booch, Jacobson). Spring State Machine (Janne Valkealahti) implementa Statecharts con estados jerárquicos, guardias, acciones de entrada/salida, y triggers de eventos. La diferencia: GoF State es suficiente para máquinas de estados simples (5-10 estados); Statecharts son necesarios para sistemas complejos (semaforización, workflows BPMN, protocolos de red).

---

### 4. [Investigar] ¿Qué son los "Phantom Types" y "Linear Types" (Rust) y cómo eliminan la necesidad del patrón State en tiempo de compilación?

**Respuesta**: Rust puede ELIMINAR State en runtime usando **el sistema de tipos para codificar el estado**: en lugar de `MaquinaExpendedora` con `estado: EstadoMaquina` que se chequea en runtime, definís `MaquinaEsperando`, `MaquinaConMoneda`, `MaquinaDispensando` como tipos distintos. Cada tipo expone solo los métodos VÁLIDOS para ese estado. Transicionar de `MaquinaEsperando` a `MaquinaConMoneda` CONSUME el valor anterior (move semantics) y produce un nuevo valor de tipo diferente. Esto garantiza en TIEMPO DE COMPILACI—N que no podés llamar a `dispensar()` en estado `Esperando` — el compilador rechazaría el código. Zero runtime checks. Esto es el patrón **Type State** (Strom, Yemini, 1986) combinado con ownership de Rust. En Java, esto no es posible porque Java no tiene move semantics ni tipos lineales. En Java 21 sealed types + pattern matching se aproximan, pero el estado aún se chequea en runtime.

**Por qué**: Rust community (Niko Matsakis, Aaron Turon) promueve "make invalid states unrepresentable." El Typestate Pattern en Rust elimina el patrón State de GoF porque el compilador se convierte en el guardián de transiciones. Esto es Norvig extremo: el lenguaje ABSORBE el patrón a nivel de sistema de tipos. Haskell puede hacerlo con Phantom Types + GADTs. La lección: State como patrón OO es un workaround para lenguajes sin tipos dependientes.

---

### 5. [Conectar] La clase menciona que `java.util.Observer` fue deprecado. Conectá esto con la API `Flow` (Java 9 Reactive Streams): ¿cómo `Flow.Publisher`/`Flow.Subscriber` implementan Observer moderno con backpressure?

**Respuesta**: `java.util.concurrent.Flow` (JEP 266, Java 9) implementa **Observer con backpressure**. `Flow.Publisher<T>` es el Subject moderno: expone `subscribe(Subscriber<? super T>)`. `Flow.Subscriber<T>` es el Observer moderno: expone `onNext(T item)`, `onError(Throwable)`, `onComplete()`. La innovación clave: **backpressure**. El Subscriber llama a `subscription.request(n)` para decir "estoy listo para recibir N elementos". El Publisher NO envía más de N elementos hasta que el Subscriber pida más (`request(n)` de nuevo). Esto resuelve la crítica fundamental contra el Observer de GoF: si el Subject es más rápido que el Observer, el Observer se ahoga. Con backpressure, el Observer controla el flujo. `Flow` es la base de Project Reactor (Spring) y RxJava. Es Observer GoF maduro para el mundo reactivo: asíncrono, con control de flujo, y con señales de terminación/error.

**Por qué**: Reactive Streams Specification (2015) fue resultado de colaboración entre Netflix (RxJava), Pivotal (Reactor), y Red Hat. Doug Lea (java.util.concurrent) integró la API `Flow` como parte de Java 9. La diferencia con `java.util.Observer`: (a) backpressure, (b) tipado genérico (`Flow.Subscriber<T>` vs `Observer.update(Observable, Object)`), (c) señales de error y completitud, (d) asíncrono por diseño. Spring WebFlux usa `Flux<T>`/`Mono<T>` que implementan `Flow.Publisher<T>`.

---

### 6. [Conectar] La clase implementa undo/redo con Memento. Conectá esto con Git internals: ¿cómo Git implementa Memento a nivel de sistema de archivos con objetos, trees y commits?

**Por qué**: Linus Torvalds diseñó Git en 2005 como "content-addressable filesystem." Scott Chacon ("Pro Git") explica la arquitectura de objetos. Git es Memento aplicado a nivel de sistema de archivos: cada commit es un snapshot completo (Memento), y los trees + blobs son sub-mementos jerárquicos. La diferencia con el Memento de la clase: Git es content-addressable (el Memento se identifica por hash del contenido, no por ID secuencial), y es persistente (los Mementos no desaparecen al cerrar la app).

---

### 7. [Conectar] La clase presenta State con la máquina expendedora. Conectá esto con `useReducer` de React: ¿cómo un reducer es una implementación funcional del patrón State?

**Respuesta**: `useReducer` implementa State de manera funcional: (1) `state` es el Contexto (el estado actual, inmutable), (2) `dispatch(action)` es el método para transicionar (equivalente a `estado.insertarMoneda()`), (3) el `reducer(state, action) => newState` es la lógica de transición centralizada (en GoF, distribuida en cada clase State). La diferencia: en GoF State, cada estado es una CLASE con métodos; en `useReducer`, el reducer es una FUNCI—N con `switch(action.type)`. El reducer decide el siguiente estado basándose en el estado ACTUAL + la acción. Esto es más simple para máquinas de estados con < 10 estados y lógica secuencial. Pero para lógica compleja con acciones condicionales (transiciones con guardias, entry/exit actions), `useReducer` se vuelve un switch anidado frágil y State GoF o Statecharts son superiores.

**Por qué**: React hooks introdujeron `useReducer` en 16.8 (2019). Es el patrón State reducido a su esencia: `(state, action) => state`. Dan Abramov explicó que `useReducer` es preferible a `useState` cuando el estado siguiente depende del estado anterior de manera compleja o cuando hay múltiples sub-valores que cambian juntos. La diferencia con GoF: GoF State encapsula comportamiento por ESTADO; `useReducer` centraliza comportamiento por ACCI—N. Son enfoques duales del mismo problema.

---

### 8. [Cuestionar] ¿Es Memento realmente necesario en la era de estructuras de datos persistentes (immutables)? Si todos los objetos son inmutables, ¿no tenés Memento gratis? ¿Por qué Clojure/Haskell casi no mencionan Memento?

**Por qué**: Rich Hickey (creador de Clojure) diseñó Clojure con persistent data structures (basadas en Phil Bagwell's HAMT). En Clojure, "Memento" no es un patrón — es un valor. El estado es una sucesión de valores inmutables. Redux en JavaScript sigue el mismo principio: el state es un árbol inmutable, y el "time-travel debugging" es simplemente pasar de un valor a otro. Memento es, irónicamente, un patrón para lidiar con la mutabilidad que lenguajes inmutables resuelven a nivel de runtime.

---

### 9. [Cuestionar] ¿Es State realmente diferente de Strategy? El diagrama UML es idéntico. ¿No es State simplemente Strategy donde la estrategia se cambia a sí misma?

**Respuesta**: La diferencia es de **intención y control**, pero la frontera es difusa. **Strategy**: el CLIENTE o una FACTORY EXTERNA decide qué estrategia usar. La estrategia no sabe que existen otras estrategias. El contexto no cambia de estrategia; la estrategia es pasiva. **State**: el ESTADO MISMO decide la transición al siguiente estado. Los estados se conocen entre sí (instancian el siguiente estado). El contexto no elige; los estados se auto-transicionan. La diferencia práctica: si ves `this.context.setEstado(new EstadoX())` dentro de un estado, es State. Si ves `new Context(new EstrategiaX())` desde afuera, es Strategy. Pero hay grises: Strategy puede cambiarse en runtime desde afuera; State puede cambiarse desde el contexto basado en eventos externos. La distinción es didáctica y útil para comunicar intención, pero en código las implementaciones pueden converger. GoF (p. 309) comparan: "State objects are often Singletons; Strategies are rarely Singletons."

**Por qué**: GoF dedican una sección a compararlos. En la práctica, muchos usan "State" y "Strategy" intercambiablemente. La diferencia es el contrato: en State, el contrato dice "el objeto cambia su clase (comportamiento)"; en Strategy, el contrato dice "el objeto usa un algoritmo intercambiable." Son dos lados de la misma moneda UML con diferente historia de uso.

---

### 10. [Cuestionar] ¿Por qué `@EventListener` de Spring es superior a implementar Observer manualmente, pero también crea acoplamiento al framework? ¿Hay espacio para Observer manual en 2026?

**Respuesta**: `@EventListener` es superior porque: (a) **descubrimiento automático**: Spring escanea beans y registra listeners — no necesitás `addObserver()` manual, (b) **tipado seguro**: `@EventListener public void onPedidoCreado(PedidoCreadoEvent e)` — el evento es tipado, no `Object`, (c) **transaccional**: `@TransactionalEventListener` se ejecuta en fase específica de transacción (AFTER_COMMIT), evitando notificar antes de que el cambio persista, (d) **asíncrono**: `@Async @EventListener` delega a un executor. El acoplamiento al framework es REAL: si querés usar Spring Events fuera de Spring, no podés. Pero en 2026, ¿cuántos proyectos Java no usan Spring o Micronaut? Menos del 5%. **Observer manual** tiene sentido en: (1) librerías que deben ser framework-agnostic (no querés depender de Spring), (2) sistemas embebidos o de bajo nivel (Android, aplicaciones CLI), (3) cuando el Subject y los Observers están en el mismo paquete y el acoplamiento es explícito y deseado. La regla: si ya usás Spring, usá `@EventListener`. Si estás escribiendo una librería open-source, implementá Observer manual con `List<Listener>`.

**Por qué**: Spring Events (Juergen Hoeller, 2004) fueron una de las primeras features del framework. Hoy son ubicuos en proyectos Spring. Pero la lección de `java.util.Observer` deprecado es: no ates tu modelo de eventos a una implementación del JDK que puede volverse obsoleta. Por eso, definir tus propias interfaces `EventListener` y `EventPublisher` es más portable que depender de Spring Events directamente — Spring Events quedan como capa de infraestructura.

