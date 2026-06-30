---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Diseñar Esquema Kafka

**Solución esperada**:

### a) Topics de Kafka

| Topic | Particiones | Retención | Productor | Consumidores |
|-------|-------------|-----------|-----------|--------------|
| `order-events` | 3 | 7 días | OrderService | InventoryService, PaymentService, NotificationService |
| `inventory-events` | 2 | 3 días | InventoryService | OrderService, NotificationService |
| `payment-events` | 3 | 30 días | PaymentService | OrderService, ShippingService, NotificationService |
| `shipping-events` | 2 | 7 días | ShippingService | OrderService, NotificationService |

### b) Schemas de eventos

```json
// 1. OrderCreated
{
  "eventType": "OrderCreated",
  "version": 1,
  "data": {
    "orderId": "ORD-001",
    "customerId": "CUST-001",
    "items": [{"productId": "P001", "quantity": 2}],
    "total": 150.00,
    "currency": "USD",
    "createdAt": "2026-06-26T10:30:00Z"
  }
}

// 2. StockReserved / StockReservationFailed
{
  "eventType": "StockReserved",
  "version": 1,
  "data": {
    "orderId": "ORD-001",
    "reserved": true
  }
}

// 3. PaymentProcessed / PaymentFailed
{
  "eventType": "PaymentProcessed",
  "version": 1,
  "data": {
    "orderId": "ORD-001",
    "transactionId": "TXN-789",
    "status": "SUCCESS"
  }
}
```

### c) Consumer Groups

| Consumer Group | Topics que consume | Propósito |
|----------------|-------------------|-----------|
| `inventory-group` | order-events | Reservar stock |
| `payment-group` | order-events, inventory-events | Procesar pago |
| `shipping-group` | payment-events | Crear envío |
| `notification-group` | order-events, payment-events, shipping-events | Enviar notificaciones |

### d) Garantías de entrega

- **OrderCreated → Inventory**: At-least-once. Si falla la reserva de stock, se reintenta.
- **Inventory → Payment**: At-least-once. Si falla el pago, se reintenta.
- **Payment → Shipping**: At-least-once + idempotencia. El envío solo debe crearse una vez.
- **Notificaciones**: At-most-once. Si no llega, el usuario ya tiene el pedido confirmado.

### e) Manejo de fallo de stock

```java
// InventoryService publica evento de fallo
if (!hasStock(productId, quantity)) {
    eventPublisher.publish(new StockReservationFailedEvent(orderId, productId));
}

// OrderService consume y cancela el pedido
@EventListener
public void on(StockReservationFailedEvent event) {
    Order order = orderRepository.findById(event.orderId())
        .orElseThrow();
    order.cancel();
    orderRepository.save(order);
    eventPublisher.publish(new OrderCancelledEvent(order.getId(), "Sin stock"));
}
```

**Posibles mejoras**:
- Introducir **Avro + Schema Registry** para los esquemas de eventos en lugar de JSON crudo: definir `OrderCreated.avsc` con campos tipados y versionado, registrar en Schema Registry, y validar compatibilidad BACKWARD en CI/CD. Ventaja: los eventos ocupan menos espacio en disco y en red, y la evolución de esquemas es gobernada.
- Ajustar la **estrategia de particionamiento** por `orderId` en todos los topics de eventos relacionados con pedidos: esto garantiza que los eventos de un mismo pedido se procesen en orden (ordenamiento por clave) y que el mismo consumidor procese todos los eventos de ese pedido, simplificando la lógica de consistencia.
- Diseñar una **estrategia de compactación** para eventos que representan estado actual: `inventory-events` podría usar log compaction para mantener solo el último evento por `productId`, eliminando eventos intermedios de ajuste de stock que ya no son relevantes, reduciendo el almacenamiento.

---

## Ejercicio 4: Comparación REST vs Eventos

**Solución esperada**:

### a) Tabla comparativa

| Aspecto | REST (actual) | Eventos (Kafka) |
|---------|---------------|------------------|
| Latencia del pago | Baja (espera directa) | Mayor (procesamiento asíncrono) |
| Disponibilidad si PaymentService cae | OrderService falla (error 500) | OrderService continúa, pago pendiente en cola |
| Complejidad de implementación | Baja (HTTP simple) | Alta (infraestructura Kafka, idempotencia) |
| Trazabilidad | Request/response en logs | Eventos persistentes, trazabilidad completa |
| Consistencia de datos | Fuerte (respuesta inmediata) | Eventual (pago se procesa después) |
| Testing | Fácil (mockear HTTP) | Complejo (necesita Kafka) |

### b) Cuándo mantener REST
- El pago debe ser **inmediato y confirmado** antes de continuar (ej: el usuario ve resultado).
- Requisito de **consistencia fuerte** en el momento de la transacción.
- Equipo pequeño sin experiencia en mensajería asíncrona.
- Bajo volumen de transacciones.

### c) Cuándo migrar a eventos
- PaymentService tiene **fallos frecuentes** que afectan a OrderService.
- Necesidad de **escalar** OrderService independientemente de PaymentService.
- **Alto volumen** de pagos que puede superar la capacidad de PaymentService.
- Necesidad de **auditoría y trazabilidad** completa.

### d) Solución híbrida

```
OrderService                    PaymentService
    |                                |
    |-- REST: autorización inicial ->|  (síncrono, verificar tarjeta)
    |<- respuesta: "autorizada" -----|
    |                                |
    |-- Evento: PaymentConfirmed --> |  (asíncrono, procesar pago real)
    |                                |
    |<-- Evento: PaymentProcessed -- |  (notificación asíncrona)
    |                                |
```

1. **REST rápido** para autorización inicial (validar tarjeta, fondos disponibles) — respuesta en <500ms.
2. **Evento asíncrono** para el procesamiento real del pago (capturar fondos, conciliar).
3. El usuario ve "Pago confirmado" inmediatamente después de la autorización.
4. Si el procesamiento posterior falla, se notifica al usuario y se revierte el pedido.

**Posibles mejoras**:
- Para la solución híbrida, detallar el **manejo del escenario de fallo post-autorización**: el usuario ve "Pago confirmado" pero la captura asíncrona falla 10 minutos después. Estrategia: notificación push/email informando del fallo, pedido marcado como `PAYMENT_PENDING` en el read model, y un proceso de compensación automático que reintenta la captura o revierte el pedido con reembolso de la pre-autorización.
- Agregar una columna de **costo operacional estimado** para cada opción: REST no requiere infraestructura adicional; Kafka requiere brokers (mínimo 3 para producción), ZooKeeper/KRaft, monitoreo, y posiblemente un equipo de plataforma que lo mantenga. Esto cuantifica el tradeoff para el CTO/CFO.
- Comparar con una tercera opción: **gRPC con streaming** para el flujo de pago, donde el servidor de pagos envía actualizaciones de estado al cliente a través de un server-streaming gRPC, combinando baja latencia inicial con notificaciones asíncronas de progreso sin necesidad de Kafka para este flujo específico.

