---
sidebar_position: 2
sidebar_label: "Temario"
---

## Modulo 01 - Fundamentos de C#

- Sintaxis base del lenguaje y estructura de un programa de consola.
- Tipos de datos (value types y reference types), variables, constantes y conversiones.
- Operadores aritmeticos, logicos y relacionales.
- Estructuras de control: `if`, `switch`, `for`, `while`, `foreach`.
- Interpolacion de cadenas y entrada/salida por consola.
- Parseo con `TryParse` vs `Parse`.
- Laboratorio: calculadora y validador simple de datos.

---

## Modulo 02 - Programacion Orientada a Objetos

- Clases, objetos, propiedades, metodos y constructores.
- Encapsulamiento y modificadores de acceso.
- Herencia, clases abstractas, interfaces y polimorfismo.
- Composicion vs herencia.
- Laboratorio: modelo de inventario con productos y categorias.

---

## Modulo 03 - Colecciones, Excepciones y Archivos

- Arrays, `List<T>`, `Dictionary<TKey,TValue>`, `HashSet<T>`, `Stack<T>`, `Queue<T>`.
- Manejo de errores con `try`, `catch`, `finally` y excepciones personalizadas.
- StreamReader/StreamWriter, File API.
- Serializacion JSON con `System.Text.Json`.
- Laboratorio: persistir inventario en archivo JSON con opciones de serializacion.

---

## Modulo 04 - LINQ y Programacion Asincrona

- Method syntax vs query syntax.
- Operadores: `Where`, `Select`, `OrderBy`, `GroupBy`, `Any`, `All`, `FirstOrDefault`, `Aggregate`.
- Ejecucion diferida vs inmediata (`ToList`, `Count`, `First`).
- `Task`, `async`, `await`, `Task.WhenAll`, `ConfigureAwait`.
- I/O-bound vs CPU-bound.
- Laboratorio: busquedas, filtros y carga asincrona de datos.

---

## Modulo 05 - Generics, Delegates y Eventos

- Tipos genericos, metodos genericos y restricciones (`where T : class`, `new()`).
- Delegates, `Action<T>`, `Func<T,TResult>`, `Predicate<T>` y lambdas.
- Eventos con `EventHandler<TEventArgs>` y patron publisher/subscriber.
- `INotifyPropertyChanged` para UI.
- Laboratorio: notificaciones de inventario por eventos.

---

## Modulo 06 - Nullable, Records y C# Moderno

- Nullable reference types (`#nullable enable`).
- Records (`record class`, `record struct`) y `with` expressions.
- Init-only properties.
- Pattern matching: type, property, tuple, positional, list y logical patterns.
- Top-level statements, global usings, file-scoped namespaces.
- Laboratorio: refactor del dominio usando C# moderno.

---

## Modulo 07 - Testing con xUnit

- [Fact], [Theory], [InlineData], [MemberData].
- Patron AAA (Arrange, Act, Assert).
- Mocks con NSubstitute.
- Pruebas parametrizadas y casos borde.
- Convencion de nombres.
- Laboratorio: tests unitarios para reglas de inventario.

---

## Modulo 08 - Proyecto Integrador C#

- Separacion en capas: dominio, aplicacion, infraestructura y presentacion.
- Interfaces de repositorio y fake en memoria para tests.
- Persistencia JSON asincrona.
- Validaciones, LINQ y pruebas unitarias.
- Menu de consola con manejo de errores.
- Proyecto final: app de consola mantenible y testeable.

---

## Modulo 09 - Reflexion y Atributos

- Reflexion: `Type`, `PropertyInfo`, `MethodInfo`, `Activator.CreateInstance`.
- Atributos personalizados (`[AttributeUsage]`, `[ValidarRango]`).
- Atributos incorporados: `[Obsolete]`, `[Serializable]`, `[CallerMemberName]`.
- DataAnnotations: `[Required]`, `[Range]`, `[StringLength]`.
- Validacion programatica con `ValidationContext` y `Validator`.
- Laboratorio: validador generico por atributos.

---

## Modulo 10 - Programacion Funcional

- Funciones puras, inmutabilidad y efectos secundarios.
- Higher-order functions y composicion con `Func<T>`.
- Currying y partial application.
- Patron `Option<T>` (Maybe) vs null.
- Tuplas con nombres semanticos y deconstruccion.
- Pipelines funcionales con `Aggregate`.
- Laboratorio: procesamiento funcional de pedidos.

---

## Modulo 11 - Patrones de Diseno en C#

- Creacionales: Factory Method, Singleton (con `Lazy<T>`), Builder.
- Estructurales: Adapter, Decorator (middleware pipeline).
- Comportamiento: Strategy, Observer (eventos), Repository.
- Inyeccion de dependencias manual vs contenedor DI.
- Mediator basico (CQRS sin librerias externas).
- Laboratorio: aplicar patrones en sistema de inventario.

---

## Modulo 12 - Concurrencia y Paralelismo

- Task Parallel Library: `Task.Run`, `Task.WhenAll`, `Task.WhenAny`.
- CancellationToken y cancelacion cooperativa.
- PLINQ y `Parallel.For`/`Parallel.ForEach`.
- Colecciones concurrentes: `ConcurrentDictionary`, `ConcurrentQueue`.
- Channels: `Channel<T>`, productor-consumidor con backpressure.
- `AsyncLocal<T>` para contexto por flujo.
- Laboratorio: pipeline de procesamiento concurrente con Channels.

---

## Modulo 13 - Performance y Optimizacion

- `Span<T>`, `ReadOnlySpan<T>`, `Memory<T>` (sin allocaciones).
- Benchmarking con BenchmarkDotNet (`[MemoryDiagnoser]`).
- StringBuilder, `string.Create`, `string.Join`.
- ArrayPool y ObjectPool para reutilizacion de buffers.
- Struct vs class: impacto en GC y rendimiento.
- Analisis de allocaciones con dotnet-trace y Visual Studio.
- Laboratorio: optimizar procesador de archivos con Span y ArrayPool.

---

## Modulo 14 - Serializacion y Configuracion

- Serializacion XML con `XmlSerializer`.
- JSON avanzado: polimorfismo `[JsonDerivedType]`, source generators, convertidores personalizados.
- MessagePack como alternativa binaria.
- Configuration Builder: JSON, environment variables, User Secrets.
- Options Pattern: `IOptions<T>`, `IOptionsSnapshot<T>`, `IOptionsMonitor<T>`.
- Configuracion por ambiente (Development, Staging, Production).
- Laboratorio: aplicacion configurable con appsettings y User Secrets.

---

## Modulo 15 - Logging, Configuracion y Observabilidad

- ILogger y logging estructurado (placeholders, no interpolacion).
- Serilog: sinks (Console, File, Seq), enrichment, niveles.
- Correlation IDs para trazabilidad en microservicios.
- Health Checks: endpoints `/health`, liveness vs readiness.
- OpenTelemetry: traces, metrics, logs y context propagation.
- Laboratorio: API observable con Serilog, health checks y OpenTelemetry.

---

## Modulo 16 - Arquitectura y SOLID

- Principios SOLID con ejemplos en C# (SRP, OCP, LSP, ISP, DIP).
- Contenedor DI: `AddSingleton`, `AddScoped`, `AddTransient`.
- Separacion en capas (Clean Architecture simplificado).
- CQRS basico con Command/Query/Handler.
- Modular Monolith como puente a microservicios.
- Buenas practicas de diseno y arquitectura evolutiva.
- Laboratorio: refactorizar aplicacion existente aplicando SOLID + capas.

---

## Sistema de Evaluacion

| Componente | Peso | Descripcion |
|------------|------|-------------|
| Laboratorios | 35% | Ejercicios practicos por modulo |
| Proyecto integrador | 35% | App funcional con capas, tests y patrones |
| Cuestionarios | 30% | Preguntas de investigacion por modulo |
