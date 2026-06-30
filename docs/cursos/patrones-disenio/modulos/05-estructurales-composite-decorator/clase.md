---
sidebar_label: "Clase"
---

# Módulo 05 — Composite y Decorator

## Composite

Compone objetos en estructuras de árbol para representar jerarquías parte-todo. Permite tratar objetos individuales y compuestos de manera uniforme.

### Estructura

```
┌──────────────────────┐
│   <<interface>>       │
│   Componente         │
├──────────────────────┤
│ + operacion()        │
│ + add(Componente)    │
│ + remove(Comp)       │
│ + getChild(int)      │
└──────────────────────┘
         ▲                ▲
         │                │
┌──────────────────┐ ┌──────────────────┐
│      Leaf        │ │    Composite     │
├──────────────────┤ ├──────────────────┤
│ + operacion()    │ │ + operacion()    │
└──────────────────┘ │ + add(Comp)      │
                      │ + remove(Comp)   │
                      │ + getChild(int)  │
                      └──────────────────┘
```

### Ejemplo: Sistema de Archivos

```java
// Componente
public interface SistemaArchivo {
    void mostrar(String indentacion);
    long getTamaño();
}

// Leaf (archivo individual)
public class Archivo implements SistemaArchivo {
    private String nombre;
    private long tamaño;

    public Archivo(String nombre, long tamaño) {
        this.nombre = nombre;
        this.tamaño = tamaño;
    }

    public void mostrar(String indent) {
        System.out.println(indent + "📄 " + nombre + " (" + tamaño + " bytes)");
    }

    public long getTamaño() { return tamaño; }
}

// Composite (carpeta)
public class Carpeta implements SistemaArchivo {
    private String nombre;
    private List<SistemaArchivo> hijos = new ArrayList<>();

    public Carpeta(String nombre) { this.nombre = nombre; }

    public void add(SistemaArchivo hijo) { hijos.add(hijo); }
    public void remove(SistemaArchivo hijo) { hijos.remove(hijo); }

    public void mostrar(String indent) {
        System.out.println(indent + "📁 " + nombre + "/");
        for (SistemaArchivo hijo : hijos) {
            hijo.mostrar(indent + "  ");
        }
    }

    public long getTamaño() {
        return hijos.stream().mapToLong(SistemaArchivo::getTamaño).sum();
    }
}

// Uso
Carpeta raiz = new Carpeta("raiz");
Carpeta docs = new Carpeta("documentos");
docs.add(new Archivo("resume.pdf", 1024));
docs.add(new Archivo("carta.txt", 256));
raiz.add(docs);
raiz.add(new Archivo("foto.jpg", 5120));
raiz.mostrar("");
```

### Composite en JDK

```java
// java.awt.Container es un Composite que puede contener Componentes
Container panel = new JPanel();
panel.add(new JButton("OK"));
panel.add(new JTextField(10));

// JSF UIComponent
UIComponent formulario = new HtmlForm();
formulario.getChildren().add(new HtmlInputText());
```

## Decorator

Agrega responsabilidades adicionales a un objeto dinámicamente. Es una alternativa flexible a la herencia para extender funcionalidad.

### Estructura

```
┌──────────────────────┐
│   <<interface>>       │
│   Componente         │
├──────────────────────┤
│ + operacion()        │
└──────────────────────┘
         ▲                ▲
         │                │
┌──────────────────┐ ┌──────────────────┐
│ ComponenteConcreto│ │   Decorator     │
├──────────────────┤ ├──────────────────┤
│ + operacion()    │ │ - componente    │
└──────────────────┘ │ + operacion()    │
                      └──────────────────┘
                               ▲
                               │
                      ┌──────────────────┐
                      │ DecoradorConcreto│
                      ├──────────────────┤
                      │ + operacion()    │
                      └──────────────────┘
```

### Ejemplo: DataSource con Decoradores

```java
// Componente
public interface DataSource {
    void escribir(String datos);
    String leer();
}

// Componente concreto
public class FileDataSource implements DataSource {
    private String filename;

    public FileDataSource(String filename) { this.filename = filename; }

    public void escribir(String datos) {
        System.out.println("Escribiendo a archivo: " + datos);
    }

    public String leer() {
        return "datos desde archivo";
    }
}

// Decorador base
public abstract class DataSourceDecorator implements DataSource {
    protected DataSource wrappee;

    public DataSourceDecorator(DataSource source) {
        this.wrappee = source;
    }

    public void escribir(String datos) { wrappee.escribir(datos); }
    public String leer() { return wrappee.leer(); }
}

// Decoradores concretos
public class EncryptionDecorator extends DataSourceDecorator {
    public EncryptionDecorator(DataSource source) { super(source); }

    public void escribir(String datos) {
        String encrypted = "ENCRYPTED(" + datos + ")";
        super.escribir(encrypted);
    }

    public String leer() {
        String data = super.leer();
        return data.replace("ENCRYPTED(", "").replace(")", "");
    }
}

public class CompressionDecorator extends DataSourceDecorator {
    public CompressionDecorator(DataSource source) { super(source); }

    public void escribir(String datos) {
        String compressed = "COMPRESSED(" + datos.substring(0, Math.min(10, datos.length())) + "...)";
        super.escribir(compressed);
    }

    public String leer() {
        String data = super.leer();
        return data.replace("COMPRESSED(", "").replace(")", "");
    }
}

// Uso
DataSource source = new FileDataSource("datos.txt");
source = new CompressionDecorator(source);
source = new EncryptionDecorator(source);
source.escribir("Datos sensibles importantes");
```

### Decorator en JDK

```java
// InputStream decorado
InputStream archivo = new FileInputStream("datos.txt");
InputStream buffer = new BufferedInputStream(archivo);
InputStream gzip = new GZIPInputStream(buffer);

// Collections.synchronizedList
List<String> lista = new ArrayList<>();
List<String> sincronizada = Collections.synchronizedList(lista);
```

### Decorator en Spring

```java
// SecurityFilterChain como decorator
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable());
    return http.build();
}
```

## Composite vs Decorator

| Aspecto | Composite | Decorator |
|---------|-----------|-----------|
| Propósito | Estructuras parte-todo | Agregar responsabilidades |
| Relación | Contenedor-contenido | Envoltura |
| Número de capas | Profundidad variable (árbol) | Una capa por decorador |
| Transparencia | Cliente trata igual a leaf y composite | Cliente usa misma interfaz |
| Similitud estructural | Ambos tienen la misma interfaz que sus componentes |
| Analogía | Carpetas y archivos | Envoltorio de regalo |
