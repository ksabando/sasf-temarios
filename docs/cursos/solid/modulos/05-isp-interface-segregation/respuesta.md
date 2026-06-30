---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Sensor IoT
**Solución esperada**:

### Roles Identificados
1. Ambiental (temperatura, humedad, presión, calidad aire, UV)
2. Movimiento (detección, velocidad, aceleración)
3. Eléctrico (voltaje, corriente, consumo)
4. Actuador (alarma, luz, puerta, válvula)
5. Configuración (calibrar, sampling rate, threshold, callback, reset)
6. Conectividad (WiFi, Bluetooth, ZigBee, estado)

### Solución

```java
public interface EnvironmentalSensor {
    double readTemperature(); double readHumidity(); double readPressure();
    double readAirQuality(); int readUVIndex();
}
public interface MotionDetector {
    boolean detectMotion(); double readSpeed(); double readAcceleration();
}
public interface ElectricalMonitor {
    double readVoltage(); double readCurrent(); double readPowerConsumption();
}
public interface Actuator {
    void activateAlarm(); void deactivateAlarm(); void turnOnLight(); void turnOffLight();
    void lockDoor(); void unlockDoor(); void openValve(); void closeValve();
}
public interface Configurable {
    void calibrate(); void setSamplingRate(int hertz);
    void setThreshold(String metric, double value);
    void setAlertCallback(Runnable callback); void factoryReset();
}
public interface Connectable {
    void connectToWiFi(String ssid, String password);
    void connectToBluetooth(String deviceId); void connectToZigBee(String networkId);
    void disconnect(); boolean isConnected(); String getConnectionStatus();
}

// Implementaciones que solo implementan lo necesario
public class TemperatureSensor implements EnvironmentalSensor, Configurable, Connectable {
    @Override public double readTemperature() { return 25.5; }
    @Override public double readHumidity() { return 60.0; }
    @Override public double readPressure() { return 1013.25; }
    @Override public double readAirQuality() { return 85.0; }
    @Override public int readUVIndex() { return 0; }
    @Override public void calibrate() { System.out.println("Sensor calibrated"); }
    @Override public void setSamplingRate(int hz) { System.out.println("Rate: " + hz); }
    @Override public void setThreshold(String m, double v) {}
    @Override public void setAlertCallback(Runnable r) {}
    @Override public void factoryReset() { System.out.println("Reset"); }
    @Override public void connectToWiFi(String s, String p) { System.out.println("WiFi OK"); }
    @Override public void connectToBluetooth(String d) { throw new UnsupportedOperationException(); }
    @Override public void connectToZigBee(String n) { throw new UnsupportedOperationException(); }
    @Override public void disconnect() {}
    @Override public boolean isConnected() { return true; }
    @Override public String getConnectionStatus() { return "OK"; }
}

public class SecurityCamera implements MotionDetector, Actuator, Configurable, Connectable {
    @Override public boolean detectMotion() { return false; }
    @Override public double readSpeed() { return 0; }
    @Override public double readAcceleration() { return 0; }
    @Override public void activateAlarm() { System.out.println("Alarm ON"); }
    @Override public void deactivateAlarm() { System.out.println("Alarm OFF"); }
    @Override public void turnOnLight() { System.out.println("Light ON"); }
    @Override public void turnOffLight() { System.out.println("Light OFF"); }
    @Override public void lockDoor() {}
    @Override public void unlockDoor() {}
    @Override public void openValve() {}
    @Override public void closeValve() {}
    @Override public void calibrate() {}
    @Override public void setSamplingRate(int hz) {}
    @Override public void setThreshold(String m, double v) {}
    @Override public void setAlertCallback(Runnable r) {}
    @Override public void factoryReset() {}
    @Override public void connectToWiFi(String s, String p) {}
    @Override public void connectToBluetooth(String d) {}
    @Override public void connectToZigBee(String n) {}
    @Override public void disconnect() {}
    @Override public boolean isConnected() { return true; }
    @Override public String getConnectionStatus() { return "Connected"; }
}

public class SmartPlug implements ElectricalMonitor, Actuator, Connectable {
    @Override public double readVoltage() { return 120.0; }
    @Override public double readCurrent() { return 1.5; }
    @Override public double readPowerConsumption() { return 180.0; }
    @Override public void activateAlarm() {}
    @Override public void deactivateAlarm() {}
    @Override public void turnOnLight() { System.out.println("Plug ON"); }
    @Override public void turnOffLight() { System.out.println("Plug OFF"); }
    @Override public void lockDoor() {}
    @Override public void unlockDoor() {}
    @Override public void openValve() {}
    @Override public void closeValve() {}
    @Override public void connectToWiFi(String s, String p) {}
    @Override public void connectToBluetooth(String d) {}
    @Override public void connectToZigBee(String n) {}
    @Override public void disconnect() {}
    @Override public boolean isConnected() { return true; }
    @Override public String getConnectionStatus() { return "Online"; }
}
```

**Posibles mejoras**:
- Segregar `Connectable` en interfaces específicas por protocolo (`WiFiConnectable`, `BluetoothConnectable`, `ZigBeeConnectable`) para que un sensor solo WiFi no tenga stubs vacíos de Bluetooth y ZigBee.
- Segregar `Actuator` en interfaces por tipo de actuador (`AlarmActuator`, `LightActuator`, `LockActuator`, `ValveActuator`) ya que `SmartPlug` solo usa la parte de luz pero tiene stubs vacíos de alarma, puerta y válvula.
- Usar **patrón Adapter** para sensores de diferentes fabricantes que exponen APIs propietarias: un `BoschTemperatureAdapter` que implemente `EnvironmentalSensor` traduciendo las llamadas al protocolo nativo Bosch.

---

## Ejercicio 4: Sistema de Pagos
**Solución esperada**:

### Roles Identificados
1. Procesamiento de pagos (diferentes métodos)
2. Validación de métodos de pago
3. Reembolsos
4. Reportes
5. Detección de fraude

### Solución

```java
// PaymentMethod - interfaz para procesar pagos
public interface PaymentMethod {
    PaymentResult process(double amount);
    boolean canProcess(double amount);
}

public class CreditCardPayment implements PaymentMethod {
    private final String cardNumber; private final String cvv; private final String expiry;
    public CreditCardPayment(String cardNumber, String cvv, String expiry) {
        this.cardNumber = cardNumber; this.cvv = cvv; this.expiry = expiry;
    }
    @Override public PaymentResult process(double amount) {
        System.out.println("Processing credit card: $" + amount);
        return new PaymentResult(true, "CC— + System.currentTimeMillis());
    }
    @Override public boolean canProcess(double amount) { return amount > 0 && amount <= 10000000; }
}

public class CashPayment implements PaymentMethod {
    @Override public PaymentResult process(double amount) {
        System.out.println("Cash received: $" + amount);
        return new PaymentResult(true, "CASH— + System.currentTimeMillis());
    }
    @Override public boolean canProcess(double amount) { return amount > 0; }
}

public class PayPalPayment implements PaymentMethod {
    private final String email; private final String password;
    public PayPalPayment(String email, String password) { this.email = email; this.password = password; }
    @Override public PaymentResult process(double amount) {
        System.out.println("PayPal: $" + amount + " from " + email);
        return new PaymentResult(true, "PP— + System.currentTimeMillis());
    }
    @Override public boolean canProcess(double amount) { return amount > 0 && amount <= 5000000; }
}

// RefundProcessor
public interface RefundProcessor {
    PaymentResult refund(String transactionId, double amount);
}

public class CreditCardRefundProcessor implements RefundProcessor {
    @Override public PaymentResult refund(String transactionId, double amount) {
        System.out.println("Refunding CC transaction " + transactionId + ": $" + amount);
        return new PaymentResult(true, "REF— + transactionId);
    }
}

public class PayPalRefundProcessor implements RefundProcessor {
    @Override public PaymentResult refund(String transactionId, double amount) {
        System.out.println("Refunding PayPal transaction " + transactionId + ": $" + amount);
        return new PaymentResult(true, "REF— + transactionId);
    }
}

// FraudChecker
public interface FraudChecker {
    boolean checkFraudRisk(double amount, String ipAddress, String deviceFingerprint);
    void flagSuspiciousTransaction(String transactionId, String reason);
    List<Transaction> getSuspiciousTransactions();
}

// ReportGenerator
public interface PaymentReportGenerator {
    byte[] generateDailyReport(); byte[] generateMonthlyReport();
    byte[] generateTaxReport(); byte[] generateReconciliationReport();
}

// Clientes con dependencias específicas
public class CheckoutService {
    private final PaymentMethod paymentMethod;
    public CheckoutService(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public PaymentResult checkout(double amount) {
        return paymentMethod.process(amount);
    }
}

public class RefundService {
    private final RefundProcessor refundProcessor;
    public RefundService(RefundProcessor refundProcessor) { this.refundProcessor = refundProcessor; }
    public PaymentResult refund(String transactionId, double amount) {
        return refundProcessor.refund(transactionId, amount);
    }
}
```

**Posibles mejoras**:
- Extraer `FraudChecker` en dos interfaces: `FraudRiskAssessor` (checkFraudRisk) y `FraudFlagManager` (flagSuspiciousTransaction, getSuspiciousTransactions), ya que el servicio de checkout solo necesita evaluar riesgo mientras que el back-office necesita gestionar transacciones sospechosas.
- Dividir `PaymentReportGenerator` en interfaces por periodicidad (`DailyReportGenerator`, `MonthlyReportGenerator`, `TaxReportGenerator`) para que el scheduler diario no dependa de métodos de reporte mensual o fiscal.
- Agregar **patrón Chain of Responsibility** para el pipeline de pagos: `FraudCheck → ProcessPayment → GenerateReceipt → SendNotification`, donde cada paso es un handler intercambiable que recibe solo la interfaz que necesita.

