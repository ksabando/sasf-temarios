---
sidebar_label: "Clase"
---

## Sintaxis ANSI vs Oracle Legacy

### Sintaxis ANSI (recomendada desde Oracle 9i)

Introducida en el estándar SQL-92, adoptada por Oracle en la versión 9i. Es la sintaxis recomendada para todo código nuevo.

```sql
SELECT e.first_name, d.department_name
FROM employees e
JOIN departments d ON e.department_id = d.department_id;
```

**Ventajas:**
- Usa las palabras clave `JOIN ... ON`
- Separa claramente la condición de JOIN del filtro WHERE
- Soporta OUTER JOINs de forma nativa (`LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN`)
- Más legible y portable entre bases de datos
- El optimizador puede trabajar mejor con esta sintaxis

### Sintaxis Oracle Legacy (+)

El operador `(+)` indica el lado opcional en un outer join. Se coloca del lado de la tabla que puede tener valores nulos.

```sql
-- LEFT JOIN en sintaxis legacy
SELECT e.first_name, d.department_name
FROM employees e, departments d
WHERE e.department_id = d.department_id(+);
```

**Desventajas:**
- Está obsoleta (Oracle recomienda ANSI desde 9i)
- No soporta FULL OUTER JOIN
- Es menos legible
- Tiene restricciones: no se puede mezclar con ANSI en la misma consulta
- Aparece en código legacy que puede necesitar mantenimiento

---

## Tipos de JOIN — Completo

### 1. INNER JOIN

Devuelve solo las filas que tienen coincidencia en AMBAS tablas. Es el tipo de JOIN más común y el predeterminado cuando se usa solo `JOIN`.

```sql
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;
```

**Características:**
- `INNER JOIN` y `JOIN` son equivalentes (INNER es opcional)
- Solo devuelve filas donde existe el valor en ambas tablas
- Los empleados sin departamento (department_id IS NULL) NO aparecen
- Los departamentos sin empleados NO aparecen
- En Oracle legacy: `WHERE a.col = b.col`

**Caso de uso típico:** "Empleados que SÍ tienen departamento asignado"

**Resultado esperado con HR:**
- 106 empleados tienen departamento (de 107 totales, 1 sin depto)
- 11 departamentos aparecen (de 27, porque 16 no tienen empleados)

### 2. LEFT OUTER JOIN

Devuelve TODAS las filas de la tabla izquierda más las coincidencias de la tabla derecha. Donde no hay coincidencia, coloca valores NULL.

```sql
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;
```

**Características:**
- La tabla izquierda es la que aparece antes de `LEFT JOIN`
- Todas las filas de la izquierda se incluyen, tengan o no match
- Las columnas de la tabla derecha tendrán NULL cuando no haya coincidencia
- `LEFT JOIN` = `LEFT OUTER JOIN` (OUTER es opcional)

**Caso de uso típico:** "Mostrar TODOS los empleados, incluso los que no tienen departamento asignado"

**Resultado esperado con HR:**
- 107 filas (todos los empleados)
- 1 empleado aparece con department_name = NULL (Kimberly Grant no tiene departamento)

### 3. RIGHT OUTER JOIN

Devuelve TODAS las filas de la tabla derecha más las coincidencias de la tabla izquierda.

```sql
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
RIGHT JOIN departments d ON e.department_id = d.department_id;
```

**Características:**
- La tabla derecha es la que aparece después de `RIGHT JOIN`
- Todas las filas de la derecha se incluyen
- Es equivalente a invertir el orden de las tablas en un LEFT JOIN
- Por convención, la comunidad prefiere LEFT JOIN (se lee de izquierda a derecha)

**Caso de uso típico:** "Mostrar TODOS los departamentos, incluso los que no tienen empleados"

**Resultado esperado con HR:**
- 27 filas (todos los departamentos)
- 16 departamentos aparecen con employee_name = NULL

### 4. FULL OUTER JOIN

Devuelve TODAS las filas de AMBAS tablas. Las filas sin coincidencia en la otra tabla aparecen con NULLs en las columnas correspondientes.

```sql
SELECT e.first_name, d.department_name
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.department_id;
```

**Características:**
- Combina el efecto de LEFT JOIN y RIGHT JOIN
- Muestra empleados sin departamento Y departamentos sin empleados
- Oracle no soportaba FULL OUTER JOIN nativamente antes de 9i (se simulaba con UNION)
- Menos común que INNER y LEFT JOIN

**Caso de uso típico:** "Auditoría: encontrar registros huérfanos en ambas direcciones (empleados sin depto y deptos sin empleados)"

**Resultado esperado con HR:**
- 123 filas (106 empleados con depto + 1 sin depto + 16 deptos sin empleados)

### 5. CROSS JOIN

Producto cartesiano: cada fila de la tabla A se combina con cada fila de la tabla B. No requiere condición ON.

```sql
SELECT e.first_name, d.department_name
FROM employees e
CROSS JOIN departments d;
```

**Características:**
- Si A tiene N filas y B tiene M filas, el resultado tiene N - M filas
- Con HR: 107 empleados - 27 departamentos = 2889 filas
- Revisartil para generar combinaciones: "todos los empleados con todos los departamentos posibles"
- También útil para generar series numéricas o calendarios
- PELIGRO: sin WHERE, puede generar millones de filas con tablas grandes

**Caso de uso típico:** "Generar todas las combinaciones posibles de productos y colores"

### 6. SELF JOIN

Una tabla se une consigo misma. Requiere usar alias diferentes para distinguir los dos roles de la tabla.

```sql
SELECT e.first_name AS empleado,
       m.first_name AS jefe
FROM employees e
JOIN employees m ON e.manager_id = m.employee_id;
```

**Características:**
- Es conceptualmente un INNER JOIN, pero ambas referencias apuntan a la misma tabla física
- Requiere alias para evitar ambigüedad
- Revisartil para relaciones jerárquicas dentro de una misma tabla
- Se puede combinar con LEFT JOIN para incluir empleados sin jefe

**Caso de uso típico:** "Mostrar cada empleado con el nombre de su jefe"

**Resultado esperado con HR:**
- 106 filas con INNER JOIN (todos tienen jefe excepto el presidente Steven King, que tiene manager_id NULL)

### 7. NATURAL JOIN

Oracle automáticamente une por todas las columnas que tengan el mismo nombre en ambas tablas. No se especifica ON.

```sql
SELECT first_name, department_name
FROM employees
NATURAL JOIN departments;
```

**Características:**
- Busca columnas con el mismo nombre y las usa como condición de igualdad
- La columna de JOIN aparece una sola vez en el resultado (sin calificar)
- NO se debe calificar con alias (no usar `e.department_id`)
- FRÁGIL: si alguien agrega una columna con el mismo nombre en ambas tablas, el JOIN cambia inesperadamente

**Por qué se desaconseja:**
- Si ambas tablas tienen `created_date`, el JOIN incluirá esa columna sin intención
- El código no documenta explícitamente la relación
- Rompe si el esquema cambia

### 8. JOIN con USING

Une por columna(s) específica(s) que tienen el mismo nombre en ambas tablas. Es un punto intermedio entre ON y NATURAL JOIN.

```sql
SELECT first_name, department_name
FROM employees
JOIN departments USING (department_id);
```

**Características:**
- La columna listada en USING debe existir con el mismo nombre en ambas tablas
- La columna de JOIN aparece UNA sola vez en el resultado
- NO se califica con alias (no se usa `e.department_id` ni `d.department_id`)
- Se pueden listar múltiples columnas: `USING (col1, col2)`

**Diferencia con ON:**
```sql
-- Con ON: department_id aparece DOS veces (e.department_id, d.department_id)
SELECT e.*, d.*
FROM employees e JOIN departments d ON e.department_id = d.department_id;

-- Con USING: department_id aparece UNA vez
SELECT *
FROM employees JOIN departments USING (department_id);
```

---

## Tabla comparativa de tipos de JOIN

| Tipo de JOIN | Filas de A sin match en B | Filas de B sin match en A | Coincidencias | Número de filas |
|---|---|---|---|---|
| INNER JOIN | NO aparecen | NO aparecen | Sí, completas | ? min(filas A, filas B) |
| LEFT JOIN | SÍ aparecen (columnas B = NULL) | NO aparecen | Sí | = filas de A |
| RIGHT JOIN | NO aparecen | SÍ aparecen (columnas A = NULL) | Sí | = filas de B |
| FULL OUTER JOIN | SÍ aparecen (columnas B = NULL) | SÍ aparecen (columnas A = NULL) | Sí | = A sin match + B sin match + coincidencias |
| CROSS JOIN | N/A (producto cartesiano) | N/A (producto cartesiano) | Todas las combinaciones | = filas A - filas B |
| SELF JOIN | Depende del tipo (INNER, LEFT, etc.) | Igual que A (es la misma tabla) | Sí | Depende del tipo de JOIN aplicado |

---

## Condiciones en JOIN: ON vs WHERE — Diferencia Crítica

Esta es una de las confusiones más comunes y peligrosas en SQL.

### ON
- Define C—MO se relacionan las tablas (la condición del JOIN)
- Se evalúa ANTES de que el JOIN produzca su resultado
- En un OUTER JOIN, si la condición ON no se cumple, se genera una fila con NULLs (no se descarta)

### WHERE
- Filtra el RESULTADO después de que los JOINs se completan
- Se evalúa DESPU?S de todos los JOINs

### En INNER JOIN: es indistinto
```sql
-- Estos dos son equivalentes
SELECT * FROM A JOIN B ON A.id = B.id AND B.status = 'A';
SELECT * FROM A JOIN B ON A.id = B.id WHERE B.status = 'A';
```
El optimizador de Oracle trata ambas formas por igual para INNER JOIN.

### En OUTER JOIN: la diferencia es CRÍTICA
```sql
-- LEFT JOIN correcto: incluye TODOS los empleados
SELECT e.first_name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
                        AND d.location_id = 1700;  -- condicion en ON

-- LEFT JOIN incorrecto: convierte en INNER JOIN
SELECT e.first_name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
WHERE d.location_id = 1700;  -- condicion en WHERE descarta NULLs
```

**Explicación:** En el segundo caso, los empleados sin departamento tienen `d.location_id = NULL`. El WHERE `d.location_id = 1700` evalúa NULL = 1700 → UNKNOWN, y la fila se descarta. El LEFT JOIN se comporta como INNER JOIN.

---

## Múltiples JOINs

Se pueden encadenar múltiples JOINs en una sola consulta. El orden importa: cada JOIN opera sobre el resultado del JOIN anterior.

```sql
SELECT e.first_name, d.department_name, l.city, c.country_name
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN locations l ON d.location_id = l.location_id
JOIN countries c ON l.country_id = c.country_id;
```

**Reglas:**
- Se pueden mezclar diferentes tipos de JOIN en la misma consulta
- Las condiciones pueden referenciar cualquier tabla ya unida
- El orden lógico es de arriba hacia abajo
- El optimizador puede reordenar los JOINs para mejorar el rendimiento

**Ejemplo con mezcla de tipos:**
```sql
SELECT e.first_name, d.department_name, e2.first_name AS manager
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
LEFT JOIN employees e2 ON e.manager_id = e2.employee_id;
```

---

## JOINs con subconsultas, vistas y CTEs

### JOIN con subconsulta (inline view)

```sql
SELECT e.first_name, e.salary, dept_avg.avg_salary
FROM employees e
JOIN (SELECT department_id, AVG(salary) AS avg_salary
      FROM employees
      GROUP BY department_id) dept_avg
  ON e.department_id = dept_avg.department_id;
```

### JOIN con CTE (Common Table Expression)

```sql
WITH dept_avg AS (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
)
SELECT e.first_name, e.salary, dept_avg.avg_salary
FROM employees e
JOIN dept_avg ON e.department_id = dept_avg.department_id;
```

### JOIN con vistas

```sql
-- Asumiendo que existe la vista emp_details_view
SELECT e.first_name, v.job_title
FROM employees e
JOIN emp_details_view v ON e.employee_id = v.employee_id;
```

---

## Rendimiento de JOINs

Los JOINs son operaciones costosas. Oracle utiliza tres algoritmos principales para ejecutarlos:

### NESTED LOOP JOIN
- Recorre cada fila de la tabla externa y busca coincidencias en la tabla interna
- **Cuándo se usa:** pocas filas en la tabla externa + índice en la columna de JOIN de la tabla interna
- **Costo:** O(N - log M) con índice, O(N - M) sin índice
- **Ideal para:** consultas que devuelven pocas filas (OLTP)

### HASH JOIN
- Construye una tabla hash en memoria con la tabla más pequeña y la sondea con la otra
- **Cuándo se usa:** muchas filas, sin índice útil, o cuando las tablas son grandes
- **Costo:** O(N + M)
- **Ideal para:** consultas que procesan grandes volúmenes (OLAP, reporting)

### MERGE JOIN
- Ordena ambas tablas por la columna de JOIN y las recorre simultáneamente
- **Cuándo se usa:** ambas tablas ya están ordenadas (índices) o cuando se necesita ordenar de todas formas
- **Costo:** O(N log N + M log M)
- **Ideal para:** datos pre-ordenados

### Buenas prácticas de rendimiento

1. **Crear índices en columnas de JOIN** (especialmente FOREIGN KEYs)
2. **Evitar funciones en las condiciones ON** (impide el uso de índices):
   ```sql
   -- MAL: no usa indice
   ON UPPER(a.name) = UPPER(b.name)
   -- MEJOR: garantizar los datos en el mismo case
   ```
3. **Usar estadísticas actualizadas** (el optimizador necesita información precisa)
4. **Revisar el plan de ejecución** con `EXPLAIN PLAN` o `DBMS_XPLAN`
5. **Preferir ANSI JOIN** (el optimizador lo maneja mejor que la sintaxis legacy)
6. **Evitar CROSS JOIN accidental** (olvidar la condición ON)

---

## Errores comunes

### 1. Olvidar la condición de JOIN → producto cartesiano accidental
```sql
-- PELIGRO: sin ON, esto es CROSS JOIN implicito
SELECT e.first_name, d.department_name
FROM employees e JOIN departments d;  -- 107 x 27 = 2889 filas
```

### 2. Usar INNER JOIN cuando se necesita LEFT JOIN
Si necesitas "todos los empleados, incluso los que no tienen X", INNER JOIN perderá filas.

### 3. Filtrar en WHERE en vez de ON en OUTER JOINs
Como se explicó antes, esto convierte un OUTER JOIN en INNER JOIN.

### 4. Confundir USING con ON en cuanto a calificación
```sql
-- CORRECTO con USING: sin alias
SELECT department_id FROM employees JOIN departments USING (department_id);

-- INCORRECTO con USING: no se debe calificar
SELECT e.department_id FROM employees e JOIN departments d USING (department_id);  -- ERROR
```

### 5. No usar alias en SELF JOIN
```sql
-- ERROR: ambiguedad, Oracle no sabe a cual tabla referirse
SELECT first_name FROM employees JOIN employees ON manager_id = employee_id;

-- CORRECTO: alias que distinguen los roles
SELECT e.first_name FROM employees e JOIN employees m ON e.manager_id = m.employee_id;
```

### 6. JOIN sin índice en tablas grandes
En tablas de millones de filas, un JOIN sin índice puede tomar horas en lugar de segundos.

### 7. Asumir que NATURAL JOIN usa solo las columnas "obvias"
Puede incluir columnas como `created_by`, `updated_date` sin que te des cuenta.

---

## Modelado de tablas y lo que los JOINs revelan

Los JOINs que escribimos frecuentemente revelan la calidad del modelo de datos subyacente:

| Patrón de JOIN | Posible problema de modelo |
|---|---|
| JOIN que requiere 5+ tablas para algo común | Sobre-normalización |
| JOIN que siempre trae NULLs | Relación opcional mal definida o datos huérfanos |
| SELF JOIN recurrente | Falta una tabla de jerarquía separada |
| LEFT JOIN usado en el 90% de las consultas | La relación debería ser obligatoria (NOT NULL) |
| FULL OUTER JOIN para reconciliación | Problema de integridad referencial (falta FK) |
| Muchas columnas repetidas entre tablas | Sub-normalización (deberían estar juntas) |
| JOIN entre tablas sin FK definida | Riesgo de datos inconsistentes |

**Principio:** si cada consulta de negocio requiere 4+ JOINs, considera crear una vista materializada o revisar la normalización.

---

## Ejemplos prácticos con esquema HR

El esquema HR de Oracle contiene estas tablas relevantes:
- **EMPLOYEES**: employee_id, first_name, last_name, salary, department_id, manager_id
- **DEPARTMENTS**: department_id, department_name, manager_id, location_id
- **LOCATIONS**: location_id, city, state_province, country_id
- **COUNTRIES**: country_id, country_name, region_id

### Ejemplo 1: INNER JOIN básico
```sql
-- Empleados con el nombre de su departamento
SELECT e.employee_id, e.first_name || ' ' || e.last_name AS empleado,
       d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id
ORDER BY e.employee_id;
```

### Ejemplo 2: LEFT JOIN para incluir todos los empleados
```sql
-- TODOS los empleados, incluso sin departamento
SELECT e.employee_id, e.first_name || ' ' || e.last_name AS empleado,
       NVL(d.department_name, 'Sin Departamento') AS departamento
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
ORDER BY d.department_name NULLS FIRST;
```

### Ejemplo 3: SELF JOIN para jerarquía
```sql
-- Cada empleado con el nombre de su jefe
SELECT e.employee_id,
       e.first_name || ' ' || e.last_name AS empleado,
       NVL(m.first_name || ' ' || m.last_name, 'Sin Jefe') AS jefe
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id
ORDER BY e.employee_id;
```

### Ejemplo 4: Múltiples JOINs (4 tablas)
```sql
SELECT e.first_name || ' ' || e.last_name AS empleado,
       d.department_name,
       l.city,
       c.country_name
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN locations l ON d.location_id = l.location_id
JOIN countries c ON l.country_id = c.country_id
ORDER BY c.country_name, l.city, e.last_name;
```

### Ejemplo 5: FULL OUTER JOIN (auditoría)
```sql
-- Encontrar huérfanos en ambas direcciones
SELECT e.employee_id, e.first_name, d.department_id, d.department_name,
       CASE
           WHEN e.employee_id IS NULL THEN 'Departamento sin empleados'
           WHEN d.department_id IS NULL THEN 'Empleado sin departamento'
           ELSE 'Asignación correcta'
       END AS estado
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.department_id
WHERE e.employee_id IS NULL OR d.department_id IS NULL
ORDER BY estado;
```

### Ejemplo 6: JOIN con agregación y HAVING
```sql
-- Departamentos con mas de 5 empleados
SELECT d.department_name, COUNT(*) AS total_empleados,
       ROUND(AVG(e.salary)) AS salario_promedio
FROM departments d
JOIN employees e ON d.department_id = e.department_id
GROUP BY d.department_name
HAVING COUNT(*) > 5
ORDER BY total_empleados DESC;
```

### Ejemplo 7: CROSS JOIN para generar series
```sql
-- Combinar cada empleado con cada grado salarial (tabla hipotetica de grados)
SELECT e.first_name, g.grade_level
FROM employees e
CROSS JOIN job_grades g;
```

---

## Resumen ejecutivo

| Concepto | Punto clave |
|---|---|
| INNER JOIN | Solo filas con coincidencia en ambas tablas |
| LEFT JOIN | Todas las filas de la izquierda; NULLs donde no hay match |
| RIGHT JOIN | Todas las filas de la derecha; equivalente a invertir LEFT |
| FULL OUTER JOIN | Todas las filas de ambas; útil para auditoría |
| CROSS JOIN | Producto cartesiano; peligroso sin filtro |
| SELF JOIN | Misma tabla con dos alias; jerarquías |
| ON | Condición de relación entre tablas |
| WHERE | Filtro del resultado final |
| ANSI JOIN | Sintaxis moderna, recomendada |
| Legacy (+) | Obsoleta, solo en código antiguo |
