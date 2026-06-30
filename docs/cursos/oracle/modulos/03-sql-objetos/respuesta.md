---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Respuesta 3: Crear vista con JOIN

```sql
-- Crear la vista
CREATE VIEW v_productos_categoria AS
SELECT p.producto_id,
       p.nombre AS nombre_producto,
       p.precio,
       p.stock,
       c.nombre AS nombre_categoria
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.categoria_id;
```

### ¿Es actualizable?

**Esta vista NO es completamente actualizable** en Oracle. Las reglas de Oracle para vistas actualizables establecen:

- La vista no puede contener JOIN (excepto en algunos casos muy limitados con key-preserved tables).
- La vista no debe tener funciones de agregación, DISTINCT, GROUP BY, HAVING, START WITH/CONNECT BY, operadores de conjunto (UNION, etc.).
- La vista debe mapear cada fila de la vista a exactamente una fila de una tabla subyacente.

Como esta vista tiene un JOIN, NO se puede hacer INSERT, UPDATE ni DELETE directamente sobre ella.

**Alternativa**: Se puede usar **INSTEAD OF triggers** para hacerla "actualizable" manualmente:
```sql
CREATE OR REPLACE TRIGGER trg_v_prod_cat_instead
INSTEAD OF INSERT ON v_productos_categoria
FOR EACH ROW
BEGIN
    INSERT INTO productos (producto_id, nombre, precio, stock, categoria_id)
    VALUES (:NEW.producto_id, :NEW.nombre_producto, :NEW.precio, :NEW.stock,
            (SELECT categoria_id FROM categorias WHERE nombre = :NEW.nombre_categoria));
END;
/
```

---

## Respuesta 4: Crear índices

```sql
-- Índice B-Tree sobre precio
CREATE INDEX idx_productos_precio ON productos(precio);

-- Índice sobre FK categoria_id
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
```

### Consultas que usarían cada índice

**Índice `idx_productos_precio`**: consultas que filtran o ordenan por precio.
```sql
-- Búsqueda por rango de precio → el índice acelera el filtro WHERE
SELECT * FROM productos WHERE precio BETWEEN 100 AND 500;

-- Top N productos más caros → índice evita full scan + sort
SELECT * FROM productos ORDER BY precio DESC FETCH FIRST 10 ROWS ONLY;

-- Productos con precio mayor a cierto valor
SELECT * FROM productos WHERE precio > 1000;
```

**Índice `idx_productos_categoria`**: consultas que filtran por categoría o hacen JOIN con CATEGORIAS.
```sql
-- Productos de una categoría específica
SELECT * FROM productos WHERE categoria_id = 1;

-- JOIN entre PRODUCTOS y CATEGORIAS → acelera la FK en el JOIN
SELECT p.nombre, c.nombre AS categoria
FROM productos p
JOIN categorias c ON p.categoria_id = c.categoria_id;

-- Contar productos por categoría
SELECT categoria_id, COUNT(*) FROM productos
GROUP BY categoria_id;
```

**Explicación**: Oracle usa el índice cuando la columna indexada aparece en WHERE, ORDER BY o JOIN. Si el optimizador determina que usar el índice es más costoso que un full table scan (ej. tabla muy pequeña o acceso a gran porcentaje de filas), podría ignorarlo.

---

## Respuesta 5: UPDATE con subconsulta correlacionada

```sql
-- Crear tabla VENTAS
CREATE TABLE ventas (
    venta_id    NUMBER PRIMARY KEY,
    producto_id NUMBER,
    cantidad    NUMBER CHECK (cantidad > 0),
    fecha       DATE DEFAULT SYSDATE,
    FOREIGN KEY (producto_id) REFERENCES productos(producto_id)
);

-- Crear secuencia para ventas
CREATE SEQUENCE seq_ventas START WITH 1 INCREMENT BY 1;

-- Insertar ventas de prueba
INSERT ALL
    INTO ventas VALUES (seq_ventas.NEXTVAL, 1, 3, SYSDATE - 10)
    INTO ventas VALUES (seq_ventas.NEXTVAL, 1, 2, SYSDATE - 5)
    INTO ventas VALUES (seq_ventas.NEXTVAL, 2, 1, SYSDATE - 3)
    INTO ventas VALUES (seq_ventas.NEXTVAL, 3, 4, SYSDATE - 7)
    INTO ventas VALUES (seq_ventas.NEXTVAL, 3, 1, SYSDATE - 1)
    INTO ventas VALUES (seq_ventas.NEXTVAL, 5, 10, SYSDATE - 15)
SELECT * FROM dual;

COMMIT;

-- Verificar ventas
SELECT producto_id, SUM(cantidad) AS total_vendido
FROM ventas GROUP BY producto_id ORDER BY producto_id;

-- UPDATE con subconsulta correlacionada
UPDATE productos p
SET p.stock = p.stock - NVL(
    (SELECT SUM(v.cantidad)
     FROM ventas v
     WHERE v.producto_id = p.producto_id),
    0
);

-- Verificar resultado del UPDATE
SELECT producto_id, nombre, stock FROM productos ORDER BY producto_id;

COMMIT;
```

**Explicación**: Para cada fila de PRODUCTOS (`p`), la subconsulta correlacionada suma las cantidades vendidas de ese producto en VENTAS. `NVL(..., 0)` asegura que los productos sin ventas no se vean afectados (restar 0).

**Resultado esperado**:
- Producto 1 (Laptop Pro): stock = 10 - (3 + 2) = 5
- Producto 2 (Aspiradora Smart): stock = 25 - 1 = 24
- Producto 3 (Bicicleta MTB): stock = 15 - (4 + 1) = 10
- Producto 4 (Novela): stock = 100 - 0 = 100
- Producto 5 (Camiseta Premium): stock = 200 - 10 = 190

---

## Respuesta 6: MERGE

```sql
-- Crear tabla staging (misma estructura, sin datos)
CREATE TABLE productos_staging AS
SELECT * FROM productos WHERE 1 = 0;

-- Insertar datos de prueba en staging
INSERT ALL
    INTO productos_staging (producto_id, nombre, precio, stock, categoria_id)
        VALUES (1, 'Laptop Pro Max', 1800.00, 15, 1)  -- ya existe, precio/stock/nombre actualizados
    INTO productos_staging (producto_id, nombre, precio, stock, categoria_id)
        VALUES (3, 'Bicicleta MTB Pro', 950.00, 20, 3)  -- ya existe, actualizado
    INTO productos_staging (producto_id, nombre, precio, stock, categoria_id)
        VALUES (6, 'Auriculares BT', 120.00, 50, 1)  -- NUEVO producto
    INTO productos_staging (producto_id, nombre, precio, stock, categoria_id)
        VALUES (7, 'Cafetera Italiana', 89.99, 30, 2)  -- NUEVO producto
SELECT * FROM dual;

-- MERGE: sincronizar PRODUCTOS con PRODUCTOS_STAGING
MERGE INTO productos p
USING productos_staging s
ON (p.producto_id = s.producto_id)
WHEN MATCHED THEN
    UPDATE SET p.nombre = s.nombre,
               p.precio = s.precio,
               p.stock = s.stock
WHEN NOT MATCHED THEN
    INSERT (producto_id, nombre, precio, stock, categoria_id)
    VALUES (s.producto_id, s.nombre, s.precio, s.stock, s.categoria_id);

-- Verificar resultado
SELECT * FROM productos ORDER BY producto_id;

COMMIT;
```

**Resultado esperado después del MERGE**:
| PRODUCTO_ID | NOMBRE | PRECIO | STOCK | CATEGORIA_ID |
|-------------|--------|--------|-------|-------------|
| 1 | Laptop Pro Max | 1800.00 | 10 | 1 |
| 2 | Aspiradora Smart | 450.00 | 24 | 2 |
| 3 | Bicicleta MTB Pro | 950.00 | 10 | 3 |
| 4 | Novela Best Seller | 29.99 | 100 | 4 |
| 5 | Camiseta Premium | 59.99 | 190 | 5 |
| 6 | Auriculares BT | 120.00 | 50 | 1 |
| 7 | Cafetera Italiana | 89.99 | 30 | 2 |

**Pregunta adicional**: Si en PRODUCTOS_STAGING hay un `categoria_id` que no existe en CATEGORIAS, la FK `fk_producto_categoria` **rechazará** la inserción con error `ORA-02291: integrity constraint violated - parent key not found`. La FK valida tanto en INSERT directo como en MERGE. Solución: asegurar que las categorías existan antes del MERGE, o usar `ON DELETE SET NULL` solo aplica al DELETE del padre, no a INSERT de hijos huérfanos.

### Ventajas del MERGE
- Una sola sentencia reemplaza lógica IF-EXISTS-UPDATE-ELSE-INSERT.
- Atómico: todo ocurre en una transacción.
- Más eficiente que SELECT + UPDATE/INSERT por separado.

