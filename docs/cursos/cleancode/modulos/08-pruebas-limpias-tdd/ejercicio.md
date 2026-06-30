---
sidebar_label: "Ejercicio"
---

# Ejercicio M08 — TDD: Calculadora de Descuentos

## Objetivo

Aplicar TDD (Red-Green-Refactor) para desarrollar una calculadora de descuentos. Debes escribir los tests **antes** del código de producción.

## Requisitos de la Calculadora de Descuentos

### Reglas de negocio (en orden de implementación)

1. **Sin descuento**: montos menores a \$100 no tienen descuento
2. **Descuento estándar**: montos ≥ \$100 reciben 5% de descuento
3. **Descuento VIP**: clientes VIP reciben 15% de descuento (independiente del monto)
4. **Descuento por cantidad**: 10+ items iguales reciben 10% adicional
5. **Descuento por temporada**: si hay código de temporada "SUMMER2026", 20% adicional
6. **Tope de descuento**: máximo 50% de descuento acumulado
7. **Redondeo**: montos redondeados a 2 decimales
8. **Validación**: montos negativos lanzan IllegalArgumentException
9. **Validación**: tipo de cliente null lanza NullPointerException
10. **Acumulación de descuentos**: los descuentos se acumulan, no se anidan

### Ejemplos

| Monto | Cliente | Items | Código | Esperado |
|-------|---------|-------|--------|----------|
| 50.00 | REGULAR | 1 | null | 50.00 (sin descuento) |
| 100.00 | REGULAR | 1 | null | 95.00 (5% estándar) |
| 100.00 | VIP | 1 | null | 85.00 (15% VIP) |
| 200.00 | REGULAR | 15 | null | 170.00 (5% + 10% cantidad) |
| 200.00 | VIP | 15 | "SUMMER2026" | 110.00 (15% + 10% + 20% = 45%) |
| 1000.00 | REGULAR | 1 | "SUMMER2026" | 750.00 (5% + 20% = 25%, pero tope 50% no aplica) |
| 1000.00 | VIP | 20 | "SUMMER2026" | 500.00 (15+10+20=45%) |
| -100.00 | REGULAR | 1 | null | IllegalArgumentException |
| 100.00 | null | 1 | null | NullPointerException |

## Instrucciones TDD

Para cada regla, sigue el ciclo:

1. **RED**: Escribe el test que falla (el código de producción aún no implementa la regla)
2. **GREEN**: Escribe el código mínimo para que pase
3. **REFACTOR**: Mejora el código (sin romper tests)

```
Iteración 1: test rule 1  → RED → GREEN → REFACTOR
Iteración 2: test rule 2  → RED → GREEN → REFACTOR
Iteración 3: test rule 3  → RED → GREEN → REFACTOR
...
```

## Entrega

1. `DiscountCalculatorTest.java` (todos los tests, mínimo 10)
2. `DiscountCalculator.java` (código de producción refactorizado)
3. Breve explicación de cada iteración TDD
