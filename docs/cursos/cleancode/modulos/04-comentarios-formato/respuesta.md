---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M04 — Comentarios y Formato Limpios

## Ejercicio: Limpieza de Comentarios y Formato

**Solución esperada**:

Identificación de 30 violaciones de comentarios/ruido y su acción correspondiente:

| # | Línea | Comentario | Tipo | Acción |
|---|-------|------------|------|--------|
| 1 | 3 | `// =========` | Marcador posición | Eliminar |
| 2 | 4 | `// EmployeeProcessor.java` | Ruido | Eliminar |
| 3 | 6 | `// Autor: Juan Perez` | Bitácora (git log) | Eliminar |
| 4 | 7 | `// Fecha: 2024-01-01` | Bitácora | Eliminar |
| 5 | 8 | `// Modificado: Maria` | Bitácora | Eliminar |
| 6 | 9 | `// Modificado: Carlos` | Bitácora | Eliminar |
| 7 | 10 | `// =========` | Marcador posición | Eliminar |
| 8 | 15 | `// Tasa de impuesto` | Redundante | Eliminar |
| 9 | 16 | `// Multiplicador horas extra` | Redundante | Eliminar |
| 10 | 19 | `// Lista de empleados` | Redundante | Eliminar |
| 11 | 20 | `// Conexion a BD` | Redundante | Eliminar |
| 12 | 23 | `// Constructor` | Ruido | Eliminar |
| 13 | 24 | `// Asigna la conexion` | Redundante | Eliminar |
| 14 | 25 | `// Inicializa lista` | Redundante | Eliminar |
| 15 | 28 | `// Metodo para agregar` | Redundante | Eliminar |
| 16 | 30 | `// Verificar que no sea null` | Redundante | Eliminar |
| 17 | 32 | `// Agregar a la lista` | Redundante | Eliminar |
| 18 | 36-38 | Javadoc falso | Redundante | Eliminar |
| 19 | 41 | `// Obtener salario base` | Ruido | Eliminar |
| 20 | 44 | `// Calcular descuento` | Ruido | Eliminar |
| 21 | 49 | `// Si el empleado...` | Redundante | Eliminar |
| 22 | 54 | `// Retornar el resultado` | Ruido | Eliminar |
| 23 | 58 | `// ===== METODOS PUBLICOS` | Marcador posición | Eliminar |
| 24 | 63 | `// Iterar sobre cada...` | Redundante | Eliminar |
| 25 | 65 | `// Cast a Employee` | Redundante | Eliminar |
| 26 | 70 | `// TODO: guardar en BD` | Necesario | Conservar |
| 27 | 73 | `// Mostrar resultado` | Redundante | Eliminar |
| 28 | 77 | `// ===== METODOS PRIVADOS` | Marcador posición | Eliminar |
| 29 | 80 | `// Buscar empleado por ID` | Redundante | Eliminar |
| 30 | 86 | `// ===== FIN DEL ARCHIVO` | Marcador posición | Eliminar |

## Comentarios Conservados (con justificación)

- `// TODO: guardar en BD` → TODO válido con intención clara

## Código Refactorizado

```java
package com.sasf.nomina;

import java.util.ArrayList;
import java.util.List;

public class EmployeeProcessor {

    private static final double SALARY_TAX_RATE = 0.16;
    private static final double OVERTIME_MULTIPLIER = 1.5;
    private static final double SERVICE_BONUS_THRESHOLD_YEARS = 5;
    private static final double SERVICE_BONUS_RATE = 0.10;

    private List<Employee> employees;
    private DatabaseConnection databaseConnection;

    public EmployeeProcessor(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
        this.employees = new ArrayList<>();
    }

    public void addEmployee(Employee employee) {
        if (employee != null) {
            employees.add(employee);
        }
    }

    public void processPayroll() {
        for (Employee employee : employees) {
            double salary = calculateNetSalary(employee);
            // TODO: persist salary to database
            System.out.println(employee.getName() + " - Salary: " + salary);
        }
    }

    public double calculateNetSalary(Employee employee) {
        double baseSalary = employee.getBaseSalary();
        double taxDiscount = baseSalary * SALARY_TAX_RATE;
        double bonus = calculateServiceBonus(employee);
        return baseSalary - taxDiscount + bonus;
    }

    private double calculateServiceBonus(Employee employee) {
        if (employee.getYearsOfService() > SERVICE_BONUS_THRESHOLD_YEARS) {
            return employee.getBaseSalary() * SERVICE_BONUS_RATE;
        }
        return 0;
    }

    private Employee findEmployeeById(int id) {
        for (Employee employee : employees) {
            if (employee.getId() == id) {
                return employee;
            }
        }
        return null;
    }
}
```

**Posibles mejoras**:

- Eliminar el `return null` en `findEmployeeById` y reemplazarlo por `Optional<Employee>` o lanzar `EmployeeNotFoundException`. Retornar null es una de las prácticas que Clean Code más critica porque obliga al llamante a verificar null en cada uso, propagando el problema.

- Reemplazar `System.out.println` por un logger (SLF4J) o retornar una colección de resultados `List<PayrollResult>` para que una capa de presentación decida cómo mostrarlos. Hardcodear la salida a consola acopla la lógica de negocio a un canal de salida específico.

- Extraer las reglas de negocio (tax rate, service bonus) a un archivo de configuración externo o a una clase `PayrollPolicy` que pueda ser inyectada. Si las reglas cambian (ej. nuevo gobierno cambia tasa impositiva), no deberías tener que modificar y redesplegar código.

## Cambios de Formato Aplicados

| Aspecto | Antes | Después |
|---------|-------|---------|
| Marcadores de posición | 6 bloques | 0 |
| Líneas en blanco entre conceptos | Inconsistente | 1 línea consistente |
| Orden de miembros | Desordenado | Constantes → Campos → Constructor → Públicos → Privados |
| Indentación | Mezcla espacios/tabs | 4 espacios |
| Ancho de línea | Hasta 100 | Máximo 120 |
| Genéricos | Raw types | Tipados (`List<Employee>`) |
| Imports | `.*` | Específicos |

