---
sidebar_label: "Clase"
---

# Módulo 08: Colecciones y Modelos No Normalizados

## 1. Tipos de Colecciones en PL/SQL

Oracle PL/SQL ofrece tres tipos de colecciones:

### Associative Array (INDEX BY)

```sql
TYPE t_stock_productos IS TABLE OF NUMBER(6) INDEX BY PLS_INTEGER;
```

- También llamado **tabla indexada** o **diccionario**.
- No necesita `EXTEND`; se crea automáticamente al asignar.
- Se indexa por `PLS_INTEGER` o `VARCHAR2`.
- Ideal para datos temporales en memoria.

### Nested Table

```sql
CREATE TYPE t_lista_numeros IS TABLE OF NUMBER;
```

- Se puede usar en SQL y PL/SQL.
- Puede almacenarse como columna de tabla.
- Necesita `EXTEND` antes de asignar elementos.
- Se puede eliminar con `DELETE` dejando huecos.

### VARRAY (Variable Array)

```sql
CREATE OR REPLACE TYPE t_telefonos AS VARRAY(3) OF VARCHAR2(15);
```

- Tamaño fijo máximo declarado.
- Se almacena **inline** en la tabla (como parte de la fila).
- Índices consecutivos (no se pueden eliminar elementos intermedios).

## 2. Métodos de Colecciones

| Método | Descripción |
|--------|-------------|
| `EXISTS(i)` | Retorna TRUE si el elemento i existe |
| `COUNT` | Número de elementos en la colección |
| `FIRST` | Primer índice válido |
| `LAST` | Revisarltimo índice válido |
| `PRIOR(i)` | Índice anterior a i |
| `NEXT(i)` | Índice siguiente a i |
| `EXTEND(n)` | Agrega n elementos (solo Nested Table y VARRAY) |
| `TRIM(n)` | Elimina los últimos n elementos |
| `DELETE(i)` | Elimina el elemento i (o todos si sin parámetro) |

```sql
IF v_stock.EXISTS(10) THEN
    DBMS_OUTPUT.PUT_LINE('Stock del producto 10: ' || v_stock(10));
END IF;
```

## 3. BULK COLLECT y FORALL

### BULK COLLECT: Cargar múltiples filas en una sola operación

```sql
DECLARE
    TYPE t_ids IS TABLE OF productos.id%TYPE;
    v_ids t_ids;
BEGIN
    SELECT id BULK COLLECT INTO v_ids FROM productos;
    -- v_ids contiene todos los IDs en memoria
END;
/
```

### FORALL: Ejecutar DML masivo en lote

```sql
DECLARE
    TYPE t_precios IS TABLE OF productos.precio%TYPE;
    v_precios t_precios;
BEGIN
    SELECT precio BULK COLLECT INTO v_precios FROM productos WHERE id <= 10;

    FORALL i IN 1..v_precios.COUNT
        UPDATE productos SET precio = precio * 1.1 WHERE id = i;
END;
/
```

**Ventaja**: FORALL cambia contexto entre PL/SQL y SQL **una sola vez**, no N veces como un loop normal. Hasta 10x-100x más rápido.

## 4. Colecciones en Modelado de Tablas — TABLE MODELING

### VARRAY como Columna (Modelado Desnormalizado)

```sql
CREATE OR REPLACE TYPE t_telefonos AS VARRAY(3) OF VARCHAR2(15);
/

CREATE TABLE clientes (
    id        NUMBER(6) PRIMARY KEY,
    nombre    VARCHAR2(100),
    telefonos t_telefonos  -- hasta 3 teléfonos en una columna
);
```

**Cuándo usarlo:**
- Número fijo y pequeño de elementos relacionados.
- Siempre se consultan todos juntos.
- Ej: teléfonos de contacto, colores de producto, tallas disponibles.

### Nested Table como Columna

```sql
CREATE OR REPLACE TYPE t_lista_precios AS TABLE OF NUMBER(10,2);
/

CREATE TABLE producto_precios (
    producto_id NUMBER(6) PRIMARY KEY,
    precios     t_lista_precios
) NESTED TABLE precios STORE AS precios_store;
```

**Cuándo usarlo:**
- Lista variable sin orden fijo.
- Se necesitan consultar los elementos individualmente.
- Ej: precios promocionales, historial reciente.

### Tablas Normalizadas vs Colecciones

| Característica | Tabla Normalizada | Colección en Memoria |
|----------------|-------------------|---------------------|
| Persistencia | Sí | No (solo en sesión) |
| Integridad referencial | Sí (FK) | No |
| Consultas ad-hoc | Fáciles (SQL) | Limitadas (PL/SQL) |
| Rendimiento masivo | Puede ser lento | Muy rápido (en memoria) |
| Uso típico | Datos maestros | Caché, procesamiento temporal |

### Trade-offs: Normalización vs Desnormalización

| Enfoque | Ventajas | Desventajas |
|---------|----------|-------------|
| **Normalizado** | Integridad, sin redundancia, fácil mantenimiento | Consultas con JOIN, puede ser lento |
| **Desnormalizado** (VARRAY/Nested Table) | Lecturas rápidas, sin JOIN | Redundancia, actualización compleja, límites de tamaño |

### El Modelo Estrella (Star Schema) para Data Warehousing

```sql
-- Tabla de hechos (Ventas)
CREATE TABLE fact_ventas (
    id_venta     NUMBER(10),
    id_producto  NUMBER(6),
    id_tiempo    NUMBER(8),
    id_sucursal  NUMBER(4),
    monto        NUMBER(10,2),
    cantidad     NUMBER(6),
    -- dimensiones desnormalizadas como claves foráneas
    CONSTRAINT fk_producto FOREIGN KEY (id_producto) REFERENCES dim_producto(id),
    CONSTRAINT fk_tiempo   FOREIGN KEY (id_tiempo)   REFERENCES dim_tiempo(id)
);

-- Tabla de dimensión (Producto)
CREATE TABLE dim_producto (
    id            NUMBER(6) PRIMARY KEY,
    nombre        VARCHAR2(100),
    categoria     VARCHAR2(50),
    marca         VARCHAR2(50),
    proveedor     VARCHAR2(100)
);
```

En el modelo estrella, las dimensiones están **desnormalizadas** a propósito para evitar JOINs múltiples en consultas analíticas.

## Temas Complementarios: Índices y SAVE EXCEPTIONS

### Índices en Oracle

Los índices aceleran la búsqueda de filas en una tabla a costa de espacio en disco y tiempo en operaciones DML.

#### Índice B-Tree (Balance Tree)

Tipo por defecto. Ideal para columnas con alta cardinalidad (muchos valores distintos).

```sql
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
```

#### Índice Bitmap

Ideal para columnas con baja cardinalidad (pocos valores distintos, ej. género, estado civil).

```sql
CREATE BITMAP INDEX idx_productos_categoria ON productos(categoria_id);
```

| Índice | Uso recomendado | Cardinalidad |
|--------|----------------|--------------|
| B-Tree | Columnas con muchos valores únicos | Alta |
| Bitmap | Columnas con pocos valores repetidos | Baja |

#### Índice Function-Based

Indexa el resultado de una función, útil para búsquedas sin distinción de mayúsculas.

```sql
CREATE INDEX idx_emp_email_lower ON empleados(LOWER(email));

-- Esta consulta usa el índice:
SELECT * FROM empleados WHERE LOWER(email) = 'ana@empresa.com';
```

### SAVE EXCEPTIONS en FORALL

Cuando se usa `FORALL` para DML masivo y algunas filas pueden fallar, `SAVE EXCEPTIONS` permite continuar con las filas restantes y luego revisar los errores.

```sql
DECLARE
    TYPE t_ids IS TABLE OF NUMBER;
    v_ids t_ids := t_ids(1, 2, 999, 4, 5);
    v_errores NUMBER;
BEGIN
    FORALL i IN 1..v_ids.COUNT SAVE EXCEPTIONS
        UPDATE productos SET precio = precio * 1.1 WHERE id = v_ids(i);
EXCEPTION
    WHEN OTHERS THEN
        v_errores := SQL%BULK_EXCEPTIONS.COUNT;
        DBMS_OUTPUT.PUT_LINE('Errores capturados: ' || v_errores);
        FOR i IN 1..v_errores LOOP
            DBMS_OUTPUT.PUT_LINE('  Error ' || i || ': Código '
                || SQL%BULK_EXCEPTIONS(i).ERROR_CODE
                || ' en iteración ' || SQL%BULK_EXCEPTIONS(i).ERROR_INDEX);
        END LOOP;
END;
/
```

| Atributo | Descripción |
|----------|-------------|
| `SQL%BULK_EXCEPTIONS.COUNT` | Número de excepciones ocurridas |
| `SQL%BULK_EXCEPTIONS(i).ERROR_INDEX` | Índice del elemento que falló |
| `SQL%BULK_EXCEPTIONS(i).ERROR_CODE` | Código de error Oracle |

### Patrones Avanzados con Colecciones

```sql
-- Colección de registros (tabla de %ROWTYPE)
DECLARE
    TYPE t_productos IS TABLE OF productos%ROWTYPE;
    v_productos t_productos;
BEGIN
    SELECT * BULK COLLECT INTO v_productos FROM productos;
    FOR i IN 1..v_productos.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE(v_productos(i).nombre || ': $' || v_productos(i).precio);
    END LOOP;
END;
/

-- Filtrado en memoria con colecciones anidadas
DECLARE
    TYPE t_empleados IS TABLE OF empleados%ROWTYPE;
    v_empleados t_empleados;
    v_filtrados t_empleados;
BEGIN
    SELECT * BULK COLLECT INTO v_empleados FROM empleados;
    v_filtrados := t_empleados();
    FOR i IN 1..v_empleados.COUNT LOOP
        IF v_empleados(i).salario > 4000000 THEN
            v_filtrados.EXTEND;
            v_filtrados(v_filtrados.COUNT) := v_empleados(i);
        END IF;
    END LOOP;
END;
/
```
