---
sidebar_label: "Clase"
---

# Módulo 09 — Clases

## Clases Pequeñas

La primera regla de las clases: deben ser pequeñas. Si no puedes describir una clase en **25 palabras** sin usar "y" u "o", es muy grande.

```java
// MAL: 400 líneas, múltiples responsabilidades
public class ReportGenerator {
    // Conexión a BD
    // Lógica de negocio
    // Formato HTML
    // Envío de emails
    // Auditoría
}

// BIEN: cada clase tiene una responsabilidad
public class ReportDataFetcher { ... }
public class ReportCalculator { ... }
public class HtmlReportFormatter { ... }
public class EmailSender { ... }
public class AuditLogger { ... }
```

## SRP — Single Responsibility Principle

> "Una clase debe tener una sola razón para cambiar."

```java
// MAL: dos razones para cambiar
public class Employee {
    public double calculatePay() { ... }
    public void saveToDatabase() { ... }
    public void sendEmail() { ... }
}

// Razones para cambiar:
// 1. Cambia la lógica de pago → modificar calculatePay
// 2. Cambia el esquema de BD → modificar saveToDatabase
// 3. Cambia el contenido del email → modificar sendEmail

// BIEN: cada clase, una responsabilidad
public class Employee {
    public double calculatePay() { ... }
}

public class EmployeeRepository {
    public void save(Employee emp) { ... }
}

public class EmailService {
    public void sendPayrollEmail(Employee emp) { ... }
}
```

## Cohesión

Una clase cohesiva usa **todas sus variables en todos sus métodos**.

```java
// MAL: cohesión baja (métodos que no usan campos)
public class ReportService {
    private Database database;
    private EmailSender emailSender;
    private AuditLogger logger;

    public List<Report> fetchAll() {
        return database.query("SELECT * FROM reports");
    }

    public void sendReportByEmail(Report report) {
        emailSender.send(report);  // No usa database
    }

    public void logAudit(String action) {
        logger.log(action);  // No usa database ni emailSender
    }
}

// BIEN: cohesión alta
public class ReportRepository {
    private final Database database;

    public List<Report> findAll() {
        return database.query("SELECT * FROM reports");
    }
}

public class ReportNotificationService {
    private final EmailSender emailSender;

    public void sendReport(Report report) {
        emailSender.send(report);
    }
}

public class AuditService {
    private final AuditLogger logger;

    public void log(String action) {
        logger.log(action);
    }
}
```

### Señales de Baja Cohesión

1. Métodos que solo usan 1 campo → deberían estar en otra clase
2. Métodos privados largos que no usan campos de clase
3. Clases con muchos campos pero pocos métodos que los usan
4. Getters/setters para cada campo (anemia)

## Organización de la Clase

```
Orden estándar:
1. Constantes (static final)
2. Variables estáticas
3. Variables de instancia
4. Constructores
5. Métodos públicos (API) — ordenados por relevancia
6. Métodos privados — cerca de donde se usan
7. Getters/setters — al final (si son necesarios)
```

```java
public class EmployeePayCalculator {

    // 1. Constantes
    private static final double TAX_RATE = 0.16;
    private static final double BONUS_THRESHOLD = 5;

    // 2. Variables de instancia
    private final Employee employee;
    private final TaxTable taxTable;

    // 3. Constructor
    public EmployeePayCalculator(Employee employee, TaxTable taxTable) {
        this.employee = employee;
        this.taxTable = taxTable;
    }

    // 4. Métodos públicos (API)
    public double calculateNetPay() {
        double gross = employee.getBaseSalary();
        double tax = calculateTax(gross);
        double bonus = calculateBonus();
        return gross - tax + bonus;
    }

    // 5. Métodos privados (cerca de su uso)
    private double calculateTax(double gross) {
        return taxTable.apply(gross);
    }

    private double calculateBonus() {
        if (employee.getYearsOfService() > BONUS_THRESHOLD) {
            return employee.getBaseSalary() * 0.10;
        }
        return 0;
    }
}
```

## Organización para el Cambio

Las clases deben organizarse pensando en **qué va a cambiar**.

```java
// MAL: añadir nuevo tipo de reporte implica modificar esta clase
public class ReportService {
    public byte[] generate(String type) {
        return switch (type) {
            case "PDF" -> generatePdf();
            case "CSV" -> generateCsv();
            case "EXCEL" -> generateExcel();
            default -> throw new IllegalArgumentException(type);
        };
    }
}

// BIEN: cada formato es una clase que implementa la misma interfaz
public interface ReportGenerator {
    byte[] generate(ReportData data);
}

public class PdfReportGenerator implements ReportGenerator { ... }
public class CsvReportGenerator implements ReportGenerator { ... }
public class ExcelReportGenerator implements ReportGenerator { ... }

// Para agregar "JSON":
// 1. Crear JsonReportGenerator implements ReportGenerator
// 2. NO modificar código existente (Abierto/Cerrado)
```

## Clases Dios (God Class) vs Clases Cohesivas

```java
// GOD CLASS: 1000+ líneas, TODO en una clase
public class OrderService {
    // Validación, cálculo, persistencia, emails, reporting, auditoría...

    public void createOrder() { ... }
    public void validateOrder() { ... }
    public void calculateTotals() { ... }
    public void saveToDatabase() { ... }
    public void sendConfirmation() { ... }
    public void generateInvoice() { ... }
    public void logAudit() { ... }
    public void updateInventory() { ... }
    public void notifyWarehouse() { ... }
    public void applyDiscounts() { ... }
    public void calculateTaxes() { ... }
    public void calculateShipping() { ... }
}

// CLASES COHESIVAS:
public class OrderCreationService { ... }     // Crear orden
public class OrderValidator { ... }           // Validar
public class OrderPricingService { ... }      // Calcular precios, descuentos, impuestos
public class OrderRepository { ... }          // Persistencia
public class OrderNotificationService { ... } // Emails, notificaciones
public class InventoryUpdater { ... }         // Inventario
public class InvoiceGenerator { ... }         // Facturación
public class AuditService { ... }             // Auditoría
```

## Clases Anémicas vs Ricas

```java
// ANÉMICA: solo datos, sin comportamiento
public class Employee {
    private String name;
    private double salary;
    private int yearsOfService;
    private String department;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }
    // ... más getters/setters
}

// RICA: datos + comportamiento
public class Employee {
    private String name;
    private Money salary;
    private int yearsOfService;
    private Department department;

    public Money calculateNetPay() {
        return salary.subtract(calculateTaxes()).add(calculateBonus());
    }

    public boolean isEligibleForPromotion() {
        return yearsOfService >= 2 && department.hasOpenPositions();
    }

    public void applyAnnualRaise() {
        this.salary = this.salary.multiply(1.03);
    }

    private Money calculateTaxes() {
        return salary.multiply(TaxRate.forIncome(salary));
    }

    private Money calculateBonus() {
        if (yearsOfService > 5) {
            return salary.multiply(0.10);
        }
        return Money.ZERO;
    }
}
```

## Organización en Spring

```java
@Service
public class PayrollService {    // Lógica de negocio
    private final EmployeeRepository repository;
    private final PayCalculator calculator;

    public PayrollResult process(int employeeId) {
        Employee emp = repository.findById(employeeId);
        return calculator.calculate(emp);
    }
}

@Repository
public class EmployeeRepository {  // Acceso a datos
    private final JpaRepository<Employee, Integer> jpaRepository;

    public Employee findById(int id) { ... }
}

@RestController
public class PayrollController {   // Endpoints HTTP
    private final PayrollService service;

    @PostMapping("/payroll/process")
    public ResponseEntity<PayrollResult> process(@RequestParam int employeeId) {
        return ResponseEntity.ok(service.process(employeeId));
    }
}
```

## Reglas de Oro

1. **Clases pequeñas**: si no la describes en 25 palabras, divídela
2. **SRP**: una razón para cambiar por clase
3. **Alta cohesión**: cada método debería usar la mayoría de campos
4. **Organización**: constantes → campos → constructores → públicos → privados
5. **Clases ricas**: datos + comportamiento (no getters/setters sin lógica)
6. **Abierto/Cerrado**: abierta para extensión, cerrada para modificación
