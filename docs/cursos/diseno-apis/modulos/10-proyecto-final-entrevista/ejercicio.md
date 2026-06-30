---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Implementar Paginación Cursor-Based

Implementa paginación cursor-based para `GET /api/v1/tasks` desde cero:

1. Explica cómo funciona el cursor
2. Escribe el mecanismo de codificación/decodificación
3. Implementa el endpoint en Spring Boot
4. ¿Qué pasa si el cursor es inválido?

---

## Ejercicio 3: Refactorizar GET /tasks con HATEOAS

Tienes este endpoint simple:

```java
@GetMapping
public List<Task> getAll() {
    return taskService.findAll();
}
```

Refactorízalo para incluir HATEOAS con:
1. Self link en cada tarea
2. Link a la colección de tareas
3. Links de navegación (first, prev, next, last)
4. Affordances según estado de la tarea (complete si no está completada, uncomplete si lo está)
5. Link a comentarios de la tarea

---

## Ejercicio 4: Migración v1 → v2 sin Downtime

TaskFlow API tiene 100 clientes activos en v1. Debes migrar a v2 con estos cambios:
- `completed` cambia de `boolean` a `String` (timestamp ISO)
- Se añade `tags` (List<String>)
- Se elimina `description`

Diseña la estrategia de migración que incluya:
1. Estrategia de coexistencia (URL path o header)
2. Timeline y deprecation
3. Cómo manejar clients que no migren
4. Código para convertir entre versiones

---

## Ejercicio 5: Implementar Rate Limiter Personalizado

Implementa un rate limiter en Spring Boot que:

1. Use **Sliding Window Log** (no Token Bucket)
2. Almacene los timestamps en memoria
3. Limite: 100 requests por minuto por usuario
4. Retorne headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After
5. Sea configurable por endpoint (GET /tasks: 100/min, POST /tasks: 20/min, POST /auth/login: 5/min)

---

## Ejercicio 6: Crear Schema GraphQL para TaskFlow

Escribe el schema GraphQL completo y los resolvers para:

1. Query `task(id: ID!)` que retorna Task con comments y assignee
2. Mutation `createTask(input: CreateTaskInput!)` con validación
3. Subscription `taskStatusChanged` que emite eventos cuando cambia el status
4. Resolver para `Task.comments` usando DataLoader (evitar N+1)

---

## Ejercicio 7: Convertir Endpoint REST Problemático a gRPC

El siguiente endpoint REST tiene problemas de rendimiento:

```java
@GetMapping("/api/v1/tasks/batch")
public List<Task> getBatch(@RequestParam List<Long> ids) {
    return taskService.findByIds(ids);
}
```

Problemas: timeout frecuente con muchos IDs, no hay streaming, payload grande.

Conviértelo a gRPC:
1. Define el .proto
2. Implementa el servicio gRPC con server streaming
3. Explica cómo mejora el rendimiento

---

## Ejercicio 8: Diseñar Webhook System

Diseña un sistema de webhooks para TaskFlow que notifique a clientes externos cuando:

- Una tarea es creada
- Una tarea cambia de estado
- Un comentario es agregado

1. Diseña el recurso de suscripción (`POST /api/v1/webhooks`)
2. Diseña el payload del webhook
3. Implementa el mecanismo de entrega (retry, timeout, dead letter)
4. ¿Cómo aseguras que el webhook sea seguro (verificación de firma)?

---

## Ejercicio 9: Implementar OAuth2 PKCE desde Frontend

Explica paso a paso cómo implementar OAuth2 PKCE en TaskFlow:

1. Diagrama de secuencia frontend → auth server → API
2. Generación de code_verifier y code_challenge
3. Obtención del authorization code
4. Intercambio por tokens
5. Uso del access token en requests a la API
6. Refresh token flow

---

## Ejercicio 10: Debuggear Spec OpenAPI

La siguiente spec OpenAPI tiene errores. Encuéntralos y corrígelos:

```yaml
openapi: 3.0.0
info:
  title: TaskFlow API
  version: 1.0
paths:
  /tasks:
    get:
      summary: Obtener tareas
      parameters:
        - name: page
          in: query
        - name: id
          in: path
      responses:
        200:
          description: OK
          content:
            json:
              schema:
                $ref: '#/schemas/Task'
    post:
      summary: Crear tarea
      requestBody:
        required: true
        contents:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          description: Created
components:
  schema:
    Task:
      type: object
      properties:
        id: integer
        title: string
```
