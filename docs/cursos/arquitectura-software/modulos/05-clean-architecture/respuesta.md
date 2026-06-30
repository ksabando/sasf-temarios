---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Refactorizar PaymentService

**Solución esperada**:

**Entities**
```java
public class Order {
    private OrderId id;
    private OrderStatus status;
    private Money total;
    private CustomerEmail customerEmail;

    public void markAsPaid() {
        if (status != OrderStatus.CREATED) {
            throw new IllegalStateException("Only CREATED orders can be paid");
        }
        this.status = OrderStatus.PAID;
    }
}

public class CreditCard {
    private final String cardNumber;

    public CreditCard(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 16) {
            throw new IllegalArgumentException("Invalid card number");
        }
        this.cardNumber = cardNumber;
    }
}
```

**Use Case**
```java
public class ProcessPaymentInteractor implements ProcessPaymentInputBoundary {
    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;
    private final NotificationService notificationService;
    private final EventPublisher eventPublisher;

    @Override
    public ProcessPaymentOutputData execute(ProcessPaymentInputData input) {
        Order order = orderRepository.findById(new OrderId(input.getOrderId()))
            .orElseThrow(() -> new OrderNotFoundException(input.getOrderId()));

        CreditCard card = new CreditCard(input.getCardNumber());

        TransactionResult result = paymentGateway.charge(
            new PaymentRequest(order.getId(), card, order.getTotal()));

        if (!result.isSuccess()) {
            throw new PaymentFailedException(result.getError());
        }

        order.markAsPaid();
        orderRepository.save(order);

        eventPublisher.publish(new OrderPaidEvent(order.getId(), result.getTransactionId()));

        return new ProcessPaymentOutputData("SUCCESS", result.getTransactionId());
    }
}
```

**Interface Adapters - Gateways**
```java
@Component
public class StripePaymentGateway implements PaymentGateway {
    @Override
    public TransactionResult charge(PaymentRequest request) {
        // Usar API de Stripe
        StripeResponse response = StripeAPI.charge(
            request.getCardNumber(),
            request.getAmount().getValue()
        );
        return new TransactionResult(response.isSuccess(), response.getTransactionId(), response.getError());
    }
}

@Component
public class JpaOrderRepository implements OrderRepository { ... }

@Component
public class SmtpNotificationService implements NotificationService { ... }
```

**Posibles mejoras**:
- Extraer `CreditCard` como una **Entity de valor** con su propio ciclo de validación y enmascaramiento (PCI compliance), que no se persista nunca en texto plano, delegando la tokenización al `PaymentGateway` y almacenando solo un `PaymentToken` en el dominio.
- Agregar un **retry con backoff exponencial** en el adaptador `StripePaymentGateway` para manejar fallos transitorios de red (timeouts, rate limits) sin que el interactor sepa de reintentos, usando Resilience4j o Polly, encapsulando la política de resiliencia en la capa de infraestructura.
- Implementar el **Transactional Outbox** en el `JpaOrderRepository`: en el método `save`, persistir el `Order` y los `DomainEvent` (como `OrderPaidEvent`) en la misma transacción de base de datos, y un proceso asíncrono (Change Data Capture o polling) publique los eventos a Kafka, garantizando atomicidad entre estado y eventos.

---

## Ejercicio 4: Estructura Suscripciones

**Solución esperada**:

```
com.suscripciones/
—,
—,
—,
```

**Entity ejemplo**
```java
public class Subscription {
    private final SubscriptionId id;
    private final UserId userId;
    private Plan plan;
    private SubscriptionStatus status;
    private LocalDate nextBillingDate;

    public void cancel() {
        if (status == SubscriptionStatus.CANCELLED) {
            throw new IllegalStateException("Already cancelled");
        }
        this.status = SubscriptionStatus.CANCELLED;
        // La suscripción sigue activa hasta el fin del período facturado
    }

    public void changePlan(Plan newPlan) {
        if (status != SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("Only active subscriptions can change plan");
        }
        this.plan = newPlan;
    }
}
```

**Posibles mejoras**:
- Extraer un **Shared Kernel** para `UserId` y `Money` que sean usados por múltiples bounded contexts (billing, subscription, catalog) en una librería compartida con versionado, evitando duplicación de Value Objects idénticos y manteniendo la independencia de cada contexto para evolucionar a diferente ritmo.
- Agregar la capa de **Domain Events** en cada bounded context: `SubscriptionCancelledEvent` que dispare en `subscription/domain/event/` y sea manejado por un `EventHandler` en `billing/infrastructure/` para detener la facturación, demostrando comunicación entre contextos sin acoplamiento directo.
- Modelar el bounded context de `catalog` y `streaming` con la misma estructura de paquetes pero mostrando variantes: `catalog` con queries de lectura optimizadas (CQRS ligero con repositorios de solo lectura) y `streaming` con interacción en tiempo real (WebSocket adapters), demostrando que la misma estructura de Clean Architecture se adapta a diferentes necesidades dentro de un mismo sistema.

