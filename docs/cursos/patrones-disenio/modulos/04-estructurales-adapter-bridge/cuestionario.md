---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] Investigá el patrón "Anti-Corruption Layer" (Eric Evans, DDD) y su relación con Adapter. ¿Por qué Evans consideró necesario crear un nuevo patrón en lugar de simplemente decir "usá Adapter"?

**Respuesta**: **Anti-Corruption Layer** (ACL) es un Adapter a nivel de subsistema, no de objeto. Mientras Adapter convierte una interfaz en otra (1 clase → 1 interfaz), ACL protege un subsistema ENTERO del modelo de otro sistema, traduciendo no solo interfaces sino SEMÁNTICA. Ejemplo: un sistema legacy de pedidos modela `Pedido` con `clienteId: Integer` y `items: String` (JSON embebido). Tu sistema nuevo modela `Order` con `customer: Customer` y `items: List<LineItem>`. Un simple Adapter no alcanza porque necesitás: (1) traducir `Integer` a `Customer` (buscando en un repositorio), (2) parsear `String` JSON a `List<LineItem>`, (3) manejar campos que no existen en uno de los sistemas. ACL es una colección de Adapters, Facades, y servicios de traducción que forman una barrera explícita entre bounded contexts. Evans lo nombró diferente porque la intención es distinta: Adapter integra; ACL protege.

**Por qué**: Eric Evans define ACL en "Domain-Driven Design" (2003, Cap 14) como un patrón estratégico de DDD. La diferencia con Adapter es de escala e intención: ACL es defensivo ("no quiero que el modelo podrido del sistema legacy contamine mi modelo de dominio"), mientras Adapter es integrativo ("quiero que estos dos sistemas trabajen juntos"). En microservicios, una ACL típica consume eventos del sistema legacy, los traduce al modelo del nuevo servicio, y publica eventos traducidos. Implementacionalmente usa Adapter, Facade y Translator, pero es más que la suma de las partes.

---

### 3. [Investigar] ¿Qué es un "Bridge" a nivel de base de datos en patrones de microservicios (Database per Service, Shared Database, CQRS con read/write separation) y cómo se relaciona con el Bridge de GoF?

**Por qué**: GoF Bridge separa abstracción de implementación para que varíen independientemente. En microservicios, Chris Richardson (microservices.io) y Sam Newman ("Building Microservices") aplican este principio a nivel de infraestructura. Spring Data abstrae JPA, MongoDB, Cassandra, Redis bajo la misma interfaz `Repository`: `JpaRepository`, `MongoRepository`, `CassandraRepository` son implementaciones concretas de la abstracción `Repository`. Cambiar de BD es cambiar la implementación, no la abstracción.

---

### 4. [Investigar] ¿Qué son los "Hexagonal Architecture Ports and Adapters" de Alistair Cockburn y cómo se relacionan con el patrón Adapter? ¿Por qué Cockburn eligió la palabra "Adapter" para los conectores externos?

**Respuesta**: Alistair Cockburn definió Hexagonal Architecture (2005) como un patrón donde la lógica de negocio (hexágono interior) se comunica con el mundo exterior (BD, UI, APIs) a través de **Puertos** (interfaces) y **Adaptadores** (implementaciones). Cockburn usó la palabra "Adapter" deliberadamente — es el mismo patrón GoF pero aplicado a nivel de arquitectura: el puerto `PedidoRepository` (Target interface) define cómo el dominio quiere hablar. Los adaptadores implementan ese puerto: `MySQLPedidoRepository` adapta MySQL al dominio, `MongoPedidoRepository` adapta MongoDB, `PedidoRepositoryInMemory` adapta una lista en memoria para tests. La genialidad es la simetría: los adaptadores "driving" (UI, REST, CLI) adaptan el mundo exterior al dominio; los adaptadores "driven" (BD, API externa) adaptan el dominio al mundo exterior. En GoF, Adapter es reactivo (adaptar código existente). En Hexagonal, Adapter es arquitectónico (diseñado desde el principio).

**Por qué**: Cockburn publicó Hexagonal Architecture en su blog en 2005, y luego fue popularizada como "Ports and Adapters". La palabra "Adapter" es explícitamente un guiño a GoF. Robert Martin refinó esto en "Clean Architecture" (2017) como "Interface Adapters layer". La diferencia clave: en Hexagonal, los puertos SON el contrato del dominio, y cada adaptador externo implementa ese contrato — es Adapter como filosofía arquitectónica, no como parche de integración.

---

### 5. [Conectar] La clase explica Adapter con `InputStreamReader`. Conectá esto con el patrón Adapter en GraphQL: ¿cómo un GraphQL resolver adapta múltiples fuentes de datos (REST, gRPC, BD) a un schema unificado?

**Por qué**: La especificación GraphQL (Facebook, 2015) no menciona Adapter explícitamente, pero el modelo de resolvers es Adapter puro. Netflix DGS y Apollo Server documentan este patrón como "Data Fetcher Pattern". En comparación con REST (donde el cliente debe conocer cada endpoint y su formato), GraphQL unifica múltiples Adapters bajo un schema — es el caso de uso perfecto para el patrón. Spring for GraphQL implementa resolvers como `@Controller` + `@SchemaMapping` donde cada método es un Adapter.

---

### 6. [Conectar] La clase muestra Bridge con notificaciones multiplataforma. Conectá esto con cómo los Service Meshes (Istio, Linkerd) implementan un Bridge a nivel de infraestructura entre la aplicación y la red.

**Respuesta**: Un **Service Mesh** implementa Bridge entre la aplicación (Abstraction) y la red (Implementation). La aplicación habla en HTTP/gRPC normal (Abstraction), sin saber nada de TLS, retry, circuit breaking, o servicio discovery. El sidecar proxy (Envoy en Istio) es la Implementation que maneja: mTLS automático, balanceo de carga, timeouts, retries, traffic splitting. Si la aplicación está en Kubernetes con Istio, puede migrar de HTTP a gRPC, de TLS 1.2 a 1.3, o de round-robin a least-connection, sin cambiar UNA línea de código de la aplicación. La abstracción (`http://servicio-b/api`) no cambia; la implementación (cómo se resuelve, asegura y balancea esa llamada) varía en el sidecar. Esto es Bridge llevado a nivel de infraestructura: "Decouple an abstraction from its implementation so that the two can vary independently" — exactamente la definición GoF.

**Por qué**: William Morgan (CEO de Buoyant, creador de Linkerd) describe el service mesh como "platform engineering pattern". Aunque no usan el término "Bridge" explícitamente, la separación abstracción/implementación es idéntica. La aplicación es la Abstraction; el proxy sidecar es la Implementor. Istio usa Envoy (Matt Klein, Lyft) como implementación concreta. La aplicación puede cambiarse de un servicio a otro, actualizarse, o migrar de protocolo, y el mesh maneja la diferencia — Bridge en su máxima expresión.

---

### 7. [Conectar] La clase menciona `HandlerAdapter` en Spring MVC como Adapter. Investigá cómo el patrón `HandlerInterceptor` en Spring MVC es un Bridge entre el framework y las preocupaciones transversales, y cómo se diferencia de Adapter.

**Respuesta**: `HandlerInterceptor` es conceptualmente **Bridge** (o más precisamente, **Chain of Responsibility + Bridge**). Permite que preocupaciones transversales (logging, autenticación, métricas) varíen independientemente de los handlers (controllers). La abstracción es la request HTTP; las implementaciones concretas son los interceptors (`preHandle`, `postHandle`, `afterCompletion`). A diferencia de `HandlerAdapter` (que es Adapter porque adapta handlers heterogéneos a una interfaz común), `HandlerInterceptor` es Bridge porque: (1) fue diseñado desde el principio (no es integración de código legacy), (2) separa la abstracción (procesamiento de request) de la implementación (qué acciones transversales se ejecutan), (3) ambas dimensiones varían independientemente: podés agregar/quitar interceptors sin tocar los controllers, y podés agregar controllers sin tocar los interceptors. La cadena de interceptors es similar a la cadena de implementaciones concretas en Bridge.

---

### 8. [Cuestionar] El `InputStreamReader` de Java está clasificado como Adapter en la clase y en la mayoría de guías. Pero una postura alternativa argumenta que también cumple con Bridge porque separa la abstracción de lectura de caracteres de la implementación de lectura de bytes. ¿Es Adapter, Bridge, o ambos? Defendé tu posición.

**Por qué**: Los GoF (p. 139 y p. 155) son claros: la diferencia es intención. `InputStreamReader` fue creado con intención de ADAPTAR (hacer que `InputStream` funcione donde se espera un `Reader`). Pero el diseño de `java.io` en su totalidad tiene estructura de Bridge. Esto ilustra que los patrones no son etiquetas discretas — una misma implementación puede cumplir múltiples patrones según cómo la mires. En entrevistas, la respuesta segura es "Adapter por intención", pero la respuesta profunda reconoce la dualidad.

---

### 9. [Cuestionar] ¿Es Bridge sobreutilizado? Muchos desarrolladores aplican Bridge "por si acaso" para separar abstracción de implementación. ¿Cuándo Bridge se convierte en sobre-ingeniería?

**Por qué**: GoF (p. 161) advierten sobre la complejidad de Bridge. Kent Beck en "Extreme Programming Explained" promueve "You Aren't Gonna Need It" (YAGNI) — no construyas para el futuro. Bridge es el patrón más tentador para sobre-ingeniería porque "separar abstracción de implementación" suena como buen diseño universal. Pero como todas las indirecciones, tiene costo: más clases, más archivos, más tests, más documentación. Solo se justifica cuando el costo de NO tener Bridge (explosión combinatoria, acoplamiento rígido) supera el costo de TENER Bridge.

---

### 10. [Cuestionar] ¿Es `java.util.Arrays.asList()` realmente un Adapter? Algunos argumentan que es un Facade o un Bridge. Analizá críticamente.

**Por qué**: Stuart Marks (Oracle JDK developer) explicó en StackOverflow (2015) que `Arrays.asList()` fue diseñado como "bridge between the array-based and collection-based APIs." La naturaleza híbrida no es un bug, es un feature: obtenés una vista de lista sobre un array sin copiar datos. La confusión de clasificación surge porque los patrones no son ortogonales — una implementación puede encarnar múltiples patrones simultáneamente. Los GoF reconocen esto en la sección "Related Patterns" de cada capítulo.

