---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M11 — Patrones en Spring

## Ejercicio 1: Identificar Patrones en Spring Boot

**Solución esperada**:

| Componente | Patrón | Justificación |
|---|---|---|
| `CrudRepository.save()` | **Template Method** | Define el esqueleto de operaciones CRUD (abrir sesión, ejecutar SQL, cerrar). Spring Data JPA implementa la lógica genérica; el desarrollador solo define la interfaz. |
| `@Autowired` constructor | **Dependency Injection** | El contenedor IoC inyecta las dependencias en el constructor. Es la implementación del principio de Inversión de Control. |
| `WebMvcConfigurer.addInterceptors()` | **Chain of Responsibility** | Los interceptores se ejecutan en cadena: cada uno decide si procesa o pasa al siguiente. El orden de registro define la secuencia. |
| `RestTemplate.exchange()` | **Template Method** | Define el esqueleto de una petición HTTP: construir request → ejecutar → manejar respuesta. Los callbacks personalizan partes del proceso. |
| `@Bean` en `@Configuration` | **Factory Method** | El método anotado con `@Bean` es un Factory Method: crea una instancia y la registra en el contenedor. El tipo de retorno define el producto. |
| `PlatformTransactionManager` | **Strategy** | Define una interfaz para gestionar transacciones. Las implementaciones concretas (DataSourceTM, JpaTM, HibernateTM) son estrategias intercambiables. |

**Posibles mejoras**:
- Agregar `BeanPostProcessor` como **Proxy dinámico masivo**: `AutowiredAnnotationBeanPostProcessor`, `CommonAnnotationBeanPostProcessor`, y `PersistenceExceptionTranslationPostProcessor` son proxies que envuelven beans después de su creación para agregar capacidades de inyección, manejo de anotaciones y traducción de excepciones respectivamente.
- Para `PlatformTransactionManager`, mencionar que también implementa **Abstract Factory** porque `getTransaction()` devuelve `TransactionStatus` + `TransactionDefinition` como familia de objetos transaccionales consistentes, no solo un producto aislado.
- Agregar `ApplicationContext` como **Composite + Facade**: `ApplicationContext` extiende múltiples interfaces (`ListableBeanFactory`, `ResourceLoader`, `ApplicationEventPublisher`) formando un Composite de responsabilidades, y actúa como Facade del contenedor entero.

## Ejercicio 2: Aspecto de Rendimiento (AOP Proxy)

**Solución esperada**:

```java
@Aspect
@Component
public class PerformanceAspect {

    private static final Logger log = LoggerFactory.getLogger(PerformanceAspect.class);

    @Around("execution(* com.patrones..service.*.*(..))")
    public Object measureTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.nanoTime();
        Object result = joinPoint.proceed();
        long elapsed = System.nanoTime();
        long ms = (elapsed - start) / 1_000_000;

        String signature = joinPoint.getSignature().toShortString();
        if (ms > 1000) {
            log.warn("[SLOW] {} - {}ms", signature, ms);
        } else {
            log.info("[PERF] {} - {}ms", signature, ms);
        }
        return result;
    }
}
```

**Posibles mejoras**:
- **Agregar métricas con Micrometer**: en lugar de solo loggear, exportar las métricas a Prometheus/InfluxDB con `Timer.Sample` de Micrometer. Esto permite dashboards en Grafana, percentiles p95/p99 y alertas automáticas cuando el p99 supera un umbral.
- **Incluir información de argumentos**: `joinPoint.getArgs()` para identificar qué parámetros causan lentitud (ej. un `findById` rápido para IDs pequeños pero lento para IDs con muchos joins). Añadir los argumentos al log con `@Loggable` o manualmente, cuidando no exponer datos sensibles (tarjetas, contraseñas).
- **Muestreo para entornos de producción**: en producción, medir solo el 1% de las llamadas (`if (ThreadLocalRandom.current().nextInt(100) < 1)`) para reducir el overhead del aspect. Spring Cloud Sleuth ya hace esto con `TraceInterceptor`.

## Ejercicio 3: Sistema de Eventos (@EventListener)

**Solución esperada**:

```java
// Eventos
public class PedidoCreadoEvent extends ApplicationEvent {
    private final Long idPedido; private final String cliente;
    private final Double total; private final LocalDate fecha;
    // constructor, getters...
}

public class PedidoPagadoEvent extends ApplicationEvent {
    private final Long idPedido; private final String metodoPago;
    // constructor, getters...
}

// Publicador
@Service
public class PedidoService {
    @Autowired private ApplicationEventPublisher publisher;

    @Transactional
    public void crearPedido(Pedido pedido) {
        repo.save(pedido);
        publisher.publishEvent(new PedidoCreadoEvent(this, pedido.getId(), pedido.getCliente(), pedido.getTotal(), LocalDate.now()));
    }

    public void pagarPedido(Long id, String metodo) {
        publisher.publishEvent(new PedidoPagadoEvent(this, id, metodo));
    }
}

// Oyentes
@Component
class InventarioListener {
    @EventListener @Async
    public void onPedidoCreado(PedidoCreadoEvent e) {
        System.out.println("[INVENTARIO] Actualizando stock para pedido " + e.getIdPedido());
    }
}

@Component
class NotificacionListener {
    @EventListener @Async
    public void onPedidoCreado(PedidoCreadoEvent e) {
        System.out.println("[NOTIFICACION] Email enviado a " + e.getCliente() + " por pedido " + e.getIdPedido());
    }
}

@Component
class FacturacionListener {
    @EventListener @Async
    public void onPedidoPagado(PedidoPagadoEvent e) {
        System.out.println("[FACTURA] Generando factura para pedido " + e.getIdPedido());
    }
}

@Component
class AuditoriaListener {
    @EventListener @Async
    public void onEvent(Object event) {
        System.out.println("[AUDITORIA] Evento: " + event.getClass().getSimpleName());
    }
}
```

**Posibles mejoras**:
- **Usar `@TransactionalEventListener` para consistencia transaccional**: los listeners que actualizan inventario o envían notificaciones deberían ejecutarse solo después del commit de la transacción (`@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`). Si la transacción rollea, el evento no se publica, evitando notificar por un pedido que nunca se persistió.
- **Agregar error handling robusto**: `@Async` + `@EventListener` sin try-catch silencia excepciones. Implementar `AsyncUncaughtExceptionHandler` o usar `CompletableFuture` para capturar fallos y mover eventos fallidos a una cola de dead-letter para reintento.
- **Versionado de eventos con Avro/Protobuf**: en lugar de clases Java planas, usar esquemas versionados con Apache Avro o Protocol Buffers. Esto permite que productores y consumidores evolucionen independientemente y que eventos persistan en un Event Store (Kafka) con retrocompatibilidad.

## Ejercicio 4: Cadena de Filtros HTTP

**Solución esperada**:

```java
@Component @Order(1)
class LoggingFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        long start = System.currentTimeMillis();
        chain.doFilter(req, res);
        long ms = System.currentTimeMillis() - start;
        System.out.println("[LOG] " + req.getMethod() + " " + req.getRequestURI() + " - " + ms + "ms");
    }
}

@Component @Order(2)
class RateLimitFilter extends OncePerRequestFilter {
    private Map<String, Integer> counts = new HashMap<>();
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        String ip = req.getRemoteAddr();
        int c = counts.getOrDefault(ip, 0) + 1;
        counts.put(ip, c);
        if (c > 100) { res.setStatus(429); res.getWriter().write("Too Many Requests"); return; }
        chain.doFilter(req, res);
    }
}

@Component @Order(3)
class ApiKeyFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        String key = req.getHeader("X-API-Key");
        if (key == null || !key.equals("secret-key-123")) {
            res.setStatus(401); res.getWriter().write("Invalid API Key"); return;
        }
        chain.doFilter(req, res);
    }
}
```

**Posibles mejoras**:
- **Usar Bucket4j para rate limiting real**: el `HashMap<String, Integer>` sin expiración es un memory leak y no modela ventanas de tiempo. Reemplazar con `Bucket4j` (basado en token bucket) que limita a N requests por minuto con ventana deslizante y limpia automáticamente entradas expiradas.
- **Externalizar API keys con Spring Security**: en lugar de hardcodear `"secret-key-123"`, integrar con `AuthenticationManager` y `ApiKeyAuthenticationFilter` de Spring Security, almacenando keys en BD o HashiCorp Vault. El filtro delegaría en un `ApiKeyRepository` inyectado.
- **Agregar correlation ID**: `LoggingFilter` debería generar o propagar un `X-Correlation-ID` (de la request entrante o nuevo) y ponerlo en el MDC (`MDC.put("correlationId", id)`). `chain.doFilter()` debe wrappearse para limpiar el MDC en `finally`. Esto permite tracear una request a través de múltiples servicios en logging centralizado.

## Ejercicio 5: Starter con FactoryBean

**Solución esperada**:

```java
// GreetingService
public class GreetingService {
    private final String prefix;
    GreetingService(String prefix) { this.prefix = prefix; }
    public String greet(String name) { return prefix + ", " + name + "!"; }
}

// FactoryBean
@Component
public class GreetingFactoryBean implements FactoryBean<GreetingService> {
    @Value("${greeting.prefix:Hola}")
    private String prefix;

    public GreetingService getObject() { return new GreetingService(prefix); }
    public Class<?> getObjectType() { return GreetingService.class; }
    public boolean isSingleton() { return true; }
}

// Auto-configuration
@Configuration
@ConditionalOnClass(GreetingService.class)
@EnableConfigurationProperties(GreetingProperties.class)
public class GreetingAutoConfiguration {
    @Bean @ConditionalOnMissingBean
    public GreetingService greetingService(GreetingProperties props) {
        return new GreetingService(props.getPrefix());
    }
}

@ConfigurationProperties(prefix = "greeting")
public class GreetingProperties {
    private String prefix = "Hola";
    // getter/setter...
}

// application.properties
greeting.prefix=¡Hola
```

**Posibles mejoras**:
- **Agregar soporte multi-idioma**: `GreetingProperties` podría incluir `Map<String, String> prefixes` indexado por código de idioma (`es=¡Hola`, `en=Hello`). Un `LocaleResolver` en la request determina el idioma y `GreetingService` selecciona el prefijo correcto.
- **Auto-configuración condicional por perfil**: `@Profile("!test")` en `GreetingAutoConfiguration` para que en tests de integración se use un `GreetingService` mock y no falle por properties ausentes. También `@ConditionalOnMissingBean` para permitir overrides en tests.
- **Publicar el starter en un registry Maven**: empaquetar el starter como `greeting-spring-boot-starter` con `spring.factories` en `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` (Spring Boot 3+) para que otros proyectos puedan usarlo agregando solo la dependencia, sin configuración adicional.

