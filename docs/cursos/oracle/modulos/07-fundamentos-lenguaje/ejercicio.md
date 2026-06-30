---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Record explícito (TYPE ... IS RECORD)

Crear un bloque anónimo que:

1. Declare un tipo `t_libro` como RECORD con los campos: `isbn`, `titulo`, `anio_publicacion`, `editorial`, `precio`.
2. Declare una variable `v_libro` de ese tipo.
3. Asigne valores directamente a los campos (no usar SELECT):
   - ISBN: `'978-950-1234-78-9'`
   - Título: `'Rayuela'`
   - Año: `1963`
   - Editorial: `'Sudamericana'`
   - Precio: `450.00`
4. Muestre todos los campos en formato de ficha:
   ```
   === FICHA DEL LIBRO ===
   ISBN:       978-950-1234-78-9
   Título:     Rayuela
   Año:        1963
   Editorial:  Sudamericana
   Precio:     $450.00
   ========================
   ```

---

## Ejercicio 4: Scope y bloques anidados

Dado el siguiente esquema:

```sql
DECLARE
    v_mensaje VARCHAR2(30) := 'Bloque principal';
    v_contador NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE(v_mensaje);
    DBMS_OUTPUT.PUT_LINE('Contador en principal: ' || v_contador);

    DECLARE
        v_mensaje VARCHAR2(30) := 'Bloque anidado';
        v_contador NUMBER := 100;
    BEGIN
        DBMS_OUTPUT.PUT_LINE(v_mensaje);
        DBMS_OUTPUT.PUT_LINE('Contador en anidado: ' || v_contador);
        -- incrementar v_contador del bloque principal
    END;

    DBMS_OUTPUT.PUT_LINE('Contador despues del anidado: ' || v_contador);
END;
/
```

**Se pide:**
1. ¿Cuál es la salida del bloque?
2. ¿Cómo se puede modificar (incrementar) el `v_contador` del bloque principal **dentro del bloque anidado**? Reescribir el bloque anidado para que lo logre usando etiquetas de bloque (`<< ... >>`).
3. ¿Qué ocurre si se elimina la línea `v_contador NUMBER := 100;` dentro del bloque anidado? Explicar.

Escribir la versión corregida completa que incremente `v_contador` del principal en 1 dentro del bloque anidado.

---

## Ejercicio 5: Subconsultas — Libros sobre el promedio por editorial

Dada la tabla `LIBROS`, escribir un bloque anónimo que:

1. Declare una variable `v_contador` tipo `NUMBER`.
2. Use un `FOR LOOP` con subconsulta correlacionada para encontrar los libros cuyo precio es **mayor al precio promedio** de los libros de su misma editorial.
3. Mostrar en el formato:
   ```
   ISBN: [isbn] | Título: [titulo] | Editorial: [editorial] | Precio: $[precio]
   ```
4. Al final, mostrar cuántos libros cumplen la condición.

---

## Ejercicio 6: Operadores de conjunto — Reporte de editoriales

Escribir sentencias SQL independientes que respondan:

1. **UNION ALL**: Listar todas las editoriales de la tabla `LIBROS` (pueden repetirse).
2. **UNION**: Listar las editoriales sin repetir.
3. **INTERSECT**: ¿Qué editoriales tienen libros en los años `1960` y `1970`?
4. **MINUS**: ¿Qué editoriales tienen libros publicados después del año 2000 pero no antes de 1980?

**Se pide:**
- Escribir cada sentencia.
- Explicar en un comentario qué diferencia hay entre `UNION` y `UNION ALL` en términos de rendimiento.

**Datos adicionales para probar:**
```sql
INSERT INTO libros VALUES ('978-987-1234-06-6', 'El túnel', 1948, 'Sudamericana', 300.00);
INSERT INTO libros VALUES ('978-987-1234-07-3', 'Sobre héroes y tumbas', 1961, 'Sudamericana', 480.00);
```

---

## Ejercicio 7: Funciones analíticas — Ranking de libros por precio

Usando la tabla `LIBROS`, escribir y ejecutar la siguiente consulta:

```sql
SELECT isbn, titulo, editorial, precio,
       ROW_NUMBER() OVER (PARTITION BY editorial ORDER BY precio DESC) AS posicion,
       RANK()       OVER (PARTITION BY editorial ORDER BY precio DESC) AS ranking,
       DENSE_RANK() OVER (PARTITION BY editorial ORDER BY precio DESC) AS dense_ranking,
       LAG(precio, 1, 0) OVER (PARTITION BY editorial ORDER BY precio DESC) AS precio_anterior
FROM libros;
```

**Se pide:**

1. Ejecutar la consulta anterior.
2. Identificar en el resultado:
   - ¿Cuántos libros tiene cada editorial?
   - ¿Qué diferencia hay entre `posicion`, `ranking` y `dense_ranking` cuando hay precios repetidos en una misma editorial?
3. Escribir una segunda consulta que muestre **solo los 2 libros más caros por editorial** usando `ROW_NUMBER` como filtro (subconsulta en FROM).
