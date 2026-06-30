---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

## P3: ¿Para qué sirve SQL*Plus y en qué se diferencia de SQL Developer?

**R**: **SQL*Plus** es una herramienta de línea de comandos nativa de Oracle, ligera y disponible en cualquier instalación. Es ideal para scripting automatizado, tareas de administración y entornos sin interfaz gráfica.

**SQL Developer** es una herramienta gráfica moderna que ofrece navegador de objetos, editor con autocompletado, depurador PL/SQL, plan de ejecución visual, exportación/importación de datos y modelado. Es preferible para desarrollo y exploración de datos.

SQL*Plus usa comandos propios (DESCRIBE, SET, SPOOL) que no son SQL estándar.

---

## P4: ¿Qué son los tablespaces y cómo se relacionan con los datafiles?

**R**: Un **tablespace** es una unidad lógica de almacenamiento que agrupa objetos de base de datos (tablas, índices). Físicamente, un tablespace se compone de uno o más **datafiles** (archivos en el sistema operativo con extensión .dbf).

La relación es 1:N: un tablespace puede tener múltiples datafiles, pero un datafile pertenece a un solo tablespace. Esta separación lógica/física permite:
- Mover datafiles entre discos sin afectar la lógica.
- Hacer backup por tablespace.
- Distribuir I/O entre discos.
- Llevar tablespaces offline/online individualmente.

---

## P5: ¿Qué privilegios mínimos necesita un usuario para crear tablas y procedimientos?

**R**: Privilegios de sistema necesarios:
- `CREATE SESSION` — conectarse a la base de datos.
- `CREATE TABLE` — crear tablas en su propio esquema.
- `CREATE PROCEDURE` — crear procedimientos, funciones y paquetes PL/SQL.
- `CREATE VIEW` — crear vistas.
- `CREATE SEQUENCE` — crear secuencias.
- Cuota de espacio en un tablespace (`QUOTA UNLIMITED ON users` o `QUOTA 100M ON users`).

Alternativamente, se puede otorgar el rol `RESOURCE` que incluye CREATE TABLE, CREATE PROCEDURE, CREATE SEQUENCE, CREATE TRIGGER, CREATE TYPE, CREATE CLUSTER, CREATE OPERATOR, CREATE INDEXTYPE (varía según versión).

---

## P6: ¿Cuándo usar VARCHAR2 vs CHAR vs CLOB?

**R**:
- **VARCHAR2(n)**: para texto de longitud variable hasta 4000 bytes. Ideal para nombres, emails, direcciones, códigos de longitud variable. Solo almacena el espacio utilizado + 1-2 bytes de overhead.

- **CHAR(n)**: para texto de longitud fija hasta 2000 bytes. Revisartil para códigos estandarizados de longitud fija: `CHAR(2)` para códigos de país ISO ('AR', 'BR', 'CL'), `CHAR(1)` para flags ('S'/'N'). Rellena con espacios a la derecha.

- **CLOB**: para texto de gran tamaño (hasta 128 TB). Usar para documentos, XML/JSON extensos, comentarios largos, descripciones de productos. No se puede usar en WHERE con LIKE sin funciones especiales (DBMS_LOB).

---

## P7: ¿Qué es el esquema HR y por qué es útil para aprendizaje?

**R**: El esquema **HR** (Human Resources) es un esquema de ejemplo incluido en Oracle Database. Contiene 7 tablas relacionadas que modelan una empresa: EMPLOYEES, DEPARTMENTS, JOBS, JOB_HISTORY, LOCATIONS, COUNTRIES, REGIONS.

Es útil porque:
- Representa un modelo relacional realista y bien normalizado.
- Contiene datos suficientes para practicar SELECT, JOINs, subconsultas y agregación.
- Permite practicar DML (INSERT, UPDATE, DELETE) en entorno seguro.
- Las relaciones (FK, self-referencing) permiten estudiar integridad referencial.
- Es el esquema usado en la documentación oficial y certificaciones Oracle.

---

## P8: ¿Cómo se verifica que un usuario está desbloqueado?

**R**:

```sql
SELECT username, account_status, lock_date
FROM dba_users
WHERE username = 'HR';
```

El campo `account_status` muestra:
- **OPEN**: cuenta activa y desbloqueada.
- **LOCKED**: cuenta bloqueada (muchos intentos fallidos o bloqueo manual).
- **EXPIRED**: contraseña vencida.
- **EXPIRED & LOCKED**: contraseña vencida y cuenta bloqueada.

También se puede consultar si un usuario está bloqueado específicamente:
```sql
SELECT username, account_status
FROM dba_users
WHERE account_status LIKE '%LOCKED%';
```

Para desbloquear: `ALTER USER hr ACCOUNT UNLOCK;`

---

## P9: ¿Qué información contiene el diccionario de datos?

**R**: El diccionario de datos es un conjunto de tablas y vistas de solo lectura que almacenan metadatos sobre la base de datos. Contiene:

- **Estructura**: definiciones de tablas, columnas, tipos de datos, constraints (DBA_TABLES, DBA_TAB_COLUMNS, DBA_CONSTRAINTS).
- **Usuarios y privilegios**: usuarios, roles, grants (DBA_USERS, DBA_ROLE_PRIVS, DBA_TAB_PRIVS).
- **Almacenamiento**: tablespaces, datafiles, segmentos, extensiones (DBA_TABLESPACES, DBA_DATA_FILES, DBA_SEGMENTS).
- **Performance**: estadísticas, índices, planes de ejecución (DBA_INDEXES, V$SQL, V$SQL_PLAN).
- **Vistas dinámicas (V$)**: información en tiempo real sobre la instancia, sesiones, locks, esperas (V$SESSION, V$LOCK, V$INSTANCE).

Se organiza en tres niveles: USER_ (objetos propios), ALL_ (objetos accesibles), DBA_ (todos los objetos).

---

## P10: ¿Qué diferencia hay entre una arquitectura de base de datos contenerizada (CDB/PDB) y la tradicional?

**R**:

**Arquitectura tradicional (Non-CDB)**:
- Una base de datos = una instancia con su propio diccionario de datos.
- Cada base de datos requiere su propia memoria, procesos y administración.
- Consume más recursos al desplegar múltiples bases.

**Arquitectura Multitenant (CDB/PDB) — desde Oracle 12c**:
- **CDB (Container Database)**: base de datos raíz (CDB$ROOT) que contiene metadatos comunes y uno o más PDBs.
- **PDB (Pluggable Database)**: base de datos portable con su propio diccionario de datos para objetos de usuario.
- **CDB$ROOT** almacena usuarios comunes y metadata compartida.
- **PDB$SEED**: plantilla de solo lectura para crear nuevos PDBs.

**Ventajas**:
- Múltiples PDBs comparten la misma instancia (memoria, procesos).
- Administración centralizada (backup, parches, upgrades).
- Portabilidad: mover un PDB entre CDBs con poco downtime.
- Eficiencia en uso de recursos.
- Ideal para consolidación de bases de datos y entornos cloud.

