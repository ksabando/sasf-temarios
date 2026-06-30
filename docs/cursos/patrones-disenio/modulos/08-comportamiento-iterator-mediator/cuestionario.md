---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] Investigá el patrón "Event Bus" (o "Message Bus") y su relación con Mediator. ¿En qué se diferencia un Event Bus de un Mediator GoF puro?

**Respuesta**: Un **Event Bus** (Google Guava EventBus, Spring ApplicationEventPublisher, Vert.x EventBus) es una evolución de Mediator que desacopla COMPLETAMENTE a los colegas: (1) en Mediator GoF, los colegas conocen al Mediador (`mediador.notificar(this, evento)`) y el Mediador conoce a TODOS los colegas; en Event Bus, los publicadores y suscriptores NO se conocen entre sí ni conocen el bus — solo anotan métodos con `@Subscribe`/`@EventListener`, (2) Event Bus soporta múltiples suscriptores por tipo de evento y un suscriptor puede escuchar múltiples tipos de eventos — más flexible que la notificación dirigida del Mediator, (3) Event Bus típicamente soporta threading policies (síncrono, asíncrono, en un EventLoop) mientras que Mediator GoF es síncrono por defecto, (4) Event Bus maneja jerarquía de eventos (si publicás `PedidoCreadoEvent extends PedidoEvent extends ApplicationEvent`, los suscriptores de `PedidoEvent` también reciben `PedidoCreadoEvent`).

**Por qué**: Google Guava EventBus (2009) fue creado por el equipo de Google (Kevin Bourrillion). Spring `ApplicationEventPublisher` es un Event Bus. Guava EventBus usa anotaciones `@Subscribe` con dispatch síncrono por defecto. La diferencia con Mediator GoF: Mediator es un intermediario CONOCIDO y EXPLÍCITO; Event Bus es un intermediario INVISIBLE y DECLARATIVO. En microservicios, message brokers (RabbitMQ, Kafka) son Event Buses distribuidos — el Mediador se convierte en infraestructura.

---

### 3. [Investigar] ¿Qué es un "Generator" en Python/JavaScript y cómo se relaciona con el patrón Iterator? ¿Por qué los generators hacen obsoleta la implementación manual de Iterator en estos lenguajes?

**Respuesta**: Un **Generator** es una función que produce una secuencia de valores usando `yield` y mantiene su estado entre invocaciones. En Python: `def fibonacci(): a, b = 0, 1; while True: yield a; a, b = b, a + b`. En JavaScript: `function* fibonacci() { let a=0, b=1; while(true) { yield a; [a, b] = [b, a+b]; } }`. Los generators hacen obsoleta la implementación manual de Iterator porque: (1) la función generadora automáticamente implementa `Iterable` e `Iterator` — el runtime crea el objeto iterador con su estado encapsulado, (2) `yield` pausa y reanuda la ejecución, eliminando la necesidad de una máquina de estados manual (el `Stack` del `IteradorInOrder` de la clase), (3) la lógica se lee como un loop normal, no como un autómata finito. Para el árbol binario de la clase: `function* inOrder(node) { if (node) { yield* inOrder(node.left); yield node.value; yield* inOrder(node.right); } }` — 4 líneas vs 30 líneas de `IteradorInOrder` en Java.

**Por qué**: Python generators (PEP 255, Neil Schemenauer, 2001) y JavaScript generators (ES6/ES2015) trajeron corrutinas a lenguajes mainstream. En Python 3, `__iter__()` puede ser un generator (`yield from`). Esto valida nuevamente a Norvig: los patrones desaparecen en el lenguaje. Java no tiene `yield` nativo — el JEP sobre virtual threads (Loom, Java 21) y `SequenceCollection` (Java 21) acercan a Java pero sin `yield` sintáctico.

---

### 4. [Investigar] ¿Qué es el patrón "CQRS" (Command Query Responsibility Segregation) y cuál es su relación con Mediator? ¿Por qué muchas implementaciones de CQRS usan un Mediator como `IMediator` en .NET o `CommandBus` en Java?

**Respuesta**: **CQRS** (Greg Young, 2010) separa las operaciones de LECTURA (queries) de las de ESCRITURA (commands). Esto facilita usar diferentes modelos y bases de datos optimizadas para cada operación. CQRS frecuentemente usa un **Mediator** (o Command Bus/Query Bus) como punto central de despacho: el cliente envía un `Command` o `Query` al `Mediator`, y el Mediator lo rutea al `CommandHandler` o `QueryHandler` correspondiente. ¿Por qué Mediator? (1) Desacopla al emisor del receptor: el controller no sabe qué handler implementa `CreateOrderCommand` — el Mediator lo resuelve, (2) permite añadir cross-cutting concerns (validación, logging, autorización) mediante behaviors/pipelines alrededor del Mediator (Decorator sobre Mediator), (3) en .NET, MediatR (Jimmy Bogard) popularizó esta arquitectura con `IMediator.Send(command)`. En Java, Axon Framework usa `CommandGateway.send(command)` y `QueryGateway.query(query)` como Mediator.

**Por qué**: Greg Young acuñó CQRS en 2010. Jimmy Bogard creó MediatR en 2015, implementando Mediator con pipelines de behaviors. La arquitectura: Controller → Mediator → Handler. El Mediator es el único punto de acoplamiento; los handlers son plugins independientes y testeables aisladamente. Axon Framework (Allard Buijze, 2010) implementa CQRS + Event Sourcing con `CommandBus` y `QueryBus` como Mediadores. Spring Modulith (2023) usa `ApplicationEventPublisher` como Mediator para eventos entre módulos.

---

### 5. [Conectar] La clase implementa un iterador in-order para árbol binario. Conectá esto con `java.util.Spliterator` (Java 8+): ¿cómo `Spliterator` extiende Iterator para soportar paralelismo y qué patrones adicionales usa?

**Respuesta**: `Spliterator<T>` (splittable iterator) extiende Iterator con capacidades de **división recursiva para paralelismo**. Además de Iterator (`tryAdvance(Consumer)`, `forEachRemaining(Consumer)`), expone `trySplit()` que devuelve un nuevo `Spliterator` cubriendo una porción de los elementos, permitiendo que el trabajo se divida recursivamente y se procese en paralelo (`parallelStream()`). Patrones adicionales: (1) **Composite**: un `Spliterator` puede dividirse en sub-Spliterators que juntos cubren toda la colección — estructura de árbol de iteradores, (2) **Strategy**: `characteristics()` retorna flags (`SIZED`, `ORDERED`, `DISTINCT`, `IMMUTABLE`) que permiten al framework optimizar la estrategia de división, (3) **Flyweight**: no crea nuevos iteradores completos — crea vistas livianas sobre sub-rangos del array/estructura subyacente. Para el árbol binario de la clase, un `Spliterator` permitiría que `parallelStream()` divida el árbol en sub-árboles y los procese concurrentemente.

**Por qué**: `Spliterator` fue diseñado por Brian Goetz (Java Language Architect) y Doug Lea (java.util.concurrent) para Java 8 Streams. Es Iterator + Divide-and-Conquer. La división recursiva (fork/join) convierte un Iterator secuencial en un pool de iteradores paralelos. `ArrayList.Spliterator` tiene `SIZED | SUBSIZED | ORDERED` (puede dividirse eficientemente porque conoce el tamaño exacto y la estructura de array). `HashSet.Spliterator` tiene `DISTINCT | SIZED` pero no `ORDERED`.

---

### 6. [Conectar] La clase usa un chat como ejemplo de Mediator. Conectá esto con WebSockets y `SimpMessagingTemplate` de Spring: ¿cómo Spring implementa Mediator para comunicación en tiempo real?

**Por qué**: Spring WebSocket (Rossen Stoyanchev, 2013) implementa STOMP sobre WebSocket. El `SimpleBroker` o `StompBrokerRelay` son Mediadores que enrutan mensajes por destino. En la arquitectura de chat de la clase, `SalaChatConcreta` es el Mediador síncrono local; en producción, ese Mediador sería un message broker distribuido (RabbitMQ, Redis Pub/Sub, Apache Kafka) para soportar múltiples instancias del servidor.

---

### 7. [Conectar] La clase menciona que `DispatcherServlet` NO es un Mediator puro. Conectá esto con el patrón "Front Controller" (Core J2EE Patterns): ¿cómo Front Controller se relaciona con Mediator y Command?

**Por qué**: Core J2EE Patterns (Alur, Crupi, Malks, 2001) define Front Controller. Spring `DispatcherServlet` es su implementación canónica. GoF no incluyen Front Controller porque es un patrón web, no de diseño OO general. La diferencia clave: Mediator reduce acoplamiento ENTRE COLEGAS; Front Controller centraliza el punto de entrada. Son patrones con formas similares pero intenciones diferentes.

---

### 8. [Cuestionar] ¿Es `java.util.Iterator.remove()` un error de diseño? La mayoría de las implementaciones lanzan `UnsupportedOperationException`. ¿Por qué el JDK no eliminó este método en Java 8+?

**Por qué**: Brian Goetz (Java Language Architect) discutió esto en "Java Language Design" (2016): `remove()` fue una mala decisión pero es parte del contrato de `Iterator` que millones de clases implementan. Removerlo rompería la compatibilidad binaria. Java 8 introdujo `default` methods como mecanismo de evolución de interfaces, y `remove()` fue uno de los ejemplos de "método que debió ser default desde el inicio pero no existía el mecanismo en 1998." `Collection.removeIf()` usa internamente `Iterator.remove()` si la colección lo soporta, o crea una nueva colección filtrada.

---

### 9. [Cuestionar] La clase dice que Mediator "reduce dependencias directas entre objetos". Pero críticos argumentan que solo MUEVE el acoplamiento al Mediator, creando un God Object. ¿Cuándo el trade-off es favorable?

**Por qué**: GoF (p. 279) advierten explícitamente este trade-off. Martin Fowler en "Patterns of Enterprise Application Architecture" describe el anti-patrón "God Class Mediator". En Spring, `ApplicationEventPublisher` es un Mediator que solo rutea (no procesa lógica). En React, `useReducer` es un Mediator controlado (el reducer es una función pura pequeña). La clave es que el Mediador conozca el "quién" (a quién notificar) pero no el "cómo" (cómo cada colega responde).

---

### 10. [Cuestionar] ¿Deberías usar Mediator (MediatR, CommandBus) en un proyecto pequeño de 3 servicios o es sobre-ingeniería? ¿Dónde está el punto de corte?

**Respuesta**: En un proyecto de **3 servicios con 10 endpoints**, Mediator (MediatR, CommandBus) es **sobre-ingeniería**. El punto de corte es: (1) **Número de handlers**: si tenés menos de 20 handlers (commands + queries), el dispatch directo (inyectar el handler por constructor) es más simple y mantenible, (2) **Cross-cutting concerns**: si necesitás logging, validación, transacciones en CADA handler, un Mediator con pipeline behaviors empieza a justificarse (evitás duplicar try-catch-log en 20 handlers), (3) **Número de developers**: si el equipo tiene 5+ developers, Mediator como convención ("toda request pasa por Mediator") reduce decisiones de diseño, (4) **Cambios futuros esperados**: si el roadmap incluye migrar a microservicios o CQRS, Mediator como abstracción facilita la transición. Regla heurística: empezá con inyección directa de handlers (constructor DI). Cuando tengas 3+ cross-cutting concerns duplicadas, o necesites desacoplar el controller del handler (ej. para enviar comandos desde múltiples entry points), refactorizá a Mediator. No empieces con MediatR en el sprint 0.

**Por qué**: Jimmy Bogard (creador de MediatR) mismo dijo en NDC 2018: "Don't use MediatR just because. Use it when you need the pipeline behaviors." Martin Fowler en "YAGNI" enfatiza construir solo lo que necesitás AHORA. En proyectos enterprise, Mediator emerge naturalmente alrededor del sprint 5-10 cuando la complejidad justifica la abstracción. En un microservicio con 3 endpoints (CRUD básico), Controller → Service → Repository es suficiente. Mediator brillaría en un sistema con 50+ handlers, comandos desde UI y mensajes Kafka, y necesidades de logging/validación/métricas transversales.

