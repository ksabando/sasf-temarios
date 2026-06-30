---
sidebar_label: "Clase"
---

## ASP.NET MVC

MVC separa la aplicacion en tres responsabilidades: modelo, vista y controlador. El controlador recibe la solicitud, ejecuta el caso de uso y selecciona una vista.

### Partes

| Parte | Responsabilidad |
|-------|-----------------|
| Model | Datos y reglas simples de presentacion |
| View | HTML generado con Razor |
| Controller | Flujo HTTP |

## Recomendacion

No poner reglas de negocio complejas en la vista. Mantener controllers delgados y delegar en servicios.
