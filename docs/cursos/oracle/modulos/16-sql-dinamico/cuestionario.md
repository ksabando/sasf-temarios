---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Módulo 11 — SQL Dinámico y Metadata-Driven Design: Preguntas y Respuestas

## 1. ¿Qué es EXECUTE IMMEDIATE y en qué casos es necesario usarlo?

EXECUTE IMMEDIATE ejecuta sentencias SQL construidas como cadenas en tiempo de ejecución. Es necesario cuando: la estructura de la consulta no se conoce en compilación (tablas o columnas variables), se necesita ejecutar DDL dinámicamente (CREATE, ALTER, DROP), o se construyen consultas basadas en metadatos o configuración del usuario.

## 2. ¿Por qué deben usarse bind variables con USING en lugar de concatenar valores?

Las bind variables previenen SQL Injection (los valores no pueden alterar la estructura de la consulta), mejoran el rendimiento al permitir que Oracle reutilice planes de ejecución (soft parse en lugar de hard parse), y evitan problemas de formateo de tipos de datos (fechas, strings con comillas). Solo los valores de filtro pueden bindearse; nombres de tablas y columnas no.

## 3. ¿Cómo se puede prevenir SQL Injection cuando se deben usar nombres de tablas o columnas dinámicos?

Como los identificadores (tablas, columnas) no pueden pasarse como bind variables, deben validarse contra el diccionario de datos. Se consulta `USER_TABLES` o `ALL_TAB_COLUMNS` para verificar que el identificador existe antes de concatenarlo. Otra estrategia es usar un whitelist de valores permitidos, rechazando cualquier entrada que no esté explícitamente autorizada.

## 4. ¿Qué diferencias hay entre EXECUTE IMMEDIATE y DBMS_SQL?

EXECUTE IMMEDIATE es más simple y nativo para la mayoría de casos. DBMS_SQL ofrece mayor control: permite describir columnas dinámicamente (cuando no se conoce el número ni tipo de columnas en compilación), ejecutar el mismo cursor múltiples veces con diferentes binds, y manejar consultas con estructura completamente desconocida. DBMS_SQL es más verboso y tiene mayor overhead.

## 5. ¿Cómo se recuperan múltiples filas con SQL dinámico?

No se puede usar EXECUTE IMMEDIATE con INTO para múltiples filas. En su lugar se usa OPEN FOR con un cursor variable (SYS_REFCURSOR). La cadena SQL dinámica se pasa al OPEN FOR, y luego se recorre el cursor con FETCH como un cursor normal. Esto permite devolver conjuntos de resultados dinámicos desde funciones y procedimientos.

## 6. ¿Qué es un Database Link (DBLINK) y cómo se relaciona con SQL dinámico?

Un DBLINK permite consultar objetos en otra base de datos Oracle de forma transparente, usando la sintaxis `tabla@dblink`. En SQL dinámico se puede crear sinónimos para objetos remotos vía EXECUTE IMMEDIATE, o construir consultas que referencien tablas remotas dinámicamente. Los DBLINK requieren configuración TNS y credenciales en el servidor local.

## 7. ¿Qué es el modelo EAV (Entity-Attribute-Value) y cuándo se justifica su uso?

EAV almacena atributos como filas en lugar de columnas: una tabla con entity_id, attribute_id y value. Se justifica cuando los atributos varían enormemente entre entidades (ej: diferentes tipos de exámenes médicos por paciente) y no es práctico crear columnas para todos. El costo es mayor complejidad de consulta (requiere pivoteo) y pérdida de tipado fuerte.

## 8. ¿Qué precauciones deben tomarse al ejecutar DDL desde SQL dinámico?

El DDL ejecutado con EXECUTE IMMEDIATE hace COMMIT implícito antes y después de la operación, lo que puede afectar la transacción en curso. Debe validarse que los nombres de objetos sean seguros (sin inyección). Además, quien ejecuta debe tener los privilegios adecuados (CREATE TABLE, DROP, etc.), que idealmente se otorgan mediante roles o procedimientos con AUTHID DEFINER.

## 9. ¿Qué información proporciona el diccionario de datos para el diseño metadata-driven?

Las vistas `USER_TABLES`/`ALL_TABLES` muestran las tablas existentes; `USER_TAB_COLUMNS` detalla columnas, tipos y nulabilidad; `USER_CONSTRAINTS` expone PK, FK, CHECK y UNIQUE; `USER_INDEXES` lista los índices creados; `USER_SOURCE` contiene el código PL/SQL. Esta metadata permite generar código dinámico, validar identificadores, y construir APIs genéricas.

## 10. ¿Cuándo es preferible el modelo tradicional (columnas fijas) sobre EAV?

El modelo tradicional es preferible cuando los atributos son conocidos, estables y aplican a todas las entidades. Ofrece mejor rendimiento en consultas (sin pivoteo), integridad referencial nativa (FK y CHECK), tipos de datos validados por el motor, y mayor simplicidad de desarrollo. EAV solo se justifica cuando la variabilidad de atributos es extrema e impredecible.

