---
sidebar_label: "Clase"
---

## OCP en Spring

### @Bean y Configuración Programática

```java
@Configuration
public class TaxConfig {
    @Bean
    public TaxStrategy ivaStrategy() { return new IVAStrategy(0.19); }

    @Bean
    public TaxStrategy isrStrategy() { return new ISRStrategy(0.10); }

    @Bean
    public TaxCalculator taxCalculator(List<TaxStrategy> strategies) {
        return new TaxCalculator(strategies);
    }
}
```

### @ConditionalOnProperty

Permite activar/desactivar beans según configuración sin modificar código:

```java
@Component
@ConditionalOnProperty(name = "payment.gateway", havingValue = "stripe")
public class StripePaymentGateway implements PaymentGateway {
    // Solo se crea si payment.gateway=stripe
}

@Component
@ConditionalOnProperty(name = "payment.gateway", havingValue = "paypal")
public class PayPalPaymentGateway implements PaymentGateway {
    // Solo se crea si payment.gateway=paypal
}
```

### @ConditionalOnClass

```java
@Configuration
@ConditionalOnClass(name = "com.amazonaws.services.s3.AmazonS3")
public class AwsStorageConfig {
    @Bean
    public FileStorage s3Storage() {
        return new S3FileStorage();
    }
}
```

### @Profile

```java
@Service
@Profile("dev")
public class DevNotificationService implements NotificationService {
    @Override
    public void send(String to, String msg) {
        System.out.println("[DEV] " + msg);
    }
}

@Service
@Profile("prod")
public class ProdNotificationService implements NotificationService {
    @Override
    public void send(String to, String msg) {
        // AWS SES real
    }
}
```

---

## LSP en Spring

### @Qualifier

```java
public interface PaymentProcessor {
    PaymentResult process(Payment payment);
}

@Component
@Qualifier("credit")
public class CreditCardProcessor implements PaymentProcessor { ... }

@Component
@Qualifier("debit")
public class DebitCardProcessor implements PaymentProcessor { ... }

@Service
public class PaymentService {
    private final PaymentProcessor processor;

    public PaymentService(@Qualifier("credit") PaymentProcessor processor) {
        this.processor = processor;
    }
}
```

### @Primary

```java
@Component
@Primary
public class DefaultPaymentProcessor implements PaymentProcessor { ... }

@Component
public class SpecialPaymentProcessor implements PaymentProcessor { ... }

// Inyecta DefaultPaymentProcessor por defecto
@Service
public class CheckoutService {
    private final PaymentProcessor processor;
    public CheckoutService(PaymentProcessor processor) { this.processor = processor; }
}
```

### Perfiles para Sustitución

```java
// Implementaciones intercambiables mediante perfiles
@Service
@Profile("dev")
public class DevDataService implements DataService { ... }

@Service
@Profile("test")
public class TestDataService implements DataService { ... }

@Service
@Profile("prod")
public class ProdDataService implements DataService { ... }
```

---

## ISP en Spring

### CrudRepository vs JpaRepository

```java
// Si solo necesitas CRUD básico, depende de CrudRepository
public interface BookRepository extends CrudRepository<Book, Long> {
    List<Book> findByTitleContaining(String title);
}

// Si necesitas paginación, extiende PagingAndSortingRepository
public interface ProductRepository extends PagingAndSortingRepository<Product, Long> {
    Page<Product> findByCategory(String category, Pageable pageable);
}

// Si necesitas funcionalidades JPA avanzadas, extiende JpaRepository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o JOIN FETCH o.items")
    List<Order> findAllWithItems();
}
```

### Interfaces Funcionales en Spring

```java
@FunctionalInterface
public interface RowMapper<T> {
    T mapRow(ResultSet rs, int rowNum) throws SQLException;
}

// Spring usa interfaces funcionales en todas partes
// RowMapper, ConnectionCallback, StatementCallback, etc.
jdbcTemplate.query("SELECT * FROM users", (rs, rowNum) ->
    new User(rs.getLong("id"), rs.getString("name"))
);
```

---

## DIP en Spring

### Constructor Injection (Recomendado)

```java
@RestController
public class OrderController {
    private final OrderService orderService;
    private final OrderMapper orderMapper;

    // Spring inyecta automáticamente (no necesita @Autowired desde Spring 4.3+)
    public OrderController(OrderService orderService, OrderMapper orderMapper) {
        this.orderService = orderService;
        this.orderMapper = orderMapper;
    }
}
```

### ApplicationContext como Contenedor IoC

```java
@Component
public class StrategyProvider {
    private final ApplicationContext context;

    public StrategyProvider(ApplicationContext context) {
        this.context = context;
    }

    public TaxStrategy getStrategy(String taxType) {
        Map<String, TaxStrategy> strategies = context.getBeansOfType(TaxStrategy.class);
        return strategies.values().stream()
            .filter(s -> s.supports(taxType))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown tax: " + taxType));
    }
}
```

### Capas con DIP

```
Controller (depende de Service interface)
    ↓
Service Interface (definida en capa de aplicación)
    ↑
ServiceImpl (implementación concreta, depende de Repository interface)
    ↓
Repository Interface (definida en capa de dominio)
    ↑
JpaRepository (implementación Spring Data)
```

---

## Análisis de Código Spring: Catálogo de Violaciones

### Ejemplo: App Spring con Violaciones

```java
@RestController
public class UserController {

    @Autowired
    private JdbcTemplate jdbc; // Violación DIP: dependencia concreta

    @PostMapping("/users")
    public String createUser(@RequestBody User user) {
        // Violación SRP: validación + lógica + persistencia en controller
        if (user.getName() == null) return "Name required"; // SRP violado
        if (user.getEmail() == null || !user.getEmail().contains("@"))
            return "Invalid email";

        String sql = "INSERT INTO users (name, email) VALUES (?, ?)";
        jdbc.update(sql, user.getName(), user.getEmail());

        // Violación SRP: notificación desde controller
        sendWelcomeEmail(user.getEmail(), user.getName());
        return "User created";
    }

    private void sendWelcomeEmail(String email, String name) {
        // Lógica de email
    }

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        // Violación DIP: SQL directo en controller
        String sql = "SELECT * FROM users WHERE id = " + id; // SQL Injection!
        return jdbc.queryForObject(sql, User.class);
    }
}
```

### Refactorización Aplicando SOLID

```java
// --- SRP: Controller solo maneja HTTP ---
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @PostMapping
    public ResponseEntity<UserDTO> create(@RequestBody @Valid CreateUserRequest request) {
        UserDTO created = userService.create(request);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }
}

// --- OCP: Service interface + DIP ---
public interface UserService {
    UserDTO create(CreateUserRequest request);
    UserDTO findById(Long id);
}

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository repository;
    private final EmailService emailService;
    private final UserMapper mapper;

    public UserServiceImpl(UserRepository repository, EmailService emailService, UserMapper mapper) {
        this.repository = repository; this.emailService = emailService; this.mapper = mapper;
    }

    @Override
    public UserDTO create(CreateUserRequest request) {
        User user = mapper.toEntity(request);
        user = repository.save(user);
        emailService.sendWelcome(user.getEmail(), user.getName());
        return mapper.toDTO(user);
    }

    @Override
    public UserDTO findById(Long id) {
        return repository.findById(id)
            .map(mapper::toDTO)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

// --- ISP: Repository interface pequeña ---
@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

// --- LSP: Cualquier EmailService es sustituible ---
public interface EmailService {
    void sendWelcome(String email, String name);
}

@Service
@Profile("dev")
public class DevEmailService implements EmailService {
    @Override
    public void sendWelcome(String email, String name) {
        System.out.println("[DEV] Welcome email to " + email);
    }
}
```

---

## Resumen: Mapeo SOLID ↔ Spring

| Principio | Característica Spring | Ejemplo |
|-----------|----------------------|---------|
| **SRP** | @Controller, @Service, @Repository | Capas separadas, @ControllerAdvice |
| **OCP** | @Bean, @ConditionalOnProperty, @Profile | Estrategias intercambiables |
| **LSP** | @Qualifier, @Primary, Perfiles | Implementaciones sustituibles |
| **ISP** | CrudRepository, interfaces funcionales | Interfaces pequeñas y específicas |
| **DIP** | Constructor Injection, ApplicationContext | Dependencias inyectadas, no instanciadas |
