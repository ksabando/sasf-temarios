---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Implementar TaskModelAssembler

Completa el siguiente código del TaskModelAssembler para que incluya:

1. Self link
2. Link a la colección de tareas
3. Link a los comentarios de la tarea
4. Link de "complete" solo si la tarea no está completada
5. Link de "uncomplete" solo si la tarea está completada
6. Link de "delete" siempre

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

        // TODO: agregar links aquí

        return model;
    }
}
```

---

## Ejercicio 4: Navegación con HATEOAS

Imagina que un cliente hace `GET /api/v1/tasks/1` y recibe:

```json
{
  "_links": {
    "self": { "href": "/api/v1/tasks/1" },
    "complete": { "href": "/api/v1/tasks/1/complete" },
    "comments": { "href": "/api/v1/tasks/1/comments" },
    "assign": { "href": "/api/v1/tasks/1/assign" }
  },
  "title": "Comprar leche",
  "completed": false
}
```

Responde:
1. ¿Cómo sabe el cliente que puede completar la tarea?
2. ¿Qué URL debe usar el cliente para ver los comentarios?
3. ¿Qué método HTTP debe usar el cliente para completar la tarea?
4. ¿Qué pasaría con los links si la tarea estuviera completada?
5. Diseña la respuesta HAL para `GET /api/v1/tasks/1/comments` (comentarios de la tarea 1)
