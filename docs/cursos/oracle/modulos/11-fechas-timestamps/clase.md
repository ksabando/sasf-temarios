---
sidebar_label: "Clase"
---

# Módulo 06: Fechas y Modelado Temporal

## 1. Tipos de Datos Temporales en Oracle

| Tipo | Precisión | Almacena | Uso recomendado |
|------|-----------|----------|-----------------|
| `DATE` | Segundos | Fecha + hora (7 bytes: siglo, año, mes, día, hora, minuto, seg) | La mayoría de aplicaciones transaccionales |
| `TIMESTAMP` | Fracciones de segundo (hasta 9 decimales) | Fecha + hora + fracciones | Auditoría, registros con precisión milisegundo |
| `TIMESTAMP WITH TIME ZONE` | Fracciones + Zona horaria | Como TIMESTAMP + zona horaria de origen | Aplicaciones globales multi-zona |
| `TIMESTAMP WITH LOCAL TIME ZONE` | Fracciones + Zona horaria convertible | Almacena en UTC, convierte a zona local del usuario | Aplicaciones donde cada usuario ve su hora local |

### ¿Cuándo usar cada uno?

- **Transacciones diarias** (fecha de venta, fecha de ingreso): `DATE`.
- **Auditoría precisa** (created_at, updated_at): `TIMESTAMP`.
- **Aplicaciones globales** (usuarios en múltiples husos horarios): `TIMESTAMP WITH TIME ZONE`.
- **Sistemas regionales** (todos en una zona pero con daylight saving): `TIMESTAMP WITH LOCAL TIME ZONE`.

## 2. Funciones y Operaciones con Fechas

### Obtención de fecha/hora actual

```sql
SYSDATE        → 02/06/2026 15:30:00   (DATE del servidor)
SYSTIMESTAMP   → 02/06/2026 15:30:00.123456 -03:00  (TIMESTAMP WITH TIME ZONE)
CURRENT_DATE   → 02/06/2026 15:30:00   (DATE zona del usuario)
CURRENT_TIMESTAMP → 02/06/2026 15:30:00.123456 -03:00
```

### Manipulación de fechas

```sql
ADD_MONTHS(SYSDATE, 3)              → 02/09/2026  (suma 3 meses)
MONTHS_BETWEEN('01/10/2026', '01/05/2026')  → 5  (diferencia en meses)
EXTRACT(YEAR FROM SYSDATE)          → 2026
EXTRACT(MONTH FROM SYSDATE)         → 6
LAST_DAY(SYSDATE)                   → 30/06/2026
TRUNC(SYSDATE)                      → 02/06/2026  (sin hora)
TRUNC(SYSDATE, 'MM')                → 01/06/2026  (primer día del mes)
TRUNC(SYSDATE, 'YYYY')              → 01/01/2026  (primer día del año)
```

### Conversión TO_DATE / TO_CHAR

```sql
TO_DATE('15/01/2026', 'DD/MM/YYYY')
TO_CHAR(SYSDATE, 'DD "de" Month "del" YYYY', 'NLS_DATE_LANGUAGE=SPANISH')
→ "02 de Junio del 2026"

TO_CHAR(SYSDATE, 'DAY', 'NLS_DATE_LANGUAGE=SPANISH') → "MARTES"
TO_CHAR(SYSDATE, 'HH24:MI:SS')  → "15:30:00"
TO_TIMESTAMP('02/06/2026 15:30:00.123', 'DD/MM/YYYY HH24:MI:SS.FF3')
```

### INTERVAL

```sql
INTERVAL '15' DAY           → +15 00:00:00
INTERVAL '3' MONTH          → +03-00
INTERVAL '2 06:30:00' DAY TO SECOND → +02 06:30:00

SYSDATE + INTERVAL '14' DAY   → fecha actual + 14 días
SYSDATE + INTERVAL '1' MONTH  → fecha actual + 1 mes (similar a ADD_MONTHS)
```

## 3. Modelado de Datos Temporales — TABLE MODELING

### Columnas de Auditoría

```sql
CREATE TABLE ventas (
    id          NUMBER(10) PRIMARY KEY,
    monto       NUMBER(10,2),
    created_at  TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at  TIMESTAMP DEFAULT SYSTIMESTAMP
);
```

### Diseño de Tablas Históricas (SCD Type 2)

**Mal diseño** (solo valor actual):
```sql
CREATE TABLE productos (
    precio_actual NUMBER(10,2)  -- se pierde el historial
);
```

**Buen diseño** (historial de precios):
```sql
CREATE TABLE precios_historicos (
    producto_id  NUMBER(6) NOT NULL,
    precio       NUMBER(10,2) NOT NULL,
    fecha_desde  DATE NOT NULL,
    fecha_hasta  DATE,
    CONSTRAINT pk_precios_historico
        PRIMARY KEY (producto_id, fecha_desde),
    CONSTRAINT fk_precios_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

Este diseño SCD Type 2 permite:
- Saber qué precio tenía un producto en cualquier fecha (`fecha_desde <= :fecha AND (fecha_hasta IS NULL OR fecha_hasta > :fecha)`).
- Rastrear cambios históricos.
- `fecha_hasta IS NULL` indica el precio vigente.

### Particionamiento por Fecha (para tablas grandes)

```sql
CREATE TABLE ventas (
    id           NUMBER(10),
    fecha_venta  DATE,
    monto        NUMBER(10,2)
)
PARTITION BY RANGE (fecha_venta) (
    PARTITION ventas_2025 VALUES LESS THAN (TO_DATE('01/01/2026','DD/MM/YYYY')),
    PARTITION ventas_2026 VALUES LESS THAN (TO_DATE('01/01/2027','DD/MM/YYYY')),
    PARTITION ventas_futuro VALUES LESS THAN (MAXVALUE)
);
```

### Estrategias para Fechas Efectivas

- **SCD Type 1**: Sobrescribir (no hay historia).
- **SCD Type 2**: Múltiples registros con `fecha_desde` y `fecha_hasta` (historia completa).
- **SCD Type 3**: Columna "anterior" y "actual" (historia parcial).

En la tienda:
- `PRECIOS_HISTORICOS`: SCD Type 2.
- `ESTADO_PEDIDO` (pendiente, enviado, entregado): SCD Type 2 con tabla de cambios de estado.
- `VENTAS`: No necesita SCD, es un hecho puntual (fecha_venta).
