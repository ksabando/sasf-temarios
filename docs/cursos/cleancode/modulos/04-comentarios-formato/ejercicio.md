---
sidebar_label: "Ejercicio"
---

# Ejercicio M04 — Limpiar Comentarios y Reformatear

## Objetivo

Eliminar comentarios ruido, reorganizar código y aplicar formato consistente al proyecto legacy.

## Instrucciones

1. Identifica y elimina todos los comentarios innecesarios
2. Identifica y conserva los comentarios necesarios (justificando por qué)
3. Aplica formato vertical y horizontal consistente
4. Reorganiza la clase en orden: constantes → campos → constructores → públicos → privados

## Código Legacy

```java
package com.sasf.nomina.legacy;

// ======================================================================
// EmployeeProcessor.java
// ======================================================================
// Autor: Juan Perez
// Fecha: 2024-01-01
// Modificado: Maria Garcia 2024-06-15
// Modificado: Carlos Lopez 2024-09-20
// ======================================================================

import java.util.*;
import java.util.Date; // Usado para fechas

public class EmployeeProcessor {

    // Constantes
    public static final double SALARY_TAX_RATE = 0.16; // Tasa de impuesto
    public static final double OVERTIME_MULTIPLIER = 1.5; // Multiplicador de horas extra

    // Campos de la clase
    private List employees; // Lista de empleados
    private DatabaseConnection db; // Conexion a BD

    // Constructor
    public EmployeeProcessor(DatabaseConnection db) {
        this.db = db; // Asigna la conexion
        this.employees = new ArrayList(); // Inicializa lista
    }

    // Metodo para agregar un empleado
    public void addEmployee(Employee emp) {
        // Verificar que no sea null
        if (emp != null) {
            // Agregar a la lista
            employees.add(emp);
        }
    }

    // Metodo que calcula el salario neto de un empleado
    // Toma el salario base, descuenta impuestos y agrega bonos
    // Retorna el salario neto calculado
    public double calculateNetSalary(Employee emp) {
        // Obtener salario base
        double baseSalary = emp.getBaseSalary();

        // Calcular descuento de impuesto
        double taxDiscount = baseSalary * SALARY_TAX_RATE;

        // Calcular bono si aplica
        double bonus = 0;
        // Si el empleado tiene mas de 5 años, recibe bono
        if (emp.getYearsOfService() > 5) {
            bonus = baseSalary * 0.1; // 10% de bono
        }

        // Calcular salario neto
        double netSalary = baseSalary - taxDiscount + bonus;

        // Retornar el resultado
        return netSalary;
    }

    // ======================== METODOS PUBLICOS ========================

    // Procesa nominas de todos los empleados
    public void processPayroll() {
        // Iterar sobre cada empleado
        for (Object obj : employees) {
            // Cast a Employee
            Employee emp = (Employee) obj;

            // Calcular salario
            double salary = calculateNetSalary(emp);

            // TODO: guardar en BD

            // Mostrar resultado
            System.out.println("Empleado: " + emp.getName() + " - Salario: " + salary);
        }
    }

    // ======================== METODOS PRIVADOS ========================

    // Busca empleado por ID
    private Employee findEmployeeById(int id) {
        // Buscar en la lista
        for (Object obj : employees) {
            Employee emp = (Employee) obj;
            if (emp.getId() == id) {
                return emp; // Retorna si encuentra
            }
        }
        return null; // No encontrado
    }

}

// ======================================================================
// FIN DEL ARCHIVO
// ======================================================================
```

## Formato de Entrega

| # | Línea | Tipo | Acción | Justificación |
|---|-------|------|--------|---------------|
| 1 | 3-10 | Marcador posición | Eliminar | Git log tiene el historial |
| 2 | 14 | Redundante | Eliminar | `TAX_RATE` ya lo dice |
| ... | ... | ... | ... | ... |

## Criterios

- Identificar **todos** los comentarios (mínimo 20 violaciones)
- Clasificar cada uno como necesario o innecesario
- Código final formateado consistentemente (4 espacios, 120 chars)
- Variables y funciones en orden correcto
