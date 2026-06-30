---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Security Scheme en OpenAPI

Configura un esquema de seguridad Bearer Token (JWT) en `OpenApiConfig`. Agrega el `SecurityScheme` y aplícalo globalmente con `addSecurityItem`.

---

## Ejercicio 4: Servidores personalizados

Configura múltiples servidores en `OpenApiConfig`:
- Producción: `https://api.tasks.sudamericana.edu.py`
- Desarrollo: `http://localhost:8080`

Usa `servers(List<Server>)` en el bean OpenAPI.

---

## Ejercicio 5: Externalizar la configuración de Swagger

Crea propiedades personalizadas en `application.properties` para configurar el título, descripción y versión de la API, e inyéctalas en `OpenApiConfig` usando `@ConfigurationProperties` o `@Value`.
