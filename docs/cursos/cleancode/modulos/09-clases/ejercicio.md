---
sidebar_label: "Ejercicio"
---

# Ejercicio M09 — Refactorizar ReportGenerator (1200 líneas)

## Objetivo

Dividir la clase `ReportGenerator` (1200 líneas, God Class) en **10-12 clases cohesivas** aplicando SRP, alta cohesión y organización limpia.

## Código Legacy (Estructura)

```java
package com.sasf.nomina.legacy;

import java.sql.*;
import java.util.*;

public class ReportGenerator {

    private Connection conn;
    private String format;
    private String reportType;
    private String outputPath;

    // Configuración
    public void setConnection(Connection conn) { this.conn = conn; }
    public void setFormat(String format) { this.format = format; }
    public void setReportType(String type) { this.reportType = type; }
    public void setOutputPath(String path) { this.outputPath = path; }

    // Método principal (300 líneas)
    public void generate() {
        // 1. Validar parámetros (30 líneas)
        // 2. Conectar a BD (40 líneas)
        // 3. Consultar empleados (50 líneas)
        // 4. Calcular nómina (80 líneas)
        // 5. Aplicar descuentos (40 líneas)
        // 6. Generar PDF/CSV/Excel (200 líneas)
        // 7. Guardar archivo (30 líneas)
        // 8. Enviar email (50 líneas)
        // 9. Auditar (20 líneas)
        // 10. Cerrar conexiones (30 líneas)
    }

    // Bloque de consultas SQL (200 líneas)
    private List<Map<String, Object>> queryEmployees() { ... }
    private List<Map<String, Object>> queryDepartments() { ... }
    private List<Map<String, Object>> queryPayments() { ... }
    private List<Map<String, Object>> queryTaxes() { ... }

    // Bloque de cálculos (300 líneas)
    private double calculateGrossPay(Map<String, Object> emp) { ... }
    private double calculateDeductions(Map<String, Object> emp) { ... }
    private double calculateNetPay(Map<String, Object> emp) { ... }
    private double calculateEmployerCosts(Map<String, Object> emp) { ... }
    private void applyBonus(Map<String, Object> emp) { ... }
    private void applyPenalties(Map<String, Object> emp) { ... }

    // Bloque de generación de reportes (400 líneas)
    private String generatePdf(List<Map<String, Object>> data) { ... }
    private String generateCsv(List<Map<String, Object>> data) { ... }
    private String generateExcel(List<Map<String, Object>> data) { ... }
    private String generateHtml(List<Map<String, Object>> data) { ... }
    private String generateJson(List<Map<String, Object>> data) { ... }

    // Bloque de utilidades (200 líneas)
    private void saveFile(String content, String path) { ... }
    private void sendEmail(String to, String subject, String body) { ... }
    private void audit(String action) { ... }
    private void closeConnections() { ... }
    private void logError(String message, Exception e) { ... }
}
```

## Requisitos

1. **Identificar responsabilidades** en el código legacy (mínimo 10)
2. **Crear clases** con SRP (una responsabilidad cada una)
3. **Alta cohesión**: cada clase usa todas sus variables
4. **Inyección de dependencias**: no crear dependencias dentro de las clases
5. **Interfaces**: ReportFormatter, DataSource, NotificationService
6. **Tests**: al menos un test por clase creada

## Entrega

1. Lista de clases creadas con su responsabilidad (10-12 clases)
2. Código fuente de cada clase
3. Tests unitarios para cada clase
4. Diagrama de dependencias entre clases
