---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.create(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }
}

// --- Service: lógica de negocio ---
@Service
public class ProductService {
    private final ProductRepository repository;
    private final TaxCalculator taxCalculator;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final ProductMapper mapper;

    public ProductService(ProductRepository repository, TaxCalculator taxCalculator,
                          NotificationService notificationService, AuditService auditService,
                          ProductMapper mapper) {
        this.repository = repository; this.taxCalculator = taxCalculator;
        this.notificationService = notificationService; this.auditService = auditService;
        this.mapper = mapper;
    }

    public ProductResponse create(CreateProductRequest request) {
        Product product = mapper.toEntity(request);
        double tax = taxCalculator.calculate(request.getCategory(), request.getPrice());
        product.setTax(tax);
        product.setFinalPrice(request.getPrice() + tax);
        product = repository.save(product);
        notificationService.notifyNewProduct(product);
        auditService.log("Product created: " + product.getId());
        return mapper.toResponse(product);
    }

    public ProductResponse findById(Long id) {
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }
}

// --- Repository: persistencia ---
@Repository
public class ProductRepository {
    private final JdbcTemplate jdbc;

    public ProductRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Product save(Product product) {
        String sql = "INSERT INTO products (name, price, category, tax, final_price, created_at) "
            + "VALUES (?, ?, ?, ?, ?, NOW())";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, product.getName());
            ps.setDouble(2, product.getPrice());
            ps.setString(3, product.getCategory());
            ps.setDouble(4, product.getTax());
            ps.setDouble(5, product.getFinalPrice());
            return ps;
        }, keyHolder);
        product.setId(keyHolder.getKey().longValue());
        return product;
    }

    public Optional<Product> findById(Long id) {
        String sql = "SELECT * FROM products WHERE id = ?";
        try {
            Product product = jdbc.queryForObject(sql, new BeanPropertyRowMapper<>(Product.class), id);
            return Optional.ofNullable(product);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}

// --- NotificationService ---
@Service
public class NotificationService {
    private final JavaMailSender mailSender;
    @Value("${app.admin.email}") private String adminEmail;

    public NotificationService(JavaMailSender mailSender) { this.mailSender = mailSender; }

    public void notifyNewProduct(Product product) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(adminEmail);
        msg.setSubject("New product: " + product.getName());
        msg.setText("Product: " + product.getName() + "\nFinal price: $" + product.getFinalPrice());
        mailSender.send(msg);
    }
}

// --- AuditService ---
@Service
public class AuditService {
    public void log(String message) {
        System.out.println("[AUDIT] " + new Date() + " - " + message);
    }
}
```

**Posibles mejoras**:
- Reemplazar `ProductRepository` concreto por una interfaz `ProductRepository` con implementación `JdbcProductRepository`, aplicando DIP completo para que `ProductService` no dependa de `JdbcTemplate` ni siquiera transitivamente.
- Usar **Spring Data JPA** (`interface ProductRepository extends JpaRepository<Product, Long>`) para eliminar el SQL manual, reduciendo el boilerplate y los riesgos de SQL injection.
- Extraer `AuditService` a una interfaz con implementación `Slf4jAuditService` usando un logger real (SLF4J/Logback) en lugar de `System.out.println`, con niveles de log configurables.

---

## Ejercicio 3: Refactorización OCP + DIP
**Solución esperada**:

```java
// --- OCP: Abstracción para cálculo de impuestos ---
public interface TaxCalculator {
    double calculate(double price);
    boolean supports(String category);
}

@Component
public class ElectronicsTaxCalculator implements TaxCalculator {
    @Override public double calculate(double price) { return price * 0.19; }
    @Override public boolean supports(String category) { return "ELECTRONICS".equals(category); }
}

@Component
public class FoodTaxCalculator implements TaxCalculator {
    @Override public double calculate(double price) { return price * 0.05; }
    @Override public boolean supports(String category) { return "FOOD".equals(category); }
}

@Component
public class ClothingTaxCalculator implements TaxCalculator {
    @Override public double calculate(double price) { return price * 0.12; }
    @Override public boolean supports(String category) { return "CLOTHING".equals(category); }
}

@Component
public class BooksTaxCalculator implements TaxCalculator {
    @Override public double calculate(double price) { return 0; }
    @Override public boolean supports(String category) { return "BOOKS".equals(category); }
}

// --- DIP: Service depende de abstracción TaxCalculator ---
@Service
public class TaxCalculatorService implements TaxCalculator {
    private final List<TaxCalculator> calculators;

    public TaxCalculatorService(List<TaxCalculator> calculators) {
        this.calculators = calculators;
    }

    @Override
    public double calculate(double price) {
        throw new UnsupportedOperationException("Use calculate(category, price)");
    }

    public double calculate(String category, double price) {
        return calculators.stream()
            .filter(c -> c.supports(category))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown category: " + category))
            .calculate(price);
    }

    @Override
    public boolean supports(String category) {
        return calculators.stream().anyMatch(c -> c.supports(category));
    }
}

// --- DIP: ProductRepository como interfaz ---
public interface ProductRepository {
    Product save(Product product);
    Optional<Product> findById(Long id);
    List<Product> findAll();
}
```

**Posibles mejoras**:
- Separar `TaxCalculatorService` de la interfaz `TaxCalculator`: el servicio no debería implementar `TaxCalculator` sino ser un orquestador con un método `calculateForCategory`, eliminando el `UnsupportedOperationException` que viola LSP.
- Usar `@ConditionalOnProperty` en cada `TaxCalculator` para activar/desactivar categorías impositivas por configuración (ej. `books.tax.enabled=true`), permitiendo que cambios en legislación se apliquen sin deploy.
- Agregar un **caché** en `TaxCalculatorService` (`Map<String, TaxCalculator>`) para evitar recorrer el stream en cada cálculo, especialmente si hay 50+ categorías y el cálculo se llama miles de veces.

---

## Ejercicio 4: LSP + ISP + Seguridad
**Solución esperada**:

```java
// --- ISP: Interfaces pequeñas ---
public interface ProductReader {
    Optional<Product> findById(Long id);
    List<Product> findAll();
}
public interface ProductWriter {
    Product save(Product product);
}
public interface ReportGenerator {
    String generateProductReport();
}
public interface PromotionSender {
    void sendCategoryPromotions(String category);
}

// --- ProductRepository implementa interfaces pequeñas ---
@Repository
public class JdbcProductRepository implements ProductReader, ProductWriter {
    private final JdbcTemplate jdbc;
    public JdbcProductRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    public Product save(Product product) {
        String sql = "INSERT INTO products (name, price, category, tax, final_price, created_at) "
            + "VALUES (?, ?, ?, ?, ?, NOW())";
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, product.getName());
            ps.setDouble(2, product.getPrice());
            ps.setString(3, product.getCategory());
            ps.setDouble(4, product.getTax());
            ps.setDouble(5, product.getFinalPrice());
            return ps;
        }, kh);
        product.setId(kh.getKey().longValue());
        return product;
    }

    @Override
    public Optional<Product> findById(Long id) {
        String sql = "SELECT * FROM products WHERE id = ?";
        try {
            return Optional.ofNullable(jdbc.queryForObject(sql, new BeanPropertyRowMapper<>(Product.class), id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Product> findAll() {
        return jdbc.query("SELECT * FROM products", new BeanPropertyRowMapper<>(Product.class));
    }
}

// --- ReportService (SRP + ISP) ---
@Service
public class ProductReportService implements ReportGenerator {
    private final ProductReader productReader;
    public ProductReportService(ProductReader productReader) { this.productReader = productReader; }

    @Override
    public String generateProductReport() {
        List<Product> products = productReader.findAll();
        StringBuilder sb = new StringBuilder("PRODUCT REPORT\n==============\n");
        double total = 0;
        for (Product p : products) {
            sb.append(p.getName()).append(": $").append(p.getFinalPrice()).append("\n");
            total += p.getFinalPrice();
        }
        sb.append("TOTAL: $").append(total);
        return sb.toString();
    }
}

// --- Promotion Service (SRP + ISP + SQL Injection safe) ---
@Service
public class ProductPromotionService implements PromotionSender {
    private final JdbcTemplate jdbc;
    private final JavaMailSender mailSender;

    public ProductPromotionService(JdbcTemplate jdbc, JavaMailSender mailSender) {
        this.jdbc = jdbc; this.mailSender = mailSender;
    }

    @Override
    public void sendCategoryPromotions(String category) {
        // SQL Injection safe: usa parámetros con ?
        List<String> emails = jdbc.queryForList(
            "SELECT email FROM customers WHERE preferred_category = ?", String.class, category);
        for (String email : emails) {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject("Promotions in " + category);
            msg.setText("Check our new products in " + category);
            mailSender.send(msg);
        }
    }
}

// --- CategoryController refactorizado ---
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;
    public CategoryController(CategoryService categoryService) { this.categoryService = categoryService; }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(201).body(categoryService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll() {
        return ResponseEntity.ok(categoryService.findAll());
    }
}
```

**Posibles mejoras**:
- LSP: `ProductReportService` depende solo de `ProductReader`, no de `ProductWriter` — si algún día hay una implementación de solo lectura (ej. caché, vista materializada), se puede inyectar sin cambios y cumple LSP porque `ProductReader` no tiene métodos de escritura.
- ISP: `PromotionSender` tiene un solo método `sendCategoryPromotions` — un cliente de analytics que solo quiere enviar promociones no recibe `generateProductReport()`. Si el día de mañana se agrega `sendPersonalizedPromotions`, se crea otra interfaz en lugar de inflar `PromotionSender`.
- Seguridad: usar `JdbcTemplate` con parámetros posicionales (`?`) en lugar de concatenación de strings elimina la posibilidad de SQL injection en el 100% de los casos porque el driver JDBC escapa los parámetros automáticamente.

---

## Ejercicio 5: Manejo de Excepciones (Extra)
**Solución esperada**: El manejo centralizado de excepciones con `@ControllerAdvice` es una aplicación de SRP porque separa la lógica de manejo de errores de la lógica de negocio de los controllers.

**Posibles mejoras**:
- Usar **`@ExceptionHandler` con jerarquía de excepciones de dominio**: `BusinessException` (400), `ResourceNotFoundException` (404), `UnauthorizedException` (401), cada una mapeada a un handler específico con mensajes i18n.
- Agregar **`ProblemDetail` (RFC 7807)** en las respuestas de error para estandarizar el formato de errores HTTP (`type`, `title`, `status`, `detail`, `instance`) en todas las APIs.
- Implementar **métricas de errores** con Micrometer: contar excepciones por tipo y endpoint, exponiendo un dashboard de tasa de errores para detectar regresiones en producción.

