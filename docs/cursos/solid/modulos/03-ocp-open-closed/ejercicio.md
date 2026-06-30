---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Generador de Reportes

Refactoriza aplicando OCP:

```java
public class ReportGenerator {

    public void generateReport(String format, List<Data> data, String outputPath) {
        if (format.equals("PDF")) {
            System.out.println("Generating PDF report...");
            StringBuilder content = new StringBuilder();
            content.append("REPORT\n");
            content.append("======\n");
            for (Data d : data) {
                content.append(d.getName()).append(": ").append(d.getValue()).append("\n");
            }
            try (FileWriter fw = new FileWriter(outputPath + ".pdf")) {
                fw.write(content.toString());
            } catch (IOException e) {
                e.printStackTrace();
            }
            System.out.println("PDF generated: " + outputPath);

        } else if (format.equals("CSV")) {
            System.out.println("Generating CSV report...");
            StringBuilder csv = new StringBuilder();
            csv.append("Name,Value\n");
            for (Data d : data) {
                csv.append(d.getName()).append(",").append(d.getValue()).append("\n");
            }
            try (FileWriter fw = new FileWriter(outputPath + ".csv")) {
                fw.write(csv.toString());
            } catch (IOException e) {
                e.printStackTrace();
            }
            System.out.println("CSV generated: " + outputPath);

        } else if (format.equals("JSON")) {
            System.out.println("Generating JSON report...");
            StringBuilder json = new StringBuilder();
            json.append("{\"data\": [\n");
            for (int i = 0; i < data.size(); i++) {
                Data d = data.get(i);
                json.append("  {\"name\": \"").append(d.getName())
                    .append("\", \"value\": \"").append(d.getValue()).append("\"}");
                if (i < data.size() - 1) json.append(",");
                json.append("\n");
            }
            json.append("]}");
            try (FileWriter fw = new FileWriter(outputPath + ".json")) {
                fw.write(json.toString());
            } catch (IOException e) {
                e.printStackTrace();
            }
            System.out.println("JSON generated: " + outputPath);

        } else if (format.equals("HTML")) {
            System.out.println("Generating HTML report...");
            StringBuilder html = new StringBuilder();
            html.append("<html><body><h1>Report</h1><table>\n");
            html.append("<tr><th>Name</th><th>Value</th></tr>\n");
            for (Data d : data) {
                html.append("<tr><td>").append(d.getName())
                    .append("</td><td>").append(d.getValue()).append("</td></tr>\n");
            }
            html.append("</table></body></html>");
            try (FileWriter fw = new FileWriter(outputPath + ".html")) {
                fw.write(html.toString());
            } catch (IOException e) {
                e.printStackTrace();
            }
            System.out.println("HTML generated: " + outputPath);

        } else if (format.equals("XML")) {
            System.out.println("Generating XML report...");
            // Generar XML...
        } else {
            throw new IllegalArgumentException("Unknown format: " + format);
        }
    }
}
```

### Tareas
1. Crea una interfaz `ReportFormatter`
2. Implementa `PDFReportFormatter`, `CSVReportFormatter`, `JSONReportFormatter`, etc.
3. Implementa la persistencia a archivo como paso separado (puede ser un decorador o responsabilidad aparte)
4. El `ReportGenerator` debe recibir estrategias y no modificarse al agregar formatos
5. Agrega `XMLReportFormatter` sin modificar el generador existente

---

## Ejercicio 3: Validador de Pedidos con Template Method

Usa Template Method para validar pedidos de diferentes tipos:

```java
public class OrderValidator {

    public void validate(Order order) {
        // Validaciones comunes
        if (order == null) throw new ValidationException("Order cannot be null");
        if (order.getItems() == null || order.getItems().isEmpty())
            throw new ValidationException("Order must have items");
        if (order.getCustomer() == null)
            throw new ValidationException("Customer required");
        if (order.getShippingAddress() == null)
            throw new ValidationException("Shipping address required");

        // Validaciones por tipo
        if (order.getType().equals("STANDARD")) {
            if (order.getTotal() < 10000)
                throw new ValidationException("Minimum order: $10,000");
            if (order.getItems().size() > 50)
                throw new ValidationException("Max 50 items per order");
            if (order.getPaymentMethod() == null)
                throw new ValidationException("Payment method required");

        } else if (order.getType().equals("EXPRESS")) {
            if (order.getTotal() < 50000)
                throw new ValidationException("Minimum express: $50,000");
            if (order.getItems().size() > 20)
                throw new ValidationException("Max 20 items for express");
            if (order.getPaymentMethod() == null)
                throw new ValidationException("Payment method required");
            if (order.getDeliveryTime() == null)
                throw new ValidationException("Delivery time required for express");
            if (order.getDeliveryTime().before(new Date()))
                throw new ValidationException("Delivery time must be in the future");

        } else if (order.getType().equals("INTERNATIONAL")) {
            if (order.getTotal() < 200000)
                throw new ValidationException("Minimum international: $200,000");
            if (!order.hasCustomsDocs())
                throw new ValidationException("Customs documents required");
            if (order.getExportLicense() == null)
                throw new ValidationException("Export license required");
            if (order.getIncoterm() == null)
                throw new ValidationException("Incoterm required");

        } else if (order.getType().equals("GOVERNMENT")) {
            if (order.getGovernmentContract() == null)
                throw new ValidationException("Government contract required");
            if (order.getBudgetCode() == null)
                throw new ValidationException("Budget code required");
            if (order.getApprovedBy() == null || !order.getApprovedBy().equals("DIRECTOR"))
                throw new ValidationException("Director approval required");

        } else {
            throw new IllegalArgumentException("Unknown order type: " + order.getType());
        }
    }
}
```

### Tareas
1. Crea una clase abstracta `OrderValidatorTemplate` con un template method `validate(Order)`
2. Los pasos comunes van en la clase base (cerrados)
3. Los pasos específicos son métodos abstractos (abiertos)
4. Implementa `StandardOrderValidator`, `ExpressOrderValidator`, `InternationalOrderValidator`
5. Agrega `GovernmentOrderValidator` sin modificar la plantilla

---

## Ejercicio 4: Motor de Cálculo de Envíos

Refactoriza para que sea extensible a nuevas calculadoras de envío:

```java
public class ShippingCalculator {

    public double calculateShipping(String courier, double weight, double distance) {
        double baseCost;

        if (courier.equals("DHL")) {
            baseCost = 15000;
            if (weight <= 1) return baseCost + distance * 200;
            if (weight <= 5) return baseCost + distance * 400;
            if (weight <= 10) return baseCost + distance * 800;
            return baseCost + distance * 1500;
        } else if (courier.equals("FEDEX")) {
            baseCost = 12000;
            double rate = 0;
            if (distance <= 10) rate = 300;
            else if (distance <= 50) rate = 500;
            else if (distance <= 200) rate = 900;
            else rate = 2000;
            return baseCost + weight * rate;
        } else if (courier.equals("ENVIA")) {
            baseCost = 8000;
            if (weight > 20) {
                return baseCost + (weight * distance * 50) + 5000;
            }
            return baseCost + weight * distance * 50;
        } else if (courier.equals("INTERRAPIDISIMO")) {
            baseCost = 20000;
            double volumetric = weight * 100;
            double distanceCost = distance * 300;
            double insurance = (baseCost + volumetric + distanceCost) * 0.05;
            return baseCost + volumetric + distanceCost + insurance;
        } else if (courier.equals("SERVIENTREGA")) {
            baseCost = 5000;
            double weightCost = weight * 1000;
            double distanceCost = distance * 100;
            if (weight > 30) {
                weightCost *= 1.5;
                System.out.println("Surcharge for heavy package");
            }
            return baseCost + weightCost + distanceCost;
        } else {
            throw new IllegalArgumentException("Unknown courier: " + courier);
        }
    }
}
```

### Tareas
1. Diseña interfaz `ShippingStrategy` con método `double calculate(ShippingInfo info)`
2. Crea un DTO `ShippingInfo` con weight, distance, dimensions, express flag
3. Implementa una estrategia por cada courier
4. Crea `ShippingCalculator` que recibe estrategias
5. Agrega `MercadoEnvioStrategy` sin tocar código existente
6. Las estrategias deben poder tener configuraciones distintas (tarifas base, recargos)

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| Identificación correcta de violaciones OCP | 2 pts |
| Diseño de abstracciones (interfaces/clases abstractas) | 2 pts |
| Implementación correcta de Strategy/Template Method | 3 pts |
| Capacidad de extender sin modificar existente | 2 pts |
| Pruebas unitarias para cada variante | 1 pt |
| **Total** | **10 pts** |
