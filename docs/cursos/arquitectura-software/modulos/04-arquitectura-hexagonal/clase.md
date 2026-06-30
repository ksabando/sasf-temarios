---
sidebar_label: "Clase"
---

## 3. Puertos (Ports)

Los puertos son **interfaces** que definen cómo el mundo exterior interactúa con el núcleo. Hay dos tipos:

### Puertos Primarios (Inbound / Driving)
Definen los casos de uso que el núcleo expone. Son llamados por adaptadores externos.

```java
// Puerto primario: define un caso de uso
public interface CreateOrderUseCase {
    OrderId execute(CreateOrderCommand command);
}

// Puerto primario: consulta
public interface GetProductQuery {
    ProductDTO execute(ProductId productId);
}
```

### Puertos Secundarios (Outbound / Driven)
Definen interfaces que el núcleo necesita de infraestructura externa.

```java
// Puerto secundario: persistencia
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
    void delete(OrderId id);
}

// Puerto secundario: mensajería
public interface EventPublisher {
    void publish(DomainEvent event);
}
```

---

## 4. Adaptadores (Adapters)

Los adaptadores son **implementaciones concretas** de los puertos.

### Adaptadores Primarios (Driving)
Inician la comunicación hacia el núcleo. Ejemplos:

| Adaptador | Tecnología | Puerto que implementa |
|-----------|-----------|----------------------|
| REST Controller | Spring Web | CreateOrderUseCase |
| GraphQL Resolver | Spring GraphQL | GetProductQuery |
| CLI | Spring Shell | ImportCatalogUseCase |
| Event Listener | Kafka Listener | ProcessPaymentUseCase |

### Adaptadores Secundarios (Driven)
El núcleo los llama para ejecutar operaciones externas. Ejemplos:

| Adaptador | Tecnología | Puerto que implementa |
|-----------|-----------|----------------------|
| JPA Repository | Spring Data JPA | OrderRepository |
| Kafka Producer | Spring Kafka | EventPublisher |
| REST Client | Feign/WebClient | PaymentGateway |
| SMTP Mail Sender | Spring Mail | NotificationService |

---

## 5. Regla de la Inversión de Dependencias

El núcleo **no depende** de los adaptadores. Los adaptadores dependen del núcleo a través de los puertos.

```
Sin Hexagonal:    Controlador → Servicio → Repositorio (JPA específico)
Con Hexagonal:    Controlador → Puerto ← Interactor → Puerto ← Repositorio (JPA)
                                  (inbound)          (outbound)
```

### Estructura de paquetes recomendada

```
com.ecommerce
├── domain/                    # Núcleo del dominio (sin dependencias externas)
│   ├── entity/               # Entidades y aggregates
│   ├── vo/                   # Value Objects
│   ├── service/              # Domain Services
│   ├── event/                # Domain Events
│   └── repository/           # Puertos secundarios (interfaces)
│
├── application/              # Casos de uso
│   ├── port/                 # Puertos primarios (interfaces)
│   │   ├── inbound/          #   Casos de uso que expone el sistema
│   │   └── outbound/         #   Interfaces que necesita el sistema
│   ├── usecase/              # Implementación de casos de uso
│   └── dto/                  # Data Transfer Objects (entrada/salida de casos de uso)
│
├── infrastructure/           # Adaptadores concretos
│   ├── adapter/
│   │   ├── inbound/          # REST controllers, GraphQL, listeners
│   │   └── outbound/         # JPA repos, Kafka producers, REST clients
│   ├── mapper/               # Mappers entre entidades de dominio y DTOs/entidades JPA
│   └── config/               # Configuración Spring, beans, security
│
└── shared/                   # Utilidades compartidas (sin dependencias externas)
```

---

## 6. Ejemplo Práctico: CreateOrder

### Flujo completo

```
POST /api/orders (JSON)
  │
  v
[OrderController]  (Adaptador primario REST)
  │
  ├── Deserializa JSON → CreateOrderCommand (DTO)
  ├── Llama puerto primario: createOrderUseCase.execute(command)
  │
  v
[CreateOrderService]  (Caso de uso - implementa el puerto)
  │
  ├── Valida datos del comando
  ├── Consulta productos vía puerto secundario: productRepository.findById(...)
  ├── Crea Order aggregate
  ├── Guarda vía puerto secundario: orderRepository.save(order)
  ├── Publica evento vía puerto secundario: eventPublisher.publish(new OrderCreatedEvent(...))
  │
  v
[JpaOrderRepository]  (Adaptador secundario JPA)
  ├── Convierte Order → JpaOrderEntity (mapper)
  ├── Guarda con Spring Data JPA
  │
  v
[KafkaEventPublisher]  (Adaptador secundario Kafka)
  ├── Serializa evento
  ├── Publica en topic "order-events"
  │
  v
Retorna OrderId → Controller → HTTP 201 + JSON
```

### Código del caso de uso

```java
// Puerto primario (en application/port/inbound)
public interface CreateOrderUseCase {
    OrderId execute(CreateOrderCommand command);
}

// DTO de entrada (en application/dto)
public record CreateOrderCommand(
    CustomerId customerId,
    List<OrderItemCommand> items,
    Address shippingAddress
) {}

// Caso de uso (en application/usecase)
@Component
public class CreateOrderService implements CreateOrderUseCase {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EventPublisher eventPublisher;

    public CreateOrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            EventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public OrderId execute(CreateOrderCommand command) {
        // Validar productos y calcular total
        List<OrderLine> lines = command.items().stream()
            .map(item -> {
                Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ProductNotFoundException(item.productId()));
                return new OrderLine(product.getId(), item.quantity(), product.getPrice());
            })
            .toList();

        // Crear aggregate
        Order order = new Order(command.customerId(), command.shippingAddress());
        lines.forEach(line -> order.addLine(line));

        // Persistir
        orderRepository.save(order);

        // Publicar evento
        eventPublisher.publish(new OrderCreatedEvent(order.getId(), order.getTotal()));

        return order.getId();
    }
}
```

---

## 7. Testing sin Infraestructura

Una de las mayores ventajas de la arquitectura hexagonal es que los casos de uso se prueban **sin infraestructura real**: mockeando los puertos secundarios.

```java
@ExtendWith(MockitoExtension.class)
class CreateOrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private EventPublisher eventPublisher;

    @InjectMocks
    private CreateOrderService createOrderService;

    @Test
    void shouldCreateOrderSuccessfully() {
        // Given
        ProductId productId = ProductId.of("PROD-001");
        when(productRepository.findById(productId))
            .thenReturn(Optional.of(new Product(productId, "Laptop", Money.of(1500, "USD"))));

        CreateOrderCommand command = new CreateOrderCommand(
            CustomerId.of("CUST-001"),
            List.of(new OrderItemCommand(productId, 1)),
            new Address("Calle 123", "Santiago", "CL")
        );

        // When
        OrderId orderId = createOrderService.execute(command);

        // Then
        assertNotNull(orderId);
        verify(orderRepository).save(any(Order.class));
        verify(eventPublisher).publish(any(OrderCreatedEvent.class));
    }
}
```

---

## 8. Hexagonal vs Arquitectura en Capas

| Aspecto | Capas (Layered) | Hexagonal |
|---------|----------------|-----------|
| **Dependencias** | Capa superior → capa inferior | Hacia adentro (núcleo no sabe de afuera) |
| **Acoplamiento** | Alto (capa negocio conoce persistencia) | Bajo (núcleo solo conoce interfaces) |
| **Testabilidad** | Media (requiere infraestructura) | Alta (mock de puertos) |
| **Cambio de tecnología** | Difícil (tecnología embedded) | Fácil (cambiar adaptador) |
| **Complejidad inicial** | Baja | Media |

---

## 9. Laboratorio

Migrar E-Commerce Platform a arquitectura hexagonal:

1. Identificar puertos inbound: `CreateOrderUseCase`, `GetProductQuery`, `ProcessPaymentUseCase`
2. Identificar puertos outbound: `OrderRepository`, `ProductRepository`, `PaymentGateway`, `EventPublisher`
3. Implementar adaptadores: REST Controllers, JPA Repositories, Kafka Producers
4. Probar casos de uso con mocks
