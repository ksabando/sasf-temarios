---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Definición .proto para gRPC

Convierte el siguiente recurso REST a una definición Protocol Buffers:

**REST Endpoint:** `POST /api/v1/tasks` con body:
```json
{
  "title": "Comprar leche",
  "description": "Ir al supermercado",
  "priority": "HIGH",
  "dueDate": "2026-06-30T18:00:00",
  "assigneeId": 42,
  "tags": ["compras", "urgente"]
}
```

**REST Response:** `201 Created` con body:
```json
{
  "id": 1,
  "title": "Comprar leche",
  "description": "Ir al supermercado",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-06-30T18:00:00",
  "assignee": { "id": 42, "name": "Juan" },
  "tags": ["compras", "urgente"],
  "createdAt": "2026-06-26T10:00:00"
}
```

1. Define el message CreateTaskRequest y Task en .proto
2. Define el RPC CreateTask en el servicio TaskService
3. ¿Qué ventajas tiene usar protobuf sobre JSON en este caso?

---

## Ejercicio 4: Cuándo usar cada tecnología

Para cada escenario, selecciona la tecnología más adecuada (REST, GraphQL, gRPC) y justifica:

| Escenario | Tecnología | Justificación |
|-----------|-----------|---------------|
| API pública para desarrolladores externos | | |
| Comunicación entre 20 microservicios | | |
| Dashboard con datos de múltiples fuentes | | |
| Aplicación IoT con sensores enviando datos | | |
| Feed de redes sociales en tiempo real | | |
| API para una app móvil con conexión lenta | | |
| Sistema bancario legacy | | |
| Chat en tiempo real con muchos usuarios | | |
| API interna para equipo de 3 personas | | |
| Streaming de logs en tiempo real | | |
