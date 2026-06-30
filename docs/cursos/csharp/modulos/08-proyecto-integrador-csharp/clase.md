---
sidebar_label: "Clase"
---

## 1. Arquitectura por Capas

Una aplicacion mantenible separa responsabilidades en capas. Cada capa tiene un proposito claro y depende solo de las capas internas.

```txt
+------------------+
|   ConsoleUI      |  <-- Interfaz de usuario (entrada/salida)
+------------------+
|   Application    |  <-- Casos de uso, servicios
+------------------+
|   Domain         |  <-- Entidades, reglas de negocio
+------------------+
|   Infrastructure |  <-- Persistencia, archivos, externos
+------------------+
```

### Principio de Dependencia

Las capas internas (Domain) no conocen nada de las externas. Las dependencias apuntan hacia adentro.

| Capa | Depende de | No debe contener |
|------|-----------|------------------|
| Domain | Nada (solo .NET) | Acceso a archivos, consola, DB |
| Application | Domain | UI, HTTP, infraestructura |
| Infrastructure | Domain, Application | Reglas de negocio |
| ConsoleUI | Application | Logica de negocio |

---

## 2. Proyecto Integrador: Estructura

```
Inventario/
├── Inventario.sln
├── src/
│   ├── Inventario.Dominio/
│   │   ├── Producto.cs
│   │   ├── IProductoRepository.cs
│   │   └── InventarioService.cs
│   ├── Inventario.Infraestructura/
│   │   └── ProductoRepositorioJson.cs
│   └── Inventario.Consola/
│       └── Program.cs
└── tests/
    └── Inventario.Tests/
        ├── ProductoTests.cs
        ├── InventarioServiceTests.cs
        └── GlobalUsings.cs
```

---

## 3. Capa de Dominio

Contiene las entidades, Value Objects e interfaces de repositorio. No tiene dependencias externas.

```csharp
// Inventario.Dominio/Producto.cs
namespace Inventario.Dominio;

public class Producto
{
    public string Nombre { get; }
    public decimal Precio { get; private set; }
    public int Stock { get; private set; }

    public Producto(string nombre, decimal precio, int stock)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new ArgumentException("El nombre es requerido", nameof(nombre));
        if (precio <= 0)
            throw new ArgumentException("El precio debe ser mayor a cero", nameof(precio));
        if (stock < 0)
            throw new ArgumentException("El stock no puede ser negativo", nameof(stock));

        Nombre = nombre;
        Precio = precio;
        Stock = stock;
    }

    public void AjustarStock(int cantidad)
    {
        if (Stock + cantidad < 0)
            throw new InvalidOperationException($"Stock insuficiente. Actual: {Stock}, solicitado: {-cantidad}");
        Stock += cantidad;
    }
}

// Inventario.Dominio/IProductoRepository.cs
namespace Inventario.Dominio;

public interface IProductoRepository
{
    Task<List<Producto>> ObtenerTodosAsync();
    Task<Producto?> ObtenerPorNombreAsync(string nombre);
    Task GuardarAsync(Producto producto);
    Task EliminarAsync(string nombre);
}
```

---

## 4. Capa de Aplicacion (Servicios)

Orquesta los casos de uso usando las interfaces del dominio.

```csharp
// Inventario.Dominio/InventarioService.cs
namespace Inventario.Dominio;

public class InventarioService
{
    private readonly IProductoRepository _repositorio;

    public InventarioService(IProductoRepository repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task AgregarProductoAsync(string nombre, decimal precio, int stock)
    {
        var existente = await _repositorio.ObtenerPorNombreAsync(nombre);
        if (existente is not null)
            throw new InvalidOperationException($"El producto '{nombre}' ya existe");

        var producto = new Producto(nombre, precio, stock);
        await _repositorio.GuardarAsync(producto);
    }

    public async Task<List<Producto>> ListarProductosAsync()
        => await _repositorio.ObtenerTodosAsync();

    public async Task<List<Producto>> BuscarPorTextoAsync(string texto)
    {
        var todos = await _repositorio.ObtenerTodosAsync();
        return todos
            .Where(p => p.Nombre.Contains(texto, StringComparison.OrdinalIgnoreCase))
            .OrderBy(p => p.Nombre)
            .ToList();
    }

    public async Task<decimal> CalcularValorTotalAsync()
    {
        var todos = await _repositorio.ObtenerTodosAsync();
        return todos.Sum(p => p.Precio * p.Stock);
    }

    public async Task AjustarStockAsync(string nombre, int cantidad)
    {
        var producto = await _repositorio.ObtenerPorNombreAsync(nombre);
        if (producto is null)
            throw new KeyNotFoundException($"Producto '{nombre}' no encontrado");

        producto.AjustarStock(cantidad);
        await _repositorio.GuardarAsync(producto);
    }
}
```

---

## 5. Capa de Infraestructura

Implementa las interfaces del dominio. Solo esta capa conoce detalles tecnicos como JSON.

```csharp
// Inventario.Infraestructura/ProductoRepositorioJson.cs
using System.Text.Json;
using Inventario.Dominio;

namespace Inventario.Infraestructura;

public class ProductoRepositorioJson : IProductoRepository
{
    private readonly string _archivo;
    private List<Producto>? _cache;

    public ProductoRepositorioJson(string archivo = "inventario.json")
    {
        _archivo = archivo;
    }

    public async Task<List<Producto>> ObtenerTodosAsync()
    {
        await CargarAsync();
        return _cache!.ToList();
    }

    public async Task<Producto?> ObtenerPorNombreAsync(string nombre)
    {
        await CargarAsync();
        return _cache!.FirstOrDefault(p =>
            p.Nombre.Equals(nombre, StringComparison.OrdinalIgnoreCase));
    }

    public async Task GuardarAsync(Producto producto)
    {
        await CargarAsync();
        _cache!.RemoveAll(p =>
            p.Nombre.Equals(producto.Nombre, StringComparison.OrdinalIgnoreCase));
        _cache!.Add(producto);
        await PersistirAsync();
    }

    public async Task EliminarAsync(string nombre)
    {
        await CargarAsync();
        _cache!.RemoveAll(p =>
            p.Nombre.Equals(nombre, StringComparison.OrdinalIgnoreCase));
        await PersistirAsync();
    }

    private async Task CargarAsync()
    {
        if (_cache is not null) return;

        if (!File.Exists(_archivo))
        {
            _cache = new List<Producto>();
            return;
        }

        try
        {
            string json = await File.ReadAllTextAsync(_archivo);
            _cache = JsonSerializer.Deserialize<List<Producto>>(json) ?? new();
        }
        catch (JsonException)
        {
            _cache = new List<Producto>();
        }
    }

    private async Task PersistirAsync()
    {
        var opciones = new JsonSerializerOptions { WriteIndented = true };
        string json = JsonSerializer.Serialize(_cache, opciones);
        await File.WriteAllTextAsync(_archivo, json);
    }
}
```

---

## 6. Capa de Presentacion (Consola)

Solo se encarga de la interaccion con el usuario. No contiene reglas de negocio.

```csharp
// Inventario.Consola/Program.cs
using Inventario.Dominio;
using Inventario.Infraestructura;

var repositorio = new ProductoRepositorioJson("inventario.json");
var servicio = new InventarioService(repositorio);

while (true)
{
    Console.WriteLine("\n--- INVENTARIO ---");
    Console.WriteLine("1. Listar productos");
    Console.WriteLine("2. Agregar producto");
    Console.WriteLine("3. Buscar producto");
    Console.WriteLine("4. Ajustar stock");
    Console.WriteLine("5. Ver valor total");
    Console.WriteLine("6. Salir");
    Console.Write("Opcion: ");

    var opcion = Console.ReadLine();
    switch (opcion)
    {
        case "1":
            var productos = await servicio.ListarProductosAsync();
            foreach (var p in productos)
                Console.WriteLine($"{p.Nombre,-20} {p.Precio,8:C} Stock: {p.Stock}");
            break;

        case "2":
            await AgregarProductoAsync(servicio);
            break;

        case "3":
            await BuscarProductoAsync(servicio);
            break;

        case "4":
            await AjustarStockAsync(servicio);
            break;

        case "5":
            var total = await servicio.CalcularValorTotalAsync();
            Console.WriteLine($"Valor total del inventario: {total:C}");
            break;

        case "6":
            return;

        default:
            Console.WriteLine("Opcion invalida");
            break;
    }
}

// Metodos auxiliares al final del archivo
static async Task AgregarProductoAsync(InventarioService servicio)
{
    Console.Write("Nombre: ");
    var nombre = Console.ReadLine() ?? "";
    Console.Write("Precio: ");
    if (!decimal.TryParse(Console.ReadLine(), out var precio)) return;
    Console.Write("Stock: ");
    if (!int.TryParse(Console.ReadLine(), out var stock)) return;

    try
    {
        await servicio.AgregarProductoAsync(nombre, precio, stock);
        Console.WriteLine("Producto agregado.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error: {ex.Message}");
    }
}

static async Task BuscarProductoAsync(InventarioService servicio)
{
    Console.Write("Texto a buscar: ");
    var texto = Console.ReadLine() ?? "";
    var resultados = await servicio.BuscarPorTextoAsync(texto);
    foreach (var p in resultados)
        Console.WriteLine($"{p.Nombre} - {p.Precio:C} ({p.Stock} uds)");
}

static async Task AjustarStockAsync(InventarioService servicio)
{
    Console.Write("Nombre del producto: ");
    var nombre = Console.ReadLine() ?? "";
    Console.Write("Cantidad a ajustar (positivo suma, negativo resta): ");
    if (!int.TryParse(Console.ReadLine(), out var cantidad)) return;

    try
    {
        await servicio.AjustarStockAsync(nombre, cantidad);
        Console.WriteLine("Stock actualizado.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error: {ex.Message}");
    }
}
```

---

## 7. Tests del Proyecto Integrador

```csharp
using Xunit;
using Inventario.Dominio;

namespace Inventario.Tests;

public class InventarioServiceTests
{
    [Fact]
    public async Task AgregarProducto_NuevoProducto_SeAgregaCorrectamente()
    {
        var repo = new RepositorioEnMemoria();
        var service = new InventarioService(repo);

        await service.AgregarProductoAsync("Laptop", 1500m, 10);

        var productos = await service.ListarProductosAsync();
        Assert.Single(productos);
    }

    [Fact]
    public async Task AgregarProducto_ProductoDuplicado_LanzaExcepcion()
    {
        var repo = new RepositorioEnMemoria();
        var service = new InventarioService(repo);

        await service.AgregarProductoAsync("Laptop", 1500m, 10);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.AgregarProductoAsync("Laptop", 1500m, 10));
    }
}

// Fake en memoria para tests (evita usar mocks para logica simple)
public class RepositorioEnMemoria : IProductoRepository
{
    private readonly List<Producto> _productos = new();

    public Task<List<Producto>> ObtenerTodosAsync()
        => Task.FromResult(_productos.ToList());

    public Task<Producto?> ObtenerPorNombreAsync(string nombre)
        => Task.FromResult(_productos.FirstOrDefault(p =>
            p.Nombre.Equals(nombre, StringComparison.OrdinalIgnoreCase)));

    public Task GuardarAsync(Producto producto)
    {
        _productos.RemoveAll(p =>
            p.Nombre.Equals(producto.Nombre, StringComparison.OrdinalIgnoreCase));
        _productos.Add(producto);
        return Task.CompletedTask;
    }

    public Task EliminarAsync(string nombre)
    {
        _productos.RemoveAll(p =>
            p.Nombre.Equals(nombre, StringComparison.OrdinalIgnoreCase));
        return Task.CompletedTask;
    }
}
```

---

## 8. Verificacion de Entrega

| Requisito | Verificacion |
|-----------|-------------|
| App ejecutable | `dotnet run` desde Inventario.Consola |
| CRUD funcional | Agregar, listar, buscar, ajustar stock |
| Persistencia | Datos sobreviven entre ejecuciones (archivo JSON) |
| Tests pasando | `dotnet test` en Inventario.Tests |
| Separacion por capas | Dominio no referencia infraestructura ni consola |
| Manejo de errores | Entradas invalidas no rompen la aplicacion |

## Resumen

- El proyecto integrador consolida todo lo aprendido en el curso.
- La separacion por capas (Domain, Infrastructure, UI) es la base para evolucionar a una API.
- Las interfaces en el dominio permiten cambiar infraestructura sin afectar reglas de negocio.
- Los tests con fakes en memoria verifican la logica sin depender de archivos reales.
- Una consola bien estructurada es el primer paso hacia una aplicacion mantenible.
