---
sidebar_label: "Clase"
---

# Módulo 00-SQL-Consultas — SQL en Oracle: Consultas y Manipulación de Datos

## 1. La Sentencia SELECT

SELECT es la instrucción fundamental de SQL para recuperar datos. Su estructura completa es:

```sql
SELECT [DISTINCT] columnas | *
FROM tabla
[JOIN ... ON ...]
[WHERE condiciones_filtro]
[GROUP BY columnas_agrupacion]
[HAVING condiciones_sobre_grupos]
[ORDER BY columnas [ASC|DESC]]
[OFFSET n ROWS FETCH NEXT m ROWS ONLY];  -- Oracle 12c+
```

### Orden de ejecución lógico
1. **FROM**: se identifican las tablas y se ejecutan los JOINs.
2. **WHERE**: se filtran las filas antes de agrupar.
3. **GROUP BY**: se agrupan las filas.
4. **HAVING**: se filtran los grupos.
5. **SELECT**: se proyectan las columnas y se calculan expresiones.
6. **ORDER BY**: se ordena el resultado final.

## 2. Filtrado con WHERE

### Operadores de comparación
| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `=` | Igual | `WHERE department_id = 90` |
| `<>` o `!=` | Distinto | `WHERE job_id <> 'AD_PRES'` |
| `<`, `>`, `<=`, `>=` | Comparación | `WHERE salary >= 10000` |
| `BETWEEN x AND y` | Rango inclusivo | `WHERE salary BETWEEN 5000 AND 10000` |
| `IN (lista)` | Pertenece a lista | `WHERE department_id IN (60, 90, 100)` |
| `LIKE 'patrón'` | Coincidencia de patrón | `WHERE last_name LIKE 'S%'` |
| `IS NULL` | Es nulo | `WHERE commission_pct IS NULL` |
| `IS NOT NULL` | No es nulo | `WHERE manager_id IS NOT NULL` |

### Comodines para LIKE
- `%` : cero o más caracteres.
- `_` : exactamente un carácter.
- Para buscar `%` o `_` literal: `LIKE '10\%' ESCAPE '\'`

### Operadores lógicos
```sql
WHERE salary > 5000 AND job_id = 'IT_PROG'
WHERE department_id = 90 OR department_id = 100
WHERE NOT (salary < 3000)
WHERE department_id IN (60, 90) AND salary > 8000
```

**Precedencia**: NOT > AND > OR. Usar paréntesis para claridad.

## 3. ORDER BY

```sql
-- Ascendente (por defecto)
SELECT last_name, salary FROM employees ORDER BY salary ASC;

-- Descendente
SELECT last_name, hire_date FROM employees ORDER BY hire_date DESC;

-- Múltiples columnas
SELECT department_id, last_name, salary
FROM employees
ORDER BY department_id ASC, salary DESC;

-- Por posición de columna (no recomendado pero posible)
SELECT last_name, salary FROM employees ORDER BY 2 DESC;

-- Por alias
SELECT last_name, salary * 12 AS salario_anual
FROM employees
ORDER BY salario_anual DESC;

-- NULLS FIRST / NULLS LAST
SELECT last_name, commission_pct
FROM employees
ORDER BY commission_pct DESC NULLS LAST;
```

## 4. GROUP BY y Funciones de Agregación

### Funciones de agregación
| Función | Descripción |
|---------|-------------|
| `COUNT(*)` | Cuenta todas las filas |
| `COUNT(columna)` | Cuenta valores no nulos |
| `COUNT(DISTINCT columna)` | Cuenta valores distintos no nulos |
| `SUM(columna)` | Suma de valores |
| `AVG(columna)` | Promedio de valores no nulos |
| `MAX(columna)` | Valor máximo |
| `MIN(columna)` | Valor mínimo |
| `STDDEV(columna)` | Desviación estándar |
| `VARIANCE(columna)` | Varianza |

### GROUP BY
```sql
-- Agrupar por departamento
SELECT department_id,
       COUNT(*) AS num_empleados,
       ROUND(AVG(salary), 2) AS salario_promedio,
       MAX(salary) AS salario_maximo,
       MIN(salary) AS salario_minimo
FROM employees
GROUP BY department_id
ORDER BY department_id;
```

### HAVING
Filtra GRUPOS después del GROUP BY. No se puede usar WHERE para filtrar funciones de agregación.

```sql
SELECT department_id,
       COUNT(*) AS num_empleados,
       AVG(salary) AS salario_promedio
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 3
   AND AVG(salary) > 5000
ORDER BY department_id;
```

**Diferencia clave**: WHERE filtra FILAS antes de agrupar; HAVING filtra GRUPOS después de agrupar.

## 5. Funciones de Cadena (String)

| Función | Descripción | Ejemplo |
|---------|-------------|---------|
| `SUBSTR(cadena, inicio, largo)` | Subcadena | `SUBSTR('Oracle', 1, 3)` → 'Ora' |
| `INSTR(cadena, subcadena)` | Posición de subcadena | `INSTR('Oracle', 'a')` → 3 |
| `CONCAT(s1, s2)` | Concatenar (como \|\|) | `CONCAT('Hola', 'Mundo')` → 'HolaMundo' |
| `UPPER(cadena)` | Mayúsculas | `UPPER('oracle')` → 'ORACLE' |
| `LOWER(cadena)` | Minúsculas | `LOWER('ORACLE')` → 'oracle' |
| `INITCAP(cadena)` | Capitalizar palabras | `INITCAP('john smith')` → 'John Smith' |
| `TRIM(cadena)` | Eliminar espacios extremos | `TRIM('  hola  ')` → 'hola' |
| `LTRIM(cadena)` | Eliminar espacios izquierda | `LTRIM('  hola')` → 'hola' |
| `RTRIM(cadena)` | Eliminar espacios derecha | `RTRIM('hola  ')` → 'hola' |
| `REPLACE(cadena, viejo, nuevo)` | Reemplazar texto | `REPLACE('Oracle SQL', 'SQL', 'DB')` → 'Oracle DB' |
| `LENGTH(cadena)` | Longitud | `LENGTH('Oracle')` → 6 |
| `LPAD(cadena, n, relleno)` | Rellenar izquierda | `LPAD('100', 6, '0')` → '000100' |
| `RPAD(cadena, n, relleno)` | Rellenar derecha | `RPAD('100', 6, ' ')` → '100   ' |
| `REGEXP_REPLACE` | Reemplazo con regex | `REGEXP_REPLACE('abc123', '[0-9]', '')` → 'abc' |
| `REGEXP_SUBSTR` | Extraer con regex | `REGEXP_SUBSTR('user@mail.com', '[^@]+')` → 'user' |

### Operador de concatenación (\|\|)
```sql
SELECT first_name || ' ' || last_name AS nombre_completo
FROM employees;
```

## 6. Funciones Numéricas

| Función | Descripción | Ejemplo |
|---------|-------------|---------|
| `ROUND(n, decimales)` | Redondear | `ROUND(3.1416, 2)` → 3.14 |
| `TRUNC(n, decimales)` | Truncar (sin redondear) | `TRUNC(3.1416, 2)` → 3.14 |
| `MOD(m, n)` | Resto de división | `MOD(10, 3)` → 1 |
| `ABS(n)` | Valor absoluto | `ABS(-15)` → 15 |
| `CEIL(n)` | Entero superior | `CEIL(3.1)` → 4 |
| `FLOOR(n)` | Entero inferior | `FLOOR(3.9)` → 3 |
| `POWER(n, e)` | Potencia | `POWER(2, 3)` → 8 |
| `SQRT(n)` | Raíz cuadrada | `SQRT(25)` → 5 |
| `SIGN(n)` | Signo (-1, 0, 1) | `SIGN(-10)` → -1 |
| `REMAINDER(m, n)` | Resto (distinto de MOD) | `REMAINDER(10, 3)` → 1 |

**Diferencia ROUND vs TRUNC**: ROUND redondea al valor más cercano, TRUNC simplemente corta los decimales.
```sql
SELECT ROUND(3.567, 2) AS redondeado,  -- 3.57
       TRUNC(3.567, 2) AS truncado     -- 3.56
FROM dual;
```

## 7. Funciones de Fecha

| Función | Descripción | Ejemplo |
|---------|-------------|---------|
| `SYSDATE` | Fecha y hora actual del servidor | `SELECT SYSDATE FROM dual;` |
| `CURRENT_DATE` | Fecha y hora actual de la sesión | `SELECT CURRENT_DATE FROM dual;` |
| `SYSTIMESTAMP` | Fecha y hora con zona horaria | `SELECT SYSTIMESTAMP FROM dual;` |
| `ADD_MONTHS(fecha, n)` | Sumar meses | `ADD_MONTHS(hire_date, 6)` |
| `MONTHS_BETWEEN(f1, f2)` | Meses entre fechas | `MONTHS_BETWEEN(SYSDATE, hire_date)` |
| `LAST_DAY(fecha)` | Revisarltimo día del mes | `LAST_DAY(SYSDATE)` |
| `NEXT_DAY(fecha, dia)` | Próximo día de semana | `NEXT_DAY(SYSDATE, 'LUNES')` |
| `EXTRACT(parte FROM fecha)` | Extraer componente | `EXTRACT(YEAR FROM hire_date)` |
| `NUMTODSINTERVAL(n, unidad)` | Número a intervalo | `NUMTODSINTERVAL(30, 'DAY')` |
| `NUMTOYMINTERVAL(n, unidad)` | Número a intervalo año-mes | `NUMTOYMINTERVAL(2, 'YEAR')` |

### Operaciones aritméticas con fechas
```sql
-- Sumar días
SELECT SYSDATE + 7 FROM dual;  -- dentro de 7 días

-- Restar fechas (resultado en días)
SELECT SYSDATE - hire_date AS dias_trabajados FROM employees;

-- Sumar horas (1 día = 24 horas)
SELECT SYSDATE + 1/24 FROM dual;  -- dentro de 1 hora
SELECT SYSDATE + 30/(24*60) FROM dual;  -- dentro de 30 minutos
```

## 8. Funciones de Conversión

### TO_CHAR — Convertir fecha/número a cadena
```sql
-- Fecha a cadena con formato
SELECT TO_CHAR(SYSDATE, 'DD/MM/YYYY') FROM dual;              -- '05/06/2026'
SELECT TO_CHAR(SYSDATE, 'DD "de" MONTH "de" YYYY') FROM dual;  -- '05 de JUNIO de 2026'
SELECT TO_CHAR(SYSDATE, 'fmDay, DD "de" Month YYYY') FROM dual; -- 'Viernes, 05 de Junio 2026'

-- Número a cadena con formato
SELECT TO_CHAR(15000, '$99,999.00') FROM dual;  -- ' $15,000.00'
SELECT TO_CHAR(15000, 'L99G999D00') FROM dual;   -- según NLS, ej. '$15,000.00'
```

**Máscaras de formato de fecha comunes**:
| Máscara | Significado |
|---------|-------------|
| YYYY | Año 4 dígitos |
| MM | Mes (01-12) |
| MONTH | Nombre del mes |
| MON | Abreviatura del mes |
| DD | Día del mes |
| DAY | Nombre del día |
| DY | Abreviatura del día |
| HH24 | Hora (0-23) |
| MI | Minutos |
| SS | Segundos |
| fm | Elimina padding |

### TO_DATE — Convertir cadena a fecha
```sql
SELECT TO_DATE('05/06/2026', 'DD/MM/YYYY') FROM dual;
SELECT TO_DATE('2026-06-05 14:30:00', 'YYYY-MM-DD HH24:MI:SS') FROM dual;
```

### TO_NUMBER — Convertir cadena a número
```sql
SELECT TO_NUMBER('15,000.50', '99,999.99') FROM dual;  -- 15000.50
SELECT TO_NUMBER('$15,000') FROM dual;  -- error, usar formato
```

### Funciones para manejo de NULLs

| Función | Descripción |
|---------|-------------|
| `NVL(expr, valor)` | Si expr es NULL, devuelve valor |
| `NVL2(expr, no_nulo, nulo)` | Si expr no es NULL → no_nulo; si NULL → nulo |
| `COALESCE(expr1, expr2, ...)` | Devuelve la primera expresión no nula |
| `NULLIF(expr1, expr2)` | Si expr1 = expr2, devuelve NULL; si no, expr1 |
| `DECODE(col, val1, res1, val2, res2, ..., default)` | Similar a CASE simple |

### DECODE vs CASE
```sql
-- DECODE (Oracle específico)
SELECT DECODE(job_id,
              'ST_CLERK', 'Empleado de Ventas',
              'IT_PROG', 'Programador IT',
              'SA_REP', 'Representante de Ventas',
              'Otro') AS descripcion_puesto
FROM employees;

-- CASE (SQL estándar, más flexible)
SELECT CASE job_id
         WHEN 'ST_CLERK' THEN 'Empleado de Ventas'
         WHEN 'IT_PROG' THEN 'Programador IT'
         WHEN 'SA_REP' THEN 'Representante de Ventas'
         ELSE 'Otro'
       END AS descripcion_puesto
FROM employees;

-- CASE con condiciones complejas
SELECT CASE
         WHEN salary < 5000 THEN 'Bajo'
         WHEN salary BETWEEN 5000 AND 10000 THEN 'Medio'
         WHEN salary > 10000 THEN 'Alto'
         ELSE 'No definido'
       END AS nivel_salarial
FROM employees;
```

## 9. MODELADO: Validación del Modelo de Datos con SQL

Las consultas SQL son una herramienta poderosa para **validar** que el modelo de datos es correcto:

- **Consultas mal diseñadas revelan mal modelo**: Si constantemente necesitas hacer JOINs complejos para obtener información relacionada, podría indicar que faltan relaciones o que la normalización es excesiva.

- **GROUP BY y granularidad**: La granularidad de una tabla se refleja en qué columnas usas en GROUP BY. Si GROUP BY a un nivel no esperado produce resultados incorrectos, la tabla no está modelada a la granularidad correcta.

- **COUNT y duplicados**: `COUNT(*) vs COUNT(DISTINCT)` revela si hay duplicados donde no debería haberlos, indicando falta de constraints UNIQUE o PK.

- **NULLs inesperados**: La presencia de NULLs en columnas clave puede indicar falta de constraints NOT NULL o datos huérfanos (falta de FK con ON DELETE).

- **Mala performance**: Si consultas simples requieren JOINs excesivos o escaneos completos, el diseño físico (índices, particionamiento) o incluso el modelo lógico puede necesitar revisión.

**Ejemplo práctico**:
```sql
-- Validar que cada empleado tiene exactamente un departamento
SELECT employee_id, COUNT(*) AS num_deptos
FROM employees
GROUP BY employee_id
HAVING COUNT(*) > 1;  -- Debe devolver 0 filas

-- Validar consistencia MANAGER_ID
SELECT e.employee_id, e.manager_id
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id
WHERE e.manager_id IS NOT NULL
  AND m.employee_id IS NULL;  -- Huérfanos: manager que no existe
```
