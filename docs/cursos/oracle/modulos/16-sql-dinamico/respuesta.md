---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

### Respuesta 2: Creación Dinámica de Tabla de Respaldo

```sql
DECLARE
    v_fecha VARCHAR2(8) := '20260101';
    v_nombre_tabla VARCHAR2(60);
    v_sql  VARCHAR2(500);
    v_existe NUMBER;
BEGIN
    v_nombre_tabla := 'PACIENTES_' || v_fecha;

    -- Verificar si la tabla ya existe
    SELECT COUNT(*)
    INTO v_existe
    FROM user_tables
    WHERE table_name = UPPER(v_nombre_tabla);

    IF v_existe > 0 THEN
        v_sql := 'DROP TABLE ' || v_nombre_tabla;
        EXECUTE IMMEDIATE v_sql;
        DBMS_OUTPUT.PUT_LINE('Tabla ' || v_nombre_tabla || ' eliminada.');
    END IF;

    -- Crear tabla de respaldo
    v_sql := 'CREATE TABLE ' || v_nombre_tabla ||
             ' AS SELECT * FROM PACIENTES';
    EXECUTE IMMEDIATE v_sql;

    DBMS_OUTPUT.PUT_LINE('Respaldo creado: ' || v_nombre_tabla);
    DBMS_OUTPUT.PUT_LINE('Registros copiados: ' || SQL%ROWCOUNT);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

-- Verificar
SELECT table_name FROM user_tables WHERE table_name LIKE 'PACIENTES_%';
```

---

### Respuesta 3: SELECT Dinámico con Validación de Metadatos

```sql
CREATE OR REPLACE PROCEDURE p_consultar_dinamico(
    p_tabla   VARCHAR2,
    p_columna VARCHAR2,
    p_valor   VARCHAR2
) IS
    v_sql        VARCHAR2(500);
    v_cursor     SYS_REFCURSOR;
    v_valor_tipeado VARCHAR2(4000);
    v_columna_existe NUMBER;
    v_tabla_existe   NUMBER;
BEGIN
    -- =============================================
    -- ¿Por qué tabla y columna NO pueden bindearse?
    -- Las bind variables (:var) en Oracle solo
    -- reemplazan VALORES literales, no identificadores
    -- de esquema. Los nombres de tabla/columna son
    -- parte del parse tree y deben conocerse en
    -- tiempo de compilación del cursor.
    -- Para usarlos dinámicamente debemos concatenar
    -- (con las debidas validaciones de seguridad).
    -- =============================================

    -- Validar que la tabla exista
    SELECT COUNT(*)
    INTO v_tabla_existe
    FROM user_tables
    WHERE table_name = UPPER(p_tabla);

    IF v_tabla_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Tabla "' || p_tabla || '" no existe.');
    END IF;

    -- Validar que la columna exista en la tabla
    SELECT COUNT(*)
    INTO v_columna_existe
    FROM user_tab_columns
    WHERE table_name  = UPPER(p_tabla)
      AND column_name = UPPER(p_columna);

    IF v_columna_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Columna "' || p_columna ||
                                '" no existe en tabla "' || p_tabla || '".');
    END IF;

    -- Construir y ejecutar SELECT dinámico
    v_sql := 'SELECT * FROM ' || UPPER(p_tabla) ||
             ' WHERE ' || UPPER(p_columna) || ' = :val';

    EXECUTE IMMEDIATE v_sql USING p_valor;

    DBMS_OUTPUT.PUT_LINE('Consulta ejecutada: ' || v_sql);
    DBMS_OUTPUT.PUT_LINE('Valor buscado: ' || p_valor);
    DBMS_OUTPUT.PUT_LINE('Filas encontradas: ' || SQL%ROWCOUNT);

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No se encontraron registros con ' ||
                             p_columna || ' = ' || p_valor);
    WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('Se encontraron múltiples registros.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

-- Pruebas
BEGIN
    p_consultar_dinamico('PACIENTES', 'nombre', 'Ana Martínez');
    DBMS_OUTPUT.PUT_LINE('---');
    p_consultar_dinamico('PACIENTES', 'id', '1');
    DBMS_OUTPUT.PUT_LINE('---');
    p_consultar_dinamico('PACIENTES', 'email', 'no_existe@email.com');
END;
/
```

---

### Respuesta 4: OPEN FOR Dinámico con Filtro por Especialidad

```sql
-- ============================================
-- Función con OPEN FOR dinámico
-- ============================================
CREATE OR REPLACE FUNCTION f_medicos_por_especialidad(
    p_especialidad VARCHAR2
) RETURN SYS_REFCURSOR IS
    v_cursor SYS_REFCURSOR;
    v_sql    VARCHAR2(500);
BEGIN
    v_sql := 'SELECT m.id           AS medico_id,
                     m.nombre       AS medico_nombre,
                     COUNT(c.id)    AS total_citas,
                     MAX(c.fecha_cita) AS ultima_cita
              FROM MEDICOS m
              LEFT JOIN CITAS c ON c.medico_id = m.id
              WHERE m.especialidad = :esp
              GROUP BY m.id, m.nombre
              ORDER BY COUNT(c.id) DESC';

    OPEN v_cursor FOR v_sql USING p_especialidad;
    RETURN v_cursor;
END;
/

-- ============================================
-- Bloque anónimo de prueba
-- ============================================
DECLARE
    v_cursor   SYS_REFCURSOR;
    v_med_id   MEDICOS.id%TYPE;
    v_med_nom  MEDICOS.nombre%TYPE;
    v_total    NUMBER;
    v_ultima   DATE;
BEGIN
    v_cursor := f_medicos_por_especialidad('Cardiología');

    DBMS_OUTPUT.PUT_LINE('=== M?DICOS DE CARDIOLOGÍA ===');
    DBMS_OUTPUT.PUT_LINE('');

    LOOP
        FETCH v_cursor INTO v_med_id, v_med_nom, v_total, v_ultima;
        EXIT WHEN v_cursor%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE(
            RPAD(v_med_nom, 25) || ' | Citas: ' ||
            RPAD(TO_CHAR(v_total), 4) || ' | Revisarltima: ' ||
            NVL(TO_CHAR(v_ultima, 'DD/MM/YYYY'), 'Sin citas')
        );
    END LOOP;

    CLOSE v_cursor;
END;
/

---

### Respuesta 5: DBMS_SQL — Consulta con columnas dinámicas

```sql
DECLARE
    v_cursor     NUMBER;
    v_sql        VARCHAR2(500);
    v_desc_tab   DBMS_SQL.DESC_TAB;
    v_columnas   NUMBER;
    v_filas      NUMBER;
    v_valor      VARCHAR2(4000);
    v_resultado  BOOLEAN;
BEGIN
    v_sql := 'SELECT id, nombre, fecha_nacimiento, telefono, email FROM PACIENTES';
    v_cursor := DBMS_SQL.OPEN_CURSOR;

    -- Parsear la sentencia
    DBMS_SQL.PARSE(v_cursor, v_sql, DBMS_SQL.NATIVE);

    -- Describir columnas (descubrir estructura dinámicamente)
    DBMS_SQL.DESCRIBE_COLUMNS(v_cursor, v_columnas, v_desc_tab);

    DBMS_OUTPUT.PUT_LINE('Columnas descubiertas: ' || v_columnas);
    DBMS_OUTPUT.PUT_LINE('');

    -- Definir cada columna como VARCHAR2
    FOR i IN 1..v_columnas LOOP
        DBMS_OUTPUT.PUT_LINE('  Col ' || i || ': ' ||
                             RPAD(v_desc_tab(i).col_name, 25) || ' (' ||
                             v_desc_tab(i).col_type || ')');
        DBMS_SQL.DEFINE_COLUMN(v_cursor, i, v_valor, 4000);
    END LOOP;

    -- Ejecutar y hacer fetch
    v_filas := DBMS_SQL.EXECUTE(v_cursor);

    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('=== DATOS ===');

    LOOP
        v_resultado := DBMS_SQL.FETCH_ROWS(v_cursor) > 0;
        EXIT WHEN NOT v_resultado;

        -- Obtener valores de cada columna
        FOR i IN 1..v_columnas LOOP
            DBMS_SQL.COLUMN_VALUE(v_cursor, i, v_valor);
            DBMS_OUTPUT.PUT_LINE(RPAD(v_desc_tab(i).col_name, 25) || ': ' || v_valor);
        END LOOP;
        DBMS_OUTPUT.PUT_LINE('------------------------------');
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('Total filas: ' || v_filas);

    -- Cerrar cursor
    DBMS_SQL.CLOSE_CURSOR(v_cursor);
END;
/
```

---

### Respuesta 6: Sinónimos y consulta remota

```sql
-- ============================================
-- Crear sinónimo privado para tabla remota
-- ============================================
BEGIN
    EXECUTE IMMEDIATE 'CREATE SYNONYM SYN_PACIENTES_REMOTO
                       FOR PACIENTES@DBLINK_SUCURSAL';
    DBMS_OUTPUT.PUT_LINE('Sinónimo SYN_PACIENTES_REMOTO creado.');
END;
/

-- ============================================
-- Verificar sinónimo en el diccionario
-- ============================================
SELECT synonym_name, table_owner, table_name, db_link
FROM user_synonyms
WHERE synonym_name = 'SYN_PACIENTES_REMOTO';

-- ============================================
-- Consulta remota con EXECUTE IMMEDIATE
-- ============================================
DECLARE
    v_sql   VARCHAR2(200);
    v_total NUMBER;
BEGIN
    v_sql := 'SELECT COUNT(*) FROM PACIENTES@DBLINK_SUCURSAL';
    EXECUTE IMMEDIATE v_sql INTO v_total;

    DBMS_OUTPUT.PUT_LINE('Total pacientes en BD remota: ' || v_total);
END;
/

-- ============================================
-- Sinónimo público (requiere privilegio CREATE PUBLIC SYNONYM)
-- ============================================
BEGIN
    EXECUTE IMMEDIATE 'CREATE PUBLIC SYNONYM PUBLIC_SYN_PACIENTES
                       FOR PACIENTES';
    DBMS_OUTPUT.PUT_LINE('Sinónimo público PUBLIC_SYN_PACIENTES creado.');
END;
/

-- ============================================
-- Verificar todos los sinónimos del esquema
-- ============================================
SELECT synonym_name, table_owner, table_name, db_link
FROM user_synonyms;

-- ============================================
-- Limpieza
-- ============================================
BEGIN
    EXECUTE IMMEDIATE 'DROP SYNONYM SYN_PACIENTES_REMOTO';
    EXECUTE IMMEDIATE 'DROP PUBLIC SYNONYM PUBLIC_SYN_PACIENTES';
    DBMS_OUTPUT.PUT_LINE('Sinónimos eliminados.');
END;
/
```

