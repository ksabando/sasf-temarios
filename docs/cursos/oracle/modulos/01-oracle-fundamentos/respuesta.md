---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Respuesta 2: Listar tablespaces

```sql
-- Como usuario con privilegios DBA
SELECT tablespace_name, status, contents, logging
FROM dba_tablespaces
ORDER BY tablespace_name;

-- Como usuario regular
SELECT tablespace_name FROM user_tablespaces;
```

**Tablespaces típicos encontrados**:
| TABLESPACE | Propósito |
|------------|-----------|
| SYSTEM | Diccionario de datos |
| SYSAUX | Auxiliar de SYSTEM |
| UNDOTBS1 | Deshacer (rollback) |
| TEMP | Ordenamiento temporal |
| USERS | Datos de usuarios |

**Respuesta**: Generalmente 5 o más tablespaces. Los obligatorios son SYSTEM (diccionario), SYSAUX (auxiliar), y undo y temp para operaciones transaccionales.

---

## Respuesta 3: Desbloquear usuario HR

```sql
-- Paso 1: Conectarse como usuario con privilegios
-- sqlplus system/password@XE

-- Paso 2: Desbloquear HR
ALTER USER hr IDENTIFIED BY hr ACCOUNT UNLOCK;

-- Paso 3: Otorgar privilegios
GRANT CREATE SESSION TO hr;
GRANT CREATE TABLE TO hr;
GRANT CREATE PROCEDURE TO hr;
GRANT CREATE VIEW TO hr;
GRANT CREATE SEQUENCE TO hr;
GRANT CREATE TRIGGER TO hr;
GRANT UNLIMITED TABLESPACE TO hr;

-- O usar roles predefinidos
GRANT CONNECT, RESOURCE TO hr;

-- Paso 4: Verificar estado
SELECT username, account_status, default_tablespace
FROM dba_users
WHERE username = 'HR';
```

**Salida esperada**:
```
USERNAME    ACCOUNT_STATUS    DEFAULT_TABLESPACE
HR          OPEN              USERS
```

---

## Respuesta 4: Conectarse como HR y listar tablas

```sql
-- Conectarse como HR
-- sqlplus hr/hr@XE

-- Listar tablas del esquema
SELECT table_name FROM user_tables ORDER BY table_name;
```

**Tablas del esquema HR** (7 tablas):
| TABLE_NAME |
|------------|
| COUNTRIES |
| DEPARTMENTS |
| EMPLOYEES |
| JOBS |
| JOB_HISTORY |
| LOCATIONS |
| REGIONS |

Para contar:
```sql
SELECT COUNT(*) AS cantidad_tablas FROM user_tables;
```

---

## Respuesta 5: Explorar estructura EMPLOYEES

```sql
DESCRIBE employees;
```

O usando diccionario:
```sql
SELECT column_name, data_type, data_length, nullable
FROM user_tab_columns
WHERE table_name = 'EMPLOYEES'
ORDER BY column_id;
```

**Estructura de EMPLOYEES**:

| COLUMN_NAME | DATA_TYPE | DATA_LENGTH | NULLABLE |
|-------------|-----------|-------------|----------|
| EMPLOYEE_ID | NUMBER | 22 | N |
| FIRST_NAME | VARCHAR2 | 20 | Y |
| LAST_NAME | VARCHAR2 | 25 | N |
| EMAIL | VARCHAR2 | 25 | N |
| PHONE_NUMBER | VARCHAR2 | 20 | Y |
| HIRE_DATE | DATE | 7 | N |
| JOB_ID | VARCHAR2 | 10 | N |
| SALARY | NUMBER | 22 | Y |
| COMMISSION_PCT | NUMBER | 22 | Y |
| MANAGER_ID | NUMBER | 22 | Y |
| DEPARTMENT_ID | NUMBER | 22 | Y |

**Clasificación de tipos**:
- **NUMBER**: EMPLOYEE_ID, SALARY, COMMISSION_PCT, MANAGER_ID, DEPARTMENT_ID — valores numéricos para IDs y montos.
- **VARCHAR2**: FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, JOB_ID — texto de longitud variable.
- **DATE**: HIRE_DATE — fecha de contratación.

**¿Por qué HIRE_DATE es DATE y no VARCHAR2?**
- Permite cálculos de fechas (antigüedad, MONTHS_BETWEEN).
- Validación automática (no se puede insertar '2025-02-30').
- Formateo flexible con TO_CHAR (idioma, formato).
- Ordenamiento cronológico correcto (no alfabético como con VARCHAR2 '01-01-2025' vs '02-01-2024').
- Almacenamiento eficiente: DATE ocupa 7 bytes, VARCHAR2 ocuparía al menos 10 bytes.

---

## Respuesta 6 (Extra): Constraints de EMPLOYEES

```sql
SELECT constraint_name, constraint_type, search_condition
FROM user_constraints
WHERE table_name = 'EMPLOYEES';
```

**Constraints típicos**:
| CONSTRAINT_NAME | TYPE | SEARCH_CONDITION |
|-----------------|------|------------------|
| EMP_EMP_ID_PK | P | (PRIMARY KEY) |
| EMP_EMAIL_UK | U | (UNIQUE) |
| EMP_SALARY_MIN | C | salary > 0 |
| EMP_DEPT_FK | R | (FOREIGN KEY → DEPARTMENTS) |
| EMP_JOB_FK | R | (FOREIGN KEY → JOBS) |
| EMP_MANAGER_FK | R | (FOREIGN KEY → EMPLOYEES) |

- **EMAIL único**: `EMP_EMAIL_UK` (UNIQUE constraint).
- **Salario mínimo**: `EMP_SALARY_MIN` (CHECK constraint: `salary > 0`).

Para ver detalle de FK:
```sql
SELECT a.constraint_name, a.column_name,
       c.r_constraint_name,
       c_pk.table_name AS referenced_table,
       c_pk.column_name AS referenced_column
FROM user_cons_columns a
JOIN user_constraints c ON a.constraint_name = c.constraint_name
LEFT JOIN user_cons_columns c_pk ON c.r_constraint_name = c_pk.constraint_name
WHERE a.table_name = 'EMPLOYEES'
AND c.constraint_type = 'R';
```

