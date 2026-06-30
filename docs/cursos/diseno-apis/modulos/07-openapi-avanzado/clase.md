---
sidebar_label: "Clase"
---

# Módulo 07 — OpenAPI/Swagger Avanzado

## 1. OpenAPI 3.1 — Estructura General

```yaml
openapi: 3.1.0
info:
  title: TaskFlow API
  description: API de gestión de tareas personales
  version: 2.0.0
  contact:
    name: TaskFlow Team
    email: api@taskflow.com
servers:
  - url: http://localhost:8080
    description: Desarrollo
  - url: https://api.taskflow.com
    description: Producción
paths:
  /tasks:
    get:
      summary: Listar todas las tareas
      operationId: getTasks
      parameters:
        - $ref: '#/components/parameters/pageParam'
        - $ref: '#/components/parameters/sizeParam'
      responses:
        '200':
          description: Lista de tareas
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'
components:
  schemas:
    Task:
      type: object
      properties:
        id:
          type: integer
          format: int64
        title:
          type: string
        completed:
          type: boolean
  parameters:
    pageParam:
      name: page
      in: query
      schema:
        type: integer
        default: 0
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## 2. Security Schemes

### Bearer JWT
```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
security:
  - bearerAuth: []
```

### API Key
```yaml
components:
  securitySchemes:
    apiKey:
      type: apiKey
      in: header
      name: X-API-Key
```

### OAuth2
```yaml
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://auth.taskflow.com/authorize
          tokenUrl: https://auth.taskflow.com/token
          scopes:
            read:tasks: Leer tareas
            write:tasks: Crear/editar tareas
```

## 3. Reutilización con $ref

```yaml
components:
  schemas:
    Task:
      type: object
      properties:
        id:
          $ref: '#/components/schemas/Id'
        title:
          type: string
        status:
          $ref: '#/components/schemas/TaskStatus'
        createdAt:
          type: string
          format: date-time
    Id:
      type: integer
      format: int64
    TaskStatus:
      type: string
      enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
    Error:
      type: object
      properties:
        type:
          type: string
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
```

## 4. Composición de Schemas

### allOf (combinación/herencia)
```yaml
components:
  schemas:
    BaseTask:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
    TimedTask:
      allOf:
        - $ref: '#/components/schemas/BaseTask'
        - type: object
          properties:
            dueDate:
              type: string
              format: date-time
            estimatedHours:
              type: number
```

### oneOf (exactamente uno de)
```yaml
components:
  schemas:
    CreateTaskRequest:
      oneOf:
        - $ref: '#/components/schemas/SimpleTask'
        - $ref: '#/components/schemas/DetailedTask'
      discriminator:
        propertyName: type
```

### anyOf (uno o más)
```yaml
components:
  schemas:
    Notification:
      type: object
      properties:
        channels:
          type: array
          items:
            anyOf:
              - $ref: '#/components/schemas/EmailNotification'
              - $ref: '#/components/schemas/SMSNotification'
              - $ref: '#/components/schemas/PushNotification'
```

## 5. API-First vs Code-First

### API-First
1. Escribir spec OpenAPI primero
2. Validar con herramientas (Spectral, Redocly)
3. Generar código con openapi-generator
4. Implementar la lógica de negocio

**Ventajas:** Contrato como fuente de verdad, documentación siempre actualizada
**Desventajas:** Código generado boilerplate, menos control

### Code-First
1. Escribir código (anotaciones Spring)
2. Generar spec OpenAPI con springdoc-openapi
3. Publicar documentación

**Ventajas:** Rápido, control total del código
**Desventajas:** Documentación puede desincronizarse

## 6. springdoc-openapi

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

```java
@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI taskFlowOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("TaskFlow API")
                .description("API de gestión de tareas")
                .version("2.0.0")
                .contact(new Contact().email("api@taskflow.com")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
```

## 7. Herramientas

| Herramienta | Uso |
|-------------|-----|
| **Swagger Editor** | Editor online de specs OpenAPI |
| **Swagger UI** | Documentación visual interactiva |
| **SwaggerHub** | Colaboración + hosting de specs |
| **Redoc** | Documentación visual clean |
| **Stoplight** | Diseño visual de APIs |
| **Spectral** | Linter/validador de specs |
| **Redocly CLI** | Linter + bundle de specs |

## 8. OpenAPI Generator

```bash
openapi-generator generate \
  -i openapi.yaml \
  -g spring \
  -o taskflow-generated \
  --api-package com.taskflow.api \
  --model-package com.taskflow.model
```

## 9. Spec Completa de TaskFlow (fragmento)

```yaml
openapi: 3.1.0
info:
  title: TaskFlow API
  version: 2.0.0
  description: API RESTful para gestión de tareas personales
servers:
  - url: https://api.taskflow.com/v2
paths:
  /tasks:
    get:
      summary: Listar tareas paginadas
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 0 }
        - name: size
          in: query
          schema: { type: integer, default: 20 }
        - name: status
          in: query
          schema:
            $ref: '#/components/schemas/TaskStatus'
      responses:
        '200':
          description: Lista paginada de tareas
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskPage'
    post:
      summary: Crear nueva tarea
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          description: Tarea creada
          headers:
            Location:
              schema:
                type: string
                format: uri
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '422':
          description: Error de validación
          content:
            application/problem+json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    Task:
      type: object
      properties:
        id: { type: integer, format: int64 }
        title: { type: string, maxLength: 100 }
        description: { type: string }
        status:
          $ref: '#/components/schemas/TaskStatus'
        priority:
          $ref: '#/components/schemas/TaskPriority'
        createdAt: { type: string, format: date-time }
    TaskPage:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Task'
        page: { type: integer }
        size: { type: integer }
        totalElements: { type: integer }
        totalPages: { type: integer }
    TaskStatus:
      type: string
      enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
    TaskPriority:
      type: string
      enum: [LOW, MEDIUM, HIGH, CRITICAL]
    Error:
      type: object
      properties:
        type: { type: string, format: uri }
        title: { type: string }
        status: { type: integer }
        detail: { type: string }
    CreateTaskRequest:
      type: object
      required: [title]
      properties:
        title: { type: string, maxLength: 100 }
        description: { type: string }
        priority:
          $ref: '#/components/schemas/TaskPriority'
```
