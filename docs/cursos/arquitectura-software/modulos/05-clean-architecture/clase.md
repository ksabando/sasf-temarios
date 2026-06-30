---
sidebar_label: "Clase"
---

## 3. La Regla de las Dependencias

> Las dependencias de código fuente solo pueden apuntar hacia adentro. Nada en un círculo interior puede saber nada sobre un círculo exterior.

### Correcto

```
Entities  ←  Use Cases  ←  Interface Adapters  ←  Frameworks
   ^            ^                ^
   |            |                |
   (nada)       Solo Entities    Solo Use Cases
```

### Incorrecto

```
Entities  →  Use Cases  →  Interface Adapters  →  Frameworks
   (Si una Entity importa Spring, está violando Clean Architecture)
```

---

## 4. Entities (Enterprise Business Rules)

Son los objetos de negocio más generales y de alto nivel. Contienen reglas que aplicarían incluso si el sistema se implementara en otra tecnología.

```java
// Entity - no tiene dependencias externas
public class Order {
    private final OrderId id;
    private OrderStatus status;
    private final List<OrderLine> lines;
    private Money total;

    public void addLine(OrderLine line) {
        if (status == OrderStatus.PAID) {
            throw new IllegalStateException("Cannot modify paid order");
        }
        lines.add(line);
        recalculateTotal();
    }

    public void markAsPaid() {
        if (status != OrderStatus.CREATED) {
            throw new IllegalStateException("Only CREATED orders can be paid");
        }
        this.status = OrderStatus.PAID;
        recalculateTotal();
    }

    private void recalculateTotal() {
        this.total = lines.stream()
            .map(OrderLine::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }
}
```

---

## 5. Use Cases (Application Business Rules)

Los casos de uso son específicos de la aplicación. Definen cómo se usan las entities para lograr un objetivo.

### Estructura de un Use Case

```java
// 1. Input Boundary (interfaz que el controller usa)
public interface CreateOrderInputBoundary {
    OrderId execute(CreateOrderInputData input);
}

// 2. Input Data (DTO de entrada)
public class CreateOrderInputData {
    private final String customerId;
    private final List<OrderItemData> items;
    // constructor, getters...
}

// 3. Interactor (implementación del caso de uso)
public class CreateOrderInteractor implements CreateOrderInputBoundary {
    private final OrderRepository orderRepository;  // Output Boundary
    private final ProductRepository productRepository;
    private final EventPublisher eventPublisher;

    public CreateOrderInteractor(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            EventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public OrderId execute(CreateOrderInputData input) {
        Order order = new Order(new CustomerId(input.getCustomerId()));
        for (OrderItemData item : input.getItems()) {
            Product product = productRepository.findById(new ProductId(item.getProductId()));
            order.addLine(new OrderLine(product.getId(), item.getQuantity(), product.getPrice()));
        }
        orderRepository.save(order);
        eventPublisher.publish(new OrderCreatedEvent(order.getId(), order.getTotal()));
        return order.getId();
    }
}

// 4. Output Boundary (interfaz que el presentador implementa)
public interface CreateOrderOutputBoundary {
    CreateOrderResponse present(OrderId orderId, Money total);
}

// 5. Output Data (DTO de salida)
public class CreateOrderOutputData {
    private final String orderId;
    private final String status;
    private final double total;
    // constructor, getters...
}
```

---

## 6. Interface Adapters

Convierten datos entre el formato más conveniente para los casos de uso y el formato más conveniente para los frameworks.

### Controller (Adaptador Primario)

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final CreateOrderInputBoundary createOrderUseCase;
    private final CreateOrderOutputBoundary orderPresenter;

    public OrderController(
            CreateOrderInputBoundary createOrderUseCase,
            CreateOrderOutputBoundary orderPresenter) {
        this.createOrderUseCase = createOrderUseCase;
        this.orderPresenter = orderPresenter;
    }

    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(
            @RequestBody @Valid CreateOrderRequest request) {
        CreateOrderInputData inputData = new CreateOrderInputData(
            request.getCustomerId(), request.getItems());
        OrderId orderId = createOrderUseCase.execute(inputData);
        CreateOrderResponse response = orderPresenter.present(orderId, ...);
        return ResponseEntity.status(201).body(response);
    }
}
```

### Presenter (Adaptador de Salida)

```java
@Component
public class OrderPresenter implements CreateOrderOutputBoundary {
    @Override
    public CreateOrderResponse present(OrderId orderId, Money total) {
        return new CreateOrderResponse(
            orderId.getValue(),
            "CREATED",
            total.getAmount().doubleValue(),
            total.getCurrency()
        );
    }
}
```

### Gateway (Adaptador Secundario)

```java
// Output Boundary en capa Use Cases
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
}

// Gateway implementa la interfaz
@Component
public class JpaOrderRepository implements OrderRepository {
    private final SpringDataOrderRepository jpaRepository;
    private final OrderMapper mapper;

    public JpaOrderRepository(SpringDataOrderRepository jpaRepository, OrderMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Order order) {
        jpaRepository.save(mapper.toJpaEntity(order));
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.getValue()).map(mapper::toDomain);
    }
}
```

---

## 7. Flujo de Datos Completo

```
HTTP Request (JSON)
    │
    v
[Controller] ←───── Capa Frameworks (Spring Web)
    │                Capa Interface Adapters
    ├── Crea InputData (DTO)
    ├── Llama Use Case
    │
    v
[Interactor] ←──── Capa Use Cases
    │
    ├── Llama Entity (reglas de negocio)
    ├── Llama Repository (output boundary)
    │
    v
[Entity] ←─────── Capa Entities
    │
    ├── Reglas de negocio
    ├── Invariantes
    │
    v
[Repository] ←─── Capa Interface Adapters (Gateway)
    │
    v
[Base de Datos] ← Capa Frameworks (JPA/Hibernate)
    │
    v
HTTP Response (JSON)
```

---

## 8. Mapeo Clean + Hexagonal

| Clean Architecture | Arquitectura Hexagonal |
|-------------------|----------------------|
| Entities | Domain Entities |
| Use Cases | Casos de uso + Domain Services |
| Interface Adapters | Adaptadores (Controllers, Gateways, Presenters) |
| Frameworks & Drivers | Infraestructura externa (BD, Web, Colas) |

### Diferencia clave

Clean Architecture añade la separación entre **Entities** y **Use Cases**, y el patrón **Presenter** para manejar la respuesta.

---

## 9. DTOs y Mappers

Es crucial que los DTOs no crucen las fronteras de capa incorrectamente.

```
Request JSON  →  [Controller]  →  InputData  →  [Use Case]  →  Entity
   (framework)     (adapter)       (use case)     (core)        (core)

Entity  →  [Use Case]  →  OutputData  →  [Presenter]  →  Response JSON
 (core)      (core)       (use case)      (adapter)       (framework)
```

### Reglas
- **InputData/OutputData**: formato que el use case entiende (en capa Use Cases).
- **Request/Response**: formato JSON que el framework entiende (en capa Interface Adapters).
- **Mapper**: convierte entre ambos sin exponer entidades a la capa externa.

---

## 10. Screaming Architecture

> La arquitectura debe **gritar** lo que hace el sistema, no la tecnología que usa.

```
// Bien: la estructura del proyecto refleja el dominio
com.ecommerce/
├── orders/
├── products/
├── payments/
└── shipping/

// Mal: la estructura refleja la tecnología
com.ecommerce/
├── controllers/
├── services/
├── repositories/
├── entities/
└── config/
```

---

## 11. Laboratorio

Implementar caso de uso "CreateOrder" con Clean Architecture:

1. Definir Entity `Order` con reglas de negocio
2. Definir `CreateOrderInputBoundary` y `CreateOrderInteractor`
3. Definir `CreateOrderOutputBoundary` y `OrderPresenter`
4. Implementar controller REST como adaptador
5. Implementar gateway JPA como adaptador
6. Probar el use case con tests unitarios
