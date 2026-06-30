---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Interactor + Boundary" en comparación con el patrón "Handler" (CQRS/MediatR) y cuándo cada uno es más apropiado según la complejidad del dominio?

**Respuesta**: Clean Architecture propone el trío InputBoundary (interfaz) + Interactor (implementación) + OutputBoundary (interfaz de respuesta). El patrón Handler, popularizado por CQRS y librerías como MediatR (.NET), simplifica esto a un solo handler con un método `handle(command/query)` que recibe el input y retorna directamente el output, sin OutputBoundary separado. El trío de Clean Architecture es superior cuando: (1) el mismo caso de uso debe servir a múltiples formatos de salida (web, CLI, reporte), (2) necesitás componer múltiples outputs (un presenter para vista, otro para audit log). El patrón Handler es superior para APIs REST puras con un solo formato de salida.

**Por qué**: Jimmy Bogard (creador de MediatR) y Steven van Deursen (autor de *Dependency Injection Principles*) han debatido esto extensamente. Bogard argumenta que en aplicaciones web, el OutputBoundary es YAGNI porque siempre retornás JSON. Van Deursen defiende el OutputBoundary como frontera arquitectónica que evita que el Interactor conozca el formato de respuesta. La clase presentó Clean Architecture con ambos, pero no discutió cuándo simplificar a Handler puro.

---

### 3. [Investigar] ¿Cómo se implementa Clean Architecture en frontend (React/Angular) más allá del backend? Analizá el enfoque de "Clean Architecture on Frontend" de Alex Bespoyasov y Dan Abramov.

**Respuesta**: Alex Bespoyasov escribió una serie en dev.to sobre *Clean Architecture on Frontend* (2021), y Dan Abramov ha discutido patrones similares en el blog de React. La adaptación al frontend mapea: **Entities** = lógica de dominio pura (validación de formularios, cálculo de totales sin React), **Use Cases** = hooks o sagas que orquestan el flujo (useCreateOrder, useFetchProducts), **Interface Adapters** = componentes React, Redux/Context (transforman datos del dominio a formato UI), **Frameworks & Drivers** = React DOM, Axios/fetch, localStorage. La regla de dependencia sigue: un Use Case no importa React, una Entity no conoce Redux.

**Por qué**: La clase limitó Clean Architecture al backend, pero Uncle Bob explícitamente dice que aplica a cualquier sistema de software. Bespoyasov demuestra que en frontend, las Entities podrían ser funciones puras (`calculateOrderTotal(items)`) sin dependencias de React. Esto permite que la lógica de presentación sobreviva a cambios de framework (React → Svelte). Para E-Commerce Platform, el componente `ShoppingCart` no debería calcular totales inline: debería delegar a una Entity `shoppingCart` que es testeable con Jest sin montar React.

---

### 4. [Investigar] ¿Qué proponen las "Vertical Slices" de Jimmy Bogard y cómo desafían la organización horizontal de Clean Architecture?

**Respuesta**: Jimmy Bogard propone organizar el código por **caso de uso completo** (vertical slice) en lugar de por capa horizontal (entities, use cases, controllers). En una vertical slice de "CreateOrder", un solo archivo o carpeta contiene: el Request DTO, el Handler, la Entity Order, el Response DTO, el Controller, y las validaciones —todo lo que necesita CreateOrder. La regla de dependencia se mantiene porque el Handler depende de abstracciones para infraestructura, pero la organización del código refleja lo que el sistema **hace** (features), no la estructura técnica. Bogard argumenta que esto es más mantenible porque para modificar "CreateOrder", tocás un solo lugar.

**Por qué**: Esto es una alternativa a la estructura horizontal de Clean Architecture (carpeta entities/, usecases/, controllers/). Uncle Bob defiende Screaming Architecture (que el código grite el dominio), y las vertical slices lo logran de forma más extrema. La tensión: Clean Architecture horizontal facilita reutilizar Entities entre Use Cases; Vertical Slices facilita encontrar y modificar un Use Case completo. La práctica emergente (Nick Tune, Mathias Verraes) es usar vertical slices para la organización de código y mantener las reglas de dependencia de Clean Architecture.

---

### 5. [Conectar] La clase cubre los presenters como transformadores de OutputData. ¿Cómo se relaciona esto con el patrón "ViewModel" de MVVM y qué ventaja arquitectónica tiene sobre simplemente retornar una Entity?

**Respuesta**: El ViewModel de MVVM y el Presenter de Clean Architecture cumplen roles casi idénticos: transforman datos del modelo de dominio a un formato optimizado para la vista. La ventaja arquitectónica sobre retornar una Entity es triple: (1) la Entity encapsula reglas de negocio y no debería exponer getters que la vista pueda usar incorrectamente (ej: `order.getTotal()` podría usarse para lógica de negocio en la vista), (2) el ViewModel puede contener datos derivados específicos de la presentación (fechas formateadas, textos localizados, flags booleanos calculados), y (3) cambios en la UI no fuerzan cambios en las Entities.

**Por qué**: John Gossman (creador de MVVM en Microsoft) y Uncle Bob convergen en que la vista debe recibir exactamente los datos que necesita mostrar, ni más ni menos. Martin Fowler en *Patterns of Enterprise Application Architecture* documenta el "Presentation Model" como equivalente. La clase mencionó Presenters pero no los conectó con el ecosistema más amplio de patrones de presentación maduros.

---

### 6. [Conectar] La clase enfatiza que las Entities no deben importar frameworks. ¿Cómo se relaciona esto con el "Framework Independence" del manifiesto de Clean Architecture y el ejemplo histórico de la "independencia de base de datos" que Uncle Bob cita como advertencia?

**Respuesta**: Uncle Bob cita el cambio de paradigma de bases de datos como advertencia histórica: en los 80s y 90s, muchas aplicaciones se escribieron con lógica de negocio incrustada en stored procedures de Oracle. Cuando Oracle perdió dominancia frente a SQL Server, MySQL y PostgreSQL, migrar implicó reescribir la lógica de negocio. La lección: el framework de hoy es el Oracle de mañana. Spring Boot es dominante hoy, pero en 10 años podría ser reemplazado (como EJB fue reemplazado por Spring). Si tus Entities y Use Cases no dependen de Spring, migrar es cambiar adaptadores. Si tus Entities usan `@Entity` y `@Transactional`, migrar es reescribir el dominio.

**Por qué**: La clase presentó la independencia de frameworks como un principio abstracto, pero Uncle Bob en *Clean Architecture* dedica el capítulo 30 ("The Database is a Detail") a mostrar ejemplos históricos. La decisión práctica: ¿aceptás el acoplamiento a Spring a cambio de productividad hoy? La respuesta de Uncle Bob es no para el núcleo, sí para los adaptadores.

---

### 7. [Conectar] La estructura de paquetes que propone la clase (`domain/`, `application/`, `infrastructure/`) es horizontal. ¿Cómo se relaciona esto con el "Package by Component" de Simon Brown y cuándo conviene cada enfoque?

**Respuesta**: Simon Brown propone "Package by Component" como término medio entre Package by Layer (la clase) y Package by Feature (vertical slices): agrupar todo el código relacionado con un componente de negocio (ej: `orders`) en un solo paquete, con subpaquetes internos para capas si es necesario (`orders/domain`, `orders/web`). La ventaja sobre Package by Layer puro es que al abrir `orders/`, ves todo lo que concierne a pedidos; la desventaja es que es más difícil imponer reglas de dependencia entre componentes (¿puede `orders` depender de `payments`?). La estructura de la clase es Package by Layer y funciona bien para un solo bounded context, pero para E-Commerce Platform con 5+ contextos, Package by Component es más navegable.

**Por qué**: Brown discute esto en *Software Architecture for Developers*. La decisión práctica depende del tamaño: <50 archivos, Package by Layer es suficiente; >200 archivos, Package by Component es necesario. En proyectos grandes, Brown recomienda incluso "Module by Component" con compilación separada y tests de dependencia automatizados.

---

### 8. [Cuestionar] ¿La Clean Architecture agrega complejidad innecesaria en proyectos medianos donde la tecnología (DB, framework) difícilmente cambiará? Contrastá la opinión de Robert C. Martin con la de los críticos pragmáticos.

**Respuesta**: Robert C. Martin insiste que la independencia de frameworks no es sobre cambiar de framework, es sobre **testabilidad, mantenibilidad y aplazamiento de decisiones**. Los críticos pragmáticos (incluyendo a Martin Fowler en algunas discusiones) argumentan que la complejidad de Clean Architecture (3-4 capas, Input/Output Boundaries, Presenters, Gateways) no se justifica en proyectos medianos donde PostgreSQL + Spring Boot es una decisión firme que no cambiará. La contrarrespuesta de Uncle Bob: si PostgreSQL nunca cambia, tenerlo detrás de una interfaz no te hace daño; si sí cambia, te salva. Pero el costo de indirección (más archivos, más código boilerplate) es real y medible en tiempo de desarrollo.

**Por qué**: Esta controversia domina foros de arquitectura. Mark Richards en *Fundamentals of Software Architecture* propone un análisis costo-beneficio: Clean Architecture es una inversión que se amortiza cuando el sistema vive >5 años y tiene >5 desarrolladores. Para proyectos de 1 año con 2 devs, es sobre-ingeniería. La clase presentó Clean Architecture sin discutir cuándo **no** aplicarla completa.

---

### 9. [Cuestionar] ¿Es realmente necesario separar Entities de Use Cases? ¿Acaso no es una distinción arbitraria que complica el modelo de dominio para la mayoría de aplicaciones?

**Respuesta**: Uncle Bob insiste en la separación porque Entities y Use Cases tienen diferentes razones de cambio: las Entities cambian cuando cambia el negocio (nueva política de pricing), los Use Cases cambian cuando cambia la aplicación (nuevo flujo de compra). Sin embargo, críticos como Greg Young (creador de CQRS) y Vaughn Vernon argumentan que en la práctica, esta separación rara vez se materializa: las reglas "empresariales" y las "de aplicación" suelen cambiar juntas. Young propone que alcanza con un modelo de dominio rico (Aggregate + Domain Services), sin la capa de Use Cases separada, especialmente si usás CQRS donde los commands y queries ya definen la intención.

**Por qué**: El debate es real. En DDD puro (Evans/Vernon), un Aggregate contiene reglas de negocio y un Application Service orquesta el flujo, que es funcionalmente equivalente a Entities + Use Cases pero con menos capas. La respuesta de Uncle Bob es que lo que él llama "Entities" es el Domain Model de DDD, y "Use Cases" es Application Services, y que el naming y la separación explícita ayudan a los equipos a no mezclar responsabilidades.

---

### 10. [Cuestionar] ¿El uso de DTOs separados para InputData y OutputData en cada frontera es sobre-ingeniería? ¿Qué piensa Martin Fowler sobre "Data Transfer Objects" y los costos de mapeo?

**Por qué**: La postura pragmática de Fowler es usar DTOs cuando cruzan una frontera de proceso o red; dentro del mismo proceso, podés compartir objetos. Clean Architecture aplica DTOs en cada frontera lógica (no solo de proceso), lo que es más estricto. La decisión es tradeoff entre acoplamiento (sin DTOs, las capas se acoplan) y complejidad (con DTOs, mantenés 5 representaciones sincronizadas). Para E-Commerce Platform, probablemente alcanza con InputData/OutputData sin Request/Response separados, fusionando las capas de Controller y Use Case para reducir mapeo.

---

