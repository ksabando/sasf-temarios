---
sidebar_label: "Clase"
---

## VB.NET para Mantenimiento

VB.NET comparte runtime con C#, pero usa una sintaxis distinta. El objetivo es leer codigo existente, entenderlo y hacer cambios seguros.

### Comparacion rapida

| C# | VB.NET |
|----|--------|
| `public class Product` | `Public Class Product` |
| `{ }` | `End Class`, `End If` |
| `var name = "A";` | `Dim name = "A"` |
| `try/catch` | `Try/Catch/End Try` |

## Recomendacion

Antes de modificar legacy, escribir pruebas o al menos capturar comportamiento actual con casos manuales repetibles.
