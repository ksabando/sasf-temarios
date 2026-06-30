---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

### Respuesta 2: Cursor FOR LOOP con Reporte por Especialidad

```sql
DECLARE
    CURSOR c_reporte_especialidad IS
        SELECT m.especialidad,
               COUNT(*)                                           AS total_citas,
               SUM(CASE WHEN c.estado = 'AGENDADA'   THEN 1 ELSE 0 END) AS agendadas,
               SUM(CASE WHEN c.estado = 'CONFIRMADA' THEN 1 ELSE 0 END) AS confirmadas,
               SUM(CASE WHEN c.estado = 'CANCELADA'  THEN 1 ELSE 0 END) AS canceladas,
               SUM(CASE WHEN c.estado = 'REALIZADA'  THEN 1 ELSE 0 END) AS realizadas
        FROM CITAS c
        JOIN MEDICOS m ON m.id = c.medico_id
        GROUP BY m.especialidad
        ORDER BY m.especialidad;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== REPORTE DE OCUPACI—N POR ESPECIALIDAD ===');
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE(RPAD('Especialidad', 20) || ' | Agend | Conf | Cancel | Realiz | %Cancel');
    DBMS_OUTPUT.PUT_LINE(RPAD('-', 20) || '-|-------|------|--------|--------|-------');

    FOR reg IN c_reporte_especialidad LOOP
        DBMS_OUTPUT.PUT_LINE(
            RPAD(reg.especialidad, 20) || ' | ' ||
            RPAD(TO_CHAR(reg.agendadas), 5)  || ' | ' ||
            RPAD(TO_CHAR(reg.confirmadas), 4) || ' | ' ||
            RPAD(TO_CHAR(reg.canceladas), 6) || ' | ' ||
            RPAD(TO_CHAR(reg.realizadas), 6) || ' | ' ||
            RPAD(TO_CHAR(ROUND(reg.canceladas / GREATEST(reg.total_citas, 1) * 100, 1)) || '%', 7)
        );
    END LOOP;
END;
/
```

---

### Respuesta 3: Cursor Paramétrico con SYS_REFCURSOR

```sql
-- ============================================
-- Función que devuelve SYS_REFCURSOR
-- ============================================
CREATE OR REPLACE FUNCTION f_citas_por_rango(
    p_fecha_inicio DATE,
    p_fecha_fin    DATE
) RETURN SYS_REFCURSOR IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT c.paciente_id,
               p.nombre   AS paciente_nombre,
               c.medico_id,
               m.nombre   AS medico_nombre,
               m.especialidad,
               c.fecha_cita,
               c.hora_cita,
               c.estado
        FROM CITAS c
        JOIN PACIENTES p ON p.id = c.paciente_id
        JOIN MEDICOS   m ON m.id = c.medico_id
        WHERE c.fecha_cita BETWEEN p_fecha_inicio AND p_fecha_fin
        ORDER BY c.fecha_cita, c.hora_cita;
    RETURN v_cursor;
END;
/

-- ============================================
-- Bloque anónimo que consume el cursor
-- ============================================
DECLARE
    v_cursor  SYS_REFCURSOR;
    v_reg     f_citas_por_rango%RETURN?;
    -- No se puede usar %ROWTYPE en REF CURSOR, declaramos manual
    v_pac_id     PACIENTES.id%TYPE;
    v_pac_nom    PACIENTES.nombre%TYPE;
    v_med_id     MEDICOS.id%TYPE;
    v_med_nom    MEDICOS.nombre%TYPE;
    v_esp        MEDICOS.especialidad%TYPE;
    v_fec        CITAS.fecha_cita%TYPE;
    v_hor        CITAS.hora_cita%TYPE;
    v_est        CITAS.estado%TYPE;
BEGIN
    v_cursor := f_citas_por_rango(DATE '2026-06-01', DATE '2026-06-30');

    DBMS_OUTPUT.PUT_LINE('Citas en Junio 2026:');
    DBMS_OUTPUT.PUT_LINE('');

    LOOP
        FETCH v_cursor INTO v_pac_id, v_pac_nom, v_med_id, v_med_nom, v_esp, v_fec, v_hor, v_est;
        EXIT WHEN v_cursor%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE(
            RPAD(v_pac_nom, 20) || ' | ' ||
            RPAD(v_med_nom, 20) || ' | ' ||
            TO_CHAR(v_fec, 'DD/MM') || ' ' ||
            TO_CHAR(v_hor, 'HH24:MI') || ' | ' ||
            v_est
        );
    END LOOP;

    CLOSE v_cursor;
END;
/
```

---

### Respuesta 4: Vista con %ROWTYPE en Cursor

```sql
-- ============================================
-- Crear la vista de resumen
-- ============================================
CREATE OR REPLACE VIEW V_RESUMEN_PACIENTES AS
SELECT
    p.id                 AS paciente_id,
    p.nombre,
    COUNT(c.id)          AS total_citas,
    MAX(c.fecha_cita)    AS ultima_cita,
    MIN(CASE
        WHEN c.fecha_cita >= TRUNC(SYSDATE) AND c.estado IN ('AGENDADA','CONFIRMADA')
        THEN c.fecha_cita
    END)                 AS proxima_cita
FROM PACIENTES p
LEFT JOIN CITAS c ON c.paciente_id = p.id
GROUP BY p.id, p.nombre;

-- ============================================
-- Bloque con %ROWTYPE sobre la vista
-- ============================================
DECLARE
    CURSOR c_resumen IS
        SELECT * FROM V_RESUMEN_PACIENTES
        ORDER BY nombre;

    v_reg c_resumen%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== RESUMEN DE PACIENTES ===');
    DBMS_OUTPUT.PUT_LINE('');

    FOR v_reg IN c_resumen LOOP
        DBMS_OUTPUT.PUT_LINE('Paciente: ' || v_reg.nombre);
        DBMS_OUTPUT.PUT_LINE('Total citas: ' || v_reg.total_citas);
        DBMS_OUTPUT.PUT_LINE('Revisarltima cita: ' ||
            TO_CHAR(v_reg.ultima_cita, 'DD/MM/YYYY'));
        DBMS_OUTPUT.PUT_LINE('Próxima cita: ' ||
            CASE WHEN v_reg.proxima_cita IS NULL
                 THEN 'Sin citas futuras'
                 ELSE TO_CHAR(v_reg.proxima_cita, 'DD/MM/YYYY')
            END);
        DBMS_OUTPUT.PUT_LINE('------------------------------');
    END LOOP;
END;
/

---

### Respuesta 5: Cursor con LEFT JOIN — Pacientes sin citas

```sql
DECLARE
    CURSOR c_pacientes_citas IS
        SELECT p.id          AS paciente_id,
               p.nombre      AS paciente,
               COUNT(c.id)   AS total_citas,
               MAX(c.fecha_cita) AS ultima_cita
        FROM PACIENTES p
        LEFT JOIN CITAS c ON c.paciente_id = p.id
        GROUP BY p.id, p.nombre
        ORDER BY p.nombre;

    v_reg         c_pacientes_citas%ROWTYPE;
    v_sin_citas   NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== LISTADO COMPLETO DE PACIENTES ===');
    DBMS_OUTPUT.PUT_LINE('');

    FOR v_reg IN c_pacientes_citas LOOP
        DBMS_OUTPUT.PUT_LINE(
            RPAD(v_reg.paciente, 25) || ' | ' ||
            'Citas: ' || RPAD(TO_CHAR(v_reg.total_citas), 4) || ' | ' ||
            'Revisarltima: ' || NVL(TO_CHAR(v_reg.ultima_cita, 'DD/MM/YYYY'), 'N/A')
        );

        IF v_reg.total_citas = 0 THEN
            v_sin_citas := v_sin_citas + 1;
        END IF;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('Pacientes sin ninguna cita: ' || v_sin_citas);
END;
/
```

---

### Respuesta 6: SELF JOIN — Jerarquía de Médicos

```sql
-- ============================================
-- Agregar columna de referente
-- ============================================
ALTER TABLE MEDICOS ADD referente_id NUMBER REFERENCES MEDICOS(id);

-- ============================================
-- Actualizar algunos médicos con referentes
-- ============================================
UPDATE MEDICOS SET referente_id = (SELECT id FROM MEDICOS WHERE nombre = 'Dr. Juan Pérez')
WHERE nombre = 'Dra. María López';

UPDATE MEDICOS SET referente_id = (SELECT id FROM MEDICOS WHERE nombre = 'Dr. Juan Pérez')
WHERE nombre = 'Dr. Roberto Sánchez';
COMMIT;

-- ============================================
-- Bloque con SELF JOIN
-- ============================================
DECLARE
    CURSOR c_jerarquia IS
        SELECT m1.id       AS medico_id,
               m1.nombre   AS medico,
               m2.nombre   AS referente
        FROM MEDICOS m1
        LEFT JOIN MEDICOS m2 ON m2.id = m1.referente_id
        ORDER BY m1.nombre;

    v_reg c_jerarquia%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== JERARQUÍA DE M?DICOS ===');
    DBMS_OUTPUT.PUT_LINE('');

    FOR v_reg IN c_jerarquia LOOP
        DBMS_OUTPUT.PUT_LINE(
            RPAD(v_reg.medico, 25) || ' | ' ||
            'Referente: ' || NVL(v_reg.referente, 'Sin referente')
        );
    END LOOP;
END;
/
```

