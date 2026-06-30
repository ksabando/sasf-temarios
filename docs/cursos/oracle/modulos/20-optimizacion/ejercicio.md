---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: BULK COLLECT con LIMIT — Comparación de rendimiento

Crear un procedimiento `comparar_rendimiento` que:

1. Inserte 50,000 tareas de prueba en un proyecto (usar un loop para generarlas)
2. Procese esas tareas de DOS formas diferentes y mida el tiempo de cada una:

   **Método A — Cursor FOR LOOP tradicional:**
   ```sql
   FOR r IN (SELECT * FROM tareas WHERE proyecto_id = v_proy_id) LOOP
       -- simular procesamiento: actualizar un flag
       UPDATE tareas SET horas_reales = horas_reales + 1 WHERE id = r.id;
   END LOOP;
   ```

   **Método B — BULK COLLECT con LIMIT 1000:**
   - Usar FETCH con BULK COLLECT LIMIT 1000
   - Procesar cada lote
   - Usar FORALL para las actualizaciones

3. Mostrar el tiempo transcurrido para cada método usando `DBMS_UTILITY.GET_TIME`

**Pregunta:** ¿Cuál método es más rápido y por qué? Explicar en comentarios.

---

## Ejercicio 3: Función con RESULT_CACHE

Crear una función `get_nombre_empleado` con `RESULT_CACHE RELIES_ON (EMPLEADOS)`.

La función debe:
1. Recibir `p_empleado_id`
2. Consultar y retornar el nombre del empleado
3. Tener `RESULT_CACHE RELIES_ON (EMPLEADOS)`

**Demostración de mejora:**

```sql
SET TIMING ON;

-- Llamada 1 (sin caché → va a disco)
SELECT get_nombre_empleado(1) FROM dual;

-- Llamada 2 (con caché → memoria)
SELECT get_nombre_empleado(1) FROM dual;

-- Probar en un loop de 10,000 llamadas al mismo empleado
BEGIN
    FOR i IN 1..10000 LOOP
        v_nombre := get_nombre_empleado(1);
    END LOOP;
END;
/
```

Agregar también una demostración de que la caché se invalida cuando se modifica la tabla EMPLEADOS:

1. Llamar a la función (se guarda en caché)
2. Actualizar un nombre en EMPLEADOS
3. Llamar nuevamente a la función (debe obtener el nuevo valor)

**Pregunta:** ¿Qué pasa con la caché si ejecutamos `UPDATE empleados SET nombre = nombre WHERE id = 1`? ¿Se invalida?

---

## Ejercicio 4: Evaluación y creación de índices

Dado el esquema PROYECTOS-TAREAS-EMPLEADOS, proponer y crear índices para optimizar las siguientes consultas:

**Consulta A — Búsqueda de tareas por proyecto:**
```sql
SELECT * FROM tareas WHERE proyecto_id = 123 ORDER BY fecha_inicio;
```

**Consulta B — Reporte de horas por empleado:**
```sql
SELECT e.id, e.nombre, SUM(t.horas_reales) AS total_horas
FROM empleados e
JOIN tareas t ON e.id = t.responsable_id
WHERE e.id = 456
GROUP BY e.id, e.nombre;
```

**Consulta C — Búsqueda de proyectos por estado y rango de fechas:**
```sql
SELECT * FROM proyectos
WHERE estado = 'E'
  AND fecha_inicio BETWEEN DATE '2026-01-01' AND DATE '2026-06-30'
ORDER BY fecha_inicio;
```

Para cada consulta:
1. Crear el/los índices necesarios
2. Explicar por qué ese índice ayuda (tipo de índice, columnas incluidas, orden)
3. Verificar que el índice se usará con `EXPLAIN PLAN FOR` seguido de `SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY)`

**Extra:** Proponer un índice compuesto que podría servir para más de una consulta.

---

## Ejercicio 5: Consultas al diccionario de datos

Escriba bloques PL/SQL que consulten el diccionario de datos para obtener:

**Parte A — Objetos del esquema:**

1. Liste todos los objetos de su esquema mostrando: nombre, tipo, estado y fecha de creación
2. Filtre solo por PROCEDURE, FUNCTION, PACKAGE y PACKAGE BODY

**Parte B — Columnas de una tabla:**

1. Consulte `USER_TAB_COLUMNS` para la tabla `TAREAS`
2. Muestre: nombre de columna, tipo de dato, longitud, si es nullable
3. Ordene por `column_id`

**Parte C — Sinónimos y DBLinks:**

1. Consulte `USER_SYNONYMS` para ver todos los sinónimos del esquema
2. Consulte `USER_DB_LINKS` para ver los database links configurados

**Parte D — DBA_ (con comentario):**

Explique (como comentario SQL) qué diferencia hay entre `USER_TABLES`, `ALL_TABLES` y `DBA_TABLES`. ¿Cuándo usar cada una?

---

## Ejercicio 6: Vista materializada

Requerimientos:

1. Cree una vista materializada `MV_RESUMEN_MEDICOS` con refresco completo ON DEMAND que tenga:
   - medico_id, nombre del médico, especialidad, total_citas, ultima_fecha_cita
2. Agregue un MV LOG sobre CITAS para permitir refresco rápido
3. Cree una segunda vista materializada `MV_RESUMEN_MEDICOS_FAST` con `REFRESH FAST ON DEMAND`
4. Inserte una nueva cita en CITAS
5. Refresque ambas vistas materializadas:
   - Use `DBMS_MVIEW.REFRESH('MV_RESUMEN_MEDICOS', 'C')` para la completa
   - Use `DBMS_MVIEW.REFRESH('MV_RESUMEN_MEDICOS_FAST', 'F')` para la rápida
6. Consulte ambas vistas y verifique que los datos coinciden
7. Elimine las vistas materializadas y el MV LOG al final
