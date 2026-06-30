---
sidebar_label: "Cuestionario"
---
# Preguntas y Respuestas - Control Condicional e Iterativo

## 1. Cuales son las formas validas de la estructura IF en PL/SQL?
Existen tres formas: `IF condicion THEN ... END IF;` (la mas simple), `IF condicion THEN ... ELSE ... END IF;` (con alternativa), e `IF cond1 THEN ... ELSIF cond2 THEN ... ELSE ... END IF;` (multiple). Notar que es ELSIF (sin E intermedia). Se pueden anidar IFs sin limite, aunque se recomienda no exceder 3-4 niveles por legibilidad.

## 2. Que diferencias hay entre CASE y DECODE? Cual es preferible?
CASE es ANSI SQL, portable entre bases de datos, soporta condiciones complejas (CASE searched con WHEN condicion THEN) y devuelve cualquier tipo de dato. DECODE es especifico de Oracle, solo evalua igualdad simple, y trabaja con tipos limitados. CASE es preferible en codigo nuevo por estandarizacion, legibilidad y flexibilidad.

## 3. Explica la diferencia entre CASE simple y CASE searched con ejemplos.
CASE simple evalua una expresion contra valores: `CASE dia WHEN 'LUNES' THEN 1 WHEN 'MARTES' THEN 2 ELSE 0 END`. CASE searched evalua condiciones booleanas: `CASE WHEN salario > 5000 THEN 'Alto' WHEN salario > 2000 THEN 'Medio' ELSE 'Bajo' END`. El searched es mas potente para rangos y desigualdades.

## 4. Cuales son las diferencias entre LOOP basico, WHILE LOOP y FOR LOOP?
LOOP basico itera indefinidamente hasta un EXIT explicito, dando maximo control. WHILE evalua la condicion al inicio de cada iteracion y puede ejecutar 0 veces. FOR itera un numero fijo de veces con un contador implicito de solo lectura. Se elige segun: WHILE cuando la condicion se conoce, FOR cuando el rango es conocido, LOOP basico cuando el control es complejo.

## 5. Como funciona EXIT WHEN y en que se diferencia de CONTINUE?
EXIT WHEN evalua una condicion y, si es TRUE, sale completamente del loop. CONTINUE (o CONTINUE WHEN) salta el resto del cuerpo del loop y pasa a la siguiente iteracion sin salir. EXIT WHEN termina el ciclo; CONTINUE solo salta una iteracion. Ambos mejoran la legibilidad evitando IFs anidados profundos.

## 6. Que son NEXTVAL y CURRVAL en una secuencia? Hay alguna restriccion en su uso?
NEXTVAL genera y retorna el siguiente valor de la secuencia. CURRVAL retorna el valor actual (el ultimo NEXTVAL generado en la sesion). No se puede usar CURRVAL sin haber invocado NEXTVAL previamente en la misma sesion. No se permiten en subconsultas, vistas con DISTINCT, ni en CHECK constraints. Son ideales para claves primarias.

## 7. Para que sirve un sinonimo en Oracle y que tipos existen?
Un sinonimo es un alias permanente para un objeto de base de datos (tabla, vista, secuencia, procedimiento). Existen sinonimos PUBLICOS (visibles para todos los usuarios) y PRIVADOS (solo para el propietario). Simplifican el acceso a objetos de otros esquemas sin necesidad de calificar con el nombre del esquema: `SELECT * FROM empleados` en vez de `SELECT * FROM hr.empleados`.

## 8. En un FOR LOOP, que ocurre si intentas modificar la variable de control?
La variable de control del FOR LOOP es de solo lectura. Intentar asignarle un valor genera un error de compilacion PLS-00363: "la expresion se esta utilizando como destino de una asignacion". Para manipular el contador manualmente, usar un WHILE LOOP o LOOP basico con una variable declarada explicitamente.

## 9. Que ventajas tiene usar CONTINUE WHEN sobre IF anidado dentro de un loop?
CONTINUE WHEN reduce la indentacion y mejora la legibilidad al evitar IFs anidados. Por ejemplo: `CONTINUE WHEN v_valor IS NULL;` en vez de `IF v_valor IS NOT NULL THEN ... todo el resto del codigo ... END IF;`. Permite expresar condiciones de "salto" al inicio del loop, haciendo que la logica principal quede menos anidada.

## 10. Como se controla el desbordamiento de una secuencia y que es CYCLE/NOCYCLE?
Al crear una secuencia se define: `START WITH`, `INCREMENT BY`, `MAXVALUE` / `NOMAXVALUE`, `CYCLE` o `NOCYCLE`. Con NOCYCLE (default), al alcanzar MAXVALUE, la secuencia lanza error ORA-08004. Con CYCLE, reinicia desde MINVALUE. CYCLE se usa raramente porque puede generar valores duplicados. Para evitarlo, usar un MAXVALUE muy alto o secuencias con incremento = 1 y sin limite.

