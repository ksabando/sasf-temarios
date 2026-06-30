---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Event Sourcing para Cuenta Bancaria

Implementa un sistema de cuenta bancaria con Event Sourcing:

- Eventos: `CuentaCreada`, `Depositado`, `Retirado`, `TransferenciaRealizada`
- `CuentaBancariaAgregado`: se reconstruye desde eventos
- `EventStore`: almacena eventos en memoria
- Comandos que validan reglas de negocio (saldo suficiente para retirar)
- Proyección: `CuentaQueryService` que consulta el saldo actual

Debe ser posible reconstruir el estado completo reproduciendo todos los eventos.

---

## Ejercicio 4: Saga para Reserva de Hotel + Vuelo

Implementa una saga orquestada para reservar un paquete de viaje (vuelo + hotel):

- Pasos: 1) Reservar vuelo, 2) Reservar hotel, 3) Cobrar
- Compensaciones: Si el hotel falla, cancelar vuelo. Si el cobro falla, cancelar vuelo y hotel.
- Simula fallos aleatorios para probar las compensaciones
- Usa el patrón Saga con un orquestador central

---

## Ejercicio 5: Circuit Breaker + Outbox

Implementa un sistema de procesamiento de pedidos que combine Circuit Breaker y Outbox:

- `ProductoServiceClient`: llama a un servicio externo de productos (simular con delays y fallos)
- Envuelve la llamada con Circuit Breaker (implementación manual simple con estados: CLOSED, OPEN, HALF_OPEN)
- Outbox: guarda eventos de pedido en tabla outbox antes de enviar a Kafka/cola
- Worker que procesa la tabla outbox y reintenta envíos fallidos
