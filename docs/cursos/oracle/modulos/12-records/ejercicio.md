---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Record Anidado (Dirección + Cliente)

Una tienda necesita gestionar direcciones de clientes como parte de su perfil.

**Tareas:**
1. Definir TYPE `t_direccion` con campos: `calle`, `ciudad`, `pais`.
2. Definir TYPE `t_cliente` con campos: `nombre`, `direccion` (t_direccion), `telefono`.
3. Declarar una variable de tipo `t_cliente`, asignar valores completos.
4. Mostrar la información en formato:
   ```
   Cliente: Juan Pérez
   Dirección: Av. Siempre Viva 123, Santiago, Chile
   Teléfono: +56 9 1234 5678
   ```

---

## Ejercicio 4: Función que Retorna un Record

Usando el TYPE `t_reporte_venta` del Ejercicio 2 (o uno similar), crear una función que reciba un `venta_id` y devuelva un record con el resumen de esa venta.

**Tareas:**
1. Crear la función `obtener_resumen_venta(p_venta_id NUMBER) RETURN t_reporte_venta`.
2. Implementar el cuerpo: hacer JOIN entre ventas, ventas_detalle, productos y categorias; sumar totales.
3. Llamar la función desde un bloque anónimo y mostrar los resultados.
4. Incluir manejo de excepción `NO_DATA_FOUND`.

---

## Ejercicio 5: Vistas Simples y Vistas Materializadas

Usando las tablas `PRODUCTOS` y `CATEGORIAS` del ejercicio 1:

**Tareas:**
1. Crear una **vista simple** `V_PRODUCTOS_ELECTRONICA` que muestre solo los productos de la categoría 'Electrónica' (id_categoria = 1) con columnas: `id`, `nombre`, `precio`, `stock`.
2. Crear una **vista compleja** `V_RESUMEN_CATEGORIAS` que muestre: `nombre_categoria`, `total_productos`, `precio_promedio`, `stock_total`.
3. Crear una **vista materializada** `MV_RESUMEN_CATEGORIAS` con REFRESH COMPLETE ON DEMAND con el mismo resumen.
4. Actualizar el precio de un producto y consultar ambas vistas para verificar cuál refleja el cambio inmediatamente.

---

## Ejercicio 6: Empleados con JOIN (INNER, LEFT, RIGHT, FULL)

Dadas las tablas:

```sql
CREATE TABLE departamentos (
    id     NUMBER(3) PRIMARY KEY,
    nombre VARCHAR2(50)
);

CREATE TABLE empleados (
    id       NUMBER(6) PRIMARY KEY,
    nombre   VARCHAR2(100),
    depto_id NUMBER(3)
);

INSERT INTO departamentos VALUES (1, 'Ventas');
INSERT INTO departamentos VALUES (2, 'TI');
INSERT INTO departamentos VALUES (3, 'RRHH');

INSERT INTO empleados VALUES (1, 'Ana López',   1);
INSERT INTO empleados VALUES (2, 'Luis Gómez',  1);
INSERT INTO empleados VALUES (3, 'Sofía Ruiz',  2);
INSERT INTO empleados VALUES (4, 'Carlos Díaz', 4);
INSERT INTO empleados VALUES (5, 'María Torres', NULL);
```

**Tareas:**
1. Escribir una consulta con INNER JOIN. ¿Cuántas filas devuelve?
2. Escribir una consulta con LEFT JOIN (empleados como izquierda). ¿Cuántas filas devuelve?
3. Escribir una consulta con RIGHT JOIN. ¿Cuántas filas devuelve?
4. Escribir una consulta con FULL OUTER JOIN. ¿Cuántas filas devuelve?
5. Explicar por qué cada consulta devuelve esa cantidad de filas.

---

## Ejercicio 7: SELF JOIN — Empleados y Jefes

```sql
CREATE TABLE empleados_con_jefe (
    id       NUMBER(6) PRIMARY KEY,
    nombre   VARCHAR2(100),
    jefe_id  NUMBER(6)
);

INSERT INTO empleados_con_jefe VALUES (1, 'Gerente General', NULL);
INSERT INTO empleados_con_jefe VALUES (2, 'Jefe Ventas',     1);
INSERT INTO empleados_con_jefe VALUES (3, 'Jefe TI',         1);
INSERT INTO empleados_con_jefe VALUES (4, 'Vendedor 1',      2);
INSERT INTO empleados_con_jefe VALUES (5, 'Vendedor 2',      2);
INSERT INTO empleados_con_jefe VALUES (6, 'Programador',     3);
```

Escribir una consulta con SELF JOIN que muestre: `empleado`, `jefe`. Los empleados sin jefe deben aparecer con `'(Sin jefe)'`.
