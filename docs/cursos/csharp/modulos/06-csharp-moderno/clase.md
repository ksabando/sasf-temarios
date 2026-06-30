---
sidebar_label: "Clase"
---

## 1. Nullable Reference Types

Desde C# 8, las referencias pueden declararse como *nullable* o *non-nullable*, y el compilador emite advertencias si se viola la nulabilidad.

```csharp
#nullable enable

public class Producto
{
    public string Nombre { get; set; }           // non-nullable: no puede ser null
    public string? Descripcion { get; set; }     // nullable: puede ser null
    public decimal Precio { get; set; }
}

// Uso
Producto p = new();
Console.WriteLine(p.Nombre.Length);   // seguro, el compilador asume no null

p.Descripcion = null;                 // permitido
Console.WriteLine(p.Descripcion.Length); // WARNING: posible null

// Formas de resolver la advertencia
if (p.Descripcion is not null)
    Console.WriteLine(p.Descripcion.Length);  // seguro (null check)

Console.WriteLine(p.Descripcion!.Length);     // ! = null-forgiving operator (solo si estas seguro)
Console.WriteLine(p.Descripcion?.Length);     // ?. = null-conditional, retorna null si es null
```

| Operador | Nombre | Uso |
|----------|--------|-----|
| `?` en tipo | Nullable annotation | `string?`, `Producto?` |
| `?.` | Null-conditional | `obj?.Propiedad` |
| `??` | Null-coalescing | `valor ?? default` |
| `??=` | Null-coalescing assignment | `lista ??= new()` |
| `!` | Null-forgiving | `expr!` (confia en mi, no es null) |

### Habilitar a nivel de proyecto

En el `.csproj`:
```xml
<PropertyGroup>
  <Nullable>enable</Nullable>
</PropertyGroup>
```

---

## 2. Records

Los records son tipos con semantica de valor, igualdad estructural y sintaxis concisa. Ideales para DTOs, Value Objects y datos inmutables.

```csharp
// Record class (por referencia, pero con igualdad por valor)
public record ProductoDto(
    string Nombre,
    decimal Precio,
    int Stock
);

// Con propiedades adicionales
public record ProductoDetalle : ProductoDto
{
    public string? Descripcion { get; init; }
}
```

### Record struct (C# 10, por valor)

```csharp
public readonly record struct Precio(
    decimal Monto,
    string Moneda
);
```

### with expressions

```csharp
var original = new ProductoDto("Laptop", 1500m, 10);
var modificado = original with { Precio = 1400m };
// original sigue siendo 1500; modificado es una nueva instancia con Precio cambiado
```

### Comparacion: class vs record vs record struct

| Caracteristica | `class` | `record` | `record struct` |
|---------------|---------|----------|-----------------|
| Ubicacion | Heap | Heap | Stack (o inline) |
| Comparacion | Referencia | Valor (propiedades) | Valor (propiedades) |
| Mutabilidad | Si (por defecto) | Inmutable (init) | Inmutable (readonly) |
| `ToString()` | Nombre tipo | Propiedades con valores | Propiedades con valores |
| `Deconstruct` | Manual | Automatico (por posicion) | Automatico |
| `with` expressions | Manual | Nativo | Nativo |

---

## 3. Init-Only Properties

Los setters `init` permiten asignar propiedades solo durante la inicializacion (constructor u object initializer).

```csharp
public class Producto
{
    public string Nombre { get; init; }
    public decimal Precio { get; init; }
}

// Valido
var p = new Producto { Nombre = "Mouse", Precio = 25m };

// Invalido (error de compilacion)
p.Precio = 30m;
```

---

## 4. Pattern Matching

Pattern matching permite evaluar la forma de un dato, no solo su valor.

```csharp
// Type pattern
if (obj is Producto producto)
    Console.WriteLine(producto.Nombre);

// Property pattern
if (obj is Producto { Precio: > 1000, Stock: > 0 })
    Console.WriteLine("Producto caro con stock");

// Tuple pattern
var clasificacion = (producto.Precio, producto.Stock) switch
{
    (> 1000, > 0) => "Caro y disponible",
    (> 1000, 0) => "Caro y agotado",
    (_, > 0) => "Accesible",
    _ => "Sin stock"
};

// Positional pattern (para records)
if (productoDto is ProductoDto("Laptop", _, _))
    Console.WriteLine("Es una laptop");

// List pattern (C# 11)
int[] numeros = { 1, 2, 3 };
if (numeros is [1, .., 3])
    Console.WriteLine("Empieza con 1 y termina con 3");

// Logical patterns (C# 9+)
if (edad is >= 18 and < 65)
    Console.WriteLine("Adulto en edad laboral");

if (edad is not (< 18 or > 65))
    Console.WriteLine("Misma condicion");
```

---

## 5. Otras Features Modernas

### Global usings

```csharp
// En un archivo Usings.cs o GlobalUsings.cs
global using System;
global using System.Collections.Generic;
global using Tienda.Dominio;
```

### Top-level statements

```csharp
// Program.cs - sin clase Program ni Main
using Tienda.Dominio;

var repo = new InventarioService();
repo.Cargar();

Console.WriteLine("Productos en inventario:");
foreach (var p in repo.Listar())
    Console.WriteLine($"- {p.Nombre}: {p.Precio:C}");
```

### File-scoped namespaces

```csharp
// En vez de namespace Tienda.Dominio { ... }
namespace Tienda.Dominio;

public class Producto { }
```

---

## 6. Ejemplo Completo: Dominio con C# Moderno

```csharp
using System;

namespace Tienda.Dominio;

#nullable enable

public readonly record struct Dinero(decimal Monto, string Moneda);

public record Producto(
    string Nombre,
    Dinero Precio,
    int Stock,
    string? Descripcion = null
)
{
    public bool TieneStock => Stock > 0;
    public bool EsCaro => Precio.Monto > 1000;

    public string Clasificacion => (Precio.Monto, Stock) switch
    {
        (> 1000, > 0) => "Premium",
        (> 1000, 0) => "Premium agotado",
        (_, > 0) => "Estandar",
        _ => "Sin stock"
    };
}

public class InventarioService
{
    private List<Producto> _productos = new();

    public void Agregar(Producto producto) => _productos.Add(producto);

    public Producto? Buscar(string nombre)
        => _productos.Find(p => p.Nombre.Equals(nombre, StringComparison.OrdinalIgnoreCase));

    public List<Producto> Filtrar(Func<Producto, bool> criterio)
        => _productos.Where(criterio).ToList();
}
```

---

## 7. Buenos Practicas

- Habilitar `Nullable` en proyectos nuevos desde el inicio
- Usar records para DTOs y objetos de valor inmutables
- Preferir `record struct` para datos pequenos y frecuentes
- Usar pattern matching en vez de cadenas de `if-else` cuando sea posible
- El operador `!` debe usarse solo cuando estas absolutamente seguro de que el valor no es null
- Preferir `init` setters sobre `set` cuando el objeto debe ser inmutable despues de creado

## Resumen

- Nullable reference types ayudan a prevenir errores por null en compilacion.
- Records simplifican la creacion de datos inmutables con igualdad estructural.
- Pattern matching permite escribir condiciones mas expresivas y seguras.
- `with` expressions facilitan la creacion de copias modificadas de records.
- C# moderno favorece la inmutabilidad y la claridad del codigo.
