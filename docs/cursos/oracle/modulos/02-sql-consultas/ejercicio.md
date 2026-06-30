---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: GROUP BY con HAVING

Agrupe los empleados por departamento. Para cada departamento, muestre:
- `department_id`
- Cantidad de empleados
- Salario promedio (redondeado a 2 decimales)
- Salario máximo
- Salario mínimo

Incluya SOLO los departamentos que tengan más de 3 empleados. Ordene por salario promedio descendente.

**Pista**: Use `ROUND(AVG(salary), 2)` para redondear el promedio.

---

## Ejercicio 3: Formateo con TO_CHAR e INITCAP

Escriba una consulta que muestre:
- Nombre completo del empleado en formato capitalizado (ej. "John Smith") usando `INITCAP`
- Salario formateado como moneda (ej. "$24,000.00") usando `TO_CHAR`
- Fecha de contratación en español: "05 de Junio de 2020" usando `TO_CHAR`

Muestre solo los empleados del departamento 60 (IT). Ordene por fecha de contratación.

**Pista**: Use `TO_CHAR(hire_date, 'DD "de" MONTH "de" YYYY')`.

---

## Ejercicio 4: LIKE y NULL

Encuentre todos los empleados que cumplan estas dos condiciones:
1. Su apellido (`last_name`) contenga la subcadena 'in' en cualquier posición (ej: "King", "Austin", "Martinez").
2. Tengan comisión (es decir, `commission_pct` no sea NULL).

Muestre: `employee_id`, `first_name`, `last_name`, `commission_pct`, `salary`. Ordene por `salary` descendente.

**Pista**: Use `LIKE '%in%'` y `IS NOT NULL`.

---

## Ejercicio 5: DECODE o CASE

Escriba una consulta que muestre: `employee_id`, `first_name`, `last_name`, `job_id` y una columna adicional llamada `descripcion_puesto` que traduzca los códigos de puesto usando DECODE o CASE:

| JOB_ID | Descripción |
|--------|-------------|
| ST_CLERK | Empleado de Ventas |
| ST_MAN | Gerente de Ventas |
| IT_PROG | Programador IT |
| SA_REP | Representante de Ventas |
| SA_MAN | Gerente de Representantes |
| AD_PRES | Presidente |
| AD_VP | Vicepresidente |
| FI_ACCOUNT | Contador |
| FI_MGR | Gerente de Finanzas |
| Cualquier otro | Otro Puesto |

Ordene alfabéticamente por `descripcion_puesto`.

---

## Ejercicio 6: Subconsultas con fechas

Escriba DOS consultas separadas:

**6a.** Encuentre el empleado más antiguo (el que tiene la fecha de contratación más temprana). Muestre todas sus columnas.

```sql
-- Pista: use subconsulta con MIN(hire_date)
```

**6b.** Encuentre el empleado contratado más recientemente. Muestre todas sus columnas.

Luego, escriba UNA SOLA consulta que muestre ambos empleados (el más antiguo y el más reciente) en una misma salida usando UNION ALL.
