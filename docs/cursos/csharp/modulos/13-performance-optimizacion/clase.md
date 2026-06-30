---
sidebar_label: "Clase"
---

## 1. Span<T> y Memory<T>

`Span<T>` es un tipo por referencia (ref struct) que permite operaciones seguras sobre memoria contigua sin asignar en el heap. `Memory<T>` es su version que puede almacenarse en el heap.

```csharp
// Span sobre array
int[] numeros = { 1, 2, 3, 4, 5 };
Span<int> span = numeros;
span[0] = 10;  // modifica el array original

// Slice sin copia
Span<int> slice = span[1..4];  // {2, 3, 4}, sin allocacion
slice[0] = 20;                 // numeros[1] ahora es 20

string texto = "Hola, mundo";
ReadOnlySpan<char> charSpan = texto.AsSpan();
ReadOnlySpan<char> saludo = charSpan[..4];  // "Hola"

// Parsear con Span (evita allocaciones de string)
public static int? TryParseInt(ReadOnlySpan<char> input)
{
    if (int.TryParse(input, out int result))
        return result;
    return null;
}
```

### Performance comparativa

```csharp
// Sin Span: allocacion de substring
string texto = "Hola, mundo, esto es una prueba";
string sub = texto.Substring(6, 5);  // "mundo" - aloca un nuevo string

// Con Span: sin allocacion
ReadOnlySpan<char> span = texto.AsSpan();
ReadOnlySpan<char> subSpan = span[6..11];  // "mundo" - sin allocacion
```

---

## 2. Benchmarking con BenchmarkDotNet

BenchmarkDotNet es la libreria oficial para medir rendimiento en .NET.

```csharp
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;

[MemoryDiagnoser]           // mide allocaciones
[SimpleJob(launchCount: 1, warmupCount: 3, iterationCount: 10)]
public class ParseBenchmark
{
    private const string Texto = "12345";
    private ReadOnlySpan<char> SpanTexto => Texto.AsSpan();

    [Benchmark(Baseline = true)]
    public int ParseString() => int.Parse(Texto);

    [Benchmark]
    public int ParseSpan() => int.Parse(SpanTexto);
}

// Ejecutar
// BenchmarkRunner.Run<ParseBenchmark>();
```

---

## 3. String y StringBuilder

```csharp
// MAL: concatenacion repetitiva (crea multiples strings temporales)
string resultado = "";
for (int i = 0; i < 1000; i++)
    resultado += i.ToString();   // 1000 strings temporales!

// BIEN: StringBuilder
var sb = new StringBuilder();
for (int i = 0; i < 1000; i++)
    sb.Append(i);
string resultadoFinal = sb.ToString();

// Mejor aun: string.Join (para arrays/listas)
string csv = string.Join(",", numeros);

// String.Create (maximo rendimiento)
string resultadoRapido = string.Create(10, (42, "test"), (span, state) =>
{
    state.test.AsSpan().CopyTo(span);
    //...
});
```

---

## 4. Pooling y Reutilizacion

```csharp
using System.Buffers;

// ArrayPool: reutiliza arrays grandes
byte[] buffer = ArrayPool<byte>.Shared.Rent(4096);
try
{
    // usar buffer
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer);
}

// ObjectPool para objetos costosos
public class MiObjetoPooled
{
    public int[] Datos { get; set; } = Array.Empty<int>();
}

var pool = new DefaultObjectPool<MiObjetoPooled>(new DefaultPooledObjectPolicy<MiObjetoPooled>());

var obj = pool.Get();
try { /* usar */ }
finally { pool.Return(obj); }
```

---

## 5. Struct vs Class (Performance)

```csharp
// Struct (value type, stack/heap segun contexto)
public readonly struct Precio
{
    public decimal Monto { get; }
    public string Moneda { get; }

    public Precio(decimal monto, string moneda)
    {
        Monto = monto;
        Moneda = moneda;
    }
}

// Class (reference type, heap siempre)
public class PrecioClase
{
    public decimal Monto { get; }
    public string Moneda { get; }
    public PrecioClase(decimal monto, string moneda) => (Monto, Moneda) = (monto, moneda);
}
```

| Aspecto | struct | class |
|---------|--------|-------|
| Ubicacion | Stack (o inline en array) | Heap |
| Asignacion | Barato | Costo de allocacion + GC |
| Paso por parametro | Copia | Referencia |
| GC | No | Si |
| Nullable | `Precio?` | Siempre nullable por referencia |

---

## 6. Analisis de Allocaciones

```csharp
// Herramientas para analizar allocaciones:
// 1. BenchmarkDotNet con [MemoryDiagnoser]
// 2. dotnet-trace (eventos de GC)
// 3. Visual Studio Diagnostic Tools
// 4. PerfView (avanzado)

// EJEMPLO: medir allocaciones
[MemoryDiagnoser]
public class AllocBenchmark
{
    [Benchmark]
    public List<int> CrearLista() => new() { 1, 2, 3 };

    [Benchmark]
    public int[] CrearArray() => new[] { 1, 2, 3 };  // menos allocacion
}
```

---

## 7. Ejemplo Completo: Procesador de Archivos Optimizado

```csharp
using System.Buffers;

public class ProcesadorArchivos
{
    public async Task<Dictionary<string, int>> ContarPalabrasAsync(string ruta)
    {
        var resultado = new Dictionary<string, int>();
        using var reader = new StreamReader(ruta);
        char[] buffer = ArrayPool<char>.Shared.Rent(4096);

        try
        {
            int charsRead;
            while ((charsRead = await reader.ReadAsync(buffer.AsMemory(0, buffer.Length))) > 0)
            {
                var span = buffer.AsSpan(0, charsRead);
                // Procesar sin crear strings temporales
                ProcesarSpan(span, resultado);
            }
        }
        finally
        {
            ArrayPool<char>.Shared.Return(buffer);
        }

        return resultado;
    }

    private void ProcesarSpan(ReadOnlySpan<char> span, Dictionary<string, int> resultado)
    {
        // logica de procesamiento...
    }
}
```

---

## 8. Buenos Practicas

- Usar `Span<T>` y `ReadOnlySpan<T>` para procesamiento de strings y buffers sin allocar
- BenchmarkDotNet es la unica forma confiable de medir rendimiento
- StringBuilder cuando concatenas mas de 3-4 strings en un bucle
- `ArrayPool` para buffers temporales grandes
- Preferir struct para datos pequenos e inmutables (menos de 16 bytes)
- Usar `string.Create` para construir strings con formato complejo
- Medir antes de optimizar: no asumas, perfila

## Resumen

- Span<T> permite operaciones seguras sobre memoria sin allocaciones.
- BenchmarkDotNet es indispensable para medir y optimizar rendimiento.
- StringBuilder, ArrayPool y ObjectPool reducen allocaciones en heap.
- Los struct evitan presion de GC para datos pequenos.
- char[] pooled es mejor que string para parsing intensivo.
- La optimizacion prematura es la raiz de todos los males (pero medir no es optimizar).
