---
sidebar_label: "Clase"
---

## Razor, Formularios y Validacion

Razor permite combinar HTML con expresiones C#. Los formularios envian datos al servidor y la validacion evita procesar informacion invalida.

### Elementos comunes

| Elemento | Uso |
|----------|-----|
| `asp-for` | Enlazar input a propiedad |
| `asp-action` | Definir accion destino |
| ValidationMessageFor | Mostrar error de campo |
| ModelState | Estado de validacion |

## Recomendacion

Validar siempre en servidor aunque exista validacion de cliente.
