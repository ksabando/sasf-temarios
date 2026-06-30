---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---
Webcam HD - Antigüedad: 1332 días (3 años) - Ingresó: 10/10/2022
Teclado M01 - Antigüedad: 1190 días (3 años) - Ingresó: 01/03/2023
Laptop X200 - Antigüedad: 884 días (2 años) - Ingresó: 01/01/2024
Mouse —ptico - Antigüedad: 385 días (1 años) - Ingresó: 15/05/2025
```

---

## Ejercicio 3: Reporte Mensual de Ventas

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_anio NUMBER := 2026;
    CURSOR c_meses IS
        SELECT EXTRACT(MONTH FROM fecha_venta) AS mes,
               SUM(monto) AS total_mes,
               COUNT(*) AS cantidad_ventas
        FROM ventas
        WHERE EXTRACT(YEAR FROM fecha_venta) = v_anio
        GROUP BY EXTRACT(MONTH FROM fecha_venta)
        ORDER BY EXTRACT(MONTH FROM fecha_venta);
    v_mes_nombre VARCHAR2(20);
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Reporte Mensual de Ventas - Año ' || v_anio || ' ===');
    DBMS_OUTPUT.PUT_LINE('----------------------------------------');

    FOR r IN c_meses LOOP
        -- Obtener nombre del mes en español
        v_mes_nombre := TO_CHAR(TO_DATE('01/' || r.mes || '/' || v_anio, 'DD/MM/YYYY'),
                                'Month', 'NLS_DATE_LANGUAGE=SPANISH');
        DBMS_OUTPUT.PUT_LINE(INITCAP(v_mes_nombre) || ' ' || v_anio
            || ': $' || TO_CHAR(r.total_mes, 'FM999G999G990D00')
            || ' (' || r.cantidad_ventas || ' ventas)');
    END LOOP;
END;
/
```

Salida esperada:
```
=== Reporte Mensual de Ventas - Año 2026 ===
----------------------------------------
Enero 2026: $1.525.000,00 (2 ventas)
Febrero 2026: $365.000,00 (2 ventas)
Marzo 2026: $1.555.000,00 (2 ventas)
Mayo 2026: $89.000,00 (1 ventas)
Junio 2026: $25.000,00 (1 ventas)
```

---

## Ejercicio 4: Cálculo de Devolución con INTERVAL

```sql
SET SERVEROUTPUT ON;

DECLARE
    CURSOR c_prestamos IS
        SELECT id, producto, fecha_prestamo, fecha_devolucion
        FROM prestamos
        WHERE fecha_devolucion IS NOT NULL;
    v_fecha_estimada DATE;
    v_diferencia NUMBER;
BEGIN
    FOR r IN c_prestamos LOOP
        v_fecha_estimada := r.fecha_prestamo + INTERVAL '14' DAY;

        IF r.fecha_devolucion <= v_fecha_estimada THEN
            DBMS_OUTPUT.PUT_LINE('Producto: ' || r.producto
                || ' - Devuelto: A tiempo');
        ELSE
            v_diferencia := r.fecha_devolucion - v_fecha_estimada;
            DBMS_OUTPUT.PUT_LINE('Producto: ' || r.producto
                || ' - Devuelto: Retraso de ' || v_diferencia || ' día(s)');
        END IF;
    END LOOP;
END;
/
```

Salida esperada:
```
Producto: Laptop X200 - Devuelto: A tiempo
Producto: Mouse —ptico - Devuelto: Retraso de 2 día(s)
Producto: Teclado M01 - Devuelto: A tiempo
```

