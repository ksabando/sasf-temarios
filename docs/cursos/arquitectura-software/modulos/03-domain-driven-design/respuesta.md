---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Diseñar Aggregates

**Solución esperada**:

### a) Aggregate Root
**`Order`** es el aggregate root.

### b) Componentes

```
        +----------------------------------------+
        |  Order (Root)                          |
        |  - id: OrderId                         |
        |  - customerId: CustomerId              |
        |  - status: OrderStatus (CREATED, PAID, |
        |              DISPATCHED, DELIVERED,     |
        |              CANCELLED)                 |
        |  - lines: List<OrderLine>              |
        |  - shippingAddress: Address (VO)       |
        |  - coupon: CouponInfo (VO)             |
        |  - total: Money (VO)                   |
        |  - createdAt: Instant                  |
        +----------------------------------------+
                    |
                    v
        +---------------------------+
        |  OrderLine (Entity)       |
        |  - id: OrderLineId        |
        |  - productId: ProductId   |
        |  - quantity: int          |
        |  - unitPrice: Money       |
        +---------------------------+
```

### c) Invariantes
1. Un pedido debe tener al menos una línea.
2. No se puede modificar un pedido pagado, despachado o entregado.
3. Solo se puede cancelar un pedido en estado CREADO.
4. El total debe coincidir con la suma de líneas + impuestos - descuento + envío.
5. Las cantidades deben ser positivas.

### d) Implementación esqueleto

```java
public class Order {
    private final OrderId id;
    private final CustomerId customerId;
    private OrderStatus status;
    private List<OrderLine> lines;
    private final Address shippingAddress;
    private Money total;
    private final Instant createdAt;

    public Order(CustomerId customerId, Address shippingAddress) {
        this.id = OrderId.generate();
        this.customerId = customerId;
        this.status = OrderStatus.CREATED;
        this.lines = new ArrayList<>();
        this.shippingAddress = shippingAddress;
        this.total = Money.zero(Currency.CLP);
        this.createdAt = Instant.now();
    }

    public void addProduct(ProductId productId, Money unitPrice, int quantity) {
        if (status != OrderStatus.CREATED) {
            throw new IllegalStateException("Solo se puede modificar pedido en estado CREADO");
        }
        lines.add(new OrderLine(productId, quantity, unitPrice));
        recalculateTotal();
    }

    public void markPaid() {
        if (status != OrderStatus.CREATED) {
            throw new IllegalStateException("Solo se puede pagar un pedido CREADO");
        }
        this.status = OrderStatus.PAID;
    }

    public void cancel() {
        if (status != OrderStatus.CREATED) {
            throw new IllegalStateException("Solo se puede cancelar un pedido CREADO");
        }
        this.status = OrderStatus.CANCELLED;
    }

    private void recalculateTotal() {
        this.total = lines.stream()
            .map(OrderLine::calculateSubtotal)
            .reduce(Money.zero(Currency.CLP), Money::add);
    }
}
```

### e) Interacción entre aggregates
Si necesitamos verificar stock al agregar un producto, debemos evitar que el aggregate `Order` dependa directamente de `Inventory`. Solución: el **Application Service** coordina:

```java
public class CreateOrderUseCase {
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService; // Domain Service

    public OrderId execute(CreateOrderCommand cmd) {
        // Verificar stock para todos los productos
        for (ProductItem item : cmd.items()) {
            if (!inventoryService.hasStock(item.productId(), item.quantity())) {
                throw new InsufficientStockException(item.productId());
            }
        }
        // Crear pedido
        Order order = new Order(cmd.customerId(), cmd.address());
        cmd.items().forEach(item ->
            order.addProduct(item.productId(), item.unitPrice(), item.quantity()));
        orderRepository.save(order);
        return order.getId();
    }
}
```

**Posibles mejoras**:
- Agregar una **Domain Event** `OrderCreated` que el aggregate dispare en el constructor, y que un handler en el bounded context de Inventario consuma para reservar stock de forma asíncrona con consistencia eventual, eliminando la verificación síncrona del Application Service.
- Extraer la lógica de recálculo de total a un **Domain Service** `OrderPricingService` que aplique reglas de descuento, impuestos por jurisdicción y costo de envío, manteniendo al aggregate enfocado en la transición de estados y la composición de líneas.

---

## Ejercicio 4: Context Map

**Solución esperada**:

```
                    +-------------+
                    |  Usuarios   |
                    +------+------+
                           | (Customer-Supplier)
                           v
+----------+         +----------+         +----------+
| Catálogo |<------->| Pedidos  |<------->| Pagos    |
+----------+ (ACL)   +----------+ (Events) +----------+
     |                     |
     | (Events)            | (Customer-Supplier)
     v                     v
+----------+         +----------+         +-------------+
|Inventario|         |  Envíos  |         |Notificacion.|
+----------+         +----------+         +-------------+

```

### Relaciones

| Contexto A | Contexto B | Relación | Flujo |
|-----------|-----------|----------|-------|
| Catálogo → Pedidos | Customer-Supplier | Pedidos consulta productos del catálogo. Catálogo es upstream. |
| Pedidos → Inventario | Customer-Supplier | Pedido pagado → reducir stock. |
| Pedidos → Notificaciones | Customer-Supplier | Eventos de pedido → enviar notificaciones. |
| Usuarios → Pedidos | Customer-Supplier | Usuarios provee datos del cliente a pedidos. |
| Catálogo → Inventario | Partnership | Catálogo crea producto → Inventario crea entrada de stock. |

### Traducción necesaria (ACL)
Entre Catálogo y Pedidos se requiere **Anticorruption Layer** porque el concepto "Producto" es diferente en cada contexto. El ACL traduce:
- Catálogo `Product` (precio, descripción, imágenes, categoría) → Pedidos `ProductInfo` (id, nombre, precio)

**Posibles mejoras**:
- Agregar la relación de **Separate Ways** para el contexto de Notificaciones: en lugar de que Pedidos sea Customer-Supplier, que Notificaciones simplemente escuche eventos de múltiples contextos y sea completamente independiente, eliminando el acoplamiento de equipo y permitiendo que Notificaciones evolucione como un producto propio.
- Incluir un **Conformist** para la relación con un contexto externo legacy (ej. sistema de facturación electrónica gubernamental), donde el downstream no tiene poder de negociación sobre el upstream y debe conformarse estrictamente al modelo del upstream.
- Extender el Context Map con un **Shared Kernel** si Catálogo y Pedidos comparten Value Objects que son idénticos en ambos contextos (ej. `Money`, `Currency`, `ProductId`), extrayéndolos a una librería compartida con versionado estricto para reducir duplicación sin acoplar los modelos de dominio.

