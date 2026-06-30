---
sidebar_label: "Clase"
---

## 3. Ubiquitous Language (Lenguaje Ubicuo)

Es un lenguaje común compartido entre **expertos de dominio** (negocio) y **desarrolladores**. Se usa en:
- Conversaciones diarias
- Documentación
- Historias de usuario
- Código fuente (clases, métodos, variables)
- Tests

### Ejemplo

| Término de negocio | Término en código |
|--------------------|-------------------|
| Pedido | `Order` (clase) |
| Línea de pedido | `OrderLine` (clase) |
| Crear pedido | `createOrder()` (método) |
| Producto agotado | `ProductOutOfStockException` |
| Despachar pedido | `dispatchOrder()` (método) |

> **Regla**: Si los desarrolladores y los expertos de negocio no pueden tener una conversación fluida usando los mismos términos, el modelo de dominio está fallando.

---

## 4. Bounded Context (Contexto Delimitado)

Es el límite explícito donde un modelo de dominio específico es válido. Diferentes contextos pueden tener diferentes significados para el mismo término.

### Ejemplo: "Producto" en diferentes contextos

```
Contexto: Catálogo         Contexto: Inventario       Contexto: Envío
+-----------------+        +-----------------+        +-----------------+
| Producto        |        | Producto        |        | Producto        |
| - nombre        |        | - sku           |        | - peso          |
| - descripción   |        | - stockActual   |        | - dimensiones   |
| - precio        |        | - stockMinimo   |        | - fragil        |
| - imagenes      |        | - ubicacion     |        | - categoriaEnvio|
+-----------------+        +-----------------+        +-----------------+
```

### Relaciones entre Contextos (Context Map)

| Relación | Descripción |
|----------|-------------|
| **Partnership** | Dos contextos colaboran. Cambios coordinados. |
| **Shared Kernel** | Comparten un subconjunto del modelo. |
| **Customer-Supplier** | Upstream (suplidor) provee datos a downstream (cliente). |
| **Conformist** | Downstream acepta el modelo del upstream sin adaptación. |
| **Anticorruption Layer (ACL)** | Traducción entre modelos para evitar contaminación. |
| **Open-Host Service** | Upstream expone un servicio bien definido. |
| **Published Language** | Lenguaje formal compartido (como XML, JSON Schema). |
| **Separate Ways** | Sin integración, soluciones completamente separadas. |

---

## 5. Entities (Entidades)

Objetos con **identidad a lo largo del tiempo**. Dos entidades pueden tener los mismos atributos pero ser diferentes si su identidad es distinta.

### Características
- Tienen un **id único** que las identifica (UUID, secuencia, negocio)
- Son **mutables** (cambian con el tiempo)
- Se comparan por identidad, no por atributos

```java
public class Order {
    private OrderId id;        // Identidad única
    private OrderStatus status;
    private List<OrderLine> lines;
    private Money total;
    private LocalDateTime createdAt;

    public void addProduct(Product product, int quantity) {
        // Regla: no agregar productos si el pedido ya fue pagado
        if (status == OrderStatus.PAID) {
            throw new IllegalStateException("Cannot modify a paid order");
        }
        lines.add(new OrderLine(product, quantity));
        recalculateTotal();
    }
}
```

---

## 6. Value Objects (Objetos Valor)

Objetos sin identidad, definidos exclusivamente por sus atributos. Son **inmutables**.

### Características
- **No tienen id** (o el id no importa)
- Son **inmutables** (una vez creados, no cambian)
- Se comparan por **todos sus atributos** (equals/hashCode)
- Son intercambiables (como los enteros: 5 es 5, no importa cuál "5")

```java
public class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money)) return false;
        Money money = (Money) o;
        return amount.equals(money.amount) && currency.equals(money.currency);
    }
}
```

### Cuándo usar Value Object vs Entidad

| Criterio | Value Object | Entity |
|----------|-------------|--------|
| ¿Tiene identidad? | No | Sí |
| ¿Es mutable? | No (inmutable) | Sí |
| ¿Se reemplaza o se modifica? | Se reemplaza | Se modifica |
| Ejemplos | Dirección, Dinero, Email, Color | Pedido, Usuario, Producto |

---

## 7. Aggregates

Un aggregate es un **cluster de objetos** (entidades y value objects) tratados como una **unidad transaccional**.

### Reglas de Aggregates

1. **Aggregate Root**: única entrada al aggregate. Referencias externas solo al root.
2. **Consistencia**: las invariantes del aggregate deben cumplirse siempre.
3. **Transaccionalidad**: un aggregate se persiste/recupera completo.
4. **Referencias**: referencias externas solo al ID del root, no a objetos internos.

```
       +-----------------------------+
       |        Order (Root)         |  <-- Referencias externas apuntan aquí
       |  - id: OrderId              |
       |  - status: OrderStatus      |
       |  - total: Money             |
       |  - email: Email             |
       +-----------------------------+
           |                  |
           v                  v
  +----------------+   +----------------+
  | OrderLine      |   | ShippingAddress|   <-- Objetos internos
  | - productId    |   | - street       |      NO referenciables
  | - quantity     |   | - city         |      desde fuera
  | - unitPrice    |   | - zipCode      |
  +----------------+   +----------------+
```

### Ejemplo de cumplimiento

```java
// Bien: referenciar solo el root
orderRepository.save(order);

// Bien: referenciar por ID
order.addProduct(productId, 2);

// Mal: referenciar objeto interno
order.getLines().get(0).setQuantity(5);  // Violación
```

---

## 8. Repositories

Los repositorios proveen una **abstracción de persistencia** tipo colección. Son interfaces definidas en el dominio, implementadas en infraestructura.

### Principios
- Solo para **Aggregate Roots**
- Interfaz en lenguaje ubicuo: `save()`, `findById()`, `delete()`
- No exponen detalles de persistencia (SQL, JPA, MongoDB)

```java
// Interfaz de dominio
public interface OrderRepository {
    Order findById(OrderId id);
    void save(Order order);
    void delete(OrderId id);
    List<Order> findByStatus(OrderStatus status);
}

// Implementación en infraestructura
@Component
public class JpaOrderRepository implements OrderRepository {
    @Autowired
    private JpaOrderDao dao;
    private final OrderMapper mapper;

    @Override
    public Order findById(OrderId id) {
        return dao.findById(id.getValue())
            .map(mapper::toDomain)
            .orElseThrow(() -> new OrderNotFoundException(id));
    }
}
```

---

## 9. Domain Services

Operaciones del dominio que **no pertenecen naturalmente** a una entidad o value object. Representan acciones o cálculos que involucran múltiples aggregates.

### Cuándo usar
- La operación involucra múltiples aggregates
- La operación requiere datos externos (repositorios, servicios)
- No hay una entidad "dueña" natural de la operación

```java
public class PricingService {
    private final ProductRepository productRepository;

    public Money calculateOrderTotal(Order order, Coupon coupon) {
        Money subtotal = order.calculateSubtotal();
        Money discount = coupon.applyTo(subtotal);
        Money tax = TaxCalculator.calculate(subtotal.subtract(discount));
        Money shipping = ShippingCalculator.calculate(order.getAddress());
        return subtotal.subtract(discount).add(tax).add(shipping);
    }
}
```

---

## 10. Domain Events

Eventos que representan **algo significativo que ocurrió en el dominio**. Son inmutables, ocurren en un punto en el tiempo.

```java
public class OrderCreatedEvent implements DomainEvent {
    private final OrderId orderId;
    private final CustomerId customerId;
    private final Money total;
    private final LocalDateTime occurredOn;

    // constructor, getters
}
```

### Usos
- Notificar a otros bounded contexts
- Disparar procesos secundarios (enviar email, actualizar inventario)
- Alimentar CQRS (event sourcing)
- Auditoría

---

## 11. DDD Táctico vs Estratégico

| Aspecto | DDD Estratégico | DDD Táctico |
|---------|----------------|-------------|
| **Enfoque** | Estructura general del dominio | Implementación de modelos |
| **Herramientas** | Bounded Context, Context Map, Ubiquitous Language | Entities, VOs, Aggregates, Repositories, Domain Events |
| **Audiencia** | Arquitectos, stakeholders de negocio | Desarrolladores |
| **Pregunta** | ¿Cómo organizamos el dominio? | ¿Cómo implementamos este modelo? |

---

## 12. Laboratorio

Modelar el dominio de E-Commerce Platform con DDD táctico:

1. Identificar bounded contexts: **Catálogo**, **Pedidos**, **Pagos**, **Inventario**, **Usuarios**, **Envíos**
2. Para cada contexto, identificar:
   - Entities, Value Objects, Aggregates, Repositories, Domain Services, Domain Events
3. Dibujar Context Map con relaciones entre contextos
4. Definir Ubiquitous Language (glosario)
