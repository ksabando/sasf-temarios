---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: NotificationManager con API Externas
**Solución esperada**: Solución DIP

```java
// Abstracciones
public interface SMSProvider {
    void sendSMS(String to, String body);
}
public interface EmailProvider {
    void sendEmail(String to, String subject, String body);
}
public interface PushProvider {
    void sendPush(String deviceToken, String message);
}
public interface NotificationRepository {
    void save(String userId, String message, String priority);
}

// Implementaciones
public class TwilioSMSProvider implements SMSProvider {
    public TwilioSMSProvider(String sid, String token) {
        System.out.println("Twilio initialized");
    }
    @Override public void sendSMS(String to, String body) {
        System.out.println("Twilio SMS to " + to + ": " + body);
    }
}
public class SendGridEmailProvider implements EmailProvider {
    public SendGridEmailProvider(String apiKey) {
        System.out.println("SendGrid initialized");
    }
    @Override public void sendEmail(String to, String subject, String body) {
        System.out.println("SendGrid to " + to + ": " + subject);
    }
}
public class FirebasePushProvider implements PushProvider {
    public FirebasePushProvider(String configFile) {
        System.out.println("Firebase initialized");
    }
    @Override public void sendPush(String token, String message) {
        System.out.println("Firebase push to " + token + ": " + message);
    }
}
public class JdbcNotificationRepository implements NotificationRepository {
    private final Connection connection;
    public JdbcNotificationRepository(Connection connection) { this.connection = connection; }
    @Override public void save(String userId, String message, String priority) {
        System.out.println("Saved notification for user " + userId);
    }
}

// NotificationManager con DIP
public class NotificationManager {
    private final SMSProvider sms;
    private final EmailProvider email;
    private final PushProvider push;
    private final NotificationRepository repo;

    public NotificationManager(SMSProvider sms, EmailProvider email,
                                PushProvider push, NotificationRepository repo) {
        this.sms = sms; this.email = email; this.push = push; this.repo = repo;
    }

    public void sendAlert(String userId, String message, String priority) {
        User user = getUser(userId);
        switch (priority) {
            case "HIGH":
                sms.sendSMS(user.getPhone(), "[ALERT] " + message);
                email.sendEmail(user.getEmail(), "ALERTA", message);
                push.sendPush(user.getDeviceToken(), message);
                break;
            case "MEDIUM":
                email.sendEmail(user.getEmail(), "Notificacion", message);
                push.sendPush(user.getDeviceToken(), message);
                break;
            default:
                email.sendEmail(user.getEmail(), "Info", message);
        }
        repo.save(userId, message, priority);
    }

    private User getUser(String userId) {
        return new User(userId, "user@test.com", "+1234567890", "token_123");
    }
}
```

**Posibles mejoras**:
- Reemplazar el `switch` de prioridad con **patrón Chain of Responsibility**: cada nivel de prioridad es un handler (`HighPriorityHandler`, `MediumPriorityHandler`) que decide si debe enviar SMS, email y push según reglas configurables, eliminando el switch.
- Crear una interfaz unificada `NotificationChannel` con método `send(User, Message)` y que `SMSProvider`, `EmailProvider` y `PushProvider` la implementen, permitiendo que el `NotificationManager` reciba `List<NotificationChannel>` y sea OCP.
- Usar **Spring Retry** o **Resilience4j** para agregar reintentos y circuit breaker a cada provider, aplicando el patrón Decorator para que `NotificationManager` no conozca la lógica de resiliencia.

---

## Ejercicio 4: FileProcessor con DIP
**Solución esperada**:

```java
// Abstracciones
public interface FileStorage {
    void upload(String fileName, byte[] data);
    byte[] download(String fileName);
}
public interface Compressor {
    byte[] compress(byte[] data);
    byte[] decompress(byte[] data);
}
public interface Encryptor {
    byte[] encrypt(byte[] data);
    byte[] decrypt(byte[] data);
}
public interface FileMetadataRepository {
    void save(String name, int size, boolean compressed, boolean encrypted);
}
public interface NotificationService {
    void send(String message);
}

// Implementaciones
public class S3FileStorage implements FileStorage {
    public S3FileStorage(String key, String secret, String bucket) {}
    @Override public void upload(String name, byte[] data) {
        System.out.println("S3 uploaded: " + name + " (" + data.length + " bytes)");
    }
    @Override public byte[] download(String name) { return new byte[0]; }
}
public class LocalFileStorage implements FileStorage {
    private final String basePath;
    public LocalFileStorage(String basePath) { this.basePath = basePath; }
    @Override public void upload(String name, byte[] data) {
        System.out.println("Local save: " + basePath + "/" + name);
    }
    @Override public byte[] download(String name) { return new byte[0]; }
}
public class ZipCompressor implements Compressor {
    @Override public byte[] compress(byte[] data) {
        System.out.println("ZIP compressed: " + data.length + " -> estimated 60%");
        return data;
    }
    @Override public byte[] decompress(byte[] data) { return data; }
}
public class GzipCompressor implements Compressor {
    @Override public byte[] compress(byte[] data) {
        System.out.println("GZIP compressed"); return data;
    }
    @Override public byte[] decompress(byte[] data) { return data; }
}
public class AESEncryptor implements Encryptor {
    public AESEncryptor(String key) {}
    @Override public byte[] encrypt(byte[] data) {
        System.out.println("AES encrypted"); return data;
    }
    @Override public byte[] decrypt(byte[] data) { return data; }
}
public class NoOpEncryptor implements Encryptor {
    @Override public byte[] encrypt(byte[] data) { return data; }
    @Override public byte[] decrypt(byte[] data) { return data; }
}
public class JdbcFileMetadataRepository implements FileMetadataRepository {
    @Override public void save(String name, int size, boolean compressed, boolean encrypted) {
        System.out.println("Metadata saved: " + name);
    }
}

// FileProcessor configurable con DIP
public class FileProcessor {
    private final FileStorage storage;
    private final Compressor compressor;
    private final Encryptor encryptor;
    private final FileMetadataRepository metadataRepo;
    private final NotificationService notifier;

    public FileProcessor(FileStorage storage, Compressor compressor, Encryptor encryptor,
                         FileMetadataRepository metadataRepo, NotificationService notifier) {
        this.storage = storage; this.compressor = compressor; this.encryptor = encryptor;
        this.metadataRepo = metadataRepo; this.notifier = notifier;
    }

    public void processUpload(InputStream fileStream, String fileName,
                              boolean compress, boolean encrypt) {
        byte[] data = readAllBytes(fileStream);
        if (compress) data = compressor.compress(data);
        if (encrypt) data = encryptor.encrypt(data);
        storage.upload(fileName, data);
        metadataRepo.save(fileName, data.length, compress, encrypt);
        notifier.send("File uploaded: " + fileName);
    }

    private byte[] readAllBytes(InputStream is) { return new byte[]{1,2,3}; }
}

// Configuración (decisión de implementaciones aquí)
@Configuration
public class AppConfig {
    @Bean public FileStorage fileStorage() { return new S3FileStorage("key", "secret", "bucket"); }
    @Bean public Compressor compressor() { return new ZipCompressor(); }
    @Bean public Encryptor encryptor() { return new AESEncryptor("key1234567890"); }
    @Bean public FileProcessor fileProcessor() {
        return new FileProcessor(fileStorage(), compressor(), encryptor(),
            new JdbcFileMetadataRepository(), msg -> System.out.println("NOTIFY: " + msg));
    }
}
```

**Posibles mejoras**:
- Usar **patrón Chain of Responsibility** para el pipeline de procesamiento: `CompressHandler → EncryptHandler → UploadHandler`, donde cada handler es opcional y configurable, permitiendo cambiar el orden o agregar pasos (ej. validación de virus) sin modificar `FileProcessor`.
- Implementar **patrón Strategy** para `Compressor` y `Encryptor` con selección por tipo de archivo (ej. imágenes usan compresión sin pérdida, texto usa GZIP), eliminando los booleanos `compress`/`encrypt` del método.
- Usar **Spring profiles** (`@Profile("s3")`, `@Profile("local")`) para seleccionar `S3FileStorage` vs `LocalFileStorage` automáticamente según entorno, sin modificar la configuración.

