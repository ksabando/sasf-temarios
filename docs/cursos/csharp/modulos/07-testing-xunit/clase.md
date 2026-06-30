---
sidebar_label: "Clase"
---

## 1. Fundamentos de Pruebas Unitarias

Las pruebas unitarias verifican que una unidad de codigo (tipicamente un metodo o clase) se comporte correctamente de forma aislada.

### Ciclo TDD basico (Red-Green-Refactor)

1. **Red**: Escribir una prueba que falla
2. **Green**: Escribir el codigo minimo para que pase
3. **Refactor**: Mejorar el codigo manteniendo las pruebas verdes

---

## 2. xUnit: Estructura Basica

xUnit es el framework de testing mas usado en .NET moderno (reemplazo de MSTest y NUnit).

### Proyecto de tests

```bash
dotnet new xunit -n Tienda.Tests
dotnet add Tienda.Tests reference Tienda.Dominio
```

### Primer test

```csharp
using Xunit;

namespace Tienda.Tests;

public class ProductoTests
{
    [Fact]
    public void CrearProducto_ConValoresValidos_PropiedadesAsignadas()
    {
        // Arrange
        var producto = new Producto("Laptop", 1500m, 10);

        // Act
        var nombre = producto.Nombre;
        var precio = producto.Precio;

        // Assert
        Assert.Equal("Laptop", nombre);
        Assert.Equal(1500m, precio);
    }
}
```

### Patron AAA

| Fase | Que ocurre | Ejemplo |
|------|------------|---------|
| **Arrange** | Preparar datos y dependencias | Crear objetos, inicializar valores |
| **Act** | Ejecutar la accion a probar | Llamar al metodo |
| **Assert** | Verificar el resultado | Assert.Equal, Assert.Throws |

---

## 3. Assertiones Comunes

```csharp
// Igualdad
Assert.Equal(1500m, producto.Precio);
Assert.NotEqual(0, producto.Stock);

// Booleanos
Assert.True(producto.TieneStock);
Assert.False(producto.EsCaro);

// Nulos
Assert.Null(producto.Descripcion);
Assert.NotNull(producto.Nombre);

// Colecciones
Assert.Contains(producto, lista);
Assert.DoesNotContain(producto, lista);
Assert.Single(lista);          // exactamente un elemento
Assert.All(lista, p => Assert.True(p.Precio > 0));

// Excepciones
var ex = Assert.Throws<ArgumentException>(() => new Producto("", 10m, 5));
Assert.Contains("nombre", ex.Message);

// Rangos
Assert.InRange(producto.Precio, 0, 10000);
```

---

## 4. Pruebas Parametrizadas

```csharp
public class CalculoTests
{
    [Theory]
    [InlineData("Laptop", 1500, 10, "Caro y disponible")]
    [InlineData("Mouse", 25, 100, "Estandar")]
    [InlineData("Laptop", 1500, 0, "Caro y agotado")]
    public void Clasificar_DatosProducto_RetornaClasificacion(
        string nombre, decimal precio, int stock, string esperado)
    {
        var producto = new Producto(nombre, precio, stock);

        var resultado = producto.Clasificacion;

        Assert.Equal(esperado, resultado);
    }
}
```

### Datos desde archivo o metodo

```csharp
public static IEnumerable<object[]> DatosPrueba()
{
    yield return new object[] { 0, true };
    yield return new object[] { 5, true };
    yield return new object[] { 10, false };
}

[Theory]
[MemberData(nameof(DatosPrueba))]
public void EsStockBajo_VariosValores_ResultadoCorrecto(int stock, bool esperado)
{
    var producto = new Producto("Test", 10m, stock);
    Assert.Equal(esperado, producto.Stock <= 5);
}
```

---

## 5. Dependencias Externas y Mocks

Para aislar la unidad bajo test, las dependencias externas (repositorios, servicios) deben simularse.

```csharp
// Interfaz que sera mockeada
public interface IInventarioRepository
{
    List<Producto> ObtenerTodos();
    void Guardar(Producto producto);
}

// Servicio que usa el repositorio
public class InventarioService
{
    private readonly IInventarioRepository _repo;
    public InventarioService(IInventarioRepository repo) => _repo = repo;

    public decimal CalcularValorTotal()
        => _repo.ObtenerTodos().Sum(p => p.Precio * p.Stock);
}
```

### Usando NSubstitute

```csharp
using NSubstitute;

public class InventarioServiceTests
{
    [Fact]
    public void CalcularValorTotal_ConProductos_SumaCorrecta()
    {
        // Arrange
        var repo = Substitute.For<IInventarioRepository>();
        repo.ObtenerTodos().Returns(new List<Producto>
        {
            new("Laptop", 1000m, 2),
            new("Mouse", 50m, 10)
        });

        var service = new InventarioService(repo);

        // Act
        var total = service.CalcularValorTotal();

        // Assert
        Assert.Equal(2500m, total);  // 1000*2 + 50*10
    }
}
```

---

## 6. Organizacion del Proyecto de Tests

```
Tienda.sln
├── src/
│   └── Tienda.Dominio/
│       ├── Producto.cs
│       ├── InventarioService.cs
│       └── IInventarioRepository.cs
└── tests/
    └── Tienda.Tests/
        ├── ProductoTests.cs
        ├── InventarioServiceTests.cs
        └── GlobalUsings.cs
```

### Convencion de nombres

| Elemento | Convencion | Ejemplo |
|----------|------------|---------|
| Clase de test | `[NombreClase]Tests` | `ProductoTests` |
| Metodo de test | `[Metodo]_[Escenario]_[ResultadoEsperado]` | `CrearProducto_ConPrecioCero_LanzaExcepcion` |
| Archivo | 1 clase por archivo | `ProductoTests.cs` |

---

## 7. Ejemplo Completo: Tests de Inventario

```csharp
using Xunit;
using NSubstitute;

namespace Tienda.Tests;

public class InventarioServiceTests
{
    [Fact]
    public void AgregarProducto_ConDatosValidos_ProductoGuardado()
    {
        var repo = Substitute.For<IInventarioRepository>();
        var service = new InventarioService(repo);
        var producto = new Producto("Laptop", 1500m, 10);

        service.Agregar(producto);

        repo.Received(1).Guardar(producto);
    }

    [Theory]
    [InlineData("", 10, 5, "nombre")]
    [InlineData("Mouse", 0, 5, "precio")]
    [InlineData("Mouse", 10, -1, "stock")]
    public void CrearProducto_DatosInvalidos_LanzaExcepcion(
        string nombre, decimal precio, int stock, string parametro)
    {
        var ex = Assert.Throws<ArgumentException>(() => new Producto(nombre, precio, stock));
        Assert.Contains(parametro, ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void ReducirStock_CantidadMayorAStock_LanzaExcepcion()
    {
        var producto = new Producto("Mouse", 25m, 5);

        var ex = Assert.Throws<InvalidOperationException>(() => producto.AjustarStock(-10));
        Assert.Contains("insuficiente", ex.Message);
    }

    [Fact]
    public void BuscarProducto_PorNombreExistente_RetornaProducto()
    {
        var repo = Substitute.For<IInventarioRepository>();
        repo.ObtenerTodos().Returns(new List<Producto>
        {
            new("Laptop", 1500m, 10),
            new("Mouse", 25m, 50)
        });

        var service = new InventarioService(repo);
        var resultado = service.Buscar("Mouse");

        Assert.NotNull(resultado);
        Assert.Equal("Mouse", resultado!.Nombre);
    }
}
```

---

## 8. Buenos Practicas

- Un test por comportamiento, no por metodo
- Nombres descriptivos: `[Metodo]_[Escenario]_[Resultado]`
- No probar codigo que no escribiste (librerias externas, .NET BCL)
- Una asercion conceptual por test (pueden ser varias lineas de Assert)
- Usar `[Theory]` con `[InlineData]` para multiples casos
- No hacer pruebas de la infraestructura (base de datos real, archivos) sin integration tests
- Mantener los tests independientes y repetibles

## Resumen

- xUnit es el framework de testing estandar en .NET.
- `[Fact]` para pruebas simples, `[Theory]` para pruebas parametrizadas.
- AAA (Arrange, Act, Assert) estructura cada test.
- Mocks (NSubstitute, Moq) aïslan la unidad bajo prueba de sus dependencias.
- Las pruebas unitarias verifican reglas de negocio, no detalles de infraestructura.
