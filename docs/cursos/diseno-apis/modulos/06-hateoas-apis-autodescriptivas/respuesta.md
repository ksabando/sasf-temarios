---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Implementar TaskModelAssembler

**Solución esperada**:

```java
@Component
public class TaskModelAssembler
        implements RepresentationModelAssembler<Task, TaskModel> {

    @Override
    public TaskModel toModel(Task task) {
        TaskModel model = new TaskModel();
        model.setId(task.getId());
        model.setTitle(task.getTitle());
        model.setCompleted(task.isCompleted());

        // Self link
        model.add(linkTo(methodOn(TaskController.class).getById(task.getId())).withSelfRel());

        // Link a colección
        model.add(linkTo(methodOn(TaskController.class).getAll(null, null)).withRel("tasks"));

        // Link a comentarios
        model.add(linkTo(methodOn(TaskController.class).getComments(task.getId())).withRel("comments"));

        // Affordances por estado
        if (!task.isCompleted()) {
            model.add(linkTo(methodOn(TaskController.class).complete(task.getId())).withRel("complete"));
        } else {
            model.add(linkTo(methodOn(TaskController.class).uncomplete(task.getId())).withRel("uncomplete"));
        }

        // Delete siempre disponible
        model.add(linkTo(methodOn(TaskController.class).delete(task.getId())).withRel("delete"));

        return model;
    }
}
```

**Posibles mejoras**:
- Inyectar `SecurityContext` en el assembler y condicionar `delete` y `assign` según el rol del usuario autenticado. Usar `@PreAuthorize` o verificación manual: `if (securityContext.isAdmin() || task.isOwner(securityContext.getUserId()))`. Esto evita mostrar affordances que resultarán en 403.
- Extraer la lógica de affordances a una clase separada `TaskAffordancePolicy` que evalúe estado + permisos + reglas de negocio, manteniendo el assembler como simple mapeador que delega las decisiones de qué links incluir.
- Agregar links condicionales con templates: `assign` podría incluir un template URI como `/api/v1/tasks/{id}/assign{?userId}`, permitiendo al cliente descubrir que necesita proveer un `userId` sin consultar documentación externa.

---

## Ejercicio 4: Navegación con HATEOAS

**Solución esperada**:

1. **¿Cómo sabe el cliente que puede completar la tarea?**
   Porque la respuesta incluye un link con `"rel": "complete"` y `"href": "/api/v1/tasks/1/complete"`. El cliente descubre esta acción examinando `_links`.

2. **¿Qué URL debe usar para ver los comentarios?**
   `GET /api/v1/tasks/1/comments` (usando el link `"comments"` en `_links`).

3. **¿Qué método HTTP para completar?**
   `POST /api/v1/tasks/1/complete` (o `PATCH` — pero por convención, actions usan POST).

4. **¿Qué pasaría si la tarea estuviera completada?**
   El link `"complete"` desaparecería y aparecería `"uncomplete"`. El cliente dinámicamente muestra/oculta botones según los links disponibles.

5. **Respuesta HAL para comentarios:**
```json
{
  "_links": {
    "self": { "href": "/api/v1/tasks/1/comments" },
    "task": { "href": "/api/v1/tasks/1" },
    "create": { "href": "/api/v1/tasks/1/comments" }
  },
  "_embedded": {
    "comments": [
      {
        "_links": { "self": { "href": "/api/v1/tasks/1/comments/10" } },
        "id": 10,
        "text": "No olvidar la leche deslactosada",
        "author": "Juan",
        "createdAt": "2026-06-01T10:30:00"
      },
      {
        "_links": { "self": { "href": "/api/v1/tasks/1/comments/11" } },
        "id": 11,
        "text": "Comprar también yogurt",
        "author": "María",
        "createdAt": "2026-06-01T11:00:00"
      }
    ]
  }
}
```

**Posibles mejoras**:
- Agregar `delete` y `edit` como links condicionales en cada comentario embebido: si el comentario pertenece al usuario autenticado, incluir `"delete": {"href": "/api/v1/tasks/1/comments/10"}` y `"edit": {"href": "/api/v1/tasks/1/comments/10"}`. Esto extiende HATEOAS a nivel de sub-recursos.
- Incluir `_links` de paginación en la colección de comentarios si hay muchos: `next`, `prev`, `first`. Esto mantiene la navegabilidad incluso en sub-colecciones.
- Para la pregunta 3, especificar que aunque HAL no incluye el método HTTP en el link, el cliente puede inferirlo por convención o usar el perfil ALPS de la API. Alternativamente, migrar a un formato como Siren que sí incluye `method` explícitamente en cada acción.

