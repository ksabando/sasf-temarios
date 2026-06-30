---
sidebar_label: "Ejercicio"
---

## Ejercicio 2 — LEFT JOIN

**Objetivo:** Practicar LEFT JOIN para incluir filas sin coincidencia.

**Consigna:**
Escribe una consulta que liste TODOS los departamentos, mostrando cuántos empleados tiene cada uno. Las columnas a mostrar son:
- `department_name`
- `cantidad_empleados` (COUNT de empleados)

Los departamentos sin empleados deben aparecer con `cantidad_empleados = 0`. Ordena el resultado por `cantidad_empleados` descendente (los que tienen más empleados primero).

**Ayuda:** Usa `LEFT JOIN` y `COUNT(e.employee_id)`.

**Resultado esperado:** 27 filas (incluye departamentos vacíos como Recruiting, Payroll, etc.).

---

## Ejercicio 3 — SELF JOIN

**Objetivo:** Practicar SELF JOIN para relaciones jerárquicas.

**Consigna:**
Escribe una consulta que muestre cada empleado junto con el nombre de su manager (jefe). Las columnas a mostrar son:
- `employee_id`
- Nombre del empleado como `empleado`
- Nombre del manager como `manager`

Los empleados que no tienen manager (el presidente) deben mostrarse con el texto `'Sin Jefe'` en la columna `manager`. Ordena por `employee_id`.

**Ayuda:** Usa `LEFT JOIN employees m ON e.manager_id = m.employee_id` y `NVL()`.

**Resultado esperado:** 107 filas (todos los empleados; Steven King aparece con "Sin Jefe").

---

## Ejercicio 4 — MRevisarLTIPLES JOINs

**Objetivo:** Practicar encadenamiento de 4 JOINs.

**Consigna:**
Escribe una consulta que muestre cada empleado con la jerarquía geográfica completa de su departamento. Las columnas a mostrar son:
- `empleado` (nombre completo)
- `department_name`
- `city`
- `country_name`

**Resultado esperado:** 106 filas (empleados con departamento, ubicación y país).

---

## Ejercicio 5 — FULL OUTER JOIN simulado

**Objetivo:** Identificar registros huérfanos en ambas direcciones.

**Consigna:**
Oracle 11g no soporta FULL OUTER JOIN con múltiples condiciones complejas de forma eficiente. Escribe una consulta que simule un FULL OUTER JOIN usando `LEFT JOIN` y `UNION` para encontrar:
- Departamentos que no tienen empleados
- Empleados que no tienen departamento

Las columnas a mostrar son:
- `tipo` (texto: `'Departamento sin empleados'` o `'Empleado sin departamento'`)
- `department_name` (para departamentos vacíos)
- `empleado` (nombre completo, para empleados sin depto)

Ordena por `tipo` y luego por `department_name` o `empleado` según corresponda.

**Resultado esperado:** 17 filas (16 departamentos sin empleados + 1 empleado sin departamento).

---

## Ejercicio 6 — JOIN con subconsulta

**Objetivo:** Combinar JOIN con subconsultas agregadas.

**Consigna:**
Escribe una consulta que muestre los empleados que ganan un salario mayor al salario promedio de su propio departamento. Las columnas a mostrar son:
- `employee_id`
- `empleado` (nombre completo)
- `department_name`
- `salary` (salario del empleado)
- `avg_dept_salary` (salario promedio de su departamento, redondeado a 0 decimales)

Ordena por `department_name` y `salary` descendente.

**Ayuda:**
1. Calcula el promedio de salario por departamento con una subconsulta o CTE.
2. Haz JOIN con la subconsulta usando `department_id`.
3. Filtra con `WHERE e.salary > dept_avg.avg_salary`.
