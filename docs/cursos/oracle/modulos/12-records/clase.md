---
sidebar_label: "Clase"
---

# Módulo 07: Records y Modelado de Vistas

## 1. Records en PL/SQL

Un **record** es una estructura de datos compuesta que agrupa campos de distintos tipos, similar a una fila de una tabla.

### TYPE IS RECORD (definido por el programador)

```sql
DECLARE
    TYPE t_direccion IS RECORD (
        calle  VARCHAR2(100),
        ciudad VARCHAR2(50),
        pais   VARCHAR2(50)
    );
    TYPE t_cliente IS RECORD (
        nombre    VARCHAR2(100),
        direccion t_direccion,  -- record anidado
        telefono  VARCHAR2(20)
    );
    v_cliente t_cliente;
BEGIN
    v_cliente.nombre := 'Juan Pérez';
    v_cliente.direccion.calle := 'Av. Siempre Viva 123';
    v_cliente.direccion.ciudad := 'Santiago';
    v_cliente.direccion.pais := 'Chile';
    v_cliente.telefono := '+56 9 1234 5678';
END;
/
```

### %ROWTYPE (hereda estructura de tabla/vista)

```sql
DECLARE
    v_producto productos%ROWTYPE;  -- misma estructura que la tabla
BEGIN
    SELECT * INTO v_producto FROM productos WHERE id = 1;
    DBMS_OUTPUT.PUT_LINE(v_producto.nombre);
END;
/
```

### Records como Parámetros y Retorno de Funciones

```sql
CREATE OR REPLACE PACKAGE pkg_tienda AS
    TYPE t_resumen_producto IS RECORD (
        id            NUMBER(6),
        nombre        VARCHAR2(100),
        precio        NUMBER(10,2),
        categoria     VARCHAR2(50)
    );
    FUNCTION obtener_resumen(p_id NUMBER) RETURN t_resumen_producto;
END;
/
```

## 2. Vistas (CREATE VIEW)

Una **vista** es una consulta almacenada que se comporta como una tabla virtual.

```sql
CREATE VIEW v_productos_categoria AS
SELECT p.id, p.nombre, p.precio, c.nombre AS categoria
FROM productos p
JOIN categorias c ON p.categoria_id = c.id;
```

Luego se puede consultar como tabla:
```sql
SELECT * FROM v_productos_categoria WHERE precio > 100000;
```

### ¿Cuándo crear una vista vs consultar directamente?

| Situación | Recomendación |
|-----------|--------------|
| Consulta repetitiva en múltiples programas | Crear vista (DRY) |
| Necesidad de ocultar columnas sensibles | Crear vista (seguridad) |
| JOIN complejo usado por varios equipos | Crear vista (abstracción) |
| Consulta única en un solo bloque | Consultar directamente |
| Performance crítica (la vista puede ocultar índices) | Evaluar cada caso |

## 3. Modelado con Records y Vistas — TABLE MODELING

### Records PL/SQL como Reflejo de Filas de Tabla

Los records permiten transportar una fila completa sin declarar N variables sueltas:

```sql
-- Sin record (N variables)
DECLARE
    v_id NUMBER;
    v_nombre VARCHAR2(100);
    v_precio NUMBER(10,2);
BEGIN
    SELECT id, nombre, precio INTO v_id, v_nombre, v_precio FROM productos WHERE id = 1;
END;

-- Con record (una sola variable)
DECLARE
    v_prod productos%ROWTYPE;
BEGIN
    SELECT * INTO v_prod FROM productos WHERE id = 1;
END;
```

### Vistas como Modelos Derivados

Una vista puede verse como un **modelo derivado** que:
- Simplifica consultas complejas (JOINs, agregaciones).
- Centraliza lógica de negocio (ej. `v_clientes_activos` con filtro de estado).
- Sirve como capa de abstracción entre tablas físicas y reportes.

### Records que Representan JOINs (DTOs para Reportes)

Para reportes desnormalizados, se define un record que refleje la vista o el SELECT del JOIN:

```sql
CREATE OR REPLACE TYPE t_reporte_venta AS OBJECT (
    producto_nombre VARCHAR2(100),
    categoria       VARCHAR2(50),
    cantidad        NUMBER(6),
    total           NUMBER(10,2),
    fecha_venta     DATE
);
/
```

O en PL/SQL puro:

```sql
DECLARE
    TYPE t_reporte_venta IS RECORD (
        producto_nombre VARCHAR2(100),
        categoria       VARCHAR2(50),
        cantidad        NUMBER(6),
        total           NUMBER(10,2),
        fecha_venta     DATE
    );
    v_reporte t_reporte_venta;
BEGIN
    SELECT p.nombre, c.nombre, vd.cantidad,
           vd.cantidad * p.precio, v.fecha_venta
    INTO v_reporte
    FROM ventas v
    JOIN ventas_detalle vd ON v.id = vd.venta_id
    JOIN productos p ON vd.producto_id = p.id
    JOIN categorias c ON p.categoria_id = c.id
    WHERE v.id = 1;
END;
/
```

### DTOs (Data Transfer Objects) entre PL/SQL y Aplicaciones

Los records (u objetos) definen un contrato entre la capa de datos (PL/SQL) y la aplicación. Esto permite:
- Tipado fuerte: la aplicación sabe exactamente qué campos esperar.
- Desacoplamiento: cambiar la tabla no afecta la interfaz si la vista/record se mantiene.
- Reutilización: el mismo record puede usarse en múltiples reportes.

## Temas Complementarios: Vistas Detalladas y Joins

### Vistas Simples vs Complejas

| Tipo | Característica | Ejemplo |
|------|---------------|---------|
| **Vista Simple** | Consulta una sola tabla, sin funciones de grupo ni GROUP BY | `CREATE VIEW v_emp AS SELECT id, nombre FROM empleados;` |
| **Vista Compleja** | JOIN de múltiples tablas, funciones de grupo, GROUP BY | `CREATE VIEW v_resumen AS SELECT d.nombre, COUNT(*) FROM empleados e JOIN dept d ON e.dept_id = d.id GROUP BY d.nombre;` |

**DML en vistas**: Solo se pueden hacer INSERT/UPDATE/DELETE sobre vistas simples. Las vistas complejas son de solo lectura.

### Vistas Materializadas (Materialized Views)

Almacenan físicamente los resultados de la consulta:

```sql
CREATE MATERIALIZED VIEW mv_resumen_ventas
REFRESH COMPLETE ON DEMAND
AS
SELECT p.nombre, c.nombre AS categoria, SUM(vd.cantidad * vd.precio_unit) AS total
FROM ventas_detalle vd
JOIN productos p ON vd.producto_id = p.id
JOIN categorias c ON p.categoria_id = c.id
GROUP BY p.nombre, c.nombre;
```

| Tipo | Almacenamiento | Velocidad | Datos |
|------|---------------|-----------|-------|
| Vista normal | Solo definición | Lenta (ejecuta consulta cada vez) | Siempre actuales |
| Vista materializada | Datos físicos | Muy rápida | Pueden estar desactualizados (requieren refresh) |

### Tipos de JOIN

```sql
-- INNER JOIN: solo registros que coinciden en ambas tablas
SELECT e.nombre, d.nombre AS departamento
FROM empleados e
INNER JOIN departamentos d ON e.depto_id = d.id;

-- LEFT JOIN: todos los empleados, aunque no tengan departamento
SELECT e.nombre, d.nombre AS departamento
FROM empleados e
LEFT JOIN departamentos d ON e.depto_id = d.id;

-- RIGHT JOIN: todos los departamentos, aunque no tengan empleados
SELECT e.nombre, d.nombre AS departamento
FROM empleados e
RIGHT JOIN departamentos d ON e.depto_id = d.id;

-- FULL OUTER JOIN: todos los registros de ambas tablas
SELECT e.nombre, d.nombre AS departamento
FROM empleados e
FULL OUTER JOIN departamentos d ON e.depto_id = d.id;

-- CROSS JOIN: producto cartesiano (cada empleado con cada departamento)
SELECT e.nombre, d.nombre AS departamento
FROM empleados e
CROSS JOIN departamentos d;

-- SELF JOIN: una tabla unida consigo misma (ej. empleados y su jefe)
SELECT e.nombre AS empleado, j.nombre AS jefe
FROM empleados e
LEFT JOIN empleados j ON e.jefe_id = j.id;
```

| JOIN | Filas resultado |
|------|----------------|
| INNER | Solo coincidencias |
| LEFT | Todas las de la izquierda + coincidencias derecha |
| RIGHT | Todas las de la derecha + coincidencias izquierda |
| FULL OUTER | Todas las filas de ambas tablas |
| CROSS | Producto cartesiano (filas_izq - filas_der) |
| SELF JOIN | Depende del tipo de JOIN usado (es un JOIN contra sí misma) |
