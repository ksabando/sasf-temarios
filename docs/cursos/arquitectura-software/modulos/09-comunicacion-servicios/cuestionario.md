---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Backend for Frontend" (BFF) a fondo, según Sam Newman, y por qué es preferible a un API Gateway genérico para aplicaciones con múltiples clientes?

**Respuesta**: Sam Newman dedicó un capítulo completo a BFF en *Building Microservices* (2ª edición). El patrón propone un backend específico por tipo de cliente: un Mobile BFF que agrupa datos de múltiples servicios en una respuesta optimizada para mobile (menos campos, menos round-trips, datos comprimidos), un Web BFF que devuelve datos completos (más ancho de banda, pantalla grande), un Third-Party BFF con APIs públicas versionadas y rate-limiting. A diferencia de un API Gateway genérico (que solo rutea y agrega cross-cutting concerns), cada BFF contiene **lógica de orquestación** específica para su cliente. La ventaja: el equipo mobile controla su BFF y decide qué datos necesita; los cambios en la UI mobile no afectan a la API web ni viceversa.

**Por qué**: La clase mencionó API Gateway y Feign, pero no BFF. Netflix, SoundCloud y Spotify usan BFF extensivamente. Para E-Commerce Platform: el BFF mobile podría combinar catálogo + carrito + recomendaciones en un solo endpoint optimizado; el BFF web podría devolver datos paginados más detallados. La diferencia con el API Gateway es que BFF es propiedad del equipo de frontend, no del equipo de plataforma.

---

### 3. [Investigar] ¿Cómo implementa gRPC el "bidirectional streaming" y qué casos de uso de E-Commerce lo justifican más allá del unary RPC que cubre la clase?

**Respuesta**: gRPC bidirectional streaming permite que cliente y servidor envíen múltiples mensajes simultáneamente sobre una sola conexión HTTP/2. Casos de uso en E-Commerce que justifican la complejidad adicional: (1) **Actualización de inventario en tiempo real**: el servidor envía notificaciones de cambios de stock (streaming server→client) mientras el cliente envía solicitudes de reserva (streaming client→server) sobre la misma conexión, (2) **Carrito de compras colaborativo**: múltiples usuarios (clientes) agregan/quitan productos mientras el servidor transmite el estado del carrito en tiempo real, (3) **Procesamiento de pagos con confirmación progresiva**: el cliente envía transacciones en lote y el servidor confirma cada una a medida que las procesa, incluyendo correcciones en tiempo real.

**Por qué**: La clase presentó los 4 tipos de RPC como lista, pero no exploró casos de uso concretos para bidirectional streaming. La documentación oficial de gRPC y los casos de estudio de Google muestran que bidirectional streaming es el diferenciador de gRPC para aplicaciones que necesitan comunicación persistente de baja latencia, evitando WebSocket o long polling con REST.

---

### 4. [Investigar] ¿Qué es el protocolo RSocket y en qué se diferencia de gRPC y REST para comunicación reactiva entre microservicios?

**Respuesta**: RSocket es un protocolo de aplicación binario creado por Ben Hale (ex-Netflix, ex-Pivotal) y diseñado específicamente para comunicación reactiva. A diferencia de gRPC (que usa HTTP/2 y está atado a Protobuf), RSocket es agnóstico en formato de serialización y protocolo de transporte (funciona sobre TCP, WebSocket, HTTP/2). Soporta 4 modos de interacción como gRPC (request-response, fire-and-forget, request-stream, channel) pero con backpressure integrado a nivel de protocolo, no de aplicación. La diferencia clave: en gRPC, el backpressure es manual (el cliente debe implementarlo); en RSocket, es nativo del protocolo (el servidor pide N mensajes, el cliente envía exactamente N, espera, pide más). Esto lo hace superior para sistemas donde el control de flujo es crítico.

**Por qué**: La clase cubrió gRPC y REST como síncronos, y mensajería como asíncrona, pero RSocket ocupa un nicho intermedio (comunicación reactiva con backpressure). Spring Framework 5+ y Spring Boot 2.2+ tienen soporte nativo para RSocket. Para E-Commerce Platform, RSocket sería relevante para la comunicación entre servicios que necesitan streaming con control de flujo (ej: sincronización de inventario en tiempo real entre Warehouse y Catalog).

---

### 5. [Conectar] La clase cubre Circuit Breaker, Bulkhead y Retry como patrones de resiliencia. ¿Cómo se relaciona esto con el libro *Release It!* de Michael Nygard y qué otros patrones de estabilidad propone que la clase no cubrió?

**Respuesta**: Michael Nygard, en *Release It!* (1ª ed. 2007, 2ª ed. 2018), definió los patrones de estabilidad que la clase cubrió parcialmente. Patrones adicionales que no aparecen en clase: **Handshaking** (el servidor rechaza conexiones cuando está sobrecargado, evitando que el cliente espere), **Test Harness** (poner el sistema bajo carga controlada en producción para verificar que los patrones de estabilidad funcionan), **Shed Load** (rechazar requests tempranamente cuando el sistema está sobrecargado), **Fail Fast** (si una dependencia no está disponible, fallar inmediatamente en lugar de acumular requests pendientes), y **Steady State** (mantener recursos limpios: logs que no crecen indefinidamente, cachés con TTL). Nygard enfatiza que la resiliencia no es un conjunto de herramientas, es una **disciplina de diseño**: cada integración externa debe ser tratada como potencialmente hostil.

**Por qué**: La clase tomó Circuit Breaker y Bulkhead de Nygard pero no citó el libro completo. *Release It!* es la obra fundacional sobre estabilidad en sistemas distribuidos. La lección más importante que la clase omitió: los patrones de estabilidad deben ser testeados en producción con Chaos Engineering, no solo implementados.

---

### 6. [Conectar] La clase muestra Timeout como configuración de Feign/Gateway. ¿Cómo se relaciona esto con la "Ley de Little" aplicada a sistemas con colas y qué timeout es "óptimo" según la teoría de colas?

**Por qué**: La clase configuró timeouts con valores fijos (2s, 3s, 5s) sin explicar la teoría detrás. La Ley de Little explica por qué timeouts largos causan fallos en cascada: los threads bloqueados esperando respuestas son requests en el sistema (L) que crecen con W. Un timeout bien calibrado actúa como "safety valve" que mantiene L bajo control.

---

### 7. [Conectar] La clase presenta REST con Feign + Circuit Breaker como comunicación síncrona. ¿Cuándo es preferible gRPC con "hedged requests" (Google) sobre REST con Retry para reducir latencia de cola?

**Respuesta**: Google introdujo "hedged requests" en su paper *"The Tail at Scale"* (Jeff Dean, 2013). La técnica: enviar el mismo request a múltiples réplicas simultáneamente (o con un pequeño delay), y usar la primera respuesta que llegue, cancelando las demás. Esto reduce la latencia de cola (p99) dramáticamente porque la probabilidad de que todas las réplicas estén lentas simultáneamente es baja. REST con Retry espera un timeout y reintenta, lo que aumenta la latencia. gRPC con soporte nativo para cancelación de streams y HTTP/2 multiplexado hace que hedged requests sea más eficiente: podés enviar 3 requests sobre la misma conexión y cancelar 2 cuando el primero responde. REST requeriría 3 conexiones y cancelación manual.

**Por qué**: La clase comparó REST vs gRPC en velocidad serial, pero el argumento más fuerte para gRPC en sistemas de baja latencia es el soporte para patrones como hedged requests y streaming. Para E-Commerce Platform, una búsqueda de productos que impacta 3 réplicas de Elasticsearch y usa la primera respuesta reduce el p99 significativamente.

---

### 8. [Cuestionar] ¿Es el patron API Gateway un cuello de botella y un potencial "God Object" que contradice los principios de desacoplamiento de microservicios? La crítica de la comunidad de "Backends for Frontends."

**Respuesta**: La crítica del patrón API Gateway es que concentra cross-cutting concerns (autenticación, rate limiting, ruteo) y potencialmente lógica de orquestación (agregación de respuestas) en un solo componente, creando un nuevo "God Object" que contradice la descentralización de microservicios. Phil Calçado y la comunidad BFF argumentan que el API Gateway debería limitarse a ruteo y cross-cutting concerns, delegando la orquestación a Backends for Frontends. Sam Newman es más matizado: un API Gateway gestionado por un equipo de plataforma funciona bien si se limita a ruteo; si empieza a contener lógica de negocio, se convierte en un monolito de infraestructura.

**Por qué**: La clase presentó API Gateway como componente natural de microservicios sin discutir sus riesgos. La evidencia de organizaciones como SoundCloud (que migró de API Gateway a BFF) y ThoughtWorks Tech Radar (que marca API Gateway como "Adopt" con advertencias) sugiere que el API Gateway debe ser "dumb" (ruteo) y la orquestación debe estar en BFFs propiedad de equipos de producto.

---

### 9. [Cuestionar] ¿Es realmente necesario un Service Mesh como Istio para la mayoría de proyectos, o es over-engineering para sistemas que no operan a escala Netflix? Contrastá con la opinión de Kelsey Hightower.

**Respuesta**: Kelsey Hightower (Google Cloud) ha declarado en múltiples conferencias que "Istio is for people with Netflix-scale problems" y que para el 95% de los proyectos, la complejidad operacional de un service mesh (sidecars, configuración de mTLS, Pilot, Mixer, etc.) supera sus beneficios. Alternativas más simples: (1) CNI-based networking (Cilium sin sidecar), (2) API Gateway con mTLS en la capa de aplicación, o (3) managed services que abstraen la malla (AWS App Mesh, GCP Traffic Director). La defensa de Istio (por Louis Ryan, ex-Google) es que el mTLS automático y la observabilidad uniforme son necesarios incluso para sistemas de escala media si la seguridad es prioridad, y que Istio Ambient Mesh (2022) reduce la complejidad eliminando sidecars.

**Por qué**: La clase presentó Service Mesh sin discutir el tradeoff de complejidad. La evidencia está en el debate de la industria: Linkerd se posiciona como "service mesh para el resto de nosotros" (más simple que Istio), y muchos equipos que adoptaron Istio en 2019-2021 están migrando a alternativas más simples o a Istio Ambient.

---

### 10. [Cuestionar] ¿La comunicación síncrona (REST/gRPC) es inherentemente inferior a la asíncrona (eventos) para arquitecturas modernas, o hay un sesgo reciente contra REST que ignora sus ventajas?

**Respuesta**: Hay un sesgo creciente en la comunidad de arquitectura que demoniza REST como "legacy" y promueve EDA como "moderno." Sin embargo, REST tiene ventajas que los eventos no replican: (1) **simplicidad cognitiva**: un desarrollador junior entiende REST; EDA requiere razonar sobre consistencia eventual, idempotencia y ordenamiento, (2) **depuración**: un request REST tiene start y end claros; un flujo de eventos es difícil de trazar, (3) **contratos explícitos**: OpenAPI/Swagger genera documentación interactiva; los eventos requieren Schema Registry + documentación manual, (4) **transaccionalidad**: REST con ACID es inmediato; eventos con Saga son complejos. La postura sensata de Martin Fowler es "use synchronous by default, go asynchronous when you need decoupling or resilience."

**Por qué**: La clase presentó REST y EDA como opciones con pros/cons, pero la narrativa de la industria empuja hacia eventos. Fowler y Sam Newman advierten contra el "event-driven by default": solo es necesario cuando el desacoplamiento temporal y la resiliencia son requisitos reales, no aspiracionales. Para E-Commerce Platform, REST para operaciones transaccionales (crear pedido, procesar pago) y eventos para notificaciones (enviar email, actualizar dashboard).

---

