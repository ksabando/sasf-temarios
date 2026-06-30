---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Diseñar Respuestas de Error

**Solución esperada**:

**a) Validación — título requerido:**
```json
{
  "type": "https://api.taskflow.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "The 'title' field is required and must not be blank",
  "instance": "/api/v1/tasks"
}
```

**b) Recurso no encontrado:**
```json
{
  "type": "https://api.taskflow.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Task with id 999 was not found",
  "instance": "/api/v1/tasks/999"
}
```

**c) Sin permisos para eliminar tarea de otro usuario:**
```json
{
  "type": "https://api.taskflow.com/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "You do not have permission to delete tasks assigned to other users",
  "instance": "/api/v1/tasks/123"
}
```

**Posibles mejoras**:
- Agregar un campo `errors` (extensión de RFC 9457) para errores de validación múltiple con detalle campo por campo: `"errors": [{"field": "title", "message": "must not be blank"}, {"field": "dueDate", "message": "must be in the future"}]`. Esto permite que los clientes muestren errores inline en formularios.
- Usar URIs reales y resolvibles para `type` en lugar de paths relativos. Una buena práctica es que `GET https://api.taskflow.com/errors/validation-error` devuelva documentación HTML sobre ese tipo de error, ayudando al desarrollador que depura.
- Agregar un cuarto caso (d) para `500 Internal Server Error` con un `type` genérico y un `detail` que NO exponga detalles internos (stack traces, queries SQL) por seguridad, pero que incluya un `traceId` para correlación con logs del servidor.

---

## Ejercicio 4: Controlador Category con Spring Boot

**Solución esperada**:

```java
@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategory(@PathVariable Long id) {
        return categoryService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        Category created = categoryService.create(category);
        URI location = URI.create("/api/v1/categories/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @Valid @RequestBody Category category) {
        if (categoryService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        category.setId(id);
        return ResponseEntity.ok(categoryService.save(category));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Category> partialUpdate(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return categoryService.findById(id)
            .map(existing -> {
                // Aplicar actualizaciones parciales
                if (updates.containsKey("name")) {
                    existing.setName((String) updates.get("name"));
                }
                if (updates.containsKey("description")) {
                    existing.setDescription((String) updates.get("description"));
                }
                return ResponseEntity.ok(categoryService.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        if (categoryService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        categoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
```

**Posibles mejoras**:
- Extraer la lógica de PATCH a un método en el servicio (`categoryService.patch(id, updates)`) para no tener lógica de negocios en el controlador. El controlador debería ser solo una capa de traducción HTTP, delegando toda la lógica al servicio.
- Agregar manejo global de excepciones con `@ControllerAdvice`: en lugar de verificar `findById(id).isEmpty()` en cada método, lanzar `CategoryNotFoundException` desde el servicio y manejarla en un advice que retorne `404 Not Found` con Problem Details. Esto reduce duplicación y centraliza el formato de errores.
- Usar DTOs en lugar de exponer la entidad `Category` directamente. El método `createCategory` debería recibir `CategoryRequest` (sin ID) y devolver `CategoryResponse` (con campos calculados, links HATEOAS, etc.). Esto evita exponer la estructura de la base de datos y problemas de serialización JPA.

