---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---
  Producto: Laptop X200 | Cat: Electrónica | Cant: 2 | Total: $3000000
  Producto: Mouse —ptico | Cat: Electrónica | Cant: 3 | Total: $75000
--- Venta ID: 2 ---
  Producto: Polera Deportiva | Cat: Ropa | Cant: 5 | Total: $75000
========================
Total General: $3150000
```

---

## Ejercicio 3: Record Anidado

```sql
SET SERVEROUTPUT ON;

DECLARE
    TYPE t_direccion IS RECORD (
        calle  VARCHAR2(100),
        ciudad VARCHAR2(50),
        pais   VARCHAR2(50)
    );
    TYPE t_cliente IS RECORD (
        nombre    VARCHAR2(100),
        direccion t_direccion,
        telefono  VARCHAR2(20)
    );
    v_cliente t_cliente;
BEGIN
    v_cliente.nombre := 'Juan Pérez';
    v_cliente.direccion.calle := 'Av. Siempre Viva 123';
    v_cliente.direccion.ciudad := 'Santiago';
    v_cliente.direccion.pais := 'Chile';
    v_cliente.telefono := '+56 9 1234 5678';

    DBMS_OUTPUT.PUT_LINE('Cliente: ' || v_cliente.nombre);
    DBMS_OUTPUT.PUT_LINE('Dirección: ' || v_cliente.direccion.calle
        || ', ' || v_cliente.direccion.ciudad
        || ', ' || v_cliente.direccion.pais);
    DBMS_OUTPUT.PUT_LINE('Teléfono: ' || v_cliente.telefono);
END;
/
```

Salida esperada:
```
Cliente: Juan Pérez
Dirección: Av. Siempre Viva 123, Santiago, Chile
Teléfono: +56 9 1234 5678
```

---

## Ejercicio 4: Función que Retorna un Record

```sql
-- TYPE a nivel de esquema (necesario para función que retorna record)
CREATE OR REPLACE PACKAGE pkg_tienda AS
    TYPE t_reporte_venta IS RECORD (
        producto_nombre VARCHAR2(100),
        categoria       VARCHAR2(50),
        cantidad        NUMBER(6),
        total           NUMBER(10,2),
        fecha_venta     DATE
    );
    FUNCTION obtener_resumen_venta(p_venta_id NUMBER) RETURN t_reporte_venta;
END;
/

CREATE OR REPLACE PACKAGE BODY pkg_tienda AS
    FUNCTION obtener_resumen_venta(p_venta_id NUMBER) RETURN t_reporte_venta IS
        v_resumen t_reporte_venta;
    BEGIN
        SELECT p.nombre,
               c.nombre,
               SUM(vd.cantidad),
               SUM(vd.cantidad * vd.precio_unit),
               MAX(v.fecha_venta)
        INTO v_resumen
        FROM ventas v
        JOIN ventas_detalle vd ON v.id = vd.venta_id
        JOIN productos p ON vd.producto_id = p.id
        JOIN categorias c ON p.categoria_id = c.id
        WHERE v.id = p_venta_id
        GROUP BY p.nombre, c.nombre;

        RETURN v_resumen;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_resumen.producto_nombre := 'VENTA NO ENCONTRADA';
            v_resumen.categoria := '';
            v_resumen.cantidad := 0;
            v_resumen.total := 0;
            v_resumen.fecha_venta := NULL;
            RETURN v_resumen;
    END obtener_resumen_venta;
END;
/

-- Prueba de la función
SET SERVEROUTPUT ON;

DECLARE
    v_res pkg_tienda.t_reporte_venta;
BEGIN
    v_res := pkg_tienda.obtener_resumen_venta(1);
    DBMS_OUTPUT.PUT_LINE('Producto: ' || v_res.producto_nombre);
    DBMS_OUTPUT.PUT_LINE('Categoría: ' || v_res.categoria);
    DBMS_OUTPUT.PUT_LINE('Cantidad: ' || v_res.cantidad);
    DBMS_OUTPUT.PUT_LINE('Total: $' || v_res.total);
    DBMS_OUTPUT.PUT_LINE('Fecha: ' || TO_CHAR(v_res.fecha_venta, 'DD/MM/YYYY'));

    DBMS_OUTPUT.PUT_LINE('---');

    v_res := pkg_tienda.obtener_resumen_venta(99);
    DBMS_OUTPUT.PUT_LINE('Resultado: ' || v_res.producto_nombre);
END;
/
```

Salida esperada:
```
Producto: Laptop X200
Categoría: Electrónica
Cantidad: 2
Total: $3000000
Fecha: 15/06/2026
---
Resultado: VENTA NO ENCONTRADA
```

---

## Ejercicio 5: Vistas Simples y Materializadas

```sql
-- Vista simple (una sola tabla, sin funciones de grupo)
CREATE OR REPLACE VIEW v_productos_electronica AS
SELECT id, nombre, precio, stock
FROM productos
WHERE categoria_id = 1;

-- Vista compleja (JOIN + funciones de grupo)
CREATE OR REPLACE VIEW v_resumen_categorias AS
SELECT c.nombre AS nombre_categoria,
       COUNT(p.id) AS total_productos,
       ROUND(AVG(p.precio), 2) AS precio_promedio,
       SUM(p.stock) AS stock_total
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
GROUP BY c.nombre;

-- Vista materializada
CREATE MATERIALIZED VIEW mv_resumen_categorias
REFRESH COMPLETE ON DEMAND
AS
SELECT c.nombre AS nombre_categoria,
       COUNT(p.id) AS total_productos,
       ROUND(AVG(p.precio), 2) AS precio_promedio,
       SUM(p.stock) AS stock_total
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
GROUP BY c.nombre;

-- Probar actualización
UPDATE productos SET precio = 2000000 WHERE id = 1;
COMMIT;

SELECT * FROM v_resumen_categorias;      -- Refleja el cambio inmediatamente
SELECT * FROM mv_resumen_categorias;     -- NO refleja el cambio hasta hacer refresh

-- Refrescar la vista materializada
BEGIN
    DBMS_MVIEW.REFRESH('MV_RESUMEN_CATEGORIAS', 'C');
END;
/
```

---

## Ejercicio 6: Joins

```sql
-- 1. INNER JOIN: solo empleados con depto_id existente en departamentos
SELECT e.nombre, d.nombre AS departamento
FROM empleados e
INNER JOIN departamentos d ON e.depto_id = d.id;
```
Devuelve **3 filas**: Ana (Ventas), Luis (Ventas), Sofía (TI). Carlos (depto_id=4 que no existe) y María (depto_id=NULL) quedan fuera.

```sql
-- 2. LEFT JOIN: todos los empleados
SELECT e.nombre, d.nombre AS departamento
FROM empleados e
LEFT JOIN departamentos d ON e.depto_id = d.id;
```
Devuelve **5 filas**: los 3 del INNER + Carlos (depto_id=4 → departamento NULL) + María (depto_id=NULL → NULL).

```sql
-- 3. RIGHT JOIN: todos los departamentos
SELECT e.nombre, d.nombre AS departamento
FROM empleados e
RIGHT JOIN departamentos d ON e.depto_id = d.id;
```
Devuelve **4 filas**: los 3 del INNER + RRHH (sin empleados, aparece con e.nombre NULL).

```sql
-- 4. FULL OUTER JOIN: todos los registros de ambas tablas
SELECT e.nombre, d.nombre AS departamento
FROM empleados e
FULL OUTER JOIN departamentos d ON e.depto_id = d.id;
```
Devuelve **6 filas**: las 3 del INNER + Carlos (NULL) + María (NULL) + RRHH (NULL, 'RRHH').

---

## Ejercicio 7: SELF JOIN

```sql
SELECT e.nombre AS empleado,
       NVL(j.nombre, '(Sin jefe)') AS jefe
FROM empleados_con_jefe e
LEFT JOIN empleados_con_jefe j ON e.jefe_id = j.id
ORDER BY e.id;
```

Salida esperada:
```
EMPLEADO          JEFE
Gerente General   (Sin jefe)
Jefe Ventas       Gerente General
Jefe TI           Gerente General
Vendedor 1        Jefe Ventas
Vendedor 2        Jefe Ventas
Programador       Jefe TI
```

