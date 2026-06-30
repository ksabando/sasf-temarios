---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M04 — Estructurales: Adapter y Bridge

## Ejercicio 1: Adapter para API de Envíos

**Solución esperada**:

```java
// Clases de dominio
class Direccion {
    final String calle; final String ciudad; final String pais;
    Direccion(String calle, String ciudad, String pais) {
        this.calle = calle; this.ciudad = ciudad; this.pais = pais;
    }
    @Override public String toString() { return calle + ", " + ciudad + ", " + pais; }
}

class Paquete {
    final double pesoKg;
    Paquete(double pesoKg) { this.pesoKg = pesoKg; }
}

class EstadoEnvio {
    final String codigo; final String estado;
    EstadoEnvio(String codigo, String estado) { this.codigo = codigo; this.estado = estado; }
}

// Interfaz esperada
interface ServicioEnvio {
    String generarEnvio(Direccion origen, Direccion destino, Paquete paquete);
    EstadoEnvio consultarEstado(String codigo);
}

// API externa
class EnvioExternoAPI {
    public String crearEnvio(String origen, String destino, double pesoKg) {
        return "ENVIO— + System.currentTimeMillis();
    }
    public String trackingStatus(String codigo) {
        return "EN_TRANSITO";
    }
}

// Adapter
class EnvioAdapter implements ServicioEnvio {
    private EnvioExternoAPI api = new EnvioExternoAPI();

    public String generarEnvio(Direccion origen, Direccion destino, Paquete paquete) {
        return api.crearEnvio(origen.toString(), destino.toString(), paquete.pesoKg);
    }

    public EstadoEnvio consultarEstado(String codigo) {
        String status = api.trackingStatus(codigo);
        return new EstadoEnvio(codigo, status);
    }
}
```

**Posibles mejoras**:
- **Inyectar el Adaptee**: en lugar de `new EnvioExternoAPI()`, recibir `EnvioExternoAPI` por constructor. Esto permite mockear la API externa en tests unitarios (inyectando un stub) y cambiar de proveedor de envíos sin modificar el Adapter. Spring lo haría con `@Autowired` o `@Bean`.
- **Adapter con fallback y retry**: envolver las llamadas a `api.crearEnvio()` con lógica de retry (máximo 3 intentos con backoff exponencial) y circuit breaker. Si la API externa falla, devolver un `EstadoEnvio("ERROR", "SERVICIO_NO_DISPONIBLE")` en lugar de propagar la excepción, aislando al cliente del problema de infraestructura.
- **Agregar caché de tracking**: implementar un `Map<String, EstadoEnvio>` con TTL para `consultarEstado()`. Si el código fue consultado recientemente (últimos 60 segundos), devolver el resultado cacheado sin llamar a la API externa, reduciendo costos y latencia. Esto combina Adapter con **Proxy de caching**.

## Ejercicio 2: Bridge para Notificaciones (Extensión)

**Solución esperada**:

```java
interface PlataformaEnvio {
    void enviar(String mensaje, String destino);
}

class PushNotification implements PlataformaEnvio {
    public void enviar(String msg, String dest) {
        System.out.println("Push a dispositivo " + dest + ": " + msg);
    }
}

abstract class Notificacion {
    protected PlataformaEnvio plataforma;
    protected Notificacion(PlataformaEnvio p) { this.plataforma = p; }
    public abstract void enviar(String mensaje, String destino);
}

class NotificacionSilenciosa extends Notificacion {
    NotificacionSilenciosa(PlataformaEnvio p) { super(p); }
    public void enviar(String msg, String dest) {
        plataforma.enviar("[SILENCIOSA] " + msg, dest);
    }
}

class NotificacionProgramada extends Notificacion {
    private String fecha;
    NotificacionProgramada(PlataformaEnvio p, String fecha) { super(p); this.fecha = fecha; }
    public void enviar(String msg, String dest) {
        plataforma.enviar("[PROGRAMADA: " + fecha + "] " + msg, dest);
    }
}

// Demo
Notificacion n1 = new NotificacionSilenciosa(new PushNotification());
n1.enviar("Actualización disponible", "device-123");

Notificacion n2 = new NotificacionProgramada(new SMSSender(), "2026-07-01");
n2.enviar("Recordatorio de pago", "+51999000222");
```

**Posibles mejoras**:
- **Agregar `SMSSender` como `PlataformaEnvio`**: implementar `class SMSSender implements PlataformaEnvio` que use una API SMS real (Twilio o AWS SNS) en lugar del `System.out.println()`, demostrando que la abstracción `Notificacion` funciona con cualquier plataforma nueva sin cambios.
- **Decorator sobre plataformas**: crear un `PlataformaEnvioConLog extends PlataformaEnvio` que envuelva cualquier `PlataformaEnvio` y registre timestamp, mensaje y destino antes de delegar. Esto permite agregar logging sin modificar las plataformas existentes (OCP).
- **Usar Factory Method para crear la plataforma**: la `NotificacionProgramada` podría recibir un enum `Canal { PUSH, SMS, EMAIL }` y usar un factory interno para instanciar la plataforma correspondiente, reduciendo el acoplamiento entre el cliente y las clases concretas de plataforma.

## Ejercicio 3: Adapter para Facturación Legacy

**Solución esperada**:

```java
class FacturaJSON {
    final String cliente; final double monto; final String fecha;
    FacturaJSON(String cliente, double monto, String fecha) {
        this.cliente = cliente; this.monto = monto; this.fecha = fecha;
    }
    String toJSON() {
        return "{\"cliente\":\"" + cliente + "\",\"monto\":" + monto + ",\"fecha\":\"" + fecha + "\"}";
    }
}

class FacturadorLegacy {
    public String emitirFacturaXML(String cliente, double monto, String fecha) {
        return "<factura><cliente>" + cliente + "</cliente><monto>" + monto + "</monto><fecha>" + fecha + "</fecha></factura>";
    }
}

interface FacturadorModerno {
    FacturaJSON emitirFactura(String cliente, double monto, String fecha);
}

class FacturadorAdapter implements FacturadorModerno {
    private FacturadorLegacy legacy = new FacturadorLegacy();

    public FacturaJSON emitirFactura(String cliente, double monto, String fecha) {
        String xml = legacy.emitirFacturaXML(cliente, monto, fecha);
        // Extraer datos del XML (simplificado)
        String cli = xml.replaceAll(".*<cliente>(.*?)</cliente>.*", "$1");
        String mon = xml.replaceAll(".*<monto>(.*?)</monto>.*", "$1");
        String fec = xml.replaceAll(".*<fecha>(.*?)</fecha>.*", "$1");
        return new FacturaJSON(cli, Double.parseDouble(mon), fec);
    }
}
```

**Posibles mejoras**:
- **Usar un parser XML real**: reemplazar las regex frágiles por un parser DOM o StAX (`javax.xml.parsers.DocumentBuilder`). Las regex fallan con XML malformado, caracteres especiales escapados, o atributos en los tags. Un parser real maneja todos estos casos.
- **Implementar Two-Way Adapter**: `FacturadorAdapter` podría también implementar `FacturadorLegacy` (o una interfaz que exponga `emitirFacturaXML`), permitiendo que clientes que aún esperan XML sigan funcionando con el nuevo sistema JSON. Esto facilita una migración gradual donde algunos módulos ya migraron y otros no.
- **Agregar validación de datos**: antes de enviar al sistema legacy, validar que `monto > 0` y que `fecha` sea una fecha válida (usando `LocalDate.parse()`). Si la validación falla, lanzar una excepción de dominio (`FacturaInvalidaException`) en lugar de propagar un error críptico del sistema legacy.

## Ejercicio 4: Bridge para Controles Remotos

**Solución esperada**:

```java
interface Dispositivo {
    void encender(); void apagar();
    void setVolumen(int vol); int getVolumen();
    boolean isEncendido();
}

class TV implements Dispositivo {
    private boolean on = false; private int volumen = 10;
    public void encender() { on = true; System.out.println("TV encendida"); }
    public void apagar() { on = false; System.out.println("TV apagada"); }
    public void setVolumen(int v) { this.volumen = v; }
    public int getVolumen() { return volumen; }
    public boolean isEncendido() { return on; }
}

class Radio implements Dispositivo {
    private boolean on = false; private int volumen = 5;
    public void encender() { on = true; System.out.println("Radio encendida"); }
    public void apagar() { on = false; System.out.println("Radio apagada"); }
    public void setVolumen(int v) { this.volumen = v; }
    public int getVolumen() { return volumen; }
    public boolean isEncendido() { return on; }
}

abstract class ControlRemoto {
    protected Dispositivo dispositivo;
    ControlRemoto(Dispositivo d) { this.dispositivo = d; }
    abstract void encender(); abstract void apagar();
    void subirVolumen() { dispositivo.setVolumen(dispositivo.getVolumen() + 1); }
    void bajarVolumen() { dispositivo.setVolumen(dispositivo.getVolumen() - 1); }
}

class ControlBasico extends ControlRemoto {
    ControlBasico(Dispositivo d) { super(d); }
    void encender() { dispositivo.encender(); }
    void apagar() { dispositivo.apagar(); }
}

class ControlAvanzado extends ControlRemoto {
    ControlAvanzado(Dispositivo d) { super(d); }
    void encender() { dispositivo.encender(); }
    void apagar() { dispositivo.apagar(); }
    void mute() { dispositivo.setVolumen(0); }
}
```

**Posibles mejoras**:
- **Agregar Composite para macro-comandos**: crear un `ControlMacro extends ControlRemoto` que contenga una lista de comandos (`encender()`, `subirVolumen()`, `cambiarCanal()`) y los ejecute secuencialmente con un solo botón. Esto combina Bridge con **Command + Macro Command** para automatizar secuencias como "modo cine" (encender TV, bajar volumen a 5, cambiar a HDMI 2).
- **Implementar undo para controles**: `ControlRemoto` podría almacenar el estado previo del dispositivo antes de cada operación (`volumen anterior`, `canal anterior`) usando el patrón **Memento**, permitiendo operaciones de deshacer. `ControlAvanzado` tendría un método `deshacer()` que restaura el último estado guardado.
- **Agregar límites de volumen con State**: en lugar de modificar `subirVolumen()` y `bajarVolumen()` con `if (volumen < 0 || volumen > 100)`, usar el patrón **State** para modelar el dispositivo con estados `Encendido`, `Apagado`, `Muteado`, donde cada estado sabe qué operaciones son válidas. Por ejemplo, `subirVolumen()` en estado `Apagado` no hace nada o lanza excepción.

