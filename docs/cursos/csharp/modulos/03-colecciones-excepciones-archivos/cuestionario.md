---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M03 - Colecciones, Excepciones y Archivos

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] `List<T>` usa un array interno que se redimensiona automaticamente. Explica cual es la estrategia de redimensionamiento (factor de crecimiento), como afecta la complejidad amortizada de `Add` y como `Capacity` y `TrimExcess` permiten optimizar el uso de memoria.

**Respuesta**: `List<T>` usa un array interno que inicialmente tiene `Capacity = 0`. Al agregar el primer elemento, asigna capacidad para 4 elementos. Cuando se llena, duplica la capacidad (cada redimension copia los elementos al nuevo array). El factor de duplicacion da una complejidad amortizada O(1) para `Add`, porque las copias ocurren cada vez menos frecuentemente a medida que crece la lista. `Capacity` expone el tamano del array interno; `TrimExcess()` lo reduce al `Count` actual para ahorrar memoria cuando la lista no crecera mas.

**Por que**: La implementacion de `List<T>` es un compromiso entre rendimiento de insercion y uso de memoria. El factor de duplicacion minimiza el numero de redimensiones, pero puede desperdiciar memoria (hasta el doble de lo necesario). `TrimExcess` es util despues de cargar datos que no cambiaran. Fuente: .NET Runtime source code (dotnet/runtime repo), y analisis en "C# in Depth" de Jon Skeet.

---

### 2. [Investigar] `Dictionary<TKey,TValue>` usa *hashing* para lograr busqueda O(1). Explica como maneja las colisiones de hash, que es el factor de carga y como afecta el rendimiento, y que cambios hubo en la implementacion de `Dictionary` en .NET 7 y .NET 8.

**Respuesta**: `Dictionary` usa un array de "buckets" donde cada bucket apunta a una lista enlazada o array de entradas. Cuando dos claves tienen el mismo hash (colision), se almacenan en el mismo bucket. El factor de carga (load factor) es ~0.72: cuando la tabla se llena al 72%, se redimensiona para mantener colisiones bajas. En .NET 7, la implementacion se optimizo para usar `IndexOf` vectorizado con SIMD. En .NET 8, se introdujeron mejoras en `CollectionsMarshal` para acceso directo a las entradas internas, reduciendo overhead en escenarios de alto rendimiento.

**Por que**: La implementacion de `Dictionary` es una de las mas optimizadas de la BCL. Stephen Toub (ingeniero de .NET) ha escrito extensamente sobre las optimizaciones. El uso de `EqualityComparer<T>.Default` permite que el diccionario sea resistente a ataques de colision, y en .NET 9 se agregaron mas mejoras para tipos primitivos. Fuente: .NET Performance blog de Stephen Toub, y el source code en dotnet/runtime.

---

### 3. [Investigar] Las *structured exceptions* en .NET usan el mecanismo SEH (Structured Exception Handling) de Windows en sistemas operativos Windows y un mecanismo equivalente en Unix. Explica como funciona el *stack unwinding* a nivel de runtime y por que las excepciones no son tan costosas como se cree, pero tampoco gratuitas.

**Respuesta**: Cuando se lanza una excepcion, el runtime recorre la pila de llamadas buscando un `catch` que coincida (stack unwinding). Para cada frame, verifica si hay un handler y ejecuta los `finally` correspondientes. Las excepciones son costosas principalmente por dos razones: (1) la recoleccion del stack trace requiere caminar la pila y resolver nombres de metodos, (2) la asignacion del objeto excepcion en el heap. En .NET Core, el stack unwinding se optimizo para ser lazy: el stack trace no se genera hasta que se accede a el (`ex.StackTrace`), si no se usa, no se paga el costo.

**Por que**: La creencia de que "las excepciones son muy costosas" viene de .NET Framework donde el stack trace se generaba inmediatamente. En .NET Core/.NET 5+, las excepciones comunes (como `KeyNotFoundException` en `Dictionary`) son extremadamente rapidas si no se captura el stack trace. Aun asi, siguen siendo mas costosas que un `TryGetValue`, por lo que el patron `Try*` sigue siendo preferible cuando el fallo es esperado. Fuente: "Exception Handling in .NET" - Konrad Kokosa, .NET Core source y perf optimizations en dotnet/runtime.

---

### 4. [Conectar] La clase menciona `System.Text.Json` como el serializador preferido. Explica las diferencias clave entre `System.Text.Json` y `Newtonsoft.Json` en terminos de rendimiento, manejo de referencias circulares, y personalizacion de la serializacion. En que casos seguiras prefiriendo Newtonsoft?

**Respuesta**: `System.Text.Json` es mas rapido (hasta 2-3x) porque usa `Utf8JsonReader`/`Utf8JsonWriter` que trabajan directamente con UTF-8 sin convertir a UTF-16. Sin embargo, Newtonsoft.Json tiene un ecosistema de `JsonConverter` mas maduro, soporta referencias circulares de forma nativa (`ReferenceLoopHandling.Ignore`), y tiene `TypeNameHandling` para polimorfismo. Casos donde Newtonsoft sigue siendo mejor: (1) migraciones de codigo legacy que dependen de `[JsonObject(ItemNullValueHandling)]`, (2) serializacion polimorfica compleja, (3) serializacion de `DataTable`/`DataSet`.

**Por que**: Microsoft decidio crear un serializador nuevo en lugar de adoptar Newtonsoft para .NET Core 3.0 porque necesitaban un serializador que trabajara directamente con UTF-8 y `Span<byte>` para maximizar rendimiento en ASP.NET Core. Newtonsoft quedaria como opcion externa. Con las versiones recientes (.NET 8+), `System.Text.Json` agrego soporte para `JsonNode`, `JsonDocumentOptions` y polimorfismo, acercandose a Newtonsoft. Fuente: docs.microsoft.com comparativa oficial, y blog de Immo Landwerth sobre el diseno de System.Text.Json.

---

### 5. [Cuestionar] El patron `using` garantiza la liberacion de recursos implementando `IDisposable`. Sin embargo, existe un debate sobre si `using` debe usarse siempre que una clase implementa `IDisposable` o si algunas implementaciones son solo "por si acaso". Que posicion tomarias y por que?

**Respuesta**: La recomendacion oficial de Microsoft es llamar siempre a `Dispose` (directa o via `using`) cuando una clase implementa `IDisposable`, porque no hay forma de saber si la implementacion es real o preventiva. `StreamReader`, `SqlConnection`, `HttpClient` son ejemplos clasicos donde omitir `Dispose` causa fugas de recursos. El debate surge porque algunas clases implementan `IDisposable` solo para el patron de herencia (por si una subclase necesita liberar recursos) sin tener recursos actualmente. Sin embargo, llamar a `Dispose` en estos casos es inofensivo.

**Por que**: La guia de diseno de .NET Framework (Framework Design Guidelines de Krzysztof Cwalina y Brad Abrams) establece que si una clase implementa `IDisposable`, los consumidores deben llamar a `Dispose`. Ignorarlo porque "probablemente no haga nada" es una mala practica que puede llevar a fugas cuando la implementacion cambia en el futuro. Fuente: "Framework Design Guidelines" y analisis de Stephen Toub sobre patrones de Dispose en la BCL.
