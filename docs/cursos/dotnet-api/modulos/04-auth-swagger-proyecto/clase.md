---
sidebar_label: "Clase"
---

## Autenticacion, Autorizacion y Swagger

La autenticacion identifica al usuario. La autorizacion decide que puede hacer. JWT es comun en APIs porque permite enviar credenciales firmadas en cada request.

### Flujo JWT

1. Usuario envia credenciales.
2. API valida usuario.
3. API emite token.
4. Cliente envia `Authorization: Bearer <token>`.
5. API valida token y aplica permisos.

## Swagger

Swagger documenta endpoints y permite probarlos desde navegador.
