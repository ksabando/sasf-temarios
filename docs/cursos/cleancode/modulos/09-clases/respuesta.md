---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M09 — ReportGenerator Refactorizado

## Ejercicio: Refactorización de God Class ReportGenerator

**Solución esperada**:

División de una clase monolítica de 1200 líneas en 12 clases con SRP.

## Clases Creadas (12 clases)

| # | Clase | Responsabilidad | Líneas |
|---|-------|----------------|--------|
| 1 | `ReportGeneratorService` | Orquestador: coordina el flujo completo | 20 |
| 2 | `ReportConfiguration` | Configuración y validación de parámetros | 30 |
| 3 | `EmployeeRepository` | Consultas SQL de empleados (datos crudos) | 40 |
| 4 | `PayrollCalculator` | Cálculos de nómina (gross, deductions, net) | 60 |
| 5 | `BonusCalculator` | Cálculo de bonos | 25 |
| 6 | `TaxCalculator` | Cálculo de impuestos y deducciones | 30 |
| 7 | `EmployerCostCalculator` | Cálculo de costos patronales | 20 |
| 8 | `PdfReportFormatter` | Generación de reportes PDF | 50 |
| 9 | `CsvReportFormatter` | Generación de reportes CSV | 30 |
| 10 | `FileReportSaver` | Guardado de archivos en disco | 20 |
| 11 | `EmailNotificationService` | Envío de notificaciones por email | 25 |
| 12 | `AuditService` | Registro de auditoría | 15 |

## Diagrama de Dependencias

```
ReportGeneratorService
├── ReportConfiguration (valida)
├── EmployeeRepository (obtiene datos)
├── PayrollCalculator → BonusCalculator
│                    → TaxCalculator
│                    → EmployerCostCalculator
├── ReportFormatter (interface)
│   ├── PdfReportFormatter
│   └── CsvReportFormatter
├── FileReportSaver (persiste archivo)
├── EmailNotificationService (notifica)
└── AuditService (audita)
```

## Código Refactorizado

```java
package com.sasf.nomina.report;

// ==================== PUERTOS (INTERFACES) ====================

interface ReportFormatter {
    byte[] format(ReportData data);
}

interface NotificationService {
    void send(String to, String subject, String body);
}

// ==================== CONFIGURACIÓN ====================

public class ReportConfiguration {
    private final String format;
    private final String reportType;
    private final Path outputPath;

    public ReportConfiguration(String format, String reportType, Path outputPath) {
        this.format = requireNonNull(format, "format must not be null");
        this.reportType = requireNonNull(reportType, "reportType must not be null");
        this.outputPath = requireNonNull(outputPath, "outputPath must not be null");
        validate();
    }

    private void validate() {
        List<String> validFormats = List.of("PDF", "CSV", "EXCEL", "HTML", "JSON");
        if (!validFormats.contains(format.toUpperCase())) {
            throw new InvalidConfigurationException("Unsupported format: " + format);
        }
    }

    public String getFormat() { return format; }
    public String getReportType() { return reportType; }
    public Path getOutputPath() { return outputPath; }
}

// ==================== REPOSITORIO ====================

public class EmployeeRepository {
    private final DataSource dataSource;

    public EmployeeRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<Employee> findAll() {
        String sql = "SELECT * FROM employees WHERE active = true";
        return dataSource.query(sql, this::mapToEmployee);
    }

    public List<Payment> findPaymentsByEmployeeId(int employeeId) {
        String sql = "SELECT * FROM payments WHERE employee_id = ?";
        return dataSource.query(sql, this::mapToPayment, employeeId);
    }

    private Employee mapToEmployee(ResultSet rs) { ... }
    private Payment mapToPayment(ResultSet rs) { ... }
}

// ==================== CALCULADORAS ====================

public class PayrollCalculator {
    private final BonusCalculator bonusCalculator;
    private final TaxCalculator taxCalculator;
    private final EmployerCostCalculator employerCostCalculator;

    public PayrollCalculator(BonusCalculator bonusCalculator,
                              TaxCalculator taxCalculator,
                              EmployerCostCalculator employerCostCalculator) {
        this.bonusCalculator = bonusCalculator;
        this.taxCalculator = taxCalculator;
        this.employerCostCalculator = employerCostCalculator;
    }

    public PayrollResult calculate(Employee employee, List<Payment> payments) {
        Money grossPay = calculateGrossPay(payments);
        Money bonus = bonusCalculator.calculate(employee);
        Money deductions = taxCalculator.calculate(grossPay);
        Money employerCosts = employerCostCalculator.calculate(grossPay);
        Money netPay = grossPay.add(bonus).subtract(deductions);

        return new PayrollResult(employee, grossPay, bonus, deductions, employerCosts, netPay);
    }

    private Money calculateGrossPay(List<Payment> payments) {
        return payments.stream()
            .map(Payment::getAmount)
            .reduce(Money.ZERO, Money::add);
    }
}

public class BonusCalculator {
    private static final double SENIORITY_BONUS_RATE = 0.10;
    private static final int SENIORITY_THRESHOLD_YEARS = 5;

    public Money calculate(Employee employee) {
        if (employee.getYearsOfService() > SENIORITY_THRESHOLD_YEARS) {
            return employee.getBaseSalary().multiply(SENIORITY_BONUS_RATE);
        }
        return Money.ZERO;
    }
}

public class TaxCalculator {
    private static final double TAX_RATE = 0.16;
    private static final double HIGH_INCOME_THRESHOLD = 100000;
    private static final double HIGH_INCOME_SURCHARGE = 0.05;

    public Money calculate(Money grossPay) {
        double rate = TAX_RATE;
        if (grossPay.isGreaterThan(Money.of(HIGH_INCOME_THRESHOLD))) {
            rate += HIGH_INCOME_SURCHARGE;
        }
        return grossPay.multiply(rate);
    }
}

public class EmployerCostCalculator {
    private static final double EMPLOYER_COST_RATE = 0.30;

    public Money calculate(Money grossPay) {
        return grossPay.multiply(EMPLOYER_COST_RATE);
    }
}

// ==================== FORMATEADORES ====================

public class PdfReportFormatter implements ReportFormatter {
    public byte[] format(ReportData data) {
        // Lógica de generación PDF
        return new byte[0];
    }
}

public class CsvReportFormatter implements ReportFormatter {
    public byte[] format(ReportData data) {
        StringBuilder csv = new StringBuilder();
        csv.append("Employee,Gross,Bonus,Taxes,Net\n");
        for (PayrollResult result : data.results()) {
            csv.append(result.employee().getName()).append(",");
            csv.append(result.grossPay()).append(",");
            csv.append(result.bonus()).append(",");
            csv.append(result.deductions()).append(",");
            csv.append(result.netPay()).append("\n");
        }
        return csv.toString().getBytes();
    }
}

// ==================== SERVICIOS ====================

public class FileReportSaver {
    public void save(Path path, byte[] content) {
        Files.write(path, content);
    }
}

public class EmailNotificationService implements NotificationService {
    private final EmailSender emailSender;

    public EmailNotificationService(EmailSender emailSender) {
        this.emailSender = emailSender;
    }

    public void send(String to, String subject, String body) {
        emailSender.send(to, subject, body);
    }
}

public class AuditService {
    private final AuditLogger logger;

    public AuditService(AuditLogger logger) {
        this.logger = logger;
    }

    public void logReportGeneration(ReportConfiguration config, int recordCount) {
        logger.log(String.format("Report generated: format=%s, type=%s, records=%d",
            config.getFormat(), config.getReportType(), recordCount));
    }
}

// ==================== ORQUESTADOR ====================

public class ReportGeneratorService {
    private final ReportConfiguration configuration;
    private final EmployeeRepository employeeRepository;
    private final PayrollCalculator payrollCalculator;
    private final ReportFormatter reportFormatter;
    private final FileReportSaver fileReportSaver;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public ReportGeneratorService(ReportConfiguration configuration,
                                   EmployeeRepository employeeRepository,
                                   PayrollCalculator payrollCalculator,
                                   ReportFormatter reportFormatter,
                                   FileReportSaver fileReportSaver,
                                   NotificationService notificationService,
                                   AuditService auditService) {
        this.configuration = configuration;
        this.employeeRepository = employeeRepository;
        this.payrollCalculator = payrollCalculator;
        this.reportFormatter = reportFormatter;
        this.fileReportSaver = fileReportSaver;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    public void generate() {
        List<Employee> employees = employeeRepository.findAll();
        List<PayrollResult> results = calculatePayroll(employees);
        ReportData reportData = new ReportData(results);
        byte[] formattedReport = reportFormatter.format(reportData);
        fileReportSaver.save(configuration.getOutputPath(), formattedReport);
        notificationService.send("admin@company.com", "Report Generated",
            "Report saved to: " + configuration.getOutputPath());
        auditService.logReportGeneration(configuration, results.size());
    }

    private List<PayrollResult> calculatePayroll(List<Employee> employees) {
        return employees.stream()
            .map(emp -> payrollCalculator.calculate(emp, employeeRepository.findPaymentsByEmployeeId(emp.getId())))
            .toList();
    }
}
```

**Posibles mejoras**:

- Reemplazar los constructores con muchos parámetros (especialmente `ReportGeneratorService` con 7 dependencias) por el patrón Builder o por una fábrica. Un constructor de 7 parámetros es frágil y difícil de usar correctamente —es fácil invertir dos parámetros del mismo tipo. Un `ReportGeneratorService.Builder` o usar Spring con `@Autowired` haría la construcción más segura.

- Aplicar el patrón Strategy para seleccionar el formateador en tiempo de ejecución a través de una `ReportFormatterFactory`, en lugar de recibir un `ReportFormatter` ya instanciado. Esto permite que el orquestador pida el formateador por nombre (`"PDF"`, `"CSV"`) y la fábrica lo resuelva, desacoplando la selección de la inyección.

- Externalizar las constantes de las calculadoras (`SENIORITY_BONUS_RATE`, `TAX_RATE`, etc.) a archivos de propiedades o a una tabla de base de datos para que puedan modificarse sin redesplegar. En un sistema de nómina real, estos valores cambian con legislación nueva y modificar código para un cambio de tasa es un riesgo operativo innecesario.

## Resumen de Mejoras

| Aspecto | Antes (God Class) | Después (12 clases) |
|---------|-------------------|---------------------|
| Líneas por clase | 1200 | 15-60 |
| Responsabilidades | 12 en una clase | 1 por clase |
| Acoplamiento | Alto (todo junto) | Bajo (dependencias inyectadas) |
| Testeabilidad | Difícil (todo depende de BD) | Fácil (mocks por interfaz) |
| Cohesión | Baja (métodos usan pocos campos) | Alta (cada clase usa todos sus campos) |
| SRP | Violado | Respetado |

