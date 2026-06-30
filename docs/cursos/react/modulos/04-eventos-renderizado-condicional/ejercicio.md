---
sidebar_label: "Ejercicio"
---

### Ejercicio 2: Botón "Completar"

En cada tarea renderizada, agregar un botón "Completar" que ejecute `toggleTask(id)`. El texto del botón debe cambiar según el estado: "Completar" si está pendiente, "Reabrir" si está completada.

---

### Ejercicio 3: Botón "Eliminar" con confirmación

En cada tarea, agregar un botón "Eliminar" que muestre un `window.confirm('¿Eliminar tarea?')` antes de llamar a `deleteTask(id)`.

---

### Ejercicio 4: Badge condicional

Crear un componente `Badge` que muestre "Pendiente" en rojo o "Completada" en verde según `task.completed`. Usar renderizado condicional con ternario.

---

### Ejercicio 5: Filtros "Todas" | "Pendientes" | "Completadas"

Agregar tres botones de filtro arriba de la lista. Solo mostrar las tareas que correspondan al filtro activo.

---

### Ejercicio 6: Mensaje "No hay tareas"

Cuando la lista filtrada esté vacía, mostrar el mensaje "No hay tareas pendientes" (o "No hay tareas completadas" según el filtro activo).
