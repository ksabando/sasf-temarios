---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Módulo 15 — Optimización y Modelado para Performance: Preguntas y Respuestas

## 1. ¿Qué información proporcionan las vistas USER_OBJECTS, USER_ERRORS y USER_SOURCE?

USER_OBJECTS muestra todos los objetos del esquema (nombre, tipo, estado VALID/INVALID, fechas de creación y modificación). USER_ERRORS contiene los errores de compilación de objetos PL/SQL (línea, posición, texto del error). USER_SOURCE almacena el código fuente de procedimientos, funciones, packages y tipos. Juntas permiten diagnosticar y mantener la base de objetos PL/SQL.

## 2. ¿Qué familias de vistas del diccionario de datos existen y quién puede acceder a cada una?

USER_: objetos propiedad del esquema actual (todos los usuarios pueden consultarlas). ALL_: objetos a los que el usuario tiene acceso (propios + aquellos sobre los que tiene privilegios). DBA_: todos los objetos de la base de datos (requiere privilegios DBA como SELECT ANY DICTIONARY). Cada familia incluye variantes como TABLES, TAB_COLUMNS, INDEXES, CONSTRAINTS, etc.

## 3. ¿Cómo se pueden recompilar objetos PL/SQL inválidos?

Individualmente: `ALTER PROCEDURE/FUNCTION/PACKAGE/TRIGGER nombre COMPILE`. Masivamente: un bloque PL/SQL que recorra USER_OBJECTS filtrando por STATUS = 'INVALID' y ejecute ALTER dinámico para cada objeto. Los objetos se invalidan cuando cambia un objeto del que dependen (ej: una tabla referenciada). Oracle los recompila automáticamente al primer uso, pero la recompilación explícita evita errores en producción.

## 4. ¿Qué es DBMS_PROFILER y cómo ayuda en la optimización de PL/SQL?

DBMS_PROFILER mide el tiempo de ejecución línea por línea del código PL/SQL, identificando exactamente qué líneas consumen más tiempo y cuántas veces se ejecutan. Permite enfocar los esfuerzos de optimización en el código que realmente impacta el rendimiento (cuellos de botella), en lugar de optimizar basándose en suposiciones. Los resultados se consultan en las tablas PLSQL_PROFILER_DATA y PLSQL_PROFILER_UNITS.

## 5. ¿Qué es RESULT_CACHE y en qué tipo de funciones conviene aplicarlo?

RESULT_CACHE almacena el resultado de una función en la memoria SGA compartida. Cuando la función se vuelve a llamar con los mismos parámetros, devuelve el resultado cacheado sin re-ejecutar. Conviene en funciones determinísticas llamadas frecuentemente con pocos valores de entrada distintos, que acceden a datos que cambian poco. La cláusula RELIES_ON invalida la caché cuando la tabla referenciada se modifica.

## 6. ¿Por qué es importante usar BULK COLLECT con LIMIT en lugar de BULK COLLECT sin límite?

BULK COLLECT sin LIMIT carga todas las filas en memoria de una vez, lo que puede agotar la PGA y causar errores de memoria si el conjunto de resultados es grande. Con LIMIT se procesa en lotes (ej: 1000 filas por iteración), manteniendo el uso de memoria constante sin importar el tamaño total del resultado. Esto combina la eficiencia del procesamiento masivo con la seguridad de memoria controlada.

## 7. ¿Qué son las vistas materializadas y en qué se diferencian de las vistas normales?

Las vistas materializadas almacenan físicamente el resultado de una consulta en disco (tienen datos propios), mientras que las vistas normales son virtuales (solo almacenan la definición SQL). Las materializadas mejoran el rendimiento de consultas con agregaciones pesadas al evitar recalcular cada vez. Requieren refresco periódico (COMPLETE o FAST) para mantenerse sincronizadas con las tablas base.

## 8. ¿Qué ventajas y desventajas tiene la desnormalización como estrategia de optimización?

Ventajas: evita JOINs costosos en consultas frecuentes, acelera reportes y dashboards. Desventajas: introduce redundancia de datos (riesgo de inconsistencia), requiere mecanismos de sincronización (triggers, jobs), aumenta el espacio en disco, y complica las operaciones DML porque deben actualizar múltiples copias del mismo dato. Solo se justifica cuando el beneficio de lectura supera el costo de escritura.

## 9. ¿Qué tipos de índices existen en Oracle y cómo elegir el adecuado?

B-tree: para columnas con alta cardinalidad (IDs, fechas). Bitmap: para baja cardinalidad (estados, flags). Function-based: cuando se filtra por función aplicada a columna (UPPER, LOWER). Composite: cuando las consultas filtran por múltiples columnas juntas. La elección depende del patrón de consulta real (WHERE, JOIN, ORDER BY), no del diseño teórico. Cada índice adicional ralentiza DML, por lo que debe justificarse.

## 10. ¿Qué es el particionamiento de tablas y cuándo conviene implementarlo?

El particionamiento divide una tabla grande en segmentos físicos más pequeños (particiones) basados en un criterio como rango de fechas, lista de valores o hash. Conviene cuando: las tablas tienen millones de filas, las consultas suelen filtrar por el criterio de partición (partition pruning), se necesita purgar datos antiguos eficientemente (DROP PARTITION vs DELETE), o se requiere distribuir I/O entre diferentes tablespaces.

