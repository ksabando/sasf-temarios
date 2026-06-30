---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M07 — Comportamiento: Chain of Responsibility y Command

## Ejercicio 1: Chain para Middleware HTTP

**Solución esperada**:

```java
class PeticionHTTP {
    String ip; String token; String ruta; String metodo;
    PeticionHTTP(String ip, String token, String ruta, String metodo) {
        this.ip=ip; this.token=token; this.ruta=ruta; this.metodo=metodo;
    }
}

class RespuestaHTTP {
    int status; String body;
    RespuestaHTTP(int s, String b) { status=s; body=b; }
}

abstract class Middleware {
    protected Middleware siguiente;
    Middleware setSiguiente(Middleware m) { this.siguiente=m; return m; }
    abstract boolean procesar(PeticionHTTP req, RespuestaHTTP res);
    boolean siguiente(PeticionHTTP req, RespuestaHTTP res) {
        if (siguiente == null) return true;
        return siguiente.procesar(req, res);
    }
}

class AutenticacionMiddleware extends Middleware {
    boolean procesar(PeticionHTTP req, RespuestaHTTP res) {
        if (req.token == null || req.token.isBlank()) {
            res.status = 401; res.body = "No autorizado"; return false;
        }
        System.out.println("Autenticación OK");
        return siguiente(req, res);
    }
}

class LoggingMiddleware extends Middleware {
    boolean procesar(PeticionHTTP req, RespuestaHTTP res) {
        System.out.println("[LOG] " + req.metodo + " " + req.ruta + " desde " + req.ip);
        return siguiente(req, res);
    }
}

class RateLimitMiddleware extends Middleware {
    private Map<String, Integer> contador = new HashMap<>();
    boolean procesar(PeticionHTTP req, RespuestaHTTP res) {
        int count = contador.getOrDefault(req.ip, 0) + 1;
        contador.put(req.ip, count);
        if (count > 10) { res.status = 429; res.body = "Too Many Requests"; return false; }
        System.out.println("Rate limit OK (" + count + "/10)");
        return siguiente(req, res);
    }
}

// Uso
Middleware chain = new AutenticacionMiddleware();
chain.setSiguiente(new LoggingMiddleware())
     .setSiguiente(new RateLimitMiddleware());

RespuestaHTTP res = new RespuestaHTTP(200, "");
PeticionHTTP req = new PeticionHTTP("192.168.1.1", "jwt-token", "/api/data", "GET");
chain.procesar(req, res);
System.out.println("Status: " + res.status);
```

**Posibles mejoras**:
- **Inyectar la cadena con Factory**: crear un `MiddlewareFactory` que construya la cadena desde configuración (archivo `.properties` o YAML) en lugar de hardcodearla. Esto permite que operaciones cambie el orden o agregue/quiten middlewares sin recompilar, similar a cómo Spring configura `SecurityFilterChain` con `HttpSecurity`.
- **Agregar CORS middleware**: implementar `CORSMiddleware` que agregue headers `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods` y maneje preflight `OPTIONS` requests retornando 200 sin pasar al siguiente middleware. Esto muestra cómo Chain puede manejar requests transversales sin modificar los middlewares de negocio.
- **Manejo estructurado de errores con Result monádico**: en lugar de mutar `res.status` y `res.body`, devolver un `Result<RespuestaHTTP, Error>` donde cada middleware hace `flatMap` al siguiente. Si algún middleware retorna `Error(401, "No autorizado")`, la cadena se corta y el error se propaga. Esto es más funcional y facilita el testing.

## Ejercicio 2: Command para Editor de Texto

**Solución esperada**:

```java
class EditorTexto { // Receiver
    private StringBuilder texto = new StringBuilder();
    void escribir(String t) { texto.append(t); }
    void borrar(int n) {
        int len = texto.length();
        texto.delete(Math.max(0, len - n), len);
    }
    String getTexto() { return texto.toString(); }
}

interface Comando { void ejecutar(); void deshacer(); }

class EscribirComando implements Comando {
    private EditorTexto editor; private String texto;
    EscribirComando(EditorTexto e, String t) { editor=e; texto=t; }
    public void ejecutar() { editor.escribir(texto); }
    public void deshacer() { editor.borrar(texto.length()); }
}

class BorrarComando implements Comando {
    private EditorTexto editor; private int caracteres;
    private String textoBorrado;
    BorrarComando(EditorTexto e, int n) { editor=e; caracteres=n; }
    public void ejecutar() {
        String completo = editor.getTexto();
        textoBorrado = completo.substring(Math.max(0, completo.length() - caracteres));
        editor.borrar(caracteres);
    }
    public void deshacer() { editor.escribir(textoBorrado); }
}

class HistorialComandos {
    private Stack<Comando> historial = new Stack<>();
    void ejecutar(Comando cmd) { cmd.ejecutar(); historial.push(cmd); }
    void deshacer() {
        if (!historial.isEmpty()) historial.pop().deshacer();
    }
}

// Demo
EditorTexto editor = new EditorTexto();
HistorialComandos hist = new HistorialComandos();
hist.ejecutar(new EscribirComando(editor, "Hola "));
hist.ejecutar(new EscribirComando(editor, "Mundo"));
System.out.println(editor.getTexto()); // Hola Mundo
hist.deshacer();
System.out.println(editor.getTexto()); // Hola
hist.deshacer();
System.out.println(editor.getTexto()); // (vacío)
```

**Posibles mejoras**:
- **Agregar soporte para redo**: mantener un `Stack<Comando> redoStack` en `HistorialComandos`. Cuando se ejecuta un nuevo comando, `redoStack.clear()`. `rehacer()` popea de `redoStack`, ejecuta el comando y lo pushea en `historial`. Esto implementa el clásico Ctrl+Y con el comportamiento correcto de invalidar la historia futura en cada nueva acción.
- **MacroComando transaccional**: implementar `MacroComando` que ejecute una lista de comandos. Si alguno falla, hacer rollback (deshacer en orden inverso los que ya se ejecutaron). Esto requiere que cada `Comando.ejecutar()` declare `throws Exception` o use un try-catch en el macro. Es la base para implementar transacciones a nivel de aplicación.
- **Command con lambda**: para comandos simples, permitir que `HistorialComandos` acepte lambdas: `hist.ejecutar(() -> editor.escribir("Hola"), () -> editor.borrar(4))`. Esto elimina la necesidad de crear clases `ConcreteCommand` para cada operación, reduciendo boilerplate. Similar a cómo `UndoManager.addEdit(UndoableEdit)` en Swing.

## Ejercicio 3: Chain para Validación de Pedidos

**Solución esperada**:

```java
class Pedido { String id; String cliente; List<String> items; double total; String direccion; }
class ResultadoValidacion { boolean valido; List<String> errores = new ArrayList<>(); }

abstract class ValidadorPedido {
    protected ValidadorPedido siguiente;
    ValidadorPedido setSiguiente(ValidadorPedido v) { this.siguiente=v; return v; }
    abstract void validar(Pedido p, ResultadoValidacion r);
    void siguiente(Pedido p, ResultadoValidacion r) { if (siguiente != null) siguiente.validar(p, r); }
}

class ClienteValidoValidator extends ValidadorPedido {
    void validar(Pedido p, ResultadoValidacion r) {
        if (p.cliente == null || p.cliente.isBlank()) {
            r.valido = false; r.errores.add("Cliente obligatorio");
        }
        siguiente(p, r);
    }
}

class ItemsValidosValidator extends ValidadorPedido {
    void validar(Pedido p, ResultadoValidacion r) {
        if (p.items == null || p.items.isEmpty()) {
            r.valido = false; r.errores.add("Debe tener al menos 1 item");
        }
        siguiente(p, r);
    }
}

class TotalValidoValidator extends ValidadorPedido {
    void validar(Pedido p, ResultadoValidacion r) {
        if (p.total <= 0) { r.valido = false; r.errores.add("Total debe ser positivo"); }
        siguiente(p, r);
    }
}

class DireccionValidaValidator extends ValidadorPedido {
    void validar(Pedido p, ResultadoValidacion r) {
        if (p.direccion == null || p.direccion.isBlank()) {
            r.valido = false; r.errores.add("Dirección obligatoria");
        }
        siguiente(p, r);
    }
}

// Uso
ValidadorPedido v = new ClienteValidoValidator();
v.setSiguiente(new ItemsValidosValidator()).setSiguiente(new TotalValidoValidator()).setSiguiente(new DireccionValidaValidator());

Pedido p = new Pedido(); p.cliente = "Juan"; p.items = List.of("Laptop"); p.total = 1500; p.direccion = "Calle 123";
ResultadoValidacion res = new ResultadoValidacion(); res.valido = true;
v.validar(p, res);
System.out.println(res.valido + " " + res.errores); // true []
```

**Posibles mejoras**:
- **Acumular todos los errores**: actualmente la cadena siempre llama a `siguiente()` incluso si ya encontró un error. Esto es correcto para Chain (acumula todos los errores, no cortocircuita). Agregar un modo `failFast` con `boolean failFast` en el validador base: si `failFast == true` y `r.valido == false`, no llamar a `siguiente()`, devolviendo el primer error encontrado (útil para formularios web que muestran errores uno a uno).
- **Validator con reglas inyectables**: en lugar de subclases concretas para cada regla, usar `ValidadorPedido` con una lista de `Predicate<Pedido>` + mensaje de error: `new ValidadorPedido().agregarRegla(p -> p.cliente != null, "Cliente obligatorio").agregarRegla(...)`. Esto reduce la explosión de clases y permite definir reglas en configuración o BD.
- **Internacionalización de mensajes de error**: usar `MessageSource` de Spring o `ResourceBundle` para que los mensajes "Cliente obligatorio" estén en múltiples idiomas. Cada validador recibe un `Locale` y resuelve el mensaje con la clave `validacion.cliente.obligatorio`.

## Ejercicio 4: Command para Sistema de Archivos

**Solución esperada**:

```java
class SistemaArchivos {
    private Set<String> archivos = new HashSet<>(Arrays.asList("base.txt"));
    void crear(String nombre) { archivos.add(nombre); System.out.println("Creado: " + nombre); }
    void eliminar(String nombre) { archivos.remove(nombre); System.out.println("Eliminado: " + nombre); }
    void renombrar(String old, String nuevo) {
        archivos.remove(old); archivos.add(nuevo);
        System.out.println("Renombrado: " + old + " -> " + nuevo);
    }
    boolean existe(String n) { return archivos.contains(n); }
}

interface ComandoFS { void ejecutar(); void deshacer(); }

class CrearArchivoCommand implements ComandoFS {
    private SistemaArchivos fs; private String nombre;
    CrearArchivoCommand(SistemaArchivos fs, String n) { this.fs=fs; this.nombre=n; }
    public void ejecutar() { fs.crear(nombre); }
    public void deshacer() { fs.eliminar(nombre); }
}

class EliminarArchivoCommand implements ComandoFS {
    private SistemaArchivos fs; private String nombre;
    EliminarArchivoCommand(SistemaArchivos fs, String n) { this.fs=fs; this.nombre=n; }
    public void ejecutar() { fs.eliminar(nombre); }
    public void deshacer() { fs.crear(nombre); }
}

class RenombrarArchivoCommand implements ComandoFS {
    private SistemaArchivos fs; private String oldName; private String newName;
    RenombrarArchivoCommand(SistemaArchivos fs, String o, String n) { this.fs=fs; this.oldName=o; this.newName=n; }
    public void ejecutar() { fs.renombrar(oldName, newName); }
    public void deshacer() { fs.renombrar(newName, oldName); }
}

class GestorArchivos {
    private Stack<ComandoFS> historial = new Stack<>();
    void ejecutar(ComandoFS cmd) { cmd.ejecutar(); historial.push(cmd); }
    void deshacer() { if (!historial.isEmpty()) historial.pop().deshacer(); }
}

// Demo
SistemaArchivos fs = new SistemaArchivos();
GestorArchivos gestor = new GestorArchivos();
gestor.ejecutar(new CrearArchivoCommand(fs, "nuevo.txt"));
gestor.ejecutar(new RenombrarArchivoCommand(fs, "nuevo.txt", "editado.txt"));
gestor.deshacer(); // vuelve a nuevo.txt
gestor.deshacer(); // elimina nuevo.txt
```

**Posibles mejoras**:
- **Validación previa en Command**: `EliminarArchivoCommand.ejecutar()` debería verificar que el archivo existe (`fs.existe(nombre)`) antes de eliminarlo. Si no existe, lanzar `NoSuchFileException`. `deshacer()` de `CrearArchivoCommand` también debería verificar si ya existe (el archivo pudo ser recreado manualmente después del create).
- **Persistencia del historial de comandos**: serializar el `historial` a un archivo JSON o una BD embebida (SQLite) para sobrevivir crashes del sistema. En el arranque, cargar el historial y reconstruir el estado. Esto requiere que cada `ComandoFS` sea serializable con `toJSON()` y `fromJSON()`.
- **Comandos asíncronos con notificación**: para operaciones lentas (ej. `CopiarArchivoCommand` que copia archivos grandes), que `ejecutar()` devuelva un `Future<Resultado>` o acepte un callback `onComplete`. El `GestorArchivos` solo pushea en el historial cuando la operación se completa exitosamente. Esto evita que `deshacer()` intente revertir una operación que nunca terminó.

