---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 3: Refactorizar Monolito Legacy

### a) Primer módulo a extraer
**Módulo de Productos** — mayor carga, cambios frecuentes, más fácil de extraer (menos dependencias transaccionales).

### b) Fases de migración

**Fase 1 (1-2 meses)**: Extraer Productos
1. Identificar API surface del módulo
2. Crear nuevo servicio con su propia BD
3. Usar Strangler Fig: redirigir tráfico `/api/products/*` al nuevo servicio
4. El monolito consulta el nuevo servicio para datos de productos
5. Una vez estable, eliminar código legacy de productos

**Fase 2 (3-4 meses)**: Extraer Stock
1. Similar, pero requiere baja latencia
2. Redis cache para consultas de stock
3. Eventos para sincronizar stock con el monólogo

**Fase 3 (5-6 meses)**: Extraer —rdenes de Compra + Reportes
1. —rdenes de compra: flujo complejo, considerar CQRS
2. Reportes: migrar a base de datos analítica (ClickHouse)

### c) Consistencia durante migración
```java
// Estrategia: dual-write temporal
public class ProductMigrationService {
    public void saveProduct(Product product) {
        oldMonolithRepository.save(product);   // viejo
        newServiceClient.save(product);         // nuevo
        // Comparar resultados con job de reconciliación
    }
}
```

### d) BD compartida
- Cada nuevo servicio obtiene su propia BD
- Migrar datos gradualmente con scripts ETL
- Job de reconciliación nocturno para verificar integridad

### e) Redirigir tráfico sin downtime
```
Gateway config (Spring Cloud Gateway):
  /api/products/** → new-service (100% tráfico)
  /api/** → legacy-monolith (resto)

Feature flag:
  if (useNewProducts) {
    redirect to new service
  } else {
    use legacy code
  }
```

---

## Solución Ejercicio 4: Circuit Breaker para Pagos

### a) Configuración

```java
@Bean
public CircuitBreaker paymentCircuitBreaker() {
    return CircuitBreaker.of("payment-gateway", CircuitBreakerConfig.custom()
        .slidingWindowType(SlidingWindowType.COUNT_BASED)
        .slidingWindowSize(10)           // últimas 10 llamadas
        .failureRateThreshold(50)        // abrir si 50% fallan
        .waitDurationInOpenState(Duration.ofSeconds(30))
        .permittedNumberOfCallsInHalfOpenState(3)
        .recordExceptions(TimeoutException.class, IOException.class, PaymentException.class)
        .build());
}
```

### b) Fallback con cola de reintentos

```java
@Component
public class PaymentFallback implements PaymentClient {
    private final KafkaTemplate<String, PaymentRequest> kafka;

    public PaymentResponse authorize(PaymentRequest request) {
        // Encolar para reintentar
        kafka.send("payment-retry", request.getOrderId(), request);
        return PaymentResponse.pending(request.getOrderId(),
            "Payment queued for retry");
    }
}
```

### c) Dead Letter Queue

```java
@Component
public class PaymentRetryConsumer {
    private static final int MAX_RETRIES = 5;

    @KafkaListener(topics = "payment-retry", groupId = "payment-retry-group")
    public void retryPayment(PaymentRequest request,
                             @Header("retry-count") Integer retryCount) {
        if (retryCount == null) retryCount = 0;
        if (retryCount >= MAX_RETRIES) {
            kafkaTemplate.send("payment-dlq", request); // mover a DLQ
            return;
        }
        try {
            paymentClient.authorize(request); // reintentar
        } catch (Exception e) {
            throw new RetryableException(e); // Kafka reintentará
        }
    }
}
```

### d) Monitoreo

```java
// Métricas con Micrometer
@EventListener
public void onCircuitBreakerEvent(CircuitBreakerEvent event) {
    String metricName = "circuitbreaker." + event.getCircuitBreakerName();
    switch (event.getState()) {
        case OPEN:   counter(metricName + ".open").increment(); break;
        case CLOSED: counter(metricName + ".closed").increment(); break;
        case HALF_OPEN: counter(metricName + ".half_open").increment(); break;
    }
}
```

### e) Testing

```java
@ExtendWith(MockitoExtension.class)
class PaymentCircuitBreakerTest {
    @Test
    void shouldOpenCircuitAfterFailures() {
        when(paymentClient.authorize(any()))
            .thenThrow(new PaymentException("Gateway error"));

        // 10 llamadas que fallan
        for (int i = 0; i < 10; i++) {
            assertThrows(Exception.class, () -> service.processPayment(request));
        }
        // La siguiente debe ir al fallback inmediatamente
        PaymentResponse response = service.processPayment(request);
        assertEquals("PENDING", response.getStatus());
    }

    @Test
    void shouldCloseCircuitAfterRecovery() {
        // Simular HALF_OPEN: 3 llamadas exitosas
        when(paymentClient.authorize(any()))
            .thenReturn(PaymentResponse.success("txn-123"));
        PaymentResponse response = service.processPayment(request);
        assertEquals("SUCCESS", response.getStatus());
    }
}
```

---

## Solución Ejercicio 5: Flujo de Eventos - Completar Pedido

### a) Eventos (Coreografía)

```
[Order Service]      publica: OrderCreated
                        —,
[Inventory Service]  consume: OrderCreated
                     publica: StockConfirmed | StockFailed
                        —,
[Payment Service]    consume: StockConfirmed
                     publica: PaymentProcessed | PaymentFailed
                        —,
[Order Service]      consume: PaymentProcessed → actualiza estado
[Shipping Service]   consume: PaymentProcessed
                     publica: ShipmentCreated
                        —,
[Order Service]      consume: ShipmentCreated → actualiza tracking
[Notification]       consume: ShipmentCreated → envía email
```

### b) Commands (Orquestación)

```
[OrderOrchestrator]
  1. CreateOrder
  2. ConfirmStock
  3. ProcessPayment
  4. CreateShipment
  5. SendNotification
```

### c) Schemas de eventos

```json
// OrderCreated
{ "eventId": "evt-001", "eventType": "OrderCreated", "version": 1,
  "data": { "orderId": "ORD-001", "customerId": "CUST-001",
            "items": [{"productId":"P1", "qty":2}], "total": 150.00 } }

// StockConfirmed
{ "eventId": "evt-002", "eventType": "StockConfirmed", "version": 1,
  "data": { "orderId": "ORD-001", "confirmed": true } }

// PaymentProcessed
{ "eventId": "evt-003", "eventType": "PaymentProcessed", "version": 1,
  "data": { "orderId": "ORD-001", "transactionId": "TXN-789", "status": "SUCCESS" } }
```

### d) Garantías de entrega

| Paso | Garantía | Razón |
|------|----------|-------|
| OrderCreated → Inventory | At-least-once | No perder pedidos |
| Inventory → Payment | At-least-once | No procesar pago sin stock |
| Payment → Shipping | At-least-once + idempotencia | No crear 2 envíos |
| Shipment → Notification | At-most-once | Email no crítico |

### e) Compensaciones

| Paso fallido | Compensación |
|-------------|--------------|
| Stock falla | Cancelar pedido, notificar usuario |
| Pago falla | Liberar stock, notificar usuario, reintentar pago |
| Envío falla | Reembolsar pago, escalar a operaciones |
| Notificación falla | Reintentar, si persiste ignorar |

---

## Solución Ejercicio 6: Consistencia en Carrito

### a) Nivel de consistencia
**Consistencia eventual** es aceptable para el carrito:
- El usuario agrega productos → se guardan en Redis (alta velocidad)
- Si hay inconsistencias temporales (producto agotado), se validan al hacer checkout
- No hay pérdida financiera por inconsistencias en el carrito

### b) Redis o PostgreSQL
**Redis** (con persistencia RDB). Razones:
- Baja latencia (<1ms) para operaciones del carrito
- TTL automático para carritos abandonados
- La consistencia eventual es aceptable
- PostgreSQL agregaría latencia innecesaria

### c) Producto agotado en carrito
```java
// Validar stock al hacer checkout, no al agregar al carrito
public class CheckoutService {
    public CheckoutResult execute(CheckoutCommand cmd) {
        Cart cart = cartRepository.findById(cmd.cartId());
        for (CartItem item : cart.getItems()) {
            if (!inventoryService.hasStock(item.getProductId(), item.getQuantity())) {
                return CheckoutResult.failed(item.getProductId(), "Sin stock");
            }
        }
        // Si todo tiene stock, crear pedido
        return createOrder(cart);
    }
}
```

### d) Solución propuesta
```
Arquitectura del Carrito:
+--------+    Redis (KV)    +----------+
| Carrito|    TTL: 7 días   | (Redis)  |
+--------+                  +----------+
    |                            |
    | Checkout (POST /api/checkout)
    v                            |
+--------+    PostgreSQL         |
| Service|    fuerte)            |
+--------+                      |
    | Validar stock (REST)      |
    v                            |
+--------+                      |
|Inventory|                     |
+--------+                      |
```

---

## Solución Ejercicio 7: Context Map

### a) Relaciones entre contextos

```
+----------+     Customer-Supplier      +----------+
| (Product)|  (Product info, pricing)   |          |
+----------+                            +----------+
     |                                       |
     | Events (ProductCreated)               | Events (OrderCreated)
     v                                       v
+----------+                            +----------+
| (Stock)  |  (OrderCreated → reserve)  |          |
+----------+                            +----------+
     |                                       |
     | Customer-Supplier                      |
     v                                       v
+----------+         Partnership       +----------+
| (creates |  (sync product/stock)     | (stock)  |
|  product)|                           |          |
+----------+                           +----------+
```

### b) Anticorruption Layers (ACL)

Necesario entre **Catalog → Orders**:
- En Catalog, Product tiene: id, name, description, price, images, category, attributes
- En Orders, Product solo necesita: id, name, price (para la línea de pedido)

```java
// ACL que traduce Product de Catalog a ProductInfo de Orders
@Component
public class CatalogToOrdersTranslator {
    public ProductInfo translate(CatalogProduct catalogProduct) {
        return new ProductInfo(
            catalogProduct.getId(),
            catalogProduct.getName(),
            catalogProduct.getPrice()
        );
    }
}
```

### c) "Producto" en cada contexto

| Contexto | Significado | Atributos |
|----------|-------------|-----------|
| Catálogo | Artículo a la venta | nombre, descripción, precio, imágenes, categoría, atributos |
| Pedidos | Artículo comprado | id, nombre, precio en el momento de la compra |
| Inventario | Unidad en almacén | SKU, ubicación, cantidad, stock mínimo |

### d) Eventos entre contextos

| Evento | Productor | Consumidores |
|--------|-----------|--------------|
| ProductCreated | Catalog | Inventory (crear entrada de stock) |
| ProductPriceChanged | Catalog | Orders (actualizar precio en pedidos pendientes) |
| OrderCreated | Orders | Inventory (reservar stock) |
| OrderCancelled | Orders | Inventory (liberar stock) |
| StockLow | Inventory | Catalog (marcar como "pocas unidades") |

---

## Solución Ejercicio 8: Bases de Datos

| Contexto | BD recomendada | Justificación |
|----------|---------------|---------------|
| Catálogo | **MongoDB** | Atributos variables por categoría (schema-less). Documentos anidados (producto + variantes). |
| Pedidos | **PostgreSQL** | Transacciones ACID requeridas. Relaciones complejas (Order → OrderLine → Payment). |
| Carrito | **Redis** | Baja latencia obligatoria (<5ms). TTL para expiración. Datos temporales. |
| Reportes | **ClickHouse** | Columnar optimizado para agregaciones. Grandes volúmenes, consultas analíticas. |
| Búsqueda | **Elasticsearch** | Full-text search con scoring. Filtros facetados (por categoría, precio, marca). |
| Sesiones | **Redis** | Acceso muy frecuente. Expiración automática. No requiere persistencia fuerte. |
| Logs | **Elasticsearch** o **Grafana Loki** | Alto volumen de escritura secuencial. Consultas de troubleshooting. |

---

## Solución Ejercicio 9: Transaction Outbox + Kafka

### Entidades

```java
@Entity
@Table(name = "orders")
public class OrderEntity {
    @Id private UUID id;
    private String customerId;
    private String status;
    private BigDecimal total;
    private String currency;
    @OneToMany(cascade = ALL)
    private List<OrderLineEntity> lines;
    // getters, setters...
}

@Entity
@Table(name = "outbox")
public class OutboxEvent {
    @Id private UUID id;
    private String aggregateId;
    private String eventType;
    @Column(columnDefinition = "TEXT")
    private String payload;
    private String topic;
    private boolean processed;
    private LocalDateTime createdAt;
    // getters...
}
```

### OrderService con @Transactional

```java
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public UUID createOrder(CreateOrderCommand cmd) {
        OrderEntity order = new OrderEntity();
        order.setId(UUID.randomUUID());
        order.setCustomerId(cmd.customerId());
        order.setStatus("CREATED");
        order.setTotal(cmd.total());
        order.setLines(cmd.items().stream().map(this::toEntity).toList());
        orderRepository.save(order); // 1. Guardar pedido

        OutboxEvent outbox = new OutboxEvent();
        outbox.setId(UUID.randomUUID());
        outbox.setAggregateId(order.getId().toString());
        outbox.setEventType("OrderCreated");
        outbox.setPayload(objectMapper.writeValueAsString(
            Map.of("orderId", order.getId(), "total", order.getTotal())));
        outbox.setTopic("order-events");
        outbox.setProcessed(false);
        outbox.setCreatedAt(LocalDateTime.now());
        outboxRepository.save(outbox); // 2. Guardar evento (misma transacción)

        return order.getId();
    }
}
```

### OutboxPublisher

```java
@Component
public class OutboxPublisher {
    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafka;

    @Scheduled(fixedDelay = 3000)
    @Transactional
    public void publishPending() {
        List<OutboxEvent> pending = outboxRepository.findByProcessedFalse();
        for (OutboxEvent event : pending) {
            try {
                kafka.send(event.getTopic(), event.getAggregateId(), event.getPayload())
                    .get(3, TimeUnit.SECONDS);
                event.setProcessed(true);
                outboxRepository.save(event);
            } catch (Exception e) {
                log.error("Failed to publish outbox event {}", event.getId(), e);
            }
        }
    }
}
```

### Consumidor Idempotente

```java
@Component
public class OrderCreatedConsumer {
    private final Set<String> processedIds = ConcurrentHashMap.newKeySet();

    @KafkaListener(topics = "order-events")
    public void handle(String payload) {
        OrderCreatedEvent event = objectMapper.readValue(payload, OrderCreatedEvent.class);
        // Idempotencia
        if (!processedIds.add(event.getOrderId())) return;
        try {
            // Procesar: actualizar inventario, preparar envío, etc.
            processOrder(event);
        } catch (Exception e) {
            processedIds.remove(event.getOrderId()); // Permitir reintento
            throw e;
        }
    }
}
```

---

## Solución Ejercicio 10: Migración de BD sin Downtime

### Estrategia: Expand-Contract Pattern

**Fase 1: Expand (expandir)**
Crear nuevas tablas junto a las existentes. Escribir en ambas.

```sql
-- Nueva estructura order_items
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders_new(id),
    product_id UUID NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

-- Disparador que replica datos de jsonb a order_items
CREATE OR REPLACE FUNCTION replicate_order_items()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
    SELECT gen_random_uuid(), NEW.id, items->>'product_id',
           (items->>'quantity')::int, (items->>'unit_price')::decimal
    FROM jsonb_array_elements(NEW.items) AS items;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER replicate_items AFTER INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION replicate_order_items();
```

**Fase 2: Migrar lecturas**
Actualizar la aplicación para leer de las nuevas tablas mientras escribe en ambas.

```java
public class OrderRepository {
    // Lectura: usar nueva estructura
    public Order findById(UUID id) {
        OrderEntity order = jpaRepository.findById(id);
        List<OrderItemEntity> items = orderItemRepository.findByOrderId(id);
        return orderMapper.toDomain(order, items); // ya no usa jsonb items
    }

    // Escritura: dual (vieja + nueva)
    public void save(Order order) {
        OrderEntity entity = orderMapper.toEntity(order);
        jpaRepository.save(entity); // escribe en orders (incluye jsonb items por trigger)
        orderItemRepository.saveAll(orderMapper.toItemEntities(order)); // escribe en order_items
    }
}
```

**Fase 3: Contract (contrarer)**
Una vez verificada la migración, eliminar la columna `items` JSONB y el trigger.

```sql
DROP TRIGGER IF EXISTS replicate_items ON orders;
ALTER TABLE orders DROP COLUMN items;
```

### b) Blue-Green + Feature Flags

```
Blue (actual):   orders con jsonb items
Green (nuevo):   orders + order_items

Feature flag: "use-new-order-structure"
  false → usar jsonb items (blue)
  true  → usar order_items (green)

Pasos:
1. Deploy green con flag=false (todos usan blue)
2. Activar flag para 1%, 10%, 50%, 100%
3. Monitorear errores y performance
4. Si todo OK, eliminar flag y código legacy
```

### c) Escrituras durante migración
Usar **dual-write** con disparador de BD:
- Nuevas escrituras → actualizan ambas tablas automáticamente
- Script de backfill para datos históricos
- Job de reconciliación nocturno

### d) Verificación

```sql
-- Script de verificación
SELECT COUNT(*) as total_orders,
       COUNT(DISTINCT o.id) as orders_with_items,
       COUNT(*) - COUNT(DISTINCT o.id) as missing_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id;

-- Verificar montos totales
SELECT o.id, o.total, SUM(oi.quantity * oi.unit_price) as calculated_total
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.total
HAVING o.total != SUM(oi.quantity * oi.unit_price);
```

### e) Rollback

```sql
-- Rollback script
-- 1. Mantener el trigger escribiendo jsonb (nunca se eliminó hasta Fase 3)
-- 2. Revertir aplicación a usar jsonb (feature flag = false)
-- 3. Si la app ya usaba order_items y falla, cambiar flag a false
-- 4. Eliminar tablas nuevas si es necesario:
DROP TABLE IF EXISTS order_items CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS items; -- (solo si Fase 3 se ejecutó)
```

