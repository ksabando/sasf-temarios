---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Módulo 09 — DML, Transacciones y Diseño Transaccional: Preguntas y Respuestas

## 1. ¿Qué información proporciona SQL%ROWCOUNT después de una sentencia DML?

`SQL%ROWCOUNT` devuelve el número de filas afectadas por la última sentencia INSERT, UPDATE, DELETE o MERGE ejecutada. Se reinicia con cada nueva sentencia DML. Es útil para verificar si una operación afectó la cantidad esperada de registros y para logging de operaciones masivas.

## 2. ¿Para qué se utiliza la cláusula RETURNING INTO en una sentencia DML?

RETURNING INTO permite recuperar valores de las filas afectadas por un INSERT, UPDATE o DELETE sin necesidad de una consulta SELECT adicional. Es especialmente útil para obtener IDs generados por secuencias (`RETURNING id INTO v_id`) o valores calculados por triggers, reduciendo round-trips a la base de datos.

## 3. ¿Qué diferencia hay entre ROLLBACK y ROLLBACK TO SAVEPOINT?

ROLLBACK deshace todos los cambios desde el inicio de la transacción (o desde el último COMMIT). ROLLBACK TO SAVEPOINT deshace solo los cambios posteriores al savepoint especificado, preservando el trabajo anterior. Esto permite "marcar puntos de control" dentro de una transacción larga y deshacer selectivamente solo las operaciones problemáticas.

## 4. ¿Cuándo se debe usar PRAGMA AUTONOMOUS_TRANSACTION?

Se usa para ejecutar operaciones DML en una transacción independiente que no afecta ni es afectada por la transacción principal. Los casos de uso típicos son: logging de errores (el log debe persistir aunque la transacción principal haga ROLLBACK), auditoría de accesos, y operaciones que requieren COMMIT sin interferir con la lógica transaccional del llamador.

## 5. ¿Qué ventajas ofrece MERGE (UPSERT) frente a ejecutar INSERT y UPDATE por separado?

MERGE combina INSERT y UPDATE en una sola sentencia atómica, reduciendo round-trips y evitando condiciones de carrera. Es ideal para sincronización de datos (ETL), donde no se sabe de antemano si un registro existe o no. También simplifica el código al eliminar la lógica IF EXISTS/INSERT/ELSE/UPDATE.

## 6. ¿Para qué sirven las secuencias (SEQUENCE) y qué significan NEXTVAL y CURRVAL?

Las secuencias generan valores numéricos únicos automáticamente, usados principalmente como claves primarias. `NEXTVAL` obtiene el siguiente valor de la secuencia y la incrementa. `CURRVAL` devuelve el valor actual de la secuencia para la sesión actual (debe haberse llamado a NEXTVAL previamente en la misma sesión).

## 7. ¿Qué es una subconsulta correlacionada y cuándo impacta el rendimiento?

Una subconsulta correlacionada referencia columnas de la consulta externa y se ejecuta una vez por cada fila externa. Si la consulta externa devuelve N filas, la subconsulta se ejecuta N veces, lo que puede degradar severamente el rendimiento. Se recomienda evaluar alternativas con JOIN o funciones ventana cuando N es grande.

## 8. ¿Qué son las Global Temporary Tables (GTT) y cuándo conviene usarlas?

Las GTT son tablas cuyo contenido es privado para cada sesión y se elimina al finalizar la sesión o transacción (ON COMMIT DELETE ROWS o ON COMMIT PRESERVE ROWS). No generan REDO ni UNDO para los datos. Son ideales para staging de datos en procesos batch, almacenamiento temporal intermedio en ETL, y para evitar locks en tablas permanentes.

## 9. ¿Qué significa el principio ACID en bases de datos relacionales?

**Atomicity**: la transacción se ejecuta completamente o no se ejecuta. **Consistency**: la BD pasa de un estado válido a otro. **Isolation**: transacciones concurrentes no se interfieren. **Durability**: los datos commiteados persisten incluso ante fallos del sistema. Oracle implementa ACID mediante UNDO, REDO logs, locks y el modelo de control de concurrencia multiversión.

## 10. ¿Qué precauciones deben tomarse al usar COMMIT dentro de cursores o bloques PL/SQL?

Nunca hacer COMMIT dentro de un cursor FOR LOOP que está leyendo la misma tabla que se modifica, porque puede causar el error ORA-01002 "fetch out of sequence" o saltar filas. Además, los COMMIT frecuentes fragmentan la transacción y pueden dejar datos inconsistentes si ocurre un fallo a mitad del proceso. Es preferible acumular cambios y hacer un solo COMMIT al final.

