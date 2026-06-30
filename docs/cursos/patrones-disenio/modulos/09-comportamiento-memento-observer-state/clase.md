---
sidebar_label: "Clase"
---

# Módulo 09 — Memento, Observer y State

## Memento

Captura y externaliza el estado interno de un objeto para que pueda ser restaurado más tarde, sin violar el encapsulamiento.

### Estructura

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   Originator     │──────▷│     Memento      │◁──────│   Caretaker     │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ - estado         │       │ - estado         │       │ - mementos      │
│ + crearMemento() │       │ + getEstado()    │       │ + addMemento()  │
│ + restaurar(m)   │       └──────────────────┘       │ + getMemento()  │
└──────────────────┘                                   └──────────────────┘
```

### Ejemplo: Editor de Texto con Undo/Redo

```java
// Memento
public class Memento {
    private final String estado;

    public Memento(String estado) {
        this.estado = estado;
    }

    public String getEstado() {
        return estado;
    }
}

// Originator
public class EditorTexto {
    private StringBuilder contenido = new StringBuilder();

    public void escribir(String texto) {
        contenido.append(texto);
    }

    public String getContenido() {
        return contenido.toString();
    }

    public Memento crearMemento() {
        return new Memento(contenido.toString());
    }

    public void restaurar(Memento memento) {
        this.contenido = new StringBuilder(memento.getEstado());
    }
}

// Caretaker
public class Historial {
    private Stack<Memento> undoStack = new Stack<>();
    private Stack<Memento> redoStack = new Stack<>();

    public void guardar(EditorTexto editor) {
        undoStack.push(editor.crearMemento());
        redoStack.clear(); // al escribir, se limpia redo
    }

    public void deshacer(EditorTexto editor) {
        if (undoStack.isEmpty()) return;
        redoStack.push(editor.crearMemento());
        editor.restaurar(undoStack.pop());
    }

    public void rehacer(EditorTexto editor) {
        if (redoStack.isEmpty()) return;
        undoStack.push(editor.crearMemento());
        editor.restaurar(redoStack.pop());
    }
}

// Uso
EditorTexto editor = new EditorTexto();
Historial historial = new Historial();

historial.guardar(editor);
editor.escribir("Hola ");

historial.guardar(editor);
editor.escribir("Mundo");

System.out.println(editor.getContenido()); // "Hola Mundo"
historial.deshacer(editor);
System.out.println(editor.getContenido()); // "Hola "
historial.deshacer(editor);
System.out.println(editor.getContenido()); // ""
historial.rehacer(editor);
System.out.println(editor.getContenido()); // "Hola "
```

## Observer

Define una dependencia uno-a-muchos entre objetos, de modo que cuando un objeto cambie su estado, todos sus dependientes sean notificados automáticamente.

### Estructura

```
┌──────────────────┐       ┌──────────────────┐
│   Subject        │       │   <<interface>>   │
├──────────────────┤       │    Observer      │
│ - observers      │       ├──────────────────┤
│ + attach(obs)    │──────▷│ + update(data)   │
│ + detach(obs)    │       └──────────────────┘
│ + notify()       │                ▲
└──────────────────┘                │
                                    │
                           ┌──────────────────┐
                           │  ConcreteObserver│
                           ├──────────────────┤
                           │ + update(data)   │
                           └──────────────────┘
```

### Ejemplo: Sistema de Noticias

```java
// Observer interface
public interface Observador {
    void actualizar(String noticia);
}

// Subject
public class AgenciaNoticias {
    private List<Observador> observadores = new ArrayList<>();
    private String ultimaNoticia;

    public void agregarObservador(Observador obs) {
        observadores.add(obs);
    }

    public void eliminarObservador(Observador obs) {
        observadores.remove(obs);
    }

    public void publicarNoticia(String noticia) {
        this.ultimaNoticia = noticia;
        notificarObservadores();
    }

    private void notificarObservadores() {
        for (Observador obs : observadores) {
            obs.actualizar(ultimaNoticia);
        }
    }
}

// Observadores concretos
public class CanalNoticias implements Observador {
    private String nombre;

    public CanalNoticias(String nombre) {
        this.nombre = nombre;
    }

    public void actualizar(String noticia) {
        System.out.println(nombre + " recibe: " + noticia);
    }
}

public class EmailNotificador implements Observador {
    private String email;

    public EmailNotificador(String email) {
        this.email = email;
    }

    public void actualizar(String noticia) {
        System.out.println("Enviando email a " + email + " con noticia: " + noticia);
    }
}

// Uso
AgenciaNoticias agencia = new AgenciaNoticias();
agencia.agregarObservador(new CanalNoticias("CNN"));
agencia.agregarObservador(new CanalNoticias("BBC"));
agencia.agregarObservador(new EmailNotificador("user@email.com"));
agencia.publicarNoticia("¡Nueva tecnología lanzada!");
```

### Observer en Spring

```java
@Component
public class PedidoEventPublisher {
    @Autowired
    private ApplicationEventPublisher publisher;

    public void pedidoCreado(Pedido pedido) {
        publisher.publishEvent(new PedidoCreadoEvent(pedido));
    }
}

@Component
public class NotificacionListener {
    @EventListener
    public void handlePedidoCreado(PedidoCreadoEvent event) {
        System.out.println("Notificación: " + event.getPedido().getId());
    }
}
```

### Observer en React

```jsx
// useEffect + EventEmitter
useEffect(() => {
    const handler = (data) => setData(data);
    eventEmitter.on('data-update', handler);
    return () => eventEmitter.off('data-update', handler);
}, []);
```

## State

Permite que un objeto altere su comportamiento cuando su estado interno cambia. Parecerá que el objeto cambió su clase.

### Estructura

```
┌──────────────────┐       ┌──────────────────┐
│     Context      │──────▷│   <<interface>>   │
├──────────────────┤       │     State        │
│ - state          │       ├──────────────────┤
│ + request()      │       │ + handle(context)│
└──────────────────┘       └──────────────────┘
         ▲                           ▲
         │                           │
         │                           ├──────────────┐
         │                   ┌──────────┐   ┌──────────┐
         │                   │ StateA   │   │  StateB  │
         │                   ├──────────┤   ├──────────┤
         └───────────────────│ + handle │   │ + handle │
                             └──────────┘   └──────────┘
```

### Ejemplo: Máquina Expendedora

```java
// State interface
public interface EstadoMaquina {
    void insertarMoneda();
    void seleccionarProducto();
    void dispensar();
    void devolverMoneda();
}

// Context
public class MaquinaExpendedora {
    private EstadoMaquina estado;
    private int inventario = 5;

    public MaquinaExpendedora() {
        estado = new EstadoEsperando(this);
    }

    void setEstado(EstadoMaquina estado) {
        this.estado = estado;
    }

    boolean tieneInventario() {
        return inventario > 0;
    }

    void dispensarProducto() {
        inventario--;
        System.out.println("Producto dispensado. Quedan: " + inventario);
    }

    public void insertarMoneda() { estado.insertarMoneda(); }
    public void seleccionarProducto() { estado.seleccionarProducto(); }
    public void dispensar() { estado.dispensar(); }
    public void devolverMoneda() { estado.devolverMoneda(); }
}

// Estados concretos
public class EstadoEsperando implements EstadoMaquina {
    private MaquinaExpendedora maquina;

    public EstadoEsperando(MaquinaExpendedora m) { this.maquina = m; }

    public void insertarMoneda() {
        System.out.println("Moneda insertada");
        maquina.setEstado(new EstadoConMoneda(maquina));
    }

    public void seleccionarProducto() {
        System.out.println("Inserte moneda primero");
    }

    public void dispensar() {
        System.out.println("Inserte moneda primero");
    }

    public void devolverMoneda() {
        System.out.println("No hay moneda para devolver");
    }
}

public class EstadoConMoneda implements EstadoMaquina {
    private MaquinaExpendedora maquina;

    public EstadoConMoneda(MaquinaExpendedora m) { this.maquina = m; }

    public void insertarMoneda() {
        System.out.println("Ya hay una moneda insertada");
    }

    public void seleccionarProducto() {
        if (maquina.tieneInventario()) {
            System.out.println("Producto seleccionado");
            maquina.setEstado(new EstadoDispensando(maquina));
        } else {
            System.out.println("Sin inventario");
            maquina.devolverMoneda();
            maquina.setEstado(new EstadoEsperando(maquina));
        }
    }

    public void dispensar() {
        System.out.println("Seleccione producto primero");
    }

    public void devolverMoneda() {
        System.out.println("Moneda devuelta");
        maquina.setEstado(new EstadoEsperando(maquina));
    }
}

public class EstadoDispensando implements EstadoMaquina {
    private MaquinaExpendedora maquina;

    public EstadoDispensando(MaquinaExpendedora m) { this.maquina = m; }

    public void insertarMoneda() { System.out.println("Espere, dispensando..."); }
    public void seleccionarProducto() { System.out.println("Espere, dispensando..."); }

    public void dispensar() {
        maquina.dispensarProducto();
        maquina.setEstado(new EstadoEsperando(maquina));
    }

    public void devolverMoneda() { System.out.println("No se puede devolver mientras dispensa"); }
}
```
