---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Patch para completar tarea

Agrega un endpoint `PATCH /api/tasks/{id}/complete` que marque una tarea como completada (cambie `completed` a `true`) y devuelva la tarea actualizada. Usa `@PatchMapping`.

---

## Ejercicio 4: Headers personalizados

Modifica el endpoint `POST /api/tasks` para que, además de devolver la tarea creada con status 201, incluya un header `Location` con la URL del recurso creado (`/api/tasks/{id}`).

---

## Ejercicio 5: Content negotiation con XML

Configura el controlador para que pueda producir tanto JSON como XML. Agrega la dependencia `jackson-dataformat-xml` y modifica el `@GetMapping` para soportar `produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE}`. Prueba con el header `Accept: application/xml`.
