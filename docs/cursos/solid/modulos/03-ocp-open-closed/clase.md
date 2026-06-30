---
sidebar_label: "Clase"
---

## Solución: Strategy Pattern

El patrón Strategy permite definir una familia de algoritmos, encapsular cada uno y hacerlos
intercambiables. Es la implementación clásica de OCP.

```java
// Abstracción: abierta para extensión
public interface TaxStrategy {
    double calculate(double amount);
    String getTaxType();
}

// Estrategias concretas (cerradas para modificación)
public class IVAStrategy implements TaxStrategy {
    private static final double RATE = 0.19;

    @Override
    public double calculate(double amount) {
        return amount * RATE;
    }

    @Override
    public String getTaxType() {
        return "IVA";
    }
}

public class ISRStrategy implements TaxStrategy {
    private static final double THRESHOLD = 1_000_000;
    private static final double RATE = 0.10;

    @Override
    public double calculate(double amount) {
        double taxable = amount - THRESHOLD;
        return taxable > 0 ? taxable * RATE : 0;
    }

    @Override
    public String getTaxType() {
        return "ISR";
    }
}

public class IEPSStrategy implements TaxStrategy {
    private static final double RATE = 0.08;
    private static final double FIXED_FEE = 500;

    @Override
    public double calculate(double amount) {
        return amount * RATE + FIXED_FEE;
    }

    @Override
    public String getTaxType() {
        return "IEPS";
    }
}

// Contexto: usa estrategias
public class TaxCalculator {
    private final Map<String, TaxStrategy> strategies = new HashMap<>();

    public TaxCalculator(List<TaxStrategy> strategyList) {
        strategyList.forEach(s -> strategies.put(s.getTaxType(), s));
    }

    public double calculate(String taxType, double amount) {
        TaxStrategy strategy = strategies.get(taxType);
        if (strategy == null) {
            throw new IllegalArgumentException("Unknown tax: " + taxType);
        }
        return strategy.calculate(amount);
    }
}
```

**Beneficios OCP:**
- Para agregar "IVA_EXCENTO", solo creas `IVAExentoStrategy implements TaxStrategy`
- No modificas ninguna clase existente
- Cada estrategia es testeable de forma independiente
- Las estrategias se pueden inyectar desde configuración (Spring, CDI)

---

## Template Method Pattern

Template Method define el esqueleto de un algoritmo en un método, delegando pasos específicos
a subclases. También cumple OCP: el esqueleto está cerrado a modificación, los pasos están
abiertos a extensión.

```java
// Plantilla abstracta (cerrada)
public abstract class InvoiceProcessor {

    // Template method: define el algoritmo (cerrado a modificación)
    public final Invoice process(Order order) {
        validate(order);
        Invoice invoice = createInvoice(order);
        applyTaxes(invoice);
        applyDiscounts(invoice);
        generateDocument(invoice);
        notifyCustomer(invoice);
        return invoice;
    }

    // Pasos comunes (implementados aquí, cerrados)
    private void validate(Order order) {
        if (order == null || order.getItems().isEmpty()) {
            throw new ValidationException("Invalid order");
        }
    }

    private Invoice createInvoice(Order order) {
        return new Invoice(order);
    }

    // Pasos extensibles (abiertos: las subclases implementan)
    protected abstract void applyTaxes(Invoice invoice);
    protected abstract void applyDiscounts(Invoice invoice);
    protected abstract void generateDocument(Invoice invoice);
    protected abstract void notifyCustomer(Invoice invoice);
}

// Implementación concreta 1: Factura nacional
public class NationalInvoiceProcessor extends InvoiceProcessor {
    @Override
    protected void applyTaxes(Invoice invoice) {
        invoice.addTax("IVA", invoice.getSubtotal() * 0.19);
    }

    @Override
    protected void applyDiscounts(Invoice invoice) {
        if (invoice.getSubtotal() > 500000) {
            invoice.addDiscount(0.10);
        }
    }

    @Override
    protected void generateDocument(Invoice invoice) {
        System.out.println("Generating PDF for national invoice");
    }

    @Override
    protected void notifyCustomer(Invoice invoice) {
        System.out.println("Sending email notification");
    }
}

// Implementación concreta 2: Factura de exportación
public class ExportInvoiceProcessor extends InvoiceProcessor {
    @Override
    protected void applyTaxes(Invoice invoice) {
        // Sin IVA para exportaciones
        invoice.addTax("CUSTOMS", invoice.getSubtotal() * 0.05);
    }

    @Override
    protected void applyDiscounts(Invoice invoice) {
        // Descuento por exportación masiva
        if (invoice.getSubtotal() > 1000000) {
            invoice.addDiscount(0.15);
        }
    }

    @Override
    protected void generateDocument(Invoice invoice) {
        System.out.println("Generating bilingual PDF for export");
    }

    @Override
    protected void notifyCustomer(Invoice invoice) {
        System.out.println("Sending email + SMS for export shipment");
    }
}
```

---

## OCP en Spring Framework

Spring Boot ofrece múltiples mecanismos para cumplir OCP:

### 1. Beans y Polimorfismo

```java
// Abstracción (cerrada)
public interface PaymentGateway {
    boolean process(Payment payment);
}

// Extensiones (abiertas)
@Component
@ConditionalOnProperty(name = "payment.gateway", havingValue = "stripe")
public class StripeGateway implements PaymentGateway {
    @Override
    public boolean process(Payment payment) {
        System.out.println("Processing with Stripe: $" + payment.getAmount());
        return true;
    }
}

@Component
@ConditionalOnProperty(name = "payment.gateway", havingValue = "paypal")
public class PayPalGateway implements PaymentGateway {
    @Override
    public boolean process(Payment payment) {
        System.out.println("Processing with PayPal: $" + payment.getAmount());
        return true;
    }
}

// Uso (no necesita cambios al agregar gateways)
@Service
public class PaymentService {
    private final PaymentGateway gateway;

    public PaymentService(PaymentGateway gateway) {
        this.gateway = gateway;
    }

    public boolean pay(Payment payment) {
        return gateway.process(payment);
    }
}
```

### 2. @Bean y Configuración Programática

```java
@Configuration
public class TaxConfig {

    @Bean
    public TaxStrategy ivaStrategy() {
        return new IVAStrategy();
    }

    @Bean
    public TaxStrategy isrStrategy() {
        return new ISRStrategy();
    }

    @Bean
    public TaxCalculator taxCalculator(List<TaxStrategy> strategies) {
        return new TaxCalculator(strategies);
    }
}
```

### 3. @ConditionalOnProperty / @Profile

```java
@Component
@Profile("dev")
public class DevNotificationService implements NotificationService {
    @Override
    public void send(String to, String message) {
        System.out.println("[DEV] Notification to " + to + ": " + message);
    }
}

@Component
@Profile("prod")
public class ProdNotificationService implements NotificationService {
    @Override
    public void send(String to, String message) {
        // Envío real usando AWS SES
        sesClient.sendEmail(...);
    }
}
```

### 4. Repository Inheritance (Spring Data)

```java
public interface BaseRepository<T, ID> {
    Optional<T> findById(ID id);
    T save(T entity);
    void deleteById(ID id);
}

public interface EmployeeRepository extends BaseRepository<Employee, Long> {
    List<Employee> findByDepartment(String department);
}

public interface ProductRepository extends BaseRepository<Product, Long> {
    List<Product> findByPriceLessThan(double price);
}
```

---

## Pattern Matching con Switch (Java 17+)

Java 17 introdujo pattern matching para switch, que permite escribir código más expresivo
sin violar OCP cuando se combina con sealed classes:

```java
// Clases selladas (controlan quién puede extender)
public sealed interface PaymentMethod
    permits CreditCard, PayPal, Crypto, BankTransfer { }

public record CreditCard(String number, String cvv, String expiry) implements PaymentMethod { }
public record PayPal(String email) implements PaymentMethod { }
public record Crypto(String walletAddress, String currency) implements PaymentMethod { }
public record BankTransfer(String accountNumber, String bankCode) implements PaymentMethod { }

// Pattern matching seguro (el compilador verifica exhaustividad)
public class PaymentProcessor {
    public double calculateFee(PaymentMethod method) {
        return switch (method) {
            case CreditCard c -> c.expiry().startsWith("202") ? 2.5 : 3.0;
            case PayPal p -> p.email().endsWith(".edu") ? 1.0 : 2.0;
            case Crypto c -> c.currency().equals("USDC") ? 0.5 : 1.5;
            case BankTransfer b -> b.bankCode().equals("001") ? 0.0 : 0.5;
        };
    }
}
```

---

## Refactorización Guiada: Sistema de Notificaciones

### Antes (viola OCP):

```java
public class NotificationService {
    public void send(String type, String message, String destination) {
        if (type.equals("EMAIL")) {
            System.out.println("Email to " + destination + ": " + message);
        } else if (type.equals("SMS")) {
            System.out.println("SMS to " + destination + ": " + message);
        } else if (type.equals("PUSH")) {
            System.out.println("Push to " + destination + ": " + message);
        } else if (type.equals("WHATSAPP")) {
            System.out.println("WhatsApp to " + destination + ": " + message);
        } else {
            throw new IllegalArgumentException("Unknown type: " + type);
        }
    }
}
```

### Después (cumple OCP):

```java
// Abstracción
public interface NotificationChannel {
    void send(String message, String destination);
    boolean supports(String type);
}

// Implementaciones
@Component
public class EmailChannel implements NotificationChannel {
    @Override
    public void send(String message, String destination) {
        System.out.println("Email to " + destination + ": " + message);
    }

    @Override
    public boolean supports(String type) { return "EMAIL".equals(type); }
}

@Component
public class SMSChannel implements NotificationChannel {
    @Override
    public void send(String message, String destination) {
        System.out.println("SMS to " + destination + ": " + message);
    }

    @Override
    public boolean supports(String type) { return "SMS".equals(type); }
}

// Nuevo canal sin modificar código existente
@Component
public class WhatsAppChannel implements NotificationChannel {
    @Override
    public void send(String message, String destination) {
        System.out.println("WhatsApp to " + destination + ": " + message);
    }

    @Override
    public boolean supports(String type) { return "WHATSAPP".equals(type); }
}

// Servicio cerrado a modificación
@Service
public class NotificationService {
    private final List<NotificationChannel> channels;

    public NotificationService(List<NotificationChannel> channels) {
        this.channels = channels;
    }

    public void send(String type, String message, String destination) {
        NotificationChannel channel = channels.stream()
            .filter(c -> c.supports(type))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Unknown type: " + type));
        channel.send(message, destination);
    }
}
```

---

## Resumen: Guía Práctica de OCP

### Señales de que violas OCP

1. **Tienes un switch/if-else que crece con cada nuevo requerimiento**
2. **Tienes que modificar una clase existente para agregar funcionalidad**
3. **Tus pruebas se rompen cuando agregas una nueva variante**
4. **Tienes métodos con nombres como `processType1`, `processType2`**

### Estrategias para cumplir OCP

| Estrategia | Cuándo usarla |
|------------|---------------|
| Strategy Pattern | Algoritmos intercambiables (impuestos, descuentos, pagos) |
| Template Method | Algoritmo con pasos fijos y pasos variables |
| Decorator | Agregar responsabilidades dinámicamente |
| Observer | Notificar cambios a múltiples suscriptores |
| Factory Method | Crear objetos sin especificar la clase concreta |
| Specification | Reglas de negocio combinables |

### Pattern Matching + Sealed Classes (Java 17+)

Para casos donde el número de variantes es fijo y conocido, sealed classes + pattern matching
ofrecen una alternativa segura y expresiva que el compilador verifica.
