---
sidebar_label: "Ejercicio"
---

### Ejercicio 2: Creación Dinámica de Tabla de Respaldo

Escriba un bloque PL/SQL que:

1. Reciba una fecha (bind variable) en formato VARCHAR2, ej. '20260101'
2. Use EXECUTE IMMEDIATE para ejecutar:
   `CREATE TABLE PACIENTES_<fecha> AS SELECT * FROM PACIENTES`
3. Si la tabla ya existe, use `EXECUTE IMMEDIATE 'DROP TABLE ...'` primero
4. Muestre mensaje de éxito o fracaso
5. Use DBMS_OUTPUT para confirmar la operación

---

### Ejercicio 3: SELECT Dinámico con Validación de Metadatos

Escriba un procedimiento `p_consultar_dinamico` con parámetros:
- `p_tabla`   VARCHAR2 — nombre de tabla
- `p_columna` VARCHAR2 — nombre de columna para filtrar
- `p_valor`   VARCHAR2 — valor a buscar

El procedimiento debe:

1. Validar que `p_tabla` exista en `USER_TABLES`
2. Validar que `p_columna` exista en `USER_TAB_COLUMNS` para esa tabla
3. Construir dinámicamente: `SELECT * FROM <tabla> WHERE <columna> = :val`
4. Ejecutar con bind variable para `p_valor`
5. Manejar errores: tabla inválida, columna inválida, NO_DATA_FOUND, TOO_MANY_ROWS
6. Explicar (en comentario) por qué tabla y columna NO pueden ser bind variables

---

### Ejercicio 4: OPEN FOR Dinámico con Filtro por Especialidad

Escriba:

1. Una función `f_medicos_por_especialidad` que reciba `p_especialidad VARCHAR2`
2. Use OPEN FOR con SQL dinámico para devolver SYS_REFCURSOR con:
   - medico_id, nombre del médico, total_citas (COUNT de CITAS), última_cita (MAX fecha_cita)
3. Filtre por especialidad usando bind variable
4. Ordenar por total_citas descendente
5. Un bloque anónimo que llame la función para especialidad 'Cardiología' y muestre los resultados

---

### Ejercicio 5: DBMS_SQL — Consulta con columnas dinámicas

Escriba un bloque PL/SQL que:

1. Use DBMS_SQL para ejecutar `SELECT * FROM PACIENTES`
2. Use `DBMS_SQL.DESCRIBE_COLUMNS` para obtener los nombres y tipos de todas las columnas
3. Use un loop para definir cada columna con `DEFINE_COLUMN`
4. Ejecute y haga fetch de todas las filas con `EXECUTE_AND_FETCH`
5. Muestre los nombres de columna como encabezado y luego los valores de cada fila
6. Maneje adecuadamente los recursos cerrando el cursor

---

### Ejercicio 6: Sinónimos y consulta remota

Escriba:

1. Un bloque PL/SQL que cree un sinónimo privado `SYN_PACIENTES_REMOTO` para la tabla `PACIENTES` a través de un Database Link llamado `DBLINK_SUCURSAL`
2. Un bloque que consulte `USER_SYNONYMS` para verificar que el sinónimo fue creado
3. Una consulta SELECT que use un Database Link para obtener datos remotos:
   - Escriba un bloque que ejecute dinámicamente:
     `SELECT COUNT(*) FROM PACIENTES@DBLINK_SUCURSAL`
   - Muestre el total de registros remotos
4. (Opcional) Cree un sinónimo público `PUBLIC_SYN_PACIENTES` si tiene privilegios
