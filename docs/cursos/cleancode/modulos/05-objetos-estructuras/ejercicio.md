---
sidebar_label: "Ejercicio"
---

# Ejercicio M05 — Refactorizar Ley de Demeter y Abstracción

## Objetivo

Identificar y corregir violaciones de la Ley de Demeter, Train Wrecks y falta de abstracción en el código legacy.

## Instrucciones

1. Identifica todas las violaciones de la Ley de Demeter
2. Identifica Train Wrecks
3. Refactoriza aplicando encapsulación real
4. Separa DTOs de objetos de dominio
5. Elimina getters/setters que exponen implementación

## Código Legacy

```java
package com.sasf.nomina.legacy;

import java.util.*;

public class PayrollReportService {

    public void generateReport() {
        Database db = new Database();
        Connection conn = db.getConnection();
        List<Map<String, Object>> rows = conn.query("SELECT * FROM employees");

        for (Map<String, Object> row : rows) {
            String name = (String) row.get("name");
            double baseSalary = (Double) row.get("salary");
            String deptName = (String) row.get("department");
            double deptBudget = getDepartmentBudget(deptName);

            double bonus = 0;
            if (deptBudget > 100000) {
                bonus = baseSalary * 0.15;
            } else {
                bonus = baseSalary * 0.05;
            }

            double tax = baseSalary * 0.16;
            double netSalary = baseSalary + bonus - tax;

            System.out.println(name + ": " + netSalary);
        }
    }

    private double getDepartmentBudget(String deptName) {
        Database db = new Database();
        Connection conn = db.getConnection();
        return (Double) conn.query(
            "SELECT budget FROM departments WHERE name = '" + deptName + "'"
        ).get(0).get("budget");
    }

    public void processEmployeeData(int employeeId) {
        Database db = new Database();
        Connection conn = db.getConnection();
        List<Map<String, Object>> rows = conn.query(
            "SELECT * FROM employees WHERE id = " + employeeId
        );

        if (!rows.isEmpty()) {
            Map<String, Object> emp = rows.get(0);
            String name = (String) emp.get("name");

            int deptId = (Integer) emp.get("department_id");
            List<Map<String, Object>> deptRows = conn.query(
                "SELECT * FROM departments WHERE id = " + deptId
            );
            Map<String, Object> dept = deptRows.get(0);
            String deptName = (String) dept.get("name");

            int managerId = (Integer) dept.get("manager_id");
            List<Map<String, Object>> mgrRows = conn.query(
                "SELECT * FROM employees WHERE id = " + managerId
            );
            Map<String, Object> manager = mgrRows.get(0);
            String managerName = (String) manager.get("name");

            System.out.println("Employee: " + name + ", Dept: " + deptName + ", Manager: " + managerName);
        }
    }
}

class Database {
    private String url = "jdbc:mysql://localhost:3306/nomina";
    private String user = "root";
    private String pass = "admin";

    public Connection getConnection() {
        return new Connection(url, user, pass);
    }
}

class Connection {
    private String url, user, pass;

    Connection(String url, String user, String pass) {
        this.url = url;
        this.user = user;
        this.pass = pass;
    }

    public List<Map<String, Object>> query(String sql) {
        // Simula consulta
        return new ArrayList<>();
    }
}
```

## Requisitos

1. **Crear objetos de dominio**: `Employee`, `Department`, `Manager`
2. **Mover lógica a los objetos**: cálculo de bonus, impuestos, neto
3. **Eliminar Train Wrecks**: `a.getB().getC().getD()`
4. **Crear repositorios**: `EmployeeRepository`, `DepartmentRepository`
5. **DTOs para transferencia**: `PayrollReportDTO`
6. **Ley de Demeter**: cada objeto solo habla con sus amigos

## Entrega

- Código refactorizado completo
- Lista de violaciones encontradas
- Diagrama de dependencias (antes vs después)
