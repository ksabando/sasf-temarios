---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Solución Ejercicio 3

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI taskFlowOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("TaskFlow API")
                        .description("REST API for managing tasks")
                        .version("1.0.0"))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Provide a Bearer JWT token")));
    }
}
```

---

## Solución Ejercicio 4

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI taskFlowOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TaskFlow API")
                        .version("1.0.0")
                        .description("REST API for managing tasks"))
                .servers(List.of(
                        new Server()
                                .url("https://api.tasks.sudamericana.edu.py")
                                .description("Production server"),
                        new Server()
                                .url("http://localhost:8080")
                                .description("Development server")
                ));
    }
}
```

---

## Solución Ejercicio 5

**application.properties**

```properties
app.api.title=TaskFlow API
app.api.description=REST API for managing tasks
app.api.version=1.0.0
```

**OpenApiConfig.java**

```java
@Configuration
public class OpenApiConfig {

    @Value("${app.api.title}")
    private String apiTitle;

    @Value("${app.api.description}")
    private String apiDescription;

    @Value("${app.api.version}")
    private String apiVersion;

    @Bean
    public OpenAPI taskFlowOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title(apiTitle)
                        .description(apiDescription)
                        .version(apiVersion));
    }
}
```

