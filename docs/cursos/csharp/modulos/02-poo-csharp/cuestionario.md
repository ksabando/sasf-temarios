---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M02 - POO en C#

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] C# 8 introdujo *default interface methods*, permitiendo que las interfaces tengan implementaciones concretas. Esto rompe la distincion tradicional entre interfaces y clases abstractas. Explica que problema resuelve, como se usa y que controversia genero en la comunidad.

**Respuesta**: Default interface methods permiten agregar metodos a interfaces existentes sin romper implementaciones previas. Esto fue necesario principalmente para la interoperabilidad con Android/Java (que tiene esta caracteristica) y para evolucionar APIs de la BCL como `IEnumerable<T>`. La controversia: tradicionalmente las interfaces eran contratos puros sin comportamiento; con default methods se convierten en algo entre una interfaz y una clase abstracta, complicando el modelo mental.

**Por que**: Mads Torgersen explico en el C# Language Design Meeting que la motivacion principal era permitir que bibliotecas agreguen metodos a interfaces publicas sin forzar a todos los implementadores a actualizar su codigo. Sin embargo, autores como Eric Lippert y Mark Seemann criticaron que esto confunde el proposito de las interfaces. Fuente: "Default Interface Methods in C# 8" - Mads Torgersen (devblogs.microsoft.com), "C# 8.0 in a Nutshell" de Joseph Albahari.

---

### 2. [Investigar] Las *records* (C# 9) no son solo un tipo de dato inmutable: tienen semantica de valor por defecto, soporte nativo para desestructuracion y `Equality` generada por el compilador. Explica en detalle como funciona la igualdad en records, que es una `record struct` (C# 10) y como se diferencian de las clases tradicionales en terminos de memoria y comportamiento.

**Respuesta**: Los records implementan `IEquatable<T>` automaticamente y comparan por valor estructural (todas las propiedades). Las `record class` son tipos por referencia (heap), las `record struct` son tipos por valor (stack/heap segun contexto). La igualdad generada por el compilador compara cada propiedad miembro a miembro. Los records tambien generan metodos `ToString`, `GetHashCode`, `Clone` y soporte para `with` expressions que crean copias con propiedades modificadas.

**Por que**: La semantica de valor para DTOs es un patron comun que antes requeria sobrecargar `Equals`, `GetHashCode` y operadores manualmente. Los records eliminan ese boilerplate. La comunidad anglosajona destaca el trabajo de "Value Objects" en DDD (Vaughn Vernon) como inspiracion. Fuente: docs.microsoft.com, "Records in C# 9/10" - Mads Torgersen.

---

### 3. [Investigar] C# 11 introdujo `required` members y `file`-scoped types. Explica que problema resuelve `required` en el contexto de inicializacion de objetos y como se relaciona con los *primary constructors* de C# 12.

**Respuesta**: `required` (C# 11) fuerza a los consumidores de una clase a inicializar ciertas propiedades con object initializers. Esto permite que los DTOs tengan miembros obligatorios sin necesidad de un constructor con parametros. Los primary constructors (C# 12) permiten declarar parametros directamente en la clase: `public class Producto(string nombre, decimal precio)`. El parametro del primary constructor esta disponible como campo en toda la clase. Ambos buscan reducir boilerplate en la inicializacion de objetos.

**Por que**: La tension entre constructores parametrizados y object initializers existia desde C# 3. Con `required`, el equipo decidio permitir que el object initializer sea *obligatorio* sin renunciar a su sintaxis. Los primary constructors de C# 12 siguen el mismo camino que los records pero para clases tradicionales. Fuente: C# 11/12 What's New en docs.microsoft.com, y analisis de David Fowler.

---

### 4. [Conectar] El polimorfismo se puede lograr con interfaces o con herencia. Explica el principio de *Liskov Substitution* (LSP) y como se relaciona con el diseno de interfaces en C#. Da un ejemplo de violacion de LSP en un sistema de inventario.

**Respuesta**: LSP dice que si `S` es subtipo de `T`, entonces objetos de tipo `T` deben poder ser reemplazados por objetos de tipo `S` sin alterar las propiedades del programa. Ejemplo de violacion: si `Producto` tiene un metodo `AplicarDescuento(decimal porcentaje)` y `ProductoDigital` lanza `NotSupportedException` porque los digitales no tienen descuento, entonces viola LSP. La solucion seria no heredar de una base con ese metodo, o usar una interfaz separada `IDescontable`.

**Por que**: LSP es el tercer principio SOLID (Barbara Liskov, 1987). En la practica, la herencia mal aplicada es la causa mas comun de violacion. Las interfaces pequenas y especificas (Interface Segregation Principle) ayudan a cumplir LSP porque evitan heredar metodos que no tienen sentido. Fuente: "Clean Architecture" de Robert C. Martin, "Agile Principles, Patterns, and Practices in C#" del mismo autor.

---

### 5. [Cuestionar] La inmutabilidad es un principio fomentado en C# moderno (records, readonly structs, init-only setters). Sin embargo, la inmutabilidad total tiene costos de rendimiento porque requiere crear nuevas instancias en cada cambio. En que contexto recomendarias inmutabilidad total y cuando es aceptable usar objetos mutables? Explica el trade-off con ejemplos concretos.

**Respuesta**: La inmutabilidad es ideal para: (1) objetos de valor en DDD (Value Objects), (2) DTOs que se transfieren entre capas, (3) objetos que se usan como claves de diccionarios, (4) modelos en aplicaciones con concurrencia. Es aceptable usar objetos mutables en: (1) entidades con ciclo de vida largo (un `Pedido` que cambia de estado), (2) objetos de UI o ViewModels, (3) builders o configuradores que existen solo durante la construccion. El trade-off es entre seguridad y rendimiento: la inmutabilidad evita bugs pero puede generar mas allocaciones de memoria.

**Por que**: El equipo de C# ha favorecido la inmutabilidad en las ultimas versiones (records, `init`, `readonly`), pero la industria reconoce que la inmutabilidad total no es practica en todos los escenarios. Sistemas como orquestadores de microservicios o caches distribuidos usan objetos mutables para rendimiento. Fuente: "Functional Programming in C#" de Enrico Buonanno, y discusiones en el repo de roslyn sobre diseno de records.

---

### 6. [Cuestionar] Las interfaces con un solo metodo se llaman *functional interfaces* o *SAM interfaces* (Single Abstract Method). C# los soporta pero no tiene sintaxis especial (como los `@FunctionalInterface` de Java o los `SAM conversions` de Kotlin). Sin embargo, los delegados y lambdas cubren ese caso. Explica por que C# decidio no tener SAM interfaces explicitas y como los delegados resuelven el mismo problema de forma diferente.

**Respuesta**: En Java, las SAM interfaces se usan como tipos de funciones (`Runnable`, `Callable`, `Comparator`) y tienen sintaxis especial con lambdas. En C#, los delegados (`Func`, `Action`, `Predicate`) cumplen ese rol. Una interfaz con un solo metodo en C# seria equivalente funcional pero no tendria la conversion implicita de lambdas que tienen los delegados (salvo que se use `Func`/`Action` directamente). El equipo de C# decidio no agregar SAM interfaces porque los delegados ya cubrian el caso y agregar otra forma de expresar lo mismo generaria confusion.

**Por que**: La posicion del equipo de C# (Mads Torgersen) es que los delegados y las interfaces tienen propositos diferentes: las interfaces definen contratos con multiples miembros relacionados, los delegados definen firmas de metodos individuales. Mezclarlos (SAM interfaces) crearia ambiguedad. En la practica, la BCL moderna usa `Func`/`Action` para callbacks y `IComparer<T>`/`IEqualityComparer<T>` como interfaces de contrato. Fuente: C# Language Design Meeting notes sobre SAM interfaces, y analisis de Jon Skeet en "C# in Depth".
