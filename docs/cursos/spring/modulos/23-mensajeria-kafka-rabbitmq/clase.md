---
sidebar_label: "Clase"
---

## Spring Cloud Stream

Spring Cloud Stream es una abstracción sobre los brokers de mensajes (RabbitMQ, Kafka, etc.) que permite cambiar de implementación sin modificar el código.

### Dependencias
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
</dependency>
<!-- O para Kafka -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-kafka</artifactId>
</dependency>
```

### Definición de interfaces funcionales

```java
@Configuration
public class OrderStreamConfig {

    @Bean
    public Supplier<OrderEvent> orderSupplier() {
        return () -> new OrderEvent("ORDER_CREATED", generateOrder());
    }

    @Bean
    public Function<OrderEvent, OrderEvent> processOrder() {
        return event -> {
            System.out.println("Processing: " + event);
            event.setStatus("PROCESSED");
            return event;
        };
    }

    @Bean
    public Consumer<OrderEvent> orderConsumer() {
        return event -> System.out.println("Received: " + event);
    }
}
```
