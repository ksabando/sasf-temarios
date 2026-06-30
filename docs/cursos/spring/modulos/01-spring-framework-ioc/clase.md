---
sidebar_label: "Clase"
---

## 3. ApplicationContext vs BeanFactory

| Característica | BeanFactory | ApplicationContext |
|---------------|-------------|-------------------|
| Inicialización | Lazy (bajo demanda) | Eager (al arrancar) |
| Internacionalización | No | Sí (MessageSource) |
| Eventos | No | Sí (ApplicationEvent) |
| AOP / Post-Processors | Manual | Automático |
| Uso recomendado | Dispositivos con recursos limitados | Aplicaciones web/empresariales |

```java
// BeanFactory
BeanFactory factory = new XmlBeanFactory(new ClassPathResource("beans.xml"));
MyBean bean = factory.getBean(MyBean.class);

// ApplicationContext (recomendado)
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
MyBean bean = context.getBean(MyBean.class);
```

---

## 4. Tipos de Inyección de Dependencias

### 4.1 Inyección por campo (no recomendada)
```java
@Component
public class UserController {
    @Autowired
    private UserService userService;
}
```

### 4.2 Inyección por setter
```java
@Component
public class UserController {
    private UserService userService;

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }
}
```

### 4.3 Inyección por constructor (recomendada)
```java
@Component
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
}
```
**Ventajas**: inmutabilidad, testabilidad, detección de dependencias faltantes en compilación.

---

## 5. Configuración: XML vs Anotaciones vs Java Config

### XML (legado)
```xml
<beans xmlns="http://www.springframework.org/schema/beans">
    <bean id="greetingService" class="com.example.GreetingService"/>
    <bean id="greetingController" class="com.example.GreetingController">
        <constructor-arg ref="greetingService"/>
    </bean>
</beans>
```

### Anotaciones
```java
@Component
public class GreetingService {
    public String greet() { return "Hola Mundo"; }
}

@RestController
public class GreetingController {
    @Autowired private GreetingService service;
}
```

### Java Config (recomendado moderno)
```java
@Configuration
public class AppConfig {
    @Bean
    public GreetingService greetingService() {
        return new GreetingService();
    }

    @Bean
    public GreetingController greetingController() {
        return new GreetingController(greetingService());
    }
}
```

---

## 6. Ciclo de Vida de ApplicationContext

1. **Instanciación**: Se crea el contexto y se cargan las configuraciones
2. **BeanDefinition**: Se leen y registran las definiciones de beans
3. **Post-Procesamiento**: BeanFactoryPostProcessors modifican definiciones
4. **Instanciación de beans**: Se crean instanzas de singleton (eager)
5. **Inyección de dependencias**: Se resuelven y asignan dependencias
6. **Inicialización**: @PostConstruct, InitializingBean
7. **Listo**: La aplicación puede usar los beans
8. **Destrucción**: @PreDestroy, DisposableBean al cerrar con `context.close()`

```java
try (AnnotationConfigApplicationContext context =
        new AnnotationConfigApplicationContext(AppConfig.class)) {
    GreetingController controller = context.getBean(GreetingController.class);
    System.out.println(controller.sayHello());
}
```

---

## 7. Ejemplo Completo: HelloWorldService

```java
// Servicio
public class GreetingService {
    public String getGreeting() {
        return "¡Hola desde Spring IoC!";
    }
}

// Controlador
public class GreetingController {
    private final GreetingService greetingService;

    public GreetingController(GreetingService greetingService) {
        this.greetingService = greetingService;
    }

    public void printGreeting() {
        System.out.println(greetingService.getGreeting());
    }
}

// Configuración
@Configuration
public class AppConfig {
    @Bean
    public GreetingService greetingService() {
        return new GreetingService();
    }

    @Bean
    public GreetingController greetingController() {
        return new GreetingController(greetingService());
    }
}

// Main
public class Main {
    public static void main(String[] args) {
        try (AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(AppConfig.class)) {
            GreetingController controller = context.getBean(GreetingController.class);
            controller.printGreeting();
        }
    }
}
```

---

## 8. Buenas Prácticas

- **Preferir inyección por constructor** sobre field/setter injection
- **Usar interfaces** para desacoplar implementaciones
- **Configurar scopes** adecuadamente (singleton por defecto para stateless)
- **Evitar @Autowired** en campos privados
- **Usar @Configuration + @Bean** en lugar de XML
- **Validar dependencias** en tiempo de compilación (constructor final)
- **Aprovechar @Qualifier y @Primary** para desambiguar
