---
sidebar_label: "Clase"
---

# Módulo 22: Gateway & Resilience4j

## Spring Cloud Gateway

Spring Cloud Gateway es un API Gateway construido sobre Spring WebFlux (reactivo). Su propósito es enrutar peticiones, aplicar filtros y manejar preocupaciones transversales como seguridad, límites de tasa y circuit breakers.

### Conceptos clave

- **Route**: Entidad que define un conjunto de reglas para enrutar una petición
- **Predicate**: Condición que debe cumplirse para que una ruta se active
- **Filter**: Interceptor que modifica la petición o respuesta en el flujo

### Dependencias

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

### Configuración básica de rutas

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
          filters:
            - StripPrefix=1

        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
```

### Predicates comunes

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: ruta-ejemplo
          uri: http://localhost:8081
          predicates:
            - Path=/api/**           # Ruta HTTP
            - Method=GET,POST        # Método HTTP
            - Header=X-Request-Id, \d+  # Cabecera con regex
            - Query=parametro        # Parámetro de query
            - Cookie=session_id, .+  # Cookie
            - After=2024-01-01T00:00:00Z  # Temporal
            - Between=2024-01-01T00:00:00Z,2024-12-31T23:59:59Z
            - Weight=grupo1, 80      # Peso para canary releases
```

### Filters de Gateway

**AddRequestHeader:**
```yaml
filters:
  - AddRequestHeader=X-Gateway-Origin, spring-cloud-gateway
  - AddRequestParameter=source, gateway
  - AddResponseHeader=X-Gateway-Response, routed
```

**RewritePath:**
```yaml
filters:
  - RewritePath=/api/products/(?<segment>.*), /products/$\{segment}
  # /api/products/123 → /products/123
```

**CircuitBreaker:**
```yaml
filters:
  - name: CircuitBreaker
    args:
      name: productServiceCircuitBreaker
      fallbackUri: forward:/fallback/products
      statusCodes:
        - 500
        - 503
```

**Retry:**
```yaml
filters:
  - name: Retry
    args:
      retries: 3
      statuses: BAD_GATEWAY, SERVICE_UNAVAILABLE
      methods: GET
      backoff:
        firstBackoff: 500ms
        maxBackoff: 5s
        factor: 2
```

### Configuración programática

```java
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("product-service", r -> r
                .path("/api/products/**")
                .filters(f -> f
                    .stripPrefix(1)
                    .addRequestHeader("X-Gateway", "true")
                    .circuitBreaker(config -> config
                        .setName("productCB")
                        .setFallbackUri("forward:/fallback/products")))
                .uri("lb://product-service"))
            .route("order-service", r -> r
                .path("/api/orders/**")
                .filters(f -> f
                    .stripPrefix(1)
                    .retry(retryConfig -> retryConfig
                        .setRetries(3)
                        .setStatuses(HttpStatus.SERVICE_UNAVAILABLE)))
                .uri("lb://order-service"))
            .build();
    }
}
```

### Controlador de fallback

```java
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/products")
    public Mono<Map<String, String>> productsFallback() {
        return Mono.just(Map.of(
            "message", "Product service unavailable. Please try again later.",
            "status", "FALLBACK"
        ));
    }

    @GetMapping("/orders")
    public Mono<Map<String, String>> ordersFallback() {
        return Mono.just(Map.of(
            "message", "Order service unavailable.",
            "status", "FALLBACK"
        ));
    }
}
```

---

## Resilience4j

Resilience4j es una librería ligera de tolerancia a fallos inspirada en Hystrix. Proporciona 6 módulos principales.

### Dependencias

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>

<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
</dependency>
```

### Circuit Breaker

El Circuit Breaker tiene 3 estados:
- **CLOSED**: Funcionamiento normal. Las peticiones pasan directamente.
- **OPEN**: Fallos detectados. Las peticiones fallan inmediatamente.
- **HALF_OPEN**: Periodo de prueba. Se permiten algunas peticiones para probar si el servicio se recuperó.

**Configuración:**
```yaml
resilience4j:
  circuitbreaker:
    configs:
      default:
        sliding-window-size: 10
        minimum-number-of-calls: 5
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10s
        permitted-number-of-calls-in-half-open-state: 3
        slow-call-rate-threshold: 50
        slow-call-duration-threshold: 2s
    instances:
      productService:
        base-config: default
```

**Uso:**
```java
@Service
public class ProductService {

    @CircuitBreaker(name = "productService", fallbackMethod = "fallback")
    public List<Product> getProducts() {
        return restTemplate.getForObject(
            "http://product-service/api/products",
            List.class
        );
    }

    public List<Product> fallback(Throwable t) {
        return List.of(new Product(0L, "Fallback product", 0.0));
    }
}
```

### @Retry

```yaml
resilience4j:
  retry:
    configs:
      default:
        max-attempts: 3
        wait-duration: 500ms
        retry-exceptions:
          - org.springframework.web.client.HttpServerErrorException
    instances:
      productRetry:
        base-config: default
```

```java
@Retry(name = "productRetry", fallbackMethod = "fallback")
public List<Product> getProducts() {
    // código que puede fallar
}
```

### @RateLimiter

```yaml
resilience4j:
  ratelimiter:
    configs:
      default:
        limit-for-period: 10
        limit-refresh-period: 1s
        timeout-duration: 500ms
    instances:
      apiRateLimiter:
        base-config: default
```

```java
@RateLimiter(name = "apiRateLimiter", fallbackMethod = "fallback")
public List<Product> getProducts() {
    // código limitado a 10 peticiones por segundo
}
```

### @Bulkhead

Bulkhead limita el número de ejecuciones concurrentes. Dos modos:
- **Semáforo**: Limita hilos concurrentes (por defecto, 25)
- **ThreadPool**: Usa un pool de hilos dedicado

```yaml
resilience4j:
  bulkhead:
    configs:
      default:
        max-concurrent-calls: 5
        max-wait-duration: 500ms
    instances:
      productBulkhead:
        base-config: default
  thread-pool-bulkhead:
    configs:
      default:
        max-thread-pool-size: 4
        core-thread-pool-size: 2
        queue-capacity: 10
```

```java
@Bulkhead(name = "productBulkhead", type = Bulkhead.Type.SEMAPHORE)
public List<Product> getProducts() {
    // código limitado a 5 llamadas concurrentes
}
```

### @TimeLimiter

```yaml
resilience4j:
  timelimiter:
    configs:
      default:
        timeout-duration: 2s
        cancel-running-future: true
    instances:
      productTimeLimiter:
        base-config: default
```

```java
@TimeLimiter(name = "productTimeLimiter", fallbackMethod = "fallback")
public CompletableFuture<List<Product>> getProductsAsync() {
    return CompletableFuture.supplyAsync(() ->
        restTemplate.getForObject("http://product-service/api/products", List.class)
    );
}
```

### Fallback methods

Las reglas para fallback methods:
1. Deben estar en la misma clase
2. Deben tener el mismo parámetro de retorno
3. Pueden aceptar el `Throwable` como último parámetro
4. Se invocan cuando el primary method lanza una excepción

```java
@CircuitBreaker(name = "productService", fallbackMethod = "fallback")
public List<Product> getProducts() { ... }

private List<Product> fallback(HttpServerErrorException e) {
    log.error("Error: {}", e.getMessage());
    return List.of(new Product(0L, "Default", 0.0));
}

private List<Product> fallback(Throwable t) {
    return List.of();
}
```

### Actuator + Resilience4j metrics

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,circuitbreakers,retries,ratelimiters,bulkheads
  health:
    circuitbreakers:
      enabled: true
  metrics:
    tags:
      application: ${spring.application.name}
```

Endpoints disponibles:
- `GET /actuator/health` - Muestra estado de circuit breakers
- `GET /actuator/circuitbreakers` - Estado de todos los CB
- `GET /actuator/circuitbreakers/{name}` - Estado de un CB específico
- `GET /actuator/metrics/resilience4j.circuitbreaker.calls` - Métricas detalladas
