---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Desbloquear usuario HR

1. Conéctese como SYSTEM o SYS.
2. Desbloquee el usuario HR y asígnele privilegios:

```sql
-- Desbloquear y establecer contraseña
ALTER USER hr IDENTIFIED BY hr ACCOUNT UNLOCK;

-- Otorgar privilegios
GRANT CONNECT, RESOURCE TO hr;
```

3. Verifique que el usuario quedó desbloqueado:
```sql
SELECT username, account_status FROM dba_users WHERE username = 'HR';
```

---

## Ejercicio 4: Conectarse como HR y explorar

1. Conéctese como HR.
2. Liste todas las tablas del esquema:
```sql
SELECT table_name FROM user_tables;
```

**Pregunta**: ¿Cuántas tablas tiene el esquema HR? Nombre cada una de ellas.

---

## Ejercicio 5: Explorar estructura EMPLOYEES

Use el comando DESCRIBE para ver la estructura de la tabla EMPLOYEES:

```sql
DESCRIBE employees;
```

También puede usar esta consulta del diccionario de datos:
```sql
SELECT column_name, data_type, data_length, nullable
FROM user_tab_columns
WHERE table_name = 'EMPLOYEES'
ORDER BY column_id;
```

**Pregunta**: Para cada columna de EMPLOYEES, clasifique su tipo de datos. ¿Por qué HIRE_DATE es DATE y no VARCHAR2? ¿Qué ventajas tiene usar DATE?

---

## Ejercicio 6 (Extra): Verificar constraints del esquema HR

Liste todas las restricciones (constraints) definidas en la tabla EMPLOYEES:

```sql
SELECT constraint_name, constraint_type, search_condition
FROM user_constraints
WHERE table_name = 'EMPLOYEES';
```

**Tipos**: P=PRIMARY KEY, R=FOREIGN KEY, C=CHECK, U=UNIQUE.

**Pregunta**: ¿Qué restricciones aseguran que el email sea único? ¿Qué restricción limita el salario?
