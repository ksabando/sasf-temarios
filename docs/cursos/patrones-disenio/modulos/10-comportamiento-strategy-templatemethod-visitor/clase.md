---
sidebar_label: "Clase"
---

# Módulo 10 — Strategy, Template Method y Visitor

## Strategy

Define una familia de algoritmos, los encapsula y los hace intercambiables. Permite que el algoritmo varíe independientemente del cliente que lo usa.

### Estructura

```
┌──────────────────┐       ┌──────────────────┐
│     Context      │──────▷│   <<interface>>   │
├──────────────────┤       │    Strategy      │
│ - strategy       │       ├──────────────────┤
│ + setStrategy(s) │       │ + execute(data)  │
│ + execute()      │       └──────────────────┘
└──────────────────┘                ▲
                                    │
                           ┌────────┼────────┐
                           │        │        │
                    ┌──────────┐ ┌──────┐ ┌──────┐
                    │StrategyA │ │StratB│ │StratC│
                    └──────────┘ └──────┘ └──────┘
```

### Ejemplo: Calculadora de Impuestos

```java
// Strategy interface
public interface CalculadorImpuesto {
    double calcular(double monto);
}

// Estrategias concretas
public class ImpuestoNormal implements CalculadorImpuesto {
    public double calcular(double monto) {
        return monto * 0.18; // 18% IGV
    }
}

public class ImpuestoReducido implements CalculadorImpuesto {
    public double calcular(double monto) {
        return monto * 0.05; // 5% para libros
    }
}

public class ImpuestoExento implements CalculadorImpuesto {
    public double calcular(double monto) {
        return 0; // exento de impuestos
    }
}

// Context
public class Factura {
    private double monto;
    private CalculadorImpuesto calculador;

    public Factura(double monto, CalculadorImpuesto calculador) {
        this.monto = monto;
        this.calculador = calculador;
    }

    public void setCalculador(CalculadorImpuesto calculador) {
        this.calculador = calculador;
    }

    public double calcularTotal() {
        return monto + calculador.calcular(monto);
    }
}

// Uso
Factura factura = new Factura(100, new ImpuestoNormal());
System.out.println(factura.calcularTotal()); // 118

factura.setCalculador(new ImpuestoReducido());
System.out.println(factura.calcularTotal()); // 105
```

### Strategy en JDK

```java
// Comparator<T> es un Strategy
List<String> nombres = Arrays.asList("Carlos", "Ana", "Beatriz");
nombres.sort(String::compareToIgnoreCase); // Strategy como lambda

// ThreadPoolExecutor con RejectedExecutionHandler
ThreadPoolExecutor executor = new ThreadPoolExecutor(1, 1, 0, TimeUnit.SECONDS, new LinkedBlockingQueue<>(1));
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
```

### Strategy en Spring

```java
// PasswordEncoder es un Strategy
PasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode("miPassword");

// AuthenticationProvider
public class JwtAuthenticationProvider implements AuthenticationProvider {
    public Authentication authenticate(Authentication auth) { /* ... */ }
    public boolean supports(Class<?> auth) { return JwtAuthToken.class.isAssignableFrom(auth); }
}
```

## Template Method

Define el esqueleto de un algoritmo en una operación, difiriendo algunos pasos a las subclases. Permite que subclases redefinan ciertos pasos sin cambiar la estructura del algoritmo.

### Estructura

```
┌──────────────────────┐
│   <<abstract>>       │
│   ClaseBase          │
├──────────────────────┤
│ + templateMethod()   │◄── método plantilla (final)
│ # paso1()            │◄── primitivo abstracto
│ # paso2()            │◄── primitivo con implementación por defecto
│ # hook()             │◄── hook (opcional)
└──────────────────────┘
         ▲
         │
┌──────────────────────┐
│   SubclaseConcreta   │
├──────────────────────┤
│ # paso1()            │
│ # paso2()            │
└──────────────────────┘
```

### Ejemplo: Bebidas

```java
public abstract class BebidaCaliente {

    // Template Method (final para evitar que subclases lo modifiquen)
    public final void prepararReceta() {
        hervirAgua();
        preparar();
        servirEnTaza();
        agregarCondimentos();
    }

    private void hervirAgua() {
        System.out.println("Hirviendo agua");
    }

    private void servirEnTaza() {
        System.out.println("Sirviendo en taza");
    }

    protected abstract void preparar();
    protected abstract void agregarCondimentos();

    // Hook: las subclases pueden overridearlo opcionalmente
    protected boolean clienteQuiereCondimentos() {
        return true;
    }
}

public class Cafe extends BebidaCaliente {
    protected void preparar() {
        System.out.println("Preparando café molido");
    }

    protected void agregarCondimentos() {
        System.out.println("Agregando azúcar y leche");
    }
}

public class Te extends BebidaCaliente {
    protected void preparar() {
        System.out.println("Poniendo bolsa de té en agua");
    }

    protected void agregarCondimentos() {
        System.out.println("Agregando limón");
    }
}
```

### Template Method en JDK

```java
// AbstractList define el esqueleto, subclases implementan get() y size()
List<String> lista = new AbstractList<>() {
    public String get(int index) { return datos[index]; }
    public int size() { return datos.length; }
};

// HttpServlet
public class MiServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) { }
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) { }
}
```

### Template Method en Spring

```java
// JdbcTemplate usa Template Method
JdbcTemplate jdbc = new JdbcTemplate(dataSource);
List<Pedido> pedidos = jdbc.query(
    "SELECT * FROM pedidos",
    (rs, rowNum) -> new Pedido(rs.getLong("id"), rs.getString("cliente"))
);

// JdbcTemplate ejecuta: abrir conexión → ejecutar query → mapear resultados → cerrar conexión
```

## Visitor

Permite definir nuevas operaciones sobre una estructura de objetos sin cambiar las clases de los elementos sobre los que opera.

### Estructura

```
┌──────────────────┐       ┌──────────────────┐
│   <<interface>>   │       │   <<interface>>   │
│   Element        │       │    Visitor        │
├──────────────────┤       ├──────────────────┤
│ + accept(v)      │──────▷│ + visit(A)       │
└──────────────────┘       │ + visit(B)       │
         ▲                 └──────────────────┘
         │
┌────────┴────────┐
│                 │
┌──────┐     ┌──────┐
│  A   │     │  B   │
├──────┤     ├──────┤
│+accept│     │+accept│
└──────┘     └──────┘
```

### Ejemplo: Exportación de Shapes

```java
// Visitor interface
public interface Visitor {
    String visit(Circulo circulo);
    String visit(Rectangulo rectangulo);
    String visit(Triangulo triangulo);
}

// Element interface
public interface Shape {
    String accept(Visitor visitor);
}

// Elementos concretos
public class Circulo implements Shape {
    public double radio;
    public Circulo(double radio) { this.radio = radio; }
    public String accept(Visitor v) { return v.visit(this); }
}

public class Rectangulo implements Shape {
    public double ancho, alto;
    public Rectangulo(double w, double h) { this.ancho = w; this.alto = h; }
    public String accept(Visitor v) { return v.visit(this); }
}

public class Triangulo implements Shape {
    public double base, altura;
    public Triangulo(double b, double h) { this.base = b; this.altura = h; }
    public String accept(Visitor v) { return v.visit(this); }
}

// Visitor concreto: exportar a JSON
public class JSONExportVisitor implements Visitor {
    public String visit(Circulo c) {
        return "{\"tipo\":\"circulo\",\"radio\":" + c.radio + "}";
    }
    public String visit(Rectangulo r) {
        return "{\"tipo\":\"rectangulo\",\"ancho\":" + r.ancho + ",\"alto\":" + r.alto + "}";
    }
    public String visit(Triangulo t) {
        return "{\"tipo\":\"triangulo\",\"base\":" + t.base + ",\"altura\":" + t.altura + "}";
    }
}

// Visitor concreto: exportar a XML
public class XMLExportVisitor implements Visitor {
    public String visit(Circulo c) {
        return "<circulo><radio>" + c.radio + "</radio></circulo>";
    }
    public String visit(Rectangulo r) {
        return "<rectangulo><ancho>" + r.ancho + "</ancho><alto>" + r.alto + "</alto></rectangulo>";
    }
    public String visit(Triangulo t) {
        return "<triangulo><base>" + t.base + "</base><altura>" + t.altura + "</altura></triangulo>";
    }
}

// Uso
List<Shape> shapes = Arrays.asList(new Circulo(5), new Rectangulo(3, 4), new Triangulo(6, 8));
Visitor json = new JSONExportVisitor();
for (Shape s : shapes) {
    System.out.println(s.accept(json));
}
```

### Visitor en JDK

```java
// javax.lang.model.element.ElementVisitor
ElementVisitor visitor = new SimpleElementVisitor8<>() {
    @Override public Object visitType(TypeElement e, Object p) { return e.getQualifiedName(); }
};
```
