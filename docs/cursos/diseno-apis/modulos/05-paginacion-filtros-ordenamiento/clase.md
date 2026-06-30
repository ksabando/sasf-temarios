---
sidebar_label: "Clase"
---

# Módulo 05 — Paginación, Filtros y Ordenamiento

## 1. Paginación

### ¿Por qué paginar?
- Evitar respuestas masivas que consumen mucha memoria y ancho de banda
- Mejorar tiempos de respuesta
- Mejorar experiencia de usuario en frontend

### Offset Pagination

```
GET /api/v1/tasks?page=0&size=10
GET /api/v1/tasks?page=1&size=10
GET /api/v1/tasks?page=2&size=10
```

**Parámetros:**
- `page`: índice basado en 0 de la página
- `size`: número de elementos por página (default: 20, max: 100)

**Ventajas:** Simple, permite saltar a cualquier página
**Desventajas:** Inconsistente con inserciones/eliminaciones concurrentes

**Problema de offset:**
```
Página 1: tasks 1-10
Usuario inserta task nueva → se desplaza
Página 2: usuario ve task 9-18 (se salta tasks que ya vió o ve duplicados)
```

### Cursor Pagination (Keyset)

```
GET /api/v1/tasks?cursor=eyJsYXN0SWQiOjEwfQ==&limit=10
GET /api/v1/tasks?cursor=eyJsYXN0SWQiOjIwfQ==&limit=10
```

**Parámetros:**
- `cursor`: token opaco que indica la posición actual
- `limit`: elementos por página

**Ventajas:** Consistente aunque haya inserciones concurrentes, mejor rendimiento en grandes datasets
**Desventajas:** No permite saltar a páginas arbitrarias

**Implementación:**
```java
public Page<Task> findByCursor(String cursor, int limit) {
    Long lastId = decodeCursor(cursor); // 0 si es primera página
    return taskRepository.findByIdGreaterThan(lastId, PageRequest.of(0, limit));
}
```

### Meta en Respuesta

Offset pagination:
```json
{
  "data": [...],
  "page": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10
}
```

Cursor pagination:
```json
{
  "data": [...],
  "nextCursor": "eyJsYXN0SWQiOjIwfQ==",
  "hasMore": true,
  "limit": 10
}
```

## 2. Filtros

### Filtros Exactos
```
GET /api/v1/tasks?status=completed
GET /api/v1/tasks?priority=high
GET /api/v1/tasks?completed=true&priority=high
```

### Filtros con Operadores
```
GET /api/v1/tasks?age=gte:18
GET /api/v1/tasks?createdAt=gt:2026-01-01
GET /api/v1/tasks?createdAt=lt:2026-06-30
```

**Operadores comunes:**
- `eq` — equal
- `gt` — greater than
- `gte` — greater than or equal
- `lt` — less than
- `lte` — less than or equal
- `ne` — not equal

### Búsqueda de Texto
```
GET /api/v1/tasks?q=comprar+leche
GET /api/v1/tasks/search?q=urgente
```

### Múltiples Valores (OR)
```
GET /api/v1/tasks?tag=java&tag=spring
GET /api/v1/tasks?status=open&status=in-progress
```

## 3. Ordenamiento

```
GET /api/v1/tasks?sort=createdAt,desc
GET /api/v1/tasks?sort=priority,asc&sort=createdAt,desc
```

**Formato:** `sort={campo},{dirección}`
- `asc` — ascendente
- `desc` — descendente

**Orden múltiple:** por precedencia (primer campo tiene prioridad)

## 4. Combinación

```
GET /api/v1/tasks?page=0&size=10&sort=createdAt,desc&status=completed&priority=high&q=urgente
```

## 5. Links de Navegación (Pre-HATEOAS)

```json
{
  "data": [...],
  "page": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10,
  "_links": {
    "first": { "href": "/api/v1/tasks?page=0&size=10" },
    "prev": { "href": null },
    "next": { "href": "/api/v1/tasks?page=1&size=10" },
    "last": { "href": "/api/v1/tasks?page=9&size=10" }
  }
}
```

## 6. Implementación en Spring Boot

```java
@GetMapping
public ResponseEntity<PageResponse<Task>> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt,desc") String[] sort,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String priority,
        @RequestParam(required = false) String q) {

    Pageable pageable = PageRequest.of(page, size, Sort.by(parseSort(sort)));
    Page<Task> taskPage = taskService.findAll(status, priority, q, pageable);

    return ResponseEntity.ok(PageResponse.from(taskPage));
}
```

**PageResponse DTO:**
```java
public class PageResponse<T> {
    private List<T> data;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public static <T> PageResponse<T> from(Page<T> page) {
        PageResponse<T> response = new PageResponse<>();
        response.data = page.getContent();
        response.page = page.getNumber();
        response.size = page.getSize();
        response.totalElements = page.getTotalElements();
        response.totalPages = page.getTotalPages();
        return response;
    }
}
```

### Especificaciones JPA para Filtros Dinámicos

```java
@GetMapping
public ResponseEntity<Page<Task>> getFilteredTasks(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String priority,
        @RequestParam(required = false) String q,
        Pageable pageable) {

    Specification<Task> spec = Specification.where(null);

    if (status != null) {
        spec = spec.and((root, query, cb) ->
            cb.equal(root.get("status"), Status.valueOf(status.toUpperCase())));
    }
    if (q != null) {
        spec = spec.and((root, query, cb) ->
            cb.like(cb.lower(root.get("title")), "%" + q.toLowerCase() + "%"));
    }

    return ResponseEntity.ok(taskRepository.findAll(spec, pageable));
}
```
