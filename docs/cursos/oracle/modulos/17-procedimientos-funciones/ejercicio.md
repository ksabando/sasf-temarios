---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Procedimiento `crear_proyecto` con validaciones

Crear un procedimiento `crear_proyecto` que reciba como parámetros **IN** los datos del proyecto y devuelva como **OUT** el ID generado.

Validaciones:
- `presupuesto > 0` (si se proporciona, si es NULL usar 0)
- `fecha_fin_estimada > fecha_inicio` (solo si fecha_fin_estimada no es NULL)
- El nombre no debe estar duplicado

Si alguna validación falla, lanzar `RAISE_APPLICATION_ERROR` con código entre -20001 y -20999.

Probar el procedimiento insertando al menos 3 proyectos.

---

## Ejercicio 3: Función `calcular_costo_real_tarea`

Crear una función que reciba un `p_tarea_id` y devuelva el costo real de la tarea:

```
costo_real = horas_reales * costo_hora del empleado responsable
```

La función debe:
- Manejar el caso de que la tarea no exista (RETURN NULL)
- Manejar el caso de que no tenga responsable asignado (RETURN NULL)
- Ser invocable desde una sentencia SELECT

**Demo**: Ejecutar un SELECT que muestre: nombre de la tarea, horas_reales, costo_hora del responsable, y el costo real calculado con la función.

---

## Ejercicio 4: Procedimiento `asignar_tarea` con validación de capacidad

Crear el procedimiento `asignar_tarea` que:
1. Reciba: `p_tarea_id`, `p_empleado_id`
2. Valide que el empleado exista
3. Valide que la tarea exista y esté en estado 'P' (Pendiente)
4. Valide que el empleado no tenga más de **5 tareas activas** (estado 'P' o 'E')
5. Si todo es válido, actualice `responsable_id` y cambie estado a 'E'

Usar `RAISE_APPLICATION_ERROR` con mensajes descriptivos para cada validación fallida.

**Datos de prueba**: Insertar 5 empleados, crear tareas y probar asignaciones hasta exceder el límite.

---

## Ejercicio 5: Función recursiva `calcular_costo_total_proyecto`

Crear una **función recursiva** que calcule el costo total de un proyecto sumando el costo real de todas sus tareas.

```
calcular_costo_total_proyecto(p_proyecto_id)
```

La función debe:
1. Obtener el ID de la primera tarea del proyecto
2. Sumar recursivamente el costo de cada tarea (usando la función del Ejercicio 3)
3. Devolver el total

**Nota**: Dado que Oracle no soporta recursividad directa con cursores de forma intuitiva, usar una función recursiva que itere sobre las tareas o un enfoque alternativo (función pipeline, CTE recursivo, o función con cursor LOOP).

**Demo**: Mostrar el costo total de cada proyecto junto con su nombre y presupuesto. Indicar si el proyecto está dentro del presupuesto o lo ha excedido.
