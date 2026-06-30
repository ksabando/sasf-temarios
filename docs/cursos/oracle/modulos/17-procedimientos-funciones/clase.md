---
sidebar_label: "Clase"
---

# Módulo 12: Procedimientos, Funciones y Table API Pattern

## 1. Subprogramas en PL/SQL

Los subprogramas son unidades de código nombradas que pueden recibir parámetros y ejecutar una secuencia de sentencias. Se dividen en:

- **PROCEDURE**: Realiza acciones, puede devolver valores mediante parámetros OUT.
- **FUNCTION**: Siempre devuelve un único valor (RETURN), puede usarse en expresiones SQL.

### Sintaxis básica

```sql
CREATE OR REPLACE PROCEDURE nombre_proc (
    p_param1 IN VARCHAR2,
    p_param2 OUT NUMBER,
    p_param3 IN OUT DATE DEFAULT SYSDATE
)
IS
    v_variable NUMBER;
BEGIN
    -- lógica
END;
/
```

```sql
CREATE OR REPLACE FUNCTION nombre_func (
    p_param1 IN NUMBER
) RETURN VARCHAR2
IS
    v_resultado VARCHAR2(100);
BEGIN
    -- lógica
    RETURN v_resultado;
END;
/
```

## 2. Parámetros: IN, OUT, IN OUT

| Modo | Descripción | Default |
|------|-------------|---------|
| IN | Solo lectura. El valor se pasa desde el llamador. | Sí |
| OUT | Escritura. El subprograma asigna un valor al llamador. | No |
| IN OUT | Lectura y escritura. | No |

### DEFAULT

```sql
PROCEDURE crear_proyecto (
    p_nombre IN VARCHAR2,
    p_presupuesto IN NUMBER DEFAULT 0
);
```

## 3. NOCOPY Hint

Por defecto, los parámetros OUT e IN OUT se pasan **por valor** (se copian al salir). NOCOPY solicita paso **por referencia**, evitando la copia para mejorar rendimiento con datos grandes.

```sql
PROCEDURE procesar_datos (
    p_datos IN OUT NOCOPY SYS_REFCURSOR
);
```

**Advertencia**: NOCOPY es una sugerencia, no una directiva. Si ocurre una excepción, el valor del parámetro es impredecible.

## 4. Overloading (Sobrecarga)

Múltiples subprogramas con el **mismo nombre** pero **diferentes parámetros** (número, tipo, orden).

```sql
PROCEDURE generar_reporte (p_proyecto_id IN NUMBER);
PROCEDURE generar_reporte (p_empleado_id IN NUMBER);
PROCEDURE generar_reporte; -- sin parámetros
```

## 5. AUTHID: CURRENT_USER vs DEFINER

| Cláusula | Comportamiento |
|----------|----------------|
| `AUTHID DEFINER` (default) | Ejecuta con privilegios del dueño del objeto. |
| `AUTHID CURRENT_USER` | Ejecuta con privilegios del usuario que llama. |

Útil para aplicaciones multi-tenant o cuando se necesita validación de seguridad dinámica.

## 6. Recursividad

Un subprograma puede llamarse a sí mismo. Debe tener una condición de terminación.

```sql
FUNCTION factorial (n NUMBER) RETURN NUMBER IS
BEGIN
    IF n <= 1 THEN
        RETURN 1;
    ELSE
        RETURN n * factorial(n - 1);
    END IF;
END;
/
```

---

## TABLE MODELING: Table API Pattern

### ¿Qué es el Table API Pattern?

Es un patrón de diseño donde **todo acceso a una tabla** se encapsula dentro de procedimientos y funciones. Ningún cliente (aplicación, reporte, otro PL/SQL) opera directamente sobre la tabla con INSERT/UPDATE/DELETE; en su lugar, llama a subprogramas específicos.

### Estructura típica

```
Table: PROYECTOS
├── PROCEDURE crear_proyecto    (INSERT)
├── PROCEDURE actualizar_proyecto (UPDATE)
├── FUNCTION obtener_proyecto   (SELECT x 1)
├── FUNCTION listar_proyectos   (SELECT *)
├── PROCEDURE eliminar_proyecto (DELETE lógico)
└── FUNCTION validar_proyecto   (reglas de negocio)
```

### Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Abstracción del modelo** | Los consumidores no conocen la estructura física de las tablas. Se puede modificar el esquema sin afectar clientes. |
| **Seguridad** | Se pueden revocar permisos directos sobre tablas y otorgar solo EXECUTE sobre los subprogramas. |
| **Transacciones controladas** | La lógica transaccional queda centralizada: COMMIT/ROLLBACK se maneja desde la API, no desde el cliente. |
| **Validaciones consistentes** | Las reglas de negocio se aplican siempre, sin importar qué aplicación llame. |
| **Auditoría** | Es fácil agregar logging en un solo punto. |

### ¿Cuándo NO usar Table API?

- Tablas de catálogos pequeños que raramente cambian (p. ej., `PAISES`, `MONEDAS`).
- Tablas staging o temporales en procesos ETL.
- Cuando el equipo de desarrollo es pequeño y el overhead de mantener la API no se justifica.
- Tablas expuestas a herramientas de BI/Oracle Analytics que requieren acceso directo.

### Diseño de interfaz

Los parámetros de los subprogramas deben reflejar las columnas de la tabla, pero agrupando conceptos:

```sql
-- Tabla: TAREAS (id, proyecto_id, nombre, responsable_id, fecha_inicio, fecha_fin, horas_estimadas, horas_reales, estado)

-- Buen diseño
PROCEDURE crear_tarea (
    p_proyecto_id     IN NUMBER,
    p_nombre          IN VARCHAR2,
    p_responsable_id  IN NUMBER,
    p_fecha_inicio    IN DATE,
    p_fecha_fin       IN DATE,
    p_horas_estimadas IN NUMBER,
    p_tarea_id        OUT NUMBER
);

-- Mal diseño (demasiados parámetros opcionales sin agrupar)
PROCEDURE actualizar_tarea (
    p_tarea_id        IN NUMBER,
    p_nombre          IN VARCHAR2 DEFAULT NULL,
    p_responsable_id  IN NUMBER DEFAULT NULL,
    p_fecha_inicio    IN DATE DEFAULT NULL,
    p_fecha_fin       IN DATE DEFAULT NULL,
    p_horas_estimadas IN NUMBER DEFAULT NULL,
    p_horas_reales    IN NUMBER DEFAULT NULL,
    p_estado          IN VARCHAR2 DEFAULT NULL
);
```

### Funciones de validación

Las reglas de negocio que operan sobre el modelo se implementan como funciones de validación reutilizables:

```sql
FUNCTION validar_presupuesto (p_presupuesto IN NUMBER) RETURN BOOLEAN;
FUNCTION empleado_tiene_capacidad (p_empleado_id IN NUMBER) RETURN BOOLEAN;
FUNCTION proyecto_esta_activo (p_proyecto_id IN NUMBER) RETURN BOOLEAN;
```

Estas funciones se usan dentro de los procedimientos de la Table API y pueden reutilizarse en triggers o reportes.
