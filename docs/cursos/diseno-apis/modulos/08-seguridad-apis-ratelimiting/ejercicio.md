---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: OAuth2 PKCE Flow

Diseña el flujo OAuth2 PKCE para la app TaskFlow:

1. Dibuja el diagrama de secuencia (descríbelo textualmente)
2. ¿Qué endpoints debe exponer el servidor de autorización?
3. ¿Cómo se genera el code_verifier y code_challenge?
4. ¿Qué roles y scopes definirías para TaskFlow?

---

## Ejercicio 4: CORS y Seguridad

Configura CORS y headers de seguridad para TaskFlow:

1. Configura CORS para permitir:
   - Origen: `https://app.taskflow.com`
   - Métodos: GET, POST, PUT, DELETE, PATCH
   - Headers: Authorization, Content-Type, X-Requested-With
   - Credentials: true
   - Max age: 1 hora

2. Agrega los siguientes headers de seguridad:
   - X-Content-Type-Options: nosniff
   - Strict-Transport-Security: max-age=31536000
   - Content-Security-Policy: default-src 'self'

3. Explica qué protege cada header
