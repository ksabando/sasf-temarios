---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Diseñar Respuestas de Error

Diseña la respuesta de error (Problem Details RFC 9457) para:

**a)** Cuando un cliente intenta crear una tarea sin título (campo requerido).
**b)** Cuando un cliente intenta acceder a un recurso que no existe.
**c)** Cuando un cliente autenticado intenta eliminar la tarea de otro usuario.

Para cada caso, incluye: type, title, status, detail, instance.

---

## Ejercicio 4: Implementar Controlador

Escribe el controlador Spring Boot completo para `Category` con los siguientes requisitos:

- GET /api/v1/categories — listar todas
- GET /api/v1/categories/{id} — obtener por ID
- POST /api/v1/categories — crear (retornar 201 + Location)
- PUT /api/v1/categories/{id} — reemplazar
- PATCH /api/v1/categories/{id} — actualización parcial
- DELETE /api/v1/categories/{id} — eliminar (retornar 204)

Incluye validación básica y manejo de 404.
