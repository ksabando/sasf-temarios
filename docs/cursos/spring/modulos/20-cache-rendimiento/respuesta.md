---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Caffeine CacheManager

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager(
            "productos", "productosPorCategoria", "busquedas");

        // Configuración por defecto
        manager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(200)
            .expireAfterWrite(15, TimeUnit.MINUTES)
            .recordStats());

        // Configuración personalizada para "productos"
        CaffeineCache productosCache = new CaffeineCache("productos",
            Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .recordStats()
                .build());

        manager.registerCustomCache("productos",
            Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .recordStats()
                .build());

        return manager;
    }
}
```

---

## Ejercicio 4: Redis CacheManager

```yaml
# application.yml
spring:
  cache:
    type: redis
  data:
    redis:
      host: localhost
      port: 6379
```

```java
@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public RedisCacheManagerBuilderCustomizer cacheCustomizer() {
        return builder -> builder
            .cacheDefaults(RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .disableCachingNullValues()
                .prefixCacheNameWith("sasf:"))
            .withCacheConfiguration("productos",
                RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(5))
                    .prefixCacheNameWith("sasf:"));
    }
}
```

---

## Ejercicio 5: Actuator Cache Metrics

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,cache
  metrics:
    cache:
      enabled: true
```

```java
@Service
public class CacheMetricService {

    @Autowired
    private CacheManager cacheManager;

    public Map<String, Object> obtenerMetricas() {
        Map<String, Object> metricas = new LinkedHashMap<>();
        for (String name : cacheManager.getCacheNames()) {
            Cache cache = cacheManager.getCache(name);
            if (cache instanceof CaffeineCache caffeineCache) {
                com.github.benmanes.caffeine.cache.Cache<Object, Object> nativeCache =
                    caffeineCache.getNativeCache();
                CacheStats stats = nativeCache.stats();
                Map<String, Object> statsMap = new LinkedHashMap<>();
                statsMap.put("hits", stats.hitCount());
                statsMap.put("misses", stats.missCount());
                statsMap.put("evictions", stats.evictionCount());
                statsMap.put("hitRate", stats.hitRate());
                statsMap.put("loadTime", stats.totalLoadTime());
                metricas.put(name, statsMap);
            }
        }
        return metricas;
    }
}

@RestController
@RequestMapping("/api/cache")
public class CacheController {

    @Autowired
    private CacheMetricService metricService;

    @GetMapping("/metrics")
    public Map<String, Object> metrics() {
        return metricService.obtenerMetricas();
    }
}
```

