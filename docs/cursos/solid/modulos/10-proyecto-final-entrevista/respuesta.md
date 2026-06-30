---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

### SRP: Controladores Separados
**Solución esperada**:

```java
@RestController @RequestMapping("/api/books")
public class BookController {
    private final BookService bookService;
    public BookController(BookService bookService) { this.bookService = bookService; }
    @GetMapping public ResponseEntity<List<BookResponse>> getAll() { return ResponseEntity.ok(bookService.findAll()); }
    @GetMapping("/{id}") public ResponseEntity<BookResponse> getById(@PathVariable Long id) { return ResponseEntity.ok(bookService.findById(id)); }
    @PostMapping public ResponseEntity<BookResponse> create(@Valid @RequestBody CreateBookRequest request) { return ResponseEntity.status(201).body(bookService.create(request)); }
}

@RestController @RequestMapping("/api/members")
public class MemberController {
    private final MemberService memberService;
    public MemberController(MemberService memberService) { this.memberService = memberService; }
    @GetMapping public ResponseEntity<List<MemberResponse>> getAll() { return ResponseEntity.ok(memberService.findAll()); }
    @PostMapping public ResponseEntity<MemberResponse> create(@Valid @RequestBody CreateMemberRequest request) { return ResponseEntity.status(201).body(memberService.create(request)); }
}

@RestController @RequestMapping("/api/loans")
public class LoanController {
    private final LoanService loanService;
    public LoanController(LoanService loanService) { this.loanService = loanService; }
    @PostMapping("/borrow/{bookId}") public ResponseEntity<LoanResponse> borrow(@PathVariable Long bookId, @RequestParam Long memberId) { return ResponseEntity.ok(loanService.borrowBook(bookId, memberId)); }
    @PostMapping("/return/{bookId}") public ResponseEntity<LoanResponse> returnBook(@PathVariable Long bookId) { return ResponseEntity.ok(loanService.returnBook(bookId)); }
    @GetMapping("/member/{memberId}") public ResponseEntity<List<LoanResponse>> getMemberLoans(@PathVariable Long memberId) { return ResponseEntity.ok(loanService.findByMember(memberId)); }
}
```

**Posibles mejoras**:
- Agregar **HATEOAS** con `EntityModel<T>` y `RepresentationModelAssembler` para que las respuestas incluyan links de navegación (`_links.self`, `_links.borrow`), mejorando la descubribilidad de la API REST.
- Implementar **paginación** en endpoints GET con `Pageable` y retornar `Page<BookResponse>` para manejar miles de libros sin problemas de memoria.
- Agregar **rate limiting** con `@RateLimiter` (Bucket4j o Resilience4j) en endpoints de escritura para prevenir abuso de la API.

---

### OCP: Estrategias de Multas
**Solución esperada**:

```java
public interface FineCalculator {
    double calculate(Loan loan);
    boolean supports(MemberType memberType);
}

public class StandardFineCalculator implements FineCalculator {
    private static final double DAILY_RATE = 1000;
    @Override public double calculate(Loan loan) {
        long daysLate = ChronoUnit.DAYS.between(loan.getDueDate(), LocalDate.now());
        return daysLate > 0 ? daysLate * DAILY_RATE : 0;
    }
    @Override public boolean supports(MemberType type) { return type == MemberType.REGULAR; }
}

public class ReducedFineCalculator implements FineCalculator {
    private static final double DAILY_RATE = 500;
    @Override public double calculate(Loan loan) {
        long daysLate = ChronoUnit.DAYS.between(loan.getDueDate(), LocalDate.now());
        return daysLate > 0 ? daysLate * DAILY_RATE : 0;
    }
    @Override public boolean supports(MemberType type) { return type == MemberType.STUDENT; }
}

public class NoFineCalculator implements FineCalculator {
    @Override public double calculate(Loan loan) { return 0; }
    @Override public boolean supports(MemberType type) { return type == MemberType.PREMIUM; }
}

// OCP: Nuevo tipo de multa sin modificar existente
public class WeekendFineCalculator implements FineCalculator {
    @Override public double calculate(Loan loan) {
        long daysLate = ChronoUnit.DAYS.between(loan.getDueDate(), LocalDate.now());
        if (daysLate > 0 && loan.getDueDate().getDayOfWeek().getValue() >= 6) return daysLate * 2000;
        return daysLate > 0 ? daysLate * 1000 : 0;
    }
    @Override public boolean supports(MemberType type) { return type == MemberType.WEEKEND; }
}
```

**Posibles mejoras**:
- Usar **Spring `@Order`** para definir prioridad explícita entre calculadoras cuando más de una puede aplicar al mismo `MemberType`.
- Extraer `ChronoUnit.DAYS.between` a un **servicio de tiempo inyectable** (`Clock` o `TimeProvider`) para poder testear multas con fechas fijas sin depender de `LocalDate.now()`.
- Implementar **patrón Decorator** para aplicar recargos adicionales sobre cualquier calculadora base (ej. `WeekendSurchargeDecorator` que envuelve `StandardFineCalculator` y duplica la multa en fines de semana).

---

### LSP: Jerarquía de Miembros con Composición
**Solución esperada**:

```java
public enum MemberType { REGULAR, STUDENT, PREMIUM }

public class Member {
    private Long id; private String name; private String email; private String phone;
    private MemberType type; private double totalFines;
    private final FineCalculator fineCalculator;
    private final LoanLimitPolicy loanLimitPolicy;

    public Member(Long id, String name, String email, MemberType type,
                  FineCalculator fineCalculator, LoanLimitPolicy loanLimitPolicy) {
        this.id = id; this.name = name; this.email = email;
        this.type = type; this.fineCalculator = fineCalculator;
        this.loanLimitPolicy = loanLimitPolicy;
    }
    public double calculateFine(Loan loan) { return fineCalculator.calculate(loan); }
    public boolean canBorrow(int currentLoans) { return loanLimitPolicy.canBorrow(this, currentLoans); }
    // getters...
}

// Factory method (en lugar de herencia)
public class MemberFactory {
    private final FineCalculator fineCalculator;
    private final LoanLimitPolicy loanLimitPolicy;
    public Member create(String name, String email, MemberType type) {
        return new Member(null, name, email, type, fineCalculator, loanLimitPolicy);
    }
}
```

**Posibles mejoras**:
- Crear un **registro centralizado de políticas** (`PolicyRegistry`) que mapee `MemberType` → `{FineCalculator, LoanLimitPolicy}` para que la creación de miembros sea aún más simple: `Member.create("Ana", "ana@test.com", REGULAR, policyRegistry)`.
- Implementar **patrón State** para el estado del miembro (`ActiveState`, `SuspendedState`, `BannedState`) donde cada estado define si el miembro puede pedir prestado y qué políticas aplican, sin modificar `Member`.
- Usar **datos inmutables** (`record` en Java 17+) para `FineCalculator` y `LoanLimitPolicy` cuando sean puramente funcionales (sin estado), simplificando el testing y la concurrencia.

---

### ISP: Interfaces Segregadas
**Solución esperada**:

```java
public interface BookReader {
    Optional<Book> findById(Long id);
    List<Book> findAll();
    List<Book> findByAvailable(boolean available);
}
public interface BookWriter {
    Book save(Book book);
    void updateAvailability(Long id, boolean available);
}
public interface LoanTaker {
    Loan borrowBook(Long bookId, Long memberId);
}
public interface LoanReturner {
    Loan returnBook(Long bookId);
}
public interface LoanReader {
    Optional<Loan> findActiveByBook(Long bookId);
    List<Loan> findByMember(Long memberId);
    long countActiveByMember(Long memberId);
}
```

**Posibles mejoras**:
- Dividir `LoanReader` en `LoanFinder` (findActiveByBook, findByMember) y `LoanCounter` (countActiveByMember) si hay clientes que solo necesitan contar préstamos activos sin acceder a los datos completos del préstamo.
- Crear una interfaz compuesta `LoanRepository extends LoanTaker, LoanReturner, LoanReader` usando herencia de interfaces (que no viola ISP porque es opcional) para los servicios que necesitan todas las operaciones.
- Usar **proyecciones de Spring Data** con interfaces cerradas para que `BookReader` retorne DTOs específicos por caso de uso en lugar de la entidad completa.

---

### DIP: Inyección de Dependencias
**Solución esperada**:

```java
// Interfaces (abstracciones)
public interface BookRepository extends BookReader, BookWriter {}
public interface MemberRepository { Optional<Member> findById(Long id); List<Member> findAll(); Member save(Member member); }
public interface LoanRepository extends LoanTaker, LoanReturner, LoanReader {}

// Servicio depende de interfaces
@Service
public class LoanService {
    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final List<FineCalculator> fineCalculators;

    public LoanService(LoanRepository loanRepository, BookRepository bookRepository,
                       MemberRepository memberRepository, List<FineCalculator> fineCalculators) {
        this.loanRepository = loanRepository; this.bookRepository = bookRepository;
        this.memberRepository = memberRepository; this.fineCalculators = fineCalculators;
    }

    public LoanResponse borrowBook(Long bookId, Long memberId) {
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        if (!book.isAvailable()) throw new BusinessException("Book not available");
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        long activeLoans = loanRepository.countActiveByMember(memberId);
        if (!member.canBorrow((int) activeLoans)) throw new BusinessException("Loan limit reached");
        return loanRepository.borrowBook(bookId, memberId);
    }

    public LoanResponse returnBook(Long bookId) {
        Loan loan = loanRepository.findActiveByBook(bookId).orElseThrow(() -> new ResourceNotFoundException("No active loan"));
        FineCalculator calculator = fineCalculators.stream()
            .filter(fc -> fc.supports(loan.getMember().getType()))
            .findFirst().orElse(new StandardFineCalculator());
        double fine = calculator.calculate(loan);
        loan.getMember().addFines(fine);
        return loanRepository.returnBook(bookId);
    }
}

// Configuración
@Configuration
public class LibraryConfig {
    @Bean public LoanService loanService(LoanRepository loanRepo, BookRepository bookRepo,
                                          MemberRepository memberRepo, List<FineCalculator> calculators) {
        return new LoanService(loanRepo, bookRepo, memberRepo, calculators);
    }
}
```

**Posibles mejoras**:
- Reemplazar `List<FineCalculator>` con un **mapa caché** (`Map<MemberType, FineCalculator>`) construido una vez en el constructor, eliminando el stream en cada llamada a `returnBook`.
- Usar **Spring Events** para el flujo post-préstamo: `LoanService` emite `BookBorrowedEvent` y listeners separados (`FineListener`, `NotificationListener`, `AuditListener`) reaccionan sin que `LoanService` los conozca, reduciendo el acoplamiento aún más.
- Implementar **pruebas de integración con Testcontainers** para `JdbcBookRepository`, `JdbcMemberRepository` y `JdbcLoanRepository` usando PostgreSQL real en Docker, verificando que las implementaciones concretas cumplen los contratos de las interfaces.

---

### SQL Injection Corregida (Seguridad)
**Solución esperada**:

```java
// Antes (vulnerable)
jdbc.queryForMap("SELECT * FROM books WHERE id = " + id);

// Después (seguro con parámetros)
@Repository
public class JdbcBookRepository implements BookRepository {
    private final JdbcTemplate jdbc;
    public JdbcBookRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    public Optional<Book> findById(Long id) {
        String sql = "SELECT * FROM books WHERE id = ?";
        try {
            Book book = jdbc.queryForObject(sql, new BeanPropertyRowMapper<>(Book.class), id);
            return Optional.ofNullable(book);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
```

**Posibles mejoras**:
- Migrar a **Spring Data JPA** (`interface BookRepository extends JpaRepository<Book, Long>`) para eliminar completamente el SQL manual, reduciendo boilerplate y eliminando cualquier posibilidad de SQL injection.
- Usar **Flyway o Liquibase** para versionar el esquema de BD, asegurando que las migraciones sean reproducibles y que el esquema esté sincronizado con el código.
- Agregar **validación de entrada** con `@NotBlank`, `@Size`, `@Pattern` en los DTOs para rechazar datos maliciosos antes de que lleguen al repositorio.

---

### Métricas Finales

| Métrica | Antes | Después |
|---------|-------|---------|
| Clases | 1 controller + 1 app | 20+ clases organizadas |
| Complejidad ciclomática promedio | 12 | 2 |
| SQL Injections | 12 | 0 |
| Dependencias a implementaciones | 4 (JdbcTemplate directo) | 0 (solo interfaces) |
| Cobertura de pruebas | 0% | 85%+ |
| Tiempo para agregar nuevo tipo de miembro | 30 min (modificar switch) | 5 min (crear strategy) |

