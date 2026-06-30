---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 2: Uso de %TYPE

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_titulo libros.titulo%TYPE;
    v_anio   libros.anio_publicacion%TYPE;
    v_precio libros.precio%TYPE;
BEGIN
    SELECT titulo, anio_publicacion, precio
      INTO v_titulo, v_anio, v_precio
      FROM libros
     WHERE isbn = '978-1234567890';

    DBMS_OUTPUT.PUT_LINE('Título: ' || v_titulo || ' | Año: ' || v_anio || ' | Precio: $' || v_precio);
END;
/
```

**Suponiendo que existe el libro, la salida sería:**
```
Título: Cien años de soledad | Año: 1967 | Precio: $520
```

---

## Solución Ejercicio 3: Record explícito

```sql
SET SERVEROUTPUT ON;

DECLARE
    TYPE t_libro IS RECORD (
        isbn            VARCHAR2(13),
        titulo          VARCHAR2(200),
        anio_publicacion NUMBER(4),
        editorial       VARCHAR2(100),
        precio          NUMBER(10,2)
    );

    v_libro t_libro;
BEGIN
    v_libro.isbn             := '978-950-1234-78-9';
    v_libro.titulo           := 'Rayuela';
    v_libro.anio_publicacion := 1963;
    v_libro.editorial        := 'Sudamericana';
    v_libro.precio           := 450.00;

    DBMS_OUTPUT.PUT_LINE('=== FICHA DEL LIBRO ===');
    DBMS_OUTPUT.PUT_LINE('ISBN:       ' || v_libro.isbn);
    DBMS_OUTPUT.PUT_LINE('Título:     ' || v_libro.titulo);
    DBMS_OUTPUT.PUT_LINE('Año:        ' || v_libro.anio_publicacion);
    DBMS_OUTPUT.PUT_LINE('Editorial:  ' || v_libro.editorial);
    DBMS_OUTPUT.PUT_LINE('Precio:     $' || v_libro.precio);
    DBMS_OUTPUT.PUT_LINE('========================');
END;
/
```

**Salida esperada:**
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

## Solución Ejercicio 4: Scope y bloques anidados

### Parte 1 — Salida del bloque original

```
Bloque principal
Contador en principal: 0
Bloque anidado
Contador en anidado: 100
Contador despues del anidado: 0
```

**Explicación:** La variable `v_contador` del bloque anidado es una variable **distinta** que hace sombra (shadow) a la del bloque principal. Incrementarla no afecta a la exterior. Al salir del bloque anidado, la variable exterior sigue valiendo 0.

### Parte 2 — Versión corregida con etiquetas

```sql
SET SERVEROUTPUT ON;

<<principal>>
DECLARE
    v_mensaje   VARCHAR2(30) := 'Bloque principal';
    v_contador  NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE(v_mensaje);
    DBMS_OUTPUT.PUT_LINE('Contador en principal: ' || v_contador);

    <<anidado>>
    DECLARE
        v_mensaje VARCHAR2(30) := 'Bloque anidado';
    BEGIN
        DBMS_OUTPUT.PUT_LINE(v_mensaje);

        -- Incrementar el v_contador del bloque principal usando la etiqueta
        principal.v_contador := principal.v_contador + 1;

        DBMS_OUTPUT.PUT_LINE('Contador en anidado (no declarado localmente, usa el de principal): '
                             || principal.v_contador);
    END;

    DBMS_OUTPUT.PUT_LINE('Contador despues del anidado: ' || v_contador);
END;
/
```

**Salida esperada:**
```
Bloque principal
Contador en principal: 0
Bloque anidado
Contador en anidado (no declarado localmente, usa el de principal): 1
Contador despues del anidado: 1
```

### Parte 3 — ¿Qué ocurre si se elimina `v_contador NUMBER := 100;`?

Si se elimina la línea `v_contador NUMBER := 100;` del bloque anidado, la variable `v_contador` ya no se declara localmente. En ese caso, el bloque anidado **hereda** la visibilidad de la variable `v_contador` del bloque principal.

El bloque quedaría así:

```sql
<<principal>>
DECLARE
    v_mensaje   VARCHAR2(30) := 'Bloque principal';
    v_contador  NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE(v_mensaje);
    DBMS_OUTPUT.PUT_LINE('Contador en principal: ' || v_contador);

    <<anidado>>
    DECLARE
        v_mensaje VARCHAR2(30) := 'Bloque anidado';
    BEGIN
        DBMS_OUTPUT.PUT_LINE(v_mensaje);
        v_contador := v_contador + 1;  -- Ahora modifica el v_contador del principal
        DBMS_OUTPUT.PUT_LINE('Contador en anidado: ' || v_contador);
    END;

    DBMS_OUTPUT.PUT_LINE('Contador despues del anidado: ' || v_contador);
END;
/
```

**Salida:**
```
Bloque principal
Contador en principal: 0
Bloque anidado
Contador en anidado: 1
Contador despues del anidado: 1
```

Ya no es necesario usar la etiqueta `principal.` porque la variable está en el scope por herencia natural (no hay declaración que haga shadow). El uso de etiquetas sigue siendo recomendable para claridad.

---

## Solución Ejercicio 5: Subconsultas — Libros sobre el promedio por editorial

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_contador NUMBER := 0;
BEGIN
    FOR r IN (SELECT l1.isbn, l1.titulo, l1.editorial, l1.precio
              FROM libros l1
              WHERE l1.precio > (SELECT AVG(l2.precio)
                                FROM libros l2
                                WHERE l2.editorial = l1.editorial)) LOOP
        DBMS_OUTPUT.PUT_LINE('ISBN: ' || r.isbn || ' | Título: ' || r.titulo ||
                             ' | Editorial: ' || r.editorial || ' | Precio: $' || r.precio);
        v_contador := v_contador + 1;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('Total de libros sobre el promedio de su editorial: ' || v_contador);
END;
/
```

**Salida esperada (con datos del enunciado):**
```
ISBN: 978-987-1234-01-1 | Título: Cien años de soledad | Editorial: Sudamericana | Precio: $520
ISBN: 978-987-1234-02-8 | Título: Rayuela | Editorial: Sudamericana | Precio: $450
ISBN: 978-987-1234-03-5 | Título: Ficciones | Editorial: Emecé | Precio: $380
Total de libros sobre el promedio de su editorial: 3
```

---

## Solución Ejercicio 6: Operadores de conjunto — Reporte de editoriales

```sql
-- 1. UNION ALL (incluye duplicados)
SELECT editorial FROM libros
UNION ALL
SELECT editorial FROM libros;

-- 2. UNION (sin duplicados)
SELECT editorial FROM libros
UNION
SELECT editorial FROM libros;

-- 3. INTERSECT: editoriales con libros en 1960 y 1970
SELECT editorial FROM libros WHERE anio_publicacion = 1960
INTERSECT
SELECT editorial FROM libros WHERE anio_publicacion = 1970;

-- 4. MINUS: editoriales con libros después del 2000 pero no antes de 1980
SELECT editorial FROM libros WHERE anio_publicacion > 2000
MINUS
SELECT editorial FROM libros WHERE anio_publicacion < 1980;
```

**Diferencia UNION vs UNION ALL en rendimiento:**
`UNION` necesita realizar una operación adicional de eliminación de duplicados (ordenación o hash), lo que consume más CPU y memoria. `UNION ALL` simplemente concatena los resultados sin verificar duplicados, por lo que es más rápido. Se debe usar `UNION ALL` cuando se sabe que no hay duplicados o cuando estos son aceptables.

---

## Solución Ejercicio 7: Funciones analíticas — Ranking de libros por precio

### Consulta principal

```sql
SELECT isbn, titulo, editorial, precio,
       ROW_NUMBER() OVER (PARTITION BY editorial ORDER BY precio DESC) AS posicion,
       RANK()       OVER (PARTITION BY editorial ORDER BY precio DESC) AS ranking,
       DENSE_RANK() OVER (PARTITION BY editorial ORDER BY precio DESC) AS dense_ranking,
       LAG(precio, 1, 0) OVER (PARTITION BY editorial ORDER BY precio DESC) AS precio_anterior
FROM libros;
```

**Resultado esperado (con datos adicionales de Ejercicio 6):**
```
ISBN              TITULO               EDITORIAL     PRECIO  POSICION  RANKING  DENSE_RANKING  PRECIO_ANTERIOR
----------------  -------------------  -----------  -------  --------  -------  -------------  ---------------
978-987-1234-01-1 Cien años de soledad Sudamericana  520.00         1        1              1                0
978-987-1234-02-8 Rayuela              Sudamericana  450.00         2        2              2           520.00
978-987-1234-07-3 Sobre héroes y tumbas Sudamericana 480.00         3        3              3           450.00
978-987-1234-06-6 El túnel             Sudamericana  300.00         4        4              4           480.00
978-987-1234-03-5 Ficciones            Emecé         380.00         1        1              1                0
978-987-1234-04-2 El Aleph             Emecé         420.00         2        2              2           380.00
```

**Diferencias:**
- `posicion` (ROW_NUMBER): Números únicos consecutivos (1, 2, 3...). Si hay empate, asigna números distintos arbitrariamente.
- `ranking` (RANK): Valores iguales reciben el mismo rango; el siguiente salta posiciones (1, 1, 3...).
- `dense_ranking` (DENSE_RANK): Valores iguales reciben el mismo rango; el siguiente no salta (1, 1, 2...).

### Top 2 libros más caros por editorial

```sql
SELECT isbn, titulo, editorial, precio
FROM (
    SELECT isbn, titulo, editorial, precio,
           ROW_NUMBER() OVER (PARTITION BY editorial ORDER BY precio DESC) AS rn
    FROM libros
) WHERE rn <= 2
ORDER BY editorial, precio DESC;
```

**Resultado esperado:**
```
ISBN              TITULO                EDITORIAL     PRECIO
----------------  --------------------  -----------  -------
978-987-1234-04-2 El Aleph              Emecé         420.00
978-987-1234-03-5 Ficciones             Emecé         380.00
978-987-1234-01-1 Cien años de soledad  Sudamericana  520.00
978-987-1234-02-8 Rayuela               Sudamericana  450.00
```

