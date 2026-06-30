---
sidebar_label: "Clase"
---

## 3. Poliglota Persistence

Usar diferentes bases de datos para diferentes necesidades dentro del mismo sistema.

```
E-Commerce Platform:
+--------+     +--------+     +---------+     +-----------+
| Orders |     |Catalog |     | Cart    |     | Search    |
| SQL    |     | MongoDB|     | Redis   |     | Elastic. |
| (ACID) |     |(flexib)|     |(KV)     |     |(full-text)|
+--------+     +--------+     +---------+     +-----------+
```

| Contexto | BD | Razón |
|----------|-----|-------|
| Pedidos | PostgreSQL (SQL) | Necesita ACID, relaciones entre tablas |
| Catálogo | MongoDB (Document) | Esquema variable por categoría de producto |
| Carrito | Redis (KV) | Baja latencia, datos temporales |
| Búsqueda | Elasticsearch | Full-text search, filtros rápidos |
| Reportes | ClickHouse (Column) | Agregaciones rápidas en grandes volúmenes |
| Sesiones | Redis (KV) | Expiración automática, acceso rápido |

---

## 4. CQRS con Diferentes Bases de Datos

```
Write (Commands)                    Read (Queries)
    |                                    |
+-----------+                     +---------------+
| PostgreSQL|                     | Elasticsearch |
| (pedidos  |  eventos de dominio | (búsqueda)    |
|  normali- |-------------------->|               |
|  zados)   |                     +---------------+
+-----------+                     +---------------+
                                  | Redis         |
                                  | (caché de     |
                                  |  consultas)   |
                                  +---------------+
```

### Sincronización
```java
// Write side: guardar en SQL
@Component
public class JpaOrderRepository implements OrderRepository {
    public void save(Order order) {
        jpaRepository.save(mapper.toEntity(order));
        // Publicar evento para actualizar read models
        eventPublisher.publish(new OrderUpdatedEvent(order.getId()));
    }
}

// Read side: actualizar Elasticsearch y Redis
@Component
public class OrderProjector {
    @EventListener
    public void on(OrderUpdatedEvent event) {
        // Actualizar Elasticsearch
        elasticsearchRepository.save(buildSearchDocument(event));
        // Invalidar caché Redis
        redisCache.evict("order:" + event.orderId());
    }
}
```

---

## 5. Consistencia de Datos

### Consistencia Fuerte (Strong Consistency)
- Todos los nodos ven los mismos datos inmediatamente.
- Ej: PostgreSQL con transacciones ACID.
- Costo: menor disponibilidad durante particiones de red.

### Consistencia Eventual (Eventual Consistency)
- Los datos se propagan con el tiempo.
- Ej: MongoDB replica, DNS, CQRS.
- Beneficio: alta disponibilidad y performance.

### CAP Theorem (Eric Brewer)

> En un sistema distribuido, solo puedes garantizar 2 de 3 propiedades:
> - **C**onsistency (consistencia)
> - **A**vailability (disponibilidad)
> - **P**artition Tolerance (tolerancia a particiones)

```
    C
   / \
  /   \
 /     \
A-------P
```

| Sistema | Elige |
|---------|-------|
| PostgreSQL (single node) | CA (sacrifica P) |
| Cassandra | AP (sacrifica C) |
| MongoDB (default) | AP (sacrifica C) |
| Zookeeper | CP (sacrifica A) |

### PACELC (Daniel J. Abadi)
Extensión de CAP: en ausencia de partición (Else), trade-off entre Latencia (L) y Consistencia (C).

---

## 6. Saga Pattern

### ¿Qué es una Saga?
Una saga es una secuencia de transacciones locales donde cada paso tiene una **acción compensatoria** en caso de fallo.

### Saga Coreografiada

```
OrderService:      PedidoCreado
                     │
                     v
InventoryService:  StockReservado ──(si falla)──→ StockFallido
                     │
                     v
PaymentService:    PagoProcesado ──(si falla)──→ PagoFallido
                     │                              │
                     v                              v
ShippingService:   EnvioCreado        OrderService: PedidoCancelado
                     │
                     v
Notification:      EmailEnviado
```

### Saga Orquestada

```
[Saga Orchestrator]
     │
     ├── 1. PedidoService: CrearPedido
     ├── 2. InventoryService: ReservarStock
     │        └── Si falla: compensar paso 1 (CancelarPedido)
     ├── 3. PaymentService: ProcesarPago
     │        └── Si falla: compensar paso 2 (LiberarStock)
     └── 4. ShippingService: CrearEnvio
              └── Si falla: compensar paso 3 (ReembolsarPago)
```

### Código de Saga Orquestada

```java
@Component
public class CreateOrderSaga {
    private final OrderService orderService;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;

    @Transactional
    public void execute(CreateOrderSagaRequest request) {
        OrderId orderId = orderService.createOrder(request); // Paso 1
        try {
            inventoryService.reserveStock(orderId, request.items()); // Paso 2
        } catch (Exception e) {
            orderService.cancelOrder(orderId); // Compensación paso 1
            throw new SagaException("Stock reservation failed", e);
        }
        try {
            paymentService.processPayment(orderId, request.total()); // Paso 3
        } catch (Exception e) {
            inventoryService.releaseStock(orderId); // Compensación paso 2
            orderService.cancelOrder(orderId);     // Compensación paso 1
            throw new SagaException("Payment failed", e);
        }
    }
}
```

---

## 7. Transaction Outbox Pattern

### Problema
Si publicas un evento Kafka y luego falla la transacción de BD, tienes un evento huérfano.

### Solución: Outbox Pattern

```
1. Transacción Atómica:               2. Publicador Confiable:
+---------------------+               +---------------------+
| orders table        |               | outbox table        |
| INSERT INTO orders  |               | SELECT * FROM outbox|
| ...                 |               | WHERE processed=0   |
|                     |               +----------+----------+
| outbox table        |                          |
| INSERT INTO outbox  |                          v
| (event, status=0)   |               +---------------------+
+---------------------+               | Kafka Producer      |
                                       | publish(event)      |
                                       +----------+----------+
                                                  |
                                                  v
                                       +---------------------+
                                       | UPDATE outbox SET   |
                                       | processed=1         |
                                       +---------------------+
```

### Implementación

```java
@Component
public class OutboxPublisher {
    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Scheduled(fixedDelay = 5000) // cada 5 segundos
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pending = outboxRepository.findByProcessedFalse();
        for (OutboxEvent event : pending) {
            try {
                kafkaTemplate.send(event.getTopic(), event.getPayload());
                event.markProcessed();
                outboxRepository.save(event);
            } catch (Exception e) {
                log.error("Failed to publish event {}", event.getId(), e);
                // Se reintentará en el próximo ciclo
            }
        }
    }
}
```

### Alternativas
- **Debezium (CDC)**: captura cambios en la BD y los publica como eventos.
- **PostgreSQL LISTEN/NOTIFY**: notificaciones asíncronas nativas de PostgreSQL.
- **Spring Transactional Event Listener**: `@TransactionalEventListener` con `TransactionPhase.AFTER_COMMIT`.

---

## 8. Laboratorio

Diseñar estrategia de persistencia para E-Commerce Platform:
1. Definir qué BD usar para cada bounded context
2. Implementar Saga coreografiada para flujo de pedidos
3. Implementar Transaction Outbox con Kafka
4. Evaluar trade-offs de consistencia
