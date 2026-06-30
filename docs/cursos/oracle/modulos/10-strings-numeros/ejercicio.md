---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Cálculo de Precio con IVA y Descuento

Una tienda aplica IVA y descuentos sobre el precio base de sus productos. La fórmula es:

```
precio_final = precio_base * (1 + iva/100) * (1 - descuento/100)
```

Escribir un bloque anónimo PL/SQL que:

1. Declare variables para: `precio_base NUMBER(10,2) := 25000`, `iva NUMBER(5,2)`, `descuento NUMBER(5,2)`.
2. Calcule `precio_final` para estas combinaciones:
   - IVA = 10.5, descuento = 15
   - IVA = 21, descuento = 0
   - IVA = 0, descuento = 25
3. Use `ROUND(precio_final, 2)` para redondear a 2 decimales.
4. Muestre cada resultado etiquetado.

---

## Ejercicio 4: Validación de Código de Barras EAN-13 con REGEXP_LIKE

La tabla `PRODUCTOS` contiene códigos de barras que deben ser EAN-13 (13 dígitos exactos). Algunos registros tienen códigos inválidos.

```sql
CREATE TABLE productos (
    id             NUMBER(6) PRIMARY KEY,
    nombre         VARCHAR2(100),
    codigo_barras  VARCHAR2(13)
);

INSERT ALL
    INTO productos VALUES (1, 'Laptop X200',  '1234567890123')
    INTO productos VALUES (2, 'Mouse —ptico', 'ABC4567890123')
    INTO productos VALUES (3, 'Teclado M01',  '9876543210987')
    INTO productos VALUES (4, 'Monitor 24"',  '12345')
    INTO productos VALUES (5, 'Webcam HD',    '1111111111111')
    INTO productos VALUES (6, 'Parlantes',    '9999-9999-999')
SELECT * FROM DUAL;
```

Escribir un bloque anónimo PL/SQL que:
1. Declare un contador `v_invalidos PLS_INTEGER := 0`.
2. Recorra todos los productos usando un cursor explícito.
3. Valide cada `codigo_barras` con `REGEXP_LIKE(codigo_barras, '^\d{13}$')`.
4. Si el código es inválido, muestre mensaje: `Producto X: código inválido (valor)` e incremente el contador.
5. Al final muestre: `Total de productos con código inválido: N`.

---

## Ejercicio 5: Ranking de Empleados por Salario (ROW_NUMBER, RANK, DENSE_RANK)

Dada la tabla `EMPLEADOS`:

```sql
CREATE TABLE empleados (
    id           NUMBER(6) PRIMARY KEY,
    nombre       VARCHAR2(100),
    departamento VARCHAR2(50),
    salario      NUMBER(10,2) NOT NULL
);

INSERT ALL
    INTO empleados VALUES (1, 'Ana López',    'Ventas',     5000000)
    INTO empleados VALUES (2, 'Luis Gómez',   'Ventas',     4200000)
    INTO empleados VALUES (3, 'Sofía Ruiz',   'TI',         6500000)
    INTO empleados VALUES (4, 'Carlos Díaz',  'Ventas',     5000000)
    INTO empleados VALUES (5, 'María Torres', 'TI',         5800000)
    INTO empleados VALUES (6, 'Pedro Vega',   'RRHH',       3800000)
    INTO empleados VALUES (7, 'Elena Ríos',   'RRHH',       4200000)
SELECT * FROM DUAL;
```

Escribir una consulta SQL que muestre: `nombre`, `departamento`, `salario`, `row_num`, `ranking`, `dense_ranking` ordenado por salario descendente. Observar la diferencia entre RANK y DENSE_RANK con salarios repetidos.

---

## Ejercicio 6: Diferencia Salarial con LEAD y LAG

Usando la misma tabla `EMPLEADOS`, escribir una consulta SQL que:
1. Ordene empleados por salario ascendente.
2. Muestre: `nombre`, `salario`, `salario_anterior` (LAG), `salario_siguiente` (LEAD), `diferencia` (salario - salario_anterior).
3. Para el primer registro, `salario_anterior` debe mostrar 0.

---

## Ejercicio 7: Top 2 Empleados por Departamento con PARTITION BY

Usando la misma tabla `EMPLEADOS`, escribir una consulta SQL que:
1. Asigne un ranking por departamento usando `ROW_NUMBER()` con `PARTITION BY departamento ORDER BY salario DESC`.
2. Filtre para mostrar solo los 2 empleados con mayor salario de cada departamento.
3. Muestre: `departamento`, `nombre`, `salario`, `ranking_dept`.
