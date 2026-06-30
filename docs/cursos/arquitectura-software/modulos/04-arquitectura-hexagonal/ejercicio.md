---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Refactorizar a Hexagonal

El siguiente código está en estilo arquitectura en capas tradicional. Refactorízalo a hexagonal:

```java
// Código legacy - capas acopladas
@RestController
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping("/api/products/{id}")
    public ProductDTO getProduct(@PathVariable String id) {
        return productService.getProduct(id);
    }
}

@Service
public class ProductService {
    @Autowired
    private ProductRepositoryJPA productRepo; // Dependencia directa a JPA

    public ProductDTO getProduct(String id) {
        ProductEntity entity = productRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("Product not found"));
        // Lógica de negocio mezclada con mapeo
        if (entity.getStatus() == ProductStatus.INACTIVE) {
            throw new ProductNotAvailableException(id);
        }
        return new ProductDTO(entity.getId(), entity.getName(), entity.getPrice());
    }
}
```

Reescribe el código aplicando:
- Puertos inbound y outbound
- Caso de uso independiente de infraestructura
- Mappers entre capas
- Inyección de dependencias por constructor

---

## Ejercicio 4: Diseñar la Estructura de Paquetes Hexagonal

Diseña la estructura de paquetes completa para el bounded context de **Pedidos** en arquitectura hexagonal.

Debe incluir:

**domain/**
- Entidades: `Order`, `OrderLine`, `OrderStatus`
- Value Objects: `OrderId`, `Money`, `Address`, `CustomerId`
- Domain Events: `OrderCreatedEvent`, `OrderPaidEvent`
- Puertos outbound (interfaces): `OrderRepository`, `EventPublisher`

**application/**
- DTOs: `CreateOrderCommand`, `OrderResponse`
- Puerto inbound: `CreateOrderUseCase`, `GetOrderQuery`
- Casos de uso: `CreateOrderService`, `GetOrderService`

**infrastructure/**
- Adaptadores inbound: `OrderController` (REST)
- Adaptadores outbound: `JpaOrderRepository`, `KafkaEventPublisher`
- Mappers: `OrderMapper` (domain ↔ entity JPA)
- Config: `HexagonalConfig`

Escribe el código de al menos 3 clases/archivos para demostrar el patrón.
