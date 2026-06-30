---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M13 - Performance y Optimizacion

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] `Span<T>` es un `ref struct` y tiene restricciones importantes: no puede ser usado como campo en una clase, no puede ser boxeado, no puede usarse en closures de lambdas, ni como tipo de retorno en metodos async. Explica por que existen estas restricciones y como `Memory<T>` las resuelve.

**Respuesta**: `Span<T>` es un `ref struct` porque contiene un puntero administrado (byref) que puede apuntar al stack, al heap managed o a memoria nativa. El GC necesita saber que ese puntero existe para no mover la memoria durante las compactaciones. Permitir `Span<T>` como campo de clase haria que el GC tuviera que rastrear punteros managed en el heap, lo que es costoso. En metodos async, el state machine puede guardar el Span en el heap (los metodos async se convierten en una maquina de estados en el heap), violando la restriccion. `Memory<T>` es la version de heap-safe: envuelve un `object` y un offset, permitiendo almacenarse en el heap y usarse en async.

**Por que**: El diseno de Span<T> fue uno de los mas desafiantes del equipo de .NET Core (Stephen Toub, Levi Broderick). La solucion fue crear dos tipos: Span<T> (ref struct, solo stack) para operaciones sincronas de alto rendimiento, y Memory<T> (struct normal, heap-safe) para almacenamiento y async. Fuente: "Span<T> and Memory<T>" - Stephen Toub, y la documentacion de Memory<T> en .NET.

---

### 2. [Investigar] BenchmarkDotNet evita muchos errores comunes de benchmarking: calentamiento (warmup), iteraciones de pilotaje, estadisticas y deteccion de outliers. Explica como funciona el ciclo de BenchmarkDotNet internamente y por que un benchmarking manual con `Stopwatch` suele dar resultados erroneos.

**Respuesta**: BenchmarkDotNet ejecuta: (1) warmup (3 iteraciones que no se miden) para que el JIT compile y el cache se estabilice, (2) pilot (estima cuantas iteraciones necesitar), (3) work (ejecuta las iteraciones reales), (4) overhead (mide el costo de invocacion del metodo, loop overhead). Luego aplica estadisticas: media, mediana, desviacion estandar, min/max, y detecta outliers con el metodo de Tukey (Q1/Q3). Un benchmark con Stopwatch manual tipicamente no hace warmup, no elimina outliers, no mide overhead, y no se ejecuta suficientes veces para obtener significancia estadistica.

**Por que**: Stephen Toub, Adam Sitnik y el equipo de BenchmarkDotNet documentaron extensamente los pitfalls del benchmarking manual. El warmup es critico porque el JIT de .NET aplica optimizaciones progresivas (tiered compilation). Sin warmup, el codigo se ejecuta sin optimizar. Fuente: BenchmarkDotNet documentation, y "Benchmarking in .NET" - Adam Sitnik.

---

### 3. [Investigar] .NET Core tiene *tiered compilation* (JIT de dos niveles). Explica como funciona, por que puede hacer que el codigo sea mas lento en warmup y mas rapido despues, y como afecta a los benchmarks.

**Respuesta**: Tiered compilation compila inicialmente metodos rapidamente (Tier 0) sin optimizaciones, permitiendo que la aplicacion arranque rapido. Luego, un background thread identifica los metodos que se ejecutan frecuentemente (hot methods) y los recompila con optimizaciones completas (Tier 1). Esto significa que en warmup el codigo corre sin optimizar, y luego de varias iteraciones se vuelve mas rapido. Los benchmarks con pocas iteraciones (o manuales con Stopwatch) miden Tier 0, no Tier 1, dando resultados incorrectos.

**Por que**: Tiered compilation fue introducido en .NET Core 3.0 para mejorar el tiempo de arranque de aplicaciones (especialmente serverless y microservicios). El trade-off es que la primera ejecucion de metodos es mas lenta. BenchmarkDotNet maneja esto con warmup iterations que aseguran que todos los metodos esten en Tier 1 antes de medir. Fuente: "Tiered Compilation in .NET" - docs.microsoft.com, y analisis de performance en blogs de .NET.

---

### 4. [Conectar] El uso de `struct` en lugar de `class` para objetos de valor inmutables puede mejorar el rendimiento, pero tiene riesgos: (1) pasar structs grandes por valor copia todos los campos, (2) boxing cuando se asignan a `object` o interfaces, (3) `readonly` struct evita copias defensivas. Explica que son las copias defensivas y como `in` parameters y `ref readonly` return las evitan.

**Respuesta**: Cuando pasas un struct no `readonly` a un metodo que espera `in` (by reference), el compilador crea una copia defensiva del struct antes de pasarlo, porque no puede garantizar que el metodo no modifique el struct (el metodo podria llamar a un setter mutante). Con `readonly struct` no hay copia defensiva porque el compilador sabe que es inmutable. `ref readonly return` permite devolver una referencia a un struct sin copiarlo, mejorando rendimiento para structs grandes. El patron `in` + `readonly struct` es la combinacion optima.

**Por que**: Las copias defensivas fueron una fuente de bugs de rendimiento en codigo C# de alto rendimiento (Unity, ASP.NET Core). El equipo de C# agrego `readonly struct`, `in` y `ref readonly` para dar a los desarrolladores herramientas para evitar estas copias. Fuente: "Performance traps with structs" - Stephen Toub, y C# 7.2 features documentation.

---

### 5. [Cuestionar] La optimizacion prematura es "la raiz de todos los males" (Knuth). Sin embargo, en .NET existen anti-patrones de rendimiento que deberian evitarse incluso en codigo temprano. Cuales son los anti-patrones que consideras que deben evitarse desde el inicio (sin esperar a medir)?

**Respuesta**: (1) LINQ en bucles de colecciones grandes sin materializar (multiple enumeraciones): `var q = lista.Where(x); foreach(...) { if(q.Any())... }` - enumeras 2 veces. (2) Strings inmutables en bucles: concatenar miles de strings en vez de StringBuilder. (3) async/await en operaciones CPU-bound rapidas: `await Task.Run(() => operacionRapida())` agrega overhead de cambio de contexto. (4) Excepciones para control de flujo: `int.Parse` en un bucle cuando esperas que falle frecuentemente (usar TryParse). (5) Boxing de structs en colecciones no genericas: `ArrayList` en vez de `List<T>`. (6) Reflection en hot paths sin cachear: `prop.GetValue(obj)` en bucle sin cachear PropertyInfo. (7) Thread.Sleep para sincronizacion en vez de async/await o Task.Delay.
