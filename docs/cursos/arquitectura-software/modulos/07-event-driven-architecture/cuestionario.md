---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Event Collaboration" (Martin Fowler) y cómo se diferencia del "Event Notification" que predomina en la clase?

**Respuesta**: Martin Fowler, en su artículo *"What do you mean by 'Event-Driven'?"* (2017), distingue tres tipos de eventos. **Event Notification**: un evento ligero que notifica que algo ocurrió, sin payload significativo (ej: `OrderCreated { orderId: 123 }`), y el consumidor debe consultar al productor para obtener detalles. **Event-Carried State Transfer**: el evento contiene todos los datos necesarios para que el consumidor actúe sin consultar al productor (ej: `OrderCreated { orderId, customerId, total, items: [...] }`). **Event Sourcing**: eventos como fuente de verdad. La clase se enfocó en Event Notification y Event Sourcing, pero no cubrió Event-Carried State Transfer, que es el patrón más común en microservicios porque maximiza autonomía (el consumidor no necesita consultar al productor).

**Por qué**: Fowler observa que el término "event-driven" es sobrecargado y propone esta taxonomía para clarificar. El Event-Carried State Transfer es el patrón de facto en Kafka: los eventos son el contrato completo, no una notificación. La decisión arquitectónica clave es cuánto estado llevar en el evento: poco estado = eventos pequeños pero consumidores acoplados al productor; mucho estado = eventos grandes pero consumidores autónomos. La clase no abordó este tradeoff.

---

### 3. [Investigar] ¿Qué es el "Outbox Pattern" con Debezium vs implementación manual y cuál es la postura de Gunnar Morling sobre cuándo usar cada uno?

**Respuesta**: Gunnar Morling (líder de Debezium) argumenta que la implementación manual del Outbox Pattern (escribir en tabla outbox + scheduled task que publica) tiene riesgos: polling introduce latencia, puede fallar si el scheduler muere, y no escala bien a alto volumen. Debezium usa CDC para leer el log de transacciones de PostgreSQL en tiempo real, detectar INSERT en la tabla outbox y publicar a Kafka con latencia sub-segundo. Morling reconoce que Debezium agrega complejidad operacional (conectores, configuración de WAL), y recomienda implementación manual para sistemas pequeños (<100 eventos/segundo) y Debezium para sistemas de alto volumen con requisitos de baja latencia.

**Por qué**: La clase presentó el Outbox Pattern manual, pero no discutió alternativas CDC. El debate en la comunidad es: la solución simple (outbox manual) vs la solución robusta pero compleja (Debezium). Para E-Commerce Platform con tráfico moderado, el outbox manual es suficiente; para un sistema de pagos con miles de eventos/segundo, Debezium reduce el riesgo de pérdida de eventos.

---

### 4. [Investigar] ¿Qué es el patrón "Event Interception" y cómo lo usa Netflix con Mantis para procesar eventos en tiempo real sin el overhead de Kafka Streams?

**Por qué**: La clase cubrió productores y consumidores, pero no el patrón de interceptación transparente que permite observabilidad sin acoplamiento. Netflix y observadores de la industria (Adrian Cockcroft, ex-Netflix) documentan que la capacidad de "escuchar" eventos sin modificar productores es clave para evolucionar sistemas EDA sin romper contratos. Para E-Commerce Platform, un interceptor podría medir latencia de procesamiento de pedidos sin tocar el código de OrderService.

---

### 5. [Conectar] La clase cubre la coreografía como EDA puro. ¿Cómo se relaciona esto con el "Routing Slip Pattern" (Gregor Hohpe, Enterprise Integration Patterns) y cuándo es superior a la coreografía pura?

**Respuesta**: Gregor Hohpe, en *Enterprise Integration Patterns* (2003), describe el Routing Slip como un mensaje que contiene su propia ruta: el mensaje lleva una lista de destinos, y cada procesador ejecuta su paso y pasa al siguiente destino de la lista. Esto es una forma de orquestación descentralizada: no hay un orquestador central, pero el flujo está explícito en el mensaje. Se diferencia de la coreografía pura (donde el flujo es implícito) y de la orquestación central (donde un Saga Manager mantiene el flujo). Es superior a la coreografía pura cuando el flujo es complejo pero no justifica un orquestador central.

---

### 6. [Conectar] La clase menciona garantías de entrega (at-most-once, at-least-once, exactly-once). ¿Cómo implementa Apache Kafka "exactly-once semantics" (EOS) y qué limitaciones tiene según la documentación oficial?

**Respuesta**: Kafka implementa exactly-once semantics a través de: (1) idempotent producers (cada mensaje tiene un sequence number, el broker deduplica mensajes repetidos), (2) transactional API (productores escriben múltiples topics atómicamente con `initTransactions()`, `beginTransaction()`, `commitTransaction()`), y (3) consumer offset commit dentro de la misma transacción (read-process-write como unidad atómica). Las limitaciones documentadas: EOS requiere `acks=all` (latencia mayor), no funciona con consumidores que procesan eventos externamente (side effects sin rollback), y solo garantiza exactly-once dentro del scope de Kafka —no cubre efectos externos (enviar email, llamar API REST).

**Por qué**: La documentación oficial de Kafka (KIP-98, KIP-129, KIP-447) detalla EOS, y Jay Kreps ha escrito sobre sus limitaciones. La clase presentó exactly-once como ideal alcanzable con idempotencia, pero en la práctica es complejo y con limitaciones. Para E-Commerce Platform, exactly-once entre OrderService y PaymentService vía Kafka es posible; exactly-once incluyendo el envío de email de confirmación no lo es.

---

### 7. [Conectar] La clase muestra Kafka vs RabbitMQ como brokers alternativos. ¿Dónde encaja NATS en este espectro y qué propone Derek Collison con su arquitectura "fire and forget" + JetStream?

**Respuesta**: Derek Collison (creador de NATS) diseñó NATS como un sistema de mensajería de máxima simplicidad y performance: protocolo de texto simple, arquitectura "always on, always available", y latencia sub-milisegundo. NATS Core es at-most-once (fire and forget), ideal para telemetría y eventos donde perder un mensaje es aceptable. Con **JetStream** (2021), NATS agregó persistencia, al-least-once, consumer groups y stream processing, compitiendo más directamente con Kafka pero con menor complejidad operacional. NATS/JetStream ocupa un nicho entre RabbitMQ (simple, baja performance) y Kafka (alta performance, alta complejidad): performance cercana a Kafka con complejidad cercana a RabbitMQ.

**Por qué**: La clase cubrió Kafka y RabbitMQ como los dos extremos, pero NATS+JetStream es una tercera opción relevante para EDA. Collison presenta NATS en numerosas charlas como "la respuesta a Kafka para equipos que no tienen 10 ingenieros para operar Kafka." Para E-Commerce Platform, si no necesitás retención de eventos por días ni procesamiento de streams complejos, NATS+JetStream puede ser más simple y rápido.

---

### 8. [Cuestionar] ¿Es la coreografía más frágil que la orquestación para procesos de negocio complejos? ¿Qué dice la evidencia de Uber y su migración de coreografía a orquestación?

**Respuesta**: Uber comenzó con coreografía pura (eventos entre servicios) y migró a orquestación con Cadence (su motor de workflows) porque la coreografía se volvió inmanejable a escala: los flujos implícitos hacían imposible saber el estado de un proceso, y agregar un paso requería modificar múltiples servicios. El equipo de Uber (Maxim Fateev, creador de Cadence/Temporal) documentó que para procesos con >10 pasos, ramificaciones condicionales, timeouts y compensaciones, la orquestación con un workflow engine es superior. La coreografía es ideal para flujos simples y desacoplados (ej: notificar a múltiples servicios que un pedido fue creado, donde cada servicio hace algo independiente).

**Por qué**: La experiencia de Uber con Cadence y luego Temporal (open source) es el caso de estudio canónico sobre los límites de la coreografía. La clase presentó coreografía y orquestación como opciones con pros y contras, pero no citó evidencia concreta de cuándo una falla. La lección de Uber: coreografía para integración desacoplada; orquestación para procesos de negocio complejos con estado.

---

### 9. [Cuestionar] ¿La obsesión con la nomenclatura de eventos en pasado (OrderCreated) es dogmatismo o tiene fundamento práctico? Contrastá con la postura de quienes usan imperativo en eventos.

**Respuesta**: El argumento a favor del pasado (Greg Young, comunidad DDD) es que un evento describe un hecho inmutable que ocurrió: no podés rechazar un evento porque "ya no es verdad." Si usás imperativo o presente (CreateOrder, OrderProcessing), el evento se convierte en un comando encubierto, y los consumidores pueden "rechazarlo" como si fuera una petición. Quienes usan imperativo argumentan que en mensajería empresarial tradicional (RabbitMQ, NServiceBus), los comandos y eventos coexisten, y el tiempo verbal es secundario al contrato. Udi Dahan, creador de NServiceBus, usa comandos en imperativo para mensajes dirigidos y eventos en pasado para notificaciones.

**Por qué**: La clase presentó el naming en pasado como convención, pero no la controversia. El valor real no es el tiempo verbal sino la semántica: un evento en pasado es un hecho consumado (no negociable), un mensaje en imperativo es una solicitud (negociable). Para E-Commerce Platform: `OrderCreated` (hecho) vs `ChargeCustomer` (solicitud que podría fallar) —son semánticamente distintos más allá del tiempo verbal.

---

### 10. [Cuestionar] ¿La Event-Driven Architecture es incompatible con la simplicidad? El debate entre "lo simple" (Rich Hickey, Clojure) y "lo desacoplado" (comunidad EDA).

**Respuesta**: Rich Hickey, en sus charlas *"Simple Made Easy"* (2011), distingue "simple" (una sola responsabilidad, sin entrelazamiento) de "easy" (fácil de empezar, pero complejo a largo plazo). Hickey argumenta que los sistemas EDA entrelazan tiempo, estado e identidad de formas que son "complex" (lo opuesto a simple). La comunidad EDA (Jay Kreps, Martin Kleppmann) responde que la complejidad no es de la arquitectura sino del dominio: si tu dominio es inherentemente distribuido y asíncrono (e-commerce, IoT, banca), modelarlo con REST síncrono es una simplificación falsa que explota en producción. La EDA expone la complejidad del dominio en lugar de esconderla detrás de abstracciones que fallan.

**Por qué**: Este debate filosófico tiene consecuencias prácticas. Hickey recomienda modelar con datos inmutables y procesos puros; EDA propone eventos inmutables y procesamiento de streams —hay convergencia conceptual aunque Hickey critique el ecosistema. La clase presentó EDA como herramienta, no como filosofía de diseño. La advertencia de Hickey es válida: no conviertas un CRUD simple en un festival de eventos si no es necesario.

---

