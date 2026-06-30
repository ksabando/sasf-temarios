---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el "Database per Aggregate" en Event Sourcing y cómo Martin Kleppmann en *Designing Data-Intensive Applications* propone manejar transacciones que cruzan aggregates sin 2PC?

**Respuesta**: Martin Kleppmann dedica el capítulo 9 de *Designing Data-Intensive Applications* (2017) a consistencia y consenso. Para transacciones que cruzan aggregates sin 2PC (Two-Phase Commit), propone: (1) **re-diseñar el aggregate** para que la operación sea atómica dentro de un solo aggregate (siempre la mejor opción), (2) **Saga Pattern** con compensaciones (si la operación debe cruzar aggregates), (3) **Transaction Outbox** para garantizar atomicidad entre BD y mensajería, (4) **eventos como fuente de verdad** (Event Sourcing) donde la transacción es append del evento al event store, y los efectos colaterales son proyecciones asíncronas. Kleppmann es cauteloso sobre Sagas: "Sagas are a last resort, not a first choice —they introduce complexity in failure handling."

**Por qué**: La clase presentó Saga y Outbox como patrones, pero no la jerarquía de preferencia de Kleppmann. Para el E-Commerce: primero, intentar que Pedido y Línea de Pedido estén en el mismo aggregate (diseño); si no es posible, Saga con Outbox. Kleppmann también advierte que la mayoría de Sagas en producción tienen bugs sutiles en las compensaciones.

---

### 3. [Investigar] ¿Qué es el "Materialized View Pattern" aplicado a microservicios según Chris Richardson y cómo difiere del "Eventual Consistency Read Model" de la clase?

**Respuesta**: Chris Richardson describe el Materialized View Pattern como un patrón específico donde un servicio mantiene una vista materializada de datos que pertenecen a otro servicio, actualizada mediante eventos. A diferencia del Read Model genérico de CQRS (donde el mismo servicio que escribe también expone lecturas), en el Materialized View Pattern, el servicio A es dueño de los datos, el servicio B consume eventos y mantiene una copia local (materializada) de los datos que necesita para sus queries. Esto evita que el servicio B tenga que consultar al servicio A en cada request. Ejemplo: el Servicio de Envíos mantiene una vista materializada de direcciones de clientes (cuyo dueño es el Servicio de Usuarios) escuchando eventos `AddressUpdated`.

**Por qué**: La clase presentó CQRS como separación dentro de un mismo bounded context, pero el Materialized View es el patrón para consultas cross-context. Richardson lo documenta como solución al problema de "¿cómo obtengo datos de otro servicio sin acoplarme a su API?" La sincronización es eventual, el control es local.

---

### 4. [Investigar] ¿Qué es "NewSQL" (CockroachDB, Spanner) y cómo cambia el tradeoff del Teorema CAP que la clase presenta como binario?

**Respuesta**: NewSQL es una categoría de bases de datos que buscan ofrecer escalabilidad horizontal de NoSQL con garantías ACID de SQL. CockroachDB y Google Spanner usan relojes atómicos/GPS (TrueTime API) para ofrecer consistencia fuerte externamente consistente con escalado horizontal —resolviendo el tradeoff CAP de forma innovadora. Según el Teorema PACELC, en ausencia de partición, Spanner prioriza Consistencia sobre Latencia (PC/EC), mientras que en partición prioriza Consistencia sobre Disponibilidad (PC/EC). Esto significa que para muchos casos de uso, no es necesario sacrificar consistencia por escalabilidad: NewSQL ofrece ambas a cambio de mayor latencia en escrituras (por consenso Raft/Paxos) y mayor costo operacional.

**Por qué**: La clase presentó CAP como "elegir 2 de 3" con ejemplos de PostgreSQL (CA) y Cassandra (AP), sin mencionar NewSQL que cambia el juego. Eric Brewer (autor de CAP) ha reconocido que CAP es una simplificación y que sistemas como Spanner demuestran que "consistency and partition tolerance don't necessarily mean unavailability —they mean higher latency." Para E-Commerce Platform con requisitos de disponibilidad 99.9% + consistencia fuerte en pagos, CockroachDB podría reemplazar PostgreSQL + read replicas.

---

### 5. [Conectar] La clase presenta el CAP Theorem de Eric Brewer (2000). ¿Cómo la extensión PACELC de Daniel J. Abadi (2010) refina el teorema para sistemas que no están en partición?

**Respuesta**: PACELC (Abadi, 2012) extiende CAP reconociendo que las particiones de red son raras y que la mayoría del tiempo el sistema opera sin particiones. PACELC dice: "In case of Partition (P), trade off Availability (A) vs Consistency (C); Else (E), when the system is not partitioned, trade off Latency (L) vs Consistency (C)." Esto explica opciones que CAP no cubre: MongoDB sin particiones puede elegir baja latencia a costa de consistencia eventual (PA/EL), mientras que PostgreSQL sin particiones ofrece consistencia fuerte a costa de mayor latencia (PC/EC). La clase presentó CAP como binario, pero PACELC muestra que hay dos tradeoffs, no uno, y que la mayoría del tiempo (sin particiones) el tradeoff LC (Latency vs Consistency) domina.

**Por qué**: Daniel Abadi, profesor de Yale y co-creador de H-Store, escribió PACELC en *"Consistency Tradeoffs in Modern Distributed Database System Design"* (2012). La implicación para E-Commerce Platform: durante el 99.9% del tiempo sin particiones, la elección real es entre: responder rápido con datos potencialmente stale (Redis, DynamoDB) o responder más lento con datos garantizados correctos (SQL con ACID). CAP solo importa en el 0.1% del tiempo con particiones.

---

### 6. [Conectar] La clase cubre Saga Pattern como secuencia de transacciones locales. ¿Cómo se relaciona esto con el patrón "Routing Slip" de Gregor Hohpe y cuándo una Saga con Routing Slip es superior a la Saga coreografiada?

**Respuesta**: Gregor Hohpe describe el Routing Slip en *Enterprise Integration Patterns* como un mensaje que contiene su propia ruta de procesamiento. Aplicado a Sagas: en lugar de que cada paso de la saga sepa cuál es el siguiente (coreografía) o que un orquestador central controle todo (orquestación), el mensaje Saga lleva un "routing slip" (lista de pasos) y cada participante ejecuta su paso y envía el mensaje al siguiente destino de la lista. Ventajas sobre la coreografía: la ruta es explícita y modificable centralmente (en el routing slip, no en cada servicio). Ventajas sobre la orquestación: no hay un orquestador central como punto único de fallo (el routing slip viaja con el mensaje). Desventaja: el routing slip es menos flexible para lógica condicional compleja.

---

### 7. [Conectar] La clase presenta Transaction Outbox para garantizar atomicidad BD + Kafka. ¿Cómo lo extiende el patrón "Change Data Capture" con Debezium y cuál es la postura de Gunnar Morling sobre la durabilidad del Outbox manual?

**Respuesta**: Gunnar Morling (líder de Debezium) argumenta que el Outbox manual tiene un punto ciego de durabilidad: si el scheduler que lee la tabla outbox muere después de leer eventos pero antes de publicarlos a Kafka, esos eventos se pierden hasta el próximo ciclo (sin registrar cuáles fueron publicados y cuáles no). Debezium resuelve esto leyendo directamente del WAL (Write-Ahead Log) de PostgreSQL: la lectura es un stream continuo, no un polling, y la posición de lectura (LSN) es transaccionalmente consistente. Si Debezium muere, al reiniciar continúa exactamente donde estaba. La implementación manual puede mitigar esto marcando eventos como "in-flight" antes de publicar y solo como "published" al confirmar en Kafka, pero esto agrega complejidad que Debezium ya resuelve.

**Por qué**: Morling documentó estas diferencias en múltiples charlas y en el blog de Debezium. La clase enseñó Outbox manual sin discutir sus limitaciones de durabilidad. Para sistemas financieros, donde perder un evento de pago no es aceptable, la durabilidad del Outbox manual requiere cuidados adicionales o migrar a Debezium.

---

### 8. [Cuestionar] ¿"Poliglota Persistence" es una buena práctica o una receta para la complejidad operacional? Contrastá la visión de *The Hard Parts* de Neal Ford con la postura de quienes defienden "One Database to Rule Them All."

**Respuesta**: Neal Ford y Zhamak Dehghani en *Software Architecture: The Hard Parts* defienden poliglota persistence acotada: diferentes bounded contexts pueden tener diferentes bases de datos, justificado por atributos de calidad diferentes. La postura "One Database" (típicamente PostgreSQL) argumenta que la madurez y versatilidad de las bases de datos modernas (PostgreSQL con JSONB para documentos, full-text search, TimescaleDB para time-series) reduce la necesidad de múltiples motores, disminuyendo la complejidad operacional (un solo motor para backups, HA, monitoreo). El contraargumento de Ford: PostgreSQL puede hacer muchas cosas, pero ninguna tan bien como un motor especializado (Elasticsearch en full-text search, Redis en caching, ClickHouse en analytics).

**Por qué**: Esta es una tensión real. Empresas como GitLab usan solo PostgreSQL (incluso para colas y caché) y son exitosas. Empresas como Uber usan 10+ motores y también son exitosas. El factor decisivo es la madurez operacional del equipo: poliglota requiere un equipo que pueda operar 3-5 motores de base de datos en producción. La recomendación pragmática de Ford: empezar con uno, agregar motores solo cuando el actual no cumple un QA medible.

---

### 9. [Cuestionar] ¿Es la Eventual Consistency una trampa que genera más bugs que los que resuelve? El debate entre "ACID or bust" vs "Embrace Eventual."

**Respuesta**: Los defensores de ACID (principalmente en finanzas y salud) argumentan que la consistencia eventual traslada la complejidad del sistema a los desarrolladores: en lugar de que la base de datos garantice la consistencia, cada desarrollador debe implementar lógica de reconciliación, idempotencia y compensación. Esto produce bugs sutiles: lecturas stale, doble procesamiento, estados inconsistentes visibles al usuario. Los defensores de Eventual (Amazon, Netflix) responden que ACID no escala en sistemas distribuidos multi-región, y que el mundo real es eventual: cuando hacés una transferencia bancaria internacional, el dinero no se mueve instantáneamente. Pat Helland (2007) argumenta que "the illusion of consistency is more dangerous than acknowledged inconsistency because it hides failure modes."

**Por qué**: Helland, ex-Amazon y ex-Microsoft, es la voz más influyente a favor de consistencia eventual como diseño explícito. La evidencia: Amazon DynamoDB sacrifica consistencia por disponibilidad y es backbone de retail global. Pero es cierto que la consistencia eventual mal manejada produce bugs muy difíciles de reproducir. La postura responsable: consistencia fuerte dentro del aggregate, eventual entre aggregates, y nunca mentirle al usuario (no mostrar datos como "ciertos" si son eventuales).

---

### 10. [Cuestionar] ¿Vale la pena la complejidad de Event Sourcing comparado con un ORM + PostgreSQL tradicional para el 95% de los sistemas? La controversia entre Greg Young y los críticos prácticos.

**Respuesta**: Greg Young defiende Event Sourcing por sus beneficios (trazabilidad completa, auditoría, temporal query, debugging con replay). Críticos prácticos (Ayende Rahien, Oren Eini de RavenDB) argumentan que ES es una solución a un problema que la mayoría de sistemas no tiene: ¿cuántas aplicaciones necesitan saber cómo era un pedido hace 6 meses? Para el 95% de los sistemas, un ORM + tabla de auditoría (registro de cambios) ofrece el 80% del valor de ES con el 10% de la complejidad. Young responde que ES no es para todos, pero cuando lo necesitás (finanzas, compliance, healthcare), la alternativa (ORM + auditoría ad-hoc) es frágil e incompleta.

**Por qué**: Esta controversia está viva. Martin Kleppmann en *Designing Data-Intensive Applications* presenta ES como una opción de arquitectura, no como un default. La clase presentó ES como complemento de CQRS, pero la realidad práctica es que ES requiere expertise que pocos equipos tienen: event versioning, upcasting, snapshots, y reconstrucción de estado. Para E-Commerce Platform, ES en el bounded context de Pedidos (donde la trazabilidad agrega valor de negocio) podría justificarse; en Catálogo (cambios simples) probablemente no.

---

