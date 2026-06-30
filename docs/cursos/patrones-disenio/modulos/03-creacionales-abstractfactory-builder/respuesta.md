---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M03 — Creacionales: Abstract Factory y Builder

## Ejercicio 1: Abstract Factory para Componentes UI

**Solución esperada**:

```java
// Productos abstractos
public interface Boton { void render(); }
public interface Ventana { void mostrar(); }

// Productos Light
class BotonLight implements Boton {
    public void render() { System.out.println("[Light] Botón blanco con texto negro"); }
}
class VentanaLight implements Ventana {
    public void mostrar() { System.out.println("[Light] Ventana con fondo blanco"); }
}

// Productos Dark
class BotonDark implements Boton {
    public void render() { System.out.println("[Dark] Botón negro con texto blanco"); }
}
class VentanaDark implements Ventana {
    public void mostrar() { System.out.println("[Dark] Ventana con fondo negro"); }
}

// Fábrica abstracta
public interface FabricaUI {
    Boton crearBoton();
    Ventana crearVentana();
}

class FabricaLight implements FabricaUI {
    public Boton crearBoton() { return new BotonLight(); }
    public Ventana crearVentana() { return new VentanaLight(); }
}

class FabricaDark implements FabricaUI {
    public Boton crearBoton() { return new BotonDark(); }
    public Ventana crearVentana() { return new VentanaDark(); }
}

// Renderer
class UIRenderer {
    private final FabricaUI fabrica;
    UIRenderer(FabricaUI f) { this.fabrica = f; }
    void renderizar() {
        Boton b = fabrica.crearBoton();
        Ventana v = fabrica.crearVentana();
        b.render();
        v.mostrar();
    }
}
```

**Posibles mejoras**:
- Agregar un **Registry dinámico** con `ServiceLoader` para descubrir fábricas en el classpath automáticamente: cada `FabricaUI` se registra en `META-INF/services/FabricaUI`, y `UIRenderer` selecciona la fábrica por nombre o anotación, eliminando el acoplamiento a las clases concretas `FabricaLight` y `FabricaDark`.
- Incorporar **Bridge** para separar la plataforma de renderizado de los componentes: `Boton` y `Ventana` tendrían una referencia a `MotorRenderizado` (Swing, JavaFX, Web), permitiendo que temas y plataformas varíen independientemente (combinación de Abstract Factory + Bridge).
- Agregar **Cache de productos flyweight**: si los botones y ventanas del mismo tema son idénticos, usar un `Map<Class, Object>` dentro de cada fábrica para retornar siempre la misma instancia de botón/ventana del tema, reduciendo consumo de memoria cuando hay cientos de componentes en pantalla.

## Ejercicio 2: Builder para —rdenes de Compra

**Solución esperada**:

```java
import java.time.LocalDate;
import java.util.*;

public class OrdenCompra {
    private final String id;
    private final String cliente;
    private final LocalDate fecha;
    private final String direccion;
    private final String notas;
    private final double descuento;
    private final List<String> items;

    private OrdenCompra(Builder b) {
        this.id = b.id; this.cliente = b.cliente; this.fecha = b.fecha;
        this.direccion = b.direccion; this.notas = b.notas;
        this.descuento = b.descuento;
        this.items = Collections.unmodifiableList(b.items);
    }

    public static class Builder {
        private String id; private String cliente; private LocalDate fecha;
        private String direccion = ""; private String notas = "";
        private double descuento = 0.0;
        private List<String> items = new ArrayList<>();

        public Builder id(String id) { this.id = id; return this; }
        public Builder cliente(String c) { this.cliente = c; return this; }
        public Builder fecha(LocalDate f) { this.fecha = f; return this; }
        public Builder direccion(String d) { this.direccion = d; return this; }
        public Builder notas(String n) { this.notas = n; return this; }
        public Builder descuento(double d) { this.descuento = d; return this; }
        public Builder addItem(String i) { this.items.add(i); return this; }
        public OrdenCompra build() {
            if (id == null || cliente == null || fecha == null) {
                throw new IllegalStateException("Faltan campos obligatorios");
            }
            return new OrdenCompra(this);
        }
    }
}
```

**Posibles mejoras**:
- Implementar un **Step Builder** con interfaces encadenadas para forzar en tiempo de compilación que los campos obligatorios (`id`, `cliente`, `fecha`) se seteen: `OrdenCompra.StepId.id("OC-001").cliente("Ana").fecha(LocalDate.now())...`, eliminando la validación en runtime con `build()`.
- Agregar un método `toBuilder()` en `OrdenCompra` que devuelva un `Builder` pre-poblado con los valores actuales, facilitando la creación de copias con modificaciones parciales (útil para operaciones de edición, similar al patrón de `Protobuf.Builder`).
- Incorporar **Strategy** para la validación en `build()`: en lugar de `if` anidados, usar una lista de `Validator<Builder>` inyectables que permitan agregar reglas de negocio sin modificar el Builder (OCP). Por ejemplo, `DescuentoMaximoValidator` impone que `descuento < total * 0.5`.

## Ejercicio 3: Prototype para Templates de Notificaciones

**Solución esperada**:

```java
import java.util.*;

public class PlantillaNotificacion implements Cloneable {
    private String asunto;
    private String cuerpo;
    private String remitente;
    private List<String> destinatarios;

    public PlantillaNotificacion(String asunto, String cuerpo, String remitente) {
        this.asunto = asunto; this.cuerpo = cuerpo;
        this.remitente = remitente;
        this.destinatarios = new ArrayList<>();
    }

    @Override
    public PlantillaNotificacion clone() {
        try {
            PlantillaNotificacion clon = (PlantillaNotificacion) super.clone();
            clon.destinatarios = new ArrayList<>(this.destinatarios);
            return clon;
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }

    public void addDestinatario(String email) { destinatarios.add(email); }
    public void setCuerpo(String cuerpo) { this.cuerpo = cuerpo; }
    // getters...
}

class FabricaPlantillas {
    private static final Map<String, PlantillaNotificacion> plantillas = new HashMap<>();
    static {
        plantillas.put("Bienvenida", new PlantillaNotificacion(
            "Bienvenido!", "Gracias por registrarte.", "noreply@empresa.com"));
        plantillas.put("Promocion", new PlantillaNotificacion(
            "Oferta especial", "Descuento del 20% en tu próxima compra.", "ofertas@empresa.com"));
    }
    public static PlantillaNotificacion getPlantilla(String nombre) {
        return plantillas.get(nombre).clone();
    }
}
```

**Posibles mejoras**:
- Reemplazar `Cloneable` por un **Copy Constructor** (`public PlantillaNotificacion(PlantillaNotificacion original)`) que haga deep copy explícita de `destinatarios`, siguiendo la recomendación de _Effective Java_ (Item 13) de evitar `Cloneable` por su diseño roto (interfaz marcadora sin método `clone()` declarado).
- Implementar **Registry + Prototype Manager**: `FabricaPlantillas` puede cargar plantillas desde un archivo YAML/JSON en classpath, eliminando la inicialización estática hardcodeada y permitiendo que operaciones agregue/modifique plantillas en caliente sin recompilar.
- Agregar **Template Method** en `PlantillaNotificacion` para la personalización: un método `personalizar(Map<String, String> variables)` que reemplaza placeholders `{{nombre}}`, `{{producto}}` en `asunto` y `cuerpo`, usando el prototipo clonado como base inmutable y aplicando variables específicas por envío.

## Ejercicio 4: Builder Fluent para Consultas SQL

**Solución esperada**:

```java
import java.util.*;

public class QueryBuilder {
    private List<String> select = new ArrayList<>();
    private String from;
    private String where;
    private String orderBy;
    private String orderDir = "ASC";
    private int limit = -1;

    public QueryBuilder select(String... cols) {
        this.select.addAll(Arrays.asList(cols)); return this;
    }
    public QueryBuilder from(String table) { this.from = table; return this; }
    public QueryBuilder where(String condition) { this.where = condition; return this; }
    public QueryBuilder orderBy(String col, String dir) {
        this.orderBy = col; this.orderDir = dir; return this;
    }
    public QueryBuilder limit(int n) { this.limit = n; return this; }

    public String build() {
        if (select.isEmpty()) throw new IllegalStateException("SELECT requerido");
        if (from == null) throw new IllegalStateException("FROM requerido");
        StringBuilder sql = new StringBuilder("SELECT ");
        sql.append(String.join(", ", select));
        sql.append(" FROM ").append(from);
        if (where != null) sql.append(" WHERE ").append(where);
        if (orderBy != null) sql.append(" ORDER BY ").append(orderBy).append(" ").append(orderDir);
        if (limit > 0) sql.append(" LIMIT ").append(limit);
        return sql.toString();
    }
}
```

**Posibles mejoras**:
- Agregar **protección contra SQL injection** mediante **PreparedStatement Builder** que genere consultas parametrizadas: en lugar de concatenar valores directamente en `where(String)`, usar `where(String column, Object value)` que almacena el valor en un `List<Object>` separado y genera `WHERE columna = ?`. En `build()`, devolver un objeto compuesto `ParameterizedQuery(sql, params)`.
- Implementar **JOIN support** con un sub-builder `join(String table, String onCondition)` que permita múltiples joins con type safety, similar a JPA Criteria API. Cada join retorna el builder principal para mantener la fluidez de la API.
- Separar el Builder de dialectos SQL con **Strategy**: `QueryBuilder` acepta un `SQLDialect` (MySQL, PostgreSQL, Oracle) que formatea `LIMIT`/`OFFSET`/`TOP` según la base de datos. Así el mismo builder produce SQL compatible con distintos motores sin modificar la lógica de construcción.

