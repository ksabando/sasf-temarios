---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 2: Bloque anónimo — Bienvenida

```sql
SET SERVEROUTPUT ON;

BEGIN
    DBMS_OUTPUT.PUT_LINE('Bienvenido al Sistema de Biblioteca PL/SQL');
END;
/
```

**Salida esperada:**
```
Bienvenido al Sistema de Biblioteca PL/SQL
```

---

## Solución Ejercicio 3: Variables — Datos de un libro

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_isbn   VARCHAR2(13) := '978-987-1234-56-7';
    v_titulo VARCHAR2(100) := 'Cien años de soledad';
    v_anio   NUMBER(4) := 1967;
BEGIN
    DBMS_OUTPUT.PUT_LINE('Libro [' || v_isbn || '] - ' || v_titulo || ' (' || v_anio || ')');
END;
/
```

**Salida esperada:**
```
Libro [978-987-1234-56-7] - Cien años de soledad (1967)
```

---

## Solución Ejercicio 4: Variables de sustitución — Bienvenida personalizada

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_id_miembro NUMBER := &id_miembro;
    v_nombre     VARCHAR2(100) := '&nombre_miembro';
BEGIN
    DBMS_OUTPUT.PUT_LINE('Bienvenido, ' || v_nombre || '! Tu ID de miembro es ' || v_id_miembro || '.');
END;
/
```

**Ejemplo de ejecución (usuario ingresa 7 y "Ana García"):**

```
Ingrese el valor para id_miembro: 7
Ingrese el valor para nombre_miembro: Ana García

Salida:
Bienvenido, Ana García! Tu ID de miembro es 7.
```

**Nota:** Se usa `&` (no `&&`) porque cada variable se solicita una sola vez. Si se usara `&&`, Oracle almacenaría el valor y no lo pediría de nuevo si aparece otra vez en el mismo bloque.

---

## Solución Ejercicio 5: Exploración del diccionario de datos

### Consultas ejecutadas

```sql
-- 1. Usuarios de la base de datos
SELECT username, created, default_tablespace FROM dba_users;
```

**Resultado esperado (parcial):**
```
USERNAME            CREATED   DEFAULT_TABLESPACE
------------------- --------  ------------------
SYS                 01/01/24  SYSTEM
SYSTEM              01/01/24  SYSTEM
BIBLIOTECA          15/03/24  USERS
LECTOR_BIBLIOTECA   20/03/24  USERS
...
```

```sql
-- 2. Tablespaces disponibles
SELECT tablespace_name, status, contents FROM dba_tablespaces;
```

**Resultado esperado (parcial):**
```
TABLESPACE_NAME   STATUS    CONTENTS
----------------  --------  ---------
SYSTEM            ONLINE    PERMANENT
SYSAUX            ONLINE    PERMANENT
UNDOTBS1          ONLINE    UNDO
TEMP              ONLINE    TEMPORARY
USERS             ONLINE    PERMANENT
```

```sql
-- 3. Tablas del usuario actual (conectado como SYSTEM)
SELECT table_name, tablespace_name FROM user_tables;
```

### Preguntas

**¿Qué vista terminada en `_TABLES` devuelve tablas de todos los usuarios?**
`DBA_TABLES`. Las vistas `DBA_` contienen información de todos los objetos de la base de datos.

**Diferencia entre `ALL_TABLES` y `USER_TABLES`:**
- `USER_TABLES`: Muestra solo las tablas que pertenecen al usuario actual.
- `ALL_TABLES`: Muestra las tablas a las que el usuario actual tiene acceso (propias más aquellas sobre las que se le ha concedido algún privilegio).

---

## Solución Ejercicio 6: Creación de usuario y asignación de privilegios

```sql
-- 1. Crear usuario
CREATE USER lector_biblioteca IDENTIFIED BY lector123;

-- 2. Cuota ilimitada en USERS
ALTER USER lector_biblioteca QUOTA UNLIMITED ON users;

-- 3. Privilegios mínimos
GRANT CREATE SESSION TO lector_biblioteca;
GRANT SELECT ON biblioteca.libros TO lector_biblioteca;
```

**4. Verificación (conectado como lector_biblioteca):**
```sql
CONNECT lector_biblioteca/lector123@localhost:1521/XE;
SELECT * FROM biblioteca.libros;
```

**5. Intento de INSERT (falla):**
```sql
INSERT INTO biblioteca.libros VALUES ('...');
-- Error: ORA-01031: insufficient privileges
```

**Explicación:** Solo se concedió `SELECT` sobre `biblioteca.libros`. Para permitir INSERTS, se necesita:
```sql
GRANT INSERT ON biblioteca.libros TO lector_biblioteca;
```

---

## Solución Ejercicio 7: Exploración de la arquitectura Oracle

### Consultas y resultados esperados

```sql
-- 1. Información de la instancia
SELECT instance_name, host_name, version FROM v$instance;
```

**Resultado (ejemplo):**
```
INSTANCE_NAME  HOST_NAME        VERSION
-------------  ---------------  -------------
XE             DESKTOP-PC       21.0.0.0.0
```

```sql
-- 2. Información de la base de datos
SELECT name, open_mode FROM v$database;
```

**Resultado (ejemplo):**
```
NAME  OPEN_MODE
----  ----------
XE    READ WRITE
```

```sql
-- 3. Datafiles del tablespace SYSTEM
SELECT file_name, bytes/1024/1024 AS size_mb
FROM dba_data_files
WHERE tablespace_name = 'SYSTEM';
```

**Resultado (ejemplo):**
```
FILE_NAME                                              SIZE_MB
-----------------------------------------------------  -------
C:\APP\ORADATA\XE\SYSTEM01.DBF                         810
```

### Respuestas

1. El tablespace SYSTEM tiene **1 datafile** de aproximadamente **810 MB**.
2. **SMON (System Monitor)** es el proceso que se encarga de:
   - Recuperar la instancia después de un fallo (aplica transacciones pendientes de los redo logs).
   - Limpiar segmentos temporales que ya no se necesitan.
   - Compactar fragmentos de espacio libre contiguo en los datafiles.
   - Coordinar la recuperación de instancia en entornos RAC (Real Application Clusters).

