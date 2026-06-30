---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Consumidor Idempotente

**Solución esperada**:

```java
@Component
public class OrderCreatedConsumer {
    private static final int MAX_RETRIES = 3;

    private final OrderReadModelRepository readModelRepository;
    private final EmailService emailService;
    private final PaymentService paymentService;
    private final DeadLetterQueueService dlqService;
    private final Set<String> processedEvents = ConcurrentHashMap.newKeySet();

    public OrderCreatedConsumer(
            OrderReadModelRepository readModelRepository,
            EmailService emailService,
            PaymentService paymentService,
            DeadLetterQueueService dlqService) {
        this.readModelRepository = readModelRepository;
        this.emailService = emailService;
        this.paymentService = paymentService;
        this.dlqService = dlqService;
    }

    @KafkaListener(topics = "order-events", groupId = "order-created-consumer")
    public void handleOrderCreated(ConsumerRecord<String, OrderCreatedEvent> record) {
        OrderCreatedEvent event = record.value();
        String eventId = event.eventId();

        // 1. Idempotencia
        if (!processedEvents.add(eventId)) {
            log.info("Event {} already processed, skipping", eventId);
            return;
        }

        try {
            // 2. Actualizar read model
            readModelRepository.save(new OrderSummaryView(
                event.orderId().getValue(),
                event.customerName(),
                event.total().getAmount(),
                "CREATED"
            ));

            // 3. Enviar email (puede fallar independientemente)
            try {
                emailService.sendConfirmation(event.customerEmail(), event.orderId().getValue());
            } catch (Exception e) {
                log.warn("Email failed for order {}, continuing payment", event.orderId(), e);
                // El email no debe bloquear el pago
            }

            // 4. Solicitar autorización de pago
            paymentService.requestAuthorization(event.orderId(), event.total());

        } catch (Exception e) {
            handleError(record, eventId, e);
        }
    }

    private void handleError(ConsumerRecord<String, OrderCreatedEvent> record, String eventId, Exception e) {
        int retries = record.headers().lastHeader("retry-count") != null
            ? Integer.parseInt(new String(record.headers().lastHeader("retry-count").value()))
            : 0;

        if (retries < MAX_RETRIES) {
            log.warn("Event {} failed, attempt {}/{}. Error: {}", eventId, retries + 1, MAX_RETRIES, e.getMessage());
            // Reintentar con backoff (Kafka realizará el retry automáticamente)
            throw new RetryableException(e);
        } else {
            log.error("Event {} failed after {} attempts, sending to DLQ", eventId, MAX_RETRIES, e);
            dlqService.sendToDeadLetterQueue("order-events-dlq", record);
            processedEvents.remove(eventId); // Permitir reprocesar si se recupera de DLQ
        }
    }
}
```

**Posibles mejoras**:
- Reemplazar `ConcurrentHashMap.newKeySet()` con una **tabla de deduplicación persistente** `processed_events(eventId, processedAt)` en base de datos, porque el Set en memoria se pierde si el consumidor se reinicia. Para performance, usar Redis con TTL = tiempo de retención de Kafka (ej. 7 días), balanceando durabilidad con velocidad.
- Separar las responsabilidades en **handlers independientes** con diferentes consumer groups: `OrderReadModelProjector` en un consumer group, `EmailNotificationSender` en otro, `PaymentRequestor` en otro. Así un fallo en el envío de email no bloquea la actualización del read model ni el inicio del pago —cada uno avanza a su ritmo con su propia DLQ.
- Implementar **retry con backoff exponencial usando topics de reintento**: en lugar de reintentar en el mismo consumidor con `RetryableException`, publicar el evento fallido a `order-events-retry-1`, luego `order-events-retry-2`, etc., cada uno con un poll interval creciente, y al topic `order-events-dlq` tras agotar reintentos. Esta es la práctica recomendada por Confluent y evita que un evento "venenoso" bloquee todo el consumer group.

---

## Ejercicio 4: Análisis de EDA para E-Commerce

**Solución esperada**:

### a) Arquitectura Event-Driven

```
                    +------------------+
                    |     Kafka        |
                    | Topics:          |
                    | - order-events   |
                    | - payment-events |
                    | - inventory-events|
                    | - shipment-events|
                    | - notification-  |
                    |   events         |
                    +------------------+
                     /     |    |    \
                    /      |    |     \
                   v       v    v      v
            +--------+ +------+ +------+ +------+
            |Pedidos | |Pagos | |Invent.| |Envíos|
            +--------+ +------+ +------+ +------+
                 |                        |
                 v                        v
           +--------+               +------+
           |Notific.|               |Catálo.|
           +--------+               +------+
```

**Flujo**: Pedidos publica `OrderCreated` → Pagos consume y publica `PaymentProcessed` → Inventario consume `PaymentProcessed` y actualiza stock... etc.

### b) Topics de Kafka

| Topic | Productores | Consumidores |
|-------|-------------|--------------|
| `order-events` | Pedidos | Pagos, Notificaciones |
| `payment-events` | Pagos | Pedidos, Inventario, Notificaciones |
| `inventory-events` | Inventario | Pedidos, Catálogo |
| `shipment-events` | Envíos | Pedidos, Notificaciones |
| `notification-events` | Notificaciones | (servicio interno) |

### c) Patrones de Resiliencia adicionales

1. **Retry with Backoff**: reintentar con espera exponencial (1s, 2s, 4s, 8s...)
2. **Circuit Breaker**: para llamadas REST a servicios externos (gateway de pago)
3. **Dead Letter Queue (DLQ)**: eventos que fallan permanentemente
4. **Bulkhead**: thread pools separados por servicio consumidor
5. **Health Checks**: monitorear conectividad con Kafka y servicios externos
6. **Idempotencia**: evitar procesamiento duplicado de eventos

### d) Consistencia de datos

Estrategia de **Transaction Outbox** (Módulo 10):
1. Cuando Pedidos crea una orden, escribe en la misma transacción: `orders` table + `outbox` table
2. Un `OutboxPublisher` lee la tabla `outbox` y publica en Kafka
3. Si falla la publicación, reintenta hasta éxito (at-least-once)
4. Si el consumidor de Pagos no recibe el evento, puede consultar un endpoint de reconciliación

**Reconciliación**: un job periódico que compara eventos publicados vs. procesados.

**Posibles mejoras**:
- Reemplazar el Outbox Publisher manual por **Debezium CDC** (Change Data Capture): Debezium lee el WAL de PostgreSQL y publica cada nueva fila en la tabla `outbox` directamente a Kafka, eliminando el componente Outbox Publisher y garantizando que ningún evento se pierda incluso si la aplicación crashea.
- Agregar una **política de retención de eventos** por topic con consideraciones legales y de negocio: `order-events` → 1 año (requerimientos de auditoría), `notification-events` → 7 días (solo para reintentos). Esto impacta el dimensionamiento de disco de Kafka y el costo operacional.
- Diseñar un **evento de reconciliación** `ReconciliationRequested` que un scheduler dispare cada hora: cada servicio publica su estado (último offset procesado, cantidad de eventos pendientes) y un monitor centralizado detecta desfases entre lo publicado y lo procesado, generando alertas antes de que el desfase se convierta en incidente de negocio.

