---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Definición .proto para gRPC

**Solución esperada**:

```protobuf
syntax = "proto3";

package taskflow;

import "google/protobuf/timestamp.proto";

service TaskService {
  rpc CreateTask (CreateTaskRequest) returns (Task);
}

message CreateTaskRequest {
  string title = 1;
  string description = 2;
  Priority priority = 3;
  google.protobuf.Timestamp due_date = 4;
  int64 assignee_id = 5;
  repeated string tags = 6;
}

message Task {
  int64 id = 1;
  string title = 2;
  string description = 3;
  Priority priority = 4;
  TaskStatus status = 5;
  google.protobuf.Timestamp due_date = 6;
  User assignee = 7;
  repeated string tags = 8;
  google.protobuf.Timestamp created_at = 9;
}

message User {
  int64 id = 1;
  string name = 2;
}

enum Priority {
  PRIORITY_UNSPECIFIED = 0;
  LOW = 1;
  MEDIUM = 2;
  HIGH = 3;
  CRITICAL = 4;
}

enum TaskStatus {
  TASK_STATUS_UNSPECIFIED = 0;
  PENDING = 1;
  IN_PROGRESS = 2;
  COMPLETED = 3;
  CANCELLED = 4;
}
```

**Ventajas de protobuf sobre JSON:**
- Serialización binaria (~10x más rápido)
- Tamaño ~3-5x más pequeño que JSON
- Tipado fuerte (no hay strings mágicos)
- Generación de código automática para múltiples lenguajes
- Versionado integrado (field numbers, no nombres)

**Posibles mejoras**:
- Agregar más métodos RPC al servicio para completar TaskFlow: `GetTask`, `ListTasks` (con filtros), `UpdateTask`, `DeleteTask`, `StreamTaskUpdates` (server streaming de notificaciones). Esto demuestra cómo un servicio gRPC completo expresa naturalmente todas las operaciones de dominio.
- Usar `oneof` para modelar respuestas polimórficas: `oneof result { Task task = 1; Error error = 2; }` en la respuesta de CreateTask. Esto permite manejar errores de negocio a nivel de protobuf en lugar de usar códigos HTTP, ya que gRPC usa sus propios status codes (OK, INVALID_ARGUMENT, NOT_FOUND, etc.).
- Agregar `reserved` fields: `reserved 10, 11;` para prevenir que futuros desarrolladores reutilicen números de campo que fueron eliminados, protegiendo la compatibilidad hacia atrás. Y `reserved "old_field_name";` para prevenir reuso de nombres. Esto es crítico en protobuf porque el versionado depende de field numbers, no de nombres.

---

## Ejercicio 4: Cuándo usar cada tecnología

**Solución esperada**:

| Escenario | Tecnología | Justificación |
|-----------|-----------|---------------|
| API pública para desarrolladores externos | **REST** | Caching HTTP, madurez, ecosistema amplio, fácil de consumir |
| Comunicación entre 20 microservicios | **gRPC** | Alto rendimiento, streaming, tipado fuerte, HTTP/2 |
| Dashboard con datos de múltiples fuentes | **GraphQL** | El frontend necesita datos de varias fuentes en un solo request |
| Aplicación IoT con sensores | **gRPC** | Payloads pequeños, binario, streaming bidireccional, eficiente |
| Feed de redes sociales en tiempo real | **GraphQL + Subscriptions** | Suscripciones para tiempo real, queries flexibles |
| API para app móvil con conexión lenta | **GraphQL** | Un solo request, datos exactos (reduce payload y requests) |
| Sistema bancario legacy | **REST** | Madurez, estabilidad, herramientas de integración establecidas |
| Chat en tiempo real | **gRPC (bidirectional streaming)** | Streaming bidireccional nativo, baja latencia, HTTP/2 |
| API interna equipo pequeño | **REST** | Simple, conocido, bajo overhead de aprendizaje |
| Streaming de logs en tiempo real | **gRPC (server streaming)** | Streaming eficiente de datos secuenciales |

**Posibles mejoras**:
- Agregar una nota sobre WebSockets como alternativa a gRPC para chat en tiempo real en navegadores: gRPC-web no soporta bidirectional streaming nativo. Si el cliente es un navegador, WebSockets + STOMP o Socket.io puede ser más práctico que gRPC, o usar GraphQL Subscriptions sobre WebSockets.
- Incluir el escenario "BFF (Backend For Frontend)" donde se usa GraphQL como capa de agregación que consume múltiples gRPC/REST internos y expone una API unificada al frontend. Esta arquitectura híbrida es común en empresas como Netflix.
- Agregar una columna "Contraindicaciones" por tecnología: REST no es ideal para datos altamente interconectados con acceso variable; GraphQL no es ideal para APIs simples CRUD con caching intensivo; gRPC no es ideal para APIs públicas consumidas desde navegadores sin gRPC-web.

