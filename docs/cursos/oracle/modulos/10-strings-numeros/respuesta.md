---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Cálculo de Precio con IVA y Descuento

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_precio_base  NUMBER(10,2) := 25000;
    v_iva          NUMBER(5,2);
    v_descuento    NUMBER(5,2);
    v_precio_final NUMBER(10,2);
BEGIN
    -- Caso 1: IVA 10.5%, descuento 15%
    v_iva := 10.5;
    v_descuento := 15;
    v_precio_final := ROUND(v_precio_base * (1 + v_iva/100) * (1 - v_descuento/100), 2);
    DBMS_OUTPUT.PUT_LINE('IVA ' || v_iva || '%, Descuento ' || v_descuento
        || '% -> Precio final: $' || v_precio_final);

    -- Caso 2: IVA 21%, descuento 0%
    v_iva := 21;
    v_descuento := 0;
    v_precio_final := ROUND(v_precio_base * (1 + v_iva/100) * (1 - v_descuento/100), 2);
    DBMS_OUTPUT.PUT_LINE('IVA ' || v_iva || '%, Descuento ' || v_descuento
        || '% -> Precio final: $' || v_precio_final);

    -- Caso 3: IVA 0%, descuento 25%
    v_iva := 0;
    v_descuento := 25;
    v_precio_final := ROUND(v_precio_base * (1 + v_iva/100) * (1 - v_descuento/100), 2);
    DBMS_OUTPUT.PUT_LINE('IVA ' || v_iva || '%, Descuento ' || v_descuento
        || '% -> Precio final: $' || v_precio_final);
END;
/
```

Salida esperada:
```
IVA 10.5%, Descuento 15% -> Precio final: $23487.5
IVA 21%, Descuento 0% -> Precio final: $30250
IVA 0%, Descuento 25% -> Precio final: $18750
```

---

## Ejercicio 4: Validación de Código de Barras EAN-13

```sql
SET SERVEROUTPUT ON;

DECLARE
    CURSOR c_productos IS
        SELECT id, nombre, codigo_barras FROM productos;
    v_invalidos PLS_INTEGER := 0;
BEGIN
    FOR r IN c_productos LOOP
        IF NOT REGEXP_LIKE(r.codigo_barras, '^\d{13}$') THEN
            DBMS_OUTPUT.PUT_LINE('Producto ' || r.id || ' (' || r.nombre
                || '): código inválido (' || r.codigo_barras || ')');
            v_invalidos := v_invalidos + 1;
        END IF;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('Total de productos con código inválido: ' || v_invalidos);
END;
/
```

Salida esperada:
```
Producto 2 (Mouse —ptico): código inválido (ABC4567890123)
Producto 4 (Monitor 24"): código inválido (12345)
Producto 6 (Parlantes): código inválido (9999-9999-999)
Total de productos con código inválido: 3
```

---

## Ejercicio 5: Ranking de Empleados

```sql
SELECT nombre,
       departamento,
       salario,
       ROW_NUMBER() OVER (ORDER BY salario DESC) AS row_num,
       RANK()       OVER (ORDER BY salario DESC) AS ranking,
       DENSE_RANK() OVER (ORDER BY salario DESC) AS dense_ranking
FROM empleados
ORDER BY salario DESC;
```

Salida esperada:
```
NOMBRE         DEPARTAMENTO  SALARIO   ROW_NUM   RANKING   DENSE_RANKING
Sofía Ruiz     TI            6500000   1         1         1
María Torres   TI            5800000   2         2         2
Ana López      Ventas        5000000   3         3         3
Carlos Díaz    Ventas        5000000   4         3         3
Luis Gómez     Ventas        4200000   5         5         4
Elena Ríos     RRHH          4200000   6         5         4
Pedro Vega     RRHH          3800000   7         7         5
```

Observación: Ana López y Carlos Díaz tienen el mismo salario ($5.000.000). RANK asigna 3 a ambos y salta el 4; DENSE_RANK asigna 3 a ambos y continúa con 4.

---

## Ejercicio 6: LEAD y LAG

```sql
SELECT nombre,
       salario,
       LAG(salario, 1, 0) OVER (ORDER BY salario) AS salario_anterior,
       LEAD(salario, 1, 0) OVER (ORDER BY salario) AS salario_siguiente,
       salario - LAG(salario, 1, 0) OVER (ORDER BY salario) AS diferencia
FROM empleados
ORDER BY salario;
```

Salida esperada:
```
NOMBRE         SALARIO   SALARIO_ANTERIOR   SALARIO_SIGUIENTE   DIFERENCIA
Pedro Vega     3800000   0                  4200000             3800000
Luis Gómez     4200000   3800000            5000000             400000
Elena Ríos     4200000   3800000            5000000             400000
Ana López      5000000   4200000            5000000             800000
Carlos Díaz    5000000   4200000            5800000             800000
María Torres   5800000   5000000            6500000             800000
Sofía Ruiz     6500000   5800000            0                   700000
```

---

## Ejercicio 7: Top 2 por Departamento con PARTITION BY

```sql
SELECT departamento, nombre, salario, ranking_dept
FROM (
    SELECT departamento,
           nombre,
           salario,
           ROW_NUMBER() OVER (PARTITION BY departamento ORDER BY salario DESC) AS ranking_dept
    FROM empleados
)
WHERE ranking_dept <= 2
ORDER BY departamento, ranking_dept;
```

Salida esperada:
```
DEPARTAMENTO   NOMBRE         SALARIO   RANKING_DEPT
RRHH           Elena Ríos     4200000   1
RRHH           Pedro Vega     3800000   2
TI             Sofía Ruiz     6500000   1
TI             María Torres   5800000   2
Ventas         Ana López      5000000   1
Ventas         Carlos Díaz    5000000   2
```

