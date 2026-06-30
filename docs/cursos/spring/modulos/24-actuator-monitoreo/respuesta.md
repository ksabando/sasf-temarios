---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Prometheus + Grafana

### prometheus.yml
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'spring-boot-app'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['host.docker.internal:8080']
        labels:
          application: 'monitoreo-demo'
```

### docker-compose.yml para Prometheus y Grafana
```yaml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
```

---

## Ejercicio 4: Distributed Tracing con Zipkin

### application.yml (para cada servicio)
```yaml
management:
  tracing:
    sampling:
      probability: 1.0
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans

logging:
  pattern:
    level: "%5p [${spring.application.name:},%X{traceId:-},%X{spanId:-}]"
```

### OrderService.java con tracing
```java
package com.sasf.orderservice.service;

import io.micrometer.observation.annotation.Observed;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    @Observed(name = "order.processing",
        contextualName = "processing-order",
        lowCardinalityKeyValues = {"service", "order-service"})
    public String processOrder(Long orderId) {
        System.out.println("Processing order: " + orderId);
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Order " + orderId + " processed";
    }
}
```

### PaymentService.java con Tracer manual
```java
package com.sasf.paymentservice.service;

import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private Tracer tracer;

    public String processPayment(Long orderId, double amount) {
        Span span = tracer.nextSpan().name("payment.processing").start();
        try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
            span.tag("order.id", String.valueOf(orderId));
            span.tag("payment.amount", String.valueOf(amount));
            span.event("payment.validation");

            Thread.sleep(150);

            span.event("payment.completed");
            return "Payment processed for order " + orderId;
        } catch (Exception e) {
            span.error(e);
            throw new RuntimeException("Payment failed", e);
        } finally {
            span.end();
        }
    }
}
```

---

## Ejercicio 5: Monitoreo completo con Resilience4j

### application.yml
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,circuitbreakers
  health:
    circuitbreakers:
      enabled: true
  metrics:
    tags:
      application: ${spring.application.name}

resilience4j:
  circuitbreaker:
    configs:
      default:
        sliding-window-size: 5
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10s
    instances:
      externalService:
        base-config: default
```

### ExternalService.java
```java
package com.sasf.monitoreo.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ExternalService {

    private final RestTemplate restTemplate;
    private int callCount = 0;

    public ExternalService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @CircuitBreaker(name = "externalService", fallbackMethod = "fallback")
    public String callExternalApi() {
        callCount++;
        System.out.println("Call #" + callCount + " to external API");

        // Simular fallo después de 3 llamadas exitosas
        if (callCount > 3) {
            throw new RuntimeException("External API unavailable");
        }

        return "Success on call #" + callCount;
    }

    public String fallback(Throwable t) {
        System.out.println("Fallback activated: " + t.getMessage());
        return "Fallback response";
    }
}
```

### Query de Grafana para métricas de CB
```
// State transitions
rate(resilience4j_circuitbreaker_state_transitions_total[1m])

// Failed calls ratio
rate(resilience4j_circuitbreaker_calls_total{kind="failed"}[1m])
  /
rate(resilience4j_circuitbreaker_calls_total[1m])

// Successful calls
rate(resilience4j_circuitbreaker_calls_total{kind="successful"}[1m])
```

