---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario: Cache y Rendimiento

**Pregunta 1:** ¿Qué anotación habilita el soporte de caché en Spring Boot?
**Respuesta:** `@EnableCaching` en una clase de configuración.

**Pregunta 2:** ¿Cuál es la diferencia entre `@Cacheable` y `@CachePut`?
**Respuesta:** `@Cacheable` omite la ejecución del método si el resultado ya está en caché. `@CachePut` siempre ejecuta el método y actualiza la caché con el resultado.

**Pregunta 3:** ¿Qué hace `@CacheEvict(allEntries = true)`?
**Respuesta:** Elimina todas las entradas del caché especificado, no solo una.

**Pregunta 4:** ¿Cómo se define una clave personalizada en `@Cacheable`?
**Respuesta:** Con el atributo `key` usando SpEL, ej: `@Cacheable(value = "productos", key = "#id")`.

**Pregunta 5:** ¿Qué diferencia hay entre `condition` y `unless` en `@Cacheable`?
**Respuesta:** `condition` evalúa antes de ejecutar el método (si es falsa, no se cachea). `unless` evalúa después (si es verdadera, no se cachea el resultado).

**Pregunta 6:** ¿Qué implementación de caché en memoria es la recomendada para Spring Boot?
**Respuesta:** Caffeine (com.github.ben-manes.caffeine), que es la que Spring Boot usa por defecto cuando no se configura otra.

**Pregunta 7:** ¿Para qué sirve el atributo `sync = true` en `@Cacheable`?
**Respuesta:** Para sincronizar la ejecución del método, evitando el problema de cache stampede (múltiples hilos cargando el mismo dato simultáneamente).

**Pregunta 8:** ¿Qué dependencia se necesita para usar Redis como caché en Spring Boot?
**Respuesta:** `spring-boot-starter-data-redis`.

**Pregunta 9:** ¿Qué endpoint de Actuator expone las métricas de caché?
**Respuesta:** `GET /actuator/caches` y `GET /actuator/metrics/cache.gets`.

**Pregunta 10:** ¿Qué estrategias de reemplazo de caché soporta Caffeine?
**Respuesta:** LRU (Least Recently Used) y LFU (Least Frequently Used), configuradas mediante `maximumSize()` o `maximumWeight()`.

