---
sidebar_label: "Clase"
---

## 1. Arrays

Los arrays son colecciones de tamaño fijo del mismo tipo. Se usan cuando la cantidad de elementos es conocida y no cambiara.

```csharp
// Declaracion e inicializacion
int[] numeros = new int[5];          // {0, 0, 0, 0, 0}
string[] nombres = new[] { "Ana", "Luis", "Pepe" };
decimal[] precios = { 10.5m, 20m, 5.25m };

// Acceso por indice (base 0)
numeros[0] = 100;
Console.WriteLine(numeros[0]);

// Recorrido
for (int i = 0; i < nombres.Length; i++)
    Console.WriteLine(nombres[i]);
```

| Propiedad | Descripcion |
|-----------|-------------|
| `Length` | Cantidad total de elementos |
| `Rank` | Numero de dimensiones |
| `Array.IndexOf` | Busca un elemento y devuelve su indice |
| `Array.Sort` | Ordena el array in-place |

---

## 2. Colecciones Genericas

### List<T>

Lista dinamica que crece segun se agregan elementos. Es la coleccion mas usada.

```csharp
var productos = new List<Producto>();

productos.Add(new Producto("Laptop", 1500m, 10));
productos.AddRange(nuevosProductos);    // agrega multiples
productos.RemoveAt(0);                  // elimina por indice
productos.Remove(producto);             // elimina por referencia

var primero = productos[0];             // acceso por indice
var cantidad = productos.Count;         // cantidad actual

// Busquedas
var encontrado = productos.Find(p => p.Nombre == "Laptop");
var existe = productos.Exists(p => p.Stock == 0);
```

### Dictionary<TKey, TValue>

Almacena pares clave-valor con busqueda rapida O(1) promedio.

```csharp
var stockPorCodigo = new Dictionary<string, int>();

stockPorCodigo["LAP-001"] = 50;
stockPorCodigo["LAP-002"] = 30;

if (stockPorCodigo.TryGetValue("LAP-001", out int cantidad))
    Console.WriteLine($"Stock: {cantidad}");

// Recorrido
foreach (var kvp in stockPorCodigo)
    Console.WriteLine($"{kvp.Key}: {kvp.Value}");
```

### HashSet<T>

Coleccion de elementos unicos sin orden definido.

```csharp
var categorias = new HashSet<string> { "Electronicos", "Ropa", "Electronicos" };
Console.WriteLine(categorias.Count); // 2 (ignora duplicado)
```

### Otras colecciones utiles

| Coleccion | Caracteristica | Uso |
|-----------|---------------|-----|
| `Stack<T>` | LIFO (ultimo en entrar, primero en salir) | Historial de acciones |
| `Queue<T>` | FIFO (primero en entrar, primero en salir) | Cola de procesamiento |
| `LinkedList<T>` | Lista doblemente enlazada | Insercion/eliminacion frecuente en medio |
| `SortedList<TKey,TValue>` | Diccionario ordenado por clave | Rangos ordenados |

---

## 3. Manejo de Excepciones

Las excepciones separan el flujo normal del flujo de error. Se usan para situaciones excepcionales, no para control de flujo regular.

```csharp
try
{
    int.Parse(entradaInvalida);
}
catch (FormatException ex)
{
    Console.WriteLine($"Formato invalido: {ex.Message}");
}
catch (OverflowException)
{
    Console.WriteLine("Numero demasiado grande");
}
finally
{
    // Se ejecuta siempre (haya o no excepcion)
    Console.WriteLine("Intento de parseo finalizado");
}
```

### Excepciones personalizadas

Para representar reglas de negocio especificas:

```csharp
public class StockInsuficienteException : Exception
{
    public string ProductoNombre { get; }
    public int StockActual { get; }
    public int CantidadSolicitada { get; }

    public StockInsuficienteException(string producto, int stock, int solicitada)
        : base($"Stock insuficiente para '{producto}': disponible {stock}, solicitada {solicitada}")
    {
        ProductoNombre = producto;
        StockActual = stock;
        CantidadSolicitada = solicitada;
    }
}

// Uso
if (producto.Stock < cantidad)
    throw new StockInsuficienteException(producto.Nombre, producto.Stock, cantidad);
```

### Buenos practicas con excepciones

| Practica | Explicacion |
|----------|-------------|
| Capturar el tipo mas especifico | No usar `catch (Exception)` a menos que sea necesario |
| No tragar excepciones | No hacer `catch { }` vacio |
| Usar excepciones para lo excepcional | No para control de flujo normal |
| Incluir datos contextuales | Pasar datos relevantes en excepciones personalizadas |
| Preferir `TryParse` sobre `Parse` | Evita excepciones por formato invalido |

---

## 4. Archivos y Serializacion

### Lectura y escritura basica

```csharp
using System.IO;

// Escribir
string contenido = "Hola, archivo!";
File.WriteAllText("datos.txt", contenido);

// Leer
string leido = File.ReadAllText("datos.txt");

// Linea por linea
var lineas = File.ReadAllLines("productos.txt");
foreach (var linea in lineas)
    Console.WriteLine(linea);
```

### Serializacion JSON con System.Text.Json

```csharp
using System.Text.Json;

public class Producto
{
    public string Nombre { get; set; }
    public decimal Precio { get; set; }
    public int Stock { get; set; }
}

// Serializar
var producto = new Producto { Nombre = "Mouse", Precio = 25m, Stock = 100 };
string json = JsonSerializer.Serialize(producto);
// {"Nombre":"Mouse","Precio":25,"Stock":100}

// Deserializar
var productoDes = JsonSerializer.Deserialize<Producto>(json);

// Lista completa
var productos = new List<Producto> { /* ... */ };
string jsonLista = JsonSerializer.Serialize(productos);
var listaDes = JsonSerializer.Deserialize<List<Producto>>(jsonLista);
```

### Opciones de serializacion

```csharp
var opciones = new JsonSerializerOptions
{
    WriteIndented = true,                        // formato legible
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

string json = JsonSerializer.Serialize(productos, opciones);
```

### StreamReader/StreamWriter (archivos grandes)

```csharp
using (var writer = new StreamWriter("productos.csv"))
{
    writer.WriteLine("Nombre,Precio,Stock");
    foreach (var p in productos)
        writer.WriteLine($"{p.Nombre},{p.Precio},{p.Stock}");
}

using (var reader = new StreamReader("productos.csv"))
{
    string linea;
    while ((linea = reader.ReadLine()) != null)
    {
        var partes = linea.Split(',');
        Console.WriteLine(partes[0]);
    }
}
```

La palabra clave `using` asegura que el recurso se cierre al salir del bloque.

---

## 5. Ejemplo Completo: Persistencia de Inventario

```csharp
using System.Text.Json;

public class InventarioService
{
    private readonly string _archivo = "inventario.json";
    private List<Producto> _productos = new();

    public void Cargar()
    {
        try
        {
            if (File.Exists(_archivo))
            {
                string json = File.ReadAllText(_archivo);
                _productos = JsonSerializer.Deserialize<List<Producto>>(json)
                             ?? new List<Producto>();
            }
        }
        catch (JsonException ex)
        {
            Console.WriteLine($"Error al leer inventario: {ex.Message}");
            _productos = new List<Producto>();
        }
    }

    public void Guardar()
    {
        var opciones = new JsonSerializerOptions { WriteIndented = true };
        string json = JsonSerializer.Serialize(_productos, opciones);
        File.WriteAllText(_archivo, json);
    }

    public void Agregar(Producto p)
    {
        _productos.Add(p);
        Guardar();
    }

    public List<Producto> Listar() => _productos.ToList();
}
```

---

## 6. Buenos Practicas

- Preferir `List<T>` sobre arrays cuando la cantidad puede variar
- Usar `Dictionary<TKey,TValue>` para busquedas por clave
- Evitar excepciones para control de flujo normal
- Usar `using` para liberar recursos de archivos
- Configurar `JsonSerializerOptions` explicitamente en produccion
- Separar logica de persistencia de la logica de negocio

## Resumen

- `List<T>` es la coleccion mas versatil para la mayoria de los casos.
- `Dictionary` ofrece busqueda O(1) por clave.
- Las excepciones deben representar situaciones excepcionales.
- `System.Text.Json` es el serializador oficial y preferido sobre Newtonsoft.Json en proyectos nuevos.
- El patron `using` garantiza que los recursos se liberen correctamente.
