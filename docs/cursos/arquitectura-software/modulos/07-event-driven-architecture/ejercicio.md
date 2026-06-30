---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Implementar Consumidor Idempotente

Implementa un consumidor Kafka para el evento `OrderCreatedEvent` que:

- Actualiza el read model de pedidos
- Envía un email de confirmación
- Solicita autorización de pago

Requisitos:
1. **Idempotencia**: si el mismo evento llega dos veces, solo se procesa una vez
2. **Manejo de errores**: si falla el email, no debe afectar la autorización de pago
3. **Dead Letter Queue (DLQ)**: si un evento falla 3 veces, moverlo a DLQ
4. **Logging**: registrar cada intento de procesamiento

```java
@Component
public class OrderCreatedConsumer {
    // Implementar aquí
}
```

---

## Ejercicio 4: Análisis de EDA para E-Commerce

Analiza el siguiente escenario y responde:

> La E-Commerce Platform tiene los siguientes servicios: Pedidos, Pagos, Inventario, Envíos, Notificaciones, Catálogo. Actualmente se comunican vía REST síncrono y hay problemas de disponibilidad (cuando Pagos falla, Pedidos también falla).

**a)** Diseña una arquitectura event-driven que resuelva el problema de disponibilidad.

**b)** Define los topics de Kafka necesarios y qué servicios producen/consumen cada topic.

**c)** ¿Qué patrón de resiliencia implementarías además de EDA? (Circuit Breaker, Retry, Bulkhead, etc.)

**d)** ¿Cómo manejarías la consistencia de datos? (ej: si el pago se procesa pero el evento no llega a Pedidos)
