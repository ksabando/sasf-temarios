---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M10 — Proyecto Biblioteca Refactorizado

## Ejercicio 1: Arquitectura del Proyecto

**Solución esperada**:

```
com.sasf.biblioteca
├── domain/
│   ├── model/
│   │   ├── Book.java           (entidad rica con comportamiento)
│   │   ├── Loan.java           (préstamo)
│   │   ├── User.java           (usuario)
│   │   ├── Reservation.java    (reserva)
│   │   └── Fine.java           (multa)
│   ├── exception/
│   │   ├── BookNotAvailableException.java
│   │   ├── LoanNotFoundException.java
│   │   ├── UserNotFoundException.java
│   │   └── BusinessException.java
│   └── repository/
│       ├── BookRepository.java      (Spring Data JPA)
│       ├── LoanRepository.java
│       ├── UserRepository.java
│       └── ReservationRepository.java
├── application/
│   ├── service/
│   │   ├── BookService.java         (CRUD + búsqueda)
│   │   ├── LoanService.java         (préstamo/devolución)
│   │   ├── FineCalculatorService.java (cálculo multas)
│   │   ├── ReservationService.java  (reservas)
│   │   └── NotificationService.java (notificaciones)
│   └── port/
│       └── EmailSender.java         (puerto para email)
├── infrastructure/
│   ├── adapter/
│   │   └── SmtpEmailSender.java     (adapter JavaMail)
│   └── persistence/
│       └── JpaBookRepository.java   (implementación JPA)
├── api/
│   ├── controller/
│   │   ├── BookController.java
│   │   ├── LoanController.java
│   │   └── UserController.java
│   ├── dto/
│   │   ├── BookRequest.java
│   │   ├── BookResponse.java
│   │   ├── LoanRequest.java
│   │   └── LoanResponse.java
│   └── exception/
│       └── GlobalExceptionHandler.java
└── BibliotecaApplication.java
```

**Posibles mejoras**:

- Agregar un módulo `shared` o `common` para clases transversales como `Money`, `BaseEntity`, `DomainEvent`. Actualmente estas clases estarían duplicadas o mal ubicadas en domain o application. Un módulo compartido evita el acoplamiento circular.

- Implementar Domain Events para operaciones críticas (`BookBorrowed`, `LoanReturned`) y handlers separados (`SendDueDateNotification`, `UpdateBookAvailabilityCache`). Esto reduce el acoplamiento entre servicios sin perder funcionalidad y prepara el sistema para una arquitectura eventualmente consistente.

- Separar los DTOs de request/response en una librería o módulo independiente si el frontend es un cliente separado (micro-frontend o mobile). Esto permite versionar el contrato de API independientemente del dominio.

## Ejercicio 2: Domain: Book (entidad rica)

**Solución esperada**:

```java
package com.sasf.biblioteca.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false, unique = true)
    private String isbn;

    private int publicationYear;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BookCategory category;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BookStatus status;

    @Column(nullable = false)
    private int totalCopies;

    @Column(nullable = false)
    private int availableCopies;

    @ElementCollection
    private List<String> tags;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected Book() {}

    public Book(String title, String author, String isbn, int publicationYear,
                BookCategory category, int totalCopies) {
        this.title = requireNonBlank(title, "Title must not be blank");
        this.author = requireNonBlank(author, "Author must not be blank");
        this.isbn = requireNonBlank(isbn, "ISBN must not be blank");
        this.publicationYear = publicationYear;
        this.category = Objects.requireNonNull(category);
        this.status = BookStatus.AVAILABLE;
        this.totalCopies = totalCopies;
        this.availableCopies = totalCopies;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isAvailableForLoan() {
        return availableCopies > 0 && status == BookStatus.AVAILABLE;
    }

    public void borrow() {
        if (!isAvailableForLoan()) {
            throw new BookNotAvailableException("No copies available for book: " + id);
        }
        this.availableCopies--;
        if (availableCopies == 0 && status == BookStatus.AVAILABLE) {
            this.status = BookStatus.LOANED;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void returnCopy() {
        if (availableCopies >= totalCopies) {
            throw new IllegalStateException("All copies are already returned for book: " + id);
        }
        this.availableCopies++;
        if (status == BookStatus.LOANED) {
            this.status = BookStatus.AVAILABLE;
        }
        this.updatedAt = LocalDateTime.now();
    }

    private String requireNonBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }
}
```

**Posibles mejoras**:

- Validar el formato de ISBN con una expresión regular o librería especializada (`isbn-validator`) en el constructor. Actualmente, cualquier string no vacío es aceptado como ISBN, lo que permite datos inválidos en la base de datos.

- Encapsular el manejo de fechas (`createdAt`, `updatedAt`) con `@PrePersist` y `@PreUpdate` de JPA en lugar de setearlos manualmente en cada método. Esto garantiza consistencia incluso si alguien modifica la entidad por un camino que no pasa por `borrow()` o `returnCopy()`.

- Exponer un método `reserve()` que considere la lista de reservas activas. Actualmente, el modelo no contempla reservas, lo que significa que `borrow()` podría permitir préstamos que deberían estar bloqueados por reservas existentes. Esto requiere una relación con `Reservation`.

## Ejercicio 3: Service: LoanService (SRP, sin nulls, excepciones)

**Solución esperada**:

```java
package com.sasf.biblioteca.application.service;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final FineCalculatorService fineCalculator;

    public LoanService(LoanRepository loanRepository, BookRepository bookRepository,
                       UserRepository userRepository, FineCalculatorService fineCalculator) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.fineCalculator = fineCalculator;
    }

    @Transactional
    public LoanResponse borrowBook(LoanRequest request) {
        Book book = bookRepository.findById(request.bookId())
                .orElseThrow(() -> new BookNotFoundException(request.bookId()));
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new UserNotFoundException(request.userId()));

        book.borrow();

        Loan loan = new Loan(book, user, request.loanDate(), request.dueDate());
        loanRepository.save(loan);
        bookRepository.save(book);

        return LoanResponse.from(loan);
    }

    @Transactional
    public LoanResponse returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new LoanNotFoundException(loanId));

        loan.markAsReturned();
        loan.getBook().returnCopy();

        Money fine = fineCalculator.calculate(loan);
        if (fine.isGreaterThan(Money.ZERO)) {
            loan.applyFine(fine);
        }

        loanRepository.save(loan);
        bookRepository.save(loan.getBook());

        return LoanResponse.from(loan);
    }
}
```

**Posibles mejoras**:

- Agregar validación de que el usuario no tiene multas pendientes antes de permitir un nuevo préstamo. Usuarios con multas impagas no deberían poder retirar libros. Esta regla de negocio está ausente y es común en sistemas de biblioteca reales.

- Implementar un límite de préstamos activos por usuario (ej. máximo 3 libros simultáneos). Actualmente, nada impide que un usuario saque 500 libros a la vez. Esto debería ser una regla en `User` con un método `canBorrow()`.

- Usar eventos de dominio (`LoanCreatedEvent`, `LoanReturnedEvent`) en lugar de llamadas directas para desacoplar efectos secundarios. Por ejemplo, al crear un préstamo, emitir un evento que un handler de notificaciones escuche para enviar el email de confirmación, en lugar de que `LoanService` también se encargue de notificar.

## Ejercicio 4: Controller: BookController (REST API)

**Solución esperada**:

```java
@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public ResponseEntity<List<BookResponse>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) BookCategory category) {
        List<BookResponse> books = bookService.search(query, category);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> findById(@PathVariable Long id) {
        BookResponse book = bookService.findById(id);
        return ResponseEntity.ok(book);
    }

    @PostMapping
    public ResponseEntity<BookResponse> create(@Valid @RequestBody BookRequest request) {
        BookResponse book = bookService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(book);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

**Posibles mejoras**:

- Agregar paginación al endpoint de búsqueda (`@PageableDefault Pageable pageable`). Actualmente, `search` devuelve todos los resultados, lo que con una biblioteca de miles de libros es insostenible y puede causar problemas de memoria.

- Implementar HATEOAS con `EntityModel<BookResponse>` y links a recursos relacionados (`/api/books/{id}/loans`, `/api/books/{id}/reservations`). Esto hace la API autodescubrible y sigue el nivel 3 de madurez REST de Richardson.

- Agregar cacheo HTTP con `ETag` y `Last-Modified` para reducir tráfico innecesario en búsquedas repetidas. Spring soporta `@RequestMapping` con `ETag` vía `ShallowEtagHeaderFilter`.

## Ejercicio 5: Adapter: SmtpEmailSender

**Solución esperada**:

```java
@Component
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;

    public SmtpEmailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void send(String to, String subject, String body) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new EmailDeliveryException("Failed to send email to " + to, e);
        }
    }
}
```

**Posibles mejoras**:

- Agregar reintentos para fallas transitorias de SMTP usando Resilience4j `@Retry`. Las fallas de conexión al servidor de correo suelen ser temporales y un reintento con backoff resolvería la mayoría sin intervención manual.

- Implementar un mecanismo de cola con almacenamiento persistente (outbox pattern) para emails. Si el servidor SMTP está caído, los emails no se pierden —se guardan en una tabla `outbox_emails` y un proceso asincrónico los envía cuando el servidor vuelve. Esto es crítico para notificaciones importantes como confirmaciones de préstamo.

- Parametrizar el `from` (remitente) en el método `send` en lugar de usar el default del `JavaMailSender`. Distintos tipos de notificación pueden requerir distintos remitentes (`noreply@biblioteca.com` vs `soporte@biblioteca.com`).

## Ejercicio 6: GlobalExceptionHandler

**Solución esperada**:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        return ResponseEntity
            .badRequest()
            .body(new ErrorResponse("BUSINESS_ERROR", e.getMessage()));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException e) {
        return ResponseEntity
            .notFound()
            .build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        List<String> errors = e.getBindingResult().getFieldErrors()
            .stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .toList();
        return ResponseEntity
            .badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", String.join("; ", errors)));
    }
}
```

**Posibles mejoras**:

- Agregar un handler para `Exception.class` como último recurso (catch-all) que devuelva HTTP 500 con un error genérico y loggee el stack trace completo. Actualmente, excepciones no manejadas devuelven el error por defecto de Spring, que puede exponer información sensible del stack trace.

- Incluir un `traceId` (correlation ID) en cada `ErrorResponse` para facilitar el debugging en sistemas distribuidos. El traceId se genera en un filtro al inicio de la request y se propaga a todos los logs y respuestas de error.

- Diferenciar errores de validación de request (`MethodArgumentNotValidException`) de errores de validación de negocio lanzados por el dominio. Los primeros son errores 400 con detalles de campos, los segundos pueden ser 422 (Unprocessable Entity) con mensajes de reglas de negocio.

## Ejercicio 7: Test: LoanServiceTest

**Solución esperada**:

```java
@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock private LoanRepository loanRepository;
    @Mock private BookRepository bookRepository;
    @Mock private UserRepository userRepository;
    @Mock private FineCalculatorService fineCalculator;
    private LoanService loanService;

    @BeforeEach
    void setUp() {
        loanService = new LoanService(loanRepository, bookRepository, userRepository, fineCalculator);
    }

    @Test
    void shouldBorrowBookWhenBookIsAvailable() {
        Book book = new Book("Clean Code", "Robert Martin", "978-0-13-235088-4",
            2008, BookCategory.TECHNOLOGY, 5);
        User user = new User("John Doe", "john@test.com");
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        LoanResponse response = loanService.borrowBook(
            new LoanRequest(1L, 1L, LocalDate.now(), LocalDate.now().plusDays(14)));

        assertThat(response.status()).isEqualTo("ACTIVE");
        assertThat(book.getAvailableCopies()).isEqualTo(4);
        verify(loanRepository).save(any(Loan.class));
    }

    @Test
    void shouldThrowExceptionWhenBookNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loanService.borrowBook(
            new LoanRequest(99L, 1L, LocalDate.now(), LocalDate.now().plusDays(14))))
            .isInstanceOf(BookNotFoundException.class);
    }

    @Test
    void shouldThrowExceptionWhenNoCopiesAvailable() {
        Book book = new Book("Clean Code", "Robert Martin", "978-0-13-235088-4",
            2008, BookCategory.TECHNOLOGY, 1);
        book.borrow();
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));

        assertThatThrownBy(() -> loanService.borrowBook(
            new LoanRequest(1L, 1L, LocalDate.now(), LocalDate.now().plusDays(14))))
            .isInstanceOf(BookNotAvailableException.class);
    }
}
```

**Posibles mejoras**:

- Agregar un test para el caso de usuario con multas pendientes (cuando se implemente esa validación). Es un camino de error importante que actualmente no tiene cobertura y debería ser uno de los primeros tests en escribirse.

- Agregar un test que verifique el comportamiento transaccional: si `loanRepository.save()` falla, `book.borrow()` debería revertirse. Esto requiere un test de integración con rollback verificado, o al menos un test unitario que verifique que `bookRepository.save(book)` se llama con el estado correcto solo si `loanRepository.save` no lanza excepción.

- Usar `@Nested` de JUnit 5 para agrupar tests por escenario: `class BorrowBook { ... }`, `class ReturnBook { ... }`, `class CalculateFine { ... }`. Esto hace el archivo de tests más navegable cuando crezca a 20-30 tests.

## Métricas del Proyecto Refactorizado

| Aspecto | Antes (Legacy) | Después |
|---------|----------------|---------|
| Clases | 3 (1 entidad, 1 BD, 1 servicio) | 25+ |
| Línea máxima por clase | 800+ (Servicio.java) | < 80 |
| Tests | 0 | 40+ (cobertura 85%) |
| Nulls | 15+ retornos null | 0 (Optional + excepciones) |
| Códigos de error | Strings "ERROR: ..." | Excepciones tipadas |
| SQL Injection | Sí (concatenación) | No (Spring Data JPA) |
| Checkstyle errors | 100+ | 0 |
| PMD violations | 50+ | 0 |

