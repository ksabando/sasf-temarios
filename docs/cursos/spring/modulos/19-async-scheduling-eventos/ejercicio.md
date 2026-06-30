---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Eventos de pedidos

Crea un sistema de procesamiento de pedidos basado en eventos:
1. Clase `PedidoCreadoEvent` con `pedidoId`, `cliente`, `total`.
2. `PedidoService` que publica `PedidoCreadoEvent` al crear un pedido.
3. `InventarioListener` que descuenta stock al recibir el evento.
4. `FacturacionListener` que genera una factura al recibir el evento.

Ambos listeners deben ejecutarse de forma asíncrona.

---

## Ejercicio 4: Evento transaccional

Extiende el ejercicio anterior:
- Cambia `InventarioListener` para que se ejecute solo si la transacción se confirma (`@TransactionalEventListener`).
- Agrega una simulación de error: si el total del pedido es > 10000, lanza una excepción y verifica que el listener no se ejecute (rollback).

---

## Ejercicio 5: Procesamiento de pedidos con CompletableFuture

Crea un `ProcesadorPedidosService` que:
1. Reciba un pedido y ejecute tres tareas en paralelo usando `CompletableFuture`:
   - `verificarStock(productos)`: tarda 2s.
   - `calcularImpuestos(total)`: tarda 1s.
   - `aplicarDescuentos(cliente)`: tarda 1.5s.
2. Combine los tres resultados con `thenCombine` o `allOf`.
3. Devuelva un resumen combinado.
4. Si alguna tarea falla, maneje el error con `exceptionally` y retorne un mensaje de error.
