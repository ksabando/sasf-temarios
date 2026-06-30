---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Diseñar Estrategia de Migración

TaskFlow API tiene 50 clientes usando v1. Necesitas migrar a v2 con un breaking change:
- El campo `priority` cambia de String ("high", "medium", "low") a un objeto `{ "level": "high", "score": 10 }`

Diseña un plan de migración que incluya:
1. Timeline (fechas de deprecation y sunset)
2. Headers de deprecation
3. Estrategia de coexistencia de versiones
4. Cómo notificar a los clientes
5. Cómo verificar que todos migraron

---

## Ejercicio 4: Versionado por Header

Implementa un controlador Spring Boot que sirva dos versiones del mismo endpoint `/api/tasks` usando content negotiation (Accept header):

- **V1:** `Accept: application/vnd.taskflow.v1+json` → retorna `{ "id": 1, "name": "Task", "done": false }`
- **V2:** `Accept: application/vnd.taskflow.v2+json` → retorna `{ "id": 1, "title": "Task", "completed": false }`

Donde v1 usa `name` y `done`, mientras v2 usa `title` y `completed`.
