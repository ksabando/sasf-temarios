---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Sistema de Pagos

Corrige las violaciones LSP:

```java
public abstract class Payment {
    protected double amount;

    public Payment(double amount) {
        this.amount = amount;
    }

    public abstract void process();

    public abstract void refund();

    public abstract void generateReceipt();

    public abstract void sendNotification();

    public double getAmount() {
        return amount;
    }
}

public class CreditCardPayment extends Payment {
    private String cardNumber;

    public CreditCardPayment(double amount, String cardNumber) {
        super(amount);
        this.cardNumber = cardNumber;
    }

    @Override
    public void process() {
        System.out.println("Processing credit card: $" + amount);
    }

    @Override
    public void refund() {
        System.out.println("Refunding to card: " + cardNumber);
    }

    @Override
    public void generateReceipt() {
        System.out.println("Receipt for credit card payment: $" + amount);
    }

    @Override
    public void sendNotification() {
        System.out.println("Email notification sent");
    }
}

public class CashPayment extends Payment {
    public CashPayment(double amount) {
        super(amount);
    }

    @Override
    public void process() {
        System.out.println("Cash payment: $" + amount);
    }

    @Override
    public void refund() {
        throw new UnsupportedOperationException("Cannot refund cash");
    }

    @Override
    public void generateReceipt() {
        System.out.println("Cash receipt: $" + amount);
    }

    @Override
    public void sendNotification() {
        // Cash payments don't send notifications
    }
}

public class CryptoPayment extends Payment {
    private String walletAddress;

    public CryptoPayment(double amount, String walletAddress) {
        super(amount);
        this.walletAddress = walletAddress;
    }

    @Override
    public void process() {
        System.out.println("Processing crypto: $" + amount + " to " + walletAddress);
    }

    @Override
    public void refund() {
        System.out.println("Refunding crypto to wallet: " + walletAddress);
    }

    @Override
    public void generateReceipt() {
        System.out.println("Blockchain receipt: " + generateTxHash());
    }

    private String generateTxHash() {
        return "0x" + System.currentTimeMillis();
    }

    @Override
    public void sendNotification() {
        System.out.println("Push notification sent");
    }
}

public class CheckoutService {
    public void processPayment(Payment payment) {
        payment.process();
        payment.generateReceipt();
        payment.sendNotification();
    }

    public void refundPayment(Payment payment) {
        payment.refund();
        payment.sendNotification();
    }
}
```

### Tareas
1. Identifica las violaciones LSP (métodos que lanzan excepciones o no hacen nada).
2. Rediseña con interfaces específicas: `Processable`, `Refundable`, `ReceiptGeneratable`, `Notifiable`.
3. Implementa cada tipo de pago solo con las interfaces que necesita.
4. El `CheckoutService` debe funcionar con cualquier pago sin `instanceof`.

---

## Ejercicio 3: Sistema de Archivos

Corrige violaciones LSP en esta jerarquía de archivos:

```java
public class File {
    protected String name;
    protected byte[] content;

    public File(String name) {
        this.name = name;
    }

    public void read() {
        System.out.println("Reading file: " + name);
    }

    public void write(byte[] data) {
        this.content = data;
        System.out.println("Writing to file: " + name);
    }

    public void compress() {
        System.out.println("Compressing file: " + name);
    }

    public void encrypt() {
        System.out.println("Encrypting file: " + name);
    }

    public void delete() {
        System.out.println("Deleting file: " + name);
    }

    public long getSize() {
        return content != null ? content.length : 0;
    }
}

public class ReadOnlyFile extends File {
    public ReadOnlyFile(String name, byte[] content) {
        super(name);
        this.content = content;
    }

    @Override
    public void write(byte[] data) {
        throw new UnsupportedOperationException("Read-only file cannot be written");
    }

    @Override
    public void delete() {
        throw new UnsupportedOperationException("Read-only file cannot be deleted");
    }

    @Override
    public void compress() {
        System.out.println("Read-only files cannot be compressed");
    }
}

public class EncryptedFile extends File {
    public EncryptedFile(String name, byte[] content) {
        super(name);
        this.content = content;
    }

    @Override
    public void read() {
        byte[] decrypted = decrypt(content);
        System.out.println("Reading encrypted file: " + name);
    }

    @Override
    public void write(byte[] data) {
        this.content = encrypt(data);
        System.out.println("Writing encrypted file: " + name);
    }

    private byte[] encrypt(byte[] data) {
        return data; // Simulación
    }

    private byte[] decrypt(byte[] data) {
        return data; // Simulación
    }
}

public class SymlinkFile extends File {
    private File target;

    public SymlinkFile(String name, File target) {
        super(name);
        this.target = target;
    }

    @Override
    public void read() {
        target.read();
    }

    @Override
    public void write(byte[] data) {
        target.write(data);
    }

    @Override
    public void compress() {
        throw new UnsupportedOperationException("Cannot compress symlink");
    }

    @Override
    public void delete() {
        System.out.println("Deleting symlink only (not target): " + name);
    }

    @Override
    public long getSize() {
        return 0; // Symlinks have 0 size
    }
}
```

### Tareas
1. Identifica todas las violaciones LSP.
2. Separa en interfaces: `Readable`, `Writable`, `Compressible`, `Encryptable`, `Deletable`.
3. Implementa cada tipo de archivo solo con las interfaces que necesita.
4. No uses herencia de clases; usa composición o interfaces.

---

## Ejercicio 4: Sistema de Empleados con Tipos

Corrige la violación LSP en esta jerarquía donde la subclase `Intern` viola el contrato:

```java
public class Employee {
    protected String name;
    protected double baseSalary;

    public Employee(String name, double baseSalary) {
        this.name = name;
        this.baseSalary = baseSalary;
    }

    public double calculatePay() {
        return baseSalary * 1.0;
    }

    public void saveToDatabase() {
        System.out.println("Saving employee " + name + " to database");
    }

    public void assignToProject(String project) {
        System.out.println("Assigning " + name + " to project: " + project);
    }

    public boolean requestLeave(int days) {
        if (days <= 15) {
            System.out.println("Leave approved for " + name + ": " + days + " days");
            return true;
        }
        return false;
    }

    public void receiveBenefits() {
        System.out.println("Benefits granted to " + name);
    }
}

public class FullTimeEmployee extends Employee {
    public FullTimeEmployee(String name, double baseSalary) {
        super(name, baseSalary);
    }

    @Override
    public double calculatePay() {
        return baseSalary * 1.0 + baseSalary * 0.10; // Bono 10%
    }

    @Override
    public boolean requestLeave(int days) {
        if (days <= 30) {
            System.out.println("Full-time leave approved: " + days + " days");
            return true;
        }
        return false;
    }
}

public class Contractor extends Employee {
    public Contractor(String name, double baseSalary) {
        super(name, baseSalary);
    }

    @Override
    public double calculatePay() {
        return baseSalary * 1.0;
    }

    @Override
    public void saveToDatabase() {
        System.out.println("Saving contractor " + name + " to external system");
    }

    @Override
    public void receiveBenefits() {
        throw new UnsupportedOperationException("Contractors don't receive benefits");
    }

    @Override
    public boolean requestLeave(int days) {
        return false; // Contractors don't have paid leave
    }
}

public class Intern extends Employee {
    public Intern(String name) {
        super(name, 0);
    }

    @Override
    public double calculatePay() {
        throw new UnsupportedOperationException("Interns don't get paid");
    }

    @Override
    public void saveToDatabase() {
        System.out.println("Interns are not saved to database");
    }

    @Override
    public void assignToProject(String project) {
        System.out.println("Assigning intern " + name + " to project: " + project);
    }

    @Override
    public boolean requestLeave(int days) {
        if (days <= 3) {
            System.out.println("Intern leave approved: " + days + " days");
            return true;
        }
        return false;
    }

    @Override
    public void receiveBenefits() {
        throw new UnsupportedOperationException("Interns don't receive benefits");
    }
}

public class PayrollService {
    public void processPayroll(List<Employee> employees) {
        for (Employee emp : employees) {
            double pay = emp.calculatePay();
            emp.saveToDatabase();
            emp.receiveBenefits();
            System.out.println(emp.name + ": $" + pay);
        }
    }
}
```

### Tareas
1. Identifica TODAS las violaciones LSP.
2. Rediseña usando interfaces segregadas.
3. Aplica composición para comportamientos opcionales (PayCalculator, BenefitsHandler, etc.).
4. Implementa `PayrollService` sin `instanceof` ni casts.

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| Identificación de violaciones LSP | 2 pts |
| Aplicación de composición sobre herencia | 3 pts |
| Diseño de interfaces correctas | 2 pts |
| Implementaciones que cumplen LSP | 2 pts |
| Cliente funciona sin instanceof | 1 pt |
| **Total** | **10 pts** |
