---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M05 — Estructurales: Composite y Decorator

## Ejercicio 1: Sistema de Archivos con Composite

**Solución esperada**:

```java
interface FileSystemItem {
    long getSize();
    String getName();
    void print(String indent);
}

class File implements FileSystemItem {
    private String name; private long size;
    File(String name, long size) { this.name = name; this.size = size; }
    public long getSize() { return size; }
    public String getName() { return name; }
    public void print(String indent) { System.out.println(indent + " " + name + " (" + size + " bytes)"); }
}

class Directory implements FileSystemItem {
    private String name;
    private List<FileSystemItem> items = new ArrayList<>();
    Directory(String name) { this.name = name; }
    public void add(FileSystemItem item) { items.add(item); }
    public void remove(FileSystemItem item) { items.remove(item); }
    public String getName() { return name; }
    public long getSize() { return items.stream().mapToLong(FileSystemItem::getSize).sum(); }
    public void print(String indent) {
        System.out.println(indent + " " + name + "/");
        for (FileSystemItem item : items) item.print(indent + "  ");
    }
}

// Demo
Directory proyecto = new Directory("proyecto");
Directory src = new Directory("src");
Directory util = new Directory("util");
util.add(new File("Helper.java", 300));
src.add(new File("Main.java", 500));
src.add(util);
proyecto.add(src);
proyecto.add(new File("README.md", 150));
Directory build = new Directory("build");
build.add(new File("output.jar", 2_000_000));
proyecto.add(build);

proyecto.print("");
System.out.println("Tamaño total: " + proyecto.getSize() + " bytes");
```

**Posibles mejoras**:
- **Agregar Visitor para operaciones extensibles**: en lugar de codificar `print()` en la interfaz, implementar un `FileSystemVisitor` con `visit(File f)` y `visit(Directory d)`. Esto permite agregar operaciones (contar archivos por extensión, buscar por nombre, calcular checksum) sin modificar las clases `File` y `Directory` (OCP). En el JDK, `java.nio.file.SimpleFileVisitor` es exactamente este patrón.
- **Implementar lazy size caching**: `Directory.getSize()` recalcula recursivamente cada vez que se llama. Guardar el tamaño en un campo `private long cachedSize` con una flag `dirty` que se invalida cuando se agrega o elimina un hijo. Esto es esencial para sistemas de archivos reales donde `getSize()` se llama frecuentemente y la estructura es profunda.
- **Agregar filtro con Composite + Specification**: crear un `FileSystemFilter` que itere recursivamente y retorne solo los items que cumplen una `Specification` (por nombre, extensión, tamaño). Combina Composite con el patrón Specification para consultas declarativas tipo `proyecto.filter(byExtension(".java").and(minSize(100)))`.

## Ejercicio 2: Decorator para Notificaciones

**Solución esperada**:

```java
interface Notificador { void enviar(String mensaje, String destinatario); }

class EmailNotificador implements Notificador {
    public void enviar(String msg, String dest) {
        System.out.println(" Enviando email a " + dest + ": " + msg);
    }
}

abstract class NotificadorDecorator implements Notificador {
    protected Notificador wrappee;
    NotificadorDecorator(Notificador w) { this.wrappee = w; }
    public void enviar(String msg, String dest) { wrappee.enviar(msg, dest); }
}

class LoggingNotificador extends NotificadorDecorator {
    LoggingNotificador(Notificador w) { super(w); }
    public void enviar(String msg, String dest) {
        System.out.println("[LOG] Enviando a " + dest);
        super.enviar(msg, dest);
        System.out.println("[LOG] Envío completado");
    }
}

class FiltroNotificador extends NotificadorDecorator {
    private static final List<String> PROHIBIDAS = Arrays.asList("spam", "promocion");
    FiltroNotificador(Notificador w) { super(w); }
    public void enviar(String msg, String dest) {
        for (String p : PROHIBIDAS) {
            if (msg.toLowerCase().contains(p)) {
                System.out.println("[FILTRO] Mensaje bloqueado: contiene '" + p + "'");
                return;
            }
        }
        super.enviar(msg, dest);
    }
}

class PrioridadNotificador extends NotificadorDecorator {
    private String prioridad;
    PrioridadNotificador(Notificador w, String p) { super(w); this.prioridad = p; }
    public void enviar(String msg, String dest) {
        super.enviar("[" + prioridad + "] " + msg, dest);
    }
}

// Uso
Notificador n = new EmailNotificador();
n = new LoggingNotificador(n);
n = new FiltroNotificador(n);
n = new PrioridadNotificador(n, "ALTA");
n.enviar("Bienvenido al sistema", "user@email.com");
```

**Posibles mejoras**:
- **Agregar SMS y Push como canales base**: implementar `SMSNotificador` y `PushNotificador` que implementen `Notificador`. Con la cadena de decorators, cualquier combinación funciona: `new Logging(new Filtro(new SMSNotificador()))` sin modificar los decorators existentes, demostrando la potencia del patrón.
- **Retry en el decorator de logging**: transformar `LoggingNotificador` en `ResilientNotificador` que reintente hasta 3 veces con backoff exponencial si `enviar()` lanza excepción. Esto muestra cómo un decorator puede agregar resiliencia de forma transparente, similar a Resilience4j `@Retry` en Spring.
- **Pipeline declarativo con Builder**: crear un `NotificadorBuilder` que construya la cadena de decorators mediante una API fluida: `Notificador n = Pipeline.iniciar(new EmailNotificador()).conLogging().conFiltro(palabrasProhibidas).conPrioridad("ALTA").build()`. Esto oculta la anidación manual de `new` y permite validar el orden de los decorators.

## Ejercicio 3: Menú de Restaurante

**Solución esperada**:

```java
interface MenuItem {
    String getNombre(); double getPrecio();
    void print(String indent);
}

class Plato implements MenuItem {
    private String nombre; private double precio; private String descripcion;
    Plato(String n, double p, String d) { this.nombre = n; this.precio = p; this.descripcion = d; }
    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }
    public void print(String indent) { System.out.println(indent + " " + nombre + " ($" + precio + ")"); }
}

class CategoriaMenu implements MenuItem {
    private String nombre;
    private List<MenuItem> items = new ArrayList<>();
    CategoriaMenu(String n) { this.nombre = n; }
    public void add(MenuItem item) { items.add(item); }
    public String getNombre() { return nombre; }
    public double getPrecio() {
        return items.stream().mapToDouble(MenuItem::getPrecio).sum();
    }
    public void print(String indent) {
        System.out.println(indent + " " + nombre + " ($" + getPrecio() + ")");
        for (MenuItem item : items) item.print(indent + "  ");
    }
}

// Demo
CategoriaMenu menu = new CategoriaMenu("Menú Principal");
CategoriaMenu entradas = new CategoriaMenu("Entradas");
entradas.add(new Plato("Ceviche", 12, "Pescado marinado"));
entradas.add(new Plato("Causa", 8, "Puré de papa"));
menu.add(entradas);
CategoriaMenu fondos = new CategoriaMenu("Platos de Fondo");
fondos.add(new Plato("Lomo Saltado", 18, "Lomo salteado"));
fondos.add(new Plato("Ají de Gallina", 15, "Pollo en crema"));
menu.add(fondos);
CategoriaMenu bebidas = new CategoriaMenu("Bebidas");
bebidas.add(new Plato("Gaseosa", 3, "Bebida carbonatada"));
bebidas.add(new Plato("Chicha", 4, "Chicha morada"));
menu.add(bebidas);
menu.print("");
```

**Posibles mejoras**:
- **Implementar búsqueda recursiva con Iterator**: crear un `MenuIterator` que recorra el menú en profundidad o anchura (DFS/BFS) devolviendo solo `Plato` (Leaf). Esto permite operaciones como "buscar todos los platos vegetarianos" o "platos por debajo de $10" sin que el cliente conozca la estructura del árbol.
- **Agregar descuentos con Decorator**: si una categoría está en promoción (ej. 20% off en Entradas), envolverla con un `CategoriaPromocion` que sobrescriba `getPrecio()` retornando `precio * 0.8`. Esto muestra cómo Composite y Decorator pueden combinarse: la estructura es Composite, pero el comportamiento de precio se modifica con Decorator en nodos específicos.
- **Exportar a JSON recursivo**: agregar `toJSON()` a `MenuItem` que devuelva una representación JSON anidada. Un `Plato` devuelve `{"nombre": "Ceviche", "precio": 12}`, una `CategoriaMenu` devuelve `{"nombre": "Entradas", "items": [...]}`. Esto permite serializar el árbol completo con una sola llamada recursiva.

## Ejercicio 4: Decorator para Reportes

**Solución esperada**:

```java
interface Reporte { String generar(); }

class ReporteBase implements Reporte {
    public String generar() {
        return "Reporte del " + java.time.LocalDate.now();
    }
}

abstract class ReporteDecorator implements Reporte {
    protected Reporte wrappee;
    ReporteDecorator(Reporte w) { this.wrappee = w; }
    public String generar() { return wrappee.generar(); }
}

class EncabezadoDecorator extends ReporteDecorator {
    EncabezadoDecorator(Reporte w) { super(w); }
    public String generar() {
        return "=== EMPRESA S.A. ===\n" + super.generar();
    }
}

class PiePaginaDecorator extends ReporteDecorator {
    PiePaginaDecorator(Reporte w) { super(w); }
    public String generar() {
        return super.generar() + "\n--- Página 1 de 1 --—;
    }
}

class FormatoHTMLDecorator extends ReporteDecorator {
    FormatoHTMLDecorator(Reporte w) { super(w); }
    public String generar() {
        String content = super.generar();
        return "<html><body><pre>" + content + "</pre></body></html>";
    }
}

// Uso
Reporte reporte = new ReporteBase();
reporte = new EncabezadoDecorator(reporte);
reporte = new PiePaginaDecorator(reporte);
reporte = new FormatoHTMLDecorator(reporte);
System.out.println(reporte.generar());
```

**Posibles mejoras**:
- **Agregar decorators de exportación**: `CSVExportDecorator` que transforme el reporte a formato CSV, `PDFExportDecorator` que use una librería como iText o OpenPDF, y `WatermarkDecorator` que agregue "CONFIDENCIAL" como marca de agua. Todos implementan `Reporte` y se pueden combinar: `new PDFExport(new Watermark(new Encabezado(reporte)))`.
- **Decorator de caché con TTL**: `CacheReporteDecorator` que almacene el resultado de `generar()` con un timestamp. Si se llama a `generar()` dentro de los 60 segundos siguientes, devuelve el resultado cacheado sin re-ejecutar la cadena. Si expiró, recalcula y actualiza la caché. Esto es un **Proxy de caching** aplicado como Decorator.
- **Usar lambdas como decorators funcionales**: en lugar de clases concretas para cada decorator, usar `Function<String, String>` para transformaciones simples: `reporte = addHeader.andThen(addFooter).andThen(wrapHtml).apply(ReporteBase::generar)`. Para decorators stateful, usar un `UnaryOperator<Reporte>` con `andThen()`. Esto reduce el boilerplate de clases en Java 8+.

