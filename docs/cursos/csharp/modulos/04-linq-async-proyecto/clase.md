---
sidebar_label: "Clase"
---

## 1. LINQ (Language Integrated Query)

LINQ permite consultar colecciones y origenes de datos con una sintaxis unificada. Soporta method syntax (fluent) y query syntax (SQL-like). Method syntax es la mas comun en codigo profesional.

### Method Syntax (fluent)

```csharp
var resultado = productos
    .Where(p => p.Precio > 100)
    .OrderBy(p => p.Nombre)
    .Select(p => new { p.Nombre, p.Precio });
```

### Query Syntax

```csharp
var resultado = from p in productos
                where p.Precio > 100
                orderby p.Nombre
                select new { p.Nombre, p.Precio };
```

Ambas son equivalentes. Method syntax es mas expresiva para operaciones complejas.

---

## 2. Operadores LINQ Esenciales

### Filtrado

```csharp
.Where(p => p.Activo)
.OfType<ProductoDigital>()         // filtra por tipo
```

### Proyeccion

```csharp
.Select(p => p.Nombre)                      // un campo
.Select(p => new { p.Nombre, p.Precio })    // anonimo
.SelectMany(p => p.Etiquetas)               // flatten de colecciones anidadas
```

### Ordenamiento

```csharp
.OrderBy(p => p.Nombre)              // ascendente
.OrderByDescending(p => p.Precio)    // descendente
.ThenBy(p => p.Stock)                // segundo criterio
```

### Agrupacion

```csharp
var porCategoria = productos
    .GroupBy(p => p.CategoriaId)
    .Select(g => new
    {
        CategoriaId = g.Key,
        Total = g.Count(),
        PrecioPromedio = g.Average(p => p.Precio)
    });
```

### Agregacion

```csharp
var total = productos.Sum(p => p.Precio * p.Stock);
var maximo = productos.Max(p => p.Precio);
var promedio = productos.Average(p => p.Precio);
var conteo = productos.Count();
```

### Cuantificadores y busqueda

```csharp
.Any(p => p.Stock == 0)                   // existe alguno sin stock?
.All(p => p.Precio > 0)                   // todos tienen precio valido?
.Contains(producto)                        // existe en la coleccion?
.FirstOrDefault(p => p.Id == id)           // primero o null
.SingleOrDefault(p => p.Id == id)          // exactamente uno o null
.LastOrDefault(p => p.Nombre == "Mouse")   // ultimo o null
```

### Conjuntos

```csharp
.Distinct()                                // elementos unicos
.Union(otros)                              // union de conjuntos
.Intersect(otros)                          // interseccion
.Except(otros)                             // diferencia
```

### Take, Skip y paginacion

```csharp
var pagina = productos
    .OrderBy(p => p.Nombre)
    .Skip((paginaNumero - 1) * tamanoPagina)
    .Take(tamanoPagina)
    .ToList();
```

---

## 3. Ejecucion Diferida (Deferred Execution)

LINQ no ejecuta la consulta hasta que se itera sobre el resultado. Esto permite componer consultas sin penalidad hasta el momento de materializar.

```csharp
var consulta = productos.Where(p => p.Precio > 100);   // NO se ejecuta aun
var ordenada = consulta.OrderBy(p => p.Nombre);        // sigue sin ejecutarse
var resultado = ordenada.ToList();                     // AQUI se ejecuta
```

| Metodo | Ejecucion | Descripcion |
|--------|-----------|-------------|
| `ToList()`, `ToArray()` | Inmediata | Materializa la coleccion |
| `First()`, `Single()`, `Count()` | Inmediata | Retorna un valor escalar |
| `Where()`, `Select()`, `OrderBy()` | Diferida | Componible hasta materializar |

---

## 4. Programacion Asincrona con async/await

La asincronia permite que un hilo no se bloquee esperando operaciones I/O-bound (archivos, base de datos, red, APIs).

### Metodo sincrono (bloqueante)

```csharp
public string LeerArchivo()
{
    return File.ReadAllText("datos.json");    // el hilo espera sin hacer nada util
}
```

### Metodo asincrono (no bloqueante)

```csharp
public async Task<string> LeerArchivoAsync()
{
    string contenido = await File.ReadAllTextAsync("datos.json");
    return contenido;
}
```

La firma `Task<T>` representa una operacion que eventualmente producira un valor de tipo `T`. `void` se reemplaza por `Task`.

---

## 5. Reglas de async/await

```csharp
// 1. El metodo debe declararse async
// 2. El tipo de retorno debe ser Task, Task<T> o void (solo event handlers)
// 3. Se usa await para operaciones I/O-bound
// 4. No usar .Result o .Wait() (causan deadlocks)

public async Task<List<Producto>> CargarProductosAsync()
{
    string json = await File.ReadAllTextAsync("productos.json");
    return JsonSerializer.Deserialize<List<Producto>>(json) ?? new();
}

public async Task GuardarProductosAsync(List<Producto> productos)
{
    string json = JsonSerializer.Serialize(productos);
    await File.WriteAllTextAsync("productos.json", json);
}
```

### Ejecucion concurrente

```csharp
// Multiples tareas en paralelo
var tarea1 = CargarProductosAsync();
var tarea2 = CargarCategoriasAsync();
await Task.WhenAll(tarea1, tarea2);

var productos = await tarea1;
var categorias = await tarea2;
```

### Manejo de errores en async

```csharp
try
{
    await CargarProductosAsync();
}
catch (FileNotFoundException ex)
{
    Console.WriteLine($"Archivo faltante: {ex.Message}");
}
catch (JsonException ex)
{
    Console.WriteLine($"Error de formato: {ex.Message}");
}
```

---

## 6. Ejemplo Completo: Busqueda y Carga Asincrona

```csharp
public class InventarioService
{
    private List<Producto>? _cache;
    private readonly string _archivo = "inventario.json";

    public async Task<List<Producto>> BuscarAsync(string texto)
    {
        var productos = await CargarAsync();
        return productos
            .Where(p => p.Nombre.Contains(texto, StringComparison.OrdinalIgnoreCase))
            .OrderBy(p => p.Nombre)
            .ToList();
    }

    public async Task<List<Producto>> ObtenerPaginaAsync(int pagina, int tamano)
    {
        var productos = await CargarAsync();
        return productos
            .OrderBy(p => p.Nombre)
            .Skip((pagina - 1) * tamano)
            .Take(tamano)
            .ToList();
    }

    public async Task<decimal> CalcularValorTotalAsync()
    {
        var productos = await CargarAsync();
        return productos.Sum(p => p.Precio * p.Stock);
    }

    private async Task<List<Producto>> CargarAsync()
    {
        if (_cache != null) return _cache;

        if (!File.Exists(_archivo))
        {
            _cache = new List<Producto>();
            return _cache;
        }

        string json = await File.ReadAllTextAsync(_archivo);
        _cache = JsonSerializer.Deserialize<List<Producto>>(json) ?? new();
        return _cache;
    }
}
```

---

## 7. Buenas Practicas

- Preferir method syntax sobre query syntax para consistencia
- Usar `ToList()` solo cuando sea necesario (ejecucion inmediata)
- No usar `async void` excepto para event handlers
- No mezclar `.Result`/`.Wait()` con `await`
- Usar `ConfigureAwait(false)` en librerias (no en UI)
- LINQ: filtrar lo antes posible (`Where` antes de `OrderBy`)

## Resumen

- LINQ permite consultar colecciones de forma declarativa.
- La mayoria de los operadores tienen ejecucion diferida.
- `async`/`await` evita bloqueo de hilos en operaciones I/O-bound.
- `Task` representa una operacion asincrona; `Task<T>` representa una operacion que produce un valor.
- Componer consultas LINQ es eficiente gracias a la ejecucion diferida.
