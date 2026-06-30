---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Crear vista con JOIN

Cree una vista llamada `V_PRODUCTOS_CATEGORIA` que muestre:
- `producto_id`
- `nombre_producto` (nombre del producto)
- `precio`
- `stock`
- `nombre_categoria` (nombre de la categoría)

Use un LEFT JOIN para incluir productos sin categoría.

Luego responda: ¿Esta vista es actualizable? ¿Se podría hacer INSERT, UPDATE o DELETE a través de ella? ¿Por qué?

---

## Ejercicio 4: Crear índices

Cree dos índices sobre la tabla PRODUCTOS:

1. Un índice B-Tree sobre la columna `precio`.
2. Un índice sobre la columna `categoria_id` (FK).

Escriba ejemplos de consultas SQL donde Oracle probablemente usaría cada uno de estos índices y explique por qué.

---

## Ejercicio 5: UPDATE con subconsulta correlacionada

Primero cree una tabla `VENTAS` simple para simular ventas realizadas:

```sql
CREATE TABLE ventas (
    venta_id NUMBER PRIMARY KEY,
    producto_id NUMBER,
    cantidad NUMBER,
    fecha DATE DEFAULT SYSDATE,
    FOREIGN KEY (producto_id) REFERENCES productos(producto_id)
);
```

Inserte algunas ventas de prueba. Luego escriba un UPDATE con subconsulta correlacionada que actualice el `stock` de la tabla PRODUCTOS restando la cantidad total vendida de cada producto (de la tabla VENTAS).

**Pista**: Use `NVL(SUM(...), 0)` para manejar productos sin ventas.

---

## Ejercicio 6: MERGE

Cree una tabla `PRODUCTOS_STAGING` con la misma estructura que PRODUCTOS (puede usar `CREATE TABLE productos_staging AS SELECT * FROM productos WHERE 1=0`).

Inserte algunos datos en PRODUCTOS_STAGING:
- Algunos productos que YA existen en PRODUCTOS (mismo ID) pero con precio/stock actualizado.
- Algunos productos NUEVOS que no existen en PRODUCTOS.

Luego, escriba una sentencia MERGE que sincronice PRODUCTOS con PRODUCTOS_STAGING:
- Si el producto ya existe (mismo producto_id) → actualizar nombre, precio, stock.
- Si el producto no existe → insertarlo.

**Pregunta adicional**: ¿Qué pasa si en PRODUCTOS_STAGING hay un producto_id que no existe en CATEGORIAS? ¿La FK lo permite?
