---
sidebar_label: "Clase"
---

## 2. @RepositoryRestResource

```java
package com.sasf.taskapi.repository;

import com.sasf.taskapi.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "tasks", collectionResourceRel = "tasks")
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(@Param("userId") Long userId);
    List<Task> findByTitleContaining(@Param("q") String q);
    List<Task> findByStatus(@Param("status") TaskStatus status);
}
```

Endpoints expuestos automáticamente:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks` | Lista todas las tareas |
| GET | `/api/tasks/{id}` | Obtiene tarea por ID |
| POST | `/api/tasks` | Crea nueva tarea |
| PUT | `/api/tasks/{id}` | Reemplaza tarea |
| PATCH | `/api/tasks/{id}` | Actualización parcial |
| DELETE | `/api/tasks/{id}` | Elimina tarea |
| GET | `/api/tasks/search` | Muestra métodos de búsqueda |

### Otros repositorios

```java
@RepositoryRestResource(path = "users", collectionResourceRel = "users")
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(@Param("username") String username);
}

@RepositoryRestResource(path = "labels", collectionResourceRel = "labels")
public interface LabelRepository extends JpaRepository<Label, Long> {
    Optional<Label> findByName(@Param("name") String name);
}

@RepositoryRestResource(path = "comments", collectionResourceRel = "comments")
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskId(@Param("taskId") Long taskId);
}

@RepositoryRestResource(path = "projects", collectionResourceRel = "projects")
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByName(@Param("name") String name);
}
```

---

## 3. HAL Explorer

HAL (Hypertext Application Language) es el formato JSON que incluye enlaces de navegación.

```xml
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-rest-hal-explorer</artifactId>
</dependency>
```

Disponible en `/explorer/index.html` para navegar visualmente la API.

### Ejemplo de respuesta HAL

```json
{
  "_embedded": {
    "tasks": [
      {
        "id": 1,
        "title": "Fix login bug",
        "status": "IN_PROGRESS",
        "_links": {
          "self": { "href": "http://localhost:8080/api/tasks/1" },
          "task": { "href": "http://localhost:8080/api/tasks/1" },
          "user": { "href": "http://localhost:8080/api/tasks/1/user" },
          "labels": { "href": "http://localhost:8080/api/tasks/1/labels" },
          "comments": { "href": "http://localhost:8080/api/tasks/1/comments" }
        }
      }
    ]
  },
  "_links": {
    "self": { "href": "http://localhost:8080/api/tasks" },
    "profile": { "href": "http://localhost:8080/api/profile/tasks" },
    "search": { "href": "http://localhost:8080/api/tasks/search" }
  }
}
```

---

## 4. Personalización con @Projection

```java
package com.sasf.taskapi.projection;

import com.sasf.taskapi.model.Task;
import org.springframework.data.rest.core.config.Projection;

@Projection(name = "summary", types = { Task.class })
public interface TaskSummaryProjection {
    Long getId();
    String getTitle();
    String getStatus();
    String getPriority();
}

@Projection(name = "withUser", types = { Task.class })
public interface TaskWithUserProjection {
    Long getId();
    String getTitle();
    String getStatus();
    String getUserName();
}
```

Acceso: `/api/tasks?projection=summary`

---

## 5. Eventos (Application Events)

```java
package com.sasf.taskapi.event;

@Component
public class TaskEventHandler {

    @HandleBeforeCreate
    public void handleBeforeCreate(Task task) {
        if (task.getTitle() == null || task.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Task title is required");
        }
    }

    @HandleAfterCreate
    public void handleAfterCreate(Task task) {
        System.out.println("Task created: " + task.getTitle());
    }

    @HandleBeforeSave
    public void handleBeforeSave(Task task) {
        if (task.getDueDate() != null && task.getDueDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Due date cannot be in the past");
        }
    }

    @HandleBeforeDelete
    public void handleBeforeDelete(Task task) {
        System.out.println("Deleting task: " + task.getId());
    }

    @HandleAfterLinkSave
    public void handleAfterLinkSave(Task task, Object linked) {
        System.out.println("Link saved for task: " + task.getId());
    }
}
```

---

## 6. Validación con @Validated

```java
package com.sasf.taskapi.validator;

@Component
public class TaskValidator implements Validator {

    @Override
    public boolean supports(Class<?> clazz) {
        return Task.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        Task task = (Task) target;
        if (task.getTitle() != null && task.getTitle().length() < 3) {
            errors.rejectValue("title", "title.too.short",
                               "Title must have at least 3 characters");
        }
    }
}
```

---

## 7. Configuración de exposición

```java
package com.sasf.taskapi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
public class RestDataConfig implements RepositoryRestConfigurer {

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config,
                                                      CorsRegistry cors) {
        config.exposeIdsFor(Task.class, User.class, Label.class, Comment.class, Project.class);
        config.setBasePath("/api");
        config.setDefaultPageSize(20);
        config.setMaxPageSize(100);

        cors.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
    }
}
```

---

## 8. Resumen

- `@RepositoryRestResource` expone repositorios como RESTful endpoints
- Sigue HATEOAS con formato HAL
- HAL Explorer permite navegar la API
- `@Projection` personaliza la respuesta JSON
- Eventos como `@HandleBeforeCreate` permiten lógica adicional
- `Validator` permite validación personalizada
- Menos código boilerplate que controladores manuales
