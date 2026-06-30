---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 2: FORALL vs Loop Secuencial

```sql
SET SERVEROUTPUT ON;

DECLARE
    TYPE t_ventas_detalle IS TABLE OF ventas_detalle%ROWTYPE
        INDEX BY PLS_INTEGER;
    v_datos t_ventas_detalle;
    v_inicio TIMESTAMP;
    v_fin TIMESTAMP;
    v_duracion INTERVAL DAY TO SECOND;
BEGIN
    -- Preparar 1000 registros de prueba
    FOR i IN 1..1000 LOOP
        v_datos(i).id := i;
        v_datos(i).venta_id := TRUNC(DBMS_RANDOM.VALUE(1, 100));
        v_datos(i).producto_id := TRUNC(DBMS_RANDOM.VALUE(1, 10));
        v_datos(i).cantidad := TRUNC(DBMS_RANDOM.VALUE(1, 10));
        v_datos(i).precio_unit := ROUND(DBMS_RANDOM.VALUE(1000, 500000), 2);
    END LOOP;

    -- FORALL
    v_inicio := SYSTIMESTAMP;

    FORALL i IN 1..v_datos.COUNT
        INSERT INTO ventas_detalle (id, venta_id, producto_id, cantidad, precio_unit)
        VALUES (v_datos(i).id, v_datos(i).venta_id, v_datos(i).producto_id,
                v_datos(i).cantidad, v_datos(i).precio_unit);

    v_fin := SYSTIMESTAMP;
    v_duracion := v_fin - v_inicio;
    DBMS_OUTPUT.PUT_LINE('Tiempo con FORALL (1000 inserts): '
        || EXTRACT(SECOND FROM v_duracion) || ' segundos');

    ROLLBACK;

    -- Loop secuencial
    v_inicio := SYSTIMESTAMP;

    FOR i IN 1..v_datos.COUNT LOOP
        INSERT INTO ventas_detalle (id, venta_id, producto_id, cantidad, precio_unit)
        VALUES (v_datos(i).id + 2000, v_datos(i).venta_id, v_datos(i).producto_id,
                v_datos(i).cantidad, v_datos(i).precio_unit);
    END LOOP;

    v_fin := SYSTIMESTAMP;
    v_duracion := v_fin - v_inicio;
    DBMS_OUTPUT.PUT_LINE('Tiempo con LOOP secuencial (1000 inserts): '
        || EXTRACT(SECOND FROM v_duracion) || ' segundos');

    ROLLBACK;
END;
/
```

Salida esperada (los tiempos varían según el entorno):
```
Tiempo con FORALL (1000 inserts): .02 segundos
Tiempo con LOOP secuencial (1000 inserts): .15 segundos
```

---

## Ejercicio 3: VARRAY como Columna

```sql
-- Crear TYPE VARRAY
CREATE OR REPLACE TYPE t_telefonos AS VARRAY(3) OF VARCHAR2(15);
/

-- Crear tabla con columna VARRAY
CREATE TABLE producto_contactos (
    producto_id    NUMBER(6) PRIMARY KEY,
    nombre_producto VARCHAR2(100),
    telefonos      t_telefonos
);

-- Insertar datos
INSERT INTO producto_contactos VALUES (
    1,
    'Soporte Técnico',
    t_telefonos('2222334455', '2222334466', '2222334477')
);

INSERT INTO producto_contactos VALUES (
    2,
    'Ventas Mayoristas',
    t_telefonos('2222334488', '2222334499')
);

-- Consultar y mostrar
SET SERVEROUTPUT ON;

DECLARE
    CURSOR c_contactos IS
        SELECT producto_id, nombre_producto, telefonos
        FROM producto_contactos
        ORDER BY producto_id;
BEGIN
    FOR r IN c_contactos LOOP
        DBMS_OUTPUT.PUT_LINE('Producto: ' || r.nombre_producto
            || ' (ID: ' || r.producto_id || ')');

        IF r.telefonos IS NOT NULL THEN
            FOR i IN 1..r.telefonos.COUNT LOOP
                DBMS_OUTPUT.PUT_LINE('  Teléfono ' || i || ': ' || r.telefonos(i));
            END LOOP;
        ELSE
            DBMS_OUTPUT.PUT_LINE('  Sin teléfonos registrados');
        END IF;
    END LOOP;
END;
/
```

Salida esperada:
```
Producto: Soporte Técnico (ID: 1)
  Teléfono 1: 2222334455
  Teléfono 2: 2222334466
  Teléfono 3: 2222334477
Producto: Ventas Mayoristas (ID: 2)
  Teléfono 1: 2222334488
  Teléfono 2: 2222334499
```

---

## Ejercicio 4: Nested Table con Estadísticas

```sql
-- Crear TYPE de Nested Table a nivel de esquema
CREATE OR REPLACE TYPE t_lista_precios IS TABLE OF NUMBER(10,2);
/

-- Package para la función
CREATE OR REPLACE PACKAGE pkg_estadisticas AS
    TYPE t_resultado IS RECORD (
        promedio NUMBER(10,2),
        maximo   NUMBER(10,2),
        minimo   NUMBER(10,2)
    );
    FUNCTION calcular_estadisticas(p_precios t_lista_precios) RETURN t_resultado;
END;
/

CREATE OR REPLACE PACKAGE BODY pkg_estadisticas AS
    FUNCTION calcular_estadisticas(p_precios t_lista_precios) RETURN t_resultado IS
        v_result t_resultado;
        v_acum   NUMBER(10,2) := 0;
        v_count  NUMBER := 0;
    BEGIN
        v_result.maximo := NULL;
        v_result.minimo := NULL;

        FOR i IN 1..p_precios.COUNT LOOP
            IF p_precios.EXISTS(i) THEN
                v_acum := v_acum + p_precios(i);
                v_count := v_count + 1;

                IF v_result.maximo IS NULL OR p_precios(i) > v_result.maximo THEN
                    v_result.maximo := p_precios(i);
                END IF;

                IF v_result.minimo IS NULL OR p_precios(i) < v_result.minimo THEN
                    v_result.minimo := p_precios(i);
                END IF;
            END IF;
        END LOOP;

        IF v_count > 0 THEN
            v_result.promedio := ROUND(v_acum / v_count, 2);
        ELSE
            v_result.promedio := 0;
            v_result.maximo := 0;
            v_result.minimo := 0;
        END IF;

        RETURN v_result;
    END calcular_estadisticas;
END;
/

-- Prueba de la función
SET SERVEROUTPUT ON;

DECLARE
    v_precios t_lista_precios := t_lista_precios(15990, 24990, 8990, 45990, 12990);
    v_result  pkg_estadisticas.t_resultado;
BEGIN
    v_result := pkg_estadisticas.calcular_estadisticas(v_precios);

    DBMS_OUTPUT.PUT_LINE('Lista de precios:');
    FOR i IN 1..v_precios.COUNT LOOP
        IF v_precios.EXISTS(i) THEN
            DBMS_OUTPUT.PUT_LINE('  Precio ' || i || ': $' || v_precios(i));
        END IF;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('---');
    DBMS_OUTPUT.PUT_LINE('Promedio: $' || v_result.promedio);
    DBMS_OUTPUT.PUT_LINE('Máximo:  $' || v_result.maximo);
    DBMS_OUTPUT.PUT_LINE('Mínimo:  $' || v_result.minimo);
END;
/
```

Salida esperada:
```
Lista de precios:
  Precio 1: $15990
  Precio 2: $24990
  Precio 3: $8990
  Precio 4: $45990
  Precio 5: $12990
---
Promedio: $21790
Máximo:  $45990
Mínimo:  $8990
```

---

## Ejercicio 5: Índices B-Tree, Bitmap y Function-Based

```sql
-- 1. Índice B-Tree para búsquedas por nombre (alta cardinalidad)
CREATE INDEX idx_productos_nombre ON productos(nombre);

-- 2. Índice Bitmap para columna activo (baja cardinalidad: solo 'S' o 'N')
CREATE BITMAP INDEX idx_productos_activo ON productos(activo);

-- 3. Índice Function-Based para búsquedas case-insensitive
CREATE INDEX idx_productos_nombre_lower ON productos(LOWER(nombre));

-- Explicación:
-- B-Tree: ideal para columnas con muchos valores distintos (alta cardinalidad),
--          como nombre, email, etc. Es el índice por defecto en Oracle.
-- Bitmap: ideal para columnas con pocos valores distintos (baja cardinalidad),
--          como género, activo, estado civil. Usa mapas de bits para compresión.
-- Function-Based: permite indexar expresiones y funciones,
--          útil para búsquedas con LOWER, UPPER, TRIM, etc.
```

---

## Ejercicio 6: SAVE EXCEPTIONS

```sql
SET SERVEROUTPUT ON;

DECLARE
    TYPE t_producto_rec IS RECORD (
        id            NUMBER(6),
        nombre        VARCHAR2(100),
        descripcion   VARCHAR2(500),
        precio        NUMBER(10,2),
        stock         NUMBER(6),
        codigo_barras VARCHAR2(13),
        categoria_id  NUMBER(3),
        activo        CHAR(1)
    );
    TYPE t_productos IS TABLE OF t_producto_rec;
    v_productos t_productos := t_productos(
        t_producto_rec(10, 'Monitor 24"', 'Monitor Full HD', 250000, 20, '5555555555555', 1, 'S'),
        t_producto_rec(11, 'Teclado RGB', 'Teclado mecánico RGB', 75000, 15, '9876543210987', 1, 'S'),
        t_producto_rec(12, 'Audífonos BT', 'Audífonos Bluetooth', 35000, 40, '6666666666666', 1, 'S'),
        t_producto_rec(13, 'Cable USB', 'Cable USB-C', 5000, 100, '7777777777777', 1, 'X'),
        t_producto_rec(14, 'Hub USB', 'Hub 4 puertos', 15000, 25, '8888888888888', 1, 'S'),
        t_producto_rec(15, 'Mouse Pad', 'Alfombrilla XXL', 10000, 50, '9876543210987', 2, 'S')
    );
    v_errores NUMBER;
BEGIN
    FORALL i IN 1..v_productos.COUNT SAVE EXCEPTIONS
        INSERT INTO productos_temp (id, nombre, descripcion, precio, stock,
                                    codigo_barras, categoria_id, activo)
        VALUES (v_productos(i).id, v_productos(i).nombre, v_productos(i).descripcion,
                v_productos(i).precio, v_productos(i).stock, v_productos(i).codigo_barras,
                v_productos(i).categoria_id, v_productos(i).activo);

    DBMS_OUTPUT.PUT_LINE('Todos insertados sin errores. Total: ' || SQL%ROWCOUNT);

EXCEPTION
    WHEN OTHERS THEN
        v_errores := SQL%BULK_EXCEPTIONS.COUNT;
        DBMS_OUTPUT.PUT_LINE('Errores capturados: ' || v_errores);

        FOR i IN 1..v_errores LOOP
            DBMS_OUTPUT.PUT_LINE('  Error ' || i
                || ' | Código: ' || SQL%BULK_EXCEPTIONS(i).ERROR_CODE
                || ' | Índice: ' || SQL%BULK_EXCEPTIONS(i).ERROR_INDEX
                || ' | Producto: ' || v_productos(SQL%BULK_EXCEPTIONS(i).ERROR_INDEX).nombre);
        END LOOP;
END;
/

-- Verificar registros válidos
SELECT id, nombre, codigo_barras, activo FROM productos_temp;
```

Salida esperada:
```
Errores capturados: 3
  Error 1 | Código: 1 | Índice: 2 | Producto: Teclado RGB
  Error 2 | Código: 2290 | Índice: 4 | Producto: Cable USB
  Error 3 | Código: 1 | Índice: 6 | Producto: Mouse Pad
```

Registros insertados correctamente: Monitor 24", Audífonos BT, Hub USB (3 registros).

---

## Ejercicio 7: Colección %ROWTYPE con Filtro en Memoria

```sql
SET SERVEROUTPUT ON;

DECLARE
    TYPE t_productos IS TABLE OF productos%ROWTYPE;
    v_productos t_productos;
    v_caros t_productos;
BEGIN
    -- Cargar productos activos
    SELECT * BULK COLLECT INTO v_productos
    FROM productos
    WHERE activo = 'S';

    DBMS_OUTPUT.PUT_LINE('Productos activos cargados: ' || v_productos.COUNT);

    -- Filtrar en memoria los caros (> $100,000)
    v_caros := t_productos();

    FOR i IN 1..v_productos.COUNT LOOP
        IF v_productos(i).precio > 100000 THEN
            v_caros.EXTEND;
            v_caros(v_caros.COUNT) := v_productos(i);
        END IF;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('Productos caros (> $100,000): ' || v_caros.COUNT);
    DBMS_OUTPUT.PUT_LINE('---');

    FOR i IN 1..v_caros.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE(v_caros(i).id || ' - ' || v_caros(i).nombre
            || ' - $' || v_caros(i).precio);
    END LOOP;
END;
/
```

Salida esperada:
```
Productos activos cargados: 4
Productos caros (> $100,000): 1
---
1 - Laptop X200 - $1500000
```

