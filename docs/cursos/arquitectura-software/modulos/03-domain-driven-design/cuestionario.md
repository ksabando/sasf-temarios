---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

### 2. [Investigar] ¿Qué es el patrón "Domain Event" avanzado con "Event Storming" y cómo Alberto Brandolini cambió la forma de descubrir bounded contexts?

**Por qué**: La clase enseñó DDD desde el modelo de dominio hacia los eventos, pero Brandolini invierte el flujo: empezar por los eventos de dominio porque son lo más tangible ("¿qué pasa en el negocio?") y deducir el modelo desde ahí. Su libro *Introducing EventStorming* (2019) y sus charlas en DDD Europe revolucionaron la práctica de DDD estratégico. Para E-Commerce Platform, un Event Storming revelaría eventos como `ProductoAgregadoAlCarrito`, `PedidoCreado`, `PagoAutorizado` antes de definir las entidades, lo que produce bounded contexts más alineados con el flujo real del negocio.

---

### 3. [Investigar] ¿Qué son las "Specifications" en DDD según Eric Evans y cómo las implementa Vaughn Vernon usando el patrón Specification?

**Respuesta**: El patrón Specification, descrito por Eric Evans en el capítulo 10 de *Domain-Driven Design* (2003) y profundizado por Vaughn Vernon, encapsula una regla de negocio que determina si un objeto satisface ciertos criterios. En lugar de poner lógica condicional en entities o services, se crea un objeto `Specification` con un método `isSatisfiedBy(entity)`. Las specifications son componibles: podés combinarlas con AND, OR, NOT para crear reglas complejas. Vernon distingue tres tipos: Validación (¿el objeto cumple la regla?), Selección (¿qué objetos de una colección cumplen la regla?) y Construcción (crear objetos que cumplan la regla).

**Por qué**: La clase no cubrió Specifications, pero son una herramienta táctica fundamental de DDD. Por ejemplo, `ActiveCustomerSpecification`, `OrderEligibleForDiscountSpecification`, `ProductInStockSpecification`. Martin Fowler y Eric Evans coinciden en que las Specifications evitan el "anemic domain model" donde la lógica de negocio se dispersa en services. Para el E-Commerce: `FreeShippingSpecification` compuesta de `OrderTotalAboveThreshold(50, USD)` AND `ShippingAddressInCountry(CL)`.

---

### 4. [Investigar] ¿Qué es el patrón "Process Manager" (o Saga Manager) en DDD y cómo lo diferencia Vaughn Vernon del patrón Saga del Módulo 10?

**Por qué**: La clase cubrió Saga desde la perspectiva de transacciones distribuidas (Módulo 10), pero no como patrón táctico de DDD. Vernon lo posiciona como un Domain Service especializado que vive en el mismo bounded context que los aggregates que coordina, o en un bounded context separado de "procesos". La implementación típica usa Event Sourcing para persistir el estado del proceso. Para E-Commerce, un `ReturnProcessManager` modelaría el flujo de devolución: esperar recepción en almacén, inspeccionar, autorizar reembolso, liberar inventario.

---

### 5. [Conectar] La clase define Entities, Value Objects y Aggregates como herramientas tácticas. ¿Cómo se complementa esto con las "Domain Primitives" que propone John K. Ousterhout en *A Philosophy of Software Design*?

**Respuesta**: John Ousterhout, en *A Philosophy of Software Design* (2018), propone que el diseño debe minimizar la complejidad usando abstracciones profundas. Aunque no usa el lenguaje de DDD, las "Domain Primitives" son equivalentes a Value Objects bien diseñados: encapsulan validación, formato y comportamiento en un objeto pequeño e inmutable. La intersección es que tanto Evans como Ousterhout argumentan que usar tipos primitivos (`String email`, `int quantity`, `double amount`) es un error de diseño: `Email` debería ser un Value Object que valida el formato en el constructor, `Quantity` debería rechazar valores negativos, `Money` debería encapsular moneda y aritmética.

**Por qué**: Ousterhout provee una justificación desde la psicología cognitiva: los tipos primitivos obligan al desarrollador a mantener la validación en la memoria de trabajo; los Value Objects la encapsulan. Esto conecta directamente con el DDD táctico de la clase, pero agrega una dimensión de carga cognitiva que Evans no discute explícitamente. La regla combinada: si un concepto del dominio tiene reglas de validación, debe ser un Value Object, no un primitivo.

---

### 6. [Conectar] La clase presenta los Repositories como abstracción de persistencia. ¿Cómo se relaciona esto con el patrón "Persistence Ignorance" y qué límites prácticos encuentra incluso en implementaciones DDD puras?

**Respuesta**: "Persistence Ignorance" (PI) es el principio de que el modelo de dominio no debe conocer detalles de persistencia. Los Repositories de la clase son un mecanismo para lograr PI: la interfaz vive en el dominio, la implementación (JPA, MongoDB) en infraestructura. Sin embargo, Vaughn Vernon y Greg Young advierten sobre los límites prácticos: incluso con repositorios, los ORMs como Hibernate imponen restricciones (necesidad de constructor vacío, anotaciones en entidades, lazy loading) que "filtran" la abstracción. La solución de Young es Event Sourcing: no persistir el estado del aggregate, sino los eventos que lo cambiaron, eliminando completamente el ORM. La solución pragmática de Vernon es aceptar cierta fricción con el ORM a cambio de productividad.

**Por qué**: La clase presentó los Repositories como solución limpia, pero en la práctica hay tensión entre pureza y realidad. Ayende Rahien (creador de NHibernate) popularizó el debate con su post "The Stripper Pattern" sobre cómo los ORMs inevitablemente contaminan el dominio. La postura de la comunidad DDD hoy es pragmática: separar el aggregate del entity de JPA con un mapper es más trabajo pero mantiene el dominio puro; usar el aggregate directamente como entity JPA es más simple pero acopla el dominio al ORM.

---

### 7. [Conectar] La clase cubre Ubiquitous Language como lenguaje común. ¿Cómo lo extiende la práctica de "Behaviour-Driven Development" (BDD) con Gherkin y cómo Dan North conecta BDD con DDD?

**Respuesta**: Dan North creó BDD como una evolución de TDD que pone el foco en el comportamiento del negocio, no en tests. El lenguaje Gherkin (`Given-When-Then`) es una implementación concreta del Ubiquitous Language: los escenarios se escriben en el lenguaje del negocio y son ejecutables como tests automatizados. La conexión con DDD es directa: los escenarios BDD documentan el Ubiquitous Language de forma ejecutable, cerrando la brecha entre especificación y verificación. Cucumber y SpecFlow popularizaron esto. Un escenario Gherkin como `Given un carrito con productos por $100 When aplico el cupón "VERANO20" Then el total es $80` es Ubiquitous Language ejecutable.

**Por qué**: La clase presentó Ubiquitous Language como concepto, pero no como herramienta verificable. Dan North y Liz Keogh en múltiples conferencias DDD argumentan que el lenguaje ubicuo no está completo hasta que es ejecutable. Esto eleva la práctica: no basta un glosario compartido, necesitás que el glosario se verifique automáticamente en CI/CD. Gojko Adzic en *Specification by Example* refuerza esta idea con "living documentation."

---

### 8. [Cuestionar] ¿Es el Domain-Driven Design sobrevalorado para sistemas CRUD donde el dominio no es complejo? Compará la opinión de Martin Fowler con la de Eric Evans.

**Respuesta**: Martin Fowler, en su bliki sobre DDD, es notablemente cauteloso: "DDD is an approach that's useful for complex domains... for a simple CRUD application, it's overkill." Eric Evans, en el prefacio de su libro, es más matizado: no todo proyecto necesita DDD, pero si el dominio es el corazón del software, aplicar DDD al core domain y CRUD a los subdominios genéricos es la estrategia correcta. Fowler va más lejos: para la mayoría de aplicaciones empresariales, un enfoque Transaction Script (Martin Fowler, *Patterns of Enterprise Application Architecture*) es más simple y efectivo.

**Por qué**: La controversia es sobre la aplicabilidad universal de DDD. Evans diseñó DDD para dominios complejos con reglas de negocio sofisticadas (banca de inversión, logística, seguros). Aplicar Aggregates, Repositories y Domain Events a un ABM de empleados es sobre-ingeniería. El mismo Evans en DDD Exchange 2010 admitió que "DDD is not for everyone." La clase no profundizó en cuándo **no** usar DDD, que es tan importante como saber cuándo sí.

---

### 9. [Cuestionar] ¿Son los Bounded Contexts una decisión técnica o una decisión organizacional? El debate entre la visión de Eric Evans (técnica) y la de Ruth Malan (organizacional).

**Respuesta**: Eric Evans define bounded context como "un límite explícito donde un modelo de dominio es válido" —una decisión primordialmente de modelo. Ruth Malan y la escuela de arquitectura organizacional argumentan que los bounded contexts son, en la práctica, límites organizacionales: cada bounded context debería ser propiedad de un equipo, y los límites del contexto emergen de la estructura de comunicación (Conway's Law inversa). La postura de Evans es que primero modelás el dominio y luego asignás equipos; la de Malan es que la estructura de equipos determina los límites que podés sostener, independientemente del modelo ideal.

**Por qué**: Este debate tiene consecuencias prácticas enormes. Si seguís a Evans, modelás 8 bounded contexts ideales y luego esperás que la organización se adapte (rara vez ocurre). Si seguís a Malan, aceptás que con 3 equipos solo podés mantener 3 bounded contexts coherentes, y fusionás el resto pragmáticamente. La postura más aceptada hoy (Nick Tune, Mathias Verraes) es que bounded context es una negociación continua entre el modelo ideal y la realidad organizacional.

---

### 10. [Cuestionar] ¿Es realmente necesario separar Domain Services de Application Services? ¿No es una distinción artificial que genera más indirección que valor según la crítica de la "Clean/DDD architecture"?

**Respuesta**: La distinción entre Domain Services (lógica de negocio pura, sin dependencias de infraestructura) y Application Services (orquestación de casos de uso, con dependencias de repositorios y gateways) es defendida por Evans y Vernon como esencial para mantener el dominio puro. Críticos como Jimmy Bogard (creador de MediatR y AutoMapper) argumentan que en aplicaciones empresariales típicas, esta separación crea dos capas de indirección que casi siempre tienen un mapeo 1:1 (un Application Service delega a exactamente un Domain Service), agregando complejidad sin beneficio. Bogard propone un solo "Handler" por caso de uso que contiene lógica de dominio y orquestación.

**Por qué**: Evans defiende la separación por el principio de que el Domain Service puede ser reutilizado por múltiples Application Services y probado sin infraestructura. Pero en la práctica, la mayoría de Domain Services son específicos de un caso de uso. La postura pragmática de Bogard (simplicidad) vs la pureza de Evans es una tensión real en equipos que implementan DDD. La clase no exploró esta controversia de granularidad.

---

