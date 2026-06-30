---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M10 — Comportamiento: Strategy, Template Method y Visitor

## Ejercicio 1: Calculadora de Impuestos (Strategy extendido)

**Solución esperada**:

```java
interface CalculadorImpuesto { double calcular(double monto); }

class ImpuestoNormal implements CalculadorImpuesto { public double calcular(double m) { return m * 0.18; } }
class ImpuestoReducido implements CalculadorImpuesto { public double calcular(double m) { return m * 0.05; } }
class ImpuestoExento implements CalculadorImpuesto { public double calcular(double m) { return 0; } }

class ImpuestoProgresivo implements CalculadorImpuesto {
    public double calcular(double m) {
        if (m <= 1000) return 0;
        if (m <= 5000) return (m - 1000) * 0.10;
        return (4000 * 0.10) + (m - 5000) * 0.20;
    }
}

class ImpuestoDigital implements CalculadorImpuesto { public double calcular(double m) { return m * 0.08; } }
class ImpuestoLujo implements CalculadorImpuesto {
    public double calcular(double m) { return m > 10000 ? m * 0.25 : 0; }
}

class FacturaConHistorial {
    private double monto;
    private List<CalculadorImpuesto> calculadores = new ArrayList<>();
    private List<String> historial = new ArrayList<>();

    FacturaConHistorial(double monto) { this.monto = monto; }
    void addCalculador(CalculadorImpuesto c) { calculadores.add(c); }

    double calcularTotal() {
        double impuestos = calculadores.stream().mapToDouble(c -> c.calcular(monto)).sum();
        String registro = "Monto: $" + monto + " Impuestos: $" + impuestos + " Total: $" + (monto + impuestos);
        historial.add(registro);
        return monto + impuestos;
    }

    void mostrarHistorial() { historial.forEach(System.out::println); }
}

// Demo
FacturaConHistorial f = new FacturaConHistorial(15000);
f.addCalculador(new ImpuestoNormal());
f.addCalculador(new ImpuestoProgresivo());
f.addCalculador(new ImpuestoLujo());
System.out.println("Total: $" + f.calcularTotal());
f.mostrarHistorial();
```

**Posibles mejoras**:
- **Usar `Function<Double, Double>` con lambdas**: reemplazar la interfaz `CalculadorImpuesto` por `UnaryOperator<Double>` (o `Function<Double, Double>`) y pasar las estrategias como lambdas: `f.addCalculador(m -> m * 0.18)`. Esto elimina las clases concretas para impuestos simples y solo mantiene clases para los complejos (`ImpuestoProgresivo`).
- **Composición de impuestos con `andThen`**: si los impuestos deben aplicarse en cadena (primero IVA, luego impuesto al lujo sobre el subtotal con IVA), usar composición funcional: `CalculadorImpuesto total = normal.andThen(lujo)` donde el resultado de uno es entrada del siguiente, modelando impuestos en cascada.
- **Registry de impuestos por jurisdicción**: crear un `ImpuestoRegistry` con `Map<String, List<CalculadorImpuesto>>` indexado por país/región. `FacturaConHistorial` recibe la jurisdicción y carga automáticamente los impuestos aplicables. Esto desacopla la factura del conocimiento de qué impuestos aplican dónde (similar a un sistema de impuestos real como Avalara o Stripe Tax).

## Ejercicio 2: Procesador de Pagos (Template Method)

**Solución esperada**:

```java
abstract class ProcesadorPago {
    public final void procesarPago(double monto) {
        if (!validarMonto(monto)) throw new RuntimeException("Monto inválido");
        if (!autenticar()) throw new RuntimeException("Autenticación fallida");
        ejecutarPago(monto);
        enviarConfirmacion(monto); // hook
        registrarTransaccion(monto);
    }

    private boolean validarMonto(double m) { return m > 0 && m < 100000; }
    protected abstract boolean autenticar();
    protected abstract void ejecutarPago(double monto);
    protected void enviarConfirmacion(double m) { System.out.println("Confirmación enviada"); } // hook
    private void registrarTransaccion(double m) { System.out.println("Transacción registrada: $" + m); }
}

class ProcesadorTarjeta extends ProcesadorPago {
    private String cvv, fechaExp;
    ProcesadorTarjeta(String cvv, String f) { this.cvv=cvv; this.fechaExp=f; }
    protected boolean autenticar() { return cvv != null && cvv.length() == 3; }
    protected void ejecutarPago(double m) { System.out.println("Pago tarjeta: $" + m); }
}

class ProcesadorPayPal extends ProcesadorPago {
    private String email, token;
    ProcesadorPayPal(String e, String t) { email=e; token=t; }
    protected boolean autenticar() { return email != null && token != null; }
    protected void ejecutarPago(double m) { System.out.println("Pago PayPal: $" + m); }
    protected void enviarConfirmacion(double m) { System.out.println("Email de confirmación a " + email); }
}

class ProcesadorTransferencia extends ProcesadorPago {
    private String cuenta, banco;
    ProcesadorTransferencia(String c, String b) { cuenta=c; banco=b; }
    protected boolean autenticar() { return cuenta != null && banco != null; }
    protected void ejecutarPago(double m) { System.out.println("Transferencia desde " + banco + ": $" + m); }
}
```

**Posibles mejoras**:
- **Usar Strategy en lugar de pasos abstractos**: reemplazar `autenticar()` y `ejecutarPago()` abstractos por `AuthenticationStrategy` y `PaymentExecutionStrategy` inyectadas. Esto permite combinar autenticación por CVV con ejecución por PayPal sin crear una subclase específica. El template method permanece igual, pero los pasos variables son ahora objetos Strategy.
- **Agregar validación de límite diario con Memento**: antes de `ejecutarPago()`, verificar si el monto acumulado en las últimas 24 horas excede un límite. Para esto, `ProcesadorPago` mantiene un registro de transacciones previas (Memento-style) y consulta el total. Si excede, lanza `LimiteDiarioExcedidoException` antes de ejecutar.
- **Hacer hooks con cadena de responsabilidad**: el hook `enviarConfirmacion()` podría ser una cadena de notificadores (email, SMS, push) donde cada uno decide si aplica según la configuración del usuario. En lugar de sobrescribir el hook, se inyecta un `NotificadorChain` en el constructor.

## Ejercicio 3: Visitor para Exportar Documentos

**Solución esperada**:

```java
interface VisitorDocumento {
    String visit(DocumentoPDF pdf);
    String visit(DocumentoWord word);
    String visit(DocumentoExcel excel);
    String visit(DocumentoHTML html);
}

abstract class Documento {
    String contenido; String autor; String fecha; long tamaño;
    Documento(String c, String a, String f, long t) { contenido=c; autor=a; fecha=f; tamaño=t; }
    abstract String accept(VisitorDocumento v);
}

class DocumentoPDF extends Documento {
    DocumentoPDF(String c, String a, String f, long t) { super(c,a,f,t); }
    String accept(VisitorDocumento v) { return v.visit(this); }
}

class DocumentoWord extends Documento {
    DocumentoWord(String c, String a, String f, long t) { super(c,a,f,t); }
    String accept(VisitorDocumento v) { return v.visit(this); }
}

class DocumentoExcel extends Documento {
    DocumentoExcel(String c, String a, String f, long t) { super(c,a,f,t); }
    String accept(VisitorDocumento v) { return v.visit(this); }
}

class DocumentoHTML extends Documento {
    DocumentoHTML(String c, String a, String f, long t) { super(c,a,f,t); }
    String accept(VisitorDocumento v) { return v.visit(this); }
}

class ExportadorJSON implements VisitorDocumento {
    public String visit(DocumentoPDF p) { return toJson("PDF", p); }
    public String visit(DocumentoWord w) { return toJson("WORD", w); }
    public String visit(DocumentoExcel e) { return toJson("EXCEL", e); }
    public String visit(DocumentoHTML h) { return toJson("HTML", h); }
    private String toJson(String tipo, Documento d) {
        return "{\"tipo\":\""+tipo+"\",\"contenido\":\""+d.contenido+"\",\"autor\":\""+d.autor+"\"}";
    }
}

class ContadorPalabras implements VisitorDocumento {
    int total = 0;
    public String visit(DocumentoPDF p) { total += p.contenido.split(" ").length; return ""; }
    public String visit(DocumentoWord w) { total += w.contenido.split(" ").length; return ""; }
    public String visit(DocumentoExcel e) { total += e.contenido.split(" ").length; return ""; }
    public String visit(DocumentoHTML h) { total += h.contenido.split(" ").length; return ""; }
    int getTotal() { return total; }
}
```

**Posibles mejoras**:
- **Agregar Composite para carpetas de documentos**: una clase `CarpetaDocumentos extends Documento` que contiene `List<Documento>`. Su `accept(v)` itera sobre los hijos llamando `hijo.accept(v)`. Esto permite exportar un árbol completo de documentos anidados con un solo Visitor, combinando Visitor + Composite.
- **Visitor con estado acumulativo genérico**: en lugar de que cada Visitor implemente `return ""` para operaciones de análisis, crear un `VisitorDocumentoAcumulativo<T>` con `T getResultado()`. `ContadorPalabras` extendería `VisitorDocumentoAcumulativo<Integer>`. Esto estandariza el patrón de acumulación y permite operaciones como `reducir`, `filtrar` y `mapear`.
- **Exportaciones reales usando librerías**: `ExportadorPDF` que use iText o Apache PDFBox para generar un PDF real (no solo imprimir en consola), `ExportadorCSV` que genere CSV válido escapando comillas y comas en el contenido. Esto muestra que Visitor no es solo académico — se usa en exportación de datos reales donde el formato varía pero la estructura de documentos es estable.

## Ejercicio 4: Notificaciones (Strategy + Template Method)

**Solución esperada**:

```java
interface FormateadorMensaje { String formatear(String tipo, String msg); }

class FormatoSimple implements FormateadorMensaje {
    public String formatear(String t, String m) { return "[" + t + "] " + m; }
}

class FormatoHTML implements FormateadorMensaje {
    public String formatear(String t, String m) { return "<html><body><strong>" + t + "</strong>: " + m + "</body></html>"; }
}

class FormatoJSON implements FormateadorMensaje {
    public String formatear(String t, String m) { return "{\"type\":\"" + t + "\",\"message\":\"" + m + "\"}"; }
}

abstract class NotificadorBase {
    protected FormateadorMensaje formateador;
    NotificadorBase(FormateadorMensaje f) { this.formateador = f; }

    public final void notificar(String tipo, String mensaje, String destino) {
        String formateado = formateador.formatear(tipo, mensaje);
        boolean exito = enviar(formateado, destino);
        registrar(tipo, destino, exito);
        if (!exito) manejarError(tipo, destino);
    }

    protected abstract boolean enviar(String mensaje, String destino);
    protected void registrar(String t, String d, boolean ok) {
        System.out.println("[LOG] " + t + " a " + d + ": " + (ok ? "OK" : "FALLO"));
    }
    protected void manejarError(String t, String d) {
        System.out.println("[ERROR] Falló envío de " + t + " a " + d);
    }
}

class NotificadorEmail extends NotificadorBase {
    NotificadorEmail(FormateadorMensaje f) { super(f); }
    protected boolean enviar(String msg, String dest) {
        System.out.println("Email a " + dest + ": " + msg);
        return true;
    }
}

class NotificadorSMS extends NotificadorBase {
    NotificadorSMS(FormateadorMensaje f) { super(f); }
    protected boolean enviar(String msg, String dest) {
        System.out.println("SMS a " + dest + ": " + msg);
        return true;
    }
}

// Demo
NotificadorBase email = new NotificadorEmail(new FormatoJSON());
email.notificar("ALERTA", "Servidor caído", "admin@empresa.com");

NotificadorBase sms = new NotificadorSMS(new FormatoSimple());
sms.notificar("INFO", "Bienvenido", "+51999000111");
```

**Posibles mejoras**:
- **Agregar retry con backoff en `manejarError()`**: si `enviar()` falla, el hook `manejarError()` podría reintentar hasta 3 veces con delays crecientes (1s, 2s, 5s). Esto se implementa en la clase base y se hereda automáticamente en todas las subclases, demostrando el poder reutilizador de Template Method.
- **Cola de mensajes con Command**: en lugar de enviar inmediatamente, `notificar()` podría encolar un `MensajeCommand` en una `BlockingQueue`. Un hilo consumidor procesa la cola, permitiendo rate limiting y batching. Esto combina Template Method + Command + Producer-Consumer, haciendo el sistema más robusto para alta carga.
- **Internacionalización del formato**: `FormateadorMensaje` podría recibir un `Locale` y usar `MessageFormat` para plantillas parametrizadas en múltiples idiomas. El template method `notificar()` obtiene el locale del destinatario (de una BD de usuarios) y lo pasa al formateador. Así, el mismo mensaje "Servidor caído" se envía en español a unos destinatarios y en inglés a otros.

