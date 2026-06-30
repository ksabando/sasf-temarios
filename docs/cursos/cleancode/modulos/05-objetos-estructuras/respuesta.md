---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M05 — Refactorización Ley de Demeter

## Ejercicio: Eliminación de Train Wrecks y Aplicación de Demeter

**Solución esperada**:

Identificación de 6 violaciones de la Ley de Demeter y Train Wrecks:

| # | Línea | Violación | Tipo |
|---|-------|-----------|------|
| 1 | 27 | `db.getConnection().query(...)` | Train Wreck |
| 2 | 47 | `db.getConnection().query(...).get(0).get("budget")` | Train Wreck + Demeter |
| 3 | 56-76 | Múltiples queries con getConnection | Falta de abstracción |
| 4 | 74 | `emp.get("department_id")` → `conn.query(...)` | Demeter + acoplamiento |
| 5 | 81 | `dept.get("manager_id")` → `conn.query(...)` | Demeter |
| 6 | 58 | `rows.get(0)` → `emp.get("name")` | Train wreck |

## Objetos de Dominio Creados

```
Employee
├── calculateNetPay()        → encapsula cálculo salario neto
├── calculateBonus(Department) → usa presupuesto del depto
├── getDepartmentName()      → delega a Department
└── getManagerName()         → delega a Department → Employee

Department
├── hasBudgetForBonuses()    → encapsula lógica de presupuesto
├── getManagerName()         → delega a Employee
└── getName()

EmployeeRepository
├── findById(int)            → encapsula consulta SQL
└── findAll()

DepartmentRepository
├── findByName(String)       → encapsula consulta SQL
└── findById(int)

PayrollReportService (refactorizado)
├── generateReport()         → orquesta objetos de dominio
└── buildReportDTO()         → mapea a DTOs
```

## Código Refactorizado

```java
package com.sasf.nomina;

import java.util.List;

public class PayrollReportService {

    private static final double HIGH_BUDGET_BONUS_RATE = 0.15;
    private static final double LOW_BUDGET_BONUS_RATE = 0.05;
    private static final double TAX_RATE = 0.16;

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public PayrollReportService(EmployeeRepository employeeRepository,
                                 DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<PayrollReportDTO> generateReport() {
        return employeeRepository.findAll().stream()
                .map(this::buildReportDTO)
                .toList();
    }

    private PayrollReportDTO buildReportDTO(Employee employee) {
        Department department = departmentRepository.findByName(employee.getDepartmentName());
        double bonus = calculateBonus(employee, department);
        double netSalary = employee.calculateNetPay(bonus);
        return new PayrollReportDTO(employee.getName(), netSalary);
    }

    private double calculateBonus(Employee employee, Department department) {
        double rate = department.hasBudgetForBonuses() ? HIGH_BUDGET_BONUS_RATE : LOW_BUDGET_BONUS_RATE;
        return employee.getBaseSalary() * rate;
    }
}

class Employee {
    private final int id;
    private final String name;
    private final double baseSalary;
    private final Department department;

    public Employee(int id, String name, double baseSalary, Department department) {
        this.id = id;
        this.name = name;
        this.baseSalary = baseSalary;
        this.department = department;
    }

    public double calculateNetPay(double bonus) {
        return baseSalary + bonus - (baseSalary * TAX_RATE);
    }

    public String getName() {
        return name;
    }

    public double getBaseSalary() {
        return baseSalary;
    }

    public String getDepartmentName() {
        return department.getName();
    }

    public String getManagerName() {
        return department.getManagerName();
    }
}

class Department {
    private final int id;
    private final String name;
    private final double budget;
    private final Employee manager;

    public Department(int id, String name, double budget, Employee manager) {
        this.id = id;
        this.name = name;
        this.budget = budget;
        this.manager = manager;
    }

    public boolean hasBudgetForBonuses() {
        return budget > 100000;
    }

    public String getName() {
        return name;
    }

    public String getManagerName() {
        return manager.getName();
    }
}

class EmployeeRepository {
    private final Database database;

    public EmployeeRepository(Database database) {
        this.database = database;
    }

    public Employee findById(int id) {
        List<Employee> employees = findAll();
        return employees.stream()
                .filter(e -> e.getId() == id)
                .findFirst()
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found: " + id));
    }

    public List<Employee> findAll() {
        // Encapsula la consulta SQL real
        return database.query("SELECT * FROM employees")
                .stream()
                .map(this::mapToEmployee)
                .toList();
    }

    private Employee mapToEmployee(Map<String, Object> row) {
        // Mapeo de fila a objeto de dominio
        return new Employee(...);
    }
}

record PayrollReportDTO(String name, double netSalary) {}
```

**Posibles mejoras**:

- Externalizar los umbrales de bono (`HIGH_BUDGET_BONUS_RATE`, `budget > 100000`) a una política inyectable `BonusPolicy` con método `calculateRate(Department)`. Esto permite cambiar las reglas de bono sin tocar `PayrollReportService`, cumpliendo OCP y facilitando tests con diferentes políticas.

- Crear un value object `Money` con `BigDecimal` para todos los valores monetarios en lugar de `double`. Los cálculos con `double` acumulan errores de precisión que en sistemas de nómina reales generan discrepancias de centavos difíciles de rastrear.

- Encapsular `TAX_RATE` dentro de `Employee.calculateNetPay` como detalle de implementación, o mejor, delegarlo a un `TaxCalculator` inyectado. Actualmente `TAX_RATE` está duplicado en cada `Employee` como constante implícita (no visible en el código de la clase), lo que hace que cambiar la tasa requiera buscar todas las clases.

## Diagrama de Dependencias

```
Antes:
PayrollReportService → Database → Connection → Map<String, Object>
  (acoplado a SQL, Map, y navegación manual)

Después:
PayrollReportService → EmployeeRepository + DepartmentRepository
    → Employee + Department (objetos de dominio)
    → Database (solo en repositorios)
```

## Principios Aplicados

- **Ley de Demeter**: repositorios hablan con DB, servicio habla con repositorios
- **Abstracción**: Employee oculta cómo calcula su salario
- **DTOs**: PayrollReportDTO transporta datos sin lógica
- **Dominio rico**: objetos con comportamiento, no solo getters/setters

