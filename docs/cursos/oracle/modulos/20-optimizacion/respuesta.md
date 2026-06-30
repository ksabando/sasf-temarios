---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Respuesta 2: BULK COLLECT con LIMIT — Comparación de rendimiento

```sql
CREATE OR REPLACE PROCEDURE comparar_rendimiento AS
    v_proy_id       proyectos.id%TYPE;
    v_start_time    NUMBER;
    v_end_time      NUMBER;
    v_elapsed_a     NUMBER;
    v_elapsed_b     NUMBER;

    -- Método B: BULK COLLECT
    CURSOR c_tareas IS
        SELECT * FROM tareas WHERE proyecto_id = v_proy_id;

    TYPE t_tareas_tab IS TABLE OF tareas%ROWTYPE;
    v_tareas_lote   t_tareas_tab;

    TYPE t_ids IS TABLE OF tareas.id%TYPE;
    TYPE t_horas IS TABLE OF tareas.horas_reales%TYPE;
    v_ids   t_ids;
    v_horas t_horas;

    v_total_registros NUMBER;
BEGIN
    -- Buscar o crear un proyecto de prueba
    BEGIN
        SELECT id INTO v_proy_id FROM proyectos WHERE nombre = 'PRUEBA_RENDIMIENTO';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            INSERT INTO proyectos (nombre, descripcion, fecha_inicio, presupuesto)
            VALUES ('PRUEBA_RENDIMIENTO', 'Proyecto para pruebas de performance',
                    SYSDATE, 1000000)
            RETURNING id INTO v_proy_id;
    END;
    COMMIT;

    -- Limpiar tareas previas de prueba
    DELETE FROM tareas WHERE proyecto_id = v_proy_id;
    COMMIT;

    -- Insertar 50,000 tareas de prueba
    DBMS_OUTPUT.PUT_LINE('Insertando 50,000 tareas de prueba...');
    FOR i IN 1..50000 LOOP
        INSERT INTO tareas (proyecto_id, nombre, horas_reales, horas_estimadas, estado)
        VALUES (v_proy_id, 'Tarea prueba ' || LPAD(i, 6, '0'),
                DBMS_RANDOM.VALUE(1, 100), 100, 'E');
    END LOOP;
    COMMIT;

    SELECT COUNT(*) INTO v_total_registros FROM tareas WHERE proyecto_id = v_proy_id;
    DBMS_OUTPUT.PUT_LINE('Total tareas insertadas: ' || v_total_registros);

    -- =====================================
    -- M?TODO A: Cursor FOR LOOP tradicional
    -- =====================================
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('--- Método A: Cursor FOR LOOP ---');
    v_start_time := DBMS_UTILITY.GET_TIME;

    FOR r IN (SELECT id, horas_reales FROM tareas WHERE proyecto_id = v_proy_id) LOOP
        UPDATE tareas SET horas_reales = horas_reales + 1 WHERE id = r.id;
    END LOOP;
    COMMIT;

    v_end_time := DBMS_UTILITY.GET_TIME;
    v_elapsed_a := (v_end_time - v_start_time) / 100;
    DBMS_OUTPUT.PUT_LINE('Tiempo método A: ' || v_elapsed_a || ' segundos');

    -- =====================================
    -- M?TODO B: BULK COLLECT con LIMIT + FORALL
    -- =====================================
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('--- Método B: BULK COLLECT LIMIT 1000 + FORALL ---');

    -- Resetear horas_reales
    UPDATE tareas SET horas_reales = horas_reales - 1 WHERE proyecto_id = v_proy_id;
    COMMIT;

    v_start_time := DBMS_UTILITY.GET_TIME;

    OPEN c_tareas;
    LOOP
        FETCH c_tareas BULK COLLECT INTO v_tareas_lote LIMIT 1000;
        EXIT WHEN v_tareas_lote.COUNT = 0;

        -- Preparar colecciones para FORALL
        v_ids := t_ids();
        v_horas := t_horas();
        v_ids.EXTEND(v_tareas_lote.COUNT);
        v_horas.EXTEND(v_tareas_lote.COUNT);

        FOR i IN 1..v_tareas_lote.COUNT LOOP
            v_ids(i) := v_tareas_lote(i).id;
            v_horas(i) := v_tareas_lote(i).horas_reales + 1;
        END LOOP;

        FORALL i IN 1..v_ids.COUNT
            UPDATE tareas SET horas_reales = v_horas(i) WHERE id = v_ids(i);
    END LOOP;
    CLOSE c_tareas;
    COMMIT;

    v_end_time := DBMS_UTILITY.GET_TIME;
    v_elapsed_b := (v_end_time - v_start_time) / 100;
    DBMS_OUTPUT.PUT_LINE('Tiempo método B: ' || v_elapsed_b || ' segundos');

    -- =====================================
    -- COMPARACI—N FINAL
    -- =====================================
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('========================================');
    DBMS_OUTPUT.PUT_LINE('COMPARACI—N DE RENDIMIENTO');
    DBMS_OUTPUT.PUT_LINE('========================================');
    DBMS_OUTPUT.PUT_LINE('Método A (FOR LOOP):  ' || v_elapsed_a || ' s');
    DBMS_OUTPUT.PUT_LINE('Método B (BULK+FORALL): ' || v_elapsed_b || ' s');

    IF v_elapsed_a > 0 THEN
        DBMS_OUTPUT.PUT_LINE('Diferencia: ' ||
            ROUND((v_elapsed_a / v_elapsed_b), 1) || 'x más rápido B');
    END IF;
    DBMS_OUTPUT.PUT_LINE('========================================');

    /*
     * RESPUESTA: El método B (BULK COLLECT + FORALL) es significativamente más rápido
     * porque reduce los cambios de contexto entre PL/SQL y SQL.
     *
     * En el método A, cada iteración del FOR LOOP ejecuta un UPDATE individual,
     * lo que provoca 50,000 cambios de contexto (PL/SQL → SQL → PL/SQL).
     *
     * En el método B, el BULK COLLECT recupera 1000 filas en un solo cambio de
     * contexto, y FORALL ejecuta 1000 UPDATEs en un solo cambio de contexto.
     * Para 50,000 registros: solo ~50 cambios de contexto vs 50,000.
     */
END comparar_rendimiento;
/
```

### Ejecución

```sql
SET SERVEROUTPUT ON;
EXEC comparar_rendimiento;
```

---

## Respuesta 3: Función con RESULT_CACHE

```sql
CREATE OR REPLACE FUNCTION get_nombre_empleado (
    p_empleado_id IN empleados.id%TYPE
) RETURN VARCHAR2
RESULT_CACHE RELIES_ON (EMPLEADOS)
IS
    v_nombre empleados.nombre%TYPE;
BEGIN
    SELECT nombre INTO v_nombre FROM empleados WHERE id = p_empleado_id;
    RETURN v_nombre;
END;
/
```

### Demostración

```sql
SET SERVEROUTPUT ON;
SET TIMING ON;

DECLARE
    v_nombre VARCHAR2(100);
    v_start  NUMBER;
    v_end    NUMBER;
    v_elapsed_cached NUMBER;
    v_elapsed_nocache NUMBER;
BEGIN
    -- Asegurar que el empleado existe
    INSERT INTO empleados (nombre, email, cargo, costo_hora)
    VALUES ('Test Cache', 'test.cache@empresa.com', 'Test', 100)
    ON CONFLICT (email) DO NOTHING;
    COMMIT;

    -- =====================================
    -- PRIMERA LLAMADA (sin caché, va a disco)
    -- =====================================
    DBMS_OUTPUT.PUT_LINE('--- Primera llamada (carga en caché) ---');
    v_start := DBMS_UTILITY.GET_TIME;
    FOR i IN 1..10000 LOOP
        v_nombre := get_nombre_empleado(1);
    END LOOP;
    v_end := DBMS_UTILITY.GET_TIME;
    v_elapsed_nocache := (v_end - v_start) / 100;
    DBMS_OUTPUT.PUT_LINE('10,000 llamadas (carga inicial): ' || v_elapsed_nocache || ' s');

    -- =====================================
    -- SEGUNDA LLAMADA (desde caché)
    -- =====================================
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('--- Segunda llamada (desde RESULT_CACHE) ---');
    v_start := DBMS_UTILITY.GET_TIME;
    FOR i IN 1..10000 LOOP
        v_nombre := get_nombre_empleado(1);
    END LOOP;
    v_end := DBMS_UTILITY.GET_TIME;
    v_elapsed_cached := (v_end - v_start) / 100;
    DBMS_OUTPUT.PUT_LINE('10,000 llamadas (en caché): ' || v_elapsed_cached || ' s');

    DBMS_OUTPUT.PUT_LINE('Diferencia: ' ||
        ROUND(v_elapsed_nocache / NULLIF(v_elapsed_cached, 0), 1) || 'x más rápido');

    -- =====================================
    -- DEMOSTRACI—N DE INVALIDACI—N
    -- =====================================
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('--- Demostración de invalidación de caché ---');

    -- Obtener nombre actual
    SELECT nombre INTO v_nombre FROM empleados WHERE id = 1;
    DBMS_OUTPUT.PUT_LINE('Nombre actual: ' || v_nombre);

    -- Llamar a la función (queda en caché)
    DBMS_OUTPUT.PUT_LINE('get_nombre_empleado(1): ' || get_nombre_empleado(1));

    -- Modificar el empleado
    UPDATE empleados SET nombre = nombre || ' (modificado)' WHERE id = 1;
    COMMIT;

    -- Llamar nuevamente (la caché se invalidó por RELIES_ON)
    SELECT nombre INTO v_nombre FROM empleados WHERE id = 1;
    DBMS_OUTPUT.PUT_LINE('Nombre después de UPDATE: ' || v_nombre);
    DBMS_OUTPUT.PUT_LINE('get_nombre_empleado(1) después: ' || get_nombre_empleado(1));

    -- Restaurar (opcional)
    UPDATE empleados SET nombre = REPLACE(nombre, ' (modificado)', '') WHERE id = 1;
    COMMIT;
END;
/
```

### Respuesta a la pregunta

> **¿Qué pasa con la caché si ejecutamos `UPDATE empleados SET nombre = nombre WHERE id = 1`? ¿Se invalida?**

Sí, la caché se invalida. Aunque el valor no cambie realmente, Oracle detecta que la tabla EMPLEADOS (declarada en `RELIES_ON`) fue modificada (el UPDATE ejecutó un cambio de SCN aunque el valor sea el mismo). Oracle no compara si el valor cambió realmente; lo invalida por el SCN de la transacción. Esto evita lecturas inconsistentes.

---

## Respuesta 4: Evaluación y creación de índices

### Índice A — Búsqueda de tareas por proyecto

**Consulta:** `SELECT * FROM tareas WHERE proyecto_id = 123 ORDER BY fecha_inicio;`

**Índice:** Compuesto por `(proyecto_id, fecha_inicio)`

```sql
CREATE INDEX idx_tareas_proy_fecha ON tareas(proyecto_id, fecha_inicio);
```

**Explicación:**
- El `WHERE` filtra por `proyecto_id` (alta selectividad).
- El `ORDER BY` usa `fecha_inicio`.
- Un índice compuesto con ambas columnas permite que Oracle:
  1. Encuentre rápidamente todas las tareas del proyecto (búsqueda por `proyecto_id`)
  2. Las devuelva ya ordenadas por `fecha_inicio` (evitando un sort posterior)
- Si solo indexáramos `proyecto_id`, Oracle tendría que ordenar las filas después de recuperarlas.

### Índice B — Reporte de horas por empleado

**Consulta:**
```sql
SELECT e.id, e.nombre, SUM(t.horas_reales) AS total_horas
FROM empleados e
JOIN tareas t ON e.id = t.responsable_id
WHERE e.id = 456
GROUP BY e.id, e.nombre;
```

**Índice:** En `tareas(responsable_id, horas_reales)`

```sql
CREATE INDEX idx_tareas_resp_horas ON tareas(responsable_id, horas_reales);
```

**Explicación:**
- El JOIN se hace por `responsable_id` (FK en tareas).
- El índice en `responsable_id` acelera el JOIN (Oracle busca rápido las tareas del empleado).
- Incluir `horas_reales` en el índice lo convierte en **covering index**: Oracle puede resolver el `SUM(horas_reales)` sin tocar la tabla (solo el índice), reduciendo lecturas.
- Para la tabla EMPLEADOS, la PK ya está indexada.

### Índice C — Búsqueda de proyectos por estado y rango de fechas

**Consulta:**
```sql
SELECT * FROM proyectos
WHERE estado = 'E'
  AND fecha_inicio BETWEEN DATE '2026-01-01' AND DATE '2026-06-30'
ORDER BY fecha_inicio;
```

**Índice:** Compuesto por `(estado, fecha_inicio)`

```sql
CREATE INDEX idx_proyectos_estado_fecha ON proyectos(estado, fecha_inicio);
```

**Explicación:**
- `estado` tiene baja cardinalidad (3 valores: 'P','E','C'). Un índice B-tree en `estado` solo no es muy selectivo.
- Pero combinado con `fecha_inicio`, Oracle puede buscar exactamente el rango de fechas dentro del estado 'E'.
- El `ORDER BY fecha_inicio` también se beneficia porque el índice ya ordena por fecha.
- Opcional: considerar `BITMAP` si la cardinalidad es muy baja y hay pocas escrituras concurrentes:
  ```sql
  CREATE BITMAP INDEX idx_proy_estado_bitmap ON proyectos(estado);
  ```

### Verificación con EXPLAIN PLAN

```sql
-- Para el índice A
EXPLAIN PLAN SET STATEMENT_ID = 'IDX_A' FOR
SELECT * FROM tareas WHERE proyecto_id = 1 ORDER BY fecha_inicio;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY(NULL, 'IDX_A'));

-- Para el índice B
EXPLAIN PLAN SET STATEMENT_ID = 'IDX_B' FOR
SELECT e.id, e.nombre, SUM(t.horas_reales) AS total_horas
FROM empleados e
JOIN tareas t ON e.id = t.responsable_id
WHERE e.id = 1
GROUP BY e.id, e.nombre;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY(NULL, 'IDX_B'));

-- Para el índice C
EXPLAIN PLAN SET STATEMENT_ID = 'IDX_C' FOR
SELECT * FROM proyectos
WHERE estado = 'E'
  AND fecha_inicio BETWEEN DATE '2026-01-01' AND DATE '2026-06-30'
ORDER BY fecha_inicio;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY(NULL, 'IDX_C'));
```

### Índice compuesto multi-propósito

```sql
-- Este índice sirve tanto para la consulta A como para parcialmente la B
CREATE INDEX idx_tareas_multipropito ON tareas(proyecto_id, responsable_id, horas_reales);
```

**Utilidad:**
- **Consulta A**: Se usa `proyecto_id` como primera columna (búsqueda eficiente).
- **Consulta B**: Si filtramos por proyecto y empleado, este índice cubre ambas columnas.
- **Covering**: `horas_reales` incluida evita acceso a tabla para `SUM`.

**Orden de columnas importa**: Se priorizó `proyecto_id` primero porque es más usado en filtros de igualdad. Si las consultas por empleado fueran más frecuentes, se pondría `responsable_id` primero.

---

## Respuesta 5: Consultas al diccionario de datos

### Parte A — Objetos del esquema

```sql
SELECT object_name, object_type, status, created
FROM user_objects
WHERE object_type IN ('PROCEDURE', 'FUNCTION', 'PACKAGE', 'PACKAGE BODY')
ORDER BY object_type, object_name;
```

### Parte B — Columnas de una tabla

```sql
SELECT column_name, data_type, data_length, nullable
FROM user_tab_columns
WHERE table_name = 'TAREAS'
ORDER BY column_id;
```

### Parte C — Sinónimos y DBLinks

```sql
-- Sinónimos del esquema
SELECT synonym_name, table_owner, table_name, db_link
FROM user_synonyms
ORDER BY synonym_name;

-- Database links del usuario
SELECT db_link, username, host, created
FROM user_db_links;
```

### Parte D — Diferencia entre USER_, ALL_ y DBA_

```sql
/* ============================================
   DIFERENCIA ENTRE USER_, ALL_ y DBA_:

   USER_TABLES:
     - Muestra solo las tablas del esquema actual
     - No necesita privilegios especiales
     - Revisartil para: el propio usuario consultando
       sus objetos

   ALL_TABLES:
     - Muestra tablas del esquema actual + aquellas
       sobre las que se ha otorgado acceso (SELECT,
       INSERT, etc.)
     - No necesita privilegios especiales
     - Revisartil para: consultar objetos de otros esquemas
       a los que tenemos acceso

   DBA_TABLES:
     - Muestra TODAS las tablas de la base de datos
     - Requiere privilegio SELECT ANY TABLE o
       rol DBA
     - Revisartil para: DBAs, auditoría, administración

   En resumen:
   - USER_  → "lo mío"
   - ALL_   → "lo que puedo ver"
   - DBA_   → "todo" (solo DBA)
   ============================================ */
```

---

## Respuesta 6: Vista materializada

```sql
-- ============================================
-- MV LOG para refresco rápido
-- ============================================
CREATE MATERIALIZED VIEW LOG ON CITAS
WITH ROWID, PRIMARY KEY
INCLUDING NEW VALUES;

-- ============================================
-- Vista materializada 1: refresco completo
-- ============================================
CREATE MATERIALIZED VIEW MV_RESUMEN_MEDICOS
REFRESH COMPLETE ON DEMAND
AS
SELECT m.id           AS medico_id,
       m.nombre       AS medico_nombre,
       m.especialidad,
       COUNT(c.id)    AS total_citas,
       MAX(c.fecha_cita) AS ultima_fecha_cita
FROM MEDICOS m
LEFT JOIN CITAS c ON c.medico_id = m.id
GROUP BY m.id, m.nombre, m.especialidad;

-- ============================================
-- Vista materializada 2: refresco rápido
-- ============================================
CREATE MATERIALIZED VIEW MV_RESUMEN_MEDICOS_FAST
REFRESH FAST ON DEMAND
AS
SELECT m.id           AS medico_id,
       m.nombre       AS medico_nombre,
       m.especialidad,
       COUNT(c.id)    AS total_citas,
       MAX(c.fecha_cita) AS ultima_fecha_cita
FROM MEDICOS m
LEFT JOIN CITAS c ON c.medico_id = m.id
GROUP BY m.id, m.nombre, m.especialidad;

-- ============================================
-- Insertar nueva cita y refrescar
-- ============================================
DECLARE
    v_paciente_id PACIENTES.id%TYPE;
    v_medico_id   MEDICOS.id%TYPE;
BEGIN
    -- Obtener IDs de ejemplo
    SELECT id INTO v_paciente_id FROM PACIENTES WHERE ROWNUM = 1;
    SELECT id INTO v_medico_id FROM MEDICOS WHERE ROWNUM = 1;

    -- Insertar nueva cita
    INSERT INTO CITAS (id, paciente_id, medico_id, fecha_cita, hora_cita, estado)
    VALUES (SEQ_CITAS.NEXTVAL, v_paciente_id, v_medico_id,
            SYSDATE, SYSTIMESTAMP, 'AGENDADA');
    COMMIT;

    DBMS_OUTPUT.PUT_LINE('Nueva cita insertada.');
END;
/

-- Refrescar ambas MV
BEGIN
    DBMS_MVIEW.REFRESH('MV_RESUMEN_MEDICOS', 'C');
    DBMS_OUTPUT.PUT_LINE('MV_RESUMEN_MEDICOS refrescada (completo).');

    DBMS_MVIEW.REFRESH('MV_RESUMEN_MEDICOS_FAST', 'F');
    DBMS_OUTPUT.PUT_LINE('MV_RESUMEN_MEDICOS_FAST refrescada (rápido).');
END;
/

-- ============================================
-- Verificar datos
-- ============================================
SELECT * FROM MV_RESUMEN_MEDICOS ORDER BY especialidad, medico_nombre;

SELECT * FROM MV_RESUMEN_MEDICOS_FAST ORDER BY especialidad, medico_nombre;

-- ============================================
-- Limpieza
-- ============================================
DROP MATERIALIZED VIEW MV_RESUMEN_MEDICOS;
DROP MATERIALIZED VIEW MV_RESUMEN_MEDICOS_FAST;
DROP MATERIALIZED VIEW LOG ON CITAS;
```

