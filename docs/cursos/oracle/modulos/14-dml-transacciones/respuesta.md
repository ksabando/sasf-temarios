---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

### Respuesta 2: Registro de Cita con Validación

```sql
DECLARE
    v_paciente_id  PACIENTES.id%TYPE := 1;
    v_medico_id    MEDICOS.id%TYPE   := 1;
    v_fecha_cita   DATE              := DATE '2026-06-15';
    v_hora_cita    TIMESTAMP         := TIMESTAMP '2026-06-15 10:00:00';
    v_motivo       CITAS.motivo%TYPE := 'Control cardiológico de rutina';
    v_conflictos   NUMBER;
BEGIN
    -- Verificar conflicto de horario
    SELECT COUNT(*)
    INTO v_conflictos
    FROM CITAS
    WHERE medico_id = v_medico_id
      AND hora_cita = v_hora_cita;

    IF v_conflictos > 0 THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: El médico ya tiene una cita agendada en ese horario.');
        ROLLBACK;
        RETURN;
    END IF;

    -- Insertar la cita
    INSERT INTO CITAS (id, paciente_id, medico_id, fecha_cita, hora_cita, estado, motivo)
    VALUES (SEQ_CITAS.NEXTVAL, v_paciente_id, v_medico_id, v_fecha_cita, v_hora_cita, 'AGENDADA', v_motivo);

    IF SQL%FOUND AND SQL%ROWCOUNT = 1 THEN
        DBMS_OUTPUT.PUT_LINE('Cita registrada exitosamente. ID: ' || SEQ_CITAS.CURRVAL);
        COMMIT;
    ELSE
        DBMS_OUTPUT.PUT_LINE('ERROR: No se pudo registrar la cita.');
        ROLLBACK;
    END IF;
END;
/
```

---

### Respuesta 3: SAVEPOINT y Transacción Autónoma

```sql
-- ============================================
-- Procedimiento de logging autónomo
-- ============================================
CREATE OR REPLACE PROCEDURE p_log_error(p_mensaje VARCHAR2) IS
    PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
    INSERT INTO LOG_ERRORES (id_log, mensaje)
    VALUES (SEQ_LOG_ERRORES.NEXTVAL, p_mensaje);
    COMMIT;
END;
/

-- ============================================
-- Bloque principal con SAVEPOINT
-- ============================================
DECLARE
    v_paciente_id PACIENTES.id%TYPE;
    v_medico_id   MEDICOS.id%TYPE   := 1;
    v_hora_cita   TIMESTAMP         := TIMESTAMP '2026-06-15 10:00:00';
    v_conflictos  NUMBER;
BEGIN
    -- Paso 1: Insertar paciente
    INSERT INTO PACIENTES (id, nombre, fecha_nacimiento, telefono, email)
    VALUES (SEQ_PACIENTES.NEXTVAL, 'Lucía Fernández', DATE '1995-07-22', '555-1003', 'lucia@email.com')
    RETURNING id INTO v_paciente_id;

    DBMS_OUTPUT.PUT_LINE('Paciente creado con ID: ' || v_paciente_id);

    -- Paso 2: SAVEPOINT después del paciente
    SAVEPOINT sp_cita;

    -- Paso 3: Intentar insertar cita (simular conflicto)
    SELECT COUNT(*)
    INTO v_conflictos
    FROM CITAS
    WHERE medico_id = v_medico_id
      AND hora_cita = v_hora_cita;

    IF v_conflictos > 0 THEN
        ROLLBACK TO sp_cita;
        p_log_error('Conflicto de horario para médico ' || v_medico_id ||
                     ' a las ' || TO_CHAR(v_hora_cita, 'DD/MM/YYYY HH24:MI'));
        DBMS_OUTPUT.PUT_LINE('Cita cancelada por conflicto. Error logueado.');
    ELSE
        INSERT INTO CITAS (id, paciente_id, medico_id, fecha_cita, hora_cita, estado, motivo)
        VALUES (SEQ_CITAS.NEXTVAL, v_paciente_id, v_medico_id,
                TRUNC(v_hora_cita), v_hora_cita, 'AGENDADA', 'Consulta general');
        DBMS_OUTPUT.PUT_LINE('Cita registrada correctamente.');
    END IF;

    -- Paso 4: Confirmar el paciente (la cita solo si no hubo rollback)
    COMMIT;
END;
/

-- Verificar resultados
SELECT 'PACIENTES' AS tabla, COUNT(*) AS total FROM PACIENTES
UNION ALL
SELECT 'CITAS', COUNT(*) FROM CITAS
UNION ALL
SELECT 'LOG_ERRORES', COUNT(*) FROM LOG_ERRORES;
```

---

### Respuesta 4: MERGE desde Staging

```sql
-- ============================================
-- Tabla temporal staging
-- ============================================
CREATE GLOBAL TEMPORARY TABLE STAGING_PACIENTES (
    id              NUMBER,
    nombre          VARCHAR2(100),
    fecha_nacimiento DATE,
    telefono        VARCHAR2(20),
    email           VARCHAR2(100)
) ON COMMIT DELETE ROWS;

-- ============================================
-- Bloque MERGE
-- ============================================
DECLARE
    v_insertados NUMBER;
    v_actualizados NUMBER;
BEGIN
    -- Cargar datos en staging
    INSERT INTO STAGING_PACIENTES (id, nombre, fecha_nacimiento, telefono, email)
    VALUES (1, 'Ana Martínez Actualizada', DATE '1985-03-20', '555-9999', 'ana.nuevo@email.com');

    INSERT INTO STAGING_PACIENTES (id, nombre, fecha_nacimiento, telefono, email)
    VALUES (99, 'Nuevo Paciente Staging', DATE '2000-01-15', '555-8888', 'nuevo@email.com');

    -- MERGE: sincronizar PACIENTES desde staging
    MERGE INTO PACIENTES p
    USING STAGING_PACIENTES s
    ON (p.id = s.id)
    WHEN MATCHED THEN
        UPDATE SET
            p.nombre     = s.nombre,
            p.telefono   = s.telefono,
            p.email      = s.email
    WHEN NOT MATCHED THEN
        INSERT (id, nombre, fecha_nacimiento, telefono, email)
        VALUES (s.id, s.nombre, s.fecha_nacimiento, s.telefono, s.email);

    v_actualizados := SQL%ROWCOUNT - v_insertados;

    DBMS_OUTPUT.PUT_LINE('Filas procesadas por MERGE: ' || SQL%ROWCOUNT);

    -- Para contar insertados vs actualizados consultamos
    SELECT COUNT(*)
    INTO v_insertados
    FROM PACIENTES p
    WHERE EXISTS (SELECT 1 FROM STAGING_PACIENTES s WHERE s.id = p.id)
      AND p.id = 99;

    DBMS_OUTPUT.PUT_LINE('Detalle:');
    DBMS_OUTPUT.PUT_LINE('  - Paciente existente actualizado (ID 1)');
    DBMS_OUTPUT.PUT_LINE('  - Nuevo paciente insertado (ID 99)');

    COMMIT;
END;
/

-- Verificar resultado
SELECT id, nombre, telefono, email FROM PACIENTES ORDER BY id;
```

---

### Respuesta 5: Secuencia para ID y subconsulta correlacionada

```sql
-- ============================================
-- Crear secuencia
-- ============================================
CREATE SEQUENCE SEQ_LOG_AUDITORIA
    START WITH 1000
    INCREMENT BY 1
    NOCACHE;

-- ============================================
-- Bloque principal
-- ============================================
DECLARE
    v_id1 LOG_ERRORES.id_log%TYPE;
    v_id2 LOG_ERRORES.id_log%TYPE;
BEGIN
    -- Insertar primer registro
    INSERT INTO LOG_ERRORES (id_log, mensaje)
    VALUES (SEQ_LOG_AUDITORIA.NEXTVAL, 'Error de conexión con BD remota')
    RETURNING id_log INTO v_id1;

    DBMS_OUTPUT.PUT_LINE('Primer INSERT exitoso. CURRVAL: ' || SEQ_LOG_AUDITORIA.CURRVAL);

    -- Insertar segundo registro
    INSERT INTO LOG_ERRORES (id_log, mensaje)
    VALUES (SEQ_LOG_AUDITORIA.NEXTVAL, 'Error de timeout en API de pagos')
    RETURNING id_log INTO v_id2;

    DBMS_OUTPUT.PUT_LINE('Segundo INSERT exitoso. CURRVAL: ' || SEQ_LOG_AUDITORIA.CURRVAL);

    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('Total registros insertados: ' || SQL%ROWCOUNT);
    DBMS_OUTPUT.PUT_LINE('IDs generados: ' || v_id1 || ', ' || v_id2);

    -- Subconsulta correlacionada: contar errores por tipo de mensaje
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('=== Errores por tipo (subconsulta correlacionada) ===');
    FOR r IN (SELECT DISTINCT SUBSTR(mensaje, 1, 20) AS tipo_mensaje,
                     (SELECT COUNT(*) FROM LOG_ERRORES le2
                      WHERE SUBSTR(le2.mensaje, 1, 20) = SUBSTR(le.mensaje, 1, 20)) AS total
              FROM LOG_ERRORES le
              ORDER BY tipo_mensaje) LOOP
        DBMS_OUTPUT.PUT_LINE(RPAD(r.tipo_mensaje, 25) || ' | Total: ' || r.total);
    END LOOP;

    COMMIT;
END;
/
```

---

### Respuesta 6: UPDATE con subconsulta correlacionada

```sql
-- ============================================
-- Agregar columna total_citas a MEDICOS
-- ============================================
ALTER TABLE MEDICOS ADD total_citas NUMBER DEFAULT 0;

-- ============================================
-- UPDATE con subconsulta correlacionada
-- ============================================
DECLARE
    v_actualizados NUMBER;
BEGIN
    UPDATE MEDICOS m
    SET m.total_citas = (SELECT COUNT(*) FROM CITAS c WHERE c.medico_id = m.id);

    v_actualizados := SQL%ROWCOUNT;
    DBMS_OUTPUT.PUT_LINE('Médicos actualizados: ' || v_actualizados);
    COMMIT;
END;
/

-- ============================================
-- SELECT con subconsulta correlacionada
-- ============================================
SELECT m.nombre,
       m.especialidad,
       (SELECT COUNT(*) FROM CITAS c WHERE c.medico_id = m.id) AS total_citas
FROM MEDICOS m
WHERE (SELECT COUNT(*) FROM CITAS c WHERE c.medico_id = m.id) >
      (SELECT AVG(total_citas) FROM (
          SELECT COUNT(*) AS total_citas
          FROM CITAS
          GROUP BY medico_id
      ))
ORDER BY total_citas DESC;
```

