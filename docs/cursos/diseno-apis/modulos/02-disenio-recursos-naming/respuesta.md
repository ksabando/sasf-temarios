---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Anidación y Relaciones

**Solución esperada**:

1. **Tareas de un proyecto:** `GET /api/v1/projects/{projectId}/tasks`
2. **Comentarios de una tarea:** `GET /api/v1/tasks/{taskId}/comments`
3. **Cambiar categoría:** `PATCH /api/v1/tasks/{taskId}` con body `{ "categoryId": 5 }` o `POST /api/v1/tasks/{taskId}/categorize`
4. **Tareas de un usuario en un proyecto:** `GET /api/v1/projects/{projectId}/tasks?userId={userId}` o `GET /api/v1/users/{userId}/projects/{projectId}/tasks`

**Posibles mejoras**:
- Para el caso 4, recomendar explícitamente `GET /api/v1/tasks?projectId=X&userId=Y` como la opción más plana y mantenible. Las URLs triplemente anidadas (`/users/{userId}/projects/{projectId}/tasks`) son frágiles y difíciles de cachear.
- Para el caso 3, argumentar a favor de `PATCH /api/v1/tasks/{taskId}` con body `{"categoryId": 5}` como la opción canónica: cambiar la categoría es modificar una propiedad del recurso, no crear una sub-entidad. `POST /tasks/{id}/categorize` solo se justifica si el cambio de categoría dispara lógica de negocio compleja (notificaciones, permisos, auditoría) que excede un simple PATCH.
- Agregar un caso 5 sobre cómo modelar la relación inversa: "Obtener todas las tareas de una categoría" → `GET /api/v1/categories/{categoryId}/tasks` o `GET /api/v1/tasks?categoryId=X`. Discutir pros y contras de cada enfoque.

---

## Ejercicio 4: Sparse Fieldsets

**Solución esperada**:

1. `GET /api/v1/tasks/1?fields=id,title,completed`
2. `GET /api/v1/tasks/1?fields=title,dueDate,tags`
3. **Ventajas de sparse fieldsets:**
   - Reduce el tamaño de la respuesta (menos ancho de banda)
   - Mejora el tiempo de respuesta
   - El cliente controla exactamente qué datos recibe
   - Útil para clientes móviles con conexiones lentas
   - Simplifica el procesamiento en el cliente al recibir solo lo necesario
   - Facilita la evolución de la API (se pueden añadir campos sin afectar clientes existentes)

**Posibles mejoras**:
- Implementar una solución en el backend con Spring Boot: usar `@RequestParam` para capturar el parámetro `fields`, parsearlo en un `Set<String>`, y usarlo en la capa de servicio para construir selectivamente la respuesta (ej. con Jackson `@JsonView` o `MappingJacksonValue` con `SimpleBeanPropertyFilter`).
- Extender el soporte a recursos relacionados con la sintaxis de JSON:API: `GET /api/v1/tasks/1?fields[task]=id,title&fields[user]=name,email` para controlar los campos de la tarea y del usuario embebido por separado.
- Considerar la seguridad: sparse fieldsets pueden exponer información si el servidor no valida que el usuario tiene permiso para ver los campos solicitados. Agregar una capa de filtrado que solo devuelva campos autorizados según el rol, independientemente de lo que pida el parámetro `fields`.

