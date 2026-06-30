---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Refactorizar Código Legacy a Clean Architecture

El siguiente código mezcla todas las capas. Refactorízalo aplicando Clean Architecture:

```java
@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepo;

    @Transactional
    public PaymentResult processPayment(String orderId, String cardNumber, double amount) {
        // 1. Validar tarjeta (regla de negocio)
        if (cardNumber == null || cardNumber.length() < 16) {
            throw new IllegalArgumentException("Invalid card");
        }

        // 2. Consultar pedido (acceso a BD)
        OrderEntity order = paymentRepo.findOrderById(orderId);
        if (order == null || !"CREATED".equals(order.getStatus())) {
            throw new IllegalStateException("Order cannot be paid");
        }

        // 3. Procesar pago (llamada externa)
        String transactionId = PaymentGatewayAPI.charge(cardNumber, amount);

        // 4. Actualizar estado (acceso a BD)
        order.setStatus("PAID");
        paymentRepo.save(order);

        // 5. Enviar email (efecto secundario)
        emailService.sendPaymentConfirmation(order.getCustomerEmail(), orderId, amount);

        return new PaymentResult("SUCCESS", transactionId);
    }
}
```

Identifica qué pertenece a cada capa y reescribe separando:
- Entities (reglas de negocio puras)
- Use Cases (flujo, coordinación)
- Interface Adapters (controllers, presenters, gateways)
- Frameworks & Drivers (Spring, JPA, APIs externas)

---

## Ejercicio 4: Diseñar la Estructura de Paquetes según Screaming Architecture

Diseña la estructura de paquetes completa para un sistema de **gestión de suscripciones** (como Netflix o Spotify) siguiendo Clean Architecture + Screaming Architecture.

### Funcionalidades del sistema
- Gestión de planes de suscripción (básico, premium, familiar)
- Registro y autenticación de usuarios
- Suscripción de usuarios a planes
- Facturación recurrente (mensual/anual)
- Cancelación de suscripciones
- Catálogo de contenido (películas, series)
- Reproducción de contenido (streaming)

### Requisitos de la estructura
- Debe gritar "Suscripciones", no "Spring" o "JPA"
- Separación clara en Entities, Use Cases, Interface Adapters, Frameworks
- Cada bounded context debe tener su propio paquete
- Incluye al menos el código de una Entity, un Use Case, un Controller y un Gateway
