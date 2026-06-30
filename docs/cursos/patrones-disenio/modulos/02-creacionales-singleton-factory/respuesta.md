---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M02 — Creacionales: Singleton y Factory Method

## Ejercicio 1: Logger Thread-Safe con Singleton (Bill Pugh)

**Solución esperada**:

```java
public class Logger {
    public enum Nivel { INFO, WARN, ERROR }

    private Nivel nivel = Nivel.INFO;

    private Logger() { }

    private static class LoggerHolder {
        private static final Logger INSTANCIA = new Logger();
    }

    public static Logger getInstance() {
        return LoggerHolder.INSTANCIA;
    }

    public void setNivel(Nivel nivel) {
        this.nivel = nivel;
    }

    public void info(String msg) {
        if (nivel.ordinal() <= Nivel.INFO.ordinal()) {
            System.out.println("[INFO] " + java.time.LocalDateTime.now() + " - " + msg);
        }
    }

    public void warn(String msg) {
        if (nivel.ordinal() <= Nivel.WARN.ordinal()) {
            System.out.println("[WARN] " + java.time.LocalDateTime.now() + " - " + msg);
        }
    }

    public void error(String msg) {
        if (nivel.ordinal() <= Nivel.ERROR.ordinal()) {
            System.out.println("[ERROR] " + java.time.LocalDateTime.now() + " - " + msg);
        }
    }
}
```

**Posibles mejoras**:
- Reemplazar Bill Pugh por implementación con **Enum** para ganar resistencia contra reflexión, serialización y clonación sin código adicional. El Logger pasaría a ser `public enum Logger { INSTANCE; ... }` con el mismo comportamiento.
- Extraer la lógica de logging a una interfaz `Logger { void log(Nivel, String); }` con implementaciones intercambiables (consola, archivo, remoto), aplicando **Strategy** para que el destino del log sea configurable en tiempo de ejecución y testeable con un `Logger` mock.
- Agregar soporte multi-thread con `BlockingQueue<String>` y un hilo consumidor dedicado para escritura asíncrona (patrón **Producer-Consumer**), evitando que los hilos de negocio se bloqueen esperando I/O de escritura a disco/red.

## Ejercicio 2: Procesador de Documentos con Factory Method

**Solución esperada**:

```java
public interface Documento {
    void abrir();
    void leer();
    void cerrar();
}

public class PDFDocumento implements Documento {
    public void abrir() { System.out.println("Abriendo PDF..."); }
    public void leer()  { System.out.println("Leyendo PDF..."); }
    public void cerrar(){ System.out.println("Cerrando PDF..."); }
}

public class WordDocumento implements Documento {
    public void abrir() { System.out.println("Abriendo Word..."); }
    public void leer()  { System.out.println("Leyendo Word..."); }
    public void cerrar(){ System.out.println("Cerrando Word..."); }
}

public class ExcelDocumento implements Documento {
    public void abrir() { System.out.println("Abriendo Excel..."); }
    public void leer()  { System.out.println("Leyendo Excel..."); }
    public void cerrar(){ System.out.println("Cerrando Excel..."); }
}

public abstract class ProcesadorDocumentos {
    public final void procesar(String ruta) {
        Documento doc = crearDocumento();
        doc.abrir();
        doc.leer();
        doc.cerrar();
    }
    public abstract Documento crearDocumento();
}

public class ProcesadorPDF extends ProcesadorDocumentos {
    public Documento crearDocumento() { return new PDFDocumento(); }
}

public class ProcesadorWord extends ProcesadorDocumentos {
    public Documento crearDocumento() { return new WordDocumento(); }
}

public class ProcesadorExcel extends ProcesadorDocumentos {
    public Documento crearDocumento() { return new ExcelDocumento(); }
}
```

**Posibles mejoras**:
- Usar **Java SPI (ServiceLoader)** para descubrir automáticamente `ProcesadorDocumentos` en el classpath, eliminando la necesidad de conocer las subclases por nombre. Cada proveedor (PDF, Word, Excel) se registra vía `META-INF/services/ProcesadorDocumentos` y el sistema itera sobre `ServiceLoader.load(ProcesadorDocumentos.class)`.
- Agregar validación de extensión del archivo antes de abrir: el factory method `crearDocumento()` podría recibir la extensión y lanzar `UnsupportedOperationException` si no es soportada, o devolver un **Null Object** (`DocumentoNulo`) que implementa la interfaz con métodos vacíos.
- Transformar la clase abstracta en una interfaz con método `default` (Java 8+) para `procesar()`, permitiendo que los procesadores implementen múltiples interfaces y evitando forzar herencia (composición sobre herencia).

## Ejercicio 3: Pool de Conexiones Singleton (Enum)

**Solución esperada**:

```java
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public enum PoolConexiones {
    INSTANCIA;

    private static final int MAX_CONEXIONES = 5;
    private final BlockingQueue<Conexion> pool = new LinkedBlockingQueue<>(MAX_CONEXIONES);

    PoolConexiones() {
        for (int i = 1; i <= MAX_CONEXIONES; i++) {
            pool.offer(new Conexion("conn— + i));
        }
    }

    public Conexion getConexion() throws InterruptedException {
        Conexion c = pool.poll(5, TimeUnit.SECONDS);
        if (c == null) throw new RuntimeException("No hay conexiones disponibles");
        return c;
    }

    public void liberarConexion(Conexion c) {
        pool.offer(c);
    }
}

class Conexion {
    private final String id;
    Conexion(String id) { this.id = id; }
    public String getId() { return id; }
}
```

**Posibles mejoras**:
- Implementar **Object Pool** genérico con tipo parametrizado (`Pool<T>`), separando la lógica de pool del Singleton. Así el pool es reutilizable para otros recursos (threads, buffers), y el Singleton solo garantiza la unicidad del pool de conexiones específico.
- Agregar **Proxy** para `Conexion`: el `getConexion()` devuelve un `ConexionProxy` que sobrescribe `close()` para devolver la conexión al pool en lugar de cerrarla realmente. Esto evita que el cliente olvide llamar a `liberarConexion()` y sigue la convención try-with-resources.
- Parametrizar el timeout y tamaño máximo mediante `System.getProperties()` o variables de entorno, permitiendo configurar el pool sin recompilar, como lo hacen HikariCP y Tomcat JDBC Pool en producción.

## Ejercicio 4: Conversor de Monedas

**Solución esperada**:

```java
public interface Conversor {
    double convertir(double monto);
}

public class USDtoEUR implements Conversor {
    private static final double TASA = 0.85;
    public double convertir(double monto) { return monto * TASA; }
}

public class USDtoGBP implements Conversor {
    private static final double TASA = 0.73;
    public double convertir(double monto) { return monto * TASA; }
}

public enum FabricaConversores {
    INSTANCIA;

    public Conversor crearConversor(String tipo) {
        return switch (tipo.toUpperCase()) {
            case "USD_EUR" -> new USDtoEUR();
            case "USD_GBP" -> new USDtoGBP();
            default -> throw new IllegalArgumentException("Tipo no soportado: " + tipo);
        };
    }
}

// Uso
Conversor conversor = FabricaConversores.INSTANCIA.crearConversor("USD_EUR");
double resultado = conversor.convertir(100.0);
System.out.println("100 USD = " + resultado + " EUR");
```

**Posibles mejoras**:
- Reemplazar el `enum` por un `Map<String, Supplier<Conversor>>` que permita registrar conversores en tiempo de ejecución. Esto permite que clientes agreguen nuevos pares de monedas sin modificar la fábrica (OCP), similar al patrón **Registry**.
- Incorporar tasas de cambio dinámicas desde una API externa usando el patrón **Strategy**: cada `Conversor` recibe un `ExchangeRateProvider` que resuelve la tasa actual. La fábrica ahora inyecta la dependencia al conversor, eliminando constantes `static final` y evitando recompilar ante cambios de tasa.
- Agregar **Chain of Responsibility** para conversiones compuestas: si no existe `USD_JPY`, el sistema intenta `USD_EUR` → `EUR_JPY` encadenando conversores. Esto modela el mercado real de divisas donde algunas conversiones pasan por monedas intermedias.

