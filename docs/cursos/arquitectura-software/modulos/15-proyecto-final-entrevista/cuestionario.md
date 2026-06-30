---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Self-Contained Systems" (SCS) aplicado a E-Commerce y cómo difiere de la descomposición en microservicios propuesta en el proyecto final?

**Respuesta**: En SCS, la E-Commerce Platform se dividiría en sistemas autocontenidos como "Product Discovery SCS" (búsqueda + catálogo + recomendaciones, con su propia UI), "Checkout SCS" (carrito + pedido + pago, con su propia UI), y "User Account SCS" (registro + login + direcciones, con su propia UI). Cada SCS es dueño de su frontend y backend, con base de datos independiente, y se integra solo mediante enlaces en la UI y eventos asíncronos. A diferencia de la arquitectura de microservicios propuesta en clase (donde una SPA React consume múltiples servicios backend), SCS evita el problema de "frontend monolith" que la clase no abordó. Stefan Tilkov de INNOQ argumenta que SCS alinea equipos con autonomía total, mientras que microservicios tradicionales requieren un "frontend team" que se vuelve cuello de botella.

**Por qué**: Tilkov documentó SCS en scs-architecture.org. La clase propone una SPA React que consume múltiples servicios —esto funciona para equipos pequeños pero no escala organizacionalmente. Para el proyecto final, considerar SCS como alternativa a microservicios tradicionales demostraría conocimiento más allá de la clase.

---

### 3. [Investigar] En una entrevista técnica te preguntan: "¿Cómo harías la migración de base de datos con zero-downtime?" Más allá de lo visto en clase, ¿qué estrategias de "Expand and Contract" (Scott Ambler) aplicarías?

**Respuesta**: Scott Ambler y Pramod Sadalage en *Refactoring Databases* describen "Expand and Contract" para migraciones sin downtime: (1) **Expand**: agregar el nuevo schema/columna/tabla en producción (sin eliminar el viejo), el código escribe en ambos schemas durante la transición, (2) **Migrate**: background job copia datos viejos al nuevo schema incrementalmente, (3) **Verify**: verificar consistencia entre ambos schemas con tests automatizados, (4) **Switch**: cambiar el código para leer del nuevo schema (mientras sigue escribiendo en ambos), y (5) **Contract**: eliminar el schema/columna/tabla vieja solo después de confirmar que no hay lecturas residuales. Feature flags controlan en qué paso está el sistema. Esto evita el "big bang migration" que requiere ventana de mantenimiento.

**Por qué**: Ambler y Sadalage documentan el patrón en el contexto de "evolutionary database design." La clase mencionó migración sin downtime en el ejercicio 10 del Módulo 15, pero no el patrón Expand and Contract. Para E-Commerce Platform: migrar el esquema de pedidos de v1 a v2 sin downtime requeriría este patrón, especialmente porque la base de datos de pedidos es crítica para el negocio.

---

### 4. [Investigar] ¿Qué son los "Architecture Decision Records as Code" con "ADR Manager" y "Log4brains" y cómo mejoran la práctica de ADRs para el proyecto final?

**Respuesta**: La práctica emergente es tratar ADRs como código con herramientas que van más allá del markdown estático: **ADR Manager** (adr.github.io) permite crear, listar, linkear y generar un sitio web estático de ADRs con búsqueda y graph visualization. **Log4brains** (log4brains.dev) va más allá generando un "architecture knowledge base" interactivo con: línea de tiempo de decisiones, grafo de relaciones entre ADRs (qué ADR fue reemplazado por cuál), y sistema de tags para filtrar por bounded context o QA. La ventaja sobre markdown plano: cuando el proyecto final tiene 6 ADRs, markdown es suficiente; cuando la E-Commerce Platform real tendría 50+ ADRs mantenidos por 5 equipos, estas herramientas son necesarias para navegabilidad y evitar decisiones duplicadas.

**Por qué**: La clase enseñó ADRs en markdown, pero la comunidad practicante evolucionó hacia herramientas. Philippe Ozil (creador de Log4brains) argumenta que el formato del ADR es solo el 20% —el 80% es la navegabilidad, trazabilidad, y descubribilidad. Para el proyecto final, usar markdown es aceptable; mencionar herramientas avanzadas en la defensa muestra visión a largo plazo.

---

### 5. [Conectar] En el proyecto final se pide aplicar Hexagonal + Clean + CQRS juntos. ¿Cómo evitar que la combinación de estos patrones genere sobre-ingeniería? Mencioná la postura de Neal Ford en *Software Architecture: The Hard Parts*.

**Respuesta**: Neal Ford en *The Hard Parts* advierte contra la "architecture by accumulation" —aplicar todos los patrones aprendidos a todo el sistema. La recomendación de Ford: (1) aplicar Hexagonal/Clean **solo en el core domain** (Pedidos) donde la complejidad del dominio lo justifica; en subdominios genéricos (Notificaciones, Usuarios), un simple Service + Repository alcanza, (2) aplicar CQRS solo en bounded contexts donde lecturas y escrituras son genuinamente diferentes (Pedidos: writes orientados a DDD, reads para reportes), (3) usar Event Sourcing solo si la trazabilidad aporta valor de negocio (auditoría de pedidos), no por defecto, (4) el principio "simplicity over purity": si un patrón no resuelve un problema concreto del proyecto, no se debe aplicar. Ford enfatiza que la arquitectura debe ser "the simplest thing that could possibly work for the specific QAs."

**Por qué**: La clase enseña cada patrón como ideal, pero juntos pueden crear una complejidad innecesaria. Ford y el equipo de ThoughtWorks abogan por "architectural fitness functions" que verifiquen que la complejidad extra agregada está justificada por un QA medible. Para el proyecto final, es más impresionante justificar por qué NO aplicaste un patrón en cierto bounded context, que aplicarlos todos indiscriminadamente.

---

### 6. [Conectar] La simulación de entrevista pide "diseñar un sistema de pagos con alta disponibilidad." ¿Cómo conectás los conceptos de Saga (Módulo 10), Circuit Breaker (Módulo 09) y Transaction Outbox (Módulo 10) en un único diseño cohesivo?

**Respuesta**: El diseño cohesivo integraría: (1) **Sync over Async**: el API Gateway recibe la solicitud de pago vía REST síncrono (el cliente necesita respuesta inmediata), (2) **Transaction Outbox**: Payment Service escribe el pago en PostgreSQL + inserta evento `PaymentInitiated` en tabla outbox en la misma transacción ACID, garantizando atomicidad, (3) **Reliable Publisher**: un scheduler o Debezium publica el evento de la outbox a Kafka, (4) **Saga Coreografiada**: Order Service consume `PaymentInitiated` y actualiza estado del pedido; si el pago es rechazado (webhook de Stripe), Payment Service emite `PaymentFailed` y Order Service compensa cancelando el pedido, (5) **Circuit Breaker**: el API Gateway tiene circuit breaker hacia Payment Service; si Payment Service está caído, el gateway rechaza inmediatamente con `503 Service Unavailable` en lugar de acumular timeouts, y (6) **Idempotencia**: Payment Service usa idempotency key (generada por el cliente) para que reintentos no dupliquen cobros.

**Por qué**: Este diseño integra patrones de 4 módulos diferentes de forma cohesiva. Gregor Hohpe en *Enterprise Integration Patterns* muestra cómo los patrones no son islas —deben componerse en soluciones completas. La clase enseña cada patrón por separado, pero las entrevistas evalúan la capacidad de integración. Este diseño demuestra pensamiento sistémico.

---

### 7. [Conectar] La clase pide analizar un ADR propuesto evaluando pros/cons. ¿Qué criterios de calidad de ADR propone Michael Keeling en *Design It!* que no están en el formato Nygard básico?

**Respuesta**: Michael Keeling, en *Design It! From Programmer to Software Architect* (2017), propone criterios adicionales para evaluar ADRs: (1) **Clarity**: ¿la decisión es específica y no ambigua? (no: "usaremos microservicios", sí: "extraeremos el módulo de pagos como un microservicio independiente con PostgreSQL dedicado, comunicándose mediante eventos Kafka con los demás servicios"), (2) **Constraints awareness**: ¿la decisión respeta las restricciones (tecnológicas, organizacionales, regulatorias) documentadas?, (3) **Alternatives considered**: ¿se evaluaron al menos 2 alternativas serias con pros/cons explícitos? Un ADR sin alternativas consideradas es una decisión sin análisis, (4) **Trade-off explicitness**: ¿las consecuencias negativas están explicitadas o solo se listan ventajas? Un ADR que solo menciona beneficios es propaganda, no análisis, (5) **Actionability**: ¿la decisión lleva a acciones concretas o es abstracta? "Usar Clean Architecture" es abstracto; "Estructurar el bounded context de Pedidos con paquetes domain/, application/ e infrastructure/ con interfaces en application/port/" es accionable.

**Por qué**: Keeling complementa a Nygard con criterios evaluativos. La clase presentó el formato Nygard (Contexto, Decisión, Consecuencias) pero no cómo evaluar si un ADR es "bueno." Para el ejercicio de entrevista donde se evalúa un ADR, estos 5 criterios son la pauta de evaluación.

---

### 8. [Cuestionar] En una entrevista te preguntan: "¿Usarías microservicios para un sistema de 3 bounded contexts con un equipo de 5 personas?" ¿Cuál es tu respuesta fundamentada más allá del "depende"?

**Respuesta**: No usaría microservicios. Con 5 personas y 3 bounded contexts, un **Modular Monolith** con Spring Modulith es la respuesta correcta. Fundamentos: (1) Conway's Law: con 5 personas, la estructura de comunicación natural es un solo equipo, no 3 equipos independientes —los microservicios sin equipos independientes son "distributed monolith," (2) "You must be this tall to use microservices" (Martin Fowler, Sam Newman): el overhead de CI/CD x3, bases de datos x3, infrastructure as code x3, y observabilidad distribuida consumiría >50% del tiempo del equipo, (3) Sam Newman en *Building Microservices* 2ª edición es explícito: "Don't even consider microservices unless you have 3+ teams," (4) Un Modular Monolith con bounded contexts bien definidos (paquetes separados, interfaces públicas, tests de dependencia automatizados con ArchUnit) da 90% del beneficio arquitectónico con 10% del costo operacional. Si la organización crece a 15+ personas en 2 años, se extraen los bounded contexts gradualmente con Strangler Fig.

**Por qué**: Esta es la pregunta que separa arquitectos que entienden trade-offs de los que aplican patrones por moda. La clase presentó criterios de decisión, pero la respuesta concreta "no, con 5 personas no" y los 4 fundamentos específicos demuestran criterio que va más allá del contenido.

---

### 9. [Cuestionar] ¿Es el "proyecto final" de diseñar una arquitectura completa un ejercicio realista o académico? Compará con cómo Netflix realmente diseña arquitectura según Adrian Cockcroft.

**Respuesta**: Adrian Cockcroft (ex-Netflix, ex-AWS) ha descrito que Netflix nunca diseñó su arquitectura "completa" upfront —evolucionó orgánicamente de un monolito a microservicios durante 7 años, con cada decisión motivada por un incendio en producción, no por un diseño en papel. El proyecto final de la clase es una simulación valiosa (desarrolla pensamiento sistémico y comunicación), pero Cockcroft advertiría que la arquitectura real se descubre, no se diseña. La diferencia: en el proyecto, podés decidir que Order Service usa PostgreSQL y Catalog Service usa MongoDB "porque sí"; en Netflix, esa decisión requiere 3 meses de proof of concept, benchmarks con tráfico real, y un post-mortem de la migración. El proyecto final desarrolla competencias conceptuales necesarias, pero un arquitecto senior sabe que la implementación siempre revela problemas que el diseño no anticipó.

**Por qué**: Cockcroft ha hablado extensamente sobre la evolución de la arquitectura de Netflix en conferencias (QCon, re:Invent). La clase presenta el proyecto como ejercicio de síntesis, y lo es, pero es importante reconocer que un diseño en papel es un punto de partida, no un destino. La verdadera habilidad arquitectónica no es diseñar el sistema perfecto, es reaccionar a lo que la producción te enseña.

---

### 10. [Cuestionar] ¿Debería un arquitecto escribir código regularmente o puede mantenerse efectivo solo con diseño y documentación? El debate entre "architectus coderus" y "ivory tower architect."

**Respuesta**: La evidencia de la industria (Google, Netflix, ThoughtWorks) favorece al arquitecto que escribe código regularmente ("architectus coderus"). Robert C. Martin en *Clean Architecture* argumenta que "an architect who doesn't write code is dangerous because they lose touch with the friction of implementation." Gregor Hohpe matiza: el arquitecto no necesita ser el desarrollador más productivo, pero sí debe mantener "hands-on" experiencia para entender los trade-offs reales de sus decisiones —no en teoría, sino en código real con herramientas reales. La alternativa extrema ("ivory tower architect" que solo hace diagramas y ADRs) produce decisiones que ignoran la fricción del ecosistema (Spring Boot quirks, limitaciones de Kafka, problemas de serialización). Para la entrevista del Módulo 15, los ejercicios prácticos 1-15 asumen que el arquitecto puede implementar patrones, no solo describirlos.

**Por qué**: Este debate es recurrente. El mismo Uncle Bob que defiende Clean Architecture defiende que el arquitecto debe codificar. Simon Brown dice: "If you can't code it, you can't architect it." Para la simulación de entrevista, la expectativa implícita es que el arquitecto puede tanto diseñar (diagramas C4, ADRs) como implementar (Circuit Breaker en Spring Boot, Kafka producer/consumer, Outbox pattern) —las 15 preguntas prácticas lo confirman.

---

