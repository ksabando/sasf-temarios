---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---
public class OrderCalculator {
    public double calculateSubtotal(Order order) {
        return order.getItems().stream()
            .mapToDouble(i -> i.getPrice() * i.getQuantity())
            .sum();
    }

    public double calculateTax(double subtotal) {
        return subtotal * 0.19;
    }

    public double calculateShipping(double subtotal) {
        return subtotal > 100000 ? 0 : 10000;
    }
}

// --- Responsabilidad 3: Descuentos ---
public class DiscountApplier {
    public double applyDiscounts(Customer customer, double total) {
        double discounted = total;
        if (customer.isVIP()) {
            discounted *= 0.90;
        } else if (customer.getMembership() > 12) {
            discounted *= 0.95;
        }
        return discounted;
    }
}

// --- Responsabilidad 4: Persistencia ---
public class OrderRepository {
    private final Connection connection;

    public OrderRepository(Connection connection) {
        this.connection = connection;
    }

    public void save(Order order) {
        String sql = "INSERT INTO orders (customer_id, total, status) VALUES (?, ?, 'PENDING')";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, order.getCustomer().getId());
            ps.setDouble(2, order.getTotal());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new PersistenceException("Error saving order", e);
        }
    }
}

// --- Responsabilidad 5: Inventario ---
public class InventoryManager {
    private final Connection connection;

    public InventoryManager(Connection connection) {
        this.connection = connection;
    }

    public void updateStock(Order order) {
        String sql = "UPDATE products SET stock = stock - ? WHERE id = ?";
        for (Item item : order.getItems()) {
            try (PreparedStatement ps = connection.prepareStatement(sql)) {
                ps.setInt(1, item.getQuantity());
                ps.setLong(2, item.getProductId());
                int updated = ps.executeUpdate();
                if (updated == 0) {
                    throw new InventoryException("Product not found: " + item.getProductId());
                }
            } catch (SQLException e) {
                throw new PersistenceException("Error updating stock", e);
            }
        }
    }
}

// --- Responsabilidad 6: Notificaciones ---
public class NotificationService {
    private final SMTPClient smtp;

    public NotificationService(SMTPClient smtp) {
        this.smtp = smtp;
    }

    public void sendOrderConfirmation(Order order) {
        String subject = "Order #" + order.getId() + " confirmed";
        String body = "Total: $" + order.getTotal() + "\nThank you for your purchase.";
        smtp.send(order.getCustomer().getEmail(), subject, body);
    }
}

// --- Responsabilidad 7: Auditoría ---
public class AuditLogger {
    public void log(String message) {
        try (FileWriter fw = new FileWriter("auditoria.log", true)) {
            fw.write(new Date() + " - " + message + "\n");
        } catch (IOException e) {
            System.err.println("Audit log error: " + e.getMessage());
        }
    }
}

// --- Responsabilidad 8: Facturación ---
public class InvoiceGenerator {
    public void generateInvoice(Order order) {
        String invoice = buildInvoiceText(order);
        try (FileWriter fw = new FileWriter("invoice_" + order.getId() + ".txt")) {
            fw.write(invoice);
        } catch (IOException e) {
            throw new RuntimeException("Error generating invoice", e);
        }
    }

    private String buildInvoiceText(Order order) {
        return "INVOICE\nCustomer: " + order.getCustomer().getName()
            + "\nTotal: $" + order.getTotal()
            + "\nDate: " + new Date();
    }
}

// --- Orquestador (SRP: solo coordina) ---
public class OrderProcessor {
    private final OrderValidator validator;
    private final OrderCalculator calculator;
    private final DiscountApplier discounter;
    private final OrderRepository orderRepo;
    private final InventoryManager inventory;
    private final NotificationService notifier;
    private final AuditLogger auditor;
    private final InvoiceGenerator invoicer;

    public OrderProcessor(OrderValidator validator,
                          OrderCalculator calculator,
                          DiscountApplier discounter,
                          OrderRepository orderRepo,
                          InventoryManager inventory,
                          NotificationService notifier,
                          AuditLogger auditor,
                          InvoiceGenerator invoicer) {
        this.validator = validator;
        this.calculator = calculator;
        this.discounter = discounter;
        this.orderRepo = orderRepo;
        this.inventory = inventory;
        this.notifier = notifier;
        this.auditor = auditor;
        this.invoicer = invoicer;
    }

    public void processOrder(Order order) {
        validator.validate(order);

        double subtotal = calculator.calculateSubtotal(order);
        double tax = calculator.calculateTax(subtotal);
        double shipping = calculator.calculateShipping(subtotal);
        double total = subtotal + tax + shipping;
        total = discounter.applyDiscounts(order.getCustomer(), total);
        order.setTotal(total);

        orderRepo.save(order);
        inventory.updateStock(order);
        notifier.sendOrderConfirmation(order);
        auditor.log("Order " + order.getId() + " processed");
        invoicer.generateInvoice(order);
    }
}
```

**Posibles mejoras**:
- Usar **patrón Builder** para la construcción de `OrderProcessor` con 8 dependencias, simplificando la creación y asegurando que todas las dependencias requeridas estén presentes.
- Aplicar **patrón Mediator** para la orquestación: `OrderProcessor` se convierte en un mediator que coordina las interacciones entre componentes sin que ellos se conozcan entre sí, facilitando agregar/quitar pasos del pipeline.
- Reemplazar `DiscountApplier` con **Strategy Pattern** para que cada tipo de descuento viva en su propia clase, aplicando OCP junto con SRP.

---

## Ejercicio 2: LibraryManager Refactorizado
**Solución esperada**:

### Responsabilidades Identificadas

1. Gestión de libros (CRUD)
2. Gestión de miembros (CRUD)
3. Gestión de préstamos
4. Validación de datos
5. Notificaciones
6. Cálculo de multas
7. Logging
8. Generación de reportes

### Estructura Refactorizada

```java
// --- Validación ---
public class LibraryValidator {
    public void validateBook(String title, String isbn) {
        if (title == null || title.isEmpty())
            throw new ValidationException("Title required");
        if (isbn == null || !isbn.matches("\\d{13}"))
            throw new ValidationException("Invalid ISBN");
    }

    public void validateMember(String email) {
        if (email == null || !email.contains("@"))
            throw new ValidationException("Invalid email");
    }
}

// --- Repositorios ---
public class BookRepository {
    private final List<Book> books = new ArrayList<>();

    public void add(Book book) { books.add(book); }
    public Optional<Book> findById(Long id) { ... }
    public Optional<Book> findAvailableById(Long id) { ... }
    public List<Book> findAll() { return new ArrayList<>(books); }
}

public class MemberRepository {
    private final List<Member> members = new ArrayList<>();

    public void add(Member member) { members.add(member); }
    public Optional<Member> findById(Long id) { ... }
    public List<Member> findAll() { return new ArrayList<>(members); }
}

public class LoanRepository {
    private final List<Loan> loans = new ArrayList<>();

    public void add(Loan loan) { loans.add(loan); }
    public Optional<Loan> findById(Long id) { ... }
    public List<Loan> findActiveLoans() { ... }
    public List<Loan> findAll() { return new ArrayList<>(loans); }
}

// --- Servicio de Préstamos ---
public class LoanService {
    private final LoanRepository loanRepo;
    private final FineCalculator fineCalc;

    public LoanService(LoanRepository loanRepo, FineCalculator fineCalc) {
        this.loanRepo = loanRepo;
        this.fineCalc = fineCalc;
    }

    public Loan lendBook(Member member, Book book) {
        if (book.isLent()) throw new IllegalStateException("Book already lent");
        book.setLent(true);
        Loan loan = new Loan(member, book, new Date());
        loanRepo.add(loan);
        return loan;
    }

    public void returnBook(Loan loan) {
        loan.getBook().setLent(false);
        loan.setReturnDate(new Date());
        fineCalc.applyFineIfLate(loan);
    }
}

// --- Cálculo de Multas ---
public class FineCalculator {
    private static final long FINE_PER_DAY = 500;

    public void applyFineIfLate(Loan loan) {
        long daysLate = calculateDaysLate(loan);
        if (daysLate > 0) {
            double fine = daysLate * FINE_PER_DAY;
            loan.getMember().addFine(fine);
        }
    }

    private long calculateDaysLate(Loan loan) {
        long diff = System.currentTimeMillis() - loan.getDueDate().getTime();
        return Math.max(0, diff / (1000 * 60 * 60 * 24));
    }
}

// --- Notificaciones ---
public class NotificationService {
    public void sendWelcome(Member member) {
        sendEmail(member.getEmail(), "Welcome to the library " + member.getName());
    }

    public void sendFineReminder(Member member, double fine) {
        sendEmail(member.getEmail(), "You have an unpaid fine of $" + fine);
    }

    private void sendEmail(String to, String message) {
        System.out.println("Email to " + to + ": " + message);
    }
}

// --- Logging ---
public class AuditLogger {
    public void log(String message) {
        try (FileWriter fw = new FileWriter("library.log", true)) {
            fw.write(new Date() + " - " + message + "\n");
        } catch (IOException e) {
            System.err.println("Log error: " + e.getMessage());
        }
    }
}

// --- Reportes ---
public class ReportGenerator {
    private final BookRepository bookRepo;
    private final MemberRepository memberRepo;
    private final LoanRepository loanRepo;

    public ReportGenerator(BookRepository bookRepo, MemberRepository memberRepo,
                           LoanRepository loanRepo) {
        this.bookRepo = bookRepo;
        this.memberRepo = memberRepo;
        this.loanRepo = loanRepo;
    }

    public void generateCsvReport() {
        double totalFines = memberRepo.findAll().stream()
            .mapToDouble(Member::getTotalFines).sum();
        String csv = String.format("%d,%d,%d,%.2f",
            bookRepo.findAll().size(),
            memberRepo.findAll().size(),
            loanRepo.findAll().size(),
            totalFines);
        try (FileWriter fw = new FileWriter("report.csv")) {
            fw.write("Books,Members,Loans,Fines\n");
            fw.write(csv);
        } catch (IOException e) {
            throw new RuntimeException("Error generating report", e);
        }
    }
}

// --- Orquestador ---
public class LibraryService {
    private final LibraryValidator validator;
    private final BookRepository bookRepo;
    private final MemberRepository memberRepo;
    private final LoanService loanService;
    private final NotificationService notifier;
    private final AuditLogger auditor;
    private final ReportGenerator reporter;

    public LibraryService(LibraryValidator validator, BookRepository bookRepo,
                          MemberRepository memberRepo, LoanService loanService,
                          NotificationService notifier, AuditLogger auditor,
                          ReportGenerator reporter) {
        this.validator = validator;
        this.bookRepo = bookRepo;
        this.memberRepo = memberRepo;
        this.loanService = loanService;
        this.notifier = notifier;
        this.auditor = auditor;
        this.reporter = reporter;
    }

    public void addBook(String title, String author, String isbn) {
        validator.validateBook(title, isbn);
        bookRepo.add(new Book(title, author, isbn));
        auditor.log("Book added: " + title);
    }

    public void registerMember(String name, String email) {
        validator.validateMember(email);
        Member member = new Member(name, email);
        memberRepo.add(member);
        notifier.sendWelcome(member);
        auditor.log("Member registered: " + name);
    }

    public void lendBook(Long memberId, Long bookId) {
        Member member = memberRepo.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        Book book = bookRepo.findAvailableById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not available"));
        Loan loan = loanService.lendBook(member, book);
        auditor.log("Book lent: " + book.getTitle() + " to " + member.getName());
    }

    public void returnBook(Long loanId) {
        Loan loan = loanRepo.findById(loanId)
            .orElseThrow(() -> new RuntimeException("Loan not found"));
        loanService.returnBook(loan);
        auditor.log("Book returned: " + loan.getBook().getTitle());
    }
}
```

**Posibles mejoras**:
- Extraer `FineCalculator` como **Strategy** con interfaz `FinePolicy` y múltiples implementaciones (`DailyFinePolicy`, `FixedFinePolicy`, `NoFinePolicy`) para que la política de multas sea configurable sin modificar `LoanService`.
- Agregar **patrón Observer** con eventos de dominio (`BookLentEvent`, `BookReturnedEvent`) para que `NotificationService` y `AuditLogger` reaccionen a eventos sin que `LibraryService` tenga que llamarlos explícitamente.
- Migrar `AuditLogger` de `FileWriter` a una interfaz `AuditRepository` con implementación concreta, aplicando DIP para poder cambiar el destino de los logs (archivo, BD, ELK) sin modificar el logger.

---

## Ejercicio 3: TaxCalculator Refactorizado
**Solución esperada**:

### Responsabilidades Identificadas
1. Carga de tasas impositivas
2. Validación de facturas
3. Cálculo de impuestos
4. Persistencia de resultados

### Estructura Refactorizada

```java
// --- Interfaz para proveer tasas ---
public interface TaxRateProvider {
    double getRate(String taxName);
}

// --- Implementación con archivo ---
public class FileTaxRateProvider implements TaxRateProvider {
    private final Map<String, Double> rates = new HashMap<>();

    public FileTaxRateProvider(String filePath) {
        loadFromFile(filePath);
    }

    private void loadFromFile(String path) {
        try (BufferedReader br = new BufferedReader(new FileReader(path))) {
            br.lines().forEach(line -> {
                String[] parts = line.split(":");
                rates.put(parts[0], Double.parseDouble(parts[1]));
            });
        } catch (IOException e) {
            setDefaultRates();
        }
    }

    private void setDefaultRates() {
        rates.put("IVA", 0.19);
        rates.put("ISR", 0.10);
        rates.put("ICA", 0.0096);
    }

    @Override
    public double getRate(String taxName) {
        return rates.getOrDefault(taxName, 0.0);
    }
}

// --- Validación ---
public class InvoiceValidator {
    public void validate(Invoice invoice) {
        Objects.requireNonNull(invoice, "Invoice required");
        if (invoice.getItems() == null || invoice.getItems().isEmpty()) {
            throw new ValidationException("Items required");
        }
        for (Item item : invoice.getItems()) {
            if (item.getPrice() <= 0)
                throw new ValidationException("Invalid price: " + item.getName());
            if (item.getQuantity() <= 0)
                throw new ValidationException("Invalid quantity: " + item.getName());
        }
    }
}

// --- Cálculo ---
public class TaxCalculatorLogic {
    private final TaxRateProvider rateProvider;

    public TaxCalculatorLogic(TaxRateProvider rateProvider) {
        this.rateProvider = rateProvider;
    }

    public TaxResult calculate(Invoice invoice) {
        double subtotal = invoice.getItems().stream()
            .mapToDouble(i -> i.getPrice() * i.getQuantity())
            .sum();
        double iva = subtotal * rateProvider.getRate("IVA");
        double isr = subtotal * rateProvider.getRate("ISR");
        return new TaxResult(iva, isr, iva + isr);
    }
}

// --- Persistencia ---
public class TaxRepository {
    private final Connection connection;

    public TaxRepository(Connection connection) {
        this.connection = connection;
    }

    public void save(Invoice invoice, TaxResult result) {
        String sql = "INSERT INTO taxes (invoice_id, iva, isr, total) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, invoice.getId());
            ps.setDouble(2, result.getIva());
            ps.setDouble(3, result.getIsr());
            ps.setDouble(4, result.getTotal());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new PersistenceException("Error saving tax result", e);
        }
    }
}

// --- Orquestador ---
public class TaxService {
    private final InvoiceValidator validator;
    private final TaxCalculatorLogic calculator;
    private final TaxRepository repository;

    public TaxService(InvoiceValidator validator,
                      TaxCalculatorLogic calculator,
                      TaxRepository repository) {
        this.validator = validator;
        this.calculator = calculator;
        this.repository = repository;
    }

    public double calculateAndSave(Invoice invoice) {
        validator.validate(invoice);
        TaxResult result = calculator.calculate(invoice);
        repository.save(invoice, result);
        return result.getTotal();
    }
}
```

**Posibles mejoras**:
- Aplicar **Strategy Pattern** a `TaxRateProvider` con implementaciones `DatabaseTaxRateProvider` y `ApiTaxRateProvider` para que las tasas impositivas se obtengan de fuentes dinámicas sin modificar `TaxCalculatorLogic`.
- Agregar un **caché con TTL** en `TaxRateProvider` para evitar leer el archivo o consultar la BD en cada cálculo, especialmente si las tasas cambian pocas veces al año.
- Usar **Spring `@Scheduled`** para recargar periódicamente las tasas desde una API externa (ej. servicio de hacienda) y emitir un evento `TaxRatesUpdatedEvent` que notifique a los consumidores sin acoplarlos.

---

## Ejercicio 4: NotificationSystem Refactorizado
**Solución esperada**:

### Responsabilidades Identificadas
1. Construcción de contenido según tipo
2. Formateo según canal
3. Envío por canal específico
4. Historial de notificaciones
5. Generación de reportes

### Estructura Refactorizada

```java
// --- Interfaz de Canal ---
public interface MessageChannel {
    void send(User user, String content);
    String getChannelName();
}

// --- Implementaciones ---
public class EmailChannel implements MessageChannel {
    @Override
    public void send(User user, String content) {
        String html = "<html><body>" + content.replace("\n", "<br/>") + "</body></html>";
        System.out.println("Sending EMAIL to " + user.getEmail());
        System.out.println("Content: " + html);
    }

    @Override
    public String getChannelName() { return "EMAIL"; }
}

public class SMSChannel implements MessageChannel {
    private static final int MAX_LENGTH = 160;

    @Override
    public void send(User user, String content) {
        if (content.length() > MAX_LENGTH) {
            content = content.substring(0, MAX_LENGTH - 4) + "...";
        }
        System.out.println("Sending SMS to " + user.getPhone());
        System.out.println("Content: " + content);
    }

    @Override
    public String getChannelName() { return "SMS"; }
}

public class PushChannel implements MessageChannel {
    @Override
    public void send(User user, String content) {
        System.out.println("Sending PUSH to device " + user.getDeviceToken());
        System.out.println("Content: " + content);
    }

    @Override
    public String getChannelName() { return "PUSH"; }
}

// --- Formateador ---
public class MessageFormatter {
    public String format(String type, User user, String message) {
        switch (type) {
            case "WELCOME":
                return "Welcome " + user.getName() + "!\n" + message;
            case "PROMOTION":
                return "Special offer!\n" + message;
            case "ALERT":
                return "ALERT: " + message;
            case "BILL":
                return "INVOICE\n" + message;
            default:
                return message;
        }
    }
}

// --- Historial ---
public class NotificationHistory {
    public void save(Long userId, String channel, String content) {
        try (FileWriter fw = new FileWriter("notifications.log", true)) {
            fw.write(userId + "|" + channel + "|" + content + "|" + new Date() + "\n");
        } catch (IOException e) {
            System.err.println("History error: " + e.getMessage());
        }
    }
}

// --- Servicio Principal ---
public class NotificationService {
    private final Map<String, MessageChannel> channels;
    private final MessageFormatter formatter;
    private final NotificationHistory history;

    public NotificationService(List<MessageChannel> channelList,
                                MessageFormatter formatter,
                                NotificationHistory history) {
        this.channels = channelList.stream()
            .collect(Collectors.toMap(MessageChannel::getChannelName, c -> c));
        this.formatter = formatter;
        this.history = history;
    }

    public void sendNotification(User user, String type, String message) {
        Objects.requireNonNull(user, "User required");
        Objects.requireNonNull(message, "Message required");

        String content = formatter.format(type, user, message);
        MessageChannel channel = channels.get(user.getPreferredChannel());

        if (channel == null) {
            throw new IllegalArgumentException("Unsupported channel: "
                + user.getPreferredChannel());
        }

        channel.send(user, content);
        history.save(user.getId(), channel.getChannelName(), content);
    }
}
```

### Diagrama de Clases

```
NotificationService
├── MessageFormatter
├── NotificationHistory
└── Map<String, MessageChannel>
    ├── EmailChannel implements MessageChannel
    ├── SMSChannel implements MessageChannel
    ├── PushChannel implements MessageChannel
    └── (extensible: WhatsAppChannel, etc.)
```

**Posibles mejoras**:
- Reemplazar el `switch` en `MessageFormatter` con **Strategy Pattern** (`WelcomeFormatter`, `PromotionFormatter`, `AlertFormatter`, `BillFormatter`) aplicando OCP, eliminando la necesidad de modificar el formateador para nuevos tipos de mensaje.
- Extraer `NotificationHistory` a una interfaz con implementaciones `FileHistoryRepository` y `DatabaseHistoryRepository`, aplicando DIP para que el historial no esté acoplado a escritura de archivos.
- Implementar **patrón Decorator** para `MessageChannel` con decoradores de logging, métricas y rate-limiting que envuelvan cualquier canal sin modificar su implementación.

