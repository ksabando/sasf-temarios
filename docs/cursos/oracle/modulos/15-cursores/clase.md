---
sidebar_label: "Clase"
---

## 7. Tipos de JOIN en Cursores

Los JOINs combinan filas de dos o más tablas. Conocer los tipos es esencial para cursores de reportes.

### INNER JOIN

Solo filas que coinciden en ambas tablas.

```sql
-- Cursor con INNER JOIN
CURSOR c_citas_paciente IS
    SELECT c.id, p.nombre AS paciente, c.fecha_cita
    FROM CITAS c
    INNER JOIN PACIENTES p ON p.id = c.paciente_id;
```

### LEFT JOIN (LEFT OUTER JOIN)

Todas las filas de la tabla izquierda, aunque no tengan correspondencia en la derecha.

```sql
-- Todos los pacientes, tengan o no citas
CURSOR c_pacientes_citas IS
    SELECT p.nombre, COUNT(c.id) AS total_citas
    FROM PACIENTES p
    LEFT JOIN CITAS c ON c.paciente_id = p.id
    GROUP BY p.nombre;
```

### RIGHT JOIN (RIGHT OUTER JOIN)

Todas las filas de la tabla derecha, aunque no tengan correspondencia en la izquierda.

```sql
-- Todos los médicos, tengan o no citas
CURSOR c_medicos_citas IS
    SELECT m.nombre, COUNT(c.id) AS total_citas
    FROM CITAS c
    RIGHT JOIN MEDICOS m ON m.id = c.medico_id
    GROUP BY m.nombre;
```

### FULL JOIN (FULL OUTER JOIN)

Todas las filas de ambas tablas, coincidan o no.

```sql
CURSOR c_pacientes_medicos IS
    SELECT p.nombre AS paciente, m.nombre AS medico
    FROM PACIENTES p
    FULL JOIN CITAS c ON c.paciente_id = p.id
    FULL JOIN MEDICOS m ON m.id = c.medico_id;
```

### CROSS JOIN

Producto cartesiano: cada fila de A con cada fila de B.

```sql
-- Todas las combinaciones posible de horarios con médicos
CURSOR c_horarios_medicos IS
    SELECT m.nombre, h.hora
    FROM MEDICOS m
    CROSS JOIN (SELECT TIMESTAMP '2026-06-15 09:00:00' AS hora FROM DUAL UNION ALL
                SELECT TIMESTAMP '2026-06-15 10:00:00' FROM DUAL UNION ALL
                SELECT TIMESTAMP '2026-06-15 11:00:00' FROM DUAL) h;
```

### SELF JOIN

Una tabla se une consigo misma. Revisartil para jerarquías o relaciones recursivas.

```sql
-- Agregar columna de médico referente
ALTER TABLE MEDICOS ADD referente_id NUMBER REFERENCES MEDICOS(id);

-- Médicos con su referente
CURSOR c_medicos_jerarquia IS
    SELECT m1.nombre AS medico, m2.nombre AS referente
    FROM MEDICOS m1
    LEFT JOIN MEDICOS m2 ON m2.id = m1.referente_id;
```
