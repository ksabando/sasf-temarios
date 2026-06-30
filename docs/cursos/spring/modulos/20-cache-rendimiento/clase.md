---
sidebar_label: "Clase"
---

## 3. @Cacheable

Almacena el resultado del método en caché. Para invocaciones posteriores con los mismos parámetros, retorna el valor en caché sin ejecutar el método.

```java
@Service
public class ProductoService {

    @Cacheable(value = "productos", key = "#id")
    public Producto findById(Long id) {
        simularConsultaLenta();
        return new Producto(id, "Producto " + id);
    }
}
```

### Atributos de @Cacheable

| Atributo | Descripción |
|----------|-------------|
| `value` / `cacheNames` | Nombre(s) del caché |
| `key` | SpEL para la clave (default: todos los parámetros) |
| `condition` | SpEL: solo cachea si se cumple |
| `unless` | SpEL: no cachea si se cumple |
| `sync` | Sincroniza para evitar cache stampede |

```java
@Cacheable(value = "productos", key = "#id",
           condition = "#id > 0",
           unless = "#result.stock < 10",
           sync = true)
public Producto findById(Long id) { ... }
```

---

## 4. @CacheEvict

Elimina entradas de la caché.

```java
@CacheEvict(value = "productos", key = "#id")
public void eliminarProducto(Long id) { ... }

// Vaciar toda la caché
@CacheEvict(value = "productos", allEntries = true)
public void limpiarCache() { ... }

// Ejecutar antes del método (por si el método lanza excepción)
@CacheEvict(value = "productos", beforeInvocation = true)
public void actualizarProducto(Producto p) { ... }
```

---

## 5. @CachePut

Ejecuta el método y actualiza la caché. Similar a `@Cacheable` pero siempre ejecuta el método.

```java
@CachePut(value = "productos", key = "#producto.id")
public Producto actualizar(Producto producto) {
    return repository.save(producto);
}
```

---

## 6. @Caching y @CacheConfig

### @Caching — Múltiples operaciones

```java
@Caching(
    cacheable = { @Cacheable("productos") },
    put = { @CachePut("productosResumen") },
    evict = { @CacheEvict("productosTop", allEntries = true) }
)
public Producto buscarComplejo(Long id) { ... }
```

### @CacheConfig — Configuración a nivel de clase

```java
@Service
@CacheConfig(cacheNames = "productos")
public class ProductoService {

    @Cacheable(key = "#id")
    public Producto findById(Long id) { ... }

    @CacheEvict(allEntries = true)
    public void limpiarCache() { ... }
}
```

---

## 7. Cache Managers

### Caffeine (en memoria)

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(500)
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .recordStats());
        return manager;
    }
}
```

### Redis (distribuido)

```java
@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues();

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .build();
    }
}
```

Dependencia:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

---

## 8. Estrategias de Cache

| Estrategia | Descripción |
|------------|-------------|
| **TTL** (Time To Live) | Expirar entradas tras un tiempo fijo |
| **LRU** (Least Recently Used) | Eliminar las entradas menos usadas recientemente |
| **LFU** (Least Frequently Used) | Eliminar las entradas menos frecuentes |

Caffeine soporta LRU y LFU. Se configuran con `maximumSize()` o `maximumWeight()`.

---

## 9. Actuator Cache Metrics

Con `spring-boot-starter-actuator`, se pueden exponer métricas de caché.

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,cache
  metrics:
    cache:
      enabled: true
```

Endpoint: `GET /actuator/caches` y `GET /actuator/metrics/cache.gets`.

Para Caffeine, con `.recordStats()` se habilitan métricas como:

- `cache.gets` (hit/miss ratio)
- `cache.evictions`
- `cache.load` (tiempo de carga)

---

## 10. Cache Stampede

Problema cuando múltiples hilos intentan cargar el mismo dato simultáneamente. Solución: `sync = true` en `@Cacheable`.

```java
@Cacheable(value = "productos", key = "#id", sync = true)
public Producto findById(Long id) { ... }
```

Con `sync = true`, solo un hilo ejecuta el método; los demás esperan el resultado.

---

## Resumen

| Anotación | Propósito |
|-----------|-----------|
| `@Cacheable` | Cachea resultado, omite ejecución si existe |
| `@CacheEvict` | Elimina entradas de caché |
| `@CachePut` | Ejecuta método y actualiza caché |
| `@Caching` | Agrupa varias operaciones |
| `@CacheConfig` | Configuración compartida de clase |
