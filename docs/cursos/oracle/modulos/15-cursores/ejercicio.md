---
sidebar_label: "Ejercicio"
---

### Ejercicio 2: Cursor FOR LOOP con Reporte por Especialidad

Escriba un bloque que:

1. Use un cursor FOR LOOP (sin declarar el cursor explícitamente, o declarándolo)
2. Agrupe las citas por especialidad médica
3. Para cada especialidad, muestre:
   - Total de citas agendadas
   - Total de citas canceladas
   - Total de citas realizadas
   - Porcentaje de cancelación sobre el total
4. Use `COUNT` con `CASE WHEN` dentro del cursor o agrupe en la consulta

---

### Ejercicio 3: Cursor Paramétrico con SYS_REFCURSOR

Escriba:

1. Una función `f_citas_por_rango` que reciba dos fechas (fecha_inicio, fecha_fin)
2. Devuelva un SYS_REFCURSOR con todas las citas en ese rango
3. Incluya: paciente_id, nombre del paciente, medico_id, nombre del médico, especialidad, fecha_cita, hora_cita, estado
4. Ordene por fecha_cita ascendente
5. Un bloque anónimo que llame la función y muestre los resultados

---

### Ejercicio 4: Vista con %ROWTYPE en Cursor

Requerimientos:

1. Cree una vista `V_RESUMEN_PACIENTES` con las columnas:
   - paciente_id, nombre, total_citas, ultima_cita (fecha), proxima_cita (fecha)
2. Escriba un bloque que declare un cursor basado en `V_RESUMEN_PACIENTES%ROWTYPE`
3. Use CURSOR FOR LOOP para recorrer la vista
4. Muestre todos los pacientes con su resumen de citas
5. Si `proxima_cita` es NULL, muestre "Sin citas futuras"

---

### Ejercicio 5: Cursor con LEFT JOIN — Pacientes sin citas

Escriba un bloque PL/SQL que:

1. Declare un cursor con LEFT JOIN entre PACIENTES y CITAS
2. Muestre todos los pacientes, incluyendo aquellos que nunca han tenido citas
3. Columnas: paciente_id, nombre del paciente, total de citas (puede ser 0), fecha de la última cita
4. Use `NVL` o `COALESCE` para manejar los NULLs de pacientes sin citas
5. Al final, muestre cuántos pacientes NO tienen ninguna cita registrada

---

### Ejercicio 6: SELF JOIN — Jerarquía de Médicos

Agregue una columna `referente_id` a la tabla MEDICOS (FK a MEDICOS.id) y escriba:

1. Un bloque PL/SQL que actualice algunos médicos con un referente (ej. el Dr. Pérez es referente de la Dra. López)
2. Declare un cursor con SELF JOIN que muestre la jerarquía:
   - medico_id, nombre del médico, nombre del referente
   - Si un médico no tiene referente, muestre 'Sin referente'
3. Use CURSOR FOR LOOP para recorrer los resultados
4. Ordene por nombre del médico
