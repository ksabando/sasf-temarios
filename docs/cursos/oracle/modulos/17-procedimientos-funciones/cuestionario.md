---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Módulo 12 — Procedimientos, Funciones y Table API: Preguntas y Respuestas

## 1. ¿Cuál es la diferencia fundamental entre un PROCEDURE y una FUNCTION en PL/SQL?

Un PROCEDURE realiza acciones y puede devolver múltiples valores mediante parámetros OUT. Una FUNCTION siempre retorna un único valor mediante RETURN y puede usarse directamente en expresiones SQL (si cumple las reglas de pureza). La FUNCTION se invoca como parte de una expresión; el PROCEDURE se invoca como sentencia independiente.

## 2. ¿Qué modos de parámetros existen y qué significa cada uno?

**IN**: solo lectura, el valor se pasa desde el llamador al subprograma. Es el modo por defecto. **OUT**: solo escritura, el subprograma asigna un valor que se devuelve al llamador. **IN OUT**: lectura y escritura, el valor entra y puede ser modificado. Los parámetros OUT e IN OUT no pueden tener valor DEFAULT.

## 3. ¿Qué es el hint NOCOPY y qué riesgos conlleva?

NOCOPY solicita que los parámetros OUT e IN OUT se pasen por referencia en lugar de por valor, evitando la copia de datos grandes (colecciones, cursores) al finalizar el subprograma. El riesgo es que si ocurre una excepción, el valor del parámetro es impredecible (puede quedar parcialmente modificado), lo que viola la semántica normal de rollback de parámetros.

## 4. ¿Qué es el overloading (sobrecarga) y qué reglas debe cumplir?

Overloading permite definir múltiples subprogramas con el mismo nombre pero diferente firma (número, tipo u orden de parámetros). Las reglas: los parámetros deben diferir en tipo o cantidad suficiente para que Oracle pueda distinguirlos; no se puede sobrecargar solo por el modo (IN vs OUT); y no se puede sobrecargar solo por el tipo de retorno en funciones.

## 5. ¿Qué diferencia hay entre AUTHID DEFINER y AUTHID CURRENT_USER?

AUTHID DEFINER (default) ejecuta el subprograma con los privilegios del dueño/esquema que lo creó, independientemente de quién lo invoque. AUTHID CURRENT_USER ejecuta con los privilegios del usuario que llama. Esto es crucial en aplicaciones multi-tenant donde diferentes usuarios deben ver diferentes datos o tener diferentes permisos.

## 6. ¿Qué requisitos debe cumplir una función recursiva en PL/SQL?

Debe tener una condición de terminación clara (caso base) que evite la recursión infinita. Oracle limita la profundidad de recursión por el tamaño del stack de llamadas. La recursión es útil para procesar estructuras jerárquicas (árboles, organigramas) o cálculos matemáticos (factorial, Fibonacci), pero generalmente un loop iterativo es más eficiente y no tiene riesgo de stack overflow.

## 7. ¿En qué consiste el Table API Pattern y qué problema resuelve?

El Table API Pattern encapsula todo acceso a una tabla dentro de procedimientos y funciones específicos. Ningún cliente hace INSERT/UPDATE/DELETE directo. Resuelve: acoplamiento entre aplicaciones y esquema físico, dispersión de reglas de negocio, falta de auditoría centralizada, y dificultad para modificar la estructura de tablas sin impactar consumidores.

## 8. ¿Qué beneficios de seguridad aporta el Table API Pattern?

Permite revocar permisos directos de INSERT/UPDATE/DELETE sobre las tablas y otorgar solo EXECUTE sobre los procedimientos de la API. Esto previene que aplicaciones o usuarios maliciosos o con errores modifiquen datos sin pasar por las validaciones de negocio. También permite auditar en un solo punto quién y cuándo modificó cada dato.

## 9. ¿Cuándo NO se recomienda usar el Table API Pattern?

No se recomienda para: catálogos pequeños que raramente cambian (países, monedas); tablas staging/temporales en procesos ETL donde el overhead de la API no se justifica; cuando herramientas de BI requieren acceso SQL directo para generar consultas ad-hoc; o en equipos pequeños donde mantener la API representa más costo que beneficio.

## 10. ¿Qué son las funciones de validación en el contexto del Table API Pattern?

Son funciones booleanas reutilizables que encapsulan reglas de negocio específicas (ej: `validar_presupuesto`, `empleado_tiene_capacidad`, `proyecto_esta_activo`). Se invocan desde los procedimientos de la Table API antes de ejecutar la DML, garantizando que las reglas se apliquen consistentemente sin importar qué procedimiento modifica los datos. También pueden reutilizarse en triggers, reportes y otras capas.

