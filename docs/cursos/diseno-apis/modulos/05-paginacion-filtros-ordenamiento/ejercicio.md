---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Implementar Offset Pagination

Escribe el código Spring Boot para implementar offset pagination en `GET /api/v1/tasks` que:

1. Acepte parámetros `page` (default 0) y `size` (default 20, max 100)
2. Acepte filtros: `status` (enum: PENDING, IN_PROGRESS, COMPLETED), `priority` (enum: LOW, MEDIUM, HIGH)
3. Acepte ordenamiento: `sort` (formato: campo,direccion)
4. Retorne `PageResponse<TaskDTO>` con data, page, size, totalElements, totalPages

---

## Ejercicio 4: Cursor Pagination desde Cero

Implementa cursor pagination para un endpoint `GET /api/v1/tasks`:

1. Crea un mecanismo para codificar/decodificar el cursor (base64 del lastId)
2. Implementa el endpoint que acepte `cursor` (opcional) y `limit` (default 20)
3. Retorna `CursorResponse<TaskDTO>` con data, nextCursor, hasMore
4. Explica cuándo es mejor usar cursor vs offset pagination
