---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M08 — Comportamiento: Iterator y Mediator

## Ejercicio 1: Iterador DFS para Árbol N-ario

**Solución esperada**:

```java
class Nodo<T> {
    T valor;
    List<Nodo<T>> hijos = new ArrayList<>();
    Nodo(T valor) { this.valor = valor; }
    void addHijo(Nodo<T> hijo) { hijos.add(hijo); }
}

class ArbolNario<T> implements Iterable<T> {
    private Nodo<T> raiz;
    ArbolNario(Nodo<T> raiz) { this.raiz = raiz; }

    @Override
    public Iterator<T> iterator() {
        return new IteradorDFS();
    }

    private class IteradorDFS implements Iterator<T> {
        private Stack<Nodo<T>> pila = new Stack<>();

        IteradorDFS() {
            if (raiz != null) pila.push(raiz);
        }

        @Override
        public boolean hasNext() { return !pila.isEmpty(); }

        @Override
        public T next() {
            Nodo<T> nodo = pila.pop();
            // Agregar hijos en reverso para mantener orden
            List<Nodo<T>> hijos = nodo.hijos;
            for (int i = hijos.size() - 1; i >= 0; i--) {
                pila.push(hijos.get(i));
            }
            return nodo.valor;
        }
    }
}

// Demo
Nodo<String> raiz = new Nodo<>("A");
Nodo<String> b = new Nodo<>("B"); raiz.addHijo(b);
Nodo<String> c = new Nodo<>("C"); raiz.addHijo(c);
Nodo<String> d = new Nodo<>("D"); raiz.addHijo(d);
b.addHijo(new Nodo<>("E"));
b.addHijo(new Nodo<>("F"));
c.addHijo(new Nodo<>("G"));

ArbolNario<String> arbol = new ArbolNario<>(raiz);
for (String val : arbol) System.out.print(val + " "); // A B E F C G D
```

**Posibles mejoras**:
- **Implementar BFS con Queue**: crear un `IteradorBFS` que use `Queue<Nodo<T>>` en lugar de `Stack`. `hasNext()` verifica `!cola.isEmpty()`, `next()` hace `dequeue`, agrega los hijos al final de la cola. Esto permite recorrer el árbol nivel por nivel (A, B, C, D, E, F, G) con el mismo `ArbolNario`, solo cambiando el iterador retornado por `iteratorBFS()`.
- **Usar Strategy para los tipos de recorrido**: extraer la lógica de recorrido en una interfaz `RecorridoStrategy<T>` con métodos `inicializar(Nodo<T>)` y `siguiente()`. El `IteradorArbol` recibe la estrategia en el constructor. Así `ArbolNario` puede devolver `new IteradorArbol<>(raiz, new PreOrderStrategy<>())` o `new PostOrderStrategy<>()` sin duplicar código.
- **Agregar soporte para `remove()` con detach**: implementar `Iterator.remove()` que elimine el último nodo devuelto de la lista de hijos de su padre. Esto requiere que el iterador mantenga una referencia al nodo actual, al padre, y al índice en los hijos. Es la operación inversa de `addHijo()`, útil para podar árboles durante el recorrido.

## Ejercicio 2: Mediator para Torre de Control

**Solución esperada**:

```java
abstract class Avion {
    protected String nombre;
    protected TorreControl torre;
    Avion(String n, TorreControl t) { nombre=n; torre=t; }
    abstract void solicitarAterrizaje();
    abstract void solicitarDespegue();
    abstract void recibirAutorizacion(String accion);
}

class AvionComercial extends Avion {
    AvionComercial(String n, TorreControl t) { super(n, t); }
    void solicitarAterrizaje() { torre.solicitarAterrizaje(this); }
    void solicitarDespegue() { torre.solicitarDespegue(this); }
    void recibirAutorizacion(String accion) {
        System.out.println(nombre + " autorizado para " + accion);
    }
}

class TorreControl {
    private int pistasDisponibles = 2;
    private Queue<Avion> colaAterrizaje = new LinkedList<>();
    private Queue<Avion> colaDespegue = new LinkedList<>();

    synchronized void solicitarAterrizaje(Avion avion) {
        if (pistasDisponibles > 0) {
            pistasDisponibles--;
            avion.recibirAutorizacion("ATERRIZAR");
            new Thread(() -> {
                try { Thread.sleep(3000); } catch (InterruptedException ignored) { }
                liberarPista();
            }).start();
        } else {
            System.out.println(avion + " en espera para aterrizar");
            colaAterrizaje.add(avion);
        }
    }

    synchronized void solicitarDespegue(Avion avion) {
        if (pistasDisponibles > 0) {
            pistasDisponibles--;
            avion.recibirAutorizacion("DESPEGAR");
            new Thread(() -> {
                try { Thread.sleep(2000); } catch (InterruptedException ignored) { }
                liberarPista();
            }).start();
        } else {
            System.out.println(avion + " en espera para despegar");
            colaDespegue.add(avion);
        }
    }

    private synchronized void liberarPista() {
        pistasDisponibles++;
        if (!colaAterrizaje.isEmpty()) colaAterrizaje.poll().recibirAutorizacion("ATERRIZAR");
        else if (!colaDespegue.isEmpty()) colaDespegue.poll().recibirAutorizacion("DESPEGAR");
    }
}
```

**Posibles mejoras**:
- **Prioridad para aterrizajes (seguridad aérea real)**: `liberarPista()` siempre favorece aterrizajes sobre despegues si ambos esperan. Implementar con `PriorityQueue<Avion>` donde el `Comparator` da mayor prioridad a aviones con poco combustible y aterrizajes de emergencia. Esto modela mejor el mundo real donde un avión en aire es más crítico que uno en tierra.
- **Agregar notificación de eventos al resto de aviones**: cuando un avión recibe autorización, `TorreControl` debería notificar a todos los demás aviones en espera su posición en cola. Esto requiere que `Avion` tenga un método `actualizarPosicionEnCola(int posicion)` y que el Mediator emita actualizaciones a cada cambio de cola.
- **Implementar condiciones climáticas como estado del Mediator**: agregar un `enum Clima { DESPEJADO, NUBLADO, TORMENTA }` en `TorreControl`. Con `TORMENTA`, `pistasDisponibles` baja temporalmente y `solicitarDespegue()` se rechaza directamente. Cuando el clima mejora, el Mediator notifica a todos los aviones en espera. El clima cambia con un `ScheduledExecutorService` simulando reportes meteorológicos.

## Ejercicio 3: Iterador en Espiral para Matriz

**Solución esperada**:

```java
class MatrizEspiral implements Iterable<Integer> {
    private int[][] matriz;

    MatrizEspiral(int[][] m) { this.matriz = m; }

    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<>() {
            private int top = 0, bottom = matriz.length - 1;
            private int left = 0, right = matriz[0].length - 1;
            private int estado = 0; // 0:->, 1:DOWN, 2:<-, 3:UP
            private int fila = 0, col = 0;

            @Override
            public boolean hasNext() {
                return top <= bottom && left <= right;
            }

            @Override
            public Integer next() {
                int valor = matriz[fila][col];
                switch (estado) {
                    case 0: // ->
                        if (col == right) { top++; fila++; estado = 1; }
                        else col++;
                        break;
                    case 1: // DOWN
                        if (fila == bottom) { right--; col--; estado = 2; }
                        else fila++;
                        break;
                    case 2: // <-
                        if (col == left) { bottom--; fila--; estado = 3; }
                        else col--;
                        break;
                    case 3: // UP
                        if (fila == top) { left++; col++; estado = 0; }
                        else fila--;
                        break;
                }
                return valor;
            }
        };
    }
}

// Demo
int[][] m = {{1,2,3,4},{5,6,7,8},{9,10,11,12}};
for (int v : new MatrizEspiral(m)) System.out.print(v + " ");
// 1 2 3 4 8 12 11 10 9 5 6 7
```

**Posibles mejoras**:
- **Soporte para matrices no rectangulares**: agregar `if` al inicio de `next()` para detectar el caso borde (matriz con una sola fila y múltiples columnas, o viceversa) y ajustar los límites y estado en consecuencia. La implementación actual asume que la matriz es rectangular (todas las filas tienen la misma cantidad de columnas).
- **Máquina de estados con enum en lugar de int**: definir `enum Direccion { DERECHA, ABAJO, IZQUIERDA, ARRIBA }` con un método `Direccion siguiente()` y `void mover(int[] pos, int[] limites)`. El `switch(estado)` con ints mágicos es propenso a errores; un enum documenta las transiciones y permite unit testing del comportamiento de cada dirección.
- **Agregar iterador inverso (anti-espiral)**: implementar `IteradorAntiEspiral` que recorre de afuera hacia adentro pero en sentido anti-horario. Esto demuestra que la estructura `MatrizEspiral` puede producir múltiples tipos de iteradores sin modificar su representación interna — la esencia del patrón Iterator.

## Ejercicio 4: Mediator para Formulario

**Solución esperada**:

```java
abstract class ComponenteForm {
    protected MediadorFormulario mediador;
    void setMediador(MediadorFormulario m) { this.mediador = m; }
}

class TextField extends ComponenteForm {
    private String valor; private String nombre;
    TextField(String nombre) { this.nombre = nombre; }
    void setValor(String v) { this.valor = v; mediador.notificar(this, "cambio"); }
    String getValor() { return valor; }
    String getNombre() { return nombre; }
}

class Checkbox extends ComponenteForm {
    private boolean seleccionado;
    void setSeleccionado(boolean s) { this.seleccionado = s; mediador.notificar(this, "cambio"); }
    boolean isSeleccionado() { return seleccionado; }
}

class Boton extends ComponenteForm {
    private boolean habilitado = false;
    void setHabilitado(boolean h) { this.habilitado = h; }
    boolean isHabilitado() { return habilitado; }
}

class MediadorFormulario {
    private TextField txtNombre, txtEmail;
    private Checkbox chkTerminos;
    private Boton btnSubmit;

    void registrarComponentes(TextField n, TextField e, Checkbox c, Boton b) {
        this.txtNombre = n; this.txtEmail = e; this.chkTerminos = c; this.btnSubmit = b;
        n.setMediador(this); e.setMediador(this); c.setMediador(this); b.setMediador(this);
    }

    void notificar(ComponenteForm emisor, String evento) {
        boolean nombreOk = txtNombre.getValor() != null && !txtNombre.getValor().isBlank();
        boolean emailOk = txtEmail.getValor() != null && txtEmail.getValor().contains("@");
        boolean terminosOk = chkTerminos.isSeleccionado();
        btnSubmit.setHabilitado(nombreOk && emailOk && terminosOk);
        System.out.println("Formulario: nombre=" + nombreOk + " email=" + emailOk + " terminos=" + terminosOk + " submit=" + btnSubmit.isHabilitado());
    }
}

// Demo
TextField nombre = new TextField("nombre");
TextField email = new TextField("email");
Checkbox terminos = new Checkbox();
Boton submit = new Boton();

MediadorFormulario m = new MediadorFormulario();
m.registrarComponentes(nombre, email, terminos, submit);

nombre.setValor("Juan");    // submit: false (falta email y términos)
email.setValor("juan@mail"); // submit: false (faltan términos)
terminos.setSeleccionado(true); // submit: true
```

**Posibles mejoras**:
- **Validación con Strategy en lugar de if anidados**: en `notificar()`, en lugar de validar con `if` directamente, usar una lista de `ValidadorCampo`: `List.of(new EmailValidoValidator(txtEmail), new NombreNoVacioValidator(txtNombre))`. Cada validador retorna un `ResultadoValidacion` y el Mediador compila todos los resultados. Si algún validador falla, marca el campo con `setEstadoError(mensaje)` para feedback visual.
- **Agregar dependencias entre campos**: si el formulario tiene un `Checkbox "¿Dirección de envío diferente?"` que revela campos adicionales (`txtDireccionEnvio`). El Mediator, al recibir la notificación del checkbox, muestra/oculta los campos de dirección y los agrega/quita de las validaciones. Esto muestra cómo el Mediator maneja lógica condicional compleja sin que el checkbox conozca los campos de dirección.
- **Soporte para múltiples formularios con Factory de Mediadores**: si la app tiene varios formularios (registro, checkout, perfil), cada uno con distintos campos y reglas, crear un `MediadorFormularioFactory` que construya el Mediator y sus componentes según una configuración (JSON o builder). Esto evita duplicar la lógica de `registrarComponentes` y `notificar` para cada formulario.

