---
sidebar_label: "Clase"
---

# Módulo 11 — Patrones GoF en Spring Boot

## Introducción

Spring Boot es un framework que **aplica intensivamente los patrones GoF**. Comprender Spring desde la perspectiva de patrones ayuda a usarlo mejor y a reconocer por qué está diseñado como está.

## IoC / Dependency Injection — El Patrón Central

Spring se basa en **Inversión de Control (IoC)** : el framework controla el flujo y llama al código del desarrollador, no al revés.

```java
// Sin Spring: el objeto crea sus dependencias (alto acoplamiento)
public class PedidoService {
    private PedidoRepository repo = new PedidoRepository(); // acoplamiento fuerte
}

// Con Spring DI: las dependencias son inyectadas
@Service
public class PedidoService {
    private final PedidoRepository repo;

    // Inyección por constructor (recomendado)
    public PedidoService(PedidoRepository repo) {
        this.repo = repo;
    }
}

@Repository
public class PedidoRepository {
    public List<Pedido> findAll() { /* ... */ }
}
```

### Tipos de Inyección

| Tipo | Cómo | Recomendado |
|------|------|-------------|
| Constructor | `public Clase(Dependencia dep)` | ✅ Siempre que sea posible |
| Setter | `@Autowired setDep(Dependencia d)` | ❌ Para dependencias opcionales |
| Campo | `@Autowired Dependencia dep` | ❌ Dificulta testing |

## Singleton — Beans por Defecto

En Spring, todos los beans son **singleton por defecto** (alcance `singleton`). Una sola instancia por contenedor IoC.

```java
@Component
@Scope("singleton") // por defecto, se puede omitir
public class PedidoService {
    // Una instancia compartida para toda la aplicación
}

// Otros scopes disponibles
@Scope("prototype")    // nueva instancia cada vez que se solicita
@Scope("request")      // una instancia por petición HTTP
@Scope("session")      // una instancia por sesión HTTP
@Scope("application")  // una instancia por ServletContext
```

### Singleton thread-safe

Los beans singleton de Spring son thread-safe **solo si no tienen estado** (stateless). Los servicios sin estado mutable son seguros para concurrencia.

## Proxy — AOP (Programación Orientada a Aspectos)

Spring crea **proxies** dinámicos para implementar aspectos transversales.

### @Transactional

```java
@Service
public class PedidoService {

    @Transactional
    public void crearPedido(Pedido pedido) {
        // Spring crea un proxy transactional
        // 1. Inicia transacción
        // 2. Ejecuta método
        // 3. Commit si ok, rollback si excepción
        repo.save(pedido);
    }
}
```

### @Cacheable

```java
@Service
public class ProductoService {

    @Cacheable("productos")
    public Producto getProducto(Long id) {
        // Spring crea un proxy de caché
        // Si el resultado está en caché, no ejecuta el método
        return repo.findById(id).orElseThrow();
    }
}

// Cache eviction
@CacheEvict(value = "productos", key = "#producto.id")
public void actualizarProducto(Producto producto) { }
```

### @Async

```java
@Async
public CompletableFuture<String> procesarPago(Pago pago) {
    // Spring crea un proxy que ejecuta en un hilo separado
    return CompletableFuture.completedFuture("OK");
}
```

### AOP personalizado

```java
@Aspect
@Component
public class LoggingAspect {

    @Around("execution(* com.patrones..service.*.*(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long elapsed = System.currentTimeMillis() - start;
        System.out.println(joinPoint.getSignature() + " ejecutado en " + elapsed + "ms");
        return result;
    }
}
```

## Template Method — JdbcTemplate, RestTemplate

Spring usa ampliamente el patrón Template Method para operaciones que siguen un esqueleto fijo.

```java
// JdbcTemplate: abre conexión → ejecuta query → mapea → cierra
JdbcTemplate jdbc = new JdbcTemplate(dataSource);

List<Pedido> pedidos = jdbc.query(
    "SELECT * FROM pedidos WHERE cliente = ?",
    new BeanPropertyRowMapper<>(Pedido.class),
    "Juan"
);

// RestTemplate: construye request → ejecuta → parsea respuesta
RestTemplate rest = new RestTemplate();
Producto producto = rest.getForObject(
    "https://api.productos.com/{id}",
    Producto.class,
    123
);

// JmsTemplate: crea sesión → envía mensaje → cierra
JmsTemplate jms = new JmsTemplate(connectionFactory);
jms.convertAndSend("ordenes.queue", pedido);
```

## Factory Method — @Bean

Spring usa Factory Method a través de la anotación `@Bean` en clases `@Configuration`.

```java
@Configuration
public class AppConfig {

    @Bean
    public PedidoService pedidoService() {
        return new PedidoService(); // Factory Method explícito
    }

    @Bean
    @Scope("prototype")
    public Notificador notificador() {
        return new EmailNotificador();
    }
}

// FactoryBean (implementación avanzada)
@Component
public class MyServiceFactory implements FactoryBean<MyService> {
    public MyService getObject() { return new MyService(); }
    public Class<?> getObjectType() { return MyService.class; }
    public boolean isSingleton() { return false; }
}
```

## Observer — ApplicationEventPublisher

Spring implementa Observer mediante el sistema de eventos.

```java
// Evento
public class PedidoCreadoEvent extends ApplicationEvent {
    private final Pedido pedido;
    public PedidoCreadoEvent(Object source, Pedido pedido) {
        super(source);
        this.pedido = pedido;
    }
    public Pedido getPedido() { return pedido; }
}

// Publicador
@Component
public class PedidoEventPublisher {

    @Autowired
    private ApplicationEventPublisher publisher;

    public void publicarPedidoCreado(Pedido pedido) {
        publisher.publishEvent(new PedidoCreadoEvent(this, pedido));
    }
}

// Oyente (Observer)
@Component
public class NotificacionListener {

    @EventListener
    @Async // opcional: ejecutar en hilo separado
    public void handlePedidoCreado(PedidoCreadoEvent event) {
        System.out.println("Notificación: Pedido " + event.getPedido().getId() + " creado");
    }
}

// Múltiples oyentes
@Component
class EstadisticasListener {
    @EventListener public void handle(PedidoCreadoEvent e) { /* actualizar stats */ }
}

@Component
class AuditoriaListener {
    @EventListener public void handle(PedidoCreadoEvent e) { /* auditar */ }
}
```

## Chain of Responsibility — SecurityFilterChain

Spring Security usa Chain of Responsibility para procesar peticiones HTTP.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
                .requestMatchers("/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .addFilterBefore(new MiFiltroPersonalizado(), UsernamePasswordAuthenticationFilter.class)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}

// Filtro personalizado
public class MiFiltroPersonalizado extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain) throws IOException, ServletException {
        System.out.println("Filtro personalizado ejecutado");
        chain.doFilter(request, response); // pasa al siguiente en la cadena
    }
}
```

## Adapter — HandlerAdapter

Spring MVC usa HandlerAdapter para adaptar diferentes tipos de handlers a una interfaz común.

```java
// Interfaz HandlerAdapter (Spring internals)
public interface HandlerAdapter {
    boolean supports(Object handler);
    ModelAndView handle(HttpServletRequest request,
                        HttpServletResponse response,
                        Object handler) throws Exception;
}

// Implementaciones concretas
// - RequestMappingHandlerAdapter (para @RequestMapping methods)
// - SimpleControllerHandlerAdapter (para Controller interface)
// - HttpRequestHandlerAdapter (para HttpRequestHandler)
```

## Decorator — SecurityFilterChain

Los filtros de seguridad actúan como Decorators: cada filtro envuelve al siguiente agregando comportamiento.

```java
// Orden de filtros en Spring Security (parcial)
// 1. SecurityContextPersistenceFilter
// 2. LogoutFilter
// 3. UsernamePasswordAuthenticationFilter
// 4. DefaultLoginPageGeneratingFilter
// 5. BasicAuthenticationFilter
// 6. RequestCacheAwareFilter
// 7. SecurityContextHolderAwareRequestFilter
// 8. AnonymousAuthenticationFilter
// 9. SessionManagementFilter
// 10. ExceptionTranslationFilter
// 11. FilterSecurityInterceptor
```

## Facade — JdbcTemplate, CrudRepository

JdbcTemplate y CrudRepository son fachadas que simplifican APIs complejas.

```java
// Sin Facade: JDBC puro
Connection conn = dataSource.getConnection();
PreparedStatement ps = conn.prepareStatement("SELECT * FROM pedidos WHERE id = ?");
ps.setLong(1, id);
ResultSet rs = ps.executeQuery();
// ... mapear manualmente
rs.close(); ps.close(); conn.close();

// Con Facade (JdbcTemplate)
Pedido pedido = jdbc.queryForObject(
    "SELECT * FROM pedidos WHERE id = ?",
    new BeanPropertyRowMapper<>(Pedido.class),
    id
);

// Con Facade (CrudRepository)
public interface PedidoRepository extends CrudRepository<Pedido, Long> {
    List<Pedido> findByCliente(String cliente);
}
```
