---
sidebar_label: "Clase"
---

# Módulo 05: Strings, Números y Modelado de Dominios

## 1. Tipos de Datos String

### VARCHAR2 vs CHAR vs CLOB

| Tipo | Uso | Longitud | Almacenamiento |
|------|-----|----------|----------------|
| `VARCHAR2(n)` | Cadenas de longitud variable | Máx. 32767 (PL/SQL) / 4000 (SQL) | Solo lo que ocupa el dato |
| `CHAR(n)` | Cadenas de longitud fija | Máx. 2000 bytes | Siempre fijo, rellena con espacios |
| `CLOB` | Textos muy grandes | Hasta 4 GB | Por fragmentos (lob) |

**Regla práctica:**
- Usar siempre `VARCHAR2` para cadenas normales (nombres, emails, códigos).
- Usar `CHAR` solo si el dato tiene **longitud exacta y fija** (ej. género 'M'/'F', código ISO de país de 2 letras).
- Usar `CLOB` para descripciones largas (>4000 caracteres), observaciones, notas sin límite.

### Funciones de String Esenciales

```sql
-- Conversión de mayúsculas/minúsculas
UPPER('hola')        → 'HOLA'
LOWER('HOLA')        → 'hola'
INITCAP('hola mundo') → 'Hola Mundo'

-- Recorte y búsqueda
TRIM('  texto  ')                  → 'texto'
TRIM(LEADING '0' FROM '00123')     → '123'
SUBSTR('Oracle PL/SQL', 8, 2)     → 'PL'
INSTR('oracle@email.com', '@')     → 8
REPLACE('a-b-c', '-', '/')        → 'a/b/c'

-- Expresiones regulares
REGEXP_LIKE('hola123', '^[a-z]+$')         → FALSE (tiene dígitos)
REGEXP_SUBSTR('user@domain.com', '@(.+)')  → '@domain.com'
```

## 2. Tipos de Datos Numéricos

| Tipo | Rango / Precisión | Uso |
|------|-------------------|-----|
| `NUMBER(p,s)` | Precisión p, escala s | Valores exactos (precios, cantidades) |
| `PLS_INTEGER` | -2³¹..2³¹-1 | Enteros en PL/SQL (más rápido que NUMBER) |
| `BINARY_FLOAT` | 32-bit IEEE 754 | Punto flotante, cálculos científicos |
| `BINARY_DOUBLE` | 64-bit IEEE 754 | Mayor precisión flotante |

**Regla práctica:**
- **Precios**: `NUMBER(10,2)` para 2 decimales.
- **Cantidades**: `NUMBER(6)` o `PLS_INTEGER` en PL/SQL.
- **Descuentos porcentuales**: `NUMBER(5,2)` para 99.99%.
- **Códigos numéricos** (IDs): `NUMBER(10)`.

### Funciones Numéricas Esenciales

```sql
ROUND(123.4567, 2)    → 123.46
TRUNC(123.4567, 2)    → 123.45
MOD(10, 3)            → 1
ABS(-5)               → 5
POWER(2, 3)           → 8
CEIL(4.2)             → 5
FLOOR(4.8)            → 4
```

## 3. Modelado de Dominios — TABLE MODELING

### Elegir VARCHAR2(n) con n adecuado

Siempre acotar el tamaño máximo realista:

| Columna | Tipo sugerido | Justificación |
|---------|--------------|---------------|
| `nombre` | `VARCHAR2(100)` | Nombre de producto |
| `email` | `VARCHAR2(254)` | RFC 5321 (máximo real) |
| `telefono` | `VARCHAR2(20)` | +56 9 1234 5678 |
| `codigo_barras` | `VARCHAR2(13)` | EAN-13 exactamente 13 dígitos |
| `descripcion` | `VARCHAR2(500)` o `CLOB` | Si supera 4000 → CLOB |

### CHECK para validar formatos

```sql
email VARCHAR2(254) CHECK (email LIKE '%@%.%'),
telefono VARCHAR2(20) CHECK (REGEXP_LIKE(telefono, '^\+?\d{7,15}$')),
codigo_barras VARCHAR2(13) CHECK (REGEXP_LIKE(codigo_barras, '^\d{13}$'))
```

### NUMBER(p,s) para precios vs INTEGER para cantidades

```sql
precio     NUMBER(10,2)  -- 99999999.99 máximo
stock      NUMBER(6)     -- hasta 999999 unidades
descuento  NUMBER(5,2)   -- porcentaje: 99.99%
```

### Catálogos como Tablas de Dominio

**Mal diseño** (strings libres → datos sucios):
```sql
CREATE TABLE productos (
    categoria VARCHAR2(50)  -- 'ELECTRONICA', 'electronica', 'Electrónica', ...
);
```

**Buen diseño** (tabla de dominio + FK → integridad):
```sql
CREATE TABLE categorias (
    id         NUMBER(3) PRIMARY KEY,
    nombre     VARCHAR2(50) NOT NULL UNIQUE,
    descripcion VARCHAR2(200)
);

CREATE TABLE productos (
    id           NUMBER(10) PRIMARY KEY,
    nombre       VARCHAR2(100) NOT NULL,
    precio       NUMBER(10,2) NOT NULL,
    categoria_id NUMBER(3) NOT NULL,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
```

**Ventajas de tablas de dominio:**
1. Integridad referencial: no se pueden insertar categorías inválidas.
2. Centralización: cambiar nombre de categoría se hace en un solo lugar.
3. Extensibilidad: se pueden agregar atributos a la categoría (descripción, imagen, etc.).
4. Consultas: JOIN da acceso al nombre y metadatos de la categoría.

## Temas Complementarios: Funciones Analíticas (Window Functions)

Las funciones analíticas operan sobre un conjunto de filas relacionadas con la fila actual, sin agruparlas en una sola.

### ROW_NUMBER, RANK, DENSE_RANK

```sql
SELECT nombre,
       salario,
       ROW_NUMBER() OVER (ORDER BY salario DESC) AS row_num,
       RANK()       OVER (ORDER BY salario DESC) AS ranking,
       DENSE_RANK() OVER (ORDER BY salario DESC) AS dense_ranking
FROM empleados;
```

| Función | Comportamiento |
|---------|---------------|
| `ROW_NUMBER()` | Número único y consecutivo (sin empates) |
| `RANK()` | Mismo rango para empates, salta números |
| `DENSE_RANK()` | Mismo rango para empates, sin saltos |

### LEAD y LAG

`LAG` accede a la fila anterior y `LEAD` a la fila siguiente:

```sql
SELECT nombre,
       salario,
       LAG(salario, 1, 0) OVER (ORDER BY salario) AS salario_anterior,
       LEAD(salario, 1, 0) OVER (ORDER BY salario) AS salario_siguiente,
       salario - LAG(salario, 1, 0) OVER (ORDER BY salario) AS diferencia
FROM empleados;
```

### PARTITION BY

Divide el conjunto en grupos y aplica la función dentro de cada grupo:

```sql
SELECT departamento,
       nombre,
       salario,
       ROW_NUMBER() OVER (PARTITION BY departamento ORDER BY salario DESC) AS ranking_dept,
       AVG(salario) OVER (PARTITION BY departamento) AS salario_promedio_dept
FROM empleados;
```

**Revisartil para**: top-N por categoría, diferencias entre filas consecutivas, totales por grupo sin perder detalle.
