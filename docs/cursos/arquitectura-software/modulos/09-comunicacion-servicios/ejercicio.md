---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Diseñar Esquema de Mensajería (Kafka)

Diseña el esquema de mensajería para el flujo de **"Complete Order"** :

1. OrderService crea pedido → publica evento
2. InventoryService recibe evento → reserva stock → publica resultado
3. PaymentService recibe evento → procesa pago → publica resultado
4. ShippingService recibe evento → crea envío → publica resultado
5. NotificationService recibe eventos → envía emails

### Tareas
a) Define los topics de Kafka
b) Define el schema de cada evento (JSON o Protobuf)
c) Define los consumer groups
d) Indica qué garantía de entrega necesita cada paso
e) ¿Cómo manejas el caso en que InventoryService no puede reservar stock? ¿Qué evento se publica?

---

## Ejercicio 4: Comparación REST vs Eventos (Trade-off Analysis)

Para el siguiente escenario, analiza y compara REST vs Eventos:

> "El equipo de E-Commerce Platform está rediseñando la comunicación entre OrderService y PaymentService. Actualmente usan REST síncrono. Quieren evaluar si cambiar a eventos asíncronos (Kafka)."

### Tareas
a) Completa la tabla comparativa para este caso específico:

| Aspecto | REST (actual) | Eventos (propuesto) |
|---------|---------------|-------------------|
| Latencia del pago | | |
| Disponibilidad (si PaymentService cae) | | |
| Complejidad de implementación | | |
| Trazabilidad | | |
| Consistencia de datos | | |
| Testing | | |

b) ¿En qué casos recomendarías mantener REST?
c) ¿En qué casos recomendarías migrar a eventos?
d) Propón una solución híbrida que combine lo mejor de ambos.
