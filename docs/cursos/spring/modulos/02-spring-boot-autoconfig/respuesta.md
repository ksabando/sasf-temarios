---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución 3: Cambiar a Undertow

```xml
<!-- pom.xml (solo las partes modificadas) -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <exclusions>
            <exclusion>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-tomcat</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-undertow</artifactId>
    </dependency>
    <!-- resto de dependencias -->
</dependencies>
```

```properties
# application.properties
server.port=9090
server.undertow.threads.io=4
server.undertow.threads.worker=20
spring.application.name=saludar-app-undertow
```

```java
// Main (sin cambios)
// ...
```

**Verificación:** La aplicación arranca en el puerto 9090 usando Undertow en lugar de Tomcat.

---

## Solución 4: Explorar auto-configuración con --debug

**Ejecutar:**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"
```
O empaquetar y ejecutar:
```bash
java -jar target/saludar-app-0.0.1-SNAPSHOT.jar --debug
```

**Reporte de auto-configuración (ejemplo):**

**Matched (3 ejemplos):**
1. `DispatcherServletAutoConfiguration` — matched porque `DispatcherServlet` está en classpath (spring-webmvc)
2. `JacksonAutoConfiguration` — matched porque `ObjectMapper` está en classpath
3. `EmbeddedWebServerFactoryCustomizerAutoConfiguration` — matched porque se detectó Undertow/Tomcat

**Rejected (3 ejemplos):**
1. `DataSourceAutoConfiguration` — rejected porque no hay `DataSource` en classpath (falta driver JDBC)
2. `JpaRepositoriesAutoConfiguration` — rejected porque no hay `EntityManagerFactory`
3. `FlywayAutoConfiguration` — rejected porque no hay `Flyway` en classpath

**Explicación:** Spring Boot usa condiciones (`@ConditionalOnClass`, `@ConditionalOnMissingBean`, `@ConditionalOnProperty`) para decidir qué configuraciones aplicar basándose en las dependencias presentes en el classpath y las propiedades definidas.

---

## Solución 5: Starter personalizado

### Estructura del starter
```
saludar-spring-boot-starter/
```

### pom.xml del starter
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.sudamericana</groupId>
    <artifactId>saludar-spring-boot-starter</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
            <version>3.2.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <version>3.2.0</version>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>
```

```java
// SaludarProperties.java
package com.sudamericana.starter;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "saludar")
public class SaludarProperties {
    private String mensaje = "Hola Mundo";

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
```

```java
// SaludarService.java
package com.sudamericana.starter;

public class SaludarService {
    private final String mensaje;

    public SaludarService(String mensaje) {
        this.mensaje = mensaje;
    }

    public String saludar() {
        return mensaje;
    }

    public String saludar(String nombre) {
        return mensaje + ", " + nombre + "!";
    }
}
```

```java
// SaludarAutoConfiguration.java
package com.sudamericana.starter;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@EnableConfigurationProperties(SaludarProperties.class)
@ConditionalOnProperty(prefix = "saludar", name = "enabled", havingValue = "true", matchIfMissing = true)
public class SaludarAutoConfiguration {

    @Bean
    public SaludarService saludarService(SaludarProperties properties) {
        return new SaludarService(properties.getMensaje());
    }
}
```

```
# src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
com.sudamericana.starter.SaludarAutoConfiguration
```

### Aplicación consumidora
```java
@SpringBootApplication
public class MiApp {
    public static void main(String[] args) {
        SpringApplication.run(MiApp.class, args);
    }
}
```

```java
@RestController
@RequestMapping("/api")
public class SaludarController {
    private final SaludarService saludarService;

    public SaludarController(SaludarService saludarService) {
        this.saludarService = saludarService;
    }

    @GetMapping("/saludar")
    public String saludar() {
        return saludarService.saludar();
    }
}
```

```properties
# application.properties
saludar.mensaje=¡Hola desde mi starter personalizado!
saludar.enabled=true
```

