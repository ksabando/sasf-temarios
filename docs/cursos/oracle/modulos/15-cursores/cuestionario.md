---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Módulo 10 — Cursores y Modelado de Reportes: Preguntas y Respuestas

## 1. ¿Cuál es la diferencia entre un cursor implícito y uno explícito?

El **cursor implícito** lo abre Oracle automáticamente para SELECT INTO (una sola fila) y sentencias DML. El programador no lo controla; sus atributos se acceden vía SQL%. El **cursor explícito** se declara, abre (OPEN), recorre (FETCH) y cierra (CLOSE) manualmente, permitiendo control fino sobre múltiples filas.

## 2. ¿Qué ventajas tiene el Cursor FOR LOOP sobre el manejo manual con OPEN/FETCH/CLOSE?

El Cursor FOR LOOP maneja automáticamente OPEN, FETCH, la condición de salida (%NOTFOUND) y CLOSE. Es más conciso, menos propenso a errores (no se olvida cerrar el cursor), y Oracle lo optimiza internamente. Es la forma recomendada para la mayoría de los casos donde se necesita recorrer todas las filas de un cursor.

## 3. ¿Qué es SYS_REFCURSOR y en qué escenarios se utiliza?

SYS_REFCURSOR es un tipo predefinido de cursor variable (REF CURSOR débilmente tipado). Se utiliza para: devolver conjuntos de resultados desde funciones y procedimientos a aplicaciones cliente (Java, .NET, Python), pasar cursores como parámetros entre subprogramas, y construir consultas dinámicas donde la estructura del resultado no se conoce en tiempo de compilación.

## 4. ¿Qué son los cursores paramétricos y qué problema resuelven?

Son cursores que aceptan parámetros en su definición, los cuales se pasan al abrir el cursor. Evitan tener que declarar múltiples cursores casi idénticos con diferentes valores fijos en el WHERE. Mejoran la reutilización de código y permiten que el mismo cursor se use con diferentes criterios de filtrado en distintas partes del programa.

## 5. ¿Cuándo se debe usar LEFT JOIN en lugar de INNER JOIN en un cursor de reporte?

LEFT JOIN se usa cuando se necesitan todas las filas de la tabla izquierda, incluso aquellas que no tienen correspondencia en la tabla derecha. En reportes, es típico para: listar todos los pacientes con su cantidad de citas (incluyendo pacientes sin citas), o mostrar todos los productos con sus ventas (incluyendo productos nunca vendidos).

## 6. ¿Qué es un SELF JOIN y en qué tipo de modelos de datos se aplica?

Un SELF JOIN une una tabla consigo misma, usando alias diferentes. Se aplica en modelos con jerarquías o relaciones recursivas: empleados con su supervisor, médicos con su referente, categorías de productos con su categoría padre, o cualquier estructura de árbol/grafo almacenada en una sola tabla.

## 7. ¿Qué diferencia hay entre CROSS JOIN y los demás tipos de JOIN?

CROSS JOIN produce el producto cartesiano: cada fila de la tabla A se combina con cada fila de la tabla B. No usa condición ON. Es útil para generar todas las combinaciones posibles (ej: todos los médicos con todos los horarios disponibles). Debe usarse con precaución porque el número de filas resultantes es filas(A) - filas(B).

## 8. ¿Cómo se relacionan los índices con el rendimiento de los cursores?

Los cursores con WHERE y ORDER BY se benefician de índices que cubran esas columnas. Un índice compuesto sobre (medico_id, fecha_cita) acelera cursores que filtran por médico y ordenan por fecha. Sin embargo, cada índice adicional ralentiza INSERT/UPDATE/DELETE, por lo que deben crearse solo los que correspondan a los patrones de consulta más frecuentes y críticos.

## 9. ¿Por qué se utiliza desnormalización controlada en modelos orientados a reportes?

Para evitar JOINs costosos en cursores de reportes que se ejecutan frecuentemente sobre grandes volúmenes de datos. Se agregan columnas redundantes (ej: nombre del médico en la tabla de citas) que eliminan la necesidad de JOIN en cada consulta. El costo es mayor complejidad de mantenimiento y riesgo de inconsistencia, mitigable con triggers de sincronización.

## 10. ¿Qué atributos de un cursor explícito permiten saber su estado durante el procesamiento?

- `%ISOPEN`: TRUE si el cursor está abierto.
- `%FOUND`: TRUE si el último FETCH devolvió una fila.
- `%NOTFOUND`: TRUE si el último FETCH no devolvió filas (condición de salida del loop).
- `%ROWCOUNT`: número de filas recuperadas hasta el momento en la sesión actual del cursor.

