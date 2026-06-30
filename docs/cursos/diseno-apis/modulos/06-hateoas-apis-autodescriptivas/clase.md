---
sidebar_label: "Clase"
---

# Módulo 06 — HATEOAS y APIs Auto-descriptivas

## 1. HATEOAS — Hypermedia as the Engine of Application State

**Nivel 3 del Richardson Maturity Model.** El servidor guía al cliente a través de las transiciones de estado mediante hipervínculos.

**Principio:** El cliente descubre qué acciones puede realizar a continuación examinando los links en la respuesta.

## 2. HAL — Hypertext Application Language

Formato estándar para representar hypermedia en JSON.

### Estructura básica

```json
{
  "_links": {
    "self": { "href": "/api/v1/tasks/1" },
    "tasks": { "href": "/api/v1/tasks" }
  },
  "id": 1,
  "title": "Comprar leche",
  "completed": false
}
```

### Colección con HAL

```json
{
  "_links": {
    "self": { "href": "/api/v1/tasks?page=0&size=10" },
    "next": { "href": "/api/v1/tasks?page=1&size=10" },
    "last": { "href": "/api/v1/tasks?page=9&size=10" }
  },
  "_embedded": {
    "tasks": [
      {
        "_links": {
          "self": { "href": "/api/v1/tasks/1" }
        },
        "id": 1,
        "title": "Comprar leche"
      },
      {
        "_links": {
          "self": { "href": "/api/v1/tasks/2" }
        },
        "id": 2,
        "title": "Estudiar APIs"
      }
    ]
  },
  "page": 0,
  "size": 10,
  "totalElements": 50,
  "totalPages": 5
}
```

## 3. Transiciones de Estado (Affordances)

Las acciones disponibles dependen del estado del recurso:

**Task pendiente:**
```json
{
  "_links": {
    "self": { "href": "/api/v1/tasks/1" },
    "complete": { "href": "/api/v1/tasks/1/complete" },
    "assign": { "href": "/api/v1/tasks/1/assign" },
    "delete": { "href": "/api/v1/tasks/1" }
  }
}
```

**Task completada:**
```json
{
  "_links": {
    "self": { "href": "/api/v1/tasks/1" },
    "uncomplete": { "href": "/api/v1/tasks/1/uncomplete" },
    "delete": { "href": "/api/v1/tasks/1" }
  }
}
```

## 4. Spring HATEOAS

### Dependencia Maven

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-hateoas</artifactId>
</dependency>
```

### RepresentationModel

```java
public class TaskModel extends RepresentationModel<TaskModel> {
    private Long id;
    private String title;
    private boolean completed;
    // getters y setters
}
```

### RepresentationModelAssembler

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

        model.add(linkTo(methodOn(TaskController.class).getById(task.getId())).withSelfRel());
        model.add(linkTo(methodOn(TaskController.class).getAll(null, null)).withRel("tasks"));

        // Affordances basadas en estado
        if (!task.isCompleted()) {
            model.add(linkTo(methodOn(TaskController.class).complete(task.getId())).withRel("complete"));
        } else {
            model.add(linkTo(methodOn(TaskController.class).uncomplete(task.getId())).withRel("uncomplete"));
        }

        return model;
    }
}
```

### Controlador con HATEOAS

```java
@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;
    private final TaskModelAssembler assembler;

    @GetMapping
    public ResponseEntity<CollectionModel<TaskModel>> getAll() {
        List<TaskModel> tasks = taskService.findAll().stream()
            .map(assembler::toModel)
            .toList();

        CollectionModel<TaskModel> model = CollectionModel.of(tasks);
        model.add(linkTo(methodOn(TaskController.class).getAll()).withSelfRel());

        return ResponseEntity.ok(model);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskModel> getById(@PathVariable Long id) {
        return taskService.findById(id)
            .map(task -> ResponseEntity.ok(assembler.toModel(task)))
            .orElse(ResponseEntity.notFound().build());
    }
}
```

## 5. Spring Data REST

Genera automáticamente HAL + HATEOAS desde repositorios JPA.

```java
@RepositoryRestResource(path = "tasks")
public interface TaskRepository extends JpaRepository<Task, Long> {
}
```

Con solo esto, Spring Data REST expone:
- `GET /tasks` → lista con HAL
- `GET /tasks/{id}` → recurso individual con HAL
- `POST /tasks` → crear
- `PUT /tasks/{id}` → actualizar
- `DELETE /tasks/{id}` → eliminar

## 6. HAL Explorer

UI para explorar APIs HAL (similar a Swagger pero navegable).

```xml
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-rest-hal-explorer</artifactId>
</dependency>
```

Acceder en: `http://localhost:8080/explorer/index.html`

## 7. Otros Formatos Hypermedia

| Formato | Características |
|---------|----------------|
| **HAL** | _links, _embedded. Simple y adoptado por Spring |
| **Siren** | actions + entities + links. Más expresivo |
| **Collection+JSON** | query + template + links. Enfocado en colecciones |
| **JSON:API** | relationships + links + compound documents |

## 8. Content Types

```
application/hal+json
application/hal+xml
application/vnd.siren+json
application/vnd.collection+json
```

## 9. Diseño de Affordances

El cliente descubre qué puede hacer a continuación examinando los links:

```json
{
  "_links": {
    "self": { "href": "/api/v1/tasks?status=pending" },
    "create": { "href": "/api/v1/tasks" },
    "search": { "href": "/api/v1/tasks/search" }
  },
  "_embedded": {
    "tasks": [...]
  }
}
```

El cliente **no necesita** documentación externa para saber cómo navegar la API — los links se lo indican en cada respuesta.
