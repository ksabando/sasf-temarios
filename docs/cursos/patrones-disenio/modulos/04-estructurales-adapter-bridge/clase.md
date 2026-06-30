---
sidebar_label: "Clase"
---

# Módulo 04 — Adapter y Bridge

## Adapter

Convierte la interfaz de una clase en otra interfaz que el cliente espera. Permite que clases con interfaces incompatibles trabajen juntas.

### Estructura

```
┌──────────────────┐       ┌──────────────────┐
│   <<interface>>   │       │    Adaptee       │
│     Target        │       ├──────────────────┤
├──────────────────┤       │ + specificReq()  │
│ + request()      │       └──────────────────┘
└──────────────────┘                ▲
         ▲                          │
         │                          │ adapta
┌──────────────────┐       ┌──────────────────┐
│     Adapter      │───────│    Adaptee       │
├──────────────────┤       └──────────────────┘
│ + request()      │
└──────────────────┘
```

### Ejemplo: Adaptador de Pagos

```java
// Target (lo que espera nuestro sistema)
public interface ProcesadorPagos {
    void cobrar(double monto);
    void reembolsar(String idTransaccion);
}

// Adaptee (API externa de PayPal)
public class PayPalAPI {
    public String sendPayment(double amount) {
        return "PAYPAL— + System.currentTimeMillis();
    }
    public void refund(String transactionId) {
        System.out.println("Reembolsando PayPal: " + transactionId);
    }
}

// Adapter
public class PayPalAdapter implements ProcesadorPagos {
    private PayPalAPI paypal = new PayPalAPI();

    public void cobrar(double monto) {
        paypal.sendPayment(monto);
    }

    public void reembolsar(String idTransaccion) {
        paypal.refund(idTransaccion);
    }
}

// Sistema legacy
public class SistemaPagosLegacy {
    public void pagarEnEfectivo(double monto) {
        System.out.println("Pago en efectivo: $" + monto);
    }
}

// Adapter para sistema legacy
public class LegacyAdapter implements ProcesadorPagos {
    private SistemaPagosLegacy legacy = new SistemaPagosLegacy();

    public void cobrar(double monto) {
        legacy.pagarEnEfectivo(monto);
    }

    public void reembolsar(String id) {
        System.out.println("Reembolso no soportado en legacy");
    }
}
```

### Adapter en JDK

```java
// InputStreamReader adapta InputStream (bytes) a Reader (caracteres)
InputStream input = new FileInputStream("archivo.txt");
Reader reader = new InputStreamReader(input, "UTF-8");

// Arrays.asList adapta array a List
List<String> lista = Arrays.asList("a", "b", "c");
```

### Adapter en Spring

```java
// HandlerAdapter en Spring MVC adapta handlers a una interfaz común
public interface HandlerAdapter {
    boolean supports(Object handler);
    ModelAndView handle(HttpServletRequest request,
                        HttpServletResponse response,
                        Object handler) throws Exception;
}
```

## Bridge

Desacopla una abstracción de su implementación para que ambas puedan variar independientemente.

### Estructura

```
┌──────────────────┐       ┌──────────────────┐
│   <<abstract>>    │       │   <<interface>>   │
│   Abstraccion    │───────│  Implementador   │
├──────────────────┤       ├──────────────────┤
│ - impl: Impl     │       │ + operacion()    │
│ + operacion()    │       └──────────────────┘
└──────────────────┘                ▲
         ▲                          │
         │                          ├────────────┐
┌──────────────────┐       ┌────────────┐ ┌────────────┐
│ Abstraccion      │       │ ImplA      │ │ ImplB      │
│   Refinada       │       ├────────────┤ ├────────────┤
├──────────────────┤       │ + operacion│ │ + operacion│
│ + operacionExt() │       └────────────┘ └────────────┘
└──────────────────┘
```

### Ejemplo: Notificaciones Multiplataforma

```java
// Implementador
public interface PlataformaEnvio {
    void enviar(String mensaje, String destino);
}

// Implementaciones concretas
public class EmailSender implements PlataformaEnvio {
    public void enviar(String msg, String dest) {
        System.out.println("Email a " + dest + ": " + msg);
    }
}

public class SMSSender implements PlataformaEnvio {
    public void enviar(String msg, String dest) {
        System.out.println("SMS a " + dest + ": " + msg);
    }
}

// Abstracción
public abstract class Notificacion {
    protected PlataformaEnvio plataforma;

    protected Notificacion(PlataformaEnvio p) {
        this.plataforma = p;
    }

    public abstract void enviar(String mensaje, String destino);
}

// Abstracciones refinadas
public class NotificacionUrgente extends Notificacion {
    public NotificacionUrgente(PlataformaEnvio p) { super(p); }

    public void enviar(String msg, String dest) {
        plataforma.enviar("[URGENTE] " + msg, dest);
    }
}

public class NotificacionRecordatorio extends Notificacion {
    public NotificacionRecordatorio(PlataformaEnvio p) { super(p); }

    public void enviar(String msg, String dest) {
        plataforma.enviar("[RECORDATORIO] " + msg, dest);
    }
}

// Uso
Notificacion n1 = new NotificacionUrgente(new EmailSender());
n1.enviar("Servidor caído", "admin@empresa.com");

Notificacion n2 = new NotificacionRecordatorio(new SMSSender());
n2.enviar("Cita mañana 10am", "+51999000111");
```

### Bridge en JDBC

```java
// DriverManager actúa como puente entre la abstracción y la implementación
// Abstracción: java.sql.Connection
// Implementación: Driver específico (MySQL, PostgreSQL, Oracle)
Connection conn = DriverManager.getConnection(
    "jdbc:postgresql://localhost:5432/mydb", "user", "pass");
```

### Bridge en Spring

Spring MVC separa la abstracción (controladores) de la implementación (vistas JSP/Thymeleaf/REST).

## Adapter vs Bridge

| Aspecto | Adapter | Bridge |
|---------|---------|--------|
| Propósito | Hacer compatible interfaces incompatibles | Separar abstracción de implementación |
| Cuándo usarlo | Cuando tienes código existente con interfaz diferente | Cuando quieres que abstracción e implementación varíen independientemente |
| Dirección | Se adapta después | Se diseña desde el principio |
| Analogía | Adaptador de corriente eléctrica | Control remoto universal + dispositivos |
| Estructura | Envuelve un adaptee | Tiene dos jerarquías separadas |
