---
sidebar_label: "Clase"
---

# Módulo 03 — Abstract Factory, Builder y Prototype

## Abstract Factory

Proporciona una interfaz para crear **familias de objetos relacionados** sin especificar sus clases concretas.

### Estructura

```
┌──────────────────────┐       ┌──────────────────────┐
│   <<interface>>       │       │   <<interface>>       │
│  FabricaAbstracta     │       │    ProductoA          │
├──────────────────────┤       ├──────────────────────┤
│ + crearProductoA()   │       └──────────────────────┘
│ + crearProductoB()   │                ▲
└──────────────────────┘                │
         ▲                    ┌──────────────────────┐
         │                    │  ProductoAConcreto1   │
┌──────────────────────┐       ├──────────────────────┤
│ FabricaConcreta1      │       └──────────────────────┘
├──────────────────────┤
│ + crearProductoA()   │
│ + crearProductoB()   │
└──────────────────────┘
```

### Ejemplo: UI Multiplataforma (Windows vs Mac)

```java
// Productos abstractos
public interface Boton { void render(); }
public interface Ventana { void mostrar(); }

// Productos concretos Windows
public class BotonWindows implements Boton {
    public void render() { System.out.println("Renderizando botón estilo Windows"); }
}

// Productos concretos Mac
public class BotonMac implements Boton {
    public void render() { System.out.println("Renderizando botón estilo Mac"); }
}

// Fábrica abstracta
public interface FabricaUI {
    Boton crearBoton();
    Ventana crearVentana();
}

// Fábricas concretas
public class FabricaWindows implements FabricaUI {
    public Boton crearBoton() { return new BotonWindows(); }
    public Ventana crearVentana() { return new VentanaWindows(); }
}

public class FabricaMac implements FabricaUI {
    public Boton crearBoton() { return new BotonMac(); }
    public Ventana crearVentana() { return new VentanaMac(); }
}
```

## Builder

Separa la construcción de un objeto complejo de su representación, permitiendo el mismo proceso de construcción cree diferentes representaciones.

### Ejemplo con Telescoping Constructors (ANTIPATRÓN)

```java
public class Pedido {
    public Pedido(String id, String cliente, String direccion,
                  List<Item> items, double descuento, String notas) { }
    // Múltiples constructores con diferentes combinaciones
}
```

### Builder Pattern

```java
public class Pedido {
    private final String id;
    private final String cliente;
    private final String direccion;
    private final List<Item> items;
    private final double descuento;
    private final String notas;

    private Pedido(Builder builder) {
        this.id = builder.id;
        this.cliente = builder.cliente;
        this.direccion = builder.direccion;
        this.items = builder.items;
        this.descuento = builder.descuento;
        this.notas = builder.notas;
    }

    public static class Builder {
        private String id;
        private String cliente;
        private String direccion;
        private List<Item> items = new ArrayList<>();
        private double descuento = 0.0;
        private String notas = "";

        public Builder id(String id) { this.id = id; return this; }
        public Builder cliente(String c) { this.cliente = c; return this; }
        public Builder direccion(String d) { this.direccion = d; return this; }
        public Builder addItem(Item i) { this.items.add(i); return this; }
        public Builder descuento(double d) { this.descuento = d; return this; }
        public Builder notas(String n) { this.notas = n; return this; }
        public Pedido build() { return new Pedido(this); }
    }
}

// Uso
Pedido pedido = new Pedido.Builder()
    .id("P-001")
    .cliente("Juan Pérez")
    .direccion("Av. Principal 123")
    .addItem(new Item("Laptop", 1))
    .descuento(0.10)
    .build();
```

### Builder en JDK

```java
StringBuilder sb = new StringBuilder();
sb.append("Hola").append(" ").append("Mundo");
String resultado = sb.toString();

Stream.builder()
    .add("a").add("b").add("c")
    .build();
```

### Lombok @Builder

```java
import lombok.Builder;

@Builder
public class Usuario {
    private String nombre;
    private String email;
    private int edad;
    private String telefono;
}

// Uso
Usuario usuario = Usuario.builder()
    .nombre("Ana")
    .email("ana@email.com")
    .edad(30)
    .build();
```

## Prototype

Permite crear nuevos objetos **clonando** una instancia existente (prototipo).

### Clonación Superficial vs Profunda

```java
public class Notificacion implements Cloneable {
    private String titulo;
    private String mensaje;
    private List<String> destinatarios;

    // Clonación superficial (shallow copy)
    @Override
    public Notificacion clone() {
        try {
            return (Notificacion) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }

    // Clonación profunda (deep copy)
    public Notificacion deepCopy() {
        Notificacion clon = new Notificacion();
        clon.titulo = this.titulo;
        clon.mensaje = this.mensaje;
        clon.destinatarios = new ArrayList<>(this.destinatarios); // nueva lista
        return clon;
    }
}
```

### Prototype con Copy Constructor (recomendado)

```java
public class Notificacion {
    private String titulo;
    private String mensaje;

    // Copy constructor
    public Notificacion(Notificacion otra) {
        this.titulo = otra.titulo;
        this.mensaje = otra.mensaje;
    }
}
```

## Comparativa: Factory Method vs Abstract Factory vs Builder

| Aspecto | Factory Method | Abstract Factory | Builder |
|---------|---------------|-----------------|---------|
| Propósito | Un producto | Familia de productos | Objeto complejo paso a paso |
| Complejidad | Baja | Media | Media-Alta |
| Producto | Un tipo | Múltiples tipos relacionados | Un tipo con muchas configuraciones |
| Uso típico | Framework que delega creación | Temas UI multiplataforma | Objetos con muchos parámetros opcionales |
| Ejemplo JDK | `Calendar.getInstance()` | `DocumentBuilderFactory` | `StringBuilder` |
