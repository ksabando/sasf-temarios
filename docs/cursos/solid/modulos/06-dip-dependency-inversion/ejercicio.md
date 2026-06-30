---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: ReportGenerator con Dependencias Estáticas

Refactoriza eliminando llamadas a métodos estáticos:

```java
public class ReportService {

    public byte[] generateSalesReport(Date from, Date to) {
        // Conexión directa a BD
        Connection conn = DatabaseManager.getConnection();
        String sql = "SELECT * FROM sales WHERE date BETWEEN ? AND ?";
        List<Sale> sales = new ArrayList<>();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, new java.sql.Date(from.getTime()));
            ps.setDate(2, new java.sql.Date(to.getTime()));
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                sales.add(new Sale(
                    rs.getLong("id"),
                    rs.getDouble("amount"),
                    rs.getDate("date")
                ));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error querying sales", e);
        }

        // Formateo con dependencia estática
        String csv = CSVFormatter.format(sales);
        String json = JSONConverter.convert(sales);

        // Envío por email usando clase estática
        EmailUtils.sendEmail("admin@company.com",
            "Sales Report",
            "Please find attached the sales report.",
            csv.getBytes());

        // Subir a S3 usando clase estática
        CloudStorage.upload("reports/sales_" + System.currentTimeMillis() + ".csv",
            csv.getBytes());

        // Guardar en BD usando clase estática
        AuditLogger.log("Report generated for period: " + from + " to " + to);

        return json.getBytes();
    }
}

class DatabaseManager {
    public static Connection getConnection() {
        // Retorna conexión JDBC
        return null;
    }
}

class CSVFormatter {
    public static String format(List<Sale> sales) { return ""; }
}

class JSONConverter {
    public static String convert(List<Sale> sales) { return ""; }
}

class EmailUtils {
    public static void sendEmail(String to, String subject, String body, byte[] attachment) {}
}

class CloudStorage {
    public static void upload(String path, byte[] data) {}
}

class AuditLogger {
    public static void log(String message) {
        try (FileWriter fw = new FileWriter("audit.log", true)) {
            fw.write(message + "\n");
        } catch (IOException e) {}
    }
}
```

### Tareas
1. Identifica todas las dependencias estáticas.
2. Crea interfaces para cada dependencia: `SalesRepository`, `ReportFormatter`, `EmailSender`, `FileStorage`, `AuditLogger`.
3. Implementa la lógica en clases concretas no estáticas.
4. El nuevo `ReportService` recibe las dependencias por constructor.
5. Prueba que la solución sea testeable con mocks.

---

## Ejercicio 3: NotificationService con Acoplamiento a API Externa

Refactoriza aplicando DIP:

```java
public class NotificationManager {

    private TwilioClient twilio;
    private SendGridClient sendgrid;
    private FirebaseClient firebase;

    public NotificationManager() {
        this.twilio = new TwilioClient("ACCOUNT_SID", "AUTH_TOKEN");
        this.sendgrid = new SendGridClient("API_KEY");
        this.firebase = new FirebaseClient("FIREBASE_CONFIG.json");
    }

    public void sendAlert(String userId, String message, String priority) {
        User user = getUser(userId);

        if (priority.equals("HIGH")) {
            // Enviar por todos los canales
            twilio.sendSMS(user.getPhone(), "[ALERT] " + message);
            sendgrid.sendEmail(user.getEmail(), "ALERTA", message);
            firebase.sendPush(user.getDeviceToken(), message);
        } else if (priority.equals("MEDIUM")) {
            // Enviar email y push
            sendgrid.sendEmail(user.getEmail(), "Notificación", message);
            firebase.sendPush(user.getDeviceToken(), message);
        } else {
            // Solo email
            sendgrid.sendEmail(user.getEmail(), "Info", message);
        }

        // Registrar en BD
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/notifications",
            "root", "pass");
        String sql = "INSERT INTO notifications (user_id, message, priority, sent_at) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, userId);
            ps.setString(2, message);
            ps.setString(3, priority);
            ps.setTimestamp(4, new Timestamp(System.currentTimeMillis()));
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private User getUser(String userId) {
        // Simulación
        return new User(userId, "user@test.com", "+1234567890", "device_token_123");
    }
}

class TwilioClient {
    public TwilioClient(String sid, String token) {}
    public void sendSMS(String to, String body) {
        System.out.println("Twilio SMS to " + to + ": " + body);
    }
}

class SendGridClient {
    public SendGridClient(String apiKey) {}
    public void sendEmail(String to, String subject, String body) {
        System.out.println("SendGrid email to " + to + ": " + subject);
    }
}

class FirebaseClient {
    public FirebaseClient(String configFile) {}
    public void sendPush(String token, String message) {
        System.out.println("Firebase push to " + token + ": " + message);
    }
}
```

### Tareas
1. Identifica las violaciones DIP (instanciación directa, dependencias concretas).
2. Crea interfaces: `SMSProvider`, `EmailProvider`, `PushProvider`, `NotificationRepository`.
3. Implementa usando inyección de dependencias.
4. El `NotificationManager` debe orquestar el envío según prioridad sin conocer las implementaciones.
5. Agrega un endpoint de configuración para cambiar providers sin recompilar.

---

## Ejercicio 4: Sistema de Procesamiento de Archivos

Refactoriza aplicando DIP:

```java
public class FileProcessor {

    private S3FileStorage s3;
    private ZipCompressor compressor;
    private AESEncryptor encryptor;
    private FileSystemStorage local;

    public FileProcessor() {
        this.s3 = new S3FileStorage("accessKey", "secretKey", "my-bucket");
        this.compressor = new ZipCompressor();
        this.encryptor = new AESEncryptor("supersecretkey1234567890");
        this.local = new FileSystemStorage("C:\\uploads");
    }

    public void processUpload(InputStream fileStream, String fileName,
                              boolean compress, boolean encrypt) {
        byte[] data = readAllBytes(fileStream);

        if (compress) {
            data = compressor.compress(data);
        }

        if (encrypt) {
            data = encryptor.encrypt(data);
        }

        s3.upload(fileName, data);

        // También guardar local
        local.save(fileName, data);

        // Registrar en BD
        try (Connection conn = DriverManager.getConnection("jdbc:h2:~/files", "sa", "")) {
            String sql = "INSERT INTO files (name, size, compressed, encrypted, uploaded_at) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, fileName);
            ps.setInt(2, data.length);
            ps.setBoolean(3, compress);
            ps.setBoolean(4, encrypt);
            ps.setTimestamp(5, new Timestamp(System.currentTimeMillis()));
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error saving file metadata", e);
        }

        // Enviar notificación
        sendNotification("File uploaded: " + fileName + " (" + data.length + " bytes)");
    }

    private byte[] readAllBytes(InputStream is) {
        // Simulación
        return new byte[]{};
    }

    private void sendNotification(String message) {
        System.out.println("Notification: " + message);
    }
}
```

### Tareas
1. Identifica violaciones DIP.
2. Crea interfaces: `FileStorage` (con implementaciones S3 y Local), `Compressor`, `Encryptor`, `FileMetadataRepository`, `NotificationService`.
3. Implementa inyección de dependencias.
4. El `FileProcessor` debe ser configurable: poder cambiar de S3 a Azure Blob, de ZIP a GZIP, de AES a RSA, sin modificar su código.
5. Haz que la configuración de cifrado y compresión sea opcional (no todas las implementaciones deben proveer ambos).

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| Identificación de dependencias concretas | 2 pts |
| Diseño de abstracciones (interfaces) correctas | 2 pts |
| Inyección por constructor | 2 pts |
| Implementaciones intercambiables | 2 pts |
| Testabilidad (se pueden inyectar mocks) | 2 pts |
| **Total** | **10 pts** |
