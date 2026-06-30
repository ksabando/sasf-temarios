---
sidebar_label: "Clase"
---

# Módulo 00-Oracle-Fundamentos — Conceptos Básicos e Introducción a Oracle

## 1. Introducción a Oracle Database

Oracle Database es un sistema de gestión de bases de datos relacional (RDBMS) desarrollado por Oracle Corporation. Es uno de los motores de base de datos más utilizados en entornos empresariales, conocido por su robustez, escalabilidad y soporte para grandes volúmenes de datos.

### Historia
- **1977**: Larry Ellison, Bob Miner y Ed Oates fundan Software Development Laboratories (SDL).
- **1979**: Lanzan Oracle V2, el primer RDBMS comercial basado en SQL.
- **1983**: Oracle V3, primera versión portable y reescrita en C.
- **1992**: Oracle 7, introduce integridad referencial y PL/SQL.
- **2001**: Oracle 9i, con soporte para XML y RAC (Real Application Clusters).
- **2013**: Oracle 12c, introduce la arquitectura multitenant (CDB/PDB).
- **2023**: Oracle 23c Free, edición gratuita para desarrollo.

## 2. Arquitectura de Oracle

### Instancia vs Base de Datos
- **Base de Datos**: conjunto de archivos físicos (datafiles, control files, redo logs) que almacenan los datos.
- **Instancia**: conjunto de procesos en memoria (SGA) y procesos en segundo plano (background processes) que permiten acceder a la base de datos. Una instancia puede montar una sola base de datos.

### SGA (System Global Area)
Área de memoria compartida que contiene:
- **Buffer Cache**: cachea bloques de datos leídos de disco.
- **Shared Pool**: almacena planes de ejecución SQL (Library Cache) y metadatos del diccionario (Data Dictionary Cache).
- **Redo Log Buffer**: almacena cambios antes de escribirlos en los redo logs.
- **Large Pool**: memoria para operaciones de backup, restore y sesiones compartidas.
- **Java Pool**: memoria para código Java dentro de la base de datos.

### PGA (Program Global Area)
Memoria privada de cada proceso de servidor. Contiene:
- Información de sesión.
- Área de ordenamiento (sort area).
- Estado de cursores y variables de bind.

### Procesos en Segundo Plano (Background Processes)
- **PMON** (Process Monitor): limpia procesos fallidos.
- **SMON** (System Monitor): recuperación de instancia y coalescencia de espacio.
- **DBWn** (Database Writer): escribe bloques modificados del buffer cache a disco.
- **LGWR** (Log Writer): escribe del redo log buffer a los redo logs.
- **CKPT** (Checkpoint): actualiza los datafiles y control files.
- **ARCn** (Archiver): archiva redo logs en modo ARCHIVELOG.

## 3. Instalación y Configuración

### Oracle Database XE (Express Edition)
Edición gratuita limitada a 12 GB de datos de usuario, 2 GB de RAM y 2 CPU threads. Ideal para desarrollo y aprendizaje.

### Oracle Database Enterprise Edition
Edición completa sin limitaciones. Requiere licencia.

### Pasos de instalación típicos
1. Descargar desde oracle.com.
2. Ejecutar el instalador (setup.exe en Windows).
3. Seleccionar tipo de instalación (típica/avanzada).
4. Configurar contraseña para usuarios SYS y SYSTEM.
5. Elegir entre CDB (Container Database) o Non-CDB.

## 4. Oracle SQL Developer

Herramienta gráfica gratuita para gestionar bases de datos Oracle. Permite:
- Ejecutar consultas SQL y scripts PL/SQL.
- Navegar objetos del esquema (tablas, vistas, procedimientos).
- Exportar/importar datos.
- Depurar procedimientos PL/SQL.
- Modelado de datos.

### Configuración de conexión
1. Abrir SQL Developer.
2. Clic en el ícono "+" (New Connection).
3. Completar: Connection Name, Username, Password, Host (localhost), Port (1521), SID o Service Name (XE, ORCL).
4. Clic en "Test" para verificar.
5. Clic en "Connect".

## 5. SQL*Plus

Herramienta de línea de comandos incluida con Oracle Database.

### Conexión
```sql
-- Desde línea de comandos
sqlplus / as sysdba
sqlplus hr/hr@localhost:1521/XE
sqlplus system/password@ORCL
```

### Comandos básicos
```sql
CONNECT hr/hr@XE
SELECT * FROM v$version;
DESCRIBE employees;
SET SERVEROUTPUT ON
SHOW USER
SELECT table_name FROM user_tables;
```

### Comandos SQL*Plus útiles
| Comando | Descripción |
|---------|-------------|
| `CONNECT user/pass@db` | Conectarse a la base de datos |
| `DISCONNECT` | Desconectarse |
| `DESCRIBE tabla` | Mostrar estructura de tabla |
| `SET PAGESIZE 100` | Configurar líneas por página |
| `SET LINESIZE 200` | Configurar ancho de línea |
| `SPOOL archivo.txt` | Guardar salida en archivo |
| `SPOOL OFF` | Detener spool |
| `@script.sql` | Ejecutar script SQL |
| `START script.sql` | Ejecutar script SQL |
| `EXIT` | Salir |
| `ED` | Abrir editor externo |
| `/` | Ejecutar último comando SQL |

## 6. Tipos de Datos Oracle

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **VARCHAR2(n)** | Cadena de longitud variable, máx. 4000 bytes | `VARCHAR2(100)` |
| **CHAR(n)** | Cadena de longitud fija, máx. 2000 bytes | `CHAR(3)` → 'AR' |
| **NUMBER(p,s)** | Numérico con precisión p y escala s | `NUMBER(8,2)` → 99999.99 |
| **NUMBER** | Numérico sin límite de precisión | `NUMBER` |
| **DATE** | Fecha y hora (desde 1-ene-4712 a.C.) | `DATE` |
| **TIMESTAMP** | Fecha y hora con fracciones de segundo | `TIMESTAMP(6)` |
| **CLOB** | Character Large Object, hasta 128 TB | Texto largo |
| **BLOB** | Binary Large Object, hasta 128 TB | Imágenes, archivos |
| **NCLOB** | CLOB con caracteres Unicode | Texto internacional |

### Cuándo usar cada tipo
- `VARCHAR2` para texto de longitud variable (nombres, direcciones).
- `CHAR` para códigos de longitud fija (códigos de país, estados).
- `NUMBER` para valores monetarios, cantidades.
- `DATE` para fechas (no usar VARCHAR2 porque se pierden funciones de fecha).
- `CLOB` para documentos, comentarios largos, XML, JSON.
- `BLOB` para archivos binarios.

## 7. Creación de Usuarios

```sql
-- Crear usuario
CREATE USER mi_usuario
IDENTIFIED BY mi_password
DEFAULT TABLESPACE users
TEMPORARY TABLESPACE temp
QUOTA UNLIMITED ON users;

-- Otorgar privilegios básicos
GRANT CREATE SESSION TO mi_usuario;
GRANT CREATE TABLE TO mi_usuario;
GRANT CREATE PROCEDURE TO mi_usuario;
GRANT CREATE VIEW TO mi_usuario;
GRANT CREATE SEQUENCE TO mi_usuario;
GRANT CREATE TRIGGER TO mi_usuario;

-- Rol predefinido CONNECT y RESOURCE
GRANT CONNECT, RESOURCE TO mi_usuario;

-- Desbloquear usuario
ALTER USER mi_usuario ACCOUNT UNLOCK;

-- Cambiar contraseña
ALTER USER mi_usuario IDENTIFIED BY nueva_password;
```

### Roles predefinidos
- **CONNECT**: CREATE SESSION básico (en versiones recientes solo esto).
- **RESOURCE**: CREATE TABLE, PROCEDURE, SEQUENCE, TRIGGER, etc.
- **DBA**: privilegios administrativos completos.

## 8. Gestión de Tablespaces

### ¿Qué es un tablespace?
Unidad lógica de almacenamiento. Cada tablespace se compone de uno o más datafiles (archivos físicos). Las tablas e índices se almacenan en tablespaces.

### Tablespaces del sistema
- **SYSTEM**: contiene el diccionario de datos. Crítico para el funcionamiento.
- **SYSAUX**: auxiliar de SYSTEM. Almacena estadísticas, XML DB, etc.
- **UNDO**: almacena información para deshacer transacciones (ROLLBACK, consistencia de lectura).
- **TEMP**: almacena resultados temporales de ordenamientos y joins.
- **USERS**: tablespace por defecto para objetos de usuarios.

### Crear un tablespace
```sql
CREATE TABLESPACE mi_ts
DATAFILE 'C:\oracle\oradata\XE\mi_ts01.dbf'
SIZE 100M
AUTOEXTEND ON NEXT 50M MAXSIZE 2G;
```

### Consultar tablespaces
```sql
SELECT tablespace_name FROM dba_tablespaces;
SELECT tablespace_name FROM user_tablespaces;
SELECT tablespace_name, bytes/1024/1024 AS MB FROM dba_data_files;
```

## 9. Desbloquear Usuario HR

El esquema HR es un esquema de ejemplo que incluye tablas como EMPLOYEES, DEPARTMENTS, JOBS, JOB_HISTORY, LOCATIONS, COUNTRIES y REGIONS.

```sql
-- Conectarse como SYSTEM o SYS
ALTER USER hr IDENTIFIED BY hr ACCOUNT UNLOCK;
GRANT CONNECT, RESOURCE TO hr;
ALTER USER hr DEFAULT TABLESPACE users QUOTA UNLIMITED ON users;

-- Verificar estado
SELECT username, account_status FROM dba_users WHERE username = 'HR';
```

## 10. MODELADO: El Esquema HR

El esquema HR representa el modelo de datos de una empresa con empleados. Es un excelente ejemplo de modelo relacional bien diseñado.

### Entidades principales
| Tabla | Descripción | Clave Primaria |
|-------|-------------|----------------|
| **EMPLOYEES** | Datos de empleados | EMPLOYEE_ID |
| **DEPARTMENTS** | Departamentos | DEPARTMENT_ID |
| **JOBS** | Puestos de trabajo | JOB_ID |
| **JOB_HISTORY** | Historial laboral | EMPLOYEE_ID + START_DATE |
| **LOCATIONS** | Ubicaciones físicas | LOCATION_ID |
| **COUNTRIES** | Países | COUNTRY_ID |
| **REGIONS** | Regiones geográficas | REGION_ID |

### Relaciones
- **EMPLOYEES** → **DEPARTMENTS** (N:1): cada empleado pertenece a un departamento.
- **EMPLOYEES** → **JOBS** (N:1): cada empleado tiene un puesto.
- **EMPLOYEES** → **EMPLOYEES** (1:N, self-referencing): MANAGER_ID referencia a EMPLOYEE_ID.
- **DEPARTMENTS** → **LOCATIONS** (N:1): cada departamento en una ubicación.
- **DEPARTMENTS** → **EMPLOYEES** (1:1 para manager): MANAGER_ID.
- **LOCATIONS** → **COUNTRIES** (N:1): cada ubicación en un país.
- **COUNTRIES** → **REGIONS** (N:1): cada país en una región.
- **JOB_HISTORY** → **EMPLOYEES** (N:1): historial de puestos.
- **JOB_HISTORY** → **JOBS** (N:1): puesto en el historial.
- **JOB_HISTORY** → **DEPARTMENTS** (N:1): departamento en el historial.

### Integridad referencial
- FOREIGN KEYs aseguran que no existan empleados en departamentos inexistentes.
- ON DELETE SET NULL o RESTRICT en relaciones críticas.
- La self-reference en EMPLOYEES (MANAGER_ID) crea una jerarquía organizacional.
