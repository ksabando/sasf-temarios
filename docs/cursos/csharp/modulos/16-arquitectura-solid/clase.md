---
sidebar_label: "Clase"
---

## 1. Principios SOLID en C#

### S - Single Responsibility Principle

Una clase debe tener una sola razon para cambiar.

```csharp
// MAL: mezcla responsabilidades
public class ProductoService
{
    public void Guardar(Producto p) { /* BD */ }
    public void EnviarEmail(string msg) { /* email */ }
    public void GenerarReporte() { /* PDF */ }
}

// BIEN: cada clase tiene una responsabilidad
public class ProductoRepository
{
    public void Guardar(Producto p) { /* solo BD */ }
}

public class EmailService
{
    public void Enviar(string para, string msg) { /* solo email */ }
}

public class ReporteService
{
    public byte[] GenerarReporteInventario() { /* solo reportes */ }
}
```

### O - Open/Closed Principle

Abierto para extension, cerrado para modificacion.

```csharp
// MAL: cada nuevo tipo requiere modificar
public class CalculadorDescuento
{
    public decimal Calcular(Producto p, string tipo)
    {
        return tipo switch
        {
            "VIP" => p.Precio * 0.2m,
            "Premium" => p.Precio * 0.1m,
            _ => 0
        };
    }
}

// BIEN: extension via Strategy
public interface IDescuentoStrategy
{
    decimal Aplicar(decimal precio);
    bool AplicaPara(Producto p);
}

public class DescuentoVIP : IDescuentoStrategy
{
    public decimal Aplicar(decimal precio) => precio * 0.2m;
    public bool AplicaPara(Producto p) => p.Cliente?.Categoria == "VIP";
}
```

### L - Liskov Substitution Principle

Subtipo debe poder reemplazar a su tipo base.

```csharp
// MAL: viola LSP
public class Producto
{
    public virtual void AplicarDescuento(decimal porcentaje)
        => Precio -= Precio * porcentaje;
}

public class ProductoDigital : Producto
{
    public override void AplicarDescuento(decimal porcentaje)
        => throw new NotSupportedException("Los digitales no tienen descuento");
}

// BIEN: interfaz separada
public interface IDescontable { void AplicarDescuento(decimal pct); }
```

### I - Interface Segregation Principle

Muchas interfaces especificas > una interfaz general.

```csharp
// MAL: interfaz gruesa
public interface IRepositorio
{
    void Guardar(object o);
    object? Obtener(int id);
    byte[] GenerarReporte();
    void EnviarNotificacion(string msg);
}

// BIEN: interfaces pequenas
public interface IGuardar<T> { void Guardar(T entidad); }
public interface IObtener<T> { T? Obtener(int id); }
public interface IRepositorio<T> : IGuardar<T>, IObtener<T> { }
```

### D - Dependency Inversion Principle

Depender de abstracciones, no de concretos.

```csharp
// MAL: depende de clase concreta
public class PedidoService
{
    private readonly SqlServerRepository _repo = new();
}

// BIEN: depende de interfaz
public class PedidoService
{
    private readonly IProductoRepository _repo;
    public PedidoService(IProductoRepository repo) => _repo = repo;
}
```

---

## 2. Contenedor DI en .NET

```csharp
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();

services.AddSingleton<IConfiguracion, Configuracion>();
services.AddScoped<IProductoRepository, ProductoRepositorioJson>();
services.AddTransient<INotificador, EmailNotificador>();

services.AddScoped<InventarioService>();

var provider = services.BuildServiceProvider();
var inventario = provider.GetRequiredService<InventarioService>();
```

### Ciclos de vida

| Registro | Instancia compartida | Uso |
|----------|---------------------|-----|
| `AddSingleton` | Una instancia para toda la app | Configuracion, cache, loggers |
| `AddScoped` | Una instancia por request | DbContext, Unit of Work |
| `AddTransient` | Nueva instancia cada vez | Servicios ligeros sin estado |

---

## 3. Separacion de Capas (Clean Architecture simplificado)

```txt
+---------------------+
|   Presentacion      |  Consola, API, MVC
+---------------------+
|   Aplicacion        |  Casos de uso, DTOs, mapeo
+---------------------+
|   Dominio           |  Entidades, Value Objects, interfaces
+---------------------+
|   Infraestructura   |  Persistencia, archivos, externos
+---------------------+
```

### Regla de dependencia

Las dependencias apuntan hacia adentro. Dominio no conoce nada externo.

```csharp
// Dominio - sin dependencias externas
namespace Tienda.Dominio;
public class Producto { }

// Aplicacion - conoce dominio
namespace Tienda.Aplicacion;
public class CrearProductoUseCase { }

// Infraestructura - implementa interfaces del dominio
namespace Tienda.Infraestructura;
public class ProductoRepositorioEF : IProductoRepository { }
```

---

## 4. Pipeline de Casos de Uso (CQRS basico)

```csharp
// Command
public record CrearProductoCommand(string Nombre, decimal Precio, int Stock)
    : IRequest<Resultado>;

// Handler
public class CrearProductoHandler : IRequestHandler<CrearProductoCommand, Resultado>
{
    private readonly IProductoRepository _repo;

    public CrearProductoHandler(IProductoRepository repo) => _repo = repo;

    public async Task<Resultado> Handle(CrearProductoCommand cmd)
    {
        var producto = new Producto(cmd.Nombre, cmd.Precio, cmd.Stock);
        await _repo.GuardarAsync(producto);
        return Resultado.Exito($"Producto {cmd.Nombre} creado");
    }
}

// Mediator simple
public interface IRequest<T> { }
public interface IRequestHandler<TRequest, TResult> where TRequest : IRequest<TResult>
{
    Task<TResult> Handle(TRequest request);
}
```

---

## 5. Modular Monolith como Puente a Microservicios

```csharp
// Cada modulo es un bounded context en una misma solucion
// ModularMonolith/
//   Pedidos/    -> Pedidos.Domain, Pedidos.Application, Pedidos.Infrastructure
//   Catalogo/   -> Catalogo.Domain, Catalogo.Application, Catalogo.Infrastructure
//   Pagos/      -> Pagos.Domain, Pagos.Application, Pagos.Infrastructure

public static class PedidosModule
{
    public static IServiceCollection AddPedidosModule(this IServiceCollection services)
    {
        services.AddScoped<IPedidoRepository, PedidoRepository>();
        services.AddScoped<CrearPedidoHandler>();
        return services;
    }
}

// En Program.cs
builder.Services
    .AddPedidosModule()
    .AddCatalogoModule()
    .AddPagosModule();
```

---

## 6. Ejemplo Completo: Arquitectura en Capas

```csharp
// ---- DOMINIO ----
namespace Tienda.Dominio;
public class Producto : EntidadBase { /* ... */ }
public interface IProductoRepository : IRepositorio<Producto> { }

// ---- APLICACION ----
namespace Tienda.Aplicacion;
public class CrearProductoUseCase
{
    private readonly IProductoRepository _repo;
    private readonly ILogger<CrearProductoUseCase> _logger;

    public CrearProductoUseCase(IProductoRepository repo, ILogger<CrearProductoUseCase> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<Resultado> Ejecutar(CrearProductoDto dto)
    {
        _logger.LogInformation("Creando producto {Nombre}", dto.Nombre);
        var producto = new Producto(dto.Nombre, dto.Precio, dto.Stock);
        await _repo.GuardarAsync(producto);
        return Resultado.Exito(producto.Id);
    }
}

// ---- INFRAESTRUCTURA ----
namespace Tienda.Infraestructura;
public class ProductoRepositorioEF : IProductoRepository
{
    private readonly TiendaDbContext _db;
    public ProductoRepositorioEF(TiendaDbContext db) => _db = db;
    // implementacion con EF Core
}

// ---- API (presentacion) ----
namespace Tienda.Api;
[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly CrearProductoUseCase _useCase;

    public ProductosController(CrearProductoUseCase useCase) => _useCase = useCase;

    [HttpPost]
    public async Task<IActionResult> Crear(CrearProductoDto dto)
    {
        var resultado = await _useCase.Ejecutar(dto);
        return resultado.Success ? Ok(resultado) : BadRequest(resultado);
    }
}
```

---

## 7. Buenos Practicas

- SOLID no son reglas absolutas: son guias que requieren contexto y criterio
- SRP: si una clase tiene mas de 200-300 lineas, probablemente viola SRP
- DIP siempre: programar contra interfaces, inyectar dependencias
- La separacion en capas debe ser estricta: dominio sin referencias a infraestructura
- Modular Monolith: empezar con modulos, extraer a microservicios solo si es necesario
- No crear abstracciones innecesarias (YAGNI)
- El testing se vuelve trivial cuando las dependencias son por constructor

## Resumen

- SOLID son principios de diseno de objetos, no reglas de arquitectura.
- DI container es el pegamento que une las capas en tiempo de ejecucion.
- La separacion en capas (Domain, Application, Infrastructure) es la base de Clean Architecture.
- CQRS separa operaciones de lectura y escritura a nivel de caso de uso.
- Modular Monolith permite la disciplina de microservicios sin la complejidad distribuida.
- Una buena arquitectura hace que los cambios sean locales y las pruebas faciles.
