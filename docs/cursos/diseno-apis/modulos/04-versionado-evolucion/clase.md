---
sidebar_label: "Clase"
---

# Módulo 04 — Versionado y Evolución de APIs

## 1. ¿Por qué versionar?

Las APIs evolucionan. Necesitamos cambiar la API sin romper a los clientes existentes.

**Razones principales:**
- Garantizar **backward compatibility** (compatibilidad hacia atrás)
- Permitir cambios sin romper clientes existentes
- Comunicar claramente qué versión está usando cada cliente
- Facilitar migraciones graduales

## 2. Breaking Changes vs Non-Breaking Changes

### Breaking Changes (requieren nueva versión)
| Cambio | Ejemplo |
|--------|---------|
| Eliminar un campo | Eliminar `description` de Task |
| Renombrar un campo | `taskName` → `title` |
| Cambiar tipo de campo | `completed` de boolean a String |
| Eliminar un endpoint | Eliminar `DELETE /tasks/{id}` |
| Cambiar comportamiento | `GET /tasks` ya no retorna tasks completadas |
| Hacer campo requerido | `description` pasa de opcional a obligatorio |
| Cambiar URL | `/api/tasks` → `/api/items` |

### Non-Breaking Changes (no requieren nueva versión)
| Cambio | Ejemplo |
|--------|---------|
| Añadir campo opcional | Nuevo campo `tags` en Task |
| Añadir nuevo endpoint | Nuevo `POST /tasks/export` |
| Cambiar orden de campos | Orden alfabético en JSON response |
| Añadir error message | Mejorar mensaje de error |
| Añadir link HATEOAS | Nuevo link en `_links` |

## 3. Estrategias de Versionado

### URL Path (más común)
```
/api/v1/tasks
/api/v2/tasks
```
**Ventajas:** Visible, fácil de cachear, fácil de routear
**Desventajas:** Menos RESTful (el recurso cambia de URL)

### Header (más RESTful)
```
Accept: application/vnd.taskflow.v1+json
Accept: application/vnd.taskflow.v2+json
```
**Ventajas:** RESTful, URL limpia
**Desventajas:** Menos visible, más difícil de debuggear

### Query Param (simple)
```
/api/tasks?v=1
/api/tasks?v=2
```
**Ventajas:** Simple de implementar
**Desventajas:** Contamina la URL, difícil de cachear

## 4. Semantic Versioning for APIs

```
MAJOR.MINOR.PATCH
   │      │      └── Bug fixes, cambios internos (compatibles)
   │      └───────── New features, backward compatible
   └──────────────── Breaking changes
```

**Ejemplo con TaskFlow API:**
- `v1.0.0` → Versión inicial
- `v1.1.0` → Nuevo endpoint `POST /tasks/export` (backward compatible)
- `v2.0.0` → `completed` cambia de boolean a String con timestamps

## 5. Deprecation Policy

**Proceso recomendado:**
1. Anunciar deprecation con 6 meses de anticipación
2. Documentar fecha de sunset
3. Agregar headers de deprecation en respuestas
4. Mantener la versión antigua funcionando durante la transición

**Headers de deprecation:**
```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 31 Dec 2026 23:59:59 GMT
```

## 6. Implementación en Spring Boot

### Versionado por URL Path

```java
// V1 Controller
@RestController
@RequestMapping("/api/v1/tasks")
public class TaskControllerV1 {
    @GetMapping
    public List<TaskV1> getAll() { ... }
}

// V2 Controller
@RestController
@RequestMapping("/api/v2/tasks")
public class TaskControllerV2 {
    @GetMapping
    public List<TaskV2> getAll() { ... }
}
```

### Versionado por Header (Content Negotiation)

```java
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @GetMapping(produces = "application/vnd.taskflow.v1+json")
    public List<TaskV1> getAllV1() { ... }

    @GetMapping(produces = "application/vnd.taskflow.v2+json")
    public List<TaskV2> getAllV2() { ... }
}
```

## 7. Coexistencia de Versiones

```
/api/v1/tasks → controladorV1 → servicioV1 → repositorio
/api/v2/tasks → controladorV2 → servicioV2 → repositorio
```

Ambas versiones pueden compartir la misma base de datos o tener tablas separadas.

## 8. Changelog

```markdown
# CHANGELOG

## v2.0.0 (2026-12-01)
### Breaking Changes
- `completed` field changed from boolean to string (ISO 8601 timestamp)
- Renamed `taskName` to `title`

### New Features
- Added `POST /tasks/export` for bulk export
- Added pagination with cursor-based navigation

## v1.1.0 (2026-09-15)
### Added
- `tags` field (optional array of strings)
- `GET /tasks/search` endpoint

## v1.0.0 (2026-06-01)
### Initial Release
- CRUD for tasks and users
- Basic pagination (offset-based)
```

## 9. Evolución sin Versionar

**Postel's Law (Principio de Robustez):**
> "Be conservative in what you send, be liberal in what you accept"

- Los clientes deben ignorar campos desconocidos en la respuesta
- El servidor debe ignorar campos extras en la request (si no rompen validación)
- Usar sparse fieldsets para controlar la visibilidad

## 10. Mejores Prácticas

1. **Versionar desde el día 1** aunque solo tengas una versión
2. **Documentar las versiones** en la especificación OpenAPI
3. **Mantener changelog** detallado por versión
4. **Comunicar deprecations** con anticipación
5. **Soportar versiones anteriores** al menos 6 meses
6. **Usar URL path** para APIs públicas (más claro)
7. **Estrategia de migración** documentada para cada breaking change
