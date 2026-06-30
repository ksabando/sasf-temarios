---
sidebar_label: "Clase"
---

## 3. Event-Driven vs Request-Driven

| Aspecto | Request-Driven (REST) | Event-Driven |
|---------|----------------------|--------------|
| **Acoplamiento temporal** | Alto (cliente espera respuesta) | Bajo (productor no espera) |
| **Acoplamiento espacial** | Alto (cliente conoce URL del servidor) | Bajo (productor no conoce consumidores) |
| **Consistencia** | Fuerte (respuesta inmediata) | Eventual (latencia en la propagación) |
| **Resiliencia** | Baja (fallo en cascada sin CB) | Alta (consumidores independientes) |
| **Trazabilidad** | Baja (solo el request/response) | Alta (todos los eventos quedan registrados) |
| **Complejidad** | Baja | Alta |

---

## 4. Coreografía vs Orquestación

### Coreografía (Choreography)
Cada servicio reacciona a eventos y produce sus propios eventos. No hay coordinador central.

```
+--------+     PaymentRequested      +--------+
| Pedidos|-------------------------->| Pagos  |
|        |                           |        |
|        |<--------------------------|        |
+--------+     PaymentCompleted      +--------+
    |                                      |
    | OrderCreated                         |
    v                                      v
+--------+                           +--------+
| Envíos |                           | Emails |
+--------+                           +--------+
```

**Ventajas**: descentralizado, alta autonomía, escalable.
**Desventajas**: difícil de monitorear, flujo implícito, manejo de errores complejo.

### Orquestación (Orchestration)
Un orquestador central coordina el flujo.

```
+------------------+
|  Orquestador     |
|  (Saga Manager)  |
+------------------+
     |     |     |
     v     v     v
+--------+ +------+ +--------+
| Pedidos| | Pagos| | Envíos |
+--------+ +------+ +--------+
```

**Ventajas**: flujo explícito, monitoreo centralizado, manejo de errores claro.
**Desventajas**: punto central de acoplamiento, orquestador puede ser cuello de botella.

### Cuándo usar cada una

| Coreografía | Orquestación |
|-------------|--------------|
| Procesos simples (<5 pasos) | Procesos complejos (>5 pasos) |
| Alta autonomía de servicios | Necesidad de monitoreo centralizado |
| Baja necesidad de trazabilidad | Alta necesidad de trazabilidad |
| Equipos maduros | Equipos en crecimiento |

---

## 5. Event Sourcing (Profundización)

### Event Store
Base de datos **append-only** de eventos. Los eventos nunca se modifican ni eliminan.

```
Event Store:
[1] OrderCreated { orderId: "123", customerId: "456", total: 150.00 }
[2] ProductAdded { orderId: "123", productId: "P001", quantity: 2 }
[3] ProductAdded { orderId: "123", productId: "P002", quantity: 1 }
[4] OrderPaid    { orderId: "123", transactionId: "T789" }
[5] OrderDispatched { orderId: "123", trackingId: "TRACK001" }
```

### Reconstrucción de Aggregates
```java
public class Order {
    private OrderId id;
    private OrderStatus status;
    private List<OrderLine> lines;
    private Money total;

    // Constructor vacío para reconstrucción
    public Order() {}

    // Reconstruir desde eventos (replay)
    public static Order replay(List<DomainEvent> events) {
        Order order = new Order();
        for (DomainEvent event : events) {
            order.apply(event);
        }
        return order;
    }

    private void apply(DomainEvent event) {
        switch (event) {
            case OrderCreatedEvent e -> {
                this.id = e.orderId();
                this.status = OrderStatus.CREATED;
                this.lines = new ArrayList<>();
            }
            case ProductAddedEvent e ->
                this.lines.add(new OrderLine(e.productId(), e.quantity(), e.unitPrice()));
            case OrderPaidEvent e -> this.status = OrderStatus.PAID;
            case OrderDispatchedEvent e -> this.status = OrderStatus.DISPATCHED;
            default -> {}
        }
    }
}
```

---

## 6. Event Versioning

Los eventos evolucionan. Una estrategia de versioning es necesaria.

### Upcasting
Convertir eventos viejos al nuevo formato al leerlos.

```json
// Versión 1 del evento
{ "type": "OrderCreated", "version": 1, "orderId": "123", "customerId": "456" }

// Versión 2 (agrega campo "source")
{ "type": "OrderCreated", "version": 2, "orderId": "123", "customerId": "456", "source": "WEB" }
```

```java
public class OrderCreatedUpcaster implements Upcaster {
    @Override
    public DomainEvent upcast(DomainEvent oldEvent) {
        if (oldEvent.version() == 1) {
            return new OrderCreatedEvent(
                oldEvent.orderId(),
                oldEvent.customerId(),
                "UNKNOWN"  // valor por defecto para version 1
            );
        }
        return oldEvent;
    }
}
```

### Version in Event
```json
{ "eventType": "order.created", "version": 2, "data": { ... } }
```

---

## 7. Garantías de Entrega

| Garantía | Descripción | Cómo lograrlo |
|----------|-------------|---------------|
| **At-most-once** | El evento se entrega 0 o 1 vez | Fire-and-forget |
| **At-least-once** | El evento se entrega 1+ veces | Acknowledgments + retry |
| **Exactly-once** | El evento se entrega exactamente 1 vez | Idempotencia + deduplicación |

### Idempotencia en Consumidores
```java
@Component
public class PaymentConsumer {
    private final Set<String> processedIds = ConcurrentHashMap.newKeySet();

    @KafkaListener(topics = "payment-events")
    public void handlePaymentEvent(PaymentEvent event) {
        // Idempotencia: si ya procesamos este evento, ignorar
        if (!processedIds.add(event.eventId())) {
            log.info("Event {} already processed, skipping", event.eventId());
            return;
        }
        // Procesar evento...
    }
}
```

---

## 8. Consistent Event Naming

Convención: **PastTenseVerb + PastParticiple** (verbo en pasado + participio)

| Correcto | Incorrecto |
|----------|------------|
| OrderCreated | CreateOrder, order_created, ORDER_CREATED |
| PaymentProcessed | ProcessPayment, payment-processed |
| InventoryUpdated | UpdateInventory |
| ShipmentDelivered | ShipmentDelivery |

---

## 9. Kafka vs RabbitMQ

| Aspecto | Kafka | RabbitMQ |
|---------|-------|----------|
| **Modelo** | Log distribuido (pub/sub persistente) | Broker de mensajes (colas) |
| **Rendimiento** | Millones de msg/seg | Miles a decenas de miles/seg |
| **Persistencia** | Alta (disco, replicación) | Media (opcional) |
| **Retención** | Configurable por tiempo/tamaño | Hasta que se consume (ACK) |
| **Ordenamiento** | Garantizado dentro de una partición | No garantizado |
| **Consumer Groups** | Particionado, replay posible | Competidores en cola |
| **Casos de uso** | Event sourcing, pipelines, streaming | CQRS, colas de trabajo, RPC |

---

## 10. Laboratorio

Implementar flujo event-driven en E-Commerce Platform:

```
OrderCreated → PaymentRequested → PaymentProcessed → InventoryUpdated → ShipmentRequested → ShipmentDelivered
```

1. Definir eventos del dominio
2. Configurar Kafka con topics
3. Implementar productores (servicios que emiten eventos)
4. Implementar consumidores (servicios que reaccionan)
5. Manejar fallos: retry, DLQ (Dead Letter Queue)
6. Implementar idempotencia en consumidores
