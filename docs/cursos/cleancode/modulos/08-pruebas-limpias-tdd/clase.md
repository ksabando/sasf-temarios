---
sidebar_label: "Clase"
---

# Módulo 08 — Pruebas Limpias (TDD)

## Tests como Documentación Ejecutable

Un test limpio es la mejor documentación: siempre está actualizado y es verificable.

```java
// Test = documentación viva
@Test
void shouldApplySeniorityBonusWhenEmployeeHasMoreThan5Years() {
    Employee employee = new Employee("John", 50000, 6);

    double netPay = employee.calculateNetPay();

    assertThat(netPay).isCloseTo(57500, within(0.01));
}
```

## Una Afirmación por Test (preferiblemente)

Si falla, sabes exactamente qué falló.

```java
// MAL: múltiples afirmaciones, no sabes cuál falla
@Test
void shouldCreateValidEmployee() {
    Employee emp = new Employee("John", 50000, 3);
    assertThat(emp.getName()).isEqualTo("John");
    assertThat(emp.getSalary()).isEqualTo(50000);
    assertThat(emp.getYearsOfService()).isEqualTo(3);
    assertThat(emp.isActive()).isTrue();
}

// BIEN: una afirmación por test (nombre revela qué falla)
@Test
void shouldCreateEmployeeWithGivenName() {
    Employee emp = new Employee("John", 50000, 3);
    assertThat(emp.getName()).isEqualTo("John");
}

@Test
void shouldCreateEmployeeWithGivenSalary() {
    Employee emp = new Employee("John", 50000, 3);
    assertThat(emp.getSalary()).isEqualTo(50000);
}
```

## Un Concepto por Test

Cada test prueba un solo concepto.

```java
// MAL: prueba cálculo y descuento en el mismo test
@Test
void shouldCalculatePay() {
    // ...
    assertThat(netPay).isEqualTo(50000);
    assertThat(tax).isEqualTo(8000);
}

// BIEN: separados por concepto
@Test
void shouldCalculateNetPayForRegularEmployee() { ... }

@Test
void shouldApplyTaxDeduction() { ... }

@Test
void shouldApplyOvertimeSupplement() { ... }

@Test
void shouldHandleZeroHoursWorked() { ... }
```

## F.I.R.S.T Principles

### Fast (Rápido)

Los tests deben ejecutarse en milisegundos. Si tardan, no se ejecutan frecuentemente.

```java
// MAL: test lento (conexión real)
@Test
void shouldSaveToDatabase() {
    Database db = new RealDatabase();  // Tarda 2 segundos
    // ...
}

// BIEN: test rápido (mock)
@Test
void shouldSaveToDatabase() {
    Database db = mock(Database.class);  // Instantáneo
    // ...
}
```

### Independent (Independiente)

Los tests no deben depender unos de otros ni compartir estado mutable.

```java
// MAL: depende de otro test
private static List<Employee> employees = new ArrayList<>();

@Test
void shouldAddEmployee() {
    employees.add(new Employee("John"));
    assertThat(employees).hasSize(1);
}

@Test
void shouldFindEmployee() {
    // Depende de que shouldAddEmployee se ejecute ANTES
    assertThat(employees).isNotEmpty();  // FRÁGIL
}

// BIEN: cada test crea su propio contexto
@Test
void shouldAddEmployee() {
    List<Employee> employees = new ArrayList<>();
    employees.add(new Employee("John"));
    assertThat(employees).hasSize(1);
}

@Test
void shouldFindEmployee() {
    EmployeeRepository repo = new EmployeeRepository();
    repo.add(new Employee("John"));
    assertThat(repo.findByName("John")).isPresent();
}
```

### Repeatable (Repetible)

Debe dar el mismo resultado en cualquier entorno y cualquier orden.

```java
// MAL: depende del tiempo
@Test
void shouldGenerateReport() {
    String report = reportGenerator.generate();
    assertThat(report).contains("2026");  // Fallará en 2027
}

// BIEN: tiempo controlado
@Test
void shouldGenerateReportForGivenDate() {
    Clock clock = Clock.fixed(Instant.parse("2026-06-15T00:00:00Z"), ZoneId.UTC);
    ReportGenerator generator = new ReportGenerator(clock);
    String report = generator.generate();
    assertThat(report).contains("2026");
}
```

### Self-Validating (Auto-validante)

Resultado booleano: pass o fail. Sin interpretación humana.

```java
// MAL: requiere interpretación
@Test
void shouldCalculateTotal() {
    double total = calculateTotal(order);
    System.out.println("Total: " + total);  // Humano debe revisar
}

// BIEN: auto-validante
@Test
void shouldCalculateTotal() {
    double total = calculateTotal(order);
    assertThat(total).isCloseTo(120.50, within(0.01));
}
```

### Timely (Oportuno)

Los tests se escriben **justo antes** del código de producción (TDD).

## TDD: Ciclo Red-Green-Refactor

```
1. RED:   Escribe un test que falla
2. GREEN: Escribe el código mínimo para que pase
3. REFACTOR: Mejora el código manteniendo los tests verdes
```

```java
// RED: test que falla
@Test
void shouldCalculateDiscountForVipCustomer() {
    DiscountCalculator calculator = new DiscountCalculator();
    double discount = calculator.calculate("VIP", 1000.0);
    assertThat(discount).isEqualTo(200.0);
}

// GREEN: mínimo para que pase
public class DiscountCalculator {
    public double calculate(String customerType, double amount) {
        if (customerType.equals("VIP")) return 200.0;
        return 0;
    }
}

// REFACTOR: mejora sin romper tests
public class DiscountCalculator {
    private static final Map<String, Double> DISCOUNT_RATES = Map.of(
        "VIP", 0.20,
        "REGULAR", 0.05,
        "NEW", 0.10
    );

    public double calculate(String customerType, double amount) {
        double rate = DISCOUNT_RATES.getOrDefault(customerType, 0.0);
        return amount * rate;
    }
}
```

## Given-When-Then

Estructura estándar para tests legibles.

```java
@Test
void shouldReturnDiscountedTotalForVipCustomer() {
    // Given
    DiscountCalculator calculator = new DiscountCalculator();
    double amount = 1000.0;
    String customerType = "VIP";

    // When
    double discount = calculator.calculate(customerType, amount);

    // Then
    assertThat(discount).isEqualTo(200.0);
}
```

## Naming de Tests

```java
// MAL
@Test
void test1() { ... }

@Test
void testDiscount() { ... }

// BIEN
@Test
void shouldCalculateDiscountForVipCustomer() { ... }

@Test
void shouldReturnZeroDiscountForUnknownCustomerType() { ... }

@Test
void shouldThrowExceptionWhenAmountIsNegative() { ... }
```

## Tests de Unidad vs Integración vs Aceptación

```java
// Unidad: una clase, aislada
@Test
void shouldApplyTaxToGivenAmount() {
    TaxCalculator tax = new TaxCalculator();
    assertThat(tax.calculate(1000)).isEqualTo(160);
}

// Integración: varias clases reales
@Test
void shouldSaveAndRetrieveEmployee() {
    EmployeeRepository repo = new EmployeeRepository(database);
    repo.save(new Employee("John"));
    assertThat(repo.findByName("John")).isPresent();
}

// Aceptación: flujo completo (end-to-end)
@Test
void shouldCompletePayrollProcess() {
    givenEmployeeExists("John", 50000);
    whenPayrollIsProcessed();
    thenEmployeeGetsPaid("John", 42000);
}
```

## Reglas de Oro

1. **Un test por concepto**
2. **Una aserción por test** (idealmente)
3. **FIRST**: Fast, Independent, Repeatable, Self-validating, Timely
4. **Given-When-Then**: estructura legible
5. **Nombres descriptivos**: `should_behavior_when_condition`
6. **Código de producción primero**: escribir test antes del código (TDD)
