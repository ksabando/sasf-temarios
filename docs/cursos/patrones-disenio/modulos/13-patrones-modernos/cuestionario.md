---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Sidecar" en Kubernetes y cómo se relaciona con Decorator? ¿Por qué un sidecar es un Decorator a nivel de infraestructura?

**Respuesta**: **Sidecar** (Brendan Burns, Kubernetes patterns) es un contenedor auxiliar que se ejecuta junto al contenedor principal en el mismo Pod, agregando funcionalidad sin modificar la aplicación principal. Es un **Decorator a nivel de infraestructura**: (1) **Misma interfaz (red)**: el sidecar intercepta o complementa el tráfico de red del contenedor principal, (2) **Agrega responsabilidades**: logging (Fluentd sidecar), mTLS (Envoy sidecar en Istio), secret management (Vault agent sidecar), (3) **Composable**: podés agregar/quitar sidecars sin modificar la aplicación (`deployment.yaml`). La diferencia con Decorator GoF: (a) Decorator es intra-proceso (objetos en la misma JVM); Sidecar es inter-proceso (contenedores en el mismo Pod compartiendo network namespace y volumen), (b) la comunicación es via localhost o shared volume, no via llamadas a métodos, (c) el sidecar es gestionado por Kubernetes (inyectado via admission webhook), no por la aplicación. La analogía es exacta: la aplicación no sabe que el sidecar existe, igual que el componente decorado no sabe que el decorator existe.

**Por qué**: Brendan Burns (co-creador de Kubernetes) y Joe Beda documentaron Sidecar en "Designing Distributed Systems" (2018). Istio (Google, IBM, Lyft) implementa sidecar con Envoy para service mesh. En Kubernetes 1.29+ (2024), los sidecars tienen soporte nativo (`initContainers` con `restartPolicy: Always`).

---

### 3. [Investigar] ¿Qué es el patrón "Backend for Frontend" (BFF, Sam Newman) y cómo se relaciona con Facade, Adapter y Gateway? ¿Por qué GraphQL es un BFF natural?

**Respuesta**: **BFF** (Sam Newman, 2015) es un patrón donde cada frontend (web, mobile, IoT) tiene su propio backend intermedio que: (1) agrega datos de múltiples microservicios (Facade), (2) adapta los datos al formato óptimo para ese frontend específico (Adapter), (3) maneja autenticación específica del cliente (Proxy de protección). Un BFF es esencialmente un **Facade + Adapter + Gateway especializado por cliente**. GraphQL es un BFF natural porque: (a) el cliente especifica EXACTAMENTE qué datos necesita (no overfetching/underfetching), (b) el schema unifica múltiples fuentes de datos (Facade), (c) los resolvers adaptan cada fuente al schema unificado (Adapter), (d) Apollo Federation permite múltiples BFFs colaborando (cada subgraph es un BFF de su dominio). La diferencia con API Gateway: API Gateway es genérico (rate limiting, auth, routing); BFF es específico por cliente (la app iOS necesita datos diferentes que la web, en formatos diferentes).

**Por qué**: Sam Newman documentó BFF en "Pattern: Backends For Frontends" (2015) y en "Building Microservices" (2nd ed, 2021). Phil Calçado popularizó la implementación en SoundCloud. Netflix tiene BFFs por dispositivo (TV, mobile, web). GraphQL (Facebook, 2015) es BFF como servicio: Apollo Router + subgraphs = BFF distribuido.

---

### 4. [Investigar] ¿Qué es el patrón "Change Data Capture" (CDC) y cómo se relaciona con Observer, Outbox y Event Sourcing en el ecosistema Debezium + Kafka?

**Por qué**: Debezium fue creado por Gunnar Morling (Red Hat) y es el estándar de CDC para JVM. La documentación explica cómo reemplaza el Outbox Pattern con "Outbox Event Router." En microservicios, CDC + Kafka Connect permite que un servicio consuma cambios de la BD de otro servicio sin acoplamiento directo. Amazon DMS, Google CDC, y Oracle GoldenGate son equivalentes.

---

### 5. [Conectar] La clase presenta Null Object con `NullDescuento`. Conectá esto con el patrón "Special Case" (Martin Fowler) y con `Optional` de Java: ¿cuándo Null Object es superior a Optional y viceversa?

**Respuesta**: **Special Case** (Fowler, PoEAA) es una generalización de Null Object. Mientras Null Object solo maneja el caso "no hay objeto", Special Case maneja CUALQUIER caso especial con comportamiento específico: `DescuentoVIP`, `DescuentoEstudiante`, `SinDescuento` (null object), `DescuentoEmpleado`. **Null Object vs Optional**: (1) Null Object es mejor cuando el objeto tiene COMPORTAMIENTO (interfaz con métodos) — ej. `Descuento.aplicar(monto)` devuelve `monto` sin ningún `if`, (2) Optional es mejor cuando solo necesitás saber SI hay valor y actuar en consecuencia — ej. `optionalDescuento.ifPresent(d -> d.aplicar(monto))` hace explícita la ausencia, (3) Null Object encapsula el comportamiento neutro EN el objeto (polimorfismo); Optional fuerza al cliente a manejar la ausencia, (4) Null Object permite que el polimorfismo resuelva el comportamiento; Optional requiere verificación explícita en el cliente. Fowler recomienda Special Case sobre Null Object cuando hay más de un "caso sin el objeto real" con comportamientos diferentes. Spring `NoOp` beans son Null Objects.

**Por qué**: Martin Fowler define Special Case en PoEAA (2002) y en su blog. En Java: `Collections.emptyList()` es Null Object para `List`; `Optional.empty()` es Optional. Joshua Bloch (Effective Java Item 55) recomienda Optional para valores de retorno, pero Null Object para comportamiento polimórfico. La regla: si la ausencia implica comportamiento DIFERENTE, usá Null Object; si la ausencia requiere que el cliente decida qué hacer, usá Optional.

---

### 6. [Conectar] La clase explica Outbox Pattern con un `@Scheduled`. Conectá esto con Debezium CDC: ¿cómo Debezium elimina la necesidad de polling manual y qué arquitectura de eventos emerge?

**Respuesta**: Debezium elimina el polling manual (`@Scheduled`) reemplazándolo con **CDC basado en WAL**: en lugar de `SELECT * FROM outbox WHERE enviado = false` cada 5 segundos, Debezium lee el WAL de PostgreSQL (via plugin `decoderbufs` o `pgoutput`) en tiempo real. Cada INSERT en la tabla `outbox` genera un evento en Kafka en milisegundos. La arquitectura: (1) El servicio escribe en `outbox` en la misma transacción (misma BD), (2) Debezium detecta el cambio en el WAL y publica en Kafka topic `outbox.event`, (3) Un **Outbox Event Router** (SMT — Single Message Transform de Kafka Connect) transforma el mensaje genérico de Debezium al evento de dominio (`PedidoCreado`), (4) Los consumidores downstream leen de ese topic. Esto es superior al polling porque: (a) **latencia**: milisegundos vs segundos, (b) **sin locks**: el poller no compite por locks de tabla BD, (c) **sin carga en BD**: el poller no ejecuta `SELECT` periódicos, (d) **orden garantizado**: eventos en el orden exacto del WAL. El costo: mayor complejidad de infraestructura (Kafka + Debezium + Kafka Connect).

**Por qué**: La documentación de Debezium describe Outbox Event Router como la integración canónica CDC + Outbox. Gunnar Morling presentó esto en Kafka Summit 2019. En 2026, CDC + Outbox es el estándar para event-driven architectures con microservicios. Spring Boot + Debezium + Kafka es la stack Java canónica.

---

### 7. [Conectar] La clase muestra Saga con compensación. Conectá esto con el patrón "Routing Slip" (EIP, Hohpe & Woolf): ¿cómo un routing slip implementa una Saga como una cadena dinámica de Commands?

**Respuesta**: **Routing Slip** (Enterprise Integration Patterns, Hohpe & Woolf, 2003) es un mensaje que contiene su propia ruta: un header con la lista de destinos que debe visitar, en orden. Cada destino procesa el mensaje y lo envía al siguiente en la lista. Esto implementa una **Saga como cadena dinámica de Commands**: (1) el `RoutingSlip` es una lista de `(comando, compensacion)`, (2) el mensaje viaja por cada paso, (3) si un paso falla, el mensaje retrocede ejecutando las compensaciones en orden inverso, (4) el routing slip se modifica a medida que el mensaje avanza (se eliminan pasos completados). La diferencia con Saga orquestada: en la Saga orquestada, el orquestador llama a cada servicio secuencialmente; en Routing Slip, el mensaje MISMO contiene la ruta y cada servicio sabe a quién enviarlo después. Es más desacoplado (no hay orquestador central) pero también más difícil de monitorear. Apache Camel implementa `routingSlip()` nativamente. En microservicios, el routing slip puede ir en un header del mensaje Kafka (`routing-slip: ["inventario", "pago", "envio"]`) y cada consumidor lo lee y reenvía.

**Por qué**: Gregor Hohpe y Bobby Woolf documentaron Routing Slip en Enterprise Integration Patterns (2003). Es un Chain of Responsibility dinámico donde la cadena se define en el mensaje, no en el código. En sistemas modernos, AWS Step Functions y Azure Logic Apps implementan Saga con routing slip como JSON de estados.

---

### 8. [Cuestionar] ¿Es Event Sourcing sobre-ingeniería para el 90% de las aplicaciones? ¿Cuándo realmente justifica su complejidad?

**Respuesta**: Event Sourcing es **sobre-ingeniería para la mayoría de aplicaciones CRUD**. Justifica su complejidad SOLO cuando: (1) **Auditoría completa es requisito legal/financiero**: necesitás saber exactamente qué pasó, en qué orden, quién lo hizo — imposible con state-based persistence (solo ves el estado final), (2) **Necesitás reconstruir estados pasados**: debugging temporal, proyecciones retroactivas, análisis de "qué hubiera pasado si", (3) **Múltiples proyecciones/materialized views**: diferentes consumidores necesitan diferentes representaciones de los mismos eventos (CQRS), (4) **Eventos como producto**: tu dominio ES los eventos (trading system, IoT, logística en tiempo real). NO justifica Event Sourcing cuando: (a) la aplicación es CRUD con lógica de negocio simple, (b) solo necesitás el estado actual, (c) los eventos no tienen significado de negocio (solo INSERT/UPDATE/DELETE), (d) el equipo no tiene experiencia con Event Sourcing (la complejidad accidental supera el beneficio). La respuesta honesta: pocas aplicaciones necesitan Event Sourcing. Usalo si trabajás en fintech, healthcare audit, e-commerce con historial de precios, o logística de paquetes. De lo contrario, CRUD con auditoría basada en triggers o CDC es suficiente.

**Por qué**: Greg Young (creador de Event Sourcing) ha dicho repetidamente: "Event Sourcing is not for everyone. Use it when you need to know WHY your system is in the current state, not just WHAT the current state is." Martin Fowler documenta este trade-off en su artículo "Event Sourcing" (2005). Udi Dahan (NServiceBus) sugiere usar Event Sourcing solo para "core domain" bounded contexts.

---

### 9. [Cuestionar] ¿Es la arquitectura de microservicios un conjunto de Anti-Corruption Layers y Sagas, o es una aplicación legítima de patrones GoF a gran escala? ¿O es un nuevo Golden Hammer?

**Respuesta**: Los microservicios son **una aplicación legítima de patrones GoF + patrones distribuidos**, pero se convierten en Golden Hammer cuando se aplican indiscriminadamente. Son una aplicación legítima porque: (1) cada servicio internamente usa patrones GoF (Strategy, Factory, Repository, Observer), (2) la comunicación entre servicios usa patrones de integración (Gateway, ACL, Saga, Outbox, Circuit Breaker), (3) la descomposición por bounded contexts (DDD) es una aplicación del principio Single Responsibility a nivel de servicio. Se convierte en Golden Hammer cuando: (a) un equipo de 3 personas divide una app simple en 12 microservicios (sobrecarga de infraestructura, latencia, debugging), (b) cada microservicio tiene su propia BD pero no hay consistencia eventual manejada (Saga mal implementada), (c) la organización adopta microservicios "porque Netflix lo hace" sin tener la madurez DevOps necesaria. La crítica correcta no es "los microservicios son malos"; es "los microservicios NO son la opción por defecto." Martin Fowler y Sam Newman recomiendan empezar con un monolith modular (modulith) y extraer microservicios cuando el crecimiento del equipo y la carga lo justifiquen.

**Por qué**: Martin Fowler (2015, "Microservice Prerequisites") enumera las capacidades necesarias antes de adoptar microservicios. Sam Newman ("Building Microservices", 2nd ed.) dedica un capítulo a "When Not to Use Microservices." La comunidad está convergiendo en "monolith first, microservices when needed."

---

### 10. [Cuestionar] ¿Son los patrones modernos (Outbox, CQRS, Saga, Circuit Breaker) realmente nuevos, o son adaptaciones de patrones GoF a sistemas distribuidos? Investigá sus raíces en GoF.

