---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Conway's Law

**Solución esperada**:

### a) Problema de la estructura actual
La estructura por capas técnicas (Frontend, Backend, DB) naturalmente produce un **monolito**:
- El equipo backend dueño de toda la lógica de negocio → un solo código base.
- Para cambiar una feature (ej: formulario de pago), deben coordinarse Frontend + Backend + DB.
- Sin equipos por dominio, no hay ownership de servicios.

### b) Reestructuración propuesta

```
Nueva estructura por dominio (6 squads):

[Order Squad]  [Catalog Squad]  [Payment Squad]  [User Squad]  [Infra Squad]  [Platform Squad]
  - 2 BE          - 2 BE           - 2 BE           - 2 BE        - 2 DevOps     - 2 FE (compartido)
  - 1 FE          - 1 FE           - 1 FE           - 1 FE
  - 1 QA          - 1 QA           - 1 QA           - 1 QA
```

Cada squad es dueño de principio a fin de su servicio.

### c) Si no se puede reestructurar
Patrones para mitigar:
1. **Code ownership**: aunque compartan repositorio, cada equipo es dueño de ciertos paquetes.
2. **Monorepo con gates**: un repositorio con reglas de revisión por equipo.
3. **API Contracts primero**: definir contratos entre equipos antes de implementar.
4. **Feature Teams temporales**: equipos multidisciplinarios por proyecto.

### d) RACI de decisiones arquitectónicas

| Decisión | Arquitecto | Order Squad | Catalog Squad | Payment Squad | Infra |
|----------|-----------|-------------|---------------|---------------|-------|
| Estándar comunicación (REST/Eventos) | A | C | C | C | R |
| Base de datos del servicio | I | A/R | A/R | A/R | C |
| Framework del servicio | C | A/R | A/R | A/R | I |
| Deploy pipeline | C | C | C | C | A/R |
| Estrategia de migración | A/R | C | C | C | C |

A=Accountable, R=Responsible, C=Consulted, I=Informed

**Posibles mejoras**:
- Agregar la distinción entre **Platform Team** (dueño de CI/CD, observabilidad, Kafka) y **Enabling Team** (ayuda a los squads a adoptar nuevas prácticas) siguiendo el modelo de *Team Topologies* de Matthew Skelton y Manuel Pais, que complementa Conway's Law con patrones de interacción entre equipos.
- Incluir una **matriz de comunicación entre squads** identificando dependencias de coordinación: Order Squad necesita coordinarse con Payment Squad (saga de pagos) y Catalog Squad (información de productos). Mapear estas dependencias para diseñar contratos de API/eventos que minimicen la necesidad de comunicación síncrona.
- Definir un **Inner Source** model: los squads comparten código a través de un monorepo con CODEOWNERS por módulo, PRs cross-squad requieren aprobación del equipo dueño, y las APIs públicas de cada módulo se versionan. Esto permite colaboración sin perder ownership, ideal para organizaciones que no pueden reestructurarse completamente.

---

## Ejercicio 4: Modular Monolith

**Solución esperada**:

### a) Módulos con interfaces

```java
// Módulo: Orders (API pública)
package com.ecommerce.orders.api;

public interface OrderModule {
    OrderId createOrder(CreateOrderRequest request);
    void cancelOrder(OrderId orderId);
    OrderStatus getOrderStatus(OrderId orderId);
}

// Módulo: Payments (API pública)
package com.ecommerce.payments.api;

public interface PaymentModule {
    PaymentResult processPayment(OrderId orderId, Money amount);
    PaymentResult processRefund(OrderId orderId, Money amount);
}
```

### b) Implementación del módulo

```java
package com.ecommerce.orders.internal;

@Component
public class OrderModuleImpl implements OrderModule {
    private final OrderRepository orderRepository;
    private final PaymentModule paymentModule; // ? Dependencia a través de API pública
    private final EventPublisher eventPublisher;

    public OrderModuleImpl(OrderRepository orderRepository,
                          @Lazy PaymentModule paymentModule, // @Lazy para evitar circularidad
                          EventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.paymentModule = paymentModule;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public OrderId createOrder(CreateOrderRequest request) {
        Order order = new Order(request.customerId(), request.address());
        // ... validar, agregar productos
        orderRepository.save(order);
        eventPublisher.publish(new OrderCreatedEvent(order.getId(), order.getTotal()));
        return order.getId();
    }

    @Override
    public void cancelOrder(OrderId orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        order.cancel();
        if (order.isPaid()) {
            paymentModule.processRefund(orderId, order.getTotal()); // ? Comunicación entre módulos
        }
        orderRepository.save(order);
    }
}
```

### c) Reglas ArchUnit

```java
package com.ecommerce.architecture;

import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.*;

@AnalyzeClasses(packages = "com.ecommerce")
public class ModularMonolithArchitectureTest {

    @ArchTest
    static final ArchRule orders_should_not_depend_on_payments_internal =
        classes()
            .that().resideInAPackage("..orders..")
            .should().onlyDependOnClassesThat()
            .resideOutsideOfPackages("..payments.internal..")
            .andShould().onlyDependOnClassesThat()
            .resideOutsideOfPackages("..payments.infrastructure..")
            .because("Orders module should only depend on Payments public API");

    @ArchTest
    static final ArchRule modules_should_only_depend_on_public_apis =
        classes()
            .that().resideInAPackage("..module..")
            .should().onlyAccessClassesThat()
            .resideInPackages("..module..api..", "java..", "com.ecommerce.common..")
            .because("Modules should only interact through their public APIs");

    @ArchTest
    static final ArchRule no_cycle_between_modules =
        slices()
            .matching("com.ecommerce.(*)..")
            .should().beFreeOfCycles();
}
```

**Posibles mejoras**:
- **Separar schemas de base de datos por módulo**: dentro del mismo PostgreSQL, cada módulo usa un schema diferente (`orders.*`, `payments.*`, `catalog.*`) con usuarios de BD separados por módulo. Esto es un paso intermedio hacia Database per Service y fuerza a que los módulos no hagan JOINs cross-schema, preparando la extracción futura.
- Introducir **eventos internos** (vía `ApplicationEventPublisher` de Spring o un `EventBus` interno) para comunicación asíncrona entre módulos incluso dentro del mismo proceso. Ejemplo: `PaymentModule` publica `PaymentProcessedEvent` internamente y `OrderModule` lo consume sin dependencia directa. Esto reduce el acoplamiento entre APIs públicas y prepara la migración a Kafka cuando el módulo se extraiga.
- Agregar tests de arquitectura para **verificar que los módulos no comparten tablas de base de datos**: `@ArchTest` que prohíba que `orders.internal` acceda a repositorios JPA con anotaciones `@Table(schema = "payments")`, usando reflection sobre las anotaciones de entidades JPA. Esto previene el acoplamiento más peligroso en un Modular Monolith: compartir datos por debajo de las APIs.

