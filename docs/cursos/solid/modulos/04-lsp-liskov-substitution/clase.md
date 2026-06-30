---
sidebar_label: "Clase"
---

## Design by Contract (Diseño por Contrato)

Bertrand Meyer formalizó las reglas que garantizan LSP:

### Precondiciones

Una subclase NO puede fortalecer las precondiciones de un método heredado.

**Violación:**
```java
public class Account {
    public void withdraw(double amount) {
        // Precondición: amount > 0
        if (amount <= 0) throw new IllegalArgumentException();
        // ...
    }
}

public class PremiumAccount extends Account {
    @Override
    public void withdraw(double amount) {
        // Precondición FORTALECIDA: amount > 0 AND amount >= 10000
        if (amount <= 0) throw new IllegalArgumentException();
        if (amount < 10000) throw new IllegalArgumentException("Minimum withdrawal: $10,000");
        // ...
    }
}
```

El cliente que funciona con `Account` se rompe con `PremiumAccount` porque ahora
necesita montos >= $10,000.

### Postcondiciones

Una subclase NO puede debilitar las postcondiciones de un método heredado.

**Violación:**
```java
public class FileStorage {
    public void save(String content) {
        // Postcondición: archivo guardado en disco
        Files.writeString(Path.of("data.txt"), content);
    }
}

public class NullStorage extends FileStorage {
    @Override
    public void save(String content) {
        // Postcondición DEBILITADA: no guarda nada
        System.out.println("Mock save: " + content);
    }
}
```

### Invariantes

Una subclase debe mantener todos los invariantes de la clase base.

```java
public class Account {
    private double balance;

    // Invariante: balance nunca debe ser negativo
    public void deposit(double amount) {
        balance += amount;
    }

    public void withdraw(double amount) {
        if (balance >= amount) {
            balance -= amount;
        }
    }
}

public class OverdraftAccount extends Account {
    @Override
    public void withdraw(double amount) {
        // Viola invariante: balance puede ser negativo
        balance -= amount;
    }
}
```

---

## Tipos de Violaciones LSP en Código Real

### 1. Refused Bequest (Herencia Rechazada)

La subclase no usa métodos heredados.

```java
public class Bird {
    public void fly() {
        System.out.println("Flying...");
    }
}

public class Penguin extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("Penguins can't fly");
    }
}
```

**Solución:** Separar la interfaz:

```java
public interface Bird { }
public interface FlyingBird extends Bird {
    void fly();
}

public class Sparrow implements FlyingBird {
    public void fly() { System.out.println("Sparrow flying..."); }
}

public class Penguin implements Bird {
    // No tiene método fly
}
```

### 2. Subclase que Lanza Excepciones No Esperadas

```java
public class Repository {
    public List<Entity> findAll() {
        return executeQuery("SELECT * FROM entities");
    }
}

public class ReadOnlyRepository extends Repository {
    @Override
    public List<Entity> findAll() {
        return dataCache; // OK
    }

    @Override
    public void save(Entity e) {
        throw new UnsupportedOperationException("Read-only repository");
    }
}
```

### 3. Subclase que Retorna Null

```java
public class UserService {
    public User findByEmail(String email) {
        // Devuelve Optional<User>
    }
}

public class InMemoryUserService extends UserService {
    @Override
    public User findByEmail(String email) {
        if (!users.containsKey(email)) {
            return null; // Viola LSP: el padre nunca retorna null
        }
        return users.get(email);
    }
}
```

---

## Favor Composition Over Inheritance

La herencia es la causa más común de violaciones LSP. La composición es casi siempre mejor.

### Herencia (viola LSP potencialmente):

```java
public class Animal {
    public void makeSound() { System.out.println("Some sound"); }
}

public class Dog extends Animal {
    @Override
    public void makeSound() { System.out.println("Woof"); }
}

public class Cat extends Animal {
    @Override
    public void makeSound() { System.out.println("Meow"); }
}

public class RobotDog extends Animal {
    @Override
    public void makeSound() {
        throw new UnsupportedOperationException("Robots don't make sound");
    }
}
```

### Composición (cumple LSP):

```java
public interface SoundBehavior {
    void makeSound();
}

public class BarkBehavior implements SoundBehavior {
    public void makeSound() { System.out.println("Woof"); }
}

public class MeowBehavior implements SoundBehavior {
    public void makeSound() { System.out.println("Meow"); }
}

public class SilentBehavior implements SoundBehavior {
    public void makeSound() { /* silencio */ }
}

public class Animal {
    private SoundBehavior soundBehavior;

    public Animal(SoundBehavior soundBehavior) {
        this.soundBehavior = soundBehavior;
    }

    public void makeSound() {
        soundBehavior.makeSound();
    }
}

// Uso
Animal dog = new Animal(new BarkBehavior());
Animal cat = new Animal(new MeowBehavior());
Animal robot = new Animal(new SilentBehavior());
```

---

## LSP en Spring Framework

### @Qualifier para Seleccionar Implementaciones

```java
public interface PaymentService {
    void pay(double amount);
}

@Service
@Qualifier("creditCard")
public class CreditCardPaymentService implements PaymentService {
    public void pay(double amount) {
        System.out.println("Paid $" + amount + " with credit card");
    }
}

@Service
@Qualifier("paypal")
public class PayPalPaymentService implements PaymentService {
    public void pay(double amount) {
        System.out.println("Paid $" + amount + " with PayPal");
    }
}

// Cliente: funciona con cualquier PaymentService (LSP)
@Service
public class CheckoutService {
    private final PaymentService paymentService;

    public CheckoutService(@Qualifier("creditCard") PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public void checkout(Order order) {
        paymentService.pay(order.getTotal());
    }
}
```

### @Primary para Implementación por Defecto

```java
@Service
@Primary
public class DefaultNotificationService implements NotificationService {
    @Override
    public void send(String message) {
        System.out.println("Default: " + message);
    }
}

@Service
public class UrgentNotificationService implements NotificationService {
    @Override
    public void send(String message) {
        System.out.println("URGENT: " + message);
    }
}

// Inyecta la primaria por defecto, pero se puede sobreescribir con @Qualifier
@Service
public class AlertService {
    private final NotificationService notificationService;

    public AlertService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
}
```

### Perfiles (Profiles)

```java
@Service
@Profile("dev")
public class DevEmailService implements EmailService {
    public void sendEmail(String to, String body) {
        System.out.println("[DEV] Email to " + to);
    }
}

@Service
@Profile("prod")
public class ProdEmailService implements EmailService {
    public void sendEmail(String to, String body) {
        sesClient.sendEmail(to, body);
    }
}
```

---

## Resumen: Guía Práctica de LSP

### Señales de que violas LSP

1. **Subclase que lanza `UnsupportedOperationException`**
2. **Subclase que retorna `null` donde el padre retorna un valor**
3. **Subclase que ignora métodos (métodos vacíos)**
4. **Instanceof en el código cliente para verificar el tipo concreto**
5. **Subclase que tiene precondiciones más estrictas**
6. **Subclase que debilita postcondiciones (no guarda, no envía, no calcula)**

### Reglas de oro

| Regla | Descripción |
|-------|-------------|
| Precondiciones | No pueden fortalecerse en la subclase |
| Postcondiciones | No pueden debilitarse en la subclase |
| Invariantes | Deben mantenerse en toda la jerarquía |
| Excepciones | La subclase no debe lanzar excepciones nuevas o más amplias |
| Valores de retorno | Deben cumplir con el contrato del padre (no null si el padre no retorna null) |

### Herencia vs Composición

| Aspecto | Herencia | Composición |
|---------|----------|-------------|
| Relación | "Es un" (is-a) | "Tiene un" (has-a) |
| Acoplamiento | Alto (subclase conoce a padre) | Bajo (solo conoce interfaz) |
| LSP | Riesgo de violación | No aplica (no hay subtipos) |
| Flexibilidad | Baja (jerarquía rígida) | Alta (comportamiento intercambiable) |
| Reutilización | Código del padre heredado | Delegación a componentes |
| Cambios | Cambiar el padre afecta a todos los hijos | Cambiar un componente no afecta al todo |
