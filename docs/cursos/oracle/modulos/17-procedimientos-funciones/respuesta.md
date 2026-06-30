---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Respuesta 2: Procedimiento `crear_proyecto`

```sql
CREATE OR REPLACE PROCEDURE crear_proyecto (
    p_nombre            IN VARCHAR2,
    p_descripcion       IN VARCHAR2 DEFAULT NULL,
    p_fecha_inicio      IN DATE,
    p_fecha_fin_estimada IN DATE DEFAULT NULL,
    p_estado            IN CHAR DEFAULT 'P',
    p_presupuesto       IN NUMBER DEFAULT 0,
    p_proyecto_id       OUT NUMBER
)
IS
    v_presupuesto NUMBER(12,2);
    v_count       NUMBER;
BEGIN
    -- Validar que el presupuesto sea positivo
    v_presupuesto := NVL(p_presupuesto, 0);
    IF v_presupuesto < 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'El presupuesto no puede ser negativo');
    END IF;

    -- Validar fecha fin > fecha inicio
    IF p_fecha_fin_estimada IS NOT NULL AND p_fecha_fin_estimada <= p_fecha_inicio THEN
        RAISE_APPLICATION_ERROR(-20002, 'La fecha fin estimada debe ser posterior a la fecha de inicio');
    END IF;

    -- Validar nombre único
    SELECT COUNT(*) INTO v_count FROM proyectos WHERE nombre = p_nombre;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Ya existe un proyecto con el nombre: ' || p_nombre);
    END IF;

    -- Insertar
    INSERT INTO proyectos (nombre, descripcion, fecha_inicio, fecha_fin_estimada, estado, presupuesto)
    VALUES (p_nombre, p_descripcion, p_fecha_inicio, p_fecha_fin_estimada, p_estado, v_presupuesto)
    RETURNING id INTO p_proyecto_id;

    DBMS_OUTPUT.PUT_LINE('Proyecto creado con ID: ' || p_proyecto_id);
END;
/
```

### Prueba

```sql
SET SERVEROUTPUT ON;

DECLARE
    v_id NUMBER;
BEGIN
    crear_proyecto(
        p_nombre             => 'Sistema de Facturación',
        p_descripcion        => 'Implementación del módulo de facturación electrónica',
        p_fecha_inicio       => DATE '2026-01-15',
        p_fecha_fin_estimada => DATE '2026-06-30',
        p_estado             => 'E',
        p_presupuesto        => 150000,
        p_proyecto_id        => v_id
    );
    DBMS_OUTPUT.PUT_LINE('ID generado: ' || v_id);

    crear_proyecto(
        p_nombre             => 'App Móvil Corporativa',
        p_descripcion        => 'Desarrollo de aplicación móvil para empleados',
        p_fecha_inicio       => DATE '2026-03-01',
        p_fecha_fin_estimada => DATE '2026-09-30',
        p_estado             => 'P',
        p_presupuesto        => 250000,
        p_proyecto_id        => v_id
    );
    DBMS_OUTPUT.PUT_LINE('ID generado: ' || v_id);

    crear_proyecto(
        p_nombre       => 'Migración a Cloud',
        p_descripcion  => 'Migración de infraestructura on-premise a AWS',
        p_fecha_inicio => DATE '2026-04-01',
        p_estado       => 'P',
        p_presupuesto  => 500000,
        p_proyecto_id  => v_id
    );
    DBMS_OUTPUT.PUT_LINE('ID generado: ' || v_id);
END;
/
```

---

## Respuesta 3: Función `calcular_costo_real_tarea`

```sql
CREATE OR REPLACE FUNCTION calcular_costo_real_tarea (
    p_tarea_id IN tareas.id%TYPE
) RETURN NUMBER
IS
    v_horas_reales  tareas.horas_reales%TYPE;
    v_costo_hora    empleados.costo_hora%TYPE;
    v_responsable   tareas.responsable_id%TYPE;
BEGIN
    -- Obtener datos de la tarea
    SELECT t.horas_reales, t.responsable_id
    INTO v_horas_reales, v_responsable
    FROM tareas t
    WHERE t.id = p_tarea_id;

    -- Si no tiene responsable, retornar NULL
    IF v_responsable IS NULL THEN
        RETURN NULL;
    END IF;

    -- Obtener costo hora del responsable
    SELECT e.costo_hora
    INTO v_costo_hora
    FROM empleados e
    WHERE e.id = v_responsable;

    -- Calcular costo real
    RETURN NVL(v_horas_reales, 0) * NVL(v_costo_hora, 0);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END;
/
```

### Demo

```sql
-- Insertar empleados de prueba
INSERT INTO empleados (nombre, email, cargo, costo_hora) VALUES ('Ana López',    'ana.lopez@empresa.com',   'Desarrollador Senior',  80);
INSERT INTO empleados (nombre, email, cargo, costo_hora) VALUES ('Carlos Ruiz',  'carlos.ruiz@empresa.com',  'Desarrollador Junior',  50);
INSERT INTO empleados (nombre, email, cargo, costo_hora) VALUES ('María Gómez',  'maria.gomez@empresa.com',  'Project Manager',      120);
INSERT INTO empleados (nombre, email, cargo, costo_hora) VALUES ('Pedro Sánchez','pedro.sanchez@empresa.com', 'QA Engineer',           60);
INSERT INTO empleados (nombre, email, cargo, costo_hora) VALUES ('Laura Díaz',   'laura.diaz@empresa.com',    'Diseñador UX',          70);
COMMIT;

-- Insertar tareas (el proyecto ID asume proyectos previos; ajustar según IDs generados)
INSERT INTO tareas (proyecto_id, nombre, responsable_id, fecha_inicio, fecha_fin, horas_estimadas, horas_reales, estado)
SELECT id, 'Diseño de módulo', (SELECT id FROM empleados WHERE nombre = 'Ana López'),
       DATE '2026-01-20', DATE '2026-02-28', 120, 100, 'C'
FROM proyectos WHERE nombre = 'Sistema de Facturación';

INSERT INTO tareas (proyecto_id, nombre, responsable_id, fecha_inicio, fecha_fin, horas_estimadas, horas_reales, estado)
SELECT id, 'Pruebas unitarias', (SELECT id FROM empleados WHERE nombre = 'Pedro Sánchez'),
       DATE '2026-03-01', DATE '2026-04-15', 80, 75, 'C'
FROM proyectos WHERE nombre = 'Sistema de Facturación';

INSERT INTO tareas (proyecto_id, nombre, responsable_id, fecha_inicio, fecha_fin, horas_estimadas, horas_reales, estado)
SELECT id, 'Documentación', (SELECT id FROM empleados WHERE nombre = 'María Gómez'),
       DATE '2026-04-01', DATE '2026-05-15', 40, NULL, 'P'
FROM proyectos WHERE nombre = 'Sistema de Facturación';
COMMIT;

-- SELECT demo
SELECT t.id,
       t.nombre AS tarea,
       t.horas_reales,
       e.nombre AS responsable,
       e.costo_hora,
       calcular_costo_real_tarea(t.id) AS costo_real
FROM tareas t
LEFT JOIN empleados e ON t.responsable_id = e.id
ORDER BY t.id;
```

---

## Respuesta 4: Procedimiento `asignar_tarea`

```sql
CREATE OR REPLACE PROCEDURE asignar_tarea (
    p_tarea_id    IN tareas.id%TYPE,
    p_empleado_id IN empleados.id%TYPE
)
IS
    v_tarea_existe     NUMBER;
    v_empleado_existe  NUMBER;
    v_tareas_activas   NUMBER;
    v_estado_tarea     tareas.estado%TYPE;
BEGIN
    -- Validar que el empleado exista
    SELECT COUNT(*) INTO v_empleado_existe FROM empleados WHERE id = p_empleado_id;
    IF v_empleado_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20010, 'El empleado con ID ' || p_empleado_id || ' no existe');
    END IF;

    -- Validar que la tarea exista y obtener su estado
    SELECT COUNT(*), estado
    INTO v_tarea_existe, v_estado_tarea
    FROM tareas
    WHERE id = p_tarea_id
    GROUP BY estado;

    IF v_tarea_existe = 0 THEN
        RAISE_APPLICATION_ERROR(-20011, 'La tarea con ID ' || p_tarea_id || ' no existe');
    END IF;

    IF v_estado_tarea != 'P' THEN
        RAISE_APPLICATION_ERROR(-20012, 'La tarea debe estar en estado Pendiente (P) para ser asignada. Estado actual: ' || v_estado_tarea);
    END IF;

    -- Validar que el empleado no tenga más de 5 tareas activas
    SELECT COUNT(*) INTO v_tareas_activas
    FROM tareas
    WHERE responsable_id = p_empleado_id
      AND estado IN ('P', 'E');

    IF v_tareas_activas >= 5 THEN
        RAISE_APPLICATION_ERROR(-20013, 'El empleado con ID ' || p_empleado_id ||
                                ' ya tiene ' || v_tareas_activas || ' tareas activas. Máximo permitido: 5');
    END IF;

    -- Asignar
    UPDATE tareas
    SET responsable_id = p_empleado_id,
        estado = 'E'
    WHERE id = p_tarea_id;

    DBMS_OUTPUT.PUT_LINE('Tarea ' || p_tarea_id || ' asignada al empleado ' || p_empleado_id);
END;
/
```

### Prueba

```sql
DECLARE
    v_tarea1_id NUMBER;
    v_tarea2_id NUMBER;
    v_tarea3_id NUMBER;
    v_emp_id    NUMBER;
    v_proy_id   NUMBER;
BEGIN
    -- Obtener IDs de prueba
    SELECT id INTO v_proy_id FROM proyectos WHERE nombre = 'Sistema de Facturación';
    SELECT id INTO v_emp_id FROM empleados WHERE nombre = 'Ana López';

    -- Crear tareas adicionales para probar
    INSERT INTO tareas (proyecto_id, nombre, estado)
    VALUES (v_proy_id, 'Tarea prueba 1', 'P')
    RETURNING id INTO v_tarea1_id;

    INSERT INTO tareas (proyecto_id, nombre, estado)
    VALUES (v_proy_id, 'Tarea prueba 2', 'P')
    RETURNING id INTO v_tarea2_id;

    INSERT INTO tareas (proyecto_id, nombre, estado)
    VALUES (v_proy_id, 'Tarea prueba 3', 'P')
    RETURNING id INTO v_tarea3_id;

    -- Asignar tareas hasta exceder límite
    asignar_tarea(v_tarea1_id, v_emp_id);
    asignar_tarea(v_tarea2_id, v_emp_id);
    -- La tercera tarea de prueba + las 2 existentes (Diseño + Pruebas) = 5 activas?
    -- Depende de cuantas fueron asignadas antes. Probamos asignar una más:
    BEGIN
        asignar_tarea(v_tarea3_id, v_emp_id);
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Error esperado: ' || SQLERRM);
    END;

    COMMIT;
END;
/
```

---

## Respuesta 5: Función recursiva `calcular_costo_total_proyecto`

```sql
CREATE OR REPLACE FUNCTION calcular_costo_total_proyecto (
    p_proyecto_id IN proyectos.id%TYPE
) RETURN NUMBER
IS
    v_total NUMBER := 0;

    CURSOR c_tareas IS
        SELECT id FROM tareas WHERE proyecto_id = p_proyecto_id;
BEGIN
    FOR r_tarea IN c_tareas LOOP
        v_total := v_total + NVL(calcular_costo_real_tarea(r_tarea.id), 0);
    END LOOP;

    RETURN v_total;
END;
/
```

### Demo

```sql
SELECT p.id,
       p.nombre,
       p.presupuesto,
       calcular_costo_total_proyecto(p.id) AS costo_total,
       CASE
           WHEN calcular_costo_total_proyecto(p.id) <= NVL(p.presupuesto, 0) THEN 'Dentro del presupuesto'
           ELSE 'EXCEDIDO'
       END AS estado_presupuesto
FROM proyectos p
ORDER BY p.id;
```

