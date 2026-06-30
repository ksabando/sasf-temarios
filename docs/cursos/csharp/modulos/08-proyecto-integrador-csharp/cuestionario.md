---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M08 - Proyecto Integrador C#

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] La separacion por capas del proyecto integrador sigue los principios de *Clean Architecture* (Robert C. Martin), aunque simplificados. Explica que capas de Clean Architecture estan presentes, cuales faltan (Use Cases, Interface Adapters, Frameworks) y como se mapearian a la estructura del proyecto.

**Respuesta**: En Clean Architecture (4 capas), el mapeo seria: (1) **Entities** = `Producto` en Domain (reglas de negocio empresariales), (2) **Use Cases** = `InventarioService` en Domain/Application (casos de uso de la aplicacion), (3) **Interface Adapters** = `ProductoRepositorioJson` en Infrastructure y el menu de consola en la UI (convierten entre formatos), (4) **Frameworks & Drivers** = `System.Text.Json`, `System.IO`, `System.Console`. La simplificacion del proyecto es que los Use Cases estan en Domain en vez de en una capa separada Application. En produccion, se separaria `Inventario.Aplicacion` para los casos de uso, dejando Domain solo con entidades.

**Por que**: Clean Architecture (Robert C. Martin, 2012) extiende Hexagonal Architecture agregando la separacion explicita entre Entities y Use Cases, y los presenters. Para un proyecto de consola, la simplificacion es aceptable; para una API, la separacion es mas importante porque los casos de uso pueden tener DTOs de entrada/salida que no deben estar en Domain. Fuente: "Clean Architecture" de Robert C. Martin, y comparativas de implementacion en .NET en blogs de la comunidad.

---

### 2. [Investigar] El proyecto usa inyeccion de dependencias manual (creando el repositorio a mano en Program.cs). .NET tiene un contenedor DI integrado (Microsoft.Extensions.DependencyInjection). Explica como se configuraria el proyecto usando DI y porque esto es relevante al migrar de consola a API.

**Respuesta**: Con DI integrada, se registra en Program.cs: `services.AddScoped<IProductoRepository, ProductoRepositorioJson>(); services.AddScoped<InventarioService>();`. Luego se inyectan via constructor (`public InventarioService(IProductoRepository repo)`). Al migrar a API, solo cambia el punto de entrada (WebApplication en vez de consola), pero el registro y las dependencias son las mismas. La consola no tiene contenedor por defecto, pero se puede agregar con `Microsoft.Extensions.Hosting`.

**Por que**: La DI es fundamental en .NET moderno. Permite que `InventarioService` no dependa de una implementacion concreta de repositorio, y que al migrar a SQL Server solo se cambie el registro (`AddScoped<IProductoRepository, ProductoRepositorioSql>()`) sin modificar el servicio. El proyecto integrador evita la DI para mantener la simplicidad, pero en produccion es indispensable. Fuente: docs.microsoft.com sobre Dependency Injection y "Dependency Injection in .NET" de Mark Seemann.

---

### 3. [Investigar] El proyecto usa un fake en memoria (`RepositorioEnMemoria`) para los tests. Explica como este fake implementa `IProductoRepository` y cuales son las ventajas de usar fakes sobre mocks en este escenario. Que trade-off hay entre fakes y mocks en terminos de mantenibilidad?

**Respuesta**: El fake implementa todas las operaciones de la interfaz con una `List<Producto>` en memoria. Ventajas: (1) no requiere configuracion por test, (2) verifica el comportamiento real (no solo interacciones), (3) puede reutilizarse en cientos de tests. Desventajas: (1) requiere mantenerse actualizado con la interfaz (si la interfaz cambia, el fake debe actualizarse), (2) puede tener bugs que pasen desapercibidos. Los mocks (NSubstitute) requieren configuracion por test pero son mas flexibles (pueden lanzar excepciones en metodos especificos, verificar orden de llamadas).

**Por que**: Los defensores de fakes (Mark Seemann en "xUnit Test Patterns") argumentan que los fakes mantienen los tests enfocados en el estado observable. La comunidad .NET recomienda fakes para dependencias de datos y mocks para dependencias de comportamiento. En el proyecto integrador, el repositorio es una dependencia de datos, por lo que un fake es apropiado. Fuente: "xUnit Test Patterns" de Gerard Meszaros, y discusiones en la comunidad .NET sobre Fake vs Mock.

---

### 4. [Conectar] La consola del proyecto integrador usa metodos auxiliares al final de `Program.cs`. Con *top-level statements* de C# 9, las funciones declaradas despues del codigo principal se convierten en metodos locales del `Main` generado. Explica que limitaciones tiene este enfoque comparado con tener una clase separada `MenuConsola` y en que momento recomendarias refactorizar a una clase separada.

**Respuesta**: Con top-level statements, las funciones auxiliares son metodos locales estaticos del `Main` generado. Limitaciones: (1) no pueden ser reutilizadas desde otros archivos, (2) no pueden tener campos compartidos (solo variables locales capturadas), (3) no se pueden testear unitariamente. Refactorizar a una clase `MenuConsola` separada es recomendable cuando: (a) el menu crece a mas de 200 lineas, (b) se necesita probar la logica de presentacion, (c) se quiere reutilizar la consola en otra aplicacion.

**Por que**: Top-level statements son ideales para programas pequenos. Para aplicaciones que crecen, la falta de encapsulamiento y testabilidad se vuelve un problema. La comunidad recomienda extraer a clases cuando el archivo supera 200-300 lineas o cuando aparecen tests que deben probar la logica de interaccion. Fuente: C# 9.0 Top-level Statements documentation, y guias de estilo de la comunidad .NET.

---

### 5. [Cuestionar] El proyecto integrador usa archivos JSON como persistencia. Si se migrara a SQL Server con Entity Framework Core, el dominio (`Producto`, `IProductoRepository`) no cambiaria, pero la infraestructura si. Discute si usar una base de datos SQL desde el inicio (en vez de JSON) habria sido mejor, considerando que el objetivo del curso es preparar al alumno para APIs empresariales.

**Respuesta**: Usar JSON desde el inicio tiene ventajas: (1) no requiere instalacion de SQL Server, (2) el alumno se enfoca en logica C# sin distraerse con configuracion de BD, (3) el archivo JSON es portable y facil de debuggear. Desventajas: (1) no hay transacciones reales, (2) no hay concurrencia, (3) el rendimiento es pobre para muchos datos. La decision pedagogica correcta depende del objetivo: si el curso precede inmediatamente a .NET API, JSON es suficiente para entender el patron de repositorio. Si el curso es autonomo y el alumno no hara el curso de API, SQL Server seria mas representativo.

**Por que**: La tension entre simplicidad pedagogica y realismo empresarial es constante en diseno curricular. La mayoria de los cursos de C# eligen JSON o SQLite (nas) para los proyectos iniciales por la baja friccion. La migracion de JSON a SQL Server es un ejercicio valioso que demuestra que la separacion por capas funciona: el dominio no cambia, solo se agrega una nueva implementacion de `IProductoRepository`. Fuente: "Practical Object-Oriented Design" de Sandi Metz, y discusiones en foros de educacion en .NET sobre eleccion de tecnologia en cursos.
