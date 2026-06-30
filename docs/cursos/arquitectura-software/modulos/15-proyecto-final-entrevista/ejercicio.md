---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Refactorizar Monolito Legacy con Strangler Fig

Un monolito legacy de gestión de inventario debe migrarse a microservicios. El sistema tiene:

- **Módulo de Productos**: alta carga, cambios frecuentes
- **Módulo de Stock**: necesita baja latencia
- **Módulo de Órdenes de Compra**: flujo complejo, integración con ERP
- **Módulo de Reportes**: consultas pesadas, datos agregados

### Tareas
a) ¿Qué módulo extraerías primero? ¿Por qué?
b) Diseña las fases de migración (3 fases)
c) ¿Cómo manejas la consistencia de datos durante la migración?
d) ¿Qué haces con la BD compartida?
e) ¿Cómo rediriges el tráfico sin downtime?

---

## Ejercicio 4: Circuit Breaker para Servicio de Pagos Externo

Implementa un **Circuit Breaker** para proteger el sistema cuando el servicio externo de pagos falla.

### Tareas
a) Configura el Circuit Breaker (threshold, ventana, timeout)
b) Implementa un fallback que encola el pago para reintentar
c) ¿Cómo manejas pagos que fallan repetidamente (DLQ)?
d) Implementa monitoreo: métricas de estado del CB
e) ¿Cómo pruebas el Circuit Breaker?

---

## Ejercicio 5: Diseñar Flujo de Eventos para "Completar Pedido"

Diseña el flujo completo de eventos para **completar un pedido**:

1. Crear pedido
2. Verificar stock
3. Procesar pago
4. Actualizar inventario
5. Crear envío
6. Notificar al cliente

### Tareas
a) Define todos los eventos del flujo (coreografía)
b) Define todos los comandos (si usas orquestación)
c) Para cada evento, indica: productor, consumidores, schema
d) ¿Qué garantía de entrega necesita cada paso?
e) ¿Cómo manejas fallos en cada paso (compensación)?

---

## Ejercicio 6: Trade-off Consistencia Fuerte vs Eventual en Carrito

Analiza el **trade-off entre consistencia fuerte y eventual** para el carrito de compras:

### Escenario
- Usuario agrega productos al carrito
- El carrito debe persistir entre sesiones
- Dos usuarios pueden compartir cuenta familiar
- Ofertas por tiempo limitado (productos pueden agotarse)

### Tareas
a) ¿Qué nivel de consistencia necesita el carrito?
b) ¿Usarías Redis (eventual) o PostgreSQL (fuerte)?
c) ¿Cómo manejas el caso en que un producto se agota mientras está en el carrito?
d) Diseña la solución justificando tus trade-offs

---

## Ejercicio 7: Diseñar Context Map para Catálogo + Pedidos + Inventario

Diseña el **Context Map** (mapa de contextos) para tres bounded contexts:

- **Catálogo**: productos, categorías, precios, imágenes
- **Pedidos**: carrito, pedidos, facturación
- **Inventario**: stock, almacenes, alertas

### Tareas
a) Define las relaciones entre contextos (partnership, customer-supplier, ACL, etc.)
b) Identifica dónde se necesita un Anticorruption Layer (ACL)
c) ¿Cómo se maneja el concepto de "Producto" en cada contexto?
d) ¿Qué eventos fluyen entre contextos?

---

## Ejercicio 8: Elegir Base de Datos para Diferentes Contextos

Selecciona la base de datos más apropiada para cada bounded context y justifica:

| Contexto | Características | BD recomendada | Justificación |
|----------|----------------|---------------|---------------|
| Catálogo | Atributos variables, búsqueda, imágenes | | |
| Pedidos | Transacciones ACID, relaciones | | |
| Carrito | Baja latencia, datos temporales | | |
| Reportes | Grandes volúmenes, agregaciones | | |
| Búsqueda | Full-text, filtros facetados | | |
| Sesiones | Acceso frecuente, expiración | | |
| Logs | Alto volumen, escritura secuencial | | |

---

## Ejercicio 9: Implementar Transaction Outbox + Kafka

Implementa el patrón **Transaction Outbox** para garantizar que cuando se crea un pedido, el evento `OrderCreated` se publique en Kafka sin pérdidas.

### Requisitos
- El pedido y el outbox event se guardan en la misma transacción
- Un publicador programado lee eventos pendientes
- Idempotencia en el consumidor
- Dead Letter Queue para eventos fallidos

Implementa en Java:
- Entidad `Order` y `OutboxEvent`
- `OrderService` con `@Transactional`
- `OutboxPublisher` con `@Scheduled`
- Consumidor Kafka idempotente

---

## Ejercicio 10: Diseñar Migración de BD sin Downtime

La E-Commerce Platform necesita migrar la tabla `orders` de PostgreSQL a una nueva estructura de datos. No puede haber downtime.

### Escenario actual → target
```
Actual: orders (id, customer_id, status, total, created_at, jsonb items)
Target: orders (id, customer_id, status, total, created_at) + order_items (id, order_id, product_id, quantity, unit_price)
```

### Tareas
a) Diseña una estrategia de migración que no requiera downtime
b) ¿Usarías blue-green deployment, feature flags, o ambos?
c) ¿Cómo manejas escrituras durante la migración?
d) ¿Cómo verificas que la migración fue exitosa?
e) ¿Qué haces si la migración falla (rollback)?
