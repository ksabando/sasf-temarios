---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Trigger AFTER UPDATE — Actualización de estado de proyecto

Crear un trigger `trg_actualizar_estado_proyecto` que se dispare **AFTER UPDATE OF estado ON TAREAS**.

Cuando todas las tareas de un proyecto tengan estado 'C' (Completado), el trigger debe actualizar el proyecto a estado 'C'.

**Pregunta teórica (responder en un comentario del código):**
- ¿Este trigger debería ser row-level o statement-level? Justificar.

**Prueba:**
1. Completar todas las tareas de un proyecto.
2. Verificar que el proyecto cambió a estado 'C'.
3. Agregar una nueva tarea pendiente al proyecto y verificar que el proyecto **no** pierde su estado (el trigger debe considerar solo las tareas existentes en el momento de la última actualización).

---

## Ejercicio 3: Trigger de Auditoría

Crear un sistema de auditoría para los cambios en TAREAS:

1. Crear la tabla `AUDITORIA_TAREAS` con:
   - `id` NUMBER PK (IDENTITY)
   - `tarea_id` NUMBER(10)
   - `campo_modificado` VARCHAR2(50)
   - `valor_anterior` VARCHAR2(500)
   - `valor_nuevo` VARCHAR2(500)
   - `usuario` VARCHAR2(100)
   - `fecha` TIMESTAMP DEFAULT SYSTIMESTAMP

2. Crear el trigger `trg_auditar_tareas` que se dispare **AFTER UPDATE** y registre cambios en:
   - `horas_estimadas`
   - `estado`

   Para cada campo modificado debe insertar una fila en AUDITORIA_TAREAS.

**Requisito adicional:** El trigger debe funcionar aunque se modifiquen ambos campos en el mismo UPDATE.

**Prueba:**
1. Actualizar horas_estimadas de una tarea.
2. Actualizar estado de una tarea.
3. Actualizar ambos campos en un solo UPDATE.
4. Consultar la tabla AUDITORIA_TAREAS y verificar que se registraron los cambios correctamente.

---

## Ejercicio 4: Trigger Compuesto (12c)

Crear un trigger compuesto `trg_control_tiempo` que:

1. **BEFORE EACH ROW**: Valide que `horas_reales` no exceda `horas_estimadas * 1.5` (misma lógica del Ejercicio 1).
2. **AFTER EACH ROW**: Acumule en una variable global del trigger la diferencia de horas reales (`:NEW.horas_reales - NVL(:OLD.horas_reales, 0)`).
3. **AFTER STATEMENT**: Actualice la columna `horas_totales` en la tabla PROYECTOS sumando el total acumulado.

**Requisito previo:** Si la tabla PROYECTOS no tiene la columna `horas_totales`, agregarla:

```sql
ALTER TABLE proyectos ADD horas_totales NUMBER(8,1) DEFAULT 0;
```

**Prueba:**
1. Verificar el estado inicial de `horas_totales` en un proyecto.
2. Actualizar `horas_reales` de varias tareas del mismo proyecto en un solo UPDATE.
3. Verificar que `horas_totales` en PROYECTOS se actualizó correctamente con la suma total.

**Pregunta extra:** ¿Qué ventaja tiene un trigger compuesto frente a dos triggers separados (uno row-level y otro statement-level) para esta funcionalidad?
