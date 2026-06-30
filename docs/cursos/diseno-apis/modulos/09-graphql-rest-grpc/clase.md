---
sidebar_label: "Clase"
---

# Módulo 09 — GraphQL vs REST vs gRPC

## 1. GraphQL

Lenguaje de consulta para APIs desarrollado por Facebook (2015). Permite al cliente especificar exactamente qué datos necesita.

### Queries (Consultas)

```graphql
query {
  tasks {
    id
    title
    completed
    user {
      name
      email
    }
  }
}
```

### Mutations (Escritura)

```graphql
mutation {
  createTask(input: { title: "Comprar leche", priority: HIGH }) {
    id
    title
    createdAt
  }
}
```

### Subscriptions (Tiempo real)

```graphql
subscription {
  taskCreated {
    id
    title
    status
  }
}
```

### Schema GraphQL

```graphql
type Task {
  id: ID!
  title: String!
  description: String
  completed: Boolean!
  priority: Priority
  user: User!
  comments: [Comment!]!
  createdAt: DateTime!
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

type User {
  id: ID!
  name: String!
  email: String!
  tasks: [Task!]!
}

type Comment {
  id: ID!
  text: String!
  author: User!
  createdAt: DateTime!
}

type Query {
  tasks(status: TaskStatus): [Task!]!
  task(id: ID!): Task
  users: [User!]!
}

type Mutation {
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  completeTask(id: ID!): Task!
  deleteTask(id: ID!): Boolean!
}

type Subscription {
  taskCreated: Task!
  taskUpdated: Task!
}

input CreateTaskInput {
  title: String!
  description: String
  priority: Priority
}

input UpdateTaskInput {
  title: String
  description: String
  priority: Priority
}
```

### Resolvers y problema N+1

```java
@Component
public class TaskResolver implements GraphQlResolver<Task> {

    public List<Comment> comments(Task task) {
        // ❌ Problema N+1: si hay 10 tasks, esto hace 11 queries
        return commentService.findByTaskId(task.getId());
    }
}

// ✅ Solución con DataLoader (batching)
@Component
public class CommentBatchLoader implements BatchLoader<Long, List<Comment>> {
    @Override
    public CompletableFuture<List<List<Comment>>> load(List<Long> taskIds) {
        return CompletableFuture.supplyAsync(() ->
            commentService.findByTaskIds(taskIds)); // 1 query con WHERE IN
    }
}
```

## 2. gRPC — Google Remote Procedure Call

Basado en **Protocol Buffers** y **HTTP/2**. Alto rendimiento, streaming nativo.

### Definición .proto

```protobuf
syntax = "proto3";

package taskflow;

service TaskService {
  rpc GetTask (GetTaskRequest) returns (Task);
  rpc ListTasks (ListTasksRequest) returns (ListTasksResponse);
  rpc CreateTask (CreateTaskRequest) returns (Task);
  rpc WatchTasks (WatchTasksRequest) returns (stream Task);
}

message Task {
  int64 id = 1;
  string title = 2;
  string description = 3;
  bool completed = 4;
  string priority = 5;
  int64 user_id = 6;
  string created_at = 7;
}

message GetTaskRequest {
  int64 id = 1;
}

message ListTasksRequest {
  int32 page = 1;
  int32 size = 2;
  string status = 3;
}

message ListTasksResponse {
  repeated Task tasks = 1;
  int32 total = 2;
}

message CreateTaskRequest {
  string title = 1;
  string description = 2;
  string priority = 3;
  int64 user_id = 4;
}

message WatchTasksRequest {
  string status = 1;
}
```

### Tipos de Streaming en gRPC

| Tipo | Descripción |
|------|-------------|
| **Unary** | Request → Response (como REST) |
| **Server Streaming** | Request → Stream de responses |
| **Client Streaming** | Stream de requests → Response |
| **Bidirectional Streaming** | Stream ↔ Stream |

## 3. REST vs GraphQL vs gRPC

| Característica | REST | GraphQL | gRPC |
|---------------|------|---------|------|
| **Protocolo** | HTTP/1.1 | HTTP/1.1 (o HTTP/2) | HTTP/2 |
| **Formato** | JSON/XML | JSON | Protocol Buffers (binario) |
| **Over-fetching** | Sí (respuesta fija) | No (cliente selecciona) | No (definido en .proto) |
| **Under-fetching** | Sí (múltiples endpoints) | No | No |
| **Caching** | HTTP caching nativo | Manual (persist) | No nativo |
| **Streaming** | SSE/WebSockets | Subscriptions | Nativo |
| **Tipado** | Débil (JSON) | Fuerte (Schema) | Fuerte (.proto) |
| **Code generation** | OpenAPI Generator | GraphQL Codegen | Protoc |
| **Evolución** | Versionado | Sin versionar | Compatibilidad .proto |
| **Rendimiento** | Medio | Medio | Alto |
| **Madurez** | 20+ años | 10 años | 9 años |
| **Ecosistema** | Muy amplio | Amplio | Creciente |

## 4. ¿Cuándo usar cada uno?

### Usar REST cuando:
- APIs públicas para consumidores generales
- Operaciones simples (CRUD)
- Se necesita caching HTTP
- Equipos pequeños con recursos limitados
- Integración con sistemas legacy

### Usar GraphQL cuando:
- Clientes múltiples con necesidades de datos diversas
- Over-fetching/under-fetching es un problema real
- Equipo frontend necesita iterar rápido
- APIs que evolucionan sin versionar
- Tiempo real con subscriptions

### Usar gRPC cuando:
- Microservicios (comunicación interna)
- Alto rendimiento (payloads grandes, baja latencia)
- Streaming bidireccional
- Dispositivos IoT con recursos limitados
- Políglota (múltiples lenguajes)

## 5. Implementación en Spring Boot

### GraphQL con Spring GraphQL

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-graphql</artifactId>
</dependency>
```

```java
@Controller
public class TaskGraphQLController {

    @QueryMapping
    public List<Task> tasks(@Argument String status) {
        return taskService.findAll(status);
    }

    @QueryMapping
    public Task task(@Argument Long id) {
        return taskService.findById(id).orElse(null);
    }

    @MutationMapping
    public Task createTask(@Argument CreateTaskInput input) {
        return taskService.create(input);
    }

    @SubscriptionMapping
    public Flux<Task> taskCreated() {
        return taskService.taskCreatedPublisher();
    }
}
```

### gRPC con Spring Boot

```xml
<dependency>
    <groupId>net.devh</groupId>
    <artifactId>grpc-server-spring-boot-starter</artifactId>
</dependency>
```

```java
@GrpcService
public class TaskGrpcService extends TaskServiceGrpc.TaskServiceImplBase {

    @Override
    public void getTask(GetTaskRequest request,
            StreamObserver<Task> responseObserver) {
        Task task = taskService.findById(request.getId())
            .map(this::toProto)
            .orElseThrow();
        responseObserver.onNext(task);
        responseObserver.onCompleted();
    }

    @Override
    public void watchTasks(WatchTasksRequest request,
            StreamObserver<Task> responseObserver) {
        // Server streaming
        taskService.taskCreatedPublisher()
            .subscribe(responseObserver::onNext);
    }

    private Task toProto(com.taskflow.model.Task model) {
        return Task.newBuilder()
            .setId(model.getId())
            .setTitle(model.getTitle())
            .setCompleted(model.isCompleted())
            .build();
    }
}
```

## 6. APIs en Tiempo Real

| Tecnología | Dirección | Protocolo | Complejidad |
|------------|-----------|-----------|-------------|
| **WebSockets** | Full-duplex | WS | Media |
| **SSE** | Server → Client | HTTP | Baja |
| **GraphQL Subscriptions** | Server → Client | WS/SSE | Media |
| **gRPC Streaming** | Bidireccional | HTTP/2 | Alta |
