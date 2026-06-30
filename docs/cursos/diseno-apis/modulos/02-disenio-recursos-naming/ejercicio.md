---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Anidación y Relaciones

Dado el siguiente modelo de datos, diseña los endpoints:

- **Project** tiene muchos **Tasks**
- **Task** tiene muchos **Comments**
- **Task** pertenece a un **User** (asignado)
- **Task** tiene una **Category**
- **Task** puede tener muchas **Tags**

Define:
1. Endpoint para obtener todas las tareas de un proyecto
2. Endpoint para obtener los comentarios de una tarea específica
3. Endpoint para cambiar la categoría de una tarea
4. Endpoint para listar todas las tareas de un usuario en un proyecto

---

## Ejercicio 4: Sparse Fieldsets

Dado el siguiente recurso Task completo:
```json
{
  "id": 1,
  "title": "Comprar leche",
  "description": "Ir al supermercado y comprar leche deslactosada",
  "completed": false,
  "priority": "high",
  "createdAt": "2026-06-01T10:00:00",
  "updatedAt": "2026-06-01T14:30:00",
  "userId": 42,
  "categoryId": 3,
  "tags": ["compras", "urgente"],
  "dueDate": "2026-06-05"
}
```

1. Escribe la URL para obtener solo `id`, `title` y `completed`
2. Escribe la URL para obtener solo `title`, `dueDate` y `tags`
3. ¿Qué ventaja tiene usar sparse fieldsets en una API pública?
