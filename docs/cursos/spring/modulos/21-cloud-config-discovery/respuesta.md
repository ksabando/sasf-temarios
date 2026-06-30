---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: LoadBalancer Round-Robin personalizado

**CustomLoadBalancerConfiguration.java**
```java
package com.sasf.serviceb.config;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.loadbalancer.core.RandomLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ReactorLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ServiceInstanceListSupplier;
import org.springframework.cloud.loadbalancer.support.LoadBalancerClientFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class CustomLoadBalancerConfiguration {

    @Bean
    public ReactorLoadBalancer<ServiceInstance> reactorLoadBalancer(
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

**Servicio A - Controller**
```java
@RestController
@RequestMapping("/api/service-a")
public class ServiceAController {

    @Value("${server.port}")
    private String port;

    @Value("${spring.application.instance-id:unknown}")
    private String instanceId;

    @GetMapping("/info")
    public Map<String, String> getInfo() {
        return Map.of(
            "instanceId", instanceId,
            "port", port
        );
    }
}
```

---

## Ejercicio 4: WebClient LoadBalanced

**WebClientConfig.java**
```java
@Configuration
public class WebClientConfig {

    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
```

**UserClientService.java**
```java
@Service
public class UserClientService {

    private final WebClient webClient;

    public UserClientService(@LoadBalanced WebClient.Builder builder) {
        this.webClient = builder.build();
    }

    public Mono<List<User>> getUsers() {
        return webClient.get()
            .uri("http://user-service/api/users")
            .retrieve()
            .bodyToFlux(User.class)
            .collectList()
            .onErrorResume(e -> {
                System.err.println("Error calling user-service: " + e.getMessage());
                return Mono.just(List.of());
            });
    }
}
```

---

## Ejercicio 5: Multi-perfil con Config Server

**config-repo/product-service-dev.yml**
```yaml
server:
  port: 8081

app:
  environment: "DESARROLLO"
  salutation: "Bienvenido a Product Service - DEV"
```

**config-repo/product-service-prod.yml**
```yaml
server:
  port: 8080

app:
  environment: "PRODUCCION"
  salutation: "Bienvenido a Product Service - PROD"
```

**Bootstrap con perfil**
```yaml
# bootstrap.yml
spring:
  application:
    name: product-service
  cloud:
    config:
      uri: http://localhost:8888
  profiles:
    active: dev
```

