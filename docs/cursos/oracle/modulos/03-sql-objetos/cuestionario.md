---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

## P3: ¿Cuándo usar un índice Bitmap vs B-Tree?

**R**:

| Factor | B-Tree | Bitmap |
|--------|--------|--------|
| Cardinalidad | Alta (muchos valores distintos) | Baja (pocos valores distintos) |
| Ejemplo típico | PK, email, apellido | género, estado, flag activo |
| Rendimiento INSERT/UPDATE | Bueno | Malo (bloqueos a nivel bitmap) |
| Ambientes | OLTP (transaccional) | Data warehouse (carga masiva, pocas actualizaciones) |
| Combinación | Se pueden combinar en un mismo plan de ejecución | Muy eficientes combinados con AND/OR entre bitmaps |

```sql
-- B-Tree: email es altamente selectivo
CREATE INDEX idx_email ON clientes(email);

-- Bitmap: estado solo tiene valores 'ACTIVO', 'INACTIVO', 'SUSPENDIDO'
CREATE BITMAP INDEX idx_estado ON clientes(estado);
```

**Regla práctica**: Bitmap solo para columnas con baja cardinalidad (< 100 valores distintos) en tablas con poca actividad DML concurrente.

---

## P4: ¿Para qué sirve una secuencia? ¿Qué pasa si se hace ROLLBACK después de usar NEXTVAL?

**R**: Una **secuencia** genera números secuenciales únicos de forma eficiente, usados típicamente como claves primarias o identificadores únicos.

**Características importantes**:
- `NEXTVAL` **NUNCA** retrocede, incluso si se hace ROLLBACK de la transacción que lo usó.
- Los números "perdidos" por ROLLBACK no se reutilizan. Esto es intencional para garantizar unicidad sin locks.
- `CURRVAL` solo retorna el valor generado en la sesión actual; cada sesión tiene su propio currval.
- Con `CACHE`, si la instancia falla, se pierden los valores en el caché no usados.

```sql
CREATE SEQUENCE seq_orden START WITH 1 INCREMENT BY 1;

SELECT seq_orden.NEXTVAL FROM dual;  -- 1
INSERT INTO ordenes (orden_id, ...) VALUES (seq_orden.NEXTVAL, ...);  -- 2
ROLLBACK;  -- El valor 2 se pierde. El próximo NEXTVAL será 3.

SELECT seq_orden.NEXTVAL FROM dual;  -- 3 (el 2 no se reutiliza)
```

**Ventaja**: Permite inserts concurrentes sin bloqueos (cada sesión obtiene su propio número sin esperar a otras).

---

## P5: ¿Diferencia entre sinónimo público y privado?

**R**:

| Sinónimo | Visibilidad | Quién lo crea | Cuándo usarlo |
|----------|-------------|---------------|---------------|
| **Privado** | Solo el usuario que lo creó | Cualquier usuario (sobre objetos con permisos) | Simplificar nombres dentro de un esquema |
| **Público** | Todos los usuarios de la base de datos | Solo usuarios con privilegio CREATE PUBLIC SYNONYM (DBA) | Objetos de uso general compartidos |

```sql
-- Sinónimo privado: solo el creador puede usar "emp"
CREATE SYNONYM emp FOR hr.employees;
SELECT * FROM emp;  -- Válido para el creador

-- Sinónimo público: TODOS los usuarios pueden usar "emp_pub"
CREATE PUBLIC SYNONYM emp_pub FOR hr.employees;
SELECT * FROM emp_pub;  -- Válido para cualquier usuario con permiso sobre hr.employees
```

**Precaución**: Si existe un sinónimo privado y uno público con el mismo nombre, Oracle usa primero el privado (resolución de nombres: esquema local → sinónimo privado → sinónimo público).

---

## P6: ¿Qué es WITH CHECK OPTION en una vista?

**R**: `WITH CHECK OPTION` restringe las operaciones INSERT y UPDATE a través de una vista, asegurando que las filas modificadas sigan cumpliendo la condición WHERE de la vista.

```sql
-- Vista de empleados del departamento 80 (Ventas)
CREATE VIEW v_empleados_ventas AS
SELECT * FROM employees
WHERE department_id = 80
WITH CHECK OPTION;

-- Esto FALLARÁ: el departamento 90 no cumple el WHERE
INSERT INTO v_empleados_ventas (employee_id, last_name, email, hire_date, job_id, department_id)
VALUES (999, 'Perez', 'PEREZ', SYSDATE, 'SA_REP', 90);
-- ERROR: view WITH CHECK OPTION where-clause violation

-- Esto FUNCIONA: el departamento 80 sí cumple
INSERT INTO v_empleados_ventas (employee_id, last_name, email, hire_date, job_id, department_id)
VALUES (999, 'Perez', 'PEREZ', SYSDATE, 'SA_REP', 80);
```

**Caso de uso**: Evitar que usuarios inserten o actualicen datos que luego "desaparecerían" de la vista (porque no cumplen el WHERE y no se verían más).

---

## P7: ¿Diferencia entre EXISTS e IN en subconsultas?

**R**:

| Aspecto | EXISTS | IN |
|---------|--------|----|
| ¿Qué verifica? | Si la subconsulta devuelve AL MENOS 1 fila | Si un valor está en una lista |
| Manejo de NULL | No le afectan los NULL en la subconsulta | `NOT IN` con NULL devuelve resultado vacío |
| Rendimiento | Generalmente mejor con subconsultas correlacionadas y conjuntos grandes | Mejor con listas pequeñas y fijas |
| Optimización | Cortocircuito: deja de buscar al encontrar la primera coincidencia | Evalúa toda la lista |

```sql
-- EXISTS: busca departamentos que tengan al menos un empleado con salario > 10000
SELECT department_name FROM departments d
WHERE EXISTS (
    SELECT 1 FROM employees e
    WHERE e.department_id = d.department_id AND e.salary > 10000
);

-- IN: busca empleados en departamentos específicos
SELECT last_name FROM employees
WHERE department_id IN (60, 90, 100);

-- PELIGRO con NOT IN + NULL:
-- Si la subconsulta contiene NULL, NOT IN devuelve 0 filas
SELECT * FROM employees
WHERE department_id NOT IN (SELECT department_id FROM departments WHERE location_id = 999);
-- Si la subconsulta devuelve un NULL, todo el NOT IN falla
```

**Regla práctica**: Preferir `EXISTS` para subconsultas correlacionadas grandes; `IN` para listas pequeñas y concretas. Siempre evitar `NOT IN` si puede haber NULLs (usar `NOT EXISTS` en su lugar).

---

## P8: ¿Cómo funciona una subconsulta correlacionada?

**R**: Una subconsulta **correlacionada** hace referencia a una columna de la consulta externa. Se evalúa **una vez por cada fila** de la consulta externa (no una única vez como las subconsultas no correlacionadas).

```sql
-- "Empleados que ganan más que el promedio de SU departamento"
SELECT e.employee_id, e.last_name, e.salary, e.department_id
FROM employees e
WHERE e.salary > (SELECT AVG(salary)
                  FROM employees e2
                  WHERE e2.department_id = e.department_id);  -- correlación: e.department_id
```

**Orden de evaluación**:
1. Oracle toma la primera fila de `employees e` (ej. employee_id=100, department_id=90).
2. Ejecuta la subconsulta con `e.department_id = 90`: `SELECT AVG(salary) FROM employees WHERE department_id = 90` → devuelve 19333.
3. Compara: `24000 > 19333` → TRUE, incluye la fila.
4. Pasa a la siguiente fila y repite.

**Otro ejemplo**: `UPDATE` correlacionado.
```sql
UPDATE productos p
SET p.stock = (SELECT SUM(v.cantidad) FROM ventas v WHERE v.producto_id = p.producto_id)
WHERE EXISTS (SELECT 1 FROM ventas v WHERE v.producto_id = p.producto_id);
```

**Performance**: Puede ser costosa porque ejecuta N subconsultas para N filas. Evaluar si se puede reescribir con JOIN o funciones analíticas (AVG OVER PARTITION BY).

---

## P9: ¿Qué operador de conjunto devuelve solo las filas que están en AMBAS consultas?

**R**: El operador **INTERSECT** devuelve las filas que aparecen en AMBAS consultas (intersección de conjuntos), eliminando duplicados.

```sql
-- Empleados que son managers Y tienen salario > 10000
SELECT employee_id, last_name FROM employees
WHERE employee_id IN (SELECT DISTINCT manager_id FROM employees WHERE manager_id IS NOT NULL)
INTERSECT
SELECT employee_id, last_name FROM employees WHERE salary > 10000;
```

**Resumen de operadores de conjuntos**:

| Operador | Devuelve | Duplicados |
|----------|----------|------------|
| UNION | Filas de A + filas de B | Elimina |
| UNION ALL | Filas de A + filas de B | Conserva |
| INTERSECT | Filas presentes en A Y B | Elimina |
| MINUS | Filas en A que NO están en B | Elimina |

**Restricciones**:
- Mismo número de columnas en ambas consultas.
- Tipos de datos compatibles en columnas correspondientes.
- ORDER BY solo al final de toda la expresión.

---

## P10: ¿Cómo modelarías una relación N:M entre ESTUDIANTES y CURSOS?

**R**: Una relación N:M (muchos a muchos) requiere una **tabla intermedia** (también llamada tabla de asociación, puente o junction table) que contenga las claves foráneas de ambas tablas como clave primaria compuesta.

```sql
-- Tabla ESTUDIANTES
CREATE TABLE estudiantes (
    estudiante_id   NUMBER PRIMARY KEY,
    nombre          VARCHAR2(100) NOT NULL,
    fecha_nacimiento DATE,
    email           VARCHAR2(100) UNIQUE
);

-- Tabla CURSOS
CREATE TABLE cursos (
    curso_id    NUMBER PRIMARY KEY,
    titulo      VARCHAR2(100) NOT NULL,
    creditos    NUMBER(2) CHECK (creditos > 0),
    profesor    VARCHAR2(100)
);

-- Tabla intermedia INSCRIPCIONES (N:M)
CREATE TABLE inscripciones (
    estudiante_id      NUMBER NOT NULL,
    curso_id           NUMBER NOT NULL,
    fecha_inscripcion  DATE DEFAULT SYSDATE,
    nota_final         NUMBER(3,1),
    estado             VARCHAR2(20) DEFAULT 'CURSANDO',
    CONSTRAINT pk_inscripcion PRIMARY KEY (estudiante_id, curso_id),
    CONSTRAINT fk_inscripcion_est FOREIGN KEY (estudiante_id)
        REFERENCES estudiantes(estudiante_id) ON DELETE CASCADE,
    CONSTRAINT fk_inscripcion_cur FOREIGN KEY (curso_id)
        REFERENCES cursos(curso_id) ON DELETE CASCADE,
    CONSTRAINT ck_estado_inscripcion CHECK (estado IN ('CURSANDO', 'APROBADO', 'REPROBADO', 'ABANDONO')),
    CONSTRAINT ck_nota_valida CHECK (nota_final IS NULL OR (nota_final >= 1.0 AND nota_final <= 7.0))
);

-- Índices para consultas frecuentes
CREATE INDEX idx_inscripcion_curso ON inscripciones(curso_id);
CREATE INDEX idx_inscripcion_estado ON inscripciones(estado);
```

**Consultas típicas**:
```sql
-- Todos los cursos de un estudiante
SELECT c.titulo, i.estado, i.nota_final
FROM inscripciones i
JOIN cursos c ON i.curso_id = c.curso_id
WHERE i.estudiante_id = 123;

-- Todos los estudiantes de un curso
SELECT e.nombre, i.nota_final
FROM inscripciones i
JOIN estudiantes e ON i.estudiante_id = e.estudiante_id
WHERE i.curso_id = 456
ORDER BY e.nombre;

-- Estudiantes inscritos en más de 3 cursos
SELECT e.nombre, COUNT(i.curso_id) AS num_cursos
FROM estudiantes e
JOIN inscripciones i ON e.estudiante_id = i.estudiante_id
GROUP BY e.estudiante_id, e.nombre
HAVING COUNT(i.curso_id) > 3;
```

**Puntos clave del diseño**:
- La PK compuesta `(estudiante_id, curso_id)` garantiza que un estudiante no se inscriba dos veces al mismo curso.
- Las FK con ON DELETE CASCADE aseguran que al eliminar un estudiante o curso, se limpien sus inscripciones.
- CHECK constraints validan reglas de negocio a nivel de base de datos.
- La tabla intermedia puede contener atributos propios de la relación (fecha, nota, estado).

