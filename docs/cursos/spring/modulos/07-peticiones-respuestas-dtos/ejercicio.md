---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Endpoint de resumen (Stats)

Crea un endpoint `GET /api/tasks/stats` que devuelva:
- `total`: número total de tareas
- `completed`: número de tareas completadas
- `pending`: número de tareas pendientes
- `completionRate`: porcentaje de completadas

Usa un DTO `TaskStatsResponse`.

---

## Ejercicio 4: Filtro por fecha

Agrega un filtro opcional `createdAfter` al endpoint `GET /api/tasks` que permita filtrar tareas creadas después de una fecha dada (formato ISO: `yyyy-MM-ddTHH:mm:ss`).

---

## Ejercicio 5: Mapper manual sin MapStruct

Implementa una segunda versión del `TaskMapper` sin usar MapStruct (solo Java manual). Compara ambos enfoques: ¿cuál prefieres y por qué?
