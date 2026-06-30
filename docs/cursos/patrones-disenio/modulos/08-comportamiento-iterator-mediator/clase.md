---
sidebar_label: "Clase"
---

# Módulo 08 — Iterator y Mediator

## Iterator

Proporciona una forma de acceder secuencialmente a los elementos de una colección sin exponer su estructura interna.

### Estructura

```
┌──────────────────┐       ┌──────────────────┐
│   <<interface>>   │       │   <<interface>>   │
│  Iterable<T>     │       │  Iterator<T>      │
├──────────────────┤       ├──────────────────┤
│ + iterator()     │──────▷│ + hasNext()      │
└──────────────────┘       │ + next()         │
         ▲                 │ + remove()       │
         │                 └──────────────────┘
┌──────────────────┐
│  ConcreteCollection│
├──────────────────┤
│ + iterator()     │
└──────────────────┘
```

### Iterator en Java

```java
// Interfaz base del JDK
public interface Iterable<T> {
    Iterator<T> iterator();
}

public interface Iterator<T> {
    boolean hasNext();
    T next();
    default void remove() { throw new UnsupportedOperationException(); }
}
```

### Ejemplo: Iterador para Árbol Binario

```java
public class ArbolBinario<T extends Comparable<T>> implements Iterable<T> {
    private Nodo raiz;

    private class Nodo {
        T valor;
        Nodo izquierdo, derecho;
        Nodo(T valor) { this.valor = valor; }
    }

    public void insertar(T valor) {
        raiz = insertarRec(raiz, valor);
    }

    private Nodo insertarRec(Nodo nodo, T valor) {
        if (nodo == null) return new Nodo(valor);
        if (valor.compareTo(nodo.valor) < 0)
            nodo.izquierdo = insertarRec(nodo.izquierdo, valor);
        else if (valor.compareTo(nodo.valor) > 0)
            nodo.derecho = insertarRec(nodo.derecho, valor);
        return nodo;
    }

    @Override
    public Iterator<T> iterator() {
        return new IteradorInOrder();
    }

    private class IteradorInOrder implements Iterator<T> {
        private Stack<Nodo> pila = new Stack<>();
        private Nodo actual = raiz;

        IteradorInOrder() {
            while (actual != null) {
                pila.push(actual);
                actual = actual.izquierdo;
            }
        }

        @Override
        public boolean hasNext() {
            return !pila.isEmpty();
        }

        @Override
        public T next() {
            Nodo nodo = pila.pop();
            actual = nodo.derecho;
            while (actual != null) {
                pila.push(actual);
                actual = actual.izquierdo;
            }
            return nodo.valor;
        }
    }
}

// Uso
ArbolBinario<Integer> arbol = new ArbolBinario<>();
arbol.insertar(5); arbol.insertar(3); arbol.insertar(7);
arbol.insertar(1); arbol.insertar(9);

for (int valor : arbol) {
    System.out.print(valor + " "); // 1 3 5 7 9
}
```

### Iterator en JDK

```java
// for-each usa Iterator implícitamente
List<String> lista = Arrays.asList("A", "B", "C");
for (String s : lista) {
    System.out.println(s);
}

// Equivalente explícito
Iterator<String> it = lista.iterator();
while (it.hasNext()) {
    System.out.println(it.next());
}

// Stream API también usa iteración interna
lista.stream().filter(s -> s.startsWith("A")).forEach(System.out::println);
```

## Mediator

Reduce las dependencias directas entre objetos, centralizando la comunicación a través de un objeto mediador.

### Estructura

```
┌──────────────────┐
│   <<interface>>   │
│     Mediator     │
├──────────────────┤
│ + notificar(emisor, evento)│
└──────────────────┘
         ▲
         │
┌──────────────────┐
│  MediatorConcreto │
├──────────────────┤
│ + notificar(...)  │
└──────────────────┘
         │
         │ comunica
         ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Colega1        │  │   Colega2        │  │   Colega3        │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Ejemplo: Sala de Chat

```java
// Mediador
public interface SalaChat {
    void enviar(String mensaje, Usuario emisor);
    void agregarUsuario(Usuario usuario);
}

// Mediador concreto
public class SalaChatConcreta implements SalaChat {
    private List<Usuario> usuarios = new ArrayList<>();

    public void agregarUsuario(Usuario usuario) {
        usuarios.add(usuario);
        usuario.setSala(this);
    }

    public void enviar(String mensaje, Usuario emisor) {
        for (Usuario usuario : usuarios) {
            // El emisor no recibe su propio mensaje
            if (usuario != emisor) {
                usuario.recibir(mensaje, emisor.getNombre());
            }
        }
    }
}

// Colega
public abstract class Usuario {
    protected String nombre;
    protected SalaChat sala;

    public Usuario(String nombre) { this.nombre = nombre; }
    public void setSala(SalaChat sala) { this.sala = sala; }
    public String getNombre() { return nombre; }

    public abstract void recibir(String mensaje, String de);

    public void enviar(String mensaje) {
        System.out.println(this.nombre + " envía: " + mensaje);
        sala.enviar(mensaje, this);
    }
}

// Colegas concretos
public class UsuarioNormal extends Usuario {
    public UsuarioNormal(String nombre) { super(nombre); }
    public void recibir(String msg, String de) {
        System.out.println(nombre + " recibe de " + de + ": " + msg);
    }
}

public class UsuarioAdmin extends Usuario {
    public UsuarioAdmin(String nombre) { super(nombre); }
    public void recibir(String msg, String de) {
        System.out.println("[ADMIN] " + nombre + " recibe de " + de + ": " + msg);
    }
}

// Uso
SalaChat sala = new SalaChatConcreta();
Usuario ana = new UsuarioNormal("Ana");
Usuario luis = new UsuarioNormal("Luis");
Usuario admin = new UsuarioAdmin("Admin");

sala.agregarUsuario(ana);
sala.agregarUsuario(luis);
sala.agregarUsuario(admin);

ana.enviar("Hola a todos!");
luis.enviar("Hola Ana!");
```

### Mediator en Spring

```java
// ApplicationEventPublisher actúa como mediador
@Component
public class PedidoService {
    @Autowired
    private ApplicationEventPublisher publisher;

    public void crearPedido(Pedido pedido) {
        // lógica de negocio
        publisher.publishEvent(new PedidoCreadoEvent(pedido));
    }
}

@Component
public class NotificadorService {
    @EventListener
    public void onPedidoCreado(PedidoCreadoEvent event) {
        // enviar notificación
    }
}
```

### Mediator en React

```jsx
// Context API actúa como mediador
const AuthContext = React.createContext();

function App() {
    const [user, setUser] = useState(null);
    return (
        <AuthContext.Provider value={{ user, setUser }}>
            <ComponenteA /> {/* puede cambiar usuario */}
            <ComponenteB /> {/* puede leer usuario */}
        </AuthContext.Provider>
    );
}
```

### Iterator vs Mediator

| Aspecto | Iterator | Mediator |
|---------|----------|----------|
| Propósito | Acceder a colecciones | Centralizar comunicación |
| Dirección | Unidireccional (cliente → colección) | Bidireccional (entre colegas) |
| Acoplamiento | Bajo (cliente conoce iterator) | Medio (colegas conocen mediador) |
| Ejemplo típico | for-each, Stream API | Sala de chat, controlador MVC |
