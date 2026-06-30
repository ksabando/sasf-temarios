---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Diseño de Recursos

**Solución esperada**:

| Recurso | Endpoint Colección | Endpoint Específico | Descripción |
|---------|-------------------|-------------------|-------------|
| Task | `GET /api/tasks` | `GET /api/tasks/{id}` | Tarea individual |
| User | `GET /api/users` | `GET /api/users/{id}` | Usuario del sistema |
| Comment | `GET /api/comments` | `GET /api/comments/{id}` | Comentario en una tarea |
| Category | `GET /api/categories` | `GET /api/categories/{id}` | Categoría de tareas |
| Attachment | `GET /api/attachments` | `GET /api/attachments/{id}` | Archivo adjunto |

**Recursos anidados:** `/api/users/{id}/tasks` (tareas de un usuario), `/api/tasks/{id}/comments` (comentarios de una tarea).

**Posibles mejoras**:
- Agregar una discusión sobre la profundidad de anidamiento: ¿hasta qué nivel es recomendable anidar? `/api/users/1/tasks/5/comments/3` se vuelve difícil de manejar. Alternativa: usar query parameters para filtrado (`/api/comments?taskId=5`).
- Incluir el diseño de endpoints para acciones no-CRUD como asignar una tarea a un usuario: modelarlo como recurso de asignación (`POST /api/tasks/1/assignees` con body `{"userId": 2}`) vs. actualizar la tarea (`PATCH /api/tasks/1` con `{"assignedTo": 2}`).
- Agregar una columna con los métodos HTTP soportados por cada endpoint: por ejemplo, `GET /api/tasks` (listar), `POST /api/tasks` (crear), `GET /api/tasks/{id}` (obtener), `PUT /api/tasks/{id}` (reemplazar), `PATCH /api/tasks/{id}` (modificar), `DELETE /api/tasks/{id}` (eliminar).

---

## Ejercicio 4: Setup Spring Boot

**Solución esperada**:

**Paso 1 — Crear proyecto con Spring Initializr:**
- Ir a https://start.spring.io
- Project: Maven, Language: Java, Spring Boot: 3.x
- Group: `com.taskflow`, Artifact: `taskflow-api`
- Dependencies: Spring Web, Spring Data JPA, H2 Database

**Paso 2 — Clase Task:**
```java
package com.taskflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private boolean completed;
    private LocalDateTime createdAt;

    public Task() {}

    public Task(Long id, String title, String description, boolean completed) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.completed = completed;
        this.createdAt = LocalDateTime.now();
    }

    // getters y setters
}
```

**Paso 3 — Endpoint GET /api/tasks:**
```java
package com.taskflow.controller;

import com.taskflow.model.Task;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @GetMapping
    public List<Task> getAllTasks() {
        return List.of(
            new Task(1L, "Comprar víveres", "Leche, pan, huevos", false),
            new Task(2L, "Estudiar APIs", "Leer capítulo 1 de REST API Design", true),
            new Task(3L, "Hacer ejercicio", "Correr 5km", false)
        );
    }
}
```

**Paso 4 — Explicación de anotaciones:**
- `@RestController` — Combina `@Controller` + `@ResponseBody`. Indica que esta clase es un controlador REST donde cada método retorna directamente el objeto (serializado a JSON/XML) en lugar de una vista.
- `@RequestMapping("/api/tasks")` — Define la URL base para todos los endpoints de este controlador. Mapea el prefijo `/api/tasks` a todos los métodos del controlador.
- `@GetMapping` — Versión abreviada de `@RequestMapping(method = RequestMethod.GET)`. Mapea peticiones HTTP GET al método anotado.

**Posibles mejoras**:
- Agregar un `TaskRepository` con Spring Data JPA para persistencia real, reemplazando la lista hardcodeada por `taskRepository.findAll()`. Esto demuestra la separación entre capa web y capa de datos.
- Incluir manejo de respuestas HTTP correctas: retornar `ResponseEntity<Task>` con `201 Created` y header `Location` al crear, `200 OK` al actualizar, y `204 No Content` al eliminar. Esto eleva la API del Nivel 1 al Nivel 2 del Richardson Maturity Model.
- Agregar DTOs (Data Transfer Objects) como `TaskRequest` y `TaskResponse` para no exponer la entidad JPA directamente en la capa de presentación, evitando problemas de serialización (LazyInitializationException, exposición de campos internos como `@Version`).

