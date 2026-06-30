---
sidebar_label: "Clase"
---

## Consumo de API desde MVC

Una aplicacion MVC puede actuar como frontend server-rendered y consumir una API externa o propia mediante `HttpClient`.

### Flujo

1. Controller recibe request web.
2. Servicio llama a API.
3. API responde JSON.
4. Servicio transforma a ViewModel.
5. Controller devuelve vista.

## Recomendacion

Registrar `HttpClient` con `IHttpClientFactory` para evitar problemas de sockets y centralizar configuracion.
