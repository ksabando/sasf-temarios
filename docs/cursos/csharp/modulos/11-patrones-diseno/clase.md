---
sidebar_label: "Clase"
---

## 1. Patrones Creacionales

### Factory Method

```csharp
public interface INotificador
{
    void Enviar(string mensaje);
}

public class EmailNotificador : INotificador
{
    public void Enviar(string mensaje) => Console.WriteLine($"[EMAIL] {mensaje}");
}

public class SmsNotificador : INotificador
{
    public void Enviar(string mensaje) => Console.WriteLine($"[SMS] {mensaje}");
}

public static class NotificadorFactory
{
    public static INotificador Crear(TipoNotificacion tipo) => tipo switch
    {
        TipoNotificacion.Email => new EmailNotificador(),
        TipoNotificacion.Sms => new SmsNotificador(),
        _ => throw new ArgumentException($"Tipo no soportado: {tipo}")
    };
}
```

### Singleton

```csharp
public sealed class Configuracion
{
    private static readonly Lazy<Configuracion> _instancia =
        new(() => new Configuracion());

    public static Configuracion Instancia => _instancia.Value;

    private Configuracion()
    {
        // Cargar configuracion
    }

    public string ConnectionString { get; } = "Server=...";
}
```

### Builder

```csharp
public class ProductoBuilder
{
    private string _nombre = string.Empty;
    private decimal _precio;
    private int _stock;
    private string? _descripcion;

    public ProductoBuilder ConNombre(string nombre) { _nombre = nombre; return this; }
    public ProductoBuilder ConPrecio(decimal precio) { _precio = precio; return this; }
    public ProductoBuilder ConStock(int stock) { _stock = stock; return this; }
    public ProductoBuilder ConDescripcion(string desc) { _descripcion = desc; return this; }

    public Producto Build()
    {
        var p = new Producto(_nombre, _precio, _stock);
        // asignar descripcion si aplica...
        return p;
    }
}

// Uso
var producto = new ProductoBuilder()
    .ConNombre("Laptop Gamer")
    .ConPrecio(25000m)
    .ConStock(5)
    .Build();
```

---

## 2. Patrones Estructurales

### Adapter

Permite que dos interfaces incompatibles trabajen juntas.

```csharp
// Interfaz existente (legacy)
public class ProveedorExterno
{
    public string ObtenerDatosXml() => "<producto><nombre>Mouse</nombre></producto>";
}

// Interfaz esperada
public interface IProveedorProductos
{
    Producto ObtenerProducto();
}

// Adapter
public class ProveedorAdapter : IProveedorProductos
{
    private readonly ProveedorExterno _proveedor;

    public ProveedorAdapter(ProveedorExterno proveedor)
    {
        _proveedor = proveedor;
    }

    public Producto ObtenerProducto()
    {
        var xml = _proveedor.ObtenerDatosXml();
        // parsear XML y convertir a Producto
        return new Producto("Mouse", 25m, 100);
    }
}
```

### Decorator

Agrega comportamiento a un objeto sin modificar su clase.

```csharp
public interface IProductoRepository
{
    Producto? Obtener(int id);
}

public class ProductoRepository : IProductoRepository
{
    public Producto? Obtener(int id) => /* consulta base */ null;
}

// Decorator para cache
public class ProductoRepositoryCache : IProductoRepository
{
    private readonly IProductoRepository _inner;
    private readonly Dictionary<int, Producto> _cache = new();

    public ProductoRepositoryCache(IProductoRepository inner) => _inner = inner;

    public Producto? Obtener(int id)
    {
        if (_cache.TryGetValue(id, out var producto))
            return producto;

        producto = _inner.Obtener(id);
        if (producto is not null) _cache[id] = producto;
        return producto;
    }
}
```

---

## 3. Patrones de Comportamiento

### Strategy

Permite intercambiar algoritmos en tiempo de ejecucion.

```csharp
public interface ICalculadorImpuesto
{
    decimal Calcular(decimal monto);
}

public class IvaEstandar : ICalculadorImpuesto
{
    public decimal Calcular(decimal monto) => monto * 0.21m;
}

public class IvaReducido : ICalculadorImpuesto
{
    public decimal Calcular(decimal monto) => monto * 0.10m;
}

public class Factura
{
    private readonly ICalculadorImpuesto _calculador;

    public Factura(ICalculadorImpuesto calculador) => _calculador = calculador;

    public decimal CalcularTotal(decimal subtotal)
        => subtotal + _calculador.Calcular(subtotal);
}
```

### Observer (con eventos de C#)

```csharp
public class SujetoObservable
{
    public event EventHandler<string>? Notificacion;

    public void Ejecutar()
    {
        // logica...
        Notificacion?.Invoke(this, "Accion ejecutada");
    }
}

public class Observador
{
    public Observador(SujetoObservable sujeto)
    {
        sujeto.Notificacion += (s, msg) => Console.WriteLine($"Recibido: {msg}");
    }
}
```

---

## 4. Repository Pattern

```csharp
public interface IRepositorio<T>
{
    Task<T?> ObtenerPorIdAsync(int id);
    Task<List<T>> ObtenerTodosAsync();
    Task AgregarAsync(T entidad);
    Task ActualizarAsync(T entidad);
    Task EliminarAsync(int id);
}

public class RepositorioProducto : IRepositorio<Producto>
{
    private readonly List<Producto> _datos = new();

    public Task<Producto?> ObtenerPorIdAsync(int id) =>
        Task.FromResult(_datos.FirstOrDefault(p => p.Id == id));

    public Task<List<Producto>> ObtenerTodosAsync() =>
        Task.FromResult(_datos.ToList());

    public Task AgregarAsync(Producto producto)
    {
        _datos.Add(producto);
        return Task.CompletedTask;
    }

    // ...
}
```

---

## 5. Dependency Injection Manual vs Contenedor

```csharp
// Sin DI (acoplamiento fuerte)
public class PedidoService
{
    private readonly ProductoRepository _repo = new();
    private readonly EmailService _email = new();
}

// Con DI manual (desacoplado)
public class PedidoService
{
    private readonly IProductoRepository _repo;
    private readonly INotificador _notificador;

    public PedidoService(IProductoRepository repo, INotificador notificador)
    {
        _repo = repo;
        _notificador = notificador;
    }
}
```

---

## 6. Patron Mediator (con MediatR estilo basico)

```csharp
public interface IMediator
{
    Task<TResult> Enviar<TResult>(IRequest<TResult> request);
}

public interface IRequest<TResult> { }

public interface IRequestHandler<TRequest, TResult>
    where TRequest : IRequest<TResult>
{
    Task<TResult> Handle(TRequest request);
}

public class MediadorSimple : IMediator
{
    private readonly IServiceProvider _provider;

    public MediadorSimple(IServiceProvider provider) => _provider = provider;

    public async Task<TResult> Enviar<TResult>(IRequest<TResult> request)
    {
        var handlerType = typeof(IRequestHandler<,>)
            .MakeGenericType(request.GetType(), typeof(TResult));
        var handler = _provider.GetService(handlerType);
        var method = handler!.GetType().GetMethod("Handle")!;
        var result = await (Task<TResult>)method.Invoke(handler, new[] { request })!;
        return result;
    }
}
```

---

## 7. Buenos Practicas

- Factory: cuando crear un objeto implica logica, no solo `new`
- Singleton: usarlo con moderacion, preferir DI con `AddSingleton`
- Builder: para objetos con muchas configuraciones opcionales
- Strategy: para algoritmos intercambiables (impuestos, descuentos, validaciones)
- Decorator: para agregar responsabilidades sin modificar la clase base
- Repository: abstrae la persistencia del dominio (no crear repositorio por cada entidad)
- DI: siempre programar contra interfaces, no contra clases concretas

## Resumen

- Patrones creacionales (Factory, Singleton, Builder) controlan la creacion de objetos.
- Patrones estructurales (Adapter, Decorator) organizan relaciones entre objetos.
- Patrones de comportamiento (Strategy, Observer) gestionan la comunicacion entre objetos.
- Repository es el patron de persistencia mas usado en .NET empresarial.
- La inyeccion de dependencias es fundamental para desacoplar componentes.
- Los patrones no son reglas: son soluciones probadas para problemas recurrentes.
