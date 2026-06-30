---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Manejo de excepciones con @AfterThrowing

Crea un aspecto `ErrorAspect` que:
- Use `@AfterThrowing` para capturar excepciones lanzadas en cualquier método del paquete `com.sasf.servicio`.
- Loguee el stack trace completo y el nombre del método que falló.
- Cuente las excepciones por tipo usando un `Map<Class<?>, Integer>`.

---

## Ejercicio 4: Pointcuts combinados y @Order

Crea dos aspectos que se ejecuten sobre el mismo conjunto de métodos en `com.sasf.servicio`:
1. `SeguridadAspect` con `@Order(1)`: verifica que el usuario tenga permisos (simulado).
2. `LoggingAspect` con `@Order(2)`: loguea la ejecución.

Usa `@Pointcut` reutilizable para definir el punto de corte una sola vez.

---

## Ejercicio 5: Interceptor de parámetros con @Around

Crea un aspecto `ParametroAspect` que:
- Use `@Around` en cualquier método anotado con `@ValidarParametros`.
- Verifique que ningún parámetro String sea nulo o vacío.
- Si encuentra un parámetro inválido, lance `IllegalArgumentException` con un mensaje descriptivo.
- Crea la anotación personalizada `@ValidarParametros`.
