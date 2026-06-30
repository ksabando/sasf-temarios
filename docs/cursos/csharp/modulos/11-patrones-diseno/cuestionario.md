---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M11 - Patrones de Diseno en C#

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] El patron Singleton es ampliamente criticado por violar el principio de responsabilidad unica y por dificultar el testing. Explica las alternativas al Singleton en .NET moderno (contenedor DI con AddSingleton, patron Ambient Context, servicio estatico con estado mutable) y cuando el Singleton sigue siendo la opcion correcta.

**Respuesta**: Alternativas: (1) `services.AddSingleton<T>()` en DI - la instancia es unica pero el consumidor no sabe que es singleton, facilitando tests con mocks. (2) Ambient Context con `AsyncLocal<T>` para estado por flujo (no global), usado en logging y transacciones. (3) Servicios estaticos con estado mutable (como `MemoryCache`), que son singletons funcionales pero sin la restriccion de `Lazy<T>`. El Singleton clasico sigue siendo correcto para: objetos verdaderamente globales sin dependencias externas (configuracion readonly, loggers de alto rendimiento), y en codigo donde no hay contenedor DI disponible (librerias base).

**Por que**: Mark Seemann argumenta en "Dependency Injection in .NET" que el problema no es la instancia unica sino el acceso global. Un singleton registrado en DI es testeable porque se puede reemplazar la implementacion. El patron clasico con `Instancia` estatica no es testeable porque el codigo cliente depende directamente de la clase concreta. Fuente: "Dependency Injection in .NET" - Mark Seemann, y "Singleton vs DI" - Martin Fowler.

---

### 2. [Investigar] El patron Mediator (como lo implementa MediatR) se ha vuelto extremadamente popular en la comunidad .NET para CQRS y Clean Architecture. Explica que problemas resuelve, como implementa la separacion de comandos y queries (CQRS), y cuales son las criticas principales (over-engineering, indireccion innecesaria).

**Respuesta**: MediatR resuelve: (1) desacoplamiento entre el emisor y el manejador de un request, (2) pipeline de comportamientos (logging, validacion, transaccion) reusable via IPipelineBehavior, (3) CQRS natural donde cada comando/query es un request con su handler. Criticas: (1) indireccion innecesaria para casos simples (un controller que llama a un servicio), (2) aumento de complejidad por archivos multiples (1 tipo + 1 handler por request), (3) la pipeline de behaviors es opaca y dificil de debuggear, (4) `MediatR` puede ocultar dependencias reales.

**Por que**: Jimmy Bogard (creador de MediatR) lo diseno inicialmente para su propio uso en aplicaciones CQRS. La adopcion masiva refleja que los equipos .NET buscaban una forma estandar de implementar CQRS y separacion de concerns. Sin embargo, autores como Steven van Deursen ("Dependency Injection Principles, Practices, Patterns") advierten que MediatR puede convertirse en un "service locator glorificado". La recomendacion: usarlo cuando la pipeline de behaviors aporte valor real; no usarlo para ocultar dependencias. Fuente: "MediatR: Why and How" - Jimmy Bogard, y critica en blogs de la comunidad.

---

### 3. [Investigar] El patron Repository es comun en aplicaciones .NET con Entity Framework, pero hay debate sobre si DbContext ya implementa Unit of Work + Repository. Explica como DbContext implementa ambos patrones, por que crear un Repository adicional puede ser una abstraccion que filtra, y cuando justifica agregar una capa extra sobre EF Core.

**Respuesta**: `DbContext` ya es un Repository (DbSet<T> permite consultar, agregar, eliminar) y un Unit of Work (SaveChangesAsync coordina todas las operaciones en una transaccion). Crear `IRepositorio<T>` adicional es una abstraccion que: (1) puede filtrar metodos de EF Core (Include, ThenInclude, AsNoTracking), (2) oculta la capacidad de IQueryable (composicion en cliente), (3) agrega complejidad sin valor si solo hace delegate a DbContext. Cuando justifica: (a) cuando se necesita cambiar de ORM, (b) cuando se requieren reglas de negocio en cada operacion (auditoria, validacion), (c) para testing con fakes en memoria sin EF Core.

**Por que**: El debate es antiguo en .NET. Microsoft no recomienda una capa de repositorio sobre EF Core en sus guias oficiales (salvo que haya una razon explicita). La comunidad esta dividida: los puristas de DDD defienden el repositorio como concepto de dominio; los pragmaticos senalan que DbSet ya es repositorio. Fuente: "Repository pattern with EF Core" - Microsoft docs, y "Should you use Repository with EF Core?" - Jimmy Bogard.

---

### 4. [Conectar] La clase usa Decorator para cache. Explica como este patron permite el "middleware pipeline" en ASP.NET Core (app.Use), como se implementa con interfaces en vez de herencia, y la relacion con el patron Chain of Responsibility.

**Respuesta**: El middleware pipeline de ASP.NET Core es una cadena de decorators donde cada middleware recibe el siguiente en el constructor y decide si procesa o pasa al siguiente. Es una combinacion de Decorator (agrega comportamiento) y Chain of Responsibility (cada eslabon decide si procesa). La diferencia: Chain of Responsibility tipicamente tiene un handler por tipo de request, mientras que Decorator aplica a todos los requests. El pipeline de behaviors de MediatR (IPipelineBehavior) es una implementacion generica del mismo patron.

**Por que**: Entender que el pipeline de ASP.NET Core es un Decorator permite comprender Middleware personalizados y orden de ejecucion. La implementacion con interfaces (en vez de herencia) es la forma moderna de aplicar Decorator en C#. Fuente: "ASP.NET Core Middleware" - docs.microsoft.com, y "Design Patterns in .NET" de Dmitri Nesteruk.

---

### 5. [Cuestionar] En la era de minimal APIs, source generators y DI nativa, algunos argumentan que los patrones GoF estan quedando obsoletos. Defiende por que siguen siendo relevantes o argumenta por que deberian reemplazarse por enfoques mas modernos.

**Respuesta**: Los patrones GoF (1994) son soluciones a problemas fundamentales que trascienden lenguajes y frameworks. Factory sigue siendo relevante (los source generators crean factories), Strategy esta en LINQ (`IComparer<T>`, `IEqualityComparer<T>`), Observer son los eventos de C#, Decorator es el pipeline de ASP.NET Core. Lo que cambio es la implementacion: antes se escribia mas codigo manual, ahora los frameworks y el lenguaje proporcionan soporte nativo o generan codigo. Los patrones no estan obsoletos: estan incorporados en lenguajes y frameworks modernos. El valor de estudiarlos es reconocerlos cuando aparecen, no implementarlos manualmente.
