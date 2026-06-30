---
sidebar_label: "Cuestionario"
---
# Preguntas y Respuestas - Records, Vistas y Joins

## 1. Que es TYPE IS RECORD y cuando conviene usarlo en lugar de %ROWTYPE?
`TYPE IS RECORD` define una estructura de datos personalizada con campos definidos por el programador. Se usa cuando la estructura necesaria no coincide con ninguna tabla existente, o cuando se necesita combinar campos de multiples tablas en una sola variable. `%ROWTYPE` es preferible cuando la estructura debe reflejar exactamente una tabla o cursor existente.

## 2. Como se declara un record anidado y que ventaja ofrece?
Un record anidado es un record que contiene como campo otro record. Se define primero el record interno y luego se usa como tipo en el externo:
```sql
TYPE rec_direccion IS RECORD (calle VARCHAR2(100), ciudad VARCHAR2(50));
TYPE rec_empleado IS RECORD (nombre VARCHAR2(100), direccion rec_direccion);
```
La ventaja es modelar estructuras jerarquicas complejas en una sola variable, facilitando el paso de datos entre procedimientos.

## 3. Que es una vista simple y que operaciones DML permite?
Una vista simple se basa en una sola tabla, sin funciones de grupo, DISTINCT, ni clausulas complejas. Permite INSERT, UPDATE y DELETE siempre que la vista incluya todas las columnas NOT NULL sin default. Si la vista no incluye todas las columnas requeridas, las operaciones DML fallaran. `WITH CHECK OPTION` fuerza que los cambios via vista cumplan la condicion WHERE de la vista.

## 4. Que es una vista compleja y por que generalmente es de solo lectura?
Una vista compleja incluye joins de multiples tablas, funciones de grupo (SUM, COUNT), DISTINCT, GROUP BY, o subconsultas. Es de solo lectura porque Oracle no puede determinar como distribuir un INSERT/UPDATE/DELETE entre las tablas subyacentes de manera deterministica. Se usan exclusivamente para consulta y reporting.

## 5. En que se diferencia una vista materializada de una vista normal?
Una vista normal es solo una consulta almacenada que se ejecuta cada vez que se referencia (sin almacenamiento fisico). Una vista materializada almacena fisicamente el resultado de la consulta y se refresca periodicamente (ON COMMIT, ON DEMAND). Las materializadas mejoran performance en consultas repetitivas complejas, pero consumen almacenamiento y pueden tener datos desactualizados entre refrescos.

## 6. Cual es la diferencia entre INNER JOIN, LEFT JOIN y FULL OUTER JOIN?
INNER JOIN retorna solo las filas que tienen coincidencia en ambas tablas. LEFT JOIN retorna todas las filas de la tabla izquierda y las coincidencias de la derecha (NULL donde no hay match). FULL OUTER JOIN retorna todas las filas de ambas tablas, con NULL donde no hay coincidencia en la otra. Es la union de LEFT y RIGHT JOIN.

## 7. Que es un SELF JOIN y en que escenarios se utiliza?
Un SELF JOIN es un JOIN de una tabla consigo misma, usando alias diferentes. Se utiliza para consultas jerarquicas o recursivas dentro de la misma tabla, como: empleados y sus gerentes (ambos en tabla empleados), o categorias y subcategorias. Ej: `SELECT e.nombre, g.nombre FROM empleados e JOIN empleados g ON e.gerente_id = g.id`.

## 8. Explica la diferencia entre NATURAL JOIN y JOIN con USING.
NATURAL JOIN une automaticamente por todas las columnas con el mismo nombre en ambas tablas. Es peligroso porque si se agregan columnas con el mismo nombre inadvertidamente, cambia la semantica del join. JOIN con USING especifica explicitamente la(s) columna(s) de join: `JOIN tabla USING (columna_comun)`. USING es mas controlado y seguro que NATURAL.

## 9. Como se usan los records como parametros en procedimientos y funciones?
Los records pueden pasarse como parametros IN, OUT o IN OUT en procedimientos y funciones. Para usarlos en SQL deben declararse a nivel de paquete (package-level). Ej: `PROCEDURE crear_empleado(p_emp IN OUT rec_empleado)`. Esto permite pasar estructuras completas de datos, reduciendo la cantidad de parametros y mejorando la mantenibilidad del codigo.

## 10. Que son las vistas derivadas y como contribuyen al modelado de datos?
Las vistas derivadas son vistas creadas para encapsular consultas complejas o logicas de negocio recurrentes. Contribuyen al modelado como capa de abstraccion: simplifican el acceso a datos, ocultan la complejidad de los joins subyacentes, facilitan el control de seguridad (GRANT sobre vista en lugar de tablas base), y permiten cambiar la estructura fisica sin afectar a las aplicaciones que las consumen.

