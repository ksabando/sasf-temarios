---
sidebar_label: "Clase"
---

## 1. Introduccion a la Reflexion

La reflexion permite inspeccionar ensamblados, tipos, metodos y propiedades en tiempo de ejecucion. Es la base de frameworks como ASP.NET Core, Entity Framework y contenedores DI.

```csharp
using System.Reflection;

Type tipo = typeof(Producto);
Console.WriteLine($"Nombre: {tipo.Name}");
Console.WriteLine($"Namespace: {tipo.Namespace}");
Console.WriteLine($"Es publico: {tipo.IsPublic}");
Console.WriteLine($"Es clase: {tipo.IsClass}");
```

### Obtener informacion de tipo desde una instancia

```csharp
Producto producto = new("Laptop", 1500m, 10);
Type tipoProducto = producto.GetType();

// Propiedades
foreach (PropertyInfo prop in tipoProducto.GetProperties())
    Console.WriteLine($"{prop.Name}: {prop.PropertyType.Name}");

// Metodos
foreach (MethodInfo metodo in tipoProducto.GetMethods(BindingFlags.Public | BindingFlags.Instance))
    Console.WriteLine($"{metodo.ReturnType.Name} {metodo.Name}");

// Atributos personalizados
var atributos = tipoProducto.GetCustomAttributes(inherit: false);
```

---

## 2. Atributos Personalizados

Los atributos agregan metadatos a tipos, propiedades o metodos. Son esenciales para serializacion, validacion y frameworks.

```csharp
// Definir un atributo personalizado
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
public class ValidarRangoAttribute : Attribute
{
    public double Minimo { get; }
    public double Maximo { get; }

    public ValidarRangoAttribute(double minimo, double maximo)
    {
        Minimo = minimo;
        Maximo = maximo;
    }
}

// Usar el atributo
public class Producto
{
    [ValidarRango(0.01, 100000)]
    public decimal Precio { get; set; }

    [ValidarRango(0, 10000)]
    public int Stock { get; set; }
}

// Validar usando reflexion
public static class Validador
{
    public static List<string> Validar(object obj)
    {
        var errores = new List<string>();
        var tipo = obj.GetType();

        foreach (var prop in tipo.GetProperties())
        {
            var atributo = prop.GetCustomAttribute<ValidarRangoAttribute>();
            if (atributo is null) continue;

            var valor = Convert.ToDouble(prop.GetValue(obj));
            if (valor < atributo.Minimo || valor > atributo.Maximo)
                errores.Add($"{prop.Name} debe estar entre {atributo.Minimo} y {atributo.Maximo}");
        }

        return errores;
    }
}
```

---

## 3. Atributos Incorporados Comunes

```csharp
[Obsolete("Usar CalcularDescuento(decimal) en su lugar")]
public decimal CalcularDescuento() => 0;

[Serializable]
public class ProductoDto { }

[Conditional("DEBUG")]
public void LoggearDesarrollo() => Console.WriteLine("Debug only");
```

| Atributo | Uso |
|----------|-----|
| `[Obsolete]` | Marca codigo como deprecado |
| `[Serializable]` | Permite serializacion binaria |
| `[Conditional]` | Compila solo si el simbolo esta definido |
| `[CallerMemberName]` | Obtiene nombre del llamante en tiempo de compilacion |
| `[DebuggerDisplay]` | Personaliza la vista en el debugger |
| `[JsonPropertyName]` | Controla nombres en JSON |
| `[Required]`, `[Range]` | Validacion de datos (DataAnnotations) |

---

## 4. Creacion Dinamica de Objetos

```csharp
// Crear instancia sin conocer el tipo en compilacion
Type tipo = typeof(Producto);
object? instancia = Activator.CreateInstance(tipo);

// Con parametros en el constructor
object? conParams = Activator.CreateInstance(tipo, new object[] { "Mouse", 25m, 100 });

// Invocar metodos en tiempo de ejecucion
var metodo = tipo.GetMethod("AjustarStock");
metodo?.Invoke(conParams, new object[] { -5 });
```

---

## 5. Atributos de Validacion (DataAnnotations)

```csharp
using System.ComponentModel.DataAnnotations;

public class ProductoRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    [StringLength(100, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [Range(0.01, 100000)]
    public decimal Precio { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public int Stock { get; set; }
}

// Validacion programatica
var request = new ProductoRequest { Nombre = "", Precio = 0, Stock = -1 };
var resultados = new List<ValidationResult>();
var contexto = new ValidationContext(request);

bool valido = Validator.TryValidateObject(request, contexto, resultados, validateAllProperties: true);
if (!valido)
    foreach (var error in resultados)
        Console.WriteLine(error.ErrorMessage);
```

---

## 6. Ejemplo Completo: Validador Generico por Atributos

```csharp
public class ValidadorReflexion
{
    public static List<string> Validar<T>(T obj) where T : class
    {
        var errores = new List<string>();
        var tipo = typeof(T);

        foreach (var prop in tipo.GetProperties())
        {
            var valor = prop.GetValue(obj);

            // Validar RequiredAttribute
            if (prop.GetCustomAttribute<RequiredAttribute>() is not null)
                if (valor is null || (valor is string s && string.IsNullOrWhiteSpace(s)))
                    errores.Add($"{prop.Name} es requerido");

            // Validar RangeAttribute
            if (prop.GetCustomAttribute<RangeAttribute>() is RangeAttribute rango)
                if (Convert.ToDouble(valor) < (double)rango.Minimum || Convert.ToDouble(valor) > (double)rango.Maximum)
                    errores.Add($"{prop.Name} debe estar entre {rango.Minimum} y {rango.Maximum}");

            // Validar StringLengthAttribute
            if (prop.GetCustomAttribute<StringLengthAttribute>() is StringLengthAttribute str)
                if (valor is string texto && (texto.Length < str.MinimumLength || texto.Length > str.MaximumLength))
                    errores.Add($"{prop.Name} debe tener entre {str.MinimumLength} y {str.MaximumLength} caracteres");
        }

        return errores;
    }
}
```

---

## 7. Buenos Practicas

- No usar reflexion en codigo de alto rendimiento (hot paths) sin cachear los metadatos
- Cachear `PropertyInfo`, `MethodInfo` y `FieldInfo` en diccionarios estaticos
- Preferir expresiones arbol (Expression Trees) sobre reflexion cuando sea posible
- Usar `GetCustomAttribute<T>()` en vez de `GetCustomAttributes(typeof(T))` (menos casteo)
- Los atributos son metadatos, no deben contener logica de negocio compleja
- En validacion, prefiera DataAnnotations sobre validacion manual por reflexion

## Resumen

- La reflexion permite inspeccionar y manipular tipos en tiempo de ejecucion.
- Los atributos agregan metadatos reutilizables a tipos, propiedades y metodos.
- `Activator.CreateInstance` crea objetos sin conocer el tipo en compilacion.
- DataAnnotations es el sistema de validacion declarativa mas usado en .NET.
- La reflexion es poderosa pero costosa: cachear resultados cuando se use repetidamente.
