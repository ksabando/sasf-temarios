---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Variables — Datos de un libro

Crear un bloque anónimo que:

1. Declare variables para:
   - `v_isbn` tipo `VARCHAR2(13)`
   - `v_titulo` tipo `VARCHAR2(100)`
   - `v_anio` tipo `NUMBER(4)`
2. Asigne los siguientes valores:
   - ISBN: `'978-987-1234-56-7'`
   - Título: `'Cien años de soledad'`
   - Año: `1967`
3. Muestre los valores concatenados en una sola línea con el formato:
   ```
   Libro [978-987-1234-56-7] - Cien años de soledad (1967)
   ```

---

## Ejercicio 4: Variables de sustitución — Bienvenida personalizada

Escribir un bloque anónimo que:

1. Solicite al usuario el **ID de un miembro** usando el operador de sustitución `&`.
2. Solicite al usuario el **nombre del miembro** también con `&`.
3. Muestre el mensaje personalizado:
   ```
   Bienvenido, [nombre]! Tu ID de miembro es [ID].
   ```

**Pista**: Usar `&&` si se quiere reutilizar la misma variable en múltiples lugares; usar `&` para cada variable independiente.

---

## Ejercicio 5: Exploración del diccionario de datos

Usando SQL Developer o SQL*Plus, conéctese con el usuario `SYSTEM` (o un usuario con privilegios DBA) y realice las siguientes consultas:

1. Liste todos los usuarios de la base de datos:
   ```sql
   SELECT username, created, default_tablespace FROM dba_users;
   ```
2. Liste los tablespaces disponibles y su estado:
   ```sql
   SELECT tablespace_name, status, contents FROM dba_tablespaces;
   ```
3. Liste las tablas del usuario actual:
   ```sql
   SELECT table_name, tablespace_name FROM user_tables;
   ```

**Se pide:**
1. Ejecutar cada consulta y anotar los resultados.
2. Identificar qué vista terminada en `_TABLES` devuelve tablas de todos los usuarios (`DBA_`, `ALL_` o `USER_`).
3. Explicar brevemente la diferencia entre `ALL_TABLES` y `USER_TABLES`.

---

## Ejercicio 6: Creación de usuario y asignación de privilegios

Escribir los comandos SQL necesarios para:

1. Crear un nuevo usuario llamado `lector_biblioteca` con contraseña `lector123`.
2. Asignarle cuota ilimitada en el tablespace `USERS`.
3. Concederle los privilegios mínimos necesarios para:
   - Conectarse a la base de datos (`CREATE SESSION`).
   - Consultar (`SELECT`) cualquier tabla del esquema `BIBLIOTECA`.
4. Conectarse como `lector_biblioteca` y verificar que puede consultar la tabla `LIBROS` del esquema `BIBLIOTECA` (simular con `SELECT * FROM biblioteca.libros`).
5. Intentar insertar un registro en `LIBROS` y observar el error. Explicar por qué ocurre.

**Pregunta conceptual:** ¿Qué privilegio adicional debería concederse para permitir INSERTS?

---

## Ejercicio 7: Exploración de la arquitectura Oracle

Conectado como `SYSTEM`, ejecutar las siguientes consultas y responder:

1. Obtener el nombre de la instancia, el host y la versión de Oracle:
   ```sql
   SELECT instance_name, host_name, version FROM v$instance;
   ```
2. Obtener el nombre de la base de datos y su modo de apertura:
   ```sql
   SELECT name, open_mode FROM v$database;
   ```
3. Listar los datafiles asociados al tablespace `SYSTEM`:
   ```sql
   SELECT file_name, bytes/1024/1024 AS size_mb
   FROM dba_data_files
   WHERE tablespace_name = 'SYSTEM';
   ```

**Se pide:**
1. Ejecutar las consultas y registrar los resultados.
2. Identificar cuántos datafiles tiene el tablespace SYSTEM y cuál es su tamaño total.
3. Explicar qué función cumple el proceso `SMON` en la instancia de Oracle.
