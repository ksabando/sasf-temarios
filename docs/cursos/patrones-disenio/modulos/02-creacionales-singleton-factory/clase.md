---
sidebar_label: "Clase"
---

# Módulo 02 — Singleton y Factory Method

## Singleton

El patrón **Singleton** garantiza que una clase tenga una única instancia y proporciona un punto de acceso global a ella.

### Implementación Thread-Safe

#### 1. Inicialización temprana (Eager Initialization)

```java
public class ConexionBD {
    private static final ConexionBD INSTANCIA = new ConexionBD();

    private ConexionBD() { }

    public static ConexionBD getInstancia() {
        return INSTANCIA;
    }
}
```

#### 2. Double-Checked Locking (NO RECOMENDADO)

```java
public class Logger {
    private static volatile Logger instancia;

    private Logger() { }

    public static Logger getInstancia() {
        if (instancia == null) {
            synchronized (Logger.class) {
                if (instancia == null) {
                    instancia = new Logger();
                }
            }
        }
        return instancia;
    }
}
```

#### 3. Bill Pugh (Initialization-on-demand holder)

```java
public class Logger {
    private Logger() { }

    private static class LoggerHolder {
        private static final Logger INSTANCIA = new Logger();
    }

    public static Logger getInstancia() {
        return LoggerHolder.INSTANCIA;
    }

    public void log(String mensaje) {
        System.out.println("[LOG] " + mensaje);
    }
}
```

#### 4. Enum (la mejor opción según Effective Java)

```java
public enum LoggerEnum {
    INSTANCIA;

    public void log(String mensaje) {
        System.out.println("[LOG] " + mensaje);
    }
}

// Uso: LoggerEnum.INSTANCIA.log("mensaje");
```

### Singleton en Spring

En Spring, los beans son **singleton por defecto**:

```java
@Component
@Scope("singleton") // opcional, es el valor por defecto
public class PedidoService {
    // Spring maneja una única instancia
}
```

### Singleton en JDK

```java
Runtime runtime = Runtime.getRuntime();
Logger logger = Logger.getLogger("miLogger");
```

### Discusión: ¿Singleton es anti-patrón?

| A favor | En contra |
|---------|-----------|
| Garantiza una única instancia | Dificulta el testing (estado global) |
| Punto de acceso global conocido | Acoplamiento oculto |
| Útil para pools, loggers, config | Viola SRP (creación + uso) |
| Útil en aplicaciones sin DI | Dificulta concurrencia |

## Factory Method

El patrón **Factory Method** define una interfaz para crear un objeto, pero permite que las subclases decidan qué clase concreta instanciar.

### Estructura

```
┌──────────────────────┐
│    <<abstract>>       │
│   Creador            │
├──────────────────────┤
│ + factoryMethod()    │◄──── método fábrica abstracto
│ + operacion()        │
└──────────────────────┘
         ▲
         │
┌──────────────────────┐
│  CreadorConcreto     │
├──────────────────────┤
│ + factoryMethod()    │
└──────────────────────┘
```

### Ejemplo: Procesador de Documentos

```java
// Producto
public interface Documento {
    void abrir();
    void cerrar();
}

// Productos concretos
public class PDFDocumento implements Documento {
    public void abrir() { System.out.println("Abriendo PDF"); }
    public void cerrar() { System.out.println("Cerrando PDF"); }
}

public class WordDocumento implements Documento {
    public void abrir() { System.out.println("Abriendo Word"); }
    public void cerrar() { System.out.println("Cerrando Word"); }
}

// Creador
public abstract class ProcesadorDocumentos {
    public void procesar() {
        Documento doc = crearDocumento();
        doc.abrir();
        // procesar...
        doc.cerrar();
    }

    public abstract Documento crearDocumento(); // Factory Method
}

// Creadores concretos
public class ProcesadorPDF extends ProcesadorDocumentos {
    public Documento crearDocumento() { return new PDFDocumento(); }
}

public class ProcesadorWord extends ProcesadorDocumentos {
    public Documento crearDocumento() { return new WordDocumento(); }
}
```

### Factory Method en Spring

```java
@Configuration
public class AppConfig {
    @Bean
    public PedidoService pedidoService() {
        return new PedidoService();
    }
}
```

### Factory Method en JDK

```java
Calendar cal = Calendar.getInstance(); // devuelve GregorianCalendar
Stream<String> stream = Stream.of("a", "b"); // Factory Method
```

## Comparativa: Singleton vs Factory Method

| Aspecto | Singleton | Factory Method |
|---------|-----------|----------------|
| Propósito | Una única instancia | Encapsular creación |
| Número de instancias | 1 | Múltiples (según subclase) |
| Herencia | No (constructor privado) | Sí (herencia de creadores) |
| Testing | Difícil (estado global) | Fácil (mockeable) |
| Spring | @Scope("singleton") | @Bean |
| Patrón relacionado | Abstract Factory usa Singleton | Template Method usa Factory Method |

## Factory Method vs Strategy

- **Factory Method**: crea objetos (patrón creacional)
- **Strategy**: ejecuta algoritmos intercambiables (patrón de comportamiento)
- Se complementan: Factory Method puede seleccionar qué Strategy usar
