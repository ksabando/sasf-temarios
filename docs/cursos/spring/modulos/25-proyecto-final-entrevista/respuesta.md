---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: JPA avanzado con consultas y transacciones

### OrderService.java
```java
package com.sasf.order.service;

import com.sasf.order.entity.Order;
import com.sasf.order.entity.OrderItem;
import com.sasf.order.entity.OrderStatus;
import com.sasf.order.repository.OrderRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerEmail(request.getCustomerEmail());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        double total = 0;
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findByIdWithLock(itemReq.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(product.getPrice());
            item.setOrder(order);
            order.getItems().add(item);

            total += product.getPrice() * itemReq.getQuantity();
        }

        order.setTotal(total);
        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<DailySalesReport> getDailySalesReport(LocalDateTime date) {
        return orderRepository.getDailySalesReport(date);
    }
}
```

### ProductRepository.java
```java
package com.sasf.order.repository;

import com.sasf.order.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);
}
```

---

## Ejercicio 4: Spring Security con JWT y Keycloak

### SecurityConfig.java
```java
package com.sasf.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(Customizer.withDefaults())
            );
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder
            .withJwkSetUri("http://localhost:8081/realms/ecommerce/protocol/openid-connect/certs")
            .build();
    }
}
```

### ProductController con @PreAuthorize
```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<Product> getAll() { ... }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product create(@Valid @RequestBody Product product) { ... }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product update(@PathVariable Long id, @Valid @RequestBody Product product) { ... }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) { ... }
}
```

---

## Ejercicio 5: AOP, Async y Cache

### LogExecutionTimeAspect.java
```java
package com.sasf.common.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LogExecutionTimeAspect {

    @Around("@annotation(LogExecutionTime)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long elapsed = System.currentTimeMillis() - start;
        System.out.println(joinPoint.getSignature() + " executed in " + elapsed + "ms");
        return result;
    }
}
```

### EmailService.java
```java
@Service
public class EmailService {

    @Async
    public CompletableFuture<Void> sendConfirmation(String email, Long orderId) {
        System.out.println("Sending confirmation email to " + email
            + " for order " + orderId
            + " on thread " + Thread.currentThread().getName());
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println("Email sent to " + email);
        return CompletableFuture.completedFuture(null);
    }
}
```

### ProductService con caché Redis
```java
@Service
public class ProductService {

    @Cacheable(value = "products", key = "#id", unless = "#result == null")
    public Optional<Product> findById(Long id) {
        System.out.println("Fetching from database: product " + id);
        return productRepository.findById(id);
    }

    @CacheEvict(value = "products", key = "#product.id")
    public Product update(Product product) {
        return productRepository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    @Scheduled(cron = "0 0 * * * ?")
    public void clearCache() {
        System.out.println("Clearing products cache");
    }
}
```

---

## Ejercicio 6: Microservicios con Config Server y Eureka

*(Ver respuestas completas del Módulo 21 para implementación detallada)*

```yaml
# bootstrap.yml (cada microservicio)
spring:
  application:
    name: product-service
  cloud:
    config:
      uri: http://config-server:8888
      fail-fast: true

eureka:
  client:
    service-url:
      defaultZone: http://discovery-server:8761/eureka/
```

---

## Ejercicio 7: Gateway con Resilience4j

*(Ver respuestas completas del Módulo 22)*

```java
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("product-service", r -> r
                .path("/api/products/**")
                .filters(f -> f
                    .circuitBreaker(config -> config
                        .setName("productCB")
                        .setFallbackUri("forward:/fallback/products"))
                    .retry(config -> config
                        .setRetries(3)
                        .setStatuses(HttpStatus.SERVICE_UNAVAILABLE)))
                .uri("lb://product-service"))
            .route("order-service", r -> r.path("/api/orders/**")
                .uri("lb://order-service"))
            .build();
    }
}
```

---

## Ejercicio 8: Mensajería asíncrona

*(Ver respuestas completas del Módulo 23)*

---

## Ejercicio 9: Monitoreo completo

*(Ver respuestas completas del Módulo 24)*

---

## Ejercicio 10: Docker Compose completo

### docker-compose.yml (resumen)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
    volumes:
      - postgres_data:/var/lib/postgresql/data

  config-server:
    build: ./config-server
    ports: ["8888:8888"]
    depends_on: { postgres: { condition: service_healthy } }

  discovery-server:
    build: ./discovery-server
    ports: ["8761:8761"]
    depends_on: [config-server]

  product-service:
    build: ./product-service
    ports: ["8081:8081"]
    depends_on: [config-server, discovery-server, postgres]
    environment:
      - SPRING_PROFILES_ACTIVE=docker

  order-service:
    build: ./order-service
    ports: ["8082:8082"]
    depends_on: [config-server, discovery-server, postgres]

  user-service:
    build: ./user-service
    ports: ["8083:8083"]
    depends_on: [config-server, discovery-server, postgres]

  gateway:
    build: ./gateway-service
    ports: ["8080:8080"]
    depends_on: [discovery-server, keycloak]

  prometheus:
    image: prom/prometheus
    volumes: ["./prometheus.yml:/etc/prometheus/prometheus.yml"]
    ports: ["9090:9090"]

  grafana:
    image: grafana/grafana
    ports: ["3000:3000"]

  zipkin:
    image: openzipkin/zipkin
    ports: ["9411:9411"]

volumes:
  postgres_data:
```

