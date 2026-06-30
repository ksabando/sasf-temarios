---
sidebar_label: "Cuestionario"
---
# Preguntas y Respuestas - Fundamentos del Lenguaje PL/SQL

## 1. Que ventajas ofrece %TYPE frente a declarar el tipo de dato manualmente?
`%TYPE` ancla el tipo de dato de una variable al tipo de una columna de tabla, por lo que si la columna cambia (ej: VARCHAR2(50) a VARCHAR2(100)), la variable se adapta automaticamente. Esto hace el codigo mas mantenible y evita errores por discrepancias de tamano o tipo entre la variable y la columna.

## 2. Para que sirve %ROWTYPE y en que casos es preferible a declarar cada campo por separado?
`%ROWTYPE` declara una variable que hereda toda la estructura de fila de una tabla o cursor. Es preferible cuando se necesita capturar una fila completa con `SELECT * INTO`, ya que evita declarar cada campo individualmente y se mantiene sincronizado con cambios DDL en la tabla. Ej: `v_emp empleados%ROWTYPE;`.

## 3. Explica el concepto de scope (alcance) en PL/SQL con un ejemplo de bloques anidados.
El scope define donde una variable es visible. En bloques anidados, el bloque interno puede acceder a variables del externo, pero no al reves. Si se declara una variable con el mismo nombre en el bloque interno, esta oculta a la externa. Para acceder a la externa se usan etiquetas de bloque: `<<externo>> ... externo.variable`.

## 4. Que diferencia hay entre una subconsulta escalar y una subconsulta correlacionada?
Una subconsulta escalar retorna exactamente un valor (1 fila, 1 columna) y es independiente de la consulta externa. Una subconsulta correlacionada referencia columnas de la consulta externa y se re-evalua por cada fila procesada. Las escalares son mas eficientes; las correlacionadas son necesarias para comparar cada fila con su contexto.

## 5. Cuando usarias UNION en lugar de UNION ALL y cual es el impacto en performance?
UNION elimina duplicados (implica un SORT o HASH para deduplicar), mientras que UNION ALL conserva todos los registros. UNION ALL es mas rapido por evitar la deduplicacion. Se usa UNION solo cuando se necesita garantizar filas unicas entre los conjuntos. Si se sabe que no hay duplicados, siempre UNION ALL.

## 6. Explica la diferencia entre ROWNUM y ROWID y cuando usar cada uno.
ROWNUM es un numero secuencial asignado a las filas en el orden en que son recuperadas (antes del ORDER BY). Se usa para limitar resultados: `WHERE ROWNUM <= 10`. ROWID es la direccion fisica unica de cada fila en un datafile. Se usa para acceso directo ultra-rapido y para detectar duplicados exactos en la misma tabla.

## 7. Que son los operadores INTERSECT y MINUS? Da un ejemplo practico de cada uno.
INTERSECT retorna las filas que aparecen en ambas consultas (interseccion de conjuntos). Ej: "clientes que compraron en enero Y en febrero". MINUS retorna las filas de la primera consulta que NO estan en la segunda (diferencia). Ej: "clientes que compraron en enero pero NO en febrero". Ambos requieren mismo numero y tipo de columnas.

## 8. Cuales son los tipos de datos escalares principales en PL/SQL y como elegir entre ellos?
Los principales son: NUMBER(p,s) para valores numericos con precision, VARCHAR2(n) para texto de longitud variable (preferido sobre CHAR), CHAR(n) para texto de longitud fija (codigos, siglas), DATE para fechas con precision de segundos, y BOOLEAN (TRUE/FALSE/NULL) exclusivo de PL/SQL. Elegir VARCHAR2 sobre CHAR a menos que se requiera longitud fija.

## 9. Que es una funcion analitica y como se diferencia de una funcion de grupo?
Una funcion de grupo (SUM, COUNT, AVG) colapsa multiples filas en un solo resultado por grupo (requiere GROUP BY). Una funcion analitica (ROW_NUMBER, RANK, LEAD, LAG) calcula un valor para cada fila basado en una ventana de filas, sin colapsar el resultset. Se definen con `OVER (PARTITION BY ... ORDER BY ...)`.

## 10. Como defines un dominio de columna en el modelado y que restriccion SQL lo implementa?
Un dominio define el conjunto de valores validos para una columna: tipo de dato + restricciones semanticas. En Oracle se implementa con la restriccion CHECK, por ejemplo: `CONSTRAINT ck_salario CHECK (salario > 0 AND salario <= 50000)`. Tambien se puede combinar con NOT NULL. Los dominios aseguran integridad de datos a nivel de base de datos.

