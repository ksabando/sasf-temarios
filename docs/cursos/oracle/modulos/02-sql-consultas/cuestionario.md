---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

## P3: ¿Cómo formatear una fecha en español con TO_CHAR?

**R**:

```sql
-- Método 1: Especificar idioma en la misma función
SELECT TO_CHAR(SYSDATE, 'DD "de" Month "de" YYYY',
               'NLS_DATE_LANGUAGE=SPANISH') FROM dual;
-- Resultado: 05 de Junio de 2026

-- Método 2: Cambiar el idioma de la sesión
ALTER SESSION SET NLS_DATE_LANGUAGE = 'SPANISH';
SELECT TO_CHAR(SYSDATE, 'fmDay, DD "de" Month "de" YYYY') FROM dual;
-- Resultado: Viernes, 05 de Junio de 2026

-- Método 3: Varios formatos
SELECT TO_CHAR(SYSDATE, 'DD/MM/YYYY') AS formato1,          -- 05/06/2026
       TO_CHAR(SYSDATE, 'YYYY-MM-DD') AS formato2,          -- 2026-06-05
       TO_CHAR(SYSDATE, 'fmMonth DD, YYYY') AS formato3     -- June 5, 2026
FROM dual;
```

El modificador `fm` (fill mode) elimina espacios y ceros de relleno.

---

## P4: ¿Qué diferencia hay entre COUNT(*), COUNT(columna) y COUNT(DISTINCT columna)?

**R**:

| Función | Descripción |
|---------|-------------|
| `COUNT(*)` | Cuenta todas las filas, incluyendo filas con NULLs y duplicados. |
| `COUNT(columna)` | Cuenta solo valores **no nulos** de esa columna. |
| `COUNT(DISTINCT columna)` | Cuenta valores **no nulos y únicos** (sin duplicados) de esa columna. |

```sql
-- Ejemplo con tabla de 107 empleados
SELECT COUNT(*) AS total_empleados,                    -- 107
       COUNT(commission_pct) AS con_comision,          -- 35 (solo no nulos)
       COUNT(DISTINCT department_id) AS deptos_unicos -- 12 (departamentos distintos con empleados)
FROM employees;
```

`COUNT(1)` y `COUNT(*)` son equivalentes en Oracle (mismo rendimiento).

---

## P5: ¿Para qué sirve COALESCE y cuándo preferirlo sobre NVL?

**R**: `COALESCE(expr1, expr2, ..., exprN)` devuelve la **primera expresión no nula** evaluando de izquierda a derecha.

**Diferencias con NVL**:
- NVL acepta solo 2 argumentos; COALESCE acepta N argumentos.
- COALESCE usa **evaluación de corto circuito** (deja de evaluar al encontrar el primer no nulo).
- COALESCE es estándar SQL (portable); NVL es específico de Oracle.
- En NVL, ambas expresiones se evalúan siempre; en COALESCE no.

```sql
-- COALESCE con múltiples alternativas
SELECT COALESCE(phone_number, mobile_number, 'SIN TELEFONO') AS contacto
FROM employees;

-- En NVL tendrías que anidar
SELECT NVL(phone_number, NVL(mobile_number, 'SIN TELEFONO')) FROM employees;
```

Preferir COALESCE cuando hay más de 2 opciones o se busca portabilidad. NVL es aceptable para casos simples de 2 argumentos en Oracle.

---

## P6: ¿Cómo funciona un BETWEEN con fechas?

**R**: `BETWEEN` es inclusivo en ambos extremos. Con fechas, hay que tener cuidado con la parte de hora.

```sql
-- Empleados contratados en 2006
SELECT first_name, last_name, hire_date
FROM employees
WHERE hire_date BETWEEN TO_DATE('01/01/2006', 'DD/MM/YYYY')
                    AND TO_DATE('31/12/2006', 'DD/MM/YYYY');

-- Si hire_date incluye hora (ej. SYSDATE), BETWEEN puede excluir
-- el último día si la hora no es 00:00:00. Solución con TRUNC:
WHERE TRUNC(hire_date) BETWEEN TO_DATE('01/01/2006', 'DD/MM/YYYY')
                           AND TO_DATE('31/12/2006', 'DD/MM/YYYY');

-- Alternativa más segura (>= y <):
WHERE hire_date >= TO_DATE('01/01/2006', 'DD/MM/YYYY')
  AND hire_date <  TO_DATE('01/01/2007', 'DD/MM/YYYY');  -- exclusivo superior
```

---

## P7: ¿Qué es una subconsulta escalar y dónde se puede usar?

**R**: Una subconsulta **escalar** es aquella que devuelve exactamente **una fila y una columna** (un único valor). Se puede usar en cualquier lugar donde se espera una expresión escalar:

- **SELECT**:
  ```sql
  SELECT last_name, salary,
         (SELECT AVG(salary) FROM employees) AS promedio_global,
         salary - (SELECT AVG(salary) FROM employees) AS diferencia
  FROM employees;
  ```

- **WHERE**:
  ```sql
  SELECT * FROM employees
  WHERE salary > (SELECT AVG(salary) FROM employees);
  ```

- **ORDER BY**:
  ```sql
  SELECT * FROM departments d
  ORDER BY (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.department_id) DESC;
  ```

- **No** se puede usar en GROUP BY.

Si una subconsulta escalar devuelve más de una fila, Oracle lanza `ORA-01427: single-row subquery returns more than one row`.

---

## P8: ¿Diferencia entre UNION y UNION ALL?

**R**:

| Característica | UNION | UNION ALL |
|----------------|-------|-----------|
| Duplicados | Elimina duplicados | Conserva duplicados |
| Ordenación | Ordena implícitamente (para eliminar duplicados) | No ordena |
| Rendimiento | Más lento (sort + distinct) | Más rápido |
| Uso típico | Cuando necesitas valores únicos | Cuando necesitas todos los registros |

```sql
-- UNION:  sin duplicados, más lento
SELECT last_name FROM employees WHERE department_id = 60
UNION
SELECT last_name FROM employees WHERE salary > 10000;

-- UNION ALL: todo incluido, más rápido
SELECT last_name FROM employees WHERE department_id = 60
UNION ALL
SELECT last_name FROM employees WHERE salary > 10000;
```

Regla general: usar UNION ALL a menos que específicamente necesites eliminar duplicados. Todas las consultas deben tener el mismo número y tipo de columnas.

---

## P9: ¿Cómo paginar resultados con ROWNUM en Oracle 11g y con OFFSET/FETCH en 12c+?

**R**:

### Oracle 11g y anteriores (ROWNUM)
```sql
-- Página 2: filas 11-20 (ROWNUM se evalúa antes de ORDER BY)
SELECT *
FROM (SELECT a.*, ROWNUM rnum
      FROM (SELECT * FROM employees ORDER BY employee_id) a
      WHERE ROWNUM <= 20)
WHERE rnum >= 11;
```

El truco con tres niveles es necesario porque `ROWNUM` se asigna antes de `ORDER BY`.

### Oracle 12c+ (OFFSET/FETCH)
```sql
-- Página 2: filas 11-20 (sintaxis estándar SQL)
SELECT * FROM employees
ORDER BY employee_id
OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;

-- Misma consulta con bind variables
SELECT * FROM employees
ORDER BY employee_id
OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY;
```

**Ventaja de OFFSET/FETCH**: es SQL estándar, más legible y menos propenso a errores que el patrón con ROWNUM.

---

## P10: ¿Qué función usarías para extraer solo el año de una fecha?

**R**: La función `EXTRACT` es la recomendada por ser SQL estándar:

```sql
SELECT EXTRACT(YEAR FROM hire_date) AS anio_contratacion,
       EXTRACT(MONTH FROM hire_date) AS mes_contratacion,
       EXTRACT(DAY FROM hire_date) AS dia_contratacion
FROM employees;
```

**Alternativas Oracle**:
```sql
SELECT TO_NUMBER(TO_CHAR(hire_date, 'YYYY')) AS anio FROM employees;
SELECT TO_CHAR(hire_date, 'YYYY') AS anio FROM employees;  -- VARCHAR2
```

Las partes válidas para EXTRACT son: YEAR, MONTH, DAY, HOUR, MINUTE, SECOND.

**Comparación**:
- `EXTRACT` devuelve NUMBER.
- `TO_CHAR` devuelve VARCHAR2 (puede necesitar conversión para operaciones matemáticas).
- `EXTRACT` es estándar SQL y portable.

