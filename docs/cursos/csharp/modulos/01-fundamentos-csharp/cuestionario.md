---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M01 - Fundamentos de C#

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] C# asigna los tipos por valor en el stack y los tipos por referencia en el heap. Sin embargo, existen excepciones como los `struct` que implementan interfaces o los `Span<T>`. Explica como funciona realmente la asignacion de memoria en C# y que rol juega el *boxing*.

**Respuesta**: Los value types se almacenan en el stack solo cuando son variables locales o parametros, no cuando son campos de una clase (ahi van al heap junto con la clase). El boxing ocurre cuando un value type se asigna a una referencia `object` o una interfaz: el runtime copia el valor al heap y crea un wrapper. `Span<T>` es un ref struct que vive exclusivamente en el stack, no puede ser boxeado, y permite operaciones seguras sobre memoria arbitraria sin asignar en el heap.

**Por que**: El equipo de C# (Mads Torgersen, Dustin Campbell) diseno los ref struct para escenarios de alto rendimiento donde la asignacion en el heap es inaceptable. El boxing es una fuente comun de problemas de rendimiento en aplicaciones que usan colecciones no genericas o pasan structs a metodos que esperan `object`. Fuente: "Memory Management in .NET" de Konrad Kokosa, y la documentacion de Microsoft sobre `Span<T>`.

---

### 2. [Investigar] La inferencia de tipos con `var` tiene reglas especificas: no se puede usar en campos de clase, parametros o tipos de retorno en C# clasico. Sin embargo, C# 10 introdujo `var` en propiedades en ciertos contextos y C# 12 mejoro la inferencia con `ref` parameters. Explica que cambios hubo en la inferencia de tipos en las ultimas versiones.

**Respuesta**: C# 10 permitio `var` en propiedades solo cuando hay un inicializador que permite inferir el tipo (ej: `public var Nombre { get; set; } = "texto";`). C# 12 permitio `ref` parameters con `var` en contextos especificos. La regla general sigue siendo que `var` solo puede usarse en variables locales donde el tipo sea evidente. No es permitido en parametros de metodos, tipos de retorno, ni campos de clase porque el compilador necesita conocer el tipo exacto en la firma del metodo o estructura de la clase.

**Por que**: La discusion sobre `var` es recurrente en la comunidad. Microsoft ha sido conservadora en expandir su uso, mientras que equipos como el de Entity Framework prefieren tipos explicitos en APIs publicas. La recomendacion de Microsoft es usar `var` cuando el tipo es obvio por el lado derecho (`var producto = new Producto()`) y usar tipo explicito cuando no lo es (`List<Producto> productos = ObtenerLista()`). Fuente: docs.microsoft.com, C# Language Design Meeting notes, y analisis de SonarSource sobre reglas de estandar.

---

### 3. [Investigar] Las *top-level statements* de C# 9 eliminaron la necesidad de `Main` explicito. Sin embargo, el compilador sigue generando una clase `Program` con un metodo `Main` internamente. Explica como funciona esta transformacion y que limitaciones tiene (solo un archivo, orden de declaracion, etc.).

**Respuesta**: Cuando usas top-level statements, el compilador genera una clase `Program` con un metodo `Main` que contiene las instrucciones en el orden en que aparecen. Solo un archivo puede tener top-level statements por proyecto. Las funciones declaradas despues de las instrucciones se convierten en metodos locales del `Main` generado. No puedes definir tipos (clases, structs) antes de las instrucciones porque el compilador procesa las declaraciones en orden. La limitacion practica es que no puedes tener dos archivos con top-level statements porque ambos intentarian generar `Main`.

**Por que**: Esta caracteristica fue controversial en la comunidad. Proponentes (Mads Torgersen) argumentan que reduce el boilerplate en programas simples, scripts y tutoriales. Criticos (Jon Skeet, entre otros) senalan que oculta la estructura real del programa y puede confundir a principiantes cuando luego necesitan entender proyectos con clases y namespaces. Fuente: C# 9.0 Language Design Notes, blog de Mads Torgersen en devblogs.microsoft.com, y discusion en github.com/dotnet/csharplang.

---

### 4. [Conectar] La clase menciona `TryParse` como alternativa segura a `Parse`. Explica el patron `Try` en C#, el uso de parametros `out` y como este patron se aplica tambien en `Dictionary.TryGetValue`, `ConcurrentQueue.TryDequeue` y otros metodos de la BCL. Que desventaja tiene este patron comparado con el uso de nullable return types?

**Respuesta**: El patron `Try` usa un parametro `out` para devolver el resultado y un `bool` como retorno que indica exito. Este patron existe desde C# 1.0 porque permite evitar excepciones en escenarios donde el fallo es esperado. `Dictionary.TryGetValue` sigue este patron, al igual que `ConcurrentQueue.TryDequeue`. La desventaja: el patron `Try` no es componible con LINQ ni con el flujo funcional, porque depende de un parametro `out`. En C# 7+ se puede declarar la variable en linea (`if (int.TryParse(text, out var result))`), pero sigue siendo menos elegante que un `int?` de retorno. Sin embargo, la BCL mantiene el patron por consistencia y porque permite diferenciar entre "fallo por formato invalido" y "valor nulo".

**Por que**: El equipo de .NET ha discutido agregar variantes con nullable return types, pero el patron `Try` sigue siendo el estandar porque permite devolver informacion adicional (el valor parseado) sin mezclar semantica de error con el valor. En C# 11 se introdujeron mejoras en `out` parameters con `field` keyword y `ref` fields, pero el patron basico no cambio. Fuente: .NET Runtime repo discussions, y analisis de Stephen Toub sobre patrones de metodos en la BCL.

---

### 5. [Conectar] El operador ternario `?:` parece una forma concisa de escribir un `if-else`, pero tiene diferencias semanticas importantes. Explica por que el ternario siempre debe devolver un valor y la relacion entre el ternario y el *null-coalescing operator* `??`.

**Respuesta**: El ternario es una expresion, no una instruccion: siempre produce un valor y ambos lados deben tener el mismo tipo (o tipos compatibles). Esto permite usarlo en asignaciones, argumentos de metodos y expresiones LINQ. El null-coalescing `??` es un caso particular de ternario: `x ?? y` equivale a `x != null ? x : y`, pero con evaluacion de cortocircuito que evita evaluar `x` dos veces. `??=` (C# 8) asigna solo si la variable es null: `list ??= new List<int>()`.

**Por que**: La diferencia parece sutil pero tiene implicaciones en composicion. LINQ no puede usar `if`, pero puede usar ternarios en `Select` o `Where`. El `??` es syntactic sugar que elimina un patron repetitivo de `!= null`. Fuente: C# Language Reference, y ejemplos de composicion funcional en "Functional Programming in C#" de Enrico Buonanno.

---

### 6. [Cuestionar] Existe un debate sobre si `var` mejora o empeora la legibilidad del codigo. Equipos como el de .NET Runtime usan `var` solo cuando el tipo es obvio, mientras que en la comunidad ReSharper se recomienda `var` en todos los casos donde sea posible. Analiza ambos argumentos y explica en que contextos recomendarias uno u otro.

**Respuesta**: Los defensores de `var` (ReSharper, StyleCop) argumentan que reduce ruido visual y permite cambiar el tipo de retorno sin modificar cada declaracion. Los criticos (CodeRush, algunos equipos Microsoft) argumentan que oculta informacion importante cuando el tipo no es obvio: `var result = GetData();` no dice si `result` es `List<Producto>` o `IEnumerable<Producto>`. La recomendacion pragmatica es usar `var` cuando el tipo es evidente por el lado derecho (`var producto = new Producto()`) y usar tipo explicito cuando el metodo no revela el tipo en su nombre (`List<Producto> productos = Repositorio.ObtenerTodo()`).

**Por que**: Este debate refleja la tension entre codigo conciso y codigo explicito. Microsoft ha evitado tomar una posicion oficial en su guia de estilos, dejandolo a criterio del equipo. Herramientas de analisis como SonarQube tienen reglas configurables para ambos lados. Fuente: .NET Coding Guidelines (dotnet/runtime repo), blog de Bill Wagner en MSDN, y analisis comparativo de JetBrains en sus recomendaciones de estilo.
