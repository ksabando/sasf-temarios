---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Package `pkg_reportes` con sobrecarga

Crear el package `pkg_reportes` con el procedimiento sobrecargado `generar_reporte`:

1. `generar_reporte(p_proyecto_id NUMBER)` — Muestra:
   - Nombre del proyecto, estado, presupuesto
   - Listado de tareas con responsable, horas, costo
   - Total costo del proyecto

2. `generar_reporte` (sin parámetros) — Genera el reporte global de todos los proyectos

Ambas versiones deben usar DBMS_OUTPUT para mostrar el reporte formateado.

**Prueba:** Ejecutar ambas versiones del procedimiento y verificar la salida.

---

## Ejercicio 3: Package `pkg_utilidades`

Crear el package `pkg_utilidades` con los siguientes miembros públicos:

1. **Función `formatear_moneda`**
   - Parámetros: `p_monto NUMBER`, `p_moneda VARCHAR2 DEFAULT 'USD'`
   - Retorna: VARCHAR2 con formato `$1,234.56 USD`

2. **Función `estado_texto`**
   - Parámetro: `p_estado CHAR`
   - Retorna:
     - 'P' → 'Pendiente'
     - 'E' → 'En Progreso'
     - 'C' → 'Completado'
     - Otro → 'Desconocido'

3. **Procedimiento `log_error`**
   - Parámetros: `p_mensaje VARCHAR2`, `p_modulo VARCHAR2 DEFAULT 'APLICACION'`
   - Inserta un registro en una tabla `LOG_ERRORES` (id, mensaje, modulo, fecha, usuario). Crear la tabla previamente.
   - No debe hacer COMMIT (quien llama controla la transacción).

**Prueba desde bloque anónimo:**

```sql
DECLARE
    v_precio VARCHAR2(50);
    v_estado VARCHAR2(30);
BEGIN
    v_precio := pkg_utilidades.formatear_moneda(1234.56);
    v_estado := pkg_utilidades.estado_texto('E');

    DBMS_OUTPUT.PUT_LINE('Monto: ' || v_precio);
    DBMS_OUTPUT.PUT_LINE('Estado: ' || v_estado);

    pkg_utilidades.log_error('Prueba de error', 'BLOQUE_ANONIMO');
    COMMIT;
END;
/
```

---

## Ejercicio 4: Variables de package — Contador de llamadas

Extender el package `pkg_tareas` agregando:

1. Una **variable de package** `g_contador_llamadas NUMBER` que se incremente en cada llamada a `asignar`.
2. Un procedimiento `mostrar_estadisticas` que muestre:
   - Total de asignaciones realizadas
   - Total de tareas activas en el sistema
   - Total de empleados registrados

El contador debe ser privado (definido solo en el package body) y el procedimiento `mostrar_estadisticas` debe ser público.

**Prueba:**
1. Llamar a `asignar` varias veces
2. Llamar a `mostrar_estadisticas`
3. Verificar que el contador refleje el número correcto de asignaciones

**Pregunta conceptual:** ¿Qué sucede con `g_contador_llamadas` si abrimos dos sesiones separadas? ¿Por qué?

---

## Ejercicio 5: Sinónimos para paquetes

**Parte A — Sinónimo privado:**

1. Cree un sinónimo privado `PKG_TAREAS_SIN` para el package `pkg_tareas`
2. Demuestre que puede invocar `asignar` y `calcular_costo` usando el sinónimo
3. Consulte `USER_SYNONYMS` para verificar que el sinónimo existe

**Parte B — Sinónimo público:**

1. Cree un sinónimo público `PKG_UTILIDADES` para el package `pkg_utilidades`
2. Explique (como comentario SQL) la diferencia entre un sinónimo público y uno privado
3. Consulte `ALL_SYNONYMS` para ver los sinónimos accesibles

**Parte C — Eliminación:**

1. Elimine el sinónimo privado con `DROP SYNONYM`
2. Elimine el sinónimo público con `DROP PUBLIC SYNONYM`
3. Verifique que ya no existen en el diccionario
