---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Módulo 14 — Triggers y Consistencia del Modelo: Preguntas y Respuestas

## 1. ¿Qué es un trigger en Oracle y cuándo se ejecuta?

Un trigger es un bloque PL/SQL que se ejecuta automáticamente en respuesta a un evento DML (INSERT, UPDATE, DELETE) sobre una tabla o vista. Se dispara sin intervención del usuario o aplicación. Puede ejecutarse BEFORE o AFTER del evento, una vez por sentencia (statement-level) o por cada fila afectada (FOR EACH ROW).

## 2. ¿Qué son :OLD y :NEW y en qué operaciones están disponibles?

Son pseudo-registros que representan el valor de la fila antes (:OLD) y después (:NEW) de la operación DML. En INSERT: :OLD es NULL, :NEW contiene los valores insertados. En UPDATE: :OLD contiene valores anteriores, :NEW los nuevos. En DELETE: :OLD contiene valores antes de eliminar, :NEW es NULL. Solo disponibles en triggers FOR EACH ROW.

## 3. ¿Qué diferencia hay entre un trigger BEFORE y uno AFTER?

BEFORE se ejecuta antes de que la operación DML se complete; permite modificar :NEW (asignar valores default, calcular columnas derivadas) y rechazar la operación con RAISE_APPLICATION_ERROR. AFTER se ejecuta después de que la DML se completa; no puede modificar :NEW pero es ideal para auditoría, propagación a otras tablas y actualización de resúmenes.

## 4. ¿Qué es el problema de la "mutating table" y cómo se evita?

Ocurre cuando un trigger FOR EACH ROW intenta consultar o modificar la misma tabla que disparó el trigger. Oracle lanza ORA-04091 porque la tabla está en estado de cambio y los datos no son consistentes. Se evita usando: triggers compuestos (COMPOUND TRIGGER en Oracle 12c+), PRAGMA AUTONOMOUS_TRANSACTION (para logging), o trasladando la lógica a un trigger AFTER STATEMENT.

## 5. ¿Qué es un trigger compuesto (COMPOUND TRIGGER) y qué ventajas ofrece?

Introducido en Oracle 12c, permite definir múltiples puntos de disparo (BEFORE STATEMENT, BEFORE EACH ROW, AFTER EACH ROW, AFTER STATEMENT) dentro de un solo trigger, compartiendo variables entre ellos. Resuelve el problema de mutating table sin necesidad de code smells como PRAGMA AUTONOMOUS_TRANSACTION para lógica de negocio, y permite acumular información durante el procesamiento de filas para actuar al final.

## 6. ¿Para qué sirve la cláusula WHEN en un trigger?

La cláusula WHEN permite filtrar cuándo se ejecuta el cuerpo del trigger, evaluando una condición sobre :NEW y :OLD. Solo disponible en triggers FOR EACH ROW. Ejemplo: `WHEN (NEW.estado = 'C' AND OLD.estado != 'C')` ejecuta el trigger solo cuando una tarea cambia a completada, evitando ejecución innecesaria en otras actualizaciones.

## 7. ¿Qué es un trigger INSTEAD OF y sobre qué objetos se aplica?

INSTEAD OF se aplica sobre vistas (no sobre tablas) que no son actualizables directamente (vistas con JOIN, GROUP BY, funciones de agregación). En lugar de ejecutar la DML original sobre la vista, Oracle ejecuta el cuerpo del trigger, donde el programador define manualmente cómo traducir la operación en DML sobre las tablas base subyacentes.

## 8. ¿Cuándo NO se deben usar triggers?

No usar triggers para: reglas que pueden implementarse con CHECK o FK constraints, lógica de negocio compleja que debe ser visible y testeable (usar Table API), en tablas con operaciones masivas (los triggers por fila impactan severamente el rendimiento en BULK), o cuando la lógica depende de contexto de aplicación que podría no estar inicializado al dispararse el trigger.

## 9. ¿Cuál es la relación ideal entre Table API y triggers en un modelo de datos?

La Table API es la primera línea de defensa: encapsula las reglas de negocio y el acceso a datos. Los triggers son la red de seguridad que garantiza consistencia cuando alguien hace DML directo (bypassing la API), por error o intencionalmente. Los triggers manejan auditoría automática y sincronización entre tablas; la Table API maneja validaciones complejas y la lógica de negocio principal.

## 10. ¿Qué impacto tienen los triggers en el rendimiento de operaciones masivas?

Los triggers FOR EACH ROW se ejecutan una vez por fila, agregando overhead significativo en INSERT/UPDATE/DELETE masivos. Por ejemplo, un INSERT de 100,000 filas ejecutará el trigger 100,000 veces. Para mitigarlo: minimizar la lógica en triggers, evitar cursores y consultas dentro del trigger, usar triggers compuestos para acumular y procesar al final, o deshabilitar triggers durante cargas batch masivas.

