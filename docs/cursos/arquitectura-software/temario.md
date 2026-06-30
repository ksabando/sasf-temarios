---
sidebar_position: 2
sidebar_label: "Temario"
---

## Módulo 02 — Estilos Arquitectónicos

- ¿Qué es un estilo arquitectónico? Patrón de diseño a nivel de sistema
- Monolito: todo en un solo proceso/despliegue. Ventajas (simple, bajo latency) vs desventajas (escalado, acoplamiento)
  - Ventajas: separación de responsabilidades, familiar
  - Desventajas: sangría de capas, acoplamiento, "big ball of mud" a largo plazo
- Pipes-and-Filters: procesamiento de datos en cadena. Unix pipes, ETL, Stream processing
- Cliente-Servidor: frontend-backend. Dos tiers, three tiers, n-tier
- Peer-to-Peer: nodos iguales, descentralizado. BitTorrent, blockchain
- Space-Based Architecture (Tuple Spaces): JavaSpaces, Linda. Escalado horizontal puro
- Microkernel (Plugin Architecture): núcleo mínimo + plugins extensibles. Eclipse, VS Code
- Event-Driven Architecture: productores, consumidores, brokers (Event-Driven vs Request-Driven)
- Service-Based Architecture: grandes servicios modulares vs microservicios
- Criterios de selección de estilo: dominio, atributos de calidad, equipo, organización, tecnología
- Laboratorio: identificar estilo arquitectónico de sistemas existentes (Netflix, Uber, Amazon, WordPress), diagramar arquitectura propuesta para E-Commerce Platform

---

## Módulo 03 — Domain-Driven Design (DDD)

- Domain-Driven Design: Eric Evans (2003). El dominio es el corazón del software
- Domain vs Subdomain: dominio principal (core), subdominios de soporte, subdominios genéricos
- Ubiquitous Language: lenguaje común entre expertos de negocio y desarrolladores. Glosario compartido
- Bounded Context: límite explícito donde un modelo de dominio es válido. Context Map
  - Relaciones entre contextos: partnership, shared kernel, customer-supplier, conformist, anticorruption layer, open-host service, published language, separate ways
- Entities: objetos con identidad a lo largo del tiempo (id único, mutable). Ej: Pedido, Usuario, Producto
- Value Objects: objetos sin identidad, definidos por sus atributos (inmutable). Ej: Dirección, Dinero, Email
- Aggregates: cluster de objetos tratados como una unidad. Aggregate Root (único punto de entrada). Reglas de consistencia
  - Ej: Pedido (root) → LineasDePedido (entidades dentro del aggregate)
  - Regla: referencias externas solo al aggregate root, no a entidades internas
- Repositories: abstracción de persistencia. Colección de aggregates. Interfaz de dominio, implementación de infraestructura
- Domain Services: operaciones del dominio que no pertenecen a una entidad o value object. Ej: ServicioDePrecios, ValidadorDeStock
- Domain Events: eventos que ocurren en el dominio. Ej: PedidoCreado, PagoRecibido, ProductoAgotado
- Factories: creación de objetos complejos (entidades, aggregates)
- DDD Táctico vs Estratégico: táctico (entidades, VO, aggregates) vs estratégico (bounded contexts, context map)
- Laboratorio: modelar dominio de e-commerce con DDD táctico (entities, VOs, aggregates, repositories), definir bounded contexts

---

## Módulo 04 — Arquitectura Hexagonal (Puertos y Adaptadores)

- Alistair Cockburn (2005): Hexagonal Architecture o Ports & Adapters
- Principio fundamental: el dominio/aplicación no debe depender de infraestructura
- Puertos (Ports): interfaces que definen cómo el mundo exterior interactúa con el núcleo
  - Puertos primarios (inbound): casos de uso / servicios de aplicación. Ej: CreateOrderPort, GetProductPort
  - Puertos secundarios (outbound): repositorios, mensajería, servicios externos. Ej: OrderRepository, PaymentGateway
- Adaptadores (Adapters): implementaciones concretas de los puertos
  - Adaptadores primarios (driving): controllers REST, CLI, GraphQL resolvers, event listeners
  - Adaptadores secundarios (driven): JPA repositories, Kafka producers, REST clients, SMTP mail sender
- Núcleo de dominio aislado: el dominio no importa nada de infraestructura (regla del dependency inversion)
- Testing sin infraestructura: mock adaptadores, testear puertos. Pruebas rápidas y enfocadas
- Estructura de paquetes:
  - domain/: entidades, value objects, aggregates, domain services, repository interfaces
  - application/: casos de uso (use cases), puertos inbound, dto
  - infrastructure/: adaptadores REST, JPA, Kafka, configuración
  - configuration/: beans, dependency injection wiring
- Comparación con arquitectura en capas: hexagonal es capas con inversión de dependencias
- Ejemplo práctico: caso de uso CreateOrder — puerto inbound (CreateOrderUseCase), controlador REST (adaptador primary), repositorio JPA (adaptador secondary)
- Dependency Injection: cómo configurar los puertos y adaptadores con Spring
- Laboratorio: migrar E-Commerce Platform a arquitectura hexagonal, definir puertos inbound/outbound, implementar adaptadores

---

## Módulo 05 — Clean Architecture (Robert C. Martin)

- Clean Architecture: Robert C. Martin (2012). Círculos concéntricos
- Regla de las dependencias: las dependencias deben ir hacia adentro. Nada del círculo interior sabe algo del círculo exterior
- Las 4 capas de Clean Architecture:
  - Entities: objetos de negocio a nivel empresarial. Contienen reglas de negocio críticas
  - Use Cases: casos de uso específicos de la aplicación. Controlan el flujo. Dependen solo de entities
  - Interface Adapters: adaptadores que convierten datos entre use cases y frameworks. Controllers, Presenters, Gateways
  - Frameworks & Drivers: la capa más externa. Web, DB, UI, dispositivos. Todo lo que cambia
- Comparación con Hexagonal: Clean Architecture es una evolución. Añade la separación entities/use cases y los presenters
- Mapeo Clean + Hexagonal:
  - Entities + Use Cases = núcleo de dominio (hexagonal)
  - Interface Adapters = adaptadores primarios/secondary
  - Frameworks = infraestructura externa
- DTOs y mappers: cómo cruzar la frontera entre capas sin violar dependencias
  - Use Case Input/Output DTOs: datos en formato que el use case entiende
  - Request/Response DTOs: datos en formato que el framework entiende (JSON)
  - Mapper: convierte entre ambos sin exponer entidades a la capa externa
- Implementación en Spring Boot + React:
  - Backend: controllers (adapters inbound) → use cases → entities
  - El frontend es otro adaptador primario
- Boundary, Entity, Interactor: los roles de Clean Architecture
  - Boundary: interfaz que los use cases exponen
  - Interactor: implementación del caso de uso
  - Entity: reglas de negocio
- Screaming Architecture: la arquitectura debe gritar lo que hace (e-commerce), no la tecnología (Spring, React)
- Laboratorio: implementar caso de uso "CreateOrder" con Clean Architecture, definir boundaries, interactors, presenters, probar con tests de use case

---

## Módulo 06 — CQRS (Command Query Responsibility Segregation)

- CQRS: Command Query Responsibility Segregation — separación de modelos de lectura y escritura
- Command: operación que cambia el estado. No retorna datos (o retorna poco). POST, PUT, PATCH, DELETE
- Query: operación que lee datos. No cambia el estado. GET
- Separación de modelos: modelo de escritura (optimizado para writes, orientado a dominio) vs modelo de lectura (optimizado para reads, orientado a vistas)
- ¿Por qué CQRS? Cuando lecturas y escrituras tienen requerimientos muy diferentes (rendimiento, escalabilidad, complejidad)
- Implementación básica: un repositorio para commands (WriteRepository) y otro para queries (ReadRepository)
- Event Sourcing (ES): almacenar eventos de cambio, no estado actual
  - Event Store: append-only log de eventos
  - Reconstrucción de estado: replay de eventos
  - Projections: vistas derivadas de los eventos
  - Snapshotting: periodicamente guardar snapshot del estado actual para evitar replay completo
- CQRS + Event Sourcing: combinación natural. Commands producen eventos, queries leen projections
- Cuándo aplicar CQRS:
  - Diferencia significativa entre lectura y escritura
  - Necesidad de diferentes modelos para diferentes queries
  - Equipos trabajando independientemente en reads y writes
  - Sistemas colaborativos con conflictos
- Cuándo NO aplicar CQRS:
  - CRUD simple donde lecturas y escrituras son similares
  - Equipo pequeño, sistema simple (YAGNI)
  - Complejidad adicional no justificada
- Implementación en Spring Boot:
  - Command side: controladores POST/PUT/DELETE, command handlers, write repository
  - Query side: controladores GET, query handlers, read repository (tablas de lectura desnormalizadas)
- Laboratorio: implementar CQRS en E-Commerce Platform, separar modelo de pedidos (writes, orientado a DDD) de modelo de visualización de pedidos (reads, desnormalizado)

---

## Módulo 07 — Event-Driven Architecture (EDA)

- Event-Driven Architecture: estilo arquitectónico donde los componentes se comunican mediante eventos
- Evento: ocurrencia significativa en el dominio. Inmutable, ocurre en un punto en el tiempo
  - Ej: "PedidoCreado", "PagoProcesado", "ProductoDespachado"
  - Event vs Command: evento (algo ocurrió) vs command (quiero que algo ocurra)
- Elementos de EDA:
  - Productores: generan eventos. No saben quién los consume
  - Consumidores: reaccionan a eventos. No saben quién los produjo
  - Brokers: intermediarios que distribuyen eventos. Kafka, RabbitMQ, NATS, AWS SNS/SQS
  - Topics/Channels: categorías de eventos
- Event-Driven vs Request-Driven:
  - Request-Driven: invocación directa (REST, gRPC). Acoplamiento temporal y espacial
  - Event-Driven: comunicación asíncrona. Desacoplamiento total
- Coreografía vs Orquestación:
  - Coreografía: cada servicio reacciona a eventos y produce eventos. Descentralizado. EDA puro
  - Orquestación: un orquestador central coordina el flujo. Saga orquestada
  - Cuándo coreografía: procesos simples, alta autonomía de servicios
  - Cuándo orquestación: procesos complejos, necesidad de monitoreo centralizado
- Event Sourcing (profundización):
  - Event Store: base de datos de eventos. append-only
  - Reconstrucción de aggregates: replay de eventos desde el principio o desde snapshot
  - Ventajas: trazabilidad, auditoría, temporal query
  - Desventajas: complejidad, curva de aprendizaje, almacenamiento creciente
- Event versioning: los eventos evolucionan con el tiempo
  - Upcasting: convertir eventos viejos a nuevo formato al leer
  - Version in event: cada evento tiene un version field
- Consistent event naming: "PastTenseVerb+PastParticiple" (OrderCreated, PaymentProcessed, ShipmentDelivered)
- Garantías de entrega: at-least-once, exactly-once, at-most-once. Idempotencia en consumidores

---

## Módulo 08 — Microservicios vs Monolito

- Monolito: ventajas — simplicidad, desarrollo rápido al inicio, deploy simple, testing integrado, latency mínima
- Monolito: desventajas — acoplamiento, escalado vertical, límite de tamaño de equipo, deploy monolítico, deuda técnica
- Microservicios: ventajas — escalado independiente, despliegues independientes, equipos autónomos, tecnología heterogénea, aislamiento de fallos
- Microservicios: desventajas — complejidad distribuida, network latency, consistencia eventual, debugging, overhead operacional, testing integrado
- Cuándo empezar con microservicios: casi nunca. Empezar con monólogo bien modularizado (Modular Monolith)
- Cuándo migrar a microservicios: equipo creciendo, frecuentes deploys de partes no relacionadas, cuellos de botella de escalado, necesidad de tecnología diferente
- Strangler Fig Pattern: migración incremental de monólogo a microservicios
  1. Identificar módulo candidato (bounded context)
  2. Extraer como servicio independiente
  3. Redirigir tráfico gradualmente
  4. Eliminar código original del monólogo
- Patrones de descomposición:
  - Por negocio: cada microservicio cubre una capacidad de negocio (pagos, catálogo, usuarios)
  - Por subdominio DDD: cada microservicio = un bounded context
  - Por capacidad: por funcionalidad específica (autenticación, notificaciones, reportes)
- Tamaño de microservicio: "suficientemente pequeño para ser manejable por un equipo, suficientemente grande para tener sentido de negocio"
- Conway's Law: las organizaciones diseñan sistemas que reflejan su estructura de comunicación
  - Inverse Conway Maneuver: reestructurar equipo para lograr la arquitectura deseada
- Vale la pena? Factores a considerar: tamaño del equipo, complejidad del dominio, velocidad de cambio requerida, capacidades operacionales (DevOps, monitoreo)
- Modular Monolith: alternativa pragmática. Un solo deploy con módulos bien delimitados (paquetes, módulos Java). Beneficios de monólogo + disciplina de microservicios
- Laboratorio: analizar E-Commerce Platform, identificar bounded contexts, proponer descomposición en microservicios + modular monolith como paso intermedio

---

## Módulo 09 — Comunicación entre Servicios

- Comunicación síncrona vs asíncrona: trade-offs entre simplicidad y acoplamiento
- REST síncrono: simple, familiar, pero acoplamiento temporal (el servicio debe estar disponible)
  - OpenFeign: declarative REST clients en Spring Cloud
  - Circuit Breaker (Resilience4j): evitar fallos en cascada. Estados: closed, open, half-open
  - Retry: reintentos con backoff exponencial
  - Timeout: límite de tiempo de espera para respuestas
- gRPC: comunicación eficiente (Protocol Buffers), streaming nativo, HTTP/2
  - Unary RPC: request-response simple
  - Server streaming: servidor envía múltiples respuestas
  - Client streaming: cliente envía múltiples requests
  - Bidirectional streaming: ambos lados envían múltiples mensajes
  - gRPC vs REST: gRPC 5-10x más rápido, ideal para microservicios
- Mensajería asíncrona: desacoplamiento total
  - RabbitMQ: broker tradicional, AMQP. Ideal para CQRS, eventos de dominio
  - Apache Kafka: event streaming platform, log distribuido. Ideal para event sourcing, pipelines de datos
  - Kafka: topics, partitions, consumer groups, offset, retention
  - Contratos de mensajes: schemas compartidos (Avro, Protobuf, JSON Schema + Schema Registry)
- Eventos vs Comandos en mensajería:
  - Event: "algo ocurrió" (PedidoCreado). Muchos consumidores pueden reaccionar
  - Command: "haz algo" (EnviarEmailCommand). Un consumidor específico
- Fallos en cascada y resiliencia:
  - Circuit Breaker: prevenir llamadas a servicios fallando
  - Bulkhead: aislar recursos (thread pools separados por servicio)
  - Retry + Backoff: reintentar con espera creciente
  - Fallback: respuesta por defecto cuando el servicio falla
  - Timeout: límite de espera por llamado externo
- Service Mesh: Istio, Linkerd. Gestión de comunicación a nivel de infraestructura

---

## Módulo 10 — Bases de Datos en Arquitectura

- SQL vs NoSQL: criterios de selección según el contexto y requerimientos
  - SQL (PostgreSQL, MySQL): esquema rígido, ACID, joins, madurez
  - NoSQL: flexibilidad de esquema, escalado horizontal, modelos variados
    - Document (MongoDB): JSON-like, esquema flexible
    - Key-Value (Redis): ultra rápido, caching, sesiones
    - Column-Family (Cassandra): escalado lineal, time-series
    - Graph (Neo4j): datos altamente relacionados, recomendaciones, fraudes
- Poliglota Persistence: usar diferentes bases de datos para diferentes necesidades
  - Ej: PostgreSQL para pedidos (ACID fuerte), MongoDB para catálogo (esquema flexible), Redis para carrito de compras (rápido), Elasticsearch para búsqueda
- CQRS con diferentes BBDD: base de escritura (SQL normalizado) + base de lectura (NoSQL desnormalizado)
  - Sincronización: eventos de dominio actualizan la base de lectura (eventual consistency)
- Consistencia de datos: Eventual vs Strong consistency
  - Strong consistency: todos los nodos ven los mismos datos inmediatamente. ACID
  - Eventual consistency: los datos se propagan con el tiempo. BASE (Basically Available, Soft state, Eventual consistency)
  - CAP Theorem: Consistency, Availability, Partition Tolerance. Elegir 2 de 3
  - PACELC: en partición elegir CA, sino elegir LC (Latency vs Consistency)
- Saga Pattern: manejo de transacciones distribuidas sin 2PC (Two-Phase Commit)
  - Saga Coreografiada: cada servicio produce eventos, otros reaccionan. Compensación con eventos de rollback
  - Saga Orquestada: un orquestador coordina. Compensación: el orquestador llama a acciones de compensación
- Transaction Outbox Pattern: garantizar que los eventos se envíen junto con la transacción de base de datos
  1. Escribir en DB + insertar evento en tabla outbox en la misma transacción
  2. Reliable publisher: lee la outbox y publica los eventos
  3. Si falla publicación, retry hasta éxito (garantía at-least-once)
  - Alternativas: Debezium (CDC), PostgreSQL LISTEN/NOTIFY
- Laboratorio: diseñar estrategia de persistencia para e-commerce (SQL + NoSQL por bounded context), implementar Saga coreografiada para flujo de pedidos + Transaction Outbox con Kafka

---

## Módulo 11 — Calidad Arquitectónica

- Atributos de calidad (Quality Attributes, QAs): propiedades no funcionales del sistema
- QA 1 — Disponibilidad: tiempo que el sistema está operativo. Métrica: 9s (99.9%, 99.99%, etc.)
  - Estrategias: redundancia, failover, health checks, clustering
- QA 2 — Performance: velocidad de respuesta. Métrica: latency (p50, p95, p99), throughput
  - Estrategias: caching (CDN, Redis), conexiones persistentes, compresión, async processing
- QA 3 — Seguridad: protección contra amenazas. Confidencialidad, integridad, disponibilidad (CIA triad)
  - Estrategias: autenticación, autorización, encriptación, input validation, rate limiting
- QA 4 — Mantenibilidad: facilidad de modificar y extender. Métrica: tiempo de implementar cambios
  - Estrategias: modularidad, Clean Architecture, bajo acoplamiento, alta cohesión
- QA 5 — Escalabilidad: capacidad de manejar crecimiento. Escalado vertical vs horizontal
  - Estrategias: stateless services, caching, sharding, auto-scaling, CDN
- QA 6 — Testabilidad: facilidad de probar. Métrica: cobertura, tiempo de ejecución de tests
  - Estrategias: inyección de dependencias, puertos/adaptadores, test doubles, testing pyramid
- Tácticas arquitectónicas: soluciones técnicas para lograr un QA específico
  - Ej: para disponibilidad → heartbeat, monitor, restart; para performance → caching, lazy loading
- ATAM (Architecture Tradeoff Analysis Method): método para evaluar arquitecturas
  1. Presentar la arquitectura
  2. Identificar escenarios de calidad (concrete quality scenarios)
  3. Analizar decisiones arquitectónicas
  4. Identificar trade-offs, risks, non-risks, sensitivity points
  5. Generar informe
  - Ej: "Cuando 1000 usuarios concurrentes realizan búsquedas (estímulo) desde la web (fuente), el sistema de catálogo (artefacto) bajo carga normal (entorno) responde en menos de 200ms p95 (respuesta, medida)"
- Trade-off analysis: toda decisión favorece algunos QAs y perjudica otros
  - Ej: microservicios mejoran escalabilidad y mantenibilidad pero empeoran performance (latencia de red) y disponibilidad (más puntos de fallo)
- Laboratorio: definir escenarios de calidad para E-Commerce Platform, realizar ATAM preliminar, documentar trade-offs

---

## Módulo 12 — Documentación Arquitectónica

- ¿Por qué documentar? Comunicación, onboarding, análisis de impacto, cumplimiento, continuidad
- C4 Model (Simon Brown, 2011): 4 niveles de abstracción
  - Nivel 1 — Context (System Context): el sistema en su contexto. Usuarios, sistemas externos, relaciones
    - Diagrama: caja del sistema + actores + sistemas externos
    - Audiencia: stakeholders no técnicos
  - Nivel 2 — Container: descomposición en containers (aplicaciones, bases de datos, colas, etc.)
    - Diagrama: containers + protocolos de comunicación
    - Audiencia: desarrolladores, DevOps
  - Nivel 3 — Component: descomposición de cada container en componentes (módulos, paquetes)
    - Diagrama: componentes + interfaces
    - Audiencia: desarrolladores del equipo
  - Nivel 4 — Code: detalle de implementación (clases, interfaces, patrones)
    - Diagrama: diagramas de clases UML (opcional, solo cuando sea necesario)
    - Audiencia: desarrolladores implementando
- ADR (Architecture Decision Record): documento que captura una decisión arquitectónica importante
  - Formato estándar (Michael Nygard):
    - Title: número y título corto (ADR-001: Usar PostgreSQL como base de datos principal)
    - Status: Proposed, Accepted, Deprecated, Superseded
    - Context: problema que motivó la decisión
    - Decision: qué se decidió y por qué
    - Consequences: implicaciones, trade-offs, riesgos
  - Ventajas de ADRs: trazabilidad, contexto histórico, aprendizaje organizacional
  - Almacenamiento: docs/adr/ en el repositorio. Markdown simple
- Diagramas útiles en arquitectura:
  - Diagrama de contexto (C4 Nivel 1)
  - Diagrama de containers (C4 Nivel 2)
  - Diagrama de secuencia (comunicación entre servicios)
  - Diagrama de despliegue (infraestructura y redes)
  - Diagrama de flujo de datos (event-driven flows)
- Herramientas de diagramación:
  - Structurizr: C4 Model as code. DSL → diagramas. Ideal para mantener documentación viva
  - PlantUML: diagramas UML from text. Markdown integration
  - Mermaid: markdown-native diagrams. GitHub, Notion
  - Draw.io: diagramas manuales, colaborativo
  - Excalidraw: pizarra virtual para diseño colaborativo
- Documentación viva vs documentación estática: mantener docs en el repositorio, cerca del código
- Wiki antipattern: documentar una vez y no actualizar. Preferir docs auto-generadas o docs as code
- Laboratorio: crear C4 Model para E-Commerce Platform (Context + Container + Component), escribir ADRs para decisiones clave (bases de datos, estilo comunicación, descomposición), diagramar con Structurizr DSL

---

## Módulo 13 — Deuda Técnica y Refactorización Arquitectónica

- ¿Qué es deuda técnica? Concepto de Ward Cunningham (1992). Código/apropósito que necesita ser refactorizado
- Símil financiero: deuda técnica = principal (costo de refactorizar) + interés (costo de mantener la deuda)
- Tipos de deuda técnica según Martin Fowler:
  - Deuda imprudente: "no tenemos tiempo para diseñar" — la peor, interés alto
  - Deuda prudente: "sabemos que esta solución temporal tiene costo pero necesitamos entregar" — manejable
  - Deuda involuntaria: "no sabíamos que esta decisión era mala" — aprendizaje
  - Deuda voluntaria: "elegimos esta solución sabiendo el trade-off" — decisión consciente
- Cuadrante de Fowler (Reckless vs Prudent - Deliberate vs Inadvertent):
  - Reckless + Deliberate: "no hay tiempo, lo hacemos rápido" → imprudente, pero consciente
  - Reckless + Inadvertent: "¿qué es un patrón de diseño?" → falta de conocimiento
  - Prudent + Deliberate: "entregamos ahora, refactorizamos después" → deuda planificada
  - Prudent + Inadvertent: "ahora sabemos cómo debimos hacerlo" → aprendizaje natural
- Costo de interés de la deuda:
  - Tiempo extra para implementar nuevas features
  - Bugs frecuentes
  - Onboarding lento
  - Baja moral del equipo
  - Dificultad de testing
- Estrategias de reducción de deuda:
  1. Identificar y medir: herramientas de análisis estático (SonarQube), code reviews, métricas (tiempo de implementación)
  2. Priorizar: impacto en negocio vs esfuerzo de refactorización
  3. Planificar: incluir en sprints (20% rule, refactoring sprints)
  4. Ejecutar: refactorización incremental (boy scout rule: leave the code better than you found it)
  5. Prevenir: estándares, code reviews, pair programming, arquitectura sólida desde el inicio
- Refactorización arquitectónica vs refactorización de código:
  - Código: renombrar, extraer método, mover clase (dentro del mismo estilo arquitectónico)
  - Arquitectura: cambiar estilo (migrar monólogo a microservicios), cambiar patrones (CRUD a CQRS), cambiar tecnología (SQL a NoSQL)
- Big Ball of Mud (Brian Foote, Joseph Yoder): antipatrón de sistemas sin arquitectura clara
  - Señales: código espagueti, dependencias cíclicas, falta de pruebas, cambios lentos y dolorosos
  - Solución: refactorización incremental con Strangler Fig, establecer límites (bounded contexts), pagar deuda progresivamente
- Deuda técnica consciente: documentar decisiones técnicas subóptimas en ADRs, planificar pago, medir interés
- Laboratorio: auditar E-Commerce Platform (o código de ejemplo), identificar deuda técnica, calcular interés, proponer plan de refactorización, escribir ADRs de deuda

---

## Módulo 14 — Gobierno y Estándares de Arquitectura

- ¿Qué es gobierno de arquitectura? Procesos, estándares y políticas que guían las decisiones arquitectónicas en una organización
- Arquitectura empresarial (Enterprise Architecture):
  - TOGAF (The Open Group Architecture Framework): metodología de EA. Fases: Preliminary, Architecture Vision, Business Architecture, Information Systems Architecture, Technology Architecture, Opportunities & Solutions, Migration Planning, Implementation Governance, Architecture Change Management
  - ADM (Architecture Development Method): ciclo de TOGAF
  - Zachman Framework: matriz de 6-6 (preguntas - perspectivas)
- Health checks arquitectónicos: evaluaciones periódicas del estado de la arquitectura
  - Frecuencia: trimestral o semestral
  - Dimensiones: calidad, deuda técnica, alineación con negocio, riesgos
  - Output: health score, recomendaciones, acciones
- El arquitecto en la organización:
  - Arquitecto de solución: enfoque en un proyecto/sistema específico
  - Arquitecto empresarial: visión global de la organización
  - Arquitecto técnico: enfoque en tecnología y plataformas
  - Arquitecto de dominio: experto en un dominio de negocio específico
- Responsabilidades del arquitecto:
  - Definir vision arquitectónica
  - Tomar decisiones técnicas de alto impacto
  - Comunicar y evangelizar
  - Mentorar a equipos de desarrollo
  - Revisar decisiones técnicas (architecture review)
  - Mantener documentación arquitectónica
  - Evaluar tecnologías y tendencias
- Communication y evangelismo:
  - Presentaciones ejecutivas: lenguaje de negocio, ROI, riesgos
  - Tech talks: compartir conocimiento técnico
  - RFCs (Request for Comments): proceso de propuestas técnicas revisadas por pares
  - Architecture Decision Records: documentar decisiones
- Architecture Review Boards:
  - Comité que revisa decisiones arquitectónicas significativas
  - Miembros: arquitectos senior, líderes técnicos, stakeholders
  - Riesgo: burocracia excesiva. Balancear control con agilidad
- Estándares de codificación y arquitectura:
  - Style guides: Java (Google Style, Spring), JavaScript (Airbnb, Standard)
  - Patrones aprobados: qué patrones usar, cuándo y por qué
  - Tecnologías aprobadas: tech radar (Adopt, Trial, Assess, Hold) — ThoughtWorks
- Tech Radar: herramienta de ThoughtWorks para evaluar tecnologías
  - Adopt: tecnologías probadas que deberíamos usar
  - Trial: tecnologías prometedoras que probamos en proyectos piloto
  - Assess: tecnologías que deberíamos investigar
  - Hold: tecnologías que evitar, esperar o descontinuar
- Laboratorio: diseñar estructura de gobierno para E-Commerce Platform, crear RFC template, proponer tech radar, definir architecture review process

---

## Módulo 15 — Proyecto Final + Simulación de Entrevista

### Proyecto Final: Arquitectura de E-Commerce Platform
- Diseñar la arquitectura completa para E-Commerce Platform (evolución de TaskFlow + funcionalidades de e-commerce)
- Requerimientos funcionales:
  - Catálogo de productos con búsqueda y filtros
  - Carrito de compras (persistente, anónimo → autenticado)
  - Gestión de pedidos (crear, pagar, despachar, entregar)
  - Notificaciones (email, push)
  - Panel de administración (reportes, gestión de productos)
- Atributos de calidad target: disponibilidad 99.9%, performance <200ms p95 en APIs críticas, escalabilidad a 10K usuarios concurrentes, mantenibilidad alta
- Aplicar DDD estratégico: definir bounded contexts, context map, ubiquitous language
- Aplicar Hexagonal + Clean Architecture: puertos, adaptadores, entities, use cases, presenters
- Aplicar CQRS + Event Sourcing para pedidos (writes) y reportes (reads)
- Comunicación asíncrona con Kafka entre bounded contexts
- Diagramas C4 (Context + Container + Component + algunos Code)
- ADRs para decisiones clave (5+ decisiones documentadas):
  1. Arquitectura hexagonal + clean
  2. Descomposición en bounded contexts
  3. Elección de bases de datos (PostgreSQL + MongoDB + Redis)
  4. Comunicación asíncrona con Kafka
  5. CQRS + Event Sourcing en pedidos
  6. Frontend React + SSR? (decisión técnica)
- Justificar cada decisión con trade-offs explícitos
- Evaluación ATAM: escenarios de calidad, sensitivity points, trade-offs
- Health check arquitectónico: proponer métricas para monitorear la salud de la arquitectura en producción

### Simulación de Entrevista Técnica — 15 ejercicios prácticos
1. Diseñar la arquitectura de un sistema de pagos con alta disponibilidad
2. Elegir entre CQRS y CRUD para un módulo de búsqueda de productos
3. Refactorizar un monólogo legacy a microservicios con Strangler Fig
4. Implementar un circuito breaker para un servicio de pagos externo
5. Diseñar el flujo de eventos para el proceso de "completar pedido"
6. Evaluar trade-off entre consistencia fuerte y eventual en carrito de compras
7. Diseñar un bounded context mapping para catálogo + pedidos + inventario
8. Elegir base de datos para diferentes contextos (poliglota persistence)
9. Implementar Transaction Outbox en Spring Boot con Kafka
10. Diseñar la migración de base de datos sin downtime
11. Presentar C4 Context + Container de un sistema real
12. Evaluar un ADR propuesto (pros/cons, decisión alternativa)
13. Detectar y clasificar deuda técnica en un código legacy
14. Diseñar health checks para una arquitectura de microservicios
15. Resolver fallo en cascada con circuit breaker + bulkhead + retry

### 75 preguntas de entrevista (5 categorías, 15 cada una)
- Categoría 1 — Fundamentos: qué es arquitectura, trade-offs, stakeholders, atributos de calidad
- Categoría 2 — DDD y Estilos: bounded context, entities vs value objects, aggregates, estilos arquitectónicos
- Categoría 3 — Clean + Hexagonal: dependency inversion, puertos/adaptadores, use cases, presenters
- Categoría 4 — CQRS/EDA/Microservicios: commands vs queries, eventos, sagas, descomposición, comunicación
- Categoría 5 — Gobierno y Calidad: ATAM, deuda técnica, ADRs, C4, TOGAF, tech radar

---

## Calendario

| Día | Módulo | Tema |
|-----|--------|------|
| Semana 1, Lunes | 01 | Fundamentos de Arquitectura |
| Semana 1, Martes | 02 | Estilos Arquitectónicos |
| Semana 1, Miércoles | 03 | Domain-Driven Design |
| Semana 1, Jueves | 04 | Arquitectura Hexagonal |
| Semana 1, Viernes | 05 | Clean Architecture |
| Semana 2, Lunes | 06 | CQRS |
| Semana 2, Martes | 07 | Event-Driven Architecture |
| Semana 2, Miércoles | 08 | Microservicios vs Monolito |
| Semana 2, Jueves | 09 | Comunicación entre Servicios |
| Semana 2, Viernes | 10 | Bases de Datos |
| Semana 3, Lunes | 11 | Calidad Arquitectónica |
| Semana 3, Martes | 12 | Documentación Arquitectónica |
| Semana 3, Miércoles | 13 | Deuda Técnica y Refactorización |
| Semana 3, Jueves | 14 | Gobierno y Estándares |
| Semana 3, Viernes | 15 | Proyecto Final + Entrevista |

---

## Diagrama de Gantt

```
Semana 1     | Lunes  | Martes | Miércoles | Jueves | Viernes |

Semana 2     | Lunes  | Martes | Miércoles | Jueves | Viernes |

Semana 3     | Lunes  | Martes | Miércoles | Jueves | Viernes |
```

---

## Sistema de Evaluación

| Componente | Peso | Descripción |
|------------|------|-------------|
| Laboratorios (7) | 25% | Ejercicios prácticos por módulo (módulos 1-14) |
| Proyecto Final | 40% | Arquitectura completa de E-Commerce Platform (diagramas, ADRs, decisiones) |
| Examen Teórico | 25% | 75 preguntas teóricas y de razonamiento |
| Participación | 10% | Code reviews, discusiones arquitectónicas, pair design |

**Escala:** 0-100. Mínimo aprobatorio: 70.

### Rúbrica del Proyecto Final
| Criterio | Peso | Excelente (90-100) | Bueno (70-89) | Regular (50-69) |
|----------|------|--------------------|---------------|-----------------|
| DDD (bounded contexts, aggregates) | 20% | Context map claro, aggregates bien modelados | Context map presente, aggregates con errores menores | Context map difuso, aggregates incorrectos |
| Hexagonal/Clean (puertos, casos de uso) | 20% | Separación perfecta, sin dependencias incorrectas | Separación buena con algunas dependencias hacia fuera | Dependencias incorrectas, mezcla de capas |
| Diagramas C4 | 15% | 3 niveles completos, claros, precisos | 2 niveles completos, 1 incompleto | Solo 1 nivel, impreciso |
| ADRs | 15% | 5+ ADRs con contexto, decisión, consecuencias claras | 3+ ADRs, algunos sin consecuencias | Menos de 3 ADRs o incompletos |
| Comunicación (eventos/servicios) | 15% | Flujo de eventos claro, patrones de resiliencia | Flujo de eventos presente, sin resiliencia | Sin eventos, solo REST síncrono |
| Justificación de decisiones | 15% | Trade-offs explícitos, alternativas consideradas | Trade-offs mencionados sin profundidad | Sin justificación de decisiones |

---

## Recursos Recomendados

### Libros
- *Software Architecture: The Hard Parts* — Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani (O'Reilly, 2021)
- *Clean Architecture: A Craftsman's Guide* — Robert C. Martin (Prentice Hall, 2017)
- *Domain-Driven Design: Tackling Complexity in the Heart of Software* — Eric Evans (Addison-Wesley, 2003)
- *Implementing Domain-Driven Design* — Vaughn Vernon (Addison-Wesley, 2013)
- *Building Evolutionary Architectures* — Neal Ford, Rebecca Parsons, Patrick Kua (O'Reilly, 2017)
- *Fundamentals of Software Architecture* — Mark Richards, Neal Ford (O'Reilly, 2020)
- *Architecture Patterns with Python* — Harry Percival, Bob Gregory (O'Reilly, 2020)
- *Designing Data-Intensive Applications* — Martin Kleppmann (O'Reilly, 2017)
- *Microservices Patterns* — Chris Richardson (Manning, 2018)
- *The C4 Model for Visualising Software Architecture* — Simon Brown (Leanpub)

### Cursos Online
- Software Architecture & Design — Udacity
- Clean Architecture & DDD — Udemy (Amichai Mantinband)
- Domain-Driven Design — Pluralsight (Vladimir Khorikov)
- Event-Driven Architecture — Confluent Developer
- TOGAF 9 Certification — Open Group

### Herramientas
- Structurizr — https://structurizr.com (C4 Model as code)
- PlantUML — https://plantuml.com
- Mermaid — https://mermaid.js.org
- Draw.io — https://draw.io
- Excalidraw — https://excalidraw.com
- SonarQube — https://sonarqube.org (deuda técnica)
- ArchUnit — https://www.archunit.org (arquitectura como tests)
- NetArchTest (.NET) — similar a ArchUnit
- JDepend — https://github.com/clarkware/jdepend (métricas de dependencia)
- Spring Modulith — https://spring.io/projects/spring-modulith (modular monolith)

### Artículos y Referencias
- Martin Fowler's Bliki — https://martinfowler.com/bliki
- ThoughtWorks Tech Radar — https://www.thoughtworks.com/radar
- C4 Model — https://c4model.com
- TOGAF Standard — https://opengroup.org/togaf
- ATAM — Software Engineering Institute (CMU)
- ADR — Michael Nygard (https://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)
- Conway's Law — Melvin Conway (1968)
- CAP Theorem — Eric Brewer (2000)
- PACELC — Daniel J. Abadi (2012)
- Strangler Fig Pattern — Martin Fowler
- Boy Scout Rule — Uncle Bob
- Big Ball of Mud — Brian Foote, Joseph Yoder

