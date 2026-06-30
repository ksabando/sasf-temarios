---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Implementar Transaction Outbox

Implementa el patrón Transaction Outbox para garantizar que cuando se crea un pedido, el evento `OrderCreated` se publique en Kafka de forma confiable.

### Requisitos
1. El pedido y el evento se guardan en la misma transacción
2. Un publicador relé periódicamente los eventos pendientes
3. Si Kafka falla, el evento no se pierde
4. Idempotencia en el consumidor

Implementa:
a) La tabla `outbox` en SQL
b) La entidad JPA `OutboxEvent`
c) El repositorio `OutboxRepository`
d) El servicio `OrderService` que guarda pedido + outbox en la misma transacción
e) El `OutboxPublisher` que publica eventos pendientes

---

## Ejercicio 4: Análisis CAP/PACELC

Analiza los siguientes sistemas y determina qué compromiso CAP hacen:

| Sistema | Consistencia | Disponibilidad | Tolerancia a particiones | Explicación |
|---------|-------------|---------------|-------------------------|-------------|
| PostgreSQL single node | | | | |
| PostgreSQL con replicación síncrona | | | | |
| Cassandra (quorum) | | | | |
| MongoDB (default) | | | | |
| Redis Cluster | | | | |
| Kafka | | | | |

### Bonus
Para cada sistema, ¿qué compromiso PACELC haría?
- En partición: ¿C o A?
- En condición normal (Else): ¿L o C?
