---
sidebar_label: "Clase"
---

# Módulo 00-SQL-Objetos — Objetos de Base de Datos Oracle

## 1. DDL (Data Definition Language)

Comandos para definir y modificar la estructura de los objetos de base de datos.

### CREATE TABLE
```sql
CREATE TABLE productos (
    producto_id   NUMBER(10) PRIMARY KEY,
    nombre        VARCHAR2(100) NOT NULL,
    precio        NUMBER(10,2) DEFAULT 0,
    stock         NUMBER(6) DEFAULT 0,
    categoria_id  NUMBER(5),
    fecha_creacion DATE DEFAULT SYSDATE,
    activo        CHAR(1) DEFAULT 'S',
    CONSTRAINT pk_productos PRIMARY KEY (producto_id),
    CONSTRAINT fk_prod_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias(categoria_id),
    CONSTRAINT ck_precio_positivo CHECK (precio > 0),
    CONSTRAINT ck_activo_sn CHECK (activo IN ('S', 'N'))
);
```

### ALTER TABLE
```sql
-- Agregar columna
ALTER TABLE productos ADD (descripcion VARCHAR2(500));

-- Modificar columna
ALTER TABLE productos MODIFY (nombre VARCHAR2(150));

-- Agregar constraint
ALTER TABLE productos ADD CONSTRAINT uk_nombre UNIQUE (nombre);

-- Deshabilitar/habilitar constraint
ALTER TABLE productos DISABLE CONSTRAINT ck_precio_positivo;
ALTER TABLE productos ENABLE CONSTRAINT ck_precio_positivo;
```

### DROP TABLE
```sql
DROP TABLE productos;              -- Borra tabla (va a papelera)
DROP TABLE productos CASCADE CONSTRAINTS;  -- Borra tabla y constraints dependientes
DROP TABLE productos PURGE;        -- Borra definitivamente (sin papelera)
```

### TRUNCATE TABLE
```sql
TRUNCATE TABLE productos;  -- Borra todos los datos, no se puede ROLLBACK
```

### RENAME
```sql
RENAME productos TO productos_antiguos;
```

## 2. Restricciones (Constraints)

### PRIMARY KEY
Identifica de forma única cada fila. No permite NULL ni duplicados.
```sql
-- A nivel de columna
producto_id NUMBER PRIMARY KEY

-- A nivel de tabla
CONSTRAINT pk_productos PRIMARY KEY (producto_id)

-- Compuesta
CONSTRAINT pk_venta PRIMARY KEY (venta_id, producto_id)
```

### FOREIGN KEY
Asegura integridad referencial entre tablas.
```sql
CONSTRAINT fk_prod_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias(categoria_id)
    ON DELETE CASCADE      -- Borra productos si se borra la categoría
    -- ON DELETE SET NULL  -- Pone categoria_id en NULL
    -- ON DELETE RESTRICT  -- No permite borrar categoría si tiene productos (default)
```

### UNIQUE
Garantiza valores únicos (puede tener NULLs).
```sql
CONSTRAINT uk_email UNIQUE (email)
CONSTRAINT uk_nombre_apellido UNIQUE (first_name, last_name)  -- compuesto
```

### CHECK
Valida una condición booleana en cada fila.
```sql
CONSTRAINT ck_salario CHECK (salary > 0)
CONSTRAINT ck_genero CHECK (gender IN ('M', 'F'))
CONSTRAINT ck_fecha CHECK (end_date IS NULL OR end_date > start_date)
```

### NOT NULL
No permite valores NULL.
```sql
nombre VARCHAR2(100) NOT NULL
-- Equivalente a: CONSTRAINT nn_nombre CHECK (nombre IS NOT NULL)
```

## 3. Tipos de Relaciones

### Relación 1:1
Un registro de A se relaciona con exactamente un registro de B, y viceversa.
```sql
-- Ejemplo: cada empleado tiene un usuario de sistema
CREATE TABLE usuarios (
    usuario_id NUMBER PRIMARY KEY,
    employee_id NUMBER UNIQUE NOT NULL,
    username VARCHAR2(30) UNIQUE,
    CONSTRAINT fk_usuario_emp FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id)
);
```

### Relación 1:N (la más común)
Un registro de A se relaciona con muchos registros de B.
```sql
-- Ejemplo: un departamento tiene muchos empleados
-- La FK va en la tabla del lado "N" (employees)
ALTER TABLE employees ADD CONSTRAINT fk_dept
    FOREIGN KEY (department_id) REFERENCES departments(department_id);
```

### Relación N:M
Varios registros de A se relacionan con varios registros de B. Requiere **tabla intermedia**.
```sql
-- Ejemplo: estudiantes y cursos
CREATE TABLE estudiantes (
    estudiante_id NUMBER PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL
);

CREATE TABLE cursos (
    curso_id NUMBER PRIMARY KEY,
    titulo VARCHAR2(100) NOT NULL
);

-- Tabla intermedia para N:M
CREATE TABLE inscripciones (
    estudiante_id NUMBER NOT NULL,
    curso_id NUMBER NOT NULL,
    fecha_inscripcion DATE DEFAULT SYSDATE,
    nota NUMBER(2,1),
    CONSTRAINT pk_inscripcion PRIMARY KEY (estudiante_id, curso_id),
    CONSTRAINT fk_inscripcion_est FOREIGN KEY (estudiante_id)
        REFERENCES estudiantes(estudiante_id),
    CONSTRAINT fk_inscripcion_cur FOREIGN KEY (curso_id)
        REFERENCES cursos(curso_id)
);
```

### Self-Referencing (Auto-referencia)
Una tabla se relaciona consigo misma.
```sql
-- Manager de empleados (ejemplo del esquema HR)
ALTER TABLE employees ADD CONSTRAINT fk_manager
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id);
```

## 4. DML (Data Manipulation Language)

### INSERT

```sql
-- Simple
INSERT INTO categorias (categoria_id, nombre) VALUES (1, 'Electrónica');

-- Múltiples filas con INSERT ALL
INSERT ALL
  INTO productos VALUES (1, 'Laptop', 1500.00, 10, 1)
  INTO productos VALUES (2, 'Mouse', 25.50, 100, 1)
  INTO productos VALUES (3, 'Teclado', 75.00, 50, 1)
SELECT * FROM dual;

-- Con subconsulta
INSERT INTO empleados_backup
SELECT * FROM employees WHERE department_id = 60;
```

### UPDATE

```sql
-- Simple
UPDATE productos SET precio = precio * 1.10 WHERE categoria_id = 1;

-- Con subconsulta
UPDATE productos p
SET p.precio = (SELECT AVG(precio) FROM productos WHERE categoria_id = p.categoria_id)
WHERE p.stock = 0;

-- Con subconsulta correlacionada
UPDATE productos p
SET p.stock = p.stock - (
    SELECT SUM(v.cantidad)
    FROM ventas v
    WHERE v.producto_id = p.producto_id
      AND v.fecha > SYSDATE - 30
);
```

### DELETE

```sql
-- Simple
DELETE FROM productos WHERE stock = 0 AND fecha_creacion < ADD_MONTHS(SYSDATE, -12);

-- Con subconsulta
DELETE FROM productos
WHERE categoria_id IN (
    SELECT categoria_id FROM categorias WHERE activo = 'N'
);
```

### MERGE (UPSERT: UPDATE + INSERT)

```sql
MERGE INTO productos p
USING (SELECT * FROM productos_staging) s
ON (p.producto_id = s.producto_id)
WHEN MATCHED THEN
    UPDATE SET p.nombre = s.nombre,
               p.precio = s.precio,
               p.stock = s.stock
WHEN NOT MATCHED THEN
    INSERT (producto_id, nombre, precio, stock, categoria_id)
    VALUES (s.producto_id, s.nombre, s.precio, s.stock, s.categoria_id);
```

## 5. Índices

Estructuras que aceleran la recuperación de datos.

### B-Tree (por defecto)
Para columnas con alta cardinalidad (muchos valores distintos). Usado para PK y UK automáticamente.
```sql
CREATE INDEX idx_emp_last_name ON employees(last_name);
CREATE INDEX idx_emp_dept_salary ON employees(department_id, salary);  -- compuesto
```

### Bitmap
Para columnas con **baja cardinalidad** (pocos valores distintos). Típico en data warehouses.
```sql
CREATE BITMAP INDEX idx_emp_gender ON employees(gender);  -- valores: 'M', 'F'
CREATE BITMAP INDEX idx_emp_active ON empleados(activo);  -- valores: 'S', 'N'
```

### Function-Based Index
Para consultas que usan funciones sobre columnas.
```sql
CREATE INDEX idx_emp_upper_last ON employees(UPPER(last_name));
CREATE INDEX idx_emp_anio ON employees(EXTRACT(YEAR FROM hire_date));
```

### Cuándo crear índices
- Columnas usadas frecuentemente en WHERE, JOIN, ORDER BY.
- Columnas con alta selectividad.
- FK para acelerar JOINs.

### Cuándo NO crear índices
- Tablas pequeñas.
- Columnas poco consultadas.
- Columnas con muchos NULLs y consultas WHERE col IS NOT NULL.
- Tablas con muchas inserciones/actualizaciones (índices ralentizan DML).

## 6. Secuencias

Generan números secuenciales únicos, típicamente para claves primarias.

```sql
-- Crear secuencia
CREATE SEQUENCE seq_productos
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE
    NOCYCLE
    CACHE 20;

-- Obtener siguiente valor (incrementa la secuencia)
SELECT seq_productos.NEXTVAL FROM dual;

-- Obtener valor actual (sin incrementar)
SELECT seq_productos.CURRVAL FROM dual;

-- Usar en INSERT
INSERT INTO productos (producto_id, nombre, precio)
VALUES (seq_productos.NEXTVAL, 'Monitor', 350.00);

-- Oracle 12c+: DEFAULT con secuencia
CREATE TABLE productos (
    producto_id NUMBER DEFAULT seq_productos.NEXTVAL PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL
);

-- INSERT sin especificar ID
INSERT INTO productos (nombre, precio) VALUES ('Monitor', 350.00);
```

### Propiedades de secuencias
- **NEXTVAL** nunca retrocede (incluso con ROLLBACK). Los números perdidos no se reutilizan.
- **CURRVAL** solo funciona después de haber llamado NEXTVAL en la misma sesión.
- **CACHE** guarda valores en memoria para mejor rendimiento. Si la instancia falla, se pierden los valores cacheados.

## 7. Sinónimos

Alias para objetos de base de datos. Permiten referenciar objetos sin especificar el esquema.

```sql
-- Sinónimo privado (solo visible para el creador)
CREATE SYNONYM emp FOR hr.employees;
SELECT * FROM emp;  -- Equivale a SELECT * FROM hr.employees;

-- Sinónimo público (visible para todos)
CREATE PUBLIC SYNONYM emp_pub FOR hr.employees;

-- Eliminar
DROP SYNONYM emp;
DROP PUBLIC SYNONYM emp_pub;
```

**Usos**: simplificar nombres largos, evitar dependencias de esquema, compatibilidad entre entornos (DEV/TEST/PROD).

## 8. Vistas

Consultas almacenadas como objetos virtuales. No almacenan datos (excepto vistas materializadas).

### Vistas simples
Basadas en una sola tabla, sin funciones de grupo ni DISTINCT.
```sql
CREATE VIEW v_empleados_it AS
SELECT employee_id, first_name, last_name, email, salary
FROM employees
WHERE department_id = 60;
```

### Vistas complejas
Basadas en múltiples tablas, con GROUP BY, funciones, etc.
```sql
CREATE VIEW v_resumen_deptos AS
SELECT d.department_name,
       COUNT(e.employee_id) AS num_empleados,
       ROUND(AVG(e.salary), 2) AS salario_promedio
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
GROUP BY d.department_name;
```

### WITH CHECK OPTION
Restringe INSERT/UPDATE para que las filas cumplan con la condición WHERE de la vista.
```sql
CREATE VIEW v_empleados_ventas AS
SELECT * FROM employees
WHERE department_id = 80
WITH CHECK OPTION;  -- No permite insertar empleados en otro departamento
```

### WITH READ ONLY
Vista de solo lectura. No permite INSERT, UPDATE ni DELETE.
```sql
CREATE VIEW v_salarios AS
SELECT last_name, salary FROM employees
WITH READ ONLY;
```

### Vistas materializadas (concepto)
Almacenan físicamente los datos de la consulta. Se refrescan periódicamente. Mejoran rendimiento en consultas complejas y repetitivas.
```sql
CREATE MATERIALIZED VIEW mv_ventas_mensuales
REFRESH COMPLETE ON DEMAND
AS
SELECT producto_id, SUM(cantidad) AS total_vendido
FROM ventas
GROUP BY producto_id;
```

## 9. Joins

### INNER JOIN
Devuelve filas que coinciden en ambas tablas.
```sql
SELECT e.last_name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;
```

### LEFT / RIGHT OUTER JOIN
Devuelve todas las filas de la tabla izquierda/derecha y las coincidencias de la otra.
```sql
-- Todos los empleados, aunque no tengan departamento
SELECT e.last_name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;

-- Todos los departamentos, aunque no tengan empleados
SELECT e.last_name, d.department_name
FROM employees e
RIGHT JOIN departments d ON e.department_id = d.department_id;
```

### FULL OUTER JOIN
Devuelve todas las filas de ambas tablas, con NULL donde no haya coincidencia.
```sql
SELECT e.last_name, d.department_name
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.department_id;
```

### CROSS JOIN
Producto cartesiano: cada fila de A con cada fila de B.
```sql
SELECT e.last_name, d.department_name
FROM employees e
CROSS JOIN departments d;  -- 107 empleados - 27 departamentos = 2889 filas
```

### SELF JOIN
Una tabla se une consigo misma.
```sql
SELECT e.last_name AS empleado,
       m.last_name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id;
```

### Sintaxis ANSI vs Oracle (+)
```sql
-- ANSI (recomendada)
SELECT e.last_name, d.department_name
FROM employees e LEFT JOIN departments d
    ON e.department_id = d.department_id;

-- Oracle legacy con (+)
SELECT e.last_name, d.department_name
FROM employees e, departments d
WHERE e.department_id = d.department_id(+);
-- El (+) va del lado que puede tener NULLs (tabla deficitaria)
```

## 10. Subconsultas

### Escalares (single-row)
```sql
SELECT last_name, salary,
       salary - (SELECT AVG(salary) FROM employees) AS diferencia
FROM employees;
```

### Inline Views (subconsulta en FROM)
```sql
SELECT dept_id, salario_promedio
FROM (SELECT department_id AS dept_id, AVG(salary) AS salario_promedio
      FROM employees GROUP BY department_id)
WHERE salario_promedio > 5000;
```

### Correlacionadas
La subconsulta hace referencia a la consulta externa.
```sql
SELECT e.last_name, e.salary, e.department_id
FROM employees e
WHERE e.salary > (SELECT AVG(salary)
                  FROM employees
                  WHERE department_id = e.department_id);
```

### EXISTS vs IN
```sql
-- EXISTS: verifica si la subconsulta devuelve al menos 1 fila
SELECT * FROM departments d
WHERE EXISTS (
    SELECT 1 FROM employees e
    WHERE e.department_id = d.department_id AND salary > 10000
);

-- IN: compara con una lista de valores
SELECT * FROM departments
WHERE department_id IN (
    SELECT DISTINCT department_id FROM employees
);
```

**Diferencias**:
- `EXISTS` es más eficiente con conjuntos grandes y cuando la subconsulta puede usar índices.
- `IN` maneja NULLs de forma diferente: si la subconsulta contiene NULL, `NOT IN` devuelve falso (cuidado).
- `EXISTS` puede usar JOIN correlacionado, `IN` no.
- Para subconsultas que devuelven un conjunto pequeño y fijo, `IN` es más legible.

## 11. Operadores de Conjuntos

| Operador | Descripción |
|----------|-------------|
| **UNION** | Todas las filas de ambas consultas, sin duplicados |
| **UNION ALL** | Todas las filas de ambas consultas, con duplicados |
| **INTERSECT** | Filas que aparecen en AMBAS consultas |
| **MINUS** | Filas de la primera consulta que NO están en la segunda |

```sql
-- Empleados que son managers o tienen salario > 10000
SELECT employee_id, last_name FROM employees WHERE employee_id IN (SELECT manager_id FROM employees)
UNION
SELECT employee_id, last_name FROM employees WHERE salary > 10000;

-- Empleados que son managers Y tienen salario > 10000
SELECT employee_id, last_name FROM employees WHERE employee_id IN (SELECT manager_id FROM employees)
INTERSECT
SELECT employee_id, last_name FROM employees WHERE salary > 10000;

-- Managers que ganan MENOS de 10000
SELECT employee_id, last_name FROM employees WHERE employee_id IN (SELECT manager_id FROM employees)
MINUS
SELECT employee_id, last_name FROM employees WHERE salary >= 10000;
```

## 12. MODELADO: Diseño Físico

El diseño físico es la implementación concreta del modelo lógico. Decisiones clave:

### Elección de tipos de datos
- `VARCHAR2(100)` vs `VARCHAR2(500)` — dimensionar correctamente.
- `NUMBER(10,2)` para precios, `NUMBER(5)` para cantidades.
- `DATE` para fechas (con hora) vs `DATE` con TRUNC para solo fecha.
- ¿VARCHAR2 o CLOB para descripciones? CLOB si > 4000 caracteres.

### Constraints para integridad
- PK en todas las tablas (obligatorio).
- FK con ON DELETE CASCADE vs SET NULL según negocio.
- CHECK para reglas de negocio simples (precio > 0, stock >= 0).
- UNIQUE en columnas naturalmente únicas (email, código de producto).

### Índices para performance
- Índices automáticos en PK y UK (B-Tree).
- Crear índices adicionales en FK para acelerar JOINs.
- Function-based indexes para consultas con UPPER, TRUNC, etc.
- Bitmap indexes en columnas de baja cardinalidad para data warehouses.

### Caso práctico: Modelo de —rdenes de Compra
```sql
-- Tabla Clientes
CREATE TABLE clientes (
    cliente_id   NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre       VARCHAR2(100) NOT NULL,
    email        VARCHAR2(100) UNIQUE,
    telefono     VARCHAR2(20),
    fecha_registro DATE DEFAULT SYSDATE
);

-- Tabla Productos
CREATE TABLE productos (
    producto_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    codigo      VARCHAR2(20) UNIQUE NOT NULL,
    nombre      VARCHAR2(200) NOT NULL,
    precio      NUMBER(12,2) NOT NULL CHECK (precio > 0),
    stock       NUMBER(6) DEFAULT 0 CHECK (stock >= 0)
);

-- Tabla —rdenes (cabecera)
CREATE TABLE ordenes (
    orden_id    NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    cliente_id  NUMBER NOT NULL,
    fecha       DATE DEFAULT SYSDATE,
    estado      VARCHAR2(20) DEFAULT 'PENDIENTE',
    total       NUMBER(12,2) DEFAULT 0,
    CONSTRAINT fk_orden_cliente FOREIGN KEY (cliente_id)
        REFERENCES clientes(cliente_id) ON DELETE CASCADE,
    CONSTRAINT ck_estado CHECK (estado IN ('PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'))
);

-- Tabla Detalle de —rdenes (N:M entre órdenes y productos)
CREATE TABLE detalle_orden (
    orden_id    NUMBER NOT NULL,
    producto_id NUMBER NOT NULL,
    cantidad    NUMBER(5) NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMBER(12,2) NOT NULL,
    CONSTRAINT pk_detalle_orden PRIMARY KEY (orden_id, producto_id),
    CONSTRAINT fk_detalle_orden FOREIGN KEY (orden_id)
        REFERENCES ordenes(orden_id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id)
        REFERENCES productos(producto_id)
);

-- Índices adicionales
CREATE INDEX idx_ordenes_cliente ON ordenes(cliente_id);
CREATE INDEX idx_ordenes_fecha ON ordenes(fecha);
CREATE INDEX idx_detalle_producto ON detalle_orden(producto_id);
```
