---
sidebar_label: "Clase"
---

## TABLE MODELING: Modelado para Rendimiento

### 1. Índices

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| **B-tree** (default) | Columnas con alta cardinalidad (muchos valores distintos) | IDs, fechas |
| **Bitmap** | Columnas con baja cardinalidad (pocos valores) | estado ('P','E','C') |
| **Function-based** | Funciones aplicadas a columnas | `UPPER(nombre)` |
| **Composite** | Múltiples columnas en una consulta | `(proyecto_id, estado)` |

```sql
CREATE INDEX idx_tareas_proyecto ON tareas(proyecto_id);
CREATE BITMAP INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_emp_email_mayus ON empleados(UPPER(email));
CREATE INDEX idx_tareas_proy_estado ON tareas(proyecto_id, estado);
```

### 2. Particionamiento

Divide tablas grandes en partes más pequeñas para mejorar mantenimiento y rendimiento:

```sql
CREATE TABLE tareas (
    id NUMBER(10), proyecto_id NUMBER(6), fecha_creacion DATE, ...
)
PARTITION BY RANGE (fecha_creacion) (
    PARTITION tareas_2025 VALUES LESS THAN (DATE '2026-01-01'),
    PARTITION tareas_2026_q1 VALUES LESS THAN (DATE '2026-04-01'),
    PARTITION tareas_2026_q2 VALUES LESS THAN (DATE '2026-07-01'),
    PARTITION tareas_future VALUES LESS THAN (MAXVALUE)
);
```

### 3. Denormalización Estratégica

Agregar columnas redundantes para evitar JOINs costosos:

```sql
-- En lugar de JOIN cada vez, almacenamos el nombre del proyecto en tareas
ALTER TABLE tareas ADD proyecto_nombre VARCHAR2(100);
-- O la horas totales directamente en proyectos
ALTER TABLE proyectos ADD horas_totales NUMBER(8,1) DEFAULT 0;
```

**Costo**: Mayor complejidad en mantenimiento (sincronización con triggers).

### 4. Vistas Materializadas

Resultados pre-calculados que se refrescan periódicamente:

```sql
CREATE MATERIALIZED VIEW LOG ON tareas WITH ROWID, PRIMARY KEY;

CREATE MATERIALIZED VIEW mv_resumen_proyectos
REFRESH FAST ON DEMAND
AS
SELECT p.id, p.nombre, COUNT(t.id) AS total_tareas,
       SUM(t.horas_reales) AS horas_reales_totales
FROM proyectos p
LEFT JOIN tareas t ON p.id = t.proyecto_id
GROUP BY p.id, p.nombre;
```

### 5. Decisiones de Performance en el Modelo

| Decisión | Pros | Contras |
|----------|------|---------|
| Índices en FK | Acelera JOINs y DELETE en cascada | Ralentiza INSERT/UPDATE en tabla hija |
| Denormalización | Evita JOINs costosos | Datos redundantes, riesgo de inconsistencia |
| Particionamiento | Mejora mantenimiento y consultas por rango | Complejidad adicional |
| No usar FK | Mayor velocidad en INSERT masivos | Riesgo de datos huérfanos |
| Columnas VARCHAR2(4000) | Flexibilidad | Mayor espacio, peor rendimiento en índices |

### 6. Costo de las Foreign Keys en INSERT/UPDATE

Cada FK exige que Oracle verifique la existencia de la clave padre, lo que implica:

- Un SELECT implícito sobre la tabla padre (lectura de índice)
- Bloqueo de fila en la tabla padre (por integridad referencial)
- Mayor contención en tablas con alta concurrencia

**Mitigación**:
- Índices en las columnas FK (Oracle los necesita para evitar locks de tabla completa)
- En procesos batch masivos, considerar deshabilitar FK temporalmente (`ALTER TABLE ... DISABLE CONSTRAINT ...`)

### 7. Modelo Físico vs Lógico

| Modelo Lógico | Modelo Físico |
|---------------|---------------|
| Normalizado (3FN) | Puede incluir desnormalización |
| Independiente de tecnología | Optimizado para el motor específico |
| Entidades y relaciones | Índices, particiones, tablespaces |
| No considera volúmenes | Decisiones basadas en datos reales |

**Proceso**: El modelo lógico se refina con información de volúmenes, consultas críticas y SLAs de rendimiento para generar el modelo físico.
