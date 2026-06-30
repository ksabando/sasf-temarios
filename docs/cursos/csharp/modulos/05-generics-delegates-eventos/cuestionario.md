---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M05 - Generics, Delegates y Eventos

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] Las restricciones genericas permiten especificar que un tipo parametrizado herede de una clase base o implemente una interfaz. Sin embargo, C# no permite restricciones basadas en *shape* como los *traits* de Rust o los *concepts* de C++. Explica por que el equipo de C# no ha agregado *duck typing* en generics (como los `interface` estaticos) a pesar de ser una caracteristica muy solicitada.

**Respuesta**: C# 11 introdujo *static abstract interface members* que permiten definir metodos estaticos (como operadores) en interfaces, permitiendo que generics invoquen operadores aritmeticos (`T a + T b`). Esto es un paso hacia shape-based generics, pero no duck typing completo. La razon historica es que .NET generics usan *reification* (el runtime mantiene el tipo concreto, no solo en compilacion), lo que hace mas complejo que los templates de C++ que son puramente textuales.

**Por que**: El equipo de C# ha sido conservador en este aspecto porque agregar duck typing a generics requeriria cambios profundos en el runtime (CLI). Los *static abstract members* (C# 11) permiten aritmetica generica, pero cada interfaz debe declararse explicitamente. El lenguaje Swift (generics con protocolos) y Rust (traits) son ejemplos de disenos alternativos. Fuente: C# Language Design Meetings sobre "Roles and Extensions", y "Static Abstract Members in Interfaces" - Mads Torgersen.

---

### 2. [Investigar] La clase menciona `Func<T>` y `Action<T>`. Explica como funciona la *variance* (covarianza y contravarianza) en los tipos genericos de delegados y la relacion con los modificadores `in` y `out`. Por que `Func<T>` es covariante en el retorno y contravariante en los parametros?

**Respuesta**: `Func<T, TResult>` es contravariante en `T` (parametro, marcado `in`) y covariante en `TResult` (retorno, marcado `out`). Esto significa que `Func<object, string>` puede usarse como `Func<string, object>`: el parametro acepta tipos mas derivados de los declarados, y el retorno acepta tipos mas base de los declarados. `Action<T>` es contravariante en `T`. La variance permite compatibilidad de delegados con herencia de tipos.

**Por que**: La variance en delegados genericos fue introducida en C# 4.0 (junto con `IEnumerable<out T>`). Antes, `Func<string>` no podia asignarse a `Func<object>` aunque toda `string` es `object`. La contravariance en parametros permite que un handler de `Control` maneje `Button`, porque `Button` es mas especifico. Sin variance, muchas escenas de LINQ y eventos requerian casteos. Fuente: C# 4.0 specification (Anders Hejlsberg), y analisis de Mads Torgersen sobre variance.

---

### 3. [Investigar] Los eventos usan `EventHandler<TEventArgs>` que hereda de `EventArgs`. Sin embargo, en .NET 6+, Microsoft introdujo `EventArg<T>` generico y recomendaciones para evitar crear clases `EventArgs` personalizadas para eventos simples. Explica como funciona y que ventaja tiene.

**Respuesta**: `EventArg<T>` (introducido en .NET 6) es un tipo generico que envuelve un unico valor: `EventArg<string>` reemplaza la necesidad de crear una clase `StockBajoEventArgs` con una propiedad `string`. Esto reduce boilerplate para eventos que transportan un solo dato. Para eventos con multiples datos, sigue siendo necesario crear una clase `EventArgs` personalizada.

**Por que**: La BCL crecio con cientos de clases `EventArgs` que solo envuelven uno o dos valores. `EventArg<T>` simplifica la mayoria de los casos. Sin embargo, el patron sigue requiriendo la clase `EventArgs` personalizada para datos complejos. La comunidad debate si este patron agrega valor o es solo tradicion historica. Fuente: .NET 6 What's New, y discusiones en dotnet/runtime sobre simplificar el patron de eventos.

---

### 4. [Conectar] Los generics en C# son *reified* (preservan el tipo en runtime), a diferencia de Java donde los generics son *erased* (borrados en compilacion). Explica que ventajas y desventajas tiene cada enfoque y como afecta al rendimiento y a la interoperabilidad.

**Respuesta**: C# preserva el tipo generico en runtime (`List<int>` y `List<string>` son tipos distintos en el runtime), lo que permite: (1) `typeof(List<int>)` funciona, (2) reflexion sobre generics preserva el tipo, (3) no necesita boxing para value types (`List<int>` almacena `int` directamente). Java usa type erasure: `List<Integer>` y `List<String>` son ambos `List` en runtime, lo que requiere boxing para tipos primitivos y casteos en reflexion. La desventaja de C# es que el runtime debe mantener mas metadatos y las especializaciones de generics aumentan el tamano del codigo generado.

**Por que**: La decision de reificacion fue fundamental en el diseno de .NET. Permite que `List<int>` sea tan eficiente como `int[]` (sin boxing), que fue un factor clave en el rendimiento de .NET. Sin embargo, complica la interoperabilidad con lenguajes que no soportan generics (como versiones antiguas de COM). Java eligio erasure para mantener compatibilidad binaria con versiones pre-generics. Fuente: "Generics in .NET" de Microsoft docs, "Java Generics: Past, Present and Future" de Brian Goetz, y analisis comparativo en InfoQ.

---

### 5. [Cuestionar] El patron de eventos basado en `EventHandler<T>` ha sido criticado por ser verboso (requiere clase EventArgs, dos parametros, etc.). Alternativas modernas como `IObservable<T>` (Rx.NET), channels (`System.Threading.Channels`) o event delegates anonimos simplifican la notificacion. En que contexto recomendarias cada aproximacion?

**Respuesta**: Recomendaria: (1) `event EventHandler<T>` para eventos clasicos de UI o notificaciones simples donde el emisor y receptor estan acoplados solo por el evento, (2) `IObservable<T>` para flujos de eventos que requieren composicion reactiva (filtros, throttling, merge), (3) `Channel<T>` para productor-consumidor asincrono con backpressure (procesamiento de colas), (4) delegates simples (`Action<T>`) para callbacks internos con un solo suscriptor. El patron clasico de eventos es verboso pero universal; las alternativas son mas especificas.

**Por que**: No hay un "unico patron correcto" para notificaciones. El patron clasico de eventos de .NET (sender + EventArgs) fue disenado para WinForms y WPF donde la interoperabilidad con herramientas visuales era clave. Rx.NET resuelve composicion de eventos pero agrega complejidad. Channels resuelve escenarios async modernos. La tendencia en .NET moderno es usar `Channel<T>` para pipelines de procesamiento y `IObservable<T>` para flujos reactivos. Fuente: "Reactive Extensions for .NET" de Lee Campbell, y documentacion de System.Threading.Channels.
