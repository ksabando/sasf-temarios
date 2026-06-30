---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Caffeine CacheManager

Configura un `CaffeineCacheManager` con:
- Tamaño máximo de 200 entradas por caché.
- TTL de 15 minutos después de escritura.
- `recordStats()` habilitado.
- Cache de nombres: `productos`, `productosPorCategoria`, `busquedas`.
- Configuración por defecto y personalizada para `"productos"` con TTL de 5 minutos.

---

## Ejercicio 4: Redis como caché distribuida

Configura un `RedisCacheManager` que:
- Use TTL de 30 minutos por defecto.
- No permita cachear valores nulos.
- Use prefijo `"sasf:"` para todas las claves.
- Para el caché `"productos"`, configure un TTL de 5 minutos.
- Configure la conexión Redis en `application.yml` con host localhost y puerto 6379.

---

## Ejercicio 5: Monitoreo con Actuator

- Habilita las métricas de caché en `application.yml`.
- Agrega un endpoint `GET /api/cache/metrics` que devuelva estadísticas de Caffeine (hits, misses, evictions, hit ratio).
- Crea un `CacheMetricService` que use `CacheManager` y `CaffeineCache` para obtener las estadísticas.
- Verifica que al consultar un producto varias veces, el hit ratio aumente.
