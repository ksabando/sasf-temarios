---
sidebar_label: "Ejercicio"
---

# Ejercicio M06 — Refactorizar Manejo de Errores

## Objetivo

Eliminar retornos null, códigos de error y validaciones defensivas. Reemplazar con Optional, excepciones y Null Object Pattern.

## Código Legacy

```java
package com.sasf.nomina.legacy;

public class PayrollCalculator {

    public double calculatePayment(String employeeId, int hoursWorked, String paymentType, String currency) {
        if (employeeId == null) {
            System.out.println("Error: employeeId is null");
            return -1;
        }
        if (hoursWorked < 0) {
            System.out.println("Error: negative hours");
            return -2;
        }
        if (paymentType == null) {
            System.out.println("Error: paymentType is null");
            return -3;
        }

        Employee emp = findEmployee(employeeId);
        if (emp == null) {
            System.out.println("Error: employee not found");
            return -4;
        }

        double hourlyRate = emp.getHourlyRate();
        if (hourlyRate == 0) {
            System.out.println("Error: hourly rate is zero");
            return -5;
        }

        double payment = 0;
        if (paymentType.equals("REGULAR")) {
            if (hoursWorked <= 40) {
                payment = hoursWorked * hourlyRate;
            } else {
                payment = 40 * hourlyRate + (hoursWorked - 40) * hourlyRate * 1.5;
            }
        } else if (paymentType.equals("OVERTIME")) {
            payment = hoursWorked * hourlyRate * 1.5;
        } else if (paymentType.equals("HOLIDAY")) {
            payment = hoursWorked * hourlyRate * 2.0;
        } else {
            System.out.println("Error: unknown payment type");
            return -6;
        }

        if (currency == null) {
            currency = "USD";
        }

        double tax = calculateTax(payment);
        if (tax < 0) {
            System.out.println("Error: tax calculation failed");
            return -7;
        }

        double netPayment = payment - tax;

        String result = savePayment(employeeId, netPayment, currency);
        if (result == null) {
            System.out.println("Error: failed to save payment");
            return -8;
        }

        return netPayment;
    }

    private Employee findEmployee(String id) {
        // Simulación: retorna null si no encuentra
        if (id.equals("INVALID")) {
            return null;
        }
        return new Employee(id, 25.0);
    }

    private double calculateTax(double payment) {
        if (payment < 0) {
            return -1;
        }
        return payment * 0.16;
    }

    private String savePayment(String employeeId, double amount, String currency) {
        // Simulación: retorna null si falla
        if (amount > 100000) {
            return null;
        }
        return "PAY— + employeeId + "— + System.currentTimeMillis();
    }
}
```

## Requisitos

1. **Eliminar todos los retornos null**
2. **Eliminar todos los códigos de error numéricos**
3. **Usar Optional donde tenga sentido**
4. **Crear excepciones personalizadas de dominio**
5. **Aplicar Null Object Pattern donde corresponda**
6. **Tipos de pago con polimorfismo en lugar de strings**
7. **Fail fast con Objects.requireNonNull**
8. **Separar en funciones pequeñas**

## Entrega

- Código refactorizado completo
- Lista de excepciones creadas
- Patrones aplicados y justificación
