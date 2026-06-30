---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 2: Capturar DUP_VAL_ON_INDEX

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_total_libros NUMBER;
BEGIN
    INSERT INTO libros (isbn, titulo, anio_publicacion, editorial, precio)
    VALUES ('978-987-1234-01-1', 'El amor en los tiempos del cólera', 1985, 'Sudamericana', 480.00);

    DBMS_OUTPUT.PUT_LINE('Libro insertado correctamente.');

EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        DBMS_OUTPUT.PUT_LINE('Error: El libro con ISBN 978-987-1234-01-1 ya está registrado.');

        -- Contar libros actuales (esto está dentro del bloque EXCEPTION)
        SELECT COUNT(*) INTO v_total_libros FROM libros;
        DBMS_OUTPUT.PUT_LINE('Total de libros en la tabla: ' || v_total_libros);
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error inesperado: ' || SQLERRM);
END;
/
```

**Salida esperada:**
```
Error: El libro con ISBN 978-987-1234-01-1 ya está registrado.
Total de libros en la tabla: 2
```

---

## Solución Ejercicio 3: NO_DATA_FOUND y TOO_MANY_ROWS

### Bloque solicitado:

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_nombre_buscar VARCHAR2(100) := '&nombre';
    v_nombre        miembros.nombre%TYPE;
    v_direccion     miembros.direccion%TYPE;
BEGIN
    SELECT nombre, direccion
      INTO v_nombre, v_direccion
      FROM miembros
     WHERE nombre = v_nombre_buscar;

    DBMS_OUTPUT.PUT_LINE('Miembro: ' || v_nombre || ' — Dirección: ' || v_direccion);

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No se encontró ningún miembro con el nombre ' || v_nombre_buscar || '.');
    WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('Existen varios miembros con el nombre ' || v_nombre_buscar ||
                             '. Sea más específico.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error inesperado: ' || SQLERRM);
END;
/
```

### Respuesta a la pregunta conceptual

> ¿Por qué `SELECT INTO` lanza excepción cuando hay más de una fila?

Porque `SELECT INTO` está diseñado para devolver **exactamente una fila**. Si devuelve cero filas, lanza `NO_DATA_FOUND`. Si devuelve más de una fila, lanza `TOO_MANY_ROWS`. Es un mecanismo de seguridad de Oracle para garantizar que las variables escalares reciban un único valor.

> ¿Qué alternativa usarías para evitar esa excepción si esperas múltiples coincidencias?

Se puede usar:

1. **Cursor explícito** con `SELECT ... WHERE nombre = v_nombre` y procesar fila por fila.
2. **FOR LOOP** con cursor implícito (que no lanza excepciones si hay 0 o N filas).
3. **BULK COLLECT** para obtener todas las filas en una colección.
4. **ROWNUM = 1** si solo se necesita la primera coincidencia (aunque no resuelve el caso de negocio).

**Ejemplo con FOR LOOP (alternativa recomendada):**

```sql
BEGIN
    FOR r IN (SELECT nombre, direccion FROM miembros WHERE nombre = 'Ana García') LOOP
        DBMS_OUTPUT.PUT_LINE('Miembro: ' || r.nombre || ' — Dirección: ' || r.direccion);
    END LOOP;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No se encontraron miembros.');
    END IF;
END;
/
```

---

## Solución Ejercicio 4: RAISE_APPLICATION_ERROR — Límite de préstamos activos

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_id_miembro        NUMBER := 1;
    v_isbn              VARCHAR2(13) := '978-987-1234-01-1';
    v_prestamos_activos NUMBER;
    v_existe_libro      NUMBER;
    v_id_prestamo       NUMBER;
BEGIN
    -- 1. Verificar que el ISBN existe
    SELECT COUNT(*)
      INTO v_existe_libro
      FROM libros
     WHERE isbn = v_isbn;

    IF v_existe_libro = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'El ISBN ' || v_isbn || ' no está registrado.');
    END IF;

    -- 2. Contar préstamos activos del miembro
    SELECT COUNT(*)
      INTO v_prestamos_activos
      FROM prestamos
     WHERE id_miembro = v_id_miembro
       AND estado = 'P';

    -- 3. Validar límite
    IF v_prestamos_activos >= 5 THEN
        RAISE_APPLICATION_ERROR(-20001,
            'El miembro ' || v_id_miembro || ' ya tiene ' || v_prestamos_activos ||
            ' préstamos activos. Límite: 5.');
    END IF;

    -- 4. Insertar el préstamo (generar ID secuencial simple)
    SELECT NVL(MAX(id_prestamo), 0) + 1 INTO v_id_prestamo FROM prestamos;

    INSERT INTO prestamos (id_prestamo, isbn, id_miembro, fecha_prestamo, estado)
    VALUES (v_id_prestamo, v_isbn, v_id_miembro, SYSDATE, 'P');

    DBMS_OUTPUT.PUT_LINE('Préstamo registrado exitosamente. ' ||
                         'Préstamos activos actuales: ' || (v_prestamos_activos + 1));

EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/
```

### Respuesta a la pregunta conceptual

> ¿Por qué esta regla (límite de 5 préstamos activos) no se puede implementar como CHECK constraint de tabla?

Porque **CHECK constraints no pueden contener subconsultas ni hacer referencia a otras filas de la misma u otras tablas**. Una CHECK solo puede validar valores dentro de la misma fila siendo insertada o actualizada. Para saber cuántos préstamos activos tiene un miembro, se necesita hacer `COUNT(*) WHERE id_miembro = X AND estado = 'P'`, lo cual cruza múltiples filas de la tabla `PRESTAMOS`.

**Posibles alternativas en SQL puro (ninguna es práctica):**
- Una `MATERIALIZED VIEW` con `REFRESH ON COMMIT` y una constraint sobre ella.
- Un `TRIGGER` (que es PL/SQL, no CHECK).

En conclusión, cualquier regla que requiera **consultar otras filas** debe implementarse en PL/SQL.

