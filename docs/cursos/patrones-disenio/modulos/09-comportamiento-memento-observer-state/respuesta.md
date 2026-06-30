---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M09 — Comportamiento: Memento, Observer y State

## Ejercicio 1: Editor con Undo/Redo (Memento extendido)

**Solución esperada**:

```java
class EstadoEditor {
    final String texto; final boolean negrita, cursiva, subrayado;
    EstadoEditor(String t, boolean n, boolean c, boolean s) {
        texto=t; negrita=n; cursiva=c; subrayado=s;
    }
}

class EditorCompleto {
    private StringBuilder texto = new StringBuilder();
    private boolean negrita, cursiva, subrayado;

    void escribir(String t) { texto.append(t); }
    void toggleNegrita() { negrita = !negrita; }
    void toggleCursiva() { cursiva = !cursiva; }
    void toggleSubrayado() { subrayado = !subrayado; }

    EstadoEditor crearEstado() {
        return new EstadoEditor(texto.toString(), negrita, cursiva, subrayado);
    }

    void restaurar(EstadoEditor e) {
        texto = new StringBuilder(e.texto);
        negrita = e.negrita; cursiva = e.cursiva; subrayado = e.subrayado;
    }

    void mostrar() {
        System.out.println("Texto: '" + texto + "' [N:" + negrita + " C:" + cursiva + " S:" + subrayado + "]");
    }
}

class HistorialLimitado {
    private static final int MAX = 20;
    private Stack<EstadoEditor> undo = new Stack<>();
    private Stack<EstadoEditor> redo = new Stack<>();

    void guardar(EditorCompleto e) {
        undo.push(e.crearEstado());
        if (undo.size() > MAX) undo.remove(0);
        redo.clear();
    }

    void deshacer(EditorCompleto e) {
        if (undo.isEmpty()) return;
        redo.push(e.crearEstado());
        e.restaurar(undo.pop());
    }

    void rehacer(EditorCompleto e) {
        if (redo.isEmpty()) return;
        undo.push(e.crearEstado());
        e.restaurar(redo.pop());
    }

    void limpiar() { undo.clear(); redo.clear(); }
}
```

**Posibles mejoras**:
- **Memento incremental con Command**: en lugar de guardar el estado completo del editor en cada cambio, guardar el delta: `TextoInsertado(texto, posición)`, `NegritaToggle()`. Esto reduce drásticamente la memoria del historial para documentos grandes (500+ páginas), a costa de mayor complejidad en la lógica de undo/redo.
- **Persistencia del historial**: serializar los `EstadoEditor` a un archivo JSON usando Jackson o Gson. Al cargar el editor, restaurar el último estado desde disco y reconstruir los stacks de undo/redo. Esto permite que el editor sobreviva a un crash y el usuario no pierda su historial de cambios.
- **Soporte para branching de historial (similar a Git)**: permitir que el usuario vuelva a un estado anterior, haga cambios nuevos, y el historial anterior se preserve en una rama. `HistorialLimitado` pasaría a ser un árbol de `EstadoEditor` con punteros `padre` y `rama`, permitiendo navegar entre líneas de tiempo alternativas.

## Ejercicio 2: Máquina Expendedora Completa (State)

**Solución esperada**:

```java
interface EstadoME {
    void insertarMoneda(double monto);
    void seleccionarProducto(String producto);
    void dispensar();
    void devolverMoneda();
    void reabastecer(int cantidad);
}

class MaquinaExpendedora2 {
    private EstadoME estado;
    Map<String, Integer> inventario = new HashMap<>(Map.of("Coca", 5, "Agua", 3, "Jugo", 2));
    Map<String, Double> precios = Map.of("Coca", 2.0, "Agua", 1.5, "Jugo", 2.5);
    double monedaInsertada = 0;
    double cambioDisponible = 10;

    MaquinaExpendedora2() { estado = new Esperando(this); }
    void setEstado(EstadoME e) { this.estado = e; }
    void insertarMoneda(double m) { estado.insertarMoneda(m); }
    void seleccionarProducto(String p) { estado.seleccionarProducto(p); }
    void dispensar() { estado.dispensar(); }
    void devolverMoneda() { estado.devolverMoneda(); }
    void reabastecer(int c) { estado.reabastecer(c); }
}

class Esperando implements EstadoME {
    MaquinaExpendedora2 m;
    Esperando(MaquinaExpendedora2 m) { this.m = m; }
    public void insertarMoneda(double monto) {
        m.monedaInsertada = monto;
        System.out.println("Moneda: $" + monto);
        m.setEstado(new ConMoneda(m));
    }
    public void seleccionarProducto(String p) { System.out.println("Inserte moneda"); }
    public void dispensar() { System.out.println("Inserte moneda"); }
    public void devolverMoneda() { System.out.println("Sin moneda"); }
    public void reabastecer(int n) { /* agrega stock */ }
}

class ConMoneda implements EstadoME {
    MaquinaExpendedora2 m;
    ConMoneda(MaquinaExpendedora2 m) { this.m = m; }
    public void insertarMoneda(double monto) { System.out.println("Ya insertó moneda"); }
    public void seleccionarProducto(String prod) {
        if (!m.inventario.containsKey(prod) || m.inventario.get(prod) <= 0) {
            System.out.println("Producto agotado"); return;
        }
        double precio = m.precios.get(prod);
        if (m.monedaInsertada < precio) {
            System.out.println("Saldo insuficiente. Faltan $" + (precio - m.monedaInsertada));
            return;
        }
        double cambio = m.monedaInsertada - precio;
        if (cambio > 0 && cambio > m.cambioDisponible) {
            System.out.println("Sin cambio. Use monto exacto");
            return;
        }
        m.monedaInsertada = 0;
        m.cambioDisponible -= cambio;
        m.inventario.merge(prod, -1, Integer::sum);
        System.out.println("Producto dispensado. Cambio: $" + cambio);
        m.setEstado(new Esperando(m));
    }
    public void dispensar() { System.out.println("Seleccione producto"); }
    public void devolverMoneda() { System.out.println("Devolviendo $" + m.monedaInsertada); m.monedaInsertada=0; m.setEstado(new Esperando(m)); }
    public void reabastecer(int n) { System.out.println("Reabastecido"); }
}
```

**Posibles mejoras**:
- **Agregar estado SinCambio**: cuando `cambioDisponible` llega a 0, transicionar a un estado `SinCambio` que solo acepta montos exactos. Cuando se reabastece con cambio, vuelve a `Esperando`. Esto es un estado real en máquinas expendedoras y muestra cómo los estados modelan restricciones del mundo real.
- **Singleton para estados**: `Esperando`, `ConMoneda`, `SinCambio` pueden ser Singletons compartidos entre todas las máquinas expendedoras (o usar un `Map<String, MaquinaExpendedora2>` para máquinas múltiples). Esto evita crear nuevos objetos de estado en cada transición y reduce garbage collection.
- **Persistencia del estado entre reinicios**: serializar el estado actual (`estado.getClass().getSimpleName()`) y los valores (`inventario`, `cambioDisponible`) a un archivo. Al reiniciar la máquina, cargar el archivo y restaurar el estado correcto. Esto simula cómo una máquina real mantiene su estado a través de cortes de energía.

## Ejercicio 3: Sistema de Alertas (Observer)

**Solución esperada**:

```java
interface ObservadorAlerta {
    void actualizar(String servidor, String metrica, double valor, double umbral);
}

class ServidorMonitor {
    private List<ObservadorAlerta> observadores = new ArrayList<>();
    private double cpu, memoria, disco;
    private double cpuMax = 90, memMax = 85, discoMax = 90;

    void agregarObservador(ObservadorAlerta o) { observadores.add(o); }
    void eliminarObservador(ObservadorAlerta o) { observadores.remove(o); }

    void setMetricas(double cpu, double mem, double disco) {
        this.cpu = cpu; this.memoria = mem; this.disco = disco;
        verificarAlertas();
    }

    private void verificarAlertas() {
        if (cpu > cpuMax) notificar("CPU", cpu, cpuMax);
        if (memoria > memMax) notificar("MEMORIA", memoria, memMax);
        if (disco > discoMax) notificar("DISCO", disco, discoMax);
    }

    private void notificar(String metrica, double valor, double umbral) {
        for (ObservadorAlerta o : observadores)
            o.actualizar("Server-01", metrica, valor, umbral);
    }
}

class EmailAlerta implements ObservadorAlerta {
    public void actualizar(String sv, String m, double v, double u) {
        System.out.println("[EMAIL] Alerta " + m + " en " + sv + ": " + v + "% (umbral: " + u + "%)");
    }
}

class LoggerAlerta implements ObservadorAlerta {
    public void actualizar(String sv, String m, double v, double u) {
        System.out.println("[LOG] " + java.time.LocalDateTime.now() + " " + sv + " " + m + "=" + v);
    }
}

// Demo
ServidorMonitor monitor = new ServidorMonitor();
monitor.agregarObservador(new EmailAlerta());
monitor.agregarObservador(new LoggerAlerta());
monitor.setMetricas(95, 70, 80); // alerta CPU
```

**Posibles mejoras**:
- **Observer con filtro de interés**: cada `ObservadorAlerta` declara en qué métricas está interesado (`Set<String> metricasInteres`). Al notificar, el Subject solo itera sobre los observadores cuyo filtro incluya la métrica activada. Esto evita que `LoggerAlerta` reciba alertas de CPU cuando solo le interesa memoria.
- **Notificación asíncrona con ThreadPool**: en lugar de iterar sincrónicamente (bloqueando al Subject mientras se procesan las alertas), usar un `ExecutorService` que despache cada notificación a un thread separado. Si un observador (ej. email) es lento, no afecta a los demás ni al Subject. Agregar un `CompletableFuture.allOf()` para manejar timeouts.
- **Cooldown por alerta**: no notificar la misma métrica más de una vez cada 5 minutos aunque siga por encima del umbral. `ServidorMonitor` mantiene un `Map<String, Instant>` con el último momento de notificación por métrica. Esto evita floods de alertas y es un requisito estándar en sistemas de monitoreo real (Prometheus Alertmanager).

## Ejercicio 4: Reproductor Multimedia (State)

**Solución esperada**:

```java
interface EstadoReproductor {
    void play(); void pause(); void stop(); void lock(); void unlock();
}

class Reproductor {
    EstadoReproductor estado = new Detenido(this);
    void setEstado(EstadoReproductor e) { estado = e; }
    void play() { estado.play(); }
    void pause() { estado.pause(); }
    void stop() { estado.stop(); }
    void lock() { estado.lock(); }
    void unlock() { estado.unlock(); }
    void mostrarEstado() { System.out.println("Estado actual: " + estado.getClass().getSimpleName()); }
}

class Detenido implements EstadoReproductor {
    Reproductor r;
    Detenido(Reproductor r) { this.r = r; }
    public void play() { System.out.println("Reproduciendo"); r.setEstado(new Reproduciendo(r)); }
    public void pause() { System.out.println("Sin reproducción"); }
    public void stop() { System.out.println("Ya detenido"); }
    public void lock() { System.out.println("Bloqueado"); r.setEstado(new Bloqueado(r)); }
    public void unlock() { System.out.println("Ya desbloqueado"); }
}

class Reproduciendo implements EstadoReproductor {
    Reproductor r;
    Reproduciendo(Reproductor r) { this.r = r; }
    public void play() { System.out.println("Ya reproduciendo"); }
    public void pause() { System.out.println("Pausado"); r.setEstado(new Pausado(r)); }
    public void stop() { System.out.println("Detenido"); r.setEstado(new Detenido(r)); }
    public void lock() { System.out.println("Bloqueado"); r.setEstado(new Bloqueado(r)); }
    public void unlock() { System.out.println("Ya desbloqueado"); }
}

class Pausado implements EstadoReproductor {
    Reproductor r;
    Pausado(Reproductor r) { this.r = r; }
    public void play() { System.out.println("Reanudando"); r.setEstado(new Reproduciendo(r)); }
    public void pause() { System.out.println("Ya pausado"); }
    public void stop() { System.out.println("Detenido"); r.setEstado(new Detenido(r)); }
    public void lock() { System.out.println("Bloqueado"); r.setEstado(new Bloqueado(r)); }
    public void unlock() { System.out.println("Ya desbloqueado"); }
}

class Bloqueado implements EstadoReproductor {
    Reproductor r;
    Bloqueado(Reproductor r) { this.r = r; }
    public void play() { System.out.println("Desbloquee primero"); }
    public void pause() { System.out.println("Desbloquee primero"); }
    public void stop() { System.out.println("Desbloquee primero"); }
    public void lock() { System.out.println("Ya bloqueado"); }
    public void unlock() { System.out.println("Desbloqueado"); r.setEstado(new Detenido(r)); }
}
```

**Posibles mejoras**:
- **Usar estados como Singleton**: `Detenido`, `Reproduciendo`, `Pausado`, `Bloqueado` pueden ser Singletons compartidos porque no tienen estado propio (solo referencia al `Reproductor`). Esto evita la creación de objetos en cada transición y es la implementación recomendada por GoF.
- **Diagrama de transiciones con State Machine DSL**: crear un enum `Transicion { PLAY, PAUSE, STOP, LOCK, UNLOCK }` y una `StateMachine` que defina explícitamente las transiciones válidas: `machine.add(Reproduciendo, PAUSE, Pausado)`. Validar transiciones con la máquina en lugar de en cada estado, centralizando la lógica de transiciones.
- **Agregar estado Buffering**: entre `Detenido` y `Reproduciendo`, insertar un estado `Buffering` que simule la carga del stream. Después de X segundos (simulado con `CompletableFuture.delayedExecutor()`), transiciona automáticamente a `Reproduciendo`. Esto modela reproductores reales como YouTube o Spotify.

