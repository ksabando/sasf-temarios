---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M06 — Estructurales: Facade, Flyweight y Proxy

## Ejercicio 1: Facade para Reserva de Viajes

**Solución esperada**:

```java
class ReservaRequest {
    String origen, destino, fecha, hotel, tarjeta, email;
    ReservaRequest(String o, String d, String f, String h, String t, String e) {
        origen=o; destino=d; fecha=f; hotel=h; tarjeta=t; email=e;
    }
}

class VuelosService {
    boolean buscarVuelo(String origen, String destino, String fecha) {
        System.out.println("Buscando vuelo " + origen + " -> " + destino + " el " + fecha);
        return true;
    }
    String reservar(String origen, String destino, String fecha) {
        System.out.println("Reservando vuelo...");
        return "VUELO— + System.currentTimeMillis();
    }
}

class HotelesService {
    boolean buscarHotel(String hotel, String fecha) {
        System.out.println("Buscando hotel " + hotel + " para " + fecha);
        return true;
    }
    String reservar(String hotel, String fecha) {
        System.out.println("Reservando hotel...");
        return "HOTEL— + System.currentTimeMillis();
    }
}

class PagosService {
    String procesarPago(double monto, String tarjeta) {
        System.out.println("Procesando pago de $" + monto + " con tarjeta " + tarjeta);
        return "PAGO— + System.currentTimeMillis();
    }
}

class ReservaViajeFacade {
    private VuelosService vuelos = new VuelosService();
    private HotelesService hoteles = new HotelesService();
    private PagosService pagos = new PagosService();

    public void reservarViaje(ReservaRequest req) {
        System.out.println("===== Iniciando reserva de viaje =====");
        if (!vuelos.buscarVuelo(req.origen, req.destino, req.fecha)) {
            throw new RuntimeException("Vuelo no disponible");
        }
        if (!hoteles.buscarHotel(req.hotel, req.fecha)) {
            throw new RuntimeException("Hotel no disponible");
        }
        String idVuelo = vuelos.reservar(req.origen, req.destino, req.fecha);
        String idHotel = hoteles.reservar(req.hotel, req.fecha);
        String idPago = pagos.procesarPago(500.0, req.tarjeta);
        System.out.println("Viaje reservado: Vuelo=" + idVuelo + ", Hotel=" + idHotel + ", Pago=" + idPago);
        System.out.println("Confirmación enviada a " + req.email);
    }
}
```

**Posibles mejoras**:
- **Inyectar dependencias en lugar de `new`**: recibir `VuelosService`, `HotelesService`, `PagosService` por constructor. Esto permite mockear cada subsistema en tests unitarios y cambiar implementaciones (ej. `MockVuelosService` para desarrollo local) sin modificar la Facade.
- **Agregar Saga Pattern con compensación**: si la reserva de hotel falla después de haber reservado el vuelo, la Facade debe deshacer la reserva del vuelo (`vuelos.cancelar(idVuelo)`). Esto transforma la Facade en un orquestador de saga, garantizando consistencia eventual en operaciones distribuidas.
- **Devolver un DTO en lugar de void y System.out**: `reservarViaje()` debería devolver un `ReservaConfirmacion` con `idVuelo`, `idHotel`, `idPago` y `fechaConfirmacion`. Esto permite que el cliente procese la respuesta programáticamente (enviar email desde el cliente, registrar en BD) en lugar de solo imprimir en consola.

## Ejercicio 2: Proxy Virtual para Galería

**Solución esperada**:

```java
interface ImagenGaleria { void mostrar(); }

class ImagenHD implements ImagenGaleria {
    private String nombre;
    ImagenHD(String n) {
        this.nombre = n;
        System.out.println("Cargando HD: " + n + " (3s)...");
        try { Thread.sleep(3000); } catch (InterruptedException ignored) { }
    }
    public void mostrar() { System.out.println("Mostrando imagen HD: " + nombre); }
}

class ImagenProxy implements ImagenGaleria {
    private String nombre;
    private ImagenHD real;
    ImagenProxy(String n) { this.nombre = n; }
    public void mostrar() {
        if (real == null) real = new ImagenHD(nombre);
        real.mostrar();
    }
}

class Galeria {
    private List<ImagenGaleria> imagenes = new ArrayList<>();
    void addImagen(String nombre) { imagenes.add(new ImagenProxy(nombre)); }
    void mostrarTodas() {
        for (ImagenGaleria img : imagenes) img.mostrar();
    }
}

// Demo
Galeria galeria = new Galeria();
galeria.addImagen("vacaciones.jpg");
galeria.addImagen("familia.jpg");
galeria.addImagen("mascota.jpg");
System.out.println("Galería lista (imágenes aún no cargadas)");
galeria.mostrarTodas();
```

**Posibles mejoras**:
- **Agregar thumbnail como placeholder inmediato**: el `ImagenProxy` podría tener un `byte[] thumbnail` de baja resolución (cargado inmediatamente en el constructor desde metadata o archivo separado). `mostrar()` primero muestra el thumbnail instantáneamente y luego carga la HD en background con `CompletableFuture.runAsync()` para una UX más fluida.
- **Implementar Proxy de protección además de virtual**: si la galería tiene imágenes con restricciones de edad o suscripción, el `ImagenProxy` verifica `usuario.getNivelAcceso()` antes de cargar la imagen HD. Si el acceso es denegado, muestra un placeholder "Acceso restringido" sin cargar la imagen costosa.
- **Cache LRU para imágenes ya cargadas**: si la galería tiene 50 imágenes pero solo se muestran 10 a la vez, mantener un `LinkedHashMap<String, ImagenHD>` con `removeEldestEntry()` para descargar imágenes no vistas recientemente y liberar memoria. Esto es Flyweight + Proxy combinados.

## Ejercicio 3: Flyweight para Bosque

**Solución esperada**:

```java
class TipoArbol { // Flyweight (intrínseco)
    final String nombre; final String textura; final String color;
    TipoArbol(String n, String t, String c) { nombre=n; textura=t; color=c; }
}

class Arbol { // Contexto con estado extrínseco
    final int x, y; final double altura;
    final TipoArbol tipo;
    Arbol(int x, int y, double h, TipoArbol t) { this.x=x; this.y=y; this.altura=h; this.tipo=t; }
    void renderizar() {
        System.out.println("Árbol " + tipo.nombre + " en (" + x + "," + y + ") altura=" + altura + " (" + tipo.color + ")");
    }
}

class FabricaArboles {
    private static final Map<String, TipoArbol> tipos = new HashMap<>();
    static TipoArbol getTipoArbol(String nombre, String textura, String color) {
        return tipos.computeIfAbsent(nombre, k -> {
            System.out.println("Nuevo tipo de árbol: " + nombre);
            return new TipoArbol(nombre, textura, color);
        });
    }
    static int getCantidadTipos() { return tipos.size(); }
}

class Bosque {
    private List<Arbol> arboles = new ArrayList<>();
    void plantarArbol(int x, int y, double h, String nombre, String tx, String color) {
        TipoArbol tipo = FabricaArboles.getTipoArbol(nombre, tx, color);
        arboles.add(new Arbol(x, y, h, tipo));
    }
    void renderizar() { arboles.forEach(Arbol::renderizar); }
}

// Demo
Bosque bosque = new Bosque();
Random rnd = new Random();
for (int i = 0; i < 1000; i++) {
    String[] tipos = {"Roble", "Pino", "Sauce"};
    String t = tipos[rnd.nextInt(3)];
    bosque.plantarArbol(rnd.nextInt(100), rnd.nextInt(100), rnd.nextDouble()*10, t, "rugosa", t.equals("Roble")?"verde":"verde-oscuro");
}
System.out.println("Total árboles: 1000");
System.out.println("Tipos únicos (Flyweight): " + FabricaArboles.getCantidadTipos());
```

**Posibles mejoras**:
- **Hacer la FabricaArboles no-estática e inyectable**: los métodos `static` dificultan el testing y la configuración. Convertir `FabricaArboles` en una clase con scope `singleton` en Spring o en un bean manual con `getInstance()`. Esto permite cambiar la fábrica en tests (ej. `FabricaArbolesMock` que devuelva tipos predefinidos).
- **Agregar estado intrínseco adicional con Builder**: si `TipoArbol` tiene muchos parámetros (nombre, textura, color, alturaMaxima, tipoHoja, resistenciaHeladas...), usar un `TipoArbolBuilder` para la construcción y que la clave del `Map` sea un hash compuesto de todos los parámetros intrínsecos, no solo el nombre. Así `Roble` con textura "rugosa" es distinto de `Roble` con textura "lisa".
- **Implementar Flyweight con WeakReference para GC automático**: usar `WeakHashMap` o `Map<String, WeakReference<TipoArbol>>` para que los tipos de árboles que dejan de usarse puedan ser garbage collected. En una simulación donde se crean y destruyen bosques dinámicamente, esto evita memory leaks de flyweights huérfanos.

## Ejercicio 4: Proxy de Protección para Documentos

**Solución esperada**:

```java
enum Rol { ADMIN, EDITOR, LECTOR }

class Usuario {
    final String nombre; final Rol rol;
    Usuario(String n, Rol r) { nombre=n; rol=r; }
}

interface Documento {
    String leer();
    void escribir(String contenido);
}

class DocumentoReal implements Documento {
    private String contenido = "";
    public String leer() { return contenido; }
    public void escribir(String c) { this.contenido = c; }
}

class ProxyDocumento implements Documento {
    private DocumentoReal real = new DocumentoReal();
    private Usuario usuario;
    ProxyDocumento(Usuario u) { this.usuario = u; }

    public String leer() {
        return real.leer();
    }

    public void escribir(String contenido) {
        if (usuario.rol == Rol.LECTOR) {
            throw new SecurityException("LECTOR no puede escribir documentos");
        }
        real.escribir(contenido);
        System.out.println(usuario.nombre + " escribió el documento");
    }
}

// Demo
Usuario admin = new Usuario("Ana", Rol.ADMIN);
Usuario lector = new Usuario("Luis", Rol.LECTOR);

Documento docAdmin = new ProxyDocumento(admin);
docAdmin.escribir("Contenido secreto");
System.out.println("Admin lee: " + docAdmin.leer());

Documento docLector = new ProxyDocumento(lector);
try {
    docLector.escribir("Intento de escritura");
} catch (SecurityException e) {
    System.out.println("Acceso denegado: " + e.getMessage());
}
System.out.println("Lector lee: " + docLector.leer());
```

**Posibles mejoras**:
- **Permisos granulares con Strategy**: en lugar de `if (usuario.rol == Rol.LECTOR)`, usar un `PermissionChecker` con método `canWrite(Usuario, Documento)`. Esto permite reglas complejas (ADMIN puede escribir siempre, EDITOR solo documentos propios, LECTOR nunca) sin modificar el Proxy cuando se agregan roles.
- **Auditoría con Proxy adicional**: crear un `AuditProxyDocumento` que envuelva `ProxyDocumento` y registre cada lectura y escritura con timestamp y usuario en un log o BD. Esto muestra cómo los proxies se pueden apilar: `AuditProxy` → `ProtectionProxy` → `DocumentoReal`. La cadena de proxies es similar a Decorator pero con propósito de control de acceso/auditoría, no de agregar funcionalidad.
- **Caché de lecturas con ttl**: si el documento es muy grande y se lee frecuentemente, `ProxyDocumento` podría cachear el contenido leído con un timestamp. Si `leer()` se llama dentro de los 5 segundos siguientes, devuelve el cache sin acceder al objeto real. Al escribir, invalida el cache. Esto es un Proxy de Caché combinado con Proxy de Protección.

