---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: API REST con validación y manejo de excepciones

### Contexto
Implementar CRUD de productos con validaciones y manejo centralizado de errores.

### Requisitos
1. `Product` entity: id, name, price, stock, sku (único)
2. `ProductController` con endpoints REST completos
3. Validaciones: name no vacío, price > 0, stock >= 0, sku con formato `PRD-XXXXX`
4. `@ControllerAdvice` global para manejar todas las excepciones
5. `ErrorResponse` DTO con código, mensaje, timestamp
6. Documentación con OpenAPI (SpringDoc)

### Temas evaluados
- @RestController, @RequestMapping
- Bean Validation (@NotNull, @Positive, @Pattern)
- @ControllerAdvice, @ExceptionHandler
- SpringDoc OpenAPI

---

## Ejercicio 3: JPA avanzado con consultas y transacciones

### Contexto
Implementar un sistema de órdenes con productos, items y pagos usando JPA.

### Requisitos
1. `Order` → `OrderItem` (OneToMany), `OrderItem` → `Product` (ManyToOne)
2. `@Transactional` para crear órdenes (consistencia entre tablas)
3. `@Lock` con PESSIMISTIC_WRITE en productos al reservar stock
4. Consulta nativa para reporte de ventas del día
5. Paginación en `GET /api/orders`
6. Flyway migration para crear tablas

### Temas evaluados
- JPA relaciones, @OneToMany, @ManyToOne
- @Transactional, propagación, aislamiento
- @Lock, @Query nativa
- Pageable, Specification
- Flyway

---

## Ejercicio 4: Spring Security con JWT y OAuth2

### Contexto
Implementar autenticación y autorización usando JWT y Keycloak.

### Requisitos
1. Configurar Keycloak con realm, client y roles (ADMIN, USER)
2. `UserService` expone `POST /api/auth/login` y `POST /api/auth/register`
3. Productos: GET permite cualquier rol, POST/PUT/DELETE solo ADMIN
4. Gateway valida tokens antes de enrutar
5. `@PreAuthorize` en controladores
6. Manejo de tokens expirados con refresh token

### Temas evaluados
- Spring Security, SecurityFilterChain
- JWT, OAuth2 Resource Server
- @PreAuthorize, @Secured
- Keycloak integration
- Roles y authorities

---

## Ejercicio 5: AOP, Async y Cache

### Contexto
Implementar logging transversal con AOP, procesamiento asíncrono de órdenes y caché de productos.

### Requisitos
1. `@LogExecutionTime` anotación personalizada + Aspect que logea tiempo
2. `@Async` en `EmailService.sendConfirmation()`
3. `@Cacheable` en `ProductService.getProduct()`
4. `@CacheEvict` cuando se actualiza un producto
5. Configurar Redis como cache provider
6. `@Scheduled` para limpiar cache cada hora

### Temas evaluados
- @Aspect, @Around, @Pointcut
- @Async, @EnableAsync
- @Cacheable, @CacheEvict, @CachePut
- Redis cache configuration
- @Scheduled, cron expressions

---

## Ejercicio 6: Microservicios con Config Server y Eureka

### Contexto
Migrar el monolitio a 3 microservicios con configuración centralizada y discovery.

### Requisitos
1. Config Server con repositorio Git (3 archivos de configuración)
2. Eureka Server
3. 3 microservicios registrados (product, order, user)
4. Comunicación entre servicios con RestTemplate @LoadBalanced
5. Perfiles dev/prod con diferentes configuraciones
6. RefreshScope + Bus para cambios dinámicos

### Temas evaluados
- @EnableConfigServer, @EnableDiscoveryClient
- bootstrap.yml, @RefreshScope
- Spring Cloud Bus, RabbitMQ
- LoadBalancer, RestTemplate

---

## Ejercicio 7: Gateway con Resilience4j

### Contexto
Implementar API Gateway con circuit breaker, retry y rate limiter.

### Requisitos
1. Gateway Spring Cloud con rutas a los 3 servicios
2. Circuit Breaker en ruta a product-service
3. Retry (3 intentos) en ruta a order-service
4. RateLimiter (10 req/s) en ruta a user-service
5. Fallback endpoints para cada servicio
6. Métricas de Resilience4j en Actuator/Prometheus

### Temas evaluados
- Spring Cloud Gateway, RouteLocator
- CircuitBreaker filter, Retry filter
- RateLimiter
- Fallback controller
- Resilience4j metrics

---

## Ejercicio 8: Mensajería asíncrona con RabbitMQ y Kafka

### Contexto
Implementar eventos de dominio: cuando se crea una orden, enviar eventos a RabbitMQ y Kafka.

### Requisitos
1. OrderCreatedEvent con exchange direct + DLQ
2. InventoryConsumer actualiza stock al recibir evento
3. NotificationConsumer envía email (simulado)
4. Configurar retry con backoff exponencial
5. Dead Letter Queue para mensajes fallidos
6. Publicar mismo evento en Kafka topic
7. Consumidor Kafka con group-id y particiones

### Temas evaluados
- RabbitMQ, @RabbitListener, RabbitTemplate
- Dead Letter Queue, Retry
- Kafka, @KafkaListener, KafkaTemplate
- Particiones, consumer groups

---

## Ejercicio 9: Monitoreo completo (Actuator + Prometheus + Grafana + Zipkin)

### Contexto
Implementar observabilidad completa del sistema.

### Requisitos
1. Health indicators personalizados (DB, Redis, RabbitMQ, Kafka)
2. Métricas de negocio (órdenes creadas, ingresos)
3. Prometheus scrape de todos los servicios
4. Grafana dashboard con JVM, HTTP, Business metrics
5. Tracing distribuido con Zipkin (3 servicios trazados)
6. @Observed en operaciones críticas
7. Span personalizado con Tracer

### Temas evaluados
- Actuator endpoints, HealthIndicator
- Micrometer, @Timed, MeterRegistry
- Prometheus + Grafana
- Micrometer Tracing, Zipkin
- @Observed, Tracer, Span

---

## Ejercicio 10: Proyecto completo con Docker Compose

### Contexto
Desplegar toda la arquitectura con Docker Compose y verificar el flujo completo.

### Requisitos
1. Dockerfile para cada microservicio (multi-stage build)
2. docker-compose.yml con todos los servicios
3. Health checks en cada contenedor
4. Volúmenes para datos persistentes (PostgreSQL, Redis)
5. Red interna para comunicación entre servicios
6. Script de inicialización de datos
7. Verificar flujo: login → crear producto → crear orden → ver trazas en Zipkin → ver métricas en Grafana

### Temas evaluados
- Docker, multi-stage builds
- Docker Compose, health checks
- Integración end-to-end
- DevOps fundamentals
