---
sidebar_label: "Clase"
---

## Buenas prácticas con Zustand

| Práctica | Razón |
|----------|-------|
| **Selectores finos** | `useStore((s) => s.count)` evita rerenders innecesarios |
| **Stores separados** | auth, tasks, ui cada uno en su archivo |
| **Actions en el store** | Lógica de negocio dentro del store, no en componentes |
| **Persist solo datos** | No persistir funciones, solo serializables |
| **TypeScript estricto** | Tipar todo el store para autocompletado |
