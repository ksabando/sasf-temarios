---
sidebar_label: "Cuestionario"
---
# Preguntas y Respuestas - Strings y Numeros en PL/SQL

## 1. Cuales son las diferencias clave entre VARCHAR2, CHAR y CLOB?
VARCHAR2 almacena texto de longitud variable hasta 32767 bytes en PL/SQL (4000 en SQL). CHAR almacena texto de longitud fija, rellenando con espacios si el dato es mas corto. CLOB (Character Large Object) almacena hasta 128 TB de texto. Usar VARCHAR2 por defecto; CHAR solo para codigos de longitud siempre fija; CLOB para documentos, logs o contenido extenso.

## 2. Como funciona SUBSTR y cual es la diferencia entre posicion positiva y negativa?
`SUBSTR(cadena, inicio, largo)` extrae una subcadena. Si inicio es positivo, cuenta desde el principio (1-indexado). Si inicio es negativo, cuenta desde el final. Si se omite largo, extrae hasta el final. Ej: `SUBSTR('Oracle PL/SQL', 8, 2)` => 'PL'; `SUBSTR('Oracle PL/SQL', -4)` => '/SQL'.

## 3. Que funciones de expresiones regulares estan disponibles en Oracle?
Oracle soporta: REGEXP_LIKE (similar a LIKE pero con patrones regex), REGEXP_REPLACE (reemplaza ocurrencias de un patron), REGEXP_SUBSTR (extrae subcadena que coincide con el patron), REGEXP_INSTR (retorna posicion del patron), y REGEXP_COUNT (cuenta ocurrencias del patron). Soportan flags como 'i' (case-insensitive), 'm' (multiline), 'g' (global).

## 4. Cual es la diferencia entre NUMBER y PLS_INTEGER? Cuando usar cada uno?
NUMBER almacena numeros de cualquier precision y escala (hasta 38 digitos) usando aritmetica decimal. PLS_INTEGER es un entero nativo con aritmetica de hardware, mucho mas rapido para calculos, pero limitado a -2^31 a 2^31-1. Usar PLS_INTEGER para contadores de loops e indices de colecciones; NUMBER para valores financieros que requieren precision decimal exacta.

## 5. Explica la diferencia entre ROUND y TRUNC con ejemplos.
ROUND redondea al valor mas cercano: `ROUND(3.14159, 2)` => 3.14, `ROUND(3.14159)` => 3. TRUNC trunca sin redondear: `TRUNC(3.14159, 2)` => 3.14, `TRUNC(3.999, 0)` => 3. Ambos aceptan un segundo parametro de decimales (negativo para redondear/truncar a la izquierda del punto decimal).

## 6. Como funcionan ROW_NUMBER, RANK y DENSE_RANK? En que se diferencian ante empates?
ROW_NUMBER asigna un numero unico secuencial dentro de cada particion, incluso ante empates (el orden entre empates es arbitrario). RANK asigna el mismo numero a los empates pero salta numeros (1,1,3,4,...). DENSE_RANK asigna el mismo numero a empates sin saltar (1,1,2,3,...). Elegir segun el requerimiento de negocio: sin gaps, secuencial unico, o saltos.

## 7. Que hacen LEAD y LAG y que parametros aceptan?
LEAD(col, offset, default) accede al valor de una fila N posiciones adelante de la actual. LAG(col, offset, default) accede al valor N posiciones atras. Offset por defecto es 1. Default es el valor a retornar si no existe la fila (bordes de la particion). Ambas requieren ORDER BY en la clausula OVER y aceptan PARTITION BY para reiniciar por grupo.

## 8. Para que sirve PARTITION BY en funciones analiticas?
PARTITION BY divide el conjunto de filas en grupos independientes (ventanas) y la funcion analitica se reinicia para cada grupo. Es analogo a GROUP BY pero sin colapsar las filas. Ej: `ROW_NUMBER() OVER (PARTITION BY departamento_id ORDER BY salario DESC)` numera a los empleados de cada departamento por separado.

## 9. Cual es la diferencia entre TRANSLATE y REPLACE?
REPLACE sustituye una subcadena completa por otra: `REPLACE('ABCABC', 'AB', 'XY')` => 'XYCXYC'. TRANSLATE sustituye caracter por caracter: `TRANSLATE('ABC', 'AB', '12')` => '12C' (A->1, B->2, C sin reemplazo). TRANSLATE es util para eliminar caracteres especificos o mapeos uno a uno.

## 10. Como se implementa un CHECK constraint para validar formato de email?
```sql
CONSTRAINT ck_email_valido CHECK (
    REGEXP_LIKE(email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
)
```
Tambien se puede validar con condiciones mas simples usando LIKE: `CHECK (email LIKE '%@%.%')`. Los CHECK constraints se evaluan en cada INSERT y UPDATE, garantizando la integridad de datos a nivel de motor, independientemente de la aplicacion.

