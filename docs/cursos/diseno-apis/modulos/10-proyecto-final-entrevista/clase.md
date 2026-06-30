---
sidebar_label: "Clase"
---

# Módulo 10 — Proyecto Final + Simulación de Entrevista

## Proyecto Final: API TaskFlow Completa

Diseñar e implementar la API de TaskFlow desde cero, usando **API-First** (contrato OpenAPI primero).

### Especificación de Recursos

| Recurso | Endpoint | Descripción |
|---------|----------|-------------|
| Tasks | `/api/v1/tasks` | CRUD completo de tareas |
| Users | `/api/v1/users` | Gestión de usuarios |
| Comments | `/api/v1/tasks/{id}/comments` | Comentarios en tareas |
| Attachments | `/api/v1/tasks/{id}/attachments` | Archivos adjuntos |
| Categories | `/api/v1/categories` | Categorización |
| Export | `/api/v1/tasks/export` | Exportación masiva |
| Search | `/api/v1/tasks/search` | Búsqueda avanzada |

### Requerimientos Técnicos

| Componente | Especificación |
|------------|---------------|
| **Métodos HTTP** | GET, POST, PUT, PATCH, DELETE correctos |
| **Códigos de estado** | 200, 201, 204, 400, 401, 403, 404, 409, 422, 429 |
| **Paginación** | Offset + Cursor |
| **Filtros** | Exactos, operadores (gte, lte), text search |
| **Ordenamiento** | Multi-campo (sort=field,direction) |
| **HATEOAS** | Nivel 3 Richardson con HAL |
| **Documentación** | OpenAPI 3.1 + Redoc + Swagger UI |
| **Seguridad** | JWT (login, refresh token) |
| **Rate Limiting** | Token bucket por usuario/endpoint |
| **Errores** | Problem Details RFC 9457 |
| **Versionado** | Header, coexistencia v1/v2 |
| **Arquitectura** | Spring Boot 3.x, capas (Controller → Service → Repository) |

### Arquitectura en Capas

```
┌──────────────┐
│  Controller  │  ← DTOs, validación, HTTP
├──────────────┤
│   Service    │  ← Lógica de negocio, transacciones
├──────────────┤
│  Repository  │  ← JPA, consultas, especificaciones
├──────────────┤
│  Database    │  ← H2 (dev) / PostgreSQL (prod)
└──────────────┘
```

### Estructura del Proyecto

```
src/main/java/com/taskflow/
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── OpenAPIConfig.java
│   └── RateLimitingConfig.java
├── controller/
│   ├── TaskController.java
│   ├── UserController.java
│   ├── CommentController.java
│   └── AuthController.java
├── dto/
│   ├── request/
│   │   ├── CreateTaskRequest.java
│   │   ├── UpdateTaskRequest.java
│   │   └── LoginRequest.java
│   └── response/
│       ├── TaskResponse.java
│       ├── PageResponse.java
│       ├── CursorResponse.java
│       └── ErrorResponse.java
├── model/
│   ├── Task.java
│   ├── User.java
│   └── Comment.java
├── repository/
│   ├── TaskRepository.java
│   ├── UserRepository.java
│   └── CommentRepository.java
├── security/
│   ├── JwtUtil.java
│   ├── JwtAuthFilter.java
│   └── RateLimitingFilter.java
├── service/
│   ├── TaskService.java
│   ├── UserService.java
│   └── AuthService.java
├── exception/
│   ├── ResourceNotFoundException.java
│   ├── ValidationException.java
│   └── GlobalExceptionHandler.java
└── TaskFlowApplication.java
```

### Contrato OpenAPI (Fragmento)

```yaml
openapi: 3.1.0
info:
  title: TaskFlow API
  version: 2.0.0
  description: API RESTful de gestión de tareas personales
  contact:
    name: TaskFlow Team
    url: https://taskflow.com
servers:
  - url: http://localhost:8080
    description: Desarrollo local
  - url: https://api.taskflow.com/v2
    description: Producción

paths:
  /tasks:
    get:
      summary: Listar tareas paginadas
      operationId: listTasks
      parameters:
        - $ref: '#/components/parameters/pageParam'
        - $ref: '#/components/parameters/sizeParam'
        - $ref: '#/components/parameters/sortParam'
        - $ref: '#/components/parameters/statusParam'
        - $ref: '#/components/parameters/searchParam'
      responses:
        '200':
          description: Lista paginada de tareas
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskPage'
        '401':
          $ref: '#/components/responses/Unauthorized'
      security:
        - bearerAuth: []

    post:
      summary: Crear nueva tarea
      operationId: createTask
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          description: Tarea creada exitosamente
          headers:
            Location:
              schema:
                type: string
                format: uri
          content:
            application/hal+json:
              schema:
                $ref: '#/components/schemas/Task'
        '422':
          $ref: '#/components/responses/ValidationError'
      security:
        - bearerAuth: []

  /tasks/{taskId}:
    get:
      summary: Obtener tarea por ID
      operationId: getTask
      parameters:
        - name: taskId
          in: path
          required: true
          schema:
            type: integer
            format: int64
      responses:
        '200':
          description: Tarea encontrada
          content:
            application/hal+json:
              schema:
                $ref: '#/components/schemas/Task'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      summary: Eliminar tarea
      operationId: deleteTask
      parameters:
        - name: taskId
          in: path
          required: true
          schema:
            type: integer
            format: int64
      responses:
        '204':
          description: Tarea eliminada exitosamente
        '404':
          $ref: '#/components/responses/NotFound'
```

### Simulación de Entrevista Técnica

Estructura de la entrevista:
1. **Ejercicio 1-3:** Diseño de APIs (fundamentos)
2. **Ejercicio 4-6:** Implementación (código)
3. **Ejercicio 7-10:** Arquitectura y resolución de problemas

Por cada ejercicio:
- 5 minutos para leer y pensar
- 10 minutos para resolver
- 5 minutos de discusión y feedback

### 60 Preguntas de Entrevista — Categorías

| Categoría | Temas |
|-----------|-------|
| **REST y HTTP** | Principios REST, idempotencia, códigos de estado, headers |
| **Diseño de APIs** | Naming, versionado, paginación, filtros, HATEOAS |
| **OpenAPI/Swagger** | Spec, $ref, security schemes, codegen |
| **Seguridad** | JWT, OAuth2, rate limiting, CORS, validación |
| **GraphQL vs REST vs gRPC** | Comparativas, cuándo usar, streaming |
| **Spring Boot** | Anotaciones, JPA, DTOs, testing, buenas prácticas |
