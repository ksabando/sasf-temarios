---
sidebar_label: "Clase"
---

# Módulo 06 — Manejo de Errores

## Excepciones vs Códigos de Error

```java
// MAL: códigos de error (rompen el flujo)
public int calculateTotal(Order order, double[] result) {
    if (order == null) return -1;
    if (order.getItems().isEmpty()) return -2;
    // ...
    result[0] = total;
    return 0; // success
}

// Uso:
double[] result = new double[1];
int code = calculateTotal(order, result);
if (code == 0) {
    // OK
} else if (code == -1) {
    // null
}
// El caller DEBE recordar revisar el código

// BIEN: excepción (separa error de lógica normal)
public double calculateTotal(Order order) {
    if (order == null) throw new IllegalArgumentException("Order cannot be null");
    if (order.getItems().isEmpty()) throw new EmptyOrderException("Order has no items");
    // ...
    return total;
}

// Uso:
try {
    double total = calculateTotal(order);
    processPayment(total);
} catch (EmptyOrderException e) {
    notifyUser("Order is empty");
}
```

## Try-Catch-Finally

El try-catch-finally define un **ámbito de transacción**: lo que pasa en el try debe ser consistente.

```java
public void transfer(Account from, Account to, Money amount) {
    try {
        from.debit(amount);
        to.credit(amount);
    } catch (InsufficientFundsException e) {
        from.rollback();
        to.rollback();
        throw e;  // Re-lanza para que el caller maneje
    }
}
```

## Unchecked Exceptions

En Java moderno, prefiere **unchecked exceptions** (RuntimeException). Las checked exceptions rompen el Principio de Abierto/Cerrado.

```java
// MAL: checked exception en capas
public void process() throws SQLException, IOException, ParseException {
    // Cada capa debe declarar o atrapar
}

// BIEN: unchecked, solo manejas donde importa
public void process() {
    // Lanza RuntimeException si algo falla
}

public void controller() {
    try {
        process();
    } catch (DataAccessException e) {
        // Manejo centralizado (ej. @ControllerAdvice)
    }
}
```

## Proveer Contexto en Excepciones

Cada excepción debe contar una historia: qué pasó, con qué datos, por qué.

```java
// MAL: sin contexto
throw new RuntimeException("Error");

// BIEN: contexto completo
throw new PaymentFailedException(
    String.format("Payment failed for customer %s: insufficient funds (balance: %.2f, required: %.2f)",
        customerId, currentBalance, requiredAmount)
);

// MAL: perder contexto
catch (SQLException e) {
    throw new RuntimeException();  // Perdí la causa original
}

// BIEN: preservar causa
catch (SQLException e) {
    throw new DataAccessException("Failed to save order: " + orderId, e);
}
```

## Manejo de Null: El Error de los Mil Millones

Tony Hoare llamó a null su "error de los mil millones de dólares".

```java
// MAL: retornar null
public Employee findById(int id) {
    for (Employee e : employees) {
        if (e.getId() == id) return e;
    }
    return null;  // El caller DEBE revisar
}

// BIEN: Optional
public Optional<Employee> findById(int id) {
    return employees.stream()
        .filter(e -> e.getId() == id)
        .findFirst();
}

// Uso:
Employee emp = findById(5)
    .orElseThrow(() -> new EmployeeNotFoundException("Employee 5 not found"));

// O usar orElse/orElseGet para valor default
Employee emp = findById(5).orElse(Employee.defaultEmployee());
```

## Null Object Pattern

En lugar de retornar null, retorna un objeto que no hace nada.

```java
// MAL
public Discount getDiscount(Customer customer) {
    if (customer.isVip()) {
        return new PercentageDiscount(0.20);
    }
    return null;  // PELIGRO
}

// BIEN: Null Object
public Discount getDiscount(Customer customer) {
    if (customer.isVip()) {
        return new PercentageDiscount(0.20);
    }
    return new NoDiscount();  // Null Object - no hace nada
}

class NoDiscount implements Discount {
    public double apply(double amount) {
        return amount;  // No descuenta nada
    }
}
```

## No Pasar Null

```java
// MAL: aceptas null como parámetro
public void save(Employee employee) {
    if (employee == null) return;  // Traga el error
    // ...
}

// BIEN: fail fast
public void save(Employee employee) {
    Objects.requireNonNull(employee, "Employee cannot be null");
    // ...
}

// En constructor
public class OrderService {
    private final PaymentGateway gateway;

    public OrderService(PaymentGateway gateway) {
        this.gateway = Objects.requireNonNull(gateway, "PaymentGateway required");
    }
}
```

## Excepciones de Dominio vs Técnicas

```java
// Excepción de dominio (significativa para el negocio)
public class InsufficientBalanceException extends BusinessException {
    public InsufficientBalanceException(String accountId, double balance, double required) {
        super(String.format("Account %s has %.2f but requires %.2f", accountId, balance, required));
    }
}

// Excepción técnica (error de infraestructura)
public class DatabaseConnectionException extends TechnicalException {
    public DatabaseConnectionException(String message, Throwable cause) {
        super(message, cause);
    }
}

// Uso
public void withdraw(String accountId, double amount) {
    Account account = accountRepository.findById(accountId)
        .orElseThrow(() -> new AccountNotFoundException(accountId));

    if (account.getBalance() < amount) {
        throw new InsufficientBalanceException(accountId, account.getBalance(), amount);
    }

    try {
        accountRepository.save(account);
    } catch (SQLException e) {
        throw new DatabaseConnectionException("Failed to save account", e);
    }
}
```

## Manejo de Errores en Spring

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        return ResponseEntity
            .badRequest()
            .body(new ErrorResponse("BUSINESS_ERROR", e.getMessage()));
    }

    @ExceptionHandler(TechnicalException.class)
    public ResponseEntity<ErrorResponse> handleTechnical(TechnicalException e) {
        log.error("Technical error", e);
        return ResponseEntity
            .internalServerError()
            .body(new ErrorResponse("TECHNICAL_ERROR", "Internal server error"));
    }
}
```

## Reglas de Oro

1. **Nunca retornes null**. Usa Optional, Null Object, o lanza excepción.
2. **Nunca pases null**. Fail fast con Objects.requireNonNull.
3. **Las excepciones cuentan historias**. Provee contexto siempre.
4. **Preserva la causa original**. No tragues excepciones.
5. **Unchecked > Checked**. Las checked violan OCP.
