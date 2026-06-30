---
sidebar_label: "Clase"
---

## Grafana Dashboards

Grafana se conecta a Prometheus para visualizar métricas.

### Configuración de Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'spring-boot-apps'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets:
        - 'localhost:8080'
        - 'localhost:8081'
        - 'localhost:8082'
```

### Dashboards comunes

1. **JVM Dashboard**: Memoria heap, GC, threads, clases cargadas
2. **HTTP Dashboard**: Tasa de requests, latencia (p50, p95, p99), errores
3. **Business Dashboard**: Métricas de negocio personalizadas

---

## Micrometer Tracing (Distributed Tracing)

Micrometer Tracing proporciona tracing distribuido compatible con Zipkin, Jaeger y otros.

### Dependencias

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>

<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-zipkin</artifactId>
</dependency>
```

### Configuración

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
    level: "%5p [%spring.application.name:%,X{traceId:-},%X{spanId:-}]"
```

### Tracing en código

```java
@Service
public class OrderTracingService {

    @Autowired
    private Tracer tracer;

    public Order createOrder(OrderRequest request) {
        // Crear un nuevo span personalizado
        Span newSpan = tracer.nextSpan()
            .name("manual-order-processing")
            .start();

        try (Tracer.SpanInScope ws = tracer.withSpan(newSpan)) {
            newSpan.tag("order.amount", String.valueOf(request.getAmount()));
            newSpan.event("order.validation.started");

            Order order = saveOrder(request);

            newSpan.event("order.completed");
            return order;
        } finally {
            newSpan.end();
        }
    }
}
```

### Observación automática

```java
@Observed(name = "order.create",
    contextualName = "order-creation",
    lowCardinalityKeyValues = {"service", "order-service"})
public Order createOrder(OrderRequest request) {
    return orderRepository.save(new Order(request));
}
```

---

## Zipkin

Zipkin es un sistema de tracing distribuido que visualiza el flujo de peticiones entre servicios.

### Arquitectura Zipkin

```
               —,               —,
```

### Iniciar Zipkin con Docker

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```
