---
sidebar_label: "Clase"
---

## Buenas prácticas

| Práctica | Razón |
|----------|-------|
| **Usar variants** | Código más limpio, reutilizable y legible |
| **AnimatePresence** | Necesario para animaciones de salida (`exit`) |
| **key único** | AnimatePresence usa `key` para tracking de elementos |
| **will-change** | Framer Motion lo maneja automáticamente |
| **Reducir motion** | Usar `prefers-reduced-motion` con `useReducedMotion` |
