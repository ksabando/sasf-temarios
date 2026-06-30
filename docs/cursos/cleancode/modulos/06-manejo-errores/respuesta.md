---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M06 — Manejo de Errores Refactorizado

## Ejercicio: Eliminación de Códigos de Error y Nulls

**Solución esperada**:

Reemplazo del sistema de códigos de error y nulls por excepciones tipadas y patrones seguros.

## Excepciones Creadas

| Excepción | Tipo | Propósito |
|-----------|------|-----------|
| `EmployeeNotFoundException` | BusinessException | Empleado no encontrado |
| `InvalidPaymentTypeException` | BusinessException | Tipo de pago desconocido |
| `PaymentSaveException` | TechnicalException | Error al guardar pago |
| `NegativeHoursException` | BusinessException | Horas negativas |

## Patrones Aplicados

| Patrón | Dónde | Justificación |
|--------|-------|---------------|
| Null Object | `Currency` | Usar moneda por defecto en lugar de null |
| Strategy | PaymentType | Polimorfismo en lugar de switch/if |
| Optional | `findEmployee` | Evitar null, forzar manejo explícito |
| Fail Fast | Parámetros de entrada | `Objects.requireNonNull` en límites |
| Exception wrapping | savePayment | Preservar causa original |

## Código Refactorizado

```java
package com.sasf.nomina;

import java.util.Objects;
import java.util.Optional;

public class PayrollCalculator {

    private static final int REGULAR_HOURS_LIMIT = 40;
    private static final double OVERTIME_MULTIPLIER = 1.5;
    private static final double HOLIDAY_MULTIPLIER = 2.0;
    private static final double TAX_RATE = 0.16;
    private static final Currency DEFAULT_CURRENCY = Currency.USD;

    private final EmployeeRepository employeeRepository;
    private final PaymentRepository paymentRepository;

    public PayrollCalculator(EmployeeRepository employeeRepository,
                              PaymentRepository paymentRepository) {
        this.employeeRepository = Objects.requireNonNull(employeeRepository);
        this.paymentRepository = Objects.requireNonNull(paymentRepository);
    }

    public Money calculatePayment(String employeeId, int hoursWorked,
                                   PaymentType paymentType, Currency currency) {
        Objects.requireNonNull(employeeId, "employeeId must not be null");
        Objects.requireNonNull(paymentType, "paymentType must not be null");

        if (hoursWorked < 0) {
            throw new NegativeHoursException("Hours worked cannot be negative: " + hoursWorked);
        }

        Employee employee = findEmployeeOrThrow(employeeId);
        Money grossPayment = paymentType.calculate(employee.getHourlyRate(), hoursWorked);
        Money tax = calculateTax(grossPayment);
        Money netPayment = grossPayment.subtract(tax);

        Currency effectiveCurrency = (currency != null) ? currency : DEFAULT_CURRENCY;
        savePaymentOrThrow(employeeId, netPayment, effectiveCurrency);

        return netPayment;
    }

    private Employee findEmployeeOrThrow(String employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found: " + employeeId));
    }

    private Money calculateTax(Money payment) {
        return payment.multiply(TAX_RATE);
    }

    private void savePaymentOrThrow(String employeeId, Money amount, Currency currency) {
        try {
            paymentRepository.save(employeeId, amount, currency);
        } catch (Exception e) {
            throw new PaymentSaveException("Failed to save payment for employee: " + employeeId, e);
        }
    }
}

// VALUE OBJECTS
record Money(double amount) {
    public Money subtract(Money other) {
        return new Money(this.amount - other.amount);
    }

    public Money multiply(double factor) {
        return new Money(this.amount * factor);
    }
}

enum Currency { USD, EUR, ARS }

// STRATEGY PATTERN para tipos de pago
interface PaymentType {
    Money calculate(double hourlyRate, int hoursWorked);
}

class RegularPayment implements PaymentType {
    public Money calculate(double hourlyRate, int hoursWorked) {
        if (hoursWorked <= REGULAR_HOURS_LIMIT) {
            return new Money(hoursWorked * hourlyRate);
        }
        double regularPay = REGULAR_HOURS_LIMIT * hourlyRate;
        double overtimePay = (hoursWorked - REGULAR_HOURS_LIMIT) * hourlyRate * OVERTIME_MULTIPLIER;
        return new Money(regularPay + overtimePay);
    }
}

class OvertimePayment implements PaymentType {
    public Money calculate(double hourlyRate, int hoursWorked) {
        return new Money(hoursWorked * hourlyRate * OVERTIME_MULTIPLIER);
    }
}

class HolidayPayment implements PaymentType {
    public Money calculate(double hourlyRate, int hoursWorked) {
        return new Money(hoursWorked * hourlyRate * HOLIDAY_MULTIPLIER);
    }
}

// EXCEPCIONES DE DOMINIO
class BusinessException extends RuntimeException {
    public BusinessException(String message) { super(message); }
    public BusinessException(String message, Throwable cause) { super(message, cause); }
}

class TechnicalException extends RuntimeException {
    public TechnicalException(String message, Throwable cause) { super(message, cause); }
}

class EmployeeNotFoundException extends BusinessException {
    public EmployeeNotFoundException(String message) { super(message); }
}

class NegativeHoursException extends BusinessException {
    public NegativeHoursException(String message) { super(message); }
}

class PaymentSaveException extends TechnicalException {
    public PaymentSaveException(String message, Throwable cause) { super(message, cause); }
}
```

**Posibles mejoras**:

- Reemplazar el uso de `DEFAULT_CURRENCY` como fallback silencioso de `currency != null` por una validación explícita con `Objects.requireNonNull(currency, "currency must not be null")`. Usar un valor por defecto cuando el parámetro es null oculta bugs —si el llamante pasó null, probablemente fue un error.

- Encapsular `Money` con `BigDecimal` en lugar de `double` para evitar errores de precisión en cálculos financieros. El método `multiply(double factor)` con `double` propaga errores de redondeo que se magnifican en sistemas que procesan miles de transacciones.

- Crear un `PaymentTypeFactory` que resuelva el tipo de pago desde un enum o string sin exponer las clases concretas. Esto permite que el código cliente use `PaymentType.from("REGULAR")` sin conocer las implementaciones concretas, facilitando agregar nuevos tipos de pago.

## Resumen de Mejoras

| Aspecto | Antes | Después |
|---------|-------|---------|
| Códigos de error | 8 códigos (-1 a -8) | 0 (excepciones) |
| Retornos null | 2 métodos | 0 (Optional + excepción) |
| Validaciones null | Manual (if) | Objects.requireNonNull |
| System.out.println | 8 usos | 0 |
| Switch strings | paymentType | Polimorfismo (Strategy) |
| Tipos de moneda | String "USD" | Enum Currency |
| Números mágicos | 40, 1.5, 2.0, 0.16 | Constantes con nombre |

