---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Ciclo de vida con PostConstruct y PreDestroy
Crear un bean `CacheManager` que:
- En `@PostConstruct`: inicialice un `Map<String, Object>` vacío y muestre "Cache inicializado"
- Tenga métodos `put(String key, Object value)` y `Object get(String key)`
- En `@PreDestroy`: limpie el cache y muestre "Cache destruido"
- Ejecutar la aplicación y observar los mensajes en consola

**Requisitos**:
- Usar `@Component`
- Implementar `@PostConstruct` y `@PreDestroy`

---

## Ejercicio 4: Scopes singleton y prototype aplicados
Crear dos servicios que demuestren la diferencia práctica entre singleton y prototype:
- `VisitasContador` (singleton): cuenta cuántas veces se ha invocado un método desde cualquier parte de la app
- `TransaccionIdGenerator` (prototype): genera un ID único (UUID) cada vez que se inyecta

**Requisitos**:
- Inyectar ambos en un `@RestController` con endpoint `GET /api/demo`
- Devolver JSON con el contador de visitas y el ID de transacción
- Refrescar varias veces para ver el comportamiento

---

## Ejercicio 5: @Profile para entornos
Crear una configuración que exponga diferentes beans según el perfil activo:
- Perfil `dev`: `NotificadorService` que imprime en consola (implementación `ConsolaNotificador`)
- Perfil `prod`: `NotificadorService` que registra en archivo (implementación `ArchivoNotificador`)
- Perfil por defecto (sin perfil): lanzar una excepción informando que se requiere un perfil

**Requisitos**:
- Interfaz `NotificadorService` con método `void notificar(String mensaje)`
- Dos implementaciones anotadas con `@Profile`
- Endpoint `GET /api/notificar` que use el servicio
- Activar perfil via `application.properties`
