---
sidebar_label: "Cuestionario"
---
# Preguntas y Respuestas - Introduccion a PL/SQL

## 1. Que es PL/SQL y como se diferencia de SQL puro?
PL/SQL (Procedural Language/SQL) es una extension procedural de Oracle que integra SQL con estructuras de programacion como variables, condicionales, loops y manejo de excepciones. A diferencia de SQL que es declarativo (describe QUE obtener), PL/SQL permite definir COMO procesar los datos paso a paso, ejecutando bloques completos en el motor de la base de datos.

## 2. Cuales son las cuatro secciones de un bloque PL/SQL y cuales son obligatorias?
Las secciones son: DECLARE (declaracion de variables, opcional), BEGIN (codigo ejecutable, obligatoria), EXCEPTION (manejo de errores, opcional) y END (finalizacion, obligatoria). La barra '/' ejecuta el bloque en SQL*Plus. El bloque mas simple posible es `BEGIN NULL; END;`.

## 3. Para que sirve DBMS_OUTPUT y que configuracion requiere?
DBMS_OUTPUT es un paquete built-in que permite mostrar mensajes de texto durante la ejecucion. Sus funciones principales son PUT_LINE (con salto de linea) y PUT (sin salto). Requiere ejecutar `SET SERVEROUTPUT ON` para que los mensajes sean visibles en SQL*Plus o SQL Developer. Es fundamental para debugging.

## 4. Como funcionan las variables de sustitucion & y && en SQL*Plus?
El caracter `&` solicita al usuario un valor antes de ejecutar. `&variable` pregunta cada vez que aparece; `&&variable` pregunta solo la primera vez y almacena el valor para reusos posteriores en la misma sesion. `DEFINE variable = valor` predefine valores y `UNDEFINE variable` los elimina.

## 5. Explica la diferencia entre un bloque anonimo y un procedimiento almacenado.
Un bloque anonimo no tiene nombre, no se almacena en la base de datos y se compila y ejecuta al vuelo. Un procedimiento almacenado tiene nombre, se compila una vez y se almacena compilado en el esquema, pudiendo invocarse multiples veces. Los bloques anonimos son ideales para scripts y pruebas rapidas.

## 6. Que componentes forman la arquitectura Oracle?
Una instancia Oracle esta compuesta por la SGA (System Global Area: buffer cache, shared pool, redo log buffer) y procesos background (PMON, SMON, DBWn, LGWR, CKPT). La base de datos fisica incluye datafiles, control files y redo log files. La instancia monta y abre la base de datos para que los usuarios puedan acceder.

## 7. Que es una entidad, un atributo y una relacion en modelado ER?
Una entidad representa un objeto del mundo real con existencia independiente (ej: Cliente, Producto). Un atributo es una propiedad o caracteristica de una entidad (ej: nombre, precio). Una relacion es un vinculo entre entidades que puede ser 1:1, 1:N o N:M (ej: un Cliente realiza multiples Pedidos).

## 8. Cuales son las principales diferencias entre SQL Developer y SQL*Plus?
SQL Developer es una GUI moderna con autocompletado, explorador de objetos, plan de ejecucion grafico y editor de depuracion. SQL*Plus es una herramienta de linea de comandos clasica, mas ligera, ideal para scripts automatizados y administracion remota. Ambos ejecutan PL/SQL pero con enfoques diferentes.

## 9. Que es un tablespace y que relacion tiene con los datafiles?
Un tablespace es una unidad logica de almacenamiento que agrupa objetos logicos (tablas, indices). Fisicamente se compone de uno o mas datafiles. Por ejemplo, el tablespace USERS contiene los datos de los usuarios y puede estar formado por users01.dbf y users02.dbf. La separacion logica/fisica facilita la administracion.

## 10. Por que es importante modelar antes de programar en PL/SQL?
El modelado define la estructura de datos antes de escribir codigo, evitando redisenos costosos. Un buen modelo ER identifica entidades, relaciones y restricciones, lo que se traduce en un esquema de base de datos solido. Programar sin modelo lleva a inconsistencias, datos redundantes y codigo dificil de mantener.

