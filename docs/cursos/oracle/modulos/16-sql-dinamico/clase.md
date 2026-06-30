---
sidebar_label: "Clase"
---

# Módulo 11 — SQL Dinámico y Metadata-Driven Design

## 1. SQL Dinámico con EXECUTE IMMEDIATE

`EXECUTE IMMEDIATE` construye y ejecuta sentencias SQL en tiempo de ejecución. Revisartil cuando la estructura de la consulta no se conoce en tiempo de compilación.

### Sintaxis básica

```sql
DECLARE
    v_sql  VARCHAR2(500);
    v_id   NUMBER := 1;
    v_nombre PACIENTES.nombre%TYPE;
BEGIN
    v_sql := 'SELECT nombre FROM PACIENTES WHERE id = :1';
    EXECUTE IMMEDIATE v_sql INTO v_nombre USING v_id;
    DBMS_OUTPUT.PUT_LINE(v_nombre);
END;
/
```

### DDL Dinámico

```sql
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE PACIENTES_BACKUP AS SELECT * FROM PACIENTES WHERE 1=0';
    EXECUTE IMMEDIATE 'DROP TABLE PACIENTES_BACKUP';
END;
/
```

## 2. Bind Variables con USING

Las bind variables previenen SQL Injection y mejoran rendimiento al permitir reutilización del plan de ejecución.

```sql
DECLARE
    v_sql     VARCHAR2(200);
    v_estado  CITAS.estado%TYPE := 'CANCELADA';
    v_medico  MEDICOS.id%TYPE  := 1;
    v_total   NUMBER;
BEGIN
    v_sql := 'SELECT COUNT(*) FROM CITAS WHERE estado = :est AND medico_id = :med';
    EXECUTE IMMEDIATE v_sql INTO v_total USING v_estado, v_medico;
    DBMS_OUTPUT.PUT_LINE('Total: ' || v_total);
END;
/
```

## 3. INTO en SQL Dinámico

Para SELECT de una sola fila se usa INTO. Para múltiples filas se usa OPEN FOR.

```sql
DECLARE
    v_id     PACIENTES.id%TYPE := 1;
    v_nombre PACIENTES.nombre%TYPE;
    v_email  PACIENTES.email%TYPE;
BEGIN
    EXECUTE IMMEDIATE
        'SELECT nombre, email FROM PACIENTES WHERE id = :id'
        INTO v_nombre, v_email
        USING v_id;

    DBMS_OUTPUT.PUT_LINE(v_nombre || ' - ' || v_email);
END;
/
```

## 4. OPEN FOR con SQL Dinámico

Para consultas que devuelven múltiples filas se usa un cursor variable con OPEN FOR.

```sql
CREATE OR REPLACE FUNCTION f_consulta_dinamica(p_tabla VARCHAR2)
RETURN SYS_REFCURSOR IS
    v_cursor SYS_REFCURSOR;
    v_sql    VARCHAR2(200);
BEGIN
    v_sql := 'SELECT * FROM ' || p_tabla;
    OPEN v_cursor FOR v_sql;
    RETURN v_cursor;
END;
/
```

## 5. SQL Injection: Prevención

**NUNCA concatenar valores directamente.** Siempre usar bind variables.

### Incorrecto (vulnerable a inyección)

```sql
-- PELIGROSO: No hacer esto
v_sql := 'SELECT * FROM PACIENTES WHERE nombre = ''' || v_nombre || '''';
EXECUTE IMMEDIATE v_sql;
```

### Correcto (seguro)

```sql
v_sql := 'SELECT * FROM PACIENTES WHERE nombre = :nom';
EXECUTE IMMEDIATE v_sql INTO ... USING v_nombre;
```

**Importante:** Los nombres de tablas y columnas NO se pueden bindear. Deben sanearse manualmente o validarse contra un catálogo.

```sql
-- NO funciona:
EXECUTE IMMEDIATE 'SELECT * FROM :tabla' USING v_tabla;  -- ERROR

-- SÍ funciona validando:
FUNCTION validar_tabla(p_tabla VARCHAR2) RETURN VARCHAR2 IS
    v_valida VARCHAR2(100);
BEGIN
    SELECT table_name INTO v_valida
    FROM user_tables
    WHERE table_name = UPPER(p_tabla);
    RETURN v_valida;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20001, 'Tabla no válida');
END;
```

## 6. DBMS_SQL para SQL Dinámico Avanzado

DBMS_SQL permite mayor control: parsing, binding, ejecución y fetching manual. Revisartil para:
- Número de columnas desconocido en tiempo de compilación
- DDL complejo
- Ejecución de bloques anónimos largos
- Procesar consultas con estructura dinámica

### Ciclo básico

```sql
DECLARE
    v_cursor   NUMBER;
    v_filas    NUMBER;
BEGIN
    v_cursor := DBMS_SQL.OPEN_CURSOR;
    DBMS_SQL.PARSE(v_cursor, 'CREATE TABLE TEST (id NUMBER)', DBMS_SQL.NATIVE);
    v_filas := DBMS_SQL.EXECUTE(v_cursor);
    DBMS_SQL.CLOSE_CURSOR(v_cursor);
END;
/
```

### SELECT con DBMS_SQL y columnas dinámicas

```sql
DECLARE
    v_cursor   NUMBER;
    v_sql      VARCHAR2(500);
    v_desc_tab DBMS_SQL.DESC_TAB;
    v_columnas NUMBER;
    v_filas    NUMBER;
    v_valor    VARCHAR2(4000);
BEGIN
    v_sql := 'SELECT * FROM PACIENTES WHERE id = :1';
    v_cursor := DBMS_SQL.OPEN_CURSOR;
    DBMS_SQL.PARSE(v_cursor, v_sql, DBMS_SQL.NATIVE);
    DBMS_SQL.BIND_VARIABLE(v_cursor, ':1', 1);
    DBMS_SQL.DESCRIBE_COLUMNS(v_cursor, v_columnas, v_desc_tab);

    FOR i IN 1..v_columnas LOOP
        DBMS_OUTPUT.PUT_LINE('Columna ' || i || ': ' || v_desc_tab(i).col_name);
        DBMS_SQL.DEFINE_COLUMN(v_cursor, i, v_valor, 4000);
    END LOOP;

    v_filas := DBMS_SQL.EXECUTE_AND_FETCH(v_cursor);

    FOR i IN 1..v_columnas LOOP
        DBMS_SQL.COLUMN_VALUE(v_cursor, i, v_valor);
        DBMS_OUTPUT.PUT_LINE(v_desc_tab(i).col_name || ' = ' || v_valor);
    END LOOP;

    DBMS_SQL.CLOSE_CURSOR(v_cursor);
END;
/
```

## 7. Database Links (DBLINKS)

Los Database Links permiten conectarse a otra base de datos Oracle de forma transparente.

### Creación

```sql
-- DBLINK privado (solo visible para quien lo crea)
CREATE DATABASE LINK dblink_sucursal
CONNECT TO usuario_remoto IDENTIFIED BY password
USING 'alias_tns';

-- DBLINK público (visible para todos los usuarios)
CREATE PUBLIC DATABASE LINK dblink_central
CONNECT TO admin_central IDENTIFIED BY password
USING 'central_db';
```

### Uso en consultas

```sql
-- Consultar tabla remota
SELECT * FROM PACIENTES@dblink_sucursal;

-- JOIN entre tablas locales y remotas
SELECT l.nombre, r.total_citas
FROM PACIENTES l
JOIN (SELECT paciente_id, COUNT(*) AS total_citas
      FROM CITAS@dblink_sucursal
      GROUP BY paciente_id) r ON r.paciente_id = l.id;
```

### Uso en SQL dinámico

```sql
DECLARE
    v_sql VARCHAR2(500);
BEGIN
    v_sql := 'CREATE SYNONYM pacientes_suc FOR PACIENTES@dblink_sucursal';
    EXECUTE IMMEDIATE v_sql;
END;
/
```

---

## Table Modeling — Metadata-Driven Design

### Modelo EAV (Entity-Attribute-Value)

El modelo EAV permite almacenar atributos dinámicos sin modificar el esquema. Revisartil cuando los atributos varían por registro (ej. pacientes con distintos tipos de datos clínicos).

```sql
CREATE TABLE CONFIG_CAMPOS_ADICIONALES (
    id_campo     NUMBER PRIMARY KEY,
    nombre_campo VARCHAR2(60) NOT NULL,
    tipo_dato    VARCHAR2(30) NOT NULL CHECK (tipo_dato IN ('VARCHAR2','NUMBER','DATE','CLOB')),
    requerido    CHAR(1) DEFAULT 'N' CHECK (requerido IN ('S','N')),
    tabla_destino VARCHAR2(60) DEFAULT 'PACIENTES'
);

-- Tabla EAV para valores de pacientes
CREATE TABLE PACIENTES_VALORES_EXT (
    id_valor   NUMBER PRIMARY KEY,
    paciente_id NUMBER NOT NULL REFERENCES PACIENTES(id),
    id_campo   NUMBER NOT NULL REFERENCES CONFIG_CAMPOS_ADICIONALES(id_campo),
    valor_varchar2 VARCHAR2(4000),
    valor_number   NUMBER,
    valor_date     DATE,
    valor_clob     CLOB,
    CONSTRAINT uq_paciente_campo UNIQUE (paciente_id, id_campo)
);
```

### Cuándo usar EAV vs Modelo Tradicional

| Aspecto              | Modelo Tradicional        | EAV                        |
|----------------------|---------------------------|----------------------------|
| Atributos fijos      | Excelente                 | Malo (complejidad extra)   |
| Atributos variables  | Requiere ALTER TABLE      | Excelente (flexible)       |
| Rendimiento consultas| —ptimo                    | Penalizado (pivoteo)       |
| Integridad referencial| Fácil                    | Difícil (validar tipos)    |
| Mantenibilidad       | Simple                    | Compleja                   |

### Generación Dinámica de Tablas desde Catálogos

Se puede usar EXECUTE IMMEDIATE para crear tablas basadas en configuraciones almacenadas en la BD.

```sql
CREATE OR REPLACE PROCEDURE generar_tabla_pacientes_ext IS
    v_sql VARCHAR2(4000);
BEGIN
    v_sql := 'CREATE TABLE PACIENTES_EXT (paciente_id NUMBER PRIMARY KEY';
    FOR reg IN (SELECT nombre_campo, tipo_dato FROM CONFIG_CAMPOS_ADICIONALES
                WHERE tabla_destino = 'PACIENTES') LOOP
        v_sql := v_sql || ', ' || reg.nombre_campo || ' ' || reg.tipo_dato;
    END LOOP;
    v_sql := v_sql || ')';
    EXECUTE IMMEDIATE v_sql;
END;
/
```

### Diccionario de Datos Oracle

Catálogos útiles para metadata-driven design:

| Vista del Diccionario  | Contenido                          |
|------------------------|------------------------------------|
| `USER_TABLES`          | Tablas del usuario                 |
| `USER_TAB_COLUMNS`     | Columnas de las tablas             |
| `USER_CONSTRAINTS`     | Constraints definidos              |
| `USER_CONS_COLUMNS`    | Columnas asociadas a constraints   |
| `USER_INDEXES`         | Índices                            |
| `USER_SOURCE`          | Código fuente de objetos PL/SQL    |

```sql
-- Consultar estructura de una tabla
SELECT column_name, data_type, data_length, nullable
FROM user_tab_columns
WHERE table_name = 'PACIENTES'
ORDER BY column_id;
```
