---
sidebar_label: "Clase"
---

# Módulo 25: Proyecto Final y Simulación de Entrevista

## Arquitectura del Proyecto E-Commerce

Este módulo presenta un proyecto integrador que combina todos los conceptos del curso: microservicios, config centralizada, service discovery, gateway, resilience, mensajería, caché, seguridad y monitoreo.

### Visión general

```
                    —,              Spring Cloud Gateway                   —,
                    —,          (Routes, CB, Retry, RateLimit)             —,
                    —,               PostgreSQL (3 databases)            —,

```

### Microservicios

| Servicio | Puerto | Base de datos | Descripción |
|---|---|---|---|
| **config-server** | 8888 | - | Configuración centralizada (Git) |
| **discovery-server** | 8761 | - | Service Discovery (Eureka) |
| **gateway-service** | 8080 | - | API Gateway con Resilience4j |
| **product-service** | 8081 | PostgreSQL | Catálogo de productos, inventario |
| **order-service** | 8082 | PostgreSQL | Procesamiento de pedidos |
| **user-service** | 8083 | PostgreSQL | Usuarios, roles, autenticación |

### Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Framework | Spring Boot 3.2 + Java 17 |
| Persistencia | Spring Data JPA + PostgreSQL |
| Migraciones | Flyway |
| Configuración | Spring Cloud Config (Git) |
| Discovery | Netflix Eureka |
| Gateway | Spring Cloud Gateway |
| Resiliencia | Resilience4j (CB, Retry, RateLimiter) |
| Mensajería | RabbitMQ (pedidos) |
| Cache | Redis con @Cacheable |
| Seguridad | JWT + Keycloak (OAuth2) |
| Monitoreo | Actuator + Prometheus + Grafana |
| Tracing | Micrometer Tracing + Zipkin |
| Documentación | SpringDoc OpenAPI |
| Testing | JUnit 5 + Testcontainers |
| Contenerización | Docker Compose |

### Decisiones de diseño

**1. Base de datos por servicio**
Cada microservicio tiene su propia base de datos PostgreSQL. Esto garantiza desacoplamiento y evita dependencias entre equipos.

**2. Comunicación asíncrona para pedidos**
Cuando se crea un pedido, order-service publica un evento en RabbitMQ. inventory-service consume el evento para actualizar el stock. Esto evita acoplamiento temporal.

**3. Caché con Redis para productos**
Los productos más consultados se cachean en Redis con TTL configurable. Esto reduce la carga en la base de datos y mejora la latencia.

**4. Seguridad con Keycloak**
Keycloak proporciona autenticación y autorización centralizada. Los servicios validan tokens JWT localmente. El Gateway valida las sesiones antes de enrutar.

**5. Configuración centralizada**
Todos los microservicios obtienen su configuración de Config Server, que lee de un repositorio Git. Los cambios se propagan vía Spring Cloud Bus.

### Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  keycloak:
    image: quay.io/keycloak/keycloak:22.0
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8081:8080"
    command: start-dev

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"

  zipkin:
    image: openzipkin/zipkin:latest
    ports:
      - "9411:9411"
```

### Flujo de una petición típica

1. Cliente → `POST /api/orders` (Gateway)
2. Gateway valida JWT con Keycloak
3. Gateway enruta a order-service (vía Eureka + LoadBalancer)
4. order-service verifica productos (llamada asíncrona a product-service vía Redis cache)
5. order-service persiste pedido en PostgreSQL
6. order-service publica evento en RabbitMQ
7. inventory-service consume evento y actualiza stock
8. Respuesta al cliente con estado del pedido
9. Todas las trazas se envían a Zipkin
10. Todas las métricas son scrapeadas por Prometheus

### Distribución de ejercicios

Los siguientes 10 ejercicios están diseñados como simulacros de entrevista técnica. Cada uno combina múltiples conceptos del curso y representa un mini-proyecto por sí mismo.
