---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M04 - LINQ y Programacion Asincrona

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] LINQ tiene dos sintaxis: method syntax y query syntax. Sin embargo, query syntax es un *syntactic sugar* que el compilador transforma a method syntax. Explica exactamente como el compilador transforma una query expression y por que no todos los operadores LINQ estan disponibles en query syntax.

**Respuesta**: Query syntax se transforma a method syntax en tiempo de compilacion. Por ejemplo, `from p in productos where p.Precio > 100 select p` se transforma a `productos.Where(p => p.Precio > 100).Select(p => p)`. La transformacion sigue reglas de desugaramiento definidas en la especificacion de C#. Operadores como `SelectMany`, `GroupBy`, `OrderBy`, `Join`, `Let` y `Into` tienen equivalentes en query syntax. Operadores como `First`, `Skip`, `Take`, `Distinct`, `Union`, `Any`, `All` y `Sum` no tienen keywords en query syntax y requieren method syntax.

**Por que**: La query syntax fue disenada para parecerse a SQL y facilitar la adopcion por desarrolladores con background en bases de datos. Sin embargo, la method syntax es mas expresiva y extensible. Microsoft recomienda method syntax en la documentacion oficial porque permite acceso completo a la API de LINQ. Fuente: C# Language Specification, y docs.microsoft.com sobre LINQ.

---

### 2. [Investigar] `IEnumerable<T>` es la interfaz base de LINQ to Objects, mientras que `IQueryable<T>` es la interfaz para LINQ to SQL/EF Core. Explica la diferencia entre ellas, como se construye un *expression tree* en `IQueryable` y por que `AsEnumerable()` cambia el lugar de ejecucion de la consulta.

**Respuesta**: `IEnumerable<T>` trabaja con delegados (codigo compilado IL) que se ejecutan localmente en memoria. `IQueryable<T>` trabaja con expression trees (representacion del codigo como datos) que pueden analizarse y traducirse a otro lenguaje (SQL, por ejemplo). Cuando llamas a `Where` en un `IQueryable`, el predicado se guarda como expression tree y el proveedor LINQ lo traduce a SQL. `AsEnumerable()` fuerza la ejecucion de la parte restante de la consulta en memoria (cliente-side), porque cambia de `IQueryable` a `IEnumerable`.

**Por que**: La diferencia es crucial para rendimiento. Si filtras con LINQ to Objects despues de traer todos los datos, la base manda todas las filas y el filtro ocurre en la app. Si filtras con `IQueryable`, el filtro se traduce a `WHERE` SQL y la base solo manda los datos necesarios. Fuente: "Expression Trees" en docs.microsoft.com, y Entity Framework Core documentation.

---

### 3. [Investigar] El modelo *Task-based Asynchronous Pattern* (TAP) introdujo `ValueTask<T>` en .NET Core 2.0 para reducir asignaciones en el heap. Explica cuando conviene usar `ValueTask<T>` en lugar de `Task<T>`, cual es el riesgo de usarlo incorrectamente y como afecta el rendimiento en APIs de alto trafico.

**Respuesta**: `ValueTask<T>` es un struct que puede envolver un valor sincrono o un `Task<T>`, evitando la asignacion en el heap cuando el resultado ya esta disponible (por ejemplo, desde un cache). Reduce presion del GC en escenarios de alta concurrencia. El riesgo principal: `ValueTask<T>` no debe ser esperado multiples veces, ni usado concurrentemente, porque internamente puede envolver un `IValueTaskSource` que es un objeto reusable. Solo debe consumirse una vez. `Task<T>` no tiene esta restriccion.

**Por que**: Stephen Toub explico en su blog que el 50-80% de las llamadas asincronas en ASP.NET Core completan sincronamente (cuando el dato ya esta en cache o en memoria). Usar `Task<T>` en esos casos fuerza una asignacion innecesaria. APIs como `Socket.ReceiveAsync` y `MemoryStream.ReadAsync` usan `ValueTask` por esta razon. Sin embargo, la mayoria de las APIs de aplicacion deberian seguir usando `Task<T>` por simplicidad. Fuente: "Understanding the Whys, Hows and Whens of ValueTask" - Stephen Toub.

---

### 4. [Conectar] La clase menciona `ConfigureAwait(false)` para librerias. Explica que es el *SynchronizationContext*, como `ConfigureAwait(false)` evita el reingreso al contexto original, y por que en aplicaciones de consola y ASP.NET Core el `ConfigureAwait(false)` es innecesario (a diferencia de WinForms y WPF).

**Respuesta**: El `SynchronizationContext` representa el contexto de sincronizacion del hilo actual. En WinForms/WPF, el contexto captura la cola de mensajes del UI thread. Cuando un `await` completa, por defecto intenta reingresar al contexto original (`SynchronizationContext.Current`), lo que en UI thread evita problemas de actualizacion de controles. `ConfigureAwait(false)` omite ese reingreso, permitiendo que el continuacion se ejecute en cualquier hilo. En ASP.NET Core (Core 3.0+) y aplicaciones de consola, `SynchronizationContext.Current` es `null`, por lo que `ConfigureAwait(false)` no tiene efecto.

**Por que**: La confianza excesiva en `ConfigureAwait(false)` viene de la epoca de .NET Framework donde el `AspNetSynchronizationContext` si existia. En ASP.NET Core, Microsoft elimino ese contexto, simplificando el modelo. Sin embargo, en librerias que pueden usarse tanto en UI como en server, sigue siendo buena practica usar `ConfigureAwait(false)`. Fuente: blog de Stephen Cleary ("ConfigureAwait FAQ"), docs.microsoft.com, y analisis de David Fowler.

---

### 5. [Cuestionar] LINQ fomenta un estilo funcional y declarativo, pero tiene desventajas: (1) dificulta la depuracion porque las lambdas son anonimas, (2) cada operacion puede crear iteraciones adicionales si no se encadenan correctamente, (3) el uso excesivo de `Select` anidados puede ser mas lento que un `foreach` simple. En que contextos preferirias un `foreach` tradicional sobre LINQ?

**Respuesta**: Preferiria `foreach` sobre LINQ en: (1) bucles con efectos secundarios (no puramente funcionales), (2) algoritmos que requieren early exit con logica compleja no capturable en `Any`/`All`, (3) operaciones que modifican la coleccion original, (4) cuando el rendimiento es critico y se ha medido que LINQ agrega overhead (especialmente con colecciones muy grandes). LINQ brilla en consultas declarativas y composicion; `foreach` brilla en mutacion y control fino de flujo.

**Por que**: El debate LINQ vs foreach es recurrente. LINQ tiene overhead por delegados, closures y allocaciones de enumeradores. En colecciones pequenas (menos de 1000 elementos), la diferencia es insignificante. En colecciones grandes o bucles anidados, un `for` optimizado puede ser 2-5x mas rapido. La recomendacion es: empezar con LINQ por claridad, medir, y solo reemplazar por `foreach` cuando el perfilador lo justifique. Fuente: performance tests en github.com/dotnet/performance, y analisis de "LINQ performance traps" en blogs de .NET.
