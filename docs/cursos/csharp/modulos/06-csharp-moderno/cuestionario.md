---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M06 - C# Moderno

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] Las Nullable Reference Types fueron introducidas en C# 8 pero no estan habilitadas por defecto en proyectos legacy. Hubo controversia sobre si debieron habilitarse por defecto. Explica la posicion de Microsoft, como migrar un proyecto legacy y que rol juega `#nullable disable` en archivos generados.

**Respuesta**: Microsoft decidio no habilitar NRT por defecto en proyectos existentes para evitar romper compilaciones existentes con miles de advertencias nuevas. En proyectos nuevos (con `dotnet new`) se habilita automaticamente desde .NET 6. Para migrar un proyecto legacy: (1) habilitar `Nullable` en el csproj, (2) resolver advertencias progresivamente, (3) usar `#nullable disable` temporalmente en archivos complejos. Los archivos generados por herramientas (scaffolding, EF Core migrations) usan `#nullable disable` para no interferir.

**Por que**: La introduccion de NRT fue uno de los cambios mas significativos en el sistema de tipos de C#. El equipo de C# priorizo la compatibilidad hacia atras sobre la pureza del diseno. Esto genero debate: defensores (Mads Torgersen) argumentaron que la migracion incremental es la unica forma practica; criticos (Jon Skeet) senalaron que el sistema resultante es confuso porque `string` y `string?` coexisten. Fuente: C# 8.0 blog posts en devblogs.microsoft.com, y discusiones en el repo de roslyn sobre el diseno de NRT.

---

### 2. [Investigar] Los records implementan `IEquatable<T>` y generan `GetHashCode` basado en todas las propiedades. Sin embargo, para Value Objects en DDD, la igualdad por todas las propiedades no siempre es deseable (un `Producto` con mismo nombre pero distinto precio no deberia ser igual si el nombre es el identificador). Explica como personalizar la igualdad en records y cuando conviene hacerlo.

**Respuesta**: Los records permiten sobrescribir `Equals` y `GetHashCode` manualmente si la igualdad generada no es la correcta. Usando `record` con una unica propiedad discriminante (como `Id`) o sobrescribiendo `Equals` para ignorar ciertas propiedades. Los `record class` tambien permiten el patron de `Primary Constructor` con validacion en el constructor primario. Para Value Objects en DDD, la igualdad por valor es correcta cuando el objeto se define por sus atributos (e.g., `Dinero(50, "USD")` es igual a `Dinero(50, "USD")`).

**Por que**: La confusion surge porque los records mezclan dos conceptos: datos transferibles (DTOs) y objetos de valor (DDD). En DDD, un Value Object se define por su valor estructural, y la igualdad por todas las propiedades es correcta. Para entidades, la igualdad deberia ser por identidad (`Id`), no por valor. El equipo de C# eligio igualdad por valor como default para records precisamente para fomentar el diseno de objetos de valor. Fuente: "Domain-Driven Design" de Eric Evans, y discusiones en el equipo de C# sobre records semantics.

---

### 3. [Investigar] C# 11 introdujo `required` modifier y `file`-scoped types. Explica el problema que resuelve `required` (especialmente en combinacion con records y nullability) y como `file` permite organizar helpers sin contaminar el namespace.

**Respuesta**: `required` fuerza al consumidor de una clase a inicializar ciertas propiedades, incluso cuando se usa object initializer. Esto es util cuando records/propiedades `init` necesitan valores obligatorios que no queremos poner en el constructor. Sin `required`, una propiedad `init` podria quedar sin asignar accidentalmente. `file`-scoped types (C# 11) permiten declarar clases, structs, interfaces o delegates que solo son visibles dentro del archivo donde se declaran, ideal para helpers internos que no deben exponerse.

**Por que**: `required` resuelve el dilema entre object initializers (flexibles, pero sin obligatoriedad) y constructores (obligatorios, pero rigidos). `file`-scoped types permiten organizar utilidades sin preocuparse por conflictos de nombres en el proyecto. Ambas features fueron disenadas en respuesta a patrones comunes de la comunidad. Fuente: C# 11 blog posts, y LDM notes sobre required members.

---

### 4. [Conectar] El pattern matching en C# ha evolucionado de simples type checks (C# 7) a patrones complejos con listas, propiedades y relaciones logicas (C# 11). Explica como se relaciona esto con la *algebraic data types* (ADT) en lenguajes como F# y Haskell, y por que C# (siendo orientado a objetos) adopta patrones funcionales.

**Respuesta**: Los ADTs (discriminated unions + pattern matching) son una caracteristica central de lenguajes funcionales. C# se acerca a ellos con: (1) patrones de tipo (simula union: `if (x is A or B)`), (2) patrones posicionales para records, (3) `switch` exhaustivo. Sin embargo, C# no tiene true discriminated unions (aunque se han propuesto repetidamente). Cada variante requiere una clase separada, no hay "casos" de un tipo suma. El equipo de C# agrega patrones funcionales porque mejoran la expresividad sin romper el paradigma OOP.

**Por que**: El lenguaje F# tiene DU reales: `type Forma = Circulo of float | Rectangulo of float * float`. En C#, esto se modela con jerarquia de clases o el patron Visitor. OneOf (libreria externa) es un workaround. El equipo de C# ha considerado DU en varias ocasiones pero el diseno topa con la interaccion con herencia, serializacion y la BCL. Mientras tanto, el pattern matching mitiga la ausencia. Fuente: "Functional Programming in C#" de Enrico Buonanno, y C# Language Design Meetings sobre discriminated unions.

---

### 5. [Cuestionar] Los records fomentan la inmutabilidad, pero la inmutabilidad total no siempre es practica. Existe un debate sobre si `record` con propiedades `init` es suficiente o si se necesitan tambien `record` mutables (con `set`). Que posicion tomarias sobre la mutabilidad en records?

**Respuesta**: Los records con `init` (inmutables por defecto) son la opcion correcta para la mayoria de los casos: DTOs, Value Objects, datos transferidos. La inmutabilidad elimina bugs por estado compartido y facilita el razonamiento. Sin embargo, existen casos donde un record mutable tendria sentido: ViewModels que se actualizan frecuentemente, objetos que se construyen por partes (builder pattern) o procesamiento batch donde la copia constante penaliza el rendimiento. Para esos casos, usar una clase tradicional con `set` o un `record struct` mutable (C# 10 permite `record struct` con `set`).

**Por que**: La decision de hacer records inmutables por defecto fue deliberada. Mads Torgersen explico que si querias mutabilidad, usaras `class`. Permitir `record` mutable iria contra el proposito semantico: los records representan datos, no comportamiento mutable. La posicion pragmatica es: usar `record` inmutable para datos, `class` para entidades con ciclo de vida, y `record struct` para datos por valor cuando la performance lo exige. Fuente: LDM notes sobre records, y discusiones de la comunidad en StackOverflow y GitHub.
