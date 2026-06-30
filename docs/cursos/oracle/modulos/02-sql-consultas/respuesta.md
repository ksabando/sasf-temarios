---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Respuesta 2: GROUP BY con HAVING

```sql
SELECT department_id,
       COUNT(*) AS num_empleados,
       ROUND(AVG(salary), 2) AS salario_promedio,
       MAX(salary) AS salario_maximo,
       MIN(salary) AS salario_minimo
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 3
ORDER BY salario_promedio DESC;
```

**Salida esperada aproximada**:
```
DEPARTMENT_ID  NUM_EMPLEADOS  SALARIO_PROMEDIO  SALARIO_MAXIMO  SALARIO_MINIMO
90             3              19333.33          24000           17000
80             34             8955.88           14000           6100
60             5              9600              9000            4200
100            6              8600              12008           6900
50             45             3475.55           8200            2100
30             6              4150              11000           2500
```

**Explicación**:
- `WHERE` filtra filas individuales (antes de agrupar).
- `HAVING` filtra grupos (después de agrupar).
- No se puede usar `WHERE COUNT(*) > 3` porque COUNT es una función de agregación.

---

## Respuesta 3: Formateo con TO_CHAR e INITCAP

```sql
SELECT INITCAP(first_name || ' ' || last_name) AS nombre_completo,
       TO_CHAR(salary, '$99,999.00') AS salario_formateado,
       TO_CHAR(hire_date, 'DD "de" MONTH "de" YYYY', 'NLS_DATE_LANGUAGE=SPANISH') AS fecha_contratacion
FROM employees
WHERE department_id = 60
ORDER BY hire_date;
```

**Salida esperada**:
```
NOMBRE_COMPLETO    SALARIO_FORMATEADO    FECHA_CONTRATACION
Alexander Hunold         $9,000.00    03 de ENERO     de 2006
Bruce Ernst              $6,000.00    21 de MAYO      de 2007
David Austin             $4,800.00    25 de JUNIO     de 2007
Valli Pataballa          $4,800.00    05 de FEBRERO   de 2006
Diana Lorentz            $4,200.00    07 de FEBRERO   de 2007
```

**Nota sobre el idioma**: Para nombres de mes en español, usar:
```sql
TO_CHAR(hire_date, 'DD "de" Month "de" YYYY', 'NLS_DATE_LANGUAGE=SPANISH')
```
O configurar la sesión:
```sql
ALTER SESSION SET NLS_DATE_LANGUAGE = 'SPANISH';
```

---

## Respuesta 4: LIKE y NULL

```sql
SELECT employee_id, first_name, last_name, commission_pct, salary
FROM employees
WHERE LOWER(last_name) LIKE '%in%'
  AND commission_pct IS NOT NULL
ORDER BY salary DESC;
```

**Salida esperada**:
```
EMPLOYEE_ID  FIRST_NAME  LAST_NAME  COMMISSION_PCT  SALARY
174         Ellen       Abel       0.30            11000
148         Gerald      Cambrault  0.30            11000
...
```

**Explicación**:
- `LIKE '%in%'` coincide con cualquier apellido que contenga "in" en cualquier posición.
- `IS NOT NULL` es obligatorio para comparar con NULL. No funciona `commission_pct <> NULL` ni `commission_pct != NULL`.
- Usar `LOWER(last_name)` para búsqueda case-insensitive.

---

## Respuesta 5: DECODE o CASE

### Opción A: Usando DECODE

```sql
SELECT employee_id, first_name, last_name, job_id,
       DECODE(job_id,
              'ST_CLERK', 'Empleado de Ventas',
              'ST_MAN', 'Gerente de Ventas',
              'IT_PROG', 'Programador IT',
              'SA_REP', 'Representante de Ventas',
              'SA_MAN', 'Gerente de Representantes',
              'AD_PRES', 'Presidente',
              'AD_VP', 'Vicepresidente',
              'FI_ACCOUNT', 'Contador',
              'FI_MGR', 'Gerente de Finanzas',
              'Otro Puesto') AS descripcion_puesto
FROM employees
ORDER BY descripcion_puesto;
```

### Opción B: Usando CASE (recomendado)

```sql
SELECT employee_id, first_name, last_name, job_id,
       CASE job_id
         WHEN 'ST_CLERK' THEN 'Empleado de Ventas'
         WHEN 'ST_MAN' THEN 'Gerente de Ventas'
         WHEN 'IT_PROG' THEN 'Programador IT'
         WHEN 'SA_REP' THEN 'Representante de Ventas'
         WHEN 'SA_MAN' THEN 'Gerente de Representantes'
         WHEN 'AD_PRES' THEN 'Presidente'
         WHEN 'AD_VP' THEN 'Vicepresidente'
         WHEN 'FI_ACCOUNT' THEN 'Contador'
         WHEN 'FI_MGR' THEN 'Gerente de Finanzas'
         ELSE 'Otro Puesto'
       END AS descripcion_puesto
FROM employees
ORDER BY descripcion_puesto;
```

**Ventaja de CASE sobre DECODE**: CASE es SQL estándar, soporta condiciones complejas con `CASE WHEN condición THEN...`, y es más legible para desarrolladores de otros motores de bases de datos.

---

## Respuesta 6: Subconsultas con fechas

### 6a. Empleado más antiguo

```sql
SELECT *
FROM employees
WHERE hire_date = (SELECT MIN(hire_date) FROM employees);
```

### 6b. Empleado más reciente

```sql
SELECT *
FROM employees
WHERE hire_date = (SELECT MAX(hire_date) FROM employees);
```

### 6c. Ambos en una sola consulta con UNION ALL

```sql
SELECT employee_id, first_name, last_name, hire_date, job_id, salary,
       'MAS_ANTIGUO' AS tipo
FROM employees
WHERE hire_date = (SELECT MIN(hire_date) FROM employees)

UNION ALL

SELECT employee_id, first_name, last_name, hire_date, job_id, salary,
       'MAS_RECIENTE' AS tipo
FROM employees
WHERE hire_date = (SELECT MAX(hire_date) FROM employees)

ORDER BY hire_date;
```

**Salida esperada**:
```
EMPLOYEE_ID  FIRST_NAME  LAST_NAME  HIRE_DATE   JOB_ID   SALARY  TIPO
100          Steven      King       17-JUN-03   AD_PRES  24000   MAS_ANTIGUO
...          ...         ...        ...         ...      ...     MAS_RECIENTE
```

**Explicación**:
- La subconsulta escalar `(SELECT MIN(hire_date) FROM employees)` devuelve un solo valor que se compara con `hire_date`.
- `UNION ALL` combina ambos resultados sin eliminar duplicados (más rápido que UNION que sí los elimina).
- Se agregó una columna `tipo` para identificar cuál es cuál.

