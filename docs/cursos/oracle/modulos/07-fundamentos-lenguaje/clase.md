---
sidebar_label: "Clase"
---

## 3. TABLE MODELING — Correspondencia PL/SQL — SQL

### VARCHAR2 vs CHAR

- **VARCHAR2(n)**: Para cadenas de longitud variable. Ahorra espacio. Usar para nombres, títulos, direcciones.
- **CHAR(n)**: Para códigos de longitud fija. Si almacena un valor de 1 carácter, CHAR(1) usa siempre 1 byte; VARCHAR2(1) también pero con overhead.

**Ejemplo Biblioteca:**
- `isbn` → `VARCHAR2(13)` — cada ISBN tiene exactamente 13 caracteres, parece fijo, pero se define como VARCHAR2 por estándar ISO (no todos los países usan 13 dígitos aún en transición). También es más flexible si se almacenan con guiones.
- `estado` → `CHAR(1)` — valores fijos: 'P', 'D', 'A' (Pendiente, Devuelto, Atrasado).
- `nacionalidad` → `VARCHAR2(50)` — longitud variable (ej: "Argentina" vs "República Dominicana").

### NUMBER(p,s) vs BINARY_FLOAT / BINARY_DOUBLE

- **NUMBER(p,s)**: Precisión exacta. Para dinero, precios, cantidades contables. Oracle almacena como decimal empaquetado. Ocupa más espacio pero es exacto.
- **BINARY_FLOAT / BINARY_DOUBLE**: Aritmética de punto flotante binario (~IEEE 754). Más rápido para cálculos científicos, pero puede tener errores de redondeo.

**Ejemplo Biblioteca:**
- `precio NUMBER(10,2)` → Precios exactos con 2 decimales.
- `multa NUMBER(10,2)` → Cálculos monetarios deben ser exactos.

### Dominios de valores y CHECK constraints

Los dominios acotados se implementan como CHECK:

```sql
CREATE TABLE libros (
    isbn    VARCHAR2(13) PRIMARY KEY,
    titulo  VARCHAR2(200) NOT NULL,
    anio    NUMBER(4) CHECK (anio >= 1900),
    precio  NUMBER(10,2) CHECK (precio > 0)
);
```

### ISBN: ¿VARCHAR2(13) o NUMBER?

**Respuesta: VARCHAR2(13)**
- El ISBN puede contener el dígito 'X' como carácter de control (sistemas antiguos de 10 dígitos).
- Puede incluir guiones en la representación: `978-987-1234-56-7`.
- No se realizan operaciones aritméticas con ISBN.
- Como VARCHAR2 se pueden usar operaciones LIKE, SUBSTR, pattern matching.

### Fecha de préstamo: ¿DATE o TIMESTAMP?

- Si se necesita registrar la hora exacta del préstamo → **TIMESTAMP**.
- Si solo interesa la fecha (día) → **DATE**.
- Para la Biblioteca, usar `DATE` para `fecha_prestamo` y `fecha_devolucion` es suficiente, a menos que se requiera saber la hora exacta de la transacción.

---

## 4. Constantes, NOT NULL y DEFAULT

```sql
DECLARE
    c_iva CONSTANT NUMBER(2,2) := 0.21;       -- Constante
    v_descripcion VARCHAR2(500) NOT NULL := ''; -- No puede ser NULL
    v_fecha DATE DEFAULT SYSDATE;               -- Valor por defecto
BEGIN
    ...
END;
/
```

---

## 5. Scope y visibilidad

- Las variables declaradas en un bloque externo son visibles dentro de los bloques anidados.
- Las variables declaradas en un bloque interno ocultan (shadow) las del bloque externo si tienen el mismo nombre.
- Las variables de un bloque interno no son accesibles desde el bloque externo.

```sql
DECLARE
    v_mensaje VARCHAR2(20) := 'Externo';
BEGIN
    <<interno>>
    DECLARE
        v_mensaje VARCHAR2(20) := 'Interno';
    BEGIN
        DBMS_OUTPUT.PUT_LINE(v_mensaje);         -- 'Interno'
        DBMS_OUTPUT.PUT_LINE(principal.v_mensaje); -- 'Externo' (con etiqueta)
    END;
    DBMS_OUTPUT.PUT_LINE(v_mensaje); -- 'Externo'
END;
/

---

## 6. Subconsultas (Subqueries)

Una subconsulta es una consulta SELECT anidada dentro de otra sentencia SQL.

### Subconsulta escalar

Devuelve una sola fila y una sola columna. Se usa en la cláusula SELECT o WHERE.

```sql
-- Subconsulta escalar en SELECT: mostrar precio promedio junto a cada libro
SELECT isbn, titulo, precio,
       (SELECT AVG(precio) FROM libros) AS precio_promedio
FROM libros;

-- Subconsulta escalar en WHERE: libros con precio mayor al promedio
SELECT isbn, titulo, precio
FROM libros
WHERE precio > (SELECT AVG(precio) FROM libros);
```

### Subconsulta inline (en FROM)

Se trata como una tabla virtual dentro de la cláusula FROM.

```sql
SELECT iv.*
FROM (SELECT isbn, titulo, precio FROM libros WHERE precio > 400) iv
WHERE iv.titulo LIKE 'E%';
```

### Subconsulta correlacionada

La subconsulta hace referencia a columnas de la consulta principal. Se evalúa para cada fila externa.

```sql
-- Libros cuyo precio es mayor que el promedio de los libros de su misma editorial
SELECT l1.isbn, l1.titulo, l1.editorial, l1.precio
FROM libros l1
WHERE l1.precio > (SELECT AVG(l2.precio)
                   FROM libros l2
                   WHERE l2.editorial = l1.editorial);
```

---

## 7. Operadores de conjunto (Set Operators)

Combinan resultados de dos o más consultas SELECT.

| Operador | Descripción |
|----------|-------------|
| `UNION` | Combina resultados eliminando duplicados |
| `UNION ALL` | Combina resultados sin eliminar duplicados |
| `INTERSECT` | Devuelve filas comunes a ambas consultas |
| `MINUS` | Devuelve filas de la primera consulta que no están en la segunda |

```sql
-- UNION: todos los títulos de libros y nombres de miembros
SELECT titulo AS nombre FROM libros
UNION
SELECT nombre FROM miembros;

-- UNION ALL: todas las editoriales (incluye duplicados)
SELECT editorial FROM libros
UNION ALL
SELECT editorial FROM libros;

-- INTERSECT: editoriales que tienen libros tanto en 1960 como 1970
SELECT editorial FROM libros WHERE anio_publicacion = 1960
INTERSECT
SELECT editorial FROM libros WHERE anio_publicacion = 1970;

-- MINUS: editoriales que publicaron en 1960 pero no en 1970
SELECT editorial FROM libros WHERE anio_publicacion = 1960
MINUS
SELECT editorial FROM libros WHERE anio_publicacion = 1970;
```

**Reglas:**
- Todas las consultas deben tener el mismo número de columnas.
- Los tipos de datos deben ser compatibles.
- El orden se define con `ORDER BY` al final de la última consulta.

---

## 8. ROWNUM y ROWID (Paginación)

### ROWID

Identificador físico único que Oracle asigna a cada fila. Indica la ubicación exacta en el disco.

```sql
SELECT ROWID, isbn, titulo FROM libros;
```

### ROWNUM

Número secuencial que Oracle asigna a cada fila del resultado (antes de aplicar ORDER BY). Revisartil para paginación.

```sql
-- Primeros 3 libros (sin ORDER BY)
SELECT * FROM libros WHERE ROWNUM <= 3;
```

**Paginación correcta con subconsulta:**

```sql
-- Página 1: libros 1 a 3 ordenados por título
SELECT * FROM (
    SELECT rownum AS rn, isbn, titulo, precio
    FROM (SELECT * FROM libros ORDER BY titulo)
) WHERE rn BETWEEN 1 AND 3;

-- Página 2: libros 4 a 6
SELECT * FROM (
    SELECT rownum AS rn, isbn, titulo, precio
    FROM (SELECT * FROM libros ORDER BY titulo)
) WHERE rn BETWEEN 4 AND 6;
```

---

## 9. Funciones analíticas (Analytic Functions)

Las funciones analíticas realizan cálculos sobre un conjunto de filas (ventana) sin agrupar el resultado.

### ROW_NUMBER, RANK, DENSE_RANK

```sql
SELECT isbn, titulo, precio,
       ROW_NUMBER() OVER (ORDER BY precio DESC) AS row_num,
       RANK()       OVER (ORDER BY precio DESC) AS rank,
       DENSE_RANK() OVER (ORDER BY precio DESC) AS dense_rank
FROM libros;
```

| Función | Comportamiento |
|---------|---------------|
| `ROW_NUMBER` | Asigna un número único a cada fila. Empates reciben números distintos. |
| `RANK` | Asigna el mismo rango a valores iguales; el siguiente rango salta los puestos empatados. |
| `DENSE_RANK` | Asigna el mismo rango a valores iguales; el siguiente rango no salta posiciones. |

### PARTITION BY

Divide el resultado en grupos (particiones) y aplica la función dentro de cada grupo.

```sql
-- Ordenar libros por precio dentro de cada editorial
SELECT isbn, titulo, editorial, precio,
       ROW_NUMBER() OVER (PARTITION BY editorial ORDER BY precio DESC) AS posicion
FROM libros;
```

### LEAD y LAG

Acceden a filas siguientes o anteriores dentro de la partición.

```sql
-- Comparar precio de cada libro con el anterior y siguiente (ordenado por título)
SELECT isbn, titulo, precio,
       LAG(precio, 1, 0)  OVER (ORDER BY titulo) AS precio_anterior,
       LEAD(precio, 1, 0) OVER (ORDER BY titulo) AS precio_siguiente
FROM libros;
```

- `LAG(columna, offset, default)`: valor de la fila anterior.
- `LEAD(columna, offset, default)`: valor de la fila siguiente.
```
