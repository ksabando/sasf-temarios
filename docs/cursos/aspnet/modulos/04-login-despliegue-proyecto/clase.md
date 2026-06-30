---
sidebar_label: "Clase"
---

## Login y Despliegue

El frontend MVC puede autenticar contra la API, almacenar temporalmente el token y enviarlo en requests posteriores. Para despliegue basico se puede usar IIS o Azure App Service.

### Aspectos clave

| Tema | Consideracion |
|------|---------------|
| Token | Guardarlo de forma controlada |
| Sesion | Evitar exponer datos sensibles |
| Configuracion | Separar `appsettings` por ambiente |
| Despliegue | Validar connection strings y URL de API |

## Recomendacion

No hardcodear URLs ni secretos en codigo fuente.
