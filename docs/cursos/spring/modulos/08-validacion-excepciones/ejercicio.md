---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Validación en grupo

Implementa validación por grupos: al crear una tarea, `title` es obligatorio; al actualizar, `title` es opcional (si se envía, debe cumplir las reglas). Usa grupos de validación de Jakarta (`@Validated`).

---

## Ejercicio 4: Campos opcionales con validación condicional

Crea un DTO `TaskPartialUpdateRequest` para usar con `PATCH /api/tasks/{id}`. Todos los campos deben ser opcionales, pero si se envían, deben cumplir las reglas de validación.

---

## Ejercicio 5: Logging de errores

Agrega logging (SLF4J) al `GlobalExceptionHandler` para registrar todas las excepciones con nivel ERROR antes de devolver la respuesta. Incluye el stack trace.
