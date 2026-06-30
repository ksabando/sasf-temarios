---
sidebar_label: "Clase"
---

## 3. Auto-Configuration y @SpringBootApplication

`@SpringBootApplication` es una anotación compuesta que incluye:

```java
@SpringBootApplication = @Configuration
                      + @EnableAutoConfiguration
                      + @ComponentScan
```

### @EnableAutoConfiguration
Spring Boot examina el classpath y configura automáticamente:
- Si encuentra `spring-webmvc` → configura DispatcherServlet
- Si encuentra `DataSource` + `hibernate` → configura EntityManagerFactory
- Si encuentra `Thymeleaf` → configura TemplateEngine

### Cómo funciona internamente
```java
// Meta-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
org.springframework.boot.autoconfigure.web.servlet.DispatcherServletAutoConfiguration
org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration
// ...
```

Cada auto-configuración usa `@ConditionalOnClass`, `@ConditionalOnMissingBean`, etc.:

```java
@Configuration
@ConditionalOnClass(DispatcherServlet.class)
public class DispatcherServletAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    public DispatcherServlet dispatcherServlet() {
        return new DispatcherServlet();
    }
}
```

---

## 4. Creación de proyecto con Spring Initializr

### Opciones en start.spring.io:
- **Project**: Maven o Gradle
- **Language**: Java, Kotlin, Groovy
- **Spring Boot**: 3.2.x
- **Group**: com.example
- **Artifact**: mi-aplicacion
- **Packaging**: Jar (recomendado) o War
- **Java**: 17

### Estructura de proyecto Maven típica:
```
mi-aplicacion/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/example/
│   │   │   └── MiAplicacionApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── static/
│   │       └── templates/
│   └── test/
│       └── java/com/example/
│           └── MiAplicacionApplicationTests.java
```

---

## 5. Embedded Tomcat y alternativas

Spring Boot usa Tomcat por defecto (embebido vía `spring-boot-starter-web`).

### Cambiar a Jetty:
```xml
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
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
```

### Cambiar a Undertow:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>
```

### Configuración del servidor en `application.properties`:
```properties
server.port=8080
server.servlet.context-path=/api
server.compression.enabled=true
server.compression.mime-types=application/json,application/xml
```

---

## 6. spring-boot-maven-plugin

### Principales goals:

| Goal | Descripción |
|------|-------------|
| `spring-boot:run` | Ejecuta la aplicación directamente |
| `spring-boot:package` | Empaqueta en JAR/WAR ejecutable |
| `spring-boot:build-image` | Crea imagen Docker con Buildpacks |

```bash
# Ejecutar
mvn spring-boot:run

# Empaquetar
mvn package
java -jar target/mi-aplicacion-0.0.1-SNAPSHOT.jar
```

---

## 7. Primer @RestController

```java
package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MiAplicacionApplication {
    public static void main(String[] args) {
        SpringApplication.run(MiAplicacionApplication.class, args);
    }
}
```

```java
package com.example.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SaludarController {

    @GetMapping("/saludo")
    public String saludar() {
        return "¡Hola desde Spring Boot 3!";
    }

    @GetMapping("/saludo/{nombre}")
    public String saludarPersona(@PathVariable String nombre) {
        return "¡Hola, " + nombre + "!";
    }

    @PostMapping("/saludo")
    public String saludarPost(@RequestBody String mensaje) {
        return "Recibido: " + mensaje;
    }
}
```

```properties
# application.properties
server.port=8080
spring.application.name=mi-aplicacion
```
