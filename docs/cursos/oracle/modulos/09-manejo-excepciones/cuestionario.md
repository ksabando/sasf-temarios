---
sidebar_label: "Cuestionario"
---
# Preguntas y Respuestas - Manejo de Excepciones en PL/SQL

## 1. Cuales son las excepciones predefinidas mas comunes en Oracle y que las causa?
Las mas frecuentes son: NO_DATA_FOUND (SELECT INTO no retorna filas), TOO_MANY_ROWS (SELECT INTO retorna mas de una fila), ZERO_DIVIDE (division por cero), DUP_VAL_ON_INDEX (violacion de indice unico), INVALID_NUMBER (conversion de string a numero fallida), VALUE_ERROR (error aritmetico o de conversion), y LOGIN_DENIED (credenciales invalidas).

## 2. Como se captura NO_DATA_FOUND correctamente y que error comun se debe evitar?
Se captura en el bloque EXCEPTION con `WHEN NO_DATA_FOUND THEN ...`. El error comun es meter toda la logica en un mismo bloque y que un NO_DATA_FOUND esperado en una parte afecte a otra. Lo correcto es aislar cada SELECT INTO en su propio sub-bloque con su propio manejo, o usar cursores explicitos para consultas que pueden no devolver filas.

## 3. Que es PRAGMA EXCEPTION_INIT y para que se utiliza?
`PRAGMA EXCEPTION_INIT` asocia un codigo de error Oracle (SQLCODE negativo) a un nombre de excepcion definido por el usuario. Permite capturar por nombre errores que no tienen una excepcion predefinida. Ej: `PRAGMA EXCEPTION_INIT(e_fk_violada, -2292);` permite luego escribir `WHEN e_fk_violada THEN ...` en lugar de `WHEN OTHERS THEN IF SQLCODE = -2292 ...`.

## 4. Cual es la diferencia entre RAISE y RAISE_APPLICATION_ERROR?
RAISE lanza una excepcion que debe ser capturada en algun nivel del bloque PL/SQL. RAISE_APPLICATION_ERROR genera un error con codigo personalizado (-20000 a -20999) y mensaje, que se propaga hasta el cliente como un error Oracle standard. RAISE es interno a PL/SQL; RAISE_APPLICATION_ERROR es visible para la aplicacion cliente.

## 5. Como funciona la propagacion de excepciones en bloques anidados?
Si una excepcion ocurre en un bloque interno y no es capturada alli, se propaga al bloque externo. Si el externo tiene un manejador para esa excepcion, la captura; si no, sigue subiendo. Si llega al nivel mas alto sin ser capturada, se devuelve como error al cliente. SE puede usar RAISE dentro de un manejador para re-lanzar la excepcion despues de hacer log.

## 6. Por que es peligroso usar WHEN OTHERS THEN NULL? Que alternativa se recomienda?
`WHEN OTHERS THEN NULL` silencia cualquier error, incluyendo errores graves que nunca deberian ignorarse. Oculta bugs, corrompe datos silenciosamente y hace imposible el debugging. La alternativa correcta es capturar excepciones especificas primero y, si se usa WHEN OTHERS, como minimo loguear el error (SQLCODE, SQLERRM) y luego hacer RAISE para no tragarlo.

## 7. Que es la integridad referencial y como se implementa en Oracle?
La integridad referencial garantiza que las relaciones entre tablas sean validas. Se implementa con FOREIGN KEY constraints. Las opciones ON DELETE son: CASCADE (elimina hijos), SET NULL (establece NULL en hijos). Las violaciones generan ORA-02291 (no existe padre al insertar/actualizar hijo) y ORA-02292 (existen hijos al eliminar padre).

## 8. Como se puede capturar una violacion de FK y mostrar un mensaje amigable al usuario?
Se usa PRAGMA EXCEPTION_INIT para asociar el codigo Oracle a un nombre, y luego RAISE_APPLICATION_ERROR con un mensaje descriptivo:
```sql
DECLARE
    e_fk_hijos EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_hijos, -2292);
BEGIN
    DELETE FROM departamentos WHERE id = 10;
EXCEPTION
    WHEN e_fk_hijos THEN
        RAISE_APPLICATION_ERROR(-20001, 'No se puede eliminar: existen empleados en este departamento.');
END;
```

## 9. En que orden se deben capturar las excepciones en el bloque EXCEPTION?
Las excepciones se evaluan en orden secuencial. Se deben capturar primero las mas especificas y dejar WHEN OTHERS al final. Si se pone WHEN OTHERS primero, capturara todo y las excepciones especificas posteriores nunca se ejecutaran. Oracle evalua el primer WHEN que coincida y solo ejecuta ese manejador.

## 10. Cuales son las mejores practicas para el manejo de errores en PL/SQL?
1) Capturar excepciones especificas antes que OTHERS. 2) Siempre loguear SQLCODE y SQLERRM en tablas de error o usar DBMS_OUTPUT. 3) Usar RAISE_APPLICATION_ERROR para errores de negocio con mensajes claros para el usuario. 4) Nunca silenciar errores con WHEN OTHERS THEN NULL. 5) Aislar operaciones riesgosas en sub-bloques con su propio manejo. 6) Documentar que excepciones puede lanzar cada procedimiento.

