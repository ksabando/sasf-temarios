---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución 3: Inyección por constructor

```java
// UserRepository.java
package com.example;

import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class UserRepository {
    public List<String> findAll() {
        return List.of("Alice", "Bob", "Charlie");
    }
}
```

```java
// UserService.java
package com.example;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<String> getUsers() {
        return userRepository.findAll();
    }
}
```

```java
// AppConfig.java
package com.example;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackages = "com.example")
public class AppConfig {
}
```

```java
// Main.java
package com.example;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class Main {
    public static void main(String[] args) {
        try (AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(AppConfig.class)) {
            UserService userService = context.getBean(UserService.class);
            System.out.println("Usuarios: " + userService.getUsers());
        }
    }
}
```

---

## Solución 4: Singleton vs Prototype

```java
// CounterService.java
package com.example;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
public class CounterService {
    private int count = 0;

    public int incrementAndGet() {
        return ++count;
    }
}
```

```java
// RequestScopeBean.java
package com.example;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class RequestScopeBean {
    private int count = 0;

    public int incrementAndGet() {
        return ++count;
    }
}
```

```java
// AppConfig.java
package com.example;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackages = "com.example")
public class AppConfig {
}
```

```java
// Main.java
package com.example;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class Main {
    public static void main(String[] args) {
        try (AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(AppConfig.class)) {
            System.out.println("=== Singleton ===");
            CounterService s1 = context.getBean(CounterService.class);
            CounterService s2 = context.getBean(CounterService.class);
            CounterService s3 = context.getBean(CounterService.class);
            System.out.println("s1: " + s1.incrementAndGet());
            System.out.println("s2: " + s2.incrementAndGet());
            System.out.println("s3: " + s3.incrementAndGet());

            System.out.println("\n=== Prototype ===");
            RequestScopeBean p1 = context.getBean(RequestScopeBean.class);
            RequestScopeBean p2 = context.getBean(RequestScopeBean.class);
            RequestScopeBean p3 = context.getBean(RequestScopeBean.class);
            System.out.println("p1: " + p1.incrementAndGet());
            System.out.println("p2: " + p2.incrementAndGet());
            System.out.println("p3: " + p3.incrementAndGet());
        }
    }
}
```

**Explicación**: El singleton mantiene una sola instancia compartida (el contador continúa desde 1, 2, 3), mientras que prototype crea una nueva instancia cada vez (cada una parte desde 1).

---

## Solución 5: @Qualifier

```java
// NotificationService.java
package com.example;

public interface NotificationService {
    void send(String message);
}
```

```java
// EmailNotification.java
package com.example;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
@Qualifier("email")
public class EmailNotification implements NotificationService {
    @Override
    public void send(String message) {
        System.out.println("Enviando EMAIL: " + message);
    }
}
```

```java
// SmsNotification.java
package com.example;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
@Qualifier("sms")
public class SmsNotification implements NotificationService {
    @Override
    public void send(String message) {
        System.out.println("Enviando SMS: " + message);
    }
}
```

```java
// PushNotification.java
package com.example;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
@Qualifier("push")
public class PushNotification implements NotificationService {
    @Override
    public void send(String message) {
        System.out.println("Enviando PUSH: " + message);
    }
}
```

```java
// NotificationManager.java
package com.example;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class NotificationManager {
    private final NotificationService emailService;
    private final NotificationService smsService;
    private final NotificationService pushService;

    public NotificationManager(
            @Qualifier("email") NotificationService emailService,
            @Qualifier("sms") NotificationService smsService,
            @Qualifier("push") NotificationService pushService) {
        this.emailService = emailService;
        this.smsService = smsService;
        this.pushService = pushService;
    }

    public void sendAll(String message) {
        emailService.send(message);
        smsService.send(message);
        pushService.send(message);
    }
}
```

```java
// AppConfig.java
package com.example;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackages = "com.example")
public class AppConfig {
}
```

```java
// Main.java
package com.example;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class Main {
    public static void main(String[] args) {
        try (AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(AppConfig.class)) {
            NotificationManager manager = context.getBean(NotificationManager.class);
            manager.sendAll("¡Bienvenido al curso Spring Boot 3!");
        }
    }
}
```

