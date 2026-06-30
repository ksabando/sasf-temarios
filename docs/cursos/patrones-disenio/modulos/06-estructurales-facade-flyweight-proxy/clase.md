---
sidebar_label: "Clase"
---

# Módulo 06 — Facade, Flyweight y Proxy

## Facade

Proporciona una interfaz simplificada a un subsistema complejo.

### Estructura

```
┌─────────────────────────────────────────────┐
│                  Facade                      │
├─────────────────────────────────────────────┤
│ + operacionSimplificada()                   │
└──────┬──────────────┬──────────────┬────────┘
       │              │              │
       ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│SubsistemaA│  │SubsistemaB│  │SubsistemaC│
└──────────┘  └──────────┘  └──────────┘
```

### Ejemplo: Sistema de Pedidos

```java
// Subsistemas complejos
class Inventario {
    boolean verificarStock(String producto, int cantidad) {
        System.out.println("Verificando stock de " + producto);
        return true;
    }
    void reducirStock(String producto, int cantidad) {
        System.out.println("Reduciendo stock de " + producto);
    }
}

class Facturacion {
    String generarFactura(String cliente, double total) {
        System.out.println("Factura generada para " + cliente);
        return "FAC— + System.currentTimeMillis();
    }
}

class Envio {
    String programarEnvio(String direccion, String facturaId) {
        System.out.println("Envío programado a " + direccion);
        return "ENV— + System.currentTimeMillis();
    }
}

class Notificacion {
    void enviarConfirmacion(String email, String facturaId) {
        System.out.println("Confirmación enviada a " + email);
    }
}

// Facade
public class PedidoFacade {
    private Inventario inventario = new Inventario();
    private Facturacion facturacion = new Facturacion();
    private Envio envio = new Envio();
    private Notificacion notificacion = new Notificacion();

    public void realizarPedido(String producto, int cantidad,
                                String cliente, String email,
                                String direccion) {
        System.out.println("=== Iniciando pedido ===");
        if (!inventario.verificarStock(producto, cantidad)) {
            throw new RuntimeException("Stock insuficiente");
        }
        inventario.reducirStock(producto, cantidad);
        double total = cantidad * 100; // simplificado
        String facturaId = facturacion.generarFactura(cliente, total);
        envio.programarEnvio(direccion, facturaId);
        notificacion.enviarConfirmacion(email, facturaId);
        System.out.println("=== Pedido completado ===");
    }
}

// Cliente usa solo la fachada
PedidoFacade pedido = new PedidoFacade();
pedido.realizarPedido("Laptop", 1, "Juan", "juan@email.com", "Av. Principal 123");
```

### Facade en Spring

```java
// JdbcTemplate es una fachada sobre JDBC
JdbcTemplate jdbc = new JdbcTemplate(dataSource);
List<Pedido> pedidos = jdbc.query("SELECT * FROM pedidos", new BeanPropertyRowMapper<>(Pedido.class));
```

## Flyweight

Comparte objetos granulares para minimizar el uso de memoria.

### Ejemplo: Renderizado de Caracteres

```java
// Flyweight (estado intrínseco, compartido)
public class Caracter {
    private final char simbolo; // intrínseco: compartido
    private final String fuente;

    public Caracter(char simbolo, String fuente) {
        this.simbolo = simbolo;
        this.fuente = fuente;
    }

    public void mostrar(int x, int y) { // extrínseco: se pasa como parámetro
        System.out.println(simbolo + " en (" + x + "," + y + ") fuente=" + fuente);
    }
}

// Fábrica Flyweight
public class FabricaCaracteres {
    private static final Map<String, Caracter> pool = new HashMap<>();

    public static Caracter getCaracter(char simbolo, String fuente) {
        String key = simbolo + "— + fuente;
        return pool.computeIfAbsent(key, k -> new Caracter(simbolo, fuente));
    }

    public static int getTotalCaracteresUnicos() {
        return pool.size();
    }
}

// Uso
Caracter a1 = FabricaCaracteres.getCaracter('A', "Arial");
Caracter a2 = FabricaCaracteres.getCaracter('A', "Arial"); // reutilizado
System.out.println(a1 == a2); // true
```

### Flyweight en JDK

```java
// String pool
String s1 = "hola";
String s2 = "hola";
System.out.println(s1 == s2); // true (misma referencia en pool)

// Integer.valueOf cache (-128 a 127)
Integer i1 = Integer.valueOf(100);
Integer i2 = Integer.valueOf(100);
System.out.println(i1 == i2); // true

Integer i3 = Integer.valueOf(200);
Integer i4 = Integer.valueOf(200);
System.out.println(i3 == i4); // false (fuera de rango)
```

## Proxy

Controla el acceso a otro objeto, actuando como intermediario.

### Tipos de Proxy

| Tipo | Propósito | Ejemplo |
|------|-----------|---------|
| **Virtual** | Lazy loading | Imagen que se carga solo cuando se muestra |
| **Remoto** | Acceso a objeto remoto | RMI, gRPC stubs |
| **Protección** | Control de acceso | Verificar permisos antes de ejecutar |

### Ejemplo: Proxy Virtual (Lazy Loading)

```java
// Sujeto real
public interface Imagen {
    void mostrar();
}

public class ImagenReal implements Imagen {
    private String archivo;

    public ImagenReal(String archivo) {
        this.archivo = archivo;
        cargarDesdeDisco();
    }

    private void cargarDesdeDisco() {
        System.out.println("Cargando imagen de " + archivo + " (operación costosa)...");
        try { Thread.sleep(2000); } catch (InterruptedException e) { }
    }

    public void mostrar() {
        System.out.println("Mostrando imagen: " + archivo);
    }
}

// Proxy
public class ImagenProxy implements Imagen {
    private String archivo;
    private ImagenReal imagenReal;

    public ImagenProxy(String archivo) {
        this.archivo = archivo;
    }

    public void mostrar() {
        // Lazy initialization
        if (imagenReal == null) {
            imagenReal = new ImagenReal(archivo);
        }
        imagenReal.mostrar();
    }
}

// Uso
Imagen imagen = new ImagenProxy("foto.jpg");
// La imagen se carga solo cuando se muestra por primera vez
imagen.mostrar();
imagen.mostrar(); // no se recarga
```

### Proxy de Protección

```java
public interface CuentaBancaria {
    void depositar(double monto);
    void retirar(double monto);
    double getSaldo();
}

public class CuentaReal implements CuentaBancaria {
    private double saldo;

    public void depositar(double m) { saldo += m; }
    public void retirar(double m) {
        if (m <= saldo) saldo -= m;
        else throw new RuntimeException("Saldo insuficiente");
    }
    public double getSaldo() { return saldo; }
}

public class ProxyProteccion implements CuentaBancaria {
    private CuentaReal cuenta = new CuentaReal();
    private String usuario;

    public ProxyProteccion(String usuario) { this.usuario = usuario; }

    public void depositar(double m) {
        if (!usuario.equals("admin")) {
            throw new SecurityException("Solo admin puede depositar");
        }
        cuenta.depositar(m);
    }

    public void retirar(double m) {
        if (usuario.equals("invitado")) {
            throw new SecurityException("Invitado no puede retirar");
        }
        cuenta.retirar(m);
    }

    public double getSaldo() { return cuenta.getSaldo(); }
}
```

### Proxy en Spring (AOP)

```java
// Spring crea un proxy cuando se usa @Transactional o @Cacheable
@Service
public class PedidoService {
    @Transactional // Spring crea un proxy transactional
    public void crearPedido(Pedido p) {
        // lógica de negocio
    }

    @Cacheable("productos") // Spring crea un proxy de caché
    public Producto getProducto(Long id) {
        return repositorio.findById(id).orElseThrow();
    }
}
```
