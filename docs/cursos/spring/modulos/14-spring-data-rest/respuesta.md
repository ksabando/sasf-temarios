---
sidebar_label: "Soluciones"
---
# Respuestas: Spring Data REST

## Respuesta 1: TaskRepository REST

```java
@RepositoryRestResource(path = "tasks", collectionResourceRel = "tasks")
public interface TaskRepository extends JpaRepository<Task, Long> {
}
```

Endpoints generados:
- `GET /api/tasks` - listar
- `GET /api/tasks/{id}` - obtener por ID
- `POST /api/tasks` - crear
- `PUT /api/tasks/{id}` - reemplazar
- `PATCH /api/tasks/{id}` - actualizar parcialmente
- `DELETE /api/tasks/{id}` - eliminar
- `GET /api/tasks/search` - métodos de búsqueda

---

## Respuesta 2: Configuración

```properties
spring.data.rest.base-path=/api
spring.data.rest.default-page-size=15
spring.data.rest.return-body-on-create=true
```

---

## Respuesta 3: Projection

```java
package com.sasf.taskapi.projection;

import com.sasf.taskapi.model.Task;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "summary", types = { Task.class })
public interface TaskSummaryProjection {
    Long getId();
    String getTitle();
    String getStatus();

    @Value("#{target.user != null ? target.user.username : null}")
    String getUserName();
}
```

Uso: `GET /api/tasks?projection=summary`

---

## Respuesta 4: EventHandler

```java
package com.sasf.taskapi.event;

import com.sasf.taskapi.model.Task;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.stereotype.Component;

@Component
@RepositoryEventHandler
public class TaskEventHandler {

    @HandleBeforeCreate
    public void handleBeforeCreate(Task task) {
        if (task.getTitle() == null || task.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Task title cannot be empty");
        }
    }
}
```

---

## Respuesta 5: HAL Explorer

```xml
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-rest-hal-explorer</artifactId>
</dependency>
```

El HAL Explorer está disponible en `http://localhost:8080/explorer/index.html`. Proporciona una interfaz visual para:
- Navegar por los endpoints REST
- Ver relaciones entre recursos
- Probar operaciones GET, POST, PUT, DELETE
- Explorar los métodos de búsqueda
- Visualizar enlaces HATEOAS

