---
sidebar_label: "Ejercicio"
---

### Ejercicio 2: Registro de Cita con Validación

Escriba un bloque PL/SQL anónimo que:

1. Solicite o declare variables para: paciente_id, medico_id, fecha_cita, hora_cita, motivo
2. Intente insertar una cita en CITAS
3. Verifique `SQL%ROWCOUNT` y `SQL%FOUND`
4. Antes de insertar, verifique si ya existe una cita para el mismo médico en la misma hora
5. Si existe conflicto, haga ROLLBACK y muestre mensaje de error
6. Si no existe conflicto, haga COMMIT y muestre mensaje de éxito

---

### Ejercicio 3: SAVEPOINT y Transacción Autónoma

Escriba un bloque que:

1. Inserte un nuevo paciente
2. Cree un SAVEPOINT `sp_cita`
3. Intente insertar una cita para ese paciente
4. Si la cita falla (ej. conflicto de horario), haga ROLLBACK TO `sp_cita`
5. Use PRAGMA AUTONOMOUS_TRANSACTION en un procedimiento `p_log_error` para escribir el error en LOG_ERRORES sin afectar la transacción principal
6. Confirme el paciente con COMMIT
7. Demuestre que el paciente permanece pero la cita no, y que el error quedó registrado

---

### Ejercicio 4: MERGE (UPSERT) desde Tabla Staging

Escriba un bloque PL/SQL que:

1. Cree una tabla temporal `STAGING_PACIENTES` (GLOBAL TEMPORARY TABLE ON COMMIT DELETE ROWS)
2. Inserte 2 registros en STAGING_PACIENTES (uno que coincida con un paciente existente y otro nuevo)
3. Use MERGE para sincronizar PACIENTES desde STAGING_PACIENTES:
   - Si el ID existe en PACIENTES, actualizar nombre, teléfono y email
   - Si el ID no existe, insertar el registro completo
4. Muestre cuántos registros se insertaron y cuántos se actualizaron usando SQL%ROWCOUNT
5. Haga COMMIT

---

### Ejercicio 5: Secuencia para ID y subconsulta correlacionada

Escriba un bloque PL/SQL que:

1. Cree una secuencia `SEQ_LOG_AUDITORIA` que inicie en 1000, incremente en 1, sin caché
2. Inserte 2 registros en `LOG_ERRORES` usando `SEQ_LOG_AUDITORIA.NEXTVAL` para el id
3. Después de cada INSERT, muestre el `CURRVAL` de la secuencia
4. Use una subconsulta correlacionada para contar cuántos errores tiene cada tipo de mensaje (primeros 20 caracteres)
5. Muestre el total de registros insertados usando `SQL%ROWCOUNT`

---

### Ejercicio 6: UPDATE con subconsulta correlacionada

Asumiendo que la tabla `MEDICOS` tiene una columna `total_citas NUMBER`, escriba:

1. Un UPDATE que actualice `total_citas` en `MEDICOS` contando las citas de cada médico usando una subconsulta correlacionada
2. Muestre cuántos médicos fueron actualizados usando `SQL%ROWCOUNT`
3. Un SELECT con subconsulta correlacionada que muestre: nombre del médico, especialidad, total_citas
4. Filtre solo los médicos que tienen más citas que el promedio de todos los médicos
