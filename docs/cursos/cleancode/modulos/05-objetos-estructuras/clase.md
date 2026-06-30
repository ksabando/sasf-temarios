---
sidebar_label: "Clase"
---

# Módulo 05 — Objetos y Estructuras de Datos

## Abstracción de Datos

Un objeto **oculta sus datos** y **expone comportamiento**. No preguntes por los datos; pídele al objeto que haga algo.

```java
// MAL: expone datos, obliga al caller a hacer lógica
public class Circle {
    public double radius;
}

// Uso:
Circle c = new Circle();
double area = Math.PI * c.radius * c.radius;

// BIEN: expone comportamiento, oculta implementación
public class Circle {
    private double radius;

    public double area() {
        return Math.PI * radius * radius;
    }
}

// Uso:
Circle c = new Circle();
double area = c.area();
```

## Ley de Demeter

> "Habla solo con tus amigos inmediatos. No hables con extraños."

Un método solo debe llamar a:
1. Sus propios métodos
2. Objetos que recibe como parámetros
3. Objetos que crea
4. Sus campos directos

```java
// MAL: violación flagrante
order.getCustomer().getAddress().getZipCode();

// BIEN: pedirle al objeto que haga
order.getCustomerZipCode();

// MAL: train wreck
String zipCode = order.getCustomer()
    .getAddress()
    .getCity()
    .getZipCode();

// BIEN: el objeto oculta la navegación
String zipCode = order.getShippingZipCode();
```

## Train Wrecks

Encadenar llamadas es una señal de que estás violando la Ley de Demeter.

```java
// MAL: train wreck
String result = service
    .getRepository()
    .findById(id)
    .getData()
    .getValue();

// BIEN: el servicio expone lo que necesitas
String result = service.getValueById(id);
```

## DTOs vs Objetos de Dominio

### DTO (Data Transfer Object)
- Estructura de datos pública
- Sin comportamiento significativo
- Solo transporta datos entre capas

```java
// DTO: estructura de datos
public class EmployeeDTO {
    public String name;
    public double salary;
    public String department;
}
```

### Objeto de Dominio
- Oculta datos, expone comportamiento
- Tiene reglas de negocio
- No expone sus campos (excepto a través de métodos de negocio)

```java
// Objeto de dominio: comportamiento
public class Employee {
    private String name;
    private Money salary;
    private Department department;

    public Money calculateMonthlyPayment() {
        return salary.subtract(calculateTaxes());
    }

    public boolean isEligibleForBonus() {
        return department.hasBudgetForBonuses() && salary.isBelow(Money.of(50000));
    }

    private Tax calculateTaxes() {
        return salary.applyRate(TaxRate.forIncome(salary));
    }
}
```

## Getters/Setters: ¿Encapsulación Real?

```java
// MAL: getters que exponen datos sin abstraer
public class Employee {
    private double salary;

    public double getSalary() {
        return salary;  // Esto NO es encapsulación
    }

    public void setSalary(double salary) {
        this.salary = salary;  // Esto NO es encapsulación
    }
}

// BIEN: comportamiento que abstrae
public class Employee {
    private double baseSalary;
    private double bonus;
    private double taxRate;

    public double calculateNetPay() {
        return (baseSalary + bonus) * (1 - taxRate);
    }

    public void applyAnnualRaise(double percentage) {
        this.baseSalary += this.baseSalary * percentage;
    }

    public void setBonus(double bonus) {
        this.bonus = bonus;
    }
}
```

## Objeto vs Estructura de Datos

| Característica | Objeto | Estructura de Datos |
|---------------|--------|---------------------|
| Datos | Privados (ocultos) | Públicos (expuestos) |
| Comportamiento | Expone métodos de negocio | Pocos o ningún método |
| Abstracción | Alta: no sabes cómo guarda | Baja: sabes exactamente qué campos tiene |
| Cambio | Fácil de cambiar comportamiento | Fácil de agregar nuevos datos |

### Dilema Híbrido

```java
// MAL: híbrido peligroso
public class Employee {
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double calculatePay() { /* ... */ }
}
```

### Ley de Demeter en Spring

```java
// MAL: violación común en Spring
@Service
public class ReportService {
    @Autowired
    private EmployeeRepository repository;

    public List<Report> generate() {
        return repository.findAll()
            .stream()
            .map(e -> new Report(e.getName(), e.getSalary()))
            .collect(...);
    }
}

// BIEN: el servicio expone lo que necesita
@Service
public class ReportService {
    private final EmployeeRepository repository;

    public ReportService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public List<Report> generate() {
        List<Employee> employees = repository.findAll();
        return buildReports(employees);
    }
}
```

## Regla de Oro

> No preguntes por los datos. Pídele al objeto que haga algo con ellos.
