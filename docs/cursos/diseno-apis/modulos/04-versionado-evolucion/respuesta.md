---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Diseñar Estrategia de Migración

**Solución esperada**:

**Plan de Migración:**

1. **Timeline:**
   - **Día 0:** Lanzar v2 en paralelo con v1
   - **Mes 3:** Anunciar deprecation de v1 oficialmente
   - **Mes 6:** Sunset de v1 (eliminar soporte)

2. **Headers de deprecation en v1 (desde mes 3):**
   ```http
   Deprecation: true
   Sunset: Sat, 31 Dec 2026 23:59:59 GMT
   ```

3. **Coexistencia:**
   ```
   /api/v1/tasks → controladorV1 → convierte v2→v1
   /api/v2/tasks → controladorV2 → servicio normal
   ```
   Ambos comparten la misma base de datos.

4. **Notificación a clientes:**
   - Email a todos los clientes registrados
   - Documentación actualizada con guía de migración
   - Webhook de deprecation

5. **Verificación de migración:**
   - Monitorear tráfico de v1 vs v2 en dashboards
   - Configurar alerta cuando v1 baje a 0 requests
   - Contactar clientes que aún usan v1 después de mes 5

**Posibles mejoras**:
- Agregar una sexta fase: "post-mortem" después del sunset, analizando qué salió bien/mal, documentando lecciones aprendidas y midiendo cuánto tiempo tomó la migración completa para planificar mejor la próxima.
- Discutir el uso de feature flags para controlar la disponibilidad de v1/v2 sin deploy: un toggle `v2.enabled=true` permite lanzar v2 gradualmente y hacer rollback instantáneo si se detectan problemas, sin esperar un nuevo deploy.
- Agregar un plan de contingencia: ¿qué hacer si en el mes 5 todavía hay clientes críticos en v1 que no pueden migrar por razones legítimas? Definir un proceso de excepción con deadline extendido y comunicación directa, en lugar de eliminarla a ciegas.

---

## Ejercicio 4: Versionado por Header

**Solución esperada**:

```java
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping(produces = "application/vnd.taskflow.v1+json")
    public ResponseEntity<List<TaskV1>> getAllV1() {
        return ResponseEntity.ok(taskService.findAllV1());
    }

    @GetMapping(produces = "application/vnd.taskflow.v2+json")
    public ResponseEntity<List<TaskV2>> getAllV2() {
        return ResponseEntity.ok(taskService.findAllV2());
    }

    @GetMapping(value = "/{id}", produces = "application/vnd.taskflow.v1+json")
    public ResponseEntity<TaskV1> getByIdV1(@PathVariable Long id) {
        return taskService.findByIdV1(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/{id}", produces = "application/vnd.taskflow.v2+json")
    public ResponseEntity<TaskV2> getByIdV2(@PathVariable Long id) {
        return taskService.findByIdV2(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
```

**TaskV1 (formato antiguo):**
```json
{ "id": 1, "name": "Comprar leche", "done": false }
```

**TaskV2 (formato nuevo):**
```json
{ "id": 1, "title": "Comprar leche", "completed": false }
```

La configuración de content negotiation en Spring Boot requiere mapear los media types:

```yaml
# application.yml
spring:
  mvc:
    contentnegotiation:
      media-types:
        v1: application/vnd.taskflow.v1+json
        v2: application/vnd.taskflow.v2+json
```

**Posibles mejoras**:
- Agregar el header `Vary: Accept` en todas las respuestas para que los proxies y CDNs sepan que la respuesta varía según el header Accept, evitando que un cliente reciba la versión cacheada incorrecta. Spring Boot no agrega esto automáticamente con `produces`; debe configurarse.
- Manejar el caso sin media type: si el cliente no envía el header `Accept`, ¿qué versión se devuelve? Debe definirse explícitamente — típicamente la última estable (v2), pero debe estar documentado. Implementar con un método sin `produces` que sirva como default.
- Simplificar el controlador usando delegación: en lugar de duplicar cada endpoint para v1 y v2, tener un método que evalúe el header `Accept` y delegue al mapper correspondiente, o mejor aún, implementar un `HttpMessageConverter` personalizado que maneje la versión a nivel de infraestructura.

