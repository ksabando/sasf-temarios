---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### Pregunta 2
**Pregunta:** ¿Qué es la tercera forma normal (3FN) y cuándo decidirías desnormalizar intencionalmente una tabla?

**Respuesta esperada:** 3FN elimina dependencias transitivas: cada columna no clave debe depender de la PK completa y no de otras columnas no clave. Se desnormaliza por performance: reports que requieren muchos JOINs, columnas calculadas que se leen frecuentemente pero cambian poco, o data warehousing con esquemas estrella.

**Qué observar:** Debe explicar el trade-off: ganas velocidad de lectura pero pierdes integridad de datos y aumentas complejidad de escritura. Un mal candidato dirá "siempre normalizar" sin considerar contexto.

---

### Pregunta 3
**Pregunta:** Diseña las tablas para un sistema donde un empleado puede trabajar en múltiples departamentos simultáneamente y en cada departamento tener un cargo distinto.

**Respuesta esperada:** Tres tablas: EMPLEADOS (id PK), DEPARTAMENTOS (id PK), ASIGNACIONES (empleado_id FK, departamento_id FK, cargo, fecha_inicio, fecha_fin, PK compuesta). La PK compuesta evita duplicados de asignación.

**Qué observar:** Debe identificar que es una relación N:N con atributos en la tabla de cruce. Malo: intentar meter múltiples departamentos en una sola columna separados por comas.

---

### Pregunta 4
**Pregunta:** ¿Qué tipo de índice crearías para una columna que se usa frecuentemente en `WHERE columna BETWEEN X AND Y`? ¿Por qué?

**Respuesta esperada:** Índice B-tree estándar. Oracle optimiza los rangos con B-tree naturalmente. Para casos específicos de data warehouse con grandes rangos, un índice bitmap podría ser útil (pero solo en tablas con baja concurrencia de escritura).

**Qué observar:** Debe mencionar que los bitmap indexes no son para entornos OLTP. Buen candidato pregunta sobre la cardinalidad de la columna y el volumen de transacciones.

---

### Pregunta 5
**Pregunta:** ¿Qué constraint usarías para asegurar que el sueldo de un empleado nunca sea menor que el sueldo mínimo definido en otra tabla de cargos?

**Respuesta esperada:** No se puede con un CHECK estándar (CHECK no permite subqueries). Opciones: (a) Trigger BEFORE INSERT/UPDATE que valide contra la tabla de cargos. (b) FK a una tabla de sueldos válidos (con PK compuesta cargo+sueldo). (c) Validación en el procedimiento de inserción.

**Qué observar:** Entender los límites de los constraints declarativos es clave. Mal candidato intentará CHECK con subquery o dirá que no hay forma.

---

### Pregunta 6
**Pregunta:** Modela las tablas para un historial de precios de productos donde necesitas saber: precio actual, precio en cualquier fecha pasada, y precio que tendrá en una fecha futura programada.

**Respuesta esperada:** Tabla PRODUCTOS con columnas básicas, tabla HISTORIAL_PRECIOS con producto_id FK, precio, fecha_desde, fecha_hasta (o usar fecha_desde y ventana con LEAD). Para precio actual: `WHERE fecha_desde <= SYSDATE AND (fecha_hasta IS NULL OR fecha_hasta > SYSDATE)`. O enfoque alternativo: tipo_precio (ACTUAL/FUTURO/HISTORICO) con fechas de vigencia.

**Qué observar:** Debe manejar el solapamiento de fechas y cómo asegurar que no haya dos precios vigentes al mismo tiempo.

---

### Pregunta 7
**Pregunta:** ¿Por qué elegirías usar una columna virtual en vez de calcular el valor cada vez en un SELECT?

**Respuesta esperada:** Columna virtual para cálculos determinísticos sobre columnas de la misma fila que se consultan frecuentemente (ej: total = cantidad * precio_unitario). Se puede indexar. No ocupa almacenamiento (se calcula al leer). Revisartil para queries frecuentes pero no para cálculos complejos con JOINs.

**Qué observar:** Que sepa que existe la feature (Oracle 11g+). Limitaciones: no puede referenciar otras tablas, funciones no determinísticas, ni columnas de otras filas.

---

### Pregunta 8
**Pregunta:** ¿Cómo modelarías categorías de productos con subcategorías de profundidad ilimitada?

**Respuesta esperada:** Una sola tabla CATEGORIAS con PK id y FK parent_id autorreferenciada (NULL para categorías raíz). Para consultas jerárquicas usar `CONNECT BY PRIOR` o CTE recursivo (`WITH RECURSIVE`). Alternativa: tabla de cierre (closure table) para consultas más rápidas de ancestros/descendientes.

**Qué observar:** Solución recursiva vs closure table muestra nivel de experiencia. Si solo piensa en 2 niveles, es señal de poca experiencia con jerarquías complejas.

---

### Pregunta 9
**Pregunta:** Tienes una tabla con 50 millones de registros. Necesitas agregar una columna con valor DEFAULT. ¿Qué enfoque usarías para minimizar el impacto en producción?

**Respuesta esperada:** En Oracle 11g+: agregar columna NOT NULL con DEFAULT no es inmediato. En Oracle 12c+: `ALTER TABLE t ADD (col VARCHAR2(10) DEFAULT 'X' NOT NULL)` es inmediato (metadata-only). En versiones anteriores: agregar columna nullable, luego actualizar por lotes con COMMIT cada N filas, luego poner NOT NULL. Usar `DBMS_REDEFINITION` para operaciones complejas.

**Qué observar:** Conocimiento de la versión de Oracle importa. Bueno si menciona probar en ambiente no productivo y medir tiempo.

---

### Pregunta 10
**Pregunta:** ¿Cuál es la diferencia entre `DELETE`, `TRUNCATE` y `DROP`? ¿Cuándo usarías cada uno?

**Respuesta esperada:**
- DELETE: DML, borra filas con/sin WHERE, genera undo (rollback posible), dispara triggers, no libera espacio al tablespace, más lento.
- TRUNCATE: DDL, borra todas las filas, no genera undo por fila (solo desasigna extents), no dispara triggers, libera espacio, más rápido. Implícitamente hace COMMIT.
- DROP: DDL, elimina la tabla completa (estructura + datos).

**Qué observar:** El detalle clave es que TRUNCATE es DDL y hace COMMIT implícito. También que no se puede hacer TRUNCATE con FK referenciando la tabla.

---

## Categoría 2: PL/SQL Fundamental (10 preguntas)

### Pregunta 1
**Pregunta:** ¿Qué diferencia hay entre un parámetro `IN`, `OUT` e `IN OUT` en un procedimiento? ¿Qué restricción tiene IN OUT sobre el tipo de dato?

**Respuesta esperada:**
- IN: solo lectura, valor pasado al procedimiento.
- OUT: solo escritura, valor devuelto al llamador (inicializado a NULL dentro del procedimiento).
- IN OUT: lectura y escritura. No se puede usar con tipos restringidos como constantes o expresiones en la llamada.

**Qué observar:** Que sepa que OUT no trae el valor original (se pierde). Que IN OUT no permite pasar literales.

---

### Pregunta 2
**Pregunta:** ¿Qué son las excepciones `NO_DATA_FOUND` y `TOO_MANY_ROWS`? Escribe un bloque que maneje ambas correctamente.

**Respuesta esperada:** NO_DATA_FOUND cuando SELECT INTO no retorna filas. TOO_MANY_ROWS cuando retorna más de una. Manejo:
```sql
BEGIN
    SELECT col INTO var FROM tabla WHERE cond;
EXCEPTION
    WHEN NO_DATA_FOUND THEN -- asignar default
    WHEN TOO_MANY_ROWS THEN -- usar cursor o agregación
END;
```
No se debe usar `WHEN OTHERS` genérico sin logging.

**Qué observar:** Debe saber que NO_DATA_FOUND no se propaga fuera de un cursor con %NOTFOUND. También que las excepciones no son para control de flujo normal.

---

### Pregunta 3
**Pregunta:** ¿Cómo funciona un cursor `FOR UPDATE` y para qué sirve la cláusula `WHERE CURRENT OF`?

**Respuesta esperada:** FOR UPDATE bloquea las filas seleccionadas para que otras sesiones no las modifiquen hasta que se haga COMMIT/ROLLBACK. WHERE CURRENT OF permite UPDATE/DELETE sobre la fila actual del cursor sin reespecificar la condición WHERE. Simplifica código y asegura que modificas exactamente la misma fila del cursor.

**Qué observar:** Debe saber sobre los locks y que FOR UPDATE puede causar esperas si otra sesión ya lockeó las filas. Puede mencionar NOWAIT o SKIP LOCKED.

---

### Pregunta 4
**Pregunta:** ¿Qué retorna `SQL%ROWCOUNT`? Escribe un UPDATE que indique cuántas filas fueron afectadas.

**Respuesta esperada:** SQL%ROWCOUNT retorna el número de filas afectadas por la última sentencia SQL (INSERT, UPDATE, DELETE, SELECT INTO, MERGE).
```sql
UPDATE empleados SET sueldo = sueldo * 1.1 WHERE depto_id = 10;
DBMS_OUTPUT.PUT_LINE('Filas actualizadas: ' || SQL%ROWCOUNT);
```

**Qué observar:** Debe saber que SQL%ROWCOUNT se resetea con cada nueva sentencia SQL. En procedimientos grandes, guardar el valor en una variable inmediatamente después del DML.

---

### Pregunta 5
**Pregunta:** ¿Qué diferencia hay entre `EXIT` y `CONTINUE` en un loop PL/SQL?

**Respuesta esperada:**
- EXIT: sale completamente del loop (sin condición: `EXIT;`, con condición: `EXIT WHEN condicion;`).
- CONTINUE: salta a la siguiente iteración del loop actual (Oracle 11g+).
- También existe `EXIT nombre_loop` para salir de un loop exterior desde uno anidado.

**Qué observar:** CONTINUE existe desde Oracle 11g, candidatos con experiencia en versiones anteriores quizás no lo conozcan. Es importante que sepan el etiquetado de loops para EXIT/ CONTINUE condicionales.

---

### Pregunta 6
**Pregunta:** ¿Cómo capturarías múltiples excepciones específicas en un mismo bloque? ¿En qué orden las escribes?

**Respuesta esperada:** Con múltiples cláusulas WHEN:
```sql
EXCEPTION
    WHEN NO_DATA_FOUND THEN ...
    WHEN TOO_MANY_ROWS THEN ...
    WHEN OTHERS THEN ...
```
El orden importa porque OTHERS atrapa todo. Las más específicas primero. OTHERS SIEMPRE al final.

**Qué observar:** Que no ponga OTHERS antes de excepciones específicas. Que entienda que OTHERS debe incluir logging (SQLERRM, SQLCODE) y posible RAISE para propagar.

---

### Pregunta 7
**Pregunta:** ¿Para qué sirve `PRAGMA AUTONOMOUS_TRANSACTION`? Dame un ejemplo donde sería necesario usarlo.

**Respuesta esperada:** Permite que un bloque PL/SQL ejecute transacciones independientes de la transacción principal (COMMIT/ROLLBACK propio). Ejemplo clásico: logging de errores (escribir en tabla de log aunque la transacción principal haga ROLLBACK). También para: auditoría, notificaciones, contadores que no deben hacer rollback.

**Qué observar:** Debe mencionar que abusar de transacciones autónomas puede causar problemas de integridad y performance. No se debe usar para evadir locks o modificar datos que la transacción principal está usando.

---

### Pregunta 8
**Pregunta:** ¿Cómo declararías y usarías una variable de tipo registro (`%ROWTYPE`)?

**Respuesta esperada:**
```sql
DECLARE
    v_emp EMPLEADOS%ROWTYPE;
    -- o con cursor:
    CURSOR c_emp IS SELECT nombre, sueldo FROM EMPLEADOS;
    v_reg c_emp%ROWTYPE;
BEGIN
    SELECT * INTO v_emp FROM EMPLEADOS WHERE id = 1;
    DBMS_OUTPUT.PUT_LINE(v_emp.nombre);
END;
```

**Qué observar:** %ROWTYPE se adapta automáticamente a cambios de estructura de tabla (ventaja sobre declarar variables individuales). También %ROWTYPE con cursores es muy útil.

---

### Pregunta 9
**Pregunta:** Explica el ciclo de ejecución de un trigger `BEFORE INSERT ... FOR EACH ROW`. ¿Qué pasa si dentro del trigger haces un COMMIT?

**Respuesta esperada:** Por cada fila insertada: (1) se ejecuta el bloque BEFORE, (2) se inserta la fila, (3) se ejecuta AFTER si existe. No se puede hacer COMMIT/ROLLBACK en un trigger normal (no autónomo). Daría error: "ORA-04092: cannot COMMIT in a trigger". La transacción del trigger es parte de la transacción que disparó el trigger.

**Qué observar:** Debe saber que los triggers son parte de la transacción disparadora. Para hacer COMMIT en un trigger se necesita PRAGMA AUTONOMOUS_TRANSACTION.

---

### Pregunta 10
**Pregunta:** ¿Cuál es el propósito de `DBMS_OUTPUT`? ¿Qué limitaciones tiene para debugging en producción?

**Respuesta esperada:** DBMS_OUTPUT sirve para imprimir mensajes durante el desarrollo. Limitaciones: (a) el buffer tiene tamaño máximo (1M por defecto), (b) solo se ve si el cliente habilita SET SERVEROUTPUT ON, (c) el output se muestra al final del bloque, no en tiempo real, (d) no sirve en producción (llamadas desde aplicación externa). Alternativas: tabla de log, archivo con UTL_FILE, o DBMS_APPLICATION_INFO.

**Qué observar:** Que sepa que DBMS_OUTPUT no es para producción. Un buen candidato menciona alternativas de logging persistente.

---

## Categoría 3: PL/SQL Avanzado (10 preguntas)

### Pregunta 1
**Pregunta:** ¿Qué son los tipos `TABLE OF` y `VARRAY`? Dame un caso de uso para cada uno.

**Respuesta esperada:**
- TABLE OF (nested table o associative array/INDEX BY): colección no acotada, puede crecer dinámicamente. Nested table se puede almacenar en la BD. Associative array (INDEX BY PLS_INTEGER o VARCHAR2) es solo para PL/SQL.
- VARRAY: array de tamaño fijo máximo. Revisartil cuando sabes el número máximo de elementos (ej: días de la semana, teléfonos de contacto máximo 3).

**Qué observar:** Debe diferenciar entre los 3 tipos de colecciones PL/SQL. Associative array es el más usado porque es el más flexible y no requiere inicialización con constructor.

---

### Pregunta 2
**Pregunta:** ¿Qué es `BULK COLLECT` y cómo evitas problemas de memoria al usarlo con tablas muy grandes?

**Respuesta esperada:** BULK COLLECT recupera múltiples filas de una vez en una colección PL/SQL, reduciendo los context switches SQL-PL/SQL. Para evitar problemas de memoria: usar la cláusula LIMIT con FETCH:
```sql
FETCH c BULK COLLECT INTO coleccion LIMIT 1000;
```
Esto procesa en lotes de 1000 filas.

**Qué observar:** Sin LIMIT, BULK COLLECT carga todo en memoria y puede causar ORA-04030 (out of memory). El candidato debe saber que LIMIT es obligatorio para tablas grandes en producción.

---

### Pregunta 3
**Pregunta:** Explica la diferencia entre `FORALL` y un `FOR...LOOP` con sentencias DML. ¿Cuándo usarías SAVE EXCEPTIONS?

**Respuesta esperada:** FORALL envía todas las sentencias DML en un solo paso al motor SQL (un solo context switch), mientras que FOR...LOOP hace un context switch por cada iteración. FORALL es mucho más rápido para operaciones masivas. SAVE EXCEPTIONS permite que el FORALL continúe procesando aunque algunas filas fallen, y luego examinar los errores con SQL%BULK_EXCEPTIONS.

**Qué observar:** Performance es la clave. Para 10000 filas, la diferencia de tiempo puede ser 100x o más. SAVE EXCEPTIONS es importante en cargas donde no quieres que un error detenga todo el proceso.

---

### Pregunta 4
**Pregunta:** ¿Qué es un `PACKAGE` y por qué es preferible usarlo sobre procedimientos y funciones sueltos?

**Respuesta esperada:** Un package agrupa procedimientos, funciones, tipos y variables relacionados. Ventajas: (a) encapsulación (parte pública vs cuerpo privado), (b) sobrecarga de funciones/procedimientos, (c) estado de sesión (variables que persisten durante la sesión), (d) mejora de performance (todo el package se carga en memoria en primera llamada), (e) organización lógica del código.

**Qué observar:** Buen candidato mencionará el ciclo de vida del estado del package y que las variables del package mantienen su valor durante toda la sesión o hasta recompilación.

---

### Pregunta 5
**Pregunta:** ¿Qué es el SQL Dinámico (`EXECUTE IMMEDIATE`) y qué riesgo de seguridad debes considerar? ¿Cómo lo mitigas?

**Respuesta esperada:** EXECUTE IMMEDIATE ejecuta strings SQL construidos en tiempo de ejecución. Riesgo: SQL Injection si concatenas valores del usuario en el string. Mitigación: usar bind variables:
```sql
EXECUTE IMMEDIATE 'UPDATE emp SET salario = :1 WHERE id = :2'
    USING v_salario, v_id;
```
Nunca concatenar valores: `'... WHERE id = ' || v_id` es vulnerable.

**Qué observar:** Debe mencionar SQL injection inmediatamente. Bueno si también menciona DBMS_ASSERT para sanitizar nombres de objetos (tablas, columnas) que no se pueden bindear.

---

### Pregunta 6
**Pregunta:** ¿Cómo funciona `MULTISET` en Oracle? ¿Qué operador usarías para obtener los elementos que están en una colección pero no en otra?

**Respuesta esperada:** MULTISET permite operaciones de conjuntos entre colecciones (nested tables). Operadores: MULTISET UNION, MULTISET INTERSECT, MULTISET EXCEPT. Para diferencia simétrica: `coleccion1 MULTISET EXCEPT coleccion2`. También CARDINALITY() para contar elementos, SUBMULTISET para verificar subconjunto.

**Qué observar:** Es una característica avanzada (Oracle 10g+). Si el candidato la conoce, muestra experiencia profunda con colecciones. Muy útil para comparar datos entre tablas.

---

### Pregunta 7
**Pregunta:** Explica qué hace `DBMS_SCHEDULER` y en qué se diferencia de `DBMS_JOB`.

**Respuesta esperada:** DBMS_SCHEDULER es el reemplazo moderno de DBMS_JOB. Ventajas: (a) expresiones de calendario más flexibles (FREQ=DAILY; BYHOUR=6), (b) cadenas de jobs, (c) prioridades, (d) ventanas de mantenimiento, (e) argumentos con nombre, (f) logging integrado (DBA_SCHEDULER_JOB_LOG). DBMS_JOB es legacy (solo PL/SQL blocks, intervalo numérico, menos control).

**Qué observar:** Oracle recomienda migrar de DBMS_JOB a DBMS_SCHEDULER. Si el candidato solo conoce DBMS_JOB, está desactualizado.

---

### Pregunta 8
**Pregunta:** ¿Qué es una función pipelined (`PIPELINED`) y cuándo la usarías?

**Respuesta esperada:** Una función pipelined retorna filas iterativamente (con PIPE ROW) en vez de acumular toda la colección en memoria. Permite que el consumidor empiece a procesar filas antes de que la función termine. Ideal para ETL, transformaciones de datos grandes, o cuando quieres usar la función en un FROM como tabla:
```sql
SELECT * FROM TABLE(funcion_pipelined(param));
```

**Qué observar:** Diferencia con función normal que retorna colección: la normal espera hasta tener todos los datos, la pipelined entrega incrementalmente. Mejor para datos grandes y streaming.

---

### Pregunta 9
**Pregunta:** ¿Cómo implementarías una caché en memoria usando PL/SQL para evitar consultas repetitivas a una tabla de parámetros?

**Respuesta esperada:** Usando variables de package con carga lazy. Ejemplo:
```sql
CREATE OR REPLACE PACKAGE BODY cache_parametros IS
    TYPE t_cache IS TABLE OF parametros%ROWTYPE INDEX BY VARCHAR2(50);
    v_cache t_cache;

    FUNCTION obtener(p_nombre VARCHAR2) RETURN VARCHAR2 IS
    BEGIN
        IF NOT v_cache.EXISTS(p_nombre) THEN
            SELECT * INTO v_cache(p_nombre) FROM parametros WHERE nombre = p_nombre;
        END IF;
        RETURN v_cache(p_nombre).valor_texto;
    END;
END;
```
También se puede usar `DBMS_RESULT_CACHE` (Oracle 11g+) o Function Result Cache.

**Qué observar:** Solución con associative array INDEX BY es la más común en PL/SQL puro. Mencionar Result Cache muestra conocimiento de features más modernas. Importante: mencionar cuándo invalidar la caché.

---

### Pregunta 10
**Pregunta:** ¿Qué es `DBMS_PARALLEL_EXECUTE` y para qué tipo de tareas lo usarías?

**Respuesta esperada:** Permite ejecutar una misma tarea en paralelo dividiendo los datos en chunks que se procesan concurrentemente. Ideal para actualizaciones masivas (ej: recalcular saldos de 10 millones de cuentas), migraciones de datos, o cualquier DML pesado que se pueda particionar. Usa DBMS_SCHEDULER para los jobs paralelos y maneja automáticamente la distribución.

**Qué observar:** Es una característica avanzada de administración. Conocerla sugiere que el candidato ha lidiado con grandes volúmenes de datos en producción.

---

## Categoría 4: Performance y Optimización (10 preguntas)

### Pregunta 1
**Pregunta:** ¿Cómo identificarías una consulta lenta en Oracle? ¿Qué columnas de `V$SQL` o `DBA_HIST_SQLSTAT` revisarías?

**Respuesta esperada:** Revisar ELAPSED_TIME, CPU_TIME, BUFFER_GETS, DISK_READS, EXECUTIONS en V$SQL. ELAPSED_TIME/EXECUTIONS da tiempo promedio. BUFFER_GETS altos indican muchos bloques leídos (posible falta de índice o full scan). DISK_READS sugiere que los datos no están en buffer cache.

**Qué observar:** Mencionar AWR (Automatic Workload Repository) y ASH (Active Session History) para análisis histórico. Bueno: sabe usar DBMS_XPLAN.DISPLAY_CURSOR para ver el plan de ejecución real (no solo el estimado).

---

### Pregunta 2
**Pregunta:** ¿Qué es el `EXPLAIN PLAN` y por qué el plan estimado a veces difiere del plan real?

**Respuesta esperada:** EXPLAIN PLAN muestra el plan que Oracle ESTIMA que usará. Puede diferir del plan real porque: (a) estadísticas desactualizadas, (b) bind variable peeking con valores atípicos en la primera ejecución, (c) cambios en el volumen de datos, (d) el optimizador decide diferente basado en condiciones de runtime. Para ver el plan real usar: `DBMS_XPLAN.DISPLAY_CURSOR(sql_id)` que muestra el plan que realmente se usó con las estadísticas reales (A-Rows, A-Time, Buffers).

**Qué observar:** Que sepa la diferencia entre plan estimado y real. Que use AUTOTRACE o DBMS_XPLAN.DISPLAY_CURSOR en vez de solo EXPLAIN PLAN.

---

### Pregunta 3
**Pregunta:** ¿Qué es un `HINT` y cuándo lo usarías? ¿Por qué no se recomienda abusar de ellos?

**Respuesta esperada:** Un hint es una directiva al optimizador `/*+ INDEX(t idx) */`. Se usa cuando el optimizador elige un mal plan y no se puede corregir con estadísticas o reescritura SQL. No abusar porque: (a) el plan óptimo puede cambiar con los datos, (b) ocultan problemas de diseño reales, (c) en upgrades de versión los hints pueden volverse contraproducentes, (d) dificultan el mantenimiento.

**Qué observar:** El orden correcto es: (1) actualizar estadísticas, (2) reescribir SQL, (3) crear/ajustar índices, (4) usar hints como último recurso. Mal candidato: usa hints para todo.

---

### Pregunta 4
**Pregunta:** ¿Qué ventaja tiene usar `MERGE` (UPSERT) sobre hacer `IF EXISTS...UPDATE ELSE...INSERT` en PL/SQL?

**Respuesta esperada:** MERGE es una sola sentencia SQL que hace la lógica de INSERT/UPDATE en un solo paso, con un solo context switch. Es más rápido y atómico que un bloque PL/SQL con SELECT + INSERT/UPDATE condicional. Además evita race conditions que podrían ocurrir entre el SELECT y el INSERT/UPDATE en un bloque PL/SQL sin locks.

**Qué observar:** El aspecto de atomicidad es crucial en entornos concurrentes. Un PL/SQL IF-EXISTS-UPDATE-ELSE-INSERT sin FOR UPDATE tiene condición de carrera.

---

### Pregunta 5
**Pregunta:** ¿Qué es el `SQL Tuning Advisor` y cómo lo ejecutarías?

**Respuesta esperada:** Es una herramienta que analiza una sentencia SQL y genera recomendaciones (crear índices, reescribir SQL, recolectar estadísticas, SQL profile). Se ejecuta con:
```sql
DECLARE
    v_task VARCHAR2(30);
BEGIN
    v_task := DBMS_SQLTUNE.CREATE_TUNING_TASK(sql_id => 'xyz');
    DBMS_SQLTUNE.EXECUTE_TUNING_TASK(v_task);
END;
```
Requiere licencia Tuning Pack.

**Qué observar:** Que sepa que requiere licencia adicional (importante para costos). Que también conozca SQL Access Advisor para recomendaciones de índices y materialized views.

---

### Pregunta 6
**Pregunta:** ¿Cómo funciona un índice basado en funciones (`FUNCTION-BASED INDEX`)? Dame un ejemplo concreto cuando sería necesario.

**Respuesta esperada:** Permite indexar el resultado de una función o expresión. Revisartil cuando haces WHERE UPPER(nombre) = 'JUAN' — creas el índice: `CREATE INDEX idx_upper_nombre ON emp (UPPER(nombre))`. También para: comparaciones case-insensitive, cálculos como WHERE salario * 12 > 500000, fechas con TRUNC, o funciones propias (determinísticas).

**Qué observar:** Mencionar que la función debe ser DETERMINISTIC si es definida por el usuario. Bueno: mencionar que tiene costo en inserción/actualización como cualquier índice.

---

### Pregunta 7
**Pregunta:** Al hacer `BULK COLLECT`, ¿por qué es importante usar `LIMIT`? ¿Qué valor de LIMIT sueles usar y por qué?

**Respuesta esperada:** Sin LIMIT, BULK COLLECT carga todas las filas en memoria PGA, pudiendo causar ORA-04030. LIMIT procesa por lotes, manteniendo el uso de memoria constante. Valores típicos: 100 a 1000. Depende del tamaño de la fila: filas anchas (muchas columnas) = LIMIT menor. La ganancia de performance se aplana después de cierto tamaño de lote.

**Qué observar:** Debe saber que es para control de memoria (no de performance). El valor exacto es empírico, pero entre 100-1000 es estándar. Para filas pequeñas, 10000 puede ser aceptable.

---

### Pregunta 8
**Pregunta:** ¿Cuál es la diferencia entre `TABLE FULL SCAN` y `INDEX FAST FULL SCAN`? ¿En qué casos un full scan es mejor que usar índice?

**Respuesta esperada:**
- TABLE FULL SCAN: lee toda la tabla del segmento (orden físico, multiblock reads).
- INDEX FAST FULL SCAN: lee el índice como si fuera una tabla (multiblock reads), pero solo columnas del índice (sin acceder a tabla).
Full scan es mejor cuando: necesitas > 15-20% de las filas de la tabla, la tabla es pequeña, o no tienes índice que cubra todas las columnas del SELECT. El overhead de saltar del índice a la tabla (TABLE ACCESS BY INDEX ROWID) puede ser mayor que leer secuencialmente.

**Qué observar:** El punto de quiebre típico es 5-20% (depende de DB_FILE_MULTIBLOCK_READ_COUNT y clustering factor). Bueno si menciona el clustering factor del índice.

---

### Pregunta 9
**Pregunta:** ¿Qué son los `MATERIALIZED VIEWS` y cuándo los usarías en vez de vistas normales?

**Respuesta esperada:** Una vista materializada (MV) almacena físicamente el resultado de una consulta. Ventajas: (a) evita re-ejecutar consultas complejas (JOINs, agregaciones), (b) se puede indexar, (c) refresco programado (`REFRESH FAST` usando logs de MV, `REFRESH COMPLETE`, `ON COMMIT`). Revisartil para: reports, dashboards, data warehousing, resúmenes precalculados.

**Qué observar:** Diferencia entre REFRESH FAST (solo cambios, requiere MATERIALIZED VIEW LOG) y COMPLETE (trunca y recalcula). El query rewrite es una feature avanzada donde Oracle automáticamente redirige consultas a la MV.

---

### Pregunta 10
**Pregunta:** ¿Cómo medirías que una optimización realmente mejoró la performance? ¿Qué métricas compararías?

**Respuesta esperada:** Comparar antes/después: (a) ELAPSED_TIME (tiempo total), (b) BUFFER_GETS / consistent gets (bloques lógicos leídos - la métrica más objetiva porque no depende de carga del sistema), (c) DISK_READS (physical reads), (d) CPU_TIME. Usar AUTOTRACE o DBMS_XPLAN.DISPLAY_CURSOR con IOSTATS para ver números reales. Hacer múltiples ejecuciones y comparar promedios para eliminar efectos del caching.

**Qué observar:** BUFFER_GETS es la métrica más confiable porque es determinística (no depende de qué haya en buffer cache). Medir solo ELAPSED_TIME puede ser engañoso (varía con la carga).

---

## Categoría 5: Escenarios de Negocio (10 preguntas)

### Pregunta 1
**Pregunta:** *Escenario:* Una empresa necesita llevar el control de vacaciones de sus empleados. Cada empleado acumula 1.25 días por mes trabajado. Los días se pueden tomar en cualquier momento del año siguiente al que se acumulan. Diseña el modelo y la lógica para calcular días disponibles.

**Respuesta esperada:** Tablas EMPLEADOS, PERIODOS_VACACIONES (empleado_id, anio, dias_acumulados), SOLICITUDES_VACACIONES (empleado_id, fecha_inicio, fecha_fin, dias_tomados, estado). Función: `dias_acumulados(emp_id, anio) = MESES_TRABAJADOS * 1.25`. Días disponibles = SUM(dias_acumulados) - SUM(dias_tomados) para períodos cuyo año es < año actual o año anterior según política.

**Qué observar:** Debe preguntar sobre reglas de negocio: ¿se vencen? ¿se pueden transferir? ¿cómo manejar licencias médicas? Un buen modelador pregunta antes de diseñar.

---

### Pregunta 2
**Pregunta:** *Escenario:* Un banco procesa transferencias entre cuentas. Debe ser atómico: si la cuenta origen no tiene fondos, nada ocurre. Si el destino no existe, se revierte todo. ¿Cómo implementarías esto?

**Respuesta esperada:** Un solo procedimiento en una transacción: (1) verificar saldo origen con SELECT FOR UPDATE (lockea la fila), (2) verificar existencia de cuenta destino, (3) debitar origen, (4) acreditar destino, (5) COMMIT. Si cualquier paso falla, ROLLBACK. El FOR UPDATE es crítico para evitar que otra sesión modifique el saldo entre el SELECT y el UPDATE.

**Qué observar:** El SELECT FOR UPDATE para evitar race conditions. También podría usar una constraint CHECK (saldo >= 0) como protección adicional. Bueno si menciona que en sistemas reales se usa idempotency key.

---

### Pregunta 3
**Pregunta:** *Escenario:* Una tienda e-commerce tiene productos con categorías y atributos dinámicos. Algunos productos tienen "talle", "color", otros tienen "memoria RAM", "procesador". No quieres crear una tabla por tipo de producto. ¿Qué modelo usas?

**Respuesta esperada:** Modelo EAV (Entity-Attribute-Value) o mejor, usar JSON en Oracle. Tres tablas: PRODUCTOS base, ATRIBUTOS (nombre de atributo, tipo de dato), VALORES_PRODUCTO (producto_id, atributo_id, valor). O: una columna JSON en PRODUCTOS con todos los atributos dinámicos. Con Oracle 12c+: columna VARCHAR2 con CHECK IS JSON, indexable con JSON indexes.

**Qué observar:** EAV clásico vs JSON moderno. EAV es flexible pero hace queries complejos y lentos. JSON es la tendencia actual en Oracle. Si el candidato menciona ambas opciones con pros/contras, es excelente.

---

### Pregunta 4
**Pregunta:** *Escenario:* Cada medianoche debes recalcular el balance de 200,000 cuentas basado en todas sus transacciones del día. El proceso actual toma 2 horas y necesitas reducirlo. ¿Cómo lo optimizarías?

**Respuesta esperada:** (a) Procesamiento paralelo con DBMS_PARALLEL_EXECUTE dividiendo cuentas en chunks por ID. (b) En vez de recalcular desde cero, mantener saldo acumulado y solo sumar transacciones nuevas del día (incremental). (c) Materialized view refrescada ON COMMIT o periódicamente. (d) Índices en transacciones por cuenta_id + fecha para acceso rápido. (e) Paralelismo con grado PARALLEL en la consulta.

**Qué observar:** Lo más importante es que pregunte si realmente necesita recalcular todo desde cero cada noche. Solución incremental es la más eficiente. Luego paralelismo.

---

### Pregunta 5
**Pregunta:** *Escenario:* Necesitas migrar 500 millones de registros de una tabla antigua a un nuevo esquema con diferentes columnas y transformaciones. No puedes detener el sistema. ¿Cómo lo haces?

**Respuesta esperada:** Estrategia: (1) crear nueva tabla con triggers que sincronicen nuevas inserciones/actualizaciones en la tabla vieja hacia la nueva, (2) migrar datos históricos por lotes con BULK COLLECT LIMIT en horarios de baja carga, (3) verificar consistencia, (4) switch: renombrar tablas o redirigir aplicación, (5) eliminar tabla vieja y triggers. Herramientas: DBMS_PARALLEL_EXECUTE o Oracle GoldenGate para replicación en tiempo real.

**Qué observar:** Debe mencionar la estrategia de doble escritura con triggers para no perder datos durante la migración. También COMMITs frecuentes para evitar UNDO overflow.

---

### Pregunta 6
**Pregunta:** *Escenario:* Un sistema de puntos de fidelidad: clientes acumulan 1 punto por cada $100 gastados. Los puntos vencen al año. Deben poderse canjear por productos (1000 puntos = $10 de descuento). Modela las tablas y explica la lógica de canje.

**Respuesta esperada:** Tablas: CLIENTES, TRANSACCIONES_PUNTOS (cliente_id, tipo='ACUMULACION'/'CANJE', puntos, fecha, fecha_vencimiento, puntos_disponibles), PRODUCTOS_CANJE, CANJES. Lógica canje: (1) calcular puntos disponibles (SUM acumulados no vencidos - SUM canjeados), (2) verificar suficientes, (3) insertar canje, (4) descontar de la acumulación más antigua primero (FIFO).

**Qué observar:** El detalle clave es FIFO para el vencimiento: siempre descontar primero los puntos que están por vencer. Esto requiere un algoritmo más complejo que simple SUM.

---

### Pregunta 7
**Pregunta:** *Escenario:* Sistema con facturación electrónica. Cada factura debe tener un folio único, consecutivo y sin huecos. Múltiples usuarios generan facturas simultáneamente. ¿Cómo implementas el folio consecutivo sin gaps ni locks excesivos?

**Respuesta esperada:** Usar una secuencia (SEQUENCE) para generar los folios pero aceptar que pueden haber gaps (transacciones que hacen rollback). Si es obligatorio sin gaps: tabla FOLIOS con fila única bloqueada con SELECT FOR UPDATE, se obtiene el siguiente, se incrementa, COMMIT inmediato. Pero esto serializa las inserciones y es cuello de botella. Mejor: sequence con gaps y un job nocturno que consolide.

**Qué observar:** Es una pregunta trampa. Folios sin gaps en sistemas concurrentes es casi imposible sin serializar. Buen candidato explica el trade-off y sugiere alternativas (como sequence + justificación de gaps).

---

### Pregunta 8
**Pregunta:** *Escenario:* Plataforma de cursos online. Usuarios compran cursos. Cada curso tiene módulos y cada módulo tiene lecciones. Los usuarios marcan lecciones como completadas. Necesitas saber: % de avance por curso, usuarios que terminaron un curso, tiempo total invertido. Diseña el modelo.

**Respuesta esperada:** Tablas: USUARIOS, CURSOS, MODULOS, LECCIONES, INSCRIPCIONES (usuario_id, curso_id, fecha_compra), PROGRESO (inscripcion_id, leccion_id, completado, fecha_completado, tiempo_segundos). % avance: `COUNT(completado) / total_lecciones * 100`. Curso terminado: todas las lecciones con completado = 'S'. Tiempo total: SUM(tiempo_segundos).

**Qué observar:** Normalizar bien la jerarquía curso→módulo→lección. La tabla PROGRESO es clave. Calcular % es trivial con SQL pero debe pensar en performance con curso de 100 lecciones y 10,000 usuarios.

---

### Pregunta 9
**Pregunta:** *Escenario:* Empresa con 100 sucursales. Cada sucursal tiene su propio inventario. Una vez al día debes consolidar el inventario total en una tabla central. ¿Cómo lo harías eficientemente?

**Respuesta esperada:** Opciones: (a) Materialized view con REFRESH FAST si cada sucursal tiene su MV log, (b) procedimiento con MERGE incremental que solo procese items modificados desde la última consolidación (usando columna last_updated), (c) vista normal UNION ALL si el volumen no es muy grande. La clave es no reprocesar todos los datos cada día.

**Qué observar:** Debe preguntar: ¿las sucursales están en la misma BD o en BD remotas? Si son remotas, necesita database links y considerar latencia. La mejor respuesta depende de la arquitectura.

---

### Pregunta 10
**Pregunta:** *Escenario:* Necesitas implementar un soft-delete (borrado lógico) en varias tablas. ¿Cómo lo harías y qué desafíos introduces?

**Respuesta esperada:** Agregar columna `activo CHAR(1) DEFAULT 'S'` y filtrar con `WHERE activo = 'S'` en todas las queries. Desafíos: (a) todas las queries y FK validations deben considerar el flag, (b) constraints UNIQUE deben incluir el flag o no funcionarán bien (duplicados con activo='N'), (c) FK constraints no pueden validar solo activos, se requiere trigger, (d) acumulación de datos "borrados" afecta performance.

**Qué observar:** Mencionar que cambiar UNIQUE a incluir activo o usar partial indexes. También que los FK son el mayor problema y requieren triggers de validación. Alternativa: crear vistas con WHERE activo='S' y hacer que la aplicación use las vistas.

---

## Categoría 6: Razonamiento Lógico (10 preguntas)

### Pregunta 1
**Pregunta:** Tienes una tabla `TRANSACCIONES` con 1 millón de filas por día. Necesitas un reporte que muestre el TOP 10 de clientes por monto total transado en el mes. La tabla tiene índice en `(fecha, cliente_id, monto)`. Escribe la consulta más eficiente.

**Respuesta esperada:**
```sql
SELECT cliente_id, SUM(monto) total
FROM TRANSACCIONES
WHERE fecha BETWEEN fecha_inicio AND fecha_fin
GROUP BY cliente_id
ORDER BY SUM(monto) DESC
FETCH FIRST 10 ROWS ONLY;
```
Oracle puede usar INDEX FAST FULL SCAN si todas las columnas necesarias están en el índice. Con 12c+: FETCH FIRST es más eficiente que ROWNUM con subquery.

**Qué observar:** FETCH FIRST (12c) vs ROWNUM con subquery (versiones anteriores). Debe notar que el índice cubre todas las columnas necesarias (covering index).

---

### Pregunta 2
**Pregunta:** ¿Qué imprime este bloque y por qué?
```sql
DECLARE
    v_x NUMBER := 5;
BEGIN
    DECLARE
        v_x NUMBER := 10;
    BEGIN
        DBMS_OUTPUT.PUT_LINE(v_x);
    END;
    DBMS_OUTPUT.PUT_LINE(v_x);
END;
```

**Respuesta esperada:** Imprime `10` y luego `5`. El bloque interno declara una nueva variable `v_x` que oculta (shadow) la externa. Al salir del bloque, la interna deja de existir y la externa vuelve a ser visible.

**Qué observar:** Concepto de scope y shadowing. Etiquetar bloques `<<outer>>` permite acceder a la variable externa con `outer.v_x`. Si no entiende shadowing, puede tener bugs sutiles.

---

### Pregunta 3
**Pregunta:** Tienes una tabla `EMPLEADOS` con `id`, `nombre`, `jefe_id` (FK a la misma tabla). Escribe una consulta que muestre: empleado, su jefe, el jefe de su jefe, hasta 4 niveles. ¿Qué cambia si la jerarquía es de profundidad variable?

**Respuesta esperada:**
```sql
SELECT e.nombre empleado,
       j1.nombre jefe,
       j2.nombre jefe_jefe,
       j3.nombre jefe_jefe_jefe
FROM EMPLEADOS e
LEFT JOIN EMPLEADOS j1 ON e.jefe_id = j1.id
LEFT JOIN EMPLEADOS j2 ON j1.jefe_id = j2.id
LEFT JOIN EMPLEADOS j3 ON j2.jefe_id = j3.id;
```
Para profundidad variable: `CONNECT BY PRIOR id = jefe_id START WITH jefe_id IS NULL`.

**Qué observar:** Para 4 niveles fijos, JOINs son más eficientes que CONNECT BY. Pero si la profundidad es variable, CONNECT BY (o CTE recursivo) es la única opción.

---

### Pregunta 4
**Pregunta:** En un sistema de asientos contables, cada asiento debe tener sus débitos iguales a sus créditos (partida doble). ¿Cómo implementarías esta restricción en la base de datos para que sea imposible insertar un asiento desbalanceado?

**Respuesta esperada:** Trigger compuesto (COMPOUND TRIGGER) que acumule débitos y créditos por asiento en variables PL/SQL durante el AFTER EACH ROW, y en AFTER STATEMENT verifique que SUM(débitos) = SUM(créditos). Si no cuadra, RAISE_APPLICATION_ERROR. No se puede con CHECK en cada fila ni con trigger simple por fila porque necesitas el total de todas las filas del asiento.

**Qué observar:** COMPOUND TRIGGER (Oracle 11g+) es la solución correcta. Alternativa: procedimiento de inserción que reciba todas las líneas del asiento como tabla y valide antes de insertar.

---

### Pregunta 5
**Pregunta:** Tienes que elegir entre: (a) 1 tabla grande con columna `tipo_producto` vs (b) 5 tablas separadas por tipo de producto. Los tipos comparten el 70% de las columnas pero tienen algunas columnas específicas. ¿Qué eliges y por qué?

**Respuesta esperada:** Depende del caso de uso, pero generalmente: (a) Single Table Inheritance si haces queries que cruzan tipos frecuentemente, (b) Class Table Inheritance (tabla base + tablas hijas con FK 1:1) si cada tipo tiene muchas columnas únicas y consultas casi siempre por tipo. El modelo (b) es más normalizado pero requiere más JOINs. "No hay respuesta correcta sin entender los patrones de acceso."

**Qué observar:** Es una pregunta de criterio. El candidato debe preguntar sobre los patrones de consulta antes de decidir. Malo: elegir inmediatamente una opción sin hacer preguntas.

---

### Pregunta 6
**Pregunta:** ¿Qué significa que una transacción sea ACID? Explica cada letra con un ejemplo en Oracle.

**Respuesta esperada:**
- **A**tomicity: o todas las operaciones se ejecutan o ninguna (COMMIT/ROLLBACK).
- **C**onsistency: la BD pasa de un estado válido a otro (constraints, triggers).
- **I**solation: transacciones concurrentes no interfieren (niveles READ COMMITTED, SERIALIZABLE).
- **D**urability: una vez commiteado, los cambios sobreviven a caídas (redo logs).

**Qué observar:** Debe explicarlo sin memorizar el acrónimo. Bueno si menciona los niveles de isolation en Oracle y que Oracle por defecto usa READ COMMITTED (a diferencia de otros RDBMS que usan READ UNCOMMITTED o REPEATABLE READ).

---

### Pregunta 7
**Pregunta:** Crea una función que determine si un número es primo. Luego explica cómo optimizarías esta función para verificar si todos los números en una tabla de 1 millón de filas son primos.

**Respuesta esperada:**
```sql
CREATE OR REPLACE FUNCTION es_primo(p_n NUMBER) RETURN BOOLEAN IS
BEGIN
    IF p_n < 2 THEN RETURN FALSE; END IF;
    FOR i IN 2..TRUNC(SQRT(p_n)) LOOP
        IF MOD(p_n, i) = 0 THEN RETURN FALSE; END IF;
    END LOOP;
    RETURN TRUE;
END;
```
Optimización: (a) verificar divisibilidad solo hasta SQRT(n), (b) saltar pares después del 2, (c) precomputar tabla de primos conocidos con Sieve of Eratosthenes en una colección, (d) usar RESULT_CACHE para números repetidos.

**Qué observar:** SQRT(n) es lo mínimo que debe mencionar. Si habla de la Criba de Eratóstenes o caching, es avanzado.

---

### Pregunta 8
**Pregunta:** Tienes dos tablas `A` (100 filas) y `B` (1,000,000 filas) con PKs indexadas. ¿Cuál es la diferencia entre `SELECT * FROM A JOIN B ON A.id = B.a_id` y `SELECT * FROM B JOIN A ON A.id = B.a_id`?

**Respuesta esperada:** Oracle elige el orden óptimo de JOIN independientemente del orden sintáctico. El optimizador basado en costos (CBO) evaluará ambas opciones y elegirá el plan más eficiente. Típicamente comenzará por la tabla más pequeña (A) y hará nested loop o hash join según corresponda. En teoría relacional no hay diferencia; en práctica con Rule-Based Optimizer (obsoleto) sí la había.

**Qué observar:** El orden de las tablas en el FROM no importa en el CBO moderno. Si el candidato dice que importa, está pensando en RBO (Oracle 9i y anterior) y está desactualizado. Puede mencionar el hint LEADING para forzar orden si fuera necesario.

---

### Pregunta 9
**Pregunta:** Necesitas asignar aleatoriamente 1000 clientes VIP a 10 ejecutivos de cuenta de manera equilibrada (100 clientes cada uno). Ningún cliente puede estar con dos ejecutivos. Escribe el código PL/SQL.

**Respuesta esperada:**
```sql
DECLARE
    v_ejecutivo_id NUMBER;
    v_count NUMBER := 0;
BEGIN
    FOR c IN (SELECT id FROM CLIENTES_VIP ORDER BY DBMS_RANDOM.VALUE) LOOP
        v_ejecutivo_id := MOD(v_count, 10) + 1;
        INSERT INTO ASIGNACIONES (cliente_id, ejecutivo_id)
        VALUES (c.id, v_ejecutivo_id);
        v_count := v_count + 1;
    END LOOP;
    COMMIT;
END;
```
Alternativa: ROW_NUMBER() OVER (ORDER BY DBMS_RANDOM.VALUE) y MOD con UPDATE masivo.

**Qué observar:** DBMS_RANDOM.VALUE para aleatoriedad. MOD para round-robin. La lógica es simple pero debe funcionar correctamente. Debe mencionar que no usar ORDER BY en SELECT sin ORDER BY pues el orden no está garantizado.

---

### Pregunta 10
**Pregunta:** Explica qué pasa en este escenario de concurrencia: Sesión A hace `UPDATE empleados SET sueldo = 5000 WHERE id = 1;` (sin COMMIT). Sesión B hace `UPDATE empleados SET sueldo = 6000 WHERE id = 1;`. ¿Qué ocurre y por qué?

**Respuesta esperada:** La Sesión B se queda esperando (bloqueada) hasta que la Sesión A haga COMMIT o ROLLBACK. Oracle usa bloqueo a nivel de fila. Al hacer UPDATE, la Sesión A adquiere un lock exclusivo (TX lock) sobre la fila id=1. La Sesión B intenta adquirir el mismo lock y debe esperar. Cuando A commitea, B obtiene el lock y actualiza a 6000 (sobrescribe). Si A hace ROLLBACK, B actualiza a 6000 sobre el valor original.

**Qué observar:** Mecanismo fundamental de Oracle: lectores no bloquean escritores, escritores no bloquean lectores, pero escritores sí bloquean escritores. La fila se bloquea, no la tabla. Bueno: podría mencionar SELECT FOR UPDATE NOWAIT para no esperar.

---

