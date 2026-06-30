---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Método derivado

Escribe un test para `findByTitleContaining` que:
- Use `@Sql` para precargar datos
- Busque tareas que contengan "Fix"
- Verifique con AssertJ que la lista NO esté vacía
- Confirme que el título de la primera tarea sea "Fix login bug"

---

## Ejercicio 4: TestContainers

Configura un test que use TestContainers con PostgreSQL para probar `TaskRepository`. Explica qué dependencias se necesitan y cómo se configura el contenedor.

---

## Ejercicio 5: AssertJ avanzado

Escribe un test que use `@Sql` y verifique con AssertJ:
- Que las tareas devueltas tengan usuarios asignados (campo `user` no nulo)
- Que al extraer `title` y `status`, los tuples contengan valores específicos
