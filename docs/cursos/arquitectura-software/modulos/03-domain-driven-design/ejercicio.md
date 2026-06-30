---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Diseñar Aggregates

Para el bounded context de **Pedidos**, diseñar los aggregates necesarios:

### Requerimientos
- Un pedido tiene múltiples líneas (producto + cantidad)
- Un pedido tiene una dirección de envío
- Un pedido pertenece a un cliente
- Se puede aplicar un cupón de descuento
- El estado del pedido cambia: CREADO → PAGADO → DESPACHADO → ENTREGADO
- No se puede modificar un pedido pagado
- Se puede cancelar un pedido solo si está en estado CREADO

### Tareas
a) Identificar el aggregate root
b) Identificar entidades y value objects dentro del aggregate
c) Definir invariantes (reglas que siempre deben cumplirse)
d) Implementar el aggregate en Java (esqueleto)
e) ¿Qué pasa si necesitamos agregar un producto que requiere verificar stock? ¿Cómo modelarías esta interacción entre aggregates?

---

## Ejercicio 4: Context Map para E-Commerce

Dibuja el Context Map de la E-Commerce Platform con los siguientes bounded contexts:

- **Catálogo**: productos, categorías, búsqueda
- **Pedidos**: creación y gestión de pedidos, carrito
- **Pagos**: procesamiento de pagos, reembolsos
- **Inventario**: control de stock, alertas
- **Usuarios**: registro, autenticación, perfiles
- **Envíos**: logística, tracking
- **Notificaciones**: emails, push

Para cada par de contextos que se relacionen, define:
1. Tipo de relación (partnership, customer-supplier, ACL, etc.)
2. Flujo de datos principal
3. ¿Hay lenguajes diferentes que requieran traducción?
