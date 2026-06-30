---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Implementar Proyección (Projector)

Implementa el projector que actualiza el **OrderSummaryView** a partir de los eventos:

### Eventos disponibles
```java
public record OrderCreatedEvent(OrderId orderId, CustomerId customerId, Money total, LocalDateTime createdAt) {}
public record OrderPaidEvent(OrderId orderId, LocalDateTime paidAt) {}
public record OrderDispatchedEvent(OrderId orderId, LocalDateTime dispatchedAt) {}
public record OrderDeliveredEvent(OrderId orderId, LocalDateTime deliveredAt) {}
public record OrderCancelledEvent(OrderId orderId, String reason, LocalDateTime cancelledAt) {}
```

### Read Model (OrderSummaryView)
```java
public class OrderSummaryView {
    private String orderId;
    private String customerId;
    private double total;
    private String status;        // CREATED, PAID, DISPATCHED, DELIVERED, CANCELLED
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    private LocalDateTime paidAt;
    private LocalDateTime deliveredAt;
    // getters, setters...
}
```

### Tareas
a) Implementa `OrderSummaryProjector` con métodos para cada evento
b) ¿Qué pasa si el projector recibe eventos fuera de orden? (ej: `OrderPaidEvent` antes de `OrderCreatedEvent`)
c) Propón una estrategia de manejo de eventos duplicados (idempotencia)

---

## Ejercicio 4: Análisis de Decisión CQRS

Analiza el siguiente escenario y decide **si aplicar CQRS o no**, justificando:

**Escenario A**: Un blog con artículos, comentarios y autores. Las operaciones son:
- Crear/editar/eliminar artículos (admin)
- Comentar artículos (usuarios)
- Listar artículos con paginación y filtros
- Buscar artículos por título o contenido
- Panel de estadísticas (vistas, comentarios por artículo)

**Escenario B**: Un sistema bancario de transacciones donde:
- Cada transacción debe ser registrada con auditoría completa
- Los saldos deben ser exactos (consistencia fuerte)
- Se requieren reportes de gastos por categoría
- Consultas de historial de transacciones con filtros complejos

Para cada escenario:
1. ¿Aplicarías CQRS? Sí/No
2. ¿Aplicarías Event Sourcing? Sí/No
3. ¿Cuál sería la estructura de modelos?
4. ¿Qué beneficios/riesgos específicos hay?
