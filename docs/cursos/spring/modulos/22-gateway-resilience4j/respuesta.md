---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Resilience4j Circuit Breaker

### Service
```java
package com.sasf.externalservice.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ExternalDataService {

    private final RestTemplate restTemplate;

    public ExternalDataService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @CircuitBreaker(name = "externalApi", fallbackMethod = "fallbackData")
    public List<Map<String, Object>> getExternalData() {
        System.out.println("=== Calling external API ===");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> data = restTemplate.getForObject(
            "https://jsonplaceholder.typicode.com/posts",
            List.class
        );
        return data;
    }

    public List<Map<String, Object>> fallbackData(Throwable t) {
        System.out.println("=== Circuit Breaker OPEN - Using fallback data ===");
        System.out.println("Error: " + t.getMessage());
        return List.of(
            Map.of("id", 0, "title", "Fallback data", "body", "Service unavailable")
        );
    }
}
```

### application.yml
```yaml
resilience4j:
  circuitbreaker:
    configs:
      default:
        sliding-window-size: 5
        minimum-number-of-calls: 3
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10000
        permitted-number-of-calls-in-half-open-state: 2
    instances:
      externalApi:
        base-config: default
```

---

## Ejercicio 4: RateLimiter + Retry + Bulkhead + TimeLimiter

### Service con múltiples decoradores
```java
package com.sasf.combined.service;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class SearchService {

    @RateLimiter(name = "searchRateLimiter", fallbackMethod = "rateLimitFallback")
    @Retry(name = "searchRetry", fallbackMethod = "retryFallback")
    @Bulkhead(name = "searchBulkhead", fallbackMethod = "bulkheadFallback")
    @CircuitBreaker(name = "searchCB", fallbackMethod = "circuitBreakerFallback")
    public String search(String query) {
        System.out.println("Searching for: " + query + " on thread " + Thread.currentThread().getName());
        simulateLatency();
        return "Result for: " + query;
    }

    private void simulateLatency() {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public String rateLimitFallback(String query, Throwable t) {
        return "Rate limit exceeded for: " + query;
    }

    public String retryFallback(String query, Throwable t) {
        return "Retries exhausted for: " + query;
    }

    public String bulkheadFallback(String query, Throwable t) {
        return "Bulkhead full for: " + query;
    }

    public String circuitBreakerFallback(String query, Throwable t) {
        return "Circuit breaker open for: " + query;
    }

    @TimeLimiter(name = "searchTimeLimiter", fallbackMethod = "timeoutFallback")
    public CompletableFuture<String> searchAsync(String query) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return "Async result for: " + query;
        });
    }

    public CompletableFuture<String> timeoutFallback(String query, Throwable t) {
        return CompletableFuture.completedFuture("Timeout for: " + query);
    }
}
```

### application.yml
```yaml
resilience4j:
  ratelimiter:
    instances:
      searchRateLimiter:
        limit-for-period: 5
        limit-refresh-period: 1s
        timeout-duration: 500ms
  retry:
    instances:
      searchRetry:
        max-attempts: 3
        wait-duration: 500ms
  bulkhead:
    instances:
      searchBulkhead:
        max-concurrent-calls: 3
        max-wait-duration: 500ms
  timelimiter:
    instances:
      searchTimeLimiter:
        timeout-duration: 2s
  circuitbreaker:
    instances:
      searchCB:
        sliding-window-size: 10
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10s
```

---

## Ejercicio 5: Gateway + Eureka + Circuit Breaker

### Gateway application.yml
```yaml
server:
  port: 8080

spring:
  application:
    name: gateway-service
  cloud:
    gateway:
      routes:
        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
          filters:
            - name: CircuitBreaker
              args:
                name: productCB
                fallbackUri: forward:/fallback/products
            - name: Retry
              args:
                retries: 3
                statuses: SERVICE_UNAVAILABLE
                methods: GET
            - RewritePath=/api/products/(?<segment>.*), /products/$\{segment}

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

### Gateway - Clase principal con Discovery
```java
package com.sasf.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

