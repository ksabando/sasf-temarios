---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Diseño de Recursos

Para la aplicación **TaskFlow**, identifica al menos 5 recursos potenciales. Para cada uno, define:
- Nombre del recurso
- Endpoint base (colección)
- Endpoint para un recurso específico
- ¿Qué representa?

| Recurso | Endpoint Colección | Endpoint Específico | Descripción |
|---------|-------------------|-------------------|-------------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

---

## Ejercicio 4: Setup Spring Boot

Escribe los pasos necesarios para:

1. Crear un proyecto Spring Boot con las dependencias web, jpa y h2
2. Crear la clase `Task` con los campos: id (Long), title (String), description (String), completed (boolean), createdAt (LocalDateTime)
3. Crear un endpoint `GET /api/tasks` que retorne una lista hardcodeada de 3 tareas
4. Explica brevemente qué hace la anotación `@RestController` y `@RequestMapping`
