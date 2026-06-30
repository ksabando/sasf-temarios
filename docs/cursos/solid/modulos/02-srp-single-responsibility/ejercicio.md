---
sidebar_label: "Ejercicio"
---

## Ejercicio 1: Procesador de Pedidos (God Class)

Refactoriza la siguiente clase aplicando SRP:

```java
public class OrderProcessor {

    private Connection conn;
    private SMTPClient smtp;

    public OrderProcessor() {
        try {
            this.conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/tienda", "root", "pass");
            this.smtp = new SMTPClient("smtp.gmail.com", 587);
        } catch (Exception e) {
            throw new RuntimeException("Error de inicialización", e);
        }
    }

    public void processOrder(Order order) {
        // 1. Validar orden
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalArgumentException("Orden sin items");
        }
        if (order.getCustomer() == null) {
            throw new IllegalArgumentException("Cliente requerido");
        }

        // 2. Calcular totales
        double subtotal = 0;
        for (Item item : order.getItems()) {
            subtotal += item.getPrice() * item.getQuantity();
        }
        double tax = subtotal * 0.19;
        double shipping = subtotal > 100000 ? 0 : 10000;
        double total = subtotal + tax + shipping;
        order.setTotal(total);

        // 3. Aplicar descuentos
        if (order.getCustomer().isVIP()) {
            total = total * 0.90;
        } else if (order.getCustomer().getMembership() > 12) {
            total = total * 0.95;
        }

        // 4. Guardar en BD
        String sql = "INSERT INTO orders (customer_id, total, status) VALUES (?, ?, 'PENDING')";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, order.getCustomer().getId());
            ps.setDouble(2, total);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error guardando orden", e);
        }

        // 5. Actualizar inventario
        for (Item item : order.getItems()) {
            String updateSql = "UPDATE products SET stock = stock - ? WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                ps.setInt(1, item.getQuantity());
                ps.setLong(2, item.getProductId());
                ps.executeUpdate();
            } catch (SQLException e) {
                throw new RuntimeException("Error actualizando inventario", e);
            }
        }

        // 6. Notificar al cliente
        String subject = "Orden #" + order.getId() + " confirmada";
        String body = "Total: $" + total + "\nGracias por tu compra.";
        try {
            smtp.send(order.getCustomer().getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Error enviando email: " + e.getMessage());
        }

        // 7. Registrar auditoría
        try (FileWriter fw = new FileWriter("auditoria.log", true)) {
            fw.write("Orden " + order.getId() + " procesada a las " + new Date() + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 8. Generar factura
        String invoice = "FACTURA\nCliente: " + order.getCustomer().getName()
            + "\nTotal: $" + total + "\nFecha: " + new Date();
        try (FileWriter fw = new FileWriter("factura_" + order.getId() + ".txt")) {
            fw.write(invoice);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("Orden " + order.getId() + " procesada exitosamente");
    }
}
```

### Tareas
1. Enumera cada responsabilidad de `OrderProcessor`.
2. Crea clases separadas para cada responsabilidad.
3. El nuevo `OrderProcessor` debe recibir las dependencias por constructor.
4. Asegura que cada clase sea testeable con mocks.

---

## Ejercicio 2: Gestor de Biblioteca

Refactoriza aplicando SRP:

```java
public class LibraryManager {

    private List<Book> books = new ArrayList<>();
    private List<Member> members = new ArrayList<>();
    private List<Loan> loans = new ArrayList<>();

    public void addBook(String title, String author, String isbn) {
        if (title == null || title.isEmpty())
            throw new IllegalArgumentException("Título requerido");
        if (isbn == null || !isbn.matches("\\d{13}"))
            throw new IllegalArgumentException("ISBN inválido");
        books.add(new Book(title, author, isbn));
        log("Libro agregado: " + title);
    }

    public void registerMember(String name, String email) {
        if (email == null || !email.contains("@"))
            throw new IllegalArgumentException("Email inválido");
        members.add(new Member(name, email));
        sendEmail(email, "Bienvenido a la biblioteca " + name);
        log("Miembro registrado: " + name);
    }

    public void lendBook(Long memberId, Long bookId) {
        Member member = members.stream()
            .filter(m -> m.getId().equals(memberId))
            .findFirst().orElseThrow(() -> new RuntimeException("Miembro no existe"));
        Book book = books.stream()
            .filter(b -> b.getId().equals(bookId) && !b.isLent())
            .findFirst().orElseThrow(() -> new RuntimeException("Libro no disponible"));

        book.setLent(true);
        loans.add(new Loan(member, book, new Date()));
        log("Libro prestado: " + book.getTitle() + " a " + member.getName());

        if (member.hasUnpaidFines()) {
            System.out.println("Recordatorio: El miembro tiene multas pendientes");
        }
    }

    public void returnBook(Long loanId) {
        Loan loan = loans.stream()
            .filter(l -> l.getId().equals(loanId))
            .findFirst().orElseThrow(() -> new RuntimeException("Préstamo no existe"));
        loan.getBook().setLent(false);
        loan.setReturnDate(new Date());

        long daysLate = (System.currentTimeMillis() - loan.getDueDate().getTime())
            / (1000 * 60 * 60 * 24);
        if (daysLate > 0) {
            double fine = daysLate * 500;
            loan.getMember().addFine(fine);
            System.out.println("Multa de $" + fine + " aplicada");
        }

        log("Libro devuelto: " + loan.getBook().getTitle());
    }

    public void generateReport() {
        System.out.println("=== REPORTE DE BIBLIOTECA ===");
        System.out.println("Total libros: " + books.size());
        System.out.println("Total miembros: " + members.size());
        System.out.println("Préstamos activos: " +
            loans.stream().filter(l -> l.getReturnDate() == null).count());
        double totalFines = members.stream()
            .mapToDouble(Member::getTotalFines).sum();
        System.out.println("Total multas: $" + totalFines);

        // Generar archivo
        try (FileWriter fw = new FileWriter("reporte_biblioteca.csv")) {
            fw.write("Libros, Miembros, Prestamos, Multas\n");
            fw.write(books.size() + "," + members.size() + ","
                + loans.size() + "," + totalFines + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }

        sendEmail("admin@biblioteca.com",
            "Reporte generado",
            "El reporte se ha generado exitosamente");
    }

    private void log(String msg) {
        try (FileWriter fw = new FileWriter("biblioteca.log", true)) {
            fw.write(new Date() + " - " + msg + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void sendEmail(String to, String subject, String body) {
        System.out.println("Email a " + to + ": " + subject + " - " + body);
    }
}
```

### Tareas
1. Identifica todas las responsabilidades.
2. Separa en clases con una sola responsabilidad.
3. Crea un `LibraryService` que orqueste las operaciones principales.
4. Aplica inyección de dependencias.

---

## Ejercicio 3: Validador-Calculador-Persistidor

Refactoriza esta clase que mezcla validación, cálculo y persistencia:

```java
public class TaxCalculator {

    private Map<String, Double> taxRates = new HashMap<>();

    public TaxCalculator() {
        loadRates();
    }

    private void loadRates() {
        // Cargar desde archivo
        try (BufferedReader br = new BufferedReader(new FileReader("tax_rates.txt"))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(":");
                taxRates.put(parts[0], Double.parseDouble(parts[1]));
            }
        } catch (IOException e) {
            // Fallback a valores por defecto
            taxRates.put("IVA", 0.19);
            taxRates.put("ISR", 0.10);
            taxRates.put("ICA", 0.0096);
        }
    }

    public double calculateTotalTax(Invoice invoice) {
        // Validaciones
        if (invoice == null) throw new IllegalArgumentException("Factura requerida");
        if (invoice.getItems() == null || invoice.getItems().isEmpty())
            throw new IllegalArgumentException("Items requeridos");

        for (Item item : invoice.getItems()) {
            if (item.getPrice() <= 0)
                throw new IllegalArgumentException("Precio inválido: " + item.getName());
            if (item.getQuantity() <= 0)
                throw new IllegalArgumentException("Cantidad inválida: " + item.getName());
        }

        // Cálculo
        double subtotal = 0;
        for (Item item : invoice.getItems()) {
            subtotal += item.getPrice() * item.getQuantity();
        }

        double iva = subtotal * taxRates.getOrDefault("IVA", 0.19);
        double isr = subtotal * taxRates.getOrDefault("ISR", 0.10);
        double totalTax = iva + isr;

        // Guardar en BD
        String sql = "INSERT INTO taxes (invoice_id, iva, isr, total) VALUES (?, ?, ?, ?)";
        try (Connection conn = DriverManager.getConnection("jdbc:h2:~/taxes", "sa", "");
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, invoice.getId());
            ps.setDouble(2, iva);
            ps.setDouble(3, isr);
            ps.setDouble(4, totalTax);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error guardando impuesto", e);
        }

        // Registrar en log
        System.out.println("Impuesto calculado para factura " + invoice.getId()
            + ": $" + totalTax);

        return totalTax;
    }
}
```

### Tareas
1. Identifica 3 responsabilidades claras.
2. Separa en: `InvoiceValidator`, `TaxCalculatorLogic`, `TaxRepository`.
3. Crea una interfaz `TaxRateProvider` para cargar tasas desde diferentes fuentes.
4. El nuevo `TaxService` debe orquestar el flujo completo.

---

## Ejercicio 4: Sistema de Notificaciones Monolítico

Refactoriza aplicando SRP:

```java
public class NotificationSystem {

    public void sendNotification(User user, String type, String message) {
        if (user == null || message == null) {
            throw new IllegalArgumentException("Datos inválidos");
        }

        // Construir contenido según tipo
        String content;
        if (type.equals("WELCOME")) {
            content = "¡Bienvenido " + user.getName() + "!\n" + message;
        } else if (type.equals("PROMOTION")) {
            content = "¡Oferta especial!\n" + message;
        } else if (type.equals("ALERT")) {
            content = "⚠️ ALERTA: " + message;
        } else if (type.equals("BILL")) {
            content = "FACTURA\n" + message;
        } else {
            content = message;
        }

        // Formatear según canal
        if (user.getPreferredChannel().equals("EMAIL")) {
            String htmlContent = "<html><body>" + content.replace("\n", "<br/>") + "</body></html>";
            // Configurar y enviar email
            System.out.println("Enviando EMAIL a " + user.getEmail());
            System.out.println("Contenido: " + htmlContent);
            saveToHistory(user.getId(), "EMAIL", content);
        } else if (user.getPreferredChannel().equals("SMS")) {
            if (content.length() > 160) {
                content = content.substring(0, 157) + "...";
            }
            System.out.println("Enviando SMS a " + user.getPhone());
            System.out.println("Contenido: " + content);
            saveToHistory(user.getId(), "SMS", content);
        } else if (user.getPreferredChannel().equals("PUSH")) {
            String pushContent = "{\"title\":\"" + type + "\",\"body\":\"" + message + "\"}";
            System.out.println("Enviando PUSH a dispositivo " + user.getDeviceToken());
            System.out.println("Payload: " + pushContent);
            saveToHistory(user.getId(), "PUSH", content);
        } else if (user.getPreferredChannel().equals("WHATSAPP")) {
            System.out.println("Enviando WHATSAPP a " + user.getPhone());
            System.out.println("Contenido: " + content);
            saveToHistory(user.getId(), "WHATSAPP", content);
        } else {
            throw new IllegalArgumentException("Canal no soportado: " + user.getPreferredChannel());
        }
    }

    private void saveToHistory(Long userId, String channel, String content) {
        try (FileWriter fw = new FileWriter("notifications.log", true)) {
            fw.write(userId + "|" + channel + "|" + content + "|" + new Date() + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void generateReport() {
        // Leer archivo de notificaciones y generar estadísticas
        System.out.println("=== REPORTE DE NOTIFICACIONES ===");
        System.out.println("(Estadísticas pendientes de implementar)");
    }
}
```

### Tareas
1. Identifica todas las responsabilidades (al menos 6).
2. Crea una interfaz `MessageChannel` con implementaciones para cada canal.
3. Crea `MessageFormatter`, `NotificationHistory`, `NotificationReport`.
4. El nuevo `NotificationService` debe ser extensible a nuevos canales.

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| Identificación correcta de responsabilidades | 2 pts |
| Separación en clases con 1 responsabilidad | 3 pts |
| Inyección de dependencias (constructor) | 2 pts |
| Testabilidad de las nuevas clases | 2 pts |
| Documentación/diagrama de la solución | 1 pt |
| **Total** | **10 pts** |
