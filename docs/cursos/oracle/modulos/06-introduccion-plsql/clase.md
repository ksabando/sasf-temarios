---
sidebar_label: "Clase"
---

## 3. Flujo de trabajo: Primero modelar, luego programar

1. Identificar entidades del dominio
2. Definir atributos y tipos de datos
3. Establecer relaciones y cardinalidades
4. Crear modelo entidad-relación (lógico)
5. Traducir a DDL (CREATE TABLE) con constraints (modelo físico)
6. Implementar la lógica de negocio en PL/SQL

---

## 4. Temas Adicionales — Fundamentos de Oracle Database

### Arquitectura de Oracle Database

Oracle Database se compone de dos elementos principales que trabajan juntos:

- **Instancia (Instance)**: Conjunto de procesos en memoria (SGA - System Global Area y procesos en background: SMON, PMON, DBWR, LGWR, CKPT).
- **Base de datos (Database)**: Conjunto de archivos físicos en disco (datafiles, controlfiles, redo logs).

```
—,              INSTANCIA                     —,
          —,
—,           BASE DE DATOS                    —,
```

### Instalación y configuración de Oracle Database

Pasos básicos:

1. Descargar Oracle Database (edición Express XE o Enterprise) desde oracle.com.
2. Ejecutar el instalador y configurar:
   - **SID** (System Identifier): Identificador único de la base (ej: `XE`, `ORCL`).
   - Contraseña para los usuarios `SYS` y `SYSTEM`.
   - Puerto del listener (default `1521`).
3. Verificar la instalación conectándose desde SQL*Plus:
   ```sql
   sqlplus system/contraseña@localhost:1521/XE
   ```

### Oracle SQL Developer: Instalación y uso básico

SQL Developer es la herramienta gráfica gratuita de Oracle.

1. Descargar desde oracle.com (versión standalone, solo descomprimir).
2. Crear una conexión:
   - Botón verde `+` Nueva Conexión.
   - Completar: Connection Name, Username, Password, Hostname (`localhost`), Port (`1521`), SID/Service Name.
3. Usar la hoja de trabajo (Worksheet) para escribir y ejecutar sentencias SQL y bloques PL/SQL.

### SQL*Plus: Conexión y comandos básicos

```sql
sqlplus usuario/contraseña@localhost:1521/XE
```

| Comando | Descripción |
|---------|-------------|
| `CONNECT user/pass` | Conecta con otro usuario |
| `DESC nombre_tabla` | Describe la estructura de una tabla |
| `SET SERVEROUTPUT ON` | Habilita salida de DBMS_OUTPUT |
| `SHOW USER` | Muestra el usuario actual |
| `SELECT * FROM TAB;` | Lista las tablas del usuario actual |
| `SPOOL archivo.txt` | Redirige salida a un archivo |
| `@script.sql` | Ejecuta un archivo de script |
| `EXIT` | Cierra SQL*Plus |

### Creación de usuarios y asignación de privilegios

```sql
-- Conectarse como SYSTEM (usuario administrador)
CONNECT system/contraseña@localhost:1521/XE;

-- Crear usuario
CREATE USER biblioteca IDENTIFIED BY biblioteca123
    DEFAULT TABLESPACE users
    QUOTA 50M ON users;

-- Privilegios básicos
GRANT CONNECT, RESOURCE TO biblioteca;
GRANT CREATE SESSION TO biblioteca;
GRANT CREATE TABLE, CREATE VIEW, CREATE SEQUENCE, CREATE PROCEDURE TO biblioteca;

-- Privilegios sobre tablas de otros esquemas
GRANT SELECT ON libros TO biblioteca;
GRANT INSERT, UPDATE, DELETE ON libros TO biblioteca;
```

### Tablespace management y segmentos

Un **tablespace** es la unidad lógica de almacenamiento que agrupa uno o más datafiles.

```sql
-- Ver tablespaces existentes
SELECT tablespace_name, status, contents FROM dba_tablespaces;

-- Crear un tablespace
CREATE TABLESPACE tbs_biblioteca
    DATAFILE 'C:\app\oradata\XE\tbs_biblioteca.dbf' SIZE 100M
    AUTOEXTEND ON NEXT 10M MAXSIZE 500M;

-- Asignar tablespace por defecto
ALTER USER biblioteca DEFAULT TABLESPACE tbs_biblioteca;

-- Ver segmentos del usuario
SELECT segment_name, segment_type, tablespace_name, bytes/1024/1024 AS size_mb
FROM dba_segments
WHERE owner = 'BIBLIOTECA';
```

### Estructura de la base de datos Oracle

| Componente | Descripción |
|------------|-------------|
| **Datafiles** | Archivos físicos (.dbf) con los datos |
| **Control files** | Archivos binarios con la estructura física de la BD |
| **Redo log files** | Registro de todos los cambios realizados |
| **Archive log files** | Copia de seguridad de los redo logs |
| **Parameter file** | Configuración de parámetros de la instancia (PFILE/SPFILE) |
| **Password file** | Contraseñas de usuarios con privilegios administrativos |

```sql
-- Consultar información de la instancia y base de datos
SELECT instance_name, host_name, version, status FROM v$instance;
SELECT name, open_mode FROM v$database;
SELECT name, type, value FROM v$parameter
 WHERE name IN ('db_block_size', 'db_name', 'instance_name');
```
