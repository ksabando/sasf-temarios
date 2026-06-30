---
sidebar_label: "Clase"
---

# Módulo 03 — Métodos HTTP y Códigos de Estado

## 1. Métodos HTTP

### GET
- Recuperar uno o varios recursos
- **Idempotente:** Sí
- **Seguro:** Sí (no modifica estado)
- **Con body:** No recomendado
```http
GET /api/v1/tasks HTTP/1.1
GET /api/v1/tasks/123 HTTP/1.1
```

### POST
- Crear un nuevo recurso
- **Idempotente:** No (cada POST crea un recurso nuevo)
- **Seguro:** No
- **Código de éxito:** 201 Created + Location header
```http
POST /api/v1/tasks HTTP/1.1
Content-Type: application/json

{ "title": "Comprar leche", "description": "Ir al supermercado" }
```

### PUT
- Reemplazar completamente un recurso existente
- **Idempotente:** Sí
- **Seguro:** No
- Requiere el recurso completo en el body
```http
PUT /api/v1/tasks/123 HTTP/1.1
Content-Type: application/json

{ "id": 123, "title": "Comprar leche", "description": "...", "completed": true }
```

### PATCH
- Actualización parcial de un recurso
- **Idempotente:** No (depende de la implementación)
- **Seguro:** No
- Soportado por RFC 6902 (JSON Patch) y RFC 7396 (JSON Merge Patch)
```http
PATCH /api/v1/tasks/123 HTTP/1.1
Content-Type: application/json

{ "completed": true }
```

### DELETE
- Eliminar un recurso
- **Idempotente:** Sí (segunda request retorna 404)
- **Seguro:** No
- **Código de éxito:** 204 No Content
```http
DELETE /api/v1/tasks/123 HTTP/1.1
```

### HEAD y OPTIONS
```http
HEAD /api/v1/tasks HTTP/1.1
→ 200 OK (sin body, solo headers)

OPTIONS /api/v1/tasks HTTP/1.1
→ 200 OK
Allow: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
```

## 2. Idempotencia y Seguridad

| Método | Idempotente | Seguro | Uso |
|--------|-------------|--------|-----|
| GET | Sí | Sí | Lectura |
| HEAD | Sí | Sí | Metadatos |
| OPTIONS | Sí | Sí | Descubrimiento |
| POST | No | No | Creación |
| PUT | Sí | No | Reemplazo completo |
| PATCH | No | No | Actualización parcial |
| DELETE | Sí | No | Eliminación |

## 3. Códigos de Estado HTTP

### 2xx — Éxito

| Código | Significado | Cuándo usarlo |
|--------|-------------|---------------|
| **200 OK** | Éxito genérico | GET, PUT, PATCH exitosos |
| **201 Created** | Recurso creado | POST exitoso |
| **202 Accepted** | Aceptado para procesamiento async | Operaciones batch, colas |
| **204 No Content** | Sin contenido en respuesta | DELETE exitoso |

### 3xx — Redirección

| Código | Significado |
|--------|-------------|
| 301 Moved Permanently | Recurso movido permanentemente |
| 303 See Other | Redirige a otra URL (POST/redirect/GET) |
| 304 Not Modified | Usado con ETag/If-None-Match |

### 4xx — Error del Cliente

| Código | Significado |
|--------|-------------|
| **400 Bad Request** | Request mal formado |
| **401 Unauthorized** | Autenticación requerida o fallida |
| **403 Forbidden** | Autenticado pero sin permisos |
| **404 Not Found** | Recurso no encontrado |
| **405 Method Not Allowed** | Método HTTP no soportado |
| **406 Not Acceptable** | Content-Type solicitado no disponible |
| **409 Conflict** | Estado actual conflictúa con la request |
| **422 Unprocessable Entity** | Validación de negocio fallida |
| **429 Too Many Requests** | Rate limiting excedido |

### 5xx — Error del Servidor

| Código | Significado |
|--------|-------------|
| **500 Internal Server Error** | Error inesperado del servidor |
| **502 Bad Gateway** | Gateway/proxy recibe respuesta inválida |
| **503 Service Unavailable** | Servicio temporalmente no disponible |

## 4. Headers Importantes

```
Location: /api/v1/tasks/123          → URL del recurso creado (201 Created)
ETag: "33a64df551425fcc55e4d42a148..."  → Hash de la representación
Last-Modified: Wed, 21 Oct 2026 07:28:00 GMT
Content-Type: application/json
Accept: application/json
Cache-Control: public, max-age=3600
```

## 5. Manejo de Errores — RFC 9457 (Problem Details)

Estructura estándar para errores HTTP:

```json
{
  "type": "https://api.taskflow.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "Title must be between 1 and 100 characters",
  "instance": "/api/v1/tasks",
  "errors": [
    { "field": "title", "message": "must be between 1 and 100 characters" }
  ]
}
```

## 6. Implementación en Spring Boot

```java
@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(@PathVariable Long id) {
        return taskService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        Task created = taskService.create(task);
        URI location = URI.create("/api/v1/tasks/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody Task task) {
        // Reemplazo completo
        return ResponseEntity.ok(taskService.update(id, task));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Task> partialUpdate(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(taskService.partialUpdate(id, updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

### Manejo Global de Errores

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource Not Found");
        return ResponseEntity.status(404).body(problem);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.UNPROCESSABLE_ENTITY);
        problem.setTitle("Validation Error");
        // Agregar errores de campo
        return ResponseEntity.status(422).body(problem);
    }
}
```
