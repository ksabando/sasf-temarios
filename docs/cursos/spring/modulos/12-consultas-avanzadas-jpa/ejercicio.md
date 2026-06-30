---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: @Modifying

Implementa en `TaskRepository`:
- Un método que marque como completadas todas las tareas de un proyecto
- Un método que elimine las tareas completadas con fecha anterior a un año

---

## Ejercicio 4: Specifications

Crea `TaskSpecification` con los métodos:
- `hasTitle(String title)` - búsqueda LIKE
- `hasStatus(TaskStatus status)` - filtro por estado
- `hasUserId(Long userId)` - filtro por usuario

Luego usa `JpaSpecificationExecutor` para combinar todos los filtros.

---

## Ejercicio 5: Proyección

Crea un DTO `TaskSummaryDTO` con `id`, `title`, `status` y `userName`. Escribe una consulta `@Query` usando `SELECT new` que devuelva una lista de `TaskSummaryDTO`.
