---
sidebar_label: "Clase"
---

## 3. Queries

Una **Query** solicita datos sin modificar el estado.

### Características
- **Interrogativo**: "GetOrderById", "SearchProducts", "GetDailySales"
- **Retorna datos** (DTOs, vistas)
- **Múltiples queries** pueden existir para el mismo comando
- **Optimizado para lectura**: desnormalizado, proyecciones, caching

```java
// Query
public record GetOrderSummaryQuery(
    OrderId orderId
) {}

// Query Handler
@Component
public class GetOrderSummaryHandler implements QueryHandler<GetOrderSummaryQuery, OrderSummaryDTO> {
    private final OrderReadRepository orderReadRepository;

    @Override
    public OrderSummaryDTO handle(GetOrderSummaryQuery query) {
        return orderReadRepository.findSummaryById(query.orderId())
            .orElseThrow(() -> new OrderNotFoundException(query.orderId()));
    }
}
```

---

## 4. Modelos de Lectura y Escritura

### Write Model (Modelo de Escritura)
- Orientado a **DDD** (entidades, VOs, aggregates)
- **Normalizado** (evita duplicación)
- **Consistencia fuerte** dentro del aggregate
- **Transaccional** (ACID)
- Poca carga de queries

### Read Model (Modelo de Lectura)
- Orientado a **vistas** (lo que la UI necesita)
- **Desnormalizado** (Joins precalculados, tablas planas)
- **Consistencia eventual** con el write model
- **Optimizado para consultas** (índices, columnas específicas)
- Múltiples read models para diferentes vistas

```java
// Read Model (desnormalizado para una vista específica)
@Entity
@Table(name = "order_summary_view")
public class OrderSummaryView {
    @Id
    private String orderId;
    private String customerName;
    private String customerEmail;
    private LocalDateTime orderDate;
    private String status;
    private double total;
    private int itemCount;
    private String lastEvent;
    private LocalDateTime lastUpdated;

    // getters...
}
```

---

## 5. Sincronización Write → Read

La sincronización entre el write model y el read model ocurre **de forma asíncrona** mediante eventos.

```
Write DB (SQL)           Read DB (NoSQL/read replica)
    |                            ^
    |   Domain Events            |
    |                            |
    +---->[Event Publisher]------+
              |
              v
         [Event Consumer]
              |
              v
         [Read Model Projector]
              |
              v
         Actualiza read model
```

### Patrones de sincronización

| Patrón | Descripción | Cuándo usar |
|--------|-------------|-------------|
| **Event-Driven** | Eventos de dominio actualizan read model | CQRS puro, sistemas distribuidos |
| **CDC (Change Data Capture)** | Log de BD → eventos (Debezium) | Sin modificar la app existente |
| **Materialized View** | Vistas materializadas en la BD SQL | Simple, sin tecnología adicional |
| **Batch Sync** | Sincronización periódica | Reportes, datos no críticos |
| **Same-Transaction** | Escribir ambos modelos en la misma transacción | Consistencia fuerte, pero acoplamiento |

---

## 6. CQRS + Event Sourcing

**Event Sourcing** (ES) es el complemento natural de CQRS. En lugar de almacenar el estado actual, se almacenan **todos los eventos** que llevaron a ese estado.

```
Command: "Crear Pedido"
    │
    v
[Event Store] ──→ Event: "OrderCreated" (append-only)
    │
    ├── Event: "ProductAdded" (Producto X, 2 unidades)
    ├── Event: "ProductAdded" (Producto Y, 1 unidad)
    ├── Event: "OrderPaid"
    ├── Event: "OrderDispatched"
    └── Event: "OrderDelivered"

    Para conocer el estado actual: replay de eventos
    Order{ status: DELIVERED, items: [X, Y], total: 150.00 }
```

### Ventajas
- **Trazabilidad completa**: se sabe exactamente qué pasó y cuándo.
- **Auditoría**: histórico inmutable.
- **Temporal query**: ¿cómo era el pedido ayer?
- **Depuración**: reproducir estado en cualquier punto.

### Desventajas
- **Complejidad**: la reconstrucción de estado requiere replay.
- **Almacenamiento**: los eventos nunca se borran.
- **Evolución de eventos**: los eventos cambian con el tiempo (versioning, upcasting).

---

## 7. Projections y Snapshots

### Projections
Son **vistas derivadas** de los eventos. Cada projector escucha eventos y actualiza su proyección (read model).

```java
@Component
public class OrderSummaryProjector {
    private final OrderSummaryRepository repository;

    @EventListener
    public void on(OrderCreatedEvent event) {
        repository.save(new OrderSummaryView(
            event.getOrderId().getValue(),
            event.getCustomerName(),
            event.getTotal().getAmount(),
            "CREATED"
        ));
    }

    @EventListener
    public void on(OrderPaidEvent event) {
        repository.updateStatus(event.getOrderId().getValue(), "PAID");
    }
}
```

### Snapshots
Periodicamente se guarda un **snapshot del estado actual** para evitar el replay completo de todos los eventos.

```
Snapshot en t=100: { status: PAID, items: 3, total: 250 }

Replay normal: 100 eventos → estado actual
Con snapshot:  snapshot (t=100) + 20 eventos → estado actual (80% menos eventos)
```

---

## 8. ¿Cuándo aplicar CQRS?

### A favor
- **Diferencia significativa** entre operaciones de lectura y escritura.
- **Múltiples vistas** diferentes para los mismos datos.
- **Alta carga de lectura** comparada con escritura.
- **Equipos independientes** para read y write.
- **Sistemas colaborativos** con conflictos.

### En contra (YAGNI)
- **CRUD simple**: lecturas y escrituras similares.
- **Equipo pequeño** o sistema simple.
- **No hay requerimientos** de escalabilidad o rendimiento diferenciados.
- **Complejidad adicional** no justificada.

### Decisión

```
¿Tus queries son muy diferentes de tus commands?
├── Sí → CQRS puede ser útil
├── No → CRUD / modelo único es suficiente
│
¿Necesitas trazabilidad y auditoría?
├── Sí → Considera Event Sourcing
├── No → CQRS sin ES (solo separación de modelos)
│
¿El equipo tiene experiencia con CQRS?
├── Sí → Adelante
├── No → Empieza con CQRS simple (sin ES)
```

---

## 9. Implementación Spring Boot

### Estructura de paquetes

```
com.ecommerce.orders/
├── command/                    # Lado de escritura
│   ├── CreateOrderCommand.java
│   ├── CreateOrderHandler.java
│   ├── CancelOrderCommand.java
│   └── CancelOrderHandler.java
│
├── query/                      # Lado de lectura
│   ├── GetOrderSummaryQuery.java
│   ├── GetOrderSummaryHandler.java
│   ├── GetOrdersByCustomerQuery.java
│   └── GetOrdersByCustomerHandler.java
│
├── projection/                 # Projectors (actualizan read model)
│   ├── OrderSummaryProjector.java
│   └── OrderListProjector.java
│
├── domain/                     # Modelo de escritura (DDD)
│   ├── Order.java
│   ├── OrderLine.java
│   └── OrderStatus.java
│
├── repository/                 # Repositorios
│   ├── OrderWriteRepository.java   # Para commands
│   └── OrderReadRepository.java    # Para queries
│
└── api/                        # Controladores
    ├── OrderCommandController.java  # POST, PUT, DELETE
    └── OrderQueryController.java    # GET
```

### Command Controller vs Query Controller

```java
@RestController
@RequestMapping("/api/orders")
public class OrderCommandController {
    private final CommandBus commandBus;

    @PostMapping
    public ResponseEntity<Void> createOrder(@RequestBody CreateOrderRequest request) {
        CreateOrderCommand command = new CreateOrderCommand(
            new CustomerId(request.customerId()),
            request.items(),
            request.address()
        );
        OrderId orderId = commandBus.dispatch(command);
        return ResponseEntity.created(URI.create("/api/orders/" + orderId)).build();
    }
}

@RestController
@RequestMapping("/api/orders")
public class OrderQueryController {
    private final QueryBus queryBus;

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderSummaryDTO> getOrder(@PathVariable String orderId) {
        GetOrderSummaryQuery query = new GetOrderSummaryQuery(OrderId.of(orderId));
        OrderSummaryDTO result = queryBus.dispatch(query);
        return ResponseEntity.ok(result);
    }
}
```

---

## 10. Laboratorio

Implementar CQRS en E-Commerce Platform:
1. **Command side**: CRUD de pedidos con DDD (writes)
2. **Query side**: vistas desnormalizadas para consultas (reads)
3. **Projectors**: escuchar eventos y actualizar read models
4. **Separar controladores** y repositorios
