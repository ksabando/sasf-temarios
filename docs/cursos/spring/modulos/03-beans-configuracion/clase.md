---
sidebar_label: "Clase"
---

## 3. Ciclo de Vida de un Bean

### @PostConstruct y @PreDestroy
```java
@Component
public class ConexionService {
    @PostConstruct
    public void init() {
        System.out.println("Inicializando conexión...");
    }

    @PreDestroy
    public void destroy() {
        System.out.println("Cerrando conexión...");
    }
}
```

### InitializingBean y DisposableBean (alternativa programática)
```java
@Component
public class ConexionService implements InitializingBean, DisposableBean {

    @Override
    public void afterPropertiesSet() {
        System.out.println("InitializingBean: conexión iniciada");
    }

    @Override
    public void destroy() {
        System.out.println("DisposableBean: conexión cerrada");
    }
}
```

### Orden de inicialización:
1. Constructor
2. Inyección de dependencias
3. `@PostConstruct` / `afterPropertiesSet()`
4. `@Bean(initMethod = "init")` (método personalizado)
5. Bean listo para usar
6. `@PreDestroy` / `destroy()` al cerrar el contexto

---

## 4. Scopes (Ámbitos)

```java
@Component
@Scope("singleton")  // Por defecto, una instancia por contenedor
public class SingletonService { }

@Component
@Scope("prototype")  // Nueva instancia cada vez que se solicita
public class PrototypeService { }

@Component
@Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)  // Una por sesión HTTP
public class UsuarioSession { }

@Component
@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)  // Una por petición HTTP
public class PeticionInfo { }
```

### Constantes recomendadas:
```java
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.web.context.WebApplicationContext;

@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Scope(WebApplicationContext.SCOPE_SESSION)
@Scope(WebApplicationContext.SCOPE_REQUEST)
```

---

## 5. @Primary, @Qualifier, @Lazy, @Scope

### @Primary
Indica el bean preferido cuando hay múltiples candidatos:
```java
@Component
@Primary
public class BaseDatosService implements AlmacenamientoService { }

@Component
public class ArchivoService implements AlmacenamientoService { }
```

### @Qualifier
Desambiguación explícita:
```java
@Component
@Qualifier("pdf")
public class PdfGenerador implements DocumentoGenerador { }

@Component
@Qualifier("excel")
public class ExcelGenerador implements DocumentoGenerador { }

@Service
public class ReporteService {
    private final DocumentoGenerador generador;

    public ReporteService(@Qualifier("pdf") DocumentoGenerador generador) {
        this.generador = generador;
    }
}
```

### @Lazy
Retrasa la creación del bean hasta que sea solicitado:
```java
@Component
@Lazy
public class ServicioPesado {
    public ServicioPesado() {
        System.out.println("ServicioPesado creado (lazy)");
    }
}
```

### @Scope personalizado
```java
@Component
@Scope("prototype")
@Lazy
public class EscanerService { }
```

---

## 6. @Import para Combinar Configuraciones

```java
@Configuration
public class DatabaseConfig {
    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .build();
    }
}

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

@Configuration
@Import({DatabaseConfig.class, SecurityConfig.class})
public class AppConfig {
    // Configuración principal
}
```

---

## 7. Perfiles de Bean Definition

Los perfiles permiten activar/desactivar beans según el entorno:

```java
@Configuration
@Profile("dev")
public class DevConfig {
    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .build();
    }
}

@Configuration
@Profile("prod")
public class ProdConfig {
    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:postgresql://localhost:5432/proddb")
                .username("prod")
                .password("${DB_PASSWORD}")
                .build();
    }
}
```

```properties
# application.properties
spring.profiles.active=dev
```
