---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Refactorizar a Hexagonal

**Solución esperada**:

```java
// DOMAIN - Value Objects
public record ProductId(String value) {}
public record Money(BigDecimal amount, String currency) {}

// DOMAIN - Entity
public class Product {
    private final ProductId id;
    private String name;
    private Money price;
    private ProductStatus status;

    public Product(ProductId id, String name, Money price, ProductStatus status) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.status = status;
    }

    public boolean isAvailable() {
        return status != ProductStatus.INACTIVE;
    }

    public void assertAvailable() {
        if (!isAvailable()) {
            throw new ProductNotAvailableException(id);
        }
    }
    // getters...
}

// APPLICATION - Ports (inbound)
public interface GetProductQuery {
    ProductDTO execute(ProductId productId);
}

// APPLICATION - DTOs
public record ProductDTO(String id, String name, BigDecimal price, String currency) {}

// APPLICATION - Use Case
@Component
public class GetProductService implements GetProductQuery {
    private final ProductRepository productRepository;

    public GetProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ProductDTO execute(ProductId productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException(productId));
        product.assertAvailable();
        return new ProductDTO(
            product.getId().value(),
            product.getName(),
            product.getPrice().amount(),
            product.getPrice().currency()
        );
    }
}

// APPLICATION/OUTBOUND - Puerto secundario
public interface ProductRepository {
    Optional<Product> findById(ProductId id);
}

// INFRASTRUCTURE - Adaptador primario REST
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final GetProductQuery getProductQuery;

    public ProductController(GetProductQuery getProductQuery) {
        this.getProductQuery = getProductQuery;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable String id) {
        ProductDTO dto = getProductQuery.execute(new ProductId(id));
        return ResponseEntity.ok(dto);
    }
}

// INFRASTRUCTURE - Adaptador secundario JPA
@Component
public class JpaProductRepository implements ProductRepository {
    private final SpringDataProductRepository jpaRepository;
    private final ProductMapper mapper;

    public JpaProductRepository(SpringDataProductRepository jpaRepository, ProductMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Product> findById(ProductId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }
}
```

**Posibles mejoras**:
- Implementar un **FakeProductRepository** in-memory basado en `ConcurrentHashMap` para que los tests del `GetProductService` corran en milisegundos sin base de datos, demostrando la testabilidad de hexagonal y permitiendo TDD rápido.
- Refactorizar `ProductDTO` para que incluya un `ProductId` tipado en lugar de `String id`, cerrando el gap de tipos entre la capa de aplicación y la de infraestructura: el controller mapea `String` de la URL a `ProductId` (VO) y lo pasa al caso de uso, evitando *primitive obsession* en la interfaz del puerto.

---

## Ejercicio 4: Estructura de Paquetes

**Solución esperada**:

```
com.ecommerce.orders/
—,
—,
```

### Código de ejemplo: OrderMapper

```java
@Component
public class OrderMapper {

    public JpaOrderEntity toJpaEntity(Order order) {
        JpaOrderEntity entity = new JpaOrderEntity();
        entity.setId(order.getId().value());
        entity.setCustomerId(order.getCustomerId().value());
        entity.setStatus(order.getStatus().name());
        entity.setTotal(order.getTotal().amount());
        entity.setCurrency(order.getTotal().currency());
        entity.setLines(order.getLines().stream()
            .map(this::toJpaLine)
            .toList());
        return entity;
    }

    public Order toDomain(JpaOrderEntity entity) {
        Order order = new Order(
            CustomerId.of(entity.getCustomerId()),
            new Address(...)
        );
        // reconstruir líneas, estado, etc.
        return order;
    }

    private JpaOrderLineEntity toJpaLine(OrderLine line) { ... }
}
```

**Posibles mejoras**:
- Agregar reglas de **ArchUnit** como fitness functions automatizadas en el build (pom.xml / build.gradle) que verifiquen: (a) `domain` no importa `infrastructure`, (b) `application` no importa `infrastructure` excepto por `config`, (c) los puertos outbound están en `application/port/out` o `domain` y son interfaces, no clases. Esto previene regresiones arquitectónicas sin depender de code review humano.
- Extraer los puertos outbound (`OrderRepository`, `EventPublisher`) a un sub-módulo `domain` que sea el único lugar donde se definen, eliminando la duplicación con `application/port/outbound` y dejando claro que el dominio es dueño de sus contratos. La práctica de tener puertos duplicados es una variante debatida.
- Incluir un módulo `shared-kernel` para Value Objects y Domain Events que se comparten entre bounded contexts (`Money`, `Currency`, `UserId`, `OrderPaidIntegrationEvent`), con versionado semántico para gestionar breaking changes entre contextos, tal como recomienda Vaughn Vernon para sistemas con múltiples bounded contexts en hexagonal.

