---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Transaction Outbox

**Solución esperada**:

### a) Tabla outbox

```sql
CREATE TABLE outbox (
    id UUID PRIMARY KEY,
    aggregate_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    topic VARCHAR(255) NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_outbox_unprocessed ON outbox (processed, created_at)
    WHERE processed = FALSE;
```

### b) Entidad JPA

```java
@Entity
@Table(name = "outbox")
public class OutboxEvent {
    @Id
    private UUID id;
    @Column(name = "aggregate_id")
    private String aggregateId;
    @Column(name = "event_type")
    private String eventType;
    @Column(columnDefinition = "JSONB")
    private String payload;
    private String topic;
    private boolean processed;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    // Constructor, getters, setters
    public void markProcessed() {
        this.processed = true;
        this.processedAt = LocalDateTime.now();
    }
}
```

### c) Repositorio

```java
public interface OutboxRepository extends JpaRepository<OutboxEvent, UUID> {
    @Query("SELECT o FROM OutboxEvent o WHERE o.processed = false ORDER BY o.createdAt")
    List<OutboxEvent> findPendingEvents();
}
```

### d) OrderService con Outbox

```java
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public OrderId createOrder(CreateOrderCommand command) {
        // 1. Crear pedido
        Order order = new Order(command.customerId(), command.address());
        // ... agregar items, validar, etc.
        orderRepository.save(order);

        // 2. Crear evento en outbox (en la misma transacción)
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setId(UUID.randomUUID());
        outboxEvent.setAggregateId(order.getId().getValue());
        outboxEvent.setEventType("OrderCreated");
        outboxEvent.setPayload(objectMapper.writeValueAsString(
            new OrderCreatedEvent(order.getId(), order.getTotal())));
        outboxEvent.setTopic("order-events");
        outboxEvent.setCreatedAt(LocalDateTime.now());
        outboxRepository.save(outboxEvent);

        return order.getId();
    }
}
```

### e) OutboxPublisher

```java
@Component
public class OutboxPublisher {
    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public OutboxPublisher(OutboxRepository outboxRepository,
                          KafkaTemplate<String, String> kafkaTemplate,
                          ObjectMapper objectMapper) {
        this.outboxRepository = outboxRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelay = 5000)
    public void publishPendingEvents() {
        List<OutboxEvent> pending = outboxRepository.findPendingEvents();
        for (OutboxEvent event : pending) {
            try {
                kafkaTemplate.send(event.getTopic(), event.getPayload()).get(5, TimeUnit.SECONDS);
                event.markProcessed();
                outboxRepository.save(event);
                log.info("Published event {} to topic {}", event.getId(), event.getTopic());
            } catch (Exception e) {
                log.error("Failed to publish event {} (attempts: {}): {}",
                    event.getId(), e.getMessage());
                // Reintentar en el próximo ciclo
            }
        }
    }
}
```

**Posibles mejoras**:
- Reemplazar el **polling (Scheduled)** por **Debezium CDC**: Debezium lee el WAL de PostgreSQL, detecta cada INSERT en la tabla `outbox`, y publica a Kafka en milisegundos en lugar de cada 5 segundos. Ventaja: latencia mínima, cero carga en la aplicación, sin dependencia de `@Scheduled`. Desventaja: requiere operar Debezium + Kafka Connect.
- Agregar una **estrategia de purga de outbox**: borrar registros procesados que tengan más de 7 días para evitar que la tabla `outbox` crezca indefinidamente. Job nocturno: `DELETE FROM outbox WHERE processed = true AND processed_at < NOW() - INTERVAL '7 days'`.
- Implementar **ordenamiento garantizado** por `aggregate_id`: el OutboxPublisher procesa eventos en orden de `created_at` agrupados por `aggregate_id`, y usa la clave de partición `orderId` en Kafka para que los eventos del mismo pedido vayan a la misma partición y se procesen en orden. Esto evita que `OrderPaid` se publique antes que `OrderCreated` por timing del poller.

---

## Ejercicio 4: Análisis CAP/PACELC

**Solución esperada**:

| Sistema | C | A | P | Explicación |
|---------|---|---|---|-------------|
| **PostgreSQL single node** | Sí | Sí | No | Sin partición (no distribuido). C y A. |
| **PostgreSQL sync replication** | Sí | No (durante partición) | Sí | Si el standby no responde, el primary se bloquea. CP. |
| **Cassandra (quorum)** | Eventual | Sí | Sí | AP. Siempre acepta writes, pero puede devolver datos viejos. |
| **MongoDB (default)** | Eventual | Sí | Sí | AP. Primary acepta writes aunque los secondaries no estén actualizados. |
| **Redis Cluster** | Eventual | Sí | Sí | AP. Si un nodo se cae, los datos en ese nodo se pierden. |
| **Kafka** | Sí | No (si brokers pierden leader) | Sí | CP (con min.insync.replicas). Prioriza consistencia sobre disponibilidad. |

### PACELC

| Sistema | En partición (P) | En normal (Else) |
|---------|-----------------|-------------------|
| PostgreSQL single node | N/A (no distribuido) | L (baja latencia) |
| PostgreSQL sync rep | C (consistencia) | C (espera confirmación replicación) |
| Cassandra | A (disponibilidad) | L (baja latencia, consistencia eventual) |
| MongoDB | A (disponibilidad) | L (baja latencia, writes locales) |
| Redis Cluster | A (disponibilidad) | L (baja latencia en misma partición) |
| Kafka | C (consistencia) | L (baja latencia ack local) |

**Posibles mejoras**:
- Incluir un análisis de **cómo cada sistema maneja la recuperación post-partición**: PostgreSQL sync replication usa WAL shipping y catchup automático; Cassandra usa hinted handoff y read repair para reconciliar datos después de la partición; Kafka usa ISR (in-sync replicas) y leader election automática. Esto muestra que la recuperación no es gratis —cada sistema tiene mecanismos y tradeoffs diferentes.
- Evaluar **escenarios realistas de partición** para cada sistema: en PostgreSQL single node no hay partición de red (es un solo nodo), pero hay "partición" si el disco falla → los datos se pierden si no hay backup. En Cassandra, una partición entre datacenters se maneja con QUORUM local por datacenter (LOCAL_QUORUM) que mantiene consistencia local y replica asíncronamente entre datacenters.

