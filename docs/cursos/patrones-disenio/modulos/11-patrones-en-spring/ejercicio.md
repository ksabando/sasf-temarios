---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Sistema de Eventos con @EventListener

Implementa un sistema de procesamiento de pedidos usando Observer (eventos de Spring):

- Evento: `PedidoCreadoEvent` (contiene idPedido, cliente, total, fecha)
- Evento: `PedidoPagadoEvent` (contiene idPedido, metodoPago)
- Publicador: `PedidoService` que publica eventos cuando se crea y paga un pedido
- Oyentes:
  - `InventarioListener`: actualiza stock
  - `NotificacionListener`: envía email al cliente
  - `FacturacionListener`: genera factura
  - `AuditoriaListener`: registra en log

Usa `@Async` para que los oyentes se ejecuten en hilos separados.

---

## Ejercicio 4: Cadena de Filtros Personalizados

Implementa una cadena de filtros HTTP en Spring Boot usando `Filter` o `OncePerRequestFilter`:

- **LoggingFilter**: registra método, URI, tiempo de procesamiento
- **RateLimitFilter**: limita peticiones por IP (máximo 100 por minuto)
- **ApiKeyFilter**: verifica API key en header `X-API-Key`
- **RequestValidationFilter**: valida que los parámetros obligatorios estén presentes

Cada filtro debe decidir si pasa la petición al siguiente o responde con error.

---

## Ejercicio 5: Implementar un Starter con FactoryBean

Crea un starter Spring Boot simple que:

- Defina un `GreetingService` con método `String greet(String name)`
- Usa `FactoryBean` para crear el servicio
- Permita configurar el saludo desde `application.properties`: `greeting.prefix=Hola`
- Auto-configure el bean usando `@EnableAutoConfiguration`
