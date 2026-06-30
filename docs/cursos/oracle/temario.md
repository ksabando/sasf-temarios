---
sidebar_position: 2
sidebar_label: "Temario"
---

## Estructura de cada Módulo

Cada módulo tiene su carpeta en `Modulos/` con 5 archivos:

| Archivo | Propósito |
|---------|-----------|
| `clase.md` | Lección teórica con ejemplos y sección de modelado de tablas |
| `ejercicio.md` | Enunciados de ejercicios prácticos (4-6 por módulo) |
| `respuesta.md` | Soluciones completas con código compilable |
| `diap.pptx` | Diapositivas PowerPoint (8-10 slides) para dictar la clase |
| `cuestionario.md` | 10 preguntas de nivel medio con respuestas |

---

## SEMANA 1 — Fundamentos de Oracle y SQL

> **Objetivo:** Dominar el entorno Oracle, sentencias SQL, JOINs y lógica de programación antes de entrar a PL/SQL.

---

### Módulo 01 — Oracle Fundamentos
- `01-Oracle-Fundamentos/`

- Arquitectura Oracle (instancia vs base de datos, SGA, PGA)
- Instalación y configuración de Oracle Database
- SQL Developer y SQL*Plus: conexión, comandos básicos
- Tipos de datos en Oracle
- Creación de usuarios y asignación de privilegios
- Gestión de tablespaces
- **Modelado:** Esquema HR como ejemplo de modelo relacional

---

### Módulo 02 — SQL Consultas
- `02-SQL-Consultas/`

- SELECT, WHERE, ORDER BY, GROUP BY, HAVING
- Funciones de cadena: SUBSTR, INSTR, UPPER, LOWER, REPLACE, CONCAT
- Funciones numéricas: ROUND, TRUNC, MOD, ABS, CEIL, FLOOR
- Funciones de fecha: SYSDATE, ADD_MONTHS, MONTHS_BETWEEN, LAST_DAY
- Funciones de conversión: TO_CHAR, TO_DATE, TO_NUMBER, NVL, NVL2, COALESCE, DECODE
- **Modelado:** Validar el modelo con consultas SQL. Granularidad y GROUP BY.

---

### Módulo 03 — SQL Objetos de Base de Datos
- `03-SQL-Objetos/`

- DDL: CREATE, ALTER, DROP, TRUNCATE, RENAME
- Restricciones: PK, FK (ON DELETE CASCADE/SET NULL), UNIQUE, CHECK, NOT NULL
- DML: INSERT, INSERT ALL, UPDATE, DELETE, MERGE INTO
- Índices: B-Tree, Bitmap, Function-Based
- Secuencias: CREATE SEQUENCE, NEXTVAL, CURRVAL
- Sinónimos: públicos y privados
- Vistas: simples, complejas, WITH CHECK OPTION
- Diccionario de datos: DBA_, ALL_, USER_
- **Modelado:** Diseño físico. Relaciones 1:1, 1:N, N:M. Caso práctico: órdenes de compra.

---

### Módulo 04 — JOINs
- `04-JOINs/`

- INNER JOIN, LEFT/RIGHT OUTER JOIN, FULL OUTER JOIN
- CROSS JOIN, SELF JOIN, NATURAL JOIN
- Sintaxis ANSI vs Oracle legacy (+)
- ON vs WHERE (diferencia crítica en OUTER JOINs)
- Múltiples JOINs y orden de operaciones
- JOIN con subconsultas, vistas y CTEs
- Rendimiento: Nested Loop, Hash Join, Merge Join
- **Modelado:** Los JOINs revelan la calidad del modelo: sobre-normalización, relaciones incorrectas.

---

### Módulo 05 — Lógica de Programación
- `05-Logica-Programacion/`

- Algoritmos: definición, características, representación
- Pseudocódigo y diagramas de flujo
- Estructuras de control: secuencial, condicional, iterativa
- Variables, tipos de datos, operadores, scope
- Funciones y procedimientos (concepto)
- Descomposición de problemas: divide y vencerás
- Depuración mental: tracing en papel
- Patrones comunes: acumulador, búsqueda, máximo/mínimo, contador, swap
- **Modelado:** Cómo la lógica de programación impacta el diseño de tablas.

---

## SEMANA 2 — PL/SQL: Fundamentos + Tipos Escalares

> **Capítulos:** 1, 2, 3, 4, 5, 6, 7, 8, 9
> **Objetivo:** Dominar la sintaxis base, estructuras de control, manejo de errores, strings y números.

---

### Módulo 06 — Introducción a PL/SQL
- `06-Introduccion-PLSQL/`

- Estructura de bloque: DECLARE, BEGIN, EXCEPTION, END
- DBMS_OUTPUT.PUT_LINE y SET SERVEROUTPUT ON
- Variables de sustitución (&, &&)
- Herramientas: SQL*Plus, SQL Developer
- **Modelado:** Introducción al modelado entidad-relación. Entidad, atributo, relación. Dominio: Biblioteca.

---

### Módulo 07 — Fundamentos del Lenguaje PL/SQL
- `07-Fundamentos-Lenguaje/`

- %TYPE y %ROWTYPE
- Tipos escalares: VARCHAR2, NUMBER, DATE, BOOLEAN, CHAR, CLOB
- Constantes, NOT NULL, DEFAULT
- Scope y visibilidad de variables
- Subconsultas: escalares, en línea, correlacionadas
- Operadores de conjunto: UNION, UNION ALL, INTERSECT, MINUS
- ROWNUM, ROWID y paginación
- Funciones analíticas: ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, PARTITION BY
- **Modelado:** Correspondencia tipos PL/SQL — SQL. Elección de dominios. CHECK constraints.

---

### Módulo 08 — Control Condicional e Iterativo
- `08-Control-Condicional/`

- IF / ELSIF / ELSE / END IF
- CASE simple y searched
- LOOP, WHILE LOOP, FOR LOOP
- EXIT WHEN, CONTINUE WHEN, etiquetas
- Secuencias: NEXTVAL, CURRVAL, uso en PL/SQL
- Sinónimos y database links
- **Modelado:** Reglas de negocio en CHECK vs en PL/SQL. Ejemplo: "máximo 5 préstamos".

---

### Módulo 09 — Manejo de Excepciones
- `09-Manejo-Excepciones/`

- Excepciones predefinidas: NO_DATA_FOUND, TOO_MANY_ROWS, ZERO_DIVIDE, DUP_VAL_ON_INDEX
- PRAGMA EXCEPTION_INIT
- RAISE_APPLICATION_ERROR (-20000 a -20999)
- Propagación de excepciones
- **Modelado:** Integridad referencial y excepciones. FK/PK/UNIQUE → excepciones en PL/SQL. Diseñar tablas anticipando errores.

---

### Módulo 10 — Strings y Números
- `10-Strings-Numeros/`

- VARCHAR2 vs CHAR vs CLOB
- Funciones: UPPER, LOWER, TRIM, SUBSTR, INSTR, REPLACE, REGEXP_LIKE, REGEXP_SUBSTR
- NUMBER(p,s) vs PLS_INTEGER vs BINARY_FLOAT
- ROUND, TRUNC, MOD, ABS, POWER, CEIL, FLOOR
- Funciones analíticas avanzadas con ejemplos prácticos
- **Modelado:** Dominios de columnas. Catálogos vs strings libres. CHECK de formato.

---

## SEMANA 3 — Tipos de Datos, Estructuras y SQL en PL/SQL

> **Capítulos:** 10, 11, 12, 14, 15
> **Objetivo:** Dominar fechas, records, colecciones, DML transaccional y cursores.

---

### Módulo 11 — Fechas y Timestamps
- `11-Fechas-Timestamps/`

- DATE vs TIMESTAMP vs TIMESTAMP WITH TIME ZONE
- SYSDATE, SYSTIMESTAMP, ADD_MONTHS, MONTHS_BETWEEN
- EXTRACT, TRUNC(dt), LAST_DAY
- INTERVAL YEAR TO MONTH, INTERVAL DAY TO SECOND
- TO_DATE, TO_CHAR con máscaras
- **Modelado:** Modelado temporal. SCD Type 2. Columnas de auditoría. Tablas históricas. Zonas horarias.

---

### Módulo 12 — Records
- `12-Records/`

- TYPE IS RECORD vs %ROWTYPE
- Records como parámetros y retorno de funciones
- Records anidados
- Vistas simples y complejas
- Vistas materializadas (concepto)
- JOINs: INNER, LEFT, RIGHT, FULL, CROSS, SELF
- **Modelado:** Records como reflejo de filas. Vistas derivadas. Cuándo crear una vista vs consultar.

---

### Módulo 13 — Colecciones
- `13-Colecciones/`

- Associative Arrays (INDEX BY), Nested Tables, VARRAYs
- Métodos: EXISTS, COUNT, FIRST, LAST, PRIOR, NEXT, EXTEND, TRIM, DELETE
- BULK COLLECT y FORALL
- SAVE EXCEPTIONS con SQL%BULK_EXCEPTIONS
- Índices: B-Tree, Bitmap, Function-Based
- **Modelado:** Normalización vs desnormalización. Colecciones como columnas. Star Schema. Trade-offs.

---

### Módulo 14 — DML y Transacciones
- `14-DML-Transacciones/`

- INSERT, UPDATE, DELETE, MERGE en PL/SQL
- SQL%FOUND, SQL%NOTFOUND, SQL%ROWCOUNT
- COMMIT, ROLLBACK, SAVEPOINT, ROLLBACK TO
- PRAGMA AUTONOMOUS_TRANSACTION
- Secuencias en operaciones DML
- Subconsultas correlacionadas en UPDATE
- **Modelado:** Diseño transaccional ACID. Tablas de auditoría. GLOBAL TEMPORARY TABLE. MERGE para sincronización.

---

### Módulo 15 — Cursores
- `15-Cursores/`

- SELECT INTO (cursor implícito)
- CURSOR IS SELECT (explícito) con OPEN/FETCH/CLOSE
- Cursor FOR LOOP (recomendado)
- Cursores paramétricos
- SYS_REFCURSOR y cursor variables
- JOINs en cursores: todos los tipos
- SELF JOIN en cursores
- **Modelado:** Modelado para reportes. Vistas materializadas. Índices para cubrir cursores. Star Schema.

---

## SEMANA 4 — SQL Dinámico y Unidades de Programa

> **Capítulos:** 16, 17, 18, 19, 20, 21
> **Objetivo:** Dominar SQL dinámico, procedures, functions, packages, triggers, optimización y prueba final integradora.

---

### Módulo 16 — SQL Dinámico
- `16-SQL-Dinamico/`

- EXECUTE IMMEDIATE para DDL y DML
- Bind variables (USING clause) — previene SQL Injection
- INTO clause para SELECT dinámico
- OPEN FOR con SQL dinámico y REF CURSOR
- DBMS_SQL: alternativa de bajo nivel
- Database Links (DBLINKS)
- **Modelado:** EAV (Entity-Attribute-Value). Metadatos. Tablas de configuración. Diccionario Oracle.

---

### Módulo 17 — Procedimientos y Funciones
- `17-Procedimientos-Funciones/`

- CREATE OR REPLACE PROCEDURE / FUNCTION
- Parámetros: IN, OUT, IN OUT, DEFAULT, NOCOPY
- Overloading, AUTHID CURRENT_USER vs DEFINER
- Recursividad
- **Modelado:** Table API Pattern. Encapsular acceso a tablas. Abstracción del modelo físico.

---

### Módulo 18 — Packages
- `18-Packages/`

- Package Spec vs Body: encapsulamiento
- Variables de package (estado de sesión)
- Overloading en packages
- Inicialización de package
- Paquetes built-in: DBMS_OUTPUT, UTL_FILE, DBMS_SCHEDULER
- Sinónimos para packages
- **Modelado:** Organización por entidad. Constantes de catálogo. Capas: persistencia vs negocio.

---

### Módulo 19 — Triggers
- `19-Triggers/`

- BEFORE / AFTER / INSTEAD OF
- :OLD y :NEW pseudo-records
- FOR EACH ROW vs statement-level
- WHEN clause
- Triggers compuestos (12c)
- Trigger de auditoría
- **Modelado:** Triggers como guardianes del modelo. Validaciones complejas. Sincronización de tablas derivadas. Cuándo NO usar triggers.

---

### Módulo 20 — Optimización
- `20-Optimizacion/`

- USER_OBJECTS, USER_ERRORS, USER_SOURCE — diagnóstico
- Recompilación de objetos inválidos
- DBMS_PROFILER para cuellos de botella
- RESULT_CACHE en funciones
- BULK COLLECT con LIMIT para datasets enormes
- FORALL para DML masivo
- Diccionario de datos: DBA_, ALL_, USER_
- Vistas materializadas: REFRESH FAST/COMPLETE, ON DEMAND/COMMIT
- **Modelado:** Modelado para rendimiento. Índices estratégicos. Particionamiento. Denormalización controlada.

---

### Módulo 21 — Simulación de Pruebas y Entrevistas
- `21-Simulacion-Entrevista/`

**Módulo capstone integrador.** Simula escenarios reales de entrevistas técnicas y pruebas de selección Oracle PL/SQL.

- 10 ejercicios de complejidad creciente combinando modelado + PL/SQL
- Ejercicios: Préstamos personales, Hotel, Nómina, Inventario, Suscripciones, Delivery, Calificaciones, Helpdesk, Clínica, Subastas
- Cuestionario de 60 preguntas para el entrevistador (6 categorías)
- **Modelado:** Casos reales donde la decisión de diseño impacta directamente la implementación.

---

## Resumen del Calendario

| Semana | Módulos | Fase | Contenido |
|--------|---------|------|-----------|
| **1** | 01 — 05 | Fundamentos Oracle y SQL | Arquitectura, consultas, objetos, JOINs, lógica |
| **2** | 06 — 10 | PL/SQL Básico + Tipos Escalares | Bloques, variables, control, excepciones, strings y números |
| **3** | 11 — 15 | Tipos, Estructuras y SQL en PL/SQL | Fechas, records, colecciones, DML, cursores |
| **4** | 16 — 21 | SQL Dinámico y Unidades de Programa | SQL dinámico, procedures, packages, triggers, optimización, simulación entrevista |

---

## Dominios de Negocio por Fase

Cada fase utiliza un dominio de negocio distinto para practicar modelado de tablas:

| Fase | Dominio | Tablas principales |
|------|---------|-------------------|
| Fundamentos | HR (Oracle) | EMPLOYEES, DEPARTMENTS, JOBS |
| PL/SQL Básico | Biblioteca | LIBROS, AUTORES, MIEMBROS, PRESTAMOS |
| Tipos y SQL en PL/SQL | Tienda / Clínica | PRODUCTOS, VENTAS / PACIENTES, CITAS |
| Unidades de Programa | Gestión de Proyectos | PROYECTOS, TAREAS, EMPLEADOS |

---

## Criterios Generales de Evaluación

| Nivel | Descripción |
|-------|-------------|
| OK **Aprobado** | El código compila, ejecuta sin errores y produce el resultado esperado |
| Revisar **Revisar** | Funciona pero usa anti-patrones (ej: `WHEN OTHERS THEN NULL`, `COMMIT` en loops, concatenación en SQL dinámico) |
| Repetir **Repetir** | No compila, resultado incorrecto, o no entiende el concepto evaluado |

### Rúbrica por ejercicio

- **Corrección funcional (40%):** El código hace lo que se pide
- **Manejo de errores (25%):** Excepciones manejadas correctamente
- **Buenas prácticas (20%):** Nomenclatura, `%TYPE`, no hardcodeo de tipos
- **Eficiencia (15%):** Usa BULK cuando aplica, evita SELECT innecesarios en loops

---

## Línea de Tiempo y Diagrama de Avance (Gantt)

```
SEMANA 1                  SEMANA 2                  SEMANA 3                  SEMANA 4
Fundamentos Oracle+SQL    PL/SQL Básico+Escalares   Tipos+Estructuras+SQL     SQL Dinámico+Unidades Prog.
```

### Hitos por Semana

| Semana | Día | Hito | Módulo | Entregable |
|--------|-----|------|--------|------------|
| **1** | Lun | OK Entorno Oracle configurado | M01 | Conexión HR funcionando |
| **1** | Mar | OK Primeras consultas SQL | M02 | 6 ejercicios SQL resueltos |
| **1** | Mié | OK Tablas creadas con constraints | M03 | DDL de órdenes de compra |
| **1** | Jue | OK Dominio de todos los JOINs | M04 | Consultas multi-tabla |
| **1** | Vie | OK Algoritmos y pseudocódigo | M05 | 10 ejercicios de lógica |
| **2** | Lun | OK Primer bloque PL/SQL | M06 | Bloque anónimo funcionando |
| **2** | Mar | OK %TYPE, %ROWTYPE, analíticas | M07 | Consultas con RANK, LAG |
| **2** | Mié | OK IF/CASE/LOOP en PL/SQL | M08 | Clasificación de empleados |
| **2** | Jue | OK Manejo de errores | M09 | RAISE_APPLICATION_ERROR |
| **2** | Vie | OK Strings y números en PL/SQL | M10 | Funciones string/numéricas |
| **3** | Lun | OK Fechas y timestamps | M11 | Cálculo de antigüedad |
| **3** | Mar | OK Records y vistas | M12 | Vistas con JOINs |
| **3** | Mié | OK Colecciones y BULK | M13 | BULK COLLECT + FORALL |
| **3** | Jue | OK Transacciones ACID | M14 | SAVEPOINT, MERGE |
| **3** | Vie | OK Cursores avanzados | M15 | SYS_REFCURSOR, paramétrico |
| **4** | Lun | OK SQL dinámico seguro | M16 | EXECUTE IMMEDIATE con binds |
| **4** | Mar | OK Procedures y funciones | M17 | Table API Pattern |
| **4** | Mié | OK Packages completos | M18 | Spec + Body + sinónimos |
| **4** | Jue | OK Triggers de auditoría | M19 | :OLD/:NEW, compuesto |
| **4** | Vie | OK Optimización y capstone | M20+M21 | Profiling + Simulación entrevista |

### Progreso Visual

| Semana | Módulos | Avance | Barra de progreso |
|--------|---------|--------|--------------------|
| **1**   | 01 — 05 | 25%   | `#####-------------------`  5/21 |
| **2**   | 06 — 10 | 49%   | `##########--------------` 10/21 |
| **3**   | 11 — 15 | 71%   | `##############---------` 15/21 |
| **4**   | 16 — 21 | 100%  | `#######################` 21/21 |

> Marcar con `X` los módulos completados para seguimiento diario.

---

## Recursos de Referencia

- - **Libro base:** `../Libros/Oracle-pl_sql-programming_6th-edition_2014.pdf`
- - **Oracle Live SQL:** https://livesql.oracle.com
- Y"- **Documentación Oracle:** https://docs.oracle.com/database/121/LNPLS/
- - **SQL Developer:** https://www.oracle.com/tools/sqldeveloper/
- - **Plan de Acción:** `../Plan-Accion-Curso.md`

## Cursos en Video de Referencia

- - **Curso Oracle PL/SQL en español desde cero:** [YouTube Playlist](https://www.youtube.com/watch?v=l6wOghW_gNI&list=PL2Z95CSZ1N4EO3wqFmTBNZXCovLpxkEqB) — Cubre bloques PL/SQL, configuración, procedimientos, funciones, paquetes y más.
- - **Certificación Oracle Database SQL 1Z0-071:** [YouTube Playlist](https://www.youtube.com/watch?v=o0pbrbqgEpY&list=PL2Z95CSZ1N4GnsAClPZq4IreFOw8c9qfh) — Preparación para la certificación oficial de Oracle en SQL. Cubre consultas, DDL, DML, joins, subconsultas y funciones.

