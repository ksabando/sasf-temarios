---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3 — SELF JOIN

```sql
SELECT e.employee_id,
       e.first_name || ' ' || e.last_name AS empleado,
       NVL(m.first_name || ' ' || m.last_name, 'Sin Jefe') AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id
ORDER BY e.employee_id;
```

**Explicación:**
- La tabla `employees` se referencia dos veces con alias distintos: `e` (empleado) y `m` (manager).
- El JOIN une `e.manager_id` con `m.employee_id`.
- Se usa `LEFT JOIN` para que Steven King (presidente, `manager_id IS NULL`) también aparezca.
- `NVL()` reemplaza el NULL con el texto 'Sin Jefe'.
- Resultado: 107 filas. Steven King (employee_id=100) muestra "Sin Jefe".

---

## Ejercicio 4 — MRevisarLTIPLES JOINs

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

**Explicación:**
- Se encadenan 4 INNER JOINs siguiendo las claves foráneas:
  - EMPLOYEES → DEPARTMENTS por `department_id`
  - DEPARTMENTS → LOCATIONS por `location_id`
  - LOCATIONS → COUNTRIES por `country_id`
- El orden de las tablas sigue la jerarquía geográfica natural.
- Resultado: 106 filas. Solo empleados con departamento, ubicación y país asignados.

---

## Ejercicio 5 — FULL OUTER JOIN simulado

```sql
-- Departamentos sin empleados
SELECT 'Departamento sin empleados' AS tipo,
       d.department_name,
       NULL AS empleado
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
WHERE e.employee_id IS NULL

UNION ALL

-- Empleados sin departamento
SELECT 'Empleado sin departamento' AS tipo,
       NULL AS department_name,
       e.first_name || ' ' || e.last_name AS empleado
FROM employees e
WHERE e.department_id IS NULL

ORDER BY tipo, department_name, empleado;
```

**Explicación:**
- Oracle 11g soporta FULL OUTER JOIN, pero simularlo con UNION ayuda a entender cómo funciona internamente.
- La primera parte usa `LEFT JOIN + WHERE e.employee_id IS NULL` para encontrar departamentos sin empleados.
- La segunda parte usa `WHERE department_id IS NULL` directamente para encontrar empleados sin departamento.
- `UNION ALL` combina ambos resultados (es más eficiente que `UNION` porque no elimina duplicados).
- Resultado: 17 filas (16 departamentos vacíos + 1 empleado sin depto: Kimberly Grant).

**Alternativa con FULL OUTER JOIN:**
```sql
SELECT CASE
           WHEN e.employee_id IS NULL THEN 'Departamento sin empleados'
           ELSE 'Empleado sin departamento'
       END AS tipo,
       d.department_name,
       e.first_name || ' ' || e.last_name AS empleado
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.department_id
WHERE e.employee_id IS NULL OR d.department_id IS NULL
ORDER BY tipo, department_name, empleado;
```

---

## Ejercicio 6 — JOIN con subconsulta

```sql
WITH dept_avg AS (
    SELECT department_id,
           ROUND(AVG(salary)) AS avg_salary
    FROM employees
    GROUP BY department_id
)
SELECT e.employee_id,
       e.first_name || ' ' || e.last_name AS empleado,
       d.department_name,
       e.salary,
       dept_avg.avg_salary AS avg_dept_salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN dept_avg ON e.department_id = dept_avg.department_id
WHERE e.salary > dept_avg.avg_salary
ORDER BY d.department_name, e.salary DESC;
```

**Explicación:**
- La CTE `dept_avg` calcula el salario promedio redondeado por departamento.
- Se hace JOIN entre `employees`, `departments` y la CTE `dept_avg` usando `department_id`.
- El `WHERE` filtra solo los empleados cuyo salario supera el promedio de su departamento.
- Nota: el empleado sin departamento (Kimberly Grant) no aparece porque el JOIN con `departments` es INNER.
- Si se quisiera incluir a empleados sin departamento, se usaría LEFT JOIN en ambas uniones.

**Alternativa con subconsulta en línea:**
```sql
SELECT e.employee_id,
       e.first_name || ' ' || e.last_name AS empleado,
       d.department_name,
       e.salary,
       (SELECT ROUND(AVG(e2.salary))
        FROM employees e2
        WHERE e2.department_id = e.department_id) AS avg_dept_salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
WHERE e.salary > (SELECT AVG(e2.salary)
                  FROM employees e2
                  WHERE e2.department_id = e.department_id)
ORDER BY d.department_name, e.salary DESC;
```

