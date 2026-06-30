---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M08 — TDD: Calculadora de Descuentos

## Ejercicio: Desarrollo Dirigido por Tests de DiscountCalculator

**Solución esperada**:

Desarrollo iterativo siguiendo el ciclo Red → Green → Refactor para 10 casos de prueba.

### Iteraciones TDD

### Iteración 1: Sin descuento para montos < $100

**RED**: Test para monto $50, espera $50
**GREEN**: `return amount;`
**REFACTOR**: Nada que refactorizar aún

### Iteración 2: 5% para montos ≥ $100

**RED**: Test para monto $100, espera $95
**GREEN**: Añadir condicional `if (amount >= 100) return amount * 0.95;`
**REFACTOR**: Extraer constante `STANDARD_DISCOUNT_RATE = 0.05`

### Iteración 3-10: Progresivamente...

## Código de Producción

```java
package com.sasf.nomina.discount;

import java.util.Objects;

public class DiscountCalculator {

    private static final double MINIMUM_AMOUNT_FOR_DISCOUNT = 100.0;
    private static final double STANDARD_DISCOUNT_RATE = 0.05;
    private static final double VIP_DISCOUNT_RATE = 0.15;
    private static final double BULK_DISCOUNT_THRESHOLD = 10;
    private static final double BULK_DISCOUNT_RATE = 0.10;
    private static final double SEASONAL_DISCOUNT_RATE = 0.20;
    private static final String SEASONAL_CODE = "SUMMER2026";
    private static final double MAX_TOTAL_DISCOUNT_RATE = 0.50;

    public double calculate(double amount, String customerType, int itemCount, String seasonalCode) {
        validateInputs(amount, customerType);

        double totalDiscountRate = 0;

        if (amount >= MINIMUM_AMOUNT_FOR_DISCOUNT) {
            totalDiscountRate += STANDARD_DISCOUNT_RATE;
        }

        if ("VIP".equals(customerType)) {
            totalDiscountRate += VIP_DISCOUNT_RATE;
        }

        if (itemCount >= BULK_DISCOUNT_THRESHOLD) {
            totalDiscountRate += BULK_DISCOUNT_RATE;
        }

        if (SEASONAL_CODE.equals(seasonalCode)) {
            totalDiscountRate += SEASONAL_DISCOUNT_RATE;
        }

        double effectiveDiscountRate = Math.min(totalDiscountRate, MAX_TOTAL_DISCOUNT_RATE);
        double discountedAmount = amount * (1 - effectiveDiscountRate);

        return roundToTwoDecimals(discountedAmount);
    }

    private void validateInputs(double amount, String customerType) {
        if (amount < 0) {
            throw new IllegalArgumentException("Amount cannot be negative: " + amount);
        }
        Objects.requireNonNull(customerType, "Customer type must not be null");
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
```

## Tests

```java
package com.sasf.nomina.discount;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class DiscountCalculatorTest {

    private final DiscountCalculator calculator = new DiscountCalculator();

    @Test
    void shouldReturnFullAmountWhenAmountIsBelow100() {
        double result = calculator.calculate(50.0, "REGULAR", 1, null);
        assertThat(result).isEqualTo(50.0);
    }

    @Test
    void shouldApplyStandardDiscountWhenAmountIs100OrMore() {
        double result = calculator.calculate(100.0, "REGULAR", 1, null);
        assertThat(result).isEqualTo(95.0);
    }

    @Test
    void shouldApplyVipDiscountForVipCustomer() {
        double result = calculator.calculate(100.0, "VIP", 1, null);
        assertThat(result).isEqualTo(85.0);
    }

    @Test
    void shouldApplyBulkDiscountWhenItemCountIs10OrMore() {
        double result = calculator.calculate(200.0, "REGULAR", 15, null);
        assertThat(result).isCloseTo(170.0, within(0.01));
    }

    @Test
    void shouldApplySeasonalDiscountWhenCodeMatches() {
        double result = calculator.calculate(200.0, "REGULAR", 1, "SUMMER2026");
        assertThat(result).isCloseTo(150.0, within(0.01));
    }

    @Test
    void shouldCapTotalDiscountAt50Percent() {
        double result = calculator.calculate(1000.0, "VIP", 20, "SUMMER2026");
        assertThat(result).isEqualTo(500.0);
    }

    @Test
    void shouldAccumulateDiscountsCorrectly() {
        double result = calculator.calculate(200.0, "VIP", 15, "SUMMER2026");
        assertThat(result).isCloseTo(110.0, within(0.01));
    }

    @Test
    void shouldRoundToTwoDecimalPlaces() {
        double result = calculator.calculate(99.99, "REGULAR", 1, null);
        assertThat(result).isEqualTo(99.99);
    }

    @Test
    void shouldThrowExceptionWhenAmountIsNegative() {
        assertThatThrownBy(() -> calculator.calculate(-100.0, "REGULAR", 1, null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("negative");
    }

    @Test
    void shouldThrowExceptionWhenCustomerTypeIsNull() {
        assertThatThrownBy(() -> calculator.calculate(100.0, null, 1, null))
            .isInstanceOf(NullPointerException.class);
    }
}
```

**Posibles mejoras**:

- Reemplazar los strings `"REGULAR"`, `"VIP"` por un enum `CustomerType`. Actualmente un typo como `calculate(100, "vip", 1, null)` (minúsculas) no aplica el descuento VIP silenciosamente, lo que es un bug difícil de detectar. Con enum, el compilador no permite valores inválidos.

- Externalizar las tasas de descuento (`STANDARD_DISCOUNT_RATE`, `VIP_DISCOUNT_RATE`, etc.) a una clase de configuración `DiscountRules` inyectable. Esto permite cambiar las reglas sin modificar código (por ejemplo, desde una base de datos o archivo de propiedades) y testear diferentes configuraciones sin tocar la clase bajo prueba.

- Reemplazar `double` por `BigDecimal` en toda la calculadora. Los descuentos son dinero, y los errores de redondeo con `double` se acumulan. El método `roundToTwoDecimals` es un parche que no resuelve el problema de fondo —los errores ya ocurrieron durante la multiplicación y suma antes de redondear.

- Usar `@ParameterizedTest` de JUnit 5 con `@CsvSource` para los tests de cálculo, en lugar de tener un test separado para cada combinación. Esto haría los tests más concisos y fáciles de extender cuando se agreguen nuevas reglas de descuento.

- Agregar un test que verifique el comportamiento con `seasonalCode` vacío (`""`) vs null. Actualmente solo null está cubierto, pero un string vacío podría ser un caso borde que el código actual trata igual que un código inválido —debería estar documentado con un test.

## Resumen

| Regla | Test | Código añadido | Refactor |
|-------|------|----------------|----------|
| 1 | shouldReturnFullAmountWhenAmountIsBelow100 | `return amount` | - |
| 2 | shouldApplyStandardDiscountWhenAmountIs100OrMore | Condicional 5% | Constante `STANDARD_DISCOUNT_RATE` |
| 3 | shouldApplyVipDiscountForVipCustomer | If VIP + 15% | Constante `VIP_DISCOUNT_RATE` |
| 4 | shouldApplyBulkDiscountWhenItemCountIs10OrMore | If cantidad ≥ 10 | Extraer método `calculateBulkDiscount` |
| 5 | shouldApplySeasonalDiscountWhenCodeMatches | If código | Constante `SEASONAL_CODE` |
| 6 | shouldCapTotalDiscountAt50Percent | `Math.min(rate, 0.50)` | Constante `MAX_TOTAL_DISCOUNT_RATE` |
| 7 | shouldRoundToTwoDecimalPlaces | `Math.round(...)` | Extraer `roundToTwoDecimals` |
| 8 | shouldThrowExceptionWhenAmountIsNegative | `if (amount < 0) throw ...` | Extraer `validateInputs` |
| 9 | shouldThrowExceptionWhenCustomerTypeIsNull | `Objects.requireNonNull` | Agregar a `validateInputs` |
| 10 | shouldAccumulateDiscountsCorrectly | Suma de tasas | Refactor tasas acumulativas |

