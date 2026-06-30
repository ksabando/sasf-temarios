---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M07 - Testing con xUnit

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] xUnit.net se diferencia de NUnit y MSTest en un aspecto filosofico importante: no recrea la clase de test por cada test (cada test crea una nueva instancia de la clase). Explica como funciona el ciclo de vida de los tests en xUnit, el uso de `IClassFixture<T>` y `ICollectionFixture<T>`, y como se comparte estado entre tests cuando es necesario.

**Respuesta**: xUnit crea una nueva instancia de la clase de test para cada test, garantizando que los tests no compartan estado accidentalmente. `IClassFixture<T>` permite compartir una unica instancia de `T` entre todos los tests de una misma clase. `ICollectionFixture<T>` permite compartir estado entre tests de diferentes clases dentro de una misma coleccion. `IClassFixture` implementa `IDisposable` y se crea una vez por clase, se inyecta via constructor. `ITestOutputHelper` permite escribir en la salida del test runner.

**Por que**: El diseno de xUnit (Brad Wilson, James Newkirk) prioriza el aislamiento. A diferencia de MSTest (que tiene `[ClassInitialize]` y `[TestInitialize]`) y NUnit (`[SetUp]` y `[OneTimeSetUp]`), xUnit usa inyeccion de dependencias para fixtures, lo que hace explicito el ciclo de vida compartido. Esto reduce errores por estado compartido accidentalmente. Fuente: xUnit documentation (xunit.net), y "xUnit.net: The Evolution" de Brad Wilson.

---

### 2. [Investigar] Las pruebas de integracion en .NET se pueden hacer con `WebApplicationFactory<T>` de Microsoft.AspNetCore.Mvc.Testing. Explica como funciona este patron, como se configura una base de datos en memoria o un mock de servicios, y la diferencia con las pruebas unitarias.

**Respuesta**: `WebApplicationFactory<T>` levanta una instancia real de la aplicacion ASP.NET Core en memoria, permitiendo hacer requests HTTP reales contra la pipeline completa (middleware, DI, routing, etc.). Se puede sobrescribir `ConfigureWebHost` para reemplazar servicios (ej: usar `InMemoryDatabase` de EF Core en vez de SQL Server real). Las pruebas unitarias verifican una unidad aislada; las de integracion verifican que los componentes funcionen juntos (controlador + servicio + EF Core).

**Por que**: Microsoft recomienda una piramide de testing: muchos tests unitarios, algunos de integracion, pocos E2E. `WebApplicationFactory` permite integration tests realistas sin desplegar la app. La desventaja es que son mas lentos que unit tests porque levantan toda la pipeline de la app. Fuente: "Integration Testing in ASP.NET Core" en docs.microsoft.com, y "The Art of Unit Testing" de Roy Osherove.

---

### 3. [Investigar] El concepto de *test doubles* incluye mocks, stubs, fakes, spies y dummies. Explica la diferencia entre cada uno, cual es el uso de cada tipo, y como NSubstitute (o Moq) implementa cada variante.

**Respuesta**: (1) **Dummy** - se pasa pero no se usa (ej: `new Producto("x", 0, 0)` donde no importan los valores). (2) **Stub** - devuelve valores predefinidos (`repo.Find(1).Returns(producto)`). (3) **Spy** - registra como fue llamado (`repo.Received(1).Guardar(prod)`). (4) **Mock** - verifica comportamiento (un mock es un stub + spy, pero con expectativas). (5) **Fake** - implementacion funcional simplificada (un `InMemoryRepository` en vez de SQL). NSubstitute combina stub y mock en un mismo objeto: `.Returns()` es stub, `.Received()` verifica comportamiento.

**Por que**: La terminologia de Gerard Meszaros ("xUnit Test Patterns") distingue estos roles, pero en la practica muchas librerias (NSubstitute, Moq) los unifican. La diferencia es sutil: los puristas (Martin Fowler) distinguen entre "stub" (verificacion de estado) y "mock" (verificacion de comportamiento). En la practica .NET, se usa "mock" como termino generico aunque el doble sea un stub. Fuente: "Mocks Aren't Stubs" - Martin Fowler, "xUnit Test Patterns" - Gerard Meszaros, y la documentacion de NSubstitute.

---

### 4. [Conectar] La clase menciona pruebas parametrizadas con `[Theory]` e `[InlineData]`. Explica como `[ClassData]` y `[MemberData]` permiten reutilizar datos de prueba, y por que a veces es preferible usar `AutoFixture` o `Bogus` para generar datos de prueba en lugar de escribirlos manualmente.

**Respuesta**: `[ClassData]` y `[MemberData]` permiten que los datos de prueba se definan en una clase separada o un metodo estatico, respectivamente, reutilizandolos en multiples tests. AutoFixture genera datos automaticamente usando builders inteligentes (ej: `Fixture.Create<Producto>()` llena todas las propiedades con valores aleatorios pero validos). Bogus genera datos con apariencia realista (`new Faker<Producto>().RuleFor(p => p.Nombre, f => f.Commerce.ProductName())`). AutoFixture es util para tests de "no me importa el valor exacto"; Bogus para tests donde los valores deben ser legibles.

**Por que**: Escribir datos manualmente es tedioso y puede sesgar los tests (siempre con los mismos valores). AutoFixture y Bogus aumentan la cobertura probabilistica: si generas 100 productos aleatorios, es mas probable que encuentres un caso borde. Sin embargo, pueden hacer los tests menos deterministicos si no se fija la semilla. La comunidad .NET recomienda AutoFixture para propiedades simples y Bogus para datos con apariencia realista en tests de aceptacion. Fuente: "AutoFixture: The Basics" - Mark Seemann, y la documentacion de Bogus.

---

### 5. [Cuestionar] Existe un debate sobre si las pruebas unitarias deben evitar el uso de mocks y en su lugar usar implementaciones reales simplificadas (fakes). Argumenta a favor y en contra de usar mocks (NSubstitute) versus fakes (InMemoryRepository) para probar un servicio como `InventarioService`.

**Respuesta**: A favor de fakes: (1) el test verifica comportamiento real sin configuracion de mock, (2) los fakes pueden reutilizarse en multiples pruebas, (3) los cambios en la interfaz rompen tanto al fake como al codigo real, forzando actualizacion. A favor de mocks: (1) configuracion explicita de comportamiento por test, (2) verificacion de interaccion (que se llamaron ciertos metodos con ciertos parametros), (3) menos codigo de infraestructura, (4) es mas facil configurar excepciones o comportamientos especificos. La recomendacion pragmatica: usar fakes para repositorios y dependencias de datos; usar mocks para dependencias con comportamiento (servicios externos, colas, APIs).

**Por que**: El debate refleja la tension entre "state-based testing" (fakes) y "interaction-based testing" (mocks). Los defensores de fakes (Mark Seemann en "Growing Object-Oriented Software") argumentan que los fakes mantienen los tests enfocados en el estado y comportamiento observable, no en los detalles de implementacion. Los defensores de mocks (Steve Freeman y Nat Pryce) argumentan que los mocks permiten disenar por comportamiento (TDD a nivel de interaccion). La posicion de la comunidad .NET es que ambos son validos y la decision depende del contexto. Fuente: "Mock Roles, not Objects" - Freeman & Pryce, y discusiones en la comunidad .NET sobre testing patterns.
