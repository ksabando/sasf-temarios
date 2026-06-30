---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Sistema de Gestión de Biblioteca (Fat Interface)

Refactoriza esta interfaz de sistema de biblioteca:

```java
public interface LibrarySystem {
    // Gestión de libros
    void addBook(Book book);
    void removeBook(Long bookId);
    Book findBookById(Long bookId);
    List<Book> searchBooks(String query);
    List<Book> getBooksByAuthor(String author);
    List<Book> getBooksByCategory(String category);

    // Gestión de miembros
    void registerMember(Member member);
    void unregisterMember(Long memberId);
    Member findMemberById(Long memberId);
    List<Member> getAllMembers();
    List<Member> getOverdueMembers();

    // Préstamos
    void lendBook(Long memberId, Long bookId);
    void returnBook(Long loanId);
    List<Loan> getActiveLoans();
    List<Loan> getLoanHistory(Long memberId);
    void renewLoan(Long loanId);

    // Multas
    void applyFine(Long memberId, double amount);
    void payFine(Long memberId, double amount);
    double getMemberFines(Long memberId);
    List<Fine> getPendingFines();

    // Reportes
    byte[] generatePopularBooksReport();
    byte[] generateMemberActivityReport();
    byte[] generateFinancialReport();
    byte[] generateInventoryReport();

    // Configuración
    void configureLoanPolicy(int maxBooks, int maxDays);
    void configureFineRate(double ratePerDay);
    void configureOpeningHours(String hours);
    void configureHolidays(List<Date> holidays);
}
```

### Tareas
1. Identifica 5-6 grupos de responsabilidades.
2. Crea interfaces separadas para cada grupo.
3. Implementa `LibraryServiceImpl` que implemente SOLO las interfaces necesarias.
4. Crea clientes que dependan de interfaces específicas (un `LoanManager` que solo
   use la interfaz de préstamos).

---

## Ejercicio 3: Sensor de IoT multifunción

Refactoriza aplicando ISP:

```java
public interface SmartSensor {
    // Lecturas ambientales
    double readTemperature();
    double readHumidity();
    double readPressure();
    double readAirQuality();
    int readUVIndex();

    // Lecturas de movimiento
    boolean detectMotion();
    double readSpeed();
    double readAcceleration();

    // Lecturas eléctricas
    double readVoltage();
    double readCurrent();
    double readPowerConsumption();

    // Activadores
    void activateAlarm();
    void deactivateAlarm();
    void turnOnLight();
    void turnOffLight();
    void lockDoor();
    void unlockDoor();
    void openValve();
    void closeValve();

    // Configuración
    void calibrate();
    void setSamplingRate(int hertz);
    void setThreshold(String metric, double value);
    void setAlertCallback(Runnable callback);
    void factoryReset();

    // Conectividad
    void connectToWiFi(String ssid, String password);
    void connectToBluetooth(String deviceId);
    void connectToZigBee(String networkId);
    void disconnect();
    boolean isConnected();
    String getConnectionStatus();
}
```

### Tareas
1. Identifica al menos 5 roles distintos.
2. Crea interfaces: `EnvironmentalSensor`, `MotionDetector`, `ElectricalMonitor`,
   `Actuator`, `Configurable`, `Connectable`.
3. Implementa: `TemperatureSensor` (solo lectura temperatura), `SecurityCamera`
   (movimiento + alarma + luz), `SmartPlug` (eléctrico + actuator).
4. Ninguna implementación debe tener métodos vacíos o que lancen excepción.

---

## Ejercicio 4: Sistema de Procesamiento de Pagos

Refactoriza esta interfaz de procesamiento de pagos que fuerza a todos los
procesadores a implementar métodos que no necesitan:

```java
public interface PaymentProcessor {
    // Métodos de pago
    void processCreditCard(String cardNumber, String cvv, String expiry, double amount);
    void processDebitCard(String cardNumber, String pin, double amount);
    void processPayPal(String email, String password, double amount);
    void processCrypto(String walletAddress, String currency, double amount);
    void processCash(double amount);
    void processCheck(String bankNumber, String accountNumber, double amount);

    // Validaciones
    boolean validateCreditCard(String cardNumber, String cvv, String expiry);
    boolean validatePayPalAccount(String email);
    boolean validateCryptoWallet(String walletAddress);
    boolean validateCheck(String bankNumber, String accountNumber);

    // Reembolsos
    void refundCreditCard(String transactionId, double amount);
    void refundPayPal(String transactionId, double amount);
    void refundCrypto(String transactionId, double amount);

    // Reportes
    byte[] generateDailyReport();
    byte[] generateMonthlyReport();
    byte[] generateTaxReport();
    byte[] generateReconciliationReport();

    // Fraude
    boolean checkFraudRisk(double amount, String ipAddress, String deviceFingerprint);
    void flagSuspiciousTransaction(String transactionId, String reason);
    List<Transaction> getSuspiciousTransactions();
}
```

### Tareas
1. Identifica todos los roles.
2. Crea interfaces segregadas: `PaymentMethod`, `RefundProcessor`, `FraudChecker`,
   `ReportGenerator`, `TransactionValidator`.
3. Implementa: `CreditCardProcessor`, `CashProcessor` (no necesita refund, no necesita
   validaciones complejas), `PayPalProcessor`.
4. Diseña para que un `CheckoutService` solo dependa de `PaymentMethod`.
5. Diseña para que un `RefundService` solo dependa de `RefundProcessor`.

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| Identificación de roles/fat interfaces | 2 pts |
| Diseño de interfaces cohesivas y pequeñas | 3 pts |
| Implementaciones sin métodos vacíos/excepciones | 2 pts |
| Clientes dependen solo de lo que necesitan | 2 pts |
| Código compila y sigue principios ISP | 1 pt |
| **Total** | **10 pts** |
