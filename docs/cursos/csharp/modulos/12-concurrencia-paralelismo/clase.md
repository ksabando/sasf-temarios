---
sidebar_label: "Clase"
---

## 1. Threads y Task Parallel Library (TPL)

```csharp
// Thread clasico (bajo nivel)
var thread = new Thread(() => Console.WriteLine("Hilo ejecutandose"));
thread.Start();
thread.Join();   // espera que termine

// Task (TPL - alto nivel, preferido)
Task tarea = Task.Run(() => Console.WriteLine("Tarea ejecutandose"));
await tarea;
```

### Task Creation

```csharp
// Task que retorna valor
Task<int> tareaCalculo = Task.Run(() =>
{
    Thread.Sleep(1000);
    return 42;
});
int resultado = await tareaCalculo;

// Task con estado
var tareaCompleja = new Task<Producto>(() => new Producto("Laptop", 1500m, 10));
tareaCompleja.Start();
var producto = await tareaCompleja;
```

---

## 2. CancellationToken

Permite cancelar operaciones de forma cooperativa.

```csharp
public async Task<List<Producto>> CargarProductosAsync(CancellationToken ct)
{
    var productos = new List<Producto>();

    for (int i = 0; i < 100; i++)
    {
        ct.ThrowIfCancellationRequested();  // lanza OperationCanceledException
        productos.Add(new Producto($"Producto {i}", 10m, 100));
        await Task.Delay(50, ct);           // Task.Delay acepta CancellationToken
    }

    return productos;
}

// Uso
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));
try
{
    var lista = await CargarProductosAsync(cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("Operacion cancelada por timeout");
}
```

---

## 3. Paralelismo con PLINQ y Parallel

```csharp
// Parallel.For
Parallel.For(0, 100, i =>
{
    Console.WriteLine($"Procesando item {i} en thread {Thread.CurrentThread.ManagedThreadId}");
});

// Parallel.ForEach
Parallel.ForEach(productos, producto =>
{
    producto.AjustarStock(-1);
});

// Parallel.Invoke
Parallel.Invoke(
    () => Console.WriteLine("Tarea 1"),
    () => Console.WriteLine("Tarea 2"),
    () => Console.WriteLine("Tarea 3")
);

// PLINQ (Parallel LINQ)
var resultadoParalelo = productos
    .AsParallel()
    .WithDegreeOfParallelism(4)   // maximo 4 threads
    .Where(p => p.Precio > 100)
    .OrderBy(p => p.Nombre)
    .ToList();
```

---

## 4. Colecciones Concurrentes

```csharp
using System.Collections.Concurrent;

// ConcurrentDictionary (thread-safe, mejor que lock+Dictionary)
var cache = new ConcurrentDictionary<string, Producto>();
cache.TryAdd("LAP-001", new Producto("Laptop", 1500m, 10));
var laptop = cache.GetOrAdd("LAP-001", key => new Producto(key, 0, 0));

// ConcurrentQueue (FIFO thread-safe)
var cola = new ConcurrentQueue<Producto>();
cola.Enqueue(new Producto("Mouse", 25m, 100));
cola.TryDequeue(out var resultado);

// ConcurrentBag (orden no garantizado, thread-safe)
var bolsa = new ConcurrentBag<Producto>();
bolsa.Add(new Producto("Teclado", 50m, 200));

// BlockingCollection (productor-consumidor con bounded capacity)
var bc = new BlockingCollection<Producto>(boundedCapacity: 10);
Task.Run(() => { while (true) bc.Add(new Producto("Mouse", 25m, 100)); });
Task.Run(() => { foreach (var p in bc.GetConsumingEnumerable()) Console.WriteLine(p.Nombre); });
```

---

## 5. Channels (System.Threading.Channels)

Canal productor-consumidor asincrono moderno con backpressure.

```csharp
using System.Threading.Channels;

var channel = Channel.CreateBounded<Producto>(new BoundedChannelOptions(100)
{
    FullMode = BoundedChannelFullMode.Wait  // productor espera si canal lleno
});

// Productor
async Task ProductorAsync(ChannelWriter<Producto> writer)
{
    for (int i = 0; i < 1000; i++)
    {
        var producto = new Producto($"Producto {i}", 10m, 100);
        await writer.WriteAsync(producto);
    }
    writer.Complete();
}

// Consumidor
async Task ConsumidorAsync(ChannelReader<Producto> reader)
{
    await foreach (var producto in reader.ReadAllAsync())
    {
        Console.WriteLine($"Procesado: {producto.Nombre}");
        await Task.Delay(10);  // simula procesamiento
    }
}

// Ejecutar
var productor = ProductorAsync(channel.Writer);
var consumidor = ConsumidorAsync(channel.Reader);
await Task.WhenAll(productor, consumidor);
```

---

## 6. AsyncLocal (Contexto por Flujo Asincrono)

```csharp
// AsyncLocal mantiene valor por flujo asincrono (no global)
private static readonly AsyncLocal<string> _correlationId = new();

public static string CorrelationId
{
    get => _correlationId.Value ??= Guid.NewGuid().ToString();
    set => _correlationId.Value = value;
}

// Uso - cada flujo tiene su propio valor
async Task ProcesarRequestAsync()
{
    CorrelationId = Guid.NewGuid().ToString();
    await Paso1();
    await Paso2();
}
```

---

## 7. Ejemplo Completo: Pipeline de Procesamiento Concurrente

```csharp
using System.Threading.Channels;

public class PipelineProcesamiento
{
    private readonly Channel<Producto> _entrada = Channel.CreateUnbounded<Producto>();
    private readonly Channel<Producto> _salida = Channel.CreateUnbounded<Producto>();
    private readonly CancellationTokenSource _cts = new();

    public async Task IniciarAsync(int consumidores = 4)
    {
        // Iniciar consumidores paralelos
        var tareas = new List<Task>();
        for (int i = 0; i < consumidores; i++)
            tareas.Add(ConsumirAsync(i));

        // Simular produccion
        for (int i = 0; i < 100; i++)
            await _entrada.Writer.WriteAsync(new Producto($"Producto {i}", 10m, 100));

        _entrada.Writer.Complete();
        await Task.WhenAll(tareas);
    }

    private async Task ConsumirAsync(int id)
    {
        await foreach (var producto in _entrada.Reader.ReadAllAsync())
        {
            Console.WriteLine($"[Consumidor {id}] Procesando {producto.Nombre}");
            await Task.Delay(20);  // simula trabajo
            await _salida.Writer.WriteAsync(producto);
        }
    }
}
```

---

## 8. Buenos Practicas

- Preferir Task sobre Thread (Task es mas abstracto, eficiente y componible)
- Usar CancellationToken para todas las operaciones asincronas que puedan cancelarse
- `ConcurrentDictionary` es la coleccion thread-safe mas util
- Channels son la opcion moderna para pipelines productor-consumidor
- No usar `Parallel.For` para operaciones I/O-bound (usar Task.WhenAll)
- PLINQ es util para consultas CPU-bound con colecciones grandes
- AsyncLocal es para contexto transversal (correlationId, tenant), no para datos de negocio

## Resumen

- Task Parallel Library abstrae la gestion de threads con Task y Task<T>.
- CancellationToken permite cancelacion cooperativa.
- PLINQ y Parallel.For paralelizan operaciones CPU-bound.
- ConcurrentDictionary, ConcurrentQueue y Channel son colecciones thread-safe.
- Channels implementan el patron productor-consumidor moderno con backpressure.
- La concurrencia en .NET es segura cuando se usan las herramientas adecuadas.
