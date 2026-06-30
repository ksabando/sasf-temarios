---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Módulo 08 — Colecciones en PL/SQL: Preguntas y Respuestas

## 1. ¿Cuáles son los tres tipos de colecciones en PL/SQL y en qué se diferencian?

**Associative Array** (INDEX BY): indexado por PLS_INTEGER o VARCHAR2, no necesita EXTEND, solo existe en PL/SQL. **Nested Table**: puede usarse en SQL y PL/SQL como columna de tabla, necesita EXTEND, permite DELETE dejando huecos. **VARRAY**: tamaño fijo máximo, se almacena inline en la tabla, índices consecutivos sin huecos.

## 2. ¿Qué método de colección se utiliza para verificar si un elemento existe en un índice específico?

`EXISTS(i)`: retorna TRUE si el elemento en el índice `i` existe en la colección. Es especialmente útil en Associative Arrays y Nested Tables donde puede haber huecos por operaciones DELETE.

## 3. ¿Qué es BULK COLLECT y por qué mejora el rendimiento?

BULK COLLECT recupera múltiples filas de una consulta SQL en una colección PL/SQL con una sola operación de cambio de contexto. En lugar de hacer N viajes entre los motores PL/SQL y SQL (uno por fila), se hace uno solo, logrando mejoras de 10x a 100x en velocidad.

## 4. ¿Cómo funciona FORALL y cuál es su diferencia con un FOR LOOP normal?

FORALL ejecuta una sentencia DML una vez por todos los elementos de una colección, cambiando de contexto entre PL/SQL y SQL una sola vez. Un FOR LOOP normal con DML cambia de contexto en cada iteración. FORALL solo puede contener una sentencia DML y debe referenciar elementos de colección indexados.

## 5. ¿Para qué sirve la cláusula SAVE EXCEPTIONS en FORALL?

SAVE EXCEPTIONS permite que FORALL continúe procesando los elementos restantes de la colección aunque algunos fallen. Los errores se capturan luego en el bloque EXCEPTION mediante `SQL%BULK_EXCEPTIONS`, que expone `.COUNT`, `.ERROR_INDEX` y `.ERROR_CODE` de cada fallo.

## 6. ¿Qué tipo de índice Oracle es más adecuado para una columna con baja cardinalidad como "estado" o "género"?

El **Bitmap Index** es ideal para columnas con baja cardinalidad (pocos valores distintos). Oracle puede combinar múltiples bitmap indexes con operaciones AND/OR de forma eficiente. No se recomienda en tablas con muchas operaciones DML concurrentes porque el bloqueo afecta a múltiples filas.

## 7. ¿Cuándo conviene usar un índice Function-Based en lugar de un índice B-Tree estándar?

Cuando las consultas filtran por el resultado de una función aplicada a la columna, como `WHERE UPPER(nombre) = 'ANA'`. Un B-Tree estándar sobre `nombre` no se usaría; el Function-Based sobre `UPPER(nombre)` sí se utiliza, acelerando búsquedas case-insensitive sin modificar la consulta.

## 8. ¿Qué método se usa para conocer el primer y último índice válido de una colección?

`FIRST` retorna el primer índice con elemento existente y `LAST` retorna el último índice con elemento existente. Son indispensables para iterar colecciones dispersas (con huecos) donde un FOR i IN 1..coleccion.COUNT no funcionaría correctamente.

## 9. ¿Cuál es la diferencia entre almacenar una lista de valores como VARRAY vs como Nested Table en una columna de tabla?

VARRAY se almacena inline (dentro de la misma fila), tiene tamaño fijo máximo y mantiene el orden. Nested Table se almacena en una tabla separada (STORE AS), puede crecer sin límite fijo y permite consultar elementos individualmente. VARRAY conviene para datos pequeños y fijos (3 teléfonos); Nested Table para listas variables y consultables.

## 10. ¿Qué riesgos tiene usar colecciones como columnas de tabla en un modelo de datos?

Los principales riesgos son: pérdida de integridad referencial (no se pueden crear FK sobre elementos de la colección), consultas SQL más complejas (requieren TABLE() o joins especiales), dificultad para actualizar elementos individuales, y menor portabilidad entre motores de base de datos. Solo se justifican cuando los datos siempre se consultan juntos y el número de elementos es pequeño y estable.

