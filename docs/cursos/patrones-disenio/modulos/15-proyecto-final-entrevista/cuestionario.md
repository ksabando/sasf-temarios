---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Cómo implementarías el sistema con Axon Framework (CQRS + Event Sourcing)? ¿Cómo cambiaría el diseño de la clase?

**Por qué**: Axon Framework (Allard Buijze, 2010) es la implementación Java de CQRS/Event Sourcing. La documentación de Axon muestra cómo modelar un sistema de notificaciones. Spring + Axon es una stack común. La diferencia con la clase: la clase usa patrones GoF intra-proceso; Axon usa patrones de arquitectura distribuida (Command Bus, Event Bus, Event Store).

---

### 3. [Investigar] ¿Qué es el patrón "Priority Queue + Worker" (o "Job Queue") y cómo se compararía con el pipeline de Chain of Responsibility + Strategy de la clase para manejar notificaciones de alta prioridad?

**Por qué**: Amazon SQS Priority Queue pattern, RabbitMQ priority queues, y Redis `BZPOPMAX` implementan este patrón. Ruby `Sidekiq` y Python `Celery` son workers con colas de prioridad. En Java, Spring `@Async` + `TaskExecutor` con `PriorityBlockingQueue` implementa una versión simplificada.

---

### 4. [Investigar] ¿Cómo aplicarías el patrón "Bulkhead" (Michael Nygard, Release It!) al sistema de notificaciones para aislar fallos entre canales?

**Respuesta**: **Bulkhead** (compartimento estanco de un barco) aísla recursos para que un fallo en un componente no hunda todo el sistema. Aplicado al sistema de notificaciones: (1) **Thread pool por canal**: un `ThreadPoolExecutor` dedicado para email (10 threads), otro para SMS (10 threads), otro para push (10 threads). Si el proveedor de SMS se cuelga y todas las threads SMS se bloquean, email y push siguen funcionando — no se agotan todas las threads del sistema. (2) **Circuit Breaker por canal**: cada adapter tiene su propio `CircuitBreaker` con configuración independiente (SMS puede ser más sensible a fallos que email). (3) **Timeouts por canal**: `email.enviar()` con timeout 30s, `sms.enviar()` con timeout 5s (diferentes expectativas de latencia). (4) **Rate limiting por canal**: cada adapter tiene su propio `RateLimiter` para no saturar al proveedor externo (SMS Vonage permite 100 req/s; Email SMTP permite 50 req/s). Bulkhead se implementa con Strategy + Proxy: cada adapter es una Strategy de envío, y un `BulkheadProxy` envuelve cada adapter con thread pool + circuit breaker + timeout dedicados. Spring `@Async` con `TaskExecutor` dedicado implementa bulkhead de threads. Resilience4j `Bulkhead` y `ThreadPoolBulkhead` implementan el patrón.

**Por qué**: Michael Nygard define Bulkhead en "Release It!" (2007, 2da ed. 2018). Netflix Hystrix implementaba bulkhead con thread pools. Resilience4j (Robert Winkler, 2019) implementa `Bulkhead` (semáforo) y `ThreadPoolBulkhead` (thread pool). El patrón previene el "failure domino effect" — cuando un servicio lento consume todas las threads disponibles y cascades fallos a servicios saludables.

---

**Respuesta**: Apache Camel (James Strachan, 2007) implementa Pipelines con DSL declarativo que corresponde exactamente al pipeline de la clase:
```java
from("direct:notificaciones")
    .validate(body().isNotNull())                                // Chain: Validador
    .transform().simple("${body.mensaje} - Enviado ${date:now}")  // Chain: Transformador
    .enrich("direct:metadata", aggregationStrategy)              // Chain: Enriquecimiento
    .choice().when(header("prioridad").isEqualTo("ALTA"))        // Strategy: SeleccionCanal
        .to("bean:emailSender")                                  // Adapter: Email
    .otherwise()
        .to("bean:smsSender")                                    // Adapter: SMS
    .end()
    .bean("loggingDecorator")                                    // Decorator: Logging
    .bean("seguridadDecorator")                                  // Decorator: Seguridad
    .wireTap("direct:auditoria");                                // Observer: Auditoria
```
La diferencia con la clase: (a) la clase construye el pipeline programáticamente (encadenando objetos Java), Camel lo hace declarativamente (DSL), (b) Camel maneja errores con `onException()` y redelivery policies, (c) Camel soporta 200+ componentes (HTTP, JMS, AMQP, FTP, etc.) como adapters pre-construidos, (d) Camel tiene soporte nativo para EIP (splitter, aggregator, content-based router, wire tap). El pipeline de la clase es una implementación manual; Camel es la plataforma de integración que implementa todos esos patrones.

**Por qué**: James Strachan creó Camel como implementación de EIP (Hohpe & Woolf). La documentación de Camel mapea cada patrón EIP a su DSL. Claus Ibsen (Red Hat) mantiene Camel. Spring Boot + Camel es una stack común para integración. La diferencia con la clase: la clase enseña los patrones; Camel los implementa en una plataforma de integración lista para producción.

---

### 6. [Conectar] La clase usa Observer para eventos del ciclo de vida de la notificación. Conectá esto con OpenTelemetry (Observabilidad): ¿cómo los eventos de Observer se convierten en spans, métricas y logs?

**Respuesta**: OpenTelemetry (CNCF, merger de OpenTracing + OpenCensus, 2021) captura telemetría mediante **Observer automatizado**. En el sistema de notificaciones: (1) **Spans**: cada paso del pipeline (validar, transformar, enriquecer, seleccionar canal, enviar) se instrumenta como un Span dentro de un Trace. El Observer de eventos (`NotificacionEnviada`, `NotificacionFallida`) crea spans y los envía al collector, (2) **Métricas**: los eventos se agregan en métricas: `notificaciones_enviadas_total`, `notificaciones_fallidas_total` (Counter), `notificacion_latencia_ms` (Histogram). Los Observers actualizan estas métricas via `Meter`, (3) **Logs**: cada evento se registra como log estructurado con `spanId` y `traceId` para correlación. La conexión: Observer GoF es el patrón de notificación; OpenTelemetry es el Observer de INFRAESTRUCTURA que se suscribe automáticamente (via auto-instrumentation) a todos los eventos del sistema. Spring Boot 3+ integra Micrometer Tracing (basado en OpenTelemetry). Los `@EventListener` de la clase pueden convertirse en `@Observed` spans automáticamente. La clase enseña Observer manual; OpenTelemetry es Observer como servicio de plataforma.

**Por qué**: OpenTelemetry es un proyecto CNCF (Google, Microsoft, Splunk, Lightstep). Spring Boot 3+ (2022) usa Micrometer + Micrometer Tracing, integrando OpenTelemetry como el estándar de observabilidad. El `ObservationRegistry` de Micrometer es un Observer mejorado que captura spans, métricas, y logs simultáneamente.

---

### 7. [Conectar] La clase evalúa el proyecto con 5 criterios. Conectá esto con el modelo de Arquitectura C4: ¿cómo documentarías el proyecto final con C4 para la presentación oral?

**Por qué**: Simon Brown creó C4 Model para comunicación con stakeholders no técnicos. En la evaluación del proyecto final (20% presentación oral), C4 es más efectivo que UML porque: (a) el jurado entiende la arquitectura general primero, (b) el zoom progresivo evita saturación de información, (c) C4 + notación GoF en el nivel Code es la combinación óptima para un proyecto de patrones.

---

### 8. [Cuestionar] ¿Debería el proyecto final incluir tests de performance (JMeter, Gatling) o solo tests unitarios y de integración? ¿Es la performance responsibility del diseño de patrones?

**Respuesta**: La performance ES responsabilidad del diseño de patrones. Cada patrón tiene un **costo de performance**: (1) **Decorator** agrega una capa de indirección (virtual dispatch) por cada decorador en la cadena, (2) **Strategy** seleccionada en runtime requiere un dispatch dinámico, (3) **Chain of Responsibility** recorre handlers secuencialmente hasta encontrar el adecuado, (4) **Observer** itera una lista de listeners en cada notificación. Estos costos son típicamente insignificantes (< 1ms por operación), pero en un sistema de notificaciones con 10,000 notificaciones/segundo, una cadena de 5 decorators + 3 observers suma latencia. El proyecto final DEBERÍA incluir: (a) tests de performance básicos con JMH (microbenchmarks) para medir la latencia del pipeline, (b) un test de throughput con JMeter/Gatling para el endpoint de envío, (c) comparación de la implementación con patrones vs una implementación naive (sin patrones) — para demostrar que los patrones no sacrifican performance significativamente. La performance no es solo "hacerlo rápido" — es "no hacerlo innecesariamente lento." Los patrones bien aplicados TIENEN que ser performantes; si no lo son, están mal implementados o son el patrón equivocado para ese throughput.

**Por qué**: GoF (p. 23) mencionan performance como una "consecuencia" de cada patrón. Martin Fowler en "Patterns of Enterprise Application Architecture" discute performance trade-offs de Repository, Unit of Work, etc. En sistemas reales, el overhead de patrones es típicamente < 5% comparado con el I/O (BD, red), que domina la latencia. Java 21 Virtual Threads + patrones = performance de C sin cambiar el diseño.

---

### 9. [Cuestionar] ¿Es correcto usar 14 patrones en un solo proyecto como propone la clase, o es Pattern Obsession? ¿Cuál sería la versión "mínima viable" del sistema de notificaciones?

**Por qué**: La clase misma advierte en M01 sobre "Pattern Obsession." La presentación oral (5 min de trade-offs) debe incluir esta reflexión: "Empezamos con X patrones mínimos; agregamos Y cuando surgió la necesidad Z." Esto demuestra madurez: conocés los patrones pero aplicás los que el problema requiere.

---

### 10. [Cuestionar] Si tuvieras que defender el proyecto en una entrevista, ¿qué argumentarías cuando el entrevistador dice "esto es over-engineered"? ¿Cómo justificarías cada patrón?

**Por qué**: Esta es la pregunta clave de la entrevista: evalúa si aplicaste patrones por el patrón en sí o porque resolvían un problema concreto. La respuesta debe: (a) reconocer que en producción empezarías con menos patrones, (b) justificar cada patrón con un REQUISITO del proyecto (no con teoría), (c) reconocer trade-offs (complejidad vs flexibilidad). GoF INTRODUCCI—N dice: "Design patterns should not be applied indiscriminately. Often they achieve flexibility and variability by introducing additional levels of indirection, and that can complicate a design." La madurez es saber CUÁNDO aplicar y CUÁNDO NO aplicar.

