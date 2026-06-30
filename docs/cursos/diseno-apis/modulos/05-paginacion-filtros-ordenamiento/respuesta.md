---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Implementar Offset Pagination

**Solución esperada**:

```java
@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<PageResponse<TaskDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") @Max(100) int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

        Pageable pageable = PageRequest.of(page, size, parseSort(sort));
        Page<TaskDTO> taskPage = taskService.findFiltered(status, priority, pageable);

        return ResponseEntity.ok(PageResponse.from(taskPage));
    }

    private Sort parseSort(String[] sort) {
        List<Sort.Order> orders = new ArrayList<>();
        for (String s : sort) {
            String[] parts = s.split(",");
            String field = parts[0];
            Sort.Direction dir = parts.length > 1
                ? Sort.Direction.fromString(parts[1])
                : Sort.Direction.ASC;
            orders.add(new Sort.Order(dir, field));
        }
        return Sort.by(orders);
    }
}

@Service
public class TaskService {
    public Page<TaskDTO> findFiltered(String status, String priority, Pageable pageable) {
        Specification<Task> spec = Specification.where(null);

        if (status != null) {
            spec = spec.and((root, q, cb) ->
                cb.equal(root.get("status"), TaskStatus.valueOf(status.toUpperCase())));
        }
        if (priority != null) {
            spec = spec.and((root, q, cb) ->
                cb.equal(root.get("priority"), TaskPriority.valueOf(priority.toUpperCase())));
        }

        return taskRepository.findAll(spec, pageable).map(this::toDTO);
    }
}
```

**Posibles mejoras**:
- Validar que los campos de sort solo acepten columnas permitidas (`allowedSortFields = ["id", "title", "createdAt", "dueDate", "priority"]`). Si un cliente envía `sort=password,asc`, el servidor debe rechazar con 400 Bad Request, no exponer información ni lanzar una excepción genérica.
- Agregar `@ExceptionHandler` para `IllegalArgumentException` cuando se envía un valor inválido en `status` o `priority`, devolviendo 422 con Problem Details que indique los valores válidos (ej. `"allowedValues": ["HIGH", "MEDIUM", "LOW"]`).
- Implementar filtros dinámicos sin `Specification` hardcodeado: usar un `FilterParser` genérico que convierta query parameters en especificaciones JPA basándose en metadata de los campos (tipo, operadores soportados). Esto evita tener que escribir un `if` por cada campo y escala a APIs con 50+ campos filtrables.

---

## Ejercicio 4: Cursor Pagination desde Cero

**Solución esperada**:

```java
@RestController
@RequestMapping("/api/v1/tasks")
public class TaskCursorController {

    private final TaskRepository taskRepository;

    @GetMapping("/cursor")
    public ResponseEntity<CursorResponse<TaskDTO>> getWithCursor(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") @Max(100) int limit) {

        Long lastId = decodeCursor(cursor); // null o 0 para primera página
        List<Task> tasks = lastId == null
            ? taskRepository.findFirstByOrderByIdAsc(PageRequest.of(0, limit + 1))
            : taskRepository.findByIdGreaterThanOrderByIdAsc(lastId, PageRequest.of(0, limit + 1));

        boolean hasMore = tasks.size() > limit;
        if (hasMore) {
            tasks = tasks.subList(0, limit);
        }

        Long newLastId = tasks.isEmpty() ? null : tasks.get(tasks.size() - 1).getId();
        String nextCursor = hasMore ? encodeCursor(newLastId) : null;

        List<TaskDTO> data = tasks.stream().map(this::toDTO).toList();

        return ResponseEntity.ok(new CursorResponse<>(data, nextCursor, hasMore, limit));
    }

    private String encodeCursor(Long lastId) {
        return Base64.getUrlEncoder().encodeToString(
            ("{\"lastId\":" + lastId + "}").getBytes());
    }

    private Long decodeCursor(String cursor) {
        if (cursor == null || cursor.isEmpty()) return null;
        String json = new String(Base64.getUrlDecoder().decode(cursor));
        // Extraer lastId del JSON
        return Long.parseLong(json.replaceAll("\\D", ""));
    }
}
```

**¿Cuándo usar cada uno?**

| Criterio | Offset | Cursor |
|----------|--------|--------|
| Saltar a página arbitraria | Sí | No |
| Consistencia con inserciones | No | Sí |
| Rendimiento en grandes datasets | Degrada | Constante |
| Implementación | Simple | Media |
| Scroll infinito | Regular | Excelente |
| UI con números de página | Sí | No |

**Posibles mejoras**:
- Usar `Instant` o timestamp en lugar de ID como cursor cuando se ordena por fecha. Si el orden es `createdAt,desc`, el cursor debería ser el timestamp del último elemento, no el ID. Y si hay timestamps duplicados, combinarlo con ID para garantizar unicidad: `cursor = base64({"createdAt": "2026-06-29T10:00:00Z", "id": 42})`.
- Agregar soporte para cursor bidireccional (previous page): incluir `prevCursor` en la respuesta además de `nextCursor`, permitiendo navegación hacia atrás en el feed, algo que APIs como Slack y Twitter soportan.
- Implementar una versión genérica de `CursorResponse` con un builder y abstraer la lógica de encoding/decoding en un `CursorCodec` reutilizable. Esto permite aplicar cursor pagination a cualquier entidad sin duplicar la lógica de base64 y JSON parsing.

