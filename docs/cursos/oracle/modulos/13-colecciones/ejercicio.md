---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: VARRAY como Columna — Teléfonos de Producto

Una tienda quiere almacenar hasta 3 teléfonos de contacto por producto en una misma columna.

**Tareas:**
1. Crear el TYPE `t_telefonos AS VARRAY(3) OF VARCHAR2(15)`.
2. Crear la tabla `PRODUCTO_CONTACTOS` con columnas: `producto_id`, `nombre_producto`, `telefonos` (VARRAY).
3. Insertar 2 productos con sus teléfonos:
   - Producto 1: 'Soporte Técnico' → teléfonos '2222334455', '2222334466', '2222334477'
   - Producto 2: 'Ventas Mayoristas' → teléfonos '2222334488', '2222334499'
4. Escribir un bloque que consulte los productos y muestre todos sus teléfonos recorriendo el VARRAY con un contador de 1 a `telefonos.COUNT`.

---

## Ejercicio 4: Nested Table con Promedio, Máximo y Mínimo

Se necesita procesar listas de precios en memoria.

**Tareas:**
1. Crear el TYPE `t_lista_precios IS TABLE OF NUMBER(10,2)`.
2. Implementar una función `calcular_estadisticas(p_precios t_lista_precios)` que retorne un record con:
   - `promedio NUMBER(10,2)`
   - `maximo NUMBER(10,2)`
   - `minimo NUMBER(10,2)`
3. La función debe usar `EXISTS` antes de acceder a cada elemento.
4. Probar la función desde un bloque anónimo con una lista de precios de ejemplo: `(15990, 24990, 8990, 45990, 12990)`.
5. Mostrar los resultados.

---

## Ejercicio 5: Creación de Índices B-Tree, Bitmap y Function-Based

Usando la tabla `PRODUCTOS`:

```sql
CREATE TABLE productos (
    id            NUMBER(6) PRIMARY KEY,
    nombre        VARCHAR2(100),
    descripcion   VARCHAR2(500),
    precio        NUMBER(10,2),
    stock         NUMBER(6),
    codigo_barras VARCHAR2(13) UNIQUE,
    categoria_id  NUMBER(3),
    activo        CHAR(1) CHECK (activo IN ('S', 'N'))
);

INSERT ALL
    INTO productos VALUES (1, 'Laptop X200', 'Laptop gamer', 1500000, 10, '1234567890123', 1, 'S')
    INTO productos VALUES (2, 'Mouse —ptico', 'Mouse RGB', 25000, 50, '9876543210987', 1, 'S')
    INTO productos VALUES (3, 'Teclado M01', 'Teclado mecánico', 45000, 30, '1111111111111', 1, 'N')
    INTO productos VALUES (4, 'Polera Deportiva', 'Polera dry-fit', 15000, 30, '2222222222222', 2, 'S')
    INTO productos VALUES (5, 'Zapatilla Running', 'Zapatilla ultra', 65000, 15, '3333333333333', 2, 'S')
SELECT * FROM DUAL;
```

**Tareas:**
1. Crear un **índice B-Tree** sobre la columna `nombre`.
2. Crear un **índice Bitmap** sobre la columna `activo` (baja cardinalidad: solo 'S' o 'N').
3. Crear un **índice Function-Based** sobre `LOWER(nombre)` para búsquedas sin distinción de mayúsculas.
4. Explicar cuándo conviene usar cada tipo de índice.

---

## Ejercicio 6: SAVE EXCEPTIONS — Inserción Masiva con Errores

Dada la tabla `PRODUCTOS` del ejercicio anterior (con UNIQUE en `codigo_barras` y CHECK en `activo`):

```sql
CREATE TABLE productos_temp AS SELECT * FROM productos WHERE 1=0;
```

Escribir un bloque anónimo PL/SQL que:
1. Declare una Nested Table con datos a insertar (incluyendo algunos con `codigo_barras` duplicado y `activo` inválido).
2. Use `FORALL ... SAVE EXCEPTIONS` para insertar todos los registros.
3. Capture las excepciones en la sección `EXCEPTION`.
4. Muestre cuántos errores ocurrieron, el índice y el código de cada error.
5. Consulte `productos_temp` para verificar que los registros válidos se insertaron correctamente.

---

## Ejercicio 7: Colección de %ROWTYPE con Filtro en Memoria

Usando la tabla `PRODUCTOS` del ejercicio 5, escribir un bloque anónimo PL/SQL que:
1. Declare un TYPE `t_productos IS TABLE OF productos%ROWTYPE`.
2. Use `BULK COLLECT` para cargar todos los productos activos (activo = 'S').
3. Cree una segunda colección `v_caros` del mismo tipo.
4. Filtre en memoria: copie a `v_caros` los productos con precio > $100,000 usando `EXTEND`.
5. Muestre los productos filtrados con su nombre y precio.
