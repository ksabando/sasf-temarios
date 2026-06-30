---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Task-Based UI" que Greg Young propone como complemento natural de CQRS y cómo cambia el diseño de interfaces de usuario?

**Respuesta**: Greg Young argumenta que CQRS requiere repensar la UI: en lugar de formularios CRUD que exponen directamente los campos del modelo de datos, la UI debe ser **task-based**: cada pantalla representa una tarea de negocio específica y envía comandos con la intención del usuario, no con los datos crudos. Por ejemplo, en lugar de un formulario con campos `status`, `shippingDate`, `trackingNumber` para "editar pedido", tenés acciones concretas: `CancelOrder`, `MarkAsShipped`, `AddTrackingNumber`. Cada acción es un comando específico con solo los datos necesarios, validados según reglas de negocio del dominio. Esto reduce errores de validación y alinea la UI con el Ubiquitous Language.

**Por qué**: Young desarrolló este concepto junto con CQRS en múltiples conferencias DDD. La clase mencionó commands y queries como conceptos técnicos, pero no abordó el impacto en UX. Task-Based UI implica que la pantalla "detalle de pedido" muestra el read model (datos desnormalizados optimizados para visualización), y las acciones disponibles son comandos del dominio. Esto es un cambio de paradigma respecto al CRUD tradicional donde la UI mapea 1:1 con la tabla de la base de datos.

---

### 3. [Investigar] ¿Qué es el patrón "Commanded" (Elixir) y "Axon Framework" (Java) y cómo implementan CQRS + Event Sourcing de forma distinta a la aproximación manual de la clase?

**Respuesta**: **Axon Framework** (creado por Allard Buijze) es un framework Java maduro para CQRS + Event Sourcing que abstrae el command bus, query bus, event store y event bus. En lugar de escribir handlers manuales con repositorios, definís aggregates con anotaciones `@Aggregate`, comandos con `@CommandHandler`, y event handlers con `@EventHandler`. Axon maneja el event store (Axon Server, JPA, o MongoDB), snapshots, replay de eventos y distribución de eventos entre servicios. **Commanded** (Elixir) es el equivalente en el ecosistema Elixir, usando `GenServer` y `EventStore`. Ambos frameworks eliminan el boilerplate de implementar CQRS desde cero y agregan features que la clase no cubrió: sagas distribuidas, tracking de posición de eventos, dead-letter queues para eventos fallidos.

**Por qué**: La clase enseñó CQRS "a mano" para entender los conceptos, pero en producción se usan frameworks. Axon es el estándar de facto en Java para CQRS+ES, con soporte para Kafka, AMQP y gRPC para distribución de eventos. Axon implementa conceptos avanzados como "Tracking Event Processor" (cada consumidor trackea su posición en el event stream) y "Saga" como un Process Manager distribuido —conceptos que la clase no cubrió pero son esenciales para producción.

---

### 4. [Investigar] ¿Qué es la "CQRS Read Model on Write Side" (modelo de lectura en el lado de escritura) y cómo resuelve el problema de consistencia inmediata post-escritura?

**Respuesta**: Un problema conocido de CQRS es que después de ejecutar un comando, el read model aún no está actualizado (eventual consistency). Si la UI necesita mostrar el resultado inmediatamente, hay un race condition. La solución, documentada por Udi Dahan y Greg Young, es que el write side debe poder responder la query inmediatamente después del comando sin esperar al read model. Esto se implementa de varias formas: (1) el command handler retorna el nuevo estado del aggregate en la respuesta, (2) el command handler actualiza el read model en la misma transacción (same-transaction CQRS para casos de baja latencia), o (3) el cliente espera un evento de confirmación con polling o WebSocket. La solución más común es la (1): el comando `CreateOrder` retorna `OrderId` y los datos esenciales del pedido recién creado.

**Por qué**: La clase mencionó eventual consistency pero no las estrategias para mitigar el problema en la UX. Udi Dahan aborda esto en *"Race Conditions Don't Exist"* y en su curso de arquitectura NServiceBus. Para E-Commerce Platform, al crear un pedido, la respuesta inmediata debería incluir el `orderId` y el estado "CREATED" para que la UI redirija al usuario a la página de confirmación sin esperar que el read model se actualice.

---

### 5. [Conectar] La clase presenta CQRS con modelos de lectura y escritura separados. ¿Cómo se relaciona esto con el "Commanded Pattern" y el "Query Object" de Martin Fowler en *Patterns of Enterprise Application Architecture*?

**Respuesta**: Fowler describe el "Query Object" como un objeto que representa una consulta a la base de datos, encapsulando criterios y mapeo de resultados. CQRS generaliza esto: el Query Object es la query del read model, pero además hay un modelo de lectura específico (no la tabla transaccional). El "Commanded Pattern" que Fowler no nombró explícitamente pero que describe en el capítulo de "Transaction Script" vs "Domain Model", anticipa CQRS: separar la lógica de modificación (Transaction Script o Domain Model) de la lógica de consulta (Query Object + vistas). CQRS formaliza arquitectónicamente lo que Fowler insinuó como patrón de diseño.

**Por qué**: Fowler no escribió sobre CQRS hasta 2011 (después de Greg Young), pero sus patrones de Query Object y Separated Interface prefiguran la separación de modelos. La conexión histórica muestra que CQRS no surgió de la nada: es la culminación de patrones que evolucionaron por 15 años. La clase presentó CQRS como un patrón aislado, sin su linaje en los patrones de Fowler.

---

### 6. [Conectar] La clase cubre que CQRS sincroniza write→read con eventos. ¿Cómo se relaciona esto con "Change Data Capture" (CDC) y Debezium como alternativa a eventos de dominio para sincronización?

**Respuesta**: CDC (Change Data Capture) captura cambios directamente del log de transacciones de la base de datos (WAL en PostgreSQL, binlog en MySQL) y los publica como eventos. Debezium es la implementación más popular. A diferencia de publicar Domain Events desde el código de aplicación, CDC: (1) no requiere modificar la aplicación existente, (2) captura **todas** las escrituras incluso si alguien ejecutó SQL directo, y (3) es atómico con la transacción de base de datos (sin outbox pattern manual). La desventaja: los eventos de CDC son técnicos (row-level) no de dominio (no son "OrderCreated", son "INSERT INTO orders VALUES(...)"). Se necesita una capa de transformación para convertirlos en Domain Events.

**Por qué**: La clase presentó la sincronización con eventos de dominio, pero no CDC. Gunnar Morling (líder de Debezium) documenta este patrón en el blog de Debezium. La práctica moderna usa ambos: Domain Events para comunicación entre bounded contexts, CDC para alimentar read models y data pipelines. Para E-Commerce Platform, CDC sería útil para sincronizar el catálogo de productos desde el sistema de administración a los read models de búsqueda sin tocar el código legacy.

---

### 7. [Conectar] La clase presenta Event Sourcing como complemento de CQRS. ¿Cómo se relaciona esto con "Bitemporal Data" y qué limitación de Event Sourcing resuelve?

**Respuesta**: Event Sourcing responde "¿qué pasó y cuándo en el sistema?" (transaction time). Bitemporal Data, un concepto de bases de datos temporales (Snodgrass, 1995), agrega una segunda dimensión: "¿cuándo supimos que algo pasó?" (valid time). Por ejemplo, un cliente informa un cambio de dirección el 10 de junio (valid time), pero el sistema lo registra el 12 de junio (transaction time). Event Sourcing puro solo captura transaction time. La combinación con bitemporal permite responder queries como "¿cuál era la dirección **que creíamos correcta** el 11 de junio?" y "¿cuál era la dirección **real** del cliente el 11 de junio?" —esencial en sistemas financieros y de compliance.

**Por qué**: Greg Young ha mencionado bitemporal como extensión de Event Sourcing en charlas avanzadas. Martin Kleppmann en *Designing Data-Intensive Applications* también aborda el problema de "conocimiento tardío" en sistemas de eventos. La clase no mencionó esta limitación de ES ni la extensión bitemporal, que es crítica en dominios donde la corrección retroactiva importa (pedidos, facturación).

---

### 8. [Cuestionar] ¿Es CQRS sobre-ingeniería para el 90% de las aplicaciones web? Contrastá la visión maximalista de Greg Young con la opinión pragmática de Martin Fowler.

**Respuesta**: Greg Young ha dicho "CQRS is not a top-level architecture, it's a pattern you apply in specific parts of your system." Sin embargo, en la práctica, muchos equipos lo adoptan como arquitectura global. Martin Fowler, en su bliki sobre CQRS (2011), advierte: "CQRS has significant complexity and should not be applied wholesale to a system. Use it only where the disparity between reads and writes justifies it." Fowler recomienda aplicar CQRS solo en bounded contexts específicos (ej: Pedidos en E-Commerce), no en todo el sistema. Para el módulo de Catálogo (alta lectura, baja escritura) podría tener sentido; para Usuarios (CRUD simple), no.

**Por qué**: Fowler y Young coinciden en que CQRS es para casos específicos, pero la industria a menudo lo usa como patrón universal. Greg Young ha lamentado en charlas posteriores que "la gente aplica CQRS a cosas que son básicamente CRUD." La clase presentó CQRS como una decisión con criterios, pero no abordó la tendencia del over-use que incluso su creador critica.

---

### 9. [Cuestionar] ¿Es peligroso el uso de CQRS con consistencia eventual para datos financieros? ¿Qué dice Pat Helland sobre consistencia eventual en sistemas transaccionales?

**Respuesta**: Pat Helland, en su paper seminal *"Life Beyond Distributed Transactions: an Apostate's Opinion"* (2007), argumenta que las transacciones distribuidas ACID no escalan y que la consistencia eventual es inevitable en sistemas distribuidos. Sin embargo, Helland también advierte que ciertas operaciones (débito/crédito financiero, asignación de inventario) requieren **consistencia fuerte dentro de una entidad atómica** (lo que en DDD es un aggregate). La conclusión: CQRS con consistencia eventual es seguro siempre que el aggregate sea la unidad de consistencia fuerte. Un pago y su correspondiente débito de cuenta deben estar en el mismo aggregate. Si separás débito y crédito en diferentes servicios con consistencia eventual, podés duplicar o perder dinero.

**Por qué**: Helland es la referencia canónica sobre los límites de las transacciones distribuidas. La clase presentó Saga como solución para consistencia eventual, pero no discutió los casos donde la consistencia eventual **no es aceptable** (operaciones financieras atómicas). La clave es el diseño de aggregates: si dos cosas deben ser consistentes, deben estar en el mismo aggregate.

---

### 10. [Cuestionar] ¿Deberíamos aplicar CQRS sin Event Sourcing? ¿Defiende Greg Young que siempre van juntos o acepta CQRS con ORM tradicional?

**Respuesta**: Greg Young ha aclarado repetidamente que CQRS **no requiere** Event Sourcing: "CQRS does not require Event Sourcing. You can use CQRS with a relational database." Sin embargo, Young y otros (como Udi Dahan) argumentan que una vez que separás modelos de lectura y escritura, Event Sourcing es el siguiente paso natural porque resuelve elegantemente la sincronización entre modelos. La clase presentó CQRS + ES como combinación natural, pero la práctica muestra que muchas implementaciones exitosas de CQRS usan bases de datos relacionales con vistas materializadas o triggers para el read model, sin event store.

**Por qué**: Esta es una confusión común. Young escribió en 2010: "Event Sourcing is not required for CQRS." La clase sugiere que ES es el complemento natural, y lo es para casos de uso con trazabilidad y auditoría, pero no es obligatorio. Para el 80% de los casos de CQRS, un ORM + read replicas o vistas materializadas es suficiente y mucho más simple operacionalmente que un event store completo.

---

