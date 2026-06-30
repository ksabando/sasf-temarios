---
sidebar_label: "Clase"
---

## El Problema: Acoplamiento Directo

```java
public class OrderService {

    private MySQLDatabase database;
    private SMTPEmailService emailService;
    private PDFGenerator pdfGenerator;

    public OrderService() {
        // Violación DIP: instanciación directa de dependencias concretas
        this.database = new MySQLDatabase("localhost", "root", "pass");
        this.emailService = new SMTPEmailService("smtp.gmail.com", 587);
        this.pdfGenerator = new PDFGenerator();
    }

    public void processOrder(Order order) {
        database.save(order);
        emailService.send(order.getCustomer().getEmail(), "Order confirmed");
        pdfGenerator.generate(order);
    }
}
```

**Problemas:**
- `OrderService` depende de implementaciones concretas (MySQL, SMTP, PDF)
- No se puede probar sin una BD real
- Cambiar de MySQL a PostgreSQL requiere modificar `OrderService`
- Las dependencias están ocultas (no visibles en la firma del constructor)

---

## Solución DIP: Abstracciones

```java
// Abstracciones (interfaces)
public interface Database {
    void save(Order order);
    Order findById(Long id);
}

public interface EmailService {
    void send(String to, String subject, String body);
}

public interface DocumentGenerator {
    byte[] generate(Order order);
}

// Implementaciones concretas (dependen de las abstracciones)
public class MySQLDatabase implements Database {
    @Override
    public void save(Order order) {
        System.out.println("MySQL: saving order " + order.getId());
    }

    @Override
    public Order findById(Long id) {
        System.out.println("MySQL: finding order " + id);
        return new Order();
    }
}

public class PostgreSQLDatabase implements Database {
    @Override
    public void save(Order order) {
        System.out.println("PostgreSQL: saving order " + order.getId());
    }

    @Override
    public Order findById(Long id) {
        System.out.println("PostgreSQL: finding order " + id);
        return new Order();
    }
}

public class SMTPEmailService implements EmailService {
    @Override
    public void send(String to, String subject, String body) {
        System.out.println("SMTP: sending to " + to);
    }
}

public class SendGridEmailService implements EmailService {
    @Override
    public void send(String to, String subject, String body) {
        System.out.println("SendGrid: sending to " + to);
    }
}

// Módulo de alto nivel depende de abstracciones
public class OrderService {
    private final Database database;
    private final EmailService emailService;
    private final DocumentGenerator documentGenerator;

    // DIP: depende de interfaces, no de implementaciones
    public OrderService(Database database,
                        EmailService emailService,
                        DocumentGenerator documentGenerator) {
        this.database = database;
        this.emailService = emailService;
        this.documentGenerator = documentGenerator;
    }

    public void processOrder(Order order) {
        database.save(order);
        emailService.send(order.getCustomerEmail(), "Order confirmed",
            "Your order #" + order.getId() + " has been processed.");
        documentGenerator.generate(order);
    }
}

// Configuración (decisiones de implementación se toman aquí)
public class ApplicationConfig {
    public OrderService createOrderService() {
        Database db = new PostgreSQLDatabase();
        EmailService email = new SendGridEmailService();
        DocumentGenerator pdf = new PDFGenerator();
        return new OrderService(db, email, pdf);
    }
}
```

---

## Capas con DIP: La Arquitectura en Cebolla

Sin DIP, las capas dependen hacia abajo:

```
Controller → Service → Repository → MySQL
  (alto nivel)          (bajo nivel)
```

Con DIP, todas las capas dependen de abstracciones:

```
Controller → Service Interface ← Service Impl
                ↓
         Repository Interface ← Repository Impl
                ↓
            Database (abstracción)
```

### Ejemplo completo:

```java
// === CAPA DE DOMINIO (abstracciones) ===
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findByCustomer(String email);
}

public interface OrderValidator {
    void validate(Order order);
}

public interface EmailNotifier {
    void sendConfirmation(Order order);
    void sendShippingUpdate(Order order);
}

// === CAPA DE APLICACIÓN (lógica de negocio) ===
@Service
public class OrderService {
    private final OrderRepository repository;
    private final OrderValidator validator;
    private final EmailNotifier notifier;

    public OrderService(OrderRepository repository,
                        OrderValidator validator,
                        EmailNotifier notifier) {
        this.repository = repository;
        this.validator = validator;
        this.notifier = notifier;
    }

    public Order createOrder(Order order) {
        validator.validate(order);
        repository.save(order);
        notifier.sendConfirmation(order);
        return order;
    }
}

// === CAPA DE INFRAESTRUCTURA (implementaciones) ===
@Repository
public class JpaOrderRepository implements OrderRepository {
    private final EntityManager em;

    public JpaOrderRepository(EntityManager em) {
        this.em = em;
    }

    @Override
    public void save(Order order) {
        em.persist(order);
    }

    @Override
    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(em.find(Order.class, id));
    }

    @Override
    public List<Order> findByCustomer(String email) {
        return em.createQuery("SELECT o FROM Order o WHERE o.customerEmail = :email",
            Order.class).setParameter("email", email).getResultList();
    }
}

@Component
public class BasicOrderValidator implements OrderValidator {
    @Override
    public void validate(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new ValidationException("Order must have items");
        }
    }
}

@Component
public class SmtpEmailNotifier implements EmailNotifier {
    @Override
    public void sendConfirmation(Order order) {
        System.out.println("Email confirmation sent for order " + order.getId());
    }

    @Override
    public void sendShippingUpdate(Order order) {
        System.out.println("Shipping update sent for order " + order.getId());
    }
}
```

---

## Dependency Injection en Spring

Spring IoC es el mecanismo que facilita DIP en el ecosistema Spring.

### Constructor Injection (Recomendado)

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    // Spring inyecta automáticamente la implementación
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody Order order) {
        Order created = orderService.createOrder(order);
        return ResponseEntity.status(201).body(created);
    }
}
```

### @Autowired vs Constructor Injection

```java
// MAL: Field injection (dificulta testing, dependencias ocultas)
@RestController
public class BadController {
    @Autowired
    private OrderService orderService; // Dependencia oculta
}

// BIEN: Constructor injection (dependencias explícitas, testable)
@RestController
public class GoodController {
    private final OrderService orderService;

    public GoodController(OrderService orderService) {
        this.orderService = orderService;
    }
}
```

### Configuración Explicita con @Bean

```java
@Configuration
public class AppConfig {
    @Bean
    public Database database() {
        // Puedes cambiar la implementación aquí sin tocar el resto
        return new PostgreSQLDatabase();
    }

    @Bean
    public OrderService orderService() {
        return new OrderService(database(), emailService(), pdfGenerator());
    }
}
```

---

## DIP en React: Hooks como Abstracción

En React, los custom hooks funcionan como abstracciones (interfaces) que ocultan
los detalles de implementación.

### Sin DIP (dependencia directa de fetch):

```tsx
// Componente acoplado a la implementación HTTP
function UserList() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Dependencia directa de fetch + URL concreta
        fetch("https://api.example.com/users")
            .then(r => r.json())
            .then(setUsers);
    }, []);

    return (
        <ul>
            {users.map(u => <li key={u.id}>{u.name}</li>)}
        </ul>
    );
}
```

### Con DIP (hook como abstracción):

```tsx
// Abstracción: interfaz del hook
interface UserService {
    getUsers(): Promise<User[]>;
    getUser(id: string): Promise<User | null>;
    createUser(user: CreateUserDTO): Promise<User>;
}

// Implementación concreta: API REST
function useApiUserService(): UserService {
    const baseUrl = "/api/users";

    return {
        getUsers: async () => {
            const res = await fetch(baseUrl);
            return res.json();
        },
        getUser: async (id: string) => {
            const res = await fetch(`${baseUrl}/${id}`);
            if (!res.ok) return null;
            return res.json();
        },
        createUser: async (user: CreateUserDTO) => {
            const res = await fetch(baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            return res.json();
        },
    };
}

// Implementación mock para testing
function useMockUserService(): UserService {
    const mockUsers: User[] = [
        { id: "1", name: "Mock User", email: "mock@test.com" },
    ];

    return {
        getUsers: async () => mockUsers,
        getUser: async (id: string) =>
            mockUsers.find(u => u.id === id) || null,
        createUser: async (user: CreateUserDTO) => ({
            ...user,
            id: String(mockUsers.length + 1),
        }),
    };
}

// Componente que depende de la abstracción, no de la implementación
function UserList({ userService = useApiUserService() }: {
    userService?: UserService;
}) {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        userService.getUsers().then(setUsers);
    }, [userService]);

    return (
        <ul>
            {users.map(u => <li key={u.id}>{u.name}</li>)}
        </ul>
    );
}

// En pruebas, inyectamos el mock
// <UserList userService={useMockUserService()} />
```

---

## Resumen: Guía Práctica de DIP

### Señales de que violas DIP

1. **Instancias directas con `new`** dentro de constructores o métodos
2. **Llamadas a métodos estáticos** de clases concretas
3. **Imports de implementaciones concretas** en lugar de interfaces
4. **Dependencias ocultas** (no visibles en el constructor)
5. **Dificultad para probar unitariamente** (necesitas BD real, API real)
6. **Código de configuración mezclado** con código de lógica de negocio

### Reglas de Oro

| Regla | Explicación |
|-------|-------------|
| Interfaces en el módulo cliente | La abstracción pertenece al cliente, no al proveedor |
| Inyección por constructor | Las dependencias deben ser explícitas e inmutables |
| No instanciar en constructores | Delega la creación al contenedor IoC |
| Factory o DI Container | Usa patrones de creación para separar construcción de uso |
| Variables de tipo interfaz | Declara variables como interfaz, no como implementación |

### DIP vs DI vs IoC

```
DIP (Principio) → "Depende de abstracciones, no de detalles"
    ↑
DI (Patrón) → "Inyecta dependencias desde fuera"
    ↑
IoC (Contenedor) → "Spring maneja el ciclo de vida e inyección"
```
