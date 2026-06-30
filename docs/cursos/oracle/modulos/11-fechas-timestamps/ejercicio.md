---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Reporte Mensual de Ventas

Dada la tabla `VENTAS`:

```sql
CREATE TABLE ventas (
    id           NUMBER(8) PRIMARY KEY,
    producto     VARCHAR2(100),
    monto        NUMBER(10,2),
    fecha_venta  DATE
);

INSERT ALL
    INTO ventas VALUES (1, 'Laptop X200', 1500000, TO_DATE('15/01/2026','DD/MM/YYYY'))
    INTO ventas VALUES (2, 'Mouse —ptico', 25000,  TO_DATE('22/01/2026','DD/MM/YYYY'))
    INTO ventas VALUES (3, 'Teclado M01',  45000,  TO_DATE('05/02/2026','DD/MM/YYYY'))
    INTO ventas VALUES (4, 'Monitor 24"',  320000, TO_DATE('14/02/2026','DD/MM/YYYY'))
    INTO ventas VALUES (5, 'Laptop X200', 1500000, TO_DATE('10/03/2026','DD/MM/YYYY'))
    INTO ventas VALUES (6, 'Webcam HD',    55000,  TO_DATE('28/03/2026','DD/MM/YYYY'))
    INTO ventas VALUES (7, 'Parlantes',    89000,  TO_DATE('03/05/2026','DD/MM/YYYY'))
    INTO ventas VALUES (8, 'Mouse —ptico', 25000,  TO_DATE('18/06/2026','DD/MM/YYYY'))
    INTO ventas VALUES (9, 'Monitor 24"',  320000, TO_DATE('01/06/2025','DD/MM/YYYY'))
    INTO ventas VALUES (10, 'Teclado M01', 45000,  TO_DATE('20/06/2025','DD/MM/YYYY'))
SELECT * FROM DUAL;
```

Escribir un bloque anónimo PL/SQL que:
1. Reciba un año como variable (ej. `v_anio NUMBER := 2026`).
2. Use `EXTRACT(YEAR FROM fecha_venta)` y `EXTRACT(MONTH FROM fecha_venta)` para agrupar.
3. Para cada mes, calcule el total de ventas (`SUM(monto)`) y la cantidad de transacciones (`COUNT(*)`).
4. Formatee el mes usando `TO_CHAR` con máscara `'Month'` y `NLS_DATE_LANGUAGE=SPANISH`.
5. Muestre: `Enero 2026: $1.525.000 (2 ventas)`.

---

## Ejercicio 4: Cálculo de Devolución con INTERVAL

Una tienda de alquiler permite devolver productos 14 días después de la fecha de préstamo. Se necesita calcular si el cliente devolvió a tiempo o con retraso.

```sql
CREATE TABLE prestamos (
    id                  NUMBER(6) PRIMARY KEY,
    producto            VARCHAR2(100),
    fecha_prestamo      DATE,
    fecha_devolucion    DATE
);

INSERT ALL
    INTO prestamos VALUES (1, 'Laptop X200',  TO_DATE('01/06/2026','DD/MM/YYYY'), TO_DATE('14/06/2026','DD/MM/YYYY'))
    INTO prestamos VALUES (2, 'Mouse —ptico', TO_DATE('01/06/2026','DD/MM/YYYY'), TO_DATE('16/06/2026','DD/MM/YYYY'))
    INTO prestamos VALUES (3, 'Teclado M01',  TO_DATE('20/05/2026','DD/MM/YYYY'), TO_DATE('02/06/2026','DD/MM/YYYY'))
    INTO prestamos VALUES (4, 'Webcam HD',    TO_DATE('10/06/2026','DD/MM/YYYY'), NULL)
SELECT * FROM DUAL;
```

Escribir un bloque anónimo PL/SQL que:
1. Recorra los préstamos que ya tienen `fecha_devolucion` no nula.
2. Calcule `fecha_devolucion_estimada = fecha_prestamo + INTERVAL '14' DAY`.
3. Compare con `fecha_devolucion_real` y determine:
   - "A tiempo" si devolucion_real <= devolucion_estimada.
   - "Retraso de N días" si es posterior.
4. Muestre: `Producto: Laptop X200 - Devuelto: A tiempo` o `Producto: Mouse —ptico - Devuelto: Retraso de 2 días`.
