---
sidebar_position: 2
sidebar_label: "Temario"
---

## Módulo 02 — Diseño de Recursos y Naming

- Sustantivos, no verbos: /tasks en lugar de /getTasks o /getAllTasks
- Plurales para colecciones: /tasks, /users, /orders, /products
- Singular para recursos específicos: /tasks/{id}, /users/{email}
- Recursos anidados: /users/{id}/tasks (tareas de un usuario específico)
- URL structure estándar: /api/{version}/{resource}[/{id}][/{sub-resource}]
- Consistencia: mismo patrón para todos los endpoints a lo largo de toda la API
- Nouns vs verbs: cuándo usar action endpoints (POST /tasks/{id}/complete, POST /tasks/{id}/assign)
- Casos complejos: /tasks/export (exportar tareas), /reports/daily-summary (reportes)
- Buenas prácticas: kebab-case (task-assignments), lowercase, sin extensiones (.json, .xml)
- Proyección (sparse fieldsets): ?fields=id,title,completed — el cliente selecciona los campos que necesita
- Convención de nombres para queries: ?status=completed&priority=high
- Trade-off entre profundidad de anidación y simplicidad: máximo 3 niveles
- Relaciones: referencing (userId) vs embedding (user objeto completo)
- Laboratorio: rediseñar endpoints de TaskFlow siguiendo buenas prácticas, crear TaskController con endpoints RESTful

---

## Módulo 03 — Métodos HTTP y Códigos de Estado

- GET: recuperar uno o varios recursos (idempotente, seguro — no modifica estado)
- POST: crear un nuevo recurso (no idempotente, no seguro)
- PUT: reemplazar un recurso completo (idempotente). Ej: PUT /tasks/1 con body completo
- PATCH: actualización parcial (no idempotente). RFC 6902 JSON Patch, RFC 7396 JSON Merge Patch
- DELETE: eliminar un recurso (idempotente — segunda request retorna 404)
- HEAD: obtener metadatos sin body (idempotente, seguro)
- OPTIONS: descubrir métodos disponibles para un endpoint
- Códigos 2xx: 200 OK, 201 Created (recurso creado + Location header), 202 Accepted (procesamiento async), 204 No Content (DELETE exitoso)
- Códigos 3xx: 301 Moved Permanently, 303 See Other, 304 Not Modified (ETag/If-None-Match)
- Códigos 4xx: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 406 Not Acceptable
- Códigos 4xx adicionales: 409 Conflict (estado actual conflictúa), 422 Unprocessable Entity (validación), 429 Too Many Requests (rate limiting)
- Códigos 5xx: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable
- Headers importantes: Location (URL del recurso creado), ETag (hash de representación), Last-Modified, Content-Type, Accept
- Manejo de errores consistente: Problem Details RFC 9457 (antes RFC 7807)
- Estructura de error: { "type": "...", "title": "...", "status": 422, "detail": "...", "instance": "..." }
- Laboratorio: implementar todos los métodos HTTP en TaskFlow, manejo de excepciones global (@ControllerAdvice), respuestas de error consistentes

---

## Módulo 04 — Versionado y Evolución de APIs

- ¿Por qué versionar? Garantizar backward compatibility, permitir cambios sin romper clientes existentes
- Breaking changes: cambiar tipo de campo, renombrar campo o endpoint, eliminar campo o endpoint, cambiar comportamiento
- Non-breaking changes: añadir campo opcional, añadir endpoint, cambiar orden de campos en respuesta
- Estrategias de versionado:
  - URL path: /v1/tasks, /v2/tasks — más visible, menos RESTful (el recurso cambia de URL)
  - Header: Accept: application/vnd.taskflow.v1+json — más RESTful, menos visible
  - Query param: /tasks?v=1 — simple, pero contamina la URL
- Semantic versioning for APIs: MAJOR.MINOR.PATCH
  - MAJOR: breaking changes
  - MINOR: new features, backward compatible
  - PATCH: bug fixes, cambios internos
- Deprecation policy: documentar tiempos de soporte (ej: 6 meses deprecation antes de eliminar)
- Sunset header: Deprecation: true, Sunset: Sat, 31 Dec 2026 23:59:59 GMT
- Changelogs: mantener changelog detallado por versión (CHANGELOG.md)
- Evolución sin versionar: adición de campos al response (los clientes ignoran campos desconocidos). Postel's Law
- Estrategia: mantener versiones anteriores funcionando (v1, v2 coexistiendo) hasta migración completa
- Laboratorio: implementar versionado por URL path en TaskFlow, crear TaskControllerV1 y TaskControllerV2 con cambios

---

## Módulo 05 — Paginación, Filtros y Ordenamiento

- Paginación: necesidad de limitar respuestas grandes. Dos enfoques principales
- Offset pagination: ?page=0&size=10 (simple, pero inconsistente si hay inserciones/eliminaciones)
  - page: índice basado en 0, size: elementos por página
  - Problema: si se inserta un elemento en la página 1, el usuario ve duplicados en página 2
- Cursor pagination (keyset): ?cursor=abc123&limit=10 (consistente, más complejo de implementar)
  - cursor = ID o timestamp del último elemento
  - Ventaja: estable aunque haya inserciones concurrentes
  - Desventaja: no permite saltar páginas arbitrariamente
- Filtros: ?status=completed&priority=high (filtros exactos)
- Filtros con operadores:
  - ?age=gte:18 (greater than or equal)
  - ?createdAt=gt:2024-01-01 (greater than)
  - ?q=search+term (text search)
  - ?tag=java&tag=spring (múltiples valores OR)
- Ordenamiento: ?sort=createdAt,desc&sort=title,asc
  - Formato: sort={field},{direction}
  - Múltiples campos: por precedencia
- Combinación: ?page=0&size=10&sort=createdAt,desc&status=completed
- Meta en respuesta:
  ```json
  {
    "data": [...],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10
  }
  ```
- Links de navegación: "first", "prev", "next", "last" (preparando HATEOAS)
- Paginación en Spring: Pageable, Page<T>, Sort
- Laboratorio: implementar paginación offset + cursor en TaskFlow, filtros combinados y ordenamiento

---

## Módulo 06 — HATEOAS y APIs Auto-descriptivas

- HATEOAS: Hypermedia as the Engine of Application State. Nivel 3 de Richardson
- Principio: el servidor guía al cliente a través de las transiciones de estado mediante hipervínculos
- HAL (Hypertext Application Language): formato estándar para representar hypermedia
  - _links: objetos con relaciones (self, next, prev, etc.)
  - _embedded: recursos embebidos
- Ejemplo HAL:
  ```json
  {
    "_links": { "self": { "href": "/tasks/1" }, "tasks": { "href": "/tasks" } },
    "id": 1, "title": "Comprar leche", "completed": false
  }
  ```
- Spring Data REST: genera automáticamente HAL + HATEOAS desde repositorios JPA
- HAL Explorer: UI para explorar APIs HAL (similar a Swagger pero navegable)
- Navegación por la API: self, next, prev, first, last en colecciones
- Acciones disponibles según estado: task pendiente → "complete", task completada → "uncomplete", "delete"
- Content types específicos: application/hal+json, application/hal+xml
- Otros formatos hypermedia:
  - Siren: actions + entities + links
  - Collection+JSON: query + template + links
  - JSON:API: relationships + links + compound documents
- Diseño de affordances: el cliente descubre qué puede hacer a continuación
- Laboratorio: agregar HATEOAS a TaskFlow con Spring HATEOAS (RepresentationModelAssembler), explorar con HAL Explorer

---

## Módulo 07 — OpenAPI/Swagger Avanzado

- OpenAPI 3.1: estructura general del documento
  - openapi: versión del spec (3.1.0)
  - info: título, descripción, versión de la API
  - servers: URLs base (desarrollo, staging, producción)
  - paths: definición de endpoints, métodos, parámetros, respuestas
  - components: schemas reutilizables, parameters, responses, securitySchemes
  - tags: agrupación de endpoints
- Security schemes:
  - Bearer JWT: type: http, scheme: bearer, bearerFormat: JWT
  - OAuth2: type: oauth2, flows (authorizationCode, clientCredentials, etc.)
  - API Key: type: apiKey, in: header/query/cookie, name: X-API-Key
- Reutilización con $ref:
  - components/schemas/Task: modelo de datos reutilizable
  - components/parameters/pageParam: parámetro de paginación
  - components/responses/ErrorResponse: respuesta de error estándar
- Response examples y error schemas:
  - example: ejemplo inline
  - examples: múltiples ejemplos (success, error, etc.)
- Composición de schemas:
  - allOf: combinación de esquemas (herencia)
  - oneOf: exactamente uno de los esquemas
  - anyOf: uno o más de los esquemas
- OpenAPI generada desde código (code-first): springdoc-openapi, anotaciones @Operation, @Schema
- API-first: contrato OpenAPI primero → generar código con Spring Codegen (openapi-generator)
  - Ventajas: contrato como fuente de verdad, documentación siempre actualizada
  - Desventajas: generación de código boilerplate, menos control sobre implementación
- Herramientas:
  - Swagger Editor: editor online/interfaz web
  - SwaggerHub: colaboración + hosting de specs
  - Redoc: documentación visual clean
  - Stoplight: diseño visual de APIs
  - insomnia/httpie: testing de APIs
- Laboratorio: crear spec OpenAPI 3.1 completa para TaskFlow, generar doc con Swagger UI + Redoc, implementar API-first

---

## Módulo 08 — Seguridad y Rate Limiting en APIs

- Autenticación vs Autorización: ¿quién eres? vs ¿qué puedes hacer?
- API Keys: identificación simple, compartidas en query/header, sin expiración inherente
- Bearer Token (JWT): JSON Web Token, stateless, firmado (HMAC/RSA/ECDSA), con claims
  - Estructura JWT: header.payload.signature
  - Claims: sub, iss, exp, iat, roles, permissions
  - Validación: verificar firma + expiración + issuer
- OAuth2 Flows:
  - Authorization Code: frontend + backend, el más seguro con PKCE
  - Client Credentials: machine-to-machine, sin usuario
  - PKCE (Proof Key for Code Exchange): para SPAs y mobile apps
  - Refresh Token: renovar access token sin re-autenticar
- Rate Limiting: proteger la API de abusos y picos de tráfico
  - Fixed Window: cuenta requests por ventana de tiempo (ej: 100 req/min). Problema: picos al final de la ventana
  - Sliding Window: ventana deslizante, más preciso
  - Token Bucket: tokens que se regeneran con el tiempo. Permite bursts controlados
  - Leaky Bucket: cola FIFO, procesa a velocidad constante
- Headers de Rate Limiting (estándar IETF):
  - X-RateLimit-Limit: límite máximo por ventana
  - X-RateLimit-Remaining: requests restantes en la ventana actual
  - X-RateLimit-Reset: timestamp de reinicio de la ventana
  - Retry-After: cuándo reintentar (en segundos)
- Throttling: por usuario (autenticado), por IP (anónimo), por endpoint (endpoints costosos)
- Input validation y sanitización: prevenir injection attacks (SQL, NoSQL, command)
- CORS (Cross-Origin Resource Sharing): @CrossOrigin, allowed origins, methods, headers
- Seguridad adicional:
  - HTTPS/TLS obligatorio
  - Content Security Policy headers
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Strict-Transport-Security
- Laboratorio: implementar JWT en TaskFlow (login + validación), agregar rate limiting con bucket4j o filters, configurar CORS

---

## Módulo 09 — GraphQL vs REST vs gRPC

- GraphQL: lenguaje de consulta para APIs desarrollado por Facebook (2015)
  - Consultas (queries): el cliente especifica exactamente qué datos necesita
  - Mutaciones (mutations): operaciones de escritura con respuesta
  - Suscripciones (subscriptions): tiempo real sobre WebSockets
- Esquema GraphQL:
  - type Query { tasks: [Task!]!, task(id: ID!): Task }
  - type Mutation { createTask(input: TaskInput!): Task!, completeTask(id: ID!): Task }
  - type Subscription { taskCreated: Task! }
- Resolvers y problema N+1:
  - DataLoader: batching y caching de requests a base de datos
  - Solución al N+1: cargar datos en lote (batch load)
- REST vs GraphQL — cuándo usar cada uno:
  - REST: operaciones simples, caching HTTP, madurez de herramientas, equipos pequeños
  - GraphQL: clientes múltiples con necesidades diversas, over-fetching/under-fetching, evolución rápida
  - Ambos coexistiendo: GraphQL facade sobre APIs REST
- gRPC: Remote Procedure Calls de Google, basado en Protocol Buffers
  - HTTP/2: multiplexación, server push, header compression
  - Protocol Buffers: schema .proto, serialización binaria compacta y rápida
  - Streaming: unary, server streaming, client streaming, bidirectional streaming
- Comparativa:
  - REST: madurez (20+ años), caching HTTP, ecosistema amplio, formato JSON legible
  - GraphQL: flexibilidad, tipado fuerte, sin over-fetching, evolución sin versionar
  - gRPC: rendimiento superior, streaming nativo, code generation, ideal para microservicios
- APIs en tiempo real:
  - WebSockets: full-duplex, persistente, ideal para chats, juegos, colaboración
  - SSE (Server-Sent Events): unidireccional (servidor → cliente), más simple que WS
- Laboratorio: implementar endpoint GraphQL con Spring GraphQL en TaskFlow, comparar with REST, implementar gRPC service

---

## Módulo 10 — Proyecto Final + Simulación de Entrevista

### Proyecto Final: API TaskFlow completa
- Diseñar API de TaskFlow desde cero: contrato OpenAPI primero (API-first)
- Especificar recursos:
  - /tasks: CRUD completo
  - /users/{id}/tasks: tareas por usuario
  - /tasks/{id}/comments: comentarios en tareas
  - /tasks/{id}/attachments: archivos adjuntos
  - /tasks/export: exportación masiva
- Métodos HTTP y códigos de estado correctos
- Paginación offset + cursor, filtros combinados, ordenamiento multi-campo
- HATEOAS: navegación completa entre recursos
- Documentación con OpenAPI 3.1 + Redoc + Swagger UI
- Seguridad JWT: registro, login, refresh token
- Rate limiting por usuario y por endpoint
- Manejo de errores con Problem Details (RFC 9457)
- Versionado por header con coexistencia v1/v2
- Implementación en Spring Boot 3.x con arquitectura en capas
- Pruebas unitarias e integración con JUnit 5 + Mockito + Testcontainers

### Simulación de Entrevista Técnica — 10 ejercicios prácticos
1. Diseñar el endpoint de búsqueda de tareas con filtros dinámicos
2. Implementar paginación cursor-based desde cero
3. Refactorizar GET /tasks para usar HATEOAS con transiciones de estado
4. Diseñar la migración de v1 a v2 sin downtime
5. Implementar un rate limiter personalizado
6. Crear un schema GraphQL que exponga TaskFlow
7. Convertir un endpoint REST problemático a gRPC
8. Diseñar un webhook system para notificar cambios en tareas
9. Implementar OAuth2 PKCE flow desde el frontend
10. Debuggear una spec OpenAPI con errores de composición

### 60 preguntas de entrevista (6 categorías, 10 cada una)
- Categoría 1 — REST y HTTP: principios REST, idempotencia, códigos de estado, headers, etc.
- Categoría 2 — Diseño de APIs: naming, versionado, paginación, filtros, HATEOAS
- Categoría 3 — OpenAPI/Swagger: spec, $ref, security schemes, codegen
- Categoría 4 — Seguridad: JWT, OAuth2, rate limiting, CORS, input validation
- Categoría 5 — GraphQL vs REST vs gRPC: comparativas, cuándo usar cada uno, streaming
- Categoría 6 — Spring Boot: anotaciones, JPA, DTOs, testing, buenas prácticas

---

## Calendario

| Día | Módulo | Tema |
|-----|--------|------|
| Semana 1, Lunes | 01 | Fundamentos de APIs y REST |
| Semana 1, Martes | 02 | Diseño de Recursos y Naming |
| Semana 1, Miércoles | 03 | Métodos HTTP y Códigos de Estado |
| Semana 1, Jueves | 04 | Versionado y Evolución |
| Semana 1, Viernes | 05 | Paginación, Filtros, Ordenamiento |
| Semana 2, Lunes | 06 | HATEOAS y APIs Auto-descriptivas |
| Semana 2, Martes | 07 | OpenAPI Avanzado |
| Semana 2, Miércoles | 08 | Seguridad y Rate Limiting |
| Semana 2, Jueves | 09 | GraphQL vs REST vs gRPC |
| Semana 2, Viernes | 10 | Proyecto Final + Entrevista |

---

## Sistema de Evaluación

| Componente | Peso | Descripción |
|------------|------|-------------|
| Laboratorios (5) | 30% | Ejercicios prácticos por módulo (módulos 1-9) |
| Proyecto Final | 40% | API TaskFlow completa con todos los temas |
| Examen Teórico | 20% | 60 preguntas de selección múltiple |
| Participación | 10% | Code reviews, discusiones, pair programming |

**Escala:** 0-100. Mínimo aprobatorio: 70. Nota final: ponderación de componentes.

---

## Recursos Recomendados

### Libros
- *API Design Patterns* — JJ Geewax (Manning, 2021)
- *REST API Design Rulebook* — Mark Masse (O'Reilly, 2011)
- *The Design of Web APIs* — Arnaud Lauret (Manning, 2019)
- *RESTful Web APIs* — Leonard Richardson & Mike Amundsen (O'Reilly, 2013)
- *Building Microservices* — Sam Newman (O'Reilly, 2nd ed)

### Cursos Online
- API Design — Google Cloud Skills Boost
- OpenAPI Specification — Swagger Official Tutorials
- REST API Design — LinkedIn Learning
- Spring Boot & REST — Udemy (Chad Darby)

### Herramientas
- Spring Boot 3.x — https://start.spring.io
- Swagger Editor — https://editor.swagger.io
- Redoc — https://redocly.com
- Stoplight — https://stoplight.io
- Insomnia — https://insomnia.rest
- Postman — https://postman.com
- HAL Explorer — https://github.com/spring-projects/spring-hateoas-examples
- OpenAPI Generator — https://openapi-generator.tech
- Bucket4j (rate limiting) — https://bucket4j.com

### Artículos y Referencias
- RFC 9457 — Problem Details for HTTP APIs
- RFC 7230-7235 — HTTP/1.1 Specification
- RFC 7519 — JSON Web Token (JWT)
- RFC 6749 — OAuth 2.0 Authorization Framework
- Roy Fielding's Dissertation — "Architectural Styles and the Design of Network-based Software Architectures" (2000)
- Richardson Maturity Model — Martin Fowler
- GraphQL Specification — https://spec.graphql.org
- gRPC Documentation — https://grpc.io/docs

