---
sidebar_label: "Clase"
---

## Web Forms y Sistemas Legacy

ASP.NET Web Forms usa un modelo basado en eventos y controles servidor. Su ciclo de vida es diferente a MVC y puede ocultar complejidad en ViewState y PostBack.

### Conceptos clave

| Concepto | Descripcion |
|----------|-------------|
| Page Life Cycle | Secuencia de eventos de la pagina |
| ViewState | Estado serializado entre postbacks |
| PostBack | Request generado por la misma pagina |
| Code-behind | Codigo asociado a la vista `.aspx` |

## Recomendacion

Para mantener Web Forms, entender primero el ciclo de vida antes de mover codigo o cambiar eventos.
