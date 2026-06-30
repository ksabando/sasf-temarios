---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 2: Implementar Paginación Cursor-Based

**Solución esperada**:

**1. ¿Cómo funciona el cursor?**
El cursor es un token opaco (base64) que codifica la posición del último elemento de la página actual. El cliente envía este cursor para obtener la siguiente página. No permite saltar a páginas arbitrarias pero es consistente ante inserciones concurrentes.

**2. Codificación/decodificación:**
```java
public String encodeCursor(Long lastId, LocalDateTime lastCreatedAt) {
    String data = lastId + "|" + lastCreatedAt.toString();
    return Base64.getUrlEncoder().withoutPadding().encodeToString(data.getBytes());
}

public CursorInfo decodeCursor(String cursor) {
    String data = new String(Base64.getUrlDecoder().decode(cursor));
    String[] parts = data.split("\\|");
    return new CursorInfo(Long.parseLong(parts[0]), LocalDateTime.parse(parts[1]));
}

record CursorInfo(Long lastId, LocalDateTime lastCreatedAt) {}
```

**3. Implementación del endpoint:**
```java
@GetMapping("/cursor")
public ResponseEntity<CursorResponse<TaskResponse>> getWithCursor(
        @RequestParam(required = false) String cursor,
        @RequestParam(defaultValue = "20") @Max(100) int limit) {

    Pageable pageable = PageRequest.of(0, limit + 1);
    List<Task> tasks;

    if (cursor == null) {
        tasks = taskRepository.findByOrderByIdAsc(pageable);
    } else {
        CursorInfo info = decodeCursor(cursor);
        tasks = taskRepository.findByIdGreaterThanOrderByIdAsc(info.lastId(), pageable);
    }

    boolean hasMore = tasks.size() > limit;
    if (hasMore) tasks = tasks.subList(0, limit);

    String nextCursor = hasMore ? encodeCursor(
        tasks.get(tasks.size() - 1).getId(),
        tasks.get(tasks.size() - 1).getCreatedAt()) : null;

    return ResponseEntity.ok(new CursorResponse<>(
        tasks.stream().map(this::toResponse).toList(),
        nextCursor, hasMore, limit));
}
```

**4. ¿Qué pasa si el cursor es inválido?**
Debe retornar 400 Bad Request con un Problem Detail:
```json
{
  "type": "https://api.taskflow.com/errors/invalid-cursor",
  "title": "Invalid Cursor",
  "status": 400,
  "detail": "The provided cursor is malformed or expired"
}
```

**Posibles mejoras**:
- Agregar soporte para cursor bidireccional: calcular también `prevCursor` en la respuesta permitiendo navegación hacia atrás. Esto requiere una consulta inversa (`WHERE id < :firstId ORDER BY id DESC`) y codificar el primer ID de la página actual para el cursor anterior.
- Usar criptografía para firmar el cursor (HMAC) y prevenir que clientes maliciosos manipulen el cursor para saltar a registros arbitrarios o hacer web scraping. Un cursor firmado no puede ser decodificado y modificado sin invalidarse.
- Reemplazar el cursor basado en ID por un cursor basado en timestamp cuando el ordenamiento no es por ID (ej. `ORDER BY created_at DESC`). En ese caso el cursor se convierte en `base64({"createdAt": "2026-06-29T10:00:00Z", "id": 42})` combinando timestamp + ID para desempate de timestamps duplicados.

---

## Ejercicio 3: Refactorizar GET /tasks con HATEOAS

**Solución esperada**:

```java
@GetMapping
public ResponseEntity<CollectionModel<TaskModel>> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {

    Page<Task> taskPage = taskService.findAll(PageRequest.of(page, size));
    List<TaskModel> tasks = taskPage.getContent().stream()
        .map(assembler::toModel)
        .toList();

    CollectionModel<TaskModel> model = CollectionModel.of(tasks);

    // Links de navegación
    model.add(linkTo(methodOn(TaskController.class).getAll(page, size)).withSelfRel());
    if (taskPage.hasNext())
        model.add(linkTo(methodOn(TaskController.class).getAll(page + 1, size)).withRel("next"));
    if (taskPage.hasPrevious())
        model.add(linkTo(methodOn(TaskController.class).getAll(page - 1, size)).withRel("prev"));
    model.add(linkTo(methodOn(TaskController.class).getAll(0, size)).withRel("first"));
    model.add(linkTo(methodOn(TaskController.class).getAll(taskPage.getTotalPages() - 1, size)).withRel("last"));

    return ResponseEntity.ok(model);
}
```

**TaskModelAssembler con affordances:**
```java
@Override
public TaskModel toModel(Task task) {
    TaskModel model = new TaskModel();
    model.setId(task.getId());
    model.setTitle(task.getTitle());
    model.setCompleted(task.isCompleted());

    model.add(linkTo(methodOn(TaskController.class).getById(task.getId())).withSelfRel());
    model.add(linkTo(methodOn(TaskController.class).getAll(0, 20)).withRel("tasks"));
    model.add(linkTo(methodOn(TaskController.class).getComments(task.getId())).withRel("comments"));

    if (!task.isCompleted())
        model.add(linkTo(methodOn(TaskController.class).complete(task.getId())).withRel("complete"));
    else
        model.add(linkTo(methodOn(TaskController.class).uncomplete(task.getId())).withRel("uncomplete"));

    return model;
}
```

**Posibles mejoras**:
- Inyectar `SecurityContext` en el assembler para condicionar los links `delete`, `assign` y `complete` según roles y ownership: `if (securityContext.isAdmin() || task.isOwner(currentUserId))`. Esto hace que las affordances sean personalizadas por usuario, no solo por estado.
- Agregar link `create` a nivel de colección: `model.add(linkTo(methodOn(TaskController.class).create(null)).withRel("create"))` para que el cliente descubra cómo crear una nueva tarea. Completar la navegabilidad desde la raíz de la API hacia abajo.
- Migrar de links hardcodeados con `methodOn` a `Affordances` de Spring HATEOAS 2.x que permiten especificar el método HTTP, el body esperado y los parámetros requeridos, haciendo el link completamente autodescriptivo (similar a Siren en HAL).

---

## Ejercicio 4: Migración v1 → v2 sin Downtime

**Solución esperada**:

**1. Estrategia:** **URL path** (más claro para 100 clientes)
```
/api/v1/tasks → versión antigua (mantener)
/api/v2/tasks → versión nueva
```

**2. Timeline:**
```
Mes 0:  Lanzar v2 en paralelo. Todos los clientes nuevos usan v2
Mes 3:  Anunciar deprecation de v1. Headers Deprecation: true en v1
Mes 6:  Sunset de v1. Redirigir v1 → v2 con 301
Mes 7+: Eliminar código de v1
```

**3. Conversión entre versiones:**
```java
public class TaskConverter {
    public TaskV1 toV1(TaskV2 v2) {
        TaskV1 v1 = new TaskV1();
        v1.setId(v2.getId());
        v1.setTaskName(v2.getTitle()); // rename
        v1.setDescription(null); // removed in v2, default null
        v1.setDone("completed".equals(v2.getStatus())); // boolean from status
        return v1;
    }
}
```

**4. Monitoreo:** Dashboard con requests por versión. Alerta cuando v1 llegue a 0.

**Posibles mejoras**:
- En lugar de que v1 y v2 tengan controladores y servicios completamente separados, usar una arquitectura de "thin controllers": ambos controladores llaman al mismo `TaskService` que devuelve un modelo interno (`TaskEntity`), y cada controller mapea a su DTO específico. Esto reduce la duplicación de lógica de negocio a cero.
- Configurar un `DeprecationFilter` que automáticamente agregue los headers `Deprecation` y `Sunset` a todas las respuestas de los endpoints `/api/v1/**` sin necesidad de modificar cada controlador.
- Evaluar si es necesario un redirect 301 de v1 a v2 al final del sunset. La respuesta corta es no: un 301 cambia el método HTTP de POST a GET en algunos clientes. Es mejor retornar `410 Gone` con un mensaje descriptivo y un link a la documentación de migración, o mantener v1 con una respuesta dummy que indique "migrado a v2".

---

## Ejercicio 5: Implementar Rate Limiter Personalizado (Sliding Window Log)

**Solución esperada**:

```java
@Component
public class SlidingWindowRateLimiter {

    private final Map<String, LinkedList<Long>> requestLogs = new ConcurrentHashMap<>();
    private final Map<String, Integer> limits = Map.of(
        "GET:/api/v1/tasks", 100,
        "POST:/api/v1/tasks", 20,
        "POST:/api/v1/auth/login", 5
    );

    public boolean tryConsume(String key) {
        long now = System.currentTimeMillis();
        long windowStart = now - 60_000; // 1 minuto

        LinkedList<Long> log = requestLogs.computeIfAbsent(key, k -> new LinkedList<>());

        synchronized (log) {
            // Remover timestamps expirados
            while (!log.isEmpty() && log.peekFirst() < windowStart) {
                log.pollFirst();
            }

            int limit = limits.getOrDefault(key, 100);
            if (log.size() >= limit) {
                return false;
            }

            log.addLast(now);
            return true;
        }
    }

    public int getRemaining(String key) {
        LinkedList<Long> log = requestLogs.get(key);
        if (log == null) return limits.getOrDefault(key, 100);
        synchronized (log) {
            long windowStart = System.currentTimeMillis() - 60_000;
            while (!log.isEmpty() && log.peekFirst() < windowStart) log.pollFirst();
            return limits.getOrDefault(key, 100) - log.size();
        }
    }

    public long getResetTime(String key) {
        LinkedList<Long> log = requestLogs.get(key);
        if (log == null || log.isEmpty()) return System.currentTimeMillis() / 1000 + 60;
        synchronized (log) {
            return (log.peekFirst() / 1000) + 60;
        }
    }
}
```

**Filter:**
```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final SlidingWindowRateLimiter limiter;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        String key = getClientId(request) + ":" + request.getMethod() + ":" + getEndpoint(request);

        if (limiter.tryConsume(key)) {
            response.setHeader("X-RateLimit-Limit",
                String.valueOf(limiter.getLimit(key)));
            response.setHeader("X-RateLimit-Remaining",
                String.valueOf(limiter.getRemaining(key)));
            response.setHeader("X-RateLimit-Reset",
                String.valueOf(limiter.getResetTime(key)));
            chain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/problem+json");
            response.getWriter().write("""
                {"type":"https://api.taskflow.com/errors/rate-limit",
                 "title":"Too Many Requests","status":429,
                 "detail":"Rate limit exceeded. Try again in 60 seconds."}
                """);
        }
    }
}
```

**Posibles mejoras**:
- Reemplazar `ConcurrentHashMap` + `LinkedList` con Bucket4j para una implementación probada en producción. Bucket4j maneja eficientemente la concurrencia, permite diferentes algoritmos (Token Bucket, etc.), y tiene integración con Redis para entornos distribuidos.
- Agregar limpieza periódica de buckets no usados para prevenir memory leak. Un `ScheduledExecutorService` que cada 10 minutos recorra el mapa y elimine buckets cuya última request sea anterior a 1 hora.
- Implementar diferenciación de límites por plan/tier: clientes gratuitos tienen 100 req/min, clientes premium tienen 1000 req/min. Esto requiere lookup del tier del usuario autenticado y selección dinámica del límite, no hardcodeado en el mapa.

---

## Ejercicio 6: Crear Schema GraphQL para TaskFlow

**Solución esperada**:

**Schema:**
```graphql
type Query {
  task(id: ID!): Task
}

type Mutation {
  createTask(input: CreateTaskInput!): Task!
}

type Subscription {
  taskStatusChanged(taskId: ID): Task!
}

type Task {
  id: ID!
  title: String!
  status: TaskStatus!
  comments: [Comment!]!
  assignee: User
}

type Comment {
  id: ID!
  text: String!
  author: User!
}

type User {
  id: ID!
  name: String!
}

input CreateTaskInput {
  title: String!
  description: String
  assigneeId: ID
}
```

**Resolvers:**
```java
@Controller
public class TaskResolver {

    @QueryMapping
    public Task task(@Argument Long id) {
        return taskService.findById(id).orElse(null);
    }

    @MutationMapping
    public Task createTask(@Argument CreateTaskInput input) {
        return taskService.create(input);
    }

    @SchemaMapping
    public CompletableFuture<List<Comment>> comments(Task task, DataLoader<Long, List<Comment>> loader) {
        return loader.load(task.getId()); // Evita N+1
    }
}

@Component
public class CommentBatchLoader implements BatchLoader<Long, List<Comment>> {
    @Override
    public CompletableFuture<List<List<Comment>>> load(List<Long> taskIds) {
        return CompletableFuture.supplyAsync(() -> {
            List<Comment> comments = commentService.findByTaskIds(taskIds);
            return taskIds.stream()
                .map(id -> comments.stream().filter(c -> c.getTaskId().equals(id)).toList())
                .toList();
        });
    }
}
```

**Subscription:**
```java
@SubscriptionMapping
public Flux<Task> taskStatusChanged(@Argument Long taskId) {
    return taskService.statusChangePublisher()
        .filter(t -> taskId == null || t.getId().equals(taskId));
}
```

**Posibles mejoras**:
- Agregar un `DataLoader` para `User` en `Task.assignee` de igual forma que `Comment`, resolviendo el N+1 también para la relación con usuarios. Idealmente, cada relación anidada debería tener su DataLoader.
- Implementar `maxDepth` y `maxComplexity` limits en el schema para prevenir queries maliciosas. Una query anidada de 20 niveles de `comments { task { comments { task ... } } }` podría tumbar el servidor. GraphQL Java soporta `MaxQueryDepthInstrumentation` y `MaxQueryComplexityInstrumentation`.
- Mover las suscripciones a un `ReactiveDataLoader` o a un mecanismo de pub/sub con Redis/Kafka si hay múltiples instancias del servidor. Sin esto, una suscripción solo recibe eventos de la instancia local donde se creó, no de todo el clúster.

---

## Ejercicio 7: Convertir Endpoint REST Problemático a gRPC

**Solución esperada**:

**1. Archivo .proto:**
```protobuf
syntax = "proto3";
package taskflow;

service TaskService {
  rpc GetTaskBatch (GetTaskBatchRequest) returns (stream Task);
}

message GetTaskBatchRequest {
  repeated int64 ids = 1;
}

message Task {
  int64 id = 1;
  string title = 2;
  string description = 3;
  bool completed = 4;
}
```

**2. Implementación gRPC con server streaming:**
```java
@GrpcService
public class TaskGrpcService extends TaskServiceGrpc.TaskServiceImplBase {

    @Override
    public void getTaskBatch(GetTaskBatchRequest request,
            StreamObserver<Task> responseObserver) {
        // Server streaming: envía cada task tan pronto como se carga
        for (Long id : request.getIdsList()) {
            taskService.findById(id).ifPresent(task -> {
                Task proto = toProto(task);
                responseObserver.onNext(proto);
            });
        }
        responseObserver.onCompleted();
    }
}
```

**3. Mejora de rendimiento:**
- **Streaming:** El cliente empieza a recibir datos inmediatamente, no espera todo el batch
- **Binario:** Protobuf es ~3-5x más pequeño que JSON
- **HTTP/2:** Multiplexación, un solo canal TCP para múltiples streams
- **Memoria:** No necesita cargar todo en memoria antes de enviar (streaming)
- **Timeout:** Cada task se envía individualmente, el cliente procesa parciales

**Posibles mejoras**:
- Usar `StreamObserver` con backpressure: en lugar de iterar sincrónicamente y enviar todas las tasks, usar un `Flowable` reactivo que emita tasks bajo demanda, respetando la velocidad de consumo del cliente. Esto evita saturar al cliente si procesa lento.
- Agregar un endpoint REST de compatibilidad con `grpc-gateway`: generar automáticamente un `GET /api/v1/tasks/batch?ids=1,2,3` que internamente llame al servicio gRPC y convierta el stream en una respuesta JSON o ndjson. Esto permite que clientes REST existentes se beneficien parcialmente de gRPC.
- Para el problema original de timeout, agregar deadline al contexto gRPC para que el servidor cancele si el procesamiento excede un límite, en lugar de esperar indefinidamente.

---

## Ejercicio 8: Diseñar Webhook System

**Solución esperada**:

**1. Recurso de suscripción:**
```http
POST /api/v1/webhooks
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://cliente.com/webhooks/taskflow",
  "events": ["task.created", "task.status.changed", "comment.created"],
  "secret": "cliente-secret-123"
}
```

**Respuesta:**
```json
{
  "id": "wh_abc123",
  "url": "https://cliente.com/webhooks/taskflow",
  "events": ["task.created", "task.status.changed", "comment.created"],
  "status": "active",
  "createdAt": "2026-06-26T10:00:00Z"
}
```

**2. Payload del webhook:**
```http
POST https://cliente.com/webhooks/taskflow
Content-Type: application/json
X-TaskFlow-Signature: sha256=abc123def456...
X-TaskFlow-Event: task.status.changed
X-TaskFlow-Delivery: msg_xyz789

{
  "event": "task.status.changed",
  "timestamp": "2026-06-26T10:30:00Z",
  "data": {
    "task": {
      "id": 1,
      "title": "Comprar leche",
      "status": "COMPLETED"
    },
    "previousStatus": "IN_PROGRESS",
    "changedBy": { "id": 42, "name": "Juan" }
  }
}
```

**3. Mecanismo de entrega:**
```java
@Service
public class WebhookService {

    public void deliver(WebhookSubscription sub, WebhookEvent event) {
        String payload = objectMapper.writeValueAsString(event);
        String signature = computeHmac(payload, sub.getSecret());

        try {
            HttpResponse response = httpClient.send(
                HttpRequest.newBuilder(URI.create(sub.getUrl()))
                    .header("Content-Type", "application/json")
                    .header("X-TaskFlow-Signature", "sha256=" + signature)
                    .header("X-TaskFlow-Event", event.getType())
                    .header("X-TaskFlow-Delivery", event.getDeliveryId())
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build());

            if (response.statusCode() >= 500) {
                // Retry con backoff: 10s, 30s, 1min, 5min, 30min
                scheduleRetry(sub, event, retryCount + 1);
            }
        } catch (Exception e) {
            if (retryCount < 5) scheduleRetry(sub, event, retryCount + 1);
            else deadLetterQueue.add(sub, event, e);
        }
    }
}
```

**4. Seguridad: firma HMAC:**
```java
public String computeHmac(String payload, String secret) {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
    return Base64.getEncoder().encodeToString(mac.doFinal(payload.getBytes()));
}
```

**Posibles mejoras**:
- Agregar un panel de administración para webhooks: listar suscripciones, ver historial de entregas (con timestamp, status code, response body, duración), reintentos pendientes y dead letter queue. Esto permite a los clientes debuggear sus integraciones sin contactar al soporte.
- Implementar circuit breaker por URL de webhook: si una URL falla consistentemente (ej. 50 fallos en 5 minutos), pausar temporalmente los envíos a esa URL y notificar al owner. Esto evita saturar un endpoint caído y protege los recursos de TaskFlow.
- Soportar verificación de firma con múltiples algoritmos: `sha256=...` (actual), `sha512=...` (más seguro), y permitir que el cliente elija el algoritmo al crear la suscripción. También considerar `timestamp` en el header de firma para prevenir replay attacks (`X-TaskFlow-Signature: t=1688000000,sha256=...`).

---

## Ejercicio 9: Implementar OAuth2 PKCE desde Frontend

**Solución esperada**:

**Diagrama de secuencia:**
```
1. Frontend genera:
   code_verifier = randomBytes(32) → base64url
   code_challenge = SHA256(code_verifier) → base64url

2. Frontend → Auth Server:
   GET https://auth.taskflow.com/authorize?
     response_type=code&
     client_id=taskflow-web&
     redirect_uri=https://app.taskflow.com/callback&
     code_challenge=<challenge>&
     code_challenge_method=S256&
     scope=read:tasks+write:tasks

3. Auth Server → Frontend (redirect):
   https://app.taskflow.com/callback?code=auth_code_123

4. Frontend → Auth Server (POST):
   POST https://auth.taskflow.com/token
   grant_type=authorization_code
   code=auth_code_123
   redirect_uri=https://app.taskflow.com/callback
   client_id=taskflow-web
   code_verifier=<verifier>

5. Auth Server → Frontend:
   {
     "access_token": "eyJhbGciOiJSUzI1NiIs...",
     "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
     "token_type": "Bearer",
     "expires_in": 3600
   }

6. Frontend → TaskFlow API (cada request):
   GET /api/v1/tasks
   Authorization: Bearer <access_token>

7. Cuando expira:
   POST https://auth.taskflow.com/token
   grant_type=refresh_token
   refresh_token=<refresh_token>
   client_id=taskflow-web
```

**Code en frontend (JavaScript):**
```javascript
function generatePKCE() {
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64url(await crypto.subtle.digest('SHA-256', verifier));
    return { verifier, challenge };
}

async function exchangeCode(code, verifier) {
    const response = await fetch('https://auth.taskflow.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'https://app.taskflow.com/callback',
            client_id: 'taskflow-web',
            code_verifier: verifier
        })
    });
    return response.json(); // { access_token, refresh_token, expires_in }
}
```

**Posibles mejoras**:
- Implementar refresh token rotation: cada vez que se usa un refresh token, se emite uno nuevo y se invalida el anterior. Si un refresh token robado se usa después de que el legítimo ya lo rotó, se detecta el reuso y se invalidan TODOS los refresh tokens de ese usuario (forzando re-login). Esto limita el daño de robo de refresh tokens.
- Almacenar el refresh token en una httpOnly, Secure, SameSite=strict cookie en lugar de localStorage, para prevenir robo por XSS. El access token puede seguir en memoria (variable JavaScript) porque expira rápido.
- Agregar el parámetro `state` en la request de autorización para prevenir CSRF en el callback: el frontend genera un string aleatorio, lo guarda en sessionStorage, lo envía en `/authorize`, y verifica que el callback incluya el mismo `state`. Esto previene que un atacante inicie el flujo y redirija a la víctima a un callback con su propio code malicioso.

---

## Ejercicio 10: Debuggear Spec OpenAPI

**Solución esperada**:

**Errores encontrados en la spec original:**

| Línea | Error | Corrección |
|-------|-------|------------|
| 1 | `openapi: 3.0.0` | Debe ser `openapi: 3.1.0` (versión más reciente) |
| 4 | `version: 1.0` | Debe ser `version: "1.0.0"` o string |
| 9-11 | Parámetro `id` en `in: path` pero GET /tasks no tiene path param | Mover a path `/tasks/{id}` |
| 8 | `name: page` sin schema | Agregar `schema: { type: integer, default: 0 }` |
| 15 | `json:` debe ser `application/json:` | Faltó el content-type |
| 16 | `$ref: '#/schemas/Task'` | Debe ser `$ref: '#/components/schemas/Task'` |
| 22 | `contents:` debe ser `content:` | Propiedad incorrecta |
| 29 | `components/schema:` debe ser `components/schemas:` | Plural incorrecto |
| 31-33 | `id: integer` debe ser `id: { type: integer }` | Formato YAML incorrecto |

**Spec corregida:**
```yaml
openapi: 3.1.0
info:
  title: TaskFlow API
  version: "1.0.0"
paths:
  /tasks:
    get:
      summary: Obtener tareas
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
  /tasks/{id}:
    get:
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: OK
    post:
      summary: Crear tarea
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          description: Created
components:
  schemas:
    Task:
      type: object
      properties:
        id:
          type: integer
        title:
          type: string
```

**Posibles mejoras**:
- Agregar un archivo `.spectral.yaml` con reglas custom para TaskFlow que validen: todos los endpoints tienen `operationId`, todos los schemas tienen `description`, los `$ref` no están rotos, los parámetros path tienen `required: true`. Integrarlo en CI/CD con `spectral lint openapi.yaml`.
- Usar `openapi-diff` (o `swagger-diff`) en el pipeline para comparar la spec del PR contra `main` y detectar breaking changes (campos requeridos eliminados, tipos cambiados, endpoints removidos). Bloquear el merge automáticamente si hay breaking changes no documentados.
- Agregar a la documentación de TaskFlow ejemplos de uso de cada herramienta de debugging: cómo ejecutar Spectral localmente, cómo validar la spec con Swagger Editor antes de commitear, y cómo usar Prism para mock server en desarrollo local.

