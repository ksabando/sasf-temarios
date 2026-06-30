---
sidebar_label: "Clase"
---

# Módulo 02 — Diseño de Recursos y Naming

## 1. Sustantivos, No Verbos

Los endpoints deben usar **sustantivos** que representen recursos, no verbos que representen acciones.

| Incorrecto | Correcto |
|-----------|---------|
| `/getTasks` | `GET /tasks` |
| `/createTask` | `POST /tasks` |
| `/deleteTask` | `DELETE /tasks/{id}` |
| `/getAllUsers` | `GET /users` |

## 2. Plurales para Colecciones

Usar plurales para colecciones, singular para recursos específicos.

```
GET    /tasks          → colección de tareas
GET    /tasks/{id}     → tarea específica
POST   /tasks          → crear nueva tarea
PUT    /tasks/{id}     → reemplazar tarea
DELETE /tasks/{id}     → eliminar tarea
```

## 3. Recursos Anidados

Relaciones jerárquicas se expresan con anidación en la URL.

```
GET    /users/{id}/tasks          → tareas de un usuario
POST   /users/{id}/tasks          → crear tarea para un usuario
GET    /tasks/{id}/comments       → comentarios de una tarea
POST   /tasks/{id}/comments       → agregar comentario a una tarea
GET    /tasks/{id}/attachments    → archivos adjuntos de una tarea
```

**Regla práctica:** Máximo 3 niveles de profundidad.
```
/tasks/{id}/comments/{commentId}  → OK (3 niveles)
/tasks/{id}/comments/{cid}/replies/{rid} → Demasiado profundo
```

## 4. URL Structure Estándar

```
/api/{version}/{resource}[/{id}][/{sub-resource}][/{sub-id}]
```

Ejemplo:
```
/api/v1/tasks/123/comments/456
```

## 5. Consistencia

Mantener el mismo patrón en toda la API:
- Siempre plurales: `/tasks`, `/users`, `/comments`
- Siempre kebab-case: `/task-assignments`, `/daily-reports`
- Siempre misma estructura de respuesta

## 6. Kebab-case y Lowercase

```
/task-assignments       ✓  (kebab-case)
/taskAssignments        ✗  (camelCase)
/task_assignments       ✗  (snake_case)
/Tasks                  ✗  (PascalCase)
/tasks                  ✓  (lowercase)
```

## 7. Sparse Fieldsets

Permitir que el cliente seleccione los campos que necesita:

```
GET /tasks?fields=id,title,completed
```

Respuesta:
```json
[
  { "id": 1, "title": "Comprar leche", "completed": false },
  { "id": 2, "title": "Estudiar", "completed": true }
]
```

## 8. Action Endpoints

Cuando una acción no es CRUD, usar POST con verbo en la URL:

```
POST /tasks/{id}/complete     → completar tarea
POST /tasks/{id}/assign       → asignar tarea a usuario
POST /tasks/export            → exportar tareas
POST /payments/{id}/refund    → reembolsar pago
```

## 9. Búsqueda y Reportes

Recursos que no son colecciones directas:
```
GET /tasks/search?q=keyword    → búsqueda
GET /reports/daily-summary     → reportes
GET /reports/monthly?year=2026 → reportes con parámetros
```

## 10. Proyección (Sparse Fieldsets)

Beneficios:
- Reduce ancho de banda
- Mejora rendimiento
- Da control al cliente sobre qué datos recibe

## 11. Relaciones: Referencing vs Embedding

**Referencing:** Incluir solo el ID
```json
{
  "id": 1,
  "title": "Comprar leche",
  "userId": 42
}
```

**Embedding:** Incluir el objeto completo
```json
{
  "id": 1,
  "title": "Comprar leche",
  "user": { "id": 42, "name": "Juan" }
}
```

## 12. Buenas Prácticas Resumidas

| Regla | Ejemplo |
|-------|---------|
| Sustantivos, no verbos | `/tasks` no `/getTasks` |
| Plurales para colecciones | `/tasks` no `/task` |
| Kebab-case | `/task-assignments` |
| Sin extensiones | `/tasks` no `/tasks.json` |
| Minúsculas | `/tasks` no `/Tasks` |
| Anidación máxima 3 niveles | `/tasks/{id}/comments` |
| Versionado en URL | `/api/v1/tasks` |
| Sparse fieldsets | `?fields=id,title` |
| Query params para filtros | `?status=completed` |
| Action endpoints con POST | `POST /tasks/{id}/complete` |

## 13. Ejemplo: Diseño completo TaskFlow

```
GET    /api/v1/tasks                    → Listar tareas (con paginación)
POST   /api/v1/tasks                    → Crear tarea
GET    /api/v1/tasks/{id}               → Obtener tarea
PUT    /api/v1/tasks/{id}               → Reemplazar tarea
PATCH  /api/v1/tasks/{id}               → Actualizar parcialmente
DELETE /api/v1/tasks/{id}               → Eliminar tarea
POST   /api/v1/tasks/{id}/complete      → Completar tarea
POST   /api/v1/tasks/{id}/assign        → Asignar tarea
GET    /api/v1/tasks/{id}/comments      → Comentarios de tarea
POST   /api/v1/tasks/{id}/comments      → Agregar comentario
GET    /api/v1/users/{id}/tasks         → Tareas de usuario
POST   /api/v1/tasks/search            → Búsqueda avanzada
```
