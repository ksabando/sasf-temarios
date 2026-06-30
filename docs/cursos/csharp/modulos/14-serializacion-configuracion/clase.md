---
sidebar_label: "Clase"
---

## 1. Serializacion XML

```csharp
using System.Xml.Serialization;

[XmlRoot("Producto")]
public class ProductoXml
{
    [XmlElement("Nombre")]
    public string Nombre { get; set; } = string.Empty;

    [XmlAttribute("Moneda")]
    public string Moneda { get; set; } = "USD";

    [XmlIgnore]
    public decimal Precio { get; set; }

    [XmlArray("Categorias")]
    [XmlArrayItem("Categoria")]
    public List<string> Categorias { get; set; } = new();
}

// Serializar
var producto = new ProductoXml { Nombre = "Laptop", Precio = 1500m, Categorias = { "Electronica" } };
var serializer = new XmlSerializer(typeof(ProductoXml));

using var writer = new StreamWriter("producto.xml");
serializer.Serialize(writer, producto);

// Deserializar
using var reader = new StreamReader("producto.xml");
var deserializado = (ProductoXml)serializer.Deserialize(reader)!;
```

---

## 2. Serializacion JSON Avanzada (System.Text.Json)

```csharp
using System.Text.Json;
using System.Text.Json.Serialization;

// Polimorfismo
[JsonDerivedType(typeof(ProductoFisico), "fisico")]
[JsonDerivedType(typeof(ProductoDigital), "digital")]
public class ProductoBase
{
    public string Nombre { get; set; } = string.Empty;
}

public class ProductoFisico : ProductoBase
{
    public decimal Peso { get; set; }
}

public class ProductoDigital : ProductoBase
{
    public string Url { get; set; } = string.Empty;
}

// JSON con polimorfismo
var options = new JsonSerializerOptions
{
    WriteIndented = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
};

var productos = new List<ProductoBase>
{
    new ProductoFisico { Nombre = "Laptop", Peso = 2.5m },
    new ProductoDigital { Nombre = "Ebook", Url = "https://ejemplo.com" }
};

string json = JsonSerializer.Serialize(productos, options);
var deserializados = JsonSerializer.Deserialize<List<ProductoBase>>(json, options);
```

### Source Generators (maximo rendimiento)

```csharp
[JsonSerializable(typeof(Producto))]
[JsonSerializable(typeof(List<Producto>))]
internal partial class AppJsonContext : JsonSerializerContext { }

// Uso
string json = JsonSerializer.Serialize(lista, AppJsonContext.Default.ListProducto);
var listaDes = JsonSerializer.Deserialize(json, AppJsonContext.Default.ListProducto);
```

### Convertidores personalizados

```csharp
public class DineroConverter : JsonConverter<decimal>
{
    public override decimal Read(ref Utf8JsonReader reader, Type type, JsonSerializerOptions options)
        => reader.GetDecimal();

    public override void Write(Utf8JsonWriter writer, decimal value, JsonSerializerOptions options)
    {
        writer.WriteNumberValue(Math.Round(value, 2));
    }
}

var opts = new JsonSerializerOptions();
opts.Converters.Add(new DineroConverter());
```

---

## 3. Serializacion Binaria (obsoleto en .NET)

```csharp
// BinaryFormatter esta obsoleto por vulnerabilidades de seguridad
// Alternativa: System.Text.Json, ProtoBuf, MessagePack

// MessagePack (binario, rapido)
using MessagePack;

[MessagePackObject]
public class ProductoMsgPack
{
    [Key(0)]
    public string Nombre { get; set; } = string.Empty;
    [Key(1)]
    public decimal Precio { get; set; }
    [Key(2)]
    public int Stock { get; set; }
}

byte[] bytes = MessagePackSerializer.Serialize(new ProductoMsgPack
{
    Nombre = "Laptop", Precio = 1500m, Stock = 10
});

var deserializado = MessagePackSerializer.Deserialize<ProductoMsgPack>(bytes);
```

---

## 4. Configuration en .NET

```csharp
using Microsoft.Extensions.Configuration;

// appsettings.json
// {
//   "ConnectionStrings": { "Default": "Server=..." },
//   "FeatureFlags": { "EnableCache": true }
// }

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{env}.json", optional: true)
    .AddEnvironmentVariables()
    .Build();

// Acceso directo
string connStr = configuration.GetConnectionString("Default");
bool enableCache = configuration.GetValue<bool>("FeatureFlags:EnableCache");

// Options pattern
public class FeatureFlags
{
    public bool EnableCache { get; set; }
    public int MaxItems { get; set; } = 100;
}

var features = configuration.GetSection("FeatureFlags").Get<FeatureFlags>();
```

---

## 5. Manejo de Configuracion por Ambiente

```csharp
// appsettings.json (base)
// appsettings.Development.json (desarrollo)
// appsettings.Production.json (produccion)

// En Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

// Ejemplo de valores por ambiente
// Development: ConnectionStrings.Default = "Server=localhost;..."
// Production: ConnectionStrings.Default proviene de variable de entorno
```

---

## 6. Ejemplo Completo: Aplicacion Configurable

```csharp
public class ConfiguracionApp
{
    private readonly IConfiguration _config;

    public ConfiguracionApp(IConfiguration config) => _config = config;

    public string ObtenerConnectionString()
        => _config.GetConnectionString("Default") ?? throw new InvalidOperationException("Connection string no configurada");

    public T ObtenerSeccion<T>(string nombreSeccion) where T : new()
        => _config.GetSection(nombreSeccion).Get<T>() ?? new T();

    public bool EstaHabilitado(string feature)
        => _config.GetValue<bool>($"FeatureFlags:{feature}");
}

// appsettings.json
{
  "Logging": { "LogLevel": { "Default": "Information" } },
  "ConnectionStrings": { "Default": "Server=(localdb)\\MSSQLLocalDB;Database=Tienda" },
  "FeatureFlags": { "EnableCache": true, "MaxItems": 500 },
  "TasaImpuesto": 0.21
}
```

---

## 7. Buenos Practicas

- Preferir `System.Text.Json` sobre Newtonsoft en proyectos nuevos
- Usar source generators de System.Text.Json para alto rendimiento
- No usar BinaryFormatter (obsoleto por seguridad)
- Options Pattern: agrupar configuracion en clases tipadas
- Siempre tener valores por defecto en las clases de configuracion
- Usar `IOptionsSnapshot` o `IOptionsMonitor` para recarga en caliente
- No hardcodear connection strings ni secretos

## Resumen

- System.Text.Json es el serializador JSON oficial con soporte de source generators.
- XML sigue siendo relevante para interoperabilidad con sistemas legacy.
- MessagePack es la alternativa binaria mas popular a BinaryFormatter.
- Configuration Builder permite cargar configuracion de multiples fuentes.
- Options Pattern tipa la configuracion y permite inyeccion de dependencias.
- La configuracion por ambiente es esencial para aplicaciones empresariales.
