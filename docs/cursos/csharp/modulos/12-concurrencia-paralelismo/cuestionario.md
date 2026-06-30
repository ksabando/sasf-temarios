---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M12 - Concurrencia y Paralelismo

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] La clase usa `Task.Run` para crear tareas. Sin embargo, `Task.Run` no siempre es la opcion correcta. Explica la diferencia entre `Task.Run`, `Task.Factory.StartNew`, `ValueTask`, `TaskCompletionSource` y cuándo usar cada uno.

**Respuesta**: `Task.Run` es un atajo que usa el ThreadPool y es la opcion recomendada para trabajo CPU-bound en background. `Task.Factory.StartNew` es mas configurable (TaskCreationOptions, TaskScheduler) pero requiere cuidado con el scheduler default (puede ejecutar sincrono si el scheduler actual es el mismo). `ValueTask<T>` evita allocacion cuando el resultado es sincrono. `TaskCompletionSource<T>` permite crear Tasks manualmente para operaciones basadas en eventos (callback -> Task). Regla general: usar `Task.Run` para CPU-bound, `await` natural para I/O-bound, `TaskCompletionSource` para interop con APIs legacy basadas en callbacks.

**Por que**: La confusion entre Task.Run y Task.Factory.StartNew causo bugs sutiles en proyectos .NET. Stephen Toub recomienda siempre `Task.Run` a menos que tengas una razon especifica para usar `StartNew`. `TaskCompletionSource` es esencial para adaptar APIs antiguas (APM, EAP) al patron TAP moderno. Fuente: "Task.Run vs Task.Factory.StartNew" - Stephen Toub, y "Async in C# 5.0" de Alex Davies.

---

### 2. [Investigar] El modelo `async`/`await` de C# no es paralelismo: es concurrencia basada en cooperacion. Explica la diferencia entre concurrencia (async/await), paralelismo (TPL, PLINQ) y paralelismo distribido (System.Threading.Tasks.Dataflow). En que escenarios cada uno es apropiado?

**Respuesta**: concurrencia (async/await): operaciones I/O-bound (archivos, API, BD) donde el hilo espera sin bloquearse. Un solo hilo puede manejar miles de operaciones concurrentes. Paralelismo (TPL/PLINQ): operaciones CPU-bound (calculo, procesamiento de datos) donde se usan multiples hilos en paralelo para acelerar. Dataflow (TPL Dataflow): pipelines de procesamiento con multiples etapas conectadas, cada una con su propio grado de paralelismo y buffer. Ejemplo: un web server usa concurrencia (async) para manejar requests; un procesador de imagenes usa paralelismo (Parallel.For) para filtrar; un ETL usa Dataflow para pipeline de extraccion-transformacion-carga.

**Por que**: La confusion entre concurrencia y paralelismo es comun. async/await no acelera una operacion individual (de hecho tiene overhead), pero permite que el sistema maneje mas operaciones simultaneas con menos recursos. Parallel acelera operaciones CPU-bound usando mas nucleos. Dataflow es para pipelines complejos con backpressure. Fuente: "Concurrency in C# Cookbook" de Stephen Cleary, y "Parallel Programming with .NET" de Stephen Toub.

---

### 3. [Investigar] Los `Channels` de `System.Threading.Channels` implementan el patron productor-consumidor con soporte de backpressure. Explica la diferencia entre `Channel.CreateBounded` y `Channel.CreateUnbounded`, que es `BoundedChannelFullMode`, y como se relaciona con la presion de contrapresion en sistemas de streaming.

**Respuesta**: `BoundedChannel` tiene capacidad maxima: cuando se llena, el comportamiento depende de `BoundedChannelFullMode`: (1) `Wait` - productor espera asincronamente, (2) `DropWrite` - descarta el item nuevo, (3) `DropOldest` - descarta el item mas antiguo para dar espacio, (4) `DropNewest` - descarta el nuevo inmediatamente. `UnboundedChannel` no tiene limite pero puede crecer sin control si el consumidor es mas lento. El backpressure (contrapresion) ocurre con `BoundedChannelFullMode.Wait`: si el consumidor es lento, el productor se frena automaticamente, regulando el flujo.

**Por que**: Channels fue disenado por el equipo de .NET (Stephen Toub) para escenarios de alto rendimiento donde BlockingCollection y BufferBlock eran ineficientes. Channels es la base de System.IO.Pipelines y de la comunicacion interna en ASP.NET Core. La capacidad de backpressure es esencial en sistemas de streaming y microservicios para evitar que un consumidor lento sature el sistema. Fuente: "Channels in .NET" - Stephen Toub, y System.Threading.Channels documentation.

---

### 4. [Conectar] La clase usa `AsyncLocal` para contexto de flujo. Explica como `AsyncLocal` se diferencia de `ThreadStatic`, `ThreadLocal<T>` y `CallContext.LogicalGetData`, y por que `AsyncLocal` es la opcion correcta para contexto en aplicaciones async modernas.

**Respuesta**: `ThreadStatic` almacena valor por thread fisico, pero en async las continuaciones pueden ejecutarse en threads diferentes (perdiendo el valor). `ThreadLocal<T>` tiene el mismo problema. `CallContext.LogicalGetData` (de .NET Framework) fluye con la ejecucion logica pero no funciona en .NET Core. `AsyncLocal<T>` fluye con el flujo de ejecucion asincrono: incluso si la continuacion cambia de thread, el valor se preserva. Esto lo hace ideal para correlation IDs, tenant IDs y contexto de transaccion.

**Por que**: El cambio de `CallContext` a `AsyncLocal` fue necesario porque .NET Core reescribio el ExecutionContext para ser mas eficiente. AsyncLocal es parte de `System.Threading` y funciona en todas las plataformas .NET. El equipo de .NET recomienda AsyncLocal como la unica opcion para contexto por flujo. Fuente: "AsyncLocal vs ThreadLocal" - Stephen Toub, y el redesign del ExecutionContext in .NET Core.

---

### 5. [Cuestionar] Algunos desarrolladores creen que async/await es "gratuito" (sin overhead). La realidad es que tiene costo: allocacion de estado machine, context switches, y complejidad de debugging. En que escenarios NO recomendarias async/await y preferirias sincrono?

**Respuesta**: No recomiendo async/await en: (1) metodos CPU-bound cortos (calculo matematico rapido) - agregas overhead sin beneficio, (2) constructores (no pueden ser async), (3) propiedades (no deberian ser async), (4) aplicaciones de consola simples sin concurrencia real, (5) operaciones extremadamente rapidas (< 50μs) donde el overhead del async state machine supera el tiempo de ejecucion, (6) metodos sincronos en librerias que se usan en bucles muy ajustados (hot paths). La regla: usar async para I/O-bound, evitar para CPU-bound rapido. Medir antes de optimizar.
