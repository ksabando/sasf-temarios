---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución 3: Perfiles con múltiples configuraciones

```properties
# application.properties
spring.profiles.active=dev
```

```properties
# application-dev.properties
server.port=8080
logging.level.com.example=DEBUG
```

```properties
# application-test.properties
server.port=8081
logging.level.com.example=INFO
```

```properties
# application-prod.properties
server.port=80
logging.level.com.example=WARN
```

```java
// MessageService.java
package com.example.service;

public interface MessageService {
    String getMessage();
}
```

```java
// DevMessageService.java
package com.example.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("dev")
public class DevMessageService implements MessageService {
    @Override
    public String getMessage() {
        return "[DEV] Sistema en desarrollo - depuración activa";
    }
}
```

```java
// TestMessageService.java
package com.example.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("test")
public class TestMessageService implements MessageService {
    @Override
    public String getMessage() {
        return "[TEST] Sistema en pruebas - validación activa";
    }
}
```

```java
// ProdMessageService.java
package com.example.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("prod")
public class ProdMessageService implements MessageService {
    @Override
    public String getMessage() {
        return "[PROD] Sistema en producción - monitoreo activo";
    }
}
```

```java
// PerfilController.java
package com.example.controller;

import com.example.service.MessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PerfilController {
    private final MessageService messageService;

    @Value("${spring.profiles.active}")
    private String perfilActivo;

    public PerfilController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/perfil")
    public Map<String, String> getPerfil() {
        return Map.of(
            "perfil-activo", perfilActivo,
            "mensaje", messageService.getMessage()
        );
    }
}
```

---

## Solución 4: Logging con SLF4J

```java
// CalculadoraService.java
package com.example.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class CalculadoraService {
    private static final Logger log = LoggerFactory.getLogger(CalculadoraService.class);

    public int sumar(int a, int b) {
        int resultado = a + b;
        log.info("Suma: {} + {} = {}", a, b, resultado);
        return resultado;
    }

    public int restar(int a, int b) {
        int resultado = a - b;
        log.debug("Resta: {} - {} = {}", a, b, resultado);
        return resultado;
    }

    public int multiplicar(int a, int b) {
        int resultado = a * b;
        log.trace("Multiplicación: {} * {} = {}", a, b, resultado);
        return resultado;
    }

    public int dividir(int a, int b) {
        if (b == 0) {
            log.warn("Intento de división por cero: {} / {}", a, b);
            throw new ArithmeticException("No se puede dividir por cero");
        }
        int resultado = a / b;
        log.info("División: {} / {} = {}", a, b, resultado);
        return resultado;
    }
}
```

```java
// CalculadoraController.java
package com.example.controller;

import com.example.service.CalculadoraService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CalculadoraController {
    private final CalculadoraService calculadoraService;

    public CalculadoraController(CalculadoraService calculadoraService) {
        this.calculadoraService = calculadoraService;
    }

    @GetMapping("/calcular")
    public Map<String, Object> calcular(
            @RequestParam String op,
            @RequestParam int a,
            @RequestParam int b) {
        int resultado = switch (op) {
            case "suma" -> calculadoraService.sumar(a, b);
            case "resta" -> calculadoraService.restar(a, b);
            case "multiplicacion" -> calculadoraService.multiplicar(a, b);
            case "division" -> calculadoraService.dividir(a, b);
            default -> throw new IllegalArgumentException("Operación no soportada: " + op);
        };
        return Map.of("operacion", op, "resultado", resultado);
    }
}
```

---

## Solución 5: logback-spring.xml con perfil

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <property name="LOG_FILE" value="logs/mi-app.log"/>

    <!-- Appender para consola -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} %highlight(%-5level) [%thread] %cyan(%logger{36}) - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Appender para archivo rotativo -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>7</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Perfil: desarrollo -->
    <springProfile name="dev">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
        </root>
        <logger name="com.example" level="DEBUG"/>
    </springProfile>

    <!-- Perfil: producción -->
    <springProfile name="prod">
        <root level="INFO">
            <appender-ref ref="FILE"/>
        </root>
        <logger name="com.example" level="INFO"/>
        <logger name="org.springframework" level="WARN"/>
    </springProfile>

    <!-- Perfil: pruebas -->
    <springProfile name="test">
        <root level="WARN">
            <appender-ref ref="CONSOLE"/>
        </root>
        <logger name="com.example" level="WARN"/>
    </springProfile>
</configuration>
```

