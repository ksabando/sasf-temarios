---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué relación tiene la arquitectura de Christopher Alexander con los patrones GoF y qué aspecto crucial de la teoría original de Alexander se perdió en la traducción al software?

**Respuesta**: Christopher Alexander desarrolló "A Pattern Language" (1977) para arquitectura de edificios, definiendo 253 patrones interconectados que resuelven problemas a diferentes escalas (desde "cómo diseñar una ciudad" hasta "cómo iluminar una habitación"). Los GoF tomaron prestado el concepto de "problema recurrente + solución probada + nombre compartido", pero perdieron dos aspectos cruciales: (1) **generatividad**: los patrones de Alexander no son un catálogo para elegir — son reglas que, aplicadas secuencialmente, generan el diseño completo. Los GoF presentan un catálogo a la carta, no un proceso generativo; (2) **contexto moral y calidad sin nombre**: Alexander vinculaba sus patrones a una "qualitas" — la cualidad de un espacio que hace que la gente se sienta viva. Los GoF eliminaron esta dimensión, reduciendo los patrones a soluciones técnicas sin juicio de valor sobre cuándo el resultado es "bueno".

**Por qué**: Richard Gabriel (co-autor de GoF con Gamma, Helm, Johnson y Vlissides) escribió extensamente sobre esto en "Patterns of Software". Alexander mismo criticó la adaptación al software en su keynote de OOPSLA 1996, diciendo que los patrones de software eran "pálidas imitaciones" porque carecían del componente generativo y moral. La comunidad de patrones posterior (PLoP conferences) intentó recuperar estos aspectos con "pattern languages" generativos (ej. patrones para organizaciones de desarrollo ágil de Jim Coplien). El libro original "The Timeless Way of Building" de Alexander es la fuente que explica el concepto generativo.

---

### 3. [Investigar] ¿Qué son los "Patterns of Enterprise Application Architecture" de Martin Fowler y en qué se diferencian fundamentalmente de los patrones GoF?

**Respuesta**: Los PoEAA de Fowler (2002) abordan patrones a nivel de **arquitectura empresarial** (cómo organizar capas, acceder a bases de datos, manejar sesiones web), mientras los GoF (1994) abordan patrones a nivel de **diseño de clases y objetos** (cómo organizar clases para resolver problemas de diseño OO). PoEAA incluye patrones inexistentes en GoF: Repository, Unit of Work, Data Mapper, Active Record, Table Module, Service Layer, MVC, Front Controller, Gateway. La diferencia fundamental es el nivel de abstracción: GoF opera dentro de un proceso; Fowler opera entre procesos, bases de datos, y capas de aplicación. Los PoEAA son patrones **arquitectónicos**, no de diseño.

**Por qué**: Fowler documenta en la introducción de PoEAA que "los patrones GoF son sobre diseño de objetos; estos son sobre arquitectura de aplicaciones empresariales". Repository fue popularizado por Eric Evans en Domain-Driven Design (2003) y luego Spring Data lo masificó. Unit of Work está implementado en Hibernate (`Session`), JPA (`EntityManager`) y Entity Framework. Data Mapper es la base de todos los ORM modernos. Fowler reconoce explícitamente la deuda con GoF: muchos PoEAA usan GoF internamente (MVC usa Observer y Strategy; Gateway usa Facade y Adapter).

---

### 4. [Investigar] ¿Cómo se relacionan los patrones de diseño con el concepto de "technical debt" de Ward Cunningham y qué rol juegan en la gestión de esa deuda?

**Respuesta**: Ward Cunningham acuñó "technical debt" en 1992 como metáfora: escribir código sin entender completamente el dominio es como pedir un préstamo — obtenés funcionalidad rápido pero pagás intereses en forma de refactoring futuro. Los patrones de diseño son herramientas de **refinanciación**: cuando refactorizás código procedural con switch/if hacia Strategy, State o Command, estás pagando deuda técnica (eliminando acoplamiento y mejorando extensibilidad). Sin embargo, aplicar patrones PREMATURAMENTE genera "sobre-ingeniería" — un tipo diferente de deuda donde pagaste por adelantado una flexibilidad que nunca usaste. El equilibrio está en: empezá simple, acumulá deuda controladamente, y refactorizá con patrones solo cuando la complejidad lo justifique (Rule of Three).

**Por qué**: Cunningham explicó en su wiki (C2 Wiki, el primer wiki del mundo) que los patrones son "activos" que contrarrestan la deuda técnica. Martin Fowler popularizó el concepto en su artículo "TechnicalDebt" (2003) y lo vinculó con refactoring patterns. La metáfora financiera es poderosa: un Singleton mal usado acumula "interés compuesto" porque cada nuevo feature que depende de ese estado global aumenta el costo de cambio futuro. Clean Architecture (Robert Martin, 2017) y Evolutionary Design (David Thomas) son filosofías que posicionan a los patrones como herramientas de gestión de deuda, no como recetas iniciales.

---

### 5. [Conectar] La clase presenta UML básico para patrones. Investigá cómo el C4 Model (Simon Brown) extiende UML para documentar patrones en sistemas distribuidos y cómo aplicarlo al proyecto base de procesamiento de pedidos.

**Por qué**: Simon Brown creó C4 como reacción a la complejidad de UML 2.x para comunicación con no-desarrolladores. La clase enseña UML para patrones (nivel Code), pero en una entrevista de arquitectura te preguntarán por vistas de más alto nivel. UML es estándar para documentar patrones GoF (el libro mismo usa OMT, predecesor de UML). La combinación C4 + UML es el enfoque moderno: C4 muestra el "qué" y "dónde", UML muestra el "cómo" interno de cada patrón. Structurizr (herramienta de Simon Brown) permite generar ambos desde un solo modelo.

---

### 6. [Conectar] La clase menciona que los patrones GoF se basan en "programar para interfaces". Investigá cómo este principio se manifiesta en el Module System de Java 9+ (JPMS) y cómo afecta la implementación de patrones como Adapter y Bridge.

**Por qué**: JPMS fue diseñado por Mark Reinhold (Chief Architect de Java) para resolver el classpath hell (JAR hell). Los patrones GoF asumen que todas las clases son visibles (classpath), pero JPMS introduce visibilidad selectiva. En la práctica, Spring Boot 3+ con `module-info.java` fuerza a diseñar explícitamente las dependencias entre capas, alineándose con los principios de patrones como Facade (solo el módulo Facade exporta APIs públicas; los subsistemas internos no se exportan). El libro "Java 9 Modularity" (Paul Bakker, Sander Mak) documenta estos patrones de modularidad.

---

### 7. [Conectar] La clase enumera 23 patrones GoF. Investigá qué patrones adicionales propuso la comunidad posterior (POSA, PoEAA, EIP) que complementan el catálogo original y que son esenciales en sistemas 2026.

**Respuesta**: La comunidad extendió GoF con: (1) **POSA** (Pattern-Oriented Software Architecture, Buschmann et al., 1996): patrones arquitectónicos como Layers, Pipes and Filters, Blackboard, Broker, MVC, Microkernel, Reflection. Estos operan a nivel de subsistema, no de clases. (2) **EIP** (Enterprise Integration Patterns, Hohpe & Woolf, 2003): patrones de mensajería como Message Broker, Content-Based Router, Splitter, Aggregator, Dead Letter Channel — fundamentales para microservicios con Kafka/RabbitMQ. (3) **Cloud Patterns** (Azure/Amazon): Circuit Breaker (Nygard 2007), Bulkhead, CQRS, Event Sourcing, Saga, Strangler Fig, Sidecar, Ambassador. (4) **Reactive Patterns**: Backpressure, Publisher-Subscriber (Reactive Streams), Event Loop. Un desarrollador 2026 necesita conocer GoF como base + PoEAA para persistencia + EIP para mensajería + Cloud para resiliencia.

---

### 8. [Cuestionar] ¿Es Singleton realmente un anti-patrón como sostienen muchos desarrolladores, o el problema es su implementación manual en lugar de delegarla a un contenedor de DI? Defendé ambas posturas con argumentos concretos.

**Respuesta**: **Postura anti-Singleton (Martin Fowler, Miško Hevery)**: Singleton viola SRP (la clase gestiona su propia creación + lógica de negocio), introduce estado global mutable (imposible de testear en aislamiento sin frameworks que reseteen el estado entre tests), crea acoplamiento oculto (el código cliente no declara su dependencia en su interfaz — la esconde dentro del método), y en lenguajes con herencia simple fuerza una elección de diseño irreconciliable. **Postura pro-Singleton con DI (Rod Johnson, Spring team)**: el problema no es tener una única instancia — es cómo se obtiene. Con DI, la clase no es un Singleton manual con `getInstance()`; es una clase normal que el contenedor gestiona con scope singleton. Esto preserva testabilidad (el test puede crear una instancia separada), elimina el acoplamiento oculto (la dependencia se inyecta por constructor), y mantiene el beneficio de una única instancia cuando es genuinamente necesaria (pools de conexiones, caches, event loops).

**Por qué**: Miško Hevery (creador de Angular, ex-Google) escribió "Singletons are Pathological Liars" (2008) argumentando que el problema es la mentira en la API: `getInstance()` parece inofensivo pero esconde un contrato no declarado. Martin Fowler en "Patterns of Enterprise Application Architecture" clasifica a Singleton como "Registry" cuando se usa mal. Pero el equipo de Spring (Rod Johnson, Juergen Hoeller) demostró con el contenedor IoC que el concepto de "una instancia" es válido — solo la implementación manual es el problema. En la práctica 2026: Spring Boot, Angular, .NET Core todos usan DI con scopes — el Singleton manual (sin DI) está prácticamente extinto en proyectos profesionales.

---

### 9. [Cuestionar] El libro GoF tiene 30+ años. ¿Están los 23 patrones vigentes en 2026 o varios han sido absorbidos por los lenguajes modernos al punto de ser irrelevantes? Analizá al menos 3 patrones que consideres obsoletos y 3 que consideres más vigentes que nunca.

**Por qué**: El debate sobre la vigencia de GoF es constante en la comunidad. Norvig (1998), luego Stuart Halloway (2009, "Design Patterns in Dynamic Programming"), y más reciente Uncle Bob Martin (2018, "Clean Architecture") han argumentado que los patrones como NOMBRES y CONCEPTOS son atemporales, pero sus IMPLEMENTACIONES canónicas envejecen. Iterator como patrón manual está muerto; Iterator como concepto (separar recorrido de estructura) vive en Streams, Reactive Extensions y GraphQL resolvers. El GoF mismo anticipó esto: "los mejores patrones desaparecen en la infraestructura del lenguaje".

---

### 10. [Cuestionar] La clase menciona que los patrones "no son recetas sino soluciones probadas". Sin embargo, muchos equipos tratan los patrones GoF como checklist dogmático. ¿Son los patrones una herramienta de comunicación o una camisa de fuerza? ¿En qué momento se convierten en "cargo cult programming"?

**Respuesta**: Los patrones son primordialmente una **herramienta de vocabulario compartido** — cuando decís "acá usamos Strategy para los descuentos", todo desarrollador que conoce GoF entiende inmediatamente la estructura, trade-offs y alternativas. Se convierten en "cargo cult" cuando: (1) se aplican sin entender el problema (Golden Hammer), (2) se implementan en su forma canónica del libro sin adaptación al lenguaje/contexto, (3) se usan como métrica de calidad (más patrones = mejor código, lo opuesto es cierto), (4) se fuerzan donde una solución más simple sería suficiente (YAGNI). El punto de quiebre es cuando el patrón es el FIN y no el MEDIO. Kent Beck (creador de XP y TDD) dijo: "I'm not a great programmer; I'm just a good programmer with great habits." Los patrones son hábitos, no mandamientos.

