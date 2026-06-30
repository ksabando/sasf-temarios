---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Implementar Proyección

**Solución esperada**:

### a) OrderSummaryProjector

```java
@Component
public class OrderSummaryProjector {
    private final OrderSummaryRepository repository;

    public OrderSummaryProjector(OrderSummaryRepository repository) {
        this.repository = repository;
    }

    @EventListener
    public void on(OrderCreatedEvent event) {
        OrderSummaryView view = new OrderSummaryView();
        view.setOrderId(event.orderId().getValue());
        view.setCustomerId(event.customerId().getValue());
        view.setTotal(event.total().getAmount().doubleValue());
        view.setStatus("CREATED");
        view.setCreatedAt(event.createdAt());
        view.setLastUpdated(event.createdAt());
        repository.save(view);
    }

    @EventListener
    public void on(OrderPaidEvent event) {
        repository.findById(event.orderId().getValue()).ifPresent(view -> {
            view.setStatus("PAID");
            view.setPaidAt(event.paidAt());
            view.setLastUpdated(event.paidAt());
            repository.save(view);
        });
    }

    @EventListener
    public void on(OrderDispatchedEvent event) {
        repository.findById(event.orderId().getValue()).ifPresent(view -> {
            view.setStatus("DISPATCHED");
            view.setLastUpdated(event.dispatchedAt());
            repository.save(view);
        });
    }

    @EventListener
    public void on(OrderDeliveredEvent event) {
        repository.findById(event.orderId().getValue()).ifPresent(view -> {
            view.setStatus("DELIVERED");
            view.setDeliveredAt(event.deliveredAt());
            view.setLastUpdated(event.deliveredAt());
            repository.save(view);
        });
    }

    @EventListener
    public void on(OrderCancelledEvent event) {
        repository.findById(event.orderId().getValue()).ifPresent(view -> {
            view.setStatus("CANCELLED");
            view.setLastUpdated(event.cancelledAt());
            repository.save(view);
        });
    }
}
```

### b) Eventos fuera de orden

Estrategias:
1. **Crear si no existe**: en cada evento, si el view no existe, crear uno en estado "UNKNOWN" y actualizar.
2. **Event versioning**: cada evento lleva un número de secuencia. Ignorar eventos con secuencia menor.
3. **Rechazar y reintentar**: si el evento requiere un estado previo que no existe, rechazar y reintentar después.
4. **Event Store lookup**: el projector puede consultar el event store para reconstruir el estado si llegan desordenados.

```java
// Estrategia: crear si no existe
private OrderSummaryView getOrCreate(String orderId) {
    return repository.findById(orderId)
        .orElseGet(() -> {
            OrderSummaryView view = new OrderSummaryView();
            view.setOrderId(orderId);
            view.setStatus("UNKNOWN");
            return repository.save(view);
        });
}
```

### c) Idempotencia

```java
@EventListener
public void on(OrderPaidEvent event) {
    repository.findById(event.orderId().getValue()).ifPresent(view -> {
        // Idempotencia: si ya está PAID, no procesar de nuevo
        if (!"PAID".equals(view.getStatus())) {
            view.setStatus("PAID");
            view.setPaidAt(event.paidAt());
            view.setLastUpdated(event.paidAt());
            repository.save(view);
        }
    });
}
```

**Posibles mejoras**:
- Implementar una **tabla de deduplicación genérica** `processed_events(eventId, eventType, processedAt)` que todos los projectors consulten antes de procesar, en lugar de depender solo de la idempotencia por estado. Esto cubre casos donde un evento duplicado no cambia el estado (ej. `OrderPaidEvent` que llega dos veces cuando el pedido ya estaba PAID: la idempotencia por estado lo ignora, pero el registro de deduplicación es más robusto para eventos sin efecto de estado).
- Usar **checkpointing con Kafka**: si los eventos se publican en Kafka, el projector usa un consumer group con commit de offsets, garantizando que cada evento se procesa exactamente una vez (at-least-once con idempotencia) y que si el projector cae, retoma desde el último offset commiteado.
- Agregar un **Dead Letter Topic/Queue** para eventos que el projector no puede procesar después de N reintentos (ej. evento corrupto, orderId que no existe en el write model por una inconsistencia). Un operador revisa el dead letter y decide reintentar manualmente o descartar.

---

## Ejercicio 4: Análisis de Decisión

**Solución esperada**:

### Escenario A: Blog

| Decisión | Respuesta | Justificación |
|----------|-----------|---------------|
| ¿CQRS? | **No (inicialmente)** | Las operaciones CRUD son similares en lectura/escritura. Un modelo único es suficiente. |
| ¿Event Sourcing? | **No** | No hay necesidad de auditoría completa ni trazabilidad. |
| ¿Cuándo reconsiderar? | Si el blog escala mucho y las consultas de búsqueda requieren un índice especializado (Elasticsearch), se podría separar el modelo de búsqueda. |

**Estructura**: Modelo único (JPA simple) con:
- `Article`, `Comment`, `Author` entities
- Repositorios estándar
- Caché para listas y búsquedas (Redis)
- Elasticsearch para búsqueda full-text (este sería el único "read model" separado)

### Escenario B: Sistema Bancario

| Decisión | Respuesta | Justificación |
|----------|-----------|---------------|
| ¿CQRS? | **Sí** | Las operaciones de escritura (transacciones) son muy diferentes de las consultas (reportes, historial). Alta diferencia de modelos. |
| ¿Event Sourcing? | **Sí** | Necesidad de auditoría completa e inmutable. Cada transacción es un evento. Trazabilidad regulatoria (compliance). |
| **Beneficios** | - Trazabilidad total de transacciones<br>- Reportes sin afectar el modelo transaccional<br>- Capacidad de reconstruir estado histórico |
| **Riesgos** | - Complejidad de reconciliación de saldos<br>- Consistencia eventual entre write y read<br>- Volumen de eventos creciente |

**Estructura recomendada**:
- **Write model**: Event Store con eventos de transacciones (Deposited, Withdrawn, Transferred)
- **Read model 1**: `AccountBalanceView` (saldo actual, desnormalizado)
- **Read model 2**: `TransactionHistoryView` (historial para UI)
- **Read model 3**: `MonthlyReportView` (reportes agregados)
- **Snapshots**: periódicos para evitar replay completo

**Posibles mejoras**:
- Agregar un **tercer escenario (C: ecommerce con carrito de compras)** que demuestre CQRS parcial: write model con DDD para `Order` aggregate, read model en Elasticsearch para búsqueda de productos, pero el carrito de compras (alta mutabilidad, baja complejidad) se mantiene en modelo único por simplicidad, demostrando que CQRS no es todo o nada.
- Para el escenario bancario, detallar la **estrategia de reconciliación de saldos**: un proceso batch nocturno que compara la suma de eventos de cada cuenta con el `AccountBalanceView` y emite alertas si hay discrepancia, como control de integridad ante bugs en los projectors.
- Incluir una **matriz de tradeoffs CQRS vs CRUD** cuantitativa con dimensiones: complejidad de implementación (1-5), performance de lectura (1-5), performance de escritura (1-5), mantenibilidad (1-5), facilidad de debugging (1-5), para que la decisión sea explícita y documentada en un ADR.

