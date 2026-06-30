---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M10 - Programacion Funcional en C#

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] La programacion funcional en C# se apoya en la herencia de tipos `Func<T>` y `Action<T>`, pero estos delegados tienen limitaciones: no soportan mas de 16 parametros, no tienen composicion nativa, y no permiten `ref`/`out` parameters. Explica como estas limitaciones afectan el estilo funcional en C# y si lenguajes como F# o Haskell resuelven estos casos con mejor ergonomia.

**Respuesta**: Las limitaciones de `Func`/`Action` reflejan que C# es multiparadigma con origen OOP. F# tiene soporte nativo para pipe operators (`|>`), function composition (`>>`, `<<`), inferencia completa de tipos, currying automatico y partial application sin delegados. Haskell va mas alla con mónadas, funtores y aplicativos. En C# se pueden emular estos patrones con metodos de extension y Expression Trees, pero la ergonomia es menor (sintaxis mas verbosa, sin soporte nativo de currying). La comunidad C# resuelve esto con librerias como `Language-Ext` (`Option<T>`, `Either<TLeft, TRight>`) o `LaYumba.Functional`.

**Por que**: El diseno de C# prioriza la compatibilidad con OOP y el ecosistema .NET existente sobre la pureza funcional. F# comparte el mismo runtime y puede interoperar, por lo que los equipos que necesitan funcional puro a menudo usan F# para ciertos modulos. Fuente: "Functional Programming in C#" de Enrico Buonanno, y "Real World Functional Programming" de Tomas Petricek.

---

### 2. [Investigar] La clase menciona el patron `Option<T>`. Explica como `Nullable<T>` para value types y las nullable reference types cubren parcialmente este caso, pero no completamente. Que ventajas tiene una librería como `Language-Ext` o `Optional` sobre las nullable reference types nativas?

**Respuesta**: Las nullable reference types solo marcan el tipo como "puede ser null", pero no fuerzan al consumidor a manejar ambos casos (Some/None). Con `Option<T>`, el consumidor DEBE llamar a `Match` o `Map` para acceder al valor, eliminando el olvido de chequeo de null. Ademas, `Option<T>` compone con `Map`, `Bind`, `Filter` y `Fold`, permitiendo pipelines sin chequeos de null intermedios. Las NRT no tienen estas capacidades de composicion. `Language-Ext` agrega `Either<L,R>` para escenarios de exito/error, `Validation` para errores acumulables, y `Try<T>` para excepciones.

**Por que**: El equipo de C# decidio no implementar `Option<T>` como parte del lenguaje (como si lo hizo Rust con `Option<T>` y `Result<T,E>` o F# con `Option<'T>` y `Choice<'T1,'T2>`). En su lugar, prefirieron mejorar el sistema de tipos anulables existente. Los defensores de `Option` argumentan que es mas seguro y expresivo; los defensores de NRT argumentan que es mas simple y no requiere aprender un patron nuevo. Fuente: "Optional vs Nullable" - Mark Seemann, y "Why C# doesn't have Option type" - discusiones en GitHub.

---

### 3. [Investigar] Las `with` expressions de records permiten inmutabilidad practica. Sin embargo, en estructuras de datos anidadas, crear copias puede ser costoso o verboso. Explica el concepto de *persistent data structures* (estructuras de datos persistentes) y como librerias como `Immutables` o `System.Collections.Immutable` las implementan.

**Respuesta**: Las estructuras de datos persistentes (Rich Hickey, Clojure) reutilizan partes no modificadas del arbol interno al hacer cambios, logrando complejidad O(log n) en vez de O(n). `System.Collections.Immutable` (ImmutableArray, ImmutableDictionary, ImmutableList) usa arboles AVL internos. Cuando agregas un elemento a un `ImmutableList` con 1000 elementos, no se copian los 1000: se crea una nueva rama y se reutiliza el resto. Esto hace que la inmutabilidad sea practica para colecciones medianas. Las `with` expressions de records tambien usan reutilizacion superficial (shallow copy), no deep copy.

**Por que**: La inmutabilidad sin soporte de persistencia es impractica para colecciones grandes. Microsoft agrego `System.Collections.Immutable` al BCL en .NET Core especificamente para soportar programacion funcional. Aun asi, las colecciones persistentes tienen overhead de memoria (cada nodo del arbol) que puede ser 2-3x comparado con `List<T>` mutable. La recomendacion: usar inmutabilidad donde la concurrencia o la seguridad sean criticas, y colecciones mutables donde el rendimiento sea prioritario. Fuente: "Persistent Data Structures in .NET" - Joel Martinez, y "Immutable Collections" - docs.microsoft.com.

---

### 4. [Conectar] La clase usa `Aggregate` para implementar el pipeline. Explica como `Aggregate` (fold/reduce) es la operacion fundamental de la programacion funcional, su relacion con `Select` (map) y `Where` (filter), y como estos tres operadores forman la base de LINQ.

**Respuesta**: `Aggregate` (fold) reduce una secuencia a un unico valor acumulando estado. `Select` (map) transforma cada elemento. `Where` (filter) selecciona elementos. Juntos forman la trifecta funcional que LINQ implementa. Cualquier operacion sobre colecciones puede expresarse como combinacion de map, filter y fold/reduce. Por ejemplo, `Count()` es `Aggregate(0, (acc, _) => acc + 1)`, y `Sum()` es `Aggregate(0m, (acc, p) => acc + p.Precio)`. LINQ abstrae esto en operadores semanticos que son mas legibles que `Aggregate` directo.

**Por que**: La relacion entre map/filter/reduce (conocido como MapReduce de Google, popularizado como MapFilterReduce en funcional) es la base del paradigma funcional. Entender que LINQ es una implementacion de estos tres operadores fundamentales permite comprender cualquier framework de procesamiento de datos (Spark, Flink, streams funcionales). Fuente: "MapReduce: Simplified Data Processing on Large Clusters" - Dean & Ghemawat (Google), y "Functional Programming in Scala" de Paul Chiusano.

---

### 5. [Cuestionar] Algunos puristas funcionales argumentan que el estilo funcional en C# es "peor que en F#" y que intentar escribir C# funcional es forzar el lenguaje. Otros argumentan que C# moderno soporta funcional lo suficiente para la mayoria de los casos empresariales. Que posicion tomas? Hasta que punto deberia un equipo adoptar estilo funcional en C#?

**Respuesta**: La posicion pragmatica: C# es multiparadigma y debe usarse como tal. Adoptar inmutabilidad, funciones puras y LINQ es beneficioso universalmente. Usar Option, Either y monadas es beneficioso pero requiere disciplina del equipo y consistencia. Forzar estilo funcional puro en C# (evitando toda mutacion, excepciones y herencia) es contraproducente porque: (1) la BCL es orientada a objetos, (2) los frameworks (EF Core, ASP.NET) usan mutacion y efectos secundarios, (3) la mayoria de los desarrolladores C# no tienen background funcional. El punto optimo: estilo funcional en capas de negocio y logica pura; estilo OOP en capas de infraestructura y frameworks.
