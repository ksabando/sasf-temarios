---
sidebar_label: "Clase"
---

## Spring Cloud Config Client

**Dependencias:**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

**bootstrap.yml** (archivo de arranque):
```yaml
spring:
  application:
    name: product-service
  cloud:
    config:
      uri: http://localhost:8888
      fail-fast: true
      retry:
        initial-interval: 1000
        max-attempts: 5
```

**Uso de configuración:**
```java
@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Value("${app.max-products}")
    private int maxProducts;

    @ConfigurationProperties(prefix = "app")
    @Component
    public static class AppConfig {
        private int maxProducts;
        // getters y setters
    }
}
```

### Refresh manual
```java
@RestController
@RequestMapping("/api/config")
@RefreshScope
public class ConfigController {

    @Value("${app.max-products}")
    private int maxProducts;

    @GetMapping("/max-products")
    public String getMaxProducts() {
        return "Max products: " + maxProducts;
    }
}
```

Endpoint: `POST /actuator/refresh` en el cliente

---

## Spring Cloud Bus + RabbitMQ

Spring Cloud Bus propaga eventos de refresco a todos los microservicios conectados usando un broker de mensajes (RabbitMQ o Kafka).

**Dependencias:**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

**Configuración en cada servicio:**
```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

management:
  endpoints:
    web:
      exposure:
        include: bus-refresh
```

**Flujo de actualización:**
1. Se modifica un archivo en el repositorio Git
2. Se ejecuta `POST /actuator/bus-refresh` en el Config Server
3. Spring Cloud Bus propaga el evento a través de RabbitMQ
4. Todos los clientes con `@RefreshScope` recargan su configuración

---

## Eureka Server (Service Discovery)

Eureka es un registro de servicios donde los microservicios se registran al iniciar y se dan de baja al detenerse.

### Eureka Server

**Dependencias:**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

**Clase principal:**
```java
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServiceApplication.class, args);
    }
}
```

**application.yml:**
```yaml
server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    register-with-eureka: false
    fetch-registry: false
  server:
    enable-self-preservation: false
```

### Eureka Client

**Dependencias:**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

**application.yml:**
```yaml
spring:
  application:
    name: product-service

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${random.int}
```

---

## Spring Cloud LoadBalancer con @LoadBalanced

Spring Cloud LoadBalancer reemplaza a Netflix Ribbon para balanceo de carga del lado del cliente.

**Configuración:**
```java
@Configuration
public class AppConfig {

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

**Uso en un servicio:**
```java
@Service
public class ProductClientService {

    @Autowired
    private RestTemplate restTemplate;

    public Product getProduct(Long id) {
        // Usa el nombre del servicio en Eureka
        return restTemplate.getForObject(
            "http://product-service/api/products/{id}",
            Product.class,
            id
        );
    }
}
```

### WebClient con LoadBalancer
```java
@Configuration
public class WebClientConfig {

    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}

@Service
public class OrderService {

    @Autowired
    private WebClient.Builder webClientBuilder;

    public Mono<Product> getProduct(Long id) {
        return webClientBuilder.build()
            .get()
            .uri("http://product-service/api/products/{id}", id)
            .retrieve()
            .bodyToMono(Product.class);
    }
}
```

### Personalizar LoadBalancer
```java
@Configuration
public class LoadBalancerConfig {

    @Bean
    public ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
            loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name
        );
    }
}
```

---

## Resumen del flujo completo

1. **Config Server** arranca en puerto 8888, apunta a repositorio Git
2. **Eureka Server** arranca en puerto 8761
3. **Microservicios** arrancan, obtienen configuración de Config Server y se registran en Eureka
4. Las peticiones entre servicios usan nombres lógicos (`product-service`) y Spring Cloud LoadBalancer resuelve la instancia
5. Para cambios de configuración, se envía `POST /actuator/bus-refresh` y Spring Cloud Bus propaga el refresco
