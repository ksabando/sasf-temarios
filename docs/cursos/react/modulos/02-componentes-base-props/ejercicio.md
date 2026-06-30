---
sidebar_label: "Ejercicio"
---

### Ejercicio 2: Input con forwardRef

Crear `src/components/ui/Input.tsx` que:
- Use `React.forwardRef` para reenviar la ref al `<input>` nativo
- Acepte las props estándar de un input (`type`, `placeholder`, `value`, `onChange`, etc.)
- Acepte un `label` opcional que se renderiza como `<label>`
- Acepte un `error` opcional que se renderiza como mensaje de error

---

### Ejercicio 3: Card

Crear `src/components/ui/Card.tsx` que:
- Acepte `children: React.ReactNode`
- Acepte `className?: string` para estilos adicionales
- Renderice un `<div className="card">` contenedor

---

### Ejercicio 4: Header

Crear `src/components/layout/Header.tsx` que muestre:
- El título "TaskFlow - Gestor de Tareas" en un `<h1>`
- Un placeholder para login (solo texto "Usuario" por ahora)

---

### Ejercicio 5: Layout

Crear `src/components/layout/Layout.tsx` que:
- Use `Header`
- Renderice un `<main>` con `children`
- Use un `<footer>` con texto "© 2026 TaskFlow"

---

### Ejercicio 6: Integrar Layout en App.tsx

Modificar `src/App.tsx` para que use `Layout` como envoltura principal, con el título "TaskFlow - Gestor de Tareas" dentro del área main.
