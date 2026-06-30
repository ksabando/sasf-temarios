---
sidebar_label: "Clase"
---

## Resumen

- Bean Validation con `@NotBlank`, `@Size`, etc. valida campos de DTOs
- `@Valid` activa la validación en los controladores
- `@ControllerAdvice` + `@ExceptionHandler` maneja errores globalmente
- RFC 9457 Problem Details estandariza las respuestas de error
- Excepciones personalizadas (`ResourceNotFoundException`, `BadRequestException`) mejoran la legibilidad del código
