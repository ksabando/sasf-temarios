---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: LSP + ISP
**Solución esperada**:

```java
// LSP: composicion en lugar de herencia
public enum CustomerType { REGULAR, VIP, WHOLESALE, EMPLOYEE }

public class Customer {
    private Long id; private String name; private String email;
    private CustomerType type; private DiscountStrategy discountStrategy;
    // constructor, getters
}

// ISP: interfaces segregadas
public interface OrderReader {
    Optional<Order> findById(Long id);
    List<Order> findByCustomer(Long customerId);
}
public interface OrderWriter {
    Order save(Order order);
    void deleteById(Long id);
}
public interface OrderSearch {
    List<Order> findByDateRange(Date from, Date to);
    List<Order> findByStatus(String status);
}

// Implementacion unica que cumple todas las interfaces (LSP: cada interfaz funciona)
public class JdbcOrderRepository implements OrderReader, OrderWriter, OrderSearch {
    private final JdbcTemplate jdbc;
    public JdbcOrderRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @Override public Optional<Order> findById(Long id) { /* ... */ }
    @Override public List<Order> findByCustomer(Long customerId) { /* ... */ }
    @Override public Order save(Order order) { /* ... */ }
    @Override public void deleteById(Long id) { /* ... */ }
    @Override public List<Order> findByDateRange(Date from, Date to) { /* ... */ }
    @Override public List<Order> findByStatus(String status) { /* ... */ }
}
```

**Posibles mejoras**:
- LSP: si se crea un `CachedOrderRepository` que solo implementa `OrderReader` (porque es read-only cache), cumple LSP porque los clientes que reciben `OrderReader` pueden usar tanto `JdbcOrderRepository` como `CachedOrderRepository` indistintamente.
- ISP: segregar aún más `OrderSearch` en `OrderSearchByDate` y `OrderSearchByStatus` si hay clientes que solo buscan por fecha y nunca por status, evitando dependencias transitivas innecesarias.
- Agregar **paginación** a `OrderSearch` con un `Pageable` y retornar `Page<Order>` en lugar de `List<Order>`, sin modificar `OrderReader` ni `OrderWriter` que no necesitan paginación.

---

## Ejercicio 4: DIP
**Solución esperada**:

```java
// Interfaces
public interface OrderRepository extends OrderReader, OrderWriter, OrderSearch {}
public interface InventoryService { void reduceStock(Item item); boolean hasStock(Item item); }
public interface NotificationService { void sendOrderConfirmation(String email, long orderId, double total); }
public interface AuditService { void log(String action, long entityId, String details); }

// Factory
public class OrderServiceFactory {
    public OrderService create(DataSource dataSource) {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        OrderRepository repository = new JdbcOrderRepository(jdbc);
        DiscountCalculator discountCalc = new DiscountCalculator(List.of(
            new RegularDiscount(), new VIPDiscount(), new WholesaleDiscount(), new EmployeeDiscount()));
        TaxCalculator taxCalc = new TaxCalculator(List.of(
            new ElectronicsTax(), new FoodTax(), new ClothingTax(), new DefaultTax()));
        InventoryService inventory = new InventoryServiceImpl(jdbc);
        NotificationService notifier = new EmailNotificationService();
        AuditService auditor = new DatabaseAuditService(jdbc);
        return new OrderService(new OrderValidator(), discountCalc, taxCalc,
            repository, inventory, notifier, auditor);
    }
}

// Mocks para pruebas
class MockOrderRepository implements OrderRepository {
    private final Map<Long, Order> store = new HashMap<>();
    @Override public Order save(Order order) { store.put(order.getId(), order); return order; }
    @Override public Optional<Order> findById(Long id) { return Optional.ofNullable(store.get(id)); }
    @Override public List<Order> findByCustomer(Long customerId) { return List.of(); }
    @Override public void deleteById(Long id) { store.remove(id); }
    @Override public List<Order> findByDateRange(Date from, Date to) { return List.of(); }
    @Override public List<Order> findByStatus(String status) { return List.of(); }
}

class MockInventoryService implements InventoryService {
    public boolean hasStock(Item item) { return true; }
    public void reduceStock(Item item) { }
}

class MockNotificationService implements NotificationService {
    public boolean notified = false;
    public void sendOrderConfirmation(String email, long orderId, double total) {
        this.notified = true;
    }
}

// Prueba unitaria
public class OrderServiceTest {
    @Test
    void shouldProcessOrderSuccessfully() {
        MockOrderRepository repo = new MockOrderRepository();
        MockInventoryService inventory = new MockInventoryService();
        MockNotificationService notifier = new MockNotificationService();
        AuditService auditor = (a, e, d) -> {};

        DiscountCalculator discCounter = new DiscountCalculator(List.of(new RegularDiscount()));
        TaxCalculator taxCalc = new TaxCalculator(List.of(new DefaultTax()));

        OrderService service = new OrderService(new OrderValidator(), discCounter, taxCalc,
            repo, inventory, notifier, auditor);

        Order order = new Order(1L, "test@test.com", List.of(new Item("LAPTOP", 1, 2000000, "ELECTRONICS")));
        Order result = service.processOrder(order);

        assertNotNull(result.getId());
        assertTrue(notifier.notified);
        assertTrue(result.getTotal() > 0);
    }
}
```

**Posibles mejoras**:
- Reemplazar `OrderServiceFactory` con **Spring `@Configuration` + `@Bean`** para que las dependencias sean manejadas por el contenedor IoC, eliminando la Factory manual y obteniendo scopes, proxies y AOP.
- Usar **TestNG o JUnit 5 parameterized tests** para probar `OrderService` con cada combinación de `DiscountStrategy` y `TaxStrategy`, verificando que cualquier implementación de las interfaces sea intercambiable (LSP).
- Agregar **pruebas de contrato** con Pact o Spring Cloud Contract para verificar que las implementaciones concretas (JdbcOrderRepository, EmailNotificationService) cumplen el contrato definido por las interfaces, detectando regresiones cuando un cambio en infraestructura rompe el contrato.

