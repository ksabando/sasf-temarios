---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M02 — Identificadores Refactorizados

## Ejercicio 1: Refactorización de Nombres en Código de Nómina

**Solución esperada**:

Identificación y corrección de 51+ identificadores problemáticos en el código `PayrollService`:

### Categoría 1: No revelan intención

| # | Línea | Actual | Propuesto |
|---|-------|--------|-----------|
| 1 | 7 | `emps` | `employees` |
| 2 | 17 | `e` | `employee` |
| 3 | 18 | `r` | `hourlyRate` |
| 4 | 19 | `t` | `overtimePayment` |
| 5 | 37 | `o` | `item` |
| 6 | 41 | `s` | `monthlySalary` |
| 7 | 42 | `an` | `annualSalary` |
| 8 | 43 | `bn` | `annualBonus` |
| 9 | 50 | `p` | `totalEmployeeCompensation` |
| 10 | 51 | `tt` | `totalPayrollAmount` |

### Categoría 2: Desinformativos

| # | Línea | Actual | Problema | Propuesto |
|---|-------|--------|----------|-----------|
| 11 | 7 | `List emps` | No es lista tipada | `List<Employee> employees` |
| 12 | 13 | `addEmp` | Abreviatura confusa | `addEmployee` |
| 13 | 24 | `return 0.0` | Parece un resultado válido | Lanzar excepción cuando no existe |

### Categoría 3: No pronunciables

| # | Línea | Actual | Propuesto |
|---|-------|--------|-----------|
| 14 | 16 | `chte` | `calculateOvertimePayment` |
| 15 | 27 | `fId` | `findById` |
| 16 | 23 | `dpt` | `department` |
| 17 | 22 | `getDpt()` | `getDepartment()` |
| 18 | 37 | `s` | `monthlySalary` |

### Categoría 4: No buscables

| # | Línea | Actual | Propuesto |
|---|-------|--------|-----------|
| 19 | 18 | `r` | `hourlyRate` |
| 20 | 19 | `t` | `overtimePayment` |
| 21 | 37 | `s` | `monthlySalary` |
| 22 | 42 | `an` | `annualSalary` |
| 23 | 43 | `bn` | `annualBonus` |

### Categoría 5: Abreviaturas

| # | Línea | Actual | Propuesto |
|---|-------|--------|-----------|
| 24 | 7 | `emps` | `employees` |
| 25 | 13 | `addEmp` | `addEmployee` |
| 26 | 16 | `chte` | `calculateOvertimePayment` |
| 27 | 27 | `fId` | `findById` |
| 28 | 36 | `gen` | `generatePayrollReport` |

### Categoría 6: Métodos inadecuados

| # | Línea | Actual | Propuesto |
|---|-------|--------|-----------|
| 29 | 13 | `addEmp` (sustantivo) | `addEmployee` (verbo) |
| 30 | 16 | `chte` (no es verbo) | `calculateOvertimePayment` |
| 31 | 27 | `fId` (no es verbo) | `findById` |
| 32 | 36 | `gen` (no es verbo) | `generatePayrollReport` |

### Categoría 7: Inconsistencia de conceptos

| # | Línea | Actual | Problema | Propuesto |
|---|-------|--------|----------|-----------|
| 33 | 13 | `addEmp` | Usa "add" para agregar | `addEmployee` |
| 34 | 22 | `getDpt()` | Abreviatura inconsistente | `getDepartment()` |

### Categoría 8: Números mágicos

| # | Línea | Número | Constante Propuesta |
|---|-------|--------|---------------------|
| 35 | 18 | `30` | `DAYS_PER_MONTH` |
| 36 | 18 | `8` | `HOURS_PER_DAY` |
| 37 | 19 | `1.5` | `OVERTIME_MULTIPLIER` |
| 38 | 20 | `1.1` | `IT_DEPARTMENT_BONUS_MULTIPLIER` |
| 39 | 44 | `50000` | `LOW_SALARY_THRESHOLD` |
| 40 | 45 | `0.05` | `LOW_BONUS_RATE` |
| 41 | 46 | `100000` | `MEDIUM_SALARY_THRESHOLD` |
| 42 | 47 | `0.1` | `MEDIUM_BONUS_RATE` |
| 43 | 49 | `0.15` | `HIGH_BONUS_RATE` |

### Identificadores adicionales en la clase Employee

| # | Miembro | Actual | Propuesto |
|---|---------|--------|-----------|
| 44 | campo | `n` | `name` |
| 45 | campo | `s` | `monthlySalary` |
| 46 | campo | `dpt` | `department` |
| 47 | getter | `getS()` | `getMonthlySalary()` |
| 48 | getter | `getN()` | `getName()` |
| 49 | getter | `getDpt()` | `getDepartment()` |
| 50 | campo | `id` | `employeeId` |
| 51 | getter | `getId()` | `getEmployeeId()` |

## Código Refactorizado

```java
package com.sasf.nomina;

import java.util.ArrayList;
import java.util.List;

public class PayrollService {

    private static final int DAYS_PER_MONTH = 30;
    private static final int HOURS_PER_DAY = 8;
    private static final double OVERTIME_MULTIPLIER = 1.5;
    private static final double IT_DEPARTMENT_BONUS = 1.1;
    private static final double LOW_SALARY_THRESHOLD = 50000;
    private static final double MEDIUM_SALARY_THRESHOLD = 100000;
    private static final double LOW_BONUS_RATE = 0.05;
    private static final double MEDIUM_BONUS_RATE = 0.10;
    private static final double HIGH_BONUS_RATE = 0.15;

    private List<Employee> employees;

    public PayrollService() {
        this.employees = new ArrayList<>();
    }

    public void addEmployee(Employee employee) {
        employees.add(employee);
    }

    public double calculateOvertimePayment(int employeeId, int overtimeHours) {
        Employee employee = findById(employeeId);
        double hourlyRate = employee.getMonthlySalary() / DAYS_PER_MONTH / HOURS_PER_DAY;
        double baseOvertime = hourlyRate * OVERTIME_MULTIPLIER * overtimeHours;
        if (employee.getDepartment().equals("IT")) {
            return baseOvertime * IT_DEPARTMENT_BONUS;
        }
        return baseOvertime;
    }

    private Employee findById(int employeeId) {
        for (Employee employee : employees) {
            if (employee.getEmployeeId() == employeeId) {
                return employee;
            }
        }
        throw new EmployeeNotFoundException("Employee not found: " + employeeId);
    }

    public void generatePayrollReport() {
        double totalPayrollAmount = 0;
        for (Employee employee : employees) {
            double monthlySalary = employee.getMonthlySalary();
            double annualSalary = monthlySalary * 12;
            double annualBonus = calculateAnnualBonus(annualSalary);
            double totalCompensation = monthlySalary + annualBonus;
            totalPayrollAmount += totalCompensation;
            System.out.println(employee.getName() + ": " + totalCompensation);
        }
        System.out.println("Total: " + totalPayrollAmount);
    }

    private double calculateAnnualBonus(double annualSalary) {
        if (annualSalary < LOW_SALARY_THRESHOLD) {
            return annualSalary * LOW_BONUS_RATE;
        }
        if (annualSalary < MEDIUM_SALARY_THRESHOLD) {
            return annualSalary * MEDIUM_BONUS_RATE;
        }
        return annualSalary * HIGH_BONUS_RATE;
    }
}
```

**Posibles mejoras**:

- Reemplazar el `String` department por un `enum Department` que contenga las constantes específicas por departamento (`IT`, `HR`, `SALES`). Esto elimina el string `"IT"` hardcodeado, previene typos y permite agregar comportamiento específico por departamento directamente en el enum (ej. `IT.getOvertimeMultiplier()`).

- Extraer `calculateAnnualBonus` a una clase separada `BonusCalculator` que implemente una interfaz `BonusPolicy`. Esto permite cambiar las reglas de bono sin modificar `PayrollService` y facilita testear las políticas de bono de forma aislada.

- Usar `BigDecimal` en lugar de `double` para todos los cálculos monetarios. Los `double` introducen errores de precisión de punto flotante que son inaceptables en sistemas financieros. `Money` como value object con `BigDecimal` interno es la práctica recomendada (patrón de Martin Fowler en Patterns of Enterprise Application Architecture).

- Reemplazar `System.out.println` por un logger (SLF4J) o, mejor aún, devolver un objeto `PayrollReport` con los resultados y dejar que una capa de presentación decida cómo mostrarlos. Esto desacopla la lógica de negocio de la salida en consola.

