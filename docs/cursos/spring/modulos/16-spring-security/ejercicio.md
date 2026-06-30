---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Protección por roles

Usando `@PreAuthorize`, protege los métodos de `TaskController`:
- `getAllTasks()`: cualquier usuario autenticado
- `createTask()`: solo ADMIN
- `deleteTask()`: solo ADMIN

---

## Ejercicio 4: CORS

Configura CORS para permitir peticiones desde `http://localhost:3000` y `http://localhost:5173`. Explica qué métodos HTTP y headers se deben permitir.

---

## Ejercicio 5: In-Memory user

Agrega un bean `InMemoryUserDetailsManager` con un usuario admin y otro user para pruebas. El admin tiene rol ADMIN y el user rol USER.
