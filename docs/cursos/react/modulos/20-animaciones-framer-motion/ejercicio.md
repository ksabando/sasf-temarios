---
sidebar_label: "Ejercicio"
---

# Ejercicio — Animaciones con Framer Motion en TaskFlow

**Proyecto:** `taskflow/`
**Objetivo:** Agregar animaciones suaves a la UI usando Framer Motion.

---

## 1. Instalar Framer Motion

```bash
npm install framer-motion
```

## 2. Animar entrada de TaskCard con slide + fade

En `TaskCard.tsx`:
- Crear variants `hidden`, `visible`, `exit`
- `hidden`: `{ opacity: 0, x: -50 }`
- `visible`: `{ opacity: 1, x: 0 }`
- `exit`: `{ opacity: 0, x: 50 }`
- Aplicar con `initial`, `animate`, `exit`
- `transition: { duration: 0.3 }`

## 3. AnimatePresence en la lista de tareas

En `TaskList.tsx`:
- Envolver el mapeo de tareas con `<AnimatePresence>`
- Cada TaskCard debe tener `exit` configurado
- Al eliminar, la tarea sale con fade + slide

## 4. Botón completar con whileTap scale

En `TaskCard.tsx`:
- El checkbox o botón de completar debe tener `whileTap={{ scale: 0.8 }}`
- Efecto de rebote al hacer clic

## 5. Drag gesture para marcar completada

En `TaskCard.tsx`:
- Agregar `drag="x"` y `dragConstraints={{ left: 0, right: 100 }}`
- En `onDragEnd`, si `info.offset.x > 80`, llamar `toggleTask(id)`
- Feedback visual: si se arrastra > 50px, mostrar indicador visual (opacidad, color)

## 6. Sidebar con layout animation

En `Sidebar.tsx` o `Layout.tsx`:
- Usar `motion.aside` con variants `open` / `closed`
- `animate={sidebarOpen ? 'open' : 'closed'}`
- `transition={{ type: 'spring', stiffness: 300, damping: 30 }}`
- Los elementos hijos deben moverse fluidamente con `layout`

## 7. Verificar

- `npm run dev` sin errores
- Tareas entran con slide desde la izquierda
- Tareas eliminadas salen con fade hacia la derecha
- Al hacer clic en completar, el botón tiene rebote
- Arrastrar tarea a la derecha la marca como completada
- Sidebar se abre/cierra con animación suave
