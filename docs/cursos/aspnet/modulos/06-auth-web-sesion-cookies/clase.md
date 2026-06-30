---
sidebar_label: "Clase"
---

## Autenticacion Web, Sesion y Cookies

En aplicaciones server-rendered, cookies y sesion permiten mantener estado entre requests. Si la app consume una API con JWT, debe manejar el token con cuidado.

| Mecanismo | Uso |
|-----------|-----|
| Cookie auth | Identidad web |
| Session | Estado temporal del servidor |
| TempData | Mensajes entre redirects |
| JWT | Autenticacion contra API |

## Resumen

No exponer tokens ni secretos en HTML o JavaScript si no es necesario.
