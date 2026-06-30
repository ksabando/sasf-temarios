---
sidebar_label: "Clase"
---

## 3. @ConfigurationProperties con @Validated

Agrupa propiedades relacionadas en objetos tipados:

```java
@Component
@ConfigurationProperties(prefix = "app")
@Validated
public class AppProperties {
    @NotBlank
    private String name;

    @Min(1024)
    @Max(65535)
    private int port = 8080;

    private Email email = new Email();
    private Features features = new Features();

    // Getters y setters...

    public static class Email {
        @Email
        private String from;
        @NotEmpty
        private List<String> recipients;
        // getters y setters...
    }

    public static class Features {
        private boolean reportsEnabled = true;
        private boolean cachingEnabled = false;
        // getters y setters...
    }
}
```

```properties
# application.properties
app.name=Mi Aplicación
app.port=9090
app.email.from=noreply@example.com
app.email.recipients=admin@example.com,support@example.com
app.features.reports-enabled=true
app.features.caching-enabled=false
```

**Con spring-boot-configuration-processor** genera metadata para autocompletado en IDE.

---

## 4. @Profile para Configuración por Entorno

```yaml
# application.yml multi-documento
spring:
  application:
    name: mi-app
---
spring:
  config:
    activate:
      on-profile: dev

server:
  port: 8080

logging:
  level:
    com.example: DEBUG

datasource:
  url: jdbc:h2:mem:devdb
---
spring:
  config:
    activate:
      on-profile: prod

server:
  port: 80

logging:
  level:
    com.example: WARN

datasource:
  url: jdbc:postgresql://prod-server:5432/proddb
```

### Archivos específicos por perfil:
```
application.properties        # Propiedades comunes
application-dev.properties    # Propiedades para desarrollo
application-prod.properties   # Propiedades para producción
application-test.properties   # Propiedades para pruebas
```

```properties
# application.properties (común)
spring.profiles.active=dev
```

---

## 5. SLF4J + Logback

Spring Boot usa **SLF4J** como fachada de logging y **Logback** como implementación por defecto.

### Niveles de log (de mayor a menor prioridad):
| Nivel | Propósito |
|-------|-----------|
| ERROR | Errores que impiden continuar |
| WARN | Situaciones inesperadas no críticas |
| INFO | Información de flujo normal (default) |
| DEBUG | Información detallada para depuración |
| TRACE | Traza exhaustiva |

### Configuración en application.properties:
```properties
logging.level.root=INFO
logging.level.com.example=DEBUG
logging.level.org.springframework.web=TRACE

logging.file.name=logs/mi-app.log
logging.file.max-size=10MB
logging.file.max-history=7
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

---

## 6. logback-spring.xml

Configuración avanzada de Logback con soporte para perfiles:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <property name="LOG_FILE" value="logs/mi-app.log"/>

    <!-- Appender para consola -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${CONSOLE_LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <!-- Appender para archivo -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.gz</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <!-- Logging por perfil -->
    <springProfile name="dev">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
            <appender-ref ref="FILE"/>
        </root>
        <logger name="com.example" level="DEBUG"/>
    </springProfile>

    <springProfile name="prod">
        <root level="WARN">
            <appender-ref ref="FILE"/>
        </root>
        <logger name="com.example" level="INFO"/>
    </springProfile>
</configuration>
```

### Uso en código Java:
```java
@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public List<User> findAll() {
        log.debug("Obteniendo todos los usuarios");
        List<User> users = userRepository.findAll();
        log.info("Se encontraron {} usuarios", users.size());
        return users;
    }
}
```
