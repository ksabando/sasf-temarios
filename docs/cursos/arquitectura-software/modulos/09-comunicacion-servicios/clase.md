---
sidebar_label: "Clase"
---

## 3. gRPC (Google Remote Procedure Call)

### Características
- Protocol Buffers (Protobuf) para serialización binaria
- HTTP/2 (multiplexación, streaming bidireccional)
- 5-10x más rápido que REST (JSON)
- Generación de código a partir de .proto

### Definición .proto
```protobuf
syntax = "proto3";

service PaymentService {
    rpc Authorize (AuthorizeRequest) returns (AuthorizeResponse);
    rpc ProcessPayment (stream PaymentRequest) returns (PaymentStatus);
    rpc PaymentNotifications (PaymentRequest) returns (stream PaymentEvent);
    rpc BidirectionalChat (stream ChatMessage) returns (stream ChatMessage);
}

message AuthorizeRequest {
    string order_id = 1;
    double amount = 2;
    string currency = 3;
    string card_token = 4;
}

message AuthorizeResponse {
    bool success = 1;
    string transaction_id = 2;
    string error = 3;
}
```

### Tipos de RPC
| Tipo | Descripción |
|------|-------------|
| **Unary** | Request → Response (como REST) |
| **Server streaming** | Request → Stream de responses |
| **Client streaming** | Stream de requests → Response |
| **Bidirectional streaming** | Stream de requests → Stream de responses |

### gRPC vs REST

| Aspecto | REST | gRPC |
|---------|------|------|
| Protocolo | HTTP/1.1 | HTTP/2 |
| Serialización | JSON (texto) | Protobuf (binario) |
| Tamaño | Grande | Pequeño (10x menor) |
| Velocidad | Lento | Rápido (5-10x) |
| Streaming | No nativo | Nativo |
| Navegabilidad | Fácil (curl, browser) | Difícil (herramientas especiales) |
| Generación código | Manual (o OpenAPI) | Automática desde .proto |

---

## 4. Mensajería Asíncrona

### RabbitMQ
- Broker tradicional (AMQP)
- Modelo: Exchange → Binding → Queue
- Ideal para: CQRS, eventos de dominio, colas de trabajo

```
                      +--------+
         Publisher -->|Exchange|--> Queue --> Consumer
                      +--------+
```

### Apache Kafka
- Event streaming platform
- Modelo: Topic → Partition → Consumer Group
- Ideal para: Event sourcing, pipelines de datos, streaming

```
                     +-------+
  Producer --> Topic |Part.0| --> Consumer Group A
                     |Part.1| --> Consumer Group B
                     |Part.2|
                     +-------+
```

### Kafka: Conceptos clave

| Concepto | Descripción |
|----------|-------------|
| **Topic** | Categoría de mensajes (ej: "order-events") |
| **Partition** | División del topic para paralelismo |
| **Offset** | Posición del mensaje en la partición |
| **Consumer Group** | Grupo de consumidores que leen un topic |
| **Retention** | Tiempo que los mensajes se conservan |
| **Replication** | Copias de particiones para alta disponibilidad |

---

## 5. Eventos vs Comandos en Mensajería

| Aspecto | Evento | Comando |
|---------|--------|---------|
| **Naturaleza** | Notificación | Solicitud |
| **Verbo** | Pasado (OrderCreated) | Imperativo (CreateOrder) |
| **Consumidores** | 0..N (cualquiera puede escuchar) | 1 (un handler específico) |
| **Intención** | "Esto pasó" | "Haz esto" |
| **Fallo** | No crítico (se reintenta) | Crítico (debe ejecutarse) |

### Ejemplo: Comando en mensajería
```json
{
  "messageType": "command",
  "command": "SendEmail",
  "data": {
    "to": "user@example.com",
    "subject": "Order Confirmation",
    "body": "..."
  },
  "correlationId": "abc-123"
}
```

### Ejemplo: Evento en mensajería
```json
{
  "messageType": "event",
  "event": "OrderCreated",
  "data": {
    "orderId": "ORD-001",
    "customerId": "CUST-001",
    "total": 150.00
  },
  "occurredOn": "2026-06-26T10:30:00Z"
}
```

---

## 6. Contratos y Schemas

### Schema Registry
Repositorio centralizado de schemas de mensajes compatibles con Avro, Protobuf, JSON Schema.

```
Producer: valida schema → Schema Registry
Consumer: obtiene schema → Schema Registry
```

### JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "orderId": { "type": "string" },
    "total": { "type": "number" },
    "currency": { "type": "string", "enum": ["USD", "EUR", "CLP"] },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "productId": { "type": "string" },
          "quantity": { "type": "integer", "minimum": 1 }
        },
        "required": ["productId", "quantity"]
      }
    }
  },
  "required": ["orderId", "total", "items"]
}
```

---

## 7. Resiliencia: Circuit Breaker

### Estados del Circuit Breaker

```
     +---------+
     |  CLOSED |  ← Normal. Las llamadas pasan.
     +---------+
          | (fallos superan threshold)
          v
     +---------+
     |  OPEN   |  ← Fallando. Las llamadas fallan inmediatamente.
     +---------+
          | (timeout elapsed)
          v
     +-----------+
     |  HALF-OPEN|  ← Probando. Deja pasar una llamada.
     +-----------+
        /        \
       v          v
  (éxito)      (fallo)
  CLOSED        OPEN
```

### Implementación con Resilience4j

```java
@Bean
public Customizer<Resilience4JCircuitBreakerFactory> defaultCustomizer() {
    return factory -> factory.configureDefault(id -> new Resilience4JConfigBuilder(id)
        .circuitBreakerConfig(CircuitBreakerConfig.custom()
            .slidingWindowSize(10)           // ventana de 10 llamadas
            .failureRateThreshold(50)        // abrir si 50% fallan
            .waitDurationInOpenState(Duration.ofSeconds(30)) // esperar 30s
            .permittedNumberOfCallsInHalfOpenState(3) // 3 llamadas en half-open
            .build())
        .build());
}

// Uso en Feign Client
@FeignClient(name = "payment-service", fallback = PaymentClientFallback.class)
public interface PaymentClient {
    @PostMapping("/api/payments/authorize")
    PaymentResponse authorize(@RequestBody PaymentRequest request);
}

@Component
public class PaymentClientFallback implements PaymentClient {
    @Override
    public PaymentResponse authorize(PaymentRequest request) {
        return PaymentResponse.failure("Payment service unavailable");
    }
}
```

---

## 8. Bulkhead y Retry

### Bulkhead
Aísla recursos para que un servicio fallando no afecte a otros.

```java
@Bean
public Customizer<Resilience4JBulkheadProvider> bulkheadCustomizer() {
    return provider -> provider.configureDefault(id -> new BulkheadConfigBuilder()
        .maxConcurrentCalls(10)     // máximo 10 llamadas concurrentes
        .maxWaitDuration(Duration.ofMillis(500)) // esperar máximo 500ms
        .build());
}
```

### Retry con Backoff Exponencial

```java
@Bean
public Retry retry() {
    return Retry.of("payment-retry", RetryConfig.custom()
        .maxAttempts(3)
        .waitDuration(Duration.ofMillis(500))
        .retryExceptions(TimeoutException.class, IOException.class)
        .build());
}
```

---

## 9. Timeout

Toda llamada remota debe tener timeout para no bloquear recursos.

```java
// Spring Cloud Gateway timeout
spring:
  cloud:
    gateway:
      httpclient:
        response-timeout: 5s

// Feign Client timeout
feign:
  client:
    config:
      default:
        connectTimeout: 2000
        readTimeout: 3000
```

---

## 10. Service Mesh

Infraestructura para gestionar la comunicación entre servicios a nivel de red.

```
+------------------+     +------------------+
|   Order Service  |     |  Payment Service  |
|   (app)          |     |   (app)           |
+------------------+     +------------------+
        |                          |
+------------------+     +------------------+
|   Sidecar Proxy  |     |   Sidecar Proxy  |
|   (Envoy)        |────>|   (Envoy)        |
+------------------+     +------------------+
        |                          |
+--------------------------------------------------+
|                 Service Mesh (Istio)              |
|               mTLS, Observability, Routing         |
+--------------------------------------------------+
```

---

## 11. Laboratorio

Implementar comunicación entre servicios de E-Commerce:
1. REST (Feign + Circuit Breaker) para operaciones síncronas
2. Kafka para eventos asíncronos
3. Comparar enfoques: latencia, disponibilidad, complejidad
4. Implementar resiliencia: Circuit Breaker + Retry + Bulkhead + Timeout
