---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Sistema de eventos con Kafka

### application.yml
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      properties:
        enable.idempotence: true
        max.in.flight.requests.per.connection: 5
    consumer:
      group-id: order-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
```

### KafkaTopicConfig.java
```java
package com.sasf.kafkaorders.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic orderEventsTopic() {
        return new NewTopic("order.events", 3, (short) 1);
    }
}
```

### OrderKafkaProducer.java
```java
package com.sasf.kafkaorders.producer;

import com.sasf.kafkaorders.event.OrderEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class OrderKafkaProducer {

    @Autowired
    private KafkaTemplate<String, OrderEvent> kafkaTemplate;

    public void sendOrder(OrderEvent event) {
        CompletableFuture<SendResult<String, OrderEvent>> future =
            kafkaTemplate.send("order.events",
                event.getOrderId().toString(),
                event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                System.out.println("Sent message to partition "
                    + result.getRecordMetadata().partition()
                    + " with offset " + result.getRecordMetadata().offset());
            } else {
                System.err.println("Failed to send message: " + ex.getMessage());
            }
        });
    }
}
```

### OrderKafkaConsumer.java
```java
package com.sasf.kafkaorders.consumer;

import com.sasf.kafkaorders.event.OrderEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
public class OrderKafkaConsumer {

    @KafkaListener(topics = "order.events", groupId = "order-group",
        concurrency = "3")
    public void consumeOrderEvent(
            @Payload OrderEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        System.out.println("Consumer " + Thread.currentThread().getName()
            + " - Partition: " + partition
            + ", Offset: " + offset
            + ", Order: " + event.getOrderId());

        try {
            Thread.sleep((long) (1000 + Math.random() * 2000));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("Processed order " + event.getOrderId()
            + " on partition " + partition);
    }
}
```

---

## Ejercicio 4: Consumidor idempotente

```java
package com.sasf.kafkaconsumer.consumer;

import com.sasf.kafkaconsumer.event.OrderEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
public class IdempotentConsumer {

    private final ConcurrentHashMap<String, Boolean> processedEvents =
        new ConcurrentHashMap<>();

    @KafkaListener(topics = "order.events", groupId = "order-idempotent-group")
    public void consume(OrderEvent event, Acknowledgment acknowledgment) {
        String eventId = event.getEventId();

        // Verificar si ya fue procesado
        Boolean isNew = processedEvents.putIfAbsent(eventId, true);

        if (isNew == null) {
            // No se ha procesado antes
            System.out.println("Processing new event: " + eventId);
            processEvent(event);
            acknowledgment.acknowledge();
        } else {
            System.out.println("Skipping duplicate event: " + eventId);
            acknowledgment.acknowledge(); // Reconocer igualmente
        }
    }

    private void processEvent(OrderEvent event) {
        System.out.println("Order " + event.getOrderId()
            + " processed (idempotent)");
    }
}
```

---

## Ejercicio 5: Spring Cloud Stream

### application.yml (RabbitMQ)
```yaml
spring:
  cloud:
    stream:
      bindings:
        orderSupplier-out-0:
          destination: order-events
        processOrder-in-0:
          destination: order-events
        processOrder-out-0:
          destination: processed-orders
        orderConsumer-in-0:
          destination: processed-orders
      rabbit:
        bindings:
          orderSupplier-out-0:
            producer:
              routing-key-expression: headers.type
```

### application.yml (Kafka)
```yaml
spring:
  cloud:
    stream:
      bindings:
        orderSupplier-out-0:
          destination: order-events
        processOrder-in-0:
          destination: order-events
        processOrder-out-0:
          destination: processed-orders
        orderConsumer-in-0:
          destination: processed-orders
      kafka:
        binder:
          brokers: localhost:9092
          auto-create-topics: true
```

### OrderStreamConfig.java
```java
package com.sasf.streamdemo.config;

import com.sasf.streamdemo.event.OrderEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

@Configuration
public class OrderStreamConfig {

    private final Random random = new Random();
    private int counter = 0;

    @Bean
    public Supplier<OrderEvent> orderSupplier() {
        return () -> {
            counter++;
            OrderEvent event = new OrderEvent();
            event.setEventId(java.util.UUID.randomUUID().toString());
            event.setOrderId((long) counter);
            event.setProductId((long) (random.nextInt(10) + 1));
            event.setQuantity(random.nextInt(5) + 1);
            event.setTimestamp(LocalDateTime.now());
            event.setStatus("NEW");
            System.out.println("Generated: " + event);
            return event;
        };
    }

    @Bean
    public Function<OrderEvent, OrderEvent> processOrder() {
        return event -> {
            System.out.println("Processing order " + event.getOrderId());
            event.setStatus("PROCESSED");
            event.setProcessedTimestamp(LocalDateTime.now());
            return event;
        };
    }

    @Bean
    public Consumer<OrderEvent> orderConsumer() {
        return event -> System.out.println("Saving order " + event.getOrderId()
            + " with status " + event.getStatus());
    }
}
```

